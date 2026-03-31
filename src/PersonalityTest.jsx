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
    scenario: "Ein guter Freund sagt dir ehrlich, dass du dich in letzter Zeit verändert hast – und nicht zum Positiven. Wie reagierst du?",
    options: [
      { key: "A", text: "Ich höre zu und denke ernsthaft darüber nach, auch wenn es wehtut.", scoring: { REF: 2, ML: 2 } },
      { key: "B", text: "Ich nehme es zur Kenntnis, aber innerlich denke ich: So schlimm wird's schon nicht sein.", scoring: { SL: 1, EF: 1 } },
      { key: "C", text: "Ich höre es mir offen an und schätze es. Solches Feedback ist selten. Wenn ich ehrlich reflektiere und etwas wiederfinde, arbeite ich gern daran.", scoring: { REF: 2, SL: 2, HA: 1 } },
      { key: "D", text: "Ich sage nichts, lächle – und denke dennoch den ganzen Abend darüber nach.", scoring: { REF: 1, SL: -1, ML: 2, HA: -1 } },
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
    scenario: "Du merkst, dass in deinem Umfeld etwas schiefläuft, aber niemand spricht es an. Was tust du?",
    options: [
      { key: "A", text: "Ich analysiere die Situation genau – aber letztlich spreche ich es nicht an, weil es zu Konflikten führen könnte.", scoring: { REF: 2, ML: 2, HA: -2 } },
      { key: "B", text: "Ich handle, denn einer muss es ja ansprechen. Mir fällt es leichter als den meisten.", scoring: { ETH: 1, HA: 3 } },
      { key: "C", text: "Ich sehe das Problem, aber ich finde, es ist nicht meine Aufgabe, es anzusprechen. Die Leute müssen selbst drauf kommen.", scoring: { ETH: 1, WS: 1, EX: 2, HA: -1 } },
      { key: "D", text: "Ich überlege gründlich, ob ich das Problem sehe, weil das eigentlich mein Thema ist. Und wenn nicht, frage ich mich, ob es überhaupt in meiner Verantwortung liegt, das anzusprechen – wenn ja, tue ich das auch.", scoring: { REF: 2, SL: 1, HA: 2 } },
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
      { key: "D", text: "Ich spüre eigentlich schon länger, was richtig wäre – aber die Umsetzung ist das Problem.", scoring: { REF: 1, ML: 2, HA: -2 } },
    ],
  },
  {
    id: 5,
    title: "🔁 DAS MUSTER",
    scenario: "Ein Kollege kritisiert deine Arbeit vor dem ganzen Team. Was passiert in dir?",
    options: [
      { key: "A", text: "Ich reagiere professionell, aber innerlich wühlt es mich emotional auf. Ich lasse mir dennoch nichts anmerken.", scoring: { REF: 1, SL: -1, ML: 1, EF: 1 } },
      { key: "B", text: "Ich nehme es an, auch wenn's unangenehm ist. Wenn was dran ist, will ich das wissen – wenn nicht, prallt es ab.", scoring: { REF: 1, SL: 2, HA: 1 } },
      { key: "C", text: "Es trifft mich, und ich brauche eine Weile, bis ich mich davon erholt habe.", scoring: { SL: -2, ML: 2, HA: -1 } },
      { key: "D", text: "Ich verspüre sofort Druck, werde nervös und versuche mich zu rechtfertigen – auch wenn ich gar nicht muss.", scoring: { SL: -2, ML: 1, OL: 2, HA: -1 } },
    ],
  },
  {
    id: 6,
    title: "🗣️ DIE INNERE STIMME",
    scenario: "Wenn du an die letzten 5 Jahre zurückdenkst – was überwiegt?",
    options: [
      { key: "A", text: "Ich habe viel gelernt, aber an der Umsetzung scheitert es aktuell noch.", scoring: { REF: 2, ML: 3, HA: -2 } },
      { key: "B", text: "Overall habe ich das getan, was von mir erwartet wurde – und es lief ganz gut.", scoring: { EF: 2, HA: 1 } },
      { key: "C", text: "Ich habe viel ausprobiert, aber wohl noch nicht den richtigen Weg für mich gefunden.", scoring: { OL: 3, SL: -1 } },
      { key: "D", text: "Ich habe bewusste Entscheidungen getroffen, dazugelernt, mich entwickelt und bin zufriedener als vorher.", scoring: { REF: 1, SL: 2, HA: 2 } },
    ],
  },
  {
    id: 7,
    title: "❓ DEIN WARUM",
    scenario: "Warum machst du diesen Test?",
    options: [
      { key: "A", text: "Ich hoffe, dass er mir hilft zu verstehen, was in meinem Leben fehlt.", scoring: { ML: 1, OL: 2 } },
      { key: "B", text: "Weil Freunde oder jemand aus meinem Umfeld ihn gemacht haben und meinten, ich sollte es auch mal probieren.", scoring: { EF: 2, HA: -1 } },
      { key: "C", text: "Weil mich ehrliches Feedback über mich selbst interessiert – auch wenn's unbequem wird.", scoring: { REF: 1, SL: 1, HA: 1 } },
      { key: "D", text: "Aus Neugier – ich analysiere gerne, wie ich ticke. Ob ich dann wirklich was damit mache, ist eine andere Frage.", scoring: { REF: 2, ML: 2, HA: -1 } },
    ],
  },
  // ── BLOCK 2: Ethik, Werte & Weltbild ──
  {
    id: 8,
    title: "🤷 DER WIDERSPRUCH",
    scenario: "Du erfährst, dass ein Unternehmen, dessen Produkte du liebst, unter fragwürdigen Bedingungen produziert. Was machst du?",
    options: [
      { key: "A", text: "Ich recherchiere und bilde mir ein eigenes Urteil, bevor ich handle. Wenn es stimmt, ziehe ich Konsequenzen.", scoring: { REF: 2, ETH: 2, HA: 2 } },
      { key: "B", text: "Ich boykottiere sofort – selbst wenn nur ein bisschen dran ist, so etwas kann ich nicht unterstützen.", scoring: { ETH: 3, WS: 1, EX: 1, HA: 1 } },
      { key: "C", text: "Ich finde es schlimm, aber mein Verhalten als Einzelner wird ja nichts ändern.", scoring: { ML: 2, EX: 1, HA: -1 } },
      { key: "D", text: "Ich find's nicht gut, aber am Ende kaufe ich trotzdem, was mir gefällt – man kann ja nicht bei allem das Gewissen einschalten.", scoring: { SL: 1, EF: 1 } },
    ],
  },
  {
    id: 9,
    title: "🔥 DIE DEBATTE",
    isCore: true,
    scenario: "In einer Diskussion über ein kontroverses Thema – was beschreibt dich am besten?",
    options: [
      { key: "A", text: "Ich habe klare Überzeugungen und vertrete sie auch.", scoring: { ETH: 2, WS: 1, EX: 1, HA: 1 } },
      { key: "B", text: "Ich halte mich meistens raus – Diskussionen ändern selten etwas.", scoring: { ML: 2, HA: -2 } },
      { key: "C", text: "Ich versuche beide Seiten ehrlich zu verstehen, bilde mir dann eine Meinung – und stehe auch dazu.", scoring: { REF: 2, SL: 1, ETH: 1, HA: 1 } },
      { key: "D", text: "Ich passe meine Position manchmal an, je nachdem mit wem ich rede.", scoring: { SL: -1, EF: 2 } },
    ],
  },
  {
    id: 10,
    title: "🌐 DAS WELTBILD",
    scenario: "Du scrollst durch Instagram und siehst einen Beitrag über Massentierhaltung, Kinderarbeit oder Umweltzerstörung. Dein Impuls?",
    options: [
      { key: "A", text: "Ich versuche einzuordnen, was davon ist Meinung, was Fakt – mich interessiert die Wahrheit dahinter.", scoring: { REF: 2 } },
      { key: "B", text: "Es macht mich wütend. Die Welt braucht dringend mehr Menschen, die aufstehen und etwas verändern.", scoring: { ETH: 1, WS: 3, EX: 1 } },
      { key: "C", text: "Ich merke, dass ich abgestumpft bin – es gibt einfach zu viele schlechte Nachrichten.", scoring: { SL: -1, ML: 1, HA: -1 } },
      { key: "D", text: "Ich versuche, Medien bewusst und dosiert zu konsumieren. Ich will zwar grundlegend informiert sein, aber lasse mich davon nicht runterziehen.", scoring: { REF: 1, SL: 1, HA: 1 } },
    ],
  },
  {
    id: 11,
    title: "🪞 DER SPIEGEL",
    scenario: "Du begegnest einem Menschen, der dich an Eigenschaften erinnert, die du an dir selbst nicht magst. Was passiert?",
    options: [
      { key: "A", text: "Ich erkenne Parallelen zu mir und das bringt mich zum Nachdenken, ob ich nicht doch etwas ändern sollte.", scoring: { REF: 2, ML: 1 } },
      { key: "B", text: "Das macht nichts mit mir. Ich versuche, darüber hinwegzusehen.", scoring: { REF: -1, EF: 1 } },
      { key: "C", text: "Ich lasse das so stehen. Ich bin mir bewusst, dass wenn mich etwas an anderen triggert, das meistens mehr über mich aussagt als über die Person.", scoring: { REF: 3, SL: 1 } },
      { key: "D", text: "Ich erkenne selten meine eigenen Verhaltensmuster in anderen. Doch wenn jemand Eigenschaften hat, die ich nicht schätze, ist er mir meist unsympathisch.", scoring: { HA: -1 } },
    ],
  },
  {
    id: 12,
    title: "🌎 DIE VERANTWORTUNG",
    scenario: "Wenn es um die großen Probleme der Welt geht – Klima, Ungerechtigkeit, Kriege – wie stehst du dazu?",
    options: [
      { key: "A", text: "Auch wenn es mich emotional runterzieht, versuche ich einfach, meinen Teil beizutragen und ein guter Mensch zu sein.", scoring: { ML: 1, ETH: 1, WS: 1, HA: 1 } },
      { key: "B", text: "Es macht mich sauer. Es kann doch nicht sein, dass alle einfach nur zuschauen.", scoring: { ETH: 2, WS: 3, EX: 2 } },
      { key: "C", text: "Ich versuche, rational zu bleiben und meinen Teil beizutragen, wo es sinnvoll ist.", scoring: { REF: 1, ETH: 1, HA: 1 } },
      { key: "D", text: "Ich versuche, meinen Teil beizutragen, ohne mich von den großen Problemen lähmen zu lassen – und ohne mich dafür schuldig zu fühlen, dass ich trotzdem mein Leben lebe.", scoring: { REF: 1, SL: 1, ETH: 1, HA: 1 } },
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
      { key: "C", text: "Ein kluges Gleichgewicht: Freiheit, aber mit Verantwortung. Strukturen, die funktionieren, ohne Menschen zu bevormunden.", scoring: { REF: 2, ETH: 2, HA: 1 } },
      { key: "D", text: "Gemeinschaft. Weniger Ego, mehr Miteinander – die Gesellschaft muss zusammenhalten.", scoring: { ETH: 1, WS: 1, NAT: 1 } },
    ],
  },
  // ── BLOCK 3: Handlung, Antrieb & Stillstand ──
  {
    id: 15,
    title: "⚙️ DIE GEWOHNHEIT",
    scenario: "Wenn du ehrlich bist: Wie viel von deinem Alltag basiert auf bewussten Entscheidungen – und wie viel läuft auf Autopilot?",
    options: [
      { key: "A", text: "Vieles läuft automatisch – aber das ist auch okay so. Man kann nicht alles hinterfragen und es funktioniert.", scoring: { REF: 1, EF: 1 } },
      { key: "B", text: "Ich mache mir darüber ehrlich gesagt wenig Gedanken. Mein Alltag ist halt wie er ist.", scoring: { REF: -1, EF: 1 } },
      { key: "C", text: "Ich hinterfrage regelmäßig, ob das, was ich tue, noch zu mir passt – und versuche es zu ändern, wenn nicht.", scoring: { REF: 2, SL: 1, HA: 2 } },
      { key: "D", text: "Ich arbeite hart und funktioniere – aber ob ich bewusst lebe, weiß ich ehrlich gesagt nicht.", scoring: { EF: 2, HA: 1 } },
    ],
  },
  {
    id: 16,
    title: "🚀 DAS PROJEKT",
    scenario: "Du hast eine Idee, die dich begeistert. Was passiert als Nächstes?",
    options: [
      { key: "A", text: "Ich denke lange darüber nach, plane im Kopf, aber meist starte ich nie wirklich.", scoring: { REF: 2, ML: 4, HA: -3 } },
      { key: "B", text: "Ich springe sofort rein – Energie ist da, der Rest ergibt sich. Oder auch nicht.", scoring: { HA: 2 } },
      { key: "C", text: "Ich ziehe es fast immer durch. Wird sich schon zeigen, ob es das Richtige ist. Aufgeben ist keine Option.", scoring: { EF: 1, HA: 2 } },
      { key: "D", text: "Ich starte, wenn es sich richtig anfühlt, und ziehe es durch – mit Pausen, aber ohne den Faden zu verlieren.", scoring: { REF: 1, SL: 1, HA: 3 } },
    ],
  },
  {
    id: 17,
    title: "🐴 EIN GUTES PFERD...",
    isCore: true,
    scenario: "Was hält dich am ehesten davon ab, dein Leben zu verändern?",
    options: [
      { key: "A", text: "Die Angst, das Falsche zu tun.", scoring: { SL: -1, ML: 2, HA: -2 } },
      { key: "B", text: "Ich glaube, ich habe mich an meinen Status quo zu sehr gewöhnt.", scoring: { ML: 1, EF: 2, HA: -1 } },
      { key: "C", text: "Ehrlich? Nicht viel. Wenn ich merke, dass etwas nicht stimmt, ändere ich es – auch wenn's dauert.", scoring: { SL: 2, HA: 2 } },
      { key: "D", text: "Ich ändere ständig etwas, aber es fühlt sich trotzdem an, als käme ich nicht wirklich voran.", scoring: { OL: 2, HA: 1 } },
    ],
  },
  {
    id: 18,
    title: "⏸️ DER STILLSTAND",
    scenario: "Du hast das Gefühl, auf der Stelle zu treten – nichts bewegt sich wirklich vorwärts. Was tust du?",
    options: [
      { key: "A", text: "Ich denke viel darüber nach, warum das so ist – und verstehe es meistens auch. Aber das ändert nichts.", scoring: { REF: 3, ML: 4, HA: -2 } },
      { key: "B", text: "Ich arbeite härter. Mit der richtigen Motivation kommen die Ergebnisse und Veränderungen von selbst.", scoring: { EF: 1, HA: 2 } },
      { key: "C", text: "Ich frage mich, ob ich vielleicht einfach noch nicht das Richtige gefunden habe – und schaue mich weiter um.", scoring: { OL: 2 } },
      { key: "D", text: "Ich schaue ehrlich hin, was blockiert – und setze dort an, auch wenn es unbequem ist.", scoring: { REF: 2, SL: 1, HA: 3 } },
    ],
  },
  {
    id: 19,
    title: "📱 DIE ABLENKUNG",
    scenario: "Wie gehst du mit Momenten um, in denen du dich leer oder orientierungslos fühlst?",
    options: [
      { key: "A", text: "Ich analysiere das Gefühl, versuche es zu verstehen – aber es bleibt trotzdem.", scoring: { REF: 2, ML: 3, HA: -1 } },
      { key: "B", text: "Ich suche nach dem nächsten Impuls – einem Buch, einem Podcast, einer neuen Richtung.", scoring: { OL: 2 } },
      { key: "C", text: "Ich such nach Beschäftigung – Sport, Arbeit, Social Media. Einfach irgendwas, das mich davon ablenkt.", scoring: { SL: -1, EF: 1, HA: 1 } },
      { key: "D", text: "Ich halte das Gefühl aus und lasse es da sein. Es geht vorbei – und meistens zeigt es mir etwas.", scoring: { REF: 1, SL: 2, NAT: 1, HA: 1 } },
    ],
  },
  {
    id: 20,
    title: "🤝 DIE HILFE",
    scenario: "Jemand aus deinem Umfeld steckt in einer schwierigen Phase und bittet dich um Rat. Was machst du?",
    options: [
      { key: "A", text: "Ich höre zu und gebe ehrliches Feedback – auch wenn es nicht das ist, was die Person hören will.", scoring: { REF: 2, SL: 1, ETH: 1, HA: 1 } },
      { key: "B", text: "Ich bin für die Person da, aber halte mich mit Ratschlägen zurück. Ich will nicht übergriffig sein.", scoring: { REF: 1, ML: 1, ETH: 1, HA: -1 } },
      { key: "C", text: "Ich helfe gerne und proaktiv – manchmal habe ich das Gefühl aber über's Ziel hinauszuschießen.", scoring: { ETH: 1, WS: 1, HA: 2 } },
      { key: "D", text: "Ich versuche zu helfen, aber merke, dass ich selbst nicht genug Stabilität habe, um andere aufzufangen.", scoring: { SL: -1, ML: 1, HA: -1 } },
    ],
  },
  {
    id: 21,
    title: "💰 DAS GELD",
    scenario: "Du gewinnst unerwartet 100.000€. Dein erster Gedanke?",
    options: [
      { key: "A", text: "Endlich Möglichkeiten! Reisen, Erfahrungen, all die Dinge, die ich mir immer gewünscht habe.", scoring: { OL: 1 } },
      { key: "B", text: "Investieren, absichern, klug anlegen. Das ist schließlich eine einmalige Sache, damit sollte ich besonnen umgehen.", scoring: { ML: 1, EF: 1 } },
      { key: "C", text: "Geld ist schön und gut, aber mir nicht so wichtig. Ein Teil wird definitiv gespendet.", scoring: { ETH: 2, WS: 1, NAT: 1 } },
      { key: "D", text: "Ich bremse meine Euphorie und wäge gründlich ab, was die sinnvollsten Verwendungszwecke sind.", scoring: { REF: 2, SL: 1, HA: 1 } },
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
    scenario: "Du siehst jemanden, der scheinbar genau das Leben lebt, das du dir wünschst.",
    options: [
      { key: "A", text: "Ich frage mich: Was hat diese Person, das ich nicht habe – und was müsste ich ändern?", scoring: { REF: 1, ML: 1 } },
      { key: "B", text: "Es motiviert mich – wenn die das kann, kann ich es auch.", scoring: { SL: 1, HA: 1 } },
      { key: "C", text: "Es sticht. Nicht aus Neid, sondern weil es mich daran erinnert, wo ich nicht bin.", scoring: { SL: -2, ML: 2, OL: 1 } },
      { key: "D", text: "Ich hinterfrage, ob dieses Leben wirklich so toll ist, wie es aussieht – und ob es überhaupt das ist, was ich wirklich will, oder nur das, was gerade attraktiv wirkt.", scoring: { REF: 3, SL: 1 } },
    ],
  },
  {
    id: 24,
    title: "🎭 DIE MASKE",
    scenario: "Wie oft zeigst du dich so, wie du wirklich bist – ohne Filter?",
    options: [
      { key: "A", text: "Ehrlich gesagt selten. Die meisten Menschen können damit nicht umgehen.", scoring: { REF: 2, SL: -1, ML: 2, HA: -1 } },
      { key: "B", text: "Ich zeige mich meistens so, wie ich bin. Verstellen kostet zu viel Energie.", scoring: { SL: 2, HA: 2 } },
      { key: "C", text: "Bei wenigen, ausgewählten Menschen – die haben mein Vertrauen erarbeitet.", scoring: { SL: 1, ETH: 1 } },
      { key: "D", text: 'Ich bin mir nicht sicher, was „wirklich ich" überhaupt bedeutet.', scoring: { OL: 1 } },
    ],
  },
  {
    id: 25,
    title: "💡 DER RAT",
    scenario: "Wenn du an dein jüngeres Ich denkst – was hättest du dir damals gewünscht zu wissen?",
    options: [
      { key: "A", text: "Hör auf, es allen recht machen zu wollen.", scoring: { EF: 2 } },
      { key: "B", text: "Dass man nicht alles perfekt durchdacht haben muss, bevor man loslegen darf.", scoring: { REF: 2, ML: 2, HA: -1 } },
      { key: "C", text: "Die Welt wird dich enttäuschen – aber gib nicht auf.", scoring: { ETH: 1, WS: 2, EX: 1 } },
      { key: "D", text: "Such nicht im Außen, was nur im Innen zu finden ist.", scoring: { REF: 1, SL: 2, NAT: 1 } },
    ],
  },
  {
    id: 26,
    title: "🤫 DIE STILLE",
    scenario: "Du hast einen komplett freien Tag – keine Verpflichtungen, keine Pläne. Was passiert?",
    options: [
      { key: "A", text: "Ich genieße es. Ich mache das, worauf ich Lust habe – oder auch einfach mal nichts.", scoring: { SL: 2, NAT: 1 } },
      { key: "B", text: "Ich fange an, Dinge zu erledigen, die liegen geblieben sind – Freizeit fühlt sich unproduktiv an.", scoring: { SL: -1, EF: 2, HA: 1 } },
      { key: "C", text: "Ich verbringe Zeit in der Natur, meditiere oder mache etwas, das mich wieder erdet.", scoring: { ETH: 1, NAT: 3 } },
      { key: "D", text: "Ich merke schnell, dass mir die Decke auf den Kopf fällt – und suche mir was zum Tun oder jemanden zum Treffen.", scoring: { SL: -1, EF: 1 } },
    ],
  },
  {
    id: 27,
    title: "🔄 DER NEUANFANG",
    scenario: "Jemand in deinem Umfeld gibt alles auf – Job, Beziehung, Stadt – und fängt komplett neu an. Dein erster Gedanke?",
    options: [
      { key: "A", text: "Respekt – aber ich frage mich, ob ich das jemals könnte.", scoring: { REF: 2, ML: 3, HA: -2 } },
      { key: "B", text: "Ich finde es mutig, aber auch riskant. Manche Dinge, die man sich lang aufgebaut hat, gibt man besser nicht auf.", scoring: { ML: 1, EF: 1 } },
      { key: "C", text: "Es inspiriert mich – und gleichzeitig macht es mir meine eigene Situation bewusster.", scoring: { OL: 1 } },
      { key: "D", text: "Stark. Ich gönne es der Person – und wenn bei mir so ein Schritt ansteht, traue ich mir das auch zu.", scoring: { SL: 2, HA: 1 } },
    ],
  },
  {
    id: 28,
    title: "🔮 DIE ERKENNTNIS",
    isCore: true,
    scenario: "Wie würdest du dein Verhältnis zu dir selbst beschreiben?",
    options: [
      { key: "A", text: "Ich habe mich lange nicht wirklich gekannt – und bin immer noch dabei, mich zu entdecken.", scoring: { REF: 1, OL: 1 } },
      { key: "B", text: "Ich kenne mich gut – vielleicht zu gut. Manchmal wünschte ich, ich könnte weniger sehen.", scoring: { REF: 3, ML: 3, WS: 1 } },
      { key: "C", text: "Ich kenne mich gut – nicht perfekt, aber gut genug, um gute Entscheidungen für mich zu treffen.", scoring: { REF: 2, SL: 2, HA: 1 } },
      { key: "D", text: "Ich habe mir bisher wenig Gedanken darüber gemacht – es lief auch so ganz okay.", scoring: { REF: -1, EF: 2 } },
    ],
  },
  {
    id: 29,
    title: "🔁 DAS WIEDERKEHRENDE MUSTER",
    scenario: "Du erkennst ein Muster, das dich immer wieder bremst. Was tust du?",
    options: [
      { key: "A", text: "Ich verstehe das Muster komplett, aber es zu durchbrechen schaffe ich trotzdem nicht. Es ist wie eine unsichtbare Mauer.", scoring: { REF: 2, ML: 3, HA: -2 } },
      { key: "B", text: "Ich nehme mir vor, es anders zu machen – und meistens ziehe ich das auch durch. Nicht perfekt, aber besser als vorher.", scoring: { REF: 2, SL: 1, HA: 2 } },
      { key: "C", text: "Ich bin nicht sicher, ob ich solche Muster überhaupt erkenne. Vielleicht bräuchte ich jemanden, der mir das spiegelt.", scoring: { OL: 1, HA: -1 } },
      { key: "D", text: "Ich ahne, dass da ein Muster ist – aber ich weiß noch nicht, wie ich es greifen oder ändern kann. Mir fehlt der Ansatzpunkt.", scoring: { REF: 1, ML: 1, OL: 1, HA: -1 } },
    ],
  },
  {
    id: 30,
    title: "🎯 DER KERN",
    scenario: "Was hat dich bis zur letzten Frage gebracht?",
    options: [
      { key: "A", text: "Neugier. Ich will verstehen, wie ich ticke.", scoring: { REF: 2 } },
      { key: "B", text: "Die Hoffnung, dass mir das hier etwas zeigt, das ich alleine nicht sehen kann.", scoring: { ML: 1, OL: 1 } },
      { key: "C", text: "Ich will an mir arbeiten – und dachte, vielleicht hilft das hier.", scoring: { HA: 2 } },
      { key: "D", text: "Eine Mischung aus Interesse und Spaß an der Sache. Ich bin gespannt, was rauskommt – ohne riesige Erwartungen.", scoring: { SL: 1, HA: 1 } },
    ],
  },
];

// ─── FOLLOW-UP QUESTIONS ────────────────────────────────────────────────────

const FOLLOW_UPS = {
  // F1 A → Differenzierung: Echte Reflexion vs. Abwehr
  "1A": {
    question: "Bezüglich deiner Antwort: Wie gehst du mit solchem Feedback um?",
    options: [
      { key: "1", text: "Ich weiß, dass Kritik von außen häufig mehr über die Leute selbst aussagt als über mich. Außerdem vertraue ich meiner Selbsteinschätzung.", scoring: { REF: 1, SL: 1 } },
      { key: "2", text: "Ehrlich gesagt: Es ist mir unangenehm und ich lasse dieses Feedback nicht wirklich an mich ran, weil ich keine Lust habe, mich damit zu beschäftigen.", scoring: { REF: -1, ML: 2, EF: 1, HA: -1 } },
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
      { key: "2", text: "Mir ist der Widerspruch bewusst, aber ich treffe die Entscheidung trotzdem bewusst – perfekt geht nicht.", scoring: { REF: 1, HA: 1 } },
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
    emoji: "🧠", text: "Viele Menschen spüren genau das. Psychologen nennen es „Status-quo-Bias": Die Tendenz, am Vertrauten festzuhalten – selbst wenn wir wissen, dass Veränderung besser wäre. Klingt erst mal wie Selbstbetrug – doch am Ende ist es ein tief eingebranntes neurologisches Muster.*",
    footnote: "*Samuelson & Zeckhauser (1988), Journal of Risk and Uncertainty" },
  { afterQ: 21, trigger: (ans) => ans[21]?.primary === "B",
    emoji: "💼", text: "Spannend: Dein erster Impuls geht Richtung Sicherheit. Weltweit sind nur 21% aller Arbeitnehmer wirklich engagiert bei dem was sie tun. 62% funktionieren. Vielleicht weil die meisten irgendwann angefangen haben, Sicherheit über Erfüllung zu stellen.*",
    footnote: "*Gallup State of the Global Workplace 2025 – 160+ Länder, Daten aus 2024" },
  { afterQ: 21, trigger: (ans) => ans[21]?.primary === "A",
    emoji: "✈️", text: "Du bevorzugst Freiheit und Erfahrungen über Absicherung – ein gutes Zeichen? Weltweit sind nur 21% der Arbeitnehmer tatsächlich engagiert in ihrem Job. 62% funktionieren nur.* Vielleicht, weil zu viele die Sicherheit über die persönliche Erfüllung gestellt haben.",
    footnote: "*Gallup State of the Global Workplace 2025 – 160+ Länder, Daten aus 2024" },
  { afterQ: 24, trigger: (ans) => ans[24]?.primary === "A",
    emoji: "🎭", text: "Sich nicht zu zeigen ist oft kein Zeichen von Schwäche – sondern ein gelernter Schutzmechanismus. Forschung zeigt: Selbstbewusste Menschen mit hoher interner Selbstwahrnehmung sind kreativer, treffen bessere Entscheidungen und sind nachweislich zufriedener.* Der erste Schritt zu einem „echteren" Leben? Ehrlich hinschauen – und genau das tust du gerade.",
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
  1: { headline: "Wie ehrlich bist du mit dir selbst?", sub: "Die nächsten Fragen zeigen, wie du denkst, fühlst und mit dir umgehst – wenn niemand zuschaut." },
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
    label: "Der Zuschauer",
    potenzial: "Der Weise",
    potenzialText: "Du siehst mehr als die meisten. Wenn du anfängst zu handeln statt nur zu verstehen, wirst du unaufhaltbar.",
    tagline: "Du siehst mehr als die meisten – aber du stehst am Rand deines eigenen Lebens.",
    description: "Du denkst viel, verstehst Zusammenhänge, analysierst. Während andere einfach machen, durchschaust du die Muster dahinter. Das Problem: Irgendwann ist Verstehen zum Ersatz für Leben geworden. Du weißt genau, was du ändern müsstest – aber zwischen Erkenntnis und Handlung liegt ein Graben, der jedes Jahr breiter wird. Das Gute: Deine Klarheit ist eine echte Stärke. Du musst nur lernen, sie als Startrampe zu nutzen statt als Aussichtsplattform.",
    pain: "Du analysierst dich im Kreis. Du weißt, was sich ändern müsste – aber du verwechselst Erkenntnis mit Fortschritt. Und jeder Tag, an dem du nicht handelst, macht den nächsten Schritt schwerer.",
    extra: "Dein größter Hebel: Eine einzige Handlung, die du seit Wochen aufschiebst. Nicht perfekt – einfach anfangen.",
  },
  getriebener: {
    label: "Der Getriebene",
    potenzial: "Der Macher",
    potenzialText: "Deine Energie ist deine Superkraft. Wenn du lernst, sie bewusst einzusetzen statt vor dir selbst wegzurennen, erreichst du alles.",
    tagline: "Du bist ständig in Bewegung – aber wer hat eigentlich das Ziel bestimmt?",
    description: "Du funktionierst. Zuverlässig, produktiv, immer beschäftigt. Von außen sieht das nach Disziplin und Erfolg aus. Aber dahinter steckt eine Vermeidungsstrategie: Solange du funktionierst, musst du nicht hinschauen. Manche Getriebene folgen einem Drehbuch, das andere geschrieben haben – und merken es nicht. In den ruhigen Momenten – wenn die Ablenkung wegfällt – ist da eine Unruhe, die du nicht benennen kannst. Das Gute: Dein Antrieb ist real. Deine Disziplin ist eine Stärke. Aber sie braucht ein Ziel, das wirklich deins ist.",
    pain: "Du bist so beschäftigt mit Funktionieren, dass du gar nicht merkst, wie weit du dich von dir selbst entfernt hast. Und die Stimme, die fragt ‚Ist das wirklich alles?', wird leiser, je mehr du sie übertönst.",
    extra: "Dein größter Hebel: Einen ganzen Abend lang nichts tun – und aushalten, was dann hochkommt.",
  },
  idealist: {
    label: "Der Idealist",
    potenzial: "Der Veränderer",
    potenzialText: "Dein Feuer für eine bessere Welt ist echt. Wenn du lernst, bei dir selbst anzufangen, statt die Welt zu reparieren, wird dein Impact riesig.",
    tagline: "Du spürst, was in der Welt schiefläuft – und es frisst dich auf.",
    description: "Ungerechtigkeit, Oberflächlichkeit, Zerstörung – du siehst es überall und es lässt dich nicht kalt. Diese Intensität ist selten und wertvoll. Aber sie hat eine Schattenseite: Deine Energie fließt in Wut, Frustration und Ohnmacht über Dinge, die du nicht kontrollieren kannst – und für dein eigenes Leben bleibt wenig übrig. Nicht weil du egoistisch wärst, sondern weil du nie gelernt hast, dass bei dir selbst anfangen kein Verrat an der Welt ist. Sondern die Voraussetzung.",
    pain: "Dein Gerechtigkeitssinn ist echt – aber er frisst dich auf. Du gibst so viel Energie an die Welt, dass für dich selbst nichts übrig bleibt. Und das Paradoxe: Genau dadurch veränderst du weniger, als du könntest.",
    extra: "Dein größter Hebel: Erkenne, dass Selbstfürsorge kein Egoismus ist – sondern die Voraussetzung, wirklich etwas zu bewegen.",
  },
  suchender: {
    label: "Der Suchende",
    potenzial: "Der Entdecker",
    potenzialText: "Deine Offenheit ist ein Geschenk. Wenn du lernst, tiefer zu gehen statt breiter, findest du, was du suchst.",
    tagline: "Du weißt, dass etwas fehlt – du weißt nur noch nicht, was.",
    description: "Du hast schon einiges probiert. Bücher, Podcasts, vielleicht Seminare. Manche Dinge haben kurz resoniert, aber nichts hat wirklich gehalten. Das liegt nicht daran, dass du sprunghaft bist – sondern daran, dass du intuitiv spürst, wenn etwas nicht echt ist. Das Problem ist nur: Du suchst die Antwort im Außen, während sie im Innen liegt. Der erste Schritt ist nicht die nächste Methode – sondern ehrlich hinschauen, warum keine bisherige gereicht hat.",
    pain: "Du springst von Impuls zu Impuls, von Methode zu Methode – und verwechselst Bewegung mit Fortschritt. Die unbequeme Wahrheit: Es liegt nicht an den Methoden. Es liegt daran, dass du nicht tief genug gräbst.",
    extra: "Dein größter Hebel: Hör auf, nach der nächsten Antwort zu suchen. Setz dich mit der Frage hin.",
  },
  klarsichtiger: {
    label: "Der Klarsichtige",
    potenzial: "Der Freie",
    potenzialText: "Du lebst bereits bewusster als die meisten. Dein nächster Schritt ist nicht mehr Erkenntnis – sondern ehrliche Tiefe und Umsetzung.",
    tagline: "Du siehst klarer als die meisten – jetzt geht's darum, danach zu leben.",
    description: "Du hast schon einiges verstanden. Du hinterfragst, reflektierst, lebst bewusster als viele in deinem Umfeld. Man kann mit dir über tiefere Themen sprechen, ohne dass du abblocken musst. Aber: Auch du hast blinde Flecken. Vielleicht die Tendenz, dich für weiter zu halten, als du bist. Oder die Schwierigkeit, dein Wissen konsequent in Handlung zu übersetzen. Klar sehen und danach leben – das sind zwei verschiedene Dinge. Du bist auf dem Weg. Aber der Weg hat noch Strecke.",
    pain: "Dein Wissen ist echt – aber es kann zur Falle werden. Du hältst dich manchmal für weiter, als du bist. Der Unterschied zwischen Wissen und Weisheit: Du brauchst keine Fakten mehr, um zu spüren, was richtig oder falsch ist. Aber dieses Spüren in echtes Handeln und Vertrauen zu übersetzen – genau daran darfst du noch arbeiten.",
    extra: "Dein größter Hebel: Sei ehrlich, wo du Erkenntnis noch als Fortschritt verkaufst – und wo dir die Umsetzung fehlt.",
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
    <svg viewBox="-75 -15 420 360" className="radar-svg">
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
  width: 100%; min-height: 100vh;
  background: var(--cream);
  color: var(--dark);
  font-family: 'Inter Tight', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.test-app { width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }

.intro-screen { width: 100%; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; text-align: center; animation: fadeUp 0.8s ease-out; }
.intro-screen .eyebrow { font-size: 0.72rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 1.5rem; font-weight: 500; }
.intro-screen h1 { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.9rem, 5.5vw, 3rem); font-weight: 900; line-height: 1.15; color: var(--dark); max-width: 600px; margin-bottom: 1.5rem; letter-spacing: -0.01em; }
.highlight { color: var(--orange); font-style: italic; font-weight: 900; }
.intro-screen .intro-sub { font-size: 0.95rem; font-weight: 400; color: var(--text-muted); max-width: 480px; line-height: 1.65; margin-bottom: 2.5rem; }
.intro-screen .intro-meta { font-size: 0.78rem; color: var(--warm-gray); margin-bottom: 1.5rem; font-weight: 400; letter-spacing: 0.02em; }

.btn-primary { background: var(--orange); color: #fff; border: none; padding: 1rem 2.5rem; font-family: 'Inter Tight', sans-serif; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.03em; cursor: pointer; transition: all 0.25s ease; }
.btn-primary:hover { background: var(--orange-hover); transform: translateY(-1px); }

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
.btn-back { background: none; border: none; font-family: 'Inter Tight', sans-serif; font-size: 0.82rem; color: var(--warm-gray); cursor: pointer; padding: 0.5rem 0; transition: color 0.2s; font-weight: 500; }
.btn-back:hover { color: var(--dark); }
.btn-next { background: var(--dark); color: var(--cream); border: none; padding: 0.85rem 2rem; font-family: 'Inter Tight', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.25s ease; letter-spacing: 0.02em; }
.btn-next:hover { background: var(--dark-soft); transform: translateY(-1px); }
.btn-next:disabled { opacity: 0.3; cursor: default; transform: none; }
.btn-finish { background: var(--orange); color: #fff; }
.btn-finish:hover { background: var(--orange-hover); }

.block-transition { width: 100%; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; text-align: center; animation: fadeUp 0.6s ease-out; }
.block-transition .block-num { font-family: 'Inter Tight', sans-serif; font-size: 5.5rem; color: var(--sand); margin-bottom: 0.75rem; font-weight: 900; line-height: 1; }
.block-transition h2 { font-family: 'Inter Tight', sans-serif; font-size: clamp(1.3rem, 4vw, 1.8rem); font-weight: 900; color: var(--dark); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
.block-transition .block-count { font-size: 0.78rem; color: var(--warm-gray); letter-spacing: 0.06em; margin-bottom: 2rem; font-weight: 400; }
.block-transition .answer-hint { max-width: 400px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 2.5rem; padding: 1.25rem 1.5rem; border-left: 2px solid var(--orange); text-align: left; }
.block-transition .answer-hint strong { color: var(--dark); font-weight: 700; }

.result-screen { width: 100%; display: flex; flex-direction: column; align-items: center; padding: 3rem 1.5rem 4rem; opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.result-screen.visible { opacity: 1; transform: translateY(0); }
.result-inner { width: 100%; max-width: 620px; display: flex; flex-direction: column; gap: 2.5rem; }
.result-header { text-align: center; }
.result-eyebrow { font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 0.75rem; font-weight: 500; }
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
.result-extra { font-size: 0.92rem; line-height: 1.65; color: var(--dark); padding: 1.25rem 1.5rem; border-left: 3px solid var(--dark); background: rgba(28, 28, 28, 0.03); font-weight: 500; }

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
.btn-cta { width: 100%; text-align: center; padding: 1.1rem 2.5rem; font-size: 0.95rem; font-weight: 700; letter-spacing: 0.02em; }
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
.core-badge { font-size: 0.72rem; font-weight: 700; color: var(--orange); letter-spacing: 0.06em; text-align: center; padding: 0.6rem 1rem; margin-bottom: 0.5rem; animation: fadeUp 0.3s ease-out; }
.question-title-core { color: var(--dark) !important; font-size: 0.85rem !important; font-weight: 800 !important; }

/* ─── MILESTONES ─── */
.milestone-bar { font-size: 0.75rem; color: var(--orange); font-weight: 600; text-align: center; padding: 0.5rem 1rem; font-style: italic; animation: fadeUp 0.4s ease-out; margin-bottom: 0.25rem; }

/* ─── COUNTDOWN TEASER ─── */
.countdown-teaser { margin-top: 1.5rem; text-align: center; padding: 1.25rem; border: 1.5px dashed var(--sand); animation: fadeUp 0.4s ease-out; }
.countdown-teaser-finetuning { border: 1.5px solid rgba(255, 77, 0, 0.25); background: rgba(255, 77, 0, 0.015); }
.countdown-teaser-title { font-size: 0.82rem; font-weight: 700; color: var(--dark); margin-bottom: 0.5rem; }
.countdown-teaser-sub { font-size: 0.75rem; color: var(--warm-gray); font-style: italic; margin-top: 0.25rem; }

/* ─── CALCULATING SCREEN ─── */
.calculating-overlay { text-align: center; padding: 2rem 1.5rem; animation: fadeUp 0.5s ease-out; }
.calculating-title { font-size: 0.92rem; font-weight: 800; color: var(--dark); margin-bottom: 0.5rem; }
.calculating-wheel-wrap { width: 56px; height: 56px; margin: 1.25rem auto 1rem; position: relative; }
.calculating-ring { position: absolute; inset: 0; border-radius: 50%; border: 2.5px solid var(--sand); border-top-color: var(--orange); animation: spinWheel 0.9s linear infinite; }
.calculating-ring-done { animation: none; border-color: var(--orange); }
.calculating-check { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0.5); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.calculating-check-visible { opacity: 1; transform: scale(1); }
.calculating-status { font-size: 1.05rem; font-weight: 700; transition: color 0.4s ease; }
.calculating-detail { display: flex; justify-content: center; gap: 12px; margin-top: 0.75rem; font-size: 0.7rem; color: var(--warm-gray); }
@keyframes spinWheel { to { transform: rotate(360deg); } }

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
}
`;

// ─── COMPONENTS ─────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }) {
  return (
    <div className="intro-screen">
      <div className="eyebrow">Dein Persönlichkeitstest</div>
      <h1>Was steht dir durch deine <span className="highlight">persönlichen Neigungen</span> im Weg?</h1>
      <p className="intro-sub">30 alltagsnahe Fragen, 10 Dimensionen, 5 Archetypen</p>
      <p className="intro-meta">~8 Minuten · anonym · Sofortergebnis</p>
      <button className="btn-primary" onClick={onStart}>Test starten</button>
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress-container">
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-info">
        <span>Frage {current} von {total}</span>
        <span className="progress-pct">{pct}%</span>
      </div>
    </div>
  );
}

function BlockTransition({ block, onContinue, isFirst }) {
  const narrative = BLOCK_NARRATIVES[block.id];
  return (
    <div className="block-transition">
      <div className="block-num">{block.id}</div>
      <h2>{narrative.headline}</h2>
      <p className="block-narrative-sub">{narrative.sub}</p>
      <p className="block-count">{block.questions.length} Fragen</p>
      <div className="answer-hint">
        {isFirst ? (
          <>
            <strong>So funktioniert's:</strong> Wähle pro Frage die Antwort, die am besten zu dir passt. Du kannst optional eine <strong>zweite Antwort</strong> wählen, die ebenfalls auf dich zutrifft – sie wird schwächer gewichtet, macht dein Ergebnis aber genauer. Wenn nur eine Antwort passt, reicht das völlig.
          </>
        ) : (
          <>
            Weiterhin gilt: Wähle die Antwort, die <strong>am ehesten auf dich zutrifft</strong>. Eine optionale Zweitantwort verfeinert dein Ergebnis – ist aber kein Muss.
          </>
        )}
      </div>
      <button className="btn-primary" onClick={onContinue}>Weiter</button>
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
      {showContour && <path d={contourPath} fill={activePoints >= 10 ? "rgba(255,77,0,0.06)" : "rgba(255,77,0,0.03)"} stroke={activePoints >= 10 ? "rgba(255,77,0,0.5)" : "rgba(255,77,0,0.2)"} strokeWidth="1" strokeDasharray={activePoints >= 10 ? "none" : "4 3"} />}
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

  const pct = Math.round(((questionIndex + 1) / totalQuestions) * 100);
  const milestone = MILESTONES[pct];
  const isCore = question.isCore;

  // Countdown teaser logic
  const qNum = questionIndex + 1;
  const remaining = totalQuestions - qNum;
  let teaserState = null;
  if (qNum >= 25 && qNum <= 26) teaserState = { activePoints: 2, showContour: false, title: "Dein Profil nimmt Form an...", sub: `Noch ${remaining} Fragen bis zu deinem Ergebnis` };
  else if (qNum >= 27 && qNum <= 28) teaserState = { activePoints: 6, showContour: true, title: "Dein Profil wird deutlicher...", sub: `Noch ${remaining} Fragen – gleich siehst du dein Ergebnis` };
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
    // Check for calculating screen on last question
    if (isLast) {
      setShowCalculating(true);
      return;
    }
    onNext();
  };

  if (showMicroFeedback) {
    return <MicroFeedbackCard feedback={showMicroFeedback} onDismiss={() => { setShowMicroFeedback(null); if (isLast) { setShowCalculating(true); } else { onNext(); } }} />;
  }

  if (showCalculating) {
    return (
      <div className="question-screen" style={{ justifyContent: "center", minHeight: "80vh" }}>
        <CalculatingOverlay onReady={onNext} />
      </div>
    );
  }

  return (
    <div className={`question-screen ${isCore ? "question-screen-core" : ""}`}>
      <ProgressBar current={questionIndex + 1} total={totalQuestions} />
      {isCore && <div className="core-badge">⚡ Kernfrage – Antwort besonders durchdacht und ehrlich.</div>}
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
        {teaserState && (
          <div className={`countdown-teaser ${teaserState.isFinetuning ? "countdown-teaser-finetuning" : ""}`}>
            <div className="countdown-teaser-title">{teaserState.title}</div>
            <CountdownRadar activePoints={teaserState.activePoints} showContour={teaserState.showContour} />
            {teaserState.sub && <div className="countdown-teaser-sub">{teaserState.sub}</div>}
          </div>
        )}
      </div>
      <div className="nav-row">
        <button className="btn-back" onClick={onBack}>{questionIndex === 0 ? "" : "← Zurück"}</button>
        <button className={`btn-next ${isLast ? "btn-finish" : ""}`} disabled={!canProceed} onClick={handleNext}>
          {teaserState?.isFinetuning ? "Jetzt zur abschließenden Frage →" : isLast ? "Test abschließen" : "Weiter →"}
        </button>
      </div>
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
  const [postPhase, setPostPhase] = useState("result");
  const [recognitionScore, setRecognitionScore] = useState(null);
  const [selectedPainPoint, setSelectedPainPoint] = useState(null);

  const scoring = computeScoring(answers, followUpAnswers);
  const meta = TYPE_META[scoring.resultType];

  useEffect(() => { const t = setTimeout(() => setAnimateIn(true), 100); return () => clearTimeout(t); }, []);
  useEffect(() => {
    trackEvent("TestCompleted", { archetype: scoring.resultType, archetype_label: meta.label, is_reintyp: scoring.isReintyp, margin: Math.round(scoring.margin) });
    saveResult({ answers, followUpAnswers, resultType: scoring.resultType });
  }, []);

  const sortedTypes = Object.entries(scoring.affinities).sort((a, b) => b[1] - a[1]);
  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const handleKeyDown = (e) => { if (e.key === "Enter") handleEmailSubmit(); };
  const REINTYP_TAG_ID = 17381951;

  const handleEmailSubmit = async () => {
    if (!firstName.trim()) { setEmailError("Bitte gib deinen Vornamen ein."); return; }
    if (!validateEmail(email)) { setEmailError("Bitte gib eine gültige E-Mail-Adresse ein."); return; }
    setEmailStatus("loading"); setEmailError("");
    const formId = KIT_FORM_IDS[scoring.resultType];
    try {
      const body = { api_key: KIT_API_KEY, email, first_name: firstName.trim(), fields: { recognition_score: recognitionScore !== null ? String(recognitionScore) : "", pain_point: selectedPainPoint || "", archetype: scoring.resultType } };
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
      const orange = [255, 77, 0], dark = [28, 28, 28], gray = [107, 101, 96], warmGray = [163, 155, 147];
      const bgResponse = await fetch("/Digitales-briefpapier.jpg");
      const bgBlob = await bgResponse.blob();
      const bgData = await new Promise((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.readAsDataURL(bgBlob); });
      doc.addImage(bgData, "JPEG", 0, 0, pw, ph);
      let y = 38;
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
      y = radarCy + radarR + 14;
      doc.setFontSize(6); doc.setTextColor(...orange); doc.setFillColor(...orange);
      doc.rect(pw / 2 - 35, y - 1.2, 4, 1.2, "F"); doc.text("Dein Profil", pw / 2 - 29, y, { align: "left" });
      doc.setTextColor(...warmGray); doc.setDrawColor(...warmGray); doc.setLineWidth(0.3);
      doc.line(pw / 2 + 5, y - 0.6, pw / 2 + 9, y - 0.6); doc.text(meta.label + "-Referenz", pw / 2 + 11, y, { align: "left" }); y += 14;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...dark);
      const descLines = doc.splitTextToSize(meta.description, 155);
      doc.text(descLines, pw / 2, y, { align: "center", lineHeightFactor: 1.6 }); y += descLines.length * 4.8 + 8;
      if (y < ph - 60) {
        doc.setFillColor(...orange); doc.rect(27, y - 1, 1.2, 28, "F");
        doc.setFillColor(255, 240, 235); doc.rect(29, y - 2, 154, 30, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...orange);
        doc.text("Daran scheiterst du gerade wahrscheinlich:", 32, y + 4);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...dark);
        const painLines = doc.splitTextToSize(meta.pain, 148); doc.text(painLines, 32, y + 11, { lineHeightFactor: 1.55 });
      }

      // Page 2
      doc.addPage(); doc.addImage(bgData, "JPEG", 0, 0, pw, ph); y = 38;
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...dark);
      doc.text("Deine Typ-Verteilung", pw / 2, y, { align: "center" }); y += 12;
      const sortedAffinities = Object.entries(scoring.affinities).sort((a, b) => b[1] - a[1]);
      sortedAffinities.forEach(([type, pct]) => {
        const isMain = type === scoring.resultType;
        doc.setFont("helvetica", isMain ? "bold" : "normal"); doc.setFontSize(9); doc.setTextColor(...dark); doc.text(TYPE_META[type].label, 30, y);
        doc.setFillColor(232, 224, 216); doc.rect(80, y - 2.5, 75, 4, "F");
        const barW = Math.max((pct / 100) * 75, 2);
        if (isMain) doc.setFillColor(...orange); else doc.setFillColor(...warmGray);
        doc.rect(80, y - 2.5, barW, 4, "F");
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...gray); doc.text(pct + "%", 170, y, { align: "right" }); y += 9;
      }); y += 8;
      doc.setFillColor(245, 243, 240); doc.rect(27, y - 2, 156, 22, "F");
      doc.setFillColor(...dark); doc.rect(27, y - 2, 1.2, 22, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...dark);
      const extraLines = doc.splitTextToSize(meta.extra, 148); doc.text(extraLines, 32, y + 5, { lineHeightFactor: 1.5 }); y += 30;

      y += 10;
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...dark);
      const ctaTitle = "DEINE KOSTENLOSE " + meta.label.toUpperCase().replace("DER ", "").replace("DIE ", "") + "-MASTERCLASS";
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
          <div className="result-type-label">{meta.label}</div>
          <div className="result-tagline">{meta.tagline}</div>
        </div>
        <div className="potenzial-box">
          <div className="potenzial-eyebrow">Dein Potenzial-Gegenstück</div>
          <div className="potenzial-label">{meta.potenzial}</div>
          <div className="potenzial-text">{meta.potenzialText}</div>
        </div>
        <div className="radar-container">
          <RadarChart normalized={scoring.normalized} resultType={scoring.resultType} />
          <div className="radar-legend">
            <div className="legend-item"><span className="legend-dot user" /> Dein Profil</div>
            <div className="legend-item"><span className="legend-dot type" /> {meta.label}-Referenz</div>
          </div>
        </div>
        <div className="result-description">{meta.description}</div>
        <div className="result-pain"><div className="pain-label">Daran scheiterst du gerade wahrscheinlich:</div><p>{meta.pain}</p></div>
        <div className="result-affinities">
          <div className="affinities-label">Deine Typ-Verteilung</div>
          {sortedTypes.map(([type, pct]) => (
            <div className="affinity-row" key={type}>
              <span className="affinity-name">{TYPE_META[type].label}</span>
              <div className="affinity-bar-track"><div className="affinity-bar-fill" style={{ width: `${pct}%`, background: type === scoring.resultType ? "var(--orange)" : "var(--warm-gray)" }} /></div>
              <span className="affinity-pct">{pct}%</span>
            </div>
          ))}
        </div>
        <div className="result-extra">{meta.extra}</div>
        <div className="pdf-save-section">
          <p className="pdf-save-hint">Speichere dein Ergebnis als PDF – inkl. Radar-Chart und personalisierten Impulsen.</p>
          <button className="btn-pdf-download" onClick={generatePDF} disabled={pdfLoading}>{pdfLoading ? "PDF wird erstellt..." : "Ergebnis als PDF speichern"}</button>
        </div>
        {postPhase === "result" && (
          <div className="recognition-box">
            <div className="recognition-box-title">Wie gut erkennst du dich in diesem Ergebnis wieder?</div>
            <div className="recognition-scale">
              {[1,2,3,4,5].map(n => (<button key={n} className={`recognition-btn ${recognitionScore === n ? "recognition-selected" : ""}`} onClick={() => { setRecognitionScore(n); setTimeout(() => setPostPhase("painpoint"), 400); }}>{n}</button>))}
            </div>
            <div className="recognition-labels"><span>Gar nicht</span><span>Sehr</span></div>
          </div>
        )}
        {postPhase === "painpoint" && (
          <div className="postq-screen">
            <div className="postq-eyebrow">Noch eine Frage</div>
            <div className="postq-title">Was beschreibt deine aktuelle Situation am besten?</div>
            <div className="postq-subtitle">Wähle den Satz, der am ehesten auf dich zutrifft.</div>
            <div className="painpoint-options">
              {(PAIN_POINTS[scoring.resultType] || []).map((pp, i) => (
                <button key={i} className={`painpoint-btn ${selectedPainPoint === pp ? "painpoint-selected" : ""}`} onClick={() => { setSelectedPainPoint(pp); setTimeout(() => setPostPhase("signup"), 400); }}>{pp}</button>
              ))}
            </div>
          </div>
        )}
        {postPhase === "signup" && (
          <div className="postq-screen signup-solo">
            {emailStatus === "success" ? (
              <div className="cta-success">
                <div className="success-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
                <div className="success-title">Drin.</div>
                <p className="success-sub">Check deine Inbox – deine <strong>{meta.label}-Masterclass</strong> wartet auf dich.</p>
              </div>
            ) : (
              <>
                <div className="signup-solo-header">
                  <div className="postq-eyebrow">Dein nächster Schritt</div>
                  <div className="postq-title">Deine kostenlose {meta.label.replace("Der ", "").replace("Die ", "")}-Masterclass</div>
                  <p className="signup-solo-text">Ich habe <strong>genau für deinen Archetyp</strong> eine eigene <strong>kostenlose Masterclass</strong> entwickelt – kein Motivationsgelaber, sondern ein ehrlicher Blick auf das, was dich gerade blockiert. Und wie du den ersten echten Schritt raus machst.</p>
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
        )}
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
        <div className="footer-links">
          <a href="https://florian-lingner.ch/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutz</a>
          <a href="https://florian-lingner.ch/impressum" target="_blank" rel="noopener noreferrer">Impressum</a>
        </div>
      </div>
    </>
  );
}
