(() => {
  "use strict";

  const ASSET_ORIGIN = "./assets";
  const HIDE_INSTRUCTIONS_KEY = "nightreign-hide-instructions";

  // Map localized display labels (JA / EN)
  const MAP_LABELS = {
    ja: {
      Default: "通常 (Default)",
      "火口": "火口",
      "山嶺": "山嶺",
      "腐れ森": "腐れ森",
      "隠れ都ノクラテオ": "隠れ都ノクラテオ",
      "大空洞": "大空洞",
    },
    en: {
      Default: "Default",
      "火口": "Crater",
      "山嶺": "Mountaintop",
      "腐れ森": "Rotted Woods",
      "隠れ都ノクラテオ": "Noklateo",
      "大空洞": "Great Hollow",
    },
  };

  const UI_STRINGS = {
    ja: {
      tabSelect: "マップ・王",
      tabFilter: "絞り込み状況",
      tabDetails: "確定パターン詳細",
      filterHeading: "絞り込み・判定状況",
      resetBtn: "リセット",
      resetAllBtn: "条件リセット",
      candidateLabel: "残り候補パターン",
      mapHeading: "マップ（地変）選択",
      lordHeading: "夜の王を選択",
      clearLordBtn: "不明(???)",
      primaryWeakness: "主弱点:",
      detailsHeading: "確定パターン詳細",
      unresolved: "未確定",
      resolved: "確定済み",
      detailsEmpty: "出現地点（鷹アイコン）と大拠点を選択してパターンが1件に確定すると、ボス・封牢・サークル・魔術師塔の詳細がここに一覧表示されます。",
      hintSelectSpawn: "出現地点（鷹アイコン）をクリックして開始",
      hintSelectMajor: "未確定の大拠点（?）をクリックして候補を選択",
      hintSelectMulti: "上部の候補番号ボタン [1] [2]... からパターンを選択",
      hintResolved: "パターン確定！全ボス・封牢・サークルを表示中",
      contextMenuTitle: "拠点候補を選択",
      sheetOpen: "パネルを開く",
      sheetClose: "最小化",
      spawnFilterPrefix: "出現地点",
      noActiveFilters: "選択中の絞り込み条件はありません",
      groupCircles: "最終円（Day 1 / Day 2 サークル）",
      groupCastleAndSpecial: "城ボス・特殊イベント・恩恵",
      groupFieldBosses: "フィールドボス一覧",
      groupEvergaols: "封牢（Evergaols）",
      groupMajorBases: "大拠点（Major Bases）",
      groupMinorBases: "魔術師塔・教会・村（Minor Bases）",
      castleBossLabel: "中央城ボス",
      rotBlessingLabel: "腐れ森の恩恵",
      towerNorthLabel: "大空洞 北塔",
      towerSouthLabel: "大空洞 南塔",
      day2CircleLabel: "大空洞 Day2 円",
      frenzyTowerLabel: "狂い火の塔位置",
      scaleMerchantLabel: "秤商人",
      ghTownMerchantLabel: "大空洞 街の商人",
      ghLegMerchantLabel: "大空洞 2日目伝説の商人",
      oldGaolLabel: "古の封牢 (30,000ルーン級)",
      groupChests: "石剣の鍵宝箱 (Chests)",
      yesText: "あり",
    },
    en: {
      tabSelect: "Map & Lord",
      tabFilter: "Filters",
      tabDetails: "Pattern Info",
      filterHeading: "Filter & Resolution Status",
      resetBtn: "Reset",
      resetAllBtn: "Reset All",
      candidateLabel: "Remaining Patterns",
      mapHeading: "Select Map (Shifting Earth)",
      lordHeading: "Select Night Lord",
      clearLordBtn: "Unselected (???)",
      primaryWeakness: "Weakness:",
      detailsHeading: "Resolved Pattern Details",
      unresolved: "Unresolved",
      resolved: "Resolved",
      detailsEmpty: "Click a spawn point (eagle icon) and narrow down major bases until 1 pattern is resolved to view all bosses, evergaols, circles, and rises here.",
      hintSelectSpawn: "Click a spawn point icon (eagle) to begin",
      hintSelectMajor: "Click an undefined major base (?) to narrow down",
      hintSelectMulti: "Select a pattern number [1] [2]... from Multiple Candidates",
      hintResolved: "Pattern resolved! Showing all bosses, evergaols & circles",
      contextMenuTitle: "Select Base Type & Element",
      sheetOpen: "Expand",
      sheetClose: "Minimize",
      spawnFilterPrefix: "Spawn",
      noActiveFilters: "No active filters selected",
      groupCircles: "Night Circles (Day 1 / Day 2)",
      groupCastleAndSpecial: "Castle Boss, Event & Blessing",
      groupFieldBosses: "Field Bosses",
      groupEvergaols: "Evergaols",
      groupMajorBases: "Major Bases",
      groupMinorBases: "Sorcerer's Rises, Churches & Townships",
      castleBossLabel: "Castle Boss",
      rotBlessingLabel: "Rot Blessing",
      towerNorthLabel: "Great Hollow North Tower",
      towerSouthLabel: "Great Hollow South Tower",
      day2CircleLabel: "Great Hollow Day 2 Circle",
      frenzyTowerLabel: "Frenzy Tower Location",
      scaleMerchantLabel: "Scale-Bearing Merchant",
      ghTownMerchantLabel: "Great Hollow Town Merchant",
      ghLegMerchantLabel: "Day 2 Legendary Merchant",
      oldGaolLabel: "Old Gaol (30k Runes Boss)",
      groupChests: "Stonesword Key Chests",
      yesText: "Yes",
    },
  };

  // High-visibility inline SVG fallback generator
  function createSvgDataUri(label, bgColor = "#1f2937", borderColor = "#f59e0b", textColor = "#ffffff") {
    const safeText = String(label || "?").slice(0, 4).replace(/[<>&"']/g, "");
    const fontSize = safeText.length > 2 ? 18 : 26;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="${bgColor}" stroke="${borderColor}" stroke-width="4"/><text x="32" y="32" dy=".35em" text-anchor="middle" fill="${textColor}" font-family="sans-serif" font-weight="bold" font-size="${fontSize}">${safeText}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Unified seed_finder_icons asset tables (SPEC.md 1.3, 1.4, 3.1.1)
  const SEED_FINDER_MAP_BG = {
    Default: "maps/elden-ring-nightreign-normal-map.webp",
    "火口": "maps/elden-ring-nightreign-crater-map.webp",
    "山嶺": "maps/elden-ring-nightreign-mountaintop-map.webp",
    "腐れ森": "maps/elden-ring-nightreign-rotted-woods-map.webp",
    "隠れ都ノクラテオ": "maps/elden-ring-nightreign-noklateo-shrouded-city-map.webp",
    "大空洞": "maps/elden-ring-nightreign-great-hollow-map.webp",
  };

  const SEED_FINDER_NIGHTLORD_ICON = {
    "三つ首の獣": "nightlordIcons/1_Gladius-tricephalos-elden-ring-nightreign-icon.webp",
    "喰らいつく顎": "nightlordIcons/2_Adel-gaping-jaw-elden-ring-nightreign-icon.webp",
    "知性の蟲": "nightlordIcons/3_Gnoster-sentient-pest-elden-ring-nightreign-icon.webp",
    "兆し": "nightlordIcons/4_Maris-augur-elden-ring-nightreign-icon.webp",
    "調律の魔物": "nightlordIcons/5_Libra-equilibrious-beast-elden-ring-nightreign-icon.webp",
    "闇駆ける狩人": "nightlordIcons/6_Fulghor-darkdrift-knight-elden-ring-nightreign-icon.webp",
    "霧の裂け目": "nightlordIcons/7_Caligo-fissure-in-the-fog-elden-ring-nightreign-icon.webp",
    "夜を象る者": "nightlordIcons/8_Heolstor-night-aspect-elden-ring-nightreign-icon.webp",
    "安寧者たち": "nightlordIcons/9_Balancers-expedition-elden-ring-nightreign-icon.webp",
    "瓦礫の王": "nightlordIcons/10_Greg-expedition-elden-ring-nightreign-icon.webp",
    unnamed: "nightlordIcons/unknown_nightlord.webp",
    unknown: "nightlordIcons/unknown_nightlord.webp",
  };

  const SEED_FINDER_PIN_ICON = {
    spawn: "buildingIcons/empty_spawn_v2.webp",
    Ruins: "buildingIcons/ruins_v2.webp",
    "Great Church": "buildingIcons/greatchurch_v2.webp",
    Fort: "buildingIcons/fort_v2.webp",
    Camp: "buildingIcons/mainencampment_v2.webp",
    "Blacksmith Village": "buildingIcons/forge_v2.webp",
    "Lakes and Marshes": "buildingIcons/marsh_poison_v2.webp",
    "Map Event": "filters/trackable_event.png",
    Church: "buildingIcons/church_v2.webp",
    "Sorcerer's Rise": "buildingIcons/sorcerers_v2.webp",
    "Difficult Sorcerer's Rise": "buildingIcons/diff_sorcerers_v2.webp",
    Township: "buildingIcons/township_v2.webp",
    redBoss: "resultOverlay/boss_great.webp",
    "field-boss": "resultOverlay/boss_field.webp",
    evergaol: "filters/evergaol.png",
    RotBlessing: "resultOverlay/rot_blessing.webp",
  };

  const SEED_FINDER_EVENT_ICON = {
    "Day 1 カリゴ襲撃": "events/caligoRaidDay1.webp",
    "Day 2 カリゴ襲撃": "events/caligoRaidDay2.webp",
    "Day 1 グラディウス襲撃": "events/gladiusRaidDay1.webp",
    "Day 2 グラディウス襲撃": "events/gladiusRaidDay2.webp",
    "Day 1 ハルモニア襲撃": "events/balancersRaidDay1.webp",
    "Day 1 忌み鬼": "events/fellomenday1.webp",
    "Day 2 忌み鬼": "events/fellomenDay2.webp",
    "Day 1 新たな夜の脅威": "events/extrabossDay1.webp",
    "Day 2 新たな夜の脅威": "events/extrabossDay2.webp",
    "Day 1 知性の霊": "events/gnosterplagueDay1.webp",
    "Day 2 知性の霊": "events/gnosterplagueDay2.webp",
    "Day 1 兆し": "events/augurraidDay1.webp",
    "Day 2 兆し": "events/augurraidDay2.webp",
    "Day 1 調律の魔物": "events/libracurseDay1.webp",
    "Day 2 調律の魔物": "events/libracurseDay2.webp",
    "Day 1 夜の勢力": "events/nighthordeDay1.webp",
    "Day 2 夜の勢力": "events/nighthordeDay2.webp",
    "Day 1 隕石": "events/meteorstrikeDay1.webp",
    "Day 2 隕石": "events/meteorstrikeDay2.webp",
    "狂い火": "events/frenzytower.webp",
    "古の魔術師塔": "events/sorcerersrise.webp",
    "歩く霊廟": "events/mausoleum.webp",
  };

  const MAJOR_TYPE_TO_SF_PREFIX = {
    Ruins: "ruins",
    "Great Church": "greatchurch",
    Fort: "fort",
    Camp: "mainencampment",
    "Blacksmith Village": "forge",
    "Lakes and Marshes": "marsh",
  };

  const ELEMENT_TO_SF_SUFFIX = {
    lightning: "eletric",
    death: "blight",
  };

  function getAssetUrl(category, filename) {
    if (!filename) return createSvgDataUri("?");
    if (category === "mapIcon" && filename === "unnamed") {
      return createSvgDataUri("?", "#1e293b", "#94a3b8");
    }
    if (category === "icon" && filename === "Small Camp") {
      return createSvgDataUri("SC", "#1e293b", "#94a3b8");
    }

    // Resolve seed_finder_icons relative path first
    let sfRelPath = null;
    if (category === "seedFinder") {
      sfRelPath = filename;
    } else if (category === "map") {
      sfRelPath = SEED_FINDER_MAP_BG[filename];
    } else if (category === "nightLord") {
      sfRelPath = SEED_FINDER_NIGHTLORD_ICON[filename];
    } else if (category === "icon") {
      sfRelPath = SEED_FINDER_PIN_ICON[filename];
    } else if (category === "event") {
      sfRelPath = SEED_FINDER_EVENT_ICON[filename] || "filters/trackable_event.png";
    }

    if (sfRelPath) {
      const inlineSf = window.__NIGHTREIGN_ASSETS__?.seedFinder?.[sfRelPath];
      if (inlineSf) return inlineSf;
      return `${ASSET_ORIGIN}/seed_finder_icons/${sfRelPath}`;
    }

    const inlineAsset = window.__NIGHTREIGN_ASSETS__?.[category]?.[filename];
    if (inlineAsset) {
      return inlineAsset;
    }
    const enc = encodeURIComponent(filename);
    if (category === "element") {
      return `${ASSET_ORIGIN}/icon/element/${enc}.png`;
    }
    if (category === "mapIcon") {
      return `${ASSET_ORIGIN}/map/icon/${enc}.webp`;
    }
    if (category === "icon") {
      return `${ASSET_ORIGIN}/icon/${enc}.png`;
    }
    return createSvgDataUri("?");
  }

  function getMajorBaseIconUrl(type, element, baseKey, specialEvent = null) {
    if (!type) return getAssetUrl("icon", "undefined");
    if (type === "Map Event") {
      if (specialEvent && SEED_FINDER_EVENT_ICON[specialEvent]) {
        return getAssetUrl("seedFinder", SEED_FINDER_EVENT_ICON[specialEvent]);
      }
      return getAssetUrl("seedFinder", "filters/trackable_event.png");
    }
    if (state.currentMap === "大空洞") {
      if (baseKey === "Point1" && (element === "fire" || element === "magic")) {
        return getAssetUrl("seedFinder", `buildingIcons/WUF_${element}_v2.webp`);
      }
      if (baseKey === "Point4" && (element === "holy" || element === "rot")) {
        return getAssetUrl("seedFinder", `buildingIcons/EUF_${element}_v2.webp`);
      }
    }
    if (type === "Ruins" && element === "rot") {
      return getAssetUrl("seedFinder", "buildingIcons/EUF_rot_v2.webp");
    }
    const prefix = MAJOR_TYPE_TO_SF_PREFIX[type];
    if (prefix) {
      const elemCode = element ? ELEMENT_TO_SF_SUFFIX[element] || element : null;
      const rel = elemCode
        ? `buildingIcons/${prefix}_${elemCode}_v2.webp`
        : `buildingIcons/${prefix}_v2.webp`;
      return getAssetUrl("seedFinder", rel);
    }
    return getAssetUrl("icon", type);
  }

  function attachImageFallback(imgEl, fallbackLabel, bgColor, borderColor) {
    imgEl.addEventListener(
      "error",
      () => {
        if (!imgEl.dataset.fallbackApplied) {
          imgEl.dataset.fallbackApplied = "true";
          imgEl.src = createSvgDataUri(fallbackLabel, bgColor, borderColor);
        }
      },
      { once: true }
    );
  }

  // Application State
  const state = {
    lang: "ja",
    currentMap: "Default",
    selectedNightLord: null,
    selectedSpawnPoint: null,
    selectedMajorBase: null, // Record<baseKey, {type, element}> | null
    selectedPatternIndex: null,
    sheetMode: "half", // "collapsed" | "half" | "expanded"

    // Master Data
    coordinatesMaster: null,
    nightLordsMaster: null,
    fieldBossesMaster: null,
    i18nMaster: null,
    mapDataCache: {},
    currentMapPatterns: [],

    // Transform State (Pan & Zoom)
    scale: 1,
    posX: 0,
    posY: 0,
    minScale: 0.25,
    maxScale: 4.0,
  };

  // DOM Elements
  const dom = {};

  function cacheDom() {
    dom.controlPanel = document.getElementById("control-panel");
    dom.sheetToggleBtn = document.getElementById("sheet-toggle-btn");
    dom.sheetExpandBtn = document.getElementById("sheet-expand-btn");
    dom.mobileStatusBadge = document.getElementById("mobile-status-badge");
    dom.mobileLordLabel = document.getElementById("mobile-lord-label");
    dom.mobileResetBtn = document.getElementById("mobile-reset-btn");

    dom.uiDlcBadge = document.getElementById("ui-dlc-badge");
    dom.uiAppTitle = document.getElementById("ui-app-title");
    dom.helpToggleBtn = document.getElementById("help-toggle-btn");
    dom.instructionsBox = document.getElementById("instructions-box");
    dom.closeInstructionsBtn = document.getElementById("close-instructions-btn");
    dom.dontShowAgainCheckbox = document.getElementById("dont-show-again-checkbox");
    dom.uiInstTitle = document.getElementById("ui-inst-title");
    dom.uiInstStep1 = document.getElementById("ui-inst-step1");
    dom.uiInstStep2 = document.getElementById("ui-inst-step2");
    dom.uiInstStep3 = document.getElementById("ui-inst-step3");
    dom.uiInstDontShow = document.getElementById("ui-inst-dont-show");

    dom.uiFilterHeading = document.getElementById("ui-filter-heading");
    dom.resetAllBtn = document.getElementById("reset-all-btn");
    dom.uiCandidateLabel = document.getElementById("ui-candidate-label");
    dom.candidateCountBadge = document.getElementById("candidate-count-badge");
    dom.uiCurrentLordLabel = document.getElementById("ui-current-lord-label");
    dom.statusNightlordValue = document.getElementById("status-nightlord-value");
    dom.statusSpecialEventRow = document.getElementById("status-special-event-row");
    dom.uiSpecialEventLabel = document.getElementById("ui-special-event-label");
    dom.statusSpecialEventValue = document.getElementById("status-special-event-value");

    dom.activeFiltersList = document.getElementById("active-filters-list");

    dom.uiMapHeading = document.getElementById("ui-map-heading");
    dom.currentMapLabel = document.getElementById("current-map-label");
    dom.mapSelectorGrid = document.getElementById("map-selector-grid");

    dom.uiLordHeading = document.getElementById("ui-lord-heading");
    dom.clearLordBtn = document.getElementById("clear-lord-btn");
    dom.lordSelectorGrid = document.getElementById("lord-selector-grid");
    dom.lordWeaknessCard = document.getElementById("lord-weakness-card");
    dom.weaknessLordName = document.getElementById("weakness-lord-name");
    dom.uiPrimaryWeaknessLabel = document.getElementById("ui-primary-weakness-label");
    dom.primaryWeaknessIcon = document.getElementById("primary-weakness-icon");
    dom.primaryWeaknessText = document.getElementById("primary-weakness-text");
    dom.weaknessBadgesRow = document.getElementById("weakness-badges-row");

    dom.uiDetailsHeading = document.getElementById("ui-details-heading");
    dom.patternIdBadge = document.getElementById("pattern-id-badge");
    dom.patternDetailsContent = document.getElementById("pattern-details-content");

    dom.mapPane = document.getElementById("map-pane");
    dom.hudLordPrefix = document.getElementById("hud-lord-prefix");
    dom.hudLordName = document.getElementById("hud-lord-name");
    dom.hudEventPill = document.getElementById("hud-event-pill");
    dom.hudEventPrefix = document.getElementById("hud-event-prefix");
    dom.hudEventName = document.getElementById("hud-event-name");
    dom.hudStepHint = document.getElementById("hud-step-hint");

    dom.hudMultiPill = document.getElementById("hud-multiple-candidates");
    dom.hudMultiLabel = document.getElementById("hud-multi-label");
    dom.hudMultiButtons = document.getElementById("hud-multi-buttons");

    dom.mapViewport = document.getElementById("map-viewport");
    dom.mapCanvas = document.getElementById("map-canvas");
    dom.mapBgImage = document.getElementById("map-bg-image");
    dom.layerMajorBases = document.getElementById("layer-major-bases");
    dom.layerMinorBases = document.getElementById("layer-minor-bases");
    dom.layerFieldBosses = document.getElementById("layer-field-bosses");
    dom.layerCirclesAndExtras = document.getElementById("layer-circles-and-extras");
    dom.layerSpawnPoints = document.getElementById("layer-spawn-points");

    dom.zoomInBtn = document.getElementById("zoom-in-btn");
    dom.zoomOutBtn = document.getElementById("zoom-out-btn");
    dom.zoomFitBtn = document.getElementById("zoom-fit-btn");

    dom.contextBackdrop = document.getElementById("major-context-backdrop");
    dom.contextMenu = document.getElementById("major-context-menu");
    dom.contextMenuTitle = document.getElementById("context-menu-title");
    dom.contextMenuClose = document.getElementById("context-menu-close");
    dom.contextMenuGrid = document.getElementById("context-menu-grid");
  }

  const ELEMENT_LABELS = {
    ja: {
      holy: "聖",
      fire: "炎",
      magic: "魔力",
      lightning: "雷",
      poison: "毒",
      rot: "腐敗",
      bleed: "出血",
      frost: "冷気",
      frostbite: "冷気",
      sleep: "睡眠",
      madness: "発狂",
      death: "死",
    },
    en: {
      holy: "Holy",
      fire: "Fire",
      magic: "Magic",
      lightning: "Lightning",
      poison: "Poison",
      rot: "Scarlet Rot",
      bleed: "Blood Loss",
      frost: "Frostbite",
      frostbite: "Frostbite",
      sleep: "Sleep",
      madness: "Madness",
      death: "Death Blight",
    },
  };

  // Translation Helper `t(key)`
  function t(key) {
    if (!key) return "";
    const normalized = String(key).replace(/&amp;/g, "&");
    const dict = state.i18nMaster?.[state.lang];
    if (dict && dict[normalized] !== undefined) {
      return String(dict[normalized]).replace(/&amp;/g, "&");
    }
    const elemLabel = ELEMENT_LABELS[state.lang]?.[normalized];
    if (elemLabel) return elemLabel;
    return normalized;
  }

  function ui(key) {
    return UI_STRINGS[state.lang]?.[key] || UI_STRINGS.ja[key] || key;
  }

  function getMapDisplayName(mapFilename) {
    return MAP_LABELS[state.lang]?.[mapFilename] || mapFilename;
  }

  // Load JSON helper
  async function fetchJson(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} loading ${url}`);
    }
    return resp.json();
  }

  async function loadMapPatterns(mapName) {
    if (state.mapDataCache[mapName]) {
      state.currentMapPatterns = state.mapDataCache[mapName];
      return;
    }
    const bundledMap = window.__NIGHTREIGN_DATA__?.maps?.[mapName];
    if (bundledMap) {
      state.mapDataCache[mapName] = bundledMap;
      state.currentMapPatterns = bundledMap;
      return;
    }
    const url = `./data/${encodeURIComponent(mapName)}.json`;
    const data = await fetchJson(url);
    state.mapDataCache[mapName] = data;
    state.currentMapPatterns = data;
  }

  function getCurrentCoordinates() {
    if (!state.coordinatesMaster) return null;
    return state.currentMap === "大空洞"
      ? state.coordinatesMaster.GreatHollowCoordinates
      : state.coordinatesMaster.DefaultCoordinates;
  }

  // ============================================================================
  // Core Filtering & Determination Logic (SPEC.md 2.2)
  // ============================================================================
  function computeFilteringState() {
    const s = state.currentMapPatterns || [];
    const u = state.selectedNightLord;
    const m = state.selectedSpawnPoint;
    const h = state.selectedMajorBase;

    const availableSpawnPoints = Array.from(
      new Set(
        s
          .filter((e) => !u || e.nightLord === u)
          .map((e) => e.spawnPoint)
      )
    );

    const filteredMapData = s
      .filter((e) => !u || e.nightLord === u)
      .filter((e) => !m || e.spawnPoint === m)
      .filter((e) => {
        if (!h) return true;
        return Object.entries(h).every(([baseKey, cond]) => {
          const base = e.majorBases?.[baseKey];
          return !!base && base.type === cond.type && base.element === cond.element;
        });
      });

    const uniqueNightLords = Array.from(new Set(filteredMapData.map((e) => e.nightLord)));

    const hasIdenticalMajorBasesAcrossFiltered =
      !(filteredMapData.length <= 1) &&
      new Set(
        filteredMapData.map((e) =>
          JSON.stringify(
            Object.entries(e.majorBases || {})
              .sort(([k1], [k2]) => k1.localeCompare(k2))
              .map(([k, v]) => [k, v?.type ?? null, v?.element ?? null])
          )
        )
      ).size === 1;

    // Auto-reset invalid selectedPatternIndex
    if (
      filteredMapData.length <= 1 ||
      !hasIdenticalMajorBasesAcrossFiltered ||
      (state.selectedPatternIndex !== null &&
        (state.selectedPatternIndex < 0 || state.selectedPatternIndex >= filteredMapData.length))
    ) {
      state.selectedPatternIndex = null;
    }

    const b = state.selectedPatternIndex;
    const effectivePattern =
      filteredMapData.length === 1
        ? filteredMapData[0]
        : hasIdenticalMajorBasesAcrossFiltered &&
          b !== null &&
          b >= 0 &&
          b < filteredMapData.length
        ? filteredMapData[b]
        : null;

    return {
      availableSpawnPoints,
      filteredMapData,
      uniqueNightLords,
      hasIdenticalMajorBasesAcrossFiltered,
      effectivePattern,
    };
  }

  // ============================================================================
  // State Transitions & Actions (SPEC.md 2.4)
  // ============================================================================
  function resetSelectionsKeepMapAndLord() {
    state.selectedSpawnPoint = null;
    state.selectedMajorBase = null;
    state.selectedPatternIndex = null;
    closeContextMenu();
  }

  function handleFullReset() {
    state.selectedNightLord = null;
    resetSelectionsKeepMapAndLord();
    renderAll();
  }

  async function handleMapChange(newMapName) {
    if (!newMapName) return;
    state.currentMap = newMapName;
    resetSelectionsKeepMapAndLord();
    dom.mapBgImage.src = getAssetUrl("map", newMapName);
    await loadMapPatterns(newMapName);
    renderAll();
  }

  function handleNightLordChange(lordNameOrNull) {
    state.selectedNightLord =
      state.selectedNightLord === lordNameOrNull ? null : lordNameOrNull;
    resetSelectionsKeepMapAndLord();
    renderAll();
  }

  function handleSpawnPointClick(spawnKey) {
    state.selectedMajorBase = null;
    state.selectedPatternIndex = null;
    state.selectedSpawnPoint = state.selectedSpawnPoint === spawnKey ? null : spawnKey;
    closeContextMenu();
    renderAll();
  }

  function handleSelectMajorCandidate(baseName, candidate) {
    state.selectedMajorBase = {
      ...(state.selectedMajorBase || {}),
      [baseName]: { type: candidate.type, element: candidate.element ?? null },
    };
    closeContextMenu();
    renderAll();
  }

  function handleRemoveMajorFilter(baseName) {
    if (!state.selectedMajorBase) return;
    const next = { ...state.selectedMajorBase };
    delete next[baseName];
    state.selectedMajorBase = Object.keys(next).length > 0 ? next : null;
    renderAll();
  }

  // ============================================================================
  // Context Menu (`el`) - Clamped inside visible `#map-pane`
  // ============================================================================
  function openMajorContextMenu(clientX, clientY, baseName, candidates) {
    dom.contextMenuTitle.textContent = `${ui("contextMenuTitle")} (${baseName})`;
    dom.contextMenuGrid.innerHTML = "";

    candidates.forEach((cand) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "candidate-option";
      btn.title = `${cand.type}${cand.element ? ` (${cand.element})` : ""}`;

      const typeImg = document.createElement("img");
      typeImg.className = "candidate-type-img";
      typeImg.src = getMajorBaseIconUrl(cand.type, cand.element, baseName);
      typeImg.alt = `${cand.type}${cand.element ? ` (${cand.element})` : ""}`;
      attachImageFallback(typeImg, cand.type.slice(0, 2), "#1e293b", "#f59e0b");
      btn.appendChild(typeImg);

      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        handleSelectMajorCandidate(baseName, cand);
      });
      dom.contextMenuGrid.appendChild(btn);
    });

    dom.contextBackdrop.classList.remove("hidden");

    // Measure and clamp strictly inside dom.mapPane so it never overflows screen edges or panels
    const paneRect = dom.mapPane.getBoundingClientRect();
    const menuRect = dom.contextMenu.getBoundingClientRect();
    const menuW = menuRect.width || 308;
    const menuH = menuRect.height || 180;

    let relX = clientX - paneRect.left + 8;
    let relY = clientY - paneRect.top + 8;

    const margin = 12;
    if (relX + menuW > paneRect.width - margin) {
      relX = Math.max(margin, paneRect.width - menuW - margin);
    }
    if (relX < margin) relX = margin;

    if (relY + menuH > paneRect.height - margin) {
      relY = Math.max(margin, paneRect.height - menuH - margin);
    }
    if (relY < margin) relY = margin;

    dom.contextMenu.style.left = `${Math.round(relX)}px`;
    dom.contextMenu.style.top = `${Math.round(relY)}px`;
  }

  function closeContextMenu() {
    dom.contextBackdrop.classList.add("hidden");
  }

  // ============================================================================
  // UI Rendering
  // ============================================================================
  function renderStaticTexts() {
    dom.uiDlcBadge.textContent = t("dlcBadge");
    dom.uiAppTitle.textContent = t("title");
    dom.uiInstTitle.textContent = t("instructionTitle");
    dom.uiInstStep1.textContent = t("instructionStep1");
    dom.uiInstStep2.textContent = t("instructionStep2");
    dom.uiInstStep3.textContent = t("instructionStep3");
    dom.uiInstDontShow.textContent = t("instructionDontShowAgain");

    dom.uiFilterHeading.textContent = ui("filterHeading");
    dom.resetAllBtn.textContent = ui("resetAllBtn");
    dom.mobileResetBtn.textContent = ui("resetBtn");
    dom.uiCandidateLabel.textContent = ui("candidateLabel");
    dom.uiCurrentLordLabel.textContent = t("nightLord");
    dom.uiSpecialEventLabel.textContent = t("specialEvent");
    dom.hudMultiLabel.textContent = t("multipleCandidates");

    dom.uiMapHeading.textContent = ui("mapHeading");
    dom.uiLordHeading.textContent = ui("lordHeading");
    dom.clearLordBtn.textContent = ui("clearLordBtn");
    dom.uiPrimaryWeaknessLabel.textContent = ui("primaryWeakness");
    dom.uiDetailsHeading.textContent = ui("detailsHeading");

    dom.hudLordPrefix.textContent = t("nightLord");
    dom.hudEventPrefix.textContent = t("specialEvent");

    updateSheetButtonText();
  }

  function renderSelectors(derived) {
    // 1. Night Lord Selector Grid ("Unselected" default + 10 Night Lords)
    const allNightLords = Object.keys(state.nightLordsMaster || {});
    dom.lordSelectorGrid.innerHTML = "";

    const inferredLord = !state.selectedNightLord
      ? derived.effectivePattern?.nightLord ||
        (derived.uniqueNightLords.length === 1 ? derived.uniqueNightLords[0] : null)
      : null;

    // "不明" (Unknown / Unselected) default option
    const unknownLabel = state.lang === "en" ? "Unselected" : "不明";
    const unknownBtn = document.createElement("button");
    unknownBtn.type = "button";
    unknownBtn.className = `selector-item ${state.selectedNightLord === null && !inferredLord ? "active" : ""}`;
    unknownBtn.dataset.lord = "";
    const unknownImg = document.createElement("img");
    unknownImg.className = "selector-thumb";
    unknownImg.src = getAssetUrl("nightLord", "unnamed");
    unknownImg.alt = unknownLabel;
    attachImageFallback(unknownImg, "?", "#1e293b", "#9ca3af");
    const unknownSpan = document.createElement("span");
    unknownSpan.className = "selector-name";
    unknownSpan.textContent = unknownLabel;
    unknownBtn.appendChild(unknownImg);
    unknownBtn.appendChild(unknownSpan);
    unknownBtn.addEventListener("click", () => handleNightLordChange(null));
    dom.lordSelectorGrid.appendChild(unknownBtn);

    allNightLords.forEach((lordKey) => {
      const isSelected = state.selectedNightLord === lordKey;
      const isInferred = inferredLord === lordKey;
      const isPossible = derived.uniqueNightLords.includes(lordKey);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `selector-item ${isSelected ? "active" : ""} ${isInferred ? "inferred" : ""}`;
      btn.dataset.lord = lordKey;
      if (!isPossible && !isSelected) {
        btn.style.opacity = "0.4";
      }

      const img = document.createElement("img");
      img.className = "selector-thumb";
      img.src = getAssetUrl("nightLord", lordKey);
      img.alt = t(lordKey);
      attachImageFallback(img, t(lordKey).slice(0, 2), "#1e293b", "#f59e0b");

      const span = document.createElement("span");
      span.className = "selector-name";
      span.textContent = t(lordKey);

      btn.appendChild(img);
      btn.appendChild(span);
      btn.addEventListener("click", () => handleNightLordChange(lordKey));
      dom.lordSelectorGrid.appendChild(btn);
    });

    // 2. Map (Shifting Earth) Selector Grid (6 maps, default: "Default")
    const mapImages = state.coordinatesMaster?.mapImages || [];
    dom.mapSelectorGrid.innerHTML = "";
    dom.currentMapLabel.textContent = getMapDisplayName(state.currentMap);

    mapImages.forEach(({ filename }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `selector-item ${state.currentMap === filename ? "active" : ""}`;
      btn.dataset.map = filename;
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", String(state.currentMap === filename));

      const img = document.createElement("img");
      img.className = "selector-thumb";
      img.src = getAssetUrl("mapIcon", filename);
      img.alt = filename;
      attachImageFallback(img, filename.slice(0, 2), "#1e293b", "#f59e0b");

      const span = document.createElement("span");
      span.className = "selector-name";
      span.textContent = getMapDisplayName(filename);

      btn.appendChild(img);
      btn.appendChild(span);
      btn.addEventListener("click", () => handleMapChange(filename));
      dom.mapSelectorGrid.appendChild(btn);
    });

    // 3. Night Lord Weakness & Resistance Card
    // Fix original bug: only show when a Night Lord is explicitly selected OR uniquely narrowed down
    const activeLord = state.selectedNightLord || inferredLord;
    if (activeLord && state.nightLordsMaster?.[activeLord]) {
      const lordInfo = state.nightLordsMaster[activeLord];
      dom.lordWeaknessCard.classList.remove("hidden");
      dom.weaknessLordName.textContent = t(activeLord);
      dom.primaryWeaknessIcon.src = getAssetUrl("element", lordInfo.weakness);
      dom.primaryWeaknessIcon.alt = lordInfo.weakness;
      dom.primaryWeaknessText.textContent = t(lordInfo.weakness);

      dom.weaknessBadgesRow.innerHTML = "";
      Object.entries(lordInfo.weaks || {})
        .filter(([, vals]) => vals.every((v) => v !== 0))
        .sort((a, b) => b[1][0] - a[1][0])
        .forEach(([elem, vals]) => {
          const badge = document.createElement("div");
          const isPositive = vals[0] > 0;
          badge.className = `weak-badge-item ${isPositive ? "is-weak" : "is-resist"}`;

          const icon = document.createElement("img");
          icon.src = getAssetUrl("element", elem);
          icon.alt = elem;
          icon.width = 18;
          icon.height = 18;

          const valText = document.createElement("span");
          valText.textContent = vals.map((v) => (v > 0 ? `+${v}%` : `${v}%`)).join("/");

          badge.appendChild(icon);
          badge.appendChild(valText);
          dom.weaknessBadgesRow.appendChild(badge);
        });
    } else {
      dom.lordWeaknessCard.classList.add("hidden");
    }
  }

  function renderStatusAndHUD(derived) {
    const total = state.currentMapPatterns.length;
    const remaining = derived.filteredMapData.length;
    const effective = derived.effectivePattern;

    const resolvedLordKey =
      state.selectedNightLord ||
      effective?.nightLord ||
      (derived.uniqueNightLords.length === 1 ? derived.uniqueNightLords[0] : null);
    const lordDisplay = resolvedLordKey ? t(resolvedLordKey) : "???";

    // Sidebar status
    dom.candidateCountBadge.textContent = effective
      ? `1 (${ui("resolved")})`
      : `${remaining} / ${total}`;
    dom.candidateCountBadge.classList.toggle("resolved", !!effective);
    dom.statusNightlordValue.textContent = lordDisplay;

    // Mobile mini header status
    dom.mobileStatusBadge.textContent = effective
      ? ui("resolved")
      : `${remaining} / ${total}`;
    dom.mobileStatusBadge.className = `badge ${effective ? "badge-emerald" : "badge-amber"}`;
    dom.mobileLordLabel.textContent = `${t("nightLord")}：${lordDisplay}`;

    // Map top HUD pills
    dom.hudLordName.textContent = lordDisplay;

    if (effective?.specialEvent) {
      const evTranslated = t(effective.specialEvent);
      dom.hudEventPill.classList.remove("hidden");
      dom.hudEventName.textContent = evTranslated;
      dom.statusSpecialEventRow.classList.remove("hidden");
      dom.statusSpecialEventValue.textContent = evTranslated;
    } else {
      dom.hudEventPill.classList.add("hidden");
      dom.statusSpecialEventRow.classList.add("hidden");
    }

    // Step hint pill
    if (effective) {
      dom.hudStepHint.textContent = ui("hintResolved");
    } else if (derived.hasIdenticalMajorBasesAcrossFiltered) {
      dom.hudStepHint.textContent = ui("hintSelectMulti");
    } else if (!state.selectedSpawnPoint) {
      dom.hudStepHint.textContent = ui("hintSelectSpawn");
    } else {
      dom.hudStepHint.textContent = ui("hintSelectMajor");
    }

    // Multiple Candidates UI (Map Top HUD)
    if (remaining > 1 && derived.hasIdenticalMajorBasesAcrossFiltered) {
      dom.hudMultiPill.classList.remove("hidden");
      dom.hudMultiButtons.innerHTML = "";
      derived.filteredMapData.forEach((_, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `candidate-idx-btn ${state.selectedPatternIndex === idx ? "active" : ""}`;
        btn.textContent = String(idx + 1);
        btn.addEventListener("click", () => {
          state.selectedPatternIndex = idx;
          renderAll();
        });
        dom.hudMultiButtons.appendChild(btn);
      });
    } else {
      dom.hudMultiPill.classList.add("hidden");
    }

    // Active filter chips
    dom.activeFiltersList.innerHTML = "";
    let hasChip = false;

    if (state.selectedNightLord) {
      hasChip = true;
      appendFilterChip(`${t("nightLord")}: ${t(state.selectedNightLord)}`, () =>
        handleNightLordChange(null)
      );
    }
    if (state.selectedSpawnPoint) {
      hasChip = true;
      appendFilterChip(`${ui("spawnFilterPrefix")}: ${state.selectedSpawnPoint}`, () =>
        handleSpawnPointClick(state.selectedSpawnPoint)
      );
    }
    if (state.selectedMajorBase) {
      Object.entries(state.selectedMajorBase).forEach(([baseKey, cond]) => {
        hasChip = true;
        const elemLabel = cond.element ? ` (${cond.element})` : "";
        appendFilterChip(`${baseKey}: ${cond.type}${elemLabel}`, () =>
          handleRemoveMajorFilter(baseKey)
        );
      });
    }

    if (!hasChip) {
      const span = document.createElement("span");
      span.className = "detail-place";
      span.textContent = ui("noActiveFilters");
      dom.activeFiltersList.appendChild(span);
    }
  }

  function appendFilterChip(text, onRemove) {
    const chip = document.createElement("div");
    chip.className = "filter-chip";
    const label = document.createElement("span");
    label.textContent = text;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-chip-remove";
    btn.textContent = "×";
    btn.addEventListener("click", onRemove);
    chip.appendChild(label);
    chip.appendChild(btn);
    dom.activeFiltersList.appendChild(chip);
  }

  // ============================================================================
  // Map Pins Rendering (SPEC.md 2.3 & 3.2)
  // ============================================================================
  function createPinContainer(x, y, sizePx, offsetPx, extraClasses = "") {
    const el = document.createElement("div");
    el.className = `map-pin pin-size-${sizePx} ${extraClasses}`.trim();
    el.style.left = `calc(${(x / 1000) * 100}% - ${offsetPx}px)`;
    el.style.top = `calc(${(y / 1000) * 100}% - ${offsetPx}px)`;
    return el;
  }

  function renderMapLayers(derived) {
    const coords = getCurrentCoordinates();
    if (!coords) return;

    const { availableSpawnPoints, filteredMapData, effectivePattern, uniqueNightLords } = derived;
    const singlePatternList = effectivePattern ? [effectivePattern] : filteredMapData;
    const isResolved = singlePatternList.length === 1;
    const pat = isResolved ? singlePatternList[0] : null;

    // 1. Spawn Points Layer (`tk`)
    dom.layerSpawnPoints.innerHTML = "";
    Object.entries(coords.spawnPoints || {}).forEach(([spawnKey, pt]) => {
      const isAvailable =
        availableSpawnPoints.includes(spawnKey) &&
        (state.selectedSpawnPoint === null || state.selectedSpawnPoint === spawnKey);
      if (!isAvailable) return;

      const isSelected = state.selectedSpawnPoint === spawnKey;
      const pin = createPinContainer(
        pt.x,
        pt.y,
        64,
        32,
        isSelected ? "ring-selected" : "ring-candidate"
      );
      pin.dataset.spawnKey = spawnKey;
      pin.title = `Spawn: ${spawnKey}`;

      const img = document.createElement("img");
      img.className = "pin-img";
      img.src = getAssetUrl("icon", "spawn");
      img.alt = "spawn";
      attachImageFallback(img, "鷹", "#1e293b", "#fde047");
      pin.appendChild(img);

      pin.addEventListener("click", (ev) => {
        ev.stopPropagation();
        handleSpawnPointClick(spawnKey);
      });
      dom.layerSpawnPoints.appendChild(pin);
    });

    // 2. Major Bases Layer (`tw`) - Only rendered when `selectedSpawnPoint !== null`
    dom.layerMajorBases.innerHTML = "";
    if (state.selectedSpawnPoint) {
      const activeLordKey =
        state.selectedNightLord ||
        effectivePattern?.nightLord ||
        (uniqueNightLords.length === 1 ? uniqueNightLords[0] : null);
      const activeLordWeakness = activeLordKey
        ? state.nightLordsMaster?.[activeLordKey]?.weakness
        : null;

      Object.entries(coords.majorBases || {}).forEach(([baseKey, pt]) => {
        // Deduplicate non-null candidates by (type, element)
        const candidates = [];
        filteredMapData.forEach((p) => {
          const mb = p.majorBases?.[baseKey];
          if (!mb) return;
          const exists = candidates.some(
            (c) => (c.type ?? null) === (mb.type ?? null) && (c.element ?? null) === (mb.element ?? null)
          );
          if (!exists) {
            candidates.push(mb);
          }
        });

        if (candidates.length === 0) return;

        const isUserSelected = !!(state.selectedMajorBase && state.selectedMajorBase[baseKey]);
        const ringClass = isUserSelected
          ? "ring-selected"
          : effectivePattern
          ? ""
          : "ring-candidate";

        const pin = createPinContainer(pt.x, pt.y, 64, 32, ringClass);
        pin.dataset.majorBase = baseKey;
        pin.dataset.candidateCount = String(candidates.length);

        if (candidates.length > 1) {
          const img = document.createElement("img");
          img.className = "pin-img";
          img.src = getAssetUrl("icon", "undefined");
          img.alt = "undefined";
          attachImageFallback(img, "?", "#374151", "#fde047");
          pin.appendChild(img);
        } else {
          const single = candidates[0];
          const img = document.createElement("img");
          img.className = "pin-img";
          img.src = getMajorBaseIconUrl(
            single.type,
            single.element,
            baseKey,
            effectivePattern?.specialEvent || null
          );
          img.alt = single.type;
          attachImageFallback(img, single.type.slice(0, 2), "#1f2937", "#f59e0b");
          pin.appendChild(img);

          if (single.element && activeLordWeakness && activeLordWeakness === single.element) {
            const elemWrap = document.createElement("div");
            elemWrap.className = "pin-element-badge weakness-match";
            const elemImg = document.createElement("img");
            elemImg.src = getAssetUrl("element", single.element);
            elemImg.alt = single.element;
            attachImageFallback(elemImg, single.element.slice(0, 2), "#065f46", "#10b981");
            elemWrap.appendChild(elemImg);
            pin.appendChild(elemWrap);
          }

          if (effectivePattern) {
            const resolvedBase = effectivePattern.majorBases?.[baseKey];
            const rawText =
              resolvedBase?.type === "Map Event"
                ? effectivePattern.specialEvent
                : resolvedBase?.text || "";
            if (rawText) {
              const label = document.createElement("div");
              label.className = "pin-label pin-label-dark";
              label.style.bottom = "-12px";
              label.textContent = t(rawText);
              pin.appendChild(label);
            }
          }
        }

        pin.addEventListener("click", (ev) => {
          ev.stopPropagation();
          if (isUserSelected) {
            handleRemoveMajorFilter(baseKey);
          } else if (candidates.length > 1) {
            openMajorContextMenu(ev.clientX, ev.clientY, baseKey, candidates);
          }
        });

        dom.layerMajorBases.appendChild(pin);
      });
    }

    // 3. Minor Bases (`ty`), Field Bosses (`tv`), Circles & Extras (`tx`) - Only when 1 pattern is resolved
    dom.layerMinorBases.innerHTML = "";
    dom.layerFieldBosses.innerHTML = "";
    dom.layerCirclesAndExtras.innerHTML = "";

    if (!isResolved || !pat) return;

    // 3A. Minor Bases (`ty`)
    Object.entries(coords.minorBases || {}).forEach(([minorKey, pt]) => {
      const mb = pat.minorBases?.[minorKey];
      if (!mb || mb.type === "Small Camp") return;

      const pin = createPinContainer(pt.x, pt.y, 64, 32);
      pin.dataset.minorBase = minorKey;

      const img = document.createElement("img");
      img.className = "pin-img";
      img.src = getAssetUrl("icon", mb.type);
      img.alt = mb.type;
      attachImageFallback(img, mb.type.slice(0, 2), "#1e293b", "#60a5fa");
      pin.appendChild(img);

      if (mb.type === "Sorcerer's Rise" && mb.text) {
        const lbl = document.createElement("div");
        lbl.className = "pin-label pin-label-dark";
        lbl.style.bottom = "12px";
        lbl.textContent = t(mb.text);
        pin.appendChild(lbl);
      } else if (mb.type === "Difficult Sorcerer's Rise" && mb.text) {
        const lbl = document.createElement("div");
        lbl.className = "pin-label pin-label-red";
        lbl.style.bottom = "-44px";
        String(mb.text)
          .replace(/&amp;/g, "&")
          .split("&")
          .forEach((part) => {
            const line = document.createElement("div");
            line.textContent = t(part.trim());
            lbl.appendChild(line);
          });
        pin.appendChild(lbl);
      }

      dom.layerMinorBases.appendChild(pin);
    });

    // 3B. Castle Boss & Field Bosses (`tv`)
    if (pat.castleBoss) {
      const castleCoord = state.coordinatesMaster?.castleBossFixedCoordinate || { x: 470, y: 510 };
      const castlePin = createPinContainer(castleCoord.x, castleCoord.y, 48, 24);
      castlePin.dataset.castleBoss = pat.castleBoss;
      const lbl = document.createElement("div");
      lbl.className = "pin-label pin-label-red";
      lbl.style.top = "12px";
      lbl.textContent = t(pat.castleBoss);
      castlePin.appendChild(lbl);
      dom.layerFieldBosses.appendChild(castlePin);
    }

    Object.entries(coords.fieldBosses || {}).forEach(([fbKey, pt]) => {
      const fb = pat.fieldBosses?.[fbKey];
      if (!fb || !fb.text || fb.text === "Putrid Ancestral Followers") return;

      const isDanger = !!state.fieldBossesMaster?.[fb.text]?.isDanger;
      const pin = createPinContainer(pt.x, pt.y, 40, 20);
      pin.dataset.fieldBoss = fbKey;

      const img = document.createElement("img");
      img.className = "pin-img";
      img.src = getAssetUrl("icon", isDanger ? "redBoss" : "field-boss");
      img.alt = fb.text;
      attachImageFallback(img, "B", isDanger ? "#7f1d1d" : "#1f2937", isDanger ? "#ef4444" : "#9ca3af");
      pin.appendChild(img);

      const lbl = document.createElement("div");
      lbl.className = "pin-label pin-label-dark";
      lbl.style.bottom = "-12px";
      lbl.textContent = t(fb.text);
      pin.appendChild(lbl);

      dom.layerFieldBosses.appendChild(pin);
    });

    // 3C. Evergaols (`tx`)
    Object.entries(coords.evergaols || {}).forEach(([egKey, pt]) => {
      const eg = pat.evergaols?.[egKey];
      if (!eg || !eg.text) return;

      const pin = createPinContainer(pt.x, pt.y, 48, 24);
      pin.dataset.evergaol = egKey;

      const img = document.createElement("img");
      img.className = "pin-img";
      img.src = getAssetUrl("icon", "evergaol");
      img.alt = "evergaol";
      attachImageFallback(img, "牢", "#1f2937", "#a78bfa");
      pin.appendChild(img);

      const lbl = document.createElement("div");
      lbl.className = "pin-label pin-label-dark";
      lbl.style.bottom = "10px";
      lbl.textContent = t(eg.text);
      pin.appendChild(lbl);

      dom.layerCirclesAndExtras.appendChild(pin);
    });

    // 3D. Night Circle 1 & 2 (`tx`)
    const renderNightCircle = (circleObj, coordMap, dayLabel) => {
      if (!circleObj || !circleObj.place || !coordMap?.[circleObj.place]) return;
      const pt = coordMap[circleObj.place];
      const pin = createPinContainer(pt.x, pt.y, 40, 20, "ring-circle-violet");
      pin.dataset.nightCircle = dayLabel;

      const lbl = document.createElement("div");
      lbl.className = "pin-label pin-label-violet";
      lbl.style.bottom = "2px";

      const dLine = document.createElement("div");
      dLine.textContent = dayLabel;
      lbl.appendChild(dLine);

      t(circleObj.text)
        .split("&")
        .forEach((lineStr) => {
          const bLine = document.createElement("div");
          bLine.textContent = lineStr;
          lbl.appendChild(bLine);
        });

      pin.appendChild(lbl);
      dom.layerCirclesAndExtras.appendChild(pin);
    };

    renderNightCircle(pat.nightCircle1, coords.nightCircle1, "day1");
    renderNightCircle(pat.nightCircle2, coords.nightCircle2, "day2");

    // 3E. Great Hollow Day 2 Circle (`tx`)
    if (
      pat.greatHollowDay2Circle &&
      coords.greatHollowDay2Circle?.[pat.greatHollowDay2Circle]
    ) {
      const pt = coords.greatHollowDay2Circle[pat.greatHollowDay2Circle];
      const pin = createPinContainer(pt.x, pt.y, 280, 140, "ring-circle-gh-day2");
      const lbl = document.createElement("div");
      lbl.className = "pin-label pin-label-cyan";
      lbl.style.top = "50%";
      lbl.style.transform = "translate(-50%, -50%)";
      lbl.textContent = "Day2 circle";
      pin.appendChild(lbl);
      dom.layerCirclesAndExtras.appendChild(pin);
    }

    // 3F. Great Hollow Tower (`tx`)
    if (coords.greatHollowTower && pat.greatHollowTower) {
      Object.entries(coords.greatHollowTower).forEach(([dirKey, pt]) => {
        const list = (pat.greatHollowTower[dirKey] || []).filter((x) => typeof x === "string");
        if (list.length === 0) return;

        const pin = createPinContainer(pt.x, pt.y, 40, 20, "ring-circle-amber");
        const lbl = document.createElement("div");
        lbl.className = "pin-label pin-label-amber";
        lbl.style.bottom = "2px";
        list.forEach((bossName) => {
          const line = document.createElement("div");
          line.textContent = t(bossName);
          lbl.appendChild(line);
        });
        pin.appendChild(lbl);
        dom.layerCirclesAndExtras.appendChild(pin);
      });
    }

    // 3G. Rot Blessing (`tx`)
    if (pat.rotBlessing && coords.rotBlessings?.[pat.rotBlessing]) {
      const pt = coords.rotBlessings[pat.rotBlessing];
      const pin = createPinContainer(pt.x, pt.y, 32, 16);
      const img = document.createElement("img");
      img.className = "pin-img";
      img.src = getAssetUrl("icon", "RotBlessing");
      img.alt = "rotBlessing";
      attachImageFallback(img, "恩", "#7f1d1d", "#fca5a5");
      pin.appendChild(img);
      dom.layerCirclesAndExtras.appendChild(pin);
    }

    // 3H. Scale-Bearing Merchant & Great Hollow Town Merchant (Master Data Extension)
    if (pat.scaleBearingMerchant?.x && pat.scaleBearingMerchant?.y) {
      const m = pat.scaleBearingMerchant;
      const mx = state.currentMap === "大空洞" ? (m.x_sf ?? m.x) : m.x;
      const my = state.currentMap === "大空洞" ? (m.y_sf ?? m.y) : m.y;
      const pin = createPinContainer(mx, my, 48, 24);
      pin.dataset.scaleMerchant = m.place;
      pin.title = `${ui("scaleMerchantLabel")}: ${m.place}`;
      const img = document.createElement("img");
      img.className = "pin-img";
      img.src = getAssetUrl("seedFinder", "buildingIcons/ScaleBearingMerchant_v2.webp");
      img.alt = ui("scaleMerchantLabel");
      img.style.objectPosition = "center";
      img.style.transform = "scale(2.2)";
      attachImageFallback(img, "商", "#78350f", "#f59e0b");
      pin.appendChild(img);
      const lbl = document.createElement("div");
      lbl.className = "pin-label pin-label-amber";
      lbl.style.bottom = "-12px";
      lbl.textContent = ui("scaleMerchantLabel");
      pin.appendChild(lbl);
      dom.layerCirclesAndExtras.appendChild(pin);
    }

    if (pat.greatHollowMerchant?.x && pat.greatHollowMerchant?.y) {
      const m = pat.greatHollowMerchant;
      const mx = m.x_sf ?? m.x;
      const my = m.y_sf ?? m.y;
      const pin = createPinContainer(mx, my, 32, 16);
      pin.dataset.ghMerchant = m.place;
      pin.title = `${ui("ghTownMerchantLabel")}: ${m.place}`;
      const img = document.createElement("img");
      img.className = "pin-img";
      img.src = getAssetUrl("seedFinder", "resultOverlay/gh_merchant.webp");
      img.alt = ui("ghTownMerchantLabel");
      attachImageFallback(img, "街商", "#064e3b", "#10b981");
      pin.appendChild(img);
      const lbl = document.createElement("div");
      lbl.className = "pin-label pin-label-cyan";
      lbl.style.bottom = "-12px";
      lbl.textContent = ui("ghTownMerchantLabel");
      pin.appendChild(lbl);
      dom.layerCirclesAndExtras.appendChild(pin);
    }
  }

  // ============================================================================
  // Resolved Pattern Details Panel Rendering
  // ============================================================================
  function renderPatternDetails(derived) {
    const pat = derived.effectivePattern;
    if (!pat) {
      dom.patternIdBadge.textContent = ui("unresolved");
      dom.patternDetailsContent.innerHTML = `<p class="empty-hint">${ui("detailsEmpty")}</p>`;
      return;
    }

    const seedLabel =
      pat.seedId ||
      (pat.no !== undefined && pat.no !== null ? String(pat.no).padStart(3, "0") : null);
    dom.patternIdBadge.textContent = seedLabel
      ? `#${seedLabel} (${ui("resolved")})`
      : ui("resolved");
    dom.patternDetailsContent.innerHTML = "";

    const appendGroup = (title, rows) => {
      if (!rows || rows.length === 0) return;
      const box = document.createElement("div");
      box.className = "detail-group";
      const h = document.createElement("div");
      h.className = "detail-group-title";
      h.textContent = title;
      box.appendChild(h);

      const list = document.createElement("div");
      list.className = "detail-item-list";
      rows.forEach(({ place, val, isDanger }) => {
        const row = document.createElement("div");
        row.className = "detail-item-row";
        const pSpan = document.createElement("span");
        pSpan.className = "detail-place";
        pSpan.textContent = place;
        const vSpan = document.createElement("span");
        vSpan.className = `detail-val ${isDanger ? "danger" : ""}`;
        vSpan.textContent = val;
        row.appendChild(pSpan);
        row.appendChild(vSpan);
        list.appendChild(row);
      });
      box.appendChild(list);
      dom.patternDetailsContent.appendChild(box);
    };

    // 1. Night Circles
    const circleRows = [];
    if (pat.nightCircle1) {
      circleRows.push({
        place: `Day 1 (${pat.nightCircle1.place})`,
        val: t(pat.nightCircle1.text),
      });
    }
    if (pat.nightCircle2) {
      const extraText = pat.nightCircle2.extra ? ` + ${t(pat.nightCircle2.extra)}` : "";
      circleRows.push({
        place: `Day 2 (${pat.nightCircle2.place})`,
        val: `${t(pat.nightCircle2.text)}${extraText}`,
      });
    }
    if (pat.greatHollowDay2Circle) {
      circleRows.push({
        place: ui("day2CircleLabel"),
        val: pat.greatHollowDay2Circle,
      });
    }
    appendGroup(ui("groupCircles"), circleRows);

    // 2. Castle Boss, Special Event, Rot Blessing, Great Hollow Towers & Merchants
    const specialRows = [];
    if (pat.castleBoss) {
      specialRows.push({ place: ui("castleBossLabel"), val: t(pat.castleBoss), isDanger: true });
    }
    if (pat.specialEvent) {
      specialRows.push({ place: t("specialEvent"), val: t(pat.specialEvent), isDanger: true });
    }
    if (pat.frenzyTower) {
      specialRows.push({ place: ui("frenzyTowerLabel"), val: pat.frenzyTower, isDanger: true });
    }
    if (pat.hasOldGaol) {
      specialRows.push({ place: ui("oldGaolLabel"), val: ui("yesText"), isDanger: true });
    }
    if (pat.rotBlessing) {
      specialRows.push({ place: ui("rotBlessingLabel"), val: pat.rotBlessing });
    }
    if (pat.scaleBearingMerchant?.place) {
      specialRows.push({
        place: ui("scaleMerchantLabel"),
        val: pat.scaleBearingMerchant.place,
      });
    }
    if (pat.greatHollowMerchant?.place) {
      specialRows.push({
        place: ui("ghTownMerchantLabel"),
        val: pat.greatHollowMerchant.place,
      });
    }
    if (pat.greatHollowLegendaryMerchant) {
      specialRows.push({
        place: ui("ghLegMerchantLabel"),
        val: ui("yesText"),
      });
    }
    if (pat.greatHollowTower?.North?.length) {
      specialRows.push({
        place: ui("towerNorthLabel"),
        val: pat.greatHollowTower.North.map((b) => t(b)).join(" / "),
      });
    }
    if (pat.greatHollowTower?.South?.length) {
      specialRows.push({
        place: ui("towerSouthLabel"),
        val: pat.greatHollowTower.South.map((b) => t(b)).join(" / "),
      });
    }
    if (pat.chests?.length) {
      specialRows.push({
        place: ui("groupChests"),
        val: `${pat.chests.length} (${pat.chests.map((c) => c.id).join(", ")})`,
      });
    }
    appendGroup(ui("groupCastleAndSpecial"), specialRows);

    // 3. Evergaols
    const egRows = Object.entries(pat.evergaols || {})
      .filter(([, v]) => v && v.text)
      .map(([k, v]) => ({ place: k, val: t(v.text) }));
    appendGroup(ui("groupEvergaols"), egRows);

    // 4. Field Bosses
    const fbRows = Object.entries(pat.fieldBosses || {})
      .filter(([, v]) => v && v.text && v.text !== "Putrid Ancestral Followers")
      .map(([k, v]) => ({
        place: k,
        val: t(v.text),
        isDanger: !!state.fieldBossesMaster?.[v.text]?.isDanger,
      }));
    appendGroup(ui("groupFieldBosses"), fbRows);

    // 5. Major Bases
    const mbRows = Object.entries(pat.majorBases || {})
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const subText = v.type === "Map Event" ? t(pat.specialEvent) : t(v.text || "");
        const elem = v.element ? ` [${v.element}]` : "";
        return {
          place: `${k} (${v.type}${elem})`,
          val: subText || v.type,
        };
      });
    appendGroup(ui("groupMajorBases"), mbRows);

    // 6. Minor Bases (excluding Small Camp)
    const minRows = Object.entries(pat.minorBases || {})
      .filter(([, v]) => v && v.type !== "Small Camp")
      .map(([k, v]) => ({
        place: `${k} (${v.type})`,
        val: v.text ? t(v.text) : v.type,
      }));
    appendGroup(ui("groupMinorBases"), minRows);
  }

  function renderAll() {
    const derived = computeFilteringState();
    renderStaticTexts();
    renderSelectors(derived);
    renderStatusAndHUD(derived);
    renderMapLayers(derived);
    renderPatternDetails(derived);
  }

  // ============================================================================
  // Pan & Zoom Engine (Mouse Wheel Cursor-Centered Zoom + Drag + Touch Pinch)
  // ============================================================================
  function applyTransform() {
    dom.mapCanvas.style.transform = `translate(${state.posX}px, ${state.posY}px) scale(${state.scale})`;
  }

  function fitMapToViewport() {
    const rect = dom.mapViewport.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Reserve top margin for the compact HUD pills so pins are never under the HUD
    const topHudMargin = 42;
    const sidePadding = 12;
    const availW = Math.max(160, rect.width - sidePadding * 2);
    const availH = Math.max(160, rect.height - topHudMargin - sidePadding);

    const fitScale = Math.min(availW / 1000, availH / 1000, 1.0);
    state.scale = Math.max(state.minScale, Math.min(state.maxScale, Number(fitScale.toFixed(4))));
    state.posX = Math.round((rect.width - 1000 * state.scale) / 2);
    state.posY = Math.round(topHudMargin + (availH - 1000 * state.scale) / 2);
    applyTransform();
  }

  function zoomAtPoint(newScale, clientX, clientY) {
    const rect = dom.mapViewport.getBoundingClientRect();
    const clampedScale = Math.max(state.minScale, Math.min(state.maxScale, newScale));
    const cursorX = clientX - rect.left;
    const cursorY = clientY - rect.top;

    // Logical map point under cursor before zoom
    const mapX = (cursorX - state.posX) / state.scale;
    const mapY = (cursorY - state.posY) / state.scale;

    state.scale = clampedScale;
    state.posX = cursorX - mapX * state.scale;
    state.posY = cursorY - mapY * state.scale;
    applyTransform();
  }

  function initPanAndZoom() {
    const vp = dom.mapViewport;

    // 1. Mouse wheel cursor-centered zoom
    vp.addEventListener(
      "wheel",
      (ev) => {
        ev.preventDefault();
        const zoomFactor = ev.deltaY < 0 ? 1.14 : 1 / 1.14;
        zoomAtPoint(state.scale * zoomFactor, ev.clientX, ev.clientY);
      },
      { passive: false }
    );

    // 2. Pointer Events for 1-finger / mouse drag pan AND 2-finger touch pinch-zoom
    const activePointers = new Map();
    let lastPanX = 0;
    let lastPanY = 0;
    let lastPinchDist = null;
    let lastPinchCenter = null;

    function getDistance(p1, p2) {
      return Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
    }

    function getMidpoint(p1, p2) {
      return {
        x: (p1.clientX + p2.clientX) / 2,
        y: (p1.clientY + p2.clientY) / 2,
      };
    }

    vp.addEventListener("pointerdown", (ev) => {
      // Do not hijack clicks on interactive pins
      if (ev.target.closest(".map-pin")) return;
      if (ev.pointerType === "mouse" && ev.button !== 0) return;

      vp.setPointerCapture(ev.pointerId);
      activePointers.set(ev.pointerId, { clientX: ev.clientX, clientY: ev.clientY });

      if (activePointers.size === 1) {
        lastPanX = ev.clientX;
        lastPanY = ev.clientY;
        vp.classList.add("is-dragging");
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        lastPinchDist = getDistance(pts[0], pts[1]);
        lastPinchCenter = getMidpoint(pts[0], pts[1]);
      }
    });

    vp.addEventListener("pointermove", (ev) => {
      if (!activePointers.has(ev.pointerId)) return;
      activePointers.set(ev.pointerId, { clientX: ev.clientX, clientY: ev.clientY });

      if (activePointers.size === 1) {
        const dx = ev.clientX - lastPanX;
        const dy = ev.clientY - lastPanY;
        lastPanX = ev.clientX;
        lastPanY = ev.clientY;
        state.posX += dx;
        state.posY += dy;
        applyTransform();
      } else if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        const newDist = getDistance(pts[0], pts[1]);
        const newCenter = getMidpoint(pts[0], pts[1]);

        if (lastPinchDist && lastPinchDist > 10) {
          const ratio = newDist / lastPinchDist;
          zoomAtPoint(state.scale * ratio, newCenter.x, newCenter.y);
        }
        if (lastPinchCenter) {
          state.posX += newCenter.x - lastPinchCenter.x;
          state.posY += newCenter.y - lastPinchCenter.y;
          applyTransform();
        }
        lastPinchDist = newDist;
        lastPinchCenter = newCenter;
      }
    });

    const handlePointerUpOrCancel = (ev) => {
      if (!activePointers.has(ev.pointerId)) return;
      activePointers.delete(ev.pointerId);
      if (activePointers.size < 2) {
        lastPinchDist = null;
        lastPinchCenter = null;
      }
      if (activePointers.size === 1) {
        const remaining = Array.from(activePointers.values())[0];
        lastPanX = remaining.clientX;
        lastPanY = remaining.clientY;
      } else if (activePointers.size === 0) {
        vp.classList.remove("is-dragging");
      }
    };

    vp.addEventListener("pointerup", handlePointerUpOrCancel);
    vp.addEventListener("pointercancel", handlePointerUpOrCancel);

    // Zoom Buttons
    dom.zoomInBtn.addEventListener("click", () => {
      const rect = vp.getBoundingClientRect();
      zoomAtPoint(state.scale * 1.25, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    dom.zoomOutBtn.addEventListener("click", () => {
      const rect = vp.getBoundingClientRect();
      zoomAtPoint(state.scale / 1.25, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    dom.zoomFitBtn.addEventListener("click", () => fitMapToViewport());
  }

  // ============================================================================
  // Mobile Bottom Sheet & Responsive Event Wiring
  // ============================================================================
  function setSheetMode(mode) {
    state.sheetMode = mode;
    dom.controlPanel.classList.remove("sheet-collapsed", "sheet-half", "sheet-expanded");
    dom.controlPanel.classList.add(`sheet-${mode}`);
    updateSheetButtonText();
    // Refit map after sheet transition so map stays completely visible in the upper area
    setTimeout(() => fitMapToViewport(), 240);
  }

  function updateSheetButtonText() {
    if (!dom.sheetExpandBtn) return;
    const isCollapsed = state.sheetMode === "collapsed";
    dom.sheetExpandBtn.textContent = isCollapsed ? ui("sheetOpen") : ui("sheetClose");
    dom.sheetExpandBtn.setAttribute("aria-expanded", String(!isCollapsed));
  }

  function initUIEvents() {
    // Language Switcher
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        if (!lang || lang === state.lang) return;
        state.lang = lang;
        document.documentElement.lang = lang;
        document.querySelectorAll(".lang-btn").forEach((b) =>
          b.classList.toggle("active", b.dataset.lang === lang)
        );
        renderAll();
      });
    });

    // Instructions Toggle & localStorage persistence (safe on Android content:// and file://)
    const safeGetHideInst = () => {
      try {
        return localStorage.getItem(HIDE_INSTRUCTIONS_KEY) === "true";
      } catch {
        return false;
      }
    };
    const safeSetHideInst = (val) => {
      try {
        if (val) localStorage.setItem(HIDE_INSTRUCTIONS_KEY, "true");
        else localStorage.removeItem(HIDE_INSTRUCTIONS_KEY);
      } catch {
        // Ignore SecurityError on Android content:// or restricted file:// origins
      }
    };

    const hideInst = safeGetHideInst();
    dom.dontShowAgainCheckbox.checked = hideInst;
    dom.helpToggleBtn.addEventListener("click", () => {
      dom.instructionsBox.classList.toggle("hidden");
    });
    dom.closeInstructionsBtn.addEventListener("click", () => {
      if (dom.dontShowAgainCheckbox.checked) {
        safeSetHideInst(true);
      }
      dom.instructionsBox.classList.add("hidden");
    });
    dom.dontShowAgainCheckbox.addEventListener("change", () => {
      safeSetHideInst(dom.dontShowAgainCheckbox.checked);
    });

    // Reset & Clear Lord
    dom.resetAllBtn.addEventListener("click", handleFullReset);
    dom.mobileResetBtn.addEventListener("click", handleFullReset);
    dom.clearLordBtn.addEventListener("click", () => handleNightLordChange(null));

    // Context menu close
    dom.contextBackdrop.addEventListener("click", closeContextMenu);
    dom.contextMenuClose.addEventListener("click", closeContextMenu);
    dom.contextMenu.addEventListener("click", (ev) => ev.stopPropagation());

    // Mobile Bottom Sheet Controls
    dom.sheetToggleBtn.addEventListener("click", () => {
      const next =
        state.sheetMode === "collapsed"
          ? "half"
          : state.sheetMode === "half"
          ? "expanded"
          : "collapsed";
      setSheetMode(next);
    });

    dom.sheetExpandBtn.addEventListener("click", () => {
      setSheetMode(state.sheetMode === "collapsed" ? "half" : "collapsed");
    });

    // Window Resize -> Re-fit Map & Close Context Menu
    window.addEventListener("resize", () => {
      closeContextMenu();
      fitMapToViewport();
    });
  }

  // ============================================================================
  // Bootstrap
  // ============================================================================
  async function init() {
    cacheDom();
    initUIEvents();
    initPanAndZoom();

    attachImageFallback(dom.mapBgImage, "MAP", "#0f172a", "#374151");
    dom.mapBgImage.src = getAssetUrl("map", state.currentMap);

    const bundled = window.__NIGHTREIGN_DATA__;
    const [coordinates, nightLords, fieldBosses, i18n] = bundled
      ? [bundled.coordinates, bundled.nightLords, bundled.fieldBosses, bundled.i18n]
      : await Promise.all([
          fetchJson("./data/coordinates.json"),
          fetchJson("./data/nightLords.json"),
          fetchJson("./data/fieldBosses.json"),
          fetchJson("./data/i18n.json"),
        ]);

    state.coordinatesMaster = coordinates;
    state.nightLordsMaster = nightLords;
    state.fieldBossesMaster = fieldBosses;
    state.i18nMaster = i18n;

    await loadMapPatterns("Default");
    renderAll();
    requestAnimationFrame(() => fitMapToViewport());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
