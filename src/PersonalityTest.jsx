import { useState, useEffect, useRef, useCallback } from "react";
import { jsPDF } from "jspdf";

// ─── DATA ───────────────────────────────────────────────────────────────────────

const BLOCKS = [
  { id: 1, title: "Reflexion & Selbstwahrnehmung", questions: [1,2,3,4,5,6,7] },
  { id: 2, title: "Ethik, Werte & Weltbild", questions: [8,9,10,11,12,13,14] },
  { id: 3, title: "Handlung, Antrieb & Stillstand", questions: [15,16,17,18,19,20,21] },
  { id: 4, title: "Identität & Tiefenstruktur", questions: [22,23,24,25,26,27,28] },
];

const QUESTIONS = [
  {
    id: 1,
    title: "DAS FEEDBACK",
    scenario: "Ein guter Freund sagt dir ehrlich, dass du dich in letzter Zeit verändert hast – und nicht zum Positiven. Wie reagierst du?",
    options: [
      { key: "A", text: "Ich höre zu und denke ernsthaft darüber nach, auch wenn es wehtut.", scoring: { REF: 3, SL: 1 } },
      { key: "B", text: "Ich bedanke mich, aber innerlich weiß ich: Er kennt nicht die ganze Geschichte.", scoring: { REF: 1, ML: 1 } },
      { key: "C", text: "Ich frage nach konkreten Beispielen – ohne Beispiele ist das nur eine Meinung.", scoring: { WV: 2, REF: 1 } },
      { key: "D", text: "Ich sage nichts, lächle – und denke den ganzen Abend darüber nach.", scoring: { SL: -2, WS: 1, REF: 1 } },
    ],
    controlPair: 5,
  },
  {
    id: 2,
    title: "DER SPIEGEL-MOMENT",
    scenario: "Du liegst abends im Bett und es ist still. Was passiert?",
    options: [
      { key: "A", text: "Ich denke über Dinge nach, die ich hätte anders machen können.", scoring: { REF: 3, ML: 1 } },
      { key: "B", text: "Ich brauche meistens irgendeinen Input – Podcast, Serie, Social Media – bis ich einschlafe.", scoring: { OL: 2, SL: -1 } },
      { key: "C", text: "Ich gehe in Gedanken nochmal den nächsten Tag durch – was steht an, was muss ich erledigen.", scoring: { SL: -1, OL: -1, ETH_fremd: 1 } },
      { key: "D", text: "Ich denke häufig über große, tiefgründige Sinnfragen und Themen nach.", scoring: { WS: 2, WV: 1, NAT: 1 } },
    ],
  },
  {
    id: 3,
    title: "DAS KOMPLIMENT",
    scenario: 'Jemand sagt: "Ich bewundere, wie du dein Leben im Griff hast." Dein erster innerer Impuls?',
    options: [
      { key: "A", text: "Danke – aber wenn du wüsstest, wie es wirklich aussieht.", scoring: { REF: 2, SL: -1 } },
      { key: "B", text: "Das motiviert mich, weiter so zu machen.", scoring: { ETH_fremd: 1, SL: -1 } },
      { key: "C", text: "Nett gemeint, aber ich habe gar nicht das Gefühl, etwas im Griff zu haben.", scoring: { OL: 2, ML: 1 } },
      { key: "D", text: 'Ich frage mich, ob "im Griff haben" überhaupt das richtige Ziel ist.', scoring: { REF: 3, WV: 1 } },
    ],
  },
  {
    id: 4,
    title: "DIE ENTSCHEIDUNG",
    scenario: "Du stehst vor einer großen Lebensentscheidung – neuer Job, Umzug, Trennung. Was bestimmt deinen Prozess?",
    options: [
      { key: "A", text: "Ich wäge rational alle Optionen ab, recherchiere, mache Pro-Contra-Listen.", scoring: { REF: 2, ML: 1 } },
      { key: "B", text: "Ich frage Menschen, deren Meinung mir wichtig ist, was sie tun würden.", scoring: { ETH_fremd: 1, OL: 1 } },
      { key: "C", text: "Ich spüre eigentlich schon länger, was richtig wäre – aber die Umsetzung ist das Problem.", scoring: { REF: 2, ML: 2 } },
      { key: "D", text: "Ich neige dazu, schnell zu handeln und es dann einfach auszuprobieren.", scoring: { OL: 1, SL: 1 } },
    ],
  },
  {
    id: 5,
    title: "DAS MUSTER",
    scenario: "Ein Kollege kritisiert deine Arbeit vor dem Team. Was geht in dir vor?",
    options: [
      { key: "A", text: "Ich nehme es an und reflektiere später in Ruhe, was berechtigt war.", scoring: { REF: 3, SL: 2 } },
      { key: "B", text: "Ich reagiere professionell, aber innerlich regt es mich auf.", scoring: { SL: -1, WS: 1 } },
      { key: "C", text: "Ich frage sofort nach: Was genau meinst du damit?", scoring: { WV: 2, REF: 1 } },
      { key: "D", text: "Es trifft mich, und ich brauche eine Weile, bis ich mich davon erholt habe.", scoring: { SL: -2, ML: 1 } },
    ],
    controlPair: 1,
  },
  {
    id: 6,
    title: "DIE INNERE STIMME",
    scenario: "Wenn du an die letzten 5 Jahre zurückdenkst – was überwiegt?",
    options: [
      { key: "A", text: "Ich habe viel gelernt, aber wenig davon wirklich umgesetzt.", scoring: { REF: 2, ML: 2, OL: 1 } },
      { key: "B", text: "Ich habe das getan, was von mir erwartet wurde – und es lief ganz gut.", scoring: { ETH_fremd: 2, REF: -1 } },
      { key: "C", text: "Ich habe viel ausprobiert, aber noch nicht das Richtige gefunden.", scoring: { OL: 3, SL: -1 } },
      { key: "D", text: "Ich habe hart gearbeitet und einiges erreicht – aber glücklicher bin ich nicht.", scoring: { SL: -2, REF: 1 } },
    ],
  },
  {
    id: 7,
    title: "DEIN WARUM",
    scenario: "Warum machst du diesen Test?",
    options: [
      { key: "A", text: "Aus Neugier – ich analysiere gerne, was mich ausmacht.", scoring: { REF: 2, WV: 1 } },
      { key: "B", text: "Ich hoffe, dass es mir hilft zu verstehen, was in meinem Leben fehlt.", scoring: { OL: 3, ML: 1 } },
      { key: "C", text: "Ich will mich weiterentwickeln und bin offen für neue Impulse.", scoring: { SL: 1, ETH: 1 } },
      { key: "D", text: "Weil Freunde oder jemand aus meinem Umfeld ihn gemacht haben und meinten, ich sollte es auch mal probieren.", scoring: { ETH_fremd: 1, REF: -1 } },
    ],
  },
  {
    id: 8,
    title: "DER WIDERSPRUCH",
    scenario: "Du erfährst, dass ein Unternehmen, dessen Produkte du liebst, unter fragwürdigen Bedingungen produziert. Was machst du?",
    options: [
      { key: "A", text: "Ich recherchiere und bilde mir ein eigenes Urteil, bevor ich handle.", scoring: { WV: 2, ETH: 2, REF: 1 } },
      { key: "B", text: "Ich boykottiere sofort – so etwas kann ich nicht unterstützen.", scoring: { ETH: 3, WS: 1 } },
      { key: "C", text: "Ich finde es schlimm, aber mein Verhalten als Einzelner wird ja nichts ändern.", scoring: { ML: 3, WV: 1 } },
      { key: "D", text: "Ich find's nicht gut, aber am Ende kaufe ich trotzdem, was mir gefällt – man kann ja nicht bei allem das Gewissen einschalten.", scoring: { OL: 1, SL: 1 } },
    ],
    controlPair: 14,
  },
  {
    id: 9,
    title: "DIE DEBATTE",
    scenario: "In einer Diskussion über ein kontroverses Thema – was beschreibt dich am besten?",
    options: [
      { key: "A", text: "Ich versuche beide Seiten zu verstehen, bevor ich eine Position beziehe.", scoring: { REF: 2, WV: 3 } },
      { key: "B", text: "Ich habe klare Überzeugungen und vertrete sie auch.", scoring: { ETH: 2, WS: 1 } },
      { key: "C", text: "Ich halte mich meistens raus – Diskussionen ändern selten etwas.", scoring: { ML: 3, OL: 1 } },
      { key: "D", text: "Ich passe meine Position manchmal an, je nachdem mit wem ich rede.", scoring: { ETH_fremd: 1, SL: -1 } },
    ],
  },
  {
    id: 10,
    title: "DIE HEADLINE",
    scenario: "Du scrollst durch Instagram und eine Katastrophen-Headline taucht auf. Dein Impuls?",
    options: [
      { key: "A", text: "Ich lese den Beitrag und versuche zu verstehen, wie es dazu kommen konnte.", scoring: { WV: 3, REF: 1 } },
      { key: "B", text: "Meine Neugier ist sofort geweckt und ich muss einfach mehr erfahren. Dann merke ich, dass es mich wütend und traurig macht.", scoring: { WS: 3, NAT: 1, ETH: 1 } },
      { key: "C", text: "Ich merke, dass ich abgestumpft bin – es sind zu viele schlechte Nachrichten.", scoring: { ML: 2, SL: -1 } },
      { key: "D", text: "Ich scrolle weiter – es hilft mir nicht, mich damit runterzuziehen.", scoring: { SL: 1, OL: 1 } },
    ],
  },
  {
    id: 11,
    title: "DIE WERTE-FRAGE",
    scenario: "Wenn du an deine wichtigsten Überzeugungen denkst – z.B. was Erfolg bedeutet, was eine gute Beziehung ausmacht – wie bist du daran gekommen?",
    options: [
      { key: "A", text: "Durch eigene Erfahrung und jahrelanges Nachdenken.", scoring: { REF: 3, ETH: 2 } },
      { key: "B", text: "Das meiste habe ich von zuhause mitbekommen oder von Menschen übernommen, die mir wichtig waren.", scoring: { ETH_fremd: 2, REF: -1 } },
      { key: "C", text: "Ich bin mir nicht sicher – meine Überzeugungen ändern sich oft.", scoring: { OL: 3, REF: 1 } },
      { key: "D", text: "Aus dem, was ich für gerecht und richtig halte – das spüre ich einfach.", scoring: { ETH: 2, NAT: 1, WS: 1 } },
    ],
  },
  {
    id: 12,
    title: "DAS SYSTEM",
    scenario: "Was denkst du über die Gesellschaft, in der wir leben?",
    options: [
      { key: "A", text: "Sie ist komplex und unvollkommen – aber ich denke, ich verstehe ganz gut, wie sie funktioniert.", scoring: { WV: 3, REF: 1 } },
      { key: "B", text: "Sie ist zutiefst ungerecht, und die meisten merken es nicht mal.", scoring: { WS: 3, ETH: 2, NAT: 1 } },
      { key: "C", text: "Ich denke selten darüber nach – ich konzentriere mich auf mein eigenes Leben.", scoring: { SL: 1, OL: 1 } },
      { key: "D", text: "Ich versuche einfach, meinen Teil beizutragen und ein guter Mensch zu sein.", scoring: { ETH_fremd: 2, ML: 1 } },
    ],
  },
  {
    id: 13,
    title: "DIE NATUR",
    scenario: "Du bist allein in der Natur – Wald, Berge, Meer. Was passiert mit dir?",
    options: [
      { key: "A", text: "Ich komme runter und werde ruhig. Es ist einer der wenigen Orte, wo das passiert.", scoring: { NAT: 3, SL: 1 } },
      { key: "B", text: "Ich spüre eine tiefe Verbindung – und gleichzeitig Trauer darüber, wie wir mit ihr umgehen.", scoring: { NAT: 3, WS: 2, ETH: 1 } },
      { key: "C", text: "Es ist schön, aber mein Kopf schaltet selten ab – ich nehme die Gedanken mit.", scoring: { REF: 2, ML: 1 } },
      { key: "D", text: "Ich bin ehrlich gesagt selten in der Natur.", scoring: { NAT: -2, OL: 1 } },
    ],
  },
  {
    id: 14,
    title: "DIE OHNMACHT",
    scenario: "Du siehst ein Video von illegaler Waldrodung in Südamerika. Was löst es aus?",
    options: [
      { key: "A", text: "Wut – und ich teile es, damit andere es auch sehen.", scoring: { WS: 3, ETH: 2, NAT: 1 } },
      { key: "B", text: "Traurigkeit – aber was soll ich als einzelner Mensch dagegen tun?", scoring: { ML: 3, WS: 1, NAT: 1 } },
      { key: "C", text: "Ich schaue, ob es eine Petition oder Spendenaktion gibt – irgendetwas Konkretes, wo ich helfen kann.", scoring: { WV: 2, ETH: 1, REF: 1 } },
      { key: "D", text: "Es berührt mich, aber ich habe im Alltag genug eigene Baustellen.", scoring: { OL: 1 } },
    ],
    controlPair: 8,
  },
  {
    id: 15,
    title: "DER MONTAG",
    scenario: "Es ist Montagmorgen. Was geht dir als Erstes durch den Kopf?",
    options: [
      { key: "A", text: "Die To-Do-Liste – was muss heute geschafft werden?", scoring: { SL: -2, ETH_fremd: 1 } },
      { key: "B", text: 'Ich starte normal in die Woche, doch meist kommt schnell das Gefühl auf: "Wieder eine Woche vorbei, wieder nicht wirklich weitergekommen."', scoring: { ML: 2, OL: 2, REF: 1 } },
      { key: "C", text: "Aufstehen, Kaffee, los. Wie jede Woche – läuft halt.", scoring: { ETH_fremd: 2, REF: -1 } },
      { key: "D", text: "Ich habe selten Montagsblues – schließlich kann jede Woche etwas anderes mit sich bringen.", scoring: { REF: 1, SL: 1 } },
    ],
  },
  {
    id: 16,
    title: "DAS PROJEKT",
    scenario: "Du hast eine Idee, die dir wichtig ist – ein Projekt, eine Veränderung, ein neuer Weg. Was passiert damit?",
    options: [
      { key: "A", text: "Ich denke lange darüber nach, plane im Kopf, aber starte nie wirklich.", scoring: { REF: 2, ML: 3 } },
      { key: "B", text: "Ich starte motiviert, aber nach ein paar Wochen ist die Energie weg und etwas Neues lockt.", scoring: { OL: 3, SL: -1 } },
      { key: "C", text: "Ich ziehe es fast immer durch – egal ob es das Richtige ist. Aufgeben ist keine Option.", scoring: { SL: -1, ETH_fremd: 1 } },
      { key: "D", text: "Ich spreche erstmal mit anderen darüber, um zu hören, ob es sinnvoll klingt.", scoring: { ETH_fremd: 1, OL: 1 } },
    ],
  },
  {
    id: 17,
    title: "DIE KOMFORTZONE",
    scenario: "Ein Freund lädt dich zu etwas ein, das dich verunsichert – eine Reise, ein Event, eine Herausforderung. Wie reagierst du?",
    options: [
      { key: "A", text: "Ich sage ja, obwohl es mich nervös macht. Wachstum passiert außerhalb der Komfortzone.", scoring: { SL: 2, REF: 1 } },
      { key: "B", text: "Ich überlege lange, wäge ab – und sage am Ende meistens doch ab.", scoring: { ML: 2, REF: 1, OL: 1 } },
      { key: "C", text: "Hängt davon ab, wer noch dabei ist und ob es sich für mich lohnt.", scoring: { ETH_fremd: 1, SL: -1, ML: 1 } },
      { key: "D", text: "Ich mache mit – Hauptsache, es passiert was. Stillstand ist schlimmer als Risiko.", scoring: { OL: 1, SL: 1 } },
    ],
  },
  {
    id: 18,
    title: "DER STILLSTAND",
    scenario: "Du merkst, dass du seit Monaten auf der Stelle trittst. Nichts bewegt sich. Was tust du?",
    options: [
      { key: "A", text: "Ich analysiere, woran es liegt – und finde auch Antworten. Nur umsetzen… das ist was anderes.", scoring: { REF: 3, ML: 3 } },
      { key: "B", text: "Ich suche mir einen neuen Input – ein Buch, einen Kurs, einen Podcast, einen Coach.", scoring: { OL: 3 } },
      { key: "C", text: "Ich arbeite härter. Wenn die Ergebnisse stimmen, kommt das Gefühl von selbst.", scoring: { SL: -2, ETH_fremd: 1 } },
      { key: "D", text: "Ich frage mich, ob das nicht einfach das Leben ist. Nicht jeder Tag muss besonders sein.", scoring: { ETH_fremd: 1, ML: 1 } },
    ],
    controlPair: 21,
  },
  {
    id: 19,
    title: "DIE ABLENKUNG",
    scenario: "Wovon musst du dich am meisten losreißen, wenn du ehrlich bist?",
    options: [
      { key: "A", text: "Vom Grübeln – ich verliere mich in Gedankenspiralen.", scoring: { REF: 2, ML: 2 } },
      { key: "B", text: "Vom Handy und der ständigen Ablenkung – Social Media, Serien, News.", scoring: { OL: 2, SL: -1 } },
      { key: "C", text: "Von Arbeit und Projekten – ich bin am produktivsten, wenn ich beschäftigt bin.", scoring: { SL: -2, ETH_fremd: 1 } },
      { key: "D", text: "Von den Problemen der Welt – ich nehme zu viel auf, was nicht meins ist.", scoring: { WS: 3, NAT: 1, ML: 1 } },
    ],
  },
  {
    id: 20,
    title: "DIE HILFE",
    scenario: "Stell dir vor, ein enger Freund steckt in einer echten Krise. Was ist dein erster Impuls?",
    options: [
      { key: "A", text: "Zuhören, verstehen, keine vorschnellen Ratschläge geben.", scoring: { REF: 2, ETH: 2, SL: 1 } },
      { key: "B", text: "Sofort praktisch helfen – recherchieren, organisieren, Lösungen anbieten.", scoring: { ETH: 1, WV: 1 } },
      { key: "C", text: "Emotional da sein, mitfühlen – auch wenn es mich selbst runterzieht.", scoring: { WS: 2, SL: -1, NAT: 1 } },
      { key: "D", text: "Ich habe meist nicht das Gefühl, der richtige Ansprechpartner für solche Probleme zu sein, und fühle mich dabei selbst etwas hilflos – aber ich versuche mein Bestes.", scoring: { OL: 1, ML: 2 } },
    ],
  },
  {
    id: 21,
    title: "DAS GELD",
    scenario: "Du bekommst unerwartet 50.000 €. Was ist dein erster Gedanke?",
    options: [
      { key: "A", text: "Endlich Freiheit, etwas Neues auszuprobieren – Reise, Projekt, Neuanfang.", scoring: { OL: 2, SL: 1 } },
      { key: "B", text: "Investieren, absichern, klug anlegen. Sicherheit geht vor.", scoring: { ETH_fremd: 1, ML: 1 } },
      { key: "C", text: "Geld ist ja schön und gut, aber mir nicht so wichtig. Ein Teil wird definitiv gespendet.", scoring: { ETH: 2, WS: 1, NAT: 1 } },
      { key: "D", text: "Ich freue mich, doch bremse meine Euphorie direkt, um keine unklugen Entscheidungen zu treffen. Dann wird gründlich abgewogen, was die sinnvollsten Verwendungszwecke sein könnten.", scoring: { REF: 2, SL: 1 } },
    ],
    controlPair: 18,
  },
  {
    id: 22,
    title: "DIE PARTY",
    scenario: 'Du bist auf einer Party und jemand fragt: "Und, was machst du so?" (beruflich gemeint). Was fühlst du dabei?',
    options: [
      { key: "A", text: 'Ich antworte routiniert – aber die Antwort fühlt sich nicht wie "ich" an.', scoring: { OL: 2, ETH_fremd: 1, REF: 1 } },
      { key: "B", text: "Ich erzähle gerne davon – da bin ich in meinem Element.", scoring: { SL: 1, ETH_fremd: 1 } },
      { key: "C", text: "Ich finde die Frage oberflächlich. Menschen sind mehr als ihr Job.", scoring: { WV: 2, REF: 1, WS: 1 } },
      { key: "D", text: "Ich antworte, aber eigentlich würde ich gerne über etwas anderes reden – mein Job beschreibt nicht wirklich, wer ich bin.", scoring: { OL: 2, REF: 2 } },
    ],
  },
  {
    id: 23,
    title: "DER VERGLEICH",
    scenario: "Du siehst jemanden, der scheinbar genau das Leben lebt, das du dir wünschst. Was passiert in dir?",
    options: [
      { key: "A", text: "Ich frage mich: Was hat diese Person, das ich nicht habe – und was müsste ich ändern?", scoring: { ML: 1, OL: 1, REF: 1 } },
      { key: "B", text: "Es motiviert mich – wenn die das kann, kann ich es auch.", scoring: { SL: 1, OL: 1 } },
      { key: "C", text: "Es sticht. Nicht aus Neid, sondern weil es mich daran erinnert, wo ich nicht bin.", scoring: { ML: 2, SL: -2, OL: 1 } },
      { key: "D", text: "Ich hinterfrage, ob dieses Leben wirklich so toll ist, wie es aussieht.", scoring: { REF: 2, WV: 2 } },
    ],
  },
  {
    id: 24,
    title: "DIE MASKE",
    scenario: "Wie oft zeigst du dich so, wie du wirklich bist – ohne Filter?",
    options: [
      { key: "A", text: "Ehrlich gesagt selten. Ich habe gelernt, dass die meisten Menschen damit nicht umgehen können.", scoring: { REF: 2, SL: -1, ML: 1 } },
      { key: "B", text: "Bei wenigen, ausgewählten Menschen – die haben mein Vertrauen erarbeitet.", scoring: { SL: 1, ETH: 1 } },
      { key: "C", text: "Ich zeige mich meistens so, wie ich bin. Verstellen kostet zu viel Energie.", scoring: { SL: 2, REF: 1 } },
      { key: "D", text: 'Ich bin mir ehrlich gesagt nicht sicher, was "wirklich ich" überhaupt bedeutet.', scoring: { OL: 3, REF: 1 } },
    ],
  },
  {
    id: 25,
    title: "DER RAT AN DICH SELBST",
    scenario: "Wenn du an dein jüngeres Ich denkst – was hättest du dir damals gewünscht zu wissen?",
    options: [
      { key: "A", text: "Hör auf, es allen recht machen zu wollen.", scoring: { ETH_fremd: 2, REF: 2, SL: -1 } },
      { key: "B", text: "Dass man nicht alles perfekt durchdacht haben muss, bevor man loslegen darf.", scoring: { REF: 1, ML: 2 } },
      { key: "C", text: "Die Welt wird dich enttäuschen – aber gib nicht auf.", scoring: { WS: 2, ML: 1, ETH: 1 } },
      { key: "D", text: "Such nicht im Außen, was nur im Innen zu finden ist.", scoring: { OL: 2, SL: 1, REF: 1 } },
    ],
  },
  {
    id: 26,
    title: "DIE STILLE",
    scenario: "Stell dir vor, du hättest einen ganzen Tag nichts zu tun. Keine Verpflichtungen, niemand braucht dich. Was passiert?",
    options: [
      { key: "A", text: "Ich genieße es – endlich Zeit zum Nachdenken, Lesen, Reflektieren.", scoring: { REF: 3, NAT: 1 } },
      { key: "B", text: "Nach zwei Stunden werde ich unruhig und suche mir etwas zu tun.", scoring: { SL: -2, OL: 1, ETH_fremd: 1 } },
      { key: "C", text: "Ich würde rausgehen – Natur, frische Luft, runterkommen.", scoring: { NAT: 3, SL: 1 } },
      { key: "D", text: "Ehrlich? Der Gedanke bereitet mir eher Unbehagen als Freude.", scoring: { ML: 2, SL: -2, OL: 1 } },
    ],
  },
  {
    id: 27,
    title: "DIE MUTIGE ENTSCHEIDUNG",
    scenario: "Jemand in deinem Umfeld trifft eine mutige Entscheidung – kündigt den sicheren Job, zieht in ein anderes Land, beendet eine langjährige Beziehung. Dein erster Gedanke?",
    options: [
      { key: "A", text: "Respekt – aber ich frage mich, ob ich das jemals könnte.", scoring: { REF: 2, ML: 3 } },
      { key: "B", text: "Ich finde es mutig, aber auch riskant. Manche Dinge gibt man besser nicht auf.", scoring: { ETH_fremd: 1, ML: 1 } },
      { key: "C", text: "Es inspiriert mich – und gleichzeitig macht es mir meine eigene Situation bewusster.", scoring: { OL: 2, REF: 1, SL: -1 } },
      { key: "D", text: "Ich bewundere den Mut und hoffe, dass es richtig war. Manchmal braucht die Welt mehr davon.", scoring: { ETH: 1, WS: 1, NAT: 2 } },
    ],
  },
  {
    id: 28,
    title: "DER KERN",
    scenario: "Wenn du das hier liest – was hat dich eigentlich bis zur letzten Frage gebracht?",
    options: [
      { key: "A", text: "Neugier. Ich will verstehen, wie ich ticke.", scoring: { REF: 3, WV: 1 } },
      { key: "B", text: "Hoffnung. Dass mir das hier etwas zeigt, das ich alleine nicht sehen kann.", scoring: { OL: 2, ML: 1, SL: 1 } },
      { key: "C", text: "Ich will an mir arbeiten.", scoring: { SL: 1 } },
      { key: "D", text: "Weil ich mich in vielen Fragen wiedergefunden habe und neugierig bin, was daraus wird.", scoring: { WS: 2, REF: 1 } },
    ],
  },
];

// ─── STYLES ─────────────────────────────────────────────────────────────────────

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

.test-app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Intro ── */
.intro-screen {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  animation: fadeUp 0.8s ease-out;
}

.intro-screen .eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--warm-gray);
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.intro-screen h1 {
  font-family: 'Inter Tight', sans-serif;
  font-size: clamp(1.9rem, 5.5vw, 3rem);
  font-weight: 900;
  line-height: 1.15;
  color: var(--dark);
  max-width: 600px;
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.highlight {
  color: var(--orange);
  font-style: italic;
  font-weight: 900;
}

.intro-screen .intro-sub {
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--text-muted);
  max-width: 480px;
  line-height: 1.65;
  margin-bottom: 2.5rem;
}

.intro-screen .intro-meta {
  font-size: 0.78rem;
  color: var(--warm-gray);
  margin-bottom: 1.5rem;
  font-weight: 400;
  letter-spacing: 0.02em;
}

/* ── Buttons ── */
.btn-primary {
  background: var(--orange);
  color: #fff;
  border: none;
  padding: 1rem 2.5rem;
  font-family: 'Inter Tight', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.25s ease;
}
.btn-primary:hover {
  background: var(--orange-hover);
  transform: translateY(-1px);
}

/* ── Progress Bar ── */
.progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: var(--cream);
  padding: 0;
}

.progress-bar-track {
  width: 100%;
  height: 3px;
  background: var(--sand);
}

.progress-bar-fill {
  height: 100%;
  background: var(--orange);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 1.5rem;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  color: var(--warm-gray);
  font-weight: 500;
}

.progress-pct {
  font-variant-numeric: tabular-nums;
}

/* ── Question Screen ── */
.question-screen {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 5.5rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
}

.question-wrapper {
  animation: fadeUp 0.45s ease-out;
}

.question-eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--warm-gray);
  margin-bottom: 0.4rem;
  font-weight: 500;
}

.question-title-small {
  font-family: 'Inter Tight', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--orange);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 1.25rem;
}

.question-scenario {
  font-family: 'Inter Tight', sans-serif;
  font-size: clamp(1.15rem, 3.2vw, 1.35rem);
  color: var(--dark);
  line-height: 1.55;
  margin-bottom: 2.5rem;
  font-weight: 600;
}

/* ── Answer Options ── */
.answer-label {
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--warm-gray);
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

.option-btn {
  width: 100%;
  text-align: left;
  background: transparent;
  border: 1.5px solid var(--sand);
  padding: 1.1rem 1.25rem;
  font-family: 'Inter Tight', sans-serif;
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--dark);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-weight: 400;
}

.option-btn:hover {
  border-color: var(--dark);
  background: rgba(28, 28, 28, 0.02);
}

.option-btn.selected-primary {
  border-color: var(--orange);
  background: var(--orange-glow);
}

.option-btn.selected-secondary {
  border-color: var(--dark);
  background: rgba(28, 28, 28, 0.04);
}

.option-key {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--warm-gray);
  min-width: 1.2rem;
  flex-shrink: 0;
  line-height: 1.55;
}

.option-btn.selected-primary .option-key {
  color: var(--orange);
}

.option-btn.selected-secondary .option-key {
  color: var(--dark);
}

/* ── Secondary Selection ── */
.secondary-section {
  animation: fadeUp 0.35s ease-out;
  margin-bottom: 2rem;
}

.secondary-hint {
  font-size: 0.8rem;
  color: var(--warm-gray);
  font-style: italic;
  margin-bottom: 1rem;
  line-height: 1.5;
}

/* ── Navigation ── */
.nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

.btn-back {
  background: none;
  border: none;
  font-family: 'Inter Tight', sans-serif;
  font-size: 0.82rem;
  color: var(--warm-gray);
  cursor: pointer;
  padding: 0.5rem 0;
  transition: color 0.2s;
  font-weight: 500;
}
.btn-back:hover { color: var(--dark); }

.btn-next {
  background: var(--dark);
  color: var(--cream);
  border: none;
  padding: 0.85rem 2rem;
  font-family: 'Inter Tight', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.02em;
}
.btn-next:hover {
  background: var(--dark-soft);
  transform: translateY(-1px);
}
.btn-next:disabled {
  opacity: 0.3;
  cursor: default;
  transform: none;
}

.btn-finish {
  background: var(--orange);
  color: #fff;
}
.btn-finish:hover {
  background: var(--orange-hover);
}

/* ── Block Transition ── */
.block-transition {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  animation: fadeUp 0.6s ease-out;
}

.block-transition .block-num {
  font-family: 'Inter Tight', sans-serif;
  font-size: 5.5rem;
  color: var(--sand);
  margin-bottom: 0.75rem;
  font-weight: 900;
  line-height: 1;
}

.block-transition h2 {
  font-family: 'Inter Tight', sans-serif;
  font-size: clamp(1.3rem, 4vw, 1.8rem);
  font-weight: 900;
  color: var(--dark);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.block-transition .block-count {
  font-size: 0.78rem;
  color: var(--warm-gray);
  letter-spacing: 0.06em;
  margin-bottom: 2rem;
  font-weight: 400;
}

.block-transition .answer-hint {
  max-width: 400px;
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  padding: 1.25rem 1.5rem;
  border-left: 2px solid var(--orange);
  text-align: left;
}

.block-transition .answer-hint strong {
  color: var(--dark);
  font-weight: 700;
}

/* ── Result Screen ── */
.result-screen {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem 4rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.result-screen.visible {
  opacity: 1;
  transform: translateY(0);
}

.result-inner {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.result-header {
  text-align: center;
}

.result-eyebrow {
  font-size: 0.68rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--warm-gray);
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.result-type-label {
  font-family: 'Inter Tight', sans-serif;
  font-size: clamp(2rem, 6vw, 3.2rem);
  font-weight: 900;
  color: var(--dark);
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 0.75rem;
}

.result-tagline {
  font-family: 'Inter Tight', sans-serif;
  font-size: clamp(0.95rem, 2.5vw, 1.1rem);
  color: var(--orange);
  font-style: italic;
  font-weight: 500;
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto;
}

/* Radar */
.radar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.radar-svg {
  width: 100%;
  max-width: 340px;
}

.radar-legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.legend-dot {
  width: 10px;
  height: 3px;
  display: inline-block;
}
.legend-dot.user { background: var(--orange); }
.legend-dot.type { background: var(--warm-gray); border-top: 1px dashed var(--warm-gray); height: 0; border-width: 1.5px; }

/* Description */
.result-description {
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--dark);
  font-weight: 400;
}

/* Pain */
.result-pain {
  border-left: 4px solid var(--orange);
  padding: 2rem 2rem;
  background: var(--orange-glow);
}

.pain-label {
  font-family: 'Inter Tight', sans-serif;
  font-size: clamp(1.1rem, 3vw, 1.35rem);
  font-weight: 800;
  color: var(--orange);
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
  text-transform: none;
  line-height: 1.3;
}

.result-pain p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--dark);
  font-weight: 400;
}

/* Affinities */
.result-affinities {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.affinities-label {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--warm-gray);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.affinity-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.affinity-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--dark);
  min-width: 120px;
  flex-shrink: 0;
}

.affinity-bar-track {
  flex: 1;
  height: 6px;
  background: var(--sand);
  overflow: hidden;
}

.affinity-bar-fill {
  height: 100%;
  background: var(--orange);
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.affinity-pct {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 32px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Extra */
.result-extra {
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--dark);
  padding: 1.25rem 1.5rem;
  border-left: 3px solid var(--dark);
  background: rgba(28, 28, 28, 0.03);
  font-weight: 500;
}

/* CTA */
.result-cta {
  text-align: center;
  padding: 3rem 2rem;
  border: 2px solid var(--orange);
  background: var(--orange-glow);
  position: relative;
}

.cta-headline {
  font-family: 'Inter Tight', sans-serif;
  font-size: clamp(1.5rem, 4.5vw, 2rem);
  font-weight: 900;
  color: var(--dark);
  line-height: 1.2;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.cta-text {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--dark);
  max-width: 480px;
  margin: 0 auto 2rem;
  font-weight: 400;
}

.cta-text strong {
  color: var(--orange);
  font-weight: 700;
}

.cta-email {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 380px;
  margin: 0 auto;
}

.email-input {
  width: 100%;
  padding: 1rem 1.1rem;
  border: 2px solid var(--sand);
  background: #fff;
  font-family: 'Inter Tight', sans-serif;
  font-size: 0.9rem;
  color: var(--dark);
  outline: none;
  transition: border-color 0.2s;
}
.email-input:focus {
  border-color: var(--orange);
}
.email-input::placeholder {
  color: var(--warm-gray);
}

.btn-cta {
  width: 100%;
  text-align: center;
  padding: 1.1rem 2.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.btn-loading {
  opacity: 0.7;
  cursor: wait !important;
}

.loading-dots span {
  animation: dotPulse 1.2s infinite;
  font-size: 1.4rem;
  letter-spacing: 0.15em;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

.email-input-error {
  border-color: #c0392b !important;
}

.email-error-msg {
  font-size: 0.78rem;
  color: #c0392b;
  margin-top: -0.25rem;
  font-weight: 500;
}

.cta-privacy {
  font-size: 0.72rem;
  color: var(--warm-gray);
  margin-top: 0.5rem;
  font-weight: 400;
}

/* PDF Download */
.pdf-download-section {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.btn-pdf-download {
  background: var(--dark);
  color: var(--cream);
  border: none;
  padding: 0.85rem 2.2rem;
  font-family: 'Inter Tight', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.02em;
}
.btn-pdf-download:hover {
  background: var(--dark-soft);
  transform: translateY(-1px);
}
.btn-pdf-download:disabled {
  opacity: 0.5;
  cursor: wait;
  transform: none;
}

/* CTA Success */
.cta-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem 0;
  animation: fadeUp 0.5s ease-out;
}

.success-icon {
  width: 52px;
  height: 52px;
  border: 2px solid var(--orange);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.success-title {
  font-family: 'Inter Tight', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.success-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 380px;
}

.success-sub strong {
  color: var(--dark);
  font-weight: 600;
}

/* Debug */
.debug-toggle {
  background: none;
  border: none;
  font-family: monospace;
  font-size: 0.72rem;
  color: var(--warm-gray);
  cursor: pointer;
  padding: 0.5rem 0;
  text-align: left;
  transition: color 0.2s;
}
.debug-toggle:hover { color: var(--dark); }

.score-debug {
  background: var(--dark);
  color: var(--cream);
  padding: 2rem;
  font-size: 0.72rem;
  text-align: left;
  width: 100%;
  line-height: 1.8;
  font-family: monospace;
  overflow-x: auto;
}

/* ── Animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Mobile tweaks ── */
@media (max-width: 520px) {
  .question-screen { padding: 4.5rem 1.15rem 1.5rem; }
  .option-btn { padding: 0.9rem; font-size: 0.84rem; }
  .progress-info { padding: 0.5rem 1rem; }
  .block-transition .answer-hint { margin-left: 0.5rem; margin-right: 0.5rem; }
  .question-scenario { margin-bottom: 1.75rem; }
  .options-list { gap: 0.5rem; margin-bottom: 1.25rem; }
  .secondary-section { margin-bottom: 1rem; }
  .nav-row { padding-top: 1rem; padding-bottom: 1.5rem; }
}
`;

// ─── COMPONENTS ─────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }) {
  return (
    <div className="intro-screen">
      <div className="eyebrow">Dein Persönlichkeitstest</div>
      <h1>Was steht dir durch deine <span className="highlight">persönlichen Neigungen</span> im Weg?</h1>
      <p className="intro-sub">
        28 alltagsnahe Fragen, 8 Dimensionen, 5 Archetypen – kein Schubladen-Denken, sondern ein realistischer Spiegel deines Selbst.
      </p>
      <p className="intro-meta">~8 Minuten · anonym · Sofortergebnis</p>
      <button className="btn-primary" onClick={onStart}>
        Test starten
      </button>
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
  return (
    <div className="block-transition">
      <div className="block-num">{block.id}</div>
      <h2>{block.title}</h2>
      <p className="block-count">7 Fragen</p>
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

function QuestionCard({ question, questionIndex, totalQuestions, answers, onAnswer, onNext, onBack, isLast }) {
  const currentAnswer = answers[question.id] || { primary: null, secondary: null };
  const hasPrimary = currentAnswer.primary !== null;

  const handleOptionClick = (key) => {
    if (!hasPrimary) {
      onAnswer(question.id, { primary: key, secondary: null });
    } else if (key === currentAnswer.primary) {
      onAnswer(question.id, { primary: null, secondary: null });
    } else if (key === currentAnswer.secondary) {
      onAnswer(question.id, { ...currentAnswer, secondary: null });
    } else {
      onAnswer(question.id, { ...currentAnswer, secondary: key });
    }
  };

  return (
    <div className="question-screen">
      <ProgressBar current={questionIndex + 1} total={totalQuestions} />
      <div className="question-wrapper" key={question.id}>
        <div className="question-eyebrow">Frage {question.id} von {totalQuestions}</div>
        <div className="question-title-small">{question.title}</div>
        <p className="question-scenario">{question.scenario}</p>

        <div className="answer-label">
          {!hasPrimary ? "Wähle deine Antwort" : "Deine Antwort"}
        </div>
        <div className="options-list">
          {question.options.map((opt) => {
            const isPrimary = currentAnswer.primary === opt.key;
            const isSecondary = currentAnswer.secondary === opt.key;
            let cls = "option-btn";
            if (isPrimary) cls += " selected-primary";
            else if (isSecondary) cls += " selected-secondary";

            return (
              <button
                key={opt.key}
                className={cls}
                onClick={() => handleOptionClick(opt.key)}
              >
                <span className="option-key">{opt.key}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {hasPrimary && !currentAnswer.secondary && (
          <div className="secondary-section">
            <p className="secondary-hint">
              Optional: Wähle eine zweite Antwort, die auch auf dich zutrifft (wird schwächer gewichtet)
            </p>
          </div>
        )}

        {currentAnswer.secondary && (
          <div className="secondary-section">
            <p className="secondary-hint">
              Zweitantwort gewählt – wird schwächer gewichtet
            </p>
          </div>
        )}
      </div>

      <div className="nav-row">
        <button className="btn-back" onClick={onBack}>
          {questionIndex === 0 ? "" : "← Zurück"}
        </button>
        <button
          className={`btn-next ${isLast ? "btn-finish" : ""}`}
          disabled={!hasPrimary}
          onClick={onNext}
        >
          {isLast ? "Test abschließen" : "Weiter →"}
        </button>
      </div>
    </div>
  );
}

// ─── SCORING ENGINE ─────────────────────────────────────────────────────────

const TYPE_PROFILES = {
  zuschauer:    { REF: 90, SL: 50, ETH: 75, NAT: 50, WV: 85, WS: 75, ML: 85, OL: 45 },
  getriebene:   { REF: 30, SL: 30, ETH: 70, NAT: 20, WV: 45, WS: 20, ML: 20, OL: 20 },
  idealist:     { REF: 50, SL: 50, ETH: 90, NAT: 85, WV: 80, WS: 90, ML: 75, OL: 35 },
  suchende:     { REF: 50, SL: 40, ETH: 50, NAT: 50, WV: 40, WS: 50, ML: 50, OL: 90 },
  klarsichtige: { REF: 85, SL: 85, ETH: 80, NAT: 70, WV: 70, WS: 35, ML: 15, OL: 15 },
};

const KIT_API_KEY = "ce3iKRTfk0Bz5mfbC5yCrg";
const KIT_FORM_IDS = {
  zuschauer: 9189289,
  getriebene: 9190135,
  idealist: 9190147,
  suchende: 9190156,
  klarsichtige: 9190163,
};

const TYPE_META = {
  zuschauer: {
    label: "Der Zuschauer",
    tagline: "Du siehst mehr als die meisten – aber du stehst am Rand deines eigenen Lebens.",
    description: "Du denkst viel, verstehst Zusammenhänge, analysierst. Während andere einfach machen, durchschaust du die Muster dahinter. Das Problem: Irgendwann ist Verstehen zum Ersatz für Leben geworden. Du weißt genau, was du ändern müsstest – aber zwischen Erkenntnis und Handlung liegt ein Graben, der jedes Jahr breiter wird. Das Gute: Deine Klarheit ist eine echte Stärke. Du musst nur lernen, sie als Startrampe zu nutzen statt als Aussichtsplattform.",
    pain: "Du analysierst dich im Kreis. Du weißt, was sich ändern müsste – aber du verwechselst Erkenntnis mit Fortschritt. Und jeder Tag, an dem du nicht handelst, macht den nächsten Schritt schwerer.",
    extra: "Dein größter Hebel: Eine einzige Handlung, die du seit Wochen aufschiebst. Nicht perfekt – einfach anfangen.",
  },
  getriebene: {
    label: "Der Getriebene",
    tagline: "Du bist ständig in Bewegung – aber wer hat eigentlich das Ziel bestimmt?",
    description: "Du funktionierst. Zuverlässig, produktiv, immer beschäftigt. Von außen sieht das nach Disziplin und Erfolg aus. Aber dahinter steckt eine Vermeidungsstrategie: Solange du funktionierst, musst du nicht hinschauen. Manche Getriebene folgen einem Drehbuch, das andere geschrieben haben – und merken es nicht. In den ruhigen Momenten – wenn die Ablenkung wegfällt – ist da eine Unruhe, die du nicht benennen kannst. Das Gute: Dein Antrieb ist real. Deine Disziplin ist eine Stärke. Aber sie braucht ein Ziel, das wirklich deins ist.",
    pain: "Du bist so beschäftigt mit Funktionieren, dass du gar nicht merkst, wie weit du dich von dir selbst entfernt hast. Und die Stimme, die fragt ‚Ist das wirklich alles?', wird leiser, je mehr du sie übertönst.",
    extra: "Dein größter Hebel: Einen ganzen Abend lang nichts tun – und aushalten, was dann hochkommt.",
  },
  idealist: {
    label: "Der Idealist",
    tagline: "Du spürst, was in der Welt schiefläuft – und es frisst dich auf.",
    description: "Ungerechtigkeit, Oberflächlichkeit, Zerstörung – du siehst es überall und es lässt dich nicht kalt. Diese Intensität ist selten und wertvoll. Aber sie hat eine Schattenseite: Deine Energie fließt in Wut, Frustration und Ohnmacht über Dinge, die du nicht kontrollieren kannst – und für dein eigenes Leben bleibt wenig übrig. Nicht weil du egoistisch wärst, sondern weil du nie gelernt hast, dass bei dir selbst anfangen kein Verrat an der Welt ist. Sondern die Voraussetzung.",
    pain: "Dein Gerechtigkeitssinn ist echt – aber er frisst dich auf. Du gibst so viel Energie an die Welt, dass für dich selbst nichts übrig bleibt. Und das Paradoxe: Genau dadurch veränderst du weniger, als du könntest.",
    extra: "Dein größter Hebel: Erkenne, dass Selbstfürsorge kein Egoismus ist – sondern die Voraussetzung, wirklich etwas zu bewegen.",
  },
  suchende: {
    label: "Der Suchende",
    tagline: "Du weißt, dass etwas fehlt – du weißt nur noch nicht, was.",
    description: "Du hast schon einiges probiert. Bücher, Podcasts, vielleicht Seminare. Manche Dinge haben kurz resoniert, aber nichts hat wirklich gehalten. Das liegt nicht daran, dass du sprunghaft bist – sondern daran, dass du intuitiv spürst, wenn etwas nicht echt ist. Das Problem ist nur: Du suchst die Antwort im Außen, während sie im Innen liegt. Der erste Schritt ist nicht die nächste Methode – sondern ehrlich hinschauen, warum keine bisherige gereicht hat.",
    pain: "Du springst von Impuls zu Impuls, von Methode zu Methode – und verwechselst Bewegung mit Fortschritt. Die unbequeme Wahrheit: Es liegt nicht an den Methoden. Es liegt daran, dass du nicht tief genug gräbst.",
    extra: "Dein größter Hebel: Hör auf, nach der nächsten Antwort zu suchen. Setz dich mit der Frage hin.",
  },
  klarsichtige: {
    label: "Der Klarsichtige",
    tagline: "Du siehst klarer als die meisten – jetzt geht's darum, danach zu leben.",
    description: "Du hast schon einiges verstanden. Du hinterfragst, reflektierst, lebst bewusster als viele in deinem Umfeld. Man kann mit dir über tiefere Themen sprechen, ohne dass du abblocken musst. Aber: Auch du hast blinde Flecken. Vielleicht die Tendenz, dich für weiter zu halten, als du bist. Oder die Schwierigkeit, dein Wissen konsequent in Handlung zu übersetzen. Klar sehen und danach leben – das sind zwei verschiedene Dinge. Du bist auf dem Weg. Aber der Weg hat noch Strecke.",
    pain: "Dein Wissen ist echt – aber es kann zur Falle werden. Du hältst dich manchmal für weiter, als du bist. Und zwischen ‚verstanden haben' und ‚danach leben' liegt genau der Unterschied, den du noch überbrücken darfst.",
    extra: "Dein größter Hebel: Sei ehrlich, wo du Erkenntnis noch als Fortschritt verkaufst – und wo dir die Umsetzung fehlt.",
  },
};

const SCALE_LABELS = {
  REF: "Reflexion", SL: "Selbstliebe", ETH: "Ethik & Werte", NAT: "Naturverb.",
  WV: "Weltverständnis", WS: "Weltschmerz", ML: "Machtlosigkeit", OL: "Orientierungsl.",
};

const CORE_SCALES = ["REF", "SL", "ETH", "NAT", "WV", "WS", "ML", "OL"];

// Theoretische Max-Scores pro Skala (summiert über alle Fragen, primary only)
function computeTheoreticalMax() {
  const maxPos = {};
  const maxNeg = {};
  CORE_SCALES.forEach(s => { maxPos[s] = 0; maxNeg[s] = 0; });

  QUESTIONS.forEach(q => {
    q.options.forEach(opt => {
      Object.entries(opt.scoring).forEach(([k, v]) => {
        const key = k === "ETH_fremd" ? "ETH" : k;
        if (!CORE_SCALES.includes(key)) return;
        if (v > 0) maxPos[key] = Math.max(maxPos[key], v);
        else maxNeg[key] = Math.min(maxNeg[key], v);
      });
    });
  });

  // Max per question accumulated
  const totals = {};
  CORE_SCALES.forEach(s => { totals[s] = { pos: 0, neg: 0 }; });

  QUESTIONS.forEach(q => {
    const bestPerScale = {};
    const worstPerScale = {};
    q.options.forEach(opt => {
      Object.entries(opt.scoring).forEach(([k, v]) => {
        const key = k === "ETH_fremd" ? "ETH" : k;
        if (!CORE_SCALES.includes(key)) return;
        if (v > 0) bestPerScale[key] = Math.max(bestPerScale[key] || 0, v);
        if (v < 0) worstPerScale[key] = Math.min(worstPerScale[key] || 0, v);
      });
    });
    Object.entries(bestPerScale).forEach(([k, v]) => { totals[k].pos += v; });
    Object.entries(worstPerScale).forEach(([k, v]) => { totals[k].neg += v; });
  });

  return totals;
}

// Control pair consistency
const CONTROL_PAIRS = [
  { q1: 1, q2: 5, label: "Umgang mit Kritik" },
  { q1: 8, q2: 14, label: "Ethische Reaktion" },
  { q1: 18, q2: 21, label: "Umgang mit Stillstand" },
];

function getTopScales(scoring) {
  return Object.entries(scoring)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k === "ETH_fremd" ? "ETH" : k);
}

function checkConsistency(answers) {
  let totalWeight = 0;
  let pairCount = 0;

  CONTROL_PAIRS.forEach(({ q1, q2 }) => {
    const a1 = answers[q1];
    const a2 = answers[q2];
    if (!a1?.primary || !a2?.primary) return;

    const opt1 = QUESTIONS.find(q => q.id === q1).options.find(o => o.key === a1.primary);
    const opt2 = QUESTIONS.find(q => q.id === q2).options.find(o => o.key === a2.primary);
    if (!opt1 || !opt2) return;

    const scales1 = getTopScales(opt1.scoring);
    const scales2 = getTopScales(opt2.scoring);

    if (scales1.length === 0 || scales2.length === 0) { totalWeight += 1; pairCount++; return; }

    const top1 = scales1[0];
    const top2 = scales2[0];

    if (top1 === top2) {
      totalWeight += 1.0; // consistent
    } else if (scales1.includes(top2) || scales2.includes(top1)) {
      totalWeight += 0.8; // slightly inconsistent
    } else {
      totalWeight += 0.6; // strongly inconsistent
    }
    pairCount++;
  });

  return pairCount > 0 ? totalWeight / pairCount : 1.0;
}

// Social desirability check
function checkSocialDesirability(answers) {
  let refPenalty = 0;
  let ethPenalty = 0;

  // "super reflektiert": F1A + F5A + F20A + F24C
  const reflektiert = [
    answers[1]?.primary === "A",
    answers[5]?.primary === "A",
    answers[20]?.primary === "A",
    answers[24]?.primary === "C",
  ].filter(Boolean).length;
  if (reflektiert >= 3) refPenalty = 0.15;

  // "Weltretter": F8B + F10B + F14A
  const weltretter = [
    answers[8]?.primary === "B",
    answers[10]?.primary === "B",
    answers[14]?.primary === "A",
  ].filter(Boolean).length;
  if (weltretter >= 2) ethPenalty = 0.15;

  return { refPenalty, ethPenalty };
}

function computeScoring(answers) {
  // 1. Raw scores
  const raw = {};
  CORE_SCALES.forEach(s => { raw[s] = 0; });

  QUESTIONS.forEach(q => {
    const ans = answers[q.id];
    if (!ans) return;
    const primaryOpt = q.options.find(o => o.key === ans.primary);
    const secondaryOpt = ans.secondary ? q.options.find(o => o.key === ans.secondary) : null;

    if (primaryOpt) {
      Object.entries(primaryOpt.scoring).forEach(([k, v]) => {
        const key = k === "ETH_fremd" ? "ETH" : k;
        if (CORE_SCALES.includes(key)) raw[key] += v;
      });
    }
    if (secondaryOpt) {
      Object.entries(secondaryOpt.scoring).forEach(([k, v]) => {
        const key = k === "ETH_fremd" ? "ETH" : k;
        if (CORE_SCALES.includes(key)) raw[key] += v * 0.4;
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

  // 3. Consistency correction
  const consistencyFactor = checkConsistency(answers);

  // 4. Social desirability
  const { refPenalty, ethPenalty } = checkSocialDesirability(answers);
  if (refPenalty > 0) normalized.REF = Math.round(normalized.REF * (1 - refPenalty));
  if (ethPenalty > 0) {
    normalized.ETH = Math.round(normalized.ETH * (1 - ethPenalty));
    normalized.WS = Math.round(normalized.WS * (1 - ethPenalty));
  }

  // 5. Distance to each type profile
  const distances = {};
  Object.entries(TYPE_PROFILES).forEach(([type, profile]) => {
    let sumSq = 0;
    CORE_SCALES.forEach(s => {
      const diff = normalized[s] - profile[s];
      sumSq += diff * diff;
    });
    distances[type] = Math.sqrt(sumSq);
  });

  // 6. Klarsichtige bonus
  if (normalized.ML < 30 && normalized.OL < 30 && normalized.SL > 60 && normalized.REF > 65) {
    distances.klarsichtige *= (1 / 1.3); // reduce distance = boost
  }

  // 7. Apply consistency factor to distances (inconsistency increases distance to all)
  Object.keys(distances).forEach(type => {
    distances[type] *= (2 - consistencyFactor); // consistencyFactor 1.0 = no change, 0.6 = 1.4x
  });

  // Result: lowest distance wins
  const sorted = Object.entries(distances).sort((a, b) => a[1] - b[1]);
  const resultType = sorted[0][0];

  // Percentages (inverse distance, normalized)
  const maxDist = Math.max(...Object.values(distances));
  const affinities = {};
  Object.entries(distances).forEach(([type, dist]) => {
    affinities[type] = Math.round(Math.max(0, ((maxDist - dist) / maxDist) * 100));
  });

  return { raw, normalized, distances, resultType, affinities, consistencyFactor, refPenalty, ethPenalty };
}

// ─── RADAR CHART (SVG) ──────────────────────────────────────────────────────

function RadarChart({ normalized }) {
  const cx = 160, cy = 160, r = 120;
  const scales = CORE_SCALES;
  const n = scales.length;

  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  // Grid rings
  const rings = [25, 50, 75, 100];

  // Profile polygon
  const profilePoints = scales.map((s, i) => getPoint(i, normalized[s]));
  const profilePath = profilePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  // Type profile polygon (best match)
  const result = Object.entries(TYPE_PROFILES).reduce((best, [type, profile]) => {
    const dist = scales.reduce((sum, s) => sum + Math.pow(normalized[s] - profile[s], 2), 0);
    return dist < best.dist ? { type, profile, dist } : best;
  }, { dist: Infinity });

  const typePoints = scales.map((s, i) => getPoint(i, result.profile[s]));
  const typePath = typePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="-60 -10 400 350" className="radar-svg">
      {/* Grid */}
      {rings.map(val => {
        const pts = scales.map((_, i) => getPoint(i, val));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={val} d={d} fill="none" stroke="var(--sand)" strokeWidth="0.8" opacity="0.6" />;
      })}

      {/* Axis lines */}
      {scales.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--sand)" strokeWidth="0.5" opacity="0.4" />;
      })}

      {/* Type profile (reference) */}
      <path d={typePath} fill="none" stroke="var(--warm-gray)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />

      {/* User profile */}
      <path d={profilePath} fill="rgba(255, 77, 0, 0.1)" stroke="var(--orange)" strokeWidth="2" />
      {profilePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--orange)" />
      ))}

      {/* Labels */}
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

// ─── RESULT SCREEN ──────────────────────────────────────────────────────────

function CompleteScreen({ answers }) {
  const [showDebug, setShowDebug] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | loading | success | error
  const [emailError, setEmailError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const scoring = computeScoring(answers);
  const meta = TYPE_META[scoring.resultType];

  // ─── PDF GENERATION ─────────────────────────────────────────────────────
  const generatePDF = async (scoring, meta) => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pw = 210, ph = 297;

      // Load briefpapier background via fetch (avoids CORS/canvas issues)
      const bgResponse = await fetch("/Digitales-briefpapier.jpg");
      const bgBlob = await bgResponse.blob();
      const bgData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(bgBlob);
      });
      doc.addImage(bgData, "JPEG", 0, 0, pw, ph);

      // ── PAGE 1: Title + Radar ──
      const orange = [255, 77, 0];
      const dark = [28, 28, 28];
      const gray = [107, 101, 96];
      const warmGray = [163, 155, 147];
      let y = 38;

      // Eyebrow
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...warmGray);
      doc.text("DEIN PERSÖNLICHKEITSTEST \u2013 ERGEBNIS", pw / 2, y, { align: "center" });
      y += 12;

      // Type label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(...dark);
      doc.text(meta.label, pw / 2, y, { align: "center" });
      y += 10;

      // Tagline
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(...orange);
      const tagLines = doc.splitTextToSize("\u201E" + meta.tagline + "\u201C", 150);
      doc.text(tagLines, pw / 2, y, { align: "center" });
      y += tagLines.length * 5.5 + 10;

      // ── Draw Radar Chart ──
      const radarCx = pw / 2, radarCy = y + 42, radarR = 36;
      const scales = CORE_SCALES;
      const n = scales.length;

      const getRadarPt = (idx, val) => {
        const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
        const dist = (val / 100) * radarR;
        return { x: radarCx + dist * Math.cos(angle), y: radarCy + dist * Math.sin(angle) };
      };

      // Grid rings
      [25, 50, 75, 100].forEach(val => {
        const pts = scales.map((_, i) => getRadarPt(i, val));
        doc.setDrawColor(...warmGray);
        doc.setLineWidth(0.15);
        pts.forEach((p, i) => {
          const np = pts[(i + 1) % pts.length];
          doc.line(p.x, p.y, np.x, np.y);
        });
      });

      // Axis lines
      scales.forEach((_, i) => {
        const p = getRadarPt(i, 100);
        doc.setDrawColor(220, 215, 210);
        doc.setLineWidth(0.1);
        doc.line(radarCx, radarCy, p.x, p.y);
      });

      // Type reference profile (lighter line)
      const typeProfile = TYPE_PROFILES[scoring.resultType];
      const typePts = scales.map((s, i) => getRadarPt(i, typeProfile[s]));
      doc.setDrawColor(...warmGray);
      doc.setLineWidth(0.2);
      typePts.forEach((p, i) => {
        const np = typePts[(i + 1) % typePts.length];
        doc.line(p.x, p.y, np.x, np.y);
      });

      // User profile lines
      const userPts = scales.map((s, i) => getRadarPt(i, scoring.normalized[s]));
      doc.setDrawColor(...orange);
      doc.setLineWidth(0.6);
      userPts.forEach((p, i) => {
        const np = userPts[(i + 1) % userPts.length];
        doc.line(p.x, p.y, np.x, np.y);
      });
      // Dots
      userPts.forEach(p => {
        doc.setFillColor(...orange);
        doc.circle(p.x, p.y, 1, "F");
      });

      // Radar labels
      const shortLabels = { REF: "Reflexion", SL: "Selbstliebe", ETH: "Ethik", NAT: "Natur", WV: "Weltverst.", WS: "Weltschmerz", ML: "Machtlosigk.", OL: "Orientierung" };
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...dark);
      scales.forEach((s, i) => {
        const p = getRadarPt(i, 125);
        const anchor = p.x < radarCx - 5 ? "right" : p.x > radarCx + 5 ? "left" : "center";
        const dy = p.y < radarCy - 5 ? -1.5 : p.y > radarCy + 5 ? 3 : 0.5;
        doc.text(shortLabels[s] || SCALE_LABELS[s], p.x, p.y + dy, { align: anchor });
      });

      // Legend
      y = radarCy + radarR + 14;
      doc.setFontSize(6);
      doc.setTextColor(...orange);
      doc.setFillColor(...orange);
      doc.rect(pw / 2 - 35, y - 1.2, 4, 1.2, "F");
      doc.text("Dein Profil", pw / 2 - 29, y, { align: "left" });
      doc.setTextColor(...warmGray);
      doc.setDrawColor(...warmGray);
      doc.setLineWidth(0.3);
      doc.line(pw / 2 + 5, y - 0.6, pw / 2 + 9, y - 0.6);
      doc.text(meta.label + "-Referenz", pw / 2 + 11, y, { align: "left" });
      y += 14;

      // Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...dark);
      const descLines = doc.splitTextToSize(meta.description, 155);
      doc.text(descLines, pw / 2, y, { align: "center", lineHeightFactor: 1.6 });
      y += descLines.length * 4.8 + 8;

      // Pain section
      if (y < ph - 60) {
        doc.setFillColor(...orange);
        doc.rect(27, y - 1, 1.2, 28, "F");
        doc.setFillColor(255, 240, 235);
        doc.rect(29, y - 2, 154, 30, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...orange);
        doc.text("Daran scheiterst du gerade wahrscheinlich:", 32, y + 4);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...dark);
        const painLines = doc.splitTextToSize(meta.pain, 148);
        doc.text(painLines, 32, y + 11, { lineHeightFactor: 1.55 });
      }

      // ═══════ PAGE 2 ═══════
      doc.addPage();
      doc.addImage(bgData, "JPEG", 0, 0, pw, ph);
      y = 38;

      // Affinities heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...dark);
      doc.text("Deine Typ-Verteilung", pw / 2, y, { align: "center" });
      y += 12;

      // Affinity bars
      const sortedAffinities = Object.entries(scoring.affinities).sort((a, b) => b[1] - a[1]);
      sortedAffinities.forEach(([type, pct]) => {
        const isMain = type === scoring.resultType;
        doc.setFont("helvetica", isMain ? "bold" : "normal");
        doc.setFontSize(9);
        doc.setTextColor(...dark);
        doc.text(TYPE_META[type].label, 30, y);

        doc.setFillColor(232, 224, 216);
        doc.rect(80, y - 2.5, 80, 4, "F");
        const barW = Math.max((pct / 100) * 80, 2);
        if (isMain) { doc.setFillColor(...orange); } else { doc.setFillColor(...warmGray); }
        doc.rect(80, y - 2.5, barW, 4, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...gray);
        doc.text(pct + "%", 165, y, { align: "right" });
        y += 9;
      });

      y += 8;

      // Extra / Hebel section
      doc.setFillColor(240, 238, 235);
      doc.rect(27, y - 2, 156, 22, "F");
      doc.setFillColor(...dark);
      doc.rect(27, y - 2, 1.2, 22, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...dark);
      const extraLines = doc.splitTextToSize(meta.extra, 148);
      doc.text(extraLines, 32, y + 5, { lineHeightFactor: 1.5 });
      y += 30;

      // QR Code section
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...dark);
      doc.text("Deine kostenlose Masterclass", pw / 2, y, { align: "center" });
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...gray);
      const ctaTextPdf = doc.splitTextToSize("Genau f\u00FCr deinen Archetyp habe ich eine eigene Masterclass entwickelt. Scanne den QR-Code oder klicke den Link:", 140);
      doc.text(ctaTextPdf, pw / 2, y, { align: "center", lineHeightFactor: 1.5 });
      y += ctaTextPdf.length * 4.5 + 8;

      // Load QR code image
      const qrUrl = "https://florian-lingner.ch/kostenlose-archetyp-masterclass-anfordern/";
      try {
        const qrResponse = await fetch("/qr-code-mc-anfordern-pdf.png");
        const qrBlob = await qrResponse.blob();
        const qrData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(qrBlob);
        });
        const qrSize = 32;
        doc.addImage(qrData, "PNG", pw / 2 - qrSize / 2, y, qrSize, qrSize);
        y += qrSize + 6;
      } catch (qrErr) {
        console.warn("QR image load skipped:", qrErr);
        doc.setFontSize(9);
        doc.setTextColor(...orange);
        doc.text(qrUrl, pw / 2, y + 4, { align: "center" });
        y += 12;
      }

      // Link button
      const btnW = 80, btnH = 10;
      doc.setFillColor(...dark);
      doc.rect(pw / 2 - btnW / 2, y, btnW, btnH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(245, 240, 235);
      doc.text("Masterclass ansehen", pw / 2, y + 6.8, { align: "center" });
      doc.link(pw / 2 - btnW / 2, y, btnW, btnH, { url: qrUrl });
      y += btnH + 6;

      doc.setFontSize(7);
      doc.setTextColor(...warmGray);
      doc.text(qrUrl, pw / 2, y, { align: "center" });

      // Save
      doc.save("Persoenlichkeitstest-" + meta.label.replace(/\s+/g, "-") + ".pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF-Fehler: " + (err.message || err) + "\n\nBitte versuche es am Desktop-Browser.");
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Sort affinities for secondary types
  const sortedTypes = Object.entries(scoring.affinities)
    .sort((a, b) => b[1] - a[1]);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleEmailSubmit = async () => {
    if (!firstName.trim()) {
      setEmailError("Bitte gib deinen Vornamen ein.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    setEmailStatus("loading");
    setEmailError("");

    const formId = KIT_FORM_IDS[scoring.resultType];
    try {
      const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          api_key: KIT_API_KEY,
          email: email,
          first_name: firstName.trim(),
        }),
      });
      if (res.ok) {
        setEmailStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setEmailError(data.message || "Etwas ist schiefgelaufen. Bitte versuche es erneut.");
        setEmailStatus("error");
      }
    } catch (err) {
      setEmailError("Verbindungsfehler. Bitte versuche es erneut.");
      setEmailStatus("error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleEmailSubmit();
  };

  return (
    <div className={`result-screen ${animateIn ? "visible" : ""}`}>
      <div className="result-inner">
        {/* Type result */}
        <div className="result-header">
          <div className="result-eyebrow">Dein Ergebnis</div>
          <h2 className="result-type-label">{meta.label}</h2>
          <p className="result-tagline">"{meta.tagline}"</p>
        </div>

        {/* Radar */}
        <div className="radar-container">
          <RadarChart normalized={scoring.normalized} />
          <div className="radar-legend">
            <span className="legend-item"><span className="legend-dot user" /> Dein Profil</span>
            <span className="legend-item"><span className="legend-dot type" /> {meta.label}-Referenz</span>
          </div>
        </div>

        {/* Description */}
        <div className="result-description">
          <p>{meta.description}</p>
        </div>

        {/* Pain points */}
        <div className="result-pain">
          <div className="pain-label">Daran scheiterst du gerade wahrscheinlich:</div>
          <p>{meta.pain}</p>
        </div>

        {/* Affinities */}
        <div className="result-affinities">
          <div className="affinities-label">Typ-Verteilung</div>
          {sortedTypes.map(([type, pct]) => (
            <div key={type} className="affinity-row">
              <span className="affinity-name">{TYPE_META[type].label}</span>
              <div className="affinity-bar-track">
                <div className="affinity-bar-fill" style={{ width: `${Math.max(pct, 3)}%`, opacity: type === scoring.resultType ? 1 : 0.5 }} />
              </div>
              <span className="affinity-pct">{pct}%</span>
            </div>
          ))}
        </div>

        {/* Extra per type */}
        <div className="result-extra">
          <p>{meta.extra}</p>
        </div>

        {/* CTA */}
        <div className="result-cta">
          {emailStatus === "success" ? (
            <div className="cta-success">
              <div className="success-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="success-title">Check dein Postfach.</p>
              <p className="success-sub">Deine typspezifische Masterclass ist unterwegs an <strong>{email}</strong>. Schau auch im Spam-Ordner nach, falls sie nicht sofort ankommt.</p>
            </div>
          ) : (
            <>
              <h3 className="cta-headline">Willst du dein Leben nun positiv verändern?</h3>
              <p className="cta-text">
                Ich habe <strong>genau für deinen Archetyp</strong> eine eigene <strong>kostenlose Masterclass</strong> entwickelt. Hier lösen wir Knoten in genau deinem Kopf – mit Lösungen, die zu deinem Typ passen.
              </p>
              <div className="cta-email">
                <input
                  type="text"
                  placeholder="Dein Vorname"
                  className={`email-input ${emailError && !firstName.trim() ? "email-input-error" : ""}`}
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setEmailError(""); }}
                  disabled={emailStatus === "loading"}
                />
                <input
                  type="email"
                  placeholder="Deine E-Mail-Adresse"
                  className={`email-input ${emailError && firstName.trim() ? "email-input-error" : ""}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  onKeyDown={handleKeyDown}
                  disabled={emailStatus === "loading"}
                />
                {emailError && <p className="email-error-msg">{emailError}</p>}
                <button
                  className={`btn-primary btn-cta ${emailStatus === "loading" ? "btn-loading" : ""}`}
                  onClick={handleEmailSubmit}
                  disabled={emailStatus === "loading"}
                >
                  {emailStatus === "loading" ? (
                    <span className="loading-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  ) : "Masterclass freischalten"}
                </button>
              </div>
              <p className="cta-privacy">Kein Spam. Kein Bullshit. Jederzeit abmeldbar.</p>
            </>
          )}
        </div>

        {/* PDF Download */}
        <div className="pdf-download-section">
          <button
            className="btn-pdf-download"
            onClick={() => generatePDF(scoring, meta)}
            disabled={pdfLoading}
          >
            {pdfLoading ? "PDF wird erstellt..." : "Ergebnis als PDF speichern"}
          </button>
        </div>

        {/* Debug toggle */}
        <button className="debug-toggle" onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? "Debug ausblenden" : "// Debug anzeigen"}
        </button>

        {showDebug && (
          <div className="score-debug">
            <strong>// Normalisierte Werte (0–100)</strong><br /><br />
            {CORE_SCALES.map(s => (
              <span key={s}>{s}: {scoring.normalized[s]}<br /></span>
            ))}
            <br />
            <strong>// Distanzen zu Typen</strong><br /><br />
            {Object.entries(scoring.distances).sort((a, b) => a[1] - b[1]).map(([type, dist]) => (
              <span key={type}>{TYPE_META[type].label}: {dist.toFixed(1)} {type === scoring.resultType ? "← MATCH" : ""}<br /></span>
            ))}
            <br />
            <strong>// Korrekturen</strong><br />
            Konsistenz: {(scoring.consistencyFactor * 100).toFixed(0)}%<br />
            REF-Penalty (soz. Erwünschtheit): {scoring.refPenalty > 0 ? "-15%" : "keine"}<br />
            ETH/WS-Penalty: {scoring.ethPenalty > 0 ? "-15%" : "keine"}<br />
            Kit Form-ID: {KIT_FORM_IDS[scoring.resultType]}<br />
            <br />
            <strong>// Antworten</strong><br /><br />
            {QUESTIONS.map(q => {
              const a = answers[q.id];
              return (
                <span key={q.id}>
                  F{q.id}: {a?.primary || "–"}{a?.secondary ? ` + ${a.secondary} (40%)` : ""}<br />
                </span>
              );
            })}
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
  const appRef = useRef(null);

  const totalQuestions = 28;
  
  const flatIndex = BLOCKS.slice(0, currentBlock).reduce((sum, b) => sum + b.questions.length, 0) + currentQuestionInBlock;
  const currentQuestion = QUESTIONS[flatIndex];
  const block = BLOCKS[currentBlock];

  const scrollTop = useCallback(() => {
    if (appRef.current) appRef.current.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleStart = () => {
    setPhase("block-transition");
    scrollTop();
  };

  const handleBlockContinue = () => {
    setPhase("question");
    scrollTop();
  };

  const handleAnswer = (qId, ans) => {
    setAnswers(prev => ({ ...prev, [qId]: ans }));
  };

  const handleNext = () => {
    const isLastInBlock = currentQuestionInBlock >= block.questions.length - 1;
    const isLastBlock = currentBlock >= BLOCKS.length - 1;

    if (isLastInBlock && isLastBlock) {
      setPhase("complete");
      scrollTop();
      return;
    }

    if (isLastInBlock) {
      setCurrentBlock(prev => prev + 1);
      setCurrentQuestionInBlock(0);
      setPhase("block-transition");
    } else {
      setCurrentQuestionInBlock(prev => prev + 1);
    }
    scrollTop();
  };

  const handleBack = () => {
    if (currentQuestionInBlock > 0) {
      setCurrentQuestionInBlock(prev => prev - 1);
      scrollTop();
    } else if (currentBlock > 0) {
      setCurrentBlock(prev => prev - 1);
      setCurrentQuestionInBlock(BLOCKS[currentBlock - 1].questions.length - 1);
      scrollTop();
    }
  };

  const isLastQuestion = currentBlock === BLOCKS.length - 1 && currentQuestionInBlock === block.questions.length - 1;

  return (
    <>
      <style>{css}</style>
      <div className="test-app" ref={appRef}>
        {phase === "intro" && <IntroScreen onStart={handleStart} />}
        
        {phase === "block-transition" && (
          <BlockTransition
            block={block}
            onContinue={handleBlockContinue}
            isFirst={currentBlock === 0}
          />
        )}
        
        {phase === "question" && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionIndex={flatIndex}
            totalQuestions={totalQuestions}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onBack={handleBack}
            isLast={isLastQuestion}
          />
        )}
        
        {phase === "complete" && <CompleteScreen answers={answers} />}
      </div>
    </>
  );
}
