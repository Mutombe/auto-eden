# Gunicorn settings for Render. Gunicorn reads this file automatically when started from the
# backend/ folder, so the Render start command only needs:
#   cd backend && gunicorn backend.asgi:application
#
# Sized for a 512 MB instance. Each worker is a full copy of the Django app (~150 MB), so the
# old "-w 4" needed more memory than the instance has and Render kept killing it ("Ran out of
# memory"), which took the whole API down for 30-60 s every few minutes.
import os

worker_class = "uvicorn.workers.UvicornWorker"  # ASGI: HTTP + WebSockets (Channels)
# Two workers fit in 512 MB; set WEB_CONCURRENCY in Render to change it with a bigger instance.
workers = int(os.environ.get("WEB_CONCURRENCY", 2))
# Load the app once in the master, then fork: workers share that memory instead of each
# importing Django and every library separately.
preload_app = True
# Recycle each worker after a few hundred requests so slow memory growth can never build up
# to an out-of-memory kill; the jitter keeps both workers from restarting at once.
max_requests = 400
max_requests_jitter = 80
timeout = 120
graceful_timeout = 30
bind = f"0.0.0.0:{os.environ.get('PORT', '10000')}"
