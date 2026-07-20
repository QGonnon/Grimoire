import type { GameEventDef } from '../types';

export const EVENTS: GameEventDef[] = [
  {
    id: 'old_beggar',
    title: 'Le vieux mendiant',
    text: "Un vieil homme voûté vous tend une main tremblante près du marché. Son regard est fatigué, mais digne.",
    tone: 'neutral',
    choices: [
      { label: "Lui donner quelques pièces", effect: { gold: -10 }, virtueDelta: 2, resultText: "Le vieil homme vous bénit et s'éloigne, un peu plus léger de cœur." },
      { label: "Poursuivre son chemin", effect: {}, evilDelta: 1, resultText: "Vous détournez le regard et continuez, mal à l'aise." },
      { label: "Se moquer de sa misère", effect: { gold: 2 }, evilDelta: 3, resultText: "Vous ricanez et récupérez quelques pièces tombées de sa sébile. Il vous maudit à voix basse." },
    ],
  },
  {
    id: 'lost_apprentice',
    title: "L'apprenti perdu",
    text: "Un jeune apprenti égaré dans les couloirs de la tour vous supplie de l'aider à retrouver son chemin, un grimoire serré contre sa poitrine.",
    tone: 'positive',
    choices: [
      { label: "L'aider et étudier son grimoire ensemble", effect: { energy: -5, research: 5 }, virtueDelta: 2, resultText: "Vous le raccompagnez et apprenez au passage quelques notions utiles." },
      { label: "Le laisser se débrouiller", effect: {}, evilDelta: 1, resultText: "Il finit par retrouver son chemin seul, mais vous jette un regard blessé." },
    ],
  },
  {
    id: 'mysterious_merchant',
    title: 'Le marchand mystérieux',
    text: "Un marchand encapuchonné déballe sur un tapis usé des objets qui semblent tout droit sortis d'un rêve.",
    tone: 'neutral',
    choices: [
      { label: 'Acheter un artefact curieux', effect: { gold: -20, research: 15 }, resultText: "L'objet acheté irradie un savoir étrange une fois étudié de près." },
      { label: 'Refuser poliment', effect: {}, resultText: 'Le marchand hausse les épaules et replie son tapis sans un mot.' },
    ],
  },
  {
    id: 'stray_cat',
    title: 'Le chat errant',
    text: "Un chat noir aux yeux dorés vous observe depuis le rebord d'une fenêtre, visiblement affamé.",
    tone: 'neutral',
    choices: [
      { label: 'Le nourrir', effect: { herbs: -5 }, virtueDelta: 1, resultText: 'Le chat ronronne et vous suit quelques instants avant de disparaître.' },
      { label: "Le chasser", effect: {}, evilDelta: 1, resultText: "Le chat feule et détale, non sans vous jeter un regard noir." },
    ],
  },
  {
    id: 'faerie_market',
    title: 'Le marché de la faerie',
    text: "Une silhouette scintillante apparaît à la lisière du chemin, proposant un échange dont vous ne comprenez pas tous les termes.",
    tone: 'neutral',
    choices: [
      { label: "Échanger de l'or contre du mana", effect: { gold: -30, mana: 40 }, resultText: 'La faerie sourit et disparaît dans un éclat de lumière, votre bourse allégée mais votre mana ravivé.' },
      { label: 'Marchander prudemment', effect: { energy: -10, mana: 15 }, resultText: "Après une négociation épuisante, vous obtenez un peu de mana pour presque rien." },
      { label: "S'éloigner sans un mot", effect: {}, resultText: 'La faerie hausse un sourcil amusé et se volatilise.' },
    ],
  },
  {
    id: 'fallen_tome',
    title: 'Le tome tombé',
    text: "Un grimoire épais gît ouvert sur le sol d'un couloir désert, comme abandonné en hâte.",
    tone: 'positive',
    choices: [
      { label: 'Le lire immédiatement', effect: { energy: -5, research: 10 }, resultText: "Les pages révèlent des secrets denses, mais la lecture vous épuise." },
      { label: 'Le ranger pour plus tard', effect: { research: 3 }, resultText: 'Vous glanez quelques informations en le feuilletant rapidement.' },
    ],
  },
  {
    id: 'rival_mage',
    title: 'Le mage rival',
    text: 'Un mage à la mine arrogante vous barre le chemin et vous provoque en duel amical.',
    tone: 'negative',
    choices: [
      { label: 'Accepter le duel', effect: { energy: -15, gold: 20 }, evilDelta: 2, resultText: 'Vous triomphez avec panache, mais votre arrogance déplaît aux témoins.' },
      { label: 'Décliner poliment', effect: {}, virtueDelta: 1, resultText: 'Vous vous inclinez avec courtoisie, ce qui impressionne les badauds.' },
    ],
  },
  {
    id: 'village_festival',
    title: 'Le festival du village',
    text: 'Les rues résonnent de musique et de rires : un festival improvisé bat son plein.',
    tone: 'positive',
    choices: [
      { label: 'Participer aux festivités', effect: { gold: 10, energy: -5 }, virtueDelta: 3, resultText: 'Vous dansez et riez avec les villageois, qui vous apprécient davantage.' },
      { label: 'Vendre vos services pendant la foule', effect: { gold: 5 }, resultText: "Vous profitez de l'affluence pour quelques travaux mineurs." },
    ],
  },
  {
    id: 'wounded_traveler',
    title: 'Le voyageur blessé',
    text: 'Un voyageur épuisé gît au bord du chemin, une blessure mal soignée à la jambe.',
    tone: 'positive',
    choices: [
      { label: 'Le soigner avec vos herbes', effect: { herbs: -10 }, virtueDelta: 3, resultText: "Le voyageur vous remercie chaleureusement et repart d'un pas plus assuré." },
      { label: "L'ignorer", effect: {}, evilDelta: 2, resultText: 'Vous poursuivez votre chemin, sourd à ses appels.' },
    ],
  },
  {
    id: 'hidden_cache',
    title: 'La cache cachée',
    text: "En explorant un renfoncement, vous repérez une pierre descellée dissimulant une petite cache.",
    tone: 'positive',
    choices: [
      { label: 'Fouiller la cache', effect: { energy: -8, gold: 25 }, resultText: 'Vous y trouvez une bourse oubliée depuis longtemps.' },
      { label: 'Laisser les lieux intacts', effect: {}, resultText: 'Vous préférez ne pas vous attarder et poursuivez votre route.' },
    ],
  },
  {
    id: 'arcane_storm',
    title: 'La tempête arcanique',
    text: "Le ciel se charge soudain d'énergie magique instable, faisant crépiter l'air autour de vous.",
    tone: 'negative',
    choices: [
      { label: "Se mettre à l'abri", effect: { energy: -5 }, resultText: 'Vous attendez que la tempête se dissipe, un peu secoué.' },
      { label: 'Étudier le phénomène', effect: { energy: -10, research: 8, arcana: 0.5 }, resultText: 'Vous notez des observations précieuses malgré le danger.' },
    ],
  },
  {
    id: 'thief_encounter',
    title: 'Le voleur',
    text: 'Une silhouette furtive tente de fouiller votre bourse dans une ruelle sombre.',
    tone: 'negative',
    choices: [
      { label: 'Le confronter', effect: { energy: -10, gold: 15 }, virtueDelta: 1, resultText: 'Vous le mettez en fuite et récupérez même un peu de butin.' },
      { label: 'Le laisser filer', effect: { gold: -10 }, resultText: 'Il détale avec une partie de votre bourse.' },
    ],
  },
  {
    id: 'dark_ritual',
    title: 'Le rituel sombre',
    text: "Une voix chuchotante vous invite à participer à un rituel interdit, promettant un pouvoir immense en échange d'un sacrifice.",
    tone: 'negative',
    unlock: (s) => s.evilamt >= 15 || !!s.classes['necromancer'],
    choices: [
      { label: 'Participer au rituel', effect: { mana: 50, shadow: 10 }, evilDelta: 15, resultText: 'Le rituel se conclut dans un frisson glacé. Votre pouvoir grandit, mais à quel prix ?' },
      { label: 'Refuser et fuir', effect: {}, virtueDelta: 2, resultText: 'Vous tournez le dos aux ténèbres et retrouvez votre calme.' },
    ],
  },
  {
    id: 'blessing',
    title: 'La bénédiction',
    text: "Un esprit lumineux, ému par votre vertu, vous propose une bénédiction en récompense de votre conduite.",
    tone: 'positive',
    unlock: (s) => s.virtue >= 15,
    choices: [
      { label: 'Accepter la bénédiction', effect: { mana: 30, light: 5 }, virtueDelta: 3, resultText: "Une chaleur apaisante vous traverse ; votre réputation de mage vertueux grandit encore." },
      { label: 'Décliner humblement', effect: {}, virtueDelta: 1, resultText: "Votre humilité impressionne l'esprit, qui s'efface avec un sourire." },
    ],
  },
];

export const EVENT_MAP = Object.fromEntries(EVENTS.map((e) => [e.id, e])) as Record<string, GameEventDef>;
