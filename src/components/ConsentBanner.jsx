// src/components/ConsentBanner.jsx
// Opt-in Cookie-Banner (DSG/DSGVO, Consent Mode v2).
// 3 Kategorien: Notwendig (immer an) · Statistik · Marketing.
// Setzt die Consent-Signale und lädt GTM erst nach Entscheidung.
//
// privacyUrl: Link zur Datenschutzerklärung.
//   - Haupt-Site (florian-lingner.ch): Default "/datenschutz"
//   - Test-Subdomain (test.florian-lingner.ch): hat keine eigene Seite →
//     beim Einbinden absolute URL übergeben:
//     <ConsentBanner privacyUrl="https://florian-lingner.ch/datenschutz" />

import { useState, useEffect } from "react";
import { getStoredConsent, saveConsent, applyConsent } from "../lib/consent";
import "./ConsentBanner.css";

export default function ConsentBanner({ privacyUrl = "/datenschutz" }) {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);
  const [statistik, setStatistik] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Beim Start: gespeicherte Wahl anwenden ODER Banner zeigen.
    const stored = getStoredConsent();
    if (stored) {
      applyConsent(stored); // consent update + GTM laden, kein Banner
    } else {
      setVisible(true);
    }

    // Footer-Link "Cookie-Einstellungen" kann den Banner erneut öffnen.
    const reopen = () => {
      const s = getStoredConsent();
      setStatistik(s ? s.statistik : false);
      setMarketing(s ? s.marketing : false);
      setDetails(true);
      setVisible(true);
    };
    window.addEventListener("fl:open-consent", reopen);
    return () => window.removeEventListener("fl:open-consent", reopen);
  }, []);

  function decide(stat, mkt) {
    const saved = saveConsent({ statistik: stat, marketing: mkt });
    applyConsent(saved);
    setVisible(false);
    setDetails(false);
  }

  if (!visible) return null;

  return (
    <div className="fl-consent" role="dialog" aria-modal="false" aria-label="Cookie-Einstellungen">
      <div className="fl-consent__box">
        <h2 className="fl-consent__title">Cookies &amp; Datenschutz</h2>
        <p className="fl-consent__text">
          Wir verwenden Cookies und ähnliche Technologien. Notwendige sind für den Betrieb der
          Seite erforderlich. Mit deiner Einwilligung nutzen wir zusätzlich Cookies für Statistik
          (Reichweitenmessung) und Marketing. Deine Wahl ist freiwillig und jederzeit im Footer
          unter „Cookie-Einstellungen“ widerrufbar. Mehr dazu in der{" "}
          <a className="fl-consent__inline-link" href={privacyUrl}>Datenschutzerklärung</a>.
        </p>

        {details && (
          <div className="fl-consent__details">
            <Row
              title="Notwendig"
              desc="Damit die Seite überhaupt läuft. Lässt sich nicht abschalten."
              checked
              locked
            />
            <Row
              title="Statistik"
              desc="Anonyme Nutzungsstatistik (Google Analytics, Microsoft Clarity). Zeigt uns, was ankommt."
              checked={statistik}
              onChange={() => setStatistik((v) => !v)}
            />
            <Row
              title="Marketing"
              desc="Reichweiten-Messung über Meta. Damit Inhalte die richtigen Leute finden."
              checked={marketing}
              onChange={() => setMarketing((v) => !v)}
            />
          </div>
        )}

        <div className="fl-consent__actions">
          {details ? (
            <div className="fl-consent__btn-row">
              <button
                className="fl-consent__btn fl-consent__btn--secondary"
                onClick={() => decide(statistik, marketing)}
              >
                Auswahl speichern
              </button>
              <button
                className="fl-consent__btn fl-consent__btn--primary"
                onClick={() => decide(true, true)}
              >
                Alle akzeptieren und weiter
              </button>
            </div>
          ) : (
            <>
              <div className="fl-consent__btn-row">
                <button
                  className="fl-consent__btn fl-consent__btn--primary"
                  onClick={() => decide(true, true)}
                >
                  Alle akzeptieren und weiter
                </button>
                <button
                  className="fl-consent__btn fl-consent__btn--secondary"
                  onClick={() => decide(false, false)}
                >
                  Nur notwendige
                </button>
              </div>
              <button className="fl-consent__settings-link" onClick={() => setDetails(true)}>
                Einstellungen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Eine Kategorie-Zeile mit Toggle -----------------------------------------
function Row({ title, desc, checked, onChange, locked }) {
  return (
    <div className="fl-consent__row">
      <div className="fl-consent__row-text">
        <span className="fl-consent__row-title">{title}</span>
        <span className="fl-consent__row-desc">{desc}</span>
      </div>
      <button
        type="button"
        className={"fl-toggle" + (checked ? " is-on" : "") + (locked ? " is-locked" : "")}
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={locked}
        onClick={locked ? undefined : onChange}
      >
        <span className="fl-toggle__knob" />
      </button>
    </div>
  );
}
