// Cookie / storage consent. Essential storage (sign-in, security, this choice) is always on;
// analytics (visit and vehicle-view counting) runs only after the visitor opts in.
// Bump CONSENT_VERSION when the cookie policy changes materially so everyone is asked again.
const KEY = "ae_cookie_consent";
export const CONSENT_VERSION = 1;
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // ask again after 12 months
const OPEN_EVENT = "ae:open-cookie-settings";
const CHANGE_EVENT = "ae:consent-changed";

export function getConsent() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!c || c.version !== CONSENT_VERSION) return null;
    if (Date.now() - new Date(c.decidedAt).getTime() > MAX_AGE_MS) return null;
    return c;
  } catch {
    return null;
  }
}

export function saveConsent({ analytics }) {
  const c = { version: CONSENT_VERSION, essential: true, analytics: !!analytics, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: c }));
  return c;
}

export const hasAnalyticsConsent = () => !!getConsent()?.analytics;

// "Cookie settings" links anywhere on the site reopen the banner's preferences panel.
export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_EVENT));
export const onOpenCookieSettings = (fn) => {
  window.addEventListener(OPEN_EVENT, fn);
  return () => window.removeEventListener(OPEN_EVENT, fn);
};
