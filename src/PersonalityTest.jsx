import { useState, useEffect, useRef, useCallback } from "react";
import { jsPDF } from "jspdf";

// ─── META PIXEL & CONSENT ────────────────────────────────────────────────────

const META_PIXEL_ID = "1338444391376910";

function getConsent() {
  try {
    const c = document.cookie.split("; ").find(r => r.startsWith("fl_consent="));
    if (c) return c.split("=")[1];
  } catch (e) {}
  return null;
}

function setConsent(value) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  document.cookie = `fl_consent=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

function initPixel() {
  if (window.fbq) return;
  (function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s);
  })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function trackEvent(eventName, params = {}) {
  if (getConsent() === "all" && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
}

function CookieConsentBanner({ onConsent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (existing) {
      onConsent(existing);
    } else {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent("all");
    onConsent("all");
    setVisible(false);
  };

  const handleNecessaryOnly = () => {
    setConsent("necessary");
    onConsent("necessary");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="consent-overlay">
      <div className="consent-banner">
        <p className="consent-title">Deine Privatsphäre</p>
        <p className="consent-text">
          Wir nutzen Cookies, um dein Erlebnis zu verbessern und anonymisierte Nutzungsdaten zu erheben.{" "}
          Mehr dazu in unserer{" "}
          <a href="https://florian-lingner.ch/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>.
        </p>
        <div className="consent-buttons">
          <button className="consent-btn-accept" onClick={handleAcceptAll}>Alle akzeptieren</button>
          <button className="consent-btn-necessary" onClick={handleNecessaryOnly}>Nur notwendige</button>
        </div>
      </div>
    </div>
  );
}

// ─── DATA ───────────────────────────────────────────────────────────────────────

const BLOCKS = [
  { id: 1, title: "Reflexion & Selbstwahrnehmung", questions: [1,2,3,4,5,6,7] },
  { id: 2, title: "Ethik, Werte & Weltbild", questions: [8,9,10,11,12,13,14] },
  { id: 3, title: "Handlung, Antrieb & Stillstand", questions: [15,16,17,18,19,20,21] },
  { id: 4, title: "Identität & Tiefenstruktur", questions: [22,23,24,25,26,27,28,29,30] },
];

const QUESTIONS = [
  {
    id: 1,
    title: "💬 DAS FEEDBACK",
    scenario: "Ein guter Freund sagt dir, du hättest dich verändert. Nicht zum Positiven. Wie reagierst du?",
    options: [
      { key: "A", text: "Ich höre zu und denke ernsthaft darüber nach, auch wenn es wehtut.", scoring: { REF: 2, ML: 2 } },
      { key: "B", text: "Ich nehme es zur Kenntnis. Innerlich denke ich: So schlimm wird's nicht sein.", scoring: { SL: 1, EF: 1 } },
      { key: "C", text: "Ich schätze solch ehrliches Feedback. Ich reflektiere es und wenn etwas dran ist, arbeite ich aktiv daran.", scoring: { REF: 2, SL: 2, HA: 1 } },
      { key: "D", text: "Ich sage nichts und lächle. Aber ich denke den ganzen Abend darüber nach.", scoring: { REF: 1, SL: -1, ML: 2, HA: -1 } },
    ],
  },
  {
    id: 2,
    title: "🌙 DIE NACHT",
    scenario: "Es ist spät, du liegst im Bett, aber dein Kopf hört nicht auf zu arbeiten. Was kreist in deinem Kopf?",
    options: [
      { key: "A", text: "Ich analysiere den Tag – was lief gut, was hätte ich besser machen können.", scoring: { REF: 3, ML: 3, HA: -1 } },
      { key: "B", text: "Ich grüble über eine Situation vom Tag, in der ich mit meiner Reaktion unzufrieden war. Dass ich daran nichts mehr ändern kann, hilft mir leider nicht, das Grübeln sein zu lassen.", scoring: { REF: 1, SL: -1, ML: 3, HA: -1 } },
      { key: "C", text: "Ich brauche meistens irgendeinen Input – Podcast, Serie, Social Media – bis ich einschlafe.", scoring: { ML: 1, EF: 1 } },
      { key: "D", text: "Ich liege abends selten rastlos im Bett und schlafe häufig auch ohne irgendeinen Input einfach ein.", scoring: { SL: 2, ML: -1 } },
    ],
  },
  {
    id: 3,
    title: "👁️ DER DURCHBLICK",
    scenario: "In deinem Umfeld läuft etwas schief, aber niemand spricht es an. Was tust du?",
    options: [
      { key: "A", text: "Ich analysiere die Situation, aber spreche es nicht an. Zu viel Konfliktpotenzial.", scoring: { REF: 2, ML: 2, HA: -2 } },
      { key: "B", text: "Ich spreche es an. Einer muss es ja tun. Mir fällt das leichter als den meisten.", scoring: { ETH: 1, HA: 3 } },
      { key: "C", text: "Ich sehe das Problem, aber die Leute müssen selbst drauf kommen. Nicht meine Aufgabe.", scoring: { ETH: 1, WS: 1, EX: 2, HA: -1 } },
      { key: "D", text: "Ich prüfe erst: Ist das wirklich ein Problem oder mein eigenes Thema? Wenn es eins ist und ich verantwortlich bin, spreche ich es an.", scoring: { REF: 2, SL: 1, HA: 2 } },
    ],
  },
  {
    id: 4,
    title: "⚖️ DIE ENTSCHEIDUNG",
    isCore: true,
    scenario: "Du stehst vor einer Entscheidung, die dein Leben verändern könnte – neuer Job, Umzug, Trennung. Wie gehst du damit um?",
    options: [
      { key: "A", text: "Ich recherchiere und analysiere alle Optionen, bis ich mir sicher bin – auch wenn es lange dauert.", scoring: { REF: 2, ML: 3, HA: -2 } },
      { key: "B", text: "Ich folge meinem Bauchgefühl und mache einfach. Langes Nachdenken macht es meistens nur komplizierter.", scoring: { NAT: 1, HA: 2 } },
      { key: "C", text: "Ich höre auf mein Bauchgefühl und gleiche es mit relevanten Fakten ab – und dann entscheide ich, ohne ewig zu zögern.", scoring: { REF: 1, SL: 1, NAT: 1, HA: 2 } },
      { key: "D", text: "Meist spüre ich eigentlich schon länger, was richtig wäre – aber die Umsetzung ist das Problem.", scoring: { REF: 1, ML: 2, HA: -2 } },
    ],
  },
  {
    id: 5,
    title: "🔁 DAS MUSTER",
    scenario: "Ein Kollege kritisiert deine Arbeit vor dem ganzen Team. Was passiert in dir?",
    options: [
      { key: "A", text: "Professionelle Reaktion nach außen, aber innerlich wühlt es mich auf.", scoring: { REF: 1, SL: -1, ML: 1, EF: 1 } },
      { key: "B", text: "Wenn was dran ist, will ich das wissen. Wenn nicht, prallt es ab.", scoring: { REF: 1, SL: 2, HA: 1 } },
      { key: "C", text: "Es trifft mich, und ich brauche eine Weile, bis ich mich davon erhole.", scoring: { SL: -2, ML: 2, HA: -1 } },
      { key: "D", text: "Sofort Druck und Nervosität. Ich versuche mich zu rechtfertigen, auch wenn ich nicht müsste.", scoring: { SL: -2, ML: 1, OL: 2, HA: -1 } },
    ],
  },
  {
    id: 6,
    title: "🗣️ DIE INNERE STIMME",
    scenario: "Wenn du an die letzten fünf Jahre zurückdenkst: Was überwiegt?",
    options: [
      { key: "A", text: "Ich habe viel gelernt, aber an der Umsetzung scheitert es aktuell noch.", scoring: { REF: 2, ML: 3, HA: -2 } },
      { key: "B", text: "Overall habe ich das getan, was von mir erwartet wurde – und es lief ganz gut.", scoring: { EF: 2, HA: 1 } },
      { key: "C", text: "Ich habe viel ausprobiert, aber den richtigen Weg noch nicht gefunden.", scoring: { OL: 3, SL: -1 } },
      { key: "D", text: "Bewusste Entscheidungen, dazugelernt, entwickelt. Zufriedener als vorher.", scoring: { REF: 1, SL: 2, HA: 2 } },
    ],
  },
  {
    id: 7,
    title: "❓ DEIN WARUM",
    scenario: "Warum machst du diesen Test?",
    options: [
      { key: "A", text: "Ich hoffe, er zeigt mir, was in meinem Leben fehlt.", scoring: { ML: 1, OL: 2 } },
      { key: "B", text: "Weil Freunde ihn gemacht haben und meinten, ich sollte es auch probieren.", scoring: { EF: 2, HA: -1 } },
      { key: "C", text: "Weil mich ehrliches Feedback über mich interessiert, auch wenn's unbequem wird.", scoring: { REF: 1, SL: 1, HA: 1 } },
      { key: "D", text: "Neugier. Ich analysiere gerne, wie ich ticke. Ob ich was damit mache, ist eine andere Frage.", scoring: { REF: 2, ML: 2, HA: -1 } },
    ],
  },
  // ── BLOCK 2: Ethik, Werte & Weltbild ──
  {
    id: 8,
    title: "🤷 DER WIDERSPRUCH",
    scenario: "Ein Unternehmen, dessen Produkte du liebst, produziert unter fragwürdigen Bedingungen. Was machst du?",
    options: [
      { key: "A", text: "Erst recherchieren, eigenes Urteil bilden. Wenn es stimmt, ziehe ich Konsequenzen.", scoring: { REF: 2, ETH: 2, HA: 2 } },
      { key: "B", text: "Sofort boykottieren. Selbst wenn nur ein bisschen dran ist, kann ich das nicht unterstützen.", scoring: { ETH: 3, WS: 1, EX: 1, HA: 1 } },
      { key: "C", text: "Ich finde es schlimm, aber mein Verhalten als Einzelner wird ja nichts ändern.", scoring: { ML: 2, EX: 1, HA: -1 } },
      { key: "D", text: "Ich find's nicht gut, aber ich kaufe trotzdem. Man kann nicht bei allem das Gewissen einschalten.", scoring: { SL: 1, EF: 1 } },
    ],
  },
  {
    id: 9,
    title: "🔥 DIE DEBATTE",
    isCore: true,
    scenario: "Eine Diskussion über ein kontroverses Thema. Was beschreibt dich am besten?",
    options: [
      { key: "A", text: "Ich habe klare Überzeugungen und vertrete sie auch.", scoring: { ETH: 2, WS: 1, EX: 1, HA: 1 } },
      { key: "B", text: "Ich halte mich meistens raus – Diskussionen ändern selten etwas.", scoring: { ML: 2, HA: -2 } },
      { key: "C", text: "Beide Seiten verstehen, eigene Meinung bilden, dazu stehen.", scoring: { REF: 2, SL: 1, ETH: 1, HA: 1 } },
      { key: "D", text: "Ich passe meine Position manchmal an, je nachdem, mit wem ich rede.", scoring: { SL: -1, EF: 2 } },
    ],
  },
  {
    id: 10,
    title: "🌐 DAS WELTBILD",
    scenario: "Du siehst auf Instagram einen Beitrag über Massentierhaltung, Kinderarbeit oder Umweltzerstörung. Dein Impuls?",
    options: [
      { key: "A", text: "Mich interessiert: Was ist Meinung, was Fakt? Ich will die Wahrheit dahinter.", scoring: { REF: 2 } },
      { key: "B", text: "Es macht mich wütend. Die Welt braucht Menschen, die aufstehen und handeln.", scoring: { ETH: 1, WS: 3, EX: 1 } },
      { key: "C", text: "Ich merke, dass ich abgestumpft bin. Zu viele schlechte Nachrichten.", scoring: { SL: -1, ML: 1, HA: -1 } },
      { key: "D", text: "Ich konsumiere Medien bewusst und dosiert. Informieren ja, runterziehen lassen nein.", scoring: { REF: 1, SL: 1, HA: 1 } },
    ],
  },
  {
    id: 11,
    title: "🪞 DER SPIEGEL",
    scenario: "Deine Meinung unterscheidet sich komplett von der deines Umfelds. Wie gehst du damit um?",
    options: [
      { key: "A", text: "Ehrlicherweise behalte ich sie meist für mich. Große Diskussionen loszutreten lohnt sich fast nie.", scoring: { SL: -1, EF: 2, HA: -1 } },
      { key: "B", text: "Ich vertrete meine Position. Respektvoll, aber klar. Meine Position ist mir wichtiger als Harmonie.", scoring: { REF: 1, SL: 2, ETH: 1, HA: 2 } },
      { key: "C", text: "Ich hinterfrage zuerst meine eigene Position ehrlich, bevor ich entscheide, ob ich sie teile.", scoring: { REF: 3, SL: 1 } },
      { key: "D", text: "Ich ändere meine Meinung oft, weil ich die meines Umfelds zu sehr schätze.", scoring: { EF: 3, ML: 1, HA: -1 } },
    ],
  },
  {
    id: 12,
    title: "🌎 DIE VERANTWORTUNG",
    scenario: "Klima, Ungerechtigkeit, Kriege. Wie stehst du zu den großen Problemen der Welt?",
    options: [
      { key: "A", text: "Es macht mich sauer. Es kann nicht sein, dass alle nur zuschauen.", scoring: { ETH: 2, WS: 3, EX: 2 } },
      { key: "B", text: "Es belastet mich. Ich versuche ein guter Mensch zu sein, aber das Gefühl, dass es nicht reicht, bleibt.", scoring: { ML: 1, ETH: 1, WS: 1, HA: 1 } },
      { key: "C", text: "Ich informiere mich, aber lasse mich emotional nicht reinziehen. Ich helfe, wo es konkret Sinn macht.", scoring: { REF: 1, ETH: 1, HA: 1 } },
      { key: "D", text: "Ich engagiere mich, wo ich kann, ohne Schuldgefühle dafür, dass ich trotzdem mein Leben lebe.", scoring: { REF: 1, SL: 1, ETH: 1, HA: 1 } },
    ],
  },
  {
    id: 13,
    title: "🌿 DIE NATUR",
    scenario: "Du bist allein in der Natur. Kein Handy, keine Ablenkung. Was passiert mit dir?",
    options: [
      { key: "A", text: "Ich komme zur Ruhe. Natur ist für mich einer der wenigen Orte, wo ich wirklich abschalte.", scoring: { SL: 1, NAT: 2, HA: 1 } },
      { key: "B", text: "Es weckt etwas Tieferes in mir – eine Art Verbindung zu etwas Größerem, die im Alltag zu kurz kommt.", scoring: { ETH: 1, WS: 1, NAT: 3 } },
      { key: "C", text: "Ich genieße es kurz, aber nach einer Weile kommen die Gedanken wieder hoch.", scoring: { REF: 1, ML: 2, NAT: 1, HA: -1 } },
      { key: "D", text: "Ehrlich? Ich kann damit nicht so viel anfangen. Natur ist schön, aber ich brauche eher Action.", scoring: { NAT: -2, EF: 1 } },
    ],
  },
  {
    id: 14,
    title: "🏛️ DAS SYSTEM",
    scenario: "Stell dir vor, du könntest ein Gesellschaftssystem komplett neu gestalten. Was ist dir am wichtigsten?",
    options: [
      { key: "A", text: "Gerechtigkeit. Jeder sollte die gleichen Chancen haben – unabhängig von Herkunft.", scoring: { ETH: 2, WS: 2, EX: 1 } },
      { key: "B", text: "Freiheit. Menschen sollten selbst entscheiden dürfen, wie sie leben, ohne bevormundet zu werden.", scoring: { SL: 1, ETH: 1, HA: 1 } },
      { key: "C", text: "Transparenz. Ein System, in dem nichts verschleiert wird – wo jeder sehen kann, wer profitiert und wer nicht.", scoring: { REF: 2, ETH: 1, WS: 2, HA: 1 } },
      { key: "D", text: "Gemeinschaft. Weniger Ego, mehr Miteinander – die Gesellschaft muss zusammenhalten.", scoring: { ETH: 1, WS: 1, NAT: 1 } },
    ],
  },
  // ── BLOCK 3: Handlung, Antrieb & Stillstand ──
  {
    id: 15,
    title: "⚙️ DIE GEWOHNHEIT",
    scenario: "Wie viel von deinem Alltag basiert auf bewussten Entscheidungen, wie viel läuft auf Autopilot?",
    options: [
      { key: "A", text: "Vieles läuft automatisch, aber ich habe das bewusst so eingerichtet.", scoring: { REF: 1, SL: 1, HA: 1 } },
      { key: "B", text: "Ich mache mir darüber ehrlich gesagt wenig Gedanken. Mein Alltag ist halt wie er ist.", scoring: { REF: -1, EF: 2 } },
      { key: "C", text: "Ich hinterfrage regelmäßig, ob mein Alltag noch zu mir passt. Wenn nicht versuche ich, es zu ändern.", scoring: { REF: 2, SL: 1, HA: 2 } },
      { key: "D", text: "Vieles läuft auf Autopilot. Das stört mich, aber ich weiß nicht, wie ich es ändere.", scoring: { REF: 1, ML: 2, OL: 1, HA: -1 } },
    ],
  },
  {
    id: 16,
    title: "🚀 DAS PROJEKT",
    scenario: "Du hast eine Idee, die dich begeistert. Was passiert als Nächstes?",
    options: [
      { key: "A", text: "Lange nachdenken, im Kopf planen, aber meistens starte ich nie wirklich.", scoring: { REF: 2, ML: 4, HA: -3 } },
      { key: "B", text: "Ich springe sofort rein. Energie ist da, der Rest ergibt sich. Oder auch nicht.", scoring: { HA: 2 } },
      { key: "C", text: "Ich ziehe es durch. Ob es das Richtige ist, wird sich zeigen. Aufgeben ist keine Option.", scoring: { EF: 1, HA: 2 } },
      { key: "D", text: "Ich starte, wenn es sich richtig anfühlt, und ziehe es durch. Evtl. mit Pausen, aber ohne Faden zu verlieren.", scoring: { REF: 1, SL: 1, HA: 3 } },
    ],
  },
  {
    id: 17,
    title: "🐴 EIN GUTES PFERD...",
    isCore: true,
    scenario: "Was hält dich am ehesten davon ab, dein Leben zu verändern?",
    options: [
      { key: "A", text: "Die Angst, das Falsche zu tun.", scoring: { SL: -1, ML: 2, HA: -2 } },
      { key: "B", text: "Ich habe mich wohl sehr an meinen Status quo gewöhnt.", scoring: { ML: 1, EF: 2, HA: -1 } },
      { key: "C", text: "Ehrlich? Nicht viel. Wenn etwas nicht stimmt, ändere ich es.", scoring: { SL: 2, HA: 2 } },
      { key: "D", text: "Ich ändere ständig etwas, aber komme trotzdem nicht wirklich voran.", scoring: { OL: 2, HA: 1 } },
    ],
  },
  {
    id: 18,
    title: "⏸️ DER STILLSTAND",
    scenario: "Du trittst auf der Stelle, nichts bewegt sich. Was tust du?",
    options: [
      { key: "A", text: "Ich verstehe meistens, warum das so ist. Aber das ändert nichts.", scoring: { REF: 3, ML: 4, HA: -2 } },
      { key: "B", text: "Härter arbeiten. Mit der richtigen Motivation kommen die Ergebnisse von selbst.", scoring: { EF: 1, HA: 2 } },
      { key: "C", text: "Vielleicht habe ich einfach noch nicht das Richtige gefunden. Ich schaue weiter.", scoring: { OL: 2 } },
      { key: "D", text: "Ehrlich hinschauen, was blockiert, und dort ansetzen. Auch wenn's unbequem ist.", scoring: { REF: 2, SL: 1, HA: 3 } },
    ],
  },
  {
    id: 19,
    title: "📱 DIE ABLENKUNG",
    scenario: "Du fühlst dich leer oder orientierungslos. Wie gehst du damit um?",
    options: [
      { key: "A", text: "Ich analysiere das Gefühl und versuche es zu verstehen. Aber es bleibt.", scoring: { REF: 2, ML: 3, HA: -1 } },
      { key: "B", text: "Ich suche den nächsten Impuls: Buch, Podcast, neue Richtung.", scoring: { OL: 2 } },
      { key: "C", text: "Ich halte es aus und lasse es da sein. Es geht vorbei und zeigt mir meistens etwas.", scoring: { REF: 1, SL: 2, NAT: 1, HA: 1 } },
      { key: "D", text: "Fühle ich selten. Ich bin grundsätzlich zufrieden mit meiner Richtung.", scoring: { SL: 2, HA: 1 } },
    ],
  },
  {
    id: 20,
    title: "🤝 DIE HILFE",
    scenario: "Jemand steckt in einer schwierigen Phase und bittet dich um Rat. Was machst du?",
    options: [
      { key: "A", text: "Ehrliches Feedback, auch wenn es nicht das ist, was die Person hören will.", scoring: { REF: 2, SL: 1, ETH: 1, HA: 1 } },
      { key: "B", text: "Ich bin da, halte mich aber mit Ratschlägen zurück. Nicht übergriffig sein.", scoring: { REF: 1, ML: 1, ETH: 1, HA: -1 } },
      { key: "C", text: "Ich helfe gerne und proaktiv. Manchmal schieße ich dabei evtl. über's Ziel hinaus.", scoring: { ETH: 1, WS: 1, HA: 2 } },
      { key: "D", text: "Ich will helfen, merke aber, dass mir selbst die Stabilität fehlt, andere aufzufangen.", scoring: { SL: -1, ML: 1, HA: -1 } },
    ],
  },
  {
    id: 21,
    title: "💰 DAS GELD",
    scenario: "Du gewinnst unerwartet 100.000 Euro. Dein erster Gedanke?",
    options: [
      { key: "A", text: "Endlich Möglichkeiten! Reisen, Erfahrungen, alles, was ich mir immer gewünscht habe.", scoring: { OL: 1 } },
      { key: "B", text: "Investieren, absichern, klug anlegen. Mit einer einmaligen Chance besonnen umgehen.", scoring: { ML: 1, EF: 1 } },
      { key: "C", text: "Geld ist mir nicht so wichtig. Ein Teil wird definitiv gespendet.", scoring: { ETH: 2, WS: 1, NAT: 1 } },
      { key: "D", text: "Euphorie bremsen und gründlich abwägen, was am sinnvollsten ist.", scoring: { REF: 2, SL: 1, HA: 1 } },
    ],
  },
  // ── BLOCK 4: Identität & Tiefenstruktur ──
  {
    id: 22,
    title: "🎉 DIE PARTY",
    scenario: 'Jemand fragt: „Was machst du so?" (beruflich gemeint). Was fühlst du?',
    options: [
      { key: "A", text: 'Ich antworte routiniert – aber die Antwort fühlt sich nicht wie „ich" an, sondern mehr auswendig gelernt.', scoring: { REF: 1, OL: 1, EF: 1 } },
      { key: "B", text: "Ich erzähle gerne davon – da bin ich in meinem Element.", scoring: { SL: 1, EF: 1 } },
      { key: "C", text: "Ich finde die Frage oberflächlich – als wäre der Job das Einzige, was zählt.", scoring: { REF: 1, ETH: 1, WS: 1, EX: 1 } },
      { key: "D", text: "Ich antworte ehrlich – und wenn mein aktueller Job nicht mein Ding ist, sage ich das auch. Mein Beruf definiert mich nicht.", scoring: { REF: 1, SL: 2, HA: 1 } },
    ],
  },
  {
    id: 23,
    title: "📊 DER VERGLEICH",
    scenario: "Jemand lebt scheinbar genau das Leben, das du dir wünschst.",
    options: [
      { key: "A", text: "Was hat die Person, das ich nicht habe? Und was müsste ich ändern?", scoring: { REF: 1, ML: 1 } },
      { key: "B", text: "Es motiviert mich. Wenn die das kann, kann ich es auch.", scoring: { SL: 1, HA: 1 } },
      { key: "C", text: "Es sticht. Nicht Neid, aber es erinnert mich daran, wo ich nicht bin.", scoring: { SL: -2, ML: 2, OL: 1 } },
      { key: "D", text: "Jetzt wo ich es in Realität sehe, frage ich mich, ob es wirklich so erstrebenswert ist.", scoring: { REF: 3, SL: 1 } },
    ],
  },
  {
    id: 24,
    title: "🎭 DIE MASKE",
    scenario: "Wie oft zeigst du dich so, wie du wirklich bist? Ohne Filter?",
    options: [
      { key: "A", text: "Selten. Die meisten können damit nicht umgehen.", scoring: { REF: 2, SL: -1, ML: 2, HA: -1 } },
      { key: "B", text: "Meistens so, wie ich bin. Verstellen kostet zu viel Energie.", scoring: { SL: 2, HA: 2 } },
      { key: "C", text: "Bei wenigen Menschen, die mein Vertrauen erarbeitet haben.", scoring: { SL: 1, ETH: 1 } },
      { key: "D", text: 'Ich bin mir nicht sicher, was „wirklich ich" überhaupt bedeutet.', scoring: { OL: 1 } },
    ],
  },
  {
    id: 25,
    title: "💡 DER RAT",
    scenario: "Was hättest du deinem jüngeren Ich gerne gesagt?",
    options: [
      { key: "A", text: "Hör auf, es allen recht machen zu wollen.", scoring: { EF: 2 } },
      { key: "B", text: "Du musst nicht alles perfekt durchdacht haben, bevor du loslegst.", scoring: { REF: 2, ML: 2, HA: -1 } },
      { key: "C", text: "Die Welt wird dich enttäuschen. Aber gib nicht auf.", scoring: { ETH: 1, WS: 2, EX: 1 } },
      { key: "D", text: "Such nicht im Außen, was nur im Innen zu finden ist.", scoring: { REF: 1, SL: 2, NAT: 1 } },
    ],
  },
  {
    id: 26,
    title: "🤫 DIE STILLE",
    scenario: "Komplett freier Tag. Keine Verpflichtungen, keine Pläne. Was passiert?",
    options: [
      { key: "A", text: "Ich genieße es und mache worauf ich Lust habe oder auch einfach nichts.", scoring: { SL: 2, NAT: 1 } },
      { key: "B", text: "Ich erledige Liegengebliebenes. Freizeit fühlt sich unproduktiv an.", scoring: { SL: -1, EF: 2, HA: 1 } },
      { key: "C", text: "Zeit in der Natur, meditieren oder etwas, das mich erdet.", scoring: { ETH: 1, NAT: 3 } },
      { key: "D", text: "Schnell fällt mir die Decke auf den Kopf. Ich suche mir was zum Tun oder Gesellschaft.", scoring: { SL: -1, EF: 1 } },
    ],
  },
  {
    id: 27,
    title: "🔄 DER NEUANFANG",
    scenario: "Jemand gibt alles auf: Job, Beziehung, Wohnort. Fängt komplett neu an. Dein erster Gedanke?",
    options: [
      { key: "A", text: "Respekt! Aber ich frage mich, ob ich das jemals könnte.", scoring: { REF: 2, ML: 3, HA: -2 } },
      { key: "B", text: "Mutig, aber riskant. Manches, das man sich aufgebaut hat, gibt man besser nicht auf.", scoring: { ML: 1, EF: 1 } },
      { key: "C", text: "Es inspiriert mich und macht mir meine eigene Situation bewusster.", scoring: { OL: 1 } },
      { key: "D", text: "Stark. Ich gönne es ihr. Und wenn bei mir so ein Schritt ansteht, traue ich mir das auch zu.", scoring: { SL: 2, HA: 1 } },
    ],
  },
  {
    id: 28,
    title: "🔮 DIE ERKENNTNIS",
    isCore: true,
    scenario: "Wie würdest du dein Verhältnis zu dir selbst beschreiben?",
    options: [
      { key: "A", text: "Ich habe mich lange nicht gekannt und bin noch dabei, mich zu entdecken.", scoring: { REF: 1, OL: 1 } },
      { key: "B", text: "Ich kenne mich gut, vielleicht zu gut. Manchmal wünschte ich, ich könnte weniger sehen.", scoring: { REF: 3, ML: 3, WS: 1 } },
      { key: "C", text: "Ich kenne mich gut genug, um gute Entscheidungen für mich zu treffen.", scoring: { REF: 2, SL: 2, HA: 1 } },
      { key: "D", text: "Habe mir bisher wenig Gedanken darüber gemacht. Lief auch so ganz okay.", scoring: { REF: -1, EF: 2 } },
    ],
  },
  {
    id: 29,
    title: "🔁 DAS WIEDERKEHRENDE MUSTER",
    scenario: "Du erkennst ein Muster, das dich immer wieder bremst. Was tust du?",
    options: [
      { key: "A", text: "Ich verstehe das Muster, aber es zu durchbrechen schaffe ich nicht. Wie eine unsichtbare Mauer.", scoring: { REF: 2, ML: 3, HA: -2 } },
      { key: "B", text: "Ich nehme mir vor, es anders zu machen, und ziehe es meistens durch. Nicht perfekt, aber besser.", scoring: { REF: 2, SL: 1, HA: 2 } },
      { key: "C", text: "Ich bin nicht sicher, ob ich solche Muster überhaupt erkenne.", scoring: { OL: 1, HA: -1 } },
      { key: "D", text: "Ich ahne ein Muster, aber weiß nicht, wie ich es greifen oder ändern kann.", scoring: { REF: 1, ML: 1, OL: 1, HA: -1 } },
    ],
  },
  {
    id: 30,
    title: "🎯 DER KERN",
    scenario: "Was hat dich bis zur letzten Frage gebracht?",
    options: [
      { key: "A", text: "Neugier. Ich will verstehen, wie ich ticke.", scoring: { REF: 2 } },
      { key: "B", text: "Die Hoffnung, dass mir das hier etwas zeigt, das ich alleine nicht sehe.", scoring: { ML: 1, OL: 1 } },
      { key: "C", text: "Ich will an mir arbeiten und dachte, vielleicht hilft das hier.", scoring: { HA: 2 } },
      { key: "D", text: "Aus Neugier und Spaß. Ohne große Erwartungen.", scoring: { SL: 1, HA: 1 } },
    ],
  },
];

// ─── FOLLOW-UP QUESTIONS ────────────────────────────────────────────────────

const FOLLOW_UPS = {
  // F1 A → Differenzierung: Echte Reflexion vs. Abwehr
  "1A": {
    question: "Bezüglich deiner Antwort: Wie gehst du danach mit solchem Feedback um?",
    options: [
      { key: "1", text: "Ich nehme mir Zeit, das ehrlich zu reflektieren – und wenn was dran ist, versuche ich aktiv daran zu arbeiten.", scoring: { REF: 2, SL: 1, HA: 1 } },
      { key: "2", text: "Es beschäftigt mich lange, aber am Ende fällt es mir schwer etwas daran zu ändern.", scoring: { REF: 1, ML: 2, HA: -2 } },
    ],
  },
  // F2 C → Differenzierung: Vermeidung vs. bewusstes Ritual
  "2C": {
    question: "Bezüglich deiner Antwort: Warum brauchst du den Input zum Einschlafen?",
    options: [
      { key: "1", text: "Ohne Ablenkung kommen Gedanken hoch, die ich lieber vermeide.", scoring: { ML: 2, SL: -1, HA: -1 } },
      { key: "2", text: "Ich nutze das bewusst zum Runterkommen – es ist mein Ritual, kein Vermeiden.", scoring: { SL: 1 } },
    ],
  },
  // F4 C → Ehrlichkeits-Check: Entscheidungsstärke
  "4C": {
    question: "Du sagst, du entscheidest relativ zügig. Wie sieht das in der Praxis wirklich aus?",
    options: [
      { key: "1", text: "Ja, das beschreibt mich wirklich – ich entscheide zügig und kann gut damit leben, auch wenn es mal nicht perfekt läuft.", scoring: { SL: 2, HA: 2 } },
      { key: "2", text: "Ehrlich gesagt weiß ich, wie ich entscheiden sollte – aber in der Praxis schiebe ich wichtige Entscheidungen doch länger vor mir her als nötig.", scoring: { HA: -3, ML: 3, OL: 1 } },
    ],
  },
  // F8 D → Differenzierung: Gleichgültigkeit vs. pragmatische Akzeptanz
  "8D": {
    question: "Bezüglich deiner Antwort: Wie triffst du diese Entscheidung?",
    options: [
      { key: "1", text: "Ehrlich gesagt denke ich darüber nicht groß nach – ist halt so.", scoring: { REF: -1, EF: 2, HA: -1 } },
      { key: "2", text: "Ich sehe den Widerspruch, aber ich treffe die Entscheidung trotzdem bewusst – perfekt geht halt nicht.", scoring: { REF: 1, HA: 1 } },
    ],
  },
  // F9 C → Ehrlichkeits-Check: Meinungsstärke
  "9C": {
    question: "Du sagst, du bildest dir eine Meinung und stehst dazu. Wie sieht das in Diskussionen konkret aus?",
    options: [
      { key: "1", text: "Ja – ich kann in Diskussionen meine Meinung vertreten, auch wenn die Mehrheit anders denkt.", scoring: { SL: 2, HA: 2 } },
      { key: "2", text: "Wenn ich ehrlich bin: Ich verstehe meistens beide Seiten so gut, dass ich mich am Ende gar nicht festlegen kann – oder will.", scoring: { HA: -3, ML: 3, REF: 1 } },
    ],
  },
  // F19 D → Ehrlichkeits-Check: Selten leer/orientierungslos
  "19D": {
    question: "Warum denkst du, dieses Gefühl selten zu haben?",
    options: [
      { key: "1", text: "Ich habe mich bewusst mit mir auseinandergesetzt und bin an einem guten Punkt.", scoring: { REF: 2, SL: 2, HA: 1 } },
      { key: "2", text: "Ich beschäftige mich ehrlich gesagt nicht so intensiv mit solchen Fragen.", scoring: { REF: -1, EF: 2 } },
    ],
  },
  // F20 A → Ehrlichkeits-Check: Ehrlichkeit gegenüber anderen
  "20A": {
    question: "Du sagst, du gibst ehrliches Feedback. Wie reagieren die Menschen in deinem Umfeld darauf?",
    options: [
      { key: "1", text: "Ja – ich bekomme auch regelmäßig das Feedback, dass meine Ehrlichkeit geschätzt wird, auch wenn sie unbequem ist.", scoring: { SL: 2, HA: 2 } },
      { key: "2", text: "Wenn ich ehrlich bin: Ich weiß zwar, was ich sagen sollte, aber oft sage ich dann doch eher das, was die Person hören will – um niemanden zu verletzen.", scoring: { SL: -2, HA: -3, EF: 2, ML: 2 } },
    ],
  },
  // F28 C → Ehrlichkeits-Check: Selbstkenntnis
  "28C": {
    question: "Du sagst, du kennst dich gut genug für gute Entscheidungen. Wie zeigt sich das in deinem Alltag?",
    options: [
      { key: "1", text: "Ja – und das zeigt sich auch darin, dass ich mit meinen Entscheidungen im Großen und Ganzen zufrieden bin.", scoring: { SL: 2, HA: 2 } },
      { key: "2", text: "Ich glaube mich gut zu kennen, aber es passiert schon öfter, dass mich mein eigenes Verhalten überrascht oder enttäuscht.", scoring: { SL: -3, OL: 2, ML: 3 } },
    ],
  },
};

// ─── MICRO-FEEDBACKS ──────────────────────────────────────────────────────
const MICRO_FEEDBACKS = [
  { afterQ: 3, trigger: (ans) => ans[3]?.primary === "A",
    emoji: "🪞", text: "Du siehst, was andere übersehen – und schluckst es trotzdem runter. Das kostet mehr Energie, als du vielleicht denkst. Studien zeigen: Wer regelmäßig eigene Wahrnehmungen unterdrückt, erhöht messbar das Risiko für chronischen Stress und emotionale Erschöpfung.",
    footnote: "*Gross & Levenson (1997), Journal of Personality and Social Psychology" },
  { afterQ: 3, trigger: (ans) => ans[3]?.primary === "B",
    emoji: "🪞", text: "Du gehst dahin, wo's unbequem wird – das können die wenigsten. Respekt! Aber Mut zur Konfrontation ist nicht dasselbe wie gute Konfrontation. Die Frage ist nicht ob du es ansprichst, sondern warum. Aus echtem Verantwortungsgefühl? Oder weil Schweigen sich für dich noch unangenehmer anfühlt? Lass uns noch mehr deines wahren Charakters freilegen...",
    footnote: null },
  { afterQ: 3, trigger: (ans) => ans[3]?.primary === "C",
    emoji: "🪞", text: "Du ziehst eine klare Grenze zwischen deiner Verantwortung und der anderer. Das kann Weisheit sein – oder eine bequeme Ausrede. Der Unterschied? Ob du dich danach wirklich frei fühlst, oder ob es dich dennoch weiterhin beschäftigt.",
    footnote: null },
  { afterQ: 3, trigger: (ans) => ans[3]?.primary === "D",
    emoji: "🪞", text: "Du prüfst zuerst, ob dein Impuls wirklich der Situation gilt oder dir selbst. Das ist seltener als du denkst! Die meisten Menschen reagieren auf äußere Probleme, ohne zu merken, dass eigentlich ein eigenes inneres Thema getriggert wurde. Dass du diesen Schritt machst, zeigt echte Reflexionstiefe.",
    footnote: null },
  { afterQ: 2, trigger: (ans) => ans[2]?.primary === "A" || ans[2]?.primary === "B",
    emoji: "💭", text: "Du bist nicht allein damit. Rund 88% unserer täglichen Handlungen laufen auf Autopilot* – aber nachts, wenn der Autopilot pausiert, holt uns das Unverarbeitete ein.",
    footnote: "*Rebar et al. (2025), Psychology & Health – University of South Carolina" },
  { afterQ: 5, trigger: (ans) => ans[5]?.primary === "A" || ans[5]?.primary === "C",
    emoji: "🪞", text: "Ehrliche Selbsteinschätzung ist seltener als man denkt. 95% der Menschen halten sich für selbstreflektiert – tatsächlich sind es nur 10–15%.*",
    footnote: "*Dr. Tasha Eurich (2017), Organisationspsychologin – mehrjährige Forschung" },
  { afterQ: 10, trigger: (ans) => ans[10]?.primary === "C",
    emoji: "📵", text: "Du bemerkst deine eigene Abstumpfung – das allein ist schon mehr Bewusstsein als die meisten aufbringen. Weltweit vermeiden mittlerweile 39% der Menschen aktiv die Nachrichten – ein Rekordwert.* Abschalten ist manchmal Selbstschutz.",
    footnote: "*Reuters Institute Digital News Report 2024, Oxford University – 95.000 Befragte, 47 Länder" },
  { afterQ: 10, trigger: (ans) => ans[10]?.primary === "B",
    emoji: "🌍", text: "Dein Gerechtigkeitssinn ist ausgeprägt. Das kann ein Antrieb sein – oder eine Last. 36% der unter 35-Jährigen sagen, Nachrichten drücken ihre Stimmung.* Wer trotzdem hinschaut und etwas empfindet, statt abzuschalten, ist nicht nur in der Minderheit, sondern setzt sich somit auch höherer mentaler Belastung aus.",
    footnote: "*Reuters Institute Digital News Report 2024, Oxford University" },
  { afterQ: 13, trigger: (ans) => ans[13]?.primary === "A" || ans[13]?.primary === "B",
    emoji: "🌿", text: "Dein Verhältnis zur Natur sagt mehr über dich aus, als du vielleicht denkst. Schon 10 Minuten in der Natur reduzieren messbar Stress, Angst und depressive Symptome.*",
    footnote: "*Bettmann et al. (2024), University of Utah – Meta-Analyse, 78 Studien, ~5.000 Teilnehmer" },
  { afterQ: 17, trigger: (ans) => ans[17]?.primary === "A" || ans[17]?.primary === "B",
    emoji: "🧠", text: "Viele Menschen spüren genau das. Psychologen nennen es \u201EStatus-quo-Bias\u201C: Die Tendenz, am Vertrauten festzuhalten \u2013 selbst wenn wir wissen, dass Veränderung besser wäre. Klingt erst mal wie Selbstbetrug \u2013 doch am Ende ist es ein tief eingebranntes neurologisches Muster.*",
    footnote: "*Samuelson & Zeckhauser (1988), Journal of Risk and Uncertainty" },
  { afterQ: 21, trigger: (ans) => ans[21]?.primary === "B",
    emoji: "💼", text: "Spannend: Dein erster Impuls geht Richtung Sicherheit. Weltweit sind nur 21% aller Arbeitnehmer wirklich engagiert bei dem was sie tun. 62% funktionieren. Vielleicht weil die meisten irgendwann angefangen haben, Sicherheit über Erfüllung zu stellen.*",
    footnote: "*Gallup State of the Global Workplace 2025 – 160+ Länder, Daten aus 2024" },
  { afterQ: 21, trigger: (ans) => ans[21]?.primary === "A",
    emoji: "✈️", text: "Du bevorzugst Freiheit und Erfahrungen über Absicherung – ein gutes Zeichen? Weltweit sind nur 21% der Arbeitnehmer tatsächlich engagiert in ihrem Job. 62% funktionieren nur.* Vielleicht, weil zu viele die Sicherheit über die persönliche Erfüllung gestellt haben.",
    footnote: "*Gallup State of the Global Workplace 2025 – 160+ Länder, Daten aus 2024" },
  { afterQ: 24, trigger: (ans) => ans[24]?.primary === "A",
    emoji: "🎭", text: "Sich nicht zu zeigen ist oft kein Zeichen von Schwäche \u2013 sondern ein gelernter Schutzmechanismus. Forschung zeigt: Selbstbewusste Menschen mit hoher interner Selbstwahrnehmung sind kreativer, treffen bessere Entscheidungen und sind nachweislich zufriedener.* Der erste Schritt zu einem \u201Eechteren\u201C Leben? Ehrlich hinschauen \u2013 und genau das tust du gerade.",
    footnote: "*Eurich (2017) / Korn Ferry International" },
  { afterQ: 24, trigger: (ans) => ans[24]?.primary === "D",
    emoji: "🔍", text: "Diese Unsicherheit ist ehrlicher als jede schnelle Antwort. Die meisten Menschen haben nie gelernt, sich diese Frage überhaupt zu stellen. Dass du es tust, zeigt mehr Bewusstsein, als du dir vielleicht zugestehst.",
    footnote: null },
];

function getMicroFeedback(questionId, answers) {
  const matching = MICRO_FEEDBACKS.filter(mf => mf.afterQ === questionId && mf.trigger(answers));
  return matching.length > 0 ? matching[0] : null;
}

// ─── NARRATIVE BLOCK-TRANSITIONS ─────────────────────────────────────────
const BLOCK_NARRATIVES = {
  1: { headline: "Wie gut kennst du dich wirklich?", sub: "Die nächsten Fragen zeigen, wie du denkst, fühlst und mit dir umgehst – wenn niemand zuschaut." },
  2: { headline: "Was glaubst du wirklich?", sub: "Jetzt wird's unbequemer. Die nächsten Fragen zeigen, woran du festhältst – und ob deine Werte mehr sind als schöne Worte." },
  3: { headline: "Tust du, was du weißt?", sub: "Erkenntnis ohne Handlung ist Unterhaltung. Hier zeigt sich, ob du ins Machen kommst – oder ob etwas dich bremst." },
  4: { headline: "Wer bist du, wenn alles wegfällt?", sub: "Die letzten Fragen gehen tiefer. Hier geht's nicht mehr um Verhalten – sondern um das, was darunter liegt." },
};

// ─── PROGRESS MILESTONES ────────────────────────────────────────────────
const MILESTONES = {
  25: "Viertel geschafft. Bleib ehrlich – es lohnt sich.",
  50: "Halbzeit. Wenn du bis hier ehrlich warst, wird das Ergebnis unbequem gut.",
  75: "Fast da. Die letzten Fragen gehen tiefer – genau da wird's spannend.",
};

// ─── SCORING ENGINE ─────────────────────────────────────────────────────────

const CORE_SCALES = ["REF", "SL", "ML", "OL", "ETH", "WS", "NAT", "EX", "EF", "HA"];

const SCALE_LABELS = {
  REF: "Reflexion", SL: "Selbstliebe", ML: "Mentale Last", OL: "Orient.losigk.",
  ETH: "Eig. Werte", WS: "Weltschmerz", NAT: "Naturverb.",
  EX: "Externalis.", EF: "Fremdbest.", HA: "Handlungskraft",
};

const TYPE_PROFILES = {
  zuschauer:     { REF: 90, SL: 25, ML: 90, OL: 15, ETH: 45, WS: 25, NAT: 15, EX: 10, EF: 15, HA: 10 },
  getriebener:   { REF: 15, SL: 40, ML: 25, OL: 10, ETH: 15, WS: 10, NAT: 10, EX: 10, EF: 80, HA: 75 },
  idealist:      { REF: 45, SL: 30, ML: 50, OL: 15, ETH: 90, WS: 85, NAT: 75, EX: 80, EF: 10, HA: 40 },
  suchender:     { REF: 30, SL: 20, ML: 35, OL: 85, ETH: 25, WS: 15, NAT: 20, EX: 15, EF: 25, HA: 35 },
  klarsichtiger: { REF: 80, SL: 85, ML: 10, OL: 5,  ETH: 65, WS: 20, NAT: 50, EX: 5,  EF: 5,  HA: 85 },
};

const KIT_API_KEY = "ce3iKRTfk0Bz5mfbC5yCrg";
const KIT_FORM_IDS = {
  zuschauer: 9189289,
  getriebener: 9190135,
  idealist: 9190147,
  suchender: 9190156,
  klarsichtiger: 9190163,
};

const TYPE_META = {
  zuschauer: {
    label: "Zuschauer",
    labelFuer: "Zuschauer",
    avatar: "/Archetypen-Zuschauer.png",
    tagline: "Du siehst mehr als die meisten – doch merkt man das an deinem Verhalten nur selten.",
    ctaText: "Du verstehst längst, was sich ändern müsste – jetzt ist der Moment, es auch zu tun. In dieser Masterclass zeige ich dir, wie du vom Erkennen ins Handeln kommst.",
    description: "<strong>Du bist weise!</strong> Du verstehst Zusammenhänge, die andere nicht sehen, und analysierst Situationen mit einer Schärfe, die beeindruckend ist. Dein <strong>analytischer Verstand</strong> ist eine echte Gabe, und im richtigen Moment bist du die Person im Raum, die den Durchblick hat.<br/><br/>Doch genau hier liegt auch deine Falle: Während andere einfach machen, <strong>denkst du zu viel</strong>. Du weißt, was du ändern müsstest, aber zwischen Erkenntnis und Handlung liegt ein Graben, der jedes Jahr breiter wird. Ohne Umsetzung bleibt Wissen theoretisch und kann keine Effekte in der Realität entfalten. Du beobachtest dein eigenes Leben manchmal mehr, als dass du es aktiv gestaltest.<br/><br/>Die gute Nachricht: Deine Klarheit ist eine <strong>echte Stärke</strong>, die viele sich wünschen. Du musst das Rad nicht neu erfinden. Du musst nur lernen, deine Erkenntnisse als <strong>Startrampe</strong> zu nutzen statt als Aussichtsplattform. Und der erste Schritt ist kleiner, als du denkst.",
    pain: "Du analysierst dich im Kreis. Du weißt, was sich ändern müsste, aber du verwechselst Erkenntnis mit Fortschritt. Und jeder Tag, an dem du nicht handelst, macht den nächsten Schritt schwerer.",
    hebel: "Akzeptiere, dass Erkenntnis ohne Handlung wertlos ist. Du weißt genug. Es fehlt nicht an Wissen, sondern an Mut.",
    schritt: "Tu heute die eine Sache, die du seit Wochen aufschiebst. Nicht perfekt, einfach anfangen.",
  },
  getriebener: {
    label: "Getrieben",
    labelFuer: "Getriebene",
    avatar: "/Archetypen-Getriebener.png",
    tagline: "Du bist ständig in Bewegung – aber wer hat eigentlich das Ziel bestimmt?",
    ctaText: "Du funktionierst – aber für wen eigentlich? In dieser Masterclass zeige ich dir, wie du deine Energie endlich für das einsetzt, was dich wirklich glücklich machen kann.",
    description: "<strong>Du bist ein wahrer Macher!</strong> Dein Antrieb, deine Disziplin und deine Belastbarkeit sind beeindruckend. Du funktionierst, wo andere aufgeben, und du lieferst Ergebnisse, auf die man sich verlassen kann. Das ist eine <strong>seltene Qualität</strong>, und sie hat dich in vielem weitergebracht.<br/><br/>Aber dahinter steckt meist auch eine Vermeidungsstrategie: Solange du funktionierst, musst du nicht hinschauen. Manche Getriebene folgen einem Drehbuch, das andere geschrieben haben, und merken es nicht. In den ruhigen Momenten, wenn die Ablenkung wegfällt, ist da eine <strong>Unruhe</strong>, die du nicht benennen kannst. Und weil das unangenehm ist, greifst du direkt wieder zur Beschäftigung. Mach dir keinen Vorwurf, jeder macht gern das, was er gut kann. Doch würde sich ein Blick in diese dunkle Schublade lohnen, um zu sehen, welche Gedanken hier unterbewusst zurückgehalten werden.<br/><br/>Vielen anderen gegenüber hast du einen immensen Vorteil: Dein Antrieb und deine Disziplin sind <strong>unersetzliche Stärken</strong>. Die meisten Menschen träumen davon, so konsequent umsetzen zu können wie du. Wenn du lernst, diese Kraft für ein Ziel einzusetzen, das wirklich deins ist, wirst du nicht nur funktionieren, sondern <strong>aufblühen</strong>.",
    pain: "Du bist so beschäftigt mit Funktionieren, dass du gar nicht merkst, wie weit du dich von dir selbst entfernt hast. Und die Stimme, die fragt \u201EIst das wirklich alles?\u201C, wird leiser, je mehr du sie übertönst.",
    hebel: "Verstehe, dass Leistung allein nicht zu Glück führt. Dein hohes Pensum ist in Wahrheit deine Vermeidungsstrategie, die wirklich wichtigen Themen nicht anzuschauen.",
    schritt: "Nimm dir diese Woche an einem Abend bewusst nichts vor. Kein Handy, keine Aufgaben. Setz dich auf die Couch oder leg dich in die Wiese und schau in den Himmel. Mache NICHTS. Und halte aus, was dann hochkommt.",
  },
  idealist: {
    label: "Idealist",
    labelFuer: "Idealisten",
    avatar: "/Archetypen-Idealist.png",
    tagline: "Du spürst, was in der Welt schiefläuft – und es frisst dich auf.",
    ctaText: "Dein Feuer für eine bessere Welt ist echt und ehrenwert – doch es birgt die Gefahr, dich innerlich aufzufressen. In dieser Masterclass zeige ich dir, wie du für eine bessere Welt sorgst – zuerst bei dir, um anschließend auch die Kraft zu finden weiterzumachen.",
    description: "<strong>Du willst wahrhaftig etwas verändern!</strong> Dein Gerechtigkeitssinn, deine Empathie und dein moralischer Kompass sind echt. In einer Welt, die oft wegschaut, bist du jemand, der <strong>hinschaut und sich betroffen fühlt</strong>. Das ist keine Schwäche, das ist eine seltene und wertvolle Haltung.<br/><br/>Doch genau diese Intensität hat eine Schattenseite: Deine Energie fließt immer wieder in Wut, Frustration und Ohnmacht über Dinge, die du nicht kontrollieren kannst. Dein eigenes Leben und Glück stehen dabei hinten an. Wahrscheinlich hast du nie gelernt, dass bei dir selbst anfangen <strong>kein Verrat an der Welt ist</strong>.<br/><br/>Die Wahrheit ist: <strong>Die Welt braucht Menschen wie dich</strong>. Deine <strong>Leidenschaft und dein Mut</strong>, unbequeme Wahrheiten auszusprechen, sind ein Geschenk. Wenn du lernst, zuerst für dich selbst zu sorgen, wirst du nicht schwächer, sondern <strong>nachhaltig stärker und handlungsfähiger</strong>. Und genau dann kannst du auch wirklich etwas bewegen.",
    pain: "Dein Gerechtigkeitssinn ist echt – aber er frisst dich auf. Du gibst so viel Energie an die Welt, dass für dich selbst nichts übrig bleibt. Und das Paradoxe: Genau dadurch veränderst du weniger, als du könntest.",
    hebel: "Erkenne, erstens, dass Selbstfürsorge kein Egoismus ist, sondern die Voraussetzung, um überhaupt etwas verändern zu können und zweitens, dass der Wunsch nach Perfektion einer positiven Entwicklung im Wege stehen kann.",
    schritt: "Tu heute eine Sache nur für dich. Ohne schlechtes Gewissen. Ohne Rechtfertigung.",
  },
  suchender: {
    label: "Suchend",
    labelFuer: "Suchende",
    avatar: "/Archetypen-Suchende.png",
    tagline: "Du weißt, dass etwas fehlt – du weißt nur noch nicht, was.",
    ctaText: "Du spürst, dass da mehr ist – aber die nächste \u201EMethode nach Guru XY\u201C wird\u2019s auch nicht richten. In dieser Masterclass zeige ich dir, wo du wirklich hinschauen musst.",
    description: "<strong>In dir schlummert ein neugieriger Entdecker!</strong> Dein Wissensdurst, deine Offenheit und dein Gespür für das Echte sind bemerkenswert. Du gibst dich nicht mit der Oberfläche zufrieden und du spürst intuitiv, wenn etwas nicht stimmt. Diese <strong>innere Sensibilität</strong> ist ein echtes Talent.<br/><br/>Doch zufrieden bist du trotzdem nicht. Du hast schon vieles probiert: Bücher, Podcasts, vielleicht Seminare. Manche Dinge haben kurz resoniert, aber <strong>nichts hat wirklich gehalten</strong>. Das liegt nicht daran, dass du sprunghaft bist, sondern daran, dass du die Antwort im Außen suchst, während sie im Innen liegt.<br/><br/>Deine Neugier und dein Anspruch sind <strong>keine Schwäche</strong>. Viele Menschen gehen durchs Leben, ohne jemals die Fragen zu stellen, die du dir stellst. Wenn du lernst, weniger zu suchen und mehr umzusetzen, wirst du feststellen, dass du <strong>die meisten Antworten längst in dir trägst</strong>.",
    pain: "Du springst von Impuls zu Impuls, von Methode zu Methode – und verwechselst Bewegung mit Fortschritt. Die unbequeme Wahrheit: Es liegt nicht an den Methoden. Es liegt daran, dass du nicht tief genug gräbst.",
    hebel: "Verstehe, dass die Antwort nicht im nächsten Buch oder Podcast zu finden ist. Sie liegt in der konsequenten Umsetzung dessen, was du eigentlich schon lange weißt.",
    schritt: "Nimm die eine Erkenntnis, die dich zuletzt wirklich berührt hat, und wende sie diese Woche bewusst in einer Situation deines Lebens an. Nur diese eine.",
  },
  klarsichtiger: {
    label: "Klarsichtig",
    labelFuer: "Klarsichtige",
    avatar: "/Archetypen-Klarsichtiger.png",
    tagline: "Du siehst klarer als die meisten – jetzt geht's darum, danach zu leben.",
    ctaText: "Du bist weiter als die meisten – doch das allein reicht nicht. In dieser Masterclass zeige ich dir, wie du dein Wissen endlich in dein Leben integrierst.",
    description: "<strong>Du bist weiter als die meisten!</strong> Dein Selbstverständnis, deine Reflexionsfähigkeit und dein bewusster Umgang mit dem Leben sind überdurchschnittlich. Man kann mit dir über tiefere Themen sprechen, ohne dass du abblocken musst. Du hinterfragst, reflektierst und lebst <strong>bewusster als die meisten in deinem Umfeld</strong>.<br/><br/>Doch auch du hast blinde Flecken. Vielleicht die Tendenz, dich für weiter zu halten, als du bist? Oder die Schwierigkeit, dein Wissen konsequent in Handlung zu übersetzen? <strong>Klar sehen</strong> und <strong>danach leben</strong>, das sind zwei verschiedene Dinge. Und das eine ist nun mal leichter als das andere.<br/><br/>Das Gute ist: Du bist auf einem Weg, den die meisten noch nicht einmal begonnen haben. Deine Klarheit ist <strong>kein Zufall, sondern das Ergebnis von echtem Hinschauen</strong>. Wenn du lernst, deiner eigenen Erkenntnis noch mehr zu vertrauen und konsequent danach zu handeln, steht dir wenig im Weg. Ja, der Weg hat noch Strecke, aber du gehst ihn bereits, und das verdient Respekt.",
    pain: "Dein Wissen ist echt – aber es kann zur Falle werden. Du hältst dich manchmal für weiter, als du bist. Der Unterschied zwischen Wissen und Weisheit: Du brauchst keine Fakten mehr, um zu spüren, was richtig oder falsch ist. Aber dieses Spüren in echtes Handeln und Vertrauen zu übersetzen – genau daran darfst du noch arbeiten.",
    hebel: "Vielleicht ist es an der Zeit, sich einzugestehen, dass du deine Weisheit und deine Erkenntnisse mit Fortschritt verwechselst. Dein Wissen ist erst etwas wert, wenn du auch wirklich danach lebst.",
    schritt: "Geh heute Abend mal in maximal ehrliche Reflektion und schreibe dir auf, wo du Erkenntnis als Fortschritt verkaufst, obwohl du weißt, dass dir die Umsetzung fehlt.",
  },
};

const PAIN_POINTS = {
  zuschauer: [
    "Ich weiß genau was ich ändern müsste – aber komme einfach nicht ins Handeln.",
    "Ich hab zwar das Gefühl vieles zu verstehen, aber bin dennoch ratlos wie ich mein Leben verbessern kann.",
    "Es fällt mir schwer mich ehrlich mit meinen inneren eigenen Themen auseinanderzusetzen.",
  ],
  getriebener: [
    "Ich funktioniere nur noch – und es fühlt sich sinnlos / leer an.",
    "Ich weiß nicht mehr, ob meine Ziele wirklich richtig für mich sind.",
    "Ich kann gefühlt nie abschalten, selbst wenn ich gern würde – das laugt mich aus.",
  ],
  idealist: [
    "Ich verspüre einen starken Weltschmerz und diese unterschwellige Frustration frisst mich langsam auf.",
    "Ich hab das Gefühl, dass meine Werte und mein Alltag nicht zusammenpassen.",
    "Ich fühle mich ohnmächtig und machtlos gegenüber all dem, was falsch läuft.",
  ],
  suchender: [
    "Ich springe von Ding zu Ding und finde nicht, wo ich hingehöre oder hin will.",
    "Ich bin vielfältig interessiert, doch irgendwie fehlt mir eine klare Richtung im Leben.",
    "Ich habe das Gefühl, nicht das Leben zu leben, dass tatsächlich zu mir passen würde – weiß aber auch nicht, wie ich das ändern könnte.",
  ],
  klarsichtiger: [
    "Ich spüre, dass da noch etwas Tieferes wartet – aber ich komme alleine nicht ran.",
    "Es fühlt sich an, als würde ich vieles verstehen, aber ich kann nicht konsequent danach handeln.",
    "Mein Wissen und Erlerntes führte bisher nicht zu echtem Frieden – das frustriert mich.",
  ],
};

// ─── MISCHTYP COMBO TEXTS (Margin < 20) ──────────────────────────────────
const COMBO_TEXTS = {
  "zuschauer+getriebener": "Wahrscheinlich ist dein Kalender genauso voll wie dein Kopf. Du bist fast st\u00e4ndig in Bewegung und kommst selten zur Ruhe. Dein analytischer Zuschauer-Anteil erkennt bereits vieles, doch du bist \u201Ezu besch\u00e4ftigt\u201C, um auch wirklich aktiv in der Praxis Vorteile aus deinen theoretischen Erkenntnissen zu ziehen und mit ihnen zu arbeiten.",
  "zuschauer+idealist": "Du gr\u00fcbelst wahrscheinlich nicht nur \u00fcber dich selbst, sondern auch \u00fcber Dinge, die du nicht kontrollieren kannst. Die Welt, die Ungerechtigkeit, das gro\u00dfe Ganze. Das eine f\u00fcttert das andere. Und beides zusammen erzeugt eine Art Weltschmerz. Eine Art L\u00e4hmung. Und diese macht es dir schwerer, \u00fcberhaupt bei dir selbst anzufangen.",
  "zuschauer+suchender": "Statt ins Handeln zu kommen, suchst du vermutlich eher weiter: das n\u00e4chste Buch, den n\u00e4chsten Podcast, die n\u00e4chste Erkenntnis. Du hoffst, dass irgendwann der entscheidende Impuls kommt. Aber vielleicht ist mehr Wissen gar nicht die L\u00f6sung, sondern der Moment, in dem du mit dem anf\u00e4ngst, was du schon wei\u00dft.",
  "zuschauer+klarsichtiger": "Du bist wahrscheinlich n\u00e4her dran, als du denkst. Dein Verst\u00e4ndnis f\u00fcr dich selbst ist weiter als bei den meisten. Aber vielleicht kennst du das: Zwischen \u201EIch k\u00f6nnte\u201C und \u201EIch tue es\u201C liegt bei dir noch eine L\u00fccke, die du lieber nicht zu genau anschaust.",
  "getriebener+zuschauer": "Vielleicht kennst du das: In ruhigen Momenten taucht ein subtiles Gef\u00fchl auf, dass hinter deinem hohen Pensum etwas wartet, dem du dich nicht so gerne stellst. Und statt hinzuschauen, drehst du die Geschwindigkeit meist dann doch wieder hoch. Dein analytischer Verstand erkennt das vermutlich sogar. Aber das Erkennen allein \u00e4ndert noch nichts.",
  "getriebener+idealist": "Du gibst wahrscheinlich viel Energie f\u00fcr andere und f\u00fcr eine \u201Egute Sache\u201C, w\u00e4hrend deine eigenen Bed\u00fcrfnisse oft hinten anstehen. Vielleicht tust du sie sogar als egoistisch ab. Du funktionierst und k\u00e4mpfst gleichzeitig und wunderst dich manchmal, warum du dich trotzdem noch nicht angekommen oder erf\u00fcllt f\u00fchlst.",
  "getriebener+suchender": "Du gibst Vollgas und bist irgendwie auch stolz drauf. Doch dann kommen, nicht st\u00e4ndig, doch immer wieder, Zweifel ob du eigentlich in die richtige Richtung rennst. Mal funktionierst du wie eine Maschine, dann fragst du dich pl\u00f6tzlich: \u201EWof\u00fcr eigentlich?\u201C Aber bevor du wirklich auf die Suche nach der Antwort gehst, st\u00fcrzt du dich schon in den n\u00e4chsten Sprint.",
  "getriebener+klarsichtiger": "Entweder du bist bereits voll im Selbstoptimierungswahn, denn du siehst deine Potenziale und Schw\u00e4chen genau so klar wie die anderer, oder du nutzt dieses Wissen durch Selbstreflektion manchmal, um dein Funktionieren zu rechtfertigen. \u201EIch wei\u00df ja, warum ich so bin.\u201C Und dann machst du so weiter. Nicht blind f\u00fcr deine Muster, aber ziemlich gut darin, sie zu rationalisieren und dir selbst vorzumachen, weshalb die wirklich unangenehme Ver\u00e4nderung gerade nicht n\u00f6tig ist.",
  "idealist+zuschauer": "Vielleicht merkst du, dass sich dein Weltschmerz manchmal mit Selbstanalyse vermischt. Du w\u00fcnschst dir tief in deinem Inneren eine utopische Optimall\u00f6sung f\u00fcr die Welt, doch erkennst in deinem Leben, aber auch in deinem Umfeld zu viel, das diesem Wunsch entgegenwirkt. Das f\u00fchrt zu Frustration und L\u00e4hmung. Du verurteilst dich selbst, Teil des Problems zu sein, doch es f\u00fchlt sich an, als w\u00e4ren dir die H\u00e4nde gebunden dein Leben entsprechend zu ver\u00e4ndern.",
  "idealist+getriebener": "Dein Idealismus gibt dir vermutlich eine Richtung. Einen moralischen Kompass. Dein Getriebener-Anteil gibt dir zus\u00e4tzlich Antrieb. Das kann produktiv sein. Aber vielleicht verwechselst du manchmal Aktivismus mit echtem Fortschritt und bist so besch\u00e4ftigt, gegen das Falsche zu k\u00e4mpfen, dass f\u00fcr den Aufbau von etwas Eigenem wenig Raum und Energie bleibt. Vielleicht lohnt es sich ja mehr, langfristig zu denken und zu handeln, um am Ende wahre Ver\u00e4nderung zu bewirken. Verbrenne dich nicht selbst im Namen der Sache, die Welt braucht Menschen wie dich.",
  "idealist+suchender": "Du suchst nicht nur nach M\u00f6glichkeiten die Welt besser zu machen, sondern auch nach der richtigen Richtung f\u00fcr dich. Du willst ein guter Mensch sein. Ein hoher Anspruch. Und vielleicht f\u00fchrt genau das dazu, dass nichts wirklich gen\u00fcgt. Jede Methode, jeder Ansatz f\u00e4llt irgendwann durch dein Raster. Vielleicht liegt es nicht am Raster der Welt, sondern daran, dass deins etwas zu eng ist. Zu eng dir auch mal selbst zu verzeihen. Zu eng, auch mal die 80-20-L\u00f6sung als Erfolg zu sehen. Manchmal ist auch kleiner Fortschritt besser als eine theoretische Optimall\u00f6sung, die nie Realit\u00e4t wird.",
  "idealist+klarsichtiger": "Du hast echte Reflexionsf\u00e4higkeit und einen klaren Blick auf vieles. Aber vielleicht ist f\u00fcr deinen Idealisten-Anteil diese Klarheit eher Treibstoff f\u00fcr Frustration statt f\u00fcr Ver\u00e4nderung. Du erkennst ziemlich scharf, was falsch l\u00e4uft, und vergisst dabei manchmal, dass Klarheit ohne Selbstf\u00fcrsorge auf Dauer nicht tr\u00e4gt.",
  "suchender+zuschauer": "Vielleicht kennst du das: Du merkst, dass du springst, und du ahnst sogar warum. Aber dieses Meta-Wissen hilft dir nicht unbedingt, es zu \u00e4ndern. Im Gegenteil: Es gibt dir das Gef\u00fchl von Neugier, Horizont-Erweitern und Fortschritt. Doch in Wahrheit drehst du dich im Kreis, da du nicht wirklich wei\u00dft, wohin es f\u00fcr dich gehen soll.",
  "suchender+getriebener": "W\u00e4hrend andere Suchende eher gr\u00fcbeln, springst du vermutlich immer wieder zum n\u00e4chsten Ding. Neues Projekt, neues Hobby, neuer Ansatz. Von au\u00dfen sieht das nach Energie, Neugier, Entwicklung aus. Doch wenn du mal genau hinschaust, f\u00fchlt es sich vielleicht eher an, als w\u00fcrdest du vor etwas davonlaufen, das dich einholt, sobald du stehen bleibst. Ein Zeichen, weniger im Au\u00dfen nach neuen Wahrheiten zu suchen und stattdessen in dein Inneres zu schauen.",
  "suchender+idealist": "Du willst wahrscheinlich nicht nur dich selbst finden, sondern auch den Sinn im gro\u00dfen Ganzen. Klingt tiefgr\u00fcndig, f\u00fchlt sich aber f\u00fcr viele h\u00e4ufig schnell ersch\u00f6pfend an. Vielleicht liegt es nicht am Raster der Welt, sondern daran, dass der Anspruch, beides gleichzeitig und optimal zu l\u00f6sen, dich eher blockiert als befl\u00fcgelt.",
  "suchender+klarsichtiger": "Vielleicht kennst du den Moment: Du bist einen Schritt weiter, und dann kommt die Frage: \u201EAber was, wenn das noch nicht das Richtige ist?\u201C Gesunde Neugier und Sprunghaftigkeit liegen manchmal nah beieinander. Vielleicht ist es manchmal besser erstmal bei Themen mit denen du in Resonanz gehst oder du profitierst zu bleiben und auf deine Entwicklung zu vertrauen, statt st\u00e4ndig in einer Art Selbstoptimierungswahn von einem zu n\u00e4chsten zu springen.",
  "klarsichtiger+zuschauer": "Vielleicht genie\u00dft du die Erkenntnis manchmal fast zu sehr. Du durchschaust vieles, bei dir und bei anderen. Aber vielleicht nutzt du diese Klarheit gelegentlich als Ausrede zur Bequemlichkeit? Eine Ausrede, um nichts ver\u00e4ndern zu m\u00fcssen, weil \u201EIch hab's ja durchschaut\u201C sich anf\u00fchlt wie Fortschritt, es aber nicht immer ist.",
  "klarsichtiger+getriebener": "Du erkennst vieles und dazu geh\u00f6rt wahrscheinlich auch, wo du langsamer machen solltest. Aber dein innerer Getriebener kann das nicht so gut aushalten. Vielleicht reflektierst du abends, was du tags\u00fcber eigentlich schon wusstest, und am n\u00e4chsten Morgen funktionierst du trotzdem wieder gleich. Die Frage ist weniger, ob du es siehst. Sondern ob du es dir erlaubst, danach zu leben.",
  "klarsichtiger+idealist": "Statt dein Wissen f\u00fcr dein eigenes Leben zu nutzen, flie\u00dft deine Energie vielleicht oft eher in irgendeine Art der Kompensation deines Weltschmerzes. Vielleicht verstehst du nicht nur wie du, sondern auch die Welt tickt. Oder besser ticken sollte. Und diese Diskrepanz zwischen Wunschvorstellung und Realit\u00e4t frustriert dich. Verst\u00e4ndlich. Als Klarsichtiger mit einem gut ausgerichteten Wertekompass bist du schon auf einem guten Weg, doch achte darauf, dich nicht zu sehr von deinem Wunsch nach einer Ideall\u00f6sung ausbremsen zu lassen.",
  "klarsichtiger+suchender": "Vielleicht kennst du die Frage: \u201EWas, wenn das noch nicht alles war?\u201C Das kann gesund sein, solange es nicht zur Dauerschleife wird. Es gibt viele interessante Theorien, h\u00f6renswerte Reden, lesenswerte B\u00fccher. Doch verliere dich nicht in der Vielfalt deiner M\u00f6glichkeiten. Du lebst bereits reflektierter als die meisten, also lass deinen Erkenntnissen Taten folgen. Bringt die eine Richtung nach einem ordentlichen St\u00fcck auf diesem Weg noch keinen Erfolg, kannst du ihn immer noch jederzeit wechseln.",
};


// ─── DIMENSION STRENGTH/POTENTIAL TEXTS ────────────────────────────────
const DIMENSION_TEXTS = {
  REF: {
    name: "Reflexionsfähigkeit",
    positive: true,
    high: "Du hinterfragst dich selbst ehrlicher als die meisten. Wo andere auf Autopilot durchs Leben gehen, nimmst du dir die Zeit, hinzuschauen und zu verstehen.",
    low: "Du handelst oft, ohne vorher innezuhalten. Das gibt dir Tempo, aber es führt auch dazu, dass du Muster wiederholst, die dir nicht guttun. Mehr Reflexion könnte dir helfen, bessere Entscheidungen zu treffen.",
  },
  SL: {
    name: "Selbstführung",
    positive: true,
    high: "Du triffst Entscheidungen aus dir selbst heraus, nicht weil andere es von dir erwarten. Das ist seltener, als du denkst und ein echtes Fundament für ein selbstbestimmtes Leben.",
    low: "Du orientierst dich stark an den Erwartungen anderer oder an dem, was sich bewährt hat. Das gibt Sicherheit, aber es kann dazu führen, dass du ein Leben lebst, das sich nicht wirklich wie deins anfühlt.",
  },
  ETH: {
    name: "Ethische Integrität",
    positive: true,
    high: "Du hast einen klaren inneren Kompass und lebst auch danach. Deine Werte sind keine Theorie, sondern beeinflussen, wie du dich verhältst und Entscheidungen triffst.",
    low: "Du passt dich häufig an, anstatt für das einzustehen, was dir wirklich wichtig ist. Es fehlt nicht an Werten, sondern an der Konsequenz, danach zu handeln, auch wenn es unbequem wird. Ein Leben im Einklang mit seinen innersten Werten fühlt sich fantastisch authentisch an!",
  },
  EF: {
    name: "Ehrlichkeit mit dir selbst",
    positive: true,
    high: "Du machst dir nichts vor. Auch wenn's unangenehm ist, schaust du lieber hin als weg. Diese Fähigkeit zum ehrlichen Umgang und Diskurs mit dir selbst ist die Grundlage für echte Veränderung und eine wahre Superpower.",
    low: "Du neigst dazu, dir Dinge schönzureden oder unangenehme Wahrheiten zu vermeiden. Das schützt kurzfristig, aber langfristig blockiert es dein Wachstum. Egal ob es dir gerade an Kraft oder Mut fehlt, um dir selbst mit dieser reinen Ehrlichkeit zu begegnen, es lohnt sich, daran zu arbeiten, auch wenn es manchmal hart sein wird.",
  },
  HA: {
    name: "Handlungsfähigkeit",
    positive: true,
    high: "Du setzt um, was du dir vornimmst. Nicht nur reden, nicht nur planen, sondern machen. Diese Fähigkeit unterscheidet dich von vielen, die ewig in der Analyse-Phase stecken bleiben.",
    low: "Du verstehst oft, was zu tun wäre, aber die Umsetzung fällt dir häufig schwer. Der Graben zwischen Wissen und Handeln ist deine größte Baustelle. Die Devise lautet: Weniger planen und grübeln, mehr trauen.",
  },
  NAT: {
    name: "Zugang zu Tiefe",
    positive: true,
    high: "Du hast einen natürlichen Zugang zu den tieferen Ebenen des Lebens. Ob durch Natur, Stille oder Reflexion: Du spürst, dass hinter der Oberfläche mehr ist, und du nimmst dir auch den Raum dafür.",
    low: "Du lebst stark an der Oberfläche und kommst selten in Kontakt mit dem, was unter dem Alltag liegt. Das ist nicht schlimm, aber es fehlt dir ein Ventil für die tieferen Fragen, die irgendwann so oder so kommen werden.",
  },
  ML: {
    name: "Mentale Klarheit",
    positive: false,
    high: "Dein Kopf arbeitet oft auf Hochtouren, auch wenn du es dir nicht anmerken lässt. Grübeln, Überdenken, Gedankenkreise. Deine mentale Last ist hoch. Du hast hier definitiv noch Luft nach oben. Und es lebt sich mit weniger Last nicht nur im wahrsten Sinne leichter, sondern du könntest deine mentale Energie auch gezielter einsetzen, statt sie dauernd im Kreis zu verbrennen.",
    low: "Du schaffst es, deinen Kopf ruhig zu halten, wenn es darauf ankommt. Während andere in Gedankenspiralen feststecken, behältst du meist einen klaren Kopf. Das ist eine unterschätzte Stärke, die dir in schwierigen Momenten einen echten Vorteil gibt.",
  },
  OL: {
    name: "Innere Orientierung",
    positive: false,
    high: "Du spürst, dass etwas fehlt, aber es fällt dir schwer zu benennen, was genau. Die Richtung ist unklar und das führt dazu, dass du entweder gar nicht losgehst oder ständig die Spur wechselst.",
    low: "Du weißt dich in dieser komplizierten Welt gut zurechtzufinden. Während andere orientierungslos durchs Leben treiben, hast du eine Richtung und einen inneren Anker. Das geht den wenigsten so und es gibt dir eine Stabilität, die andere bei dir spüren und schätzen.",
  },
  WS: {
    name: "Emotionale Balance",
    positive: false,
    high: "Die Probleme der Welt gehen dir nahe, manchmal zu nahe. Dein Gerechtigkeitssinn ist echt, aber er kann dich auch lähmen. Bedenke: Nur ein handlungsfähiges Du kann auch etwas verändern. Hier liegt Potenzial, deine Energie dorthin zu lenken, wo du wirklich etwas bewegen kannst: bei dir selbst. Der Rest kommt danach.",
    low: "Du lässt dich nicht von den großen Problemen der Welt lähmen. Das bedeutet nicht, dass dir alles egal ist, sondern dass du wahrscheinlich einen gesünderen Umgang damit gefunden hast als viele andere. Du kannst Informationen empfangen, ohne dich davon auffressen zu lassen.",
  },
  EX: {
    name: "Eigenverantwortung",
    positive: false,
    high: "Du neigst dazu, die Ursachen für das, was nicht läuft, eher im Außen zu suchen als bei dir. Das ist menschlich, aber es nimmt dir die Handlungsmacht. Dein Potenzial liegt darin, den Blick öfter nach innen zu richten. Diese Fähigkeit zur Reflektion lässt sich lernen und kann der Turbo für deine Entwicklung sein.",
    low: "Du suchst die Verantwortung zuerst bei dir selbst, bevor du mit dem Finger auf andere zeigst. Das ist eine reife Haltung, die dir ermöglicht, an den Dingen zu arbeiten, die tatsächlich in deiner Kontrolle liegen.",
  },
};

function getStrengthsAndPotentials(normalized) {
  const items = Object.entries(DIMENSION_TEXTS).map(([key, dim]) => {
    const score = normalized[key] || 50;
    const strengthScore = dim.positive ? score : (100 - score);
    const isStrength = strengthScore >= 50;
    const showHighText = dim.positive ? isStrength : !isStrength;
    return {
      key,
      name: dim.name,
      strengthScore,
      rawScore: score,
      text: showHighText ? dim.high : dim.low,
      isStrength,
    };
  });
  items.sort((a, b) => b.strengthScore - a.strengthScore);
  return {
    strengths: items.slice(0, 3),
    potentials: items.slice(-3).reverse(),
  };
}

// ─── SESSION PERSISTENCE ────────────────────────────────────────────────────

const SESSION_KEY_PROGRESS = "unfuck-test-progress";
const SESSION_KEY_RESULT = "unfuck-test-result";

function saveProgress(data) {
  try { sessionStorage.setItem(SESSION_KEY_PROGRESS, JSON.stringify(data)); } catch(e) {}
}

function loadProgress() {
  try {
    const d = sessionStorage.getItem(SESSION_KEY_PROGRESS);
    return d ? JSON.parse(d) : null;
  } catch(e) { return null; }
}

function clearProgress() {
  try { sessionStorage.removeItem(SESSION_KEY_PROGRESS); } catch(e) {}
}

function saveResult(data) {
  try { sessionStorage.setItem(SESSION_KEY_RESULT, JSON.stringify(data)); } catch(e) {}
}

function loadResult() {
  try {
    const d = sessionStorage.getItem(SESSION_KEY_RESULT);
    return d ? JSON.parse(d) : null;
  } catch(e) { return null; }
}

function clearResult() {
  try { sessionStorage.removeItem(SESSION_KEY_RESULT); } catch(e) {}
}

// ─── SCORING COMPUTATION ────────────────────────────────────────────────────

function computeTheoreticalMax() {
  const totals = {};
  CORE_SCALES.forEach(s => { totals[s] = { pos: 0, neg: 0 }; });

  QUESTIONS.forEach(q => {
    const bestPerScale = {};
    const worstPerScale = {};

    q.options.forEach(opt => {
      const fuKey = `${q.id}${opt.key}`;
      const followUp = FOLLOW_UPS[fuKey];

      if (followUp) {
        followUp.options.forEach(fuOpt => {
          Object.entries(fuOpt.scoring).forEach(([k, v]) => {
            if (!CORE_SCALES.includes(k)) return;
            if (v > 0) bestPerScale[k] = Math.max(bestPerScale[k] || 0, v);
            if (v < 0) worstPerScale[k] = Math.min(worstPerScale[k] || 0, v);
          });
        });
      }

      Object.entries(opt.scoring).forEach(([k, v]) => {
        if (!CORE_SCALES.includes(k)) return;
        if (v > 0) bestPerScale[k] = Math.max(bestPerScale[k] || 0, v);
        if (v < 0) worstPerScale[k] = Math.min(worstPerScale[k] || 0, v);
      });
    });
    Object.entries(bestPerScale).forEach(([k, v]) => { totals[k].pos += v; });
    Object.entries(worstPerScale).forEach(([k, v]) => { totals[k].neg += v; });
  });

  return totals;
}

function computeScoring(answers, followUpAnswers = {}) {
  // 1. Raw scores
  const raw = {};
  CORE_SCALES.forEach(s => { raw[s] = 0; });

  QUESTIONS.forEach(q => {
    const ans = answers[q.id];
    if (!ans) return;
    const primaryOpt = q.options.find(o => o.key === ans.primary);
    const secondaryOpt = ans.secondary ? q.options.find(o => o.key === ans.secondary) : null;

    if (primaryOpt) {
      const fuKey = `${q.id}${ans.primary}`;
      const fuAnswer = followUpAnswers[fuKey];
      const followUp = FOLLOW_UPS[fuKey];

      if (followUp && fuAnswer) {
        // Follow-up REPLACES original primary scoring
        const fuOpt = followUp.options.find(o => o.key === fuAnswer);
        if (fuOpt) {
          Object.entries(fuOpt.scoring).forEach(([k, v]) => {
            if (CORE_SCALES.includes(k)) raw[k] += v;
          });
        }
      } else {
        Object.entries(primaryOpt.scoring).forEach(([k, v]) => {
          if (CORE_SCALES.includes(k)) raw[k] += v;
        });
      }
    }
    if (secondaryOpt) {
      Object.entries(secondaryOpt.scoring).forEach(([k, v]) => {
        if (CORE_SCALES.includes(k)) raw[k] += v * 0.4;
      });
    }
  });

  // 2. Normalize to 0–100
  const theorMax = computeTheoreticalMax();
  const normalized = {};
  CORE_SCALES.forEach(s => {
    const range = theorMax[s].pos - theorMax[s].neg;
    if (range === 0) { normalized[s] = 50; return; }
    const shifted = raw[s] - theorMax[s].neg;
    normalized[s] = Math.max(0, Math.min(100, Math.round((shifted / range) * 100)));
  });

  // 3. Distance to each type profile (Euclidean)
  const distances = {};
  Object.entries(TYPE_PROFILES).forEach(([type, profile]) => {
    let sumSq = 0;
    CORE_SCALES.forEach(s => {
      const diff = normalized[s] - profile[s];
      sumSq += diff * diff;
    });
    distances[type] = Math.sqrt(sumSq);
  });

  // 4. Result: lowest distance wins
  const sorted = Object.entries(distances).sort((a, b) => a[1] - b[1]);
  const resultType = sorted[0][0];

  // 5. Margin to second place (for reintyp tag)
  const margin = sorted.length >= 2 ? sorted[1][1] - sorted[0][1] : 0;
  const isReintyp = margin >= 20;

  // 6. Percentages (inverse distance, normalized)
  const maxDist = Math.max(...Object.values(distances));
  const affinities = {};
  Object.entries(distances).forEach(([type, dist]) => {
    affinities[type] = Math.round(Math.max(0, ((maxDist - dist) / maxDist) * 100));
  });

  return { raw, normalized, distances, resultType, affinities, margin, isReintyp };
}

// ─── RADAR CHART (SVG) ──────────────────────────────────────────────────────

function RadarChart({ normalized, resultType }) {
  const cx = 160, cy = 160, r = 120;
  const scales = CORE_SCALES;
  const n = scales.length;

  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const rings = [25, 50, 75, 100];
  const profilePoints = scales.map((s, i) => getPoint(i, normalized[s]));
  const profilePath = profilePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  const typeProfile = TYPE_PROFILES[resultType];
  const typePoints = scales.map((s, i) => getPoint(i, typeProfile[s]));
  const typePath = typePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="-90 -15 460 360" className="radar-svg">
      {rings.map(val => {
        const pts = scales.map((_, i) => getPoint(i, val));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={val} d={d} fill="none" stroke="var(--sand)" strokeWidth="0.8" opacity="0.6" />;
      })}
      {scales.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--sand)" strokeWidth="0.5" opacity="0.4" />;
      })}
      <path d={typePath} fill="none" stroke="var(--warm-gray)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
      <path d={profilePath} fill="rgba(255, 77, 0, 0.1)" stroke="var(--orange)" strokeWidth="2" />
      {profilePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--orange)" />
      ))}
      {scales.map((s, i) => {
        const p = getPoint(i, 128);
        const anchor = p.x < cx - 10 ? "end" : p.x > cx + 10 ? "start" : "middle";
        const dy = p.y < cy - 10 ? -6 : p.y > cy + 10 ? 14 : 4;
        return (
          <text key={s} x={p.x} y={p.y + dy} textAnchor={anchor}
            fontSize="9.5" fontFamily="'Inter Tight', sans-serif" fontWeight="600"
            fill="var(--dark)" opacity="0.7">
            {SCALE_LABELS[s]}
          </text>
        );
      })}
    </svg>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

:root {
  --cream: #F5F0EB;
  --sand: #E8E0D8;
  --warm-gray: #A39B93;
  --orange: #ff4d00;
  --orange-hover: #e64500;
  --orange-glow: rgba(255, 77, 0, 0.08);
  --dark: #1C1C1C;
  --dark-soft: #2a2a2a;
  --text-muted: #6b6560;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body, html, #root {
  width: 100%; height: 100%;
  background: var(--cream);
  color: var(--dark);
  font-family: 'Inter Tight', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.test-app { width: 100%; min-height: 100%; display: flex; flex-direction: column; align-items: center; overflow-x: hidden; }

.intro-screen { width: 100%; min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; padding: 2rem 2rem 0; text-align: center; animation: fadeUp 0.8s ease-out; position: relative; overflow: hidden; }
.intro-content { display: flex; flex-direction: column; align-items: center; flex: 1; justify-content: center; }
.intro-screen h1 { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.5rem, 5vw, 2.5rem); font-weight: 900; line-height: 1.2; color: var(--dark); max-width: 520px; margin-bottom: 1rem; letter-spacing: -0.01em; }
.highlight { color: var(--orange); font-style: italic; font-weight: 900; }
.intro-avatars { margin-bottom: 1rem; }
.intro-avatars-img { width: 100%; max-width: 400px; height: auto; }
.intro-screen .intro-meta { font-size: 0.78rem; color: var(--warm-gray); margin-bottom: 1.5rem; font-weight: 400; letter-spacing: 0.02em; }

.fullscreen-footer { width: 100%; display: flex; justify-content: center; gap: 1.5rem; padding: 1rem 0; margin-top: auto; }
.fullscreen-footer a { font-family: 'Inter Tight', sans-serif; font-size: 0.7rem; color: var(--warm-gray); text-decoration: none; letter-spacing: 0.03em; transition: color 0.2s; }
.fullscreen-footer a:hover { color: var(--dark); }

.btn-primary { background: var(--orange); color: #fff; border: none; padding: 1.15rem 2.8rem; font-family: 'Inter Tight', sans-serif; font-size: 1rem; font-weight: 600; letter-spacing: 0.03em; cursor: pointer; transition: all 0.25s ease; }
.btn-primary:hover { background: var(--orange-hover); transform: translateY(-1px); }

.btn-float { animation: floatBtn 2.5s ease-in-out infinite; }
@keyframes floatBtn { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.btn-float:hover { animation: none; transform: translateY(-2px); }

.progress-container { position: fixed; top: 0; left: 0; width: 100%; z-index: 100; background: var(--cream); }
.progress-bar-track { width: 100%; height: 3px; background: var(--sand); }
.progress-bar-fill { height: 100%; background: var(--orange); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.progress-info { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 1.5rem; font-size: 0.68rem; letter-spacing: 0.06em; color: var(--warm-gray); font-weight: 500; }
.progress-pct { font-variant-numeric: tabular-nums; }

.question-screen { width: 100%; max-width: 680px; margin: 0 auto; padding: 5.5rem 1.5rem 2rem; display: flex; flex-direction: column; }
.question-wrapper { animation: fadeUp 0.45s ease-out; }
.question-title-small { font-family: 'Inter Tight', sans-serif; font-size: 0.78rem; font-weight: 700; color: var(--orange); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.25rem; }
.question-scenario { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.15rem, 3.2vw, 1.35rem); color: var(--dark); line-height: 1.55; margin-bottom: 2.5rem; font-weight: 600; }

.answer-label { font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 0.75rem; font-weight: 500; }
.options-list { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 2rem; }
.option-btn { width: 100%; text-align: left; background: transparent; border: 1.5px solid var(--sand); padding: 1.1rem 1.25rem; font-family: 'Inter Tight', sans-serif; font-size: 0.88rem; line-height: 1.55; color: var(--dark); cursor: pointer; transition: all 0.2s ease; display: flex; align-items: flex-start; gap: 0.75rem; font-weight: 400; }
.option-btn:not(.selected-primary):not(.selected-secondary):hover { border-color: var(--dark); background: rgba(28, 28, 28, 0.02); }
.option-btn.selected-primary { border-color: var(--orange); background: var(--orange-glow); }
.option-btn.selected-secondary { border-color: var(--dark); background: rgba(28, 28, 28, 0.04); }
.option-key { font-weight: 700; font-size: 0.85rem; color: var(--warm-gray); min-width: 1.2rem; flex-shrink: 0; line-height: 1.55; }
.option-btn.selected-primary .option-key { color: var(--orange); }
.option-btn.selected-secondary .option-key { color: var(--dark); }

.secondary-section { animation: fadeUp 0.35s ease-out; margin-bottom: 2rem; }
.secondary-hint { font-size: 0.8rem; color: var(--warm-gray); font-style: italic; margin-bottom: 1rem; line-height: 1.5; }

.followup-section { animation: fadeUp 0.35s ease-out; margin-bottom: 1.5rem; padding: 1rem 1.25rem; border-left: 3px solid var(--orange); background: var(--orange-glow); }
.followup-question { font-size: 0.88rem; font-weight: 600; color: var(--dark); margin-bottom: 0.75rem; line-height: 1.5; }
.followup-options { display: flex; flex-direction: column; gap: 0.5rem; }
.followup-btn { width: 100%; text-align: left; background: transparent; border: 1.5px solid var(--sand); padding: 0.75rem 1rem; font-family: 'Inter Tight', sans-serif; font-size: 0.82rem; line-height: 1.5; color: var(--dark); cursor: pointer; transition: all 0.2s ease; font-weight: 400; }
.followup-btn:hover:not(.followup-selected) { border-color: var(--dark); background: rgba(28, 28, 28, 0.02); }
.followup-selected { border-color: var(--orange); background: var(--orange-glow); font-weight: 500; }

.nav-row { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; padding-bottom: 2rem; }
.btn-back { background: none; border: none; font-family: 'Inter Tight', sans-serif; font-size: 0.92rem; color: var(--warm-gray); cursor: pointer; padding: 0.6rem 0; transition: color 0.2s; font-weight: 500; }
.btn-back:hover { color: var(--dark); }
.btn-next { background: var(--dark); color: var(--cream); border: none; padding: 1rem 2.3rem; font-family: 'Inter Tight', sans-serif; font-size: 0.92rem; font-weight: 600; cursor: pointer; transition: all 0.25s ease; letter-spacing: 0.02em; }
.btn-next:hover { background: var(--dark-soft); transform: translateY(-1px); }
.btn-next:disabled { opacity: 0.3; cursor: default; transform: none; }
.btn-finish { background: var(--orange); color: #fff; }
.btn-finish:hover { background: var(--orange-hover); }

.block-transition { width: 100%; min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; padding: 2rem 2rem 0; text-align: center; animation: fadeUp 0.6s ease-out; position: relative; overflow: hidden; }
.block-transition-content { display: flex; flex-direction: column; align-items: center; flex: 1; justify-content: center; }
.block-transition .block-num { font-family: 'Inter Tight', sans-serif; font-size: 5.5rem; color: var(--sand); margin-bottom: 0.75rem; font-weight: 900; line-height: 1; }
.block-transition h2 { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.3rem, 4vw, 1.8rem); font-weight: 900; color: var(--dark); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
.block-transition .block-count { font-size: 0.78rem; color: var(--warm-gray); letter-spacing: 0.06em; margin-bottom: 2rem; font-weight: 400; }
.block-transition .answer-hint { max-width: 400px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 2.5rem; padding: 1.25rem 1.5rem; border-left: 2px solid var(--orange); text-align: left; }
.block-transition .answer-hint strong { color: var(--dark); font-weight: 700; }

.result-screen { width: 100%; display: flex; flex-direction: column; align-items: center; padding: 3rem 1.5rem 4rem; opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.result-screen.visible { opacity: 1; transform: translateY(0); }
.result-inner { width: 100%; max-width: 620px; display: flex; flex-direction: column; gap: 2rem; }
.result-header { text-align: center; }
.result-eyebrow { font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 0.75rem; font-weight: 500; }
.result-avatar-wrap { display: flex; justify-content: center; margin-bottom: 0.75rem; }
.result-avatar { height: 200px; width: auto; }
.result-type-label { font-family: 'Inter Tight', sans-serif; font-size: clamp(2rem, 6vw, 3.2rem); font-weight: 900; color: var(--dark); letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 0.75rem; }
.result-tagline { font-family: 'Inter Tight', sans-serif; font-size: clamp(0.95rem, 2.5vw, 1.1rem); color: var(--orange); font-style: italic; font-weight: 500; line-height: 1.5; max-width: 500px; margin: 0 auto; }

.potenzial-box { text-align: center; padding: 2rem 1.5rem; border: 2px solid var(--sand); background: rgba(28, 28, 28, 0.02); }
.potenzial-eyebrow { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 0.5rem; font-weight: 500; }
.potenzial-label { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.3rem, 4vw, 1.7rem); font-weight: 900; color: var(--dark); margin-bottom: 0.75rem; }
.potenzial-text { font-size: 0.92rem; line-height: 1.65; color: var(--text-muted); font-style: italic; font-weight: 400; max-width: 480px; margin: 0 auto; }

.radar-container { display: flex; flex-direction: column; align-items: center; }
.radar-svg { width: 100%; max-width: 340px; }
.radar-legend { display: flex; gap: 1.5rem; margin-top: 0.5rem; font-size: 0.72rem; color: var(--text-muted); }
.legend-item { display: flex; align-items: center; gap: 0.35rem; }
.legend-dot { width: 10px; height: 3px; display: inline-block; }
.legend-dot.user { background: var(--orange); }
.legend-dot.type { background: var(--warm-gray); border-top: 1px dashed var(--warm-gray); height: 0; border-width: 1.5px; }

.result-description { font-size: 0.92rem; line-height: 1.7; color: var(--dark); font-weight: 400; }
.result-pain { border-left: 4px solid var(--orange); padding: 2rem; background: var(--orange-glow); }
.pain-label { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.1rem, 3vw, 1.35rem); font-weight: 800; color: var(--orange); margin-bottom: 0.75rem; letter-spacing: -0.01em; line-height: 1.3; }
.result-pain p { font-size: 0.95rem; line-height: 1.7; color: var(--dark); font-weight: 400; }
.result-affinities { display: flex; flex-direction: column; gap: 0.65rem; }
.affinities-label { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--warm-gray); font-weight: 600; margin-bottom: 0.25rem; }
.affinity-row { display: flex; align-items: center; gap: 0.75rem; }
.affinity-name { font-size: 0.8rem; font-weight: 600; color: var(--dark); min-width: 120px; flex-shrink: 0; }
.affinity-bar-track { flex: 1; height: 6px; background: var(--sand); overflow: hidden; }
.affinity-bar-fill { height: 100%; background: var(--orange); transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
.affinity-pct { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); min-width: 32px; text-align: right; font-variant-numeric: tabular-nums; }
.result-hebel { padding: 1.5rem 1.5rem; border-left: 3px solid var(--dark); background: rgba(28, 28, 28, 0.03); }
.result-hebel p { font-size: 0.92rem; line-height: 1.65; color: var(--dark); font-weight: 400; margin: 0 0 1rem 0; }
.result-hebel p:last-child { margin-bottom: 0; }
.hebel-label { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.1rem, 3vw, 1.35rem); font-weight: 800; color: var(--dark); margin-bottom: 0.75rem; letter-spacing: -0.01em; line-height: 1.3; }
.schritt-label { font-family: 'Inter Tight', sans-serif; font-size: 0.85rem; font-weight: 700; color: var(--orange); margin-bottom: 0.3rem; letter-spacing: 0.02em; }

/* ─── SHARE SECTION ─── */
.share-section { text-align: center; padding: 1.5rem 0; }
.share-title { font-family: 'Inter Tight', sans-serif; font-size: 1.05rem; font-weight: 800; color: var(--dark); margin-bottom: 0.25rem; }
.share-sub { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; }
.share-buttons { display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap; }
.share-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.2rem; font-family: 'Inter Tight', sans-serif; font-size: 0.82rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease; text-decoration: none; }
.share-btn:hover { transform: translateY(-1px); }
.share-whatsapp { background: #25D366; color: #fff; }
.share-whatsapp:hover { background: #1da851; }
.share-telegram { background: #0088cc; color: #fff; }
.share-telegram:hover { background: #006da3; }
.share-copy { background: var(--dark); color: var(--cream); }
.share-copy:hover { background: var(--dark-soft); }

.postq-screen { width: 100%; max-width: 620px; min-height: 60vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem 1.5rem; animation: fadeUp 0.5s ease-out; }
.postq-eyebrow { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 1rem; font-weight: 500; }
.postq-title { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.4rem, 4.5vw, 1.9rem); font-weight: 900; color: var(--dark); line-height: 1.2; margin-bottom: 1rem; letter-spacing: -0.01em; }
.postq-subtitle { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 2.5rem; font-weight: 400; }

.recognition-scale { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
.recognition-btn { width: 56px; height: 56px; border: 2px solid var(--sand); background: transparent; font-family: 'Inter Tight', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--dark); cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
.recognition-btn:hover:not(.recognition-selected) { border-color: var(--dark); background: rgba(28, 28, 28, 0.02); }
.recognition-btn.recognition-selected { border-color: var(--orange); background: var(--orange); color: #fff; }
.recognition-labels { display: flex; justify-content: space-between; width: 100%; max-width: 320px; font-size: 0.72rem; color: var(--warm-gray); font-weight: 400; }

.painpoint-options { display: flex; flex-direction: column; gap: 0.7rem; width: 100%; max-width: 540px; }
.painpoint-btn { width: 100%; text-align: left; background: transparent; border: 1.5px solid var(--sand); padding: 1.1rem 1.25rem; font-family: 'Inter Tight', sans-serif; font-size: 0.88rem; line-height: 1.55; color: var(--dark); cursor: pointer; transition: all 0.2s ease; font-weight: 400; }
.painpoint-btn:hover:not(.painpoint-selected) { border-color: var(--dark); background: rgba(28, 28, 28, 0.02); }
.painpoint-btn.painpoint-selected { border-color: var(--orange); background: var(--orange-glow); font-weight: 500; }

.signup-solo { padding: 3rem 1.5rem; }
.signup-solo-header { margin-bottom: 2rem; }
.signup-solo-text { font-size: 0.95rem; line-height: 1.7; color: var(--text-muted); max-width: 480px; margin: 0 auto; font-weight: 400; }
.signup-solo-text strong { color: var(--dark); font-weight: 700; }
.signup-solo .cta-email { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; max-width: 380px; width: 100%; margin: 0 auto; }
.signup-solo .cta-privacy { font-size: 0.72rem; color: var(--warm-gray); margin-top: 0.75rem; font-weight: 400; }

.email-input { width: 100%; padding: 1rem 1.1rem; border: 2px solid var(--sand); background: #fff; font-family: 'Inter Tight', sans-serif; font-size: 0.9rem; color: var(--dark); outline: none; transition: border-color 0.2s; }
.email-input:focus { border-color: var(--orange); }
.email-input::placeholder { color: var(--warm-gray); }
.email-input-error { border-color: #c0392b !important; }
.email-error-msg { font-size: 0.78rem; color: #c0392b; margin-top: -0.25rem; font-weight: 500; }
.btn-cta { width: 100%; text-align: center; padding: 1.2rem 2.5rem; font-size: 1.05rem; font-weight: 700; letter-spacing: 0.02em; }
.btn-loading { opacity: 0.7; cursor: wait !important; }
.loading-dots span { animation: dotPulse 1.2s infinite; font-size: 1.4rem; letter-spacing: 0.15em; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotPulse { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }

.cta-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1rem 0; animation: fadeUp 0.5s ease-out; }
.success-icon { width: 52px; height: 52px; border: 2px solid var(--orange); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
.success-title { font-family: 'Inter Tight', sans-serif; font-size: 1.3rem; font-weight: 800; color: var(--dark); margin-bottom: 0.5rem; }
.success-sub { font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; max-width: 380px; }
.success-sub strong { color: var(--dark); font-weight: 600; }

.pdf-save-section { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.5rem 0; }
.pdf-save-hint { font-size: 0.82rem; color: var(--text-muted); text-align: center; line-height: 1.5; font-style: italic; max-width: 420px; }
.btn-pdf-download { background: var(--dark); color: var(--cream); border: none; padding: 0.85rem 2.2rem; font-family: 'Inter Tight', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.25s ease; letter-spacing: 0.02em; }
.btn-pdf-download:hover { background: var(--dark-soft); transform: translateY(-1px); }
.btn-pdf-download:disabled { opacity: 0.5; cursor: wait; transform: none; }

.recognition-box { width: 100%; border: 2px solid var(--sand); padding: 2rem 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.75rem; }
.recognition-box-title { font-family: 'Inter Tight', sans-serif; font-size: clamp(1rem, 3vw, 1.2rem); font-weight: 700; color: var(--dark); margin-bottom: 0.75rem; line-height: 1.3; }

.debug-toggle { background: none; border: none; font-family: monospace; font-size: 0.72rem; color: var(--warm-gray); cursor: pointer; padding: 0.5rem 0; text-align: left; transition: color 0.2s; }
.debug-toggle:hover { color: var(--dark); }
.score-debug { background: var(--dark); color: var(--cream); padding: 2rem; font-size: 0.72rem; text-align: left; width: 100%; line-height: 1.8; font-family: monospace; overflow-x: auto; }

.session-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(28, 28, 28, 0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeUp 0.3s ease-out; }
.session-popup { background: var(--cream); padding: 2.5rem 2rem; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15); }
.session-popup h3 { font-family: 'Inter Tight', sans-serif; font-size: 1.2rem; font-weight: 800; color: var(--dark); margin-bottom: 0.75rem; }
.session-popup p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem; }
.session-popup-btns { display: flex; gap: 0.75rem; justify-content: center; }
.session-popup-btns button { padding: 0.85rem 1.5rem; font-family: 'Inter Tight', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s ease; }

.consent-overlay { position: fixed; bottom: 0; left: 0; width: 100%; z-index: 9999; display: flex; justify-content: center; padding: 1rem; animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.consent-banner { background: var(--dark); color: var(--cream); padding: 1.5rem 2rem; max-width: 520px; width: 100%; box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15); }
.consent-title { font-family: 'Inter Tight', sans-serif; font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
.consent-text { font-size: 0.78rem; color: var(--warm-gray); line-height: 1.6; margin-bottom: 1.25rem; font-weight: 400; }
.consent-text a { color: var(--orange); text-decoration: underline; text-underline-offset: 2px; }
.consent-text a:hover { color: var(--orange-hover); }
.consent-buttons { display: flex; gap: 0.6rem; }
.consent-btn-accept { flex: 1; background: #22c55e; color: #fff; border: none; padding: 0.8rem 1.5rem; font-family: 'Inter Tight', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
.consent-btn-accept:hover { background: #16a34a; transform: translateY(-1px); }
.consent-btn-necessary { background: transparent; color: var(--warm-gray); border: 1.5px solid rgba(163, 155, 147, 0.3); padding: 0.8rem 1.2rem; font-family: 'Inter Tight', sans-serif; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
.consent-btn-necessary:hover { border-color: var(--warm-gray); color: var(--cream); }

.footer-links { display: flex; justify-content: center; gap: 1.5rem; padding: 1.5rem 0 2rem; width: 100%; }
.footer-links a { font-family: 'Inter Tight', sans-serif; font-size: 0.7rem; color: var(--warm-gray); text-decoration: none; letter-spacing: 0.03em; transition: color 0.2s; }
.footer-links a:hover { color: var(--dark); }

@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

/* ─── NARRATIVE BLOCK-TRANSITION ─── */
.block-narrative-sub { font-size: 0.92rem; color: var(--text-muted); font-style: italic; line-height: 1.6; max-width: 420px; margin-bottom: 1.5rem; font-weight: 400; }

/* ─── HINT BULLETS ─── */
.hint-bullets { display: flex; flex-direction: column; gap: 0.65rem; }
.hint-title { font-weight: 700; color: var(--dark); margin-bottom: 0.25rem; font-size: 0.88rem; }
.hint-item { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.82rem; line-height: 1.55; color: var(--text-muted); }
.hint-item strong { color: var(--dark); font-weight: 700; }
.hint-icon { flex-shrink: 0; font-size: 0.9rem; line-height: 1.55; }

/* ─── MICRO-FEEDBACK ─── */
.micro-feedback { width: 100%; min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem; animation: fadeUp 0.5s ease-out; cursor: pointer; }
.micro-feedback-inner { max-width: 500px; text-align: center; padding: 2.5rem 2rem; border-left: 3px solid var(--orange); background: var(--orange-glow); }
.micro-feedback-emoji { font-size: 2rem; display: block; margin-bottom: 1rem; }
.micro-feedback-text { font-size: 0.95rem; line-height: 1.7; color: var(--dark); font-weight: 400; margin-bottom: 1rem; }
.micro-feedback-footnote { font-size: 0.68rem; color: var(--warm-gray); font-style: italic; line-height: 1.5; }
.micro-feedback-dismiss { background: var(--dark); color: var(--cream); border: none; padding: 0.75rem 2rem; font-family: 'Inter Tight', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; margin-top: 1.25rem; transition: all 0.2s ease; }
.micro-feedback-dismiss:hover { background: var(--dark-soft); }

/* ─── KERNFRAGEN ─── */
.question-screen-core { background: rgba(28, 28, 28, 0.03); }
.core-badge { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; text-align: center; padding: 0.6rem 1rem; margin-bottom: 0.5rem; animation: fadeUp 0.3s ease-out; }
.core-badge-pill { display: inline-block; background: var(--orange); color: #fff; font-size: 0.78rem; font-weight: 700; padding: 0.3rem 0.85rem; letter-spacing: 0.04em; }
.core-badge-sub { font-size: 0.72rem; font-weight: 500; color: var(--text-muted); font-style: italic; }
.question-title-core { font-size: 0.85rem !important; font-weight: 800 !important; }

/* ─── MILESTONES ─── */
.milestone-bar { font-size: 0.75rem; color: var(--orange); font-weight: 600; text-align: center; padding: 0.5rem 1rem; font-style: italic; animation: fadeUp 0.4s ease-out; margin-bottom: 0.25rem; }

/* ─── COUNTDOWN TEASER ─── */
.countdown-teaser { margin-top: 1.5rem; text-align: center; padding: 1.25rem; border: 1.5px dashed var(--sand); animation: fadeUp 0.4s ease-out; }
.countdown-teaser-finetuning { border: 1.5px solid rgba(255, 77, 0, 0.25); background: rgba(255, 77, 0, 0.015); }
.countdown-teaser-title { font-size: 0.82rem; font-weight: 700; color: var(--dark); margin-bottom: 0.5rem; }
.countdown-teaser-sub { font-size: 0.75rem; color: var(--warm-gray); font-style: italic; margin-top: 0.25rem; }

/* ─── CALCULATING SCREEN ─── */
.calculating-overlay { text-align: center; padding: 2rem 1.5rem; animation: fadeUp 0.5s ease-out; }
.calculating-inline { margin-top: 2rem; padding-top: 1.5rem; border-top: 1.5px dashed var(--sand); animation: fadeUp 0.5s ease-out; }
.calculating-title { font-size: 0.92rem; font-weight: 800; color: var(--dark); margin-bottom: 0.5rem; }
.calculating-wheel-wrap { width: 56px; height: 56px; margin: 1.25rem auto 1rem; position: relative; }
.calculating-ring { position: absolute; inset: 0; border-radius: 50%; border: 2.5px solid var(--sand); border-top-color: var(--orange); animation: spinWheel 0.9s linear infinite; }
.calculating-ring-done { animation: none; border-color: var(--orange); }
.calculating-check { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0.5); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.calculating-check-visible { opacity: 1; transform: scale(1); }
.calculating-status { font-size: 1.05rem; font-weight: 700; transition: color 0.4s ease; }
.calculating-detail { display: flex; justify-content: center; gap: 12px; margin-top: 0.75rem; font-size: 0.7rem; color: var(--warm-gray); }
@keyframes spinWheel { to { transform: rotate(360deg); } }

/* ─── BLOCK BADGE ─── */
.block-badge { font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--orange); font-weight: 600; padding: 0.4rem 1rem; border: 1.5px solid var(--orange); margin-bottom: 1.5rem; animation: fadeUp 0.4s ease-out; }

/* ─── SAVE STATE HINT ─── */
.save-hint { font-size: 0.68rem; color: var(--warm-gray); text-align: center; padding: 0.5rem 1rem; font-style: italic; opacity: 0.7; }

/* ─── KEYBOARD LEGEND ─── */
.keyboard-legend { display: none; font-size: 0.65rem; color: var(--warm-gray); text-align: center; padding: 0.25rem 0; opacity: 0.5; letter-spacing: 0.02em; }
@media (hover: hover) and (pointer: fine) { .keyboard-legend { display: block; } }

/* ─── VIEWPORT LOCK ─── */
.question-screen { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; }

/* ─── MISCHTYP SECTION ─── */
.mischtyp-divider { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.5rem 0; gap: 0.5rem; }
.mischtyp-icon { width: 44px; height: 44px; border-radius: 50%; background: transparent; border: 2.5px solid #c0392b; color: #c0392b; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; line-height: 1; animation: fadeUp 0.5s ease-out; }
.mischtyp-divider-text { font-family: 'Inter Tight', sans-serif; font-size: clamp(1rem, 3vw, 1.2rem); font-weight: 800; color: var(--dark); letter-spacing: -0.01em; }
.mischtyp-section { padding: 2rem; background: rgba(28, 28, 28, 0.025); border: 1.5px solid var(--sand); }
.mischtyp-eyebrow { font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 0.35rem; font-weight: 600; }
.mischtyp-secondary-label { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.3rem, 4vw, 1.7rem); font-weight: 900; color: var(--dark); margin-bottom: 1rem; letter-spacing: -0.02em; }
.mischtyp-bridge { font-size: 0.92rem; line-height: 1.65; color: var(--dark); font-weight: 500; margin-bottom: 1rem; }
.mischtyp-text { font-size: 0.92rem; line-height: 1.7; color: var(--text-muted); font-weight: 400; }

/* ─── RESULT DESCRIPTION FORMATTING ─── */
.result-description { font-size: 0.95rem; line-height: 1.75; color: var(--dark); font-weight: 400; }
.result-description strong { color: var(--dark); font-weight: 700; }

/* ─── STRENGTHS & POTENTIALS ─── */
.strengths-section, .potentials-section { display: flex; flex-direction: column; gap: 1rem; }
.sp-title { font-family: 'Inter Tight', sans-serif; font-size: clamp(1rem, 2.5vw, 1.15rem); font-weight: 800; margin-bottom: 0.25rem; letter-spacing: -0.01em; }
.sp-title-green { color: #2d7a3a; }
.sp-title-orange { color: var(--orange); }
.sp-card { padding: 1.25rem 1.5rem; }
.sp-card-strength { border-left: 3px solid #2d7a3a; background: rgba(45, 122, 58, 0.04); }
.sp-card-potential { border-left: 3px solid var(--orange); background: var(--orange-glow); }
.sp-card-name { font-family: 'Inter Tight', sans-serif; font-size: 0.88rem; font-weight: 700; color: var(--dark); margin-bottom: 0.4rem; }
.sp-bar-track { height: 5px; background: var(--sand); margin-bottom: 0.6rem; overflow: hidden; }
.sp-bar-fill-green { height: 100%; background: #2d7a3a; transition: width 1s ease; }
.sp-bar-fill-orange { height: 100%; background: var(--orange); transition: width 1s ease; }
.sp-card-text { font-size: 0.88rem; line-height: 1.65; color: var(--dark); font-weight: 400; }

/* ─── HEBEL CTA ─── */
.hebel-cta { font-size: 0.88rem; line-height: 1.6; color: var(--dark); margin-top: 0.75rem; font-weight: 400; }
.hebel-cta a { color: var(--orange); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.hebel-cta a:hover { color: var(--orange-hover); }

@media (max-width: 520px) {
  .question-screen { padding: 4.5rem 1.15rem 1.5rem; }
  .option-btn { padding: 0.9rem; font-size: 0.84rem; }
  .progress-info { padding: 0.5rem 1rem; }
  .block-transition .answer-hint { margin-left: 0.5rem; margin-right: 0.5rem; }
  .question-scenario { margin-bottom: 1.75rem; }
  .options-list { gap: 0.5rem; margin-bottom: 1.25rem; }
  .secondary-section { margin-bottom: 1rem; }
  .nav-row { padding-top: 1rem; padding-bottom: 1.5rem; }
  .consent-overlay { padding: 0.75rem; }
  .consent-banner { padding: 1.25rem; }
  .consent-buttons { flex-direction: column; }
  .consent-btn-accept, .consent-btn-necessary { width: 100%; text-align: center; }
  .postq-screen { padding: 1.5rem 1.15rem; min-height: 50vh; }
  .recognition-btn { width: 48px; height: 48px; font-size: 1.1rem; }
  .recognition-scale { gap: 0.5rem; }
  .recognition-box { padding: 1.5rem 1rem; }
  .painpoint-btn { padding: 0.9rem 1rem; font-size: 0.84rem; }
  .result-avatar { height: 160px; }
  .intro-avatars-img { max-width: 320px; }
}
`;

// ─── COMPONENTS ─────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }) {
  return (
    <div className="intro-screen">
      <div className="intro-content">
        <h1>Finde in 12 Minuten heraus, was zwischen dir und dem Leben steht, das du <span className="highlight">eigentlich willst.</span></h1>
        <div className="intro-avatars">
          <img src="/Archetypen-nebeneinander.png" alt="5 Archetypen" className="intro-avatars-img" />
        </div>
        <p className="intro-meta">Sofortergebnis · anonym · 100% kostenlos</p>
        <button className="btn-primary btn-float" onClick={onStart}>TEST STARTEN</button>
      </div>
      <div className="fullscreen-footer">
        <a href="https://florian-lingner.ch/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
        <a href="https://florian-lingner.ch/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
      </div>
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  const remaining = total - current;
  const estMinutes = Math.ceil(remaining * 0.41); // ~25s per question avg incl. follow-ups = ~12min total
  let timeLabel;
  if (remaining <= 2) timeLabel = "Fast da";
  else if (remaining <= 7) timeLabel = "Noch ~2 Min";
  else if (remaining <= 14) timeLabel = "Noch ~5 Min";
  else if (remaining <= 22) timeLabel = "Noch ~8 Min";
  else timeLabel = `Noch ~${estMinutes} Min`;
  return (
    <div className="progress-container">
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-info">
        <span>Frage {current} von {total}</span>
        <span className="progress-pct">{timeLabel}</span>
      </div>
    </div>
  );
}

function BlockTransition({ block, onContinue, isFirst }) {
  const narrative = BLOCK_NARRATIVES[block.id];
  const blockBadge = block.id === 2 ? "Block 1 geschafft" : block.id === 3 ? "Halbzeit" : block.id === 4 ? "Letzter Block" : null;
  return (
    <div className="block-transition">
      <div className="block-transition-content">
        {blockBadge && <div className="block-badge">{blockBadge}</div>}
        <div className="block-num">{block.id}</div>
        <h2>{narrative.headline}</h2>
        <p className="block-narrative-sub">{narrative.sub}</p>
        <p className="block-count">{block.questions.length} Fragen</p>
        <div className="answer-hint">
          {isFirst ? (
            <div className="hint-bullets">
              <div className="hint-title">So funktioniert's</div>
              <div className="hint-item"><span className="hint-icon">🎯</span><span>Wähle pro Frage die Antwort, die <strong>am besten zu dir passt</strong>.</span></div>
              <div className="hint-item"><span className="hint-icon">🔄</span><span>Optional: Wähle eine <strong>zweite Antwort</strong> – sie wird schwächer gewichtet, macht dein Ergebnis aber genauer.</span></div>
              <div className="hint-item"><span className="hint-icon">💡</span><span>Wenn nur eine Antwort passt, <strong>reicht das völlig</strong>.</span></div>
              <div className="hint-item"><span className="hint-icon">⚡</span><span>Folge deinem <strong>ersten Impuls</strong> – nicht zu lange nachdenken. Die ehrlichste Antwort ist meistens die erste.</span></div>
            </div>
          ) : (
            <>
              Weiterhin gilt: Wähle die Antwort, die <strong>am ehesten auf dich zutrifft</strong>. Folge deinem <strong>ersten Impuls</strong>. Eine optionale Zweitantwort verfeinert dein Ergebnis – ist aber kein Muss.
            </>
          )}
        </div>
        <button className="btn-primary" onClick={onContinue}>Weiter</button>
      </div>
      <div className="fullscreen-footer">
        <a href="https://florian-lingner.ch/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
        <a href="https://florian-lingner.ch/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
      </div>
    </div>
  );
}

// ─── MICRO-FEEDBACK COMPONENT ─────────────────────────────────────────────
function MicroFeedbackCard({ feedback, onDismiss }) {
  return (
    <div className="micro-feedback" onClick={onDismiss}>
      <div className="micro-feedback-inner">
        <span className="micro-feedback-emoji">{feedback.emoji}</span>
        <p className="micro-feedback-text">{feedback.text}</p>
        {feedback.footnote && <p className="micro-feedback-footnote">{feedback.footnote}</p>}
        <button className="micro-feedback-dismiss">Weiter →</button>
      </div>
    </div>
  );
}

// ─── COUNTDOWN TEASER RADAR ──────────────────────────────────────────────
function CountdownRadar({ activePoints, showContour }) {
  const cx = 80, cy = 80, r = 62;
  const n = 10;
  const profileShape = [65, 40, 72, 25, 55, 30, 60, 15, 20, 78];
  const grayVal = 40;
  const getPoint = (i, val) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (val / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };
  const rings = [33, 66, 100];
  const spokes = Array.from({ length: n }, (_, i) => getPoint(i, 100));
  const contourVals = profileShape.map((v, i) => i < activePoints ? v : grayVal);
  const contourPts = contourVals.map((v, i) => getPoint(i, v));
  const contourPath = contourPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{ display: "block", margin: "0 auto" }}>
      {spokes.map((p, i) => (<line key={`s${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--sand)" strokeWidth="0.5" opacity="0.45" />))}
      {rings.map((val, ri) => {
        const pts = Array.from({ length: n }, (_, i) => getPoint(i, val));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={`r${ri}`} d={d} fill="none" stroke="var(--sand)" strokeWidth="0.5" opacity="0.4" />;
      })}
      {showContour && <path d={contourPath} fill={activePoints >= 10 ? "rgba(255,77,0,0.12)" : "rgba(255,77,0,0.08)"} stroke={activePoints >= 10 ? "rgba(255,77,0,0.7)" : "rgba(255,77,0,0.45)"} strokeWidth="1.5" strokeDasharray={activePoints >= 10 ? "none" : "4 3"} />}
      {contourPts.map((p, i) => {
        const isActive = i < activePoints;
        return (<g key={`d${i}`}>
          {!isActive && <circle cx={p.x} cy={p.y} r="3" fill="none" stroke="var(--sand)" strokeWidth="1" opacity="0.45" />}
          {isActive && <><circle cx={p.x} cy={p.y} r="5" fill="rgba(255,77,0,0.1)" /><circle cx={p.x} cy={p.y} r="2.8" fill="var(--orange)" /></>}
        </g>);
      })}
    </svg>
  );
}

// ─── CALCULATING SCREEN (F30 post-answer) ─────────────────────────────────
function CalculatingOverlay({ onReady }) {
  const [phase, setPhase] = useState("loading");
  useEffect(() => {
    const t = setTimeout(() => { setPhase("done"); setTimeout(onReady, 600); }, 2200);
    return () => clearTimeout(t);
  }, []);
  const done = phase === "done";
  return (
    <div className="calculating-overlay">
      <div className="calculating-title">Dein Archetyp steht fest.</div>
      <div className="calculating-wheel-wrap">
        <div className={`calculating-ring ${done ? "calculating-ring-done" : ""}`} />
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: "absolute", inset: 0 }}>
          <circle cx="28" cy="28" r="22" fill="none" stroke="var(--sand)" strokeWidth="2" opacity="0.3" />
          <circle cx="28" cy="28" r="22" fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 22}`} strokeDashoffset={done ? 0 : 2 * Math.PI * 22} transform="rotate(-90 28 28)" style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)" }} />
        </svg>
        <div className={`calculating-check ${done ? "calculating-check-visible" : ""}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" strokeDashoffset={done ? 0 : 24} style={{ transition: "stroke-dashoffset 0.5s ease 0.2s" }} /></svg>
        </div>
      </div>
      <div className="calculating-status" style={{ color: done ? "var(--dark)" : "var(--warm-gray)" }}>{done ? "Auswertung abgeschlossen" : "Ergebnis wird berechnet..."}</div>
      {!done && <div className="calculating-detail"><span>10 Dimensionen</span><span style={{ opacity: 0.4 }}>|</span><span>5 Archetypen</span><span style={{ opacity: 0.4 }}>|</span><span>30 Antworten</span></div>}
    </div>
  );
}

function QuestionCard({ question, questionIndex, totalQuestions, answers, followUpAnswers, onAnswer, onFollowUp, onNext, onBack, isLast }) {
  const currentAnswer = answers[question.id] || { primary: null, secondary: null };
  const hasPrimary = currentAnswer.primary !== null;
  const followUpKey = hasPrimary ? `${question.id}${currentAnswer.primary}` : null;
  const followUp = followUpKey ? FOLLOW_UPS[followUpKey] : null;
  const followUpAnswer = followUpKey ? (followUpAnswers[followUpKey] || null) : null;
  const canProceed = hasPrimary && (!followUp || followUpAnswer !== null);
  const [showMicroFeedback, setShowMicroFeedback] = useState(null);
  const [showCalculating, setShowCalculating] = useState(false);
  const [feedbackShown, setFeedbackShown] = useState({});

  // Keyboard shortcuts (desktop)
  useEffect(() => {
    const handler = (e) => {
      if (showMicroFeedback || showCalculating) return;
      const keys = ["1", "2", "3", "4"];
      const idx = keys.indexOf(e.key);
      if (idx >= 0 && idx < question.options.length) {
        e.preventDefault();
        handleOptionClick(question.options[idx].key);
      }
      if (e.key === " " && canProceed) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasPrimary, canProceed, showMicroFeedback, showCalculating, currentAnswer]);

  const pct = Math.round(((questionIndex + 1) / totalQuestions) * 100);
  const milestone = MILESTONES[pct];
  const isCore = question.isCore;

  // Countdown teaser logic
  const qNum = questionIndex + 1;
  const remaining = totalQuestions - qNum;
  let teaserState = null;
  if (qNum === 25) teaserState = { activePoints: 2, showContour: false, title: "Dein Profil nimmt Form an...", sub: `Noch ${remaining} Fragen bis zu deinem Ergebnis` };
  else if (qNum === 26) teaserState = { activePoints: 4, showContour: true, title: "Dein Profil nimmt Form an...", sub: `Noch ${remaining} Fragen bis zu deinem Ergebnis` };
  else if (qNum === 27) teaserState = { activePoints: 6, showContour: true, title: "Dein Profil wird deutlicher...", sub: `Noch ${remaining} Fragen – gleich siehst du dein Ergebnis` };
  else if (qNum === 28) teaserState = { activePoints: 8, showContour: true, title: "Dein Profil wird deutlicher...", sub: `Noch ${remaining} Fragen – gleich siehst du dein Ergebnis` };
  else if (qNum === 29) teaserState = { activePoints: 10, showContour: true, title: "Letztes Feintuning...", sub: null, isFinetuning: true };

  const handleOptionClick = (key) => {
    if (!hasPrimary) {
      onAnswer(question.id, { primary: key, secondary: null });
    } else if (key === currentAnswer.primary) {
      if (followUpKey) onFollowUp(followUpKey, null);
      onAnswer(question.id, { primary: null, secondary: null });
    } else if (key === currentAnswer.secondary) {
      onAnswer(question.id, { ...currentAnswer, secondary: null });
    } else {
      onAnswer(question.id, { ...currentAnswer, secondary: key });
    }
  };

  const handleNext = () => {
    // Check for micro-feedback
    const fb = getMicroFeedback(question.id, answers);
    if (fb && !feedbackShown[question.id]) {
      setFeedbackShown(prev => ({ ...prev, [question.id]: true }));
      setShowMicroFeedback(fb);
      return;
    }
    // For last question, show calculating inline
    if (isLast) {
      setShowCalculating(true);
      return;
    }
    onNext();
  };

  if (showMicroFeedback) {
    return <MicroFeedbackCard feedback={showMicroFeedback} onDismiss={() => { setShowMicroFeedback(null); if (isLast) { setShowCalculating(true); } else { onNext(); } }} />;
  }

  return (
    <div className={`question-screen ${isCore ? "question-screen-core" : ""}`}>
      <ProgressBar current={questionIndex + 1} total={totalQuestions} />
      {isCore && <div className="core-badge"><span className="core-badge-pill">🔥 Kernfrage</span><span className="core-badge-sub">Antworte besonders durchdacht und ehrlich.</span></div>}
      {milestone && <div className="milestone-bar">{milestone}</div>}
      <div className="question-wrapper" key={question.id}>
        <div className={`question-title-small ${isCore ? "question-title-core" : ""}`}>{question.title}</div>
        <p className="question-scenario">{question.scenario}</p>
        <div className="answer-label">{!hasPrimary ? "Wähle deine Antwort" : "Deine Antwort"}</div>
        <div className="options-list">
          {question.options.map((opt) => {
            const isPrimary = currentAnswer.primary === opt.key;
            const isSecondary = currentAnswer.secondary === opt.key;
            let cls = "option-btn";
            if (isPrimary) cls += " selected-primary";
            else if (isSecondary) cls += " selected-secondary";
            return (
              <button key={opt.key} className={cls} onClick={() => handleOptionClick(opt.key)}>
                <span className="option-key">{opt.key}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
        {hasPrimary && !currentAnswer.secondary && (
          <div className="secondary-section">
            <p className="secondary-hint">Optional: Wähle eine zweite Antwort, die auch auf dich zutrifft (wird schwächer gewichtet)</p>
          </div>
        )}
        {currentAnswer.secondary && (
          <div className="secondary-section">
            <p className="secondary-hint">Zweitantwort gewählt – wird schwächer gewichtet</p>
          </div>
        )}
        {followUp && hasPrimary && (
          <div className="followup-section">
            <div className="followup-question">{followUp.question}</div>
            <div className="followup-options">
              {followUp.options.map((opt) => (
                <button key={opt.key} className={`followup-btn ${followUpAnswer === opt.key ? "followup-selected" : ""}`} onClick={() => onFollowUp(followUpKey, opt.key)}>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}
        {!showCalculating && (
          <div className="nav-row">
            <button className="btn-back" onClick={onBack}>{questionIndex === 0 ? "" : "← Zurück"}</button>
            <button className={`btn-next ${isLast ? "btn-finish" : ""}`} disabled={!canProceed} onClick={handleNext}>
              {teaserState?.isFinetuning ? "Jetzt zur abschließenden Frage →" : isLast ? "Test abschließen" : "Weiter →"}
            </button>
          </div>
        )}
        {teaserState && (
          <div className={`countdown-teaser ${teaserState.isFinetuning ? "countdown-teaser-finetuning" : ""}`}>
            <div className="countdown-teaser-title">{teaserState.title}</div>
            <CountdownRadar activePoints={teaserState.activePoints} showContour={teaserState.showContour} />
            {teaserState.sub && <div className="countdown-teaser-sub">{teaserState.sub}</div>}
          </div>
        )}
        {showCalculating && (
          <div className="calculating-inline">
            <CalculatingOverlay onReady={onNext} />
          </div>
        )}
      </div>
      <div className="keyboard-legend">Tastatur: 1–4 = Antwort wählen · Leertaste = Weiter</div>
      <div className="save-hint">Antworten werden automatisch gespeichert.</div>
    </div>
  );
}

function SessionPopup({ type, onContinue, onRestart }) {
  return (
    <div className="session-overlay">
      <div className="session-popup">
        <h3>{type === "progress" ? "Willkommen zurück" : "Dein Ergebnis"}</h3>
        <p>{type === "progress" ? "Du hast den Test noch nicht abgeschlossen. Möchtest du fortsetzen oder von vorne beginnen?" : "Möchtest du dein Ergebnis ansehen oder den Test neu starten?"}</p>
        <div className="session-popup-btns">
          <button style={{ background: "var(--orange)", color: "#fff" }} onClick={onContinue}>
            {type === "progress" ? "Fortsetzen" : "Ergebnis ansehen"}
          </button>
          <button style={{ background: "transparent", color: "var(--dark)", border: "1.5px solid var(--sand)" }} onClick={onRestart}>
            Neustarten
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── RESULT SCREEN ──────────────────────────────────────────────────────────

function CompleteScreen({ answers, followUpAnswers = {} }) {
  const [showDebug, setShowDebug] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle");
  const [emailError, setEmailError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [recognitionScore, setRecognitionScore] = useState(null);

  const scoring = computeScoring(answers, followUpAnswers);
  const meta = TYPE_META[scoring.resultType];

  useEffect(() => { const t = setTimeout(() => setAnimateIn(true), 100); return () => clearTimeout(t); }, []);
  useEffect(() => {
    trackEvent("TestCompleted", { archetype: scoring.resultType, archetype_label: meta.label, is_reintyp: scoring.isReintyp, margin: Math.round(scoring.margin) });
    saveResult({ answers, followUpAnswers, resultType: scoring.resultType });
  }, []);

  const sortedTypes = Object.entries(scoring.affinities).sort((a, b) => b[1] - a[1]);

  // Mischtyp: find second-place type and combo text
  const sortedDistances = Object.entries(scoring.distances).sort((a, b) => a[1] - b[1]);
  const secondaryType = sortedDistances.length >= 2 ? sortedDistances[1][0] : null;
  const comboKey = secondaryType ? `${scoring.resultType}+${secondaryType}` : null;
  const comboText = comboKey ? COMBO_TEXTS[comboKey] : null;
  const showMischtyp = !scoring.isReintyp && comboText && secondaryType;

  const { strengths, potentials } = getStrengthsAndPotentials(scoring.normalized);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const handleKeyDown = (e) => { if (e.key === "Enter") handleEmailSubmit(); };
  const REINTYP_TAG_ID = 17381951;

  const handleEmailSubmit = async () => {
    if (!firstName.trim()) { setEmailError("Bitte gib deinen Vornamen ein."); return; }
    if (!validateEmail(email)) { setEmailError("Bitte gib eine gültige E-Mail-Adresse ein."); return; }
    setEmailStatus("loading"); setEmailError("");
    const formId = KIT_FORM_IDS[scoring.resultType];
    try {
      const body = { api_key: KIT_API_KEY, email, first_name: firstName.trim(), fields: { recognition_score: recognitionScore !== null ? String(recognitionScore) : "", archetype: scoring.resultType } };
      if (scoring.isReintyp) body.tags = [REINTYP_TAG_ID];
      const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(body) });
      if (res.ok) { setEmailStatus("success"); trackEvent("EmailSubmitted", { archetype: scoring.resultType, recognition_score: recognitionScore }); }
      else throw new Error("API Error");
    } catch (err) { console.error("Kit subscription failed:", err); setEmailStatus("error"); setEmailError("Es gab ein Problem. Bitte versuche es erneut."); }
  };

  const generatePDF = async () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = 210, ph = 297;
      const orange = [255, 77, 0], dark = [28, 28, 28], gray = [107, 101, 96], warmGray = [163, 155, 147], green = [45, 122, 58];
      const stripHtml = (html) => html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
      const bgResponse = await fetch("/Digitales-briefpapier.jpg");
      const bgBlob = await bgResponse.blob();
      const bgData = await new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.readAsDataURL(bgBlob); });
      const addBg = () => doc.addImage(bgData, "JPEG", 0, 0, pw, ph);
      const checkPage = (needed) => { if (y + needed > ph - 25) { doc.addPage(); addBg(); y = 38; } };
      addBg();
      let y = 38;

      // ─── PAGE 1: Header + Radar + Description + Pain ───
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...warmGray);
      doc.text("DEIN PERSÖNLICHKEITSTEST \u2013 ERGEBNIS", pw / 2, y, { align: "center" }); y += 12;
      doc.setFont("helvetica", "bold"); doc.setFontSize(32); doc.setTextColor(...dark);
      doc.text(meta.label, pw / 2, y, { align: "center" }); y += 10;
      doc.setFont("helvetica", "italic"); doc.setFontSize(11); doc.setTextColor(...orange);
      const tagLines = doc.splitTextToSize("\u201E" + meta.tagline + "\u201C", 150);
      doc.text(tagLines, pw / 2, y, { align: "center" }); y += tagLines.length * 5.5 + 10;

      // Radar
      const radarCx = pw / 2, radarCy = y + 42, radarR = 36;
      const scales = CORE_SCALES, sn = scales.length;
      const getRadarPt = (idx, val) => { const angle = (Math.PI * 2 * idx) / sn - Math.PI / 2; const dist = (val / 100) * radarR; return { x: radarCx + dist * Math.cos(angle), y: radarCy + dist * Math.sin(angle) }; };
      [25, 50, 75, 100].forEach(val => { const pts = scales.map((_, i) => getRadarPt(i, val)); doc.setDrawColor(...warmGray); doc.setLineWidth(0.15); pts.forEach((p, i) => { const np = pts[(i + 1) % pts.length]; doc.line(p.x, p.y, np.x, np.y); }); });
      scales.forEach((_, i) => { const p = getRadarPt(i, 100); doc.setDrawColor(220, 215, 210); doc.setLineWidth(0.1); doc.line(radarCx, radarCy, p.x, p.y); });
      const typeProfile = TYPE_PROFILES[scoring.resultType];
      const typePts = scales.map((s, i) => getRadarPt(i, typeProfile[s]));
      doc.setDrawColor(...warmGray); doc.setLineWidth(0.2); typePts.forEach((p, i) => { const np = typePts[(i + 1) % typePts.length]; doc.line(p.x, p.y, np.x, np.y); });
      const userPts = scales.map((s, i) => getRadarPt(i, scoring.normalized[s]));
      doc.setDrawColor(...orange); doc.setLineWidth(0.6); userPts.forEach((p, i) => { const np = userPts[(i + 1) % userPts.length]; doc.line(p.x, p.y, np.x, np.y); });
      userPts.forEach(p => { doc.setFillColor(...orange); doc.circle(p.x, p.y, 1, "F"); });
      const shortLabels = { REF: "Reflexion", SL: "Selbstliebe", ML: "Machtlosigk.", OL: "Orient.losigk.", ETH: "Eig. Werte", WS: "Weltschmerz", NAT: "Natur", EX: "Externalis.", EF: "Fremdbest.", HA: "Handlungskr." };
      doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(...dark);
      scales.forEach((s, i) => { const p = getRadarPt(i, 125); const anchor = p.x < radarCx - 5 ? "right" : p.x > radarCx + 5 ? "left" : "center"; const dy = p.y < radarCy - 5 ? -1.5 : p.y > radarCy + 5 ? 3 : 0.5; doc.text(shortLabels[s] || SCALE_LABELS[s], p.x, p.y + dy, { align: anchor }); });
      y = radarCy + radarR + 10;
      doc.setFontSize(6); doc.setTextColor(...orange); doc.setFillColor(...orange);
      doc.rect(pw / 2 - 35, y - 1.2, 4, 1.2, "F"); doc.text("Dein Profil", pw / 2 - 29, y, { align: "left" });
      doc.setTextColor(...warmGray); doc.setDrawColor(...warmGray); doc.setLineWidth(0.3);
      doc.line(pw / 2 + 5, y - 0.6, pw / 2 + 9, y - 0.6); doc.text(meta.label + "-Referenz", pw / 2 + 11, y, { align: "left" }); y += 18;

      // Description (HTML stripped, split by paragraphs)
      const descPlain = stripHtml(meta.description);
      const descParas = descPlain.split('\n').filter(p => p.trim());
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...dark);
      descParas.forEach(para => {
        const lines = doc.splitTextToSize(para.trim(), 155);
        checkPage(lines.length * 4.2 + 4);
        doc.text(lines, 27, y, { lineHeightFactor: 1.55 }); y += lines.length * 4.2 + 4;
      });
      y += 4;

      // Pain section
      checkPage(35);
      doc.setFillColor(...orange); doc.rect(27, y, 1.2, 28, "F");
      doc.setFillColor(255, 240, 235); doc.rect(29, y - 1, 154, 30, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...orange);
      doc.text("Daran scheiterst du gerade wahrscheinlich:", 32, y + 5);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...dark);
      const painLines = doc.splitTextToSize(meta.pain, 148); doc.text(painLines, 32, y + 12, { lineHeightFactor: 1.55 }); y += 36;

      // ─── PAGE 2: Hebel + Stärken + Potenziale ───
      doc.addPage(); addBg(); y = 38;

      // Hebel
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...dark);
      doc.text("Dein gr\u00F6\u00DFter Hebel:", 27, y); y += 8;
      doc.setFillColor(245, 243, 240); doc.rect(27, y - 2, 156, 36, "F");
      doc.setFillColor(...dark); doc.rect(27, y - 2, 1.2, 36, "F");
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...dark);
      const hebelLines = doc.splitTextToSize(meta.hebel, 148); doc.text(hebelLines, 32, y + 5, { lineHeightFactor: 1.5 });
      const hebelH = hebelLines.length * 4.5;
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...orange);
      doc.text("Ein erster Schritt:", 32, y + 5 + hebelH + 3);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...dark);
      const schrittLines = doc.splitTextToSize(meta.schritt, 148); doc.text(schrittLines, 32, y + 5 + hebelH + 9, { lineHeightFactor: 1.5 }); y += 44;

      // Top 3 Stärken
      y += 6;
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...green);
      doc.text("Deine Top 3 St\u00E4rken", 27, y); y += 8;
      strengths.forEach(s => {
        const textLines = doc.splitTextToSize(s.text, 148);
        const cardH = 14 + textLines.length * 4;
        checkPage(cardH + 4);
        doc.setFillColor(240, 248, 242); doc.rect(27, y - 2, 156, cardH, "F");
        doc.setFillColor(...green); doc.rect(27, y - 2, 1.2, cardH, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...dark);
        doc.text(s.name, 32, y + 4);
        const barW = Math.max((s.strengthScore / 100) * 100, 5);
        doc.setFillColor(232, 224, 216); doc.rect(32, y + 7, 100, 2.5, "F");
        doc.setFillColor(...green); doc.rect(32, y + 7, barW, 2.5, "F");
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...dark);
        doc.text(textLines, 32, y + 14, { lineHeightFactor: 1.45 }); y += cardH + 4;
      });

      // Top 3 Potenziale
      y += 6;
      checkPage(20);
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...orange);
      doc.text("Deine 3 gr\u00F6\u00DFten Potenziale", 27, y); y += 8;
      potentials.forEach(p => {
        const textLines = doc.splitTextToSize(p.text, 148);
        const cardH = 14 + textLines.length * 4;
        checkPage(cardH + 4);
        doc.setFillColor(255, 245, 240); doc.rect(27, y - 2, 156, cardH, "F");
        doc.setFillColor(...orange); doc.rect(27, y - 2, 1.2, cardH, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...dark);
        doc.text(p.name, 32, y + 4);
        const barW = Math.max(((100 - p.strengthScore) / 100) * 100, 5);
        doc.setFillColor(232, 224, 216); doc.rect(32, y + 7, 100, 2.5, "F");
        doc.setFillColor(...orange); doc.rect(32, y + 7, barW, 2.5, "F");
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...dark);
        doc.text(textLines, 32, y + 14, { lineHeightFactor: 1.45 }); y += cardH + 4;
      });

      // ─── PAGE 3: Typ-Verteilung + Mischtyp + CTA ───
      doc.addPage(); addBg(); y = 38;

      // Typ-Verteilung
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...dark);
      doc.text("Deine Typ-Verteilung", pw / 2, y, { align: "center" }); y += 12;
      const sortedAffinities = Object.entries(scoring.affinities).sort((a, b) => b[1] - a[1]);
      sortedAffinities.forEach(([type, pct]) => {
        const isMain = type === scoring.resultType;
        const isSec = type === secondaryType && showMischtyp;
        doc.setFont("helvetica", isMain ? "bold" : "normal"); doc.setFontSize(9); doc.setTextColor(...dark); doc.text(TYPE_META[type].label, 30, y);
        doc.setFillColor(232, 224, 216); doc.rect(80, y - 2.5, 75, 4, "F");
        const barW = Math.max((pct / 100) * 75, 2);
        if (isMain) doc.setFillColor(...orange); else if (isSec) doc.setFillColor(...dark); else doc.setFillColor(...warmGray);
        doc.rect(80, y - 2.5, barW, 4, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...gray); doc.text(pct + "%", 170, y, { align: "right" }); y += 9;
      }); y += 10;

      // Mischtyp / Sekundär-Archetyp
      if (showMischtyp) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...dark);
        doc.text("Dein Sekund\u00E4r-Archetyp: " + TYPE_META[secondaryType]?.label, 27, y); y += 8;
        doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(...gray);
        const bridgeText = "Du bist nicht nur " + meta.label + ", dein Profil zeigt auch deutliche " + TYPE_META[secondaryType]?.label + "-Anteile. Und genau diese Mischung macht's spannend:";
        const bridgeLines = doc.splitTextToSize(bridgeText, 155);
        doc.text(bridgeLines, 27, y, { lineHeightFactor: 1.5 }); y += bridgeLines.length * 4.5 + 4;
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...dark);
        const comboLines = doc.splitTextToSize(comboText, 155);
        doc.text(comboLines, 27, y, { lineHeightFactor: 1.55 }); y += comboLines.length * 4.2 + 10;
      }

      // CTA
      checkPage(70);
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...dark);
      const ctaTitle = "DEINE KOSTENLOSE " + meta.labelFuer.toUpperCase() + "-MASTERCLASS";
      doc.text(ctaTitle, pw / 2, y, { align: "center" }); y += 7;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...gray);
      const ctaTextPdf = doc.splitTextToSize("Hier bietet sich dir die M\u00F6glichkeit, genau deine Kernprobleme aufzul\u00F6sen. Scanne den QR-Code oder klicke den Link:", 140);
      doc.text(ctaTextPdf, pw / 2, y, { align: "center", lineHeightFactor: 1.5 }); y += ctaTextPdf.length * 4.5 + 8;
      const qrUrl = "https://florian-lingner.ch/kostenlose-archetyp-masterclass-anfordern/";
      try { const qrResponse = await fetch("/qr-code-mc-anfordern-pdf.png"); const qrBlob = await qrResponse.blob(); const qrData = await new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.readAsDataURL(qrBlob); }); doc.addImage(qrData, "PNG", pw / 2 - 16, y, 32, 32); y += 38; } catch (qrErr) { doc.setFontSize(9); doc.setTextColor(...orange); doc.text(qrUrl, pw / 2, y + 4, { align: "center" }); y += 12; }
      const btnW = 80, btnH = 10; doc.setFillColor(...dark); doc.rect(pw / 2 - btnW / 2, y, btnW, btnH, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(245, 240, 235);
      doc.text("Masterclass ansehen", pw / 2, y + 5.8, { align: "center" }); doc.link(pw / 2 - btnW / 2, y, btnW, btnH, { url: qrUrl }); y += btnH + 6;
      doc.setFontSize(7); doc.setTextColor(...warmGray); doc.text(qrUrl, pw / 2, y, { align: "center" });
      doc.save("Persoenlichkeitstest-" + meta.label.replace(/\s+/g, "-") + ".pdf");
    } catch (err) { console.error("PDF generation failed:", err); alert("PDF-Fehler: " + (err.message || err)); }
    finally { setPdfLoading(false); }
  };

  return (
    <div className={`result-screen ${animateIn ? "visible" : ""}`}>
      <div className="result-inner">
        <div className="result-header">
          <div className="result-eyebrow">Dein Ergebnis</div>
          <div className="result-avatar-wrap">
            <img src={meta.avatar} alt={meta.label} className="result-avatar" />
          </div>
          <div className="result-type-label">{meta.label}</div>
          <div className="result-tagline">{meta.tagline}</div>
        </div>
        <div className="radar-container">
          <RadarChart normalized={scoring.normalized} resultType={scoring.resultType} />
          <div className="radar-legend">
            <div className="legend-item"><span className="legend-dot user" /> Dein Profil</div>
            <div className="legend-item"><span className="legend-dot type" /> {meta.label}-Referenz</div>
          </div>
        </div>
        <div className="result-description" dangerouslySetInnerHTML={{ __html: meta.description }} />
        <div className="result-pain"><div className="pain-label">Daran scheiterst du gerade wahrscheinlich:</div><p>{meta.pain}</p></div>
        <div className="result-hebel">
          <div className="hebel-label">Dein größter Hebel:</div>
          <p>{meta.hebel}</p>
          <div className="schritt-label">Ein erster Schritt:</div>
          <p>{meta.schritt}</p>
          <p className="hebel-cta">Um deine offenen Potenziale nun aktiv zu bearbeiten, trage dich jetzt einfach zur kostenlosen <a href="#masterclass-form" onClick={(e) => { e.preventDefault(); document.getElementById('masterclass-form')?.scrollIntoView({ behavior: 'smooth' }); }}>Video-Masterclass</a> speziell für deinen Archetyp ein!</p>
        </div>
        <div className="strengths-section">
          <div className="sp-title sp-title-green">Deine Top 3 Stärken</div>
          {strengths.map(s => (
            <div className="sp-card sp-card-strength" key={s.key}>
              <div className="sp-card-name">{s.name}</div>
              <div className="sp-bar-track"><div className="sp-bar-fill-green" style={{ width: `${s.strengthScore}%` }} /></div>
              <div className="sp-card-text">{s.text}</div>
            </div>
          ))}
        </div>
        <div className="potentials-section">
          <div className="sp-title sp-title-orange">Deine 3 größten Potenziale</div>
          {potentials.map(p => (
            <div className="sp-card sp-card-potential" key={p.key}>
              <div className="sp-card-name">{p.name}</div>
              <div className="sp-bar-track"><div className="sp-bar-fill-orange" style={{ width: `${100 - p.strengthScore}%` }} /></div>
              <div className="sp-card-text">{p.text}</div>
            </div>
          ))}
        </div>
        {showMischtyp && (
          <div className="mischtyp-divider">
            <div className="mischtyp-icon">❗</div>
            <div className="mischtyp-divider-text">Da ist noch was in dir...</div>
          </div>
        )}
        <div className="result-affinities">
          <div className="affinities-label">Deine Typ-Verteilung</div>
          {sortedTypes.map(([type, pct]) => (
            <div className="affinity-row" key={type}>
              <span className="affinity-name">{TYPE_META[type].label}</span>
              <div className="affinity-bar-track"><div className="affinity-bar-fill" style={{ width: `${pct}%`, background: type === scoring.resultType ? "var(--orange)" : type === secondaryType && showMischtyp ? "var(--dark)" : "var(--warm-gray)" }} /></div>
              <span className="affinity-pct">{pct}%</span>
            </div>
          ))}
        </div>
        {showMischtyp && (
          <div className="mischtyp-section">
            <div className="mischtyp-eyebrow">Dein Sekundär-Archetyp</div>
            <div className="mischtyp-secondary-label">{TYPE_META[secondaryType]?.label}</div>
            <div className="mischtyp-bridge">Du bist nicht nur {meta.label}, dein Profil zeigt auch deutliche {TYPE_META[secondaryType]?.label}-Anteile. Und genau diese Mischung macht's spannend:</div>
            <div className="mischtyp-text">{comboText}</div>
          </div>
        )}
        <div className="postq-screen signup-solo" id="masterclass-form">
          {emailStatus === "success" ? (
            <div className="cta-success">
              <div className="success-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
              <div className="success-title">Drin.</div>
              <p className="success-sub">Check deine Inbox – deine <strong>Masterclass für {meta.labelFuer}</strong> wartet auf dich.</p>
            </div>
          ) : (
            <>
              <div className="signup-solo-header">
                <div className="postq-eyebrow">Dein nächster Schritt</div>
                <div className="postq-title">Deine kostenlose<br />Masterclass für {meta.labelFuer}</div>
                <p className="signup-solo-text">{meta.ctaText}</p>
              </div>
              <div className="cta-email">
                <input type="text" placeholder="Dein Vorname" className={`email-input ${emailError && !firstName.trim() ? "email-input-error" : ""}`} value={firstName} onChange={(e) => { setFirstName(e.target.value); setEmailError(""); }} disabled={emailStatus === "loading"} />
                <input type="email" placeholder="Deine E-Mail-Adresse" className={`email-input ${emailError && firstName.trim() ? "email-input-error" : ""}`} value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} onKeyDown={handleKeyDown} disabled={emailStatus === "loading"} />
                {emailError && <p className="email-error-msg">{emailError}</p>}
                <button className={`btn-primary btn-cta ${emailStatus === "loading" ? "btn-loading" : ""}`} onClick={handleEmailSubmit} disabled={emailStatus === "loading"}>
                  {emailStatus === "loading" ? (<span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>) : "Masterclass freischalten"}
                </button>
              </div>
              <p className="cta-privacy" style={{ textAlign: "center" }}>Kein Spam. Kein Bullshit. Jederzeit abmeldbar.</p>
            </>
          )}
        </div>
        <div className="recognition-box">
          <div className="recognition-box-title">Wie gut erkennst du dich in diesem Ergebnis wieder?</div>
          <div className="recognition-scale">
            {[1,2,3,4,5].map(n => (<button key={n} className={`recognition-btn ${recognitionScore === n ? "recognition-selected" : ""}`} onClick={() => { setRecognitionScore(n); trackEvent("RecognitionScore", { score: n, archetype: scoring.resultType }); }}>{n}</button>))}
          </div>
          <div className="recognition-labels"><span>Gar nicht</span><span>Sehr</span></div>
        </div>
        <div className="pdf-save-section">
          <p className="pdf-save-hint">Speichere dein Ergebnis als PDF – inkl. Radar-Chart und personalisierten Impulsen.</p>
          <button className="btn-pdf-download" onClick={generatePDF} disabled={pdfLoading}>{pdfLoading ? "PDF wird erstellt..." : "Ergebnis als PDF speichern"}</button>
        </div>
        <div className="share-section">
          <div className="share-title">Dir hat der Test gefallen?</div>
          <div className="share-sub">Teile ihn mit deinen Freunden:</div>
          <div className="share-buttons">
            <a className="share-btn share-whatsapp" href={`https://wa.me/?text=${encodeURIComponent("Ich habe grade diesen Persönlichkeitstest gemacht und war echt beeindruckt! Kann ihn nur empfehlen, wenn man mal genauer hinsehen möchte!\n\nhttps://test.florian-lingner.ch")}`} target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a className="share-btn share-telegram" href={`https://t.me/share/url?url=${encodeURIComponent("https://test.florian-lingner.ch")}&text=${encodeURIComponent("Ich habe grade diesen Persönlichkeitstest gemacht und war echt beeindruckt! Kann ihn nur empfehlen, wenn man mal genauer hinsehen möchte!")}`} target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </a>
            <button className="share-btn share-copy" onClick={() => { navigator.clipboard.writeText("Ich habe grade diesen Persönlichkeitstest gemacht und war echt beeindruckt! Kann ihn nur empfehlen, wenn man mal genauer hinsehen möchte!\n\nhttps://test.florian-lingner.ch"); const btn = document.querySelector('.share-copy'); const orig = btn.textContent; btn.textContent = "✓ Kopiert!"; setTimeout(() => btn.textContent = orig, 2000); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Link kopieren
            </button>
          </div>
        </div>
        <button className="debug-toggle" onClick={() => setShowDebug(!showDebug)}>{showDebug ? "Debug ausblenden" : "// Debug anzeigen"}</button>
        {showDebug && (
          <div className="score-debug">
            <strong>// Normalisierte Werte (0–100)</strong><br /><br />
            {CORE_SCALES.map(s => (<span key={s}>{s}: {scoring.normalized[s]}<br /></span>))}
            <br /><strong>// Distanzen zu Typen</strong><br /><br />
            {Object.entries(scoring.distances).sort((a, b) => a[1] - b[1]).map(([type, dist]) => (<span key={type}>{TYPE_META[type].label}: {dist.toFixed(1)} {type === scoring.resultType ? "← MATCH" : ""}<br /></span>))}
            <br />Margin: {scoring.margin.toFixed(1)}<br />
            Reintyp-Tag: {scoring.isReintyp ? "JA (≥20)" : "NEIN (Mischprofil)"}<br />
            Kit Form-ID: {KIT_FORM_IDS[scoring.resultType]}<br /><br />
            <strong>// Antworten</strong><br /><br />
            {QUESTIONS.map(q => { const a = answers[q.id]; const fuKey = a?.primary ? `${q.id}${a.primary}` : null; const fuAns = fuKey ? followUpAnswers[fuKey] : null; return (<span key={q.id}>F{q.id}: {a?.primary || "–"}{a?.secondary ? ` + ${a.secondary} (40%)` : ""}{fuAns ? ` → FU:${fuAns}` : ""}<br /></span>); })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────────

export default function PersonalityTest() {
  const [phase, setPhase] = useState("intro");
  const [currentBlock, setCurrentBlock] = useState(0);
  const [currentQuestionInBlock, setCurrentQuestionInBlock] = useState(0);
  const [answers, setAnswers] = useState({});
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [consentGiven, setConsentGiven] = useState(false);
  const [sessionPopup, setSessionPopup] = useState(null);
  const appRef = useRef(null);
  const totalQuestions = 30;
  const flatIndex = BLOCKS.slice(0, currentBlock).reduce((sum, b) => sum + b.questions.length, 0) + currentQuestionInBlock;
  const currentQuestion = QUESTIONS[flatIndex];
  const block = BLOCKS[currentBlock];

  useEffect(() => {
    const savedResult = loadResult();
    if (savedResult) { setSessionPopup("result"); return; }
    const savedProgress = loadProgress();
    if (savedProgress && savedProgress.answers && Object.keys(savedProgress.answers).length > 0) { setSessionPopup("progress"); }
  }, []);

  const handleSessionContinue = () => {
    if (sessionPopup === "result") { const saved = loadResult(); if (saved) { setAnswers(saved.answers || {}); setFollowUpAnswers(saved.followUpAnswers || {}); setPhase("complete"); } }
    else if (sessionPopup === "progress") { const saved = loadProgress(); if (saved) { setAnswers(saved.answers || {}); setFollowUpAnswers(saved.followUpAnswers || {}); setCurrentBlock(saved.currentBlock || 0); setCurrentQuestionInBlock(saved.currentQuestionInBlock || 0); setPhase(saved.phase || "question"); } }
    setSessionPopup(null);
  };

  const handleSessionRestart = () => { clearProgress(); clearResult(); setAnswers({}); setFollowUpAnswers({}); setCurrentBlock(0); setCurrentQuestionInBlock(0); setPhase("intro"); setSessionPopup(null); };

  const handleConsent = useCallback((value) => { if (value === "all") { initPixel(); setConsentGiven(true); } }, []);
  useEffect(() => { const existing = getConsent(); if (existing === "all") { initPixel(); setConsentGiven(true); } }, []);

  const scrollTop = useCallback(() => { if (appRef.current) appRef.current.scrollTo({ top: 0, behavior: "smooth" }); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const handleStart = () => { setPhase("block-transition"); trackEvent("TestStarted"); scrollTop(); };
  const handleBlockContinue = () => { setPhase("question"); trackEvent("BlockCompleted", { block: currentBlock + 1 }); scrollTop(); };

  const handleAnswer = (qId, ans) => { setAnswers(prev => { const next = { ...prev, [qId]: ans }; saveProgress({ answers: next, followUpAnswers, currentBlock, currentQuestionInBlock, phase: "question" }); return next; }); };
  const handleFollowUp = (fuKey, optKey) => { setFollowUpAnswers(prev => { const next = { ...prev, [fuKey]: optKey }; saveProgress({ answers, followUpAnswers: next, currentBlock, currentQuestionInBlock, phase: "question" }); return next; }); };

  const handleNext = () => {
    const isLastInBlock = currentQuestionInBlock >= block.questions.length - 1;
    const isLastBlock = currentBlock >= BLOCKS.length - 1;
    trackEvent("QuestionAnswered", { question: flatIndex + 1 });
    if (isLastInBlock && isLastBlock) { clearProgress(); setPhase("complete"); scrollTop(); return; }
    if (isLastInBlock) { const nb = currentBlock + 1; setCurrentBlock(nb); setCurrentQuestionInBlock(0); setPhase("block-transition"); saveProgress({ answers, followUpAnswers, currentBlock: nb, currentQuestionInBlock: 0, phase: "block-transition" }); }
    else { const nq = currentQuestionInBlock + 1; setCurrentQuestionInBlock(nq); saveProgress({ answers, followUpAnswers, currentBlock, currentQuestionInBlock: nq, phase: "question" }); }
    scrollTop();
  };

  const handleBack = () => { if (currentQuestionInBlock > 0) { setCurrentQuestionInBlock(prev => prev - 1); scrollTop(); } else if (currentBlock > 0) { setCurrentBlock(prev => prev - 1); setCurrentQuestionInBlock(BLOCKS[currentBlock - 1].questions.length - 1); scrollTop(); } };

  const isLastQuestion = currentBlock === BLOCKS.length - 1 && currentQuestionInBlock === block.questions.length - 1;

  return (
    <>
      <style>{css}</style>
      <div className="test-app" ref={appRef}>
        <CookieConsentBanner onConsent={handleConsent} />
        {sessionPopup && <SessionPopup type={sessionPopup} onContinue={handleSessionContinue} onRestart={handleSessionRestart} />}
        {phase === "intro" && <IntroScreen onStart={handleStart} />}
        {phase === "block-transition" && <BlockTransition block={block} onContinue={handleBlockContinue} isFirst={currentBlock === 0} />}
        {phase === "question" && currentQuestion && (
          <QuestionCard question={currentQuestion} questionIndex={flatIndex} totalQuestions={totalQuestions} answers={answers} followUpAnswers={followUpAnswers} onAnswer={handleAnswer} onFollowUp={handleFollowUp} onNext={handleNext} onBack={handleBack} isLast={isLastQuestion} />
        )}
        {phase === "complete" && <CompleteScreen answers={answers} followUpAnswers={followUpAnswers} />}
        {phase !== "intro" && phase !== "block-transition" && (
          <div className="footer-links">
            <a href="https://florian-lingner.ch/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
            <a href="https://florian-lingner.ch/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
          </div>
        )}
      </div>
    </>
  );
}
