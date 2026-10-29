# core/share_views.py
"""
Link previews for shared cars.

The site is a client-rendered SPA, so WhatsApp/Facebook/LinkedIn/X crawlers (which don't run
JavaScript) see no per-car title or photo. Share buttons therefore link to
/share/vehicles/<id>/ here, which returns a tiny HTML page with the car's Open Graph tags and
sends people on to the real page at FRONTEND_URL/vehicles/<id>.

The preview image is served from /share/vehicles/<id>/image.jpg: the car's first photo
re-encoded as a 1200x630 JPEG over a blurred copy of itself. Those platforms don't reliably render WebP/AVIF
previews, and many listing photos are WebP, so we always hand them a JPEG.
"""
import io
import logging
from html import escape

from django.conf import settings
from django.core.cache import cache
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET
from PIL import Image, ImageFilter, ImageOps

from .models import Vehicle

logger = logging.getLogger(__name__)

FRONTEND_URL = getattr(settings, "FRONTEND_URL", "https://autoeden.co.zw").rstrip("/")
OG_SIZE = (1200, 630)
FALLBACK_IMAGE = f"{FRONTEND_URL}/Auto-eden-favicon.png"


def _public_vehicle(vehicle_id):
    # Only cars the public can see: never preview hidden or rejected listings.
    return get_object_or_404(
        Vehicle.objects.prefetch_related("images").exclude(verification_state="rejected"),
        pk=vehicle_id,
        is_visible=True,
    )


def _title_case(s):
    # Listing data is often ALL CAPS ("NISSAN X-TRAIL").
    words = " ".join(w.title() if len(w) > 3 and w.isupper() else w for w in str(s or "").split())
    return words[:1].upper() + words[1:]


def _price(v):
    amount = v.proposed_price if v.listing_type == "instant_sale" else v.price
    amount = amount or v.price or v.proposed_price
    return f"${amount:,.0f}" if amount else None


def _mileage(v):
    digits = "".join(c for c in str(v.mileage or "") if c.isdigit())
    return f"{int(digits):,} km" if digits else None


@require_GET
def vehicle_share_page(request, vehicle_id):
    v = _public_vehicle(vehicle_id)
    name = f"{v.year} {_title_case(v.make)} {_title_case(v.model)}"
    price = _price(v)
    title = f"{name} for sale{f' · {price}' if price else ''} | Auto Eden"
    facts = [p for p in (_mileage(v), _title_case(v.fuel_type), _title_case(v.transmission), _title_case(v.location)) if p]
    description = " · ".join(facts) or "Verified car on Auto Eden, Zimbabwe's free car marketplace."
    if v.verification_state == "physical":
        description += ". Inspected by Auto Eden."

    page_url = f"{FRONTEND_URL}/vehicles/{v.id}"
    share_url = request.build_absolute_uri()
    has_photo = v.images.exists()
    image = request.build_absolute_uri(f"image.jpg?v={_image_version(v)}") if has_photo else FALLBACK_IMAGE

    t, d, img = escape(title), escape(description), escape(image)
    html = f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<title>{t}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{escape(page_url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Auto Eden">
<meta property="og:url" content="{escape(share_url)}">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:image" content="{img}">
<meta property="og:image:secure_url" content="{img}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="{OG_SIZE[0] if has_photo else 512}">
<meta property="og:image:height" content="{OG_SIZE[1] if has_photo else 512}">
<meta property="og:image:alt" content="{escape(name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{img}">
<meta http-equiv="refresh" content="0; url={escape(page_url)}">
<script>location.replace({page_url!r});</script>
</head><body><a href="{escape(page_url)}">View the {escape(name)} on Auto Eden</a></body></html>"""
    response = HttpResponse(html)
    response["Cache-Control"] = "public, max-age=600"
    return response


def _image_version(v):
    # Changes when the first photo changes, so platforms re-fetch a fresh preview.
    first = v.images.order_by("id").first()
    return first.id if first else 0


@require_GET
def vehicle_share_image(request, vehicle_id):
    v = _public_vehicle(vehicle_id)
    first = v.images.order_by("id").first()
    if not first:
        raise Http404("No photo")

    key = f"og-jpeg:{v.id}:{first.id}"
    data = cache.get(key)
    if data is None:
        try:
            with first.image.open("rb") as f:
                src = Image.open(f)
                src = ImageOps.exif_transpose(src)
                src.load()
        except Exception:
            logger.exception("Share preview: couldn't read photo %s for vehicle %s", first.id, v.id)
            raise Http404("Photo unavailable")

        # Flatten transparency onto white; the whole car stays in frame (no cropping).
        if src.mode in ("RGBA", "LA", "P"):
            src = src.convert("RGBA")
            flat = Image.new("RGB", src.size, "white")
            flat.paste(src, mask=src.split()[-1])
            src = flat
        else:
            src = src.convert("RGB")
        # Backdrop: the same photo, cover-cropped, blurred and softened, so square or portrait
        # photos don't leave hard white bars beside the car.
        canvas = ImageOps.fit(src, OG_SIZE, Image.LANCZOS).filter(ImageFilter.GaussianBlur(28))
        canvas = Image.blend(canvas, Image.new("RGB", OG_SIZE, "white"), 0.35)
        src.thumbnail(OG_SIZE, Image.LANCZOS)
        canvas.paste(src, ((OG_SIZE[0] - src.width) // 2, (OG_SIZE[1] - src.height) // 2))
        buf = io.BytesIO()
        canvas.save(buf, "JPEG", quality=85, optimize=True, progressive=True)
        data = buf.getvalue()
        cache.set(key, data, 60 * 60 * 24)

    response = HttpResponse(data, content_type="image/jpeg")
    response["Cache-Control"] = "public, max-age=86400"
    return response
