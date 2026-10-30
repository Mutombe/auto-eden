/**
 * Post-build link-preview prerenderer for cars.
 *
 * The site is a client-side SPA, so WhatsApp / Facebook / LinkedIn / X crawlers (which don't run
 * JavaScript) only ever see the generic tags in index.html. After `vite build` this script
 * writes a copy of index.html for every live car, at dist/vehicles/<id>/index.html and
 * dist/vehicles/<id>.html, with that car's title, description, Open Graph image and Car
 * structured data baked into the <head>. The static host serves those files directly, so a
 * pasted autoeden.co.zw/vehicles/<id> link previews with the car's photo; people still get the
 * full app, which boots from the same HTML.
 *
 * Preview images: those crawlers don't render WebP/AVIF, so anything that isn't JPEG/PNG goes
 * through the weserv image proxy, which serves a 1200x630 JPEG.
 *
 * It never fails the build: if the API is unreachable, cars are skipped. New cars get a preview
 * on the next deploy.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const SITE = (process.env.SITE_URL || "https://autoeden.co.zw").replace(/\/$/, "");
const API = (process.env.VITE_API_URL || "https://auto-eden-backend.onrender.com").replace(/\/$/, "");
const FALLBACK_IMAGE = `${SITE}/autoeden-buy-car-sell-car-zimbabwe.png`;

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Listing data is often ALL CAPS ("NISSAN X-TRAIL"); keep short acronyms (BMW, GTI) as they are.
const titleCase = (s = "") => {
  const out = String(s ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w === w.toUpperCase() ? w.toLowerCase().replace(/(^|-)([a-z])/g, (_, p, c) => p + c.toUpperCase()) : w))
    .join(" ");
  return out.charAt(0).toUpperCase() + out.slice(1);
};

const km = (m) => {
  const n = Number(String(m ?? "").replace(/[^\d.]/g, ""));
  return n ? `${n.toLocaleString("en-US")} km` : "";
};

const money = (v) => {
  const amount = Number(v.listing_type === "instant_sale" ? v.proposed_price || v.price : v.price || v.proposed_price);
  return amount ? `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "";
};

function crawlerSafeImage(u) {
  if (!u || !/^https?:\/\//i.test(u)) return FALLBACK_IMAGE;
  const noScheme = u.replace(/^https?:\/\//, "");
  // Always via the proxy: it converts WebP/AVIF to JPEG and gives every car the same
  // 1200x630 frame (whole car visible, white around it).
  return (
    `https://images.weserv.nl/?url=ssl:${encodeURIComponent(noScheme)}` +
    `&w=1200&h=630&fit=contain&cbg=white&output=jpg&q=85`
  );
}

// Replace (or add) one meta tag; removes duplicates so crawlers can't pick a stale one.
function setMeta(html, key, value) {
  const attr = key.startsWith("og:") ? "property" : "name";
  const re = new RegExp(`\\s*<meta\\s+${attr}="${key.replace(/[:.]/g, "\\$&")}"[^>]*>`, "g");
  html = html.replace(re, "");
  return html.replace("</head>", `    <meta ${attr}="${key}" content="${esc(value)}" />\n  </head>`);
}

function buildHtml(template, { title, description, url, image, alt, jsonLd, noscript }) {
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = setMeta(html, "description", description);
  html = setMeta(html, "og:type", "website");
  html = setMeta(html, "og:site_name", "Auto Eden");
  html = setMeta(html, "og:url", url);
  html = setMeta(html, "og:title", title);
  html = setMeta(html, "og:description", description);
  html = setMeta(html, "og:image", image);
  html = setMeta(html, "og:image:secure_url", image);
  html = setMeta(html, "og:image:type", "image/jpeg");
  html = setMeta(html, "og:image:width", "1200");
  html = setMeta(html, "og:image:height", "630");
  html = setMeta(html, "og:image:alt", alt);
  html = setMeta(html, "twitter:card", "summary_large_image");
  html = setMeta(html, "twitter:title", title);
  html = setMeta(html, "twitter:description", description);
  html = setMeta(html, "twitter:image", image);
  html = html.replace(/\s*<link rel="canonical"[^>]*>/g, "");
  html = html.replace("</head>", `    <link rel="canonical" href="${esc(url)}" />\n    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>\n  </head>`);
  return html.replace("</body>", `${noscript}\n  </body>`);
}

async function writeRoute(route, html) {
  const flat = join(DIST, `${route}.html`);
  await mkdir(dirname(flat), { recursive: true });
  await writeFile(flat, html, "utf8");
  const dir = join(DIST, route);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html, "utf8");
}

async function fetchJson(url) {
  const ctrl = new AbortController();
  // Free-tier backends can take a while to wake up.
  const timer = setTimeout(() => ctrl.abort(), 90000);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function allCars() {
  const cars = [];
  let url = `${API}/core/marketplace/?page_size=100&page=1`;
  for (let guard = 0; url && guard < 50; guard++) {
    const data = await fetchJson(url);
    cars.push(...(data.results || []));
    url = data.next || null;
  }
  return cars;
}

async function main() {
  let template;
  try {
    template = await readFile(join(DIST, "index.html"), "utf8");
  } catch {
    console.warn("[prerender-og] dist/index.html not found, skipping.");
    return;
  }

  let cars;
  try {
    cars = await allCars();
  } catch (err) {
    console.warn(`[prerender-og] couldn't load cars from ${API} (${err.message}); skipped.`);
    return;
  }

  let count = 0;
  for (const v of cars) {
    if (!v.id) continue;
    const name = `${v.year} ${titleCase(v.make)} ${titleCase(v.model)}`;
    const price = money(v);
    const title = `${name} for sale${price ? ` · ${price}` : ""} | Auto Eden`;
    const facts = [km(v.mileage), titleCase(v.fuel_type), titleCase(v.transmission), titleCase(v.location)].filter(Boolean);
    let description = facts.join(" · ") || "Verified car on Auto Eden, Zimbabwe's free car marketplace.";
    if (v.verification_state === "physical") description += ". Inspected by Auto Eden.";
    // Trailing slash: the static host serves dist/vehicles/<id>/index.html for that form only.
    const url = `${SITE}/vehicles/${v.id}/`;
    const image = crawlerSafeImage(v.main_image);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Car",
      name,
      url,
      image,
      description,
      brand: { "@type": "Brand", name: titleCase(v.make) },
      model: titleCase(v.model),
      vehicleModelDate: String(v.year || ""),
      ...(km(v.mileage) ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: Number(String(v.mileage).replace(/[^\d.]/g, "")), unitCode: "KMT" } } : {}),
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "USD",
        ...(price ? { price: price.replace(/[$,]/g, "") } : {}),
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "Auto Eden" },
      },
    };
    const noscript =
      `<noscript><article><h1>${esc(name)}</h1>` +
      `<img src="${esc(image)}" alt="${esc(name)} for sale in Zimbabwe" width="320" />` +
      `<p>${esc(description)}</p>${price ? `<p>Price: ${esc(price)}</p>` : ""}` +
      `<p><a href="${esc(url)}">${esc(name)} on Auto Eden</a></p></article></noscript>`;

    await writeRoute(`vehicles/${v.id}`, buildHtml(template, { title, description, url, image, alt: name, jsonLd, noscript }));
    count++;
  }
  console.log(`[prerender-og] wrote link previews for ${count} cars.`);
}

main().catch((err) => {
  console.warn("[prerender-og] non-fatal error:", err.message);
});
