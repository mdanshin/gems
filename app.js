(() => {
  const SIZE = 8;
  const COLORS = 6;
  const SCORE_PER = 60;
  const COMBO_STEP = 0.25;

  const BASE_HP_MAX = 100;
  const SHIELD_MAX = 60;
  const EMP_REDUCTION_PER_BLUE = 2;
  const NUKE_COST = 10;
  const NUKE_DAMAGE = 70;

  const boardEl = document.getElementById("board");
  const levelEl = document.getElementById("level");
  const scoreEl = document.getElementById("score");
  const targetEl = document.getElementById("target");
  const movesEl = document.getElementById("moves");
  const comboEl = document.getElementById("combo");
  const bestEl = document.getElementById("best");
  const baseFill = document.getElementById("baseFill");
  const enemyFill = document.getElementById("enemyFill");
  const timeFill = document.getElementById("timeFill");
  const baseReadout = document.getElementById("baseReadout");
  const enemyReadout = document.getElementById("enemyReadout");
  const timeReadout = document.getElementById("timeReadout");
  const baseSub = document.getElementById("baseSub");
  const enemySub = document.getElementById("enemySub");
  const combatFeed = document.getElementById("combatFeed");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const overlayButton = document.getElementById("overlayButton");
  const toast = document.getElementById("toast");
  const newGameBtn = document.getElementById("newGame");
  const shuffleBtn = document.getElementById("shuffle");
  const soundBtn = document.getElementById("sound");
  const musicBtn = document.getElementById("music");
  const musicVolumeEl = document.getElementById("musicVolume");
  const languageBtn = document.getElementById("language");
  const tutorialBtn = document.getElementById("tutorial");
  const campaignBtn = document.getElementById("campaign");

  const fxLayer = document.getElementById("fxLayer");
  const boardFrame = boardEl ? boardEl.closest(".board-frame") : null;

  const tutorialOverlay = document.getElementById("tutorialOverlay");
  const tutorialKicker = document.getElementById("tutorialKicker");
  const tutorialTitle = document.getElementById("tutorialTitle");
  const tutorialText = document.getElementById("tutorialText");
  const tutorialBack = document.getElementById("tutorialBack");
  const tutorialSkip = document.getElementById("tutorialSkip");
  const tutorialNext = document.getElementById("tutorialNext");

  const cellEls = [];
  let dragStart = null;
  let toastTimer = null;
  let overlayAction = null;

  const audio = { ctx: null };

  const music = {
    el: null,
    enabled: true,
    volume: 0.6,
    started: false,
    trackIndex: 0,
  };

  function loadMusicSettings() {
    const enabled = localStorage.getItem("starJewelsMusicEnabled");
    if (enabled === "0" || enabled === "1") {
      music.enabled = enabled === "1";
    }
    const volume = Number(localStorage.getItem("starJewelsMusicVolume"));
    if (!Number.isNaN(volume)) {
      music.volume = Math.min(1, Math.max(0, volume));
    }
  }

  function saveMusicSettings() {
    localStorage.setItem("starJewelsMusicEnabled", music.enabled ? "1" : "0");
    localStorage.setItem("starJewelsMusicVolume", String(music.volume));
  }

  function ensureMusicElement() {
    if (music.el) return;
    const el = new Audio();
    el.preload = "auto";
    el.loop = false;
    el.volume = music.volume;
    el.addEventListener("ended", () => {
      if (!music.enabled) return;
      music.trackIndex = (music.trackIndex + 1) % MUSIC_TRACKS.length;
      el.src = MUSIC_TRACKS[music.trackIndex];
      el.play().catch(() => {
        // Ignore autoplay failures.
      });
    });
    music.el = el;
  }

  function applyMusicUI() {
    if (musicBtn) musicBtn.textContent = t(music.enabled ? "ui.musicOn" : "ui.musicOff");
    if (musicVolumeEl) musicVolumeEl.value = String(Math.round(music.volume * 100));
  }

  function setMusicVolume(next) {
    music.volume = Math.min(1, Math.max(0, next));
    ensureMusicElement();
    if (music.el) music.el.volume = music.volume;
    saveMusicSettings();
    applyMusicUI();
  }

  function setMusicEnabled(enabled) {
    music.enabled = Boolean(enabled);
    ensureMusicElement();
    saveMusicSettings();
    applyMusicUI();

    if (!music.el) return;
    if (!music.enabled) {
      music.el.pause();
      return;
    }

    // If the user enables music mid-session, try to start it.
    startMusicFromUserGesture();
  }

  function startMusicFromUserGesture() {
    ensureMusicElement();
    if (!music.el || !music.enabled) return;

    if (!music.el.src) {
      music.trackIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
      music.el.src = MUSIC_TRACKS[music.trackIndex];
    }

    music.el.volume = music.volume;
    music.el
      .play()
      .then(() => {
        music.started = true;
      })
      .catch(() => {
        // Autoplay blocked; will try again on next gesture.
      });
  }

  const baseBarEl = baseFill ? baseFill.closest(".status-bar") : null;
  const enemyBarEl = enemyFill ? enemyFill.closest(".status-bar") : null;
  const timeBarEl = timeFill ? timeFill.closest(".status-bar") : null;

  const MUSIC_TRACKS = [
    "assets/audio/music/star-jewels-stellar-gems.mp3",
    "assets/audio/music/star-jewels-stellar-gems-alt.mp3",
    "assets/audio/music/star-jewels-shatter.mp3",
    "assets/audio/music/star-jewels-shatter-alt.mp3",
  ];

  const I18N = {
    en: {
      "document.title": "Star Jewels",
      "brand.title": "Star Jewels",
      "brand.tagline": "Terran outpost under siege. Match to power weapons, shields, and repairs.",

      "ui.newGame": "New Game",
      "ui.shuffle": "Shuffle",
      "ui.ready": "Ready",
      "ui.wave": "Wave",
      "ui.credits": "Credits",
      "ui.enemy": "Enemy",
      "ui.time": "Time",
      "ui.sync": "Sync",
      "ui.best": "Best",
      "ui.baseIntegrity": "Base Integrity",
      "ui.enemyHull": "Enemy Hull",
      "ui.timeRemaining": "Time Remaining",
      "ui.briefing": "Briefing",
      "ui.briefingText": "Match to generate orders. Orders resolve instantly, then the enemy fires.",
      "ui.specials": "Specials",
      "ui.specials.stripe": "Match 4: line strike (row/column)",
      "ui.specials.bomb": "Match 5: bomb (removes one color)",
      "ui.syncNote": "Cascades increase Sync and scale everything you do.",

      "ui.legend.red": "Attack: deal damage",
      "ui.legend.yellow": "Amplify: boosts damage",
      "ui.legend.green": "Repair: restore base HP",
      "ui.legend.teal": "Shields: absorb hits",
      "ui.legend.blue": "EMP: reduce next enemy shot",
      "ui.legend.pink": "Tactical: charges strikes",
      "ui.timeRemaining": "Time Remaining",
      "ui.briefing": "Briefing",
      "ui.briefingText": "Match to generate orders. Orders resolve instantly, then the enemy fires.",
      "ui.specials": "Specials",
      "ui.specials.stripe": "Match 4: line strike (row/column)",
      "ui.specials.bomb": "Match 5: bomb (removes one color)",
      "ui.syncNote": "Cascades increase Sync and scale everything you do.",

      "ui.legend.red": "Attack: deal damage",
      "ui.legend.yellow": "Amplify: boosts damage",
      "ui.legend.green": "Repair: restore base HP",
      "ui.legend.teal": "Shields: absorb hits",
      "ui.legend.blue": "EMP: reduce next enemy shot",
      "ui.legend.pink": "Tactical: charges strikes",
      "ui.howToPlay": "How to play",
      "ui.tips": "Tips",
      "ui.how.1": "Every swap is a combat action. Clear fast to survive the wave.",
      "ui.how.2": "Red hits the enemy. Green repairs the base. Teal adds shields.",
      "ui.how.3": "Blue disrupts incoming fire. Yellow boosts your damage output.",
      "ui.how.4": "Match 4 creates a line strike. Match 5 creates a tactical bomb.",
      "ui.how.5": "Win by dropping enemy hull to 0 before time runs out (and before your base breaks).",
      "ui.tips.1": "Cascades raise Sync. Higher Sync boosts every match effect.",
      "ui.tips.2": "Save striped jewels for panic turns or finishing blows.",
      "ui.tips.3": "If shields are up, you can gamble on bigger combos.",

      "ui.soundOn": "Sound: On",
      "ui.soundOff": "Sound: Off",
      "ui.musicOn": "Music: On",
      "ui.musicOff": "Music: Off",
      "ui.musicVolume": "Music",
      "ui.language": "Language: {lang}",
      "ui.tutorial": "Tutorial",
      "ui.campaign": "Campaign",
      "ui.next": "Next",
      "ui.back": "Back",
      "ui.skip": "Skip",
      "ui.done": "Done",

      "campaign.1.kicker": "Mission 1/10",
      "campaign.1.title": "Goal & Loop",
      "campaign.1.text": "Win by dropping Enemy Hull to 0. Every move spends Time and triggers an enemy shot.",

      "campaign.2.kicker": "Mission 2/10",
      "campaign.2.title": "Read The HUD",
      "campaign.2.text": "Top numbers track your run. Bars track Base HP/shields, Enemy Hull, and Time Remaining.",

      "campaign.3.kicker": "Mission 3/10",
      "campaign.3.title": "Controls",
      "campaign.3.text": "New Game resets the run. Shuffle rerolls the board if you're stuck. Sound/Language are cosmetic.",

      "campaign.4.kicker": "Mission 4/10",
      "campaign.4.title": "Make A Match",
      "campaign.4.text": "Swap the highlighted gems to create a match (3+). Watch the Combat Log update.",

      "campaign.5.kicker": "Mission 5/10",
      "campaign.5.title": "Enemy Counterfire",
      "campaign.5.text": "Make any move. After the matched gems disappear and the board settles, the enemy fires. Shields absorb first.",

      "campaign.6.kicker": "Mission 6/10",
      "campaign.6.title": "Build Shields",
      "campaign.6.text": "Match Teal to build shields. Then take a hit and watch shields absorb damage.",

      "campaign.7.kicker": "Mission 7/10",
      "campaign.7.title": "Repair",
      "campaign.7.text": "Match Green to repair the base. Repairs restore Base HP.",

      "campaign.8.kicker": "Mission 8/10",
      "campaign.8.title": "EMP",
      "campaign.8.text": "Match Blue to add EMP. EMP reduces the next enemy shot.",

      "campaign.9.kicker": "Mission 9/10",
      "campaign.9.title": "Specials",
      "campaign.9.text": "Match 4 creates a striped strike. Match 5 creates a bomb. Use them to remove more gems and spike damage.",

      "campaign.10.kicker": "Mission 10/10",
      "campaign.10.title": "Finish The Enemy",
      "campaign.10.text": "Drop Enemy Hull to 0. Use attack matches and specials to end the wave.",

      "campaign.complete.title": "Campaign Complete",
      "campaign.complete.text": "Training complete. You're ready for live waves.",
      "campaign.complete.button": "Start Arcade",

      "aria.combatStatus": "Combat status",
      "aria.stats": "Run stats",
      "aria.combatLog": "Combat log",
      "aria.legend": "Order legend",
      "aria.board": "Jewels board",
      "aria.jewel": "Jewel",

      "hud.baseSub": "Shields {shield} | EMP {emp}",
      "hud.enemySub": "Incoming {attack} | EMP -{mitigation}",

      "log.enemyNoDamage": "Enemy salvo fizzles.",
      "log.enemyShield": "Shields absorb {amount}.",
      "log.enemyHit": "Enemy hits the base for {amount}.",
      "log.youDamage": "You deal {amount} damage.",
      "log.youRepair": "Repairs restore {amount}.",
      "log.youShield": "Shields +{amount}.",

      "toast.wave": "Wave {wave}",
      "toast.noMatch": "No match",
      "toast.noMovesShuffle": "No moves. Shuffling.",
      "toast.tacticalStrike.one": "Tactical strike!",
      "toast.tacticalStrike.many": "Tactical strike x{count}!",

      "overlay.welcome.title": "Welcome",
      "overlay.welcome.text": "Commander, the outpost is under siege. Match to power weapons, shields, and repairs.",
      "overlay.welcome.button": "Start",

      "overlay.waveCleared.title": "Wave Cleared",
      "overlay.waveCleared.text": "Enemy neutralized. Patch the hull and prepare for wave {nextWave}.",
      "overlay.waveCleared.button": "Next Wave",

      "overlay.overrun.title": "Overrun",
      "overlay.overrun.text": "Time's up. The enemy breaks through the perimeter.",
      "overlay.overrun.button": "Try Again",

      "overlay.baseDestroyed.title": "Base Destroyed",
      "overlay.baseDestroyed.text": "The outpost is lost.",
      "overlay.baseDestroyed.button": "Try Again",

      "tutorial.1.kicker": "Training 1/5",
      "tutorial.1.title": "Survive the Wave",
      "tutorial.1.text": "Drop Enemy Hull to 0 before Time runs out. After every move, the enemy fires.",

      "tutorial.2.kicker": "Training 2/5",
      "tutorial.2.title": "Make a Swap",
      "tutorial.2.text": "Swap the two highlighted gems. That swap will create a match (3+) and those gems will disappear.",

      "tutorial.3.kicker": "Training 3/5",
      "tutorial.3.title": "Read the Counterfire",
      "tutorial.3.text": "Watch the Combat Log: shields absorb first, then Base HP takes damage.",

      "tutorial.4.kicker": "Training 4/5",
      "tutorial.4.title": "Orders by Color",
      "tutorial.4.text": "Red = damage, Green = repair, Teal = shields, Blue = EMP, Pink = tactical charge.",

      "tutorial.5.kicker": "Training 5/5",
      "tutorial.5.title": "Use Specials",
      "tutorial.5.text": "Match 4 creates a line strike. Match 5 creates a bomb. Save them for emergencies.",
    },
    ru: {
      "document.title": "Star Jewels",
      "brand.title": "Star Jewels",
      "brand.tagline": "Терранский аванпост в осаде. Собирай тройки, чтобы питать оружие, щиты и ремонт.",

      "ui.newGame": "Новая игра",
      "ui.shuffle": "Перемешать",
      "ui.ready": "Готово",
      "ui.wave": "Волна",
      "ui.credits": "Кредиты",
      "ui.enemy": "Враг",
      "ui.time": "Время",
      "ui.sync": "Синхрон",
      "ui.best": "Рекорд",
      "ui.baseIntegrity": "Прочность базы",
      "ui.enemyHull": "Корпус врага",
      "ui.timeRemaining": "Время до прорыва",
      "ui.briefing": "Брифинг",
      "ui.briefingText": "Собирай тройки, чтобы отдавать приказы. Приказы срабатывают сразу, затем стреляет враг.",
      "ui.specials": "Особые",
      "ui.specials.stripe": "4 в ряд: линейный удар (ряд/колонка)",
      "ui.specials.bomb": "5 в ряд: бомба (чистит один цвет)",
      "ui.syncNote": "Каскады повышают Синхрон и усиливают все эффекты.",

      "ui.legend.red": "Атака: наносит урон",
      "ui.legend.yellow": "Усиление: увеличивает урон",
      "ui.legend.green": "Ремонт: лечит базу",
      "ui.legend.teal": "Щиты: поглощают урон",
      "ui.legend.blue": "ЭМИ: снижает следующий выстрел",
      "ui.legend.pink": "Тактика: копит удары",
      "ui.howToPlay": "Как играть",
      "ui.tips": "Советы",
      "ui.how.1": "Каждый ход - боевое действие. Чисти поле быстро, чтобы пережить волну.",
      "ui.how.2": "Красный бьет по врагу. Зеленый чинит базу. Бирюзовый дает щиты.",
      "ui.how.3": "Синий глушит входящий огонь. Желтый усиливает твой урон.",
      "ui.how.4": "4 в ряд создают линейный удар. 5 в ряд создают тактическую бомбу.",
      "ui.how.5": "Победа - сбросить корпус врага до 0 раньше, чем кончится время (и пока база не рухнула).",
      "ui.tips.1": "Каскады повышают Синхрон. Чем выше Синхрон, тем сильнее каждый эффект от совпадений.",
      "ui.tips.2": "Держи полосатые камни для паники или для добивания волны.",
      "ui.tips.3": "Когда щиты подняты, можно рискнуть ради большой комбы.",

      "ui.soundOn": "Звук: Вкл",
      "ui.soundOff": "Звук: Выкл",
      "ui.musicOn": "Музыка: Вкл",
      "ui.musicOff": "Музыка: Выкл",
      "ui.musicVolume": "Музыка",
      "ui.language": "Язык: {lang}",
      "ui.tutorial": "Обучение",
      "ui.campaign": "Кампания",
      "ui.next": "Дальше",
      "ui.back": "Назад",
      "ui.skip": "Пропустить",
      "ui.done": "Готово",

      "campaign.1.kicker": "Миссия 1/10",
      "campaign.1.title": "Цель и цикл",
      "campaign.1.text": "Победа - сбросить Корпус врага до 0. Каждый ход тратит Время и вызывает выстрел врага.",

      "campaign.2.kicker": "Миссия 2/10",
      "campaign.2.title": "Читай интерфейс",
      "campaign.2.text": "Числа сверху - статистика забега. Полосы - прочность/щиты базы, корпус врага и остаток времени.",

      "campaign.3.kicker": "Миссия 3/10",
      "campaign.3.title": "Кнопки",
      "campaign.3.text": "Новая игра - полный сброс. Перемешать - новый расклад, если застрял. Звук/Язык - удобство.",

      "campaign.4.kicker": "Миссия 4/10",
      "campaign.4.title": "Собери тройку",
      "campaign.4.text": "Поменяй местами подсвеченные камни, чтобы собрать 3+. Смотри, как обновится Боевой журнал.",

      "campaign.5.kicker": "Миссия 5/10",
      "campaign.5.title": "Ответный огонь",
      "campaign.5.text": "Сделай любой ход. После того как совпавшие камни исчезнут и поле осыпется, враг стреляет. Сначала тратятся щиты.",

      "campaign.6.kicker": "Миссия 6/10",
      "campaign.6.title": "Подними щиты",
      "campaign.6.text": "Собери бирюзовые, чтобы поднять щиты. Потом прими выстрел и посмотри, как щиты поглощают урон.",

      "campaign.7.kicker": "Миссия 7/10",
      "campaign.7.title": "Ремонт",
      "campaign.7.text": "Собери зелёные, чтобы починить базу. Ремонт восстанавливает прочность.",

      "campaign.8.kicker": "Миссия 8/10",
      "campaign.8.title": "ЭМИ",
      "campaign.8.text": "Собери синие, чтобы накопить ЭМИ. ЭМИ снижает следующий выстрел врага.",

      "campaign.9.kicker": "Миссия 9/10",
      "campaign.9.title": "Особые камни",
      "campaign.9.text": "4 в ряд создают полосатый удар. 5 в ряд создают бомбу. Они чистят больше и дают пик урона.",

      "campaign.10.kicker": "Миссия 10/10",
      "campaign.10.title": "Добей врага",
      "campaign.10.text": "Сбрось Корпус врага до 0. Используй красные совпадения и спец-камни (полосатые/бомбы), чтобы закончить волну.",

      "campaign.complete.title": "Кампания пройдена",
      "campaign.complete.text": "Обучение завершено. Ты готов к реальным волнам.",
      "campaign.complete.button": "Играть",

      "aria.combatStatus": "Боевой статус",
      "aria.stats": "Статистика",
      "aria.combatLog": "Боевой журнал",
      "aria.legend": "Легенда приказов",
      "aria.board": "Поле самоцветов",
      "aria.jewel": "Самоцвет",

      "hud.baseSub": "Щиты {shield} | ЭМИ {emp}",
      "hud.enemySub": "Выстрел {attack} | ЭМИ -{mitigation}",

      "log.enemyNoDamage": "Залп врага срывается.",
      "log.enemyShield": "Щиты поглощают {amount}.",
      "log.enemyHit": "Враг бьет по базе на {amount}.",
      "log.youDamage": "Ты наносишь {amount} урона.",
      "log.youRepair": "Ремонт восстанавливает {amount}.",
      "log.youShield": "Щиты +{amount}.",

      "toast.wave": "Волна {wave}",
      "toast.noMatch": "Нет совпадения",
      "toast.noMovesShuffle": "Ходов нет. Перемешиваю.",
      "toast.tacticalStrike.one": "Тактический удар!",
      "toast.tacticalStrike.many": "Тактический удар x{count}!",

      "overlay.welcome.title": "Брифинг",
      "overlay.welcome.text": "Командир, аванпост в осаде. Собирай тройки, чтобы питать оружие, щиты и ремонт.",
      "overlay.welcome.button": "Начать",

      "overlay.waveCleared.title": "Волна отбита",
      "overlay.waveCleared.text": "Враг уничтожен. Подлатайте корпус и готовьтесь к волне {nextWave}.",
      "overlay.waveCleared.button": "Следующая волна",

      "overlay.overrun.title": "Прорыв",
      "overlay.overrun.text": "Время вышло. Враг прорывает периметр.",
      "overlay.overrun.button": "Заново",

      "overlay.baseDestroyed.title": "База уничтожена",
      "overlay.baseDestroyed.text": "Аванпост потерян.",
      "overlay.baseDestroyed.button": "Заново",

      "tutorial.1.kicker": "Обучение 1/5",
      "tutorial.1.title": "Пережить волну",
      "tutorial.1.text": "Сбрось Корпус врага до 0, пока не кончилось Время. После каждого твоего хода стреляет враг.",

      "tutorial.2.kicker": "Обучение 2/5",
      "tutorial.2.title": "Сделай ход",
      "tutorial.2.text": "Поменяй местами две подсвеченные клетки. Этот ход точно соберет тройку (или больше) - камни исчезнут.",

      "tutorial.3.kicker": "Обучение 3/5",
      "tutorial.3.title": "Ответный огонь",
      "tutorial.3.text": "Смотри Боевой журнал: сначала сгорают щиты, потом падает прочность базы.",

      "tutorial.4.kicker": "Обучение 4/5",
      "tutorial.4.title": "Приказы по цветам",
      "tutorial.4.text": "Красный = урон, Зеленый = ремонт, Бирюзовый = щиты, Синий = ЭМИ, Розовый = тактика.",

      "tutorial.5.kicker": "Обучение 5/5",
      "tutorial.5.title": "Используй особые",
      "tutorial.5.text": "4 в ряд создают линейный удар. 5 в ряд создают бомбу. Береги их для паники.",
    },
  };

  let lang = "en";

  function formatText(text, params) {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_, key) => (params[key] == null ? `{${key}}` : String(params[key])));
  }

  function t(key, params) {
    const table = I18N[lang] || I18N.en;
    const fallback = I18N.en[key];
    const value = table[key] ?? fallback ?? key;
    return formatText(value, params);
  }

  function detectInitialLanguage() {
    const stored = localStorage.getItem("starJewelsLang");
    if (stored === "ru" || stored === "en") return stored;
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("ru") ? "ru" : "en";
  }

  function applyI18n() {
    document.title = t("document.title");
    document.documentElement.lang = lang;

    for (const el of document.querySelectorAll("[data-i18n]")) {
      const key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    }

    for (const el of document.querySelectorAll("[data-i18n-aria-label]")) {
      const key = el.getAttribute("data-i18n-aria-label");
      if (key) el.setAttribute("aria-label", t(key));
    }

    soundBtn.textContent = t(game.sound ? "ui.soundOn" : "ui.soundOff");
    applyMusicUI();
    if (languageBtn) {
      languageBtn.textContent = t("ui.language", { lang: lang.toUpperCase() });
    }

    for (const row of cellEls) {
      for (const cell of row) {
        cell.setAttribute("aria-label", t("aria.jewel"));
      }
    }

    if (campaign.active) renderCampaign();
    else if (tutorial.active) renderTutorial();
  }

  function setLanguage(next) {
    lang = next === "ru" ? "ru" : "en";
    localStorage.setItem("starJewelsLang", lang);
    applyI18n();
  }

  const tutorial = {
    active: false,
    step: 1,
    steps: 5,
    hintSet: new Set(),
  };

  const campaign = {
    active: false,
    step: 1,
    steps: 10,
    hintSet: new Set(),
    focusEls: [],
    lastClear: null,
    lastEnemy: null,
    waitingForEnemyHit: false,
    hintPreparedForStep: 0,
  };

  function isCampaignDone() {
    return localStorage.getItem("starJewelsCampaignDone") === "1";
  }

  function setCampaignDone() {
    localStorage.setItem("starJewelsCampaignDone", "1");
  }

  function clearFocus() {
    for (const el of campaign.focusEls) el.classList.remove("tutorial-focus");
    campaign.focusEls = [];
  }

  function setFocus(selectors) {
    clearFocus();
    if (!selectors) return;
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      const el = typeof sel === "string" ? document.querySelector(sel) : null;
      if (el) {
        el.classList.add("tutorial-focus");
        campaign.focusEls.push(el);
      }
    }
  }

  function isGuideActive() {
    return campaign.active || tutorial.active;
  }

  function activeHintSet() {
    if (campaign.active) return campaign.hintSet;
    if (tutorial.active) return tutorial.hintSet;
    return null;
  }

  function showTutorialOverlay() {
    if (!tutorialOverlay) return;
    tutorialOverlay.classList.remove("hidden");
    tutorial.active = true;
  }

  function hideTutorialOverlay({ completed } = {}) {
    tutorial.active = false;
    tutorial.hintSet.clear();
    if (tutorialOverlay) tutorialOverlay.classList.add("hidden");
    updateBoardUI();
    if (completed) {
      localStorage.setItem("starJewelsTutorialDone", "1");
    }
  }

  function isTutorialDone() {
    return localStorage.getItem("starJewelsTutorialDone") === "1";
  }

  function findHintMove() {
    if (!Array.isArray(game.board) || game.board.length !== SIZE) return null;
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        if (c + 1 < SIZE && swapMakesMatch(game.board, r, c, r, c + 1)) {
          return {
            a: { r, c },
            b: { r, c: c + 1 },
          };
        }
        if (r + 1 < SIZE && swapMakesMatch(game.board, r, c, r + 1, c)) {
          return {
            a: { r, c },
            b: { r: r + 1, c },
          };
        }
      }
    }
    return null;
  }

  function swapMakesMatchForColor(board, r1, c1, r2, c2, targetColor) {
    const a = board[r1][c1];
    const b = board[r2][c2];
    if (!a || !b) return false;
    board[r1][c1] = b;
    board[r2][c2] = a;
    const groups = findMatches(board);
    board[r1][c1] = a;
    board[r2][c2] = b;
    return groups.some((g) => g.color === targetColor && g.length >= 3);
  }

  function findHintMoveForColor(targetColor) {
    if (!Array.isArray(game.board) || game.board.length !== SIZE) return null;
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        if (c + 1 < SIZE && swapMakesMatchForColor(game.board, r, c, r, c + 1, targetColor)) {
          return {
            a: { r, c },
            b: { r, c: c + 1 },
          };
        }
        if (r + 1 < SIZE && swapMakesMatchForColor(game.board, r, c, r + 1, c, targetColor)) {
          return {
            a: { r, c },
            b: { r: r + 1, c },
          };
        }
      }
    }
    return null;
  }

  function ensureHintMoveForColor(targetColor) {
    if (!campaign.active) return;
    if (campaign.hintPreparedForStep === campaign.step) return;

    // Try a few rerolls to guarantee the guided step is doable.
    let hint = findHintMoveForColor(targetColor);
    let attempts = 0;
    while (!hint && attempts < 24) {
      game.board = generateBoard();
      hint = findHintMoveForColor(targetColor);
      attempts += 1;
    }

    // If we had to change the board, make it obvious.
    if (attempts > 0) {
      updateBoardUI({ spawnSet: allPositionsSet() });
    }

    campaign.hintPreparedForStep = campaign.step;
  }

  function setTutorialHintForStep() {
    tutorial.hintSet.clear();
    if (tutorial.step !== 2) return;
    const hint = findHintMove();
    if (!hint) return;
    tutorial.hintSet.add(keyOf(hint.a.r, hint.a.c));
    tutorial.hintSet.add(keyOf(hint.b.r, hint.b.c));
  }

  function setCampaignHintForStep() {
    campaign.hintSet.clear();
    if (!campaign.active) return;
    const step = campaign.step;

    // Step -> preferred color hints.
    const wantColor = step === 6 ? 1 : step === 7 ? 4 : step === 8 ? 3 : step === 10 ? 0 : null;

    if (wantColor != null && [6, 7, 8].includes(step)) {
      ensureHintMoveForColor(wantColor);
    }

    const hint =
      wantColor == null ? findHintMove() : findHintMoveForColor(wantColor) || findHintMove();
    if (!hint) return;
    campaign.hintSet.add(keyOf(hint.a.r, hint.a.c));
    campaign.hintSet.add(keyOf(hint.b.r, hint.b.c));
  }

  function showGuideOverlay() {
    if (!tutorialOverlay) return;
    tutorialOverlay.classList.remove("hidden");
  }

  function hideGuideOverlay() {
    if (!tutorialOverlay) return;
    tutorialOverlay.classList.add("hidden");
  }

  function setGuideFloating(isFloating) {
    if (!tutorialOverlay) return;
    tutorialOverlay.classList.toggle("floating", Boolean(isFloating));
  }

  function renderCampaign() {
    if (!campaign.active) return;

    showGuideOverlay();

    const isAction = [4, 5, 6, 7, 8, 10].includes(campaign.step);
    setGuideFloating(isAction);

    if (tutorialKicker) tutorialKicker.textContent = t(`campaign.${campaign.step}.kicker`);
    if (tutorialTitle) tutorialTitle.textContent = t(`campaign.${campaign.step}.title`);
    if (tutorialText) tutorialText.textContent = t(`campaign.${campaign.step}.text`);

    if (tutorialBack) tutorialBack.disabled = campaign.step <= 1;
    if (tutorialNext) tutorialNext.textContent = t(campaign.step >= campaign.steps ? "ui.done" : "ui.next");

    if (tutorialNext) {
      tutorialNext.disabled = !canAdvanceCampaignStep() && [4, 5, 6, 7, 8, 10].includes(campaign.step);
    }

    // Focus per step.
    if (campaign.step === 1) {
      setFocus([".status-bars", ".hud"]);
    } else if (campaign.step === 2) {
      setFocus([".stats", ".status-bars", ".hud"]);
    } else if (campaign.step === 3) {
      setFocus([".controls"]);
    } else if (campaign.step === 4) {
      setFocus(["#board"]);
    } else if (campaign.step === 5) {
      setFocus([".status-bars", ".hud"]);
    } else if (campaign.step === 6) {
      setFocus([".status-bars", "#baseFill"]);
    } else if (campaign.step === 7) {
      setFocus(["#baseFill", "#baseReadout"]);
    } else if (campaign.step === 8) {
      setFocus(["#enemySub", "#enemyFill"]);
    } else if (campaign.step === 9) {
      setFocus([".card", "#board"]);
    } else if (campaign.step === 10) {
      setFocus(["#enemyFill", "#board"]);
    }

    setCampaignHintForStep();
    updateBoardUI();
  }

  function startCampaign() {
    campaign.active = true;
    campaign.step = 1;
    campaign.lastClear = null;
    campaign.lastEnemy = null;
    campaign.waitingForEnemyHit = false;
    game.mode = "campaign";

    newGame();

    // Make the tutorial enemy actually shoot so the counterfire step is visible.
    game.enemyAttack = Math.max(game.enemyAttack, 5);
    updateStats();

    renderCampaign();
  }

  function stopCampaign({ completed } = {}) {
    campaign.active = false;
    campaign.hintSet.clear();
    campaign.lastClear = null;
    campaign.lastEnemy = null;
    campaign.waitingForEnemyHit = false;
    clearFocus();
    setGuideFloating(false);
    hideGuideOverlay();
    updateBoardUI();

    if (completed) setCampaignDone();

    game.mode = "arcade";
    newGame();
  }

  function canAdvanceCampaignStep() {
    if (!campaign.active) return true;

    if (campaign.step === 4) {
      return Boolean(campaign.lastClear && campaign.lastClear.total >= 3);
    }
    if (campaign.step === 5) {
      return Boolean(
        campaign.lastEnemy &&
          (campaign.lastEnemy.damage > 0 || campaign.lastEnemy.absorbed > 0 || campaign.lastEnemy.mitigated > 0)
      );
    }
    if (campaign.step === 6) {
      return Boolean(campaign.lastClear && campaign.lastClear.shieldGain > 0);
    }
    if (campaign.step === 7) {
      return Boolean(campaign.lastClear && campaign.lastClear.repair > 0);
    }
    if (campaign.step === 8) {
      return Boolean(campaign.lastClear && campaign.lastClear.empAdded > 0);
    }
    if (campaign.step === 10) {
      return game.enemyHp <= 0;
    }

    return true;
  }

  function campaignNextStep() {
    if (!campaign.active) return;
    if (!canAdvanceCampaignStep()) return;

    if (campaign.step >= campaign.steps) {
      stopCampaign({ completed: true });
      return;
    }

    campaign.step += 1;
    campaign.lastClear = null;
    campaign.lastEnemy = null;

    if (campaign.step === 7) {
      // Ensure repair has a visible effect.
      game.baseHp = Math.min(game.baseHp, 60);
      updateStats();
    }

    if (campaign.step === 10) {
      // Make the finale quick.
      game.enemyHp = Math.min(game.enemyHp, 60);
      updateStats();
    }

    if (campaign.step === 9) {
      // Demo pulse.
      const center = fxLocalCenterOfBoard();
      if (center) {
        fxRing(center.x, center.y, "teal");
        fxSpray(center.x, center.y, 46);
      }
      fxFlash("teal");
    }

    renderCampaign();
  }

  function campaignMaybeAutoAdvance() {
    if (!campaign.active) return;
    const autoSteps = new Set([4, 5, 6, 7, 8]);
    if (!autoSteps.has(campaign.step)) return;
    if (!canAdvanceCampaignStep()) return;

    // Small delay so the player can see what happened.
    setTimeout(() => {
      if (!campaign.active) return;
      if (autoSteps.has(campaign.step) && canAdvanceCampaignStep()) {
        campaignNextStep();
      }
    }, 450);
  }

  function campaignPrevStep() {
    if (!campaign.active) return;
    campaign.step = Math.max(1, campaign.step - 1);
    campaign.lastClear = null;
    campaign.lastEnemy = null;
    renderCampaign();
  }

  function renderTutorial() {
    if (!tutorial.active) return;
    if (tutorialKicker) tutorialKicker.textContent = t(`tutorial.${tutorial.step}.kicker`);
    if (tutorialTitle) tutorialTitle.textContent = t(`tutorial.${tutorial.step}.title`);
    if (tutorialText) tutorialText.textContent = t(`tutorial.${tutorial.step}.text`);

    if (tutorialBack) tutorialBack.disabled = tutorial.step <= 1;
    if (tutorialNext) tutorialNext.textContent = t(tutorial.step >= tutorial.steps ? "ui.done" : "ui.next");

    setTutorialHintForStep();
    updateBoardUI();
  }

  function startTutorial() {
    tutorial.step = 1;
    showTutorialOverlay();
    renderTutorial();
  }

  function tutorialNextStep() {
    if (tutorial.step >= tutorial.steps) {
      hideTutorialOverlay({ completed: true });
      return;
    }
    tutorial.step += 1;
    renderTutorial();
  }

  function tutorialPrevStep() {
    tutorial.step = Math.max(1, tutorial.step - 1);
    renderTutorial();
  }

  const combatLines = [];

  function logCombat(message) {
    if (!combatFeed) return;
    const text = String(message || "").trim();
    if (!text) return;

    combatLines.unshift(text);
    while (combatLines.length > 4) combatLines.pop();

    combatFeed.innerHTML = "";
    for (const line of combatLines) {
      const el = document.createElement("div");
      el.className = "combat-line";
      el.textContent = line;
      combatFeed.appendChild(el);
    }
  }

  function pulse(el, className) {
    if (!el) return;
    el.classList.remove(className);
    // Force reflow so the animation restarts.
    void el.offsetWidth;
    el.classList.add(className);
  }

  function shakeFrame() {
    if (!boardFrame) return;
    boardFrame.classList.remove("shake");
    void boardFrame.offsetWidth;
    boardFrame.classList.add("shake");
  }

  function fxLocalPointFromClient(x, y) {
    if (!fxLayer) return null;
    const base = fxLayer.getBoundingClientRect();
    return { x: x - base.left, y: y - base.top };
  }

  function fxLocalCenterFromCell(r, c) {
    if (!fxLayer) return null;
    const cellEl = cellEls[r] ? cellEls[r][c] : null;
    if (!cellEl) return null;
    const rect = cellEl.getBoundingClientRect();
    return fxLocalPointFromClient(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function fxAdd(el) {
    if (!fxLayer) return;
    fxLayer.appendChild(el);

    const cleanup = () => {
      el.removeEventListener("animationend", cleanup);
      if (el.parentNode) el.parentNode.removeChild(el);
    };

    // Always have a TTL so FX don't stick if animations are disabled.
    const ttl = el.classList.contains("fx-float") ? 900 : el.classList.contains("fx-beam") ? 350 : 650;
    setTimeout(cleanup, ttl);

    el.addEventListener("animationend", cleanup);
  }

  function fxFloatText(x, y, text, kind) {
    if (!fxLayer) return;
    const el = document.createElement("div");
    el.className = `fx-float ${kind || ""}`.trim();
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    fxAdd(el);
  }

  function fxSpark(x, y) {
    if (!fxLayer) return;
    const el = document.createElement("div");
    el.className = "fx-spark";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    fxAdd(el);
  }

  function fxStreak(x, y, dx, dy, rotDeg, kind) {
    if (!fxLayer) return;
    const el = document.createElement("div");
    el.className = `fx-streak ${kind || ""}`.trim();
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", String(Math.round(dx)));
    el.style.setProperty("--dy", String(Math.round(dy)));
    el.style.setProperty("--rot", `${Math.round(rotDeg)}deg`);
    el.style.setProperty("--len", String(28 + Math.floor(Math.random() * 28)));
    el.style.setProperty("--thick", String(3 + Math.floor(Math.random() * 3)));
    fxAdd(el);
  }

  function fxBigBurst(x, y) {
    if (!fxLayer) return;
    const el = document.createElement("div");
    el.className = "fx-burst big";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    fxAdd(el);
  }

  function fxBurst(x, y) {
    if (!fxLayer) return;
    const el = document.createElement("div");
    el.className = "fx-burst";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    fxAdd(el);
  }

  function fxRing(x, y, kind) {
    if (!fxLayer) return;
    const el = document.createElement("div");
    el.className = `fx-ring ${kind || ""}`.trim();
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    fxAdd(el);
  }

  function fxTracer(fromX, fromY, toX, toY, kind) {
    if (!fxLayer) return;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const len = Math.max(12, Math.hypot(dx, dy));
    const rot = Math.atan2(dy, dx) * (180 / Math.PI);

    const el = document.createElement("div");
    el.className = `fx-tracer ${kind || ""}`.trim();
    el.style.left = `${fromX}px`;
    el.style.top = `${fromY}px`;
    el.style.width = `${len}px`;
    el.style.transform = `rotate(${rot}deg)`;
    fxAdd(el);
  }

  function fxShards(x, y, count, kind) {
    const n = Math.max(0, Math.min(26, count || 0));
    for (let i = 0; i < n; i += 1) {
      const el = document.createElement("div");
      el.className = `fx-shard ${kind || ""}`.trim();
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty("--rot", `${(Math.random() * 360) | 0}deg`);
      el.style.setProperty("--dx", String(Math.round((Math.random() - 0.5) * 220)));
      el.style.setProperty("--dy", String(Math.round((Math.random() - 0.5) * 160)));
      fxAdd(el);
    }
  }

  function fxLocalPointFromRectAnchor(rect, ax, ay) {
    if (!fxLayer) return null;
    const base = fxLayer.getBoundingClientRect();
    return { x: rect.left - base.left + rect.width * ax, y: rect.top - base.top + rect.height * ay };
  }

  function fxLocalCenterOfBoard() {
    if (!boardEl || !fxLayer) return null;
    const rect = boardEl.getBoundingClientRect();
    return fxLocalPointFromRectAnchor(rect, 0.5, 0.5);
  }

  function fxFlash(kind) {
    if (!fxLayer) return;
    const el = document.createElement("div");
    el.className = `fx-flash ${kind || ""}`.trim();
    fxAdd(el);
  }

  function fxSpray(x, y, count) {
    const n = Math.max(0, Math.min(90, count || 0));
    for (let i = 0; i < n; i += 1) {
      // Bias towards shorter travel so it reads as a punchy burst.
      const t = Math.random();
      const spread = 24 + t * t * 140;
      const dx = (Math.random() - 0.5) * spread;
      const dy = (Math.random() - 0.5) * (spread * 0.75);

      fxSpark(x + dx, y + dy);

      if (i % 2 === 0) {
        const rot = Math.atan2(dy, dx) * (180 / Math.PI);
        const kind = Math.random() < 0.5 ? "teal" : "red";
        fxStreak(x, y, dx * 1.1, dy * 1.1, rot, kind);
      }
      if (i % 4 === 0) {
        const rot = (Math.random() * 360) | 0;
        fxStreak(x, y, dx * 0.7, dy * 0.7, rot, Math.random() < 0.5 ? "red" : "");
      }
    }
  }

  function fxBeamRow(r) {
    if (!fxLayer || !cellEls[r] || !cellEls[r][0] || !cellEls[r][SIZE - 1]) return;
    const a = cellEls[r][0].getBoundingClientRect();
    const b = cellEls[r][SIZE - 1].getBoundingClientRect();
    const base = fxLayer.getBoundingClientRect();

    const left = a.left - base.left;
    const top = a.top - base.top;
    const width = b.right - a.left;
    const height = a.height;

    const el = document.createElement("div");
    el.className = "fx-beam h";
    el.style.left = `${left}px`;
    el.style.top = `${top + height * 0.28}px`;
    el.style.width = `${width}px`;
    el.style.height = `${Math.max(6, height * 0.44)}px`;
    fxAdd(el);
  }

  function fxBeamCol(c) {
    if (!fxLayer || !cellEls[0] || !cellEls[0][c] || !cellEls[SIZE - 1] || !cellEls[SIZE - 1][c]) return;
    const a = cellEls[0][c].getBoundingClientRect();
    const b = cellEls[SIZE - 1][c].getBoundingClientRect();
    const base = fxLayer.getBoundingClientRect();

    const left = a.left - base.left;
    const top = a.top - base.top;
    const height = b.bottom - a.top;
    const width = a.width;

    const el = document.createElement("div");
    el.className = "fx-beam v";
    el.style.left = `${left + width * 0.28}px`;
    el.style.top = `${top}px`;
    el.style.width = `${Math.max(6, width * 0.44)}px`;
    el.style.height = `${height}px`;
    fxAdd(el);
  }

  const game = {
    board: [],
    selected: null,
    busy: false,
    score: 0,
    best: 0,
    level: 1,
    moves: 0,
    timeMax: 0,
    combo: 1,
    sound: true,

    baseHpMax: BASE_HP_MAX,
    baseHp: BASE_HP_MAX,
    baseShield: 0,

    enemyHpMax: 0,
    enemyHp: 0,
    enemyAttack: 0,

    emp: 0,
    nukeCharge: 0,

    allowedColors: [0, 1, 2, 3, 4, 5],

    mode: "arcade",
  };

  const keyOf = (r, c) => `${r},${c}`;

  function init() {
    boardEl.style.setProperty("--size", SIZE);
    setLanguage(detectInitialLanguage());
    loadMusicSettings();
    ensureMusicElement();
    applyMusicUI();
    buildBoardUI();
    bindUI();
    loadBest();
    showOverlay(
      t("overlay.welcome.title"),
      t("overlay.welcome.text"),
      t("overlay.welcome.button"),
      () => {
        newGame();
      }
    );
    updateStats();
  }

  function buildBoardUI() {
    boardEl.innerHTML = "";
    for (let r = 0; r < SIZE; r += 1) {
      const row = [];
      for (let c = 0; c < SIZE; c += 1) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        cell.setAttribute("aria-label", t("aria.jewel"));
        boardEl.appendChild(cell);
        row.push(cell);
      }
      cellEls.push(row);
    }
  }

  function bindUI() {
    boardEl.addEventListener("pointerdown", onPointerDown);
    boardEl.addEventListener("pointerup", onPointerUp);
    newGameBtn.addEventListener("click", () => {
      startMusicFromUserGesture();
      newGame();
    });
    shuffleBtn.addEventListener("click", () => shuffleBoard());
    soundBtn.addEventListener("click", () => toggleSound());
    if (musicBtn) {
      musicBtn.addEventListener("click", () => {
        startMusicFromUserGesture();
        setMusicEnabled(!music.enabled);
      });
    }
    if (musicVolumeEl) {
      musicVolumeEl.addEventListener("input", () => {
        const v = Number(musicVolumeEl.value);
        if (!Number.isNaN(v)) setMusicVolume(v / 100);
      });
    }
    if (languageBtn) {
      languageBtn.addEventListener("click", () => {
        setLanguage(lang === "ru" ? "en" : "ru");
      });
    }
    if (tutorialBtn) {
      tutorialBtn.addEventListener("click", () => {
        startTutorial();
      });
    }
    if (campaignBtn) {
      campaignBtn.addEventListener("click", () => {
        startCampaign();
      });
    }
    if (tutorialBack)
      tutorialBack.addEventListener("click", () => (campaign.active ? campaignPrevStep() : tutorialPrevStep()));
    if (tutorialNext)
      tutorialNext.addEventListener("click", () => (campaign.active ? campaignNextStep() : tutorialNextStep()));
    if (tutorialSkip) {
      tutorialSkip.addEventListener("click", () => {
        if (campaign.active) stopCampaign({ completed: true });
        else hideTutorialOverlay({ completed: true });
      });
    }
    overlayButton.addEventListener("click", () => {
      if (overlayAction) {
        const action = overlayAction;
        overlayAction = null;
        hideOverlay();
        startMusicFromUserGesture();
        action();
      }
    });
  }

  function onPointerDown(event) {
    startMusicFromUserGesture();
    if (game.busy) return;
    const cell = getCellFromEvent(event);
    if (!cell) return;
    dragStart = cell;
  }

  function onPointerUp(event) {
    if (game.busy) return;
    const cell = getCellFromEvent(event);
    if (!cell) return;

    if (dragStart) {
      if (dragStart.r !== cell.r || dragStart.c !== cell.c) {
        if (isAdjacent(dragStart, cell)) {
          attemptSwap(dragStart, cell);
        } else {
          setSelected(cell);
        }
      } else {
        handleTap(cell);
      }
    } else {
      handleTap(cell);
    }

    dragStart = null;
  }

  function handleTap(cell) {
    if (game.selected && samePos(game.selected, cell)) {
      clearSelected();
      return;
    }

    if (game.selected && isAdjacent(game.selected, cell)) {
      attemptSwap(game.selected, cell);
      return;
    }

    setSelected(cell);
  }

  function getCellFromEvent(event) {
    const target = event.target.closest(".cell");
    if (!target) return null;
    return {
      r: Number(target.dataset.row),
      c: Number(target.dataset.col),
    };
  }

  function samePos(a, b) {
    return a.r === b.r && a.c === b.c;
  }

  function isAdjacent(a, b) {
    const dr = Math.abs(a.r - b.r);
    const dc = Math.abs(a.c - b.c);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  }

  function setSelected(cell) {
    game.selected = cell;
    updateBoardUI();
  }

  function clearSelected() {
    game.selected = null;
    updateBoardUI();
  }

  function loadBest() {
    const stored = Number(localStorage.getItem("jewelsBest"));
    if (!Number.isNaN(stored)) {
      game.best = stored;
    }
  }

  function saveBest() {
    localStorage.setItem("jewelsBest", String(game.best));
  }

  function newGame() {
    game.level = 1;
    game.score = 0;
    game.combo = 1;
    game.selected = null;
    game.busy = false;

    game.baseHp = game.baseHpMax;
    game.baseShield = 0;
    game.emp = 0;
    game.nukeCharge = 0;
    initLevel();

    if (game.mode !== "campaign" && !isTutorialDone()) {
      startTutorial();
    }
  }

  function nextLevel() {
    game.level += 1;
    game.combo = 1;
    game.selected = null;
    game.busy = false;

    game.emp = 0;
    game.baseHp = Math.min(game.baseHpMax, game.baseHp + 10);
    initLevel();
  }

  function initLevel() {
    const config = getWaveConfig(game.level);
    game.enemyHpMax = config.enemyHp;
    game.enemyHp = config.enemyHp;
    game.enemyAttack = config.enemyAttack;
    game.timeMax = config.time;
    game.moves = config.time;
    game.allowedColors = getAllowedColors(game.level);
    game.board = generateBoard();
    updateStats();
    updateBoardUI({ spawnSet: allPositionsSet() });
    showToast(t("toast.wave", { wave: game.level }));
    logCombat(t("toast.wave", { wave: game.level }));
  }

  function getAllowedColors(wave) {
    if (game.mode === "campaign") return [0, 1, 2, 3, 4, 5];
    if (wave <= 1) return [0, 4, 1];
    if (wave === 2) return [0, 4, 1, 3];
    if (wave === 3) return [0, 4, 1, 3, 2];
    return [0, 1, 2, 3, 4, 5];
  }

  function randomAllowedColor() {
    const list = Array.isArray(game.allowedColors) && game.allowedColors.length ? game.allowedColors : [0, 1, 2, 3, 4, 5];
    return list[randomInt(list.length)];
  }

  function getWaveConfig(wave) {
    if (game.mode === "campaign") {
      return { enemyHp: 160, enemyAttack: 6, time: 30 };
    }
    if (wave <= 1) return { enemyHp: 90, enemyAttack: 0, time: 28 };
    if (wave === 2) return { enemyHp: 120, enemyAttack: 4, time: 24 };
    if (wave === 3) return { enemyHp: 160, enemyAttack: 6, time: 22 };

    const enemyHp = 180 + (wave - 4) * 85;
    const enemyAttack = 7 + Math.floor((wave - 3) / 2);
    const time = 20 + Math.floor((wave - 1) / 4);
    return { enemyHp, enemyAttack, time };
  }

  function generateBoard() {
    let board = null;
    let attempts = 0;
    while (attempts < 60) {
      board = createBoardNoMatches();
      if (findMatches(board).length === 0 && hasPossibleMove(board)) {
        return board;
      }
      attempts += 1;
    }
    return board || createBoardNoMatches();
  }

  function createBoardNoMatches() {
    const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        const options = [];
        const allowed =
          Array.isArray(game.allowedColors) && game.allowedColors.length ? game.allowedColors : [0, 1, 2, 3, 4, 5];
        for (const color of allowed) {
          if (
            c >= 2 &&
            board[r][c - 1] &&
            board[r][c - 2] &&
            board[r][c - 1].color === color &&
            board[r][c - 2].color === color
          ) {
            continue;
          }
          if (
            r >= 2 &&
            board[r - 1][c] &&
            board[r - 2][c] &&
            board[r - 1][c].color === color &&
            board[r - 2][c].color === color
          ) {
            continue;
          }
          options.push(color);
        }
        const color = options.length > 0 ? options[randomInt(options.length)] : randomAllowedColor();
        board[r][c] = { color, special: null };
      }
    }
    return board;
  }

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function updateStats() {
    levelEl.textContent = String(game.level);
    scoreEl.textContent = String(game.score);
    targetEl.textContent = String(Math.max(game.enemyHp, 0));
    movesEl.textContent = String(Math.max(game.moves, 0));
    comboEl.textContent = `x${game.combo.toFixed(2)}`;
    bestEl.textContent = String(game.best);

    const enemyProgress = game.enemyHpMax > 0 ? Math.min(game.enemyHp / game.enemyHpMax, 1) : 0;
    enemyFill.style.width = `${enemyProgress * 100}%`;
    enemyReadout.textContent = `${Math.max(game.enemyHp, 0)}/${game.enemyHpMax}`;

    const baseProgress = game.baseHpMax > 0 ? Math.min(game.baseHp / game.baseHpMax, 1) : 0;
    baseFill.style.width = `${baseProgress * 100}%`;
    baseReadout.textContent =
      game.baseShield > 0
        ? `${Math.max(game.baseHp, 0)}/${game.baseHpMax} (+${game.baseShield})`
        : `${Math.max(game.baseHp, 0)}/${game.baseHpMax}`;

    if (timeFill && timeReadout) {
      const timeProgress = game.timeMax > 0 ? Math.min(game.moves / game.timeMax, 1) : 0;
      timeFill.style.width = `${timeProgress * 100}%`;
      timeReadout.textContent = `${Math.max(game.moves, 0)}/${game.timeMax}`;
    }

    if (baseSub) {
      baseSub.textContent = t("hud.baseSub", { shield: game.baseShield, emp: game.emp });
    }

    if (enemySub) {
      enemySub.textContent = t("hud.enemySub", {
        attack: game.enemyAttack,
        mitigation: game.emp * EMP_REDUCTION_PER_BLUE,
      });
    }
  }

  function updateBest() {
    if (game.score > game.best) {
      game.best = game.score;
      saveBest();
    }
  }

  function updateBoardUI({ clearingSet, spawnSet, swapPair } = {}) {
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        const el = cellEls[r][c];
        const cell = game.board[r] ? game.board[r][c] : null;
        el.className = "cell";
        if (cell) {
          el.classList.add("gem");
          if (cell.special === "stripe-h") el.classList.add("special-stripe-h");
          if (cell.special === "stripe-v") el.classList.add("special-stripe-v");
          if (cell.special === "color") el.classList.add("special-color");
          el.dataset.color = cell.special === "color" ? "color" : String(cell.color);
        } else {
          el.dataset.color = "empty";
        }

        if (game.selected && game.selected.r === r && game.selected.c === c) {
          el.classList.add("selected");
        }

        const key = keyOf(r, c);
        if (clearingSet && clearingSet.has(key)) el.classList.add("clearing");
        if (spawnSet && spawnSet.has(key)) el.classList.add("spawn");
        const hints = activeHintSet();
        if (hints && hints.has(key)) el.classList.add("tutorial-hint");
        if (
          swapPair &&
          (samePos(swapPair[0], { r, c }) || samePos(swapPair[1], { r, c }))
        ) {
          el.classList.add("swap");
        }
      }
    }
  }

  function allPositionsSet() {
    const set = new Set();
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        set.add(keyOf(r, c));
      }
    }
    return set;
  }

  async function attemptSwap(a, b) {
    if (game.busy) return;
    game.busy = true;
    clearSelected();

    const cellA = game.board[a.r][a.c];
    const cellB = game.board[b.r][b.c];
    if (!cellA || !cellB) {
      game.busy = false;
      return;
    }

    if (cellA.special === "color" || cellB.special === "color") {
      await handleColorBombSwap(a, b, cellA, cellB);
      game.busy = false;
      return;
    }

    swapBoard(a, b);
    updateBoardUI({ swapPair: [a, b] });
    const p1 = fxLocalCenterFromCell(a.r, a.c);
    const p2 = fxLocalCenterFromCell(b.r, b.c);
    if (p1) fxSpray(p1.x, p1.y, 14);
    if (p2) fxSpray(p2.x, p2.y, 14);
    playSound("swap");
    await delay(160);

    const matches = findMatches(game.board);
    if (matches.length === 0) {
      swapBoard(a, b);
      updateBoardUI({ swapPair: [a, b] });
      await delay(120);
      showToast(t("toast.noMatch"));
      game.busy = false;
      return;
    }

    game.moves -= 1;
    game.emp = 0;
    updateStats();

    await resolveMatches({ direct: true, lastSwap: { from: a, to: b } });
    await postMoveCheck();
    game.busy = false;
  }

  async function handleColorBombSwap(a, b, cellA, cellB) {
    swapBoard(a, b);
    updateBoardUI({ swapPair: [a, b] });
    playSound("swap");
    await delay(160);

    game.moves -= 1;
    game.emp = 0;
    updateStats();

    const clearSet = new Set();
    if (cellA.special === "color" && cellB.special === "color") {
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          clearSet.add(keyOf(r, c));
        }
      }
    } else {
      const baseColor = cellA.special === "color" ? cellB.color : cellA.color;
      const targetColor = baseColor == null ? pickDominantColor() : baseColor;
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          const cell = game.board[r][c];
          if (cell && cell.color === targetColor) {
            clearSet.add(keyOf(r, c));
          }
        }
      }
      clearSet.add(keyOf(a.r, a.c));
      clearSet.add(keyOf(b.r, b.c));
    }

    game.combo = 1;
    updateStats();

    await performClear(clearSet, [], new Set());
    await resolveMatches({ direct: false, lastSwap: null });
    await postMoveCheck();
  }

  async function resolveMatches({ direct, lastSwap }) {
    let cascade = 0;
    while (true) {
      const groups = findMatches(game.board);
      if (groups.length === 0) break;

      cascade += 1;
      game.combo = 1 + (cascade - 1) * COMBO_STEP;
      updateStats();

      const { clearSet, specials, protectedSet } = computeClear(groups, lastSwap, direct);
      await performClear(clearSet, specials, protectedSet);
      direct = false;
      lastSwap = null;
    }

    game.combo = 1;
    updateStats();
  }

  function computeClear(groups, lastSwap, direct) {
    const clearSet = new Set();
    const specialMap = new Map();

    for (const group of groups) {
      for (const cell of group.cells) {
        clearSet.add(keyOf(cell.r, cell.c));
      }
    }

    for (const group of groups) {
      if (group.length < 4) continue;
      const anchor = chooseAnchor(group, lastSwap, direct);
      if (!anchor) continue;
      const key = keyOf(anchor.r, anchor.c);
      const specialType = group.length >= 5 ? "color" : group.orientation === "h" ? "stripe-h" : "stripe-v";
      const existing = specialMap.get(key);
      if (existing && existing.special === "color") continue;
      if (!existing || specialType === "color") {
        specialMap.set(key, {
          r: anchor.r,
          c: anchor.c,
          special: specialType,
          color: group.color,
        });
      }
    }

    const protectedSet = new Set();
    for (const key of specialMap.keys()) {
      clearSet.delete(key);
      protectedSet.add(key);
    }

    return {
      clearSet,
      specials: Array.from(specialMap.values()),
      protectedSet,
    };
  }

  function chooseAnchor(group, lastSwap, direct) {
    if (direct && lastSwap) {
      const inTo = group.cells.some((cell) => cell.r === lastSwap.to.r && cell.c === lastSwap.to.c);
      if (inTo) return lastSwap.to;
      const inFrom = group.cells.some(
        (cell) => cell.r === lastSwap.from.r && cell.c === lastSwap.from.c
      );
      if (inFrom) return lastSwap.from;
    }
    return group.cells[0];
  }

  function applyCombatFromClear(expanded) {
    const counts = Array(COLORS).fill(0);
    let specialsCleared = 0;

    for (const key of expanded) {
      const [r, c] = key.split(",").map(Number);
      const cell = game.board[r][c];
      if (!cell) continue;
      if (cell.special) specialsCleared += 1;
      if (cell.color != null) counts[cell.color] += 1;
    }

    const red = counts[0];
    const teal = counts[1];
    const yellow = counts[2];
    const blue = counts[3];
    const green = counts[4];
    const pink = counts[5];

    const combo = game.combo;

    const damage = Math.floor((red * 3 + yellow * 1 + specialsCleared * 4) * combo);
    if (damage > 0) {
      game.enemyHp = Math.max(0, game.enemyHp - damage);
      if (damage >= 12) {
        logCombat(t("log.youDamage", { amount: damage }));
      }
      pulse(enemyBarEl, "pulse");
      if (damage >= 18) fxFlash("red");

      const center = fxLocalCenterOfBoard();
      const enemyRect = enemyFill ? enemyFill.getBoundingClientRect() : null;
      if (center && enemyRect) {
        const dst = fxLocalPointFromRectAnchor(enemyRect, 0.75, 0.5);
        if (dst) fxTracer(center.x, center.y, dst.x, dst.y, "red");
      }

      const near = enemyFill ? enemyFill.getBoundingClientRect() : null;
      const base = fxLayer ? fxLayer.getBoundingClientRect() : null;
      if (near && base) {
        const x = near.left - base.left + near.width * 0.85;
        const y = near.top - base.top + 14;
        fxFloatText(x, y, `-${damage}`, "damage");
        if (damage >= 8) fxSpray(x, y + 18, 18);
        if (damage >= 14) {
          fxRing(x, y + 14, "red");
          fxShards(x, y + 12, 10, "red");
        }
      }
    }

    const repair = Math.floor(green * 2 * combo);
    if (repair > 0) {
      game.baseHp = Math.min(game.baseHpMax, game.baseHp + repair);
      if (repair >= 8) {
        logCombat(t("log.youRepair", { amount: repair }));
      }
      pulse(baseBarEl, "pulse");
      if (repair >= 14) fxFlash("teal");

      const center = fxLocalCenterOfBoard();
      const baseRect = baseFill ? baseFill.getBoundingClientRect() : null;
      if (center && baseRect) {
        const dst = fxLocalPointFromRectAnchor(baseRect, 0.25, 0.5);
        if (dst) fxTracer(center.x, center.y, dst.x, dst.y, "green");
      }

      const near = baseFill ? baseFill.getBoundingClientRect() : null;
      const base = fxLayer ? fxLayer.getBoundingClientRect() : null;
      if (near && base) {
        const x = near.left - base.left + near.width * 0.15;
        const y = near.top - base.top + 14;
        fxFloatText(x, y, `+${repair}`, "repair");
        if (repair >= 6) fxSpray(x, y + 18, 14);
        if (repair >= 10) {
          fxRing(x, y + 14, "green");
          fxShards(x, y + 12, 8, "green");
        }
      }
    }

    const shieldGain = Math.floor(teal * 2 * combo);
    if (shieldGain > 0) {
      game.baseShield = Math.min(SHIELD_MAX, game.baseShield + shieldGain);
      if (shieldGain >= 8) {
        logCombat(t("log.youShield", { amount: shieldGain }));
      }
      pulse(baseBarEl, "pulse");

      const center = fxLocalCenterOfBoard();
      const baseRect = baseFill ? baseFill.getBoundingClientRect() : null;
      if (center && baseRect) {
        const dst = fxLocalPointFromRectAnchor(baseRect, 0.5, 0.5);
        if (dst) fxTracer(center.x, center.y, dst.x, dst.y, "teal");
      }

      const near = baseFill ? baseFill.getBoundingClientRect() : null;
      const base = fxLayer ? fxLayer.getBoundingClientRect() : null;
      if (near && base) {
        const x = near.left - base.left + near.width * 0.55;
        const y = near.top - base.top + 14;
        fxFloatText(x, y, `+${shieldGain}`, "shield");
        if (shieldGain >= 6) fxSpray(x, y + 18, 14);
        if (shieldGain >= 10) {
          fxRing(x, y + 14, "teal");
          fxShards(x, y + 12, 8, "teal");
        }
      }
    }

    const empAdded = blue;
    if (empAdded > 0) {
      game.emp += empAdded;

      const near = enemyFill ? enemyFill.getBoundingClientRect() : null;
      const base = fxLayer ? fxLayer.getBoundingClientRect() : null;
      if (near && base && empAdded >= 3) {
        fxFloatText(
          near.left - base.left + near.width * 0.15,
          near.top - base.top + 10,
          `EMP +${empAdded}`,
          "emp"
        );
      }

      const center = fxLocalCenterOfBoard();
      const enemyRect = enemyFill ? enemyFill.getBoundingClientRect() : null;
      if (center && enemyRect && empAdded >= 2) {
        const dst = fxLocalPointFromRectAnchor(enemyRect, 0.35, 0.5);
        if (dst) {
          fxTracer(center.x, center.y, dst.x, dst.y, "blue");
          fxRing(dst.x, dst.y, "");
        }
      }
    }

    if (pink > 0) {
      game.nukeCharge += pink;
    }

    let nukesFired = 0;
    while (game.nukeCharge >= NUKE_COST && game.enemyHp > 0) {
      game.nukeCharge -= NUKE_COST;
      game.enemyHp = Math.max(0, game.enemyHp - NUKE_DAMAGE);
      nukesFired += 1;
    }
    if (nukesFired > 0) {
      const message =
        nukesFired === 1
          ? t("toast.tacticalStrike.one")
          : t("toast.tacticalStrike.many", { count: nukesFired });
      showToast(message);
      logCombat(message);
      pulse(enemyBarEl, "hit");

      const center = fxLocalCenterFromCell(Math.floor(SIZE / 2), Math.floor(SIZE / 2));
      if (center) {
        fxBigBurst(center.x, center.y);
        fxBurst(center.x, center.y);
        fxSpray(center.x, center.y, 34);
        fxRing(center.x, center.y, "red");
        fxShards(center.x, center.y, 18, "red");
      }
      shakeFrame();
      fxFlash("red");
    }

    return { damage, repair, shieldGain, empAdded, nukesFired };
  }

  function enemyTurn() {
    const mitigated = game.emp * EMP_REDUCTION_PER_BLUE;
    const incoming = Math.max(0, game.enemyAttack - mitigated);
    game.emp = 0;

    if (incoming <= 0) {
      return { incoming: 0, mitigated, absorbed: 0, damage: 0 };
    }

    const absorbed = Math.min(game.baseShield, incoming);
    game.baseShield -= absorbed;
    const remainder = incoming - absorbed;
    if (remainder > 0) {
      game.baseHp = Math.max(0, game.baseHp - remainder);
    }

    return { incoming, mitigated, absorbed, damage: remainder };
  }

  async function performClear(clearSet, specials, protectedSet) {
    if (!clearSet.size) return;
    const expanded = expandClearSet(new Set(clearSet), protectedSet);
    if (!expanded.size) return;

    const combat = applyCombatFromClear(expanded);

    if (campaign.active) {
      campaign.lastClear = {
        total: expanded.size,
        damage: combat.damage,
        repair: combat.repair,
        shieldGain: combat.shieldGain,
        empAdded: combat.empAdded,
        nukesFired: combat.nukesFired,
      };
      renderCampaign();
      campaignMaybeAutoAdvance();
    }

    // A few lightweight sparks so clears feel punchy.
    if (expanded.size) {
      let shown = 0;
      for (const key of expanded) {
        if (shown >= 12) break;
        const [r, c] = key.split(",").map(Number);
        if ((r + c) % 2 !== 0) continue;
        const at = fxLocalCenterFromCell(r, c);
        if (at) {
          fxSpark(at.x + (shown % 2 === 0 ? -10 : 10), at.y + (shown % 3 === 0 ? -8 : 8));
          shown += 1;
        }
      }

      if (expanded.size >= 6) fxFlash("teal");

      if (expanded.size >= 10) {
        const center = fxLocalCenterOfBoard();
        if (center) {
          fxRing(center.x, center.y, "teal");
          fxShards(center.x, center.y, 16, "teal");
        }
      }
    }

    const clearCount = expanded.size;
    game.score += Math.floor(clearCount * SCORE_PER * game.combo);
    updateBest();
    updateStats();
    updateBoardUI({ clearingSet: expanded });
    playSound("clear");
    await delay(220);

    for (const key of expanded) {
      const [r, c] = key.split(",").map(Number);
      game.board[r][c] = null;
    }

    for (const special of specials) {
      const color = special.special === "color" ? null : special.color;
      game.board[special.r][special.c] = { color, special: special.special };
    }

    const spawnSet = collapseAndFill();
    updateBoardUI({ spawnSet });
    await delay(160);
  }

  function expandClearSet(clearSet, protectedSet) {
    const queue = Array.from(clearSet);
    const processed = new Set();

    while (queue.length) {
      const key = queue.shift();
      const [r, c] = key.split(",").map(Number);
      const cell = game.board[r][c];
      if (!cell || !cell.special) continue;
      if (processed.has(key)) continue;
      processed.add(key);

      if (cell.special === "stripe-h") {
        fxBeamRow(r);
        const at = fxLocalCenterFromCell(r, c);
        if (at) {
          fxSpray(at.x, at.y, 28);
          fxRing(at.x, at.y, "");
        }
        for (let col = 0; col < SIZE; col += 1) {
          addToClear(clearSet, protectedSet, queue, r, col);
        }
      } else if (cell.special === "stripe-v") {
        fxBeamCol(c);
        const at = fxLocalCenterFromCell(r, c);
        if (at) {
          fxSpray(at.x, at.y, 28);
          fxRing(at.x, at.y, "");
        }
        for (let row = 0; row < SIZE; row += 1) {
          addToClear(clearSet, protectedSet, queue, row, c);
        }
      } else if (cell.special === "color") {
        const at = fxLocalCenterFromCell(r, c);
        if (at) {
          fxBigBurst(at.x, at.y);
          fxBurst(at.x, at.y);
          fxSpray(at.x, at.y, 38);
          fxFlash("red");
          fxRing(at.x, at.y, "red");
          fxShards(at.x, at.y, 22, "red");
        }
        const color = pickDominantColor();
        for (let row = 0; row < SIZE; row += 1) {
          for (let col = 0; col < SIZE; col += 1) {
            const target = game.board[row][col];
            if (target && target.color === color) {
              addToClear(clearSet, protectedSet, queue, row, col);
            }
          }
        }
      }
    }

    return clearSet;
  }

  function addToClear(clearSet, protectedSet, queue, r, c) {
    const key = keyOf(r, c);
    if (protectedSet && protectedSet.has(key)) return;
    if (!clearSet.has(key)) {
      clearSet.add(key);
      queue.push(key);
    }
  }

  function collapseAndFill() {
    const spawnSet = new Set();
    for (let c = 0; c < SIZE; c += 1) {
      let writeRow = SIZE - 1;
      for (let r = SIZE - 1; r >= 0; r -= 1) {
        if (game.board[r][c]) {
          if (writeRow !== r) {
            game.board[writeRow][c] = game.board[r][c];
            game.board[r][c] = null;
          }
          writeRow -= 1;
        }
      }
      for (let r = writeRow; r >= 0; r -= 1) {
        game.board[r][c] = { color: randomAllowedColor(), special: null };
        spawnSet.add(keyOf(r, c));
      }
    }
    return spawnSet;
  }

  function swapBoard(a, b) {
    const temp = game.board[a.r][a.c];
    game.board[a.r][a.c] = game.board[b.r][b.c];
    game.board[b.r][b.c] = temp;
  }

  function findMatches(board) {
    const groups = [];
    for (let r = 0; r < SIZE; r += 1) {
      let c = 0;
      while (c < SIZE) {
        const cell = board[r][c];
        const color = cell ? cell.color : null;
        if (color == null) {
          c += 1;
          continue;
        }
        let end = c + 1;
        while (end < SIZE && board[r][end] && board[r][end].color === color) {
          end += 1;
        }
        const length = end - c;
        if (length >= 3) {
          const cells = [];
          for (let col = c; col < end; col += 1) {
            cells.push({ r, c: col });
          }
          groups.push({ cells, length, orientation: "h", color });
        }
        c = end;
      }
    }

    for (let c = 0; c < SIZE; c += 1) {
      let r = 0;
      while (r < SIZE) {
        const cell = board[r][c];
        const color = cell ? cell.color : null;
        if (color == null) {
          r += 1;
          continue;
        }
        let end = r + 1;
        while (end < SIZE && board[end][c] && board[end][c].color === color) {
          end += 1;
        }
        const length = end - r;
        if (length >= 3) {
          const cells = [];
          for (let row = r; row < end; row += 1) {
            cells.push({ r: row, c });
          }
          groups.push({ cells, length, orientation: "v", color });
        }
        r = end;
      }
    }
    return groups;
  }

  function hasPossibleMove(board) {
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        const cell = board[r][c];
        if (cell && cell.special === "color") return true;
      }
    }

    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        if (c + 1 < SIZE && swapMakesMatch(board, r, c, r, c + 1)) return true;
        if (r + 1 < SIZE && swapMakesMatch(board, r, c, r + 1, c)) return true;
      }
    }
    return false;
  }

  function swapMakesMatch(board, r1, c1, r2, c2) {
    const a = board[r1][c1];
    const b = board[r2][c2];
    if (!a || !b) return false;
    if (a.color == null || b.color == null) return true;
    board[r1][c1] = b;
    board[r2][c2] = a;
    const result = formsMatchAt(board, r1, c1) || formsMatchAt(board, r2, c2);
    board[r1][c1] = a;
    board[r2][c2] = b;
    return result;
  }

  function formsMatchAt(board, r, c) {
    const cell = board[r][c];
    if (!cell || cell.color == null) return false;
    const color = cell.color;

    let count = 1;
    let col = c - 1;
    while (col >= 0 && board[r][col] && board[r][col].color === color) {
      count += 1;
      col -= 1;
    }
    col = c + 1;
    while (col < SIZE && board[r][col] && board[r][col].color === color) {
      count += 1;
      col += 1;
    }
    if (count >= 3) return true;

    count = 1;
    let row = r - 1;
    while (row >= 0 && board[row][c] && board[row][c].color === color) {
      count += 1;
      row -= 1;
    }
    row = r + 1;
    while (row < SIZE && board[row][c] && board[row][c].color === color) {
      count += 1;
      row += 1;
    }
    return count >= 3;
  }

  function pickDominantColor() {
    const counts = Array(COLORS).fill(0);
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        const cell = game.board[r][c];
        if (cell && cell.color != null) {
          counts[cell.color] += 1;
        }
      }
    }
    const allowed =
      Array.isArray(game.allowedColors) && game.allowedColors.length ? game.allowedColors : [0, 1, 2, 3, 4, 5];
    let bestColor = allowed[0];
    for (let i = 1; i < allowed.length; i += 1) {
      const color = allowed[i];
      if (counts[color] > counts[bestColor]) bestColor = color;
    }
    return bestColor;
  }

  async function postMoveCheck() {
    if (game.enemyHp <= 0) {
      if (campaign.active) {
        showOverlay(
          t("campaign.complete.title"),
          t("campaign.complete.text"),
          t("campaign.complete.button"),
          () => {
            stopCampaign({ completed: true });
          }
        );
        return;
      }
      showOverlay(
        t("overlay.waveCleared.title"),
        t("overlay.waveCleared.text", { nextWave: game.level + 1 }),
        t("overlay.waveCleared.button"),
        () => {
          nextLevel();
        }
      );
      return;
    }

    if (game.moves <= 0) {
      showOverlay(t("overlay.overrun.title"), t("overlay.overrun.text"), t("overlay.overrun.button"), () => {
        newGame();
      });
      return;
    }

    const report = enemyTurn();
    if (campaign.active) {
      campaign.lastEnemy = report;
    }
    updateStats();

    if (campaign.active) {
      renderCampaign();
      campaignMaybeAutoAdvance();
    }

    if (report) {
      if (report.incoming <= 0) {
        if (game.enemyAttack > 0 || report.mitigated > 0) {
          logCombat(t("log.enemyNoDamage"));
        }
      } else {
        if (report.absorbed > 0) {
          logCombat(t("log.enemyShield", { amount: report.absorbed }));
          pulse(baseBarEl, "pulse");
        }
        if (report.damage > 0) {
          logCombat(t("log.enemyHit", { amount: report.damage }));
          pulse(baseBarEl, "hit");
          shakeFrame();

          fxFlash("red");

          const near = baseFill ? baseFill.getBoundingClientRect() : null;
          const base = fxLayer ? fxLayer.getBoundingClientRect() : null;
          if (near && base) {
            const x = near.left - base.left + near.width * 0.85;
            const y = near.top - base.top + 14;
            fxFloatText(x, y, `-${report.damage}`, "damage");
            fxSpray(x, y + 18, 26);
            fxRing(x, y + 14, "red");
            fxShards(x, y + 12, 14, "red");
          }

          const baseRect = baseFill ? baseFill.getBoundingClientRect() : null;
          const enemyRect = enemyFill ? enemyFill.getBoundingClientRect() : null;
          if (baseRect && enemyRect) {
            const from = fxLocalPointFromRectAnchor(enemyRect, 0.5, 0.55);
            const to = fxLocalPointFromRectAnchor(baseRect, 0.5, 0.55);
            if (from && to) fxTracer(from.x, from.y, to.x, to.y, "red");
          }
        }
      }
    }

    pulse(timeBarEl, "pulse");

    if (game.baseHp <= 0) {
      showOverlay(
        t("overlay.baseDestroyed.title"),
        t("overlay.baseDestroyed.text"),
        t("overlay.baseDestroyed.button"),
        () => {
          newGame();
        }
      );
      return;
    }

    if (!hasPossibleMove(game.board)) {
      showToast(t("toast.noMovesShuffle"));
      shuffleBoard();
    }
  }

  function shuffleBoard() {
    if (game.busy) return;
    game.board = generateBoard();
    updateBoardUI({ spawnSet: allPositionsSet() });
  }

  function toggleSound() {
    game.sound = !game.sound;
    soundBtn.textContent = t(game.sound ? "ui.soundOn" : "ui.soundOff");
  }

  function showOverlay(title, text, buttonText, action) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlayButton.textContent = buttonText;
    overlayAction = action;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function getAudioContext() {
    if (!audio.ctx) {
      audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audio.ctx;
  }

  function playSound(type) {
    if (!game.sound) return;
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    if (type === "clear") oscillator.frequency.value = 520;
    else oscillator.frequency.value = 440;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.12);
  }

  init();
})();
