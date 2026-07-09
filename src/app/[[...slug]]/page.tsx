'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Skull, 
  User, 
  Search, 
  Play, 
  Plus, 
  X, 
  Check, 
  Users, 
  Award, 
  Info, 
  Settings as SettingsIcon, 
  Clock, 
  RotateCcw, 
  Trash2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  ShieldAlert,
  Fingerprint,
  TrendingUp,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  Shuffle,
  Menu
} from 'lucide-react';

// Types
interface Player {
  id: string;
  name: string;
  role: 'assassino' | 'detetive' | 'vitima';
  status: 'vivo' | 'morto';
  avatarColor: string;
}

type GameScreen = 'preloader' | 'welcome' | 'register' | 'settings' | 'reveal' | 'gameplay' | 'victory';
type GameMode = 'classico' | 'misterio' | 'caos';

// Web Audio API Synthesizer for 0-dependency high-fidelity audio feedback
class SoundSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playSwipe() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playReveal() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Play dual harmony chords
    [330, 440, 554, 660].forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + index * 0.05 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.start(now + index * 0.05);
      osc.stop(now + 0.6);
    });
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.15, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  }

  playFailure() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [293.66, 277.18, 261.63, 220.00]; // D4, C#4, C4, A3
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.1, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.5);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.6);
    });
  }
}

const synth = new SoundSynth();

const AVATAR_COLORS = [
  'from-rose-500 to-red-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-amber-400 to-orange-500',
  'from-purple-500 to-violet-600',
  'from-pink-500 to-fuchsia-600',
  'from-cyan-500 to-sky-600',
  'from-lime-500 to-green-600'
];

const translations = {
  PT: {
    impostor: "Impostor",
    offlineMode: "MODO OFFLINE • VERSÃO ATIVA",
    panel: "Painel",
    players: "Jogadores",
    settings: "Ajustes",
    sounds: "Sons",
    exit: "Sair",
    localSession: "Sessão Local Protegida • Desenho de Layout Ativo",
    searchPlaceholder: "Pesquisar no painel...",

    installingMystery: "Instalando o Mistério",
    preloaderSub: "Prepare-se para blefar, observar olhares e descobrir o assassino...",
    preloaderMsgs: [
      "Amolando a adaga misteriosa... 🗡️",
      "Limpando as lentes da lupa... 🔍",
      "Embaralhando papéis e álibis... 🃏",
      "Inspecionando os arredores em silêncio... 👀",
      "Tudo pronto. Quem é o culpado? 🤫"
    ],

    localMode: "MODO LOCAL",
    investigationPanel: "Painel de Investigação",
    welcomeDescription: "O clássico jogo social de Assassino, Detetive e Vítima. Passe o dispositivo de mão em mão, sorteie papéis secretamente e observe cada piscada e olhar suspeito para desvendar o culpado antes que o tempo acabe!",
    playersRange: "3 a 24 Jogadores",
    secretDraw: "Sorteio Secreto",
    customTime: "Tempo Custom",
    roleDistribution: "DISTRIBUIÇÃO DE PAPÉIS",
    autoDrawFormula: "Fórmula automática de sorteio",
    assassinRoleName: "Assassino",
    assassinBrief: "Elimina piscando",
    detectiveRoleName: "Detetive",
    detectiveBrief: "Observa e acusa",
    victimBrief: "Os jogadores restantes serão marcados automaticamente como Vítimas.",
    readyToStart: "Pronto para Começar?",
    readyToStartSub: "Cadastre os participantes que estão presentes no local. Após cadastrar todos, o sistema sorteará as identidades secretas para que cada um veja seu papel individualmente.",
    registerBtn: "Cadastrar Jogadores 📱",

    addPlayersTitle: "Adicionar Jogadores",
    addPlayersSub: "Cadastre de 3 a 24 participantes para iniciar a rodada.",
    registeredPlayersBadge: "Jogadores Cadastrados",
    registeredPlayersActive: "Ativos",
    seedPrompt: "Preencha a sala rapidamente com nomes de exemplo para testar as mecânicas imediatamente!",
    seedBtn: "Preencher Nomes Rápidos",
    namePlaceholder: "Nome do jogador...",
    registerPlayerBtnTitle: "Cadastrar jogador",
    advanceToSettings: "Avançar para os Ajustes",
    minPlayersError: "Por favor, cadastre pelo menos 3 jogadores antes de continuar!",

    settingsTitle: "Ajustes da Partida",
    settingsSub: "Configure os parâmetros antes de sortear as identidades secretas.",
    membersTitle: "Membros da Partida",
    peopleReady: "pessoas prontas",
    manageBtn: "Gerenciar",
    matchesNum: "Número de Rodadas",
    matchLabel: "rodada",
    matchesLabel: "rodadas",
    sub1Match: "- 1 Rodada",
    add1Match: "+ 1 Rodada",
    timeLimit: "Tempo Limite",
    minutes: "minutos",
    sub1Min: "- 1 Minuto",
    add1Min: "+ 1 Minuto",
    lotteryConfigInfo: "Sorteio randômico configurado: 1 Assassino, 1 Detetive e {victimsCount} Vítimas. Os papéis serão revelados de forma estritamente secreta para cada jogador.",
    startLotteryBtn: "Iniciar Sorteio Secreto",

    secretRevealTitle: "REVELAÇÃO SECRETA",
    whoAreYou: "Quem é você?",
    revealPassSub: "Passe o celular para o jogador correspondente. Ele deve ver o papel sozinho!",
    cardRevealedTitle: "Seu papel secreto",
    cardSwipeTip: "Arraste para Cima ou Toque",
    cardSwipeSub: "para ver sua identidade secreta",
    revealNextPlayer: "Próximo Jogador",
    revealReadyGameplay: "Tudo Pronto! Começar Partida ⚡",
    keepDiscretion: "Dica: Mantenha a discrição absoluta. Ninguém pode ver seu papel! Se souberem sua identidade, o jogo perde o segredo.",
    revealCardHint: "Toque no cartão para revelar!",
    roleAssassinDesc: "Você deve piscar em segredo para as vítimas para eliminá-las. Não pisque para o Detetive ou você perderá!",
    roleDetectiveDesc: "Observe as piscadas e reações na sala. Identifique o Assassino e clique sobre ele na malha para vencer!",
    roleVictimDesc: "Fique atento! Se o Assassino piscar para você, você morre. Ao morrer, clique em seu nome na tela.",
    avoidAccused: "🤫 EVITE SER ACUSADO",
    carefulGaze: "🔍 CUIDADO COM OS OLHARES",
    trySurvive: "🤞 TENTE SOBREVIVER",

    gameInProgress: "Em Andamento",
    roundLabel: "Rodada",
    pauseTime: "Pausar Tempo",
    resumeTime: "Retomar Tempo",
    gameplayHelp: "O assassino pisca para eliminar. Se piscarem para você, toque no seu nome à direita para registrar sua morte!",
    eliminationGrid: "Malha de Eliminação",
    clickToEliminate: "Clique em quem for eliminado",
    eliminatedBadge: "ELIMINADO",
    aliveBadge: "VIVO",
    rulesHeader: "Mapeamento de Regras do Jogo:",
    rulesLi1: "Se o Assassino piscar para o Detetive, o Assassino é denunciado e o Detetive vence!",
    rulesLi2: "Se o Detetive encontrar e eliminar o Assassino na malha, o Detetive vence!",
    rulesLi3: "Se restarem vivas apenas as figuras do Assassino e Detetive, o Assassino vence!",
    confirmEliminationTitle: "Confirmar Eliminação",
    confirmEliminationPrompt: "Você confirma a eliminação de {playerName}?",
    cancelBtn: "Cancelar",
    confirmBtn: "Sim, Eliminar",

    gameOver: "Fim de Jogo!",
    victoryAssassin: "Vitória do Assassino! 🤫",
    victoryDetective: "Vitória do Detetive! 🔍",
    completeDisclosures: "Revelação Completa dos Papéis:",
    playAgainBtn: "Jogar Novamente",
    backToMenuBtn: "Voltar ao Menu",
    victimText: "Vítima",
    assassinText: "Assassino",
    detectiveText: "Detetive",
    viewPortfolio: "Ver Portfólio 🌐",
    copyrightDesc: "Todos os direitos reservados. Acesse o portfólio oficial para conhecer mais trabalhos do desenvolvedor."
  },
  EN: {
    impostor: "Impostor",
    offlineMode: "OFFLINE MODE • ACTIVE VERSION",
    panel: "Dashboard",
    players: "Players",
    settings: "Settings",
    sounds: "Sounds",
    exit: "Exit",
    localSession: "Protected Local Session • Active Layout Design",
    searchPlaceholder: "Search in dashboard...",

    installingMystery: "Installing the Mystery",
    preloaderSub: "Get ready to bluff, observe glances, and find the assassin...",
    preloaderMsgs: [
      "Sharpening the mysterious dagger... 🗡️",
      "Cleaning the magnifying glass lenses... 🔍",
      "Shuffling papers and alibis... 🃏",
      "Inspecting the surroundings in silence... 👀",
      "All ready. Who is the culprit? 🤫"
    ],

    localMode: "LOCAL MODE",
    investigationPanel: "Investigation Dashboard",
    welcomeDescription: "The classic social game of Assassin, Detective, and Victim. Pass the device around, draw secret roles, and observe every wink and suspicious look to solve the mystery before time runs out!",
    playersRange: "3 to 24 Players",
    secretDraw: "Secret Draw",
    customTime: "Custom Time",
    roleDistribution: "ROLE DISTRIBUTION",
    autoDrawFormula: "Automatic draw formula",
    assassinRoleName: "Assassin",
    assassinBrief: "Eliminates with a wink",
    detectiveRoleName: "Detective",
    detectiveBrief: "Observes and accuses",
    victimBrief: "The remaining players will automatically be assigned as Victims.",
    readyToStart: "Ready to Start?",
    readyToStartSub: "Register the participants present at the venue. Once registered, the system will draw secret identities for everyone to view individually.",
    registerBtn: "Register Players 📱",

    addPlayersTitle: "Add Players",
    addPlayersSub: "Register 3 to 24 participants to start the round.",
    registeredPlayersBadge: "Registered Players",
    registeredPlayersActive: "Active",
    seedPrompt: "Fill the lobby quickly with sample names to test the mechanics immediately!",
    seedBtn: "Auto-Fill Fast Names",
    namePlaceholder: "Player name...",
    registerPlayerBtnTitle: "Register player",
    advanceToSettings: "Go to Settings",
    minPlayersError: "Please register at least 3 players before continuing!",

    settingsTitle: "Match Adjustments",
    settingsSub: "Configure game parameters before drawing secret identities.",
    membersTitle: "Match Members",
    peopleReady: "people ready",
    manageBtn: "Manage",
    matchesNum: "Number of Rounds",
    matchLabel: "round",
    matchesLabel: "rounds",
    sub1Match: "- 1 Round",
    add1Match: "+ 1 Round",
    timeLimit: "Time Limit",
    minutes: "minutes",
    sub1Min: "- 1 Minute",
    add1Min: "+ 1 Minute",
    lotteryConfigInfo: "Random draw configured: 1 Assassin, 1 Detective, and {victimsCount} Victims. Roles will be revealed strictly in secret to each player.",
    startLotteryBtn: "Start Secret Draw",

    secretRevealTitle: "SECRET REVEAL",
    whoAreYou: "Who are you?",
    revealPassSub: "Pass the phone to the corresponding player. They must look at the role alone!",
    cardRevealedTitle: "Your secret card",
    cardSwipeTip: "Swipe Up or Tap",
    cardSwipeSub: "to view your secret identity",
    revealNextPlayer: "Next Player",
    revealReadyGameplay: "All Ready! Start Match ⚡",
    keepDiscretion: "Tip: Maintain absolute discretion. Nobody can see your role! If they know who you are, the mystery is gone.",
    revealCardHint: "Tap the card to reveal!",
    roleAssassinDesc: "You must wink in secret at victims to eliminate them. Do not wink at the Detective or you will lose!",
    roleDetectiveDesc: "Observe winks and reactions in the room. Identify the Assassin and click on them in the grid to win!",
    roleVictimDesc: "Stay alert! If the Assassin winks at you, you die. Once dead, tap your name on the screen.",
    avoidAccused: "🤫 AVOID SUSPICION",
    carefulGaze: "🔍 WATCH THE EYES",
    trySurvive: "🤞 TRY TO SURVIVE",

    gameInProgress: "In Progress",
    roundLabel: "Round",
    pauseTime: "Pause Timer",
    resumeTime: "Resume Timer",
    gameplayHelp: "The assassin winks to eliminate. If you are winked at, tap your name on the right side to register your death!",
    eliminationGrid: "Elimination Grid",
    clickToEliminate: "Tap the eliminated player",
    eliminatedBadge: "ELIMINATED",
    aliveBadge: "ALIVE",
    rulesHeader: "Game Rules Mapping:",
    rulesLi1: "If the Assassin winks at the Detective, the Assassin is exposed and the Detective wins!",
    rulesLi2: "If the Detective finds and eliminates the Assassin on the grid, the Detective wins!",
    rulesLi3: "If only the Assassin and the Detective are left alive, the Assassin wins!",
    confirmEliminationTitle: "Confirm Elimination",
    confirmEliminationPrompt: "Are you sure you want to eliminate {playerName}?",
    cancelBtn: "Cancel",
    confirmBtn: "Yes, Eliminate",

    gameOver: "Game Over!",
    victoryAssassin: "Assassin's Victory! 🤫",
    victoryDetective: "Detective's Victory! 🔍",
    completeDisclosures: "Full Role Disclosure:",
    playAgainBtn: "Play Again",
    backToMenuBtn: "Back to Menu",
    victimText: "Victim",
    assassinText: "Assassin",
    detectiveText: "Detective",
    viewPortfolio: "View Portfolio 🌐",
    copyrightDesc: "All rights reserved. Access the official portfolio to learn more about the developer's work."
  },
  ES: {
    impostor: "Impostor",
    offlineMode: "MODO OFFLINE • VERSIÓN ACTIVA",
    panel: "Tablero",
    players: "Jugadores",
    settings: "Ajustes",
    sounds: "Sonidos",
    exit: "Salir",
    localSession: "Sesión Local Protegida • Diseño de Maquetación Activa",
    searchPlaceholder: "Buscar en el tablero...",

    installingMystery: "Instalando el Misterio",
    preloaderSub: "Prepárate para farolear, observar miradas y descubrir al asesino...",
    preloaderMsgs: [
      "Cargando identidades secretas...",
      "Sincronizando mallas locales...",
      "Validando barajas de cartas secretas...",
      "Preparando sala de sorteo..."
    ],

    localMode: "MODO LOCAL",
    investigationPanel: "Tablero de Investigación",
    welcomeDescription: "El clásico juego social de Asesino, Detective y Víctima. ¡Pasa el dispositivo de mano en mano, sortea roles en secreto y observa cada guiño y mirada sospechosa para descubrir al culpable antes de que se agote el tiempo!",
    playersRange: "3 a 24 Jugadores",
    secretDraw: "Sorteo Secreto",
    customTime: "Tiempo Custom",
    roleDistribution: "DISTRIBUCIÓN DE ROLES",
    autoDrawFormula: "Fórmula de sorteo automática",
    assassinRoleName: "Asesino",
    assassinBrief: "Elimina con un guiño",
    detectiveRoleName: "Detective",
    detectiveBrief: "Observa y acusa",
    victimBrief: "Los jugadores restantes serán asignados automáticamente como Víctimas.",
    readyToStart: "¿Listo para Empezar?",
    readyToStartSub: "Registra a los participantes presentes en el lugar. Una vez registrados todos, el sistema sorteará identidades secretas para que cada uno vea su rol individualmente.",
    registerBtn: "Registrar Jugadores 📱",

    addPlayersTitle: "Añadir Jugadores",
    addPlayersSub: "Registra de 3 a 24 participantes para iniciar la ronda.",
    registeredPlayersBadge: "Jugadores Registrados",
    registeredPlayersActive: "Activos",
    seedPrompt: "¡Llena la sala rápidamente con nombres de ejemplo para probar las mecánicas de inmediato!",
    seedBtn: "Auto-Completar Nombres Rápidos",
    namePlaceholder: "Nombre del jugador...",
    registerPlayerBtnTitle: "Registrar jugador",
    advanceToSettings: "Avanzar a Ajustes",
    minPlayersError: "¡Por favor, registra al menos 3 jugadores antes de continuar!",

    settingsTitle: "Ajustes de la Partida",
    settingsSub: "Configura los parámetros del juego antes de sortear identidades secretas.",
    membersTitle: "Miembros de la Partida",
    peopleReady: "personas listas",
    manageBtn: "Gestionar",
    matchesNum: "Número de Rondas",
    matchLabel: "ronda",
    matchesLabel: "rondas",
    sub1Match: "- 1 Ronda",
    add1Match: "+ 1 Ronda",
    timeLimit: "Límite de Tiempo",
    minutes: "minutos",
    sub1Min: "- 1 Minuto",
    add1Min: "+ 1 Minuto",
    lotteryConfigInfo: "Sorteo aleatorio configurado: 1 Asesino, 1 Detective y {victimsCount} Víctimas. Los roles se revelarán de forma estrictamente secreta para cada jugador.",
    startLotteryBtn: "Iniciar Sorteo Secreto",

    secretRevealTitle: "REVELACIÓN SECRETA",
    whoAreYou: "¿Quién eres?",
    revealPassSub: "Pasa el móvil al jugador correspondiente. ¡Debe ver su rol a solas!",
    cardRevealedTitle: "Tu carta secreta",
    cardSwipeTip: "Desliza Hacia Arriba o Toca",
    cardSwipeSub: "para ver tu identidad secreta",
    revealNextPlayer: "Siguiente Jugador",
    revealReadyGameplay: "¡Todo Listo! Comenzar Partida ⚡",
    keepDiscretion: "Consejo: Mantén discreción absoluta. ¡Nadie puede ver tu rol! Si descubren quién eres, el misterio se pierde.",
    revealCardHint: "¡Toca la carta para revelar!",
    roleAssassinDesc: "Debes guiñar el ojo en secreto a las víctimas para eliminarlas. ¡No le guiñes al Detective o perderás!",
    roleDetectiveDesc: "Observa guiños y reacciones en la sala. ¡Identifica al Asesino y haz clic en él en la malla para ganar!",
    roleVictimDesc: "¡Mantente alerta! Si el Asesino te guiña el ojo, mueres. Al morir, pulsa tu nombre en la pantalla.",
    avoidAccused: "🤫 EVITA SOSPECHAS",
    carefulGaze: "🔍 CUIDADO CON LAS MIRADAS",
    trySurvive: "🤞 INTENTA SOBREVIVIR",

    gameInProgress: "En Progreso",
    roundLabel: "Ronda",
    pauseTime: "Pausar Tiempo",
    resumeTime: "Reanudar Tiempo",
    gameplayHelp: "El asesino guiña el ojo para eliminar. ¡Si te guiñan el ojo, toca tu nombre a la derecha para registrar tu muerte!",
    eliminationGrid: "Malla de Eliminación",
    clickToEliminate: "Toca al jugador eliminado",
    eliminatedBadge: "ELIMINADO",
    aliveBadge: "VIVO",
    rulesHeader: "Mapeo de Reglas del Juego:",
    rulesLi1: "¡Si el Asesino le guiña el ojo al Detective, el Asesino queda expuesto y el Detective gana!",
    rulesLi2: "¡Si el Detective encuentra y elimina al Asesino en la malla, el Detective gana!",
    rulesLi3: "¡Si solo quedan vivos el Asesino y el Detective, el Asesino gana!",
    confirmEliminationTitle: "Confirmar Eliminación",
    confirmEliminationPrompt: "¿Confirmas la eliminación de {playerName}?",
    cancelBtn: "Cancelar",
    confirmBtn: "Sí, Eliminar",

    gameOver: "¡Fin del Juego!",
    victoryAssassin: "¡Victoria del Asesino! 🤫",
    victoryDetective: "¡Victoria del Detective! 🔍",
    completeDisclosures: "Revelación Completa de Roles:",
    playAgainBtn: "Jugar de Nuevo",
    backToMenuBtn: "Volver al Menú",
    victimText: "Víctima",
    assassinText: "Asesino",
    detectiveText: "Detective",
    viewPortfolio: "Ver Portafolio 🌐",
    copyrightDesc: "Todos los derechos reservados. Accede al portafolio oficial para conocer más trabajos del desarrollador."
  }
};

export default function Home() {
  // Navigation & General Settings State
  const [currentScreen, setCurrentScreen] = React.useState<GameScreen>('preloader');
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);
  const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
  const [preloaderProgress, setPreloaderProgress] = React.useState<number>(0);
  const [preloaderMessage, setPreloaderMessage] = React.useState<string>('Infiltrando-se no recinto...');

  const initialPathRef = React.useRef<string>('/');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      initialPathRef.current = window.location.pathname;
    }
  }, []);

  // Synchronize browser URL pathname with currentScreen
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentScreen === 'preloader') return;

    let path = '/';
    if (currentScreen === 'register') {
      path = '/jogadores';
    } else if (currentScreen === 'settings') {
      path = '/ajustes';
    } else if (currentScreen === 'reveal') {
      path = '/revelar';
    } else if (currentScreen === 'gameplay') {
      path = '/jogo';
    } else if (currentScreen === 'victory') {
      path = '/vitoria';
    } else if (currentScreen === 'welcome') {
      path = '/';
    }

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [currentScreen]);

  // Handle browser back/forward buttons (PopState)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/jogadores') {
        setCurrentScreen('register');
      } else if (path === '/ajustes') {
        setCurrentScreen('settings');
      } else if (path === '/revelar') {
        setCurrentScreen('reveal');
      } else if (path === '/jogo') {
        setCurrentScreen('gameplay');
      } else if (path === '/vitoria') {
        setCurrentScreen('victory');
      } else {
        setCurrentScreen('welcome');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Multi-Language State
  const [language, setLanguage] = React.useState<'PT' | 'EN' | 'ES'>('PT');
  const [langDropdownOpen, setLangDropdownOpen] = React.useState<boolean>(false);
  const [showCopyright, setShowCopyright] = React.useState<boolean>(false);
  const t = translations[language];

  // Game configuration states
  const [gameMode, setGameMode] = React.useState<GameMode>('classico');
  const [numMatches, setNumMatches] = React.useState<number>(3);
  const [durationMinutes, setDurationMinutes] = React.useState<number>(4);

  // Player registration states
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = React.useState<string>('');
  const [registrationError, setRegistrationError] = React.useState<string>('');

  // Reveal screen state
  const [currentRevealIndex, setCurrentRevealIndex] = React.useState<number>(0);
  const [cardRevealed, setCardRevealed] = React.useState<boolean>(false);
  const [isPeeking, setIsPeeking] = React.useState<boolean>(false);
  const [dragOffset, setDragOffset] = React.useState<number>(0);
  const revealTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Gameplay state
  const [currentMatch, setCurrentMatch] = React.useState<number>(1);
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = React.useState<boolean>(false);
  const [selectedPlayerToEliminate, setSelectedPlayerToEliminate] = React.useState<Player | null>(null);

  // Result / Victory states
  const [winnerRole, setWinnerRole] = React.useState<'assassino' | 'detetive' | 'draw'>('draw');
  const [victoryReason, setVictoryReason] = React.useState<string>('');
  const [victoryCondition, setVictoryCondition] = React.useState<'assassin_found' | 'detective_winked' | 'victims_dead' | 'time_out' | null>(null);
  const [victoryTarget, setVictoryTarget] = React.useState<string>('');

  const getVictoryMessage = (winner: 'assassino' | 'detetive', condition: 'assassin_found' | 'detective_winked' | 'victims_dead' | 'time_out', targetName?: string) => {
    if (language === 'PT') {
      if (condition === 'assassin_found') return `O Assassino (${targetName}) foi descoberto na malha de eliminação! Vitória do Detetive!`;
      if (condition === 'detective_winked') return `O Assassino piscou para o Detetive (${targetName})! O Detetive identificou a piscada a tempo e o Assassino perdeu!`;
      if (condition === 'victims_dead') return 'Todas as vítimas foram eliminadas! Restam apenas o Assassino e o Detetive. O Assassino venceu!';
      return 'O tempo acabou! O Assassino não conseguiu eliminar as vítimas a tempo.';
    } else if (language === 'EN') {
      if (condition === 'assassin_found') return `The Assassin (${targetName}) was discovered in the elimination grid! Detective wins!`;
      if (condition === 'detective_winked') return `The Assassin winked at the Detective (${targetName})! The Detective identified the wink in time and the Assassin lost!`;
      if (condition === 'victims_dead') return 'All victims have been eliminated! Only the Assassin and Detective remain. The Assassin wins!';
      return 'Time ran out! The Assassin failed to eliminate the victims in time.';
    } else { // ES
      if (condition === 'assassin_found') return `¡El Asesino (${targetName}) fue descubierto en la malla de eliminación! ¡Victoria del Detective!`;
      if (condition === 'detective_winked') return `¡El Asesino le guiñó el ojo al Detective (${targetName})! ¡El Detective identificó el guiño a tiempo y el Asesino perdió!`;
      if (condition === 'victims_dead') return '¡Todas las víctimas han sido eliminadas! Solo quedan el Asesino y el Detective. ¡El Asesino gana!';
      return 'Se acabó el tiempo. El Asesino no logró eliminar a las víctimas a tiempo.';
    }
  };

  const victoryReasonText = victoryCondition 
    ? getVictoryMessage(winnerRole === 'assassino' ? 'assassino' : 'detetive', victoryCondition, victoryTarget)
    : victoryReason;

  // End Game Transition defined early to avoid temporal dead zone issues
  const handleEndGame = React.useCallback((winner: 'assassino' | 'detetive' | 'draw', reason: string, condition?: 'assassin_found' | 'detective_winked' | 'victims_dead' | 'time_out', targetName?: string) => {
    setIsTimerRunning(false);
    setWinnerRole(winner);
    setVictoryReason(reason);
    if (condition) {
      setVictoryCondition(condition);
    } else {
      setVictoryCondition(null);
    }
    if (targetName) {
      setVictoryTarget(targetName);
    } else {
      setVictoryTarget('');
    }
    if (winner === 'assassino') {
      try { synth.playFailure(); } catch (e) {}
    } else {
      try { synth.playSuccess(); } catch (e) {}
    }
    setTimeout(() => {
      setCurrentScreen('victory');
    }, 600);
  }, []);

  // Toggle Sound Wrapper
  const toggleSound = () => {
    synth.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    try {
      synth.playClick();
    } catch (e) {}
  };

  // Preloader count-up simulation
  React.useEffect(() => {
    if (currentScreen !== 'preloader') return;

    const messages = [
      { prg: 20, msg: t.preloaderMsgs[0] || 'Amolando a adaga misteriosa... 🗡️' },
      { prg: 40, msg: t.preloaderMsgs[1] || 'Limpando as lentes da lupa... 🔍' },
      { prg: 60, msg: t.preloaderMsgs[2] || 'Embaralhando papéis e álibis... 🃏' },
      { prg: 80, msg: t.preloaderMsgs[3] || 'Inspecionando os arredores em silêncio... 👀' },
      { prg: 95, msg: t.preloaderMsgs[4] || 'Tudo pronto. Quem é o culpado? 🤫' }
    ];

    const interval = setInterval(() => {
      setPreloaderProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const path = initialPathRef.current;
            if (path === '/jogadores') {
              setCurrentScreen('register');
            } else if (path === '/ajustes') {
              setCurrentScreen('settings');
            } else if (path === '/revelar') {
              if (players.length < 3) {
                const seeds = ['Romeu', 'Vicente', 'Miguel', 'Beatriz', 'Sofia'];
                const seededPlayers: Player[] = seeds.map((name, index) => ({
                  id: Math.random().toString(36).substring(2, 9),
                  name,
                  role: index === 0 ? 'assassino' : index === 1 ? 'detetive' : 'vitima',
                  status: 'vivo',
                  avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length]
                }));
                setPlayers(seededPlayers);
              }
              setCurrentScreen('reveal');
            } else if (path === '/jogo') {
              if (players.length < 3) {
                const seeds = ['Romeu', 'Vicente', 'Miguel', 'Beatriz', 'Sofia'];
                const seededPlayers: Player[] = seeds.map((name, index) => ({
                  id: Math.random().toString(36).substring(2, 9),
                  name,
                  role: index === 0 ? 'assassino' : index === 1 ? 'detetive' : 'vitima',
                  status: 'vivo',
                  avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length]
                }));
                setPlayers(seededPlayers);
                setTimeLeft(durationMinutes * 60);
                setIsTimerRunning(true);
              }
              setCurrentScreen('gameplay');
            } else if (path === '/vitoria') {
              if (players.length < 3) {
                const seeds = ['Romeu', 'Vicente', 'Miguel', 'Beatriz', 'Sofia'];
                const seededPlayers: Player[] = seeds.map((name, index) => ({
                  id: Math.random().toString(36).substring(2, 9),
                  name,
                  role: index === 0 ? 'assassino' : index === 1 ? 'detetive' : 'vitima',
                  status: 'vivo',
                  avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length]
                }));
                setPlayers(seededPlayers);
              }
              setCurrentScreen('victory');
            } else {
              setCurrentScreen('welcome');
            }
          }, 400);
          return 100;
        }

        const currentMsg = messages.find((m) => next <= m.prg);
        if (currentMsg) {
          setPreloaderMessage(currentMsg.msg);
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentScreen, durationMinutes, players.length, t.preloaderMsgs]);

  // General click sound hook
  const triggerClick = () => {
    try {
      synth.playClick();
    } catch (e) {}
  };

  // Quick Seed helper to register 5 player names immediately
  const handleQuickSeed = () => {
    triggerClick();
    const seeds = ['Romeu', 'Vicente', 'Miguel', 'Beatriz', 'Sofia'];
    const seededPlayers: Player[] = seeds.map((name, index) => ({
      id: Math.random().toString(36).substring(2, 9),
      name,
      role: 'vitima',
      status: 'vivo',
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length]
    }));
    setPlayers(seededPlayers);
    setRegistrationError('');
  };

  // Add a single player
  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerClick();

    const trimmed = newPlayerName.trim();
    if (!trimmed) {
      setRegistrationError('O nome não pode estar em branco.');
      return;
    }

    if (players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setRegistrationError('Este jogador já está cadastrado.');
      return;
    }

    if (players.length >= 24) {
      setRegistrationError('Limite máximo de 24 jogadores atingido.');
      return;
    }

    const newPlayer: Player = {
      id: Math.random().toString(36).substring(2, 9),
      name: trimmed,
      role: 'vitima',
      status: 'vivo',
      avatarColor: AVATAR_COLORS[players.length % AVATAR_COLORS.length]
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    setRegistrationError('');
  };

  // Remove player
  const handleRemovePlayer = (id: string) => {
    triggerClick();
    setPlayers(players.filter(p => p.id !== id));
  };

  // Start Lottery and assign secret roles
  const handleStartLottery = () => {
    triggerClick();
    if (players.length < 3) {
      setRegistrationError('É necessário cadastrar pelo menos 3 jogadores.');
      setCurrentScreen('register');
      return;
    }

    // Assign roles randomly
    // Sorteio rules: Exactly 1 Assassin, Exactly 1 Detective, all others Victims.
    let shuffledIndices = Array.from({ length: players.length }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    const assassinIdx = shuffledIndices[0];
    const detetiveIdx = shuffledIndices[1];

    const assignedPlayers = players.map((player, index) => {
      let role: 'assassino' | 'detetive' | 'vitima' = 'vitima';
      if (index === assassinIdx) {
        role = 'assassino';
      } else if (index === detetiveIdx) {
        role = 'detetive';
      }
      return {
        ...player,
        role,
        status: 'vivo' as const
      };
    });

    setPlayers(assignedPlayers);
    setCurrentRevealIndex(0);
    setCardRevealed(false);
    setDragOffset(0);
    setCurrentScreen('reveal');
  };

  // Progress through the reveal sequence
  const handleNextReveal = () => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (currentRevealIndex < players.length - 1) {
      triggerClick();
      setCurrentRevealIndex(currentRevealIndex + 1);
      setCardRevealed(false);
      setIsPeeking(false);
      setDragOffset(0);
    } else {
      // Finished all reveals! Launch the Match.
      triggerClick();
      setTimeLeft(durationMinutes * 60);
      setIsTimerRunning(true);
      setCurrentScreen('gameplay');
    }
  };

  // Helper hints for peeking state closure
  const getCloseHint = () => {
    if (language === 'PT') return 'Toque para fechar e esconder';
    if (language === 'ES') return 'Toca para cerrar y ocultar';
    return 'Tap to close and hide';
  };

  const getCloseSubHint = () => {
    if (language === 'PT') return 'O botão aparecerá ao fechar';
    if (language === 'ES') return 'El botón aparecerá al cerrar';
    return 'The button will appear when closed';
  };

  // Toggle reveal state (either via click or swipe)
  const handleRevealCard = () => {
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    if (!isPeeking) {
      try {
        synth.playReveal();
      } catch (e) {}
      setIsPeeking(true);

      // Auto return (close) after 0.7 seconds (bounce effect: hit up and come back down)
      revealTimeoutRef.current = setTimeout(() => {
        setIsPeeking(false);
        setCardRevealed(true);
        revealTimeoutRef.current = null;
      }, 700);
    } else {
      // If clicked again while peeking, close immediately
      setIsPeeking(false);
      setCardRevealed(true);
    }
  };

  // Cleanup reveal timeout on unmount
  React.useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  // Gameplay Loop Core Timer
  React.useEffect(() => {
    if (currentScreen !== 'gameplay' || !isTimerRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            handleEndGame('detetive', 'O tempo acabou! O Assassino não conseguiu eliminar as vítimas a tempo.');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScreen, isTimerRunning, handleEndGame]);

  // Format time (e.g. 240 -> "04:00")
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Handle Player Elimination (called after modal confirmation)
  const handleConfirmElimination = () => {
    if (!selectedPlayerToEliminate) return;
    triggerClick();

    const targetId = selectedPlayerToEliminate.id;
    const updatedPlayers = players.map(p => {
      if (p.id === targetId) {
        return { ...p, status: 'morto' as const };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    setSelectedPlayerToEliminate(null);

    // Analyze Game Over conditions IMMEDIATELY after elimination is applied:
    const killedPlayer = players.find(p => p.id === targetId);
    if (!killedPlayer) return;

    // RULE 1: If the Assassin is clicked / eliminated: DETECTIVE wins!
    if (killedPlayer.role === 'assassino') {
      handleEndGame('detetive', `O Assassino (${killedPlayer.name}) foi descoberto na malha de eliminação! Vitória do Detetive!`);
      return;
    }

    // RULE 2: If the Assassin winks at the Detective (and Detective dies): Assassin loses, Detective wins!
    // "se o assassino piscar para o detetive, o jogo encerra e o assassino perde."
    if (killedPlayer.role === 'detetive') {
      handleEndGame('detetive', `O Assassino piscou para o Detetive (${killedPlayer.name})! O Detetive identificou a piscada a tempo e o Assassino perdeu!`);
      return;
    }

    // Now look at remaining alive players to check if only Assassin and Detective remain
    const alivePlayers = updatedPlayers.filter(p => p.status === 'vivo');
    const aliveVictims = alivePlayers.filter(p => p.role === 'vitima');

    // RULE 3: If only the Assassin and Detective remain in the game (no victims alive) -> ASSASSIN wins!
    // "quando só restar o assassino e o detetive no jogo, imediatamente o cronometro para. se só restar o assassino e o detetive, o assassino é o vencedor"
    if (aliveVictims.length === 0) {
      handleEndGame('assassino', 'Todas as vítimas foram eliminadas! Restam apenas o Assassino e o Detetive. O Assassino venceu!');
      return;
    }
  };

  // Play Again: Keep players and settings, restart lottery and reveal flow
  const handlePlayAgain = () => {
    triggerClick();
    handleStartLottery();
  };

  // Exit game completely: go back to Welcome Screen
  const handleExitToHome = () => {
    triggerClick();
    setCurrentScreen('welcome');
  };

  return (
    <main id="app-container" style={{ zoom: '1.0' } as React.CSSProperties} className="bg-gradient-to-br from-brand-lavender/10 via-brand-cream/30 to-brand-sage/15 text-brand-green h-screen max-h-screen overflow-hidden font-sans antialiased relative flex flex-col justify-start selection:bg-brand-lavender/40">
      
      {/* Soft light glowing backgrounds in corners mimicking the dashboard environment */}
      <div id="ambient-glow-left" className="absolute top-10 left-10 w-96 h-96 bg-brand-cream/40 rounded-full blur-3xl pointer-events-none" />
      <div id="ambient-glow-right" className="absolute bottom-10 right-10 w-96 h-96 bg-brand-lavender/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar - Styled as a Cream Pill exactly like the attached image */}
      <div id="header-wrapper" className="z-10 px-4 pt-4 pb-0 max-w-7xl w-full mx-auto">
        <header id="main-header" className="bg-brand-cream border border-brand-sage/40 shadow-md rounded-[1.8rem] px-4 sm:px-6 py-3 flex items-center justify-between text-brand-green">
          <div className="flex items-center gap-3">
            {/* Green Badge brand logo block mimicking the circular check logo from the image */}
            <div 
              onClick={() => { triggerClick(); setCurrentScreen('welcome'); }}
              className="bg-brand-green w-9 h-9 rounded-full flex items-center justify-center text-brand-cream font-bold shadow-md shadow-emerald-950/10 font-orbitron cursor-pointer hover:bg-brand-green/90 transition-all"
            >
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <h1 
                onClick={() => { triggerClick(); setCurrentScreen('welcome'); }}
                className="text-xs font-black tracking-wider uppercase text-brand-green font-orbitron cursor-pointer"
              >
                {t.impostor}
              </h1>
              <p className="text-[9px] text-brand-sage font-mono font-medium tracking-wide hidden sm:block">{t.offlineMode}</p>
            </div>
          </div>

          {/* Right Toolbar area: Quit button, profile avatar, and hamburger menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Exit button if inside an active game flow */}
            {['register', 'settings', 'reveal', 'gameplay', 'victory'].includes(currentScreen) && (
              <button
                id="quit-game-btn"
                onClick={handleExitToHome}
                className="p-2 px-3 sm:px-3.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 hover:text-rose-800 border border-rose-500/20 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold font-orbitron cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.exit}</span>
              </button>
            )}

            {/* Profile Avatar mockup without ME text */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-green to-brand-lavender border-2 border-brand-cream shadow-md flex items-center justify-center text-brand-cream">
              <User className="w-3.5 h-3.5 text-brand-cream" />
            </div>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => { triggerClick(); setMenuOpen(true); }}
              className="p-2 rounded-full bg-brand-lavender/30 hover:bg-brand-lavender/50 text-brand-green border border-brand-lavender/50 transition-all active:scale-95 cursor-pointer md:hidden flex items-center justify-center"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>
      </div>

      {/* Main Content Viewport with left margin adjusted since side ribbon is summarized in hamburger */}
      <div id="content-layout" className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-3 sm:px-4 pt-2 sm:pt-3 pb-4 sm:pb-6 flex gap-6 items-stretch relative animate-fade-in">
        
        {/* Desktop Sidebar - Persistent on Desktop, hidden on Mobile */}
        <aside id="desktop-sidebar" className="hidden md:flex flex-col justify-between w-64 bg-brand-cream border border-brand-sage/40 rounded-[2rem] p-6 shadow-md text-brand-green h-full shrink-0">
          <div className="space-y-6">
            <div className="text-[10px] font-black tracking-widest text-brand-sage uppercase font-orbitron px-2">
              Menu
            </div>
            
            {/* Navigation Links */}
            <nav className="flex flex-col gap-2">
              {/* Painel link */}
              <button
                onClick={() => {
                  triggerClick();
                  setCurrentScreen('welcome');
                }}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm cursor-pointer ${
                  currentScreen === 'welcome'
                    ? 'bg-brand-green text-brand-cream shadow-md shadow-brand-green/10'
                    : 'hover:bg-brand-lavender/25 text-brand-green/90'
                }`}
              >
                <Play className={`w-4 h-4 ${currentScreen === 'welcome' ? 'fill-brand-cream text-brand-cream' : 'text-brand-sage'}`} />
                <span className="font-orbitron text-[11px] tracking-wider uppercase">{t.panel}</span>
              </button>

              {/* Jogadores link */}
              <button
                onClick={() => {
                  triggerClick();
                  setCurrentScreen('register');
                }}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm cursor-pointer ${
                  currentScreen === 'register' || currentScreen === 'reveal'
                    ? 'bg-brand-green text-brand-cream shadow-md shadow-brand-green/10'
                    : 'hover:bg-brand-lavender/25 text-brand-green/90'
                }`}
              >
                <Users className={`w-4 h-4 ${currentScreen === 'register' || currentScreen === 'reveal' ? 'text-brand-cream' : 'text-brand-sage'}`} />
                <span className="font-orbitron text-[11px] tracking-wider uppercase">{t.players}</span>
              </button>

              {/* Ajustes link */}
              <button
                onClick={() => {
                  triggerClick();
                  setCurrentScreen('settings');
                }}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm cursor-pointer ${
                  currentScreen === 'settings'
                    ? 'bg-brand-green text-brand-cream shadow-md shadow-brand-green/10'
                    : 'hover:bg-brand-lavender/25 text-brand-green/90'
                }`}
              >
                <SettingsIcon className={`w-4 h-4 ${currentScreen === 'settings' ? 'text-brand-cream' : 'text-brand-sage'}`} />
                <span className="font-orbitron text-[11px] tracking-wider uppercase">{t.settings}</span>
              </button>

              {/* Copyright / Info link */}
              <button
                onClick={() => {
                  triggerClick();
                  setShowCopyright(true);
                }}
                className="w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-brand-lavender/25 text-brand-green/90 transition-all font-bold text-sm cursor-pointer"
              >
                <Info className="w-4 h-4 text-brand-sage" />
                <span className="font-orbitron text-[11px] tracking-wider uppercase">Info</span>
              </button>
            </nav>
          </div>

          {/* Bottom Section - sound and language */}
          <div className="space-y-4 pt-4 border-t border-brand-sage/20">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-brand-sage font-orbitron">{t.sounds}</span>
              <button
                onClick={toggleSound}
                className="p-1.5 px-3 rounded-full bg-brand-lavender/30 hover:bg-brand-lavender/50 active:scale-95 border border-brand-lavender/50 transition-all text-brand-green flex items-center gap-1.5 text-xs font-bold font-orbitron cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-brand-green" /> : <VolumeX className="w-3.5 h-3.5 text-brand-sage" />}
                <span className="text-[9px] uppercase font-mono tracking-wide">{soundEnabled ? (language === 'PT' ? 'Ativo' : 'On') : (language === 'PT' ? 'Mudo' : 'Muted')}</span>
              </button>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-brand-sage uppercase tracking-wider font-orbitron block">
                {language === 'PT' ? 'Idioma' : language === 'EN' ? 'Language' : 'Idioma'}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-brand-lavender/35 p-1 rounded-xl border border-brand-lavender/40">
                {(['PT', 'EN', 'ES'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      triggerClick();
                      setLanguage(lang);
                    }}
                    className={`py-1 text-[10px] font-black font-orbitron rounded-lg transition-all cursor-pointer ${
                      language === lang
                        ? 'bg-brand-green text-brand-cream shadow-sm'
                        : 'text-brand-green/70 hover:bg-brand-lavender/20'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <div id="interactive-pane" className="flex-1 relative w-full h-full overflow-y-auto pr-1 scrollbar-thin">
          <div className="min-h-full flex flex-col justify-center py-2 w-full">
            <AnimatePresence mode="wait">

            {/* 1. PRELOADER VIEW */}
            {currentScreen === 'preloader' && (
              <motion.div 
                key="preloader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-12 max-w-md mx-auto w-full"
              >
                <div className="bg-brand-cream border border-brand-sage/40 rounded-[2rem] shadow-xl p-8 w-full flex flex-col items-center">
                  {/* Circular Spinner Emblem */}
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full border-4 border-brand-lavender/20 border-t-brand-green animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Fingerprint className="w-10 h-10 text-brand-green animate-pulse" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-brand-green font-orbitron">
                    {t.installingMystery}
                  </h2>
                  <p className="text-brand-sage text-xs mt-2 max-w-xs px-4 font-medium">
                    {t.preloaderSub}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-brand-lavender/30 h-2 rounded-full mt-8 overflow-hidden">
                    <div 
                      className="bg-brand-green h-full rounded-full transition-all duration-300"
                      style={{ width: `${preloaderProgress}%` }}
                    />
                  </div>
                  <div className="text-xs font-mono text-brand-green mt-3 font-bold font-orbitron">
                    {preloaderProgress}%
                  </div>

                  {/* Real-time message */}
                  <div className="text-xs text-brand-sage mt-4 h-5 italic font-medium">
                    {preloaderMessage}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. WELCOME / HOME VIEW - Rich Bento Grid styled exactly like the attached image */}
            {currentScreen === 'welcome' && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch w-full"
              >
                {/* BENTO CARD 1: Large Cream/Vanilla Hero Dashboard Panel */}
                <div id="bento-hero-card" className="bg-brand-cream border border-brand-sage/40 rounded-[2rem] p-8 shadow-md text-brand-green md:col-span-2 flex flex-col justify-between relative overflow-hidden">

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold uppercase tracking-widest text-brand-sage font-orbitron">
                          {t.impostor.toUpperCase()} DASHBOARD
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-brand-green font-orbitron">
                          {t.investigationPanel}
                        </h2>
                      </div>
                      <div className="bg-brand-lavender/30 border border-brand-lavender text-brand-green text-[10px] px-3 py-1.5 rounded-full font-mono font-bold font-orbitron whitespace-nowrap self-start sm:self-center sm:mt-1">
                        {t.localMode}
                      </div>
                    </div>
                    
                    <p className="text-brand-green/80 text-sm max-w-lg mt-2 leading-relaxed">
                      {t.welcomeDescription}
                    </p>
                  </div>

                  {/* Quick features block */}
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    <div className="bg-brand-lavender/25 p-3.5 rounded-2xl border border-brand-lavender/40 text-center">
                      <span className="text-xl block">👥</span>
                      <span className="text-[11px] font-extrabold text-brand-green block mt-1 font-orbitron">{t.playersRange}</span>
                    </div>
                    <div className="bg-brand-lavender/25 p-3.5 rounded-2xl border border-brand-lavender/40 text-center">
                      <span className="text-xl block">🤫</span>
                      <span className="text-[11px] font-extrabold text-brand-green block mt-1 font-orbitron">{t.secretDraw}</span>
                    </div>
                    <div className="bg-brand-lavender/25 p-3.5 rounded-2xl border border-brand-lavender/40 text-center">
                      <span className="text-xl block">⏱️</span>
                      <span className="text-[11px] font-extrabold text-brand-green block mt-1 font-orbitron">{t.customTime}</span>
                    </div>
                  </div>
                </div>

                {/* BENTO CARD 2: Savings style Dark Purple-Navy card representing active roles count */}
                <div id="bento-roles-card" className="bg-brand-green text-brand-cream rounded-[2rem] p-6 shadow-xl flex flex-col justify-between border border-brand-sage/20">
                  <div>
                    <h3 className="text-xs font-black tracking-widest text-brand-cream/80 uppercase font-orbitron">
                      {t.roleDistribution}
                    </h3>
                    <p className="text-[10px] text-brand-cream/60 mt-1 font-medium">{t.autoDrawFormula}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 my-6">
                    {/* Active Funds sub-card imitation (Vivid Blue) representing Assassin */}
                    <div className="bg-brand-cream/15 text-brand-cream rounded-[1.5rem] p-4 flex items-center justify-between border border-brand-cream/20 shadow-lg">
                      <div>
                        <span className="text-[10px] font-black uppercase text-brand-lavender tracking-wide block font-orbitron">{t.assassinRoleName}</span>
                        <p className="text-xs text-brand-cream/80 mt-0.5 font-medium">{t.assassinBrief}</p>
                      </div>
                      <span className="text-3xl font-black text-brand-cream font-orbitron">1</span>
                    </div>

                    {/* Funds Saved sub-card imitation (Sage Green) representing Detective */}
                    <div className="bg-brand-lavender text-brand-green rounded-[1.5rem] p-4 flex items-center justify-between shadow-lg">
                      <div>
                        <span className="text-[10px] font-black uppercase text-brand-green tracking-wide block font-orbitron">{t.detectiveRoleName}</span>
                        <p className="text-xs text-brand-green/80 mt-0.5 font-medium">{t.detectiveBrief}</p>
                      </div>
                      <span className="text-3xl font-black text-brand-green font-orbitron">1</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-brand-cream/70 leading-normal font-medium">
                    {t.victimBrief}
                  </p>
                </div>

                {/* BENTO CARD 3: Horizontal Lavender Action card for initiating game play */}
                <div id="bento-action-card" className="bg-brand-lavender text-brand-green border border-brand-lavender/40 rounded-[2rem] p-8 shadow-md md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1.5 text-center md:text-left">
                    <h4 className="text-xl font-extrabold text-brand-green font-orbitron">{t.readyToStart}</h4>
                    <p className="text-xs text-brand-green/80 max-w-xl font-medium">
                      {t.readyToStartSub}
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      triggerClick();
                      setCurrentScreen('register');
                    }}
                    className="flex-shrink-0 w-full md:w-auto bg-brand-green hover:bg-brand-green/90 text-brand-cream py-4 px-8 rounded-full font-black text-sm shadow-xl shadow-brand-green/20 active:scale-95 transition-all text-center cursor-pointer font-orbitron tracking-wider"
                  >
                    {t.registerBtn}
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. PLAYER REGISTRATION VIEW */}
            {currentScreen === 'register' && (
              <motion.div 
                key="register"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-md mx-auto w-full space-y-6"
              >
                <div className="bg-brand-cream border border-brand-sage/40 rounded-[2.2rem] p-6 sm:p-8 shadow-xl text-brand-green space-y-6">
                  
                  <div className="text-center space-y-1">
                    <div className="inline-flex p-3 bg-brand-lavender/30 border border-brand-lavender rounded-full mb-2 text-brand-green">
                      <Users className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-brand-green font-orbitron">{t.addPlayersTitle}</h2>
                    <p className="text-xs text-brand-sage font-medium">
                      {t.addPlayersSub}
                    </p>
                  </div>

                  {/* Registered players counter badge */}
                  <div className="flex items-center justify-between bg-brand-lavender/20 px-4 py-3 rounded-2xl border border-brand-lavender/30">
                    <span className="text-xs font-bold text-brand-green flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                      {t.registeredPlayersBadge}
                    </span>
                    <span className="text-xs font-mono font-bold bg-brand-green text-brand-cream px-2.5 py-0.5 rounded-full font-orbitron">
                      {players.length} {t.registeredPlayersActive}
                    </span>
                  </div>

                  {/* Error dialog */}
                  {registrationError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      <span>{registrationError}</span>
                    </div>
                  )}



                  {/* List of registered players */}
                  {players.length > 0 && (
                    <div className="max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                      {players.map((player) => (
                        <div 
                          key={player.id}
                          className="flex items-center justify-between bg-brand-lavender/15 border border-brand-lavender/25 rounded-2xl p-3.5 transition-all hover:bg-brand-lavender/25"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${player.avatarColor} text-white flex items-center justify-center font-bold text-xs uppercase shadow-md`}>
                              {player.name.charAt(0)}
                            </div>
                            <span className="text-sm font-black text-brand-green">{player.name}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemovePlayer(player.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 hover:text-rose-700 transition-colors"
                            title="Remover jogador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input form */}
                  <form onSubmit={handleAddPlayer} className="flex gap-2">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      maxLength={16}
                      className="flex-1 bg-white border border-brand-sage/40 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green placeholder:text-brand-sage/60 text-brand-green font-bold"
                    />
                    <button
                      type="submit"
                      className="bg-brand-green hover:bg-brand-green/90 text-brand-cream p-3.5 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-md"
                      title={t.registerPlayerBtnTitle}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>

                  {/* Main Action buttons */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        triggerClick();
                        if (players.length < 3) {
                          setRegistrationError(t.minPlayersError);
                        } else {
                          setRegistrationError('');
                          setCurrentScreen('settings');
                        }
                      }}
                      className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-cream py-4 rounded-2xl font-black text-sm shadow-lg shadow-brand-green/20 transition-all flex items-center justify-center gap-2 active:scale-95 font-orbitron tracking-wider"
                    >
                      <span>{t.advanceToSettings}</span>
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 4. SETTINGS VIEW */}
            {currentScreen === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-md mx-auto w-full space-y-6"
              >
                <div className="bg-brand-cream border border-brand-sage/40 rounded-[2.2rem] p-6 sm:p-8 shadow-xl text-brand-green space-y-6">
                  
                  <div className="text-center space-y-1">
                    <div className="inline-flex p-3 bg-brand-lavender/30 border border-brand-lavender rounded-full mb-2 text-brand-green">
                      <SettingsIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-brand-green font-orbitron">{t.settingsTitle}</h2>
                    <p className="text-xs text-brand-sage font-medium">
                      {t.settingsSub}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Players summaries */}
                    <div className="bg-brand-lavender/20 border border-brand-lavender/30 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-brand-lavender/30 p-2.5 rounded-xl border border-brand-lavender/40 text-brand-green">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-brand-sage uppercase tracking-wider font-orbitron">{t.membersTitle}</h4>
                          <p className="text-sm font-black text-brand-green mt-0.5">{players.length} {t.peopleReady}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { triggerClick(); setCurrentScreen('register'); }}
                        className="text-xs text-brand-green hover:text-brand-green/80 font-black bg-white hover:bg-brand-lavender/15 px-3 py-1.5 rounded-full border border-brand-sage/30 shadow-sm transition-all font-orbitron"
                      >
                        {t.manageBtn}
                      </button>
                    </div>

                    {/* Number of Matches setting */}
                    <div className="bg-brand-lavender/10 border border-brand-lavender/20 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-brand-green" />
                          <span className="text-xs font-black text-brand-sage uppercase tracking-wider font-orbitron">{t.matchesNum}</span>
                        </div>
                        <span className="text-sm font-mono font-black text-brand-green font-orbitron">{numMatches} {numMatches === 1 ? t.matchLabel : t.matchesLabel}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { triggerClick(); if (numMatches > 1) setNumMatches(numMatches - 1); }}
                          className="flex-1 bg-white hover:bg-brand-lavender/10 py-2.5 rounded-xl font-bold border border-brand-sage/30 shadow-sm transition-colors text-brand-green text-xs active:scale-95 font-orbitron"
                        >
                          {t.sub1Match}
                        </button>
                        <button 
                          onClick={() => { triggerClick(); if (numMatches < 10) setNumMatches(numMatches + 1); }}
                          className="flex-1 bg-white hover:bg-brand-lavender/10 py-2.5 rounded-xl font-bold border border-brand-sage/30 shadow-sm transition-colors text-brand-green text-xs active:scale-95 font-orbitron"
                        >
                          {t.add1Match}
                        </button>
                      </div>
                    </div>

                    {/* Duration setting */}
                    <div className="bg-brand-lavender/10 border border-brand-lavender/20 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-brand-green" />
                          <span className="text-xs font-black text-brand-sage uppercase tracking-wider font-orbitron">{t.timeLimit}</span>
                        </div>
                        <span className="text-sm font-mono font-black text-brand-green font-orbitron">{durationMinutes} {t.minutes}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { triggerClick(); if (durationMinutes > 1) setDurationMinutes(durationMinutes - 1); }}
                          className="flex-1 bg-white hover:bg-brand-lavender/10 py-2.5 rounded-xl font-bold border border-brand-sage/30 shadow-sm transition-colors text-brand-green text-xs active:scale-95 font-orbitron"
                        >
                          {t.sub1Min}
                        </button>
                        <button 
                          onClick={() => { triggerClick(); if (durationMinutes < 15) setDurationMinutes(durationMinutes + 1); }}
                          className="flex-1 bg-white hover:bg-brand-lavender/10 py-2.5 rounded-xl font-bold border border-brand-sage/30 shadow-sm transition-colors text-brand-green text-xs active:scale-95 font-orbitron"
                        >
                          {t.add1Min}
                        </button>
                      </div>
                    </div>

                    {/* Info details */}
                    <div className="bg-brand-lavender/30 border border-brand-lavender/40 rounded-2xl p-4 flex gap-3 text-brand-green text-xs leading-relaxed font-medium">
                      <Info className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                      <p>
                        {t.lotteryConfigInfo.replace('{victimsCount}', Math.max(0, players.length - 2).toString())}
                      </p>
                    </div>
                  </div>

                  {/* Trigger Game Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleStartLottery}
                      className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-cream py-4 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 font-orbitron tracking-wider"
                    >
                      <Play className="w-5 h-5 fill-brand-cream text-brand-cream" />
                      {t.startLotteryBtn}
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 5. ROLE REVEAL STEP */}
            {currentScreen === 'reveal' && (
              <motion.div 
                key="reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto w-full space-y-6"
              >
                <div className="bg-brand-cream border border-brand-sage/40 rounded-[2.2rem] p-6 sm:p-8 shadow-xl text-brand-green space-y-6 text-center">
                  
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-brand-green font-orbitron bg-brand-lavender/30 px-3.5 py-1 rounded-full border border-brand-lavender">
                      {t.secretRevealTitle}
                    </span>
                    <h2 className="text-2xl font-black text-brand-green mt-3 font-orbitron">{t.whoAreYou}</h2>
                    <p className="text-xs text-brand-sage font-medium">
                      {t.revealPassSub}
                    </p>
                  </div>

                  {/* Reveal Canvas Area */}
                  <div className="flex flex-col items-center justify-center py-2">
                    
                    {/* Reveal card frame */}
                    <div className="relative w-80 h-[380px] bg-brand-green rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-6 border border-brand-sage/20">
                      
                      {/* Underlay revealed role (underneath) */}
                      <div className="absolute inset-x-6 top-6 bottom-6 flex flex-col items-center justify-center text-center space-y-4 pointer-events-none">
                        <motion.div
                          key={currentRevealIndex}
                          initial={{ opacity: 0.4, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', damping: 20 }}
                          className="flex flex-col items-center text-center space-y-4"
                        >
                          {players[currentRevealIndex]?.role === 'assassino' ? (
                            <>
                              <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-4xl shadow-lg">
                                🕵️‍♀️
                              </div>
                              <h3 className="text-2xl font-black text-rose-300 tracking-tight uppercase font-orbitron">
                                {t.assassinRoleName}
                              </h3>
                              <p className="text-xs text-brand-cream/80 max-w-[240px] leading-relaxed font-medium">
                                {t.roleAssassinDesc}
                              </p>
                              <div className="text-[9px] font-mono uppercase bg-rose-500/25 text-rose-200 px-2.5 py-1 rounded border border-rose-500/30 font-bold tracking-wide font-orbitron">
                                {t.avoidAccused}
                              </div>
                            </>
                          ) : players[currentRevealIndex]?.role === 'detetive' ? (
                            <>
                              <div className="w-20 h-20 rounded-2xl bg-brand-lavender/25 border border-brand-lavender/40 flex items-center justify-center text-4xl shadow-lg">
                                🔍
                              </div>
                              <h3 className="text-2xl font-black text-brand-lavender tracking-tight uppercase font-orbitron">
                                {t.detectiveRoleName}
                              </h3>
                              <p className="text-xs text-brand-cream/80 max-w-[240px] leading-relaxed font-medium">
                                {t.roleDetectiveDesc}
                              </p>
                              <div className="text-[9px] font-mono uppercase bg-brand-lavender/30 text-brand-lavender px-2.5 py-1 rounded border border-brand-lavender/40 font-bold tracking-wide font-orbitron">
                                {t.carefulGaze}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-20 h-20 rounded-2xl bg-brand-cream/15 border border-brand-cream/25 flex items-center justify-center text-4xl shadow-lg">
                                👤
                              </div>
                              <h3 className="text-2xl font-black text-brand-cream/90 tracking-tight uppercase font-orbitron">
                                {t.victimText}
                              </h3>
                              <p className="text-xs text-brand-cream/70 max-w-[240px] leading-relaxed font-medium">
                                {t.roleVictimDesc}
                              </p>
                              <div className="text-[9px] font-mono uppercase bg-brand-cream/20 text-brand-cream/80 px-2.5 py-1 rounded border border-brand-cream/30 font-bold tracking-wide font-orbitron">
                                {t.trySurvive}
                              </div>
                            </>
                          )}
                        </motion.div>
                      </div>

                      {/* Overlaid sliding card */}
                      <motion.div 
                        drag="y"
                        dragConstraints={{ top: -320, bottom: 0 }}
                        dragElastic={0.15}
                        onDragStart={() => {
                          triggerClick();
                          if (revealTimeoutRef.current) {
                            clearTimeout(revealTimeoutRef.current);
                            revealTimeoutRef.current = null;
                          }
                          setIsPeeking(true);
                        }}
                        onDrag={(event, info) => {
                          setDragOffset(info.offset.y);
                        }}
                        onDragEnd={(event, info) => {
                          if (info.offset.y < -65) {
                            setCardRevealed(true);
                            try { synth.playReveal(); } catch (e) {}
                          }
                          setIsPeeking(false);
                          setDragOffset(0);
                        }}
                        animate={{ y: isPeeking ? -320 : 0 }}
                        style={{ pointerEvents: 'auto' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                        className="absolute inset-0 bg-brand-cream rounded-3xl p-6 flex flex-col justify-between border border-brand-sage/40 cursor-pointer shadow-2xl z-10 text-brand-green"
                        onClick={handleRevealCard}
                      >
                        {/* Slide Top */}
                        <div className="flex justify-between items-start text-brand-green">
                          <div className="bg-brand-lavender/40 border border-brand-lavender p-2 rounded-xl font-mono text-xs font-black font-orbitron">
                            {currentRevealIndex + 1} / {players.length}
                          </div>
                          <div className="text-xl">🕵️‍♂️</div>
                        </div>

                        {/* Slide Name */}
                        <div className="text-center space-y-3">
                          <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr ${players[currentRevealIndex]?.avatarColor} text-white flex items-center justify-center font-black text-2xl uppercase shadow-md`}>
                            {players[currentRevealIndex]?.name.charAt(0)}
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="text-2xl font-black text-brand-green tracking-tight font-orbitron">
                              {players[currentRevealIndex]?.name}
                            </h4>
                            <p className="text-xs text-brand-sage font-bold font-orbitron">
                              {t.cardRevealedTitle}
                            </p>
                          </div>
                        </div>

                        {/* Slide instructions */}
                        <div className="flex flex-col items-center justify-center text-center space-y-2 mt-4 text-brand-green">
                          <motion.div 
                            animate={{ y: isPeeking ? [0, 6, 0] : [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-brand-green"
                          >
                            {isPeeking ? (
                              <ArrowDown className="w-5 h-5" />
                            ) : (
                              <ArrowUp className="w-5 h-5" />
                            )}
                          </motion.div>
                          <span className="text-xs font-black tracking-wide uppercase font-orbitron">
                            {isPeeking ? getCloseHint() : t.cardSwipeTip}
                          </span>
                          <span className="text-[10px] text-brand-sage font-semibold font-orbitron">
                            {isPeeking ? getCloseSubHint() : t.cardSwipeSub}
                          </span>
                        </div>
                      </motion.div>

                    </div>

                    {/* Revealed action button (Moved Outside the card) */}
                    <motion.div 
                      animate={{ 
                        height: cardRevealed ? 64 : 0, 
                        marginTop: cardRevealed ? 24 : 0,
                        opacity: cardRevealed ? 1 : 0
                      }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="w-80 relative flex items-center justify-center overflow-hidden"
                    >
                      <AnimatePresence>
                        {cardRevealed && (
                          <motion.button
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            onClick={handleNextReveal}
                            className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-cream py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer font-orbitron"
                          >
                            {currentRevealIndex < players.length - 1 ? (
                              <>
                                <span>{t.revealNextPlayer}</span>
                                <CheckCircle className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <span>{t.revealReadyGameplay}</span>
                              </>
                            )}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* 6. GAMEPLAY LOOP VIEW */}
            {currentScreen === 'gameplay' && (
              <motion.div 
                key="gameplay"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 w-full max-w-4xl mx-auto"
              >
                {/* Responsive Bento Layout for gameplay */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Status timer block */}
                  <div className="bg-brand-cream border border-brand-sage/40 rounded-[2rem] p-6 shadow-md md:col-span-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                          <span className="text-[10px] font-black text-brand-green uppercase tracking-widest font-orbitron">{t.gameInProgress}</span>
                        </div>
                        
                        <div className="bg-brand-lavender/35 border border-brand-lavender px-3 py-1 rounded-full text-[9px] font-mono text-brand-green uppercase font-bold font-orbitron">
                          {t.roundLabel} {currentMatch} / {numMatches}
                        </div>
                      </div>

                      {/* Clock representation */}
                      <div className="flex flex-col items-center py-6">
                        <div className="flex items-center gap-1.5 text-4xl font-black font-mono tracking-tight text-brand-green select-none font-orbitron">
                          <Clock className="w-7 h-7 text-brand-green animate-pulse" />
                          <span>{formatTime(timeLeft)}</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            triggerClick();
                            setIsTimerRunning(!isTimerRunning);
                          }}
                          className={`mt-4 px-4 py-1.5 rounded-full text-xs font-black transition-all border font-orbitron ${
                            isTimerRunning 
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border-rose-500/20' 
                              : 'bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border-brand-green/20'
                          }`}
                        >
                          {isTimerRunning ? t.pauseTime : t.resumeTime}
                        </button>
                      </div>
                    </div>

                    <div className="text-center px-2 pt-4 border-t border-brand-sage/20">
                      <p className="text-[11px] text-brand-sage leading-relaxed font-semibold">
                        {t.gameplayHelp}
                      </p>
                    </div>
                  </div>

                  {/* Players list matrix representing "Recent Transactions" styling in image */}
                  <div className="bg-brand-cream border border-brand-sage/40 rounded-[2rem] p-6 shadow-md md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-brand-sage/20">
                      <h3 className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-1.5 font-orbitron">
                        <Users className="w-4 h-4 text-brand-sage" />
                        {t.eliminationGrid}
                      </h3>
                      <span className="text-[10px] font-mono text-brand-sage font-bold font-orbitron">
                        {t.clickToEliminate}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {players.map((player) => {
                        const isDead = player.status === 'morto';
                        return (
                          <button
                            type="button"
                            key={player.id}
                            onClick={() => {
                              if (!isDead) {
                                triggerClick();
                                setSelectedPlayerToEliminate(player);
                              }
                            }}
                            disabled={isDead}
                            className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between group ${
                              isDead 
                                ? 'bg-brand-lavender/10 border-dashed border-brand-lavender/35 text-brand-sage/60 opacity-60 cursor-not-allowed' 
                                : 'bg-white border-brand-sage/40 hover:border-brand-green/50 active:scale-95 cursor-pointer text-brand-green shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3 z-10">
                              <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${isDead ? 'from-slate-300 to-slate-400' : player.avatarColor} text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm`}>
                                {player.name.charAt(0)}
                              </div>
                              
                              <div>
                                <span className={`text-sm font-black block truncate max-w-[100px] ${isDead ? 'line-through text-brand-sage/60' : 'text-brand-green'}`}>
                                  {player.name}
                                </span>
                                <span className="text-[9px] font-mono block mt-0.5 tracking-wider uppercase">
                                  {isDead ? (
                                    <span className="text-rose-600 font-extrabold flex items-center gap-0.5 font-orbitron">
                                      <Skull className="w-2.5 h-2.5" /> {t.eliminatedBadge}
                                    </span>
                                  ) : (
                                    <span className="text-brand-green font-extrabold font-orbitron">● {t.aliveBadge}</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="z-10">
                              {isDead ? (
                                <X className="w-4 h-4 text-rose-500" />
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-cream border border-brand-sage/50 group-hover:bg-brand-lavender group-hover:border-brand-green transition-colors" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Rules reference card */}
                <div className="bg-brand-green text-brand-cream rounded-[2rem] p-6 shadow-xl flex gap-4 text-xs leading-relaxed items-start border border-brand-sage/20">
                  <ShieldAlert className="w-5 h-5 text-brand-cream flex-shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <p className="font-extrabold text-brand-cream uppercase tracking-wide text-[10px] font-orbitron">{t.rulesHeader}</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-brand-cream/90 font-medium">
                      <li>{t.rulesLi1}</li>
                      <li>{t.rulesLi2}</li>
                      <li>{t.rulesLi3}</li>
                    </ul>
                  </div>
                </div>

              </motion.div>
            )}

            {/* 7. VICTORY / END OF MATCH VIEW */}
            {currentScreen === 'victory' && (
              <motion.div 
                key="victory"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto w-full space-y-6"
              >
                <div className="bg-brand-cream border border-brand-sage/40 rounded-[2.2rem] p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden text-brand-green">
                  
                  {/* Decorative ambient color fill */}
                  <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${
                    winnerRole === 'assassino' ? 'from-rose-500/10' : 'from-brand-lavender/30'
                  } to-transparent pointer-events-none`} />

                  {/* Absolute X Close */}
                  <button
                    onClick={handleExitToHome}
                    className="absolute top-4 right-4 p-2 rounded-full bg-brand-lavender/30 hover:bg-brand-lavender/50 border border-brand-lavender text-brand-green transition-all active:scale-90"
                    title={t.backToMenuBtn}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Winner Trophy logo */}
                  <div className="inline-flex relative">
                    <div className={`absolute inset-0 blur-2xl rounded-full ${
                      winnerRole === 'assassino' ? 'bg-rose-500/20' : 'bg-brand-lavender/35'
                    }`} />
                    <div className="relative text-6xl py-2 select-none filter drop-shadow-xl animate-bounce">
                      🏆
                    </div>
                  </div>

                  {/* Winner descriptions */}
                  <div className="space-y-2 relative z-10">
                    <h2 className="text-xs font-black tracking-widest text-brand-green uppercase font-orbitron">
                      {t.gameOver}
                    </h2>
                    
                    {winnerRole === 'assassino' ? (
                      <h3 className="text-3xl font-black text-rose-600 tracking-tight font-orbitron">
                        {t.victoryAssassin}
                      </h3>
                    ) : (
                      <h3 className="text-3xl font-black text-brand-green tracking-tight font-orbitron">
                        {t.victoryDetective}
                      </h3>
                    )}

                    <p className="text-xs text-brand-sage px-4 leading-relaxed mt-3 font-semibold">
                      {victoryReason}
                    </p>
                  </div>

                  {/* Role disclosures summary */}
                  <div className="bg-brand-lavender/20 rounded-2xl p-4 border border-brand-lavender/30 space-y-3 text-left">
                    <h4 className="text-[10px] font-orbitron text-brand-green uppercase tracking-widest font-black">
                      {t.completeDisclosures}
                    </h4>
                    
                    <div className="space-y-2">
                      {players.map((player) => (
                        <div 
                          key={player.id}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-brand-sage/20 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${player.avatarColor} text-white flex items-center justify-center font-bold text-[10px] uppercase`}>
                              {player.name.charAt(0)}
                            </div>
                            <span className="font-extrabold text-brand-green">{player.name}</span>
                            {player.status === 'morto' && (
                              <span className="text-[9px] bg-rose-500/15 text-rose-600 px-1.5 rounded font-bold uppercase font-orbitron">{t.eliminatedBadge}</span>
                            )}
                          </div>

                          <span className={`font-mono font-black text-[9px] uppercase px-2 py-0.5 rounded-full font-orbitron ${
                            player.role === 'assassino' 
                              ? 'bg-rose-500/15 text-rose-600 border border-rose-300/40' 
                              : player.role === 'detetive' 
                                ? 'bg-brand-lavender/25 text-brand-green border border-brand-lavender/40' 
                                : 'bg-brand-cream border border-brand-sage/40 text-brand-sage'
                          }`}>
                            {player.role === 'assassino' ? t.assassinRoleName : player.role === 'detetive' ? t.detectiveRoleName : t.victimText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restarts panel */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      onClick={handlePlayAgain}
                      className="flex-1 bg-brand-green hover:bg-brand-green/90 text-brand-cream py-3.5 rounded-2xl text-xs font-black shadow-md transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-orbitron tracking-wider"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t.playAgainBtn}</span>
                    </button>

                    <button
                      onClick={handleExitToHome}
                      className="flex-1 bg-brand-lavender/30 hover:bg-brand-lavender/50 text-brand-green py-3.5 rounded-2xl text-xs font-black border border-brand-lavender transition-all active:scale-95 cursor-pointer font-orbitron tracking-wider"
                    >
                      {t.backToMenuBtn}
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Confirmation modal for Elimination */}
      <AnimatePresence>
        {selectedPlayerToEliminate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fffef4] border border-[#ece9db] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-[#1c1d33]"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-600">
                  <Skull className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-[#1c1d33]">{t.confirmEliminationTitle}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t.confirmEliminationPrompt.replace('{playerName}', selectedPlayerToEliminate.name)}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlayerToEliminate(null)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-bold border border-slate-200 shadow-sm transition-colors cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmElimination}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {t.confirmBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Copyright Modal */}
      <AnimatePresence>
        {showCopyright && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-cream border border-brand-sage/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-brand-green"
            >
              <button 
                type="button"
                onClick={() => { triggerClick(); setShowCopyright(false); }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-brand-lavender/30 hover:bg-brand-lavender/50 text-brand-green transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-3 pt-2">
                <div className="w-16 h-16 rounded-full bg-brand-lavender/40 border border-brand-lavender/60 flex items-center justify-center mx-auto text-brand-green">
                  <Fingerprint className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-brand-green font-orbitron tracking-tight">
                  Copyright © 2026
                </h3>
                <p className="text-sm font-black text-brand-green/90 font-orbitron uppercase tracking-wide">
                  ROMEU CARVALHO
                </p>
                <p className="text-xs text-brand-sage font-medium leading-relaxed">
                  {t.copyrightDesc}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href="https://romeuportfolio.onrender.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-cream py-3 rounded-2xl text-xs font-black text-center shadow-md transition-all font-orbitron tracking-wider block"
                >
                  {t.viewPortfolio}
                </a>
                <button
                  type="button"
                  onClick={() => { triggerClick(); setShowCopyright(false); }}
                  className="w-full bg-brand-lavender/25 hover:bg-brand-lavender/40 text-brand-green py-2.5 rounded-2xl text-xs font-black transition-colors font-orbitron cursor-pointer"
                >
                  {language === 'PT' ? 'Fechar' : language === 'EN' ? 'Close' : 'Cerrar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HAMBURGER MENU DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 z-50 bg-brand-cream border-l border-brand-sage/40 shadow-2xl flex flex-col justify-between p-6 text-brand-green"
            >
              <div className="space-y-6">
                {/* Header of drawer */}
                <div className="flex items-center justify-between pb-4 border-b border-brand-sage/20">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-brand-green w-8 h-8 rounded-full flex items-center justify-center text-brand-cream font-bold shadow-md font-orbitron">
                      <Fingerprint className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black tracking-wider uppercase text-brand-green font-orbitron">{t.impostor}</h3>
                      <p className="text-[9px] text-brand-sage font-mono font-medium tracking-wide">{t.offlineMode}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 rounded-full hover:bg-brand-lavender/30 text-brand-green transition-colors cursor-pointer flex items-center justify-center"
                    title="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {/* Painel link */}
                  <button
                    onClick={() => {
                      triggerClick();
                      setCurrentScreen('welcome');
                      setMenuOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm cursor-pointer ${
                      currentScreen === 'welcome'
                        ? 'bg-brand-green text-brand-cream shadow-md shadow-brand-green/10'
                        : 'hover:bg-brand-lavender/25 text-brand-green/90'
                    }`}
                  >
                    <Play className={`w-4.5 h-4.5 ${currentScreen === 'welcome' ? 'fill-brand-cream text-brand-cream' : 'text-brand-sage'}`} />
                    <span className="font-orbitron text-xs tracking-wider uppercase">{t.panel}</span>
                  </button>

                  {/* Jogadores link */}
                  <button
                    onClick={() => {
                      triggerClick();
                      setCurrentScreen('register');
                      setMenuOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm cursor-pointer ${
                      currentScreen === 'register'
                        ? 'bg-brand-green text-brand-cream shadow-md shadow-brand-green/10'
                        : 'hover:bg-brand-lavender/25 text-brand-green/90'
                    }`}
                  >
                    <Users className={`w-4.5 h-4.5 ${currentScreen === 'register' ? 'text-brand-cream' : 'text-brand-sage'}`} />
                    <span className="font-orbitron text-xs tracking-wider uppercase">{t.players}</span>
                  </button>

                  {/* Ajustes link */}
                  <button
                    onClick={() => {
                      triggerClick();
                      setCurrentScreen('settings');
                      setMenuOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl flex items-center gap-3 transition-all font-bold text-sm cursor-pointer ${
                      currentScreen === 'settings'
                        ? 'bg-brand-green text-brand-cream shadow-md shadow-brand-green/10'
                        : 'hover:bg-brand-lavender/25 text-brand-green/90'
                    }`}
                  >
                    <SettingsIcon className={`w-4.5 h-4.5 ${currentScreen === 'settings' ? 'text-brand-cream' : 'text-brand-sage'}`} />
                    <span className="font-orbitron text-xs tracking-wider uppercase">{t.settings}</span>
                  </button>

                  {/* Copyright / Info link */}
                  <button
                    onClick={() => {
                      triggerClick();
                      setShowCopyright(true);
                      setMenuOpen(false);
                    }}
                    className="w-full p-3.5 rounded-2xl flex items-center gap-3 hover:bg-brand-lavender/25 text-brand-green/90 transition-all font-bold text-sm cursor-pointer"
                  >
                    <Info className="w-4.5 h-4.5 text-brand-sage" />
                    <span className="font-orbitron text-xs tracking-wider uppercase">Info</span>
                  </button>
                </nav>
              </div>

              {/* Bottom Section - everything from top menu goes here */}
              <div className="space-y-4 pt-4 border-t border-brand-sage/20">
                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-brand-sage font-orbitron">{t.sounds}</span>
                  <button
                    onClick={toggleSound}
                    className="p-2 px-3 rounded-full bg-brand-lavender/30 hover:bg-brand-lavender/50 active:scale-95 border border-brand-lavender/50 transition-all text-brand-green flex items-center gap-1.5 text-xs font-bold font-orbitron cursor-pointer"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-green" /> : <VolumeX className="w-4 h-4 text-brand-sage" />}
                    <span className="text-[10px] uppercase font-mono tracking-wide">{soundEnabled ? (language === 'PT' ? 'Ativo' : 'On') : (language === 'PT' ? 'Mudo' : 'Muted')}</span>
                  </button>
                </div>

                {/* Language pill segmented buttons - elegant, custom designed */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-sage uppercase tracking-wider font-orbitron block">
                    {language === 'PT' ? 'Idioma' : language === 'EN' ? 'Language' : 'Idioma'}
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-brand-lavender/35 p-1 rounded-xl border border-brand-lavender/40">
                    {(['PT', 'EN', 'ES'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          triggerClick();
                          setLanguage(lang);
                        }}
                        className={`py-2 text-[11px] font-black font-orbitron rounded-lg transition-all cursor-pointer ${
                          language === lang
                            ? 'bg-brand-green text-brand-cream shadow-sm'
                            : 'text-brand-green/70 hover:bg-brand-lavender/20'
                        }`}
                      >
                        {lang === 'PT' ? 'PT' : lang === 'EN' ? 'EN' : 'ES'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
