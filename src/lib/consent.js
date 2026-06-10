// src/lib/consent.js
// Consent-Management + GTM-Loader für florian-lingner.ch
// Best-effort, kein Rechtsrat.
//
// Ablauf:
//   1. index.html setzt Consent-Default ("denied") – statisch, vor allem anderen.
//   2. Hier wird bei Nutzer-Entscheidung das passende Signal auf "granted" gesetzt
//      (consent update) und DANACH der GTM-Container dynamisch geladen.
//   3. Wiederkehrende Besucher: gespeicherte Wahl auslesen → früh anwenden → GTM laden.

export const GTM_ID = 'GTM-5XWN4F7Z';

const STORAGE_KEY = 'fl_consent';
// Bei Änderung der Kategorien hochzählen → Banner erscheint dann automatisch neu.
const CONSENT_VERSION = 1;

// gtag stammt aus dem Default-Block in index.html.
// Fallback definiert, falls aus irgendeinem Grund nicht vorhanden.
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

// --- Gespeicherte Wahl lesen --------------------------------------------------
export function getStoredConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== CONSENT_VERSION) return null; // veraltet → neu fragen
    return data;
  } catch {
    return null; // z.B. localStorage blockiert (Privatmodus) → Banner zeigen
  }
}

// --- Wahl speichern -----------------------------------------------------------
export function saveConsent({ statistik, marketing }) {
  const data = {
    statistik: !!statistik,
    marketing: !!marketing,
    version: CONSENT_VERSION,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignorieren – Consent gilt dann nur für diese Session */
  }
  return data;
}

// --- GTM-Container laden (genau einmal) --------------------------------------
let gtmLoaded = false;
export function loadGTM() {
  if (gtmLoaded || window.__flGtmLoaded) {
    gtmLoaded = true;
    return;
  }
  gtmLoaded = true;
  window.__flGtmLoaded = true;

  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const f = d.getElementsByTagName(s)[0];
    const j = d.createElement(s);
    const dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', GTM_ID);
}

// --- Signale aktualisieren + GTM laden ---------------------------------------
// Nicht akzeptierte Kategorien bleiben/werden auf "denied" gesetzt.
export function applyConsent({ statistik, marketing }) {
  gtag('consent', 'update', {
    analytics_storage: statistik ? 'granted' : 'denied', // Statistik: GA4 + Clarity
    ad_storage: marketing ? 'granted' : 'denied', // Marketing: Meta Pixel
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
  });
  loadGTM();
}

// --- Footer-Link "Cookie-Einstellungen" --------------------------------------
// Öffnet den Banner erneut (egal wo im DOM der Footer hängt).
export function openConsentSettings() {
  window.dispatchEvent(new Event('fl:open-consent'));
}
