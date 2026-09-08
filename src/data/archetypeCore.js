/* ═══════════════════════════════════════════════════════════════════════════
   ⚠  ZWILLINGSDATEI  -  liegt IDENTISCH in BEIDEN Repos:

       Florinho34/unfuck-typ-test           →  src/data/archetypeCore.js
       Florinho34/Website-FL-Personenmarke  →  src/data/archetypeCore.js

   Hier stehen ausschliesslich die Texte, die BEIDE Seiten zeigen:
   der Teaser im Test und die ausfuehrliche Auswertung auf /dein-ergebnis.

   JEDE Textaenderung immer in BEIDEN Repos machen, sonst zeigen Teaser und
   Detailseite verschiedene Texte - und niemand merkt es, weil beide fuer sich
   plausibel aussehen. Beim Aendern ARCHETYPE_COPY_VERSION hochzaehlen; dann
   genuegt ein Blick auf eine einzige Zeile, um zu sehen, ob die beiden
   Dateien auseinandergelaufen sind.

   NICHT hier hinein gehoeren:
   - Potenzial-Analyse, Reintyp-Texte, Mischtyp-Texte, Dimensionstexte
     → nur auf der Detailseite, also nur im Haupt-Repo
   - ctaText, label, labelFuer
     → nur im Test
   - der Bildpfad
     → die Repos legen ihre Bilder unterschiedlich ab. Hier steht nur der
       Dateiname; das Praefix setzt jedes Repo selbst (Test "/",
       Hauptseite "/images/").

   Fettungen als **doppelte Sternchen**. Beide Seiten rendern sie identisch.
   ═══════════════════════════════════════════════════════════════════════════ */

export const ARCHETYPE_COPY_VERSION = "2026-09-08";

export const ARCHETYPE_CORE = {
  zuschauer: {
    name: "Der Zuschauer",
    dativ: "Zuschauer",
    avatarFile: "Archetypen-Zuschauer.png",
    tagline: "Dein scharfer Verstand ist ein Segen - und genau der steht dir im Weg.",
    wahrheit: [
      "Deine Beobachtungsgabe ist messerscharf. Du durchschaust Situationen, Menschen und Zusammenhänge, während andere noch nicht mal wissen, welche Frage sie zuerst stellen sollen. **Diese Klarheit ist wertvoll und selten**.",
      "Aber Erkennen ist nicht Handeln. Genau da liegt dein Haken: Du siehst Dinge, die andere übersehen, und hast dadurch einen Vorsprung, theoretisch. Denn solange die Erkenntnis nur in deinem Kopf bleibt, **verändert sie in deinem Leben genau nichts**.",
    ],
    falle: "Du analysierst im Kreis und **verwechselst Erkenntnis mit Fortschritt**. Jeder Tag, an dem du nur verstehst statt zu handeln, macht den nächsten Schritt nicht leichter, sondern schwerer.",
  },

  getriebener: {
    name: "Der Getriebene",
    dativ: "Getriebenen",
    avatarFile: "Archetypen-Getriebener.png",
    tagline: "Deine Power ist beeindruckend - nur setzt du sie aktuell wahrscheinlich für das Erreichen von Zielen ein, die du dir nicht wirklich unbeeinflusst selbst gesetzt hast.",
    wahrheit: [
      "Du bist ein Macher. Wo andere zögern, lieferst du. Deine Disziplin, deine Belastbarkeit, dein Durchhaltevermögen, das ist selten, und es hat dich weit gebracht. **Auf dich ist Verlass**.",
      "Nur: **Bewegung ist nicht dasselbe wie Richtung**. Du funktionierst, aber irgendwann hat sich die Frage verschoben von „Will ich das?“ zu „Wie schaffe ich das?“. Und solange du in Bewegung bleibst, musst du dir die erste Frage nicht stellen.",
    ],
    falle: "Du bist so beschäftigt mit Funktionieren, dass du gar nicht merkst, wie weit du dich von dir selbst entfernt hast. Noch mehr Leistung bringt dich diesem Punkt nicht näher, **sie bringt dich weiter weg**.",
  },

  idealist: {
    name: "Der Idealist",
    dativ: "Idealisten",
    avatarFile: "Archetypen-Idealist.png",
    tagline: "Du willst die Welt besser machen - und vergisst dabei den Einen, der dich am dringendsten braucht: dich.",
    wahrheit: [
      "Du spürst, was auf der Welt schiefläuft. Ungerechtigkeit, Oberflächlichkeit, der Zustand der Welt, das perlt an dir nicht ab, das geht dir nah. Dieser Wertekompass ist echt und tief, und ehrlich gesagt **bräuchte die Welt mehr Menschen wie dich**.",
      "Dein Weltschmerz erzeugt ein Gewicht auf deinen Schultern, das dich langsam auffrisst. Du gibst deine Energie nach außen, an Themen, an andere, an das große Ganze, bis für dich selbst nichts mehr übrig ist. Das Paradoxe: Du hast ein gutes Gespür dafür, wie man Umstände besser machen kann, **außer bei deinem eigenen Leben**.",
    ],
    falle: "Dein Gerechtigkeitssinn ist ehrenvoll, aber wenn du dich von ihm zu unbewusst antreiben lässt, kann er sich gegen dich richten. **Großes ändern beginnt dennoch im Kleinen. Bei dir**.",
  },

  suchender: {
    name: "Der Suchende",
    dativ: "Suchenden",
    avatarFile: "Archetypen-Suchende.png",
    tagline: "Deine Neugier ist ein Geschenk - nur suchst du im Außen, was längst in dir liegt.",
    wahrheit: [
      "Du gibst dich nicht mit der Oberfläche zufrieden. Dein Wissensdurst, deine Offenheit, dein Gespür dafür, wenn etwas nicht stimmt, **das ist ein echtes Talent**. Die meisten stellen die Fragen gar nicht erst, die du dir längst stellst.",
      "Nur: Zufrieden macht es dich nicht. Du hast schon vieles probiert, Bücher, Podcasts, Methoden, Ansätze. Manches hat kurz resoniert, aber nichts hat wirklich gehalten. Das liegt nicht daran, dass du sprunghaft bist. Es liegt daran, dass die Antwort, die du im nächsten Impuls suchst, **dort gar nicht warten kann**.",
    ],
    falle: "Du verwechselst Bewegung mit Fortschritt. Es liegt nicht an den Methoden. Es liegt daran, dass du nie lange genug an einer Stelle gräbst, um auf Gold zu stoßen. Es gibt hierfür eine Lösung, doch **sie liegt nicht im Außen, sondern in dir**.",
  },

  klarsichtiger: {
    name: "Der Klarsichtige",
    dativ: "Klarsichtigen",
    avatarFile: "Archetypen-Klarsichtiger.png",
    tagline: "Du bist weiter als die meisten - und genau das ist dein blinder Fleck.",
    wahrheit: [
      "Machen wir uns nichts vor: Du hast an dir gearbeitet wie kaum jemand. Du reflektierst, du führst dich selbst, du kommst ins Handeln, und du erkennst Muster, bei dir und bei anderen, mit einer Klarheit, die beeindruckend ist. Du bist bereits weiter gekommen, **als die meisten je werden**.",
      "Und genau da liegt die versteckte Gefahr. Denn wer viel verstanden hat, hört irgendwann auf, sich zu hinterfragen: „das ist mir schon bewusst“. Zwischen Klarsehen und konsequent-danach-leben bleibt eine letzte Lücke. **Klein, aber hartnäckig**.",
    ],
    falle: "Klarsehen fühlt sich für dich an wie Ankommen. Zu wissen, wie es geht, ist nicht dasselbe, wie es zu leben, und die letzten Meter gehen die wenigsten, **gerade weil sie sich schon am Ziel wähnen**.",
  },
};

/* Feste Reihenfolge der Archetypen. Der Ergebnis-Token kodiert Primaer- und
   Sekundaertyp als Index 0-4 auf genau diese Liste. Reihenfolge NIE aendern -
   alle bereits verschickten Links wuerden falsche Archetypen anzeigen. */
export const ARCHETYPE_ORDER = ["zuschauer", "getriebener", "idealist", "suchender", "klarsichtiger"];

/* Feste Reihenfolge der zehn Dimensionen. Der Token kodiert die Werte als
   Array in genau dieser Reihenfolge. Ebenfalls nie aendern. */
export const CORE_SCALES = ["REF", "SL", "ML", "OL", "ETH", "WS", "NAT", "EX", "EF", "HA"];
