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
  const languageBtn = document.getElementById("language");
  const tutorialBtn = document.getElementById("tutorial");

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

  const baseBarEl = baseFill ? baseFill.closest(".status-bar") : null;
  const enemyBarEl = enemyFill ? enemyFill.closest(".status-bar") : null;
  const timeBarEl = timeFill ? timeFill.closest(".status-bar") : null;

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
      "ui.specials.bomb": "Match 5: bomb (clears one color)",
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
      "ui.specials.bomb": "Match 5: bomb (clears one color)",
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
      "ui.how.4": "Match 4 creates a line-clear strike. Match 5 creates a tactical bomb.",
      "ui.how.5": "Win by dropping enemy hull to 0 before time runs out (and before your base breaks).",
      "ui.tips.1": "Cascades raise Sync. Higher Sync makes every clear more effective.",
      "ui.tips.2": "Save striped jewels for panic clears or to finish a wave.",
      "ui.tips.3": "If shields are up, you can gamble on bigger combos.",

      "ui.soundOn": "Sound: On",
      "ui.soundOff": "Sound: Off",
      "ui.language": "Language: {lang}",
      "ui.tutorial": "Tutorial",
      "ui.next": "Next",
      "ui.back": "Back",
      "ui.skip": "Skip",
      "ui.done": "Done",

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
      "ui.tips.1": "Каскады повышают синхрон. Чем выше синхрон, тем сильнее каждый клир.",
      "ui.tips.2": "Держи полосатые камни для паники или для добивания волны.",
      "ui.tips.3": "Когда щиты подняты, можно рискнуть ради большой комбы.",

      "ui.soundOn": "Звук: Вкл",
      "ui.soundOff": "Звук: Выкл",
      "ui.language": "Язык: {lang}",
      "ui.tutorial": "Обучение",
      "ui.next": "Дальше",
      "ui.back": "Назад",
      "ui.skip": "Пропустить",
      "ui.done": "Готово",

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
    if (languageBtn) {
      languageBtn.textContent = t("ui.language", { lang: lang.toUpperCase() });
    }

    for (const row of cellEls) {
      for (const cell of row) {
        cell.setAttribute("aria-label", t("aria.jewel"));
      }
    }

    if (tutorial.active) {
      renderTutorial();
    }
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

  function setTutorialHintForStep() {
    tutorial.hintSet.clear();
    if (tutorial.step !== 2) return;
    const hint = findHintMove();
    if (!hint) return;
    tutorial.hintSet.add(keyOf(hint.a.r, hint.a.c));
    tutorial.hintSet.add(keyOf(hint.b.r, hint.b.c));
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
  };

  const keyOf = (r, c) => `${r},${c}`;

  function init() {
    boardEl.style.setProperty("--size", SIZE);
    setLanguage(detectInitialLanguage());
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
    newGameBtn.addEventListener("click", () => newGame());
    shuffleBtn.addEventListener("click", () => shuffleBoard());
    soundBtn.addEventListener("click", () => toggleSound());
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
    if (tutorialBack) tutorialBack.addEventListener("click", () => tutorialPrevStep());
    if (tutorialNext) tutorialNext.addEventListener("click", () => tutorialNextStep());
    if (tutorialSkip) {
      tutorialSkip.addEventListener("click", () => {
        hideTutorialOverlay({ completed: true });
      });
    }
    overlayButton.addEventListener("click", () => {
      if (overlayAction) {
        const action = overlayAction;
        overlayAction = null;
        hideOverlay();
        action();
      }
    });
  }

  function onPointerDown(event) {
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

    if (!isTutorialDone()) {
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
    game.board = generateBoard();
    updateStats();
    updateBoardUI({ spawnSet: allPositionsSet() });
    showToast(t("toast.wave", { wave: game.level }));
    logCombat(t("toast.wave", { wave: game.level }));
  }

  function getWaveConfig(wave) {
    const enemyHp = 140 + (wave - 1) * 70;
    const enemyAttack = 6 + Math.floor(wave / 2);
    const time = 18 + Math.floor(wave / 3);
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
        for (let color = 0; color < COLORS; color += 1) {
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
        const color =
          options.length > 0 ? options[randomInt(options.length)] : randomInt(COLORS);
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
        if (tutorial.active && tutorial.hintSet && tutorial.hintSet.has(key)) el.classList.add("tutorial-hint");
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
    }

    const repair = Math.floor(green * 2 * combo);
    if (repair > 0) {
      game.baseHp = Math.min(game.baseHpMax, game.baseHp + repair);
      if (repair >= 8) {
        logCombat(t("log.youRepair", { amount: repair }));
      }
      pulse(baseBarEl, "pulse");
    }

    const shieldGain = Math.floor(teal * 2 * combo);
    if (shieldGain > 0) {
      game.baseShield = Math.min(SHIELD_MAX, game.baseShield + shieldGain);
      if (shieldGain >= 8) {
        logCombat(t("log.youShield", { amount: shieldGain }));
      }
      pulse(baseBarEl, "pulse");
    }

    if (blue > 0) {
      game.emp += blue;
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
    }
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

    applyCombatFromClear(expanded);

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
        for (let col = 0; col < SIZE; col += 1) {
          addToClear(clearSet, protectedSet, queue, r, col);
        }
      } else if (cell.special === "stripe-v") {
        for (let row = 0; row < SIZE; row += 1) {
          addToClear(clearSet, protectedSet, queue, row, c);
        }
      } else if (cell.special === "color") {
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
        game.board[r][c] = { color: randomInt(COLORS), special: null };
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
    let bestColor = 0;
    for (let i = 1; i < counts.length; i += 1) {
      if (counts[i] > counts[bestColor]) bestColor = i;
    }
    return bestColor;
  }

  async function postMoveCheck() {
    if (game.enemyHp <= 0) {
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
    updateStats();

    if (report) {
      if (report.incoming <= 0) {
        logCombat(t("log.enemyNoDamage"));
      } else {
        if (report.absorbed > 0) {
          logCombat(t("log.enemyShield", { amount: report.absorbed }));
          pulse(baseBarEl, "pulse");
        }
        if (report.damage > 0) {
          logCombat(t("log.enemyHit", { amount: report.damage }));
          pulse(baseBarEl, "hit");
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
