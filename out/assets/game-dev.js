"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/engine/quality.ts
  function quality() {
    return PRESETS[level];
  }
  function qualityLevel() {
    return level;
  }
  function setQuality(l) {
    if (l === level) return;
    level = l;
    for (const f of listeners) f();
  }
  function onQualityChange(f) {
    listeners.push(f);
  }
  function defaultQuality() {
    const mem = navigator.deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    if (mem <= 2 || cores <= 2) return "low";
    if (mem >= 6 && cores >= 6 && !/Android|iPhone|iPad/i.test(navigator.userAgent)) return "high";
    return "medium";
  }
  var PRESETS, level, listeners;
  var init_quality = __esm({
    "src/engine/quality.ts"() {
      "use strict";
      PRESETS = {
        low: { dprCap: 1, particles: 140, streamFx: false, bgScale: 1, fpsCap: 30, shake: true, glow: false },
        medium: { dprCap: 1.75, particles: 320, streamFx: true, bgScale: 1.5, fpsCap: 60, shake: true, glow: true },
        high: { dprCap: 2.5, particles: 600, streamFx: true, bgScale: 2, fpsCap: 60, shake: true, glow: true }
      };
      level = "medium";
      listeners = [];
    }
  });

  // src/meta/save.ts
  function newSave() {
    return {
      v: SAVE_VERSION,
      installId: Math.random().toString(36).slice(2) + Date.now().toString(36),
      createdAt: Date.now(),
      coins: 0,
      coinsEarned: 0,
      upgrades: { power: 0, range: 0, health: 0, pressure: 0, splash: 0 },
      rescued: {},
      seen: [],
      cleared: {},
      attempts: {},
      decor: [],
      giftsAt: Date.now(),
      streak: { day: 0, lastDate: "", claimedToday: false, consecutive: 0 },
      missions: { date: "", ids: [], progress: [], claimed: [], allClaimed: false },
      daily: { date: "", cleared: false, streak: 0, lastClearDate: "" },
      stats: { runs: 0, wins: 0, washed: 0, rooms: 0, playSeconds: 0, sessions: 0, lastSession: 0 },
      flags: {},
      settings: { music: 0.7, sfx: 0.9, vibration: true, lang: "auto", quality: "auto", contrast: false },
      dayOffset: 0,
      lastStage: 1
    };
  }
  function save() {
    return data;
  }
  function loadSave() {
    let fresh = true;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        data = migrate(parsed);
        fresh = false;
      }
    } catch {
      data = newSave();
    }
    return { data, fresh };
  }
  function migrate(p) {
    const base = newSave();
    const out = { ...base, ...p };
    out.upgrades = { ...base.upgrades, ...p.upgrades || {} };
    out.settings = { ...base.settings, ...p.settings || {} };
    out.stats = { ...base.stats, ...p.stats || {} };
    out.streak = { ...base.streak, ...p.streak || {} };
    out.daily = { ...base.daily, ...p.daily || {} };
    out.missions = { ...base.missions, ...p.missions || {} };
    out.flags = { ...p.flags || {} };
    out.v = SAVE_VERSION;
    return out;
  }
  function markDirty() {
    dirty = true;
    if (!timer) timer = window.setTimeout(flush, 400);
  }
  function flush() {
    timer = 0;
    if (!dirty) return;
    dirty = false;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
    }
    for (const f of listeners4) f(data);
  }
  function resetSave() {
    const keepSettings = data.settings;
    data = newSave();
    data.settings = keepSettings;
    dirty = true;
    flush();
  }
  function replaceSave(d) {
    data = migrate(d);
    dirty = true;
    flush();
  }
  function today(offsetDays = data.dayOffset) {
    const d = new Date(Date.now() + offsetDays * 864e5);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function nowMs() {
    return Date.now() + data.dayOffset * 864e5;
  }
  function daysBetween(a, b) {
    if (!a || !b) return 999;
    const pa = a.split("-").map(Number), pb = b.split("-").map(Number);
    const da = Date.UTC(pa[0], pa[1] - 1, pa[2]), db = Date.UTC(pb[0], pb[1] - 1, pb[2]);
    return Math.round((db - da) / 864e5);
  }
  var KEY, SAVE_VERSION, data, dirty, timer, listeners4;
  var init_save = __esm({
    "src/meta/save.ts"() {
      "use strict";
      KEY = "splash-rescue-save";
      SAVE_VERSION = 1;
      data = newSave();
      dirty = false;
      timer = 0;
      listeners4 = [];
    }
  });

  // src/services/analytics.ts
  function initAnalytics(installId, session, build) {
    ctx.installId = installId;
    ctx.session = session;
    ctx.build = build;
  }
  function track(name, params = {}) {
    ctx.t = Date.now();
    for (const p of providers) {
      try {
        p.track(name, params, ctx);
      } catch {
      }
    }
  }
  var DebugBuffer, RemotePlaceholder, debugBuffer, remote, providers, ctx;
  var init_analytics = __esm({
    "src/services/analytics.ts"() {
      "use strict";
      DebugBuffer = class {
        constructor() {
          this.name = "debug";
          this.events = [];
        }
        track(name, params, ctx2) {
          this.events.push({ name, params, t: ctx2.t });
          if (this.events.length > 300) this.events.shift();
          if (true) console.debug("[analytics]", name, params);
        }
      };
      RemotePlaceholder = class {
        constructor() {
          this.name = "remote";
          this.queue = [];
        }
        track(name, params, ctx2) {
          this.queue.push({ name, params, ctx: ctx2 });
          if (this.queue.length > 500) this.queue.shift();
        }
      };
      debugBuffer = new DebugBuffer();
      remote = new RemotePlaceholder();
      providers = [debugBuffer, remote];
      ctx = { installId: "", session: 0, t: 0, build: "1.0.0" };
    }
  });

  // src/config/balance.ts
  function xpToNext(level2) {
    const n = level2 - 1;
    return Math.round(6 + 6 * n + 1.4 * n * n);
  }
  function stageScale(stage) {
    const s = Math.max(1, stage) - 1;
    const hp = 0.62 * (1 + 0.3 * s + 0.024 * s * s);
    const dmg = 0.6 + 0.22 * s + 28e-4 * s * s;
    const coin = 1 + 0.06 * s;
    const speed = 1 + 9e-3 * s;
    const tempo = 1 + 0.022 * s;
    const bullet = 1 + 0.012 * s;
    return { hp, dmg, coin, speed, tempo, bullet };
  }
  function niceRound(v) {
    if (v < 100) return Math.round(v / 5) * 5;
    if (v < 1e3) return Math.round(v / 10) * 10;
    if (v < 1e4) return Math.round(v / 50) * 50;
    return Math.round(v / 100) * 100;
  }
  function upgradeCost(def, level2) {
    return niceRound(def.base * Math.pow(def.growth, level2));
  }
  function gunTierFor(totalLevels) {
    let t2 = 0;
    for (let i = 0; i < GUN_TIERS.length; i++) if (totalLevels >= GUN_TIERS[i].at) t2 = i;
    return t2;
  }
  function skillWeight(def, stacks, hpRatio) {
    if (def.id === "heal") return hpRatio < 0.8 ? 9 + (1 - hpRatio) * 12 : 0;
    if (stacks >= def.max) return 0;
    return def.weight;
  }
  function bondLevel(count) {
    let lv = 0;
    for (let i = 0; i < BOND_THRESHOLDS.length; i++) if (count >= BOND_THRESHOLDS[i]) lv = i + 1;
    return lv;
  }
  function assistLevel(failsInRow) {
    if (failsInRow < ASSIST.failsBeforeHelp) return 0;
    return Math.min(ASSIST.maxLevel, failsInRow - ASSIST.failsBeforeHelp + 1);
  }
  var ROOM, PLAYER, RESCUE, MONSTERS, MONSTER_RULES, STAGE_COUNT, REWARDS, UPGRADES, GUN_TIERS, SKILLS, SKILL_VALUES, SPECIES, BOND_THRESHOLDS, GIFTS, DECOR, FESTIVAL, UNLOCKS, STREAK_REWARDS, STREAK_AFTER_WEEK, MISSIONS, MISSIONS_PER_DAY, MISSION_ALL_BONUS, DAILY, ASSIST;
  var init_balance = __esm({
    "src/config/balance.ts"() {
      "use strict";
      ROOM = {
        width: 576,
        height: 960,
        tile: 48,
        wall: 48,
        // border thickness that frames the play area
        gateWidth: 110
      };
      PLAYER = {
        maxHp: 100,
        radius: 20,
        moveSpeed: 255,
        accel: 2600,
        gooSlow: 0.62,
        // speed multiplier while standing on goo
        invuln: 0.9,
        dps: 34,
        range: 235,
        streamWidth: 12,
        streamSpeed: 2600,
        // how fast a fresh stream reaches its target
        fireDelay: 0.05,
        // seconds after stopping before water comes out
        aimTurnRate: 16,
        pressureCharge: 1.1,
        // seconds standing still to reach full pressure
        pressureMax: 1.8,
        // damage multiplier at full pressure
        pressureWidth: 0.6,
        // extra width fraction at full pressure
        pressureDrainMove: 5,
        // per second while moving
        pressureKeepOnHit: 0.25,
        pickupRadius: 64,
        streamClean: 0.75,
        // goo cleaned along the stream = width * this
        impactClean: 24,
        burstClean: 66,
        burstDamage: 0.25,
        // fraction of dps dealt instantly around a washed monster
        burstRadius: 70,
        reviveHp: 0.6,
        revivesPerRun: 1
      };
      RESCUE = {
        cheerDamagePerAnimal: 0.06,
        cheerMaxAnimals: 6,
        healOnRescue: 0.1,
        // of max hp
        braveRescueCoins: 8,
        // rescued while monsters are still around
        rescueCoins: 10,
        rescueXp: 3,
        cocoonHp: 55,
        cocoonRadius: 30
      };
      MONSTERS = {
        blob: { r: 26, hp: 40, speed: 74, contact: 12, xp: 2, coins: 2 },
        spitter: { r: 26, hp: 52, speed: 34, contact: 10, xp: 3, coins: 3, cooldown: 2.6, telegraph: 0.65, bulletSpeed: 200, bulletDmg: 13, bulletR: 13 },
        splitter: { r: 31, hp: 58, speed: 60, contact: 12, xp: 3, coins: 3 },
        mini: { r: 17, hp: 18, speed: 108, contact: 8, xp: 1, coins: 1 },
        dasher: { r: 26, hp: 55, speed: 60, contact: 16, xp: 3, coins: 3, cooldown: 1.5, telegraph: 0.8 },
        chunky: { r: 44, hp: 210, speed: 42, contact: 18, xp: 8, coins: 8, cooldown: 3.6, telegraph: 0.85, bulletSpeed: 190, bulletDmg: 14, bulletR: 14 },
        nest: { r: 40, hp: 240, speed: 0, contact: 10, xp: 8, coins: 8, cooldown: 4.2, telegraph: 0.7 },
        jumper: { r: 28, hp: 70, speed: 50, contact: 14, xp: 4, coins: 4, cooldown: 2.9, telegraph: 0.75, bulletDmg: 18 },
        flyer: { r: 22, hp: 44, speed: 95, contact: 11, xp: 3, coins: 3, cooldown: 3.2, telegraph: 0.5, bulletSpeed: 170, bulletDmg: 11, bulletR: 12 },
        boss: { r: 78, hp: 1250, speed: 55, contact: 18, xp: 30, coins: 60, cooldown: 2.2, telegraph: 0.9, bulletSpeed: 200, bulletDmg: 15, bulletR: 15 }
      };
      MONSTER_RULES = {
        spawnRise: 0.6,
        // seconds rising from the ground, harmless
        roomStartDelay: 0.9,
        // grace time when entering a room
        waveDelay: 1.1,
        dashSpeed: 560,
        dashTime: 0.5,
        jumpTime: 0.7,
        jumpShock: 64,
        nestMaxChildren: 3,
        chunkyRing: 8,
        hopMove: 0.46,
        hopRest: 0.32,
        minScale: 0.55
        // monsters shrink to this as they get washed
      };
      STAGE_COUNT = 30;
      REWARDS = {
        roomClearCoins: 6,
        // times coin scale
        stageFirstClear: (stage) => 50 + 12 * stage,
        stageReplayClear: (stage) => 15 + 4 * stage,
        starCoins: 30,
        coinDropSpread: 0.25,
        healDropChance: 0.06,
        // chance a washed monster drops a heart-shaped water drop
        healDropAmount: 0.12
      };
      UPGRADES = [
        { id: "power", max: 40, base: 45, growth: 1.25, per: 0.12 },
        { id: "range", max: 15, base: 50, growth: 1.28, per: 0.04 },
        { id: "health", max: 30, base: 45, growth: 1.25, per: 0.1 },
        { id: "pressure", max: 15, base: 70, growth: 1.32, per: 0.05 },
        { id: "splash", max: 20, base: 60, growth: 1.3, per: 0.1 }
      ];
      GUN_TIERS = [
        { at: 0, dmg: 1, width: 1, splash: 1, range: 0 },
        { at: 3, dmg: 1.12, width: 1.32, splash: 1.15, range: 8 },
        { at: 8, dmg: 1.25, width: 1.62, splash: 1.3, range: 16 },
        { at: 15, dmg: 1.42, width: 1.95, splash: 1.5, range: 24 },
        { at: 25, dmg: 1.62, width: 2.35, splash: 1.72, range: 32 },
        { at: 38, dmg: 1.85, width: 2.8, splash: 1.95, range: 40 },
        { at: 55, dmg: 2.15, width: 3.5, splash: 2.3, range: 50 }
      ];
      SKILLS = [
        { id: "thick", max: 5, weight: 10 },
        { id: "range", max: 3, weight: 7 },
        { id: "multi", max: 2, weight: 7 },
        { id: "pierce", max: 2, weight: 6 },
        { id: "chain", max: 2, weight: 6 },
        { id: "splash", max: 3, weight: 7 },
        { id: "turbo", max: 3, weight: 7 },
        { id: "keep", max: 2, weight: 5 },
        { id: "speed", max: 3, weight: 6 },
        { id: "shield", max: 3, weight: 6 },
        { id: "trail", max: 3, weight: 5 },
        { id: "magnet", max: 2, weight: 4 },
        { id: "vitality", max: 4, weight: 6 },
        { id: "heal", max: 99, weight: 0 }
        // offered when hurt, see skillWeight
      ];
      SKILL_VALUES = {
        thickDmg: 0.22,
        thickWidth: 0.15,
        rangeAdd: 0.15,
        multiDmg: 0.55,
        pierceDmg: 0.7,
        chainDmg: 0.5,
        chainRange: 150,
        splashDmg: 0.6,
        splashRadius: 0.25,
        turboCharge: 0.45,
        turboMax: 0.2,
        keepDrain: 0.55,
        speedAdd: 0.12,
        speedGoo: 0.12,
        shieldRegen: [9, 7, 5.5],
        trailEvery: 0.28,
        trailDmg: 0.35,
        trailRadius: 34,
        magnetRadius: 0.8,
        magnetXp: 0.15,
        vitalityHp: 0.2,
        vitalityHeal: 0.2,
        heal: 0.4
      };
      SPECIES = [
        { id: "puppy", bonus: "maxHp", per: 0.05, region: "forest" },
        { id: "bunny", bonus: "move", per: 0.03, region: "forest" },
        { id: "squirrel", bonus: "coins", per: 0.06, region: "forest" },
        { id: "fox", bonus: "damage", per: 0.04, region: "forest" },
        { id: "hedgehog", bonus: "armor", per: 0.03, region: "forest" },
        { id: "fawn", bonus: "range", per: 0.03, region: "forest" },
        { id: "kitten", bonus: "charge", per: 0.05, region: "village" },
        { id: "duckling", bonus: "xp", per: 0.06, region: "village" },
        { id: "piglet", bonus: "gifts", per: 0.1, region: "village" },
        { id: "lamb", bonus: "rescueHeal", per: 0.15, region: "village" },
        { id: "chick", bonus: "splash", per: 0.05, region: "village" },
        { id: "otter", bonus: "pickup", per: 0.08, region: "lake" },
        { id: "turtle", bonus: "revive", per: 0.08, region: "lake" },
        { id: "frog", bonus: "gooWalk", per: 0.05, region: "lake" },
        { id: "penguin", bonus: "pressureMax", per: 0.03, region: "special" },
        { id: "panda", bonus: "all", per: 0.02, region: "special" }
      ];
      BOND_THRESHOLDS = [1, 3, 6, 10, 15];
      GIFTS = {
        perSpeciesPerHour: 6,
        bondBonus: 0.15,
        // per bond level above 1
        capHours: 8,
        minCollect: 1
      };
      DECOR = [
        { id: "ball", cost: 150, giftBonus: 0.1 },
        { id: "cushion", cost: 300, giftBonus: 0.1 },
        { id: "bowl", cost: 500, giftBonus: 0.1 },
        { id: "flowers", cost: 800, giftBonus: 0.1 },
        { id: "pond", cost: 1200, giftBonus: 0.1 },
        { id: "treehouse", cost: 1800, giftBonus: 0.1 },
        { id: "slide", cost: 2600, giftBonus: 0.1 },
        { id: "fountain", cost: 3600, giftBonus: 0.1 }
      ];
      FESTIVAL = { days: [6, 0], coinMul: 1.5, unlockStage: 3 };
      UNLOCKS = {
        upgrades: 0,
        // after the first run ends
        shelter: 0,
        // after the first run that rescued an animal
        missions: 2,
        // stage number that must be cleared
        daily: 3,
        decor: 5
        // species count
      };
      STREAK_REWARDS = [
        { coins: 100 },
        { species: "penguin" },
        { coins: 200 },
        { coins: 300 },
        { species: "panda" },
        { coins: 400 },
        { coins: 600 }
      ];
      STREAK_AFTER_WEEK = 250;
      MISSIONS = [
        { id: "wash", target: 40, coins: 80 },
        { id: "rescue", target: 3, coins: 90 },
        { id: "rooms", target: 8, coins: 80 },
        { id: "pressure", target: 15, coins: 70 },
        { id: "clear", target: 2, coins: 100 },
        { id: "gifts", target: 1, coins: 60 },
        { id: "nohit", target: 3, coins: 90 }
      ];
      MISSIONS_PER_DAY = 3;
      MISSION_ALL_BONUS = 150;
      DAILY = {
        rooms: 4,
        firstClearCoins: 400,
        replayCoins: 60,
        // stage difficulty used for the daily: highest cleared stage, at least this
        minStage: 3
      };
      ASSIST = {
        // after this many failed attempts in a row on a stage, friends come to cheer:
        // the boost grows with each further fail, up to maxLevel
        failsBeforeHelp: 2,
        helpHp: 0.3,
        // per level
        helpDamage: 0.2,
        // per level
        maxLevel: 3
      };
    }
  });

  // src/sim/rng.ts
  function hashString(s) {
    let h2 = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h2 ^= s.charCodeAt(i);
      h2 = Math.imul(h2, 16777619);
    }
    return h2 >>> 0;
  }
  var Rng;
  var init_rng = __esm({
    "src/sim/rng.ts"() {
      "use strict";
      Rng = class {
        constructor(seed) {
          this.s = seed >>> 0 || 1;
        }
        next() {
          let t2 = this.s += 1831565813;
          t2 = Math.imul(t2 ^ t2 >>> 15, t2 | 1);
          t2 ^= t2 + Math.imul(t2 ^ t2 >>> 7, t2 | 61);
          return ((t2 ^ t2 >>> 14) >>> 0) / 4294967296;
        }
        range(a, b) {
          return a + (b - a) * this.next();
        }
        int(a, b) {
          return Math.floor(this.range(a, b + 1));
        }
        pick(arr) {
          return arr[Math.floor(this.next() * arr.length)];
        }
        chance(p) {
          return this.next() < p;
        }
      };
    }
  });

  // src/sim/stats.ts
  function upgradeTotal(up) {
    let t2 = 0;
    for (const d of UPGRADES) t2 += up[d.id] || 0;
    return t2;
  }
  function bondBonus(meta, kind) {
    let v = 0;
    for (const s of SPECIES) {
      const lv = meta.bonds[s.id] || 0;
      if (!lv) continue;
      if (s.bonus === kind) v += s.per * lv;
      if (s.bonus === "all" && (kind === "damage" || kind === "maxHp" || kind === "coins")) v += s.per * lv;
    }
    return v;
  }
  function per(id) {
    return UPGRADES.find((u) => u.id === id).per;
  }
  function computeStats(meta, skills, cheer) {
    const up = meta.upgrades;
    const tier = gunTierFor(upgradeTotal(up));
    const T4 = GUN_TIERS[tier];
    const sk = (id) => skills[id] || 0;
    const dmgMul = (1 + per("power") * (up.power || 0)) * T4.dmg * (1 + bondBonus(meta, "damage")) * (1 + SKILL_VALUES.thickDmg * sk("thick")) * (1 + ASSIST.helpDamage * (meta.assist || 0));
    const cheerMul = 1 + RESCUE.cheerDamagePerAnimal * Math.min(cheer, RESCUE.cheerMaxAnimals);
    const hpMul = (1 + per("health") * (up.health || 0)) * (1 + bondBonus(meta, "maxHp")) * (1 + SKILL_VALUES.vitalityHp * sk("vitality")) * (1 + ASSIST.helpHp * (meta.assist || 0));
    const rangeMul = (1 + per("range") * (up.range || 0)) * (1 + bondBonus(meta, "range")) * (1 + SKILL_VALUES.rangeAdd * sk("range"));
    const splashMul = (1 + per("splash") * (up.splash || 0)) * T4.splash * (1 + bondBonus(meta, "splash"));
    const shield = sk("shield");
    return {
      maxHp: Math.round(PLAYER.maxHp * hpMul),
      moveSpeed: PLAYER.moveSpeed * (1 + bondBonus(meta, "move")) * (1 + SKILL_VALUES.speedAdd * sk("speed")),
      gooSlow: Math.min(0.95, PLAYER.gooSlow + SKILL_VALUES.speedGoo * sk("speed") + bondBonus(meta, "gooWalk")),
      dps: PLAYER.dps * dmgMul * cheerMul,
      range: (PLAYER.range + T4.range) * rangeMul,
      width: PLAYER.streamWidth * T4.width * (1 + 0.05 * (up.power || 0)) * (1 + SKILL_VALUES.thickWidth * sk("thick")),
      pressureCharge: PLAYER.pressureCharge / ((1 + per("pressure") * (up.pressure || 0)) * (1 + bondBonus(meta, "charge")) * (1 + SKILL_VALUES.turboCharge * sk("turbo"))),
      pressureMax: (PLAYER.pressureMax + per("pressure") * (up.pressure || 0) + SKILL_VALUES.turboMax * sk("turbo")) * (1 + bondBonus(meta, "pressureMax")),
      pressureDrain: PLAYER.pressureDrainMove * Math.pow(1 - SKILL_VALUES.keepDrain, sk("keep")),
      invuln: PLAYER.invuln,
      pickupRadius: PLAYER.pickupRadius * (1 + bondBonus(meta, "pickup")) * (1 + SKILL_VALUES.magnetRadius * sk("magnet")),
      burstRadius: PLAYER.burstRadius * Math.sqrt(splashMul) * (1 + SKILL_VALUES.splashRadius * sk("splash")),
      burstDmg: PLAYER.burstDamage * splashMul * (1 + SKILL_VALUES.splashDmg * sk("splash")),
      burstClean: PLAYER.burstClean * Math.sqrt(splashMul) * (1 + SKILL_VALUES.splashRadius * sk("splash")),
      armor: Math.max(0.5, 1 - bondBonus(meta, "armor")),
      xpMult: (1 + bondBonus(meta, "xp")) * (1 + SKILL_VALUES.magnetXp * sk("magnet")),
      coinMult: 1 + bondBonus(meta, "coins"),
      multi: sk("multi"),
      pierce: sk("pierce"),
      chain: sk("chain"),
      shieldRegen: shield ? SKILL_VALUES.shieldRegen[Math.min(shield, 3) - 1] : 0,
      trail: sk("trail"),
      rescueHeal: RESCUE.healOnRescue * (1 + bondBonus(meta, "rescueHeal")),
      reviveHp: Math.min(1, PLAYER.reviveHp + bondBonus(meta, "revive")),
      gunTier: tier,
      cheerPer: RESCUE.cheerDamagePerAnimal
    };
  }
  var init_stats = __esm({
    "src/sim/stats.ts"() {
      "use strict";
      init_balance();
    }
  });

  // src/meta/progress.ts
  function bonds() {
    const out = {};
    for (const s of SPECIES) {
      const lv = bondLevel(save().rescued[s.id] || 0);
      if (lv) out[s.id] = lv;
    }
    return out;
  }
  function metaPower(assist = 0) {
    return { upgrades: { ...save().upgrades }, bonds: bonds(), assist };
  }
  function knownSpecies() {
    return SPECIES.filter((s) => (save().rescued[s.id] || 0) > 0).map((s) => s.id);
  }
  function gunTier() {
    return gunTierFor(upgradeTotal(save().upgrades));
  }
  function isCleared(stage) {
    return !!save().cleared[`s${stage}`];
  }
  function highestCleared() {
    let h2 = 0;
    for (let s = 1; s <= STAGE_COUNT; s++) if (isCleared(s)) h2 = s;
    return h2;
  }
  function stageUnlocked(stage) {
    return stage === 1 || isCleared(stage - 1) || isCleared(stage);
  }
  function nextStage() {
    return Math.min(STAGE_COUNT, highestCleared() + 1);
  }
  function assistFor(stage) {
    const a = save().attempts[`s${stage}`];
    if (!a || isCleared(stage)) return 0;
    return assistLevel(a.failsInRow);
  }
  function featureOpen(f) {
    const s = save();
    switch (f) {
      case "upgrades":
        return s.stats.runs >= 1;
      case "shelter":
        return knownSpecies().length > 0 && s.stats.runs >= 1;
      case "missions":
        return highestCleared() >= UNLOCKS.missions;
      case "daily":
        return highestCleared() >= UNLOCKS.daily;
      case "decor":
        return knownSpecies().length >= UNLOCKS.decor;
    }
  }
  function pendingUnlocks() {
    const s = save();
    const out = [];
    for (const f of ["upgrades", "shelter", "missions", "daily", "decor"]) {
      if (featureOpen(f) && !s.flags[`unlock_${f}`]) out.push(f);
    }
    return out;
  }
  function markAnnounced(f) {
    save().flags[`unlock_${f}`] = true;
    markDirty();
    track("feature_unlock", { feature: f });
  }
  function earn(amount, source) {
    if (amount <= 0) return;
    const s = save();
    s.coins += amount;
    s.coinsEarned += amount;
    markDirty();
    track("currency_earn", { source, amount, balance: s.coins });
  }
  function spend(amount, sink, item) {
    const s = save();
    if (s.coins < amount) return false;
    s.coins -= amount;
    markDirty();
    track("currency_spend", { sink, item, amount, balance: s.coins });
    return true;
  }
  function upgradeInfo(id) {
    const def = UPGRADES.find((u) => u.id === id);
    const lv = save().upgrades[id] || 0;
    return { def, lv, maxed: lv >= def.max, cost: lv >= def.max ? 0 : upgradeCost(def, lv) };
  }
  function buyUpgrade(id) {
    const info = upgradeInfo(id);
    const tierBefore = gunTier();
    if (info.maxed || !spend(info.cost, "upgrade", id)) return { ok: false, tierBefore, tierAfter: tierBefore };
    save().upgrades[id] = info.lv + 1;
    markDirty();
    track("upgrade_buy", { id, level: info.lv + 1, cost: info.cost });
    const tierAfter = gunTier();
    if (tierAfter > tierBefore) track("gun_evolve", { tier: tierAfter });
    return { ok: true, tierBefore, tierAfter };
  }
  function featureUpgradeOpen(id) {
    const h2 = highestCleared();
    const runs = save().stats.runs;
    switch (id) {
      case "power":
        return runs >= 1;
      case "health":
        return runs >= 1;
      case "range":
        return h2 >= 1 || runs >= 3;
      case "pressure":
        return h2 >= 2;
      case "splash":
        return h2 >= 3;
    }
  }
  function upgradeUnlockStage(id) {
    return id === "range" ? 1 : id === "pressure" ? 2 : id === "splash" ? 3 : 0;
  }
  function applyRun(run, result, seconds, deathSource, daily) {
    const s = save();
    const stage = run.stage;
    const key = `s${stage}`;
    const before = { ...s.rescued };
    const firstClear = result === "clear" && !daily && !isCleared(stage);
    let bonus = 0;
    let bonusKind = null;
    if (result === "clear") {
      if (daily) {
        const first = !s.daily.cleared;
        bonus = first ? DAILY.firstClearCoins : DAILY.replayCoins;
        bonusKind = "daily";
        if (first) {
          s.daily.cleared = true;
          s.daily.streak = daysBetween(s.daily.lastClearDate, today()) === 1 ? s.daily.streak + 1 : 1;
          s.daily.lastClearDate = today();
        }
      } else if (firstClear) {
        bonus = REWARDS.stageFirstClear(stage);
        bonusKind = "first";
      } else {
        bonus = REWARDS.stageReplayClear(stage);
        bonusKind = "replay";
      }
    }
    const coinsRun = run.coins;
    earn(coinsRun, daily ? "daily_run" : "run");
    if (bonus) earn(bonus, daily ? "daily" : "clear_bonus");
    const festival = !daily && festivalActive() ? Math.round(coinsRun * (FESTIVAL.coinMul - 1)) : 0;
    if (festival) earn(festival, "festival");
    const newSpecies = [];
    const bondUps = [];
    for (const sp of run.rescued) {
      if (!(s.rescued[sp] || 0) && !newSpecies.includes(sp)) newSpecies.push(sp);
      s.rescued[sp] = (s.rescued[sp] || 0) + 1;
    }
    for (const sp of new Set(run.rescued)) {
      const a = bondLevel(before[sp] || 0), b = bondLevel(s.rescued[sp] || 0);
      if (b > a) bondUps.push({ species: sp, from: a, to: b, count: s.rescued[sp] || 0 });
    }
    if (!daily) {
      const at = s.attempts[key] ?? { tries: 0, failsInRow: 0 };
      at.tries++;
      at.failsInRow = result === "clear" ? 0 : at.failsInRow + (result === "fail" ? 1 : 0);
      s.attempts[key] = at;
      if (result === "clear") {
        const c = s.cleared[key] ?? { best: 0, clears: 0, stars: 0 };
        c.clears++;
        c.best = c.best ? Math.min(c.best, seconds) : seconds;
        const allAnimals = run.level.rooms.reduce((n, r) => n + r.animals.length, 0);
        const stars = 1 + (run.rescued.length >= allAnimals ? 1 : 0) + (run.hits === 0 ? 1 : 0);
        c.stars = Math.max(c.stars, stars);
        s.cleared[key] = c;
        if (firstClear) {
          track("stage_first_clear", { stage, attempts: at.tries });
          track("level_reached", { stage: stage + 1 });
        }
        if (firstClear && stage === 1) track("tutorial_complete", { seconds: Math.round((Date.now() - s.createdAt) / 1e3) });
        s.lastStage = Math.min(STAGE_COUNT, stage + 1);
      } else s.lastStage = stage;
    }
    s.stats.runs++;
    if (result === "clear") s.stats.wins++;
    s.stats.washed += run.washed;
    s.stats.rooms += run.roomsCleared;
    const done = [];
    const bump = (id, n) => {
      const d = bumpMission(id, n);
      if (d) done.push(d);
    };
    bump("wash", run.washed);
    bump("rescue", run.rescued.length);
    bump("rooms", run.roomsCleared);
    bump("pressure", run.pressureFulls);
    bump("nohit", run.noHitRooms);
    if (result === "clear") bump("clear", 1);
    markDirty();
    return {
      result,
      stage,
      coinsRun,
      bonus,
      bonusKind,
      festival,
      total: coinsRun + bonus + festival,
      rescued: run.rescued.slice(),
      newSpecies,
      bondUps,
      washed: run.washed,
      rooms: run.roomsCleared,
      totalRooms: run.level.rooms.length,
      seconds,
      firstClear,
      tierBefore: gunTier(),
      missionsDone: done,
      deathSource
    };
  }
  function bondProgress(sp) {
    const n = save().rescued[sp] || 0;
    const lv = bondLevel(n);
    const next = BOND_THRESHOLDS[lv];
    return { count: n, lv, next: next ?? null, toNext: next ? next - n : 0, maxed: lv >= BOND_THRESHOLDS.length };
  }
  function refreshDay() {
    const s = save();
    const d = today();
    let newDay = false;
    if (s.missions.date !== d) {
      const r = new Rng(hashString(d + s.installId));
      const pool = MISSIONS.map((m) => m.id).filter((id) => id !== "gifts" || featureOpen("shelter"));
      const ids = [];
      while (ids.length < MISSIONS_PER_DAY && pool.length) {
        const i = Math.floor(r.next() * pool.length);
        ids.push(pool.splice(i, 1)[0]);
      }
      s.missions = { date: d, ids, progress: ids.map(() => 0), claimed: ids.map(() => false), allClaimed: false };
      newDay = true;
    }
    if (s.daily.date !== d) {
      s.daily.date = d;
      s.daily.cleared = false;
    }
    if (s.streak.lastDate !== d) {
      const gap = daysBetween(s.streak.lastDate, d);
      s.streak.consecutive = gap === 1 ? s.streak.consecutive + 1 : 1;
      s.streak.day += 1;
      s.streak.lastDate = d;
      s.streak.claimedToday = false;
      newDay = true;
    }
    markDirty();
    return { newDay };
  }
  function missionDef(id) {
    return MISSIONS.find((m) => m.id === id);
  }
  function bumpMission(id, n) {
    const s = save();
    const i = s.missions.ids.indexOf(id);
    if (i < 0 || n <= 0) return null;
    const def = missionDef(id);
    const before = s.missions.progress[i];
    s.missions.progress[i] = Math.min(def.target, before + n);
    markDirty();
    if (before < def.target && s.missions.progress[i] >= def.target) {
      track("mission_complete", { id });
      return id;
    }
    return null;
  }
  function claimMission(i) {
    const s = save();
    const id = s.missions.ids[i];
    if (!id || s.missions.claimed[i]) return 0;
    const def = missionDef(id);
    if (s.missions.progress[i] < def.target) return 0;
    s.missions.claimed[i] = true;
    earn(def.coins, "mission");
    markDirty();
    return def.coins;
  }
  function claimAllMissionsBonus() {
    const s = save();
    if (s.missions.allClaimed || !s.missions.claimed.every(Boolean) || !s.missions.claimed.length) return 0;
    s.missions.allClaimed = true;
    earn(MISSION_ALL_BONUS, "mission_all");
    markDirty();
    return MISSION_ALL_BONUS;
  }
  function missionsClaimable() {
    const s = save();
    let n = 0;
    s.missions.ids.forEach((id, i) => {
      if (!s.missions.claimed[i] && s.missions.progress[i] >= missionDef(id).target) n++;
    });
    if (!s.missions.allClaimed && s.missions.claimed.length && s.missions.claimed.every(Boolean)) n++;
    return n;
  }
  function streakReward(day) {
    if (day <= STREAK_REWARDS.length) return STREAK_REWARDS[day - 1];
    return { coins: STREAK_AFTER_WEEK };
  }
  function claimStreak() {
    const s = save();
    if (s.streak.claimedToday || s.streak.day < 1) return null;
    const r = streakReward(s.streak.day);
    s.streak.claimedToday = true;
    if (r.coins) earn(r.coins, "streak");
    if (r.species) {
      s.rescued[r.species] = (s.rescued[r.species] || 0) + 1;
    }
    markDirty();
    track("streak_claim", { day: s.streak.day, reward: r.species ?? r.coins });
    return r;
  }
  function giftRate() {
    const s = save();
    let rate = 0;
    for (const sp of SPECIES) {
      const lv = bondLevel(s.rescued[sp.id] || 0);
      if (!lv) continue;
      rate += GIFTS.perSpeciesPerHour * (1 + GIFTS.bondBonus * (lv - 1));
    }
    const decorMul = 1 + s.decor.reduce((a, id) => a + (DECOR.find((d) => d.id === id)?.giftBonus ?? 0), 0);
    let pigBonus = 0;
    for (const sp of SPECIES) if (sp.bonus === "gifts") pigBonus += sp.per * bondLevel(s.rescued[sp.id] || 0);
    return rate * decorMul * (1 + pigBonus);
  }
  function giftsPending() {
    const s = save();
    const hours = Math.min(GIFTS.capHours, Math.max(0, (nowMs() - s.giftsAt) / 36e5));
    return Math.floor(hours * giftRate());
  }
  function collectGifts() {
    const s = save();
    const n = giftsPending();
    if (n < GIFTS.minCollect) return 0;
    s.giftsAt = nowMs();
    earn(n, "gift");
    markDirty();
    bumpMission("gifts", 1);
    track("gift_collect", { amount: n });
    return n;
  }
  function buyDecor(id) {
    const d = DECOR.find((x) => x.id === id);
    const s = save();
    if (!d || s.decor.includes(id)) return false;
    const pending = giftsPending();
    if (!spend(d.cost, "decor", id)) return false;
    s.decor.push(id);
    const rate = giftRate();
    if (rate > 0) s.giftsAt = nowMs() - pending / rate * 36e5;
    markDirty();
    track("decor_buy", { id });
    return true;
  }
  function dailyChallenge(levels) {
    const d = today();
    const r = new Rng(hashString("daily:" + d));
    const keys = Object.keys(MODS);
    const mod = keys[Math.floor(r.next() * keys.length)];
    const top = Math.max(DAILY.minStage, highestCleared());
    const pool = levels.filter((l) => l.stage <= top);
    const rooms = [];
    for (let i = 0; i < DAILY.rooms; i++) {
      const lv = pool[Math.floor(r.next() * pool.length)];
      const room = lv.rooms[Math.floor(r.next() * lv.rooms.length)];
      const copy = JSON.parse(JSON.stringify(room));
      if (mod === "swarm") copy.monsters = copy.monsters.concat(copy.monsters.filter((m) => m.t === "blob" || m.t === "mini").map((m) => ({ ...m, t: "blob", x: Math.min(500, m.x + 40), y: m.y + 30 })));
      rooms.push(copy);
    }
    const region = pool[Math.floor(r.next() * pool.length)].region;
    const level2 = { id: `daily-${d}`, stage: Math.min(STAGE_COUNT, top), tier: Math.min(STAGE_COUNT, top), region, rooms };
    return { mod, level: level2, mods: MODS[mod] };
  }
  function festivalOpen() {
    return highestCleared() >= FESTIVAL.unlockStage;
  }
  function festivalActive() {
    return festivalOpen() && FESTIVAL.days.includes(new Date(nowMs()).getDay());
  }
  function festivalRemainingMs() {
    const n = new Date(nowMs());
    let d = 1;
    while (d < 7 && FESTIVAL.days.includes(new Date(n.getFullYear(), n.getMonth(), n.getDate() + d).getDay())) d++;
    return new Date(n.getFullYear(), n.getMonth(), n.getDate() + d).getTime() - n.getTime();
  }
  function festivalKey() {
    const n = new Date(nowMs());
    let d = 0;
    while (d < 6 && FESTIVAL.days.includes(new Date(n.getFullYear(), n.getMonth(), n.getDate() - d - 1).getDay())) d++;
    return today(save().dayOffset - d);
  }
  function dailyRemainingMs() {
    const n = new Date(nowMs());
    const end = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).getTime();
    return end - n.getTime();
  }
  var MODS;
  var init_progress = __esm({
    "src/meta/progress.ts"() {
      "use strict";
      init_balance();
      init_rng();
      init_stats();
      init_analytics();
      init_save();
      MODS = {
        big: { monsterHp: 1, monsterSpeed: 1, monsterDmg: 1, bulletSpeed: 1, playerDps: 1, bigMonsters: true, coinMul: 2 },
        fast: { monsterHp: 1, monsterSpeed: 1.3, monsterDmg: 1, bulletSpeed: 1.15, playerDps: 1.3, bigMonsters: false, coinMul: 1.3 },
        swarm: { monsterHp: 0.75, monsterSpeed: 1, monsterDmg: 0.9, bulletSpeed: 1, playerDps: 1, bigMonsters: false, coinMul: 1.5 },
        rain: { monsterHp: 1, monsterSpeed: 1, monsterDmg: 1, bulletSpeed: 1.35, playerDps: 1, bigMonsters: false, coinMul: 1.5 }
      };
    }
  });

  // src/debug/panel.ts
  var panel_exports = {};
  __export(panel_exports, {
    applyPresetFromUrl: () => applyPresetFromUrl,
    initDebug: () => initDebug,
    presetSave: () => presetSave
  });
  function presetSave(name) {
    const s = newSave();
    const clear = (n) => {
      for (let i = 1; i <= n; i++) s.cleared[`s${i}`] = { best: 90, clears: 1, stars: 2 };
    };
    if (name === "day1") {
      clear(3);
      s.coins = 260;
      s.stats.runs = 5;
      s.rescued = { puppy: 3, bunny: 2, squirrel: 2 };
      s.upgrades = { power: 3, range: 1, health: 2, pressure: 0, splash: 0 };
    }
    if (name === "mid") {
      clear(8);
      s.coins = 1400;
      s.stats.runs = 16;
      s.rescued = { puppy: 6, bunny: 4, squirrel: 3, fox: 3, hedgehog: 1, fawn: 1 };
      s.upgrades = { power: 8, range: 4, health: 6, pressure: 2, splash: 2 };
      s.decor = ["ball", "cushion"];
    }
    if (name === "late") {
      clear(22);
      s.coins = 6e3;
      s.stats.runs = 60;
      for (const sp of SPECIES) s.rescued[sp.id] = sp.region === "lake" ? 2 : 8;
      delete s.rescued.frog;
      s.upgrades = { power: 20, range: 10, health: 15, pressure: 8, splash: 8 };
      s.decor = ["ball", "cushion", "bowl", "flowers", "pond", "treehouse"];
    }
    if (name === "max") {
      clear(30);
      s.coins = 99999;
      s.stats.runs = 120;
      for (const sp of SPECIES) s.rescued[sp.id] = 15;
      for (const u of UPGRADES) s.upgrades[u.id] = u.max;
      s.decor = ["ball", "cushion", "bowl", "flowers", "pond", "treehouse", "slide", "fountain"];
    }
    for (const k of ["upgrades", "shelter", "missions", "daily", "decor"]) if (name !== "fresh") s.flags[`unlock_${k}`] = true;
    s.giftsAt = Date.now() - 3 * 36e5;
    return s;
  }
  function applyPresetFromUrl() {
    const preset = new URLSearchParams(location.search).get("preset");
    if (preset && !sessionStorage.getItem("preset-applied-" + preset)) {
      sessionStorage.setItem("preset-applied-" + preset, "1");
      try {
        localStorage.setItem("splash-rescue-save", JSON.stringify(presetSave(preset)));
      } catch {
      }
    }
  }
  function initDebug(app) {
    const btn = document.createElement("button");
    btn.textContent = "DEV";
    btn.className = "dbg-toggle";
    const panel = document.createElement("div");
    panel.className = "dbg-panel";
    panel.style.display = "none";
    const fps = document.createElement("div");
    fps.className = "dbg-fps";
    document.body.append(btn, panel, fps);
    btn.onclick = () => {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
      render();
    };
    let acc = 0, frames2 = 0;
    app.debug.onFrame = (dt) => {
      acc += dt;
      frames2++;
      if (acc > 0.5) {
        fps.textContent = `${Math.round(frames2 / acc)} fps \xB7 ${quality().dprCap}x`;
        acc = 0;
        frames2 = 0;
      }
    };
    const act = (label, fn) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = () => {
        fn();
        markDirty();
        flush();
        render();
      };
      return b;
    };
    const row = (title, ...items) => {
      const d = document.createElement("div");
      d.className = "dbg-row";
      const h2 = document.createElement("b");
      h2.textContent = title;
      d.append(h2, ...items);
      return d;
    };
    const stageInput = document.createElement("input");
    stageInput.type = "number";
    stageInput.min = "1";
    stageInput.max = String(STAGE_COUNT);
    stageInput.value = String(Math.min(STAGE_COUNT, Object.keys(save().cleared).length + 1));
    const render = () => {
      if (panel.style.display === "none") return;
      const s = save();
      const log = document.createElement("pre");
      log.className = "dbg-log";
      log.textContent = debugBuffer.events.slice(-25).reverse().map((e) => `${new Date(e.t).toLocaleTimeString()} ${e.name} ${JSON.stringify(e.params)}`).join("\n");
      panel.replaceChildren(
        row(`Coins ${s.coins}`, act("+100", () => earn(100, "debug")), act("+1k", () => earn(1e3, "debug")), act("+10k", () => earn(1e4, "debug"))),
        row("Stage", stageInput, act("Play", () => app.playStage(Number(stageInput.value))), act("Clear \u2264N", () => {
          var _a, _b;
          for (let i = 1; i <= Number(stageInput.value); i++) (_a = s.cleared)[_b = `s${i}`] || (_a[_b] = { best: 99, clears: 1, stars: 1 });
          app.goHome("map");
        }), act("Unclear all", () => {
          s.cleared = {};
          app.goHome("map");
        })),
        row(`Day +${s.dayOffset} (streak ${s.streak.day})`, act("Next day", () => {
          s.dayOffset += 1;
          refreshDay();
          app.goHome("map");
        }), act("Gifts full", () => {
          s.giftsAt = Date.now() + s.dayOffset * 864e5 - 9 * 36e5;
        })),
        row("Animals", act("All x1", () => {
          for (const sp of SPECIES) s.rescued[sp.id] = Math.max(1, s.rescued[sp.id] || 0);
        }), act("All bond max", () => {
          for (const sp of SPECIES) s.rescued[sp.id] = 15;
        }), act("None", () => {
          s.rescued = {};
        })),
        row("Upgrades", act("+5 all", () => {
          for (const u of UPGRADES) s.upgrades[u.id] = Math.min(u.max, (s.upgrades[u.id] || 0) + 5);
        }), act("Max", () => {
          for (const u of UPGRADES) s.upgrades[u.id] = u.max;
        }), act("Reset", () => {
          for (const u of UPGRADES) s.upgrades[u.id] = 0;
        })),
        row("Preset", ...["fresh", "day1", "mid", "late", "max"].map((n) => act(n, () => {
          replaceSave(presetSave(n));
          app.goHome("map");
        }))),
        row("Go", act("Title", () => app.showTitle()), act("Map", () => app.goHome("map")), act("Shelter", () => app.goHome("shelter")), act("Upgrades", () => app.goHome("upgrade")), act("Daily", () => app.playDaily())),
        log
      );
    };
  }
  var init_panel = __esm({
    "src/debug/panel.ts"() {
      "use strict";
      init_balance();
      init_quality();
      init_progress();
      init_save();
      init_analytics();
    }
  });

  // assets/art/atlas.json
  var atlas_default = { atlases: { sprites: { pages: ["sprites-0.png", "sprites-1.png"], frames: { ob_fencev: { page: 0, x: 3, y: 3, w: 20, h: 345, ax: 10, ay: 337 }, m_boss_village_normal: { page: 0, x: 26, y: 3, w: 330, h: 314, ax: 167, ay: 274 }, m_boss_village_hit: { page: 0, x: 359, y: 3, w: 330, h: 314, ax: 167, ay: 274 }, m_boss_village_charge: { page: 0, x: 692, y: 3, w: 330, h: 314, ax: 167, ay: 274 }, m_boss_lake_normal: { page: 0, x: 1025, y: 3, w: 330, h: 305, ax: 167, ay: 265 }, m_boss_lake_hit: { page: 0, x: 1358, y: 3, w: 330, h: 305, ax: 167, ay: 265 }, m_boss_lake_charge: { page: 0, x: 1691, y: 3, w: 330, h: 305, ax: 167, ay: 265 }, m_boss_forest_normal: { page: 0, x: 3, y: 351, w: 330, h: 302, ax: 167, ay: 262 }, m_boss_forest_hit: { page: 0, x: 336, y: 351, w: 330, h: 302, ax: 167, ay: 262 }, m_boss_forest_charge: { page: 0, x: 669, y: 351, w: 330, h: 302, ax: 167, ay: 262 }, sh_house: { page: 0, x: 1002, y: 351, w: 364, h: 270, ax: 182, ay: 266 }, ob_house: { page: 0, x: 1369, y: 351, w: 332, h: 270, ax: 166, ay: 266 }, ob_house2: { page: 0, x: 1704, y: 351, w: 332, h: 270, ax: 166, ay: 266 }, fx_rays: { page: 0, x: 3, y: 656, w: 266, h: 264, ax: 133, ay: 132 }, ob_windmill: { page: 0, x: 272, y: 656, w: 178, h: 243, ax: 89, ay: 239 }, goostamp_2: { page: 0, x: 453, y: 656, w: 229, h: 239, ax: 115, ay: 117 }, goostamp_1: { page: 0, x: 685, y: 656, w: 243, h: 237, ax: 121, ay: 124 }, goostamp_0: { page: 0, x: 931, y: 656, w: 243, h: 228, ax: 121, ay: 111 }, goostamp_3: { page: 0, x: 1177, y: 656, w: 236, h: 225, ax: 114, ay: 111 }, dc_treehouse: { page: 0, x: 1416, y: 656, w: 132, h: 208, ax: 66, ay: 204 }, gate_posts: { page: 0, x: 1551, y: 656, w: 244, h: 176, ax: 122, ay: 170 }, ob_well: { page: 0, x: 1798, y: 656, w: 148, h: 174, ax: 74, ay: 164 }, ob_tree: { page: 0, x: 3, y: 923, w: 130, h: 160, ax: 67, ay: 154 }, ob_tree2: { page: 0, x: 136, y: 923, w: 137, h: 159, ax: 70, ay: 153 }, mk_joybase: { page: 0, x: 276, y: 923, w: 158, h: 158, ax: 79, ay: 79 }, border_tree: { page: 0, x: 437, y: 923, w: 132, h: 154, ax: 68, ay: 148 }, ob_pine: { page: 0, x: 572, y: 923, w: 108, h: 154, ax: 54, ay: 148 }, border_pine: { page: 0, x: 683, y: 923, w: 108, h: 154, ax: 54, ay: 148 }, dc_slide: { page: 0, x: 794, y: 923, w: 168, h: 146, ax: 80, ay: 136 }, dc_fountain: { page: 0, x: 965, y: 923, w: 160, h: 138, ax: 80, ay: 128 }, m_chunky_normal: { page: 0, x: 1128, y: 923, w: 205, h: 136, ax: 104, ay: 113 }, m_chunky_hit: { page: 0, x: 1336, y: 923, w: 205, h: 136, ax: 104, ay: 113 }, m_chunky_charge: { page: 0, x: 1544, y: 923, w: 205, h: 136, ax: 104, ay: 113 }, kid_idle_2: { page: 0, x: 1752, y: 923, w: 84, h: 133, ax: 31, ay: 130 }, kid_run_0: { page: 0, x: 1839, y: 923, w: 87, h: 132, ax: 27, ay: 129 }, kid_run_3: { page: 0, x: 1929, y: 923, w: 87, h: 132, ax: 27, ay: 129 }, kid_sad_0: { page: 0, x: 3, y: 1086, w: 95, h: 131, ax: 45, ay: 119 }, kid_sad_1: { page: 0, x: 101, y: 1086, w: 95, h: 131, ax: 45, ay: 118 }, kid_idle_1: { page: 0, x: 199, y: 1086, w: 84, h: 131, ax: 31, ay: 128 }, kid_idle_3: { page: 0, x: 286, y: 1086, w: 84, h: 131, ax: 31, ay: 128 }, mp_sign: { page: 0, x: 373, y: 1086, w: 228, h: 130, ax: 114, ay: 124 }, kid_run_1: { page: 0, x: 604, y: 1086, w: 87, h: 130, ax: 27, ay: 127 }, kid_run_2: { page: 0, x: 694, y: 1086, w: 87, h: 130, ax: 27, ay: 127 }, kid_run_4: { page: 0, x: 784, y: 1086, w: 87, h: 130, ax: 27, ay: 127 }, kid_run_5: { page: 0, x: 874, y: 1086, w: 87, h: 130, ax: 27, ay: 127 }, kid_win_1: { page: 0, x: 964, y: 1086, w: 98, h: 129, ax: 46, ay: 140 }, kid_win_2: { page: 0, x: 1065, y: 1086, w: 98, h: 129, ax: 46, ay: 146 }, kid_win_3: { page: 0, x: 1166, y: 1086, w: 98, h: 129, ax: 46, ay: 138 }, kid_idle_0: { page: 0, x: 1267, y: 1086, w: 84, h: 129, ax: 31, ay: 126 }, kid_shoot_0: { page: 0, x: 1354, y: 1086, w: 84, h: 129, ax: 31, ay: 126 }, brush: { page: 0, x: 1441, y: 1086, w: 128, h: 128, ax: 64, ay: 64 }, fx_glow: { page: 0, x: 1572, y: 1086, w: 128, h: 128, ax: 64, ay: 64 }, fx_softring: { page: 0, x: 1703, y: 1086, w: 126, h: 126, ax: 63, ay: 63 }, kid_shoot_1: { page: 0, x: 1832, y: 1086, w: 85, h: 126, ax: 31, ay: 123 }, fx_ring: { page: 0, x: 1920, y: 1086, w: 122, h: 122, ax: 61, ay: 61 }, kid_win_0: { page: 0, x: 3, y: 1220, w: 104, h: 120, ax: 49, ay: 117 }, kid_hurt_0: { page: 0, x: 110, y: 1220, w: 87, h: 120, ax: 43, ay: 117 }, m_jumper_normal: { page: 0, x: 200, y: 1220, w: 117, h: 117, ax: 59, ay: 101 }, m_jumper_hit: { page: 0, x: 320, y: 1220, w: 117, h: 117, ax: 59, ay: 101 }, m_jumper_charge: { page: 0, x: 440, y: 1220, w: 117, h: 117, ax: 59, ay: 101 }, ob_cart: { page: 0, x: 560, y: 1220, w: 208, h: 115, ax: 104, ay: 111 }, sh_sign: { page: 0, x: 771, y: 1220, w: 132, h: 114, ax: 66, ay: 110 }, mk_shield: { page: 0, x: 906, y: 1220, w: 114, h: 114, ax: 57, ay: 57 }, m_nest_charge: { page: 0, x: 1023, y: 1220, w: 202, h: 112, ax: 101, ay: 98 }, mk_hand: { page: 0, x: 1228, y: 1220, w: 70, h: 106, ax: 19, ay: 8 }, m_nest_normal: { page: 0, x: 1301, y: 1220, w: 202, h: 103, ax: 101, ay: 89 }, m_nest_hit: { page: 0, x: 1506, y: 1220, w: 202, h: 103, ax: 101, ay: 89 }, ob_boulder: { page: 0, x: 1711, y: 1220, w: 185, h: 102, ax: 93, ay: 84 }, fx_splash_2: { page: 0, x: 1899, y: 1220, w: 134, h: 101, ax: 66, ay: 76 }, a_bunny_walk_0: { page: 0, x: 3, y: 1343, w: 72, h: 100, ax: 33, ay: 99 }, a_bunny_walk_1: { page: 0, x: 78, y: 1343, w: 72, h: 100, ax: 33, ay: 97 }, a_bunny_walk_2: { page: 0, x: 153, y: 1343, w: 72, h: 100, ax: 33, ay: 99 }, a_bunny_walk_3: { page: 0, x: 228, y: 1343, w: 72, h: 100, ax: 33, ay: 97 }, a_bunny_happy_1: { page: 0, x: 303, y: 1343, w: 72, h: 100, ax: 33, ay: 109 }, a_bunny_happy_2: { page: 0, x: 378, y: 1343, w: 72, h: 100, ax: 33, ay: 115 }, a_bunny_happy_0: { page: 0, x: 453, y: 1343, w: 71, h: 100, ax: 32, ay: 97 }, a_bunny_idle_0: { page: 0, x: 527, y: 1343, w: 72, h: 99, ax: 33, ay: 96 }, a_bunny_idle_1: { page: 0, x: 602, y: 1343, w: 72, h: 99, ax: 33, ay: 96 }, fx_splash_3: { page: 0, x: 677, y: 1343, w: 171, h: 98, ax: 85, ay: 70 }, ob_reeds: { page: 0, x: 851, y: 1343, w: 50, h: 98, ax: 27, ay: 94 }, m_spitter_normal: { page: 0, x: 904, y: 1343, w: 110, h: 97, ax: 56, ay: 83 }, m_spitter_hit: { page: 0, x: 1017, y: 1343, w: 110, h: 97, ax: 56, ay: 83 }, m_spitter_charge: { page: 0, x: 1130, y: 1343, w: 110, h: 97, ax: 56, ay: 83 }, m_blob_normal: { page: 0, x: 1243, y: 1343, w: 115, h: 96, ax: 58, ay: 82 }, m_blob_hit: { page: 0, x: 1361, y: 1343, w: 115, h: 96, ax: 58, ay: 82 }, m_blob_charge: { page: 0, x: 1479, y: 1343, w: 115, h: 96, ax: 58, ay: 82 }, m_splitter_normal: { page: 0, x: 1597, y: 1343, w: 139, h: 95, ax: 71, ay: 77 }, m_splitter_hit: { page: 0, x: 1739, y: 1343, w: 139, h: 95, ax: 71, ay: 77 }, m_splitter_charge: { page: 0, x: 1881, y: 1343, w: 139, h: 95, ax: 71, ay: 77 }, m_dasher_normal: { page: 0, x: 3, y: 1446, w: 126, h: 95, ax: 64, ay: 83 }, m_dasher_hit: { page: 0, x: 132, y: 1446, w: 126, h: 95, ax: 64, ay: 83 }, m_dasher_charge: { page: 0, x: 261, y: 1446, w: 126, h: 95, ax: 64, ay: 83 }, a_bunny_trapped_1: { page: 0, x: 390, y: 1446, w: 72, h: 95, ax: 33, ay: 94 }, fx_splash_1: { page: 0, x: 465, y: 1446, w: 98, h: 94, ax: 48, ay: 72 }, p_bunny: { page: 0, x: 566, y: 1446, w: 67, h: 94, ax: 29, ay: 39 }, sil_bunny: { page: 0, x: 636, y: 1446, w: 67, h: 94, ax: 29, ay: 39 }, a_bunny_trapped_0: { page: 0, x: 706, y: 1446, w: 72, h: 93, ax: 33, ay: 92 }, m_flyer_normal_0: { page: 0, x: 781, y: 1446, w: 164, h: 89, ax: 82, ay: 82 }, m_flyer_hit_0: { page: 0, x: 948, y: 1446, w: 164, h: 89, ax: 82, ay: 82 }, m_flyer_charge_0: { page: 0, x: 1115, y: 1446, w: 164, h: 89, ax: 82, ay: 82 }, m_flyer_normal_1: { page: 0, x: 1282, y: 1446, w: 152, h: 89, ax: 76, ay: 82 }, m_flyer_hit_1: { page: 0, x: 1437, y: 1446, w: 152, h: 89, ax: 76, ay: 82 }, m_flyer_charge_1: { page: 0, x: 1592, y: 1446, w: 152, h: 89, ax: 76, ay: 82 }, cocoon_0: { page: 0, x: 1747, y: 1446, w: 132, h: 89, ax: 67, ay: 85 }, cocoon_1: { page: 0, x: 1882, y: 1446, w: 132, h: 89, ax: 67, ay: 85 }, cocoon_2: { page: 0, x: 3, y: 1544, w: 131, h: 89, ax: 66, ay: 85 }, ob_crate: { page: 0, x: 137, y: 1544, w: 104, h: 88, ax: 50, ay: 84 }, gate_goo: { page: 0, x: 244, y: 1544, w: 150, h: 87, ax: 75, ay: 74 }, a_fox_happy_1: { page: 0, x: 397, y: 1544, w: 105, h: 87, ax: 65, ay: 96 }, a_fox_happy_2: { page: 0, x: 505, y: 1544, w: 91, h: 87, ax: 51, ay: 102 }, a_fox_happy_0: { page: 0, x: 599, y: 1544, w: 88, h: 87, ax: 48, ay: 84 }, fx_splash_4: { page: 0, x: 690, y: 1544, w: 140, h: 86, ax: 70, ay: 51 }, a_squirrel_happy_1: { page: 0, x: 833, y: 1544, w: 89, h: 86, ax: 53, ay: 95 }, a_squirrel_walk_3: { page: 0, x: 925, y: 1544, w: 87, h: 86, ax: 51, ay: 83 }, a_kitten_happy_1: { page: 0, x: 1015, y: 1544, w: 86, h: 86, ax: 48, ay: 95 }, a_squirrel_walk_0: { page: 0, x: 1104, y: 1544, w: 79, h: 86, ax: 43, ay: 85 }, a_squirrel_walk_2: { page: 0, x: 1186, y: 1544, w: 79, h: 86, ax: 43, ay: 85 }, a_squirrel_idle_0: { page: 0, x: 1268, y: 1544, w: 79, h: 86, ax: 43, ay: 83 }, a_squirrel_idle_1: { page: 0, x: 1350, y: 1544, w: 75, h: 86, ax: 39, ay: 83 }, a_squirrel_walk_1: { page: 0, x: 1428, y: 1544, w: 73, h: 86, ax: 37, ay: 83 }, a_squirrel_happy_2: { page: 0, x: 1504, y: 1544, w: 73, h: 86, ax: 37, ay: 101 }, a_kitten_happy_2: { page: 0, x: 1580, y: 1544, w: 73, h: 86, ax: 35, ay: 101 }, a_kitten_happy_0: { page: 0, x: 1656, y: 1544, w: 72, h: 86, ax: 34, ay: 83 }, a_squirrel_happy_0: { page: 0, x: 1731, y: 1544, w: 71, h: 86, ax: 35, ay: 83 }, a_fox_walk_3: { page: 0, x: 1805, y: 1544, w: 104, h: 85, ax: 64, ay: 82 }, a_fox_walk_0: { page: 0, x: 1912, y: 1544, w: 99, h: 85, ax: 59, ay: 84 }, a_fox_walk_2: { page: 0, x: 3, y: 1636, w: 99, h: 85, ax: 59, ay: 84 }, a_fox_walk_1: { page: 0, x: 105, y: 1636, w: 91, h: 85, ax: 51, ay: 82 }, a_fox_idle_0: { page: 0, x: 199, y: 1636, w: 99, h: 84, ax: 59, ay: 81 }, a_fox_idle_1: { page: 0, x: 301, y: 1636, w: 94, h: 84, ax: 54, ay: 81 }, a_kitten_walk_0: { page: 0, x: 398, y: 1636, w: 78, h: 84, ax: 40, ay: 83 }, a_kitten_walk_2: { page: 0, x: 479, y: 1636, w: 78, h: 84, ax: 40, ay: 83 }, a_kitten_walk_3: { page: 0, x: 560, y: 1636, w: 84, h: 83, ax: 46, ay: 80 }, a_kitten_idle_0: { page: 0, x: 647, y: 1636, w: 78, h: 83, ax: 40, ay: 80 }, a_kitten_idle_1: { page: 0, x: 728, y: 1636, w: 75, h: 83, ax: 37, ay: 80 }, a_kitten_walk_1: { page: 0, x: 806, y: 1636, w: 73, h: 83, ax: 35, ay: 80 }, a_lamb_walk_0: { page: 0, x: 882, y: 1636, w: 76, h: 82, ax: 35, ay: 81 }, a_lamb_walk_2: { page: 0, x: 961, y: 1636, w: 76, h: 82, ax: 35, ay: 81 }, p_fox: { page: 0, x: 1040, y: 1636, w: 93, h: 81, ax: 53, ay: 26 }, a_piglet_happy_1: { page: 0, x: 1136, y: 1636, w: 77, h: 81, ax: 37, ay: 90 }, a_lamb_walk_3: { page: 0, x: 1216, y: 1636, w: 76, h: 81, ax: 35, ay: 78 }, a_lamb_idle_0: { page: 0, x: 1295, y: 1636, w: 76, h: 81, ax: 35, ay: 78 }, a_lamb_idle_1: { page: 0, x: 1374, y: 1636, w: 76, h: 81, ax: 35, ay: 78 }, a_lamb_happy_1: { page: 0, x: 1453, y: 1636, w: 76, h: 81, ax: 35, ay: 90 }, a_squirrel_trapped_1: { page: 0, x: 1532, y: 1636, w: 75, h: 81, ax: 39, ay: 81 }, a_lamb_walk_1: { page: 0, x: 1610, y: 1636, w: 75, h: 81, ax: 34, ay: 78 }, a_lamb_happy_0: { page: 0, x: 1688, y: 1636, w: 75, h: 81, ax: 34, ay: 78 }, a_lamb_happy_2: { page: 0, x: 1766, y: 1636, w: 75, h: 81, ax: 34, ay: 96 }, p_squirrel: { page: 0, x: 1844, y: 1636, w: 74, h: 81, ax: 38, ay: 26 }, sil_squirrel: { page: 0, x: 1921, y: 1636, w: 74, h: 81, ax: 38, ay: 26 }, a_fawn_happy_1: { page: 0, x: 3, y: 1724, w: 73, h: 81, ax: 33, ay: 90 }, a_piglet_happy_0: { page: 0, x: 79, y: 1724, w: 71, h: 81, ax: 31, ay: 78 }, a_piglet_happy_2: { page: 0, x: 153, y: 1724, w: 71, h: 81, ax: 31, ay: 96 }, a_fawn_happy_2: { page: 0, x: 227, y: 1724, w: 69, h: 81, ax: 29, ay: 96 }, a_fawn_happy_0: { page: 0, x: 299, y: 1724, w: 68, h: 81, ax: 28, ay: 78 }, ob_hay: { page: 0, x: 370, y: 1724, w: 124, h: 80, ax: 62, ay: 74 }, ob_shellrock: { page: 0, x: 497, y: 1724, w: 124, h: 80, ax: 63, ay: 67 }, ic_skill_thick: { page: 0, x: 624, y: 1724, w: 90, h: 80, ax: 45, ay: 39 }, p_kitten: { page: 0, x: 717, y: 1724, w: 74, h: 80, ax: 36, ay: 25 }, a_piglet_walk_0: { page: 0, x: 794, y: 1724, w: 74, h: 80, ax: 34, ay: 79 }, a_piglet_walk_2: { page: 0, x: 871, y: 1724, w: 74, h: 80, ax: 34, ay: 79 }, a_fawn_walk_0: { page: 0, x: 948, y: 1724, w: 72, h: 80, ax: 31, ay: 79 }, a_fawn_walk_2: { page: 0, x: 1023, y: 1724, w: 72, h: 80, ax: 31, ay: 79 }, ic_skill_turbo: { page: 0, x: 1098, y: 1724, w: 72, h: 80, ax: 36, ay: 40 }, fx_splash_5: { page: 0, x: 1173, y: 1724, w: 157, h: 79, ax: 79, ay: 44 }, a_fox_trapped_1: { page: 0, x: 1333, y: 1724, w: 94, h: 79, ax: 54, ay: 79 }, sil_fox: { page: 0, x: 1430, y: 1724, w: 93, h: 79, ax: 53, ay: 24 }, a_squirrel_trapped_0: { page: 0, x: 1526, y: 1724, w: 84, h: 79, ax: 48, ay: 79 }, a_puppy_happy_1: { page: 0, x: 1613, y: 1724, w: 82, h: 79, ax: 38, ay: 88 }, a_puppy_walk_3: { page: 0, x: 1698, y: 1724, w: 81, h: 79, ax: 37, ay: 76 }, a_puppy_walk_0: { page: 0, x: 1782, y: 1724, w: 78, h: 79, ax: 34, ay: 78 }, a_puppy_walk_2: { page: 0, x: 1863, y: 1724, w: 78, h: 79, ax: 34, ay: 78 }, a_puppy_idle_0: { page: 0, x: 1944, y: 1724, w: 78, h: 79, ax: 34, ay: 76 }, a_piglet_walk_3: { page: 0, x: 3, y: 1808, w: 77, h: 79, ax: 37, ay: 76 }, a_panda_walk_0: { page: 0, x: 83, y: 1808, w: 77, h: 79, ax: 35, ay: 78 }, a_panda_walk_2: { page: 0, x: 163, y: 1808, w: 77, h: 79, ax: 35, ay: 78 }, a_puppy_idle_1: { page: 0, x: 243, y: 1808, w: 76, h: 79, ax: 32, ay: 76 }, a_lamb_trapped_1: { page: 0, x: 322, y: 1808, w: 76, h: 79, ax: 35, ay: 76 }, a_puppy_walk_1: { page: 0, x: 401, y: 1808, w: 75, h: 79, ax: 31, ay: 76 }, a_puppy_happy_0: { page: 0, x: 479, y: 1808, w: 75, h: 79, ax: 31, ay: 76 }, a_puppy_happy_2: { page: 0, x: 557, y: 1808, w: 75, h: 79, ax: 31, ay: 94 }, a_piglet_idle_0: { page: 0, x: 635, y: 1808, w: 74, h: 79, ax: 34, ay: 76 }, a_fawn_walk_3: { page: 0, x: 712, y: 1808, w: 73, h: 79, ax: 32, ay: 76 }, a_fawn_idle_0: { page: 0, x: 788, y: 1808, w: 73, h: 79, ax: 31, ay: 76 }, a_piglet_idle_1: { page: 0, x: 864, y: 1808, w: 72, h: 79, ax: 32, ay: 76 }, a_fawn_idle_1: { page: 0, x: 939, y: 1808, w: 71, h: 79, ax: 29, ay: 76 }, a_piglet_walk_1: { page: 0, x: 1013, y: 1808, w: 71, h: 79, ax: 31, ay: 76 }, a_fawn_walk_1: { page: 0, x: 1087, y: 1808, w: 70, h: 79, ax: 29, ay: 76 }, ob_barrel: { page: 0, x: 1160, y: 1808, w: 60, h: 79, ax: 30, ay: 75 }, a_panda_happy_1: { page: 0, x: 1223, y: 1808, w: 81, h: 78, ax: 39, ay: 87 }, a_panda_walk_3: { page: 0, x: 1307, y: 1808, w: 80, h: 78, ax: 38, ay: 75 }, a_panda_idle_0: { page: 0, x: 1390, y: 1808, w: 77, h: 78, ax: 35, ay: 75 }, a_kitten_trapped_1: { page: 0, x: 1470, y: 1808, w: 75, h: 78, ax: 37, ay: 78 }, a_panda_idle_1: { page: 0, x: 1548, y: 1808, w: 75, h: 78, ax: 33, ay: 75 }, a_panda_trapped_1: { page: 0, x: 1626, y: 1808, w: 75, h: 78, ax: 33, ay: 73 }, a_panda_walk_1: { page: 0, x: 1704, y: 1808, w: 74, h: 78, ax: 32, ay: 75 }, a_panda_happy_2: { page: 0, x: 1781, y: 1808, w: 74, h: 78, ax: 32, ay: 93 }, sil_kitten: { page: 0, x: 1858, y: 1808, w: 74, h: 78, ax: 36, ay: 23 }, ic_skill_keep: { page: 0, x: 1935, y: 1808, w: 74, h: 78, ax: 36, ay: 38 }, a_panda_happy_0: { page: 0, x: 3, y: 1890, w: 73, h: 78, ax: 31, ay: 75 }, a_piglet_trapped_1: { page: 0, x: 79, y: 1890, w: 72, h: 78, ax: 32, ay: 74 }, a_fox_trapped_0: { page: 0, x: 154, y: 1890, w: 102, h: 77, ax: 62, ay: 77 }, a_lamb_trapped_0: { page: 0, x: 259, y: 1890, w: 76, h: 77, ax: 35, ay: 74 }, a_hedgehog_happy_0: { page: 0, x: 338, y: 1890, w: 75, h: 77, ax: 37, ay: 74 }, a_hedgehog_walk_0: { page: 0, x: 416, y: 1890, w: 73, h: 77, ax: 35, ay: 76 }, a_hedgehog_walk_1: { page: 0, x: 492, y: 1890, w: 73, h: 77, ax: 35, ay: 74 }, a_hedgehog_walk_2: { page: 0, x: 568, y: 1890, w: 73, h: 77, ax: 35, ay: 76 }, a_hedgehog_walk_3: { page: 0, x: 644, y: 1890, w: 73, h: 77, ax: 35, ay: 74 }, a_hedgehog_idle_0: { page: 0, x: 720, y: 1890, w: 73, h: 77, ax: 35, ay: 74 }, a_hedgehog_idle_1: { page: 0, x: 796, y: 1890, w: 73, h: 77, ax: 35, ay: 74 }, a_hedgehog_happy_2: { page: 0, x: 872, y: 1890, w: 73, h: 77, ax: 35, ay: 92 }, a_hedgehog_trapped_1: { page: 0, x: 948, y: 1890, w: 73, h: 77, ax: 35, ay: 72 }, a_hedgehog_happy_1: { page: 0, x: 1024, y: 1890, w: 72, h: 77, ax: 34, ay: 86 }, p_lamb: { page: 0, x: 1099, y: 1890, w: 72, h: 77, ax: 31, ay: 22 }, sil_lamb: { page: 0, x: 1174, y: 1890, w: 72, h: 77, ax: 31, ay: 22 }, a_duckling_happy_0: { page: 0, x: 1249, y: 1890, w: 67, h: 77, ax: 28, ay: 76 }, a_duckling_walk_0: { page: 0, x: 1319, y: 1890, w: 66, h: 77, ax: 27, ay: 78 }, a_duckling_walk_2: { page: 0, x: 1388, y: 1890, w: 66, h: 77, ax: 27, ay: 78 }, a_duckling_idle_0: { page: 0, x: 1457, y: 1890, w: 66, h: 77, ax: 27, ay: 76 }, a_duckling_idle_1: { page: 0, x: 1526, y: 1890, w: 66, h: 77, ax: 27, ay: 76 }, a_duckling_sleep_0: { page: 0, x: 1595, y: 1890, w: 66, h: 77, ax: 27, ay: 76 }, a_duckling_sleep_1: { page: 0, x: 1664, y: 1890, w: 66, h: 77, ax: 27, ay: 76 }, a_duckling_trapped_0: { page: 0, x: 1733, y: 1890, w: 66, h: 77, ax: 28, ay: 76 }, a_duckling_trapped_1: { page: 0, x: 1802, y: 1890, w: 66, h: 77, ax: 26, ay: 76 }, a_duckling_happy_2: { page: 0, x: 1871, y: 1890, w: 65, h: 77, ax: 28, ay: 94 }, a_duckling_walk_3: { page: 0, x: 1939, y: 1890, w: 64, h: 77, ax: 29, ay: 76 }, a_kitten_trapped_0: { page: 1, x: 3, y: 3, w: 82, h: 76, ax: 44, ay: 76 }, a_panda_trapped_0: { page: 1, x: 88, y: 3, w: 79, h: 76, ax: 37, ay: 71 }, a_piglet_trapped_0: { page: 1, x: 170, y: 3, w: 76, h: 76, ax: 36, ay: 72 }, a_duckling_walk_1: { page: 1, x: 249, y: 3, w: 66, h: 76, ax: 25, ay: 75 }, a_duckling_happy_1: { page: 1, x: 318, y: 3, w: 65, h: 76, ax: 25, ay: 87 }, ic_missions: { page: 1, x: 386, y: 3, w: 60, h: 76, ax: 30, ay: 40 }, a_puppy_trapped_1: { page: 1, x: 449, y: 3, w: 76, h: 75, ax: 32, ay: 74 }, a_hedgehog_trapped_0: { page: 1, x: 528, y: 3, w: 73, h: 75, ax: 35, ay: 70 }, p_piglet: { page: 1, x: 604, y: 3, w: 70, h: 75, ax: 30, ay: 20 }, p_fawn: { page: 1, x: 677, y: 3, w: 68, h: 75, ax: 27, ay: 20 }, sil_fawn: { page: 1, x: 748, y: 3, w: 68, h: 75, ax: 27, ay: 20 }, p_puppy: { page: 1, x: 819, y: 3, w: 73, h: 74, ax: 30, ay: 19 }, sil_puppy: { page: 1, x: 895, y: 3, w: 73, h: 74, ax: 30, ay: 19 }, p_panda: { page: 1, x: 971, y: 3, w: 72, h: 74, ax: 31, ay: 19 }, sil_panda: { page: 1, x: 1046, y: 3, w: 72, h: 74, ax: 31, ay: 19 }, a_fawn_trapped_1: { page: 1, x: 1121, y: 3, w: 71, h: 74, ax: 29, ay: 74 }, sil_piglet: { page: 1, x: 1195, y: 3, w: 70, h: 74, ax: 30, ay: 19 }, a_puppy_trapped_0: { page: 1, x: 1268, y: 3, w: 80, h: 73, ax: 36, ay: 72 }, ic_shelter: { page: 1, x: 1351, y: 3, w: 80, h: 72, ax: 40, ay: 38 }, a_fawn_trapped_0: { page: 1, x: 1434, y: 3, w: 74, h: 72, ax: 32, ay: 72 }, ic_skill_multi: { page: 1, x: 1511, y: 3, w: 74, h: 72, ax: 35, ay: 35 }, ic_gear: { page: 1, x: 1588, y: 3, w: 72, h: 72, ax: 36, ay: 36 }, ic_up_pressure: { page: 1, x: 1663, y: 3, w: 72, h: 72, ax: 36, ay: 32 }, p_hedgehog: { page: 1, x: 1738, y: 3, w: 69, h: 72, ax: 31, ay: 17 }, sil_hedgehog: { page: 1, x: 1810, y: 3, w: 69, h: 72, ax: 31, ay: 17 }, p_duckling: { page: 1, x: 1882, y: 3, w: 62, h: 72, ax: 24, ay: 19 }, sil_duckling: { page: 1, x: 1947, y: 3, w: 62, h: 72, ax: 24, ay: 19 }, mp_flag: { page: 1, x: 3, y: 82, w: 50, h: 72, ax: 6, ay: 67 }, dc_pond: { page: 1, x: 56, y: 82, w: 191, h: 71, ax: 94, ay: 58 }, ic_upgrade: { page: 1, x: 250, y: 82, w: 64, h: 70, ax: 32, ay: 36 }, ic_skill_magnet: { page: 1, x: 317, y: 82, w: 62, h: 70, ax: 31, ay: 35 }, a_otter_walk_0: { page: 1, x: 382, y: 82, w: 100, h: 69, ax: 60, ay: 68 }, a_otter_walk_2: { page: 1, x: 485, y: 82, w: 100, h: 69, ax: 60, ay: 68 }, a_otter_idle_0: { page: 1, x: 588, y: 82, w: 100, h: 69, ax: 60, ay: 66 }, a_otter_idle_1: { page: 1, x: 691, y: 82, w: 100, h: 69, ax: 60, ay: 66 }, a_otter_walk_1: { page: 1, x: 794, y: 82, w: 99, h: 69, ax: 59, ay: 66 }, a_otter_happy_0: { page: 1, x: 896, y: 82, w: 99, h: 69, ax: 59, ay: 66 }, a_otter_happy_2: { page: 1, x: 998, y: 82, w: 99, h: 69, ax: 59, ay: 84 }, a_otter_walk_3: { page: 1, x: 1100, y: 82, w: 97, h: 69, ax: 57, ay: 66 }, a_otter_happy_1: { page: 1, x: 1200, y: 82, w: 95, h: 69, ax: 55, ay: 78 }, ic_daily: { page: 1, x: 1298, y: 82, w: 68, h: 69, ax: 34, ay: 35 }, ic_gift: { page: 1, x: 1369, y: 82, w: 68, h: 69, ax: 34, ay: 35 }, ic_skill_splash: { page: 1, x: 1440, y: 82, w: 82, h: 68, ax: 41, ay: 35 }, ic_skill_range: { page: 1, x: 1525, y: 82, w: 78, h: 68, ax: 40, ay: 34 }, ic_up_range: { page: 1, x: 1606, y: 82, w: 76, h: 68, ax: 38, ay: 32 }, ic_home: { page: 1, x: 1685, y: 82, w: 72, h: 68, ax: 36, ay: 34 }, mk_joyknob: { page: 1, x: 1760, y: 82, w: 68, h: 68, ax: 34, ay: 34 }, ic_streak: { page: 1, x: 1831, y: 82, w: 68, h: 68, ax: 34, ay: 34 }, ic_lang: { page: 1, x: 1902, y: 82, w: 68, h: 68, ax: 34, ay: 34 }, ic_skill_shield: { page: 1, x: 1973, y: 82, w: 68, h: 68, ax: 34, ay: 34 }, ic_exit: { page: 1, x: 3, y: 157, w: 64, h: 68, ax: 30, ay: 34 }, ob_rock: { page: 1, x: 70, y: 157, w: 123, h: 67, ax: 60, ay: 57 }, a_otter_trapped_1: { page: 1, x: 196, y: 157, w: 100, h: 67, ax: 60, ay: 64 }, mk_arrow: { page: 1, x: 299, y: 157, w: 67, h: 67, ax: 33, ay: 34 }, ic_music: { page: 1, x: 369, y: 157, w: 56, h: 67, ax: 28, ay: 35 }, ic_skill_heal: { page: 1, x: 428, y: 157, w: 52, h: 67, ax: 26, ay: 28 }, ic_up_power: { page: 1, x: 483, y: 157, w: 84, h: 66, ax: 42, ay: 30 }, ic_gfx: { page: 1, x: 570, y: 157, w: 72, h: 66, ax: 36, ay: 32 }, ic_festival: { page: 1, x: 645, y: 157, w: 70, h: 66, ax: 35, ay: 31 }, ic_star: { page: 1, x: 718, y: 157, w: 69, h: 66, ax: 35, ay: 34 }, ic_star_empty: { page: 1, x: 790, y: 157, w: 69, h: 66, ax: 35, ay: 34 }, ob_log: { page: 1, x: 862, y: 157, w: 226, h: 65, ax: 112, ay: 55 }, a_otter_trapped_0: { page: 1, x: 1091, y: 157, w: 98, h: 65, ax: 58, ay: 62 }, p_otter: { page: 1, x: 1192, y: 157, w: 93, h: 65, ax: 54, ay: 10 }, sil_otter: { page: 1, x: 1288, y: 157, w: 93, h: 65, ax: 54, ay: 10 }, a_penguin_happy_1: { page: 1, x: 1384, y: 157, w: 55, h: 65, ax: 24, ay: 76 }, ob_bush: { page: 1, x: 1442, y: 157, w: 99, h: 64, ax: 51, ay: 56 }, mp_node_boss: { page: 1, x: 1544, y: 157, w: 88, h: 64, ax: 44, ay: 29 }, ic_skill_chain: { page: 1, x: 1635, y: 157, w: 81, h: 64, ax: 42, ay: 34 }, ic_up_splash: { page: 1, x: 1719, y: 157, w: 76, h: 64, ax: 38, ay: 32 }, ic_map: { page: 1, x: 1798, y: 157, w: 72, h: 64, ax: 36, ay: 32 }, p_mist: { page: 1, x: 1873, y: 157, w: 64, h: 64, ax: 32, ay: 32 }, ic_vibe: { page: 1, x: 1940, y: 157, w: 64, h: 64, ax: 32, ay: 32 }, ic_info: { page: 1, x: 3, y: 228, w: 64, h: 64, ax: 32, ay: 32 }, ic_coin: { page: 1, x: 70, y: 228, w: 64, h: 64, ax: 32, ay: 32 }, a_penguin_idle_1: { page: 1, x: 137, y: 228, w: 55, h: 64, ax: 26, ay: 63 }, border_bush: { page: 1, x: 195, y: 228, w: 98, h: 63, ax: 50, ay: 55 }, a_penguin_walk_1: { page: 1, x: 296, y: 228, w: 56, h: 63, ax: 24, ay: 62 }, a_penguin_trapped_0: { page: 1, x: 355, y: 228, w: 56, h: 63, ax: 27, ay: 62 }, a_penguin_walk_0: { page: 1, x: 414, y: 228, w: 55, h: 63, ax: 26, ay: 64 }, a_penguin_walk_2: { page: 1, x: 472, y: 228, w: 55, h: 63, ax: 26, ay: 64 }, a_penguin_walk_3: { page: 1, x: 530, y: 228, w: 55, h: 63, ax: 28, ay: 62 }, a_penguin_idle_0: { page: 1, x: 588, y: 228, w: 55, h: 63, ax: 26, ay: 62 }, a_penguin_happy_2: { page: 1, x: 646, y: 228, w: 55, h: 63, ax: 27, ay: 80 }, a_penguin_trapped_1: { page: 1, x: 704, y: 228, w: 55, h: 63, ax: 25, ay: 62 }, ic_skill_trail: { page: 1, x: 762, y: 228, w: 72, h: 62, ax: 34, ay: 32 }, a_bunny_sleep_0: { page: 1, x: 837, y: 228, w: 60, h: 62, ax: 33, ay: 54 }, a_bunny_sleep_1: { page: 1, x: 900, y: 228, w: 60, h: 62, ax: 33, ay: 54 }, a_squirrel_sleep_0: { page: 1, x: 963, y: 228, w: 56, h: 62, ax: 31, ay: 54 }, a_squirrel_sleep_1: { page: 1, x: 1022, y: 228, w: 56, h: 62, ax: 31, ay: 54 }, a_chick_walk_0: { page: 1, x: 1081, y: 228, w: 52, h: 62, ax: 24, ay: 63 }, a_chick_walk_2: { page: 1, x: 1136, y: 228, w: 52, h: 62, ax: 24, ay: 63 }, a_chick_sleep_1: { page: 1, x: 1191, y: 228, w: 52, h: 62, ax: 24, ay: 60 }, a_chick_happy_0: { page: 1, x: 1246, y: 228, w: 53, h: 61, ax: 25, ay: 60 }, a_chick_walk_1: { page: 1, x: 1302, y: 228, w: 52, h: 61, ax: 22, ay: 60 }, a_chick_walk_3: { page: 1, x: 1357, y: 228, w: 52, h: 61, ax: 26, ay: 60 }, a_chick_idle_0: { page: 1, x: 1412, y: 228, w: 52, h: 61, ax: 24, ay: 60 }, a_chick_idle_1: { page: 1, x: 1467, y: 228, w: 52, h: 61, ax: 24, ay: 60 }, a_chick_happy_2: { page: 1, x: 1522, y: 228, w: 52, h: 61, ax: 25, ay: 78 }, a_chick_sleep_0: { page: 1, x: 1577, y: 228, w: 52, h: 61, ax: 24, ay: 60 }, a_chick_trapped_0: { page: 1, x: 1632, y: 228, w: 52, h: 61, ax: 25, ay: 60 }, ic_lock: { page: 1, x: 1687, y: 228, w: 52, h: 61, ax: 26, ay: 29 }, a_chick_happy_1: { page: 1, x: 1742, y: 228, w: 51, h: 61, ax: 22, ay: 72 }, a_chick_trapped_1: { page: 1, x: 1796, y: 228, w: 51, h: 61, ax: 23, ay: 60 }, gun_6: { page: 1, x: 1850, y: 228, w: 138, h: 60, ax: 26, ay: 36 }, ic_skill_speed: { page: 1, x: 3, y: 295, w: 71, h: 60, ax: 40, ay: 30 }, ic_sfx: { page: 1, x: 77, y: 295, w: 68, h: 60, ax: 32, ay: 30 }, ic_back: { page: 1, x: 148, y: 295, w: 62, h: 60, ax: 32, ay: 30 }, ic_arrow: { page: 1, x: 213, y: 295, w: 62, h: 60, ax: 30, ay: 30 }, dc_ball: { page: 1, x: 278, y: 295, w: 60, h: 60, ax: 30, ay: 56 }, a_penguin_happy_0: { page: 1, x: 341, y: 295, w: 56, h: 60, ax: 27, ay: 59 }, ic_play: { page: 1, x: 400, y: 295, w: 52, h: 60, ax: 20, ay: 30 }, dc_flowers: { page: 1, x: 455, y: 295, w: 136, h: 59, ax: 68, ay: 45 }, ic_reset: { page: 1, x: 594, y: 295, w: 62, h: 59, ax: 32, ay: 28 }, ic_paw: { page: 1, x: 659, y: 295, w: 60, h: 59, ax: 30, ay: 31 }, p_penguin: { page: 1, x: 722, y: 295, w: 53, h: 59, ax: 23, ay: 6 }, sil_penguin: { page: 1, x: 778, y: 295, w: 53, h: 59, ax: 23, ay: 6 }, p_chick: { page: 1, x: 834, y: 295, w: 49, h: 58, ax: 21, ay: 5 }, sil_chick: { page: 1, x: 886, y: 295, w: 49, h: 58, ax: 21, ay: 5 }, ob_fence: { page: 1, x: 938, y: 295, w: 308, h: 57, ax: 154, ay: 49 }, mk_help: { page: 1, x: 1249, y: 295, w: 64, h: 56, ax: 32, ay: 54 }, ic_pause: { page: 1, x: 1316, y: 295, w: 48, h: 56, ax: 24, ay: 28 }, fx_splash_0: { page: 1, x: 1367, y: 295, w: 68, h: 55, ax: 34, ay: 37 }, a_frog_happy_1: { page: 1, x: 1438, y: 295, w: 66, h: 55, ax: 33, ay: 62 }, dc_cushion: { page: 1, x: 1507, y: 295, w: 128, h: 54, ax: 64, ay: 44 }, mp_node: { page: 1, x: 1638, y: 295, w: 72, h: 54, ax: 36, ay: 24 }, a_frog_idle_1: { page: 1, x: 1713, y: 295, w: 68, h: 54, ax: 34, ay: 50 }, a_frog_sleep_1: { page: 1, x: 1784, y: 295, w: 68, h: 54, ax: 34, ay: 50 }, a_penguin_sleep_1: { page: 1, x: 1855, y: 295, w: 55, h: 54, ax: 26, ay: 53 }, ic_close: { page: 1, x: 1913, y: 295, w: 54, h: 54, ax: 27, ay: 27 }, pack_2: { page: 1, x: 1970, y: 295, w: 44, h: 54, ax: 25, ay: 30 }, a_frog_happy_0: { page: 1, x: 3, y: 358, w: 72, h: 53, ax: 36, ay: 50 }, a_frog_walk_0: { page: 1, x: 78, y: 358, w: 68, h: 53, ax: 34, ay: 52 }, a_frog_walk_1: { page: 1, x: 149, y: 358, w: 68, h: 53, ax: 34, ay: 50 }, a_frog_walk_2: { page: 1, x: 220, y: 358, w: 68, h: 53, ax: 34, ay: 52 }, a_frog_walk_3: { page: 1, x: 291, y: 358, w: 68, h: 53, ax: 34, ay: 50 }, a_frog_idle_0: { page: 1, x: 362, y: 358, w: 68, h: 53, ax: 34, ay: 50 }, a_frog_happy_2: { page: 1, x: 433, y: 358, w: 68, h: 53, ax: 34, ay: 68 }, a_frog_sleep_0: { page: 1, x: 504, y: 358, w: 68, h: 53, ax: 34, ay: 50 }, a_frog_trapped_0: { page: 1, x: 575, y: 358, w: 68, h: 53, ax: 34, ay: 50 }, a_frog_trapped_1: { page: 1, x: 646, y: 358, w: 68, h: 53, ax: 34, ay: 50 }, pack_1: { page: 1, x: 717, y: 358, w: 34, h: 53, ax: 19, ay: 31 }, ic_check: { page: 1, x: 754, y: 358, w: 66, h: 52, ax: 32, ay: 26 }, ic_skill_vitality: { page: 1, x: 823, y: 358, w: 66, h: 52, ax: 30, ay: 18 }, a_penguin_sleep_0: { page: 1, x: 892, y: 358, w: 55, h: 52, ax: 26, ay: 52 }, m_mini_normal: { page: 1, x: 950, y: 358, w: 79, h: 51, ax: 40, ay: 47 }, m_mini_hit: { page: 1, x: 1032, y: 358, w: 79, h: 51, ax: 40, ay: 47 }, m_mini_charge: { page: 1, x: 1114, y: 358, w: 79, h: 51, ax: 40, ay: 47 }, gun_2: { page: 1, x: 1196, y: 358, w: 70, h: 51, ax: 10, ay: 35 }, ic_up_health: { page: 1, x: 1269, y: 358, w: 66, h: 51, ax: 30, ay: 17 }, ic_skill_pierce: { page: 1, x: 1338, y: 358, w: 86, h: 50, ax: 43, ay: 23 }, ic_crown: { page: 1, x: 1427, y: 358, w: 72, h: 50, ax: 36, ay: 28 }, a_otter_sleep_0: { page: 1, x: 1502, y: 358, w: 65, h: 50, ax: 33, ay: 31 }, a_otter_sleep_1: { page: 1, x: 1570, y: 358, w: 65, h: 50, ax: 33, ay: 31 }, p_frog: { page: 1, x: 1638, y: 358, w: 64, h: 50, ax: 30, ay: -5 }, sil_frog: { page: 1, x: 1705, y: 358, w: 64, h: 50, ax: 30, ay: -5 }, a_fox_sleep_0: { page: 1, x: 1772, y: 358, w: 63, h: 49, ax: 34, ay: 40 }, a_fox_sleep_1: { page: 1, x: 1838, y: 358, w: 63, h: 49, ax: 34, ay: 40 }, ob_stump: { page: 1, x: 1904, y: 358, w: 60, h: 49, ax: 30, ay: 39 }, a_kitten_sleep_0: { page: 1, x: 1967, y: 358, w: 58, h: 49, ax: 32, ay: 39 }, a_kitten_sleep_1: { page: 1, x: 3, y: 414, w: 58, h: 49, ax: 32, ay: 39 }, ic_heart: { page: 1, x: 64, y: 414, w: 56, h: 49, ax: 28, ay: 20 }, shadow: { page: 1, x: 123, y: 414, w: 120, h: 48, ax: 60, ay: 24 }, gun_1: { page: 1, x: 246, y: 414, w: 68, h: 48, ax: 10, ay: 29 }, mk_excl: { page: 1, x: 317, y: 414, w: 48, h: 48, ax: 24, ay: 52 }, sh_basket: { page: 1, x: 368, y: 414, w: 80, h: 47, ax: 40, ay: 37 }, fx_impact_3: { page: 1, x: 451, y: 414, w: 61, h: 47, ax: 30, ay: 34 }, mk_zzz: { page: 1, x: 515, y: 414, w: 41, h: 46, ax: 17, ay: 49 }, ob_driftwood: { page: 1, x: 559, y: 414, w: 233, h: 45, ax: 116, ay: 44 }, a_hedgehog_sleep_0: { page: 1, x: 795, y: 414, w: 75, h: 45, ax: 39, ay: 40 }, a_hedgehog_sleep_1: { page: 1, x: 873, y: 414, w: 75, h: 45, ax: 39, ay: 40 }, a_piglet_sleep_0: { page: 1, x: 951, y: 414, w: 63, h: 45, ax: 34, ay: 38 }, a_piglet_sleep_1: { page: 1, x: 1017, y: 414, w: 63, h: 45, ax: 34, ay: 38 }, gun_5: { page: 1, x: 1083, y: 414, w: 102, h: 44, ax: 18, ay: 26 }, a_puppy_sleep_0: { page: 1, x: 1188, y: 414, w: 66, h: 44, ax: 37, ay: 35 }, a_puppy_sleep_1: { page: 1, x: 1257, y: 414, w: 66, h: 44, ax: 37, ay: 35 }, a_panda_sleep_0: { page: 1, x: 1326, y: 414, w: 65, h: 44, ax: 35, ay: 37 }, a_panda_sleep_1: { page: 1, x: 1394, y: 414, w: 65, h: 44, ax: 35, ay: 37 }, goo_drop_0: { page: 1, x: 1462, y: 414, w: 40, h: 44, ax: 20, ay: 22 }, gun_4: { page: 1, x: 1505, y: 414, w: 121, h: 43, ax: 43, ay: 23 }, a_turtle_walk_0: { page: 1, x: 1629, y: 414, w: 83, h: 43, ax: 34, ay: 47 }, a_turtle_walk_1: { page: 1, x: 1715, y: 414, w: 83, h: 43, ax: 34, ay: 45 }, a_turtle_walk_2: { page: 1, x: 1801, y: 414, w: 83, h: 43, ax: 34, ay: 47 }, a_turtle_walk_3: { page: 1, x: 1887, y: 414, w: 83, h: 43, ax: 34, ay: 45 }, a_turtle_idle_0: { page: 1, x: 3, y: 466, w: 83, h: 43, ax: 34, ay: 45 }, a_turtle_idle_1: { page: 1, x: 89, y: 466, w: 83, h: 43, ax: 34, ay: 45 }, a_turtle_happy_0: { page: 1, x: 175, y: 466, w: 83, h: 43, ax: 34, ay: 45 }, a_turtle_happy_1: { page: 1, x: 261, y: 466, w: 83, h: 43, ax: 34, ay: 57 }, a_turtle_happy_2: { page: 1, x: 347, y: 466, w: 83, h: 43, ax: 34, ay: 63 }, a_turtle_trapped_0: { page: 1, x: 433, y: 466, w: 83, h: 43, ax: 34, ay: 45 }, a_turtle_trapped_1: { page: 1, x: 519, y: 466, w: 83, h: 43, ax: 34, ay: 45 }, dc_bowl: { page: 1, x: 605, y: 466, w: 80, h: 43, ax: 40, ay: 37 }, gun_0: { page: 1, x: 688, y: 466, w: 51, h: 43, ax: 9, ay: 25 }, a_turtle_sleep_0: { page: 1, x: 742, y: 466, w: 68, h: 42, ax: 34, ay: 45 }, a_turtle_sleep_1: { page: 1, x: 813, y: 466, w: 68, h: 42, ax: 34, ay: 45 }, ic_goo: { page: 1, x: 884, y: 466, w: 60, h: 42, ax: 30, ay: 14 }, p_turtle: { page: 1, x: 947, y: 466, w: 78, h: 41, ax: 30, ay: -10 }, sil_turtle: { page: 1, x: 1028, y: 466, w: 78, h: 41, ax: 30, ay: -10 }, a_lamb_sleep_0: { page: 1, x: 1109, y: 466, w: 64, h: 41, ax: 35, ay: 35 }, a_lamb_sleep_1: { page: 1, x: 1176, y: 466, w: 64, h: 41, ax: 35, ay: 35 }, a_fawn_sleep_0: { page: 1, x: 1243, y: 466, w: 63, h: 41, ax: 36, ay: 32 }, a_fawn_sleep_1: { page: 1, x: 1309, y: 466, w: 63, h: 41, ax: 36, ay: 32 }, fx_impact_2: { page: 1, x: 1375, y: 466, w: 45, h: 41, ax: 18, ay: 29 }, p_coin_2: { page: 1, x: 1423, y: 466, w: 10, h: 40, ax: 5, ay: 20 }, ic_eye: { page: 1, x: 1436, y: 466, w: 72, h: 38, ax: 36, ay: 19 }, goo_drop_1: { page: 1, x: 1511, y: 466, w: 45, h: 38, ax: 23, ay: 19 }, fx_impact_1: { page: 1, x: 1559, y: 466, w: 39, h: 38, ax: 23, ay: 27 }, p_sparkle_1: { page: 1, x: 1601, y: 466, w: 38, h: 38, ax: 19, ay: 19 }, gun_3: { page: 1, x: 1642, y: 466, w: 107, h: 37, ax: 36, ay: 19 }, p_xp: { page: 1, x: 1752, y: 466, w: 36, h: 36, ax: 18, ay: 18 }, p_coin_1: { page: 1, x: 1791, y: 466, w: 26, h: 36, ax: 13, ay: 18 }, p_coin_3: { page: 1, x: 1820, y: 466, w: 26, h: 36, ax: 13, ay: 18 }, fx_impact_0: { page: 1, x: 1849, y: 466, w: 36, h: 34, ax: 14, ay: 24 }, p_bubble: { page: 1, x: 1888, y: 466, w: 36, h: 34, ax: 18, ay: 17 }, p_star: { page: 1, x: 1927, y: 466, w: 36, h: 34, ax: 18, ay: 17 }, p_coin_0: { page: 1, x: 1966, y: 466, w: 34, h: 34, ax: 17, ay: 17 }, pack_0: { page: 1, x: 2003, y: 466, w: 28, h: 34, ax: 15, ay: 18 }, p_heal: { page: 1, x: 3, y: 512, w: 28, h: 34, ax: 14, ay: 16 }, p_sparkle_2: { page: 1, x: 34, y: 512, w: 32, h: 32, ax: 16, ay: 16 }, d_mushroom: { page: 1, x: 69, y: 512, w: 30, h: 31, ax: 15, ay: 28 }, p_sparkle_0: { page: 1, x: 102, y: 512, w: 28, h: 28, ax: 14, ay: 14 }, p_heart: { page: 1, x: 133, y: 512, w: 30, h: 26, ax: 15, ay: 11 }, d_flower_0: { page: 1, x: 166, y: 512, w: 22, h: 26, ax: 11, ay: 25 }, d_flower_1: { page: 1, x: 191, y: 512, w: 22, h: 26, ax: 11, ay: 25 }, d_flower_2: { page: 1, x: 216, y: 512, w: 22, h: 26, ax: 11, ay: 25 }, d_flower_3: { page: 1, x: 241, y: 512, w: 22, h: 26, ax: 11, ay: 25 }, d_flower_4: { page: 1, x: 266, y: 512, w: 22, h: 26, ax: 11, ay: 25 }, p_dust: { page: 1, x: 291, y: 512, w: 35, h: 24, ax: 17, ay: 13 }, d_tuft: { page: 1, x: 329, y: 512, w: 28, h: 24, ax: 13, ay: 21 }, p_water: { page: 1, x: 360, y: 512, w: 18, h: 24, ax: 9, ay: 12 }, d_shell: { page: 1, x: 381, y: 512, w: 26, h: 23, ax: 13, ay: 20 }, d_clover: { page: 1, x: 410, y: 512, w: 22, h: 22, ax: 11, ay: 18 }, d_pebble_0: { page: 1, x: 435, y: 512, w: 24, h: 20, ax: 12, ay: 15 }, p_goo_violet: { page: 1, x: 462, y: 512, w: 20, h: 20, ax: 10, ay: 10 }, p_goo_pink: { page: 1, x: 485, y: 512, w: 20, h: 20, ax: 10, ay: 10 }, p_goo_amber: { page: 1, x: 508, y: 512, w: 20, h: 20, ax: 10, ay: 10 }, p_goo_indigo: { page: 1, x: 531, y: 512, w: 20, h: 20, ax: 10, ay: 10 }, p_goo_plum: { page: 1, x: 554, y: 512, w: 20, h: 20, ax: 10, ay: 10 }, p_goo_teal: { page: 1, x: 577, y: 512, w: 20, h: 20, ax: 10, ay: 10 }, p_goo_berry: { page: 1, x: 600, y: 512, w: 20, h: 20, ax: 10, ay: 10 }, p_goo_royal: { page: 1, x: 623, y: 512, w: 20, h: 20, ax: 10, ay: 10 }, d_pebble_1: { page: 1, x: 646, y: 512, w: 24, h: 19, ax: 12, ay: 14 }, d_leaf: { page: 1, x: 673, y: 512, w: 26, h: 18, ax: 13, ay: 11 }, p_petal: { page: 1, x: 702, y: 512, w: 16, h: 14, ax: 8, ay: 7 }, p_water_s: { page: 1, x: 721, y: 512, w: 10, h: 14, ax: 5, ay: 7 }, p_conf_0: { page: 1, x: 734, y: 512, w: 16, h: 12, ax: 8, ay: 6 }, p_conf_1: { page: 1, x: 753, y: 512, w: 16, h: 12, ax: 8, ay: 6 }, p_conf_2: { page: 1, x: 772, y: 512, w: 16, h: 12, ax: 8, ay: 6 }, p_conf_3: { page: 1, x: 791, y: 512, w: 16, h: 12, ax: 8, ay: 6 }, p_conf_4: { page: 1, x: 810, y: 512, w: 16, h: 12, ax: 8, ay: 6 } } }, tiles: { pages: ["tiles-0.png"], frames: { g_0: { page: 0, x: 3, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, g_1: { page: 0, x: 102, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, g_2: { page: 0, x: 201, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, g_3: { page: 0, x: 300, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_1: { page: 0, x: 399, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_2: { page: 0, x: 498, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_3: { page: 0, x: 597, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_4: { page: 0, x: 696, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_5: { page: 0, x: 795, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_6: { page: 0, x: 894, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_7: { page: 0, x: 993, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_8: { page: 0, x: 1092, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_9: { page: 0, x: 1191, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_10: { page: 0, x: 1290, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_11: { page: 0, x: 1389, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_12: { page: 0, x: 1488, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_13: { page: 0, x: 1587, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_14: { page: 0, x: 1686, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_path_15: { page: 0, x: 1785, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_water_1: { page: 0, x: 1884, y: 3, w: 96, h: 96, ax: 0, ay: 0 }, t_water_2: { page: 0, x: 3, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_3: { page: 0, x: 102, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_4: { page: 0, x: 201, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_5: { page: 0, x: 300, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_6: { page: 0, x: 399, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_7: { page: 0, x: 498, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_8: { page: 0, x: 597, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_9: { page: 0, x: 696, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_10: { page: 0, x: 795, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_11: { page: 0, x: 894, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_12: { page: 0, x: 993, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_13: { page: 0, x: 1092, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_14: { page: 0, x: 1191, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_water_15: { page: 0, x: 1290, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_1: { page: 0, x: 1389, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_2: { page: 0, x: 1488, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_3: { page: 0, x: 1587, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_4: { page: 0, x: 1686, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_5: { page: 0, x: 1785, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_6: { page: 0, x: 1884, y: 102, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_7: { page: 0, x: 3, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_8: { page: 0, x: 102, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_9: { page: 0, x: 201, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_10: { page: 0, x: 300, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_11: { page: 0, x: 399, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_12: { page: 0, x: 498, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_13: { page: 0, x: 597, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_14: { page: 0, x: 696, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_sand_15: { page: 0, x: 795, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_1: { page: 0, x: 894, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_2: { page: 0, x: 993, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_3: { page: 0, x: 1092, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_4: { page: 0, x: 1191, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_5: { page: 0, x: 1290, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_6: { page: 0, x: 1389, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_7: { page: 0, x: 1488, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_8: { page: 0, x: 1587, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_9: { page: 0, x: 1686, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_10: { page: 0, x: 1785, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_11: { page: 0, x: 1884, y: 201, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_12: { page: 0, x: 3, y: 300, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_13: { page: 0, x: 102, y: 300, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_14: { page: 0, x: 201, y: 300, w: 96, h: 96, ax: 0, ay: 0 }, t_cobble_15: { page: 0, x: 300, y: 300, w: 96, h: 96, ax: 0, ay: 0 } } } }, points: { gun_0: { muzzle: [39, -2] }, gun_1: { muzzle: [55, -3] }, gun_2: { muzzle: [57, -6] }, gun_3: { muzzle: [66, -3] }, gun_4: { muzzle: [75, -2] }, gun_5: { muzzle: [80, -4] }, gun_6: { muzzle: [106, -6] } }, trim: { kid_idle_0: { ox: 44, oy: 46, ow: 156, oh: 194 }, kid_idle_1: { ox: 44, oy: 44, ow: 156, oh: 194 }, kid_idle_2: { ox: 44, oy: 42, ow: 156, oh: 194 }, kid_idle_3: { ox: 44, oy: 44, ow: 156, oh: 194 }, kid_run_0: { ox: 48, oy: 43, ow: 156, oh: 194 }, kid_run_1: { ox: 48, oy: 45, ow: 156, oh: 194 }, kid_run_2: { ox: 48, oy: 45, ow: 156, oh: 194 }, kid_run_3: { ox: 48, oy: 43, ow: 156, oh: 194 }, kid_run_4: { ox: 48, oy: 45, ow: 156, oh: 194 }, kid_run_5: { ox: 48, oy: 45, ow: 156, oh: 194 }, kid_shoot_0: { ox: 44, oy: 46, ow: 156, oh: 194 }, kid_shoot_1: { ox: 44, oy: 49, ow: 156, oh: 194 }, kid_hurt_0: { ox: 32, oy: 55, ow: 156, oh: 194 }, kid_win_0: { ox: 26, oy: 55, ow: 156, oh: 194 }, kid_win_1: { ox: 29, oy: 32, ow: 156, oh: 194 }, kid_win_2: { ox: 29, oy: 26, ow: 156, oh: 194 }, kid_win_3: { ox: 29, oy: 34, ow: 156, oh: 194 }, kid_sad_0: { ox: 30, oy: 53, ow: 156, oh: 194 }, kid_sad_1: { ox: 30, oy: 54, ow: 156, oh: 194 }, gun_0: { ox: 19, oy: 7, ow: 74, oh: 60 }, gun_1: { ox: 20, oy: 7, ow: 94, oh: 68 }, gun_2: { ox: 22, oy: 4, ow: 100, oh: 74 }, gun_3: { ox: 22, oy: 22, ow: 140, oh: 78 }, gun_4: { ox: 23, oy: 20, ow: 156, oh: 82 }, gun_5: { ox: 22, oy: 22, ow: 140, oh: 92 }, gun_6: { ox: 24, oy: 22, ow: 176, oh: 112 }, pack_0: { ox: 15, oy: 22, ow: 60, oh: 70 }, pack_1: { ox: 11, oy: 9, ow: 60, oh: 70 }, pack_2: { ox: 5, oy: 10, ow: 60, oh: 70 }, m_blob_normal: { ox: 12, oy: 48, ow: 140, oh: 150 }, m_blob_hit: { ox: 12, oy: 48, ow: 140, oh: 150 }, m_blob_charge: { ox: 12, oy: 48, ow: 140, oh: 150 }, m_mini_normal: { ox: 8, oy: 37, ow: 96, oh: 96 }, m_mini_hit: { ox: 8, oy: 37, ow: 96, oh: 96 }, m_mini_charge: { ox: 8, oy: 37, ow: 96, oh: 96 }, m_spitter_normal: { ox: 14, oy: 57, ow: 140, oh: 160 }, m_spitter_hit: { ox: 14, oy: 57, ow: 140, oh: 160 }, m_spitter_charge: { ox: 14, oy: 57, ow: 140, oh: 160 }, m_splitter_normal: { ox: 9, oy: 63, ow: 160, oh: 160 }, m_splitter_hit: { ox: 9, oy: 63, ow: 160, oh: 160 }, m_splitter_charge: { ox: 9, oy: 63, ow: 160, oh: 160 }, m_dasher_normal: { ox: 16, oy: 57, ow: 160, oh: 160 }, m_dasher_hit: { ox: 16, oy: 57, ow: 160, oh: 160 }, m_dasher_charge: { ox: 16, oy: 57, ow: 160, oh: 160 }, m_chunky_normal: { ox: 18, oy: 95, ow: 244, oh: 232 }, m_chunky_hit: { ox: 18, oy: 95, ow: 244, oh: 232 }, m_chunky_charge: { ox: 18, oy: 95, ow: 244, oh: 232 }, m_nest_normal: { ox: 4, oy: 59, ow: 210, oh: 170 }, m_nest_hit: { ox: 4, oy: 59, ow: 210, oh: 170 }, m_nest_charge: { ox: 4, oy: 50, ow: 210, oh: 170 }, m_jumper_normal: { ox: 16, oy: 59, ow: 150, oh: 180 }, m_jumper_hit: { ox: 16, oy: 59, ow: 150, oh: 180 }, m_jumper_charge: { ox: 16, oy: 59, ow: 150, oh: 180 }, m_flyer_normal_0: { ox: 8, oy: 38, ow: 180, oh: 140 }, m_flyer_normal_1: { ox: 14, oy: 38, ow: 180, oh: 140 }, m_flyer_hit_0: { ox: 8, oy: 38, ow: 180, oh: 140 }, m_flyer_hit_1: { ox: 14, oy: 38, ow: 180, oh: 140 }, m_flyer_charge_0: { ox: 8, oy: 38, ow: 180, oh: 140 }, m_flyer_charge_1: { ox: 14, oy: 38, ow: 180, oh: 140 }, m_boss_forest_normal: { ox: 43, oy: 130, ow: 420, oh: 452 }, m_boss_forest_hit: { ox: 43, oy: 130, ow: 420, oh: 452 }, m_boss_forest_charge: { ox: 43, oy: 130, ow: 420, oh: 452 }, m_boss_village_normal: { ox: 43, oy: 118, ow: 420, oh: 452 }, m_boss_village_hit: { ox: 43, oy: 118, ow: 420, oh: 452 }, m_boss_village_charge: { ox: 43, oy: 118, ow: 420, oh: 452 }, m_boss_lake_normal: { ox: 43, oy: 127, ow: 420, oh: 452 }, m_boss_lake_hit: { ox: 43, oy: 127, ow: 420, oh: 452 }, m_boss_lake_charge: { ox: 43, oy: 127, ow: 420, oh: 452 }, goo_drop_0: { ox: 4, oy: 2, ow: 48, oh: 48 }, goo_drop_1: { ox: 1, oy: 5, ow: 48, oh: 48 }, cocoon_0: { ox: 8, oy: 45, ow: 150, oh: 150 }, cocoon_1: { ox: 8, oy: 45, ow: 150, oh: 150 }, cocoon_2: { ox: 9, oy: 45, ow: 150, oh: 150 }, goostamp_0: { ox: 9, oy: 19, ow: 260, oh: 260 }, goostamp_1: { ox: 9, oy: 6, ow: 260, oh: 260 }, goostamp_2: { ox: 15, oy: 13, ow: 260, oh: 260 }, goostamp_3: { ox: 16, oy: 19, ow: 260, oh: 260 }, brush: { ox: 0, oy: 0, ow: 128, oh: 128 }, gate_goo: { ox: 15, oy: 18, ow: 180, oh: 110 }, a_puppy_walk_0: { ox: 40, oy: 50, ow: 150, oh: 152 }, a_puppy_walk_1: { ox: 43, oy: 52, ow: 150, oh: 152 }, a_puppy_walk_2: { ox: 40, oy: 50, ow: 150, oh: 152 }, a_puppy_walk_3: { ox: 37, oy: 52, ow: 150, oh: 152 }, a_puppy_idle_0: { ox: 40, oy: 52, ow: 150, oh: 152 }, a_puppy_idle_1: { ox: 42, oy: 52, ow: 150, oh: 152 }, a_puppy_happy_0: { ox: 43, oy: 52, ow: 150, oh: 152 }, a_puppy_happy_1: { ox: 36, oy: 40, ow: 150, oh: 152 }, a_puppy_happy_2: { ox: 43, oy: 34, ow: 150, oh: 152 }, a_puppy_sleep_0: { ox: 37, oy: 93, ow: 150, oh: 152 }, a_puppy_sleep_1: { ox: 37, oy: 93, ow: 150, oh: 152 }, a_puppy_trapped_0: { ox: 38, oy: 56, ow: 150, oh: 152 }, a_puppy_trapped_1: { ox: 42, oy: 54, ow: 150, oh: 152 }, p_puppy: { ox: 30, oy: 41, ow: 120, oh: 120 }, a_bunny_walk_0: { ox: 41, oy: 29, ow: 150, oh: 152 }, a_bunny_walk_1: { ox: 41, oy: 31, ow: 150, oh: 152 }, a_bunny_walk_2: { ox: 41, oy: 29, ow: 150, oh: 152 }, a_bunny_walk_3: { ox: 41, oy: 31, ow: 150, oh: 152 }, a_bunny_idle_0: { ox: 41, oy: 32, ow: 150, oh: 152 }, a_bunny_idle_1: { ox: 41, oy: 32, ow: 150, oh: 152 }, a_bunny_happy_0: { ox: 42, oy: 31, ow: 150, oh: 152 }, a_bunny_happy_1: { ox: 41, oy: 19, ow: 150, oh: 152 }, a_bunny_happy_2: { ox: 41, oy: 13, ow: 150, oh: 152 }, a_bunny_sleep_0: { ox: 41, oy: 74, ow: 150, oh: 152 }, a_bunny_sleep_1: { ox: 41, oy: 74, ow: 150, oh: 152 }, a_bunny_trapped_0: { ox: 41, oy: 36, ow: 150, oh: 152 }, a_bunny_trapped_1: { ox: 41, oy: 34, ow: 150, oh: 152 }, p_bunny: { ox: 31, oy: 21, ow: 120, oh: 120 }, a_squirrel_walk_0: { ox: 31, oy: 43, ow: 150, oh: 152 }, a_squirrel_walk_1: { ox: 37, oy: 45, ow: 150, oh: 152 }, a_squirrel_walk_2: { ox: 31, oy: 43, ow: 150, oh: 152 }, a_squirrel_walk_3: { ox: 23, oy: 45, ow: 150, oh: 152 }, a_squirrel_idle_0: { ox: 31, oy: 45, ow: 150, oh: 152 }, a_squirrel_idle_1: { ox: 35, oy: 45, ow: 150, oh: 152 }, a_squirrel_happy_0: { ox: 39, oy: 45, ow: 150, oh: 152 }, a_squirrel_happy_1: { ox: 21, oy: 33, ow: 150, oh: 152 }, a_squirrel_happy_2: { ox: 37, oy: 27, ow: 150, oh: 152 }, a_squirrel_sleep_0: { ox: 43, oy: 74, ow: 150, oh: 152 }, a_squirrel_sleep_1: { ox: 43, oy: 74, ow: 150, oh: 152 }, a_squirrel_trapped_0: { ox: 26, oy: 49, ow: 150, oh: 152 }, a_squirrel_trapped_1: { ox: 35, oy: 47, ow: 150, oh: 152 }, p_squirrel: { ox: 22, oy: 34, ow: 120, oh: 120 }, a_fox_walk_0: { ox: 15, oy: 44, ow: 150, oh: 152 }, a_fox_walk_1: { ox: 23, oy: 46, ow: 150, oh: 152 }, a_fox_walk_2: { ox: 15, oy: 44, ow: 150, oh: 152 }, a_fox_walk_3: { ox: 10, oy: 46, ow: 150, oh: 152 }, a_fox_idle_0: { ox: 15, oy: 47, ow: 150, oh: 152 }, a_fox_idle_1: { ox: 20, oy: 47, ow: 150, oh: 152 }, a_fox_happy_0: { ox: 26, oy: 44, ow: 150, oh: 152 }, a_fox_happy_1: { ox: 9, oy: 32, ow: 150, oh: 152 }, a_fox_happy_2: { ox: 23, oy: 26, ow: 150, oh: 152 }, a_fox_sleep_0: { ox: 40, oy: 88, ow: 150, oh: 152 }, a_fox_sleep_1: { ox: 40, oy: 88, ow: 150, oh: 152 }, a_fox_trapped_0: { ox: 12, oy: 51, ow: 150, oh: 152 }, a_fox_trapped_1: { ox: 20, oy: 49, ow: 150, oh: 152 }, p_fox: { ox: 7, oy: 34, ow: 120, oh: 120 }, a_hedgehog_walk_0: { ox: 39, oy: 52, ow: 150, oh: 152 }, a_hedgehog_walk_1: { ox: 39, oy: 54, ow: 150, oh: 152 }, a_hedgehog_walk_2: { ox: 39, oy: 52, ow: 150, oh: 152 }, a_hedgehog_walk_3: { ox: 39, oy: 54, ow: 150, oh: 152 }, a_hedgehog_idle_0: { ox: 39, oy: 54, ow: 150, oh: 152 }, a_hedgehog_idle_1: { ox: 39, oy: 54, ow: 150, oh: 152 }, a_hedgehog_happy_0: { ox: 37, oy: 54, ow: 150, oh: 152 }, a_hedgehog_happy_1: { ox: 40, oy: 42, ow: 150, oh: 152 }, a_hedgehog_happy_2: { ox: 39, oy: 36, ow: 150, oh: 152 }, a_hedgehog_sleep_0: { ox: 35, oy: 88, ow: 150, oh: 152 }, a_hedgehog_sleep_1: { ox: 35, oy: 88, ow: 150, oh: 152 }, a_hedgehog_trapped_0: { ox: 39, oy: 58, ow: 150, oh: 152 }, a_hedgehog_trapped_1: { ox: 39, oy: 56, ow: 150, oh: 152 }, p_hedgehog: { ox: 29, oy: 43, ow: 120, oh: 120 }, a_fawn_walk_0: { ox: 43, oy: 49, ow: 150, oh: 152 }, a_fawn_walk_1: { ox: 45, oy: 52, ow: 150, oh: 152 }, a_fawn_walk_2: { ox: 43, oy: 49, ow: 150, oh: 152 }, a_fawn_walk_3: { ox: 42, oy: 52, ow: 150, oh: 152 }, a_fawn_idle_0: { ox: 43, oy: 52, ow: 150, oh: 152 }, a_fawn_idle_1: { ox: 45, oy: 52, ow: 150, oh: 152 }, a_fawn_happy_0: { ox: 46, oy: 50, ow: 150, oh: 152 }, a_fawn_happy_1: { ox: 41, oy: 38, ow: 150, oh: 152 }, a_fawn_happy_2: { ox: 45, oy: 32, ow: 150, oh: 152 }, a_fawn_sleep_0: { ox: 38, oy: 96, ow: 150, oh: 152 }, a_fawn_sleep_1: { ox: 38, oy: 96, ow: 150, oh: 152 }, a_fawn_trapped_0: { ox: 42, oy: 56, ow: 150, oh: 152 }, a_fawn_trapped_1: { ox: 45, oy: 54, ow: 150, oh: 152 }, p_fawn: { ox: 33, oy: 40, ow: 120, oh: 120 }, a_kitten_walk_0: { ox: 34, oy: 45, ow: 150, oh: 152 }, a_kitten_walk_1: { ox: 39, oy: 48, ow: 150, oh: 152 }, a_kitten_walk_2: { ox: 34, oy: 45, ow: 150, oh: 152 }, a_kitten_walk_3: { ox: 28, oy: 48, ow: 150, oh: 152 }, a_kitten_idle_0: { ox: 34, oy: 48, ow: 150, oh: 152 }, a_kitten_idle_1: { ox: 37, oy: 48, ow: 150, oh: 152 }, a_kitten_happy_0: { ox: 40, oy: 45, ow: 150, oh: 152 }, a_kitten_happy_1: { ox: 26, oy: 33, ow: 150, oh: 152 }, a_kitten_happy_2: { ox: 39, oy: 27, ow: 150, oh: 152 }, a_kitten_sleep_0: { ox: 42, oy: 89, ow: 150, oh: 152 }, a_kitten_sleep_1: { ox: 42, oy: 89, ow: 150, oh: 152 }, a_kitten_trapped_0: { ox: 30, oy: 52, ow: 150, oh: 152 }, a_kitten_trapped_1: { ox: 37, oy: 50, ow: 150, oh: 152 }, p_kitten: { ox: 24, oy: 35, ow: 120, oh: 120 }, a_duckling_walk_0: { ox: 47, oy: 50, ow: 150, oh: 152 }, a_duckling_walk_1: { ox: 49, oy: 53, ow: 150, oh: 152 }, a_duckling_walk_2: { ox: 47, oy: 50, ow: 150, oh: 152 }, a_duckling_walk_3: { ox: 45, oy: 52, ow: 150, oh: 152 }, a_duckling_idle_0: { ox: 47, oy: 52, ow: 150, oh: 152 }, a_duckling_idle_1: { ox: 47, oy: 52, ow: 150, oh: 152 }, a_duckling_happy_0: { ox: 46, oy: 52, ow: 150, oh: 152 }, a_duckling_happy_1: { ox: 49, oy: 41, ow: 150, oh: 152 }, a_duckling_happy_2: { ox: 46, oy: 34, ow: 150, oh: 152 }, a_duckling_sleep_0: { ox: 47, oy: 52, ow: 150, oh: 152 }, a_duckling_sleep_1: { ox: 47, oy: 52, ow: 150, oh: 152 }, a_duckling_trapped_0: { ox: 46, oy: 52, ow: 150, oh: 152 }, a_duckling_trapped_1: { ox: 48, oy: 52, ow: 150, oh: 152 }, p_duckling: { ox: 36, oy: 41, ow: 120, oh: 120 }, a_piglet_walk_0: { ox: 40, oy: 49, ow: 150, oh: 152 }, a_piglet_walk_1: { ox: 43, oy: 52, ow: 150, oh: 152 }, a_piglet_walk_2: { ox: 40, oy: 49, ow: 150, oh: 152 }, a_piglet_walk_3: { ox: 37, oy: 52, ow: 150, oh: 152 }, a_piglet_idle_0: { ox: 40, oy: 52, ow: 150, oh: 152 }, a_piglet_idle_1: { ox: 42, oy: 52, ow: 150, oh: 152 }, a_piglet_happy_0: { ox: 43, oy: 50, ow: 150, oh: 152 }, a_piglet_happy_1: { ox: 37, oy: 38, ow: 150, oh: 152 }, a_piglet_happy_2: { ox: 43, oy: 32, ow: 150, oh: 152 }, a_piglet_sleep_0: { ox: 40, oy: 90, ow: 150, oh: 152 }, a_piglet_sleep_1: { ox: 40, oy: 90, ow: 150, oh: 152 }, a_piglet_trapped_0: { ox: 38, oy: 56, ow: 150, oh: 152 }, a_piglet_trapped_1: { ox: 42, oy: 54, ow: 150, oh: 152 }, p_piglet: { ox: 30, oy: 40, ow: 120, oh: 120 }, a_lamb_walk_0: { ox: 39, oy: 47, ow: 150, oh: 152 }, a_lamb_walk_1: { ox: 40, oy: 50, ow: 150, oh: 152 }, a_lamb_walk_2: { ox: 39, oy: 47, ow: 150, oh: 152 }, a_lamb_walk_3: { ox: 39, oy: 50, ow: 150, oh: 152 }, a_lamb_idle_0: { ox: 39, oy: 50, ow: 150, oh: 152 }, a_lamb_idle_1: { ox: 39, oy: 50, ow: 150, oh: 152 }, a_lamb_happy_0: { ox: 40, oy: 50, ow: 150, oh: 152 }, a_lamb_happy_1: { ox: 39, oy: 38, ow: 150, oh: 152 }, a_lamb_happy_2: { ox: 40, oy: 32, ow: 150, oh: 152 }, a_lamb_sleep_0: { ox: 39, oy: 93, ow: 150, oh: 152 }, a_lamb_sleep_1: { ox: 39, oy: 93, ow: 150, oh: 152 }, a_lamb_trapped_0: { ox: 39, oy: 54, ow: 150, oh: 152 }, a_lamb_trapped_1: { ox: 39, oy: 52, ow: 150, oh: 152 }, p_lamb: { ox: 29, oy: 38, ow: 120, oh: 120 }, a_chick_walk_0: { ox: 50, oy: 65, ow: 150, oh: 152 }, a_chick_walk_1: { ox: 52, oy: 68, ow: 150, oh: 152 }, a_chick_walk_2: { ox: 50, oy: 65, ow: 150, oh: 152 }, a_chick_walk_3: { ox: 48, oy: 68, ow: 150, oh: 152 }, a_chick_idle_0: { ox: 50, oy: 68, ow: 150, oh: 152 }, a_chick_idle_1: { ox: 50, oy: 68, ow: 150, oh: 152 }, a_chick_happy_0: { ox: 49, oy: 68, ow: 150, oh: 152 }, a_chick_happy_1: { ox: 52, oy: 56, ow: 150, oh: 152 }, a_chick_happy_2: { ox: 49, oy: 50, ow: 150, oh: 152 }, a_chick_sleep_0: { ox: 50, oy: 68, ow: 150, oh: 152 }, a_chick_sleep_1: { ox: 50, oy: 68, ow: 150, oh: 152 }, a_chick_trapped_0: { ox: 49, oy: 68, ow: 150, oh: 152 }, a_chick_trapped_1: { ox: 51, oy: 68, ow: 150, oh: 152 }, p_chick: { ox: 39, oy: 55, ow: 120, oh: 120 }, a_otter_walk_0: { ox: 14, oy: 60, ow: 150, oh: 152 }, a_otter_walk_1: { ox: 15, oy: 62, ow: 150, oh: 152 }, a_otter_walk_2: { ox: 14, oy: 60, ow: 150, oh: 152 }, a_otter_walk_3: { ox: 17, oy: 62, ow: 150, oh: 152 }, a_otter_idle_0: { ox: 14, oy: 62, ow: 150, oh: 152 }, a_otter_idle_1: { ox: 14, oy: 62, ow: 150, oh: 152 }, a_otter_happy_0: { ox: 15, oy: 62, ow: 150, oh: 152 }, a_otter_happy_1: { ox: 19, oy: 50, ow: 150, oh: 152 }, a_otter_happy_2: { ox: 15, oy: 44, ow: 150, oh: 152 }, a_otter_sleep_0: { ox: 41, oy: 97, ow: 150, oh: 152 }, a_otter_sleep_1: { ox: 41, oy: 97, ow: 150, oh: 152 }, a_otter_trapped_0: { ox: 16, oy: 66, ow: 150, oh: 152 }, a_otter_trapped_1: { ox: 14, oy: 64, ow: 150, oh: 152 }, p_otter: { ox: 6, oy: 50, ow: 120, oh: 120 }, a_turtle_walk_0: { ox: 40, oy: 81, ow: 150, oh: 152 }, a_turtle_walk_1: { ox: 40, oy: 83, ow: 150, oh: 152 }, a_turtle_walk_2: { ox: 40, oy: 81, ow: 150, oh: 152 }, a_turtle_walk_3: { ox: 40, oy: 83, ow: 150, oh: 152 }, a_turtle_idle_0: { ox: 40, oy: 83, ow: 150, oh: 152 }, a_turtle_idle_1: { ox: 40, oy: 83, ow: 150, oh: 152 }, a_turtle_happy_0: { ox: 40, oy: 83, ow: 150, oh: 152 }, a_turtle_happy_1: { ox: 40, oy: 71, ow: 150, oh: 152 }, a_turtle_happy_2: { ox: 40, oy: 65, ow: 150, oh: 152 }, a_turtle_sleep_0: { ox: 40, oy: 83, ow: 150, oh: 152 }, a_turtle_sleep_1: { ox: 40, oy: 83, ow: 150, oh: 152 }, a_turtle_trapped_0: { ox: 40, oy: 83, ow: 150, oh: 152 }, a_turtle_trapped_1: { ox: 40, oy: 83, ow: 150, oh: 152 }, p_turtle: { ox: 30, oy: 70, ow: 120, oh: 120 }, a_frog_walk_0: { ox: 40, oy: 76, ow: 150, oh: 152 }, a_frog_walk_1: { ox: 40, oy: 78, ow: 150, oh: 152 }, a_frog_walk_2: { ox: 40, oy: 76, ow: 150, oh: 152 }, a_frog_walk_3: { ox: 40, oy: 78, ow: 150, oh: 152 }, a_frog_idle_0: { ox: 40, oy: 78, ow: 150, oh: 152 }, a_frog_idle_1: { ox: 40, oy: 78, ow: 150, oh: 152 }, a_frog_happy_0: { ox: 38, oy: 78, ow: 150, oh: 152 }, a_frog_happy_1: { ox: 41, oy: 66, ow: 150, oh: 152 }, a_frog_happy_2: { ox: 40, oy: 60, ow: 150, oh: 152 }, a_frog_sleep_0: { ox: 40, oy: 78, ow: 150, oh: 152 }, a_frog_sleep_1: { ox: 40, oy: 78, ow: 150, oh: 152 }, a_frog_trapped_0: { ox: 40, oy: 78, ow: 150, oh: 152 }, a_frog_trapped_1: { ox: 40, oy: 78, ow: 150, oh: 152 }, p_frog: { ox: 30, oy: 65, ow: 120, oh: 120 }, a_penguin_walk_0: { ox: 48, oy: 64, ow: 150, oh: 152 }, a_penguin_walk_1: { ox: 50, oy: 66, ow: 150, oh: 152 }, a_penguin_walk_2: { ox: 48, oy: 64, ow: 150, oh: 152 }, a_penguin_walk_3: { ox: 46, oy: 66, ow: 150, oh: 152 }, a_penguin_idle_0: { ox: 48, oy: 66, ow: 150, oh: 152 }, a_penguin_idle_1: { ox: 48, oy: 65, ow: 150, oh: 152 }, a_penguin_happy_0: { ox: 47, oy: 69, ow: 150, oh: 152 }, a_penguin_happy_1: { ox: 50, oy: 52, ow: 150, oh: 152 }, a_penguin_happy_2: { ox: 47, oy: 48, ow: 150, oh: 152 }, a_penguin_sleep_0: { ox: 48, oy: 76, ow: 150, oh: 152 }, a_penguin_sleep_1: { ox: 48, oy: 75, ow: 150, oh: 152 }, a_penguin_trapped_0: { ox: 47, oy: 66, ow: 150, oh: 152 }, a_penguin_trapped_1: { ox: 49, oy: 66, ow: 150, oh: 152 }, p_penguin: { ox: 37, oy: 54, ow: 120, oh: 120 }, a_panda_walk_0: { ox: 39, oy: 50, ow: 150, oh: 152 }, a_panda_walk_1: { ox: 42, oy: 53, ow: 150, oh: 152 }, a_panda_walk_2: { ox: 39, oy: 50, ow: 150, oh: 152 }, a_panda_walk_3: { ox: 36, oy: 53, ow: 150, oh: 152 }, a_panda_idle_0: { ox: 39, oy: 53, ow: 150, oh: 152 }, a_panda_idle_1: { ox: 41, oy: 53, ow: 150, oh: 152 }, a_panda_happy_0: { ox: 43, oy: 53, ow: 150, oh: 152 }, a_panda_happy_1: { ox: 35, oy: 41, ow: 150, oh: 152 }, a_panda_happy_2: { ox: 42, oy: 35, ow: 150, oh: 152 }, a_panda_sleep_0: { ox: 39, oy: 91, ow: 150, oh: 152 }, a_panda_sleep_1: { ox: 39, oy: 91, ow: 150, oh: 152 }, a_panda_trapped_0: { ox: 37, oy: 57, ow: 150, oh: 152 }, a_panda_trapped_1: { ox: 41, oy: 55, ow: 150, oh: 152 }, p_panda: { ox: 29, oy: 41, ow: 120, oh: 120 }, sil_puppy: { ox: 30, oy: 41, ow: 120, oh: 120 }, sil_bunny: { ox: 31, oy: 21, ow: 120, oh: 120 }, sil_squirrel: { ox: 22, oy: 34, ow: 120, oh: 120 }, sil_fox: { ox: 7, oy: 36, ow: 120, oh: 120 }, sil_hedgehog: { ox: 29, oy: 43, ow: 120, oh: 120 }, sil_fawn: { ox: 33, oy: 40, ow: 120, oh: 120 }, sil_kitten: { ox: 24, oy: 37, ow: 120, oh: 120 }, sil_duckling: { ox: 36, oy: 41, ow: 120, oh: 120 }, sil_piglet: { ox: 30, oy: 41, ow: 120, oh: 120 }, sil_lamb: { ox: 29, oy: 38, ow: 120, oh: 120 }, sil_chick: { ox: 39, oy: 55, ow: 120, oh: 120 }, sil_otter: { ox: 6, oy: 50, ow: 120, oh: 120 }, sil_turtle: { ox: 30, oy: 70, ow: 120, oh: 120 }, sil_frog: { ox: 30, oy: 65, ow: 120, oh: 120 }, sil_penguin: { ox: 37, oy: 54, ow: 120, oh: 120 }, sil_panda: { ox: 29, oy: 41, ow: 120, oh: 120 }, ob_tree: { ox: 18, oy: 32, ow: 170, oh: 200 }, ob_tree2: { ox: 15, oy: 33, ow: 170, oh: 200 }, ob_pine: { ox: 11, oy: 30, ow: 130, oh: 190 }, ob_bush: { ox: 9, oy: 22, ow: 120, oh: 90 }, ob_rock: { ox: 5, oy: 39, ow: 130, oh: 110 }, ob_boulder: { ox: 2, oy: 56, ow: 190, oh: 160 }, ob_stump: { ox: 10, oy: 17, ow: 80, oh: 70 }, ob_log: { ox: 13, oy: 19, ow: 250, oh: 90 }, ob_fence: { ox: 6, oy: 7, ow: 320, oh: 70 }, ob_fencev: { ox: 22, oy: 7, ow: 64, oh: 384 }, ob_house: { ox: 14, oy: 4, ow: 360, oh: 300 }, ob_house2: { ox: 14, oy: 4, ow: 360, oh: 300 }, ob_barrel: { ox: 8, oy: 3, ow: 76, oh: 90 }, ob_crate: { ox: 10, oy: 2, ow: 120, oh: 100 }, ob_hay: { ox: 8, oy: 12, ow: 140, oh: 100 }, ob_well: { ox: 11, oy: 8, ow: 170, oh: 196 }, ob_cart: { ox: 11, oy: 9, ow: 230, oh: 140 }, ob_reeds: { ox: 18, oy: 6, ow: 90, oh: 110 }, ob_shellrock: { ox: 7, oy: 37, ow: 140, oh: 120 }, ob_driftwood: { ox: 4, oy: 12, ow: 240, oh: 70 }, border_tree: { ox: 17, oy: 38, ow: 170, oh: 200 }, border_pine: { ox: 11, oy: 30, ow: 130, oh: 190 }, border_bush: { ox: 10, oy: 23, ow: 120, oh: 90 }, gate_posts: { ox: 18, oy: 10, ow: 280, oh: 200 }, ob_windmill: { ox: 16, oy: 41, ow: 210, oh: 300 }, mp_node: { ox: 12, oy: 16, ow: 96, oh: 70 }, mp_node_boss: { ox: 11, oy: 19, ow: 110, oh: 84 }, mp_flag: { ox: 42, oy: 13, ow: 96, oh: 92 }, mp_sign: { ox: 11, oy: 6, ow: 250, oh: 140 }, sh_house: { ox: 8, oy: 14, ow: 380, oh: 290 }, sh_basket: { ox: 5, oy: 3, ow: 90, oh: 50 }, d_flower_0: { ox: 9, oy: 9, ow: 40, oh: 40 }, d_flower_1: { ox: 9, oy: 9, ow: 40, oh: 40 }, d_flower_2: { ox: 9, oy: 9, ow: 40, oh: 40 }, d_flower_3: { ox: 9, oy: 9, ow: 40, oh: 40 }, d_flower_4: { ox: 9, oy: 9, ow: 40, oh: 40 }, d_tuft: { ox: 7, oy: 13, ow: 40, oh: 40 }, d_mushroom: { ox: 5, oy: 6, ow: 40, oh: 40 }, d_pebble_0: { ox: 3, oy: 5, ow: 30, oh: 26 }, d_pebble_1: { ox: 3, oy: 6, ow: 30, oh: 26 }, d_clover: { ox: 4, oy: 6, ow: 30, oh: 30 }, d_shell: { ox: 2, oy: 2, ow: 30, oh: 26 }, d_leaf: { ox: 5, oy: 8, ow: 36, oh: 28 }, shadow: { ox: 0, oy: 0, ow: 120, oh: 48 }, fx_splash_0: { ox: 56, oy: 63, ow: 180, oh: 150 }, fx_splash_1: { ox: 42, oy: 28, ow: 180, oh: 150 }, fx_splash_2: { ox: 24, oy: 24, ow: 180, oh: 150 }, fx_splash_3: { ox: 5, oy: 30, ow: 180, oh: 150 }, fx_splash_4: { ox: 20, oy: 49, ow: 180, oh: 150 }, fx_splash_5: { ox: 11, oy: 56, ow: 180, oh: 150 }, fx_impact_0: { ox: 31, oy: 31, ow: 90, oh: 90 }, fx_impact_1: { ox: 22, oy: 28, ow: 90, oh: 90 }, fx_impact_2: { ox: 27, oy: 26, ow: 90, oh: 90 }, fx_impact_3: { ox: 15, oy: 21, ow: 90, oh: 90 }, fx_ring: { ox: 3, oy: 3, ow: 128, oh: 128 }, fx_softring: { ox: 1, oy: 1, ow: 128, oh: 128 }, fx_glow: { ox: 0, oy: 0, ow: 128, oh: 128 }, fx_rays: { ox: 17, oy: 18, ow: 300, oh: 300 }, p_water: { ox: 3, oy: 4, ow: 24, oh: 28 }, p_water_s: { ox: 2, oy: 2, ow: 14, oh: 16 }, p_mist: { ox: 0, oy: 0, ow: 64, oh: 64 }, p_bubble: { ox: 2, oy: 3, ow: 40, oh: 40 }, p_sparkle_0: { ox: 6, oy: 6, ow: 40, oh: 40 }, p_sparkle_1: { ox: 1, oy: 1, ow: 40, oh: 40 }, p_sparkle_2: { ox: 4, oy: 4, ow: 40, oh: 40 }, p_star: { ox: 2, oy: 3, ow: 40, oh: 40 }, p_heart: { ox: 3, oy: 6, ow: 36, oh: 34 }, p_coin_0: { ox: 3, oy: 3, ow: 40, oh: 40 }, p_coin_1: { ox: 7, oy: 2, ow: 40, oh: 40 }, p_coin_2: { ox: 15, oy: 0, ow: 40, oh: 40 }, p_coin_3: { ox: 7, oy: 2, ow: 40, oh: 40 }, p_xp: { ox: 1, oy: 5, ow: 38, oh: 42 }, p_heal: { ox: 4, oy: 6, ow: 36, oh: 40 }, p_goo_violet: { ox: 1, oy: 1, ow: 22, oh: 22 }, p_goo_pink: { ox: 1, oy: 1, ow: 22, oh: 22 }, p_goo_amber: { ox: 1, oy: 1, ow: 22, oh: 22 }, p_goo_indigo: { ox: 1, oy: 1, ow: 22, oh: 22 }, p_goo_plum: { ox: 1, oy: 1, ow: 22, oh: 22 }, p_goo_teal: { ox: 1, oy: 1, ow: 22, oh: 22 }, p_goo_berry: { ox: 1, oy: 1, ow: 22, oh: 22 }, p_goo_royal: { ox: 1, oy: 1, ow: 22, oh: 22 }, p_dust: { ox: 3, oy: 2, ow: 40, oh: 30 }, p_conf_0: { ox: 0, oy: 0, ow: 16, oh: 12 }, p_conf_1: { ox: 0, oy: 0, ow: 16, oh: 12 }, p_conf_2: { ox: 0, oy: 0, ow: 16, oh: 12 }, p_conf_3: { ox: 0, oy: 0, ow: 16, oh: 12 }, p_conf_4: { ox: 0, oy: 0, ow: 16, oh: 12 }, p_petal: { ox: 1, oy: 0, ow: 18, oh: 14 }, mk_help: { ox: 0, oy: 2, ow: 64, oh: 60 }, mk_excl: { ox: 0, oy: 0, ow: 48, oh: 56 }, mk_zzz: { ox: 9, oy: 7, ow: 56, oh: 60 }, mk_arrow: { ox: 2, oy: 1, ow: 70, oh: 70 }, mk_hand: { ox: 11, oy: 4, ow: 90, oh: 110 }, mk_joybase: { ox: 1, oy: 1, ow: 160, oh: 160 }, mk_joyknob: { ox: 6, oy: 6, ow: 80, oh: 80 }, mk_shield: { ox: 3, oy: 3, ow: 120, oh: 120 }, ic_pause: { ox: 24, oy: 20, ow: 96, oh: 96 }, ic_play: { ox: 28, oy: 18, ow: 96, oh: 96 }, ic_close: { ox: 21, oy: 21, ow: 96, oh: 96 }, ic_back: { ox: 16, oy: 18, ow: 96, oh: 96 }, ic_arrow: { ox: 18, oy: 18, ow: 96, oh: 96 }, ic_gear: { ox: 12, oy: 12, ow: 96, oh: 96 }, ic_heart: { ox: 20, oy: 28, ow: 96, oh: 96 }, ic_exit: { ox: 18, oy: 14, ow: 96, oh: 96 }, ic_home: { ox: 12, oy: 14, ow: 96, oh: 96 }, ic_map: { ox: 12, oy: 16, ow: 96, oh: 96 }, ic_shelter: { ox: 8, oy: 10, ow: 96, oh: 96 }, ic_upgrade: { ox: 16, oy: 12, ow: 96, oh: 96 }, ic_missions: { ox: 18, oy: 8, ow: 96, oh: 96 }, ic_daily: { ox: 14, oy: 13, ow: 96, oh: 96 }, ic_streak: { ox: 14, oy: 14, ow: 96, oh: 96 }, ic_gift: { ox: 14, oy: 13, ow: 96, oh: 96 }, ic_festival: { ox: 13, oy: 17, ow: 96, oh: 96 }, ic_music: { ox: 20, oy: 13, ow: 96, oh: 96 }, ic_sfx: { ox: 16, oy: 18, ow: 96, oh: 96 }, ic_vibe: { ox: 16, oy: 16, ow: 96, oh: 96 }, ic_lang: { ox: 14, oy: 14, ow: 96, oh: 96 }, ic_gfx: { ox: 12, oy: 16, ow: 96, oh: 96 }, ic_eye: { ox: 12, oy: 29, ow: 96, oh: 96 }, ic_lock: { ox: 22, oy: 19, ow: 96, oh: 96 }, ic_check: { ox: 16, oy: 22, ow: 96, oh: 96 }, ic_star: { ox: 13, oy: 14, ow: 96, oh: 96 }, ic_star_empty: { ox: 13, oy: 14, ow: 96, oh: 96 }, ic_info: { ox: 16, oy: 16, ow: 96, oh: 96 }, ic_reset: { ox: 16, oy: 20, ow: 96, oh: 96 }, ic_paw: { ox: 18, oy: 17, ow: 96, oh: 96 }, ic_crown: { ox: 12, oy: 20, ow: 96, oh: 96 }, ic_goo: { ox: 18, oy: 34, ow: 96, oh: 96 }, ic_coin: { ox: 16, oy: 16, ow: 96, oh: 96 }, ic_up_power: { ox: 6, oy: 18, ow: 96, oh: 96 }, ic_up_range: { ox: 10, oy: 16, ow: 96, oh: 96 }, ic_up_health: { ox: 18, oy: 31, ow: 96, oh: 96 }, ic_up_pressure: { ox: 12, oy: 16, ow: 96, oh: 96 }, ic_up_splash: { ox: 10, oy: 16, ow: 96, oh: 96 }, ic_skill_thick: { ox: 3, oy: 9, ow: 96, oh: 96 }, ic_skill_range: { ox: 8, oy: 14, ow: 96, oh: 96 }, ic_skill_multi: { ox: 13, oy: 13, ow: 96, oh: 96 }, ic_skill_pierce: { ox: 5, oy: 25, ow: 96, oh: 96 }, ic_skill_chain: { ox: 6, oy: 14, ow: 96, oh: 96 }, ic_skill_splash: { ox: 7, oy: 13, ow: 96, oh: 96 }, ic_skill_turbo: { ox: 12, oy: 8, ow: 96, oh: 96 }, ic_skill_keep: { ox: 12, oy: 10, ow: 96, oh: 96 }, ic_skill_speed: { ox: 8, oy: 18, ow: 96, oh: 96 }, ic_skill_shield: { ox: 14, oy: 14, ow: 96, oh: 96 }, ic_skill_trail: { ox: 14, oy: 16, ow: 96, oh: 96 }, ic_skill_magnet: { ox: 17, oy: 13, ow: 96, oh: 96 }, ic_skill_vitality: { ox: 18, oy: 30, ow: 96, oh: 96 }, ic_skill_heal: { ox: 22, oy: 20, ow: 96, oh: 96 }, dc_ball: { ox: 10, oy: 14, ow: 80, oh: 80 }, dc_cushion: { ox: 1, oy: 22, ow: 130, oh: 80 }, dc_bowl: { ox: 5, oy: 17, ow: 90, oh: 64 }, dc_flowers: { ox: 7, oy: 29, ow: 150, oh: 90 }, dc_pond: { ox: 6, oy: 24, ow: 200, oh: 110 }, dc_treehouse: { ox: 34, oy: 12, ow: 200, oh: 236 }, dc_slide: { ox: 15, oy: 10, ow: 190, oh: 160 }, dc_fountain: { ox: 10, oy: 32, ow: 180, oh: 180 }, sh_sign: { ox: 4, oy: 0, ow: 140, oh: 120 } } };

  // src/engine/atlas.ts
  var ART_SCALE = 2;
  var META = atlas_default;
  var frames = /* @__PURE__ */ new Map();
  var pages = [];
  async function loadAtlases(onProgress) {
    const list = [];
    for (const [name, a] of Object.entries(META.atlases)) a.pages.forEach((p, idx) => list.push({ atlas: name, idx, url: "assets/art/" + p }));
    let done = 0;
    const imgs = {};
    await Promise.all(list.map(async (it) => {
      var _a;
      const img = new Image();
      img.decoding = "async";
      img.src = it.url;
      await new Promise((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("image " + it.url));
      });
      try {
        await img.decode();
      } catch {
      }
      (imgs[_a = it.atlas] || (imgs[_a] = []))[it.idx] = img;
      pages.push(img);
      onProgress(++done / list.length);
    }));
    for (const [name, a] of Object.entries(META.atlases)) {
      for (const [fname, f] of Object.entries(a.frames)) frames.set(fname, { img: imgs[name][f.page], x: f.x, y: f.y, w: f.w, h: f.h, ax: f.ax, ay: f.ay });
    }
  }
  function frame(name) {
    return frames.get(name);
  }
  function point(sprite, key) {
    return META.points[sprite]?.[key] ?? [0, 0];
  }
  var missing = /* @__PURE__ */ new Set();
  function draw(ctx2, name, x, y, scale = 1, flipX = false, rot = 0, alpha = 1, sx = 1, sy = 1) {
    const f = frames.get(name);
    if (!f) {
      if (!missing.has(name)) {
        missing.add(name);
        console.warn("missing sprite", name);
      }
      return;
    }
    drawFrame(ctx2, f, x, y, scale, flipX, rot, alpha, sx, sy);
  }
  function drawFrame(ctx2, f, x, y, scale = 1, flipX = false, rot = 0, alpha = 1, sx = 1, sy = 1) {
    const k = scale / ART_SCALE;
    if (alpha <= 3e-3) return;
    const prevA = ctx2.globalAlpha;
    if (alpha !== 1) ctx2.globalAlpha = prevA * alpha;
    if (!rot && !flipX && sx === 1 && sy === 1) {
      ctx2.drawImage(f.img, f.x, f.y, f.w, f.h, x - f.ax * k, y - f.ay * k, f.w * k, f.h * k);
    } else {
      ctx2.save();
      ctx2.translate(x, y);
      if (rot) ctx2.rotate(rot);
      ctx2.scale((flipX ? -1 : 1) * sx, sy);
      ctx2.drawImage(f.img, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
      ctx2.restore();
    }
    if (alpha !== 1) ctx2.globalAlpha = prevA;
  }

  // src/engine/audio.ts
  var LIMITS = {
    goo_hit: { max: 3, gap: 0.05 },
    cocoon_hit: { max: 2, gap: 0.08 },
    pickup_xp: { max: 4, gap: 0.03 },
    pickup_coin: { max: 4, gap: 0.035 },
    coin_tick: { max: 2, gap: 0.03 },
    goo_burst: { max: 4, gap: 0.03 },
    enemy_spit: { max: 3, gap: 0.06 },
    ui_tap: { max: 2, gap: 0.04 }
  };
  var AudioManager = class {
    constructor() {
      this.ctx = null;
      this.sfxGain = null;
      this.musicGain = null;
      this.buffers = /* @__PURE__ */ new Map();
      this.playing = /* @__PURE__ */ new Map();
      this.loopNodes = /* @__PURE__ */ new Map();
      this.manifest = null;
      this.music = null;
      this.fading = [];
      this.musicVol = 0.7;
      this.sfxVol = 0.9;
      this.wantMusic = null;
      this.hidden = false;
      this.duck = 1;
      this.decoded = false;
      this.routeMusic = location.protocol === "http:" || location.protocol === "https:";
      // capture mode (trailer tool): every sound request on the capture clock, mixed offline later
      this.log = null;
      this.logClock = () => 0;
      this.logLoop = /* @__PURE__ */ new Map();
    }
    init(manifest) {
      this.manifest = manifest;
      const unlock = () => this.unlock();
      window.addEventListener("pointerdown", unlock, { capture: true });
      window.addEventListener("keydown", unlock, { capture: true });
      document.addEventListener("visibilitychange", () => this.onVisibility());
      window.addEventListener("pagehide", () => this.onVisibility(true));
      window.addEventListener("pageshow", () => this.onVisibility(false));
      window.addEventListener("focus", () => {
        if (!document.hidden) this.resume();
      });
    }
    unlock() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try {
          this.ctx = new AC({ latencyHint: "interactive" });
        } catch {
          return;
        }
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.sfxVol;
        this.sfxGain.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.musicVol;
        this.musicGain.connect(this.ctx.destination);
        this.ctx.onstatechange = () => {
          if (this.ctx && this.ctx.state !== "running" && !this.hidden) this.ctx.resume().catch(() => {
          });
        };
        void this.decodeAll();
      }
      this.resume();
    }
    async decodeAll() {
      if (this.decoded || !this.ctx) return;
      this.decoded = true;
      const embedded = window.__SFX__ || {};
      const names = Object.keys(this.manifest?.sfx ?? embedded);
      await Promise.all(names.map(async (name) => {
        try {
          let buf;
          if (embedded[name]) {
            const bin = atob(embedded[name]);
            const u8 = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
            buf = u8.buffer;
          } else {
            const r = await fetch("assets/audio/" + this.manifest.sfx[name].file);
            buf = await r.arrayBuffer();
          }
          const ab = await this.ctx.decodeAudioData(buf);
          this.buffers.set(name, ab);
        } catch {
        }
      }));
    }
    resume() {
      if (this.hidden) return;
      if (this.ctx && this.ctx.state !== "running") this.ctx.resume().catch(() => {
      });
      if (this.music && this.music.el.paused && this.wantMusic) this.music.el.play().catch(() => {
      });
    }
    onVisibility(forceHidden) {
      this.hidden = forceHidden ?? document.hidden;
      if (this.hidden) {
        if (this.ctx && this.ctx.state === "running") this.ctx.suspend().catch(() => {
        });
        if (this.music) this.music.el.pause();
        for (const el of this.fading) el.pause();
      } else this.resume();
    }
    setVolumes(music, sfx) {
      this.musicVol = music;
      this.sfxVol = sfx;
      if (this.sfxGain) this.sfxGain.gain.value = sfx;
      this.applyMusicVol();
    }
    applyMusicVol() {
      const v = this.musicVol * this.duck;
      if (this.music) {
        if (this.music.gain && this.ctx) this.music.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.08);
        else this.music.el.volume = Math.max(0, Math.min(1, v));
      }
    }
    play(name, o = {}) {
      if (this.log) this.log.push({ t: this.logClock(), k: "s", n: name, v: o.vol ?? 1, r: o.rate ?? 1 });
      if (!this.ctx || !this.sfxGain || this.ctx.state !== "running" || this.sfxVol <= 0) return;
      let buf = this.buffers.get(name);
      if (!buf) {
        const v = [1, 2, 3].map((i) => this.buffers.get(`${name}_${i}`)).filter(Boolean);
        if (!v.length) return;
        buf = v[Math.floor(Math.random() * v.length)];
      }
      const lim = LIMITS[name] ?? { max: 6, gap: 0.015 };
      const st = this.playing.get(name) ?? { n: 0, last: -1 };
      const now = this.ctx.currentTime;
      if (st.n >= lim.max || now - st.last < lim.gap) return;
      st.n++;
      st.last = now;
      this.playing.set(name, st);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const vary = o.vary ?? 0.06;
      src.playbackRate.value = (o.rate ?? 1) * (1 + (Math.random() * 2 - 1) * vary);
      const g = this.ctx.createGain();
      g.gain.value = o.vol ?? 1;
      let node = g;
      if (o.pan && this.ctx.createStereoPanner) {
        const p = this.ctx.createStereoPanner();
        p.pan.value = Math.max(-1, Math.min(1, o.pan));
        g.connect(p);
        node = p;
      }
      src.connect(g);
      node.connect(this.sfxGain);
      src.onended = () => {
        st.n = Math.max(0, st.n - 1);
      };
      src.start();
    }
    loop(name, on, vol = 1, rate = 1) {
      if (this.log) {
        const p = this.logLoop.get(name);
        if (!p || p.on !== on || Math.abs(p.v - vol) > 0.04 || Math.abs(p.r - rate) > 0.03) {
          this.logLoop.set(name, { on, v: vol, r: rate });
          this.log.push({ t: this.logClock(), k: "l", n: name, on, v: vol, r: rate });
        }
      }
      if (!this.ctx || !this.sfxGain) return;
      const cur = this.loopNodes.get(name);
      if (on) {
        if (!cur) {
          const buf = this.buffers.get(name);
          if (!buf) return;
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const g = this.ctx.createGain();
          g.gain.value = 0;
          src.connect(g);
          g.connect(this.sfxGain);
          src.start();
          this.loopNodes.set(name, { src, gain: g });
          g.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.03);
        } else {
          cur.gain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
          cur.src.playbackRate.setTargetAtTime(rate, this.ctx.currentTime, 0.05);
        }
      } else if (cur) {
        cur.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
        const src = cur.src;
        this.loopNodes.delete(name);
        setTimeout(() => {
          try {
            src.stop();
          } catch {
          }
        }, 300);
      }
    }
    stopLoops() {
      for (const k of [...this.loopNodes.keys()]) this.loop(k, false);
    }
    music_(name) {
      this.playMusic(name);
    }
    playMusic(name) {
      if (this.log && name !== this.wantMusic) this.log.push({ t: this.logClock(), k: "m", n: name });
      this.wantMusic = name;
      if (this.music && this.music.name === name) {
        if (this.music.el.paused && !this.hidden) this.music.el.play().catch(() => {
        });
        return;
      }
      if (this.music) {
        const old = this.music;
        this.music = null;
        this.fadeOut(old);
      }
      if (!name || !this.manifest?.music[name]) return;
      const el = new Audio("assets/audio/" + this.manifest.music[name].file);
      el.loop = true;
      el.preload = "auto";
      const m = { name, el };
      if (this.routeMusic && this.ctx && this.musicGain) {
        try {
          m.node = this.ctx.createMediaElementSource(el);
          m.gain = this.ctx.createGain();
          m.gain.gain.value = 0;
          m.node.connect(m.gain);
          m.gain.connect(this.musicGain);
        } catch {
          m.node = void 0;
          m.gain = void 0;
        }
      }
      if (!m.gain) el.volume = 0;
      this.music = m;
      if (!this.hidden) el.play().catch(() => {
      });
      if (m.gain && this.ctx) {
        m.gain.gain.setTargetAtTime(this.duck, this.ctx.currentTime, 0.4);
      } else {
        const start = performance.now();
        const step = () => {
          if (this.music !== m) return;
          const k = Math.min(1, (performance.now() - start) / 900);
          el.volume = Math.max(0, Math.min(1, this.musicVol * this.duck * k));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }
    fadeOut(m) {
      this.fading.push(m.el);
      const done = () => {
        m.el.pause();
        m.el.src = "";
        this.fading = this.fading.filter((e) => e !== m.el);
      };
      if (m.gain && this.ctx) {
        m.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
        setTimeout(done, 1200);
        return;
      }
      const v0 = m.el.volume;
      const start = performance.now();
      const step = () => {
        const k = Math.min(1, (performance.now() - start) / 700);
        m.el.volume = Math.max(0, v0 * (1 - k));
        if (k < 1) requestAnimationFrame(step);
        else done();
      };
      requestAnimationFrame(step);
    }
    duckMusic(level2, seconds) {
      this.duck = level2;
      this.applyMusicVol();
      setTimeout(() => {
        this.duck = 1;
        this.applyMusicVol();
      }, seconds * 1e3);
    }
    // the stinger plays on the sfx bus
    stinger(name) {
      this.play(name, { vary: 0 });
    }
  };
  var audio = new AudioManager();
  if (true) window.__AUDIO__ = audio;

  // src/engine/input.ts
  var DEAD = 9;
  var FULL = 46;
  var InputController = class {
    constructor(el) {
      this.joy = { active: false, ox: 0, oy: 0, x: 0, y: 0, mx: 0, my: 0, everMoved: false };
      this.enabled = false;
      this.pid = -1;
      this.down = (e) => {
        if (!this.enabled) return;
        const t2 = e.target;
        if (t2?.closest?.("button, a, input, select, textarea, .modal-back, .result")) return;
        if (this.pid !== -1 && e.pointerType === "touch") return;
        e.preventDefault();
        this.pid = e.pointerId;
        const j = this.joy;
        j.active = true;
        j.ox = j.x = e.clientX;
        j.oy = j.y = e.clientY;
        j.mx = j.my = 0;
        try {
          this.el.setPointerCapture(e.pointerId);
        } catch {
        }
      };
      this.move = (e) => {
        if (e.pointerId !== this.pid || !this.joy.active) return;
        e.preventDefault();
        const j = this.joy;
        j.x = e.clientX;
        j.y = e.clientY;
        let dx = j.x - j.ox, dy = j.y - j.oy;
        let d = Math.hypot(dx, dy);
        const maxR = FULL * 1.5;
        if (d > maxR) {
          j.ox += dx / d * (d - maxR);
          j.oy += dy / d * (d - maxR);
          dx = j.x - j.ox;
          dy = j.y - j.oy;
          d = maxR;
        }
        if (d < DEAD) {
          j.mx = 0;
          j.my = 0;
          return;
        }
        const k = Math.min(1, 0.45 + 0.55 * (d - DEAD) / (FULL - DEAD));
        j.mx = dx / d * k;
        j.my = dy / d * k;
        j.everMoved = true;
      };
      this.up = (e) => {
        if (e.pointerId === this.pid) this.release();
      };
      // keyboard: held direction keys move, letting go of all of them stops (and fires)
      this.keys = /* @__PURE__ */ new Set();
      this.el = el;
      window.addEventListener("pointerdown", this.down, { passive: false });
      window.addEventListener("pointermove", this.move, { passive: false });
      window.addEventListener("pointerup", this.up);
      window.addEventListener("pointercancel", this.up);
      window.addEventListener("blur", () => {
        this.release();
        this.keys.clear();
        this.applyKeys();
      });
      window.addEventListener("keydown", (e) => this.key(e, true));
      window.addEventListener("keyup", (e) => this.key(e, false));
    }
    release() {
      this.pid = -1;
      const j = this.joy;
      j.active = false;
      j.mx = 0;
      j.my = 0;
    }
    key(e, on) {
      const k = KEYS[e.code];
      if (!k) return;
      if (on && !this.enabled) return;
      if (on) this.keys.add(e.code);
      else this.keys.delete(e.code);
      if (this.enabled) e.preventDefault();
      this.applyKeys();
    }
    applyKeys() {
      if (this.pid !== -1) return;
      let x = 0, y = 0;
      for (const c of this.keys) {
        x += KEYS[c][0];
        y += KEYS[c][1];
      }
      const d = Math.hypot(x, y);
      const j = this.joy;
      j.mx = d ? x / d : 0;
      j.my = d ? y / d : 0;
      if (d) j.everMoved = true;
    }
  };
  var KEYS = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    KeyA: [-1, 0],
    KeyD: [1, 0],
    KeyW: [0, -1],
    KeyS: [0, 1]
  };
  var shared = null;
  function initInput(el) {
    shared = new InputController(el);
    return shared;
  }
  function getInput() {
    return shared;
  }

  // src/main.ts
  init_quality();

  // src/engine/screen.ts
  init_quality();
  var screen = {
    canvas: null,
    ctx: null,
    w: 0,
    h: 0,
    dpr: 1,
    safe: { top: 0, right: 0, bottom: 0, left: 0 }
  };
  var listeners2 = [];
  function onResize(f) {
    listeners2.push(f);
  }
  var probe = null;
  function readSafe() {
    const forced = window.__SAFE__;
    if (forced) {
      screen.safe.top = forced.t;
      screen.safe.bottom = forced.b;
      screen.safe.left = 0;
      screen.safe.right = 0;
      document.documentElement.style.setProperty("--sat", forced.t + "px");
      document.documentElement.style.setProperty("--sab", forced.b + "px");
      return;
    }
    if (!probe) {
      probe = document.createElement("div");
      probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
      document.body.appendChild(probe);
    }
    const cs = getComputedStyle(probe);
    screen.safe.top = parseFloat(cs.paddingTop) || 0;
    screen.safe.right = parseFloat(cs.paddingRight) || 0;
    screen.safe.bottom = parseFloat(cs.paddingBottom) || 0;
    screen.safe.left = parseFloat(cs.paddingLeft) || 0;
  }
  function initScreen(canvas) {
    screen.canvas = canvas;
    screen.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    const resize = () => {
      readSafe();
      screen.w = window.innerWidth;
      screen.h = window.innerHeight;
      screen.dpr = Math.min(window.devicePixelRatio || 1, quality().dprCap);
      canvas.width = Math.round(screen.w * screen.dpr);
      canvas.height = Math.round(screen.h * screen.dpr);
      canvas.style.width = screen.w + "px";
      canvas.style.height = screen.h + "px";
      for (const f of listeners2) f();
    };
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", () => setTimeout(resize, 120));
    onQualityChange(resize);
    resize();
  }

  // src/engine/haptics.ts
  var PATTERNS = {
    tick: 6,
    light: 12,
    medium: 24,
    heavy: [38, 30, 38],
    success: [18, 50, 28],
    fail: [60, 40, 90]
  };
  var enabled = true;
  var last = 0;
  var canVibrate = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  function setHaptics(on) {
    enabled = on;
  }
  function buzz(kind) {
    if (!enabled || !canVibrate) return;
    const now = performance.now();
    if (kind === "tick" && now - last < 70) return;
    if (now - last < 30) return;
    last = now;
    try {
      navigator.vibrate(PATTERNS[kind]);
    } catch {
    }
  }

  // data/i18n/ko.json
  var ko_default = {
    "app.title": "\uBB3C\uCD1D \uAD6C\uC870\uB300",
    "common.close": "\uB2EB\uAE30",
    "common.back": "\uB4A4\uB85C",
    "common.ok": "\uD655\uC778",
    "common.cancel": "\uCDE8\uC18C",
    "common.yes": "\uB124",
    "common.no": "\uC544\uB2C8\uC694",
    "common.claim": "\uBC1B\uAE30",
    "common.claimed": "\uBC1B\uC74C",
    "common.new": "NEW",
    "common.locked": "\uC7A0\uAE40",
    "common.max": "\uCD5C\uACE0",
    "loading.text": "\uBB3C\uCD1D\uC5D0 \uBB3C \uCC44\uC6B0\uB294 \uC911\u2026",
    "title.tap": "\uB20C\uB7EC\uC11C \uC2DC\uC791",
    "title.play": "\uAD6C\uC870 \uCD9C\uBC1C!",
    "hud.lv": "Lv {n}",
    "hud.room": "{a}/{b}",
    "hint.drag": "\uB04C\uC5B4\uC11C \uC6C0\uC9C1\uC5EC\uC694",
    "hint.stop": "\uC190\uC744 \uB5BC\uBA74 \uBC1C\uC0AC!",
    "hint.rescue": "\uBB3C\uC744 \uBFCC\uB824 \uAD6C\uD574 \uC8FC\uC138\uC694!",
    "hint.gate": "\uCD9C\uAD6C\uB85C \uAC00\uC694!",
    "hint.range": "\uC870\uAE08 \uB354 \uAC00\uAE4C\uC774!",
    "hint.pressure": "\uBA48\uCDB0 \uC788\uC73C\uBA74 \uC218\uC555\uC774 \uCC28\uC694!",
    "toast.pressure": "\uCD5C\uB300 \uC218\uC555!",
    "toast.rescued": "{name} \uAD6C\uCD9C!",
    "toast.brave": "\uC6A9\uAC10\uD55C \uAD6C\uCD9C!",
    "toast.cheer": "\uC751\uC6D0 +{p}",
    "toast.clean": "\uAE68\uB057\uD574\uC84C\uC5B4\uC694!",
    "toast.newMonster": "\uC0C8 \uB048\uC801\uC774",
    "toast.bossPhase": "\uD654\uB0AC\uC5B4\uC694! \uC870\uC2EC!",
    "toast.waveIncoming": "\uB354 \uBAB0\uB824\uC640\uC694!",
    "levelup.title": "\uB808\uBCA8 \uC5C5!",
    "levelup.pick": "\uD558\uB098\uB97C \uACE8\uB77C\uC694",
    "levelup.stack": "{n}\uB2E8\uACC4",
    "skill.thick.name": "\uAD75\uC740 \uBB3C\uC904\uAE30",
    "skill.thick.desc": "\uBB3C\uC904\uAE30 \uD53C\uD574 +22%, \uAD75\uAE30 +15%",
    "skill.range.name": "\uBA40\uB9AC \uC3D8\uAE30",
    "skill.range.desc": "\uC0AC\uAC70\uB9AC +15%",
    "skill.multi.name": "\uAC08\uB798 \uBB3C\uC904\uAE30",
    "skill.multi.desc": "\uBB3C\uC904\uAE30\uAC00 \uD558\uB098 \uB354 \uB098\uC640 \uB2E4\uB978 \uB048\uC801\uC774\uB97C \uC53B\uC5B4\uC694 (\uD53C\uD574 55%)",
    "skill.pierce.name": "\uB6AB\uB294 \uBB3C\uC904\uAE30",
    "skill.pierce.desc": "\uBB3C\uC904\uAE30\uAC00 \uB048\uC801\uC774\uB97C \uB6AB\uACE0 \uB4A4\uC5D0 \uC788\uB294 \uAC83\uAE4C\uC9C0 \uC53B\uC5B4\uC694 (\uD53C\uD574 70%)",
    "skill.chain.name": "\uD295\uAE30\uB294 \uBB3C\uC904\uAE30",
    "skill.chain.desc": "\uB9DE\uC740 \uB048\uC801\uC774 \uC606\uC73C\uB85C \uBB3C\uC774 \uD280\uC5B4\uC694 (\uD53C\uD574 50%)",
    "skill.splash.name": "\uBB3C\uBCF4\uB77C \uD3ED\uBC1C",
    "skill.splash.desc": "\uB048\uC801\uC774\uAC00 \uD130\uC9C8 \uB54C \uBB3C\uBCF4\uB77C \uD53C\uD574 +60%, \uBC94\uC704 +25%",
    "skill.turbo.name": "\uC218\uC555 \uD130\uBCF4",
    "skill.turbo.desc": "\uC218\uC555\uC774 45% \uB354 \uBE68\uB9AC \uCC28\uC694. \uCD5C\uB300 \uC218\uC555 \uC704\uB825 +0.2\uBC30",
    "skill.keep.name": "\uC218\uC555 \uC720\uC9C0",
    "skill.keep.desc": "\uC6C0\uC9C1\uC5EC\uB3C4 \uC218\uC555\uC774 55% \uB35C \uBE60\uC838\uC694",
    "skill.speed.name": "\uBE60\uB978 \uBC1C",
    "skill.speed.desc": "\uC774\uB3D9 \uC18D\uB3C4 +12%, \uB048\uC801\uC774 \uBC14\uB2E5\uC5D0\uC11C \uB35C \uB290\uB824\uC838\uC694",
    "skill.shield.name": "\uAC70\uD488 \uBC29\uD328",
    "skill.shield.desc": "\uACF5\uACA9\uC744 \uD55C \uBC88 \uB9C9\uC544 \uC918\uC694. {s}\uCD08\uB9C8\uB2E4 \uB2E4\uC2DC \uC0DD\uACA8\uC694",
    "skill.trail.name": "\uAC70\uD488 \uAE38",
    "skill.trail.desc": "\uC6C0\uC9C1\uC774\uBA74 \uAC70\uD488\uC774 \uB0A8\uC544\uC694. \uB048\uC801\uC774\uAC00 \uBC1F\uC73C\uBA74 \uD391!",
    "skill.magnet.name": "\uBB3C\uBC29\uC6B8 \uC790\uC11D",
    "skill.magnet.desc": "\uC90D\uB294 \uBC94\uC704 +80%, \uACBD\uD5D8\uCE58 +15%",
    "skill.vitality.name": "\uD2BC\uD2BC\uD55C \uBAB8",
    "skill.vitality.desc": "\uCD5C\uB300 \uCCB4\uB825 +20%, \uCCB4\uB825 20% \uD68C\uBCF5",
    "skill.heal.name": "\uD68C\uBCF5",
    "skill.heal.desc": "\uCCB4\uB825 40% \uD68C\uBCF5",
    "pause.title": "\uC7A0\uAE50 \uC26C\uC5B4\uC694",
    "pause.resume": "\uACC4\uC18D\uD558\uAE30",
    "pause.quit": "\uADF8\uB9CC\uD558\uACE0 \uB098\uAC00\uAE30",
    "pause.quitNote": "\uC9C0\uAE08 \uB098\uAC00\uB3C4 \uAD6C\uD55C \uB3D9\uBB3C\uACFC \uCF54\uC778\uC740 \uADF8\uB300\uB85C \uAC00\uC838\uAC00\uC694.",
    "pause.settings": "\uC124\uC815",
    "revive.title": "\uB048\uC801\uC774\uC5D0 \uB36E\uC600\uC5B4\uC694!",
    "revive.desc": "\uC774\uBC88 \uD310\uC5D0 \uD55C \uBC88, \uB2E4\uC2DC \uC77C\uC5B4\uB0A0 \uC218 \uC788\uC5B4\uC694.",
    "revive.yes": "\uB2E4\uC2DC \uC77C\uC5B4\uB098\uAE30",
    "revive.no": "\uADF8\uB9CC\uD558\uAE30",
    "result.clear": "\uAD6C\uC5ED \uC815\uD654 \uC644\uB8CC!",
    "result.fail": "\uC774\uBC88\uC5D4 \uC5EC\uAE30\uAE4C\uC9C0!",
    "result.quit": "\uC624\uB298\uC740 \uC5EC\uAE30\uAE4C\uC9C0!",
    "result.coins": "\uCF54\uC778",
    "result.animals": "\uAD6C\uD55C \uB3D9\uBB3C",
    "result.washed": "\uC53B\uC5B4 \uB0B8 \uB048\uC801\uC774",
    "result.rooms": "\uC815\uD654\uD55C \uBC29",
    "result.firstClear": "\uCCAB \uC815\uD654 \uBCF4\uB108\uC2A4",
    "result.clearBonus": "\uC815\uD654 \uBCF4\uB108\uC2A4",
    "result.kept": "\uAD6C\uD55C \uB3D9\uBB3C\uACFC \uCF54\uC778\uC740 \uBAA8\uB450 \uB0B4 \uAC70\uC608\uC694!",
    "result.tapSkip": "\uB20C\uB7EC\uC11C \uB118\uAE30\uAE30",
    "result.next": "\uB2E4\uC74C \uAD6C\uC5ED",
    "result.again": "\uD55C \uBC88 \uB354",
    "result.retry": "\uB2E4\uC2DC \uB3C4\uC804",
    "result.map": "\uC9C0\uB3C4",
    "result.home": "\uBCF4\uD638\uC18C\uB85C",
    "result.bond": "\uCE5C\uBC00\uB3C4 {n}",
    "result.newFriend": "\uC0C8 \uCE5C\uAD6C!",
    "result.upgradeHint": "\uCF54\uC778\uC73C\uB85C \uAC15\uD574\uC838\uC694!",
    "result.tip.spitter": "\uD264\uD264 \uB048\uC801\uC774\uC758 \uBB3C\uBC29\uC6B8\uC740 \uBA48\uCD94\uAE30 \uC804\uC5D0 \uD53C\uD574\uC694.",
    "result.tip.contact": "\uB048\uC801\uC774\uAC00 \uBD99\uAE30 \uC804\uC5D0 \uC218\uC555\uC744 \uCC44\uC6CC \uC53B\uC5B4\uC694.",
    "result.tip.dasher": "\uB3CC\uC9C4 \uB048\uC801\uC774\uB294 \uC904\uC774 \uBCF4\uC774\uBA74 \uC606\uC73C\uB85C \uBE44\uCF1C\uC694.",
    "result.tip.jumper": "\uD1B5\uD1B5 \uB048\uC801\uC774\uC758 \uADF8\uB9BC\uC790 \uBC16\uC73C\uB85C \uB098\uAC00\uC694.",
    "result.tip.chunky": "\uC655\uBC29\uC6B8 \uB048\uC801\uC774\uAC00 \uBE5B\uB098\uBA74 \uBB3C\uBC29\uC6B8 \uC0AC\uC774\uB85C \uD53C\uD574\uC694.",
    "result.tip.boss": "\uD0B9 \uB048\uC801\uC774\uAC00 \uB6F0\uC5B4\uC624\uB974\uBA74 \uADF8\uB9BC\uC790\uC5D0\uC11C \uBC97\uC5B4\uB098\uC694.",
    "result.tip.upgrade": "\uBB3C\uC904\uAE30 \uC138\uAE30\uB97C \uC62C\uB9AC\uBA74 \uD6E8\uC52C \uBE68\uB9AC \uC53B\uACA8\uC694.",
    "result.tip.generic": "\uAC15\uD654\uD558\uACE0 \uB2E4\uC2DC \uC624\uBA74 \uAE08\uBC29 \uAE68\uB057\uD574\uC9C8 \uAC70\uC608\uC694.",
    "upgrade.title": "\uAC15\uD654",
    "upgrade.buy": "{n}",
    "upgrade.lv": "Lv {n}",
    "upgrade.maxed": "\uCD5C\uACE0 \uB2E8\uACC4",
    "upgrade.notEnough": "\uCF54\uC778\uC774 \uBD80\uC871\uD574\uC694",
    "upgrade.power.name": "\uBB3C\uC904\uAE30 \uC138\uAE30",
    "upgrade.power.desc": "\uD53C\uD574 +12%, \uAD75\uAE30 +5% (\uB808\uBCA8\uB9C8\uB2E4)",
    "upgrade.range.name": "\uC0AC\uAC70\uB9AC",
    "upgrade.range.desc": "\uB808\uBCA8\uB9C8\uB2E4 \uC0AC\uAC70\uB9AC +4%",
    "upgrade.health.name": "\uCCB4\uB825",
    "upgrade.health.desc": "\uCD5C\uB300 \uCCB4\uB825 +10% (\uB808\uBCA8\uB9C8\uB2E4)",
    "upgrade.pressure.name": "\uC218\uC555",
    "upgrade.pressure.desc": "\uC218\uC555 \uCC28\uB294 \uC18D\uB3C4 +5%, \uCD5C\uB300 \uC218\uC555 \uC704\uB825 +0.05\uBC30 (\uB808\uBCA8\uB9C8\uB2E4)",
    "upgrade.splash.name": "\uBB3C\uBCF4\uB77C",
    "upgrade.splash.desc": "\uD130\uC9C8 \uB54C \uBB3C\uBCF4\uB77C \uD53C\uD574 +10%, \uBC94\uC704\uB3C4 \uB113\uC5B4\uC838\uC694 (\uB808\uBCA8\uB9C8\uB2E4)",
    "upgrade.stat.power": "\uD53C\uD574 {a} \u2192 {b}",
    "upgrade.stat.range": "\uC0AC\uAC70\uB9AC {a} \u2192 {b}",
    "upgrade.stat.health": "\uCCB4\uB825 {a} \u2192 {b}",
    "upgrade.stat.pressure": "\uCD5C\uB300 \uC218\uC555 {a} \u2192 {b}",
    "upgrade.stat.splash": "\uBB3C\uBCF4\uB77C {a} \u2192 {b}",
    "upgrade.gunNext": "\uB2E4\uC74C \uC9C4\uD654\uAE4C\uC9C0 \uAC15\uD654 {n}\uBC88",
    "upgrade.gunFinal": "\uCD5C\uACE0\uC758 \uBB3C\uB300\uD3EC!",
    "upgrade.dream": "\uC5B8\uC820\uAC00 \uC774 \uBB3C\uB300\uD3EC\uB85C \uC232 \uC804\uCCB4\uB97C \uC53B\uC5B4 \uB0BC \uAC70\uC608\uC694",
    "gun.0": "\uC791\uC740 \uBB3C\uCD1D",
    "gun.1": "\uD38C\uD504 \uBB3C\uCD1D",
    "gun.2": "\uC30D\uBC1C \uBB3C\uCD1D",
    "gun.3": "\uBB3C\uD0F1\uD06C \uBB3C\uCD1D",
    "gun.4": "\uC18C\uBC29 \uD638\uC2A4",
    "gun.5": "\uBB3C\uB300\uD3EC",
    "gun.6": "\uAC70\uB300 \uBB3C\uB300\uD3EC",
    "gun.evolved": "\uBB3C\uCD1D\uC774 \uC9C4\uD654\uD588\uC5B4\uC694!",
    "region.forest": "\uD587\uC0B4 \uC232",
    "region.village": "\uD48D\uCC28 \uB9C8\uC744",
    "region.lake": "\uBC18\uC9DD \uD638\uC218",
    "stage.label": "{r} {n}",
    "stage.short": "{n}\uAD6C\uC5ED",
    "stage.play": "\uCD9C\uBC1C!",
    "stage.animals": "\uB9CC\uB0A0 \uC218 \uC788\uB294 \uB3D9\uBB3C",
    "stage.cleared": "\uC815\uD654 \uC644\uB8CC",
    "stage.best": "\uCD5C\uACE0 \uAE30\uB85D",
    "stage.boss": "\uBCF4\uC2A4",
    "stage.newGoo": "\uC0C8 \uB048\uC801\uC774",
    "stage.locked": "\uC55E \uAD6C\uC5ED\uC744 \uBA3C\uC800 \uC815\uD654\uD574\uC694",
    "stage.helpOffer": "\uC774\uBC88 \uD310 \uCCB4\uB825 +{hp}%, \uD53C\uD574 +{dmg}%",
    "map.title": "\uC9C0\uB3C4",
    "map.progress": "{a}/{b} \uC815\uD654",
    "nav.upgrade": "\uAC15\uD654",
    "nav.map": "\uBAA8\uD5D8",
    "nav.shelter": "\uBCF4\uD638\uC18C",
    "shelter.title": "\uB3D9\uBB3C \uBCF4\uD638\uC18C",
    "shelter.count": "{a}/{b}\uB9C8\uB9AC",
    "shelter.empty": "\uC544\uC9C1 \uBABB \uB9CC\uB0AC\uC5B4\uC694",
    "shelter.where": "{place}\uC5D0\uC11C \uB9CC\uB0A0 \uC218 \uC788\uC5B4\uC694",
    "shelter.whereStreak": "\uCD9C\uC11D {n}\uC77C\uC9F8\uC5D0 \uB180\uB7EC \uC640\uC694",
    "shelter.gifts": "\uC120\uBB3C",
    "shelter.collect": "\uC120\uBB3C \uBC1B\uAE30",
    "shelter.giftReady": "\uC120\uBB3C {n}\uCF54\uC778",
    "shelter.giftNone": "\uC120\uBB3C\uC744 \uBAA8\uC73C\uB294 \uC911",
    "shelter.giftRate": "\uC2DC\uAC04\uB2F9 {n} \xB7 \uCD5C\uB300 {h}\uC2DC\uAC04",
    "shelter.bond": "\uCE5C\uBC00\uB3C4 {n}",
    "shelter.bondNext": "{n}\uBC88 \uB354 \uAD6C\uD558\uBA74 \uCE5C\uBC00\uB3C4 \uC5C5",
    "shelter.bondMax": "\uCE5C\uBC00\uB3C4 \uCD5C\uACE0!",
    "shelter.rescued": "\uAD6C\uD55C \uD69F\uC218 {n}",
    "shelter.bonusTitle": "\uD568\uAED8\uD558\uBA74",
    "shelter.decor": "\uAFB8\uBBF8\uAE30",
    "shelter.decorDesc": "\uC120\uBB3C +10%",
    "shelter.decorOwned": "\uC124\uCE58\uD568",
    "shelter.list": "\uB3C4\uAC10",
    "shelter.totalBonus": "\uB3D9\uBB3C \uCE5C\uAD6C \uBCF4\uB108\uC2A4",
    "species.puppy": "\uAC15\uC544\uC9C0",
    "species.bunny": "\uD1A0\uB07C",
    "species.squirrel": "\uB2E4\uB78C\uC950",
    "species.fox": "\uC5EC\uC6B0",
    "species.hedgehog": "\uACE0\uC2B4\uB3C4\uCE58",
    "species.fawn": "\uC544\uAE30 \uC0AC\uC2B4",
    "species.kitten": "\uACE0\uC591\uC774",
    "species.duckling": "\uC624\uB9AC",
    "species.piglet": "\uC544\uAE30 \uB3FC\uC9C0",
    "species.lamb": "\uC544\uAE30 \uC591",
    "species.chick": "\uBCD1\uC544\uB9AC",
    "species.otter": "\uC218\uB2EC",
    "species.turtle": "\uAC70\uBD81\uC774",
    "species.frog": "\uAC1C\uAD6C\uB9AC",
    "species.penguin": "\uD3AD\uADC4",
    "species.panda": "\uD310\uB2E4",
    "bonus.maxHp": "\uCD5C\uB300 \uCCB4\uB825 +{v}",
    "bonus.move": "\uC774\uB3D9 \uC18D\uB3C4 +{v}",
    "bonus.coins": "\uC5BB\uB294 \uCF54\uC778 +{v}",
    "bonus.damage": "\uBB3C\uC904\uAE30 \uD53C\uD574 +{v}",
    "bonus.armor": "\uBC1B\uB294 \uD53C\uD574 -{v}",
    "bonus.range": "\uC0AC\uAC70\uB9AC +{v}",
    "bonus.charge": "\uC218\uC555 \uCC28\uB294 \uC18D\uB3C4 +{v}",
    "bonus.xp": "\uC5BB\uB294 \uACBD\uD5D8\uCE58 +{v}",
    "bonus.gifts": "\uBCF4\uD638\uC18C \uC120\uBB3C +{v}",
    "bonus.rescueHeal": "\uAD6C\uCD9C\uD560 \uB54C \uD68C\uBCF5 +{v}",
    "bonus.splash": "\uBB3C\uBCF4\uB77C +{v}",
    "bonus.pickup": "\uC90D\uB294 \uBC94\uC704 +{v}",
    "bonus.revive": "\uB2E4\uC2DC \uC77C\uC5B4\uB0A0 \uB54C \uCCB4\uB825 +{v}",
    "bonus.gooWalk": "\uB048\uC801\uC774 \uBC14\uB2E5 \uC774\uB3D9 \uC18D\uB3C4 +{v}",
    "bonus.pressureMax": "\uCD5C\uB300 \uC218\uC555 \uC704\uB825 +{v}",
    "bonus.all": "\uD53C\uD574\xB7\uCCB4\uB825\xB7\uCF54\uC778 +{v}",
    "decor.ball": "\uACF5",
    "decor.cushion": "\uD479\uC2E0\uD55C \uCFE0\uC158",
    "decor.bowl": "\uBC25\uADF8\uB987",
    "decor.flowers": "\uAF43\uBC2D",
    "decor.pond": "\uC791\uC740 \uC5F0\uBABB",
    "decor.treehouse": "\uB098\uBB34 \uC9D1",
    "decor.slide": "\uBBF8\uB044\uB7FC\uD2C0",
    "decor.fountain": "\uBD84\uC218",
    "monster.blob": "\uB9D0\uB791 \uB048\uC801\uC774",
    "monster.blob.desc": "\uC2AC\uAE08\uC2AC\uAE08 \uB2E4\uAC00\uC640\uC694",
    "monster.spitter": "\uD264\uD264 \uB048\uC801\uC774",
    "monster.spitter.desc": "\uBB3C\uBC29\uC6B8\uC744 \uBC49\uC5B4\uC694",
    "monster.splitter": "\uCABC\uAC1C \uB048\uC801\uC774",
    "monster.splitter.desc": "\uC53B\uC73C\uBA74 \uB458\uB85C \uB098\uB258\uC5B4\uC694",
    "monster.mini": "\uAF2C\uB9C8 \uB048\uC801\uC774",
    "monster.mini.desc": "\uC791\uACE0 \uBE68\uB77C\uC694",
    "monster.dasher": "\uB3CC\uC9C4 \uB048\uC801\uC774",
    "monster.dasher.desc": "\uC904\uC744 \uAE0B\uACE0 \uB3CC\uC9C4\uD574\uC694",
    "monster.chunky": "\uC655\uBC29\uC6B8 \uB048\uC801\uC774",
    "monster.chunky.desc": "\uBE5B\uB098\uBA74 \uC0AC\uBC29\uC73C\uB85C \uBB3C\uBC29\uC6B8!",
    "monster.nest": "\uB048\uC801\uC774 \uB465\uC9C0",
    "monster.nest.desc": "\uACC4\uC18D \uB048\uC801\uC774\uB97C \uB9CC\uB4E4\uC5B4\uC694",
    "monster.jumper": "\uD1B5\uD1B5 \uB048\uC801\uC774",
    "monster.jumper.desc": "\uADF8\uB9BC\uC790 \uC790\uB9AC\uB85C \uB6F0\uC5B4\uB0B4\uB824\uC694",
    "monster.flyer": "\uB0A0\uAC1C \uB048\uC801\uC774",
    "monster.flyer.desc": "\uB0A0\uC544\uC11C \uC7A5\uC560\uBB3C\uC744 \uB118\uC5B4\uC640\uC694",
    "monster.boss": "\uD0B9 \uB048\uC801\uC774",
    "monster.boss.desc": "\uC774 \uC9C0\uC5ED \uB048\uC801\uC774\uC758 \uC655",
    "mission.wash": "\uB048\uC801\uC774 {n}\uB9C8\uB9AC \uC53B\uAE30",
    "mission.rescue": "\uB3D9\uBB3C {n}\uB9C8\uB9AC \uAD6C\uD558\uAE30",
    "mission.rooms": "\uBC29 {n}\uAC1C \uAE68\uB057\uD558\uAC8C",
    "mission.pressure": "\uCD5C\uB300 \uC218\uC555 {n}\uBC88",
    "mission.clear": "\uAD6C\uC5ED {n}\uACF3 \uC815\uD654\uD558\uAE30",
    "mission.gifts": "\uBCF4\uD638\uC18C \uC120\uBB3C \uBC1B\uAE30",
    "mission.nohit": "\uC548 \uB9DE\uACE0 \uBC29 {n}\uAC1C \uBE44\uC6B0\uAE30",
    "missions.title": "\uC624\uB298\uC758 \uC784\uBB34",
    "missions.all": "\uBAA8\uB450 \uB05D\uB0B4\uBA74",
    "missions.resetIn": "{h}\uC2DC\uAC04 {m}\uBD84 \uB4A4 \uC0C8 \uC784\uBB34",
    "daily.title": "\uC624\uB298\uC758 \uB3C4\uC804",
    "daily.play": "\uB3C4\uC804\uD558\uAE30",
    "daily.reward": "\uCCAB \uC815\uD654 {n}\uCF54\uC778",
    "daily.done": "\uC624\uB298 \uB3C4\uC804 \uC644\uB8CC! \uB2E4\uC2DC \uD558\uBA74 {n}\uCF54\uC778",
    "daily.streak": "\uC5F0\uC18D {n}\uC77C",
    "daily.mod.big": "\uC655\uBC29\uC6B8 \uB0A0",
    "daily.mod.big.desc": "\uB048\uC801\uC774\uAC00 \uD06C\uACE0 \uB2E8\uB2E8\uD574\uC694. \uCF54\uC778 2\uBC30!",
    "daily.mod.fast": "\uB0A0\uC318 \uB0A0",
    "daily.mod.fast.desc": "\uB048\uC801\uC774\uAC00 \uBE68\uB77C\uC694. \uB0B4 \uBB3C\uC904\uAE30\uB3C4 1.3\uBC30!",
    "daily.mod.swarm": "\uC6B0\uAE00\uC6B0\uAE00 \uB0A0",
    "daily.mod.swarm.desc": "\uB048\uC801\uC774\uAC00 \uC794\uB729! \uCF54\uC778 1.5\uBC30",
    "daily.mod.rain": "\uBB3C\uBC29\uC6B8 \uBE44",
    "daily.mod.rain.desc": "\uBB3C\uBC29\uC6B8\uC774 \uBE68\uB77C\uC694. \uCF54\uC778 1.5\uBC30",
    "streak.title": "\uCD9C\uC11D \uB3C4\uC7A5",
    "streak.day": "{n}\uC77C\uC9F8",
    "streak.today": "\uC624\uB298\uC758 \uC120\uBB3C",
    "streak.tomorrow": "\uB0B4\uC77C \uC120\uBB3C",
    "streak.visitor": "{name}\uC774(\uAC00) \uB180\uB7EC \uC640\uC694!",
    "streak.tomorrowHint": "\uB0B4\uC77C \uB2E4\uC2DC \uC624\uBA74 {gift}",
    "streak.coins": "{n}\uCF54\uC778",
    "unlock.upgrades": "\uAC15\uD654\uAC00 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.shelter": "\uBCF4\uD638\uC18C\uAC00 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.missions": "\uC624\uB298\uC758 \uC784\uBB34\uAC00 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.daily": "\uC624\uB298\uC758 \uB3C4\uC804\uC774 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.decor": "\uBCF4\uD638\uC18C \uAFB8\uBBF8\uAE30\uAC00 \uC5F4\uB838\uC5B4\uC694!",
    "unlock.region": "{name}\uC5D0 \uAC08 \uC218 \uC788\uC5B4\uC694!",
    "settings.title": "\uC124\uC815",
    "settings.music": "\uBC30\uACBD\uC74C",
    "settings.sfx": "\uD6A8\uACFC\uC74C",
    "settings.vibration": "\uC9C4\uB3D9",
    "settings.language": "\uC5B8\uC5B4",
    "settings.lang.auto": "\uAE30\uAE30 \uC124\uC815",
    "settings.lang.ko": "\uD55C\uAD6D\uC5B4",
    "settings.lang.en": "English",
    "settings.graphics": "\uADF8\uB798\uD53D",
    "settings.gfx.low": "\uB0AE\uC74C",
    "settings.gfx.medium": "\uBCF4\uD1B5",
    "settings.gfx.high": "\uB192\uC74C",
    "settings.gfxNote": "\uB0AE\uC74C\uC740 \uBC30\uD130\uB9AC\uB97C \uC544\uAEF4\uC694",
    "settings.contrast": "\uBB3C\uBC29\uC6B8 \uC798 \uBCF4\uC774\uAC8C",
    "settings.contrastNote": "\uC801\uC758 \uBB3C\uBC29\uC6B8\uC744 \uB178\uB780 \uD14C\uB450\uB9AC\uB85C \uD45C\uC2DC\uD574\uC694",
    "settings.on": "\uCF2C",
    "settings.off": "\uB054",
    "settings.reset": "\uC9C4\uD589 \uCD08\uAE30\uD654",
    "settings.resetConfirm": "\uBAA8\uB4E0 \uC9C4\uD589 \uC0C1\uD669\uC774 \uC9C0\uC6CC\uC838\uC694. \uC815\uB9D0 \uCC98\uC74C\uBD80\uD130 \uD560\uAE4C\uC694?",
    "settings.resetYes": "\uCC98\uC74C\uBD80\uD130",
    "settings.credits": "\uB9CC\uB4E0 \uC774",
    "settings.creditsText": "\uAE30\uD68D\xB7\uAC1C\uBC1C\xB7\uC544\uD2B8\xB7\uC0AC\uC6B4\uB4DC: \uBB3C\uCD1D \uAD6C\uC870\uB300 \uD300\n\uAE00\uAF34: Jua, Fredoka (SIL Open Font License)\n\uC545\uAE30 \uC74C\uC6D0: FluidR3 GM (MIT)",
    "settings.version": "\uBC84\uC804 {v}",
    "time.hm": "{h}\uC2DC\uAC04 {m}\uBD84",
    "time.m": "{m}\uBD84",
    "coins.n": "{n}",
    "stage.helpTitle": "\uCE5C\uAD6C\uB4E4\uC774 \uC751\uC6D0\uD558\uB7EC \uC654\uC5B4\uC694!",
    "festival.title": "\uC8FC\uB9D0 \uBB3C\uB180\uC774 \uCD95\uC81C",
    "festival.desc": "\uD1A0\uC694\uC77C\uACFC \uC77C\uC694\uC77C\uC5D0\uB294 \uAD6C\uC5ED\uC5D0\uC11C \uBAA8\uC740 \uCF54\uC778\uC774 {x}\uBC30!",
    "festival.left": "\uCD95\uC81C \uB05D\uAE4C\uC9C0 {t}",
    "festival.next": "\uD1A0\xB7\uC77C\uC694\uC77C\uC5D4 \uC8FC\uB9D0 \uCD95\uC81C: \uCF54\uC778 \xD7{x}",
    "result.festival": "\uC8FC\uB9D0 \uCD95\uC81C \xD7{x}",
    "time.dh": "{d}\uC77C {h}\uC2DC\uAC04",
    "festival.pill": "\uCD95\uC81C \xD7{x}",
    "evolve.dmg": "\uD53C\uD574 +{v}%",
    "evolve.width": "\uAD75\uAE30 +{v}%",
    "evolve.splash": "\uBB3C\uBCF4\uB77C +{v}%",
    "evolve.range": "\uC0AC\uAC70\uB9AC +{v}"
  };

  // data/i18n/en.json
  var en_default = {
    "app.title": "Splash Rescue",
    "common.close": "Close",
    "common.back": "Back",
    "common.ok": "OK",
    "common.cancel": "Cancel",
    "common.yes": "Yes",
    "common.no": "No",
    "common.claim": "Claim",
    "common.claimed": "Claimed",
    "common.new": "NEW",
    "common.locked": "Locked",
    "common.max": "MAX",
    "loading.text": "Filling the water gun\u2026",
    "title.tap": "Tap to start",
    "title.play": "Start rescue!",
    "hud.lv": "Lv {n}",
    "hud.room": "{a}/{b}",
    "hint.drag": "Drag to move",
    "hint.stop": "Let go to spray!",
    "hint.rescue": "Spray to set it free!",
    "hint.gate": "Head to the exit!",
    "hint.range": "Get a bit closer!",
    "hint.pressure": "Stay still to build pressure!",
    "toast.pressure": "Full pressure!",
    "toast.rescued": "{name} rescued!",
    "toast.brave": "Brave rescue!",
    "toast.cheer": "Cheer +{p}",
    "toast.clean": "All clean!",
    "toast.newMonster": "New goo",
    "toast.bossPhase": "It's angry! Careful!",
    "toast.waveIncoming": "More goo coming!",
    "levelup.title": "Level up!",
    "levelup.pick": "Pick one",
    "levelup.stack": "Tier {n}",
    "skill.thick.name": "Thick Stream",
    "skill.thick.desc": "Stream damage +22%, width +15%",
    "skill.range.name": "Long Reach",
    "skill.range.desc": "Reach +15%",
    "skill.multi.name": "Split Stream",
    "skill.multi.desc": "An extra stream washes another goo (55% damage)",
    "skill.pierce.name": "Piercing Stream",
    "skill.pierce.desc": "The stream goes through and hits goo behind (70% damage)",
    "skill.chain.name": "Bouncing Stream",
    "skill.chain.desc": "Water bounces to a nearby goo (50% damage)",
    "skill.splash.name": "Big Splash",
    "skill.splash.desc": "Bursting goo splashes harder: +60% damage, +25% area",
    "skill.turbo.name": "Pressure Turbo",
    "skill.turbo.desc": "Pressure fills 45% faster. Full-pressure power +0.2x",
    "skill.keep.name": "Steady Pressure",
    "skill.keep.desc": "Moving drains 55% less pressure",
    "skill.speed.name": "Quick Feet",
    "skill.speed.desc": "Move speed +12%, less slowed by goo",
    "skill.shield.name": "Bubble Shield",
    "skill.shield.desc": "Blocks one hit. Comes back every {s}s",
    "skill.trail.name": "Bubble Trail",
    "skill.trail.desc": "Moving leaves bubbles that pop on goo",
    "skill.magnet.name": "Drop Magnet",
    "skill.magnet.desc": "Pickup range +80%, XP +15%",
    "skill.vitality.name": "Toughness",
    "skill.vitality.desc": "Max HP +20%, heal 20%",
    "skill.heal.name": "Heal",
    "skill.heal.desc": "Heal 40% HP",
    "pause.title": "Paused",
    "pause.resume": "Resume",
    "pause.quit": "Leave this run",
    "pause.quitNote": "Animals and coins you got so far are kept.",
    "pause.settings": "Settings",
    "revive.title": "Covered in goo!",
    "revive.desc": "You can get back up once per run.",
    "revive.yes": "Get back up",
    "revive.no": "End run",
    "result.clear": "Area cleaned!",
    "result.fail": "Good try!",
    "result.quit": "Run ended",
    "result.coins": "Coins",
    "result.animals": "Rescued",
    "result.washed": "Goo washed",
    "result.rooms": "Rooms cleaned",
    "result.firstClear": "First clear bonus",
    "result.clearBonus": "Clear bonus",
    "result.kept": "You keep every animal and coin!",
    "result.tapSkip": "Tap to skip",
    "result.next": "Next area",
    "result.again": "Play again",
    "result.retry": "Try again",
    "result.map": "Map",
    "result.home": "To shelter",
    "result.bond": "Bond {n}",
    "result.newFriend": "New friend!",
    "result.upgradeHint": "Power up with coins!",
    "result.tip.spitter": "Dodge Spitter droplets before you stop.",
    "result.tip.contact": "Build pressure before goo gets close.",
    "result.tip.dasher": "When a Dasher shows its line, step aside.",
    "result.tip.jumper": "Step out of the Bouncer's landing ring.",
    "result.tip.chunky": "When Chunky glows, slip between its droplets.",
    "result.tip.boss": "When the King jumps, leave its shadow.",
    "result.tip.upgrade": "More Stream Power washes goo much faster.",
    "result.tip.generic": "Power up and come back \u2014 it will be clean in no time.",
    "upgrade.title": "Upgrades",
    "upgrade.buy": "{n}",
    "upgrade.lv": "Lv {n}",
    "upgrade.maxed": "Maxed",
    "upgrade.notEnough": "Not enough coins",
    "upgrade.power.name": "Stream Power",
    "upgrade.power.desc": "Damage +12%, width +5% per level",
    "upgrade.range.name": "Reach",
    "upgrade.range.desc": "Reach +4% per level",
    "upgrade.health.name": "Health",
    "upgrade.health.desc": "Max HP +10% per level",
    "upgrade.pressure.name": "Pressure",
    "upgrade.pressure.desc": "Fills 5% faster, full-pressure power +0.05x per level",
    "upgrade.splash.name": "Splash",
    "upgrade.splash.desc": "Burst splash damage +10% and wider per level",
    "upgrade.stat.power": "Damage {a} \u2192 {b}",
    "upgrade.stat.range": "Reach {a} \u2192 {b}",
    "upgrade.stat.health": "HP {a} \u2192 {b}",
    "upgrade.stat.pressure": "Full pressure {a} \u2192 {b}",
    "upgrade.stat.splash": "Splash {a} \u2192 {b}",
    "upgrade.gunNext": "{n} more upgrades to evolve",
    "upgrade.gunFinal": "The ultimate cannon!",
    "upgrade.dream": "One day this cannon will wash a whole forest",
    "gun.0": "Tiny Squirt",
    "gun.1": "Pump Blaster",
    "gun.2": "Twin Blaster",
    "gun.3": "Tank Blaster",
    "gun.4": "Fire Hose",
    "gun.5": "Water Cannon",
    "gun.6": "Mega Cannon",
    "gun.evolved": "Your water gun evolved!",
    "region.forest": "Sunny Forest",
    "region.village": "Windmill Village",
    "region.lake": "Sparkle Lake",
    "stage.label": "{r} {n}",
    "stage.short": "Area {n}",
    "stage.play": "Go!",
    "stage.animals": "Animals here",
    "stage.cleared": "Cleaned",
    "stage.best": "Best",
    "stage.boss": "Boss",
    "stage.newGoo": "New goo",
    "stage.locked": "Clean the previous area first",
    "stage.helpOffer": "This run: +{hp}% HP, +{dmg}% damage",
    "map.title": "Map",
    "map.progress": "{a}/{b} cleaned",
    "nav.upgrade": "Upgrades",
    "nav.map": "Adventure",
    "nav.shelter": "Shelter",
    "shelter.title": "Animal Shelter",
    "shelter.count": "{a}/{b} friends",
    "shelter.empty": "Not met yet",
    "shelter.where": "Found in {place}",
    "shelter.whereStreak": "Visits on login day {n}",
    "shelter.gifts": "Gifts",
    "shelter.collect": "Collect gifts",
    "shelter.giftReady": "Gifts: {n} coins",
    "shelter.giftNone": "Gathering gifts",
    "shelter.giftRate": "{n}/hour \xB7 max {h}h",
    "shelter.bond": "Bond {n}",
    "shelter.bondNext": "Rescue {n} more to raise bond",
    "shelter.bondMax": "Max bond!",
    "shelter.rescued": "Rescued {n} times",
    "shelter.bonusTitle": "Bonus",
    "shelter.decor": "Decorate",
    "shelter.decorDesc": "Gifts +10%",
    "shelter.decorOwned": "Placed",
    "shelter.list": "Album",
    "shelter.totalBonus": "Friend bonuses",
    "species.puppy": "Puppy",
    "species.bunny": "Bunny",
    "species.squirrel": "Squirrel",
    "species.fox": "Fox",
    "species.hedgehog": "Hedgehog",
    "species.fawn": "Fawn",
    "species.kitten": "Kitten",
    "species.duckling": "Duckling",
    "species.piglet": "Piglet",
    "species.lamb": "Lamb",
    "species.chick": "Chick",
    "species.otter": "Otter",
    "species.turtle": "Turtle",
    "species.frog": "Frog",
    "species.penguin": "Penguin",
    "species.panda": "Panda",
    "bonus.maxHp": "Max HP +{v}",
    "bonus.move": "Move speed +{v}",
    "bonus.coins": "Coins +{v}",
    "bonus.damage": "Stream damage +{v}",
    "bonus.armor": "Damage taken -{v}",
    "bonus.range": "Reach +{v}",
    "bonus.charge": "Pressure fill speed +{v}",
    "bonus.xp": "XP +{v}",
    "bonus.gifts": "Shelter gifts +{v}",
    "bonus.rescueHeal": "Heal on rescue +{v}",
    "bonus.splash": "Splash +{v}",
    "bonus.pickup": "Pickup range +{v}",
    "bonus.revive": "Revive HP +{v}",
    "bonus.gooWalk": "Speed on goo +{v}",
    "bonus.pressureMax": "Full-pressure power +{v}",
    "bonus.all": "Damage, HP, coins +{v}",
    "decor.ball": "Ball",
    "decor.cushion": "Cushion",
    "decor.bowl": "Food Bowl",
    "decor.flowers": "Flower Bed",
    "decor.pond": "Little Pond",
    "decor.treehouse": "Tree House",
    "decor.slide": "Slide",
    "decor.fountain": "Fountain",
    "monster.blob": "Blobby",
    "monster.blob.desc": "Hops toward you",
    "monster.spitter": "Spitter",
    "monster.spitter.desc": "Spits goo droplets",
    "monster.splitter": "Splitter",
    "monster.splitter.desc": "Splits in two when washed",
    "monster.mini": "Mini",
    "monster.mini.desc": "Small and quick",
    "monster.dasher": "Dasher",
    "monster.dasher.desc": "Draws a line, then dashes",
    "monster.chunky": "Chunky",
    "monster.chunky.desc": "Glows, then sprays all around",
    "monster.nest": "Goo Nest",
    "monster.nest.desc": "Keeps making goo",
    "monster.jumper": "Bouncer",
    "monster.jumper.desc": "Lands where its shadow is",
    "monster.flyer": "Flutter",
    "monster.flyer.desc": "Flies over obstacles",
    "monster.boss": "King Goo",
    "monster.boss.desc": "King of all the goo here",
    "mission.wash": "Wash {n} goo",
    "mission.rescue": "Rescue {n} animals",
    "mission.rooms": "Clean {n} rooms",
    "mission.pressure": "Reach full pressure {n} times",
    "mission.clear": "Clean up {n} areas",
    "mission.gifts": "Collect shelter gifts",
    "mission.nohit": "Clear {n} rooms without a hit",
    "missions.title": "Today's Tasks",
    "missions.all": "Finish all",
    "missions.resetIn": "New tasks in {h}h {m}m",
    "daily.title": "Daily Challenge",
    "daily.play": "Play",
    "daily.reward": "{n} coins on first clear",
    "daily.done": "Done today! Replays give {n} coins",
    "daily.streak": "{n}-day streak",
    "daily.mod.big": "Big Goo Day",
    "daily.mod.big.desc": "Goo is big and tough. Double coins!",
    "daily.mod.fast": "Speedy Day",
    "daily.mod.fast.desc": "Goo is fast. Your stream is 1.3x too!",
    "daily.mod.swarm": "Swarm Day",
    "daily.mod.swarm.desc": "Lots of goo! 1.5x coins",
    "daily.mod.rain": "Droplet Day",
    "daily.mod.rain.desc": "Faster droplets. 1.5x coins",
    "streak.title": "Daily Stamps",
    "streak.day": "Day {n}",
    "streak.today": "Today's gift",
    "streak.tomorrow": "Tomorrow",
    "streak.visitor": "{name} comes to visit!",
    "streak.tomorrowHint": "Come back tomorrow for {gift}",
    "streak.coins": "{n} coins",
    "unlock.upgrades": "Upgrades unlocked!",
    "unlock.shelter": "Shelter unlocked!",
    "unlock.missions": "Daily tasks unlocked!",
    "unlock.daily": "Daily Challenge unlocked!",
    "unlock.decor": "Shelter decorating unlocked!",
    "unlock.region": "{name} is now open!",
    "settings.title": "Settings",
    "settings.music": "Music",
    "settings.sfx": "Sound effects",
    "settings.vibration": "Vibration",
    "settings.language": "Language",
    "settings.lang.auto": "Device",
    "settings.lang.ko": "\uD55C\uAD6D\uC5B4",
    "settings.lang.en": "English",
    "settings.graphics": "Graphics",
    "settings.gfx.low": "Low",
    "settings.gfx.medium": "Medium",
    "settings.gfx.high": "High",
    "settings.gfxNote": "Low saves battery",
    "settings.contrast": "High-visibility droplets",
    "settings.contrastNote": "Enemy droplets get a bright yellow ring",
    "settings.on": "On",
    "settings.off": "Off",
    "settings.reset": "Reset progress",
    "settings.resetConfirm": "All progress will be erased. Start over?",
    "settings.resetYes": "Start over",
    "settings.credits": "Credits",
    "settings.creditsText": "Design, code, art, sound: Splash Rescue team\nFonts: Jua, Fredoka (SIL Open Font License)\nInstrument samples: FluidR3 GM (MIT)",
    "settings.version": "Version {v}",
    "time.hm": "{h}h {m}m",
    "time.m": "{m}m",
    "coins.n": "{n}",
    "stage.helpTitle": "Your friends came to cheer!",
    "festival.title": "Weekend Splash Festival",
    "festival.desc": "Every Saturday and Sunday, coins you collect in areas are boosted \xD7{x}!",
    "festival.left": "Ends in {t}",
    "festival.next": "Weekend festival every Sat & Sun: coins \xD7{x}",
    "result.festival": "Weekend festival \xD7{x}",
    "time.dh": "{d}d {h}h",
    "festival.pill": "Festival \xD7{x}",
    "evolve.dmg": "Damage +{v}%",
    "evolve.width": "Width +{v}%",
    "evolve.splash": "Splash +{v}%",
    "evolve.range": "Range +{v}"
  };

  // src/i18n/index.ts
  var TABLES = { ko: ko_default, en: en_default };
  var lang = "en";
  var listeners3 = [];
  function deviceLang() {
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (const l of list) {
      const k = l.toLowerCase().slice(0, 2);
      if (k === "ko") return "ko";
      if (k === "en") return "en";
    }
    return "en";
  }
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    for (const f of listeners3) f();
  }
  function onLangChange(f) {
    listeners3.push(f);
  }
  function t(key, params) {
    let s = TABLES[lang][key] ?? TABLES.en[key];
    if (s === void 0) {
      if (true) console.warn("missing string", key);
      return key;
    }
    if (params) s = s.replace(/\{(\w+)\}/g, (_, k) => params[k] !== void 0 ? String(params[k]) : `{${k}}`);
    return s;
  }
  function num(n) {
    return Math.round(n).toLocaleString(lang === "ko" ? "ko-KR" : "en-US");
  }
  function pct(f) {
    const v = Math.round(f * 1e3) / 10;
    return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}%`;
  }

  // src/main.ts
  init_save();
  init_analytics();

  // src/services/platform.ts
  var GuestAuth = class {
    constructor() {
      this.me = null;
    }
    current() {
      return this.me;
    }
    async signInSilently() {
      this.me = this.me ?? { id: "guest", displayName: "Guest", provider: "guest" };
      return this.me;
    }
    async signIn() {
      return this.signInSilently();
    }
    async signOut() {
      this.me = null;
    }
  };
  var LocalOnlyCloudSave = class {
    async pull() {
      return null;
    }
    async push() {
      return true;
    }
  };
  var auth = new GuestAuth();
  var cloud = new LocalOnlyCloudSave();

  // src/ui/dom.ts
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === void 0 || v === false) continue;
      if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "class") el.className = String(v);
      else if (k === "style") el.setAttribute("style", String(v));
      else if (k === "html") el.innerHTML = String(v);
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, String(v));
    }
    for (const c of kids) if (c !== null && c !== void 0 && c !== false) el.append(c instanceof Node ? c : document.createTextNode(c));
    return el;
  }
  var pageSize = /* @__PURE__ */ new Map();
  function icon(name, size, cls = "") {
    const el = document.createElement("span");
    el.className = "ico " + cls;
    setIcon(el, name, size);
    return el;
  }
  function setIcon(el, name, size) {
    const f = frame(name);
    el.style.width = el.style.height = size + "px";
    if (!f) {
      el.style.backgroundImage = "none";
      return;
    }
    const src = f.img.src;
    let ps = pageSize.get(src);
    if (!ps) {
      ps = [f.img.naturalWidth, f.img.naturalHeight];
      pageSize.set(src, ps);
    }
    const k = size / Math.max(f.w, f.h);
    const ox = (size - f.w * k) / 2, oy = (size - f.h * k) / 2;
    el.style.boxSizing = "border-box";
    el.style.padding = `${oy}px ${ox}px`;
    el.style.backgroundOrigin = el.style.backgroundClip = "content-box";
    el.style.backgroundImage = `url("${src}")`;
    el.style.backgroundSize = `${ps[0] * k}px ${ps[1] * k}px`;
    el.style.backgroundPosition = `${-f.x * k}px ${-f.y * k}px`;
    el.style.backgroundRepeat = "no-repeat";
  }
  function once(fn, ms = 450) {
    let busy = false;
    return () => {
      if (busy) return;
      busy = true;
      fn();
      setTimeout(() => busy = false, ms);
    };
  }

  // src/ui/modal.ts
  var stack = [];
  var layer;
  function initModals(root) {
    layer = root;
  }
  function isOpen(id) {
    return id ? stack.some((m) => m.id === id) : stack.length > 0;
  }
  function openModal(body, o) {
    const existing = stack.find((m) => m.id === o.id);
    if (existing) return existing.el;
    const closeBtn = o.closable !== false ? h("button", { class: "btn-close", "aria-label": t("common.close"), onclick: () => closeModal(o.id) }, icon("ic_close", 26)) : null;
    const head = o.title ? h("div", { class: "modal-head" }, o.titleIcon ? icon(o.titleIcon, 34, "modal-ticon") : null, h("div", { class: "modal-title" }, o.title), closeBtn) : closeBtn ? h("div", { class: "modal-head bare" }, closeBtn) : null;
    const scroller = h("div", { class: "modal-body" + (o.noPad ? " nopad" : "") }, body);
    const card = h("div", { class: "modal-card " + (o.cls ?? "") }, head, scroller);
    const back = h("div", { class: "modal-back" }, card);
    back.addEventListener("pointerdown", (e) => {
      if (e.target === back && o.closable !== false) closeModal(o.id);
    });
    layer.appendChild(back);
    requestAnimationFrame(() => back.classList.add("show"));
    stack.push({ id: o.id, el: back, opts: o, openedAt: performance.now() });
    audio.play("ui_open", { vol: 0.6 });
    return back;
  }
  function closeModal(id, silent = false) {
    const i = stack.findIndex((m2) => m2.id === id);
    if (i < 0) return;
    const m = stack[i];
    if (performance.now() - m.openedAt < 220) return;
    stack.splice(i, 1);
    m.el.classList.remove("show");
    m.el.classList.add("hide");
    m.el.style.pointerEvents = "none";
    setTimeout(() => m.el.remove(), 220);
    if (!silent) audio.play("ui_close", { vol: 0.5 });
    m.opts.onClose?.();
  }
  function closeAll() {
    for (const m of [...stack]) {
      m.openedAt = 0;
      closeModal(m.id, true);
    }
  }
  var toastEl = null;
  function toast(text, iconName, ms = 1800) {
    if (!toastEl) {
      toastEl = h("div", { class: "toast" });
      document.getElementById("ui").appendChild(toastEl);
    }
    toastEl.replaceChildren(...iconName ? [icon(iconName, 28)] : [], h("span", {}, text));
    toastEl.classList.remove("show");
    void toastEl.offsetWidth;
    toastEl.classList.add("show");
    const el = toastEl;
    clearTimeout(el._t);
    el._t = window.setTimeout(() => el.classList.remove("show"), ms);
  }

  // virtual:levels
  var levels_default = [{ id: "forest-01", stage: 1, region: "forest", intro: "blob", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 100, y: 210 }, { t: "tree", x: 482, y: 380 }, { t: "pine", x: 86, y: 610 }, { t: "bush", x: 478, y: 690 }, { t: "rock", x: 168, y: 430 }, { t: "stump", x: 440, y: 170 }], goo: [{ x: 190, y: 560, r: 80 }, { x: 390, y: 520, r: 72 }, { x: 288, y: 330, r: 84 }, { x: 140, y: 300, r: 56 }, { x: 430, y: 740, r: 52 }, { x: 290, y: 640, r: 50 }], monsters: [{ t: "blob", x: 205, y: 545 }, { t: "blob", x: 375, y: 560 }, { t: "spitter", x: 288, y: 300 }], animals: [{ s: "puppy", x: 288, y: 445 }], start: { x: 288, y: 850 } }, { terrain: [".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".......##...", ".......##...", "......##....", "......##....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 110, y: 360 }, { t: "tree", x: 470, y: 230 }, { t: "log", x: 380, y: 520 }, { t: "bush", x: 130, y: 660 }, { t: "rock", x: 450, y: 720 }, { t: "pine", x: 90, y: 160 }], goo: [{ x: 180, y: 250, r: 90 }, { x: 400, y: 350, r: 82 }, { x: 250, y: 520, r: 76 }, { x: 450, y: 620, r: 56 }, { x: 300, y: 190, r: 64 }, { x: 180, y: 760, r: 48 }], monsters: [{ t: "blob", x: 210, y: 430 }, { t: "blob", x: 340, y: 400 }, { t: "blob", x: 420, y: 300 }, { t: "spitter", x: 190, y: 240 }, { t: "blob", x: 290, y: 280, w: 1 }, { t: "blob", x: 170, y: 500, w: 1 }], animals: [{ s: "bunny", x: 150, y: 175 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 96, y: 470 }, { t: "tree", x: 480, y: 470 }, { t: "rock", x: 200, y: 280 }, { t: "rock", x: 376, y: 280 }, { t: "bush", x: 288, y: 670 }, { t: "pine", x: 480, y: 150 }, { t: "pine", x: 92, y: 160 }], goo: [{ x: 288, y: 340, r: 110 }, { x: 130, y: 620, r: 72 }, { x: 450, y: 630, r: 72 }, { x: 288, y: 170, r: 72 }], monsters: [{ t: "blob", x: 240, y: 390 }, { t: "blob", x: 336, y: 390 }, { t: "spitter", x: 288, y: 210 }, { t: "blob", x: 140, y: 580, w: 1 }, { t: "blob", x: 440, y: 580, w: 1 }, { t: "spitter", x: 288, y: 380, w: 1 }], animals: [{ s: "squirrel", x: 288, y: 290 }], start: { x: 288, y: 860 } }] }, { id: "forest-02", stage: 2, region: "forest", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 448, y: 272 }, { t: "tree", x: 485, y: 145 }, { t: "tree", x: 100, y: 725 }, { t: "fence", x: 116, y: 328 }], goo: [{ x: 174, y: 189, r: 79 }, { x: 497, y: 557, r: 86 }, { x: 235, y: 151, r: 80 }, { x: 469, y: 503, r: 51 }, { x: 401, y: 223, r: 49 }], monsters: [{ t: "spitter", x: 168, y: 207 }, { t: "blob", x: 476, y: 576 }, { t: "blob", x: 232, y: 142 }], animals: [{ s: "puppy", x: 340, y: 190 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", "......##....", "......##....", "......##....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 485, y: 811 }, { t: "tree", x: 490, y: 242 }, { t: "tree", x: 130, y: 360 }, { t: "pine", x: 89, y: 488 }, { t: "bush", x: 179, y: 646 }, { t: "rock", x: 177, y: 471 }], goo: [{ x: 152, y: 175, r: 88 }, { x: 439, y: 481, r: 75 }, { x: 481, y: 355, r: 70 }, { x: 337, y: 261, r: 83 }, { x: 92, y: 611, r: 66 }, { x: 415, y: 302, r: 58 }, { x: 343, y: 298, r: 55 }], monsters: [{ t: "spitter", x: 134, y: 179 }, { t: "spitter", x: 411, y: 499 }, { t: "blob", x: 455, y: 345 }, { t: "blob", x: 355, y: 245 }], animals: [{ s: "bunny", x: 302, y: 384 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 127, y: 174 }, { t: "tree", x: 87, y: 472 }, { t: "tree", x: 447, y: 597 }, { t: "tree", x: 480, y: 307 }, { t: "tree", x: 431, y: 168 }, { t: "rock", x: 309, y: 220 }, { t: "bush", x: 106, y: 634 }, { t: "stump", x: 373, y: 753 }], goo: [{ x: 217, y: 462, r: 67 }, { x: 387, y: 528, r: 87 }, { x: 272, y: 368, r: 85 }, { x: 142, y: 745, r: 56 }, { x: 348, y: 398, r: 86 }, { x: 356, y: 248, r: 71 }, { x: 224, y: 278, r: 69 }], monsters: [{ t: "blob", x: 237, y: 434 }, { t: "spitter", x: 381, y: 511 }, { t: "blob", x: 278, y: 362 }, { t: "blob", x: 158, y: 719, w: 1 }, { t: "spitter", x: 354, y: 405, w: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "forest-03", stage: 3, region: "forest", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".......##...", ".......##...", ".......##...", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 93, y: 562 }, { t: "tree", x: 478, y: 384 }, { t: "pine", x: 136, y: 793 }, { t: "tree", x: 133, y: 334 }, { t: "bush", x: 375, y: 654 }, { t: "fence", x: 227, y: 550 }, { t: "rock", x: 335, y: 510 }], goo: [{ x: 99, y: 233, r: 78 }, { x: 229, y: 351, r: 84 }, { x: 337, y: 603, r: 81 }, { x: 489, y: 499, r: 72 }, { x: 405, y: 418, r: 53 }, { x: 278, y: 247, r: 52 }, { x: 267, y: 204, r: 61 }], monsters: [{ t: "splitter", x: 123, y: 248 }, { t: "blob", x: 251, y: 333 }, { t: "blob", x: 359, y: 591 }], animals: [{ s: "squirrel", x: 492, y: 300 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 115, y: 744 }, { t: "pine", x: 435, y: 213 }, { t: "tree", x: 91, y: 414 }, { t: "bush", x: 212, y: 546 }, { t: "bush", x: 336, y: 530 }], goo: [{ x: 447, y: 377, r: 73 }, { x: 177, y: 332, r: 57 }, { x: 482, y: 308, r: 61 }, { x: 168, y: 420, r: 83 }, { x: 333, y: 443, r: 73 }, { x: 113, y: 556, r: 57 }, { x: 300, y: 705, r: 54 }], monsters: [{ t: "splitter", x: 428, y: 389 }, { t: "blob", x: 200, y: 304 }, { t: "blob", x: 472, y: 312 }, { t: "splitter", x: 191, y: 438 }], animals: [{ s: "puppy", x: 94, y: 306 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 129, y: 191 }, { t: "tree", x: 445, y: 567 }, { t: "tree", x: 109, y: 805 }, { t: "tree", x: 494, y: 463 }, { t: "pine", x: 444, y: 731 }, { t: "fence", x: 359, y: 629 }, { t: "bush", x: 80, y: 390 }], goo: [{ x: 355, y: 433, r: 72 }, { x: 163, y: 288, r: 78 }, { x: 235, y: 356, r: 67 }, { x: 319, y: 199, r: 62 }, { x: 417, y: 283, r: 83 }, { x: 141, y: 538, r: 70 }, { x: 311, y: 372, r: 56 }, { x: 91, y: 751, r: 51 }], monsters: [{ t: "blob", x: 365, y: 410 }, { t: "blob", x: 138, y: 286 }, { t: "splitter", x: 241, y: 332 }, { t: "blob", x: 297, y: 201, w: 1 }, { t: "spitter", x: 393, y: 257, w: 1 }], animals: [], start: { x: 288, y: 860 } }], intro: "splitter" }, { id: "forest-04", stage: 4, region: "forest", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".......##...", ".......##...", ".......##...", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 95, y: 254 }, { t: "pine", x: 95, y: 190 }, { t: "tree", x: 105, y: 558 }, { t: "tree", x: 449, y: 499 }, { t: "tree", x: 147, y: 616 }, { t: "bush", x: 390, y: 208 }, { t: "stump", x: 414, y: 680 }, { t: "stump", x: 438, y: 298 }], goo: [{ x: 186, y: 234, r: 84 }, { x: 316, y: 197, r: 82 }, { x: 216, y: 302, r: 62 }, { x: 102, y: 697, r: 61 }, { x: 349, y: 727, r: 60 }, { x: 324, y: 572, r: 72 }, { x: 442, y: 421, r: 54 }], monsters: [{ t: "splitter", x: 165, y: 208 }, { t: "splitter", x: 295, y: 211 }, { t: "splitter", x: 226, y: 317 }], animals: [{ s: "fox", x: 323, y: 451 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##....."], obstacles: [{ t: "log", x: 93, y: 334 }, { t: "stump", x: 449, y: 603 }, { t: "boulder", x: 186, y: 269 }, { t: "log", x: 344, y: 524 }, { t: "pine", x: 441, y: 702 }, { t: "tree", x: 488, y: 178 }, { t: "bush", x: 493, y: 419 }, { t: "rock", x: 305, y: 648 }, { t: "fence", x: 238, y: 510 }], goo: [{ x: 401, y: 217, r: 75 }, { x: 161, y: 607, r: 55 }, { x: 272, y: 341, r: 68 }, { x: 282, y: 171, r: 89 }, { x: 99, y: 652, r: 63 }, { x: 380, y: 438, r: 69 }, { x: 480, y: 310, r: 62 }], monsters: [{ t: "spitter", x: 413, y: 194 }, { t: "splitter", x: 156, y: 592 }, { t: "blob", x: 292, y: 351 }, { t: "splitter", x: 279, y: 152 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 447, y: 224 }, { t: "tree", x: 80, y: 331 }, { t: "pine", x: 476, y: 506 }, { t: "pine", x: 432, y: 734 }, { t: "tree", x: 143, y: 560 }, { t: "rock", x: 280, y: 272 }, { t: "bush", x: 290, y: 347 }], goo: [{ x: 158, y: 276, r: 78 }, { x: 193, y: 562, r: 85 }, { x: 102, y: 236, r: 79 }, { x: 256, y: 169, r: 89 }, { x: 182, y: 478, r: 55 }, { x: 165, y: 280, r: 52 }, { x: 246, y: 231, r: 63 }], monsters: [{ t: "spitter", x: 165, y: 268 }, { t: "spitter", x: 221, y: 546 }, { t: "blob", x: 118, y: 209 }, { t: "splitter", x: 272, y: 143, w: 1 }, { t: "blob", x: 204, y: 472, w: 1 }], animals: [{ s: "bunny", x: 374, y: 183 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", "......##....", "......##....", "......##....", ".....##.....", ".....##....."], obstacles: [{ t: "log", x: 146, y: 310 }, { t: "rock", x: 389, y: 600 }, { t: "stump", x: 370, y: 700 }, { t: "log", x: 217, y: 242 }, { t: "pine", x: 88, y: 546 }, { t: "pine", x: 123, y: 226 }, { t: "tree", x: 436, y: 705 }, { t: "fence", x: 213, y: 712 }, { t: "rock", x: 340, y: 205 }, { t: "fence", x: 312, y: 452 }], goo: [{ x: 418, y: 153, r: 70 }, { x: 227, y: 375, r: 87 }, { x: 440, y: 385, r: 81 }, { x: 224, y: 538, r: 56 }, { x: 63, y: 420, r: 60 }, { x: 114, y: 459, r: 85 }, { x: 228, y: 376, r: 70 }, { x: 402, y: 763, r: 52 }], monsters: [{ t: "spitter", x: 411, y: 158 }, { t: "blob", x: 228, y: 364 }, { t: "spitter", x: 443, y: 392 }, { t: "blob", x: 224, y: 511, w: 1 }, { t: "spitter", x: 84, y: 397, w: 1 }, { t: "blob", x: 130, y: 470, w: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "forest-05", stage: 5, region: "forest", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 432, y: 302 }, { t: "pine", x: 111, y: 276 }, { t: "tree", x: 482, y: 570 }, { t: "pine", x: 495, y: 732 }, { t: "tree", x: 107, y: 475 }, { t: "bush", x: 298, y: 315 }, { t: "rock", x: 188, y: 433 }, { t: "bush", x: 157, y: 603 }], goo: [{ x: 257, y: 520, r: 82 }, { x: 308, y: 191, r: 86 }, { x: 356, y: 148, r: 71 }, { x: 246, y: 502, r: 60 }, { x: 217, y: 493, r: 46 }], monsters: [{ t: "blob", x: 260, y: 529 }, { t: "blob", x: 307, y: 209 }, { t: "dasher", x: 340, y: 138 }], animals: [{ s: "fox", x: 222, y: 217 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "....##......", "....##......", "....##......", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 435, y: 514 }, { t: "pine", x: 444, y: 252 }, { t: "tree", x: 483, y: 737 }, { t: "pine", x: 124, y: 375 }, { t: "bush", x: 153, y: 480 }, { t: "fence", x: 106, y: 681 }], goo: [{ x: 162, y: 120, r: 58 }, { x: 301, y: 541, r: 66 }, { x: 401, y: 274, r: 55 }, { x: 167, y: 283, r: 80 }, { x: 141, y: 809, r: 73 }, { x: 134, y: 569, r: 67 }], monsters: [{ t: "spitter", x: 170, y: 121 }, { t: "dasher", x: 283, y: 530 }, { t: "dasher", x: 378, y: 288 }, { t: "spitter", x: 164, y: 259 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".......##...", ".......##...", ".......##...", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 126, y: 155 }, { t: "tree", x: 461, y: 684 }, { t: "pine", x: 120, y: 343 }, { t: "tree", x: 88, y: 281 }, { t: "tree", x: 110, y: 486 }, { t: "stump", x: 199, y: 231 }], goo: [{ x: 422, y: 632, r: 83 }, { x: 364, y: 164, r: 55 }, { x: 350, y: 279, r: 62 }, { x: 495, y: 158, r: 59 }, { x: 184, y: 675, r: 68 }, { x: 87, y: 220, r: 63 }, { x: 286, y: 431, r: 48 }, { x: 294, y: 427, r: 70 }], monsters: [{ t: "blob", x: 401, y: 606 }, { t: "blob", x: 375, y: 144 }, { t: "splitter", x: 321, y: 250 }, { t: "splitter", x: 479, y: 147, w: 1 }, { t: "splitter", x: 201, y: 691, w: 1 }], animals: [{ s: "squirrel", x: 211, y: 486 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 87, y: 808 }, { t: "pine", x: 451, y: 373 }, { t: "pine", x: 485, y: 596 }, { t: "tree", x: 463, y: 750 }, { t: "rock", x: 281, y: 515 }], goo: [{ x: 256, y: 234, r: 80 }, { x: 362, y: 644, r: 82 }, { x: 448, y: 213, r: 80 }, { x: 221, y: 576, r: 86 }, { x: 453, y: 296, r: 56 }, { x: 328, y: 338, r: 60 }, { x: 382, y: 486, r: 60 }, { x: 296, y: 770, r: 69 }, { x: 346, y: 810, r: 63 }, { x: 439, y: 320, r: 63 }], monsters: [{ t: "blob", x: 233, y: 217 }, { t: "blob", x: 391, y: 618 }, { t: "blob", x: 445, y: 207 }, { t: "dasher", x: 217, y: 556 }, { t: "blob", x: 450, y: 301, w: 1 }, { t: "blob", x: 323, y: 337, w: 1 }, { t: "spitter", x: 426, y: 460, w: 1 }], animals: [], start: { x: 288, y: 860 } }], intro: "dasher" }, { id: "forest-06", stage: 6, region: "forest", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "....##......", "....##......", "....##......", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 432, y: 331 }, { t: "pine", x: 461, y: 809 }, { t: "tree", x: 437, y: 634 }, { t: "tree", x: 480, y: 524 }, { t: "stump", x: 127, y: 562 }, { t: "stump", x: 279, y: 634 }], goo: [{ x: 284, y: 286, r: 80 }, { x: 260, y: 539, r: 76 }, { x: 170, y: 311, r: 70 }, { x: 173, y: 492, r: 83 }, { x: 313, y: 376, r: 88 }, { x: 205, y: 649, r: 84 }, { x: 314, y: 691, r: 46 }, { x: 307, y: 542, r: 50 }], monsters: [{ t: "mini", x: 264, y: 288 }, { t: "mini", x: 273, y: 515 }, { t: "splitter", x: 155, y: 310 }, { t: "mini", x: 156, y: 489 }, { t: "blob", x: 313, y: 389, w: 1 }, { t: "blob", x: 191, y: 660, w: 1 }, { t: "blob", x: 469, y: 402, w: 1 }, { t: "splitter", x: 388, y: 142, w: 1 }], animals: [{ s: "puppy", x: 216, y: 425 }, { s: "fox", x: 367, y: 506 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "....##......", "....##......", "....##......", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 438, y: 610 }, { t: "pine", x: 112, y: 207 }, { t: "pine", x: 119, y: 556 }, { t: "tree", x: 81, y: 775 }, { t: "fence", x: 341, y: 297 }, { t: "bush", x: 234, y: 572 }, { t: "bush", x: 387, y: 667 }], goo: [{ x: 240, y: 370, r: 61 }, { x: 144, y: 476, r: 68 }, { x: 517, y: 364, r: 86 }, { x: 246, y: 145, r: 67 }, { x: 491, y: 688, r: 79 }, { x: 362, y: 562, r: 81 }, { x: 377, y: 380, r: 64 }, { x: 350, y: 484, r: 61 }, { x: 490, y: 780, r: 72 }], monsters: [{ t: "blob", x: 213, y: 367 }, { t: "blob", x: 138, y: 469 }, { t: "splitter", x: 496, y: 363 }, { t: "blob", x: 256, y: 124, w: 1 }, { t: "blob", x: 480, y: 664, w: 1 }, { t: "blob", x: 334, y: 568, w: 1 }, { t: "blob", x: 305, y: 651, w: 2 }, { t: "blob", x: 345, y: 438, w: 2 }, { t: "mini", x: 193, y: 503, w: 2 }], animals: [{ s: "bunny", x: 486, y: 254 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 86, y: 651 }, { t: "tree", x: 443, y: 389 }, { t: "tree", x: 105, y: 765 }, { t: "tree", x: 91, y: 534 }, { t: "tree", x: 147, y: 729 }, { t: "stump", x: 186, y: 217 }], goo: [{ x: 493, y: 349, r: 67 }, { x: 311, y: 317, r: 61 }, { x: 479, y: 505, r: 71 }, { x: 256, y: 279, r: 80 }, { x: 162, y: 567, r: 66 }, { x: 325, y: 632, r: 77 }, { x: 464, y: 684, r: 68 }, { x: 394, y: 348, r: 59 }], monsters: [{ t: "mini", x: 473, y: 331 }, { t: "splitter", x: 327, y: 318 }, { t: "splitter", x: 479, y: 511 }, { t: "blob", x: 268, y: 256, w: 1 }, { t: "blob", x: 172, y: 575, w: 1 }, { t: "splitter", x: 309, y: 618, w: 1 }, { t: "splitter", x: 99, y: 376, w: 2 }, { t: "blob", x: 202, y: 365, w: 2 }, { t: "blob", x: 370, y: 485, w: 2 }], animals: [{ s: "squirrel", x: 289, y: 390 }], start: { x: 288, y: 860 } }], tier: 4 }, { id: "forest-07", stage: 7, region: "forest", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 476, y: 321 }, { t: "pine", x: 435, y: 560 }, { t: "rock", x: 246, y: 498 }], goo: [{ x: 415, y: 218, r: 79 }, { x: 244, y: 185, r: 73 }, { x: 348, y: 518, r: 61 }, { x: 91, y: 399, r: 45 }, { x: 114, y: 342, r: 47 }, { x: 407, y: 739, r: 74 }, { x: 160, y: 783, r: 52 }], monsters: [{ t: "blob", x: 415, y: 230 }, { t: "chunky", x: 215, y: 175 }, { t: "blob", x: 372, y: 514 }], animals: [{ s: "hedgehog", x: 209, y: 336 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 496, y: 440 }, { t: "tree", x: 141, y: 526 }, { t: "tree", x: 461, y: 659 }, { t: "stump", x: 402, y: 711 }], goo: [{ x: 423, y: 347, r: 68 }, { x: 72, y: 298, r: 58 }, { x: 195, y: 586, r: 87 }, { x: 463, y: 769, r: 47 }, { x: 422, y: 171, r: 52 }, { x: 338, y: 392, r: 53 }, { x: 229, y: 460, r: 67 }], monsters: [{ t: "chunky", x: 417, y: 318 }, { t: "spitter", x: 78, y: 271 }, { t: "splitter", x: 199, y: 579 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 455, y: 413 }, { t: "tree", x: 91, y: 692 }, { t: "tree", x: 462, y: 214 }, { t: "tree", x: 148, y: 420 }, { t: "fence", x: 474, y: 637 }], goo: [{ x: 183, y: 601, r: 78 }, { x: 320, y: 493, r: 70 }, { x: 301, y: 406, r: 74 }, { x: 116, y: 241, r: 66 }, { x: 276, y: 198, r: 59 }, { x: 393, y: 156, r: 73 }, { x: 271, y: 410, r: 70 }, { x: 242, y: 596, r: 46 }, { x: 383, y: 495, r: 54 }, { x: 416, y: 184, r: 73 }], monsters: [{ t: "blob", x: 189, y: 604 }, { t: "blob", x: 316, y: 503 }, { t: "blob", x: 278, y: 420 }, { t: "splitter", x: 122, y: 213 }, { t: "dasher", x: 285, y: 181, w: 1 }, { t: "blob", x: 396, y: 171, w: 1 }, { t: "blob", x: 214, y: 362, w: 1 }], animals: [{ s: "puppy", x: 315, y: 322 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 87, y: 533 }, { t: "pine", x: 118, y: 458 }, { t: "tree", x: 468, y: 296 }, { t: "fence", x: 258, y: 340 }, { t: "stump", x: 185, y: 425 }, { t: "fence", x: 300, y: 676 }], goo: [{ x: 387, y: 457, r: 66 }, { x: 239, y: 577, r: 73 }, { x: 311, y: 250, r: 62 }, { x: 455, y: 527, r: 58 }, { x: 388, y: 575, r: 89 }, { x: 148, y: 125, r: 79 }, { x: 115, y: 666, r: 50 }, { x: 89, y: 269, r: 48 }, { x: 489, y: 241, r: 65 }, { x: 292, y: 573, r: 49 }], monsters: [{ t: "spitter", x: 390, y: 472 }, { t: "splitter", x: 227, y: 582 }, { t: "spitter", x: 323, y: 234 }, { t: "splitter", x: 477, y: 538, w: 1 }, { t: "blob", x: 395, y: 566, w: 1 }, { t: "dasher", x: 170, y: 136, w: 1 }], animals: [], start: { x: 288, y: 860 } }], intro: "chunky" }, { id: "forest-08", stage: 8, region: "forest", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".......##...", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 493, y: 159 }, { t: "pine", x: 111, y: 294 }, { t: "pine", x: 471, y: 547 }, { t: "pine", x: 93, y: 167 }, { t: "fence", x: 362, y: 345 }], goo: [{ x: 454, y: 475, r: 69 }, { x: 297, y: 459, r: 90 }, { x: 392, y: 585, r: 73 }, { x: 151, y: 452, r: 87 }, { x: 118, y: 681, r: 54 }, { x: 446, y: 691, r: 60 }], monsters: [{ t: "dasher", x: 433, y: 493 }, { t: "dasher", x: 279, y: 457 }, { t: "splitter", x: 403, y: 591 }, { t: "blob", x: 172, y: 439 }], animals: [{ s: "hedgehog", x: 100, y: 459 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".....##.....", ".....##....."], obstacles: [{ t: "fence", x: 426, y: 300 }, { t: "fence", x: 426, y: 560 }, { t: "stump", x: 247, y: 452 }, { t: "boulder", x: 302, y: 672 }, { t: "rock", x: 88, y: 505 }, { t: "log", x: 314, y: 550 }, { t: "tree", x: 120, y: 757 }, { t: "pine", x: 95, y: 635 }, { t: "tree", x: 135, y: 454 }, { t: "bush", x: 319, y: 302 }], goo: [{ x: 132, y: 326, r: 74 }, { x: 196, y: 173, r: 87 }, { x: 173, y: 600, r: 90 }, { x: 318, y: 437, r: 72 }, { x: 205, y: 571, r: 61 }, { x: 217, y: 391, r: 64 }], monsters: [{ t: "chunky", x: 109, y: 314 }, { t: "spitter", x: 188, y: 149 }, { t: "dasher", x: 185, y: 576 }, { t: "blob", x: 312, y: 436 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".......##...", ".......##...", ".......##...", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 459, y: 650 }, { t: "tree", x: 92, y: 279 }, { t: "pine", x: 143, y: 390 }, { t: "tree", x: 444, y: 812 }, { t: "fence", x: 418, y: 718 }], goo: [{ x: 232, y: 163, r: 79 }, { x: 322, y: 604, r: 69 }, { x: 425, y: 502, r: 67 }, { x: 335, y: 517, r: 68 }, { x: 227, y: 273, r: 63 }, { x: 242, y: 288, r: 62 }, { x: 364, y: 510, r: 53 }, { x: 323, y: 192, r: 57 }], monsters: [{ t: "splitter", x: 219, y: 170 }, { t: "blob", x: 326, y: 585 }, { t: "spitter", x: 413, y: 514 }, { t: "blob", x: 318, y: 508, w: 1 }, { t: "chunky", x: 207, y: 291, w: 1 }], animals: [{ s: "fox", x: 468, y: 391 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "fence", x: 150, y: 300 }, { t: "fence", x: 426, y: 560 }, { t: "stump", x: 118, y: 495 }, { t: "stump", x: 430, y: 747 }, { t: "log", x: 253, y: 418 }, { t: "rock", x: 467, y: 677 }, { t: "tree", x: 131, y: 770 }, { t: "tree", x: 123, y: 399 }, { t: "bush", x: 459, y: 290 }, { t: "bush", x: 312, y: 281 }], goo: [{ x: 207, y: 112, r: 65 }, { x: 369, y: 457, r: 70 }, { x: 112, y: 580, r: 67 }, { x: 454, y: 392, r: 68 }, { x: 348, y: 234, r: 62 }, { x: 290, y: 721, r: 76 }, { x: 131, y: 688, r: 69 }, { x: 364, y: 724, r: 46 }, { x: 193, y: 617, r: 51 }], monsters: [{ t: "blob", x: 226, y: 120 }, { t: "blob", x: 346, y: 447 }, { t: "dasher", x: 103, y: 556 }, { t: "blob", x: 464, y: 406 }, { t: "spitter", x: 365, y: 243, w: 1 }, { t: "blob", x: 289, y: 692, w: 1 }, { t: "spitter", x: 178, y: 496, w: 1 }, { t: "blob", x: 91, y: 646, w: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "forest-09", stage: 9, region: "forest", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 481, y: 396 }, { t: "tree", x: 106, y: 389 }, { t: "tree", x: 452, y: 621 }, { t: "tree", x: 492, y: 491 }, { t: "pine", x: 453, y: 181 }, { t: "bush", x: 218, y: 660 }, { t: "rock", x: 177, y: 492 }], goo: [{ x: 329, y: 360, r: 58 }, { x: 129, y: 178, r: 76 }, { x: 397, y: 375, r: 87 }, { x: 165, y: 697, r: 70 }, { x: 385, y: 298, r: 59 }, { x: 354, y: 496, r: 46 }, { x: 87, y: 310, r: 67 }], monsters: [{ t: "blob", x: 322, y: 375 }, { t: "nest", x: 141, y: 185 }, { t: "blob", x: 407, y: 367 }], animals: [{ s: "fawn", x: 250, y: 404 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".......##...", ".......##...", ".......##...", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 438, y: 744 }, { t: "tree", x: 495, y: 812 }, { t: "tree", x: 140, y: 325 }, { t: "tree", x: 149, y: 647 }, { t: "bush", x: 324, y: 466 }], goo: [{ x: 279, y: 282, r: 75 }, { x: 410, y: 442, r: 75 }, { x: 195, y: 415, r: 64 }, { x: 241, y: 534, r: 89 }, { x: 347, y: 354, r: 78 }, { x: 442, y: 528, r: 59 }, { x: 323, y: 541, r: 71 }, { x: 319, y: 651, r: 48 }], monsters: [{ t: "nest", x: 295, y: 273 }, { t: "spitter", x: 401, y: 424 }, { t: "dasher", x: 187, y: 406 }, { t: "blob", x: 236, y: 552, w: 1 }, { t: "blob", x: 356, y: 325, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 458, y: 376 }, { t: "pine", x: 433, y: 448 }, { t: "pine", x: 473, y: 492 }, { t: "pine", x: 489, y: 553 }, { t: "bush", x: 365, y: 299 }, { t: "rock", x: 210, y: 574 }, { t: "stump", x: 349, y: 232 }], goo: [{ x: 122, y: 263, r: 61 }, { x: 200, y: 142, r: 87 }, { x: 242, y: 488, r: 79 }, { x: 177, y: 379, r: 70 }, { x: 77, y: 353, r: 63 }, { x: 435, y: 566, r: 50 }, { x: 119, y: 258, r: 65 }], monsters: [{ t: "dasher", x: 130, y: 276 }, { t: "nest", x: 225, y: 151 }, { t: "blob", x: 246, y: 493 }, { t: "spitter", x: 165, y: 374, w: 1 }, { t: "spitter", x: 83, y: 334, w: 1 }], animals: [{ s: "squirrel", x: 482, y: 262 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "...##.......", "....##......", "....##......", "....##......", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 439, y: 701 }, { t: "tree", x: 141, y: 411 }, { t: "tree", x: 143, y: 537 }, { t: "bush", x: 275, y: 644 }, { t: "fence", x: 217, y: 271 }, { t: "stump", x: 382, y: 538 }], goo: [{ x: 458, y: 462, r: 64 }, { x: 454, y: 234, r: 81 }, { x: 457, y: 284, r: 78 }, { x: 331, y: 466, r: 62 }, { x: 151, y: 139, r: 82 }, { x: 243, y: 583, r: 70 }, { x: 130, y: 235, r: 68 }, { x: 448, y: 247, r: 72 }, { x: 445, y: 310, r: 52 }], monsters: [{ t: "spitter", x: 431, y: 433 }, { t: "spitter", x: 475, y: 218 }, { t: "spitter", x: 443, y: 285 }, { t: "blob", x: 327, y: 458, w: 1 }, { t: "chunky", x: 171, y: 155, w: 1 }, { t: "spitter", x: 242, y: 556, w: 1 }], animals: [], start: { x: 288, y: 860 } }], intro: "nest" }, { id: "forest-10", stage: 10, region: "forest", rooms: [{ terrain: [".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", ".....##.....", ".....##....."], obstacles: [{ t: "pine", x: 447, y: 390 }, { t: "tree", x: 140, y: 709 }, { t: "tree", x: 139, y: 455 }, { t: "rock", x: 353, y: 533 }, { t: "stump", x: 96, y: 630 }], goo: [{ x: 176, y: 303, r: 72 }, { x: 72, y: 401, r: 64 }, { x: 210, y: 522, r: 82 }, { x: 288, y: 360, r: 55 }, { x: 338, y: 266, r: 57 }, { x: 421, y: 436, r: 47 }], monsters: [{ t: "spitter", x: 158, y: 305 }, { t: "blob", x: 99, y: 390 }, { t: "spitter", x: 234, y: 534 }, { t: "chunky", x: 314, y: 342 }], animals: [{ s: "fawn", x: 395, y: 242 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 86, y: 151 }, { t: "tree", x: 130, y: 786 }, { t: "tree", x: 428, y: 744 }, { t: "bush", x: 211, y: 376 }, { t: "fence", x: 373, y: 616 }, { t: "fence", x: 470, y: 476 }], goo: [{ x: 170, y: 517, r: 78 }, { x: 297, y: 451, r: 77 }, { x: 385, y: 352, r: 72 }, { x: 173, y: 470, r: 57 }, { x: 90, y: 591, r: 57 }, { x: 372, y: 196, r: 46 }, { x: 91, y: 591, r: 54 }], monsters: [{ t: "chunky", x: 189, y: 508 }, { t: "chunky", x: 293, y: 423 }, { t: "spitter", x: 384, y: 341 }], animals: [{ s: "hedgehog", x: 124, y: 226 }], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", "...##.......", "...##.......", "...##.......", "....##......", "....##......", "....##......", ".....##.....", ".....##....."], obstacles: [{ t: "tree", x: 480, y: 333 }, { t: "tree", x: 86, y: 470 }, { t: "pine", x: 485, y: 600 }, { t: "tree", x: 93, y: 661 }, { t: "fence", x: 261, y: 743 }, { t: "bush", x: 464, y: 669 }, { t: "bush", x: 273, y: 291 }], goo: [{ x: 416, y: 374, r: 73 }, { x: 428, y: 178, r: 74 }, { x: 246, y: 261, r: 75 }, { x: 311, y: 409, r: 65 }, { x: 166, y: 564, r: 78 }, { x: 274, y: 533, r: 81 }, { x: 185, y: 661, r: 52 }, { x: 285, y: 531, r: 72 }], monsters: [{ t: "spitter", x: 401, y: 394 }, { t: "spitter", x: 417, y: 168 }, { t: "blob", x: 233, y: 240 }, { t: "splitter", x: 289, y: 392 }, { t: "dasher", x: 181, y: 572, w: 1 }, { t: "blob", x: 264, y: 544, w: 1 }, { t: "blob", x: 352, y: 567, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", ".....##.....", "......##....", "......##....", "......##....", ".....##.....", ".....##.....", ".....##.....", "....##......", "....##......", "....##......", "....##......", "....##......", "....##......", ".....##.....", ".....##....."], obstacles: [{ t: "log", x: 140, y: 300 }, { t: "log", x: 436, y: 300 }, { t: "log", x: 140, y: 640 }, { t: "rock", x: 436, y: 640 }], goo: [{ x: 298, y: 341, r: 74 }, { x: 164, y: 486, r: 87 }, { x: 448, y: 485, r: 81 }, { x: 207, y: 591, r: 57 }, { x: 181, y: 531, r: 50 }], monsters: [{ t: "boss", x: 288, y: 330 }, { t: "blob", x: 150, y: 460 }, { t: "blob", x: 426, y: 460 }], animals: [], start: { x: 288, y: 860 } }], intro: "boss", boss: true }, { id: "village-01", stage: 11, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 122, y: 658 }, { t: "tree", x: 488, y: 296 }, { t: "well", x: 100, y: 179 }, { t: "well", x: 146, y: 523 }, { t: "fencev", x: 255, y: 509 }], goo: [{ x: 461, y: 562, r: 55 }, { x: 359, y: 585, r: 60 }, { x: 432, y: 208, r: 86 }, { x: 395, y: 323, r: 47 }, { x: 384, y: 498, r: 47 }, { x: 370, y: 750, r: 53 }], monsters: [{ t: "blob", x: 472, y: 547 }, { t: "jumper", x: 383, y: 585 }, { t: "blob", x: 435, y: 202 }], animals: [{ s: "kitten", x: 444, y: 374 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 494, y: 371 }, { t: "well", x: 146, y: 535 }, { t: "tree", x: 115, y: 289 }, { t: "bush", x: 435, y: 688 }, { t: "fence", x: 265, y: 543 }], goo: [{ x: 192, y: 380, r: 87 }, { x: 399, y: 428, r: 68 }, { x: 171, y: 230, r: 83 }, { x: 297, y: 462, r: 66 }, { x: 409, y: 229, r: 69 }, { x: 368, y: 217, r: 47 }], monsters: [{ t: "blob", x: 214, y: 360 }, { t: "chunky", x: 423, y: 432 }, { t: "jumper", x: 196, y: 200 }, { t: "jumper", x: 322, y: 437 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc....."], obstacles: [{ t: "well", x: 124, y: 783 }, { t: "house", x: 472, y: 578 }, { t: "barrel", x: 200, y: 731 }], goo: [{ x: 153, y: 270, r: 80 }, { x: 208, y: 381, r: 84 }, { x: 104, y: 556, r: 82 }, { x: 346, y: 425, r: 62 }, { x: 273, y: 543, r: 73 }, { x: 385, y: 366, r: 50 }, { x: 399, y: 756, r: 53 }], monsters: [{ t: "chunky", x: 132, y: 272 }, { t: "dasher", x: 202, y: 353 }, { t: "spitter", x: 132, y: 550 }, { t: "splitter", x: 368, y: 434, w: 1 }, { t: "jumper", x: 252, y: 549, w: 1 }], animals: [{ s: "puppy", x: 106, y: 370 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 147, y: 444 }, { t: "tree", x: 473, y: 315 }, { t: "tree", x: 109, y: 718 }, { t: "fence", x: 431, y: 510 }, { t: "fencev", x: 299, y: 472 }, { t: "fence", x: 109, y: 548 }], goo: [{ x: 434, y: 162, r: 59 }, { x: 185, y: 163, r: 77 }, { x: 219, y: 349, r: 83 }, { x: 501, y: 196, r: 65 }, { x: 398, y: 290, r: 87 }, { x: 162, y: 391, r: 83 }, { x: 127, y: 653, r: 50 }, { x: 183, y: 681, r: 73 }, { x: 108, y: 314, r: 69 }, { x: 439, y: 628, r: 45 }], monsters: [{ t: "blob", x: 409, y: 171 }, { t: "splitter", x: 201, y: 154 }, { t: "spitter", x: 225, y: 332 }, { t: "spitter", x: 491, y: 208 }, { t: "blob", x: 372, y: 268, w: 1 }, { t: "jumper", x: 141, y: 371, w: 1 }, { t: "jumper", x: 321, y: 615, w: 1 }], animals: [], start: { x: 288, y: 860 } }], intro: "jumper" }, { id: "village-02", stage: 12, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "house", x: 431, y: 681 }, { t: "tree", x: 476, y: 587 }, { t: "house", x: 138, y: 467 }, { t: "well", x: 426, y: 445 }, { t: "crate", x: 200, y: 701 }, { t: "fencev", x: 352, y: 241 }], goo: [{ x: 166, y: 308, r: 81 }, { x: 438, y: 285, r: 76 }, { x: 142, y: 152, r: 84 }, { x: 319, y: 475, r: 56 }, { x: 91, y: 346, r: 51 }], monsters: [{ t: "nest", x: 147, y: 302 }, { t: "chunky", x: 467, y: 289 }, { t: "spitter", x: 142, y: 125 }], animals: [{ s: "duckling", x: 232, y: 223 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "crate", x: 360, y: 324 }, { t: "hay", x: 325, y: 744 }, { t: "crate", x: 245, y: 344 }, { t: "cart", x: 306, y: 251 }, { t: "tree", x: 446, y: 698 }, { t: "well", x: 490, y: 487 }, { t: "tree", x: 115, y: 793 }, { t: "barrel", x: 375, y: 426 }], goo: [{ x: 197, y: 579, r: 70 }, { x: 265, y: 435, r: 83 }, { x: 387, y: 590, r: 57 }, { x: 289, y: 409, r: 71 }, { x: 456, y: 372, r: 81 }, { x: 155, y: 298, r: 70 }, { x: 480, y: 755, r: 72 }, { x: 143, y: 419, r: 59 }, { x: 161, y: 590, r: 51 }], monsters: [{ t: "blob", x: 177, y: 592 }, { t: "chunky", x: 243, y: 444 }, { t: "dasher", x: 388, y: 592 }, { t: "spitter", x: 309, y: 413, w: 1 }, { t: "splitter", x: 457, y: 359, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 428, y: 448 }, { t: "tree", x: 471, y: 376 }, { t: "bush", x: 334, y: 745 }, { t: "bush", x: 203, y: 657 }], goo: [{ x: 352, y: 443, r: 80 }, { x: 430, y: 115, r: 55 }, { x: 180, y: 275, r: 79 }, { x: 457, y: 204, r: 83 }, { x: 136, y: 634, r: 71 }, { x: 83, y: 205, r: 60 }, { x: 337, y: 521, r: 51 }, { x: 435, y: 647, r: 69 }, { x: 273, y: 595, r: 72 }], monsters: [{ t: "chunky", x: 329, y: 430 }, { t: "blob", x: 417, y: 130 }, { t: "chunky", x: 175, y: 284 }, { t: "spitter", x: 445, y: 198, w: 1 }, { t: "blob", x: 123, y: 623, w: 1 }], animals: [{ s: "kitten", x: 188, y: 173 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "cart", x: 170, y: 360 }, { t: "cart", x: 406, y: 600 }, { t: "cart", x: 480, y: 411 }, { t: "barrel", x: 316, y: 565 }, { t: "cart", x: 169, y: 482 }, { t: "barrel", x: 383, y: 231 }, { t: "tree", x: 99, y: 153 }, { t: "well", x: 115, y: 789 }, { t: "tree", x: 428, y: 155 }, { t: "barrel", x: 108, y: 618 }], goo: [{ x: 412, y: 381, r: 75 }, { x: 359, y: 164, r: 85 }, { x: 289, y: 338, r: 75 }, { x: 177, y: 567, r: 80 }, { x: 185, y: 173, r: 83 }, { x: 251, y: 533, r: 60 }, { x: 365, y: 739, r: 66 }, { x: 251, y: 805, r: 64 }, { x: 340, y: 309, r: 69 }], monsters: [{ t: "chunky", x: 386, y: 357 }, { t: "splitter", x: 354, y: 169 }, { t: "nest", x: 270, y: 317 }, { t: "blob", x: 165, y: 572, w: 1 }, { t: "jumper", x: 206, y: 144, w: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "village-03", stage: 13, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "house", x: 144, y: 300 }, { t: "tree", x: 130, y: 453 }, { t: "tree", x: 104, y: 610 }, { t: "tree", x: 429, y: 367 }, { t: "barrel", x: 464, y: 614 }], goo: [{ x: 403, y: 146, r: 57 }, { x: 376, y: 283, r: 86 }, { x: 467, y: 315, r: 78 }, { x: 484, y: 352, r: 69 }, { x: 223, y: 643, r: 51 }], monsters: [{ t: "blob", x: 394, y: 129 }, { t: "flyer", x: 346, y: 272 }, { t: "blob", x: 449, y: 291 }], animals: [{ s: "piglet", x: 311, y: 343 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc....."], obstacles: [{ t: "well", x: 87, y: 767 }, { t: "house", x: 450, y: 713 }, { t: "tree", x: 135, y: 589 }, { t: "barrel", x: 286, y: 638 }], goo: [{ x: 251, y: 335, r: 89 }, { x: 497, y: 475, r: 70 }, { x: 405, y: 295, r: 87 }, { x: 314, y: 500, r: 63 }, { x: 174, y: 246, r: 79 }, { x: 118, y: 671, r: 50 }, { x: 327, y: 453, r: 49 }], monsters: [{ t: "chunky", x: 249, y: 347 }, { t: "flyer", x: 474, y: 475 }, { t: "dasher", x: 429, y: 285 }, { t: "flyer", x: 301, y: 513, w: 1 }, { t: "splitter", x: 167, y: 234, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 430, y: 484 }, { t: "tree", x: 451, y: 142 }, { t: "well", x: 121, y: 234 }, { t: "fencev", x: 238, y: 392 }, { t: "bush", x: 197, y: 648 }, { t: "fence", x: 200, y: 775 }], goo: [{ x: 328, y: 617, r: 72 }, { x: 318, y: 251, r: 68 }, { x: 97, y: 504, r: 67 }, { x: 340, y: 415, r: 74 }, { x: 447, y: 350, r: 74 }, { x: 321, y: 289, r: 54 }, { x: 386, y: 548, r: 48 }, { x: 342, y: 804, r: 64 }, { x: 405, y: 778, r: 54 }], monsters: [{ t: "jumper", x: 332, y: 604 }, { t: "chunky", x: 306, y: 264 }, { t: "spitter", x: 107, y: 506 }, { t: "jumper", x: 354, y: 415, w: 1 }, { t: "flyer", x: 438, y: 341, w: 1 }], animals: [{ s: "duckling", x: 233, y: 209 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "house", x: 446, y: 713 }, { t: "tree", x: 125, y: 579 }, { t: "tree", x: 95, y: 747 }, { t: "tree", x: 491, y: 613 }, { t: "bush", x: 411, y: 490 }], goo: [{ x: 347, y: 400, r: 69 }, { x: 446, y: 250, r: 57 }, { x: 186, y: 202, r: 57 }, { x: 458, y: 410, r: 60 }, { x: 352, y: 189, r: 63 }, { x: 190, y: 419, r: 73 }, { x: 110, y: 200, r: 65 }, { x: 343, y: 569, r: 57 }], monsters: [{ t: "blob", x: 342, y: 386 }, { t: "dasher", x: 457, y: 229 }, { t: "chunky", x: 190, y: 177 }, { t: "nest", x: 457, y: 427, w: 1 }, { t: "blob", x: 360, y: 202, w: 1 }, { t: "spitter", x: 215, y: 418, w: 1 }], animals: [], start: { x: 288, y: 860 } }], intro: "flyer" }, { id: "village-04", stage: 14, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 484, y: 593 }, { t: "tree", x: 428, y: 740 }, { t: "house", x: 103, y: 660 }, { t: "fencev", x: 365, y: 283 }], goo: [{ x: 159, y: 519, r: 75 }, { x: 223, y: 179, r: 71 }, { x: 272, y: 616, r: 72 }, { x: 429, y: 369, r: 78 }, { x: 485, y: 523, r: 81 }, { x: 246, y: 494, r: 86 }, { x: 160, y: 578, r: 74 }, { x: 149, y: 283, r: 53 }, { x: 481, y: 376, r: 63 }, { x: 430, y: 409, r: 64 }], monsters: [{ t: "mini", x: 188, y: 500 }, { t: "mini", x: 194, y: 150 }, { t: "mini", x: 289, y: 610 }, { t: "blob", x: 459, y: 353 }, { t: "blob", x: 494, y: 522 }, { t: "mini", x: 243, y: 491, w: 1 }, { t: "blob", x: 412, y: 445, w: 1 }, { t: "mini", x: 183, y: 267, w: 1 }, { t: "splitter", x: 317, y: 127, w: 1 }, { t: "mini", x: 286, y: 217, w: 2 }, { t: "splitter", x: 104, y: 175, w: 2 }, { t: "splitter", x: 156, y: 393, w: 2 }, { t: "blob", x: 482, y: 276, w: 2 }], animals: [{ s: "kitten", x: 412, y: 180 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 450, y: 218 }, { t: "well", x: 469, y: 719 }, { t: "well", x: 108, y: 427 }, { t: "tree", x: 141, y: 234 }, { t: "barrel", x: 210, y: 519 }, { t: "fencev", x: 112, y: 560 }, { t: "bush", x: 290, y: 301 }], goo: [{ x: 277, y: 220, r: 75 }, { x: 316, y: 620, r: 58 }, { x: 474, y: 482, r: 73 }, { x: 106, y: 322, r: 80 }, { x: 210, y: 154, r: 82 }, { x: 456, y: 321, r: 87 }, { x: 293, y: 605, r: 47 }, { x: 310, y: 225, r: 59 }], monsters: [{ t: "mini", x: 286, y: 219 }, { t: "blob", x: 317, y: 610 }, { t: "mini", x: 473, y: 494 }, { t: "blob", x: 90, y: 313 }, { t: "splitter", x: 208, y: 148 }, { t: "blob", x: 428, y: 304, w: 1 }, { t: "mini", x: 374, y: 195, w: 1 }, { t: "blob", x: 223, y: 652, w: 1 }, { t: "mini", x: 395, y: 407, w: 1 }, { t: "blob", x: 305, y: 485, w: 1 }, { t: "mini", x: 188, y: 303, w: 2 }, { t: "mini", x: 292, y: 687, w: 2 }, { t: "splitter", x: 451, y: 635, w: 2 }, { t: "blob", x: 482, y: 388, w: 2 }, { t: "blob", x: 117, y: 170, w: 2 }], animals: [{ s: "duckling", x: 188, y: 437 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc....."], obstacles: [{ t: "house", x: 131, y: 253 }, { t: "tree", x: 481, y: 643 }, { t: "tree", x: 102, y: 478 }, { t: "tree", x: 460, y: 389 }, { t: "well", x: 479, y: 258 }, { t: "barrel", x: 330, y: 250 }, { t: "bush", x: 126, y: 662 }, { t: "crate", x: 295, y: 627 }], goo: [{ x: 351, y: 354, r: 84 }, { x: 363, y: 458, r: 58 }, { x: 268, y: 480, r: 90 }, { x: 117, y: 401, r: 89 }, { x: 256, y: 162, r: 64 }, { x: 469, y: 140, r: 63 }, { x: 297, y: 347, r: 69 }, { x: 479, y: 166, r: 61 }], monsters: [{ t: "blob", x: 352, y: 365 }, { t: "blob", x: 340, y: 448 }, { t: "mini", x: 274, y: 460 }, { t: "mini", x: 132, y: 402 }, { t: "blob", x: 253, y: 171 }, { t: "blob", x: 464, y: 143, w: 1 }, { t: "blob", x: 225, y: 595, w: 1 }, { t: "mini", x: 276, y: 565, w: 1 }, { t: "mini", x: 464, y: 463, w: 1 }, { t: "blob", x: 397, y: 610, w: 1 }, { t: "blob", x: 187, y: 139, w: 2 }, { t: "mini", x: 386, y: 496, w: 2 }, { t: "blob", x: 427, y: 712, w: 2 }, { t: "blob", x: 165, y: 713, w: 2 }, { t: "blob", x: 213, y: 400, w: 2 }], animals: [{ s: "piglet", x: 282, y: 311 }], start: { x: 288, y: 860 } }], tier: 12 }, { id: "village-05", stage: 15, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 126, y: 228 }, { t: "tree", x: 148, y: 743 }, { t: "crate", x: 211, y: 514 }, { t: "fence", x: 112, y: 519 }], goo: [{ x: 286, y: 266, r: 73 }, { x: 202, y: 344, r: 59 }, { x: 414, y: 363, r: 74 }, { x: 505, y: 522, r: 74 }, { x: 178, y: 414, r: 88 }, { x: 233, y: 603, r: 70 }, { x: 364, y: 425, r: 75 }, { x: 130, y: 655, r: 48 }], monsters: [{ t: "dasher", x: 313, y: 237 }, { t: "splitter", x: 191, y: 327 }, { t: "splitter", x: 420, y: 373 }, { t: "jumper", x: 494, y: 505, w: 1 }, { t: "spitter", x: 202, y: 411, w: 1, v: 1 }], animals: [{ s: "lamb", x: 222, y: 170 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", ".....cc.....", ".....cc....."], obstacles: [{ t: "house", x: 452, y: 269 }, { t: "tree", x: 125, y: 231 }, { t: "house", x: 120, y: 628 }, { t: "fence", x: 328, y: 231 }], goo: [{ x: 182, y: 350, r: 80 }, { x: 333, y: 413, r: 71 }, { x: 265, y: 470, r: 77 }, { x: 279, y: 639, r: 71 }, { x: 415, y: 592, r: 77 }, { x: 351, y: 586, r: 86 }, { x: 312, y: 571, r: 70 }, { x: 493, y: 793, r: 50 }, { x: 214, y: 756, r: 63 }, { x: 414, y: 737, r: 67 }], monsters: [{ t: "jumper", x: 202, y: 335 }, { t: "chunky", x: 325, y: 387 }, { t: "blob", x: 274, y: 452 }, { t: "blob", x: 260, y: 639, w: 1 }, { t: "jumper", x: 429, y: 587, w: 1 }, { t: "blob", x: 325, y: 559, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 462, y: 479 }, { t: "tree", x: 102, y: 398 }, { t: "tree", x: 457, y: 673 }, { t: "fence", x: 282, y: 421 }], goo: [{ x: 157, y: 225, r: 83 }, { x: 371, y: 207, r: 66 }, { x: 173, y: 111, r: 82 }, { x: 136, y: 463, r: 78 }, { x: 259, y: 522, r: 76 }, { x: 330, y: 499, r: 55 }, { x: 423, y: 757, r: 59 }, { x: 449, y: 367, r: 49 }, { x: 143, y: 164, r: 56 }], monsters: [{ t: "jumper", x: 174, y: 208 }, { t: "chunky", x: 383, y: 198 }, { t: "dasher", x: 148, y: 124 }, { t: "spitter", x: 158, y: 449, w: 1, v: 1 }, { t: "chunky", x: 230, y: 541, w: 1 }], animals: [{ s: "piglet", x: 421, y: 271 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 147, y: 585 }, { t: "well", x: 85, y: 607 }, { t: "tree", x: 138, y: 144 }, { t: "bush", x: 385, y: 524 }, { t: "fence", x: 312, y: 403 }, { t: "fence", x: 378, y: 743 }], goo: [{ x: 273, y: 275, r: 87 }, { x: 405, y: 139, r: 81 }, { x: 466, y: 485, r: 66 }, { x: 193, y: 226, r: 88 }, { x: 433, y: 294, r: 89 }, { x: 278, y: 136, r: 71 }, { x: 475, y: 260, r: 64 }, { x: 160, y: 504, r: 67 }, { x: 130, y: 290, r: 55 }, { x: 354, y: 609, r: 48 }], monsters: [{ t: "chunky", x: 292, y: 262 }, { t: "spitter", x: 399, y: 152, v: 1 }, { t: "spitter", x: 486, y: 476, v: 1 }, { t: "blob", x: 213, y: 227 }, { t: "blob", x: 434, y: 282, w: 1 }, { t: "dasher", x: 295, y: 152, w: 1 }, { t: "chunky", x: 182, y: 422, w: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "village-06", stage: 16, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "well", x: 115, y: 609 }, { t: "well", x: 481, y: 141 }, { t: "tree", x: 488, y: 384 }, { t: "tree", x: 449, y: 243 }, { t: "barrel", x: 492, y: 710 }], goo: [{ x: 381, y: 388, r: 86 }, { x: 279, y: 504, r: 72 }, { x: 257, y: 261, r: 58 }, { x: 144, y: 293, r: 89 }, { x: 198, y: 475, r: 63 }, { x: 410, y: 716, r: 50 }, { x: 218, y: 758, r: 49 }, { x: 203, y: 242, r: 55 }, { x: 80, y: 315, r: 68 }], monsters: [{ t: "jumper", x: 388, y: 400 }, { t: "blob", x: 268, y: 494 }, { t: "dasher", x: 287, y: 243 }, { t: "chunky", x: 159, y: 276, w: 1 }, { t: "spitter", x: 198, y: 456, w: 1 }], animals: [{ s: "lamb", x: 197, y: 337 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "cart", x: 170, y: 360 }, { t: "cart", x: 406, y: 600 }, { t: "barrel", x: 78, y: 235 }, { t: "hay", x: 277, y: 347 }, { t: "hay", x: 371, y: 389 }, { t: "cart", x: 127, y: 742 }, { t: "tree", x: 480, y: 426 }, { t: "tree", x: 437, y: 768 }, { t: "bush", x: 467, y: 330 }], goo: [{ x: 98, y: 567, r: 80 }, { x: 329, y: 254, r: 79 }, { x: 341, y: 119, r: 90 }, { x: 90, y: 148, r: 56 }, { x: 237, y: 140, r: 57 }, { x: 482, y: 283, r: 83 }, { x: 109, y: 305, r: 63 }, { x: 459, y: 719, r: 49 }], monsters: [{ t: "blob", x: 115, y: 541 }, { t: "blob", x: 348, y: 252 }, { t: "splitter", x: 358, y: 123 }, { t: "blob", x: 97, y: 138 }, { t: "jumper", x: 223, y: 138, w: 1 }, { t: "dasher", x: 466, y: 266, w: 1 }, { t: "blob", x: 309, y: 500, w: 1 }, { t: "dasher", x: 279, y: 615, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 440, y: 474 }, { t: "well", x: 491, y: 367 }, { t: "barrel", x: 217, y: 426 }, { t: "fence", x: 210, y: 344 }, { t: "barrel", x: 350, y: 419 }], goo: [{ x: 364, y: 559, r: 83 }, { x: 423, y: 170, r: 72 }, { x: 419, y: 332, r: 67 }, { x: 308, y: 567, r: 88 }, { x: 124, y: 244, r: 46 }, { x: 409, y: 210, r: 68 }], monsters: [{ t: "chunky", x: 386, y: 560 }, { t: "chunky", x: 453, y: 165 }, { t: "chunky", x: 409, y: 308 }, { t: "flyer", x: 315, y: 563 }], animals: [{ s: "kitten", x: 158, y: 457 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc....."], obstacles: [{ t: "crate", x: 169, y: 320 }, { t: "barrel", x: 313, y: 348 }, { t: "cart", x: 345, y: 545 }, { t: "hay", x: 461, y: 693 }, { t: "well", x: 84, y: 445 }, { t: "tree", x: 138, y: 795 }, { t: "well", x: 489, y: 428 }, { t: "well", x: 457, y: 473 }, { t: "fencev", x: 358, y: 660 }], goo: [{ x: 107, y: 566, r: 66 }, { x: 368, y: 219, r: 68 }, { x: 285, y: 440, r: 78 }, { x: 233, y: 318, r: 79 }, { x: 177, y: 460, r: 58 }, { x: 149, y: 394, r: 63 }, { x: 198, y: 207, r: 65 }, { x: 479, y: 557, r: 53 }, { x: 151, y: 180, r: 47 }, { x: 354, y: 445, r: 64 }], monsters: [{ t: "splitter", x: 84, y: 570 }, { t: "dasher", x: 375, y: 222 }, { t: "splitter", x: 273, y: 445 }, { t: "flyer", x: 247, y: 326 }, { t: "jumper", x: 193, y: 464, w: 1 }, { t: "dasher", x: 176, y: 390, w: 1 }, { t: "dasher", x: 372, y: 298, w: 1 }, { t: "flyer", x: 205, y: 127, w: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "village-07", stage: 17, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 473, y: 614 }, { t: "tree", x: 117, y: 729 }, { t: "tree", x: 478, y: 183 }, { t: "bush", x: 366, y: 667 }, { t: "barrel", x: 434, y: 325 }, { t: "barrel", x: 374, y: 515 }], goo: [{ x: 494, y: 252, r: 87 }, { x: 263, y: 456, r: 87 }, { x: 338, y: 247, r: 89 }, { x: 221, y: 277, r: 81 }, { x: 296, y: 518, r: 88 }, { x: 223, y: 241, r: 55 }, { x: 316, y: 244, r: 59 }, { x: 246, y: 807, r: 61 }, { x: 369, y: 408, r: 68 }], monsters: [{ t: "spitter", x: 480, y: 267 }, { t: "dasher", x: 269, y: 443 }, { t: "blob", x: 367, y: 219 }, { t: "chunky", x: 205, y: 265, w: 1 }, { t: "dasher", x: 291, y: 526, w: 1 }], animals: [{ s: "chick", x: 330, y: 401 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 432, y: 267 }, { t: "tree", x: 131, y: 271 }, { t: "well", x: 114, y: 556 }, { t: "tree", x: 143, y: 756 }, { t: "fencev", x: 247, y: 735 }], goo: [{ x: 284, y: 278, r: 76 }, { x: 434, y: 392, r: 87 }, { x: 181, y: 459, r: 76 }, { x: 335, y: 177, r: 83 }, { x: 383, y: 449, r: 85 }, { x: 319, y: 416, r: 56 }, { x: 495, y: 647, r: 71 }, { x: 477, y: 339, r: 68 }, { x: 309, y: 262, r: 59 }], monsters: [{ t: "splitter", x: 258, y: 253 }, { t: "dasher", x: 439, y: 364 }, { t: "spitter", x: 198, y: 458, v: 1 }, { t: "jumper", x: 309, y: 185 }, { t: "spitter", x: 408, y: 430, w: 1, v: 1 }, { t: "flyer", x: 308, y: 392, w: 1 }, { t: "blob", x: 359, y: 695, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 108, y: 369 }, { t: "tree", x: 450, y: 739 }, { t: "fence", x: 132, y: 608 }, { t: "fencev", x: 262, y: 697 }, { t: "fencev", x: 201, y: 507 }], goo: [{ x: 339, y: 336, r: 74 }, { x: 442, y: 216, r: 77 }, { x: 436, y: 438, r: 85 }, { x: 466, y: 148, r: 84 }, { x: 465, y: 511, r: 67 }, { x: 311, y: 150, r: 65 }, { x: 461, y: 497, r: 48 }, { x: 367, y: 324, r: 49 }, { x: 404, y: 253, r: 45 }], monsters: [{ t: "blob", x: 340, y: 322 }, { t: "flyer", x: 443, y: 207 }, { t: "dasher", x: 460, y: 446 }, { t: "spitter", x: 438, y: 129 }, { t: "flyer", x: 451, y: 511, w: 1 }, { t: "nest", x: 328, y: 134, w: 1 }, { t: "spitter", x: 334, y: 405, w: 1, v: 1 }, { t: "blob", x: 99, y: 285, w: 1 }], animals: [{ s: "duckling", x: 185, y: 184 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "well", x: 446, y: 634 }, { t: "tree", x: 87, y: 464 }, { t: "well", x: 141, y: 362 }, { t: "tree", x: 145, y: 648 }, { t: "tree", x: 123, y: 726 }, { t: "barrel", x: 252, y: 746 }, { t: "crate", x: 152, y: 224 }, { t: "fencev", x: 381, y: 511 }], goo: [{ x: 373, y: 328, r: 58 }, { x: 373, y: 153, r: 87 }, { x: 443, y: 345, r: 80 }, { x: 511, y: 582, r: 58 }, { x: 127, y: 548, r: 67 }, { x: 245, y: 202, r: 84 }, { x: 286, y: 466, r: 48 }, { x: 229, y: 809, r: 62 }, { x: 456, y: 226, r: 48 }], monsters: [{ t: "blob", x: 369, y: 308 }, { t: "nest", x: 360, y: 146 }, { t: "jumper", x: 452, y: 343 }, { t: "flyer", x: 496, y: 555, w: 1 }, { t: "chunky", x: 136, y: 556, w: 1 }, { t: "nest", x: 255, y: 188, w: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "village-08", stage: 18, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "well", x: 457, y: 476 }, { t: "well", x: 123, y: 733 }, { t: "tree", x: 147, y: 463 }, { t: "tree", x: 466, y: 362 }, { t: "barrel", x: 386, y: 242 }], goo: [{ x: 316, y: 113, r: 61 }, { x: 184, y: 158, r: 60 }, { x: 326, y: 504, r: 73 }, { x: 481, y: 256, r: 62 }, { x: 206, y: 733, r: 49 }, { x: 248, y: 189, r: 61 }], monsters: [{ t: "spitter", x: 308, y: 130, v: 1 }, { t: "jumper", x: 195, y: 169 }, { t: "chunky", x: 309, y: 478, v: 1 }, { t: "nest", x: 477, y: 226 }], animals: [{ s: "chick", x: 243, y: 339 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc....."], obstacles: [{ t: "fence", x: 426, y: 300 }, { t: "fence", x: 150, y: 560 }, { t: "crate", x: 435, y: 647 }, { t: "cart", x: 256, y: 650 }, { t: "cart", x: 401, y: 486 }, { t: "hay", x: 298, y: 540 }, { t: "tree", x: 448, y: 148 }, { t: "fencev", x: 209, y: 374 }], goo: [{ x: 91, y: 154, r: 66 }, { x: 341, y: 167, r: 79 }, { x: 503, y: 439, r: 68 }, { x: 110, y: 353, r: 74 }, { x: 367, y: 703, r: 64 }, { x: 79, y: 278, r: 67 }, { x: 265, y: 238, r: 48 }, { x: 495, y: 580, r: 46 }], monsters: [{ t: "spitter", x: 109, y: 146, v: 1 }, { t: "chunky", x: 343, y: 154 }, { t: "blob", x: 494, y: 458 }, { t: "spitter", x: 94, y: 372, w: 1, v: 1 }, { t: "blob", x: 344, y: 678, w: 1 }, { t: "nest", x: 109, y: 273, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "house", x: 474, y: 732 }, { t: "tree", x: 130, y: 149 }, { t: "well", x: 141, y: 689 }, { t: "fencev", x: 243, y: 596 }, { t: "fence", x: 278, y: 276 }], goo: [{ x: 432, y: 226, r: 57 }, { x: 454, y: 505, r: 75 }, { x: 147, y: 271, r: 86 }, { x: 298, y: 727, r: 57 }, { x: 312, y: 536, r: 86 }, { x: 350, y: 194, r: 70 }, { x: 208, y: 690, r: 62 }, { x: 445, y: 293, r: 72 }, { x: 467, y: 414, r: 52 }], monsters: [{ t: "splitter", x: 458, y: 216 }, { t: "spitter", x: 480, y: 495, v: 1 }, { t: "flyer", x: 168, y: 246 }, { t: "flyer", x: 327, y: 701, w: 1 }, { t: "spitter", x: 331, y: 517, w: 1, v: 1 }, { t: "spitter", x: 342, y: 192, w: 1, v: 1 }, { t: "jumper", x: 84, y: 520, w: 2 }, { t: "spitter", x: 191, y: 339, w: 2 }, { t: "blob", x: 471, y: 579, w: 2 }], animals: [{ s: "lamb", x: 468, y: 369 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "fence", x: 150, y: 300 }, { t: "fence", x: 426, y: 560 }, { t: "hay", x: 487, y: 384 }, { t: "barrel", x: 188, y: 553 }, { t: "crate", x: 337, y: 244 }, { t: "hay", x: 100, y: 467 }, { t: "house", x: 459, y: 171 }, { t: "fence", x: 456, y: 751 }], goo: [{ x: 100, y: 622, r: 88 }, { x: 202, y: 624, r: 55 }, { x: 234, y: 228, r: 85 }, { x: 416, y: 437, r: 70 }, { x: 229, y: 394, r: 74 }, { x: 102, y: 146, r: 63 }, { x: 323, y: 766, r: 73 }, { x: 302, y: 531, r: 51 }, { x: 176, y: 815, r: 58 }, { x: 271, y: 546, r: 54 }], monsters: [{ t: "blob", x: 100, y: 608 }, { t: "blob", x: 229, y: 599 }, { t: "jumper", x: 257, y: 223 }, { t: "splitter", x: 396, y: 451, w: 1 }, { t: "flyer", x: 251, y: 372, w: 1 }, { t: "chunky", x: 95, y: 133, w: 1, v: 1 }, { t: "blob", x: 295, y: 631, w: 2 }, { t: "dasher", x: 167, y: 150, w: 2 }, { t: "jumper", x: 269, y: 120, w: 2 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "village-09", stage: 19, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "well", x: 113, y: 783 }, { t: "house", x: 451, y: 663 }, { t: "well", x: 482, y: 805 }, { t: "well", x: 440, y: 204 }, { t: "crate", x: 169, y: 517 }, { t: "fence", x: 265, y: 311 }], goo: [{ x: 195, y: 196, r: 76 }, { x: 119, y: 177, r: 76 }, { x: 368, y: 541, r: 72 }, { x: 484, y: 298, r: 81 }, { x: 58, y: 521, r: 80 }, { x: 382, y: 599, r: 54 }, { x: 322, y: 208, r: 66 }, { x: 278, y: 414, r: 65 }, { x: 303, y: 431, r: 61 }], monsters: [{ t: "chunky", x: 224, y: 176 }, { t: "flyer", x: 91, y: 177 }, { t: "spitter", x: 343, y: 548 }, { t: "dasher", x: 469, y: 285, w: 1 }, { t: "dasher", x: 78, y: 525, w: 1 }], animals: [{ s: "piglet", x: 139, y: 235 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 477, y: 530 }, { t: "tree", x: 426, y: 355 }, { t: "house", x: 470, y: 443 }, { t: "tree", x: 131, y: 588 }, { t: "crate", x: 331, y: 486 }], goo: [{ x: 126, y: 445, r: 55 }, { x: 322, y: 424, r: 84 }, { x: 69, y: 253, r: 82 }, { x: 231, y: 342, r: 88 }, { x: 193, y: 582, r: 76 }, { x: 428, y: 649, r: 87 }, { x: 203, y: 677, r: 48 }, { x: 167, y: 299, r: 46 }, { x: 244, y: 646, r: 48 }, { x: 363, y: 398, r: 54 }], monsters: [{ t: "spitter", x: 130, y: 448, v: 1 }, { t: "dasher", x: 338, y: 416 }, { t: "flyer", x: 99, y: 226 }, { t: "splitter", x: 244, y: 350 }, { t: "jumper", x: 202, y: 561, w: 1 }, { t: "blob", x: 432, y: 626, w: 1 }, { t: "flyer", x: 416, y: 159, w: 1 }, { t: "blob", x: 216, y: 433, w: 1 }], animals: [{ s: "chick", x: 308, y: 226 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "well", x: 480, y: 157 }, { t: "tree", x: 480, y: 441 }, { t: "tree", x: 441, y: 357 }, { t: "well", x: 471, y: 212 }, { t: "barrel", x: 254, y: 487 }], goo: [{ x: 89, y: 185, r: 59 }, { x: 243, y: 294, r: 85 }, { x: 397, y: 503, r: 62 }, { x: 354, y: 190, r: 68 }, { x: 130, y: 692, r: 74 }, { x: 258, y: 632, r: 60 }, { x: 322, y: 696, r: 49 }, { x: 150, y: 226, r: 71 }, { x: 282, y: 794, r: 69 }, { x: 351, y: 201, r: 65 }], monsters: [{ t: "dasher", x: 109, y: 168 }, { t: "dasher", x: 228, y: 288 }, { t: "spitter", x: 398, y: 508 }, { t: "jumper", x: 329, y: 169, w: 1 }, { t: "blob", x: 133, y: 685, w: 1 }, { t: "blob", x: 250, y: 630, w: 1 }, { t: "flyer", x: 312, y: 686, w: 2 }, { t: "blob", x: 179, y: 603, w: 2 }, { t: "splitter", x: 382, y: 236, w: 2 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 466, y: 251 }, { t: "well", x: 93, y: 576 }, { t: "tree", x: 112, y: 681 }, { t: "fencev", x: 436, y: 719 }, { t: "crate", x: 102, y: 490 }, { t: "fence", x: 362, y: 482 }], goo: [{ x: 264, y: 493, r: 56 }, { x: 129, y: 279, r: 80 }, { x: 177, y: 427, r: 62 }, { x: 267, y: 245, r: 76 }, { x: 322, y: 332, r: 76 }, { x: 392, y: 202, r: 62 }, { x: 323, y: 226, r: 73 }, { x: 342, y: 616, r: 69 }, { x: 199, y: 247, r: 61 }], monsters: [{ t: "blob", x: 256, y: 472 }, { t: "chunky", x: 148, y: 250, v: 1 }, { t: "splitter", x: 155, y: 423 }, { t: "blob", x: 265, y: 231 }, { t: "spitter", x: 316, y: 330, w: 1, v: 1 }, { t: "flyer", x: 377, y: 185, w: 1 }, { t: "blob", x: 200, y: 573, w: 1 }, { t: "chunky", x: 483, y: 386, w: 1 }], animals: [{ s: "kitten", x: 118, y: 176 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc....."], obstacles: [{ t: "house", x: 429, y: 246 }, { t: "tree", x: 119, y: 409 }, { t: "well", x: 439, y: 532 }, { t: "bush", x: 95, y: 771 }, { t: "bush", x: 230, y: 582 }, { t: "fence", x: 478, y: 434 }], goo: [{ x: 262, y: 383, r: 81 }, { x: 227, y: 234, r: 76 }, { x: 86, y: 254, r: 59 }, { x: 129, y: 534, r: 78 }, { x: 318, y: 439, r: 67 }, { x: 239, y: 208, r: 90 }, { x: 302, y: 391, r: 63 }, { x: 231, y: 304, r: 46 }], monsters: [{ t: "splitter", x: 234, y: 367 }, { t: "flyer", x: 211, y: 245 }, { t: "spitter", x: 109, y: 225, v: 1 }, { t: "blob", x: 104, y: 550, w: 1 }, { t: "chunky", x: 322, y: 441, w: 1 }, { t: "spitter", x: 254, y: 180, w: 1, v: 1 }, { t: "jumper", x: 374, y: 618, w: 2 }, { t: "spitter", x: 92, y: 478, w: 2 }, { t: "spitter", x: 197, y: 528, w: 2, v: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "village-10", stage: 20, region: "village", rooms: [{ terrain: [".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 129, y: 348 }, { t: "well", x: 479, y: 751 }, { t: "tree", x: 444, y: 424 }, { t: "bush", x: 94, y: 625 }], goo: [{ x: 205, y: 492, r: 65 }, { x: 244, y: 190, r: 88 }, { x: 168, y: 574, r: 79 }, { x: 109, y: 263, r: 88 }, { x: 342, y: 281, r: 60 }, { x: 460, y: 332, r: 65 }, { x: 479, y: 185, r: 51 }, { x: 491, y: 234, r: 60 }], monsters: [{ t: "chunky", x: 183, y: 467, v: 1 }, { t: "dasher", x: 248, y: 209 }, { t: "jumper", x: 143, y: 565 }, { t: "spitter", x: 111, y: 282, w: 1 }, { t: "spitter", x: 369, y: 298, w: 1 }, { t: "blob", x: 472, y: 340, w: 1 }], animals: [{ s: "lamb", x: 353, y: 186 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 439, y: 668 }, { t: "tree", x: 96, y: 712 }, { t: "bush", x: 324, y: 731 }, { t: "fencev", x: 422, y: 435 }, { t: "barrel", x: 185, y: 599 }], goo: [{ x: 260, y: 527, r: 64 }, { x: 340, y: 526, r: 88 }, { x: 98, y: 491, r: 65 }, { x: 489, y: 289, r: 84 }, { x: 99, y: 367, r: 66 }, { x: 107, y: 158, r: 61 }, { x: 244, y: 820, r: 52 }, { x: 130, y: 286, r: 51 }], monsters: [{ t: "spitter", x: 245, y: 512 }, { t: "flyer", x: 319, y: 513 }, { t: "dasher", x: 80, y: 479 }, { t: "splitter", x: 471, y: 273 }, { t: "flyer", x: 84, y: 370, w: 1 }, { t: "jumper", x: 113, y: 170, w: 1 }, { t: "dasher", x: 240, y: 379, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 88, y: 537 }, { t: "tree", x: 113, y: 614 }, { t: "tree", x: 486, y: 802 }, { t: "fencev", x: 406, y: 779 }, { t: "bush", x: 154, y: 744 }], goo: [{ x: 172, y: 510, r: 85 }, { x: 281, y: 293, r: 60 }, { x: 411, y: 535, r: 57 }, { x: 290, y: 507, r: 71 }, { x: 169, y: 161, r: 61 }, { x: 470, y: 187, r: 75 }, { x: 111, y: 705, r: 70 }, { x: 407, y: 198, r: 63 }], monsters: [{ t: "spitter", x: 197, y: 505, v: 1 }, { t: "dasher", x: 290, y: 288 }, { t: "spitter", x: 394, y: 547, v: 1 }, { t: "splitter", x: 291, y: 502, w: 1 }, { t: "chunky", x: 191, y: 159, w: 1 }, { t: "nest", x: 463, y: 179, w: 1 }], animals: [{ s: "chick", x: 233, y: 342 }], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", "......cc....", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".......cc...", ".....cc.....", ".....cc....."], obstacles: [{ t: "tree", x: 482, y: 763 }, { t: "tree", x: 88, y: 234 }, { t: "tree", x: 465, y: 459 }, { t: "fence", x: 417, y: 205 }, { t: "barrel", x: 121, y: 649 }], goo: [{ x: 374, y: 398, r: 68 }, { x: 184, y: 197, r: 71 }, { x: 149, y: 506, r: 66 }, { x: 448, y: 337, r: 67 }, { x: 294, y: 397, r: 89 }, { x: 305, y: 547, r: 85 }, { x: 407, y: 776, r: 69 }, { x: 345, y: 366, r: 68 }, { x: 269, y: 550, r: 51 }], monsters: [{ t: "nest", x: 360, y: 414 }, { t: "blob", x: 164, y: 195 }, { t: "flyer", x: 171, y: 484 }, { t: "chunky", x: 476, y: 356 }, { t: "flyer", x: 293, y: 386, w: 1 }, { t: "blob", x: 314, y: 542, w: 1 }, { t: "nest", x: 238, y: 263, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", ".....cc.....", "....cc......", "....cc......", "....cc......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", "...cc.......", ".....cc.....", ".....cc....."], obstacles: [{ t: "crate", x: 140, y: 300 }, { t: "crate", x: 436, y: 300 }, { t: "hay", x: 140, y: 640 }, { t: "barrel", x: 436, y: 640 }], goo: [{ x: 300, y: 354, r: 73 }, { x: 156, y: 458, r: 80 }, { x: 446, y: 462, r: 84 }, { x: 226, y: 645, r: 55 }, { x: 436, y: 512, r: 53 }], monsters: [{ t: "boss", x: 288, y: 330 }, { t: "spitter", x: 150, y: 460 }, { t: "blob", x: 426, y: 460 }], animals: [], start: { x: 288, y: 860 } }], intro: "boss", boss: true }, { id: "lake-01", stage: 21, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", ".www..ss....", ".www.ss.....", ".www.ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 102, y: 644 }, { t: "tree", x: 464, y: 707 }, { t: "lilyrock", x: 451, y: 580 }, { t: "tree", x: 109, y: 774 }, { t: "reeds", x: 239, y: 606 }], goo: [{ x: 469, y: 166, r: 60 }, { x: 223, y: 187, r: 65 }, { x: 302, y: 386, r: 85 }, { x: 363, y: 143, r: 86 }, { x: 68, y: 216, r: 88 }, { x: 256, y: 351, r: 53 }, { x: 261, y: 192, r: 68 }, { x: 483, y: 798, r: 52 }], monsters: [{ t: "flyer", x: 465, y: 151 }, { t: "dasher", x: 194, y: 183 }, { t: "blob", x: 304, y: 382 }, { t: "nest", x: 349, y: 152, w: 1 }, { t: "flyer", x: 81, y: 224, w: 1 }], animals: [{ s: "otter", x: 388, y: 459 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.www.", ".....ss.www.", "......sswww.", "......sswww.", "......ss....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 449, y: 605 }, { t: "lilyrock", x: 446, y: 208 }, { t: "reeds", x: 307, y: 625 }], goo: [{ x: 200, y: 142, r: 60 }, { x: 178, y: 167, r: 56 }, { x: 162, y: 303, r: 81 }, { x: 320, y: 216, r: 60 }, { x: 210, y: 315, r: 69 }, { x: 94, y: 532, r: 60 }, { x: 89, y: 605, r: 62 }, { x: 311, y: 396, r: 53 }, { x: 335, y: 172, r: 61 }, { x: 248, y: 252, r: 57 }], monsters: [{ t: "flyer", x: 224, y: 131 }, { t: "jumper", x: 155, y: 187 }, { t: "splitter", x: 159, y: 293 }, { t: "chunky", x: 323, y: 217, w: 1 }, { t: "spitter", x: 240, y: 299, w: 1 }, { t: "blob", x: 110, y: 508, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss..www.", "....ss..www.", "....ss..www.", ".....ss.www.", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 121, y: 422 }, { t: "pine", x: 94, y: 333 }, { t: "lilyrock", x: 452, y: 192 }, { t: "bush", x: 174, y: 693 }, { t: "reeds", x: 272, y: 310 }], goo: [{ x: 285, y: 384, r: 74 }, { x: 92, y: 182, r: 59 }, { x: 296, y: 232, r: 63 }, { x: 128, y: 223, r: 82 }, { x: 442, y: 563, r: 63 }, { x: 313, y: 511, r: 85 }, { x: 107, y: 648, r: 52 }, { x: 265, y: 564, r: 61 }, { x: 286, y: 524, r: 66 }, { x: 296, y: 447, r: 62 }], monsters: [{ t: "jumper", x: 296, y: 389 }, { t: "dasher", x: 100, y: 159 }, { t: "blob", x: 321, y: 228 }, { t: "spitter", x: 114, y: 236, v: 1 }, { t: "nest", x: 420, y: 538, w: 1 }, { t: "spitter", x: 327, y: 489, w: 1, v: 1 }, { t: "flyer", x: 252, y: 613, w: 1 }], animals: [{ s: "duckling", x: 255, y: 194 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss.....", ".www.ss.....", ".wwwss......", ".wwwss......", ".wwwss......", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 97, y: 188 }, { t: "tree", x: 450, y: 734 }, { t: "lilyrock", x: 474, y: 441 }, { t: "tree", x: 439, y: 664 }, { t: "lilyrock", x: 209, y: 638 }, { t: "reeds", x: 290, y: 754 }, { t: "bush", x: 389, y: 517 }], goo: [{ x: 490, y: 518, r: 83 }, { x: 222, y: 521, r: 75 }, { x: 306, y: 365, r: 90 }, { x: 78, y: 308, r: 88 }, { x: 323, y: 561, r: 63 }, { x: 433, y: 366, r: 90 }, { x: 252, y: 167, r: 69 }, { x: 205, y: 471, r: 45 }, { x: 184, y: 722, r: 51 }], monsters: [{ t: "dasher", x: 465, y: 534 }, { t: "spitter", x: 220, y: 528, v: 1 }, { t: "flyer", x: 292, y: 367 }, { t: "flyer", x: 104, y: 300, w: 1 }, { t: "spitter", x: 306, y: 554, w: 1, v: 1 }, { t: "jumper", x: 441, y: 378, w: 1 }, { t: "spitter", x: 172, y: 172, w: 2, v: 1 }, { t: "spitter", x: 254, y: 161, w: 2, v: 1 }, { t: "splitter", x: 327, y: 265, w: 2 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "lake-02", stage: 22, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", "....ss......", "....ss..www.", "....ss..www.", "...ss...www.", "...ss...www.", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 82, y: 730 }, { t: "pine", x: 463, y: 764 }, { t: "pine", x: 438, y: 693 }, { t: "driftwood", x: 142, y: 416 }, { t: "reeds", x: 486, y: 590 }], goo: [{ x: 76, y: 590, r: 58 }, { x: 384, y: 247, r: 85 }, { x: 294, y: 383, r: 56 }, { x: 367, y: 647, r: 61 }, { x: 283, y: 499, r: 80 }, { x: 168, y: 141, r: 87 }, { x: 310, y: 628, r: 49 }, { x: 267, y: 791, r: 74 }, { x: 87, y: 617, r: 75 }], monsters: [{ t: "splitter", x: 99, y: 602 }, { t: "splitter", x: 368, y: 239 }, { t: "dasher", x: 271, y: 392 }, { t: "blob", x: 382, y: 638, w: 1 }, { t: "chunky", x: 254, y: 504, w: 1 }, { t: "jumper", x: 162, y: 130, w: 1 }], animals: [{ s: "turtle", x: 224, y: 182 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".....ss.www.", ".....ss.www.", ".....ss.www.", ".....ss.www.", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", "......ss....", "......ss....", "......ss....", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 107, y: 392 }, { t: "tree", x: 458, y: 518 }, { t: "tree", x: 143, y: 655 }, { t: "tree", x: 484, y: 186 }, { t: "lilyrock", x: 79, y: 213 }, { t: "driftwood", x: 243, y: 233 }], goo: [{ x: 382, y: 213, r: 72 }, { x: 142, y: 510, r: 80 }, { x: 339, y: 512, r: 61 }, { x: 284, y: 442, r: 57 }, { x: 261, y: 500, r: 64 }, { x: 354, y: 302, r: 84 }, { x: 205, y: 505, r: 53 }, { x: 110, y: 748, r: 71 }, { x: 384, y: 725, r: 62 }], monsters: [{ t: "nest", x: 392, y: 186 }, { t: "spitter", x: 144, y: 484, v: 1 }, { t: "splitter", x: 351, y: 531 }, { t: "spitter", x: 266, y: 423, v: 1 }, { t: "spitter", x: 239, y: 516, w: 1 }, { t: "splitter", x: 340, y: 306, w: 1 }, { t: "splitter", x: 275, y: 134, w: 1 }, { t: "blob", x: 445, y: 701, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".www.ss.....", ".wwwss......", ".wwwss......", "....ss......", ".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 435, y: 399 }, { t: "pine", x: 118, y: 284 }, { t: "tree", x: 92, y: 150 }, { t: "lilyrock", x: 430, y: 508 }], goo: [{ x: 434, y: 215, r: 69 }, { x: 301, y: 426, r: 86 }, { x: 224, y: 329, r: 77 }, { x: 400, y: 161, r: 71 }, { x: 98, y: 626, r: 87 }, { x: 382, y: 640, r: 82 }, { x: 424, y: 196, r: 56 }, { x: 482, y: 349, r: 71 }, { x: 362, y: 657, r: 51 }, { x: 347, y: 174, r: 74 }], monsters: [{ t: "splitter", x: 425, y: 203 }, { t: "jumper", x: 298, y: 428 }, { t: "chunky", x: 239, y: 301, v: 1 }, { t: "spitter", x: 388, y: 139, v: 1 }, { t: "jumper", x: 119, y: 608, w: 1 }, { t: "blob", x: 392, y: 648, w: 1 }, { t: "flyer", x: 306, y: 237, w: 1 }, { t: "spitter", x: 181, y: 238, w: 1 }], animals: [{ s: "otter", x: 456, y: 271 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.www.", "......sswww.", "......sswww.", "......sswww.", ".....ss.www.", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 475, y: 730 }, { t: "tree", x: 131, y: 773 }, { t: "reeds", x: 289, y: 491 }, { t: "lilyrock", x: 338, y: 599 }, { t: "reeds", x: 366, y: 660 }], goo: [{ x: 94, y: 135, r: 83 }, { x: 251, y: 219, r: 67 }, { x: 161, y: 270, r: 80 }, { x: 201, y: 529, r: 74 }, { x: 157, y: 364, r: 72 }, { x: 196, y: 124, r: 81 }, { x: 123, y: 206, r: 60 }, { x: 88, y: 221, r: 74 }, { x: 317, y: 165, r: 67 }, { x: 213, y: 296, r: 49 }], monsters: [{ t: "dasher", x: 95, y: 122 }, { t: "blob", x: 278, y: 218 }, { t: "splitter", x: 159, y: 269 }, { t: "dasher", x: 173, y: 533, w: 1 }, { t: "nest", x: 165, y: 374, w: 1 }, { t: "spitter", x: 211, y: 132, w: 1 }, { t: "flyer", x: 94, y: 482, w: 2 }, { t: "spitter", x: 263, y: 421, w: 2, v: 1 }, { t: "splitter", x: 361, y: 224, w: 2 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ss...", ".......ss...", ".www..ss....", ".www..ss....", ".www..ss....", ".www.ss.....", ".www.ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 492, y: 647 }, { t: "tree", x: 476, y: 436 }, { t: "lilyrock", x: 210, y: 284 }, { t: "driftwood", x: 111, y: 280 }], goo: [{ x: 490, y: 326, r: 82 }, { x: 360, y: 509, r: 80 }, { x: 173, y: 164, r: 70 }, { x: 507, y: 206, r: 62 }, { x: 236, y: 450, r: 61 }, { x: 336, y: 150, r: 55 }, { x: 269, y: 281, r: 64 }, { x: 354, y: 295, r: 66 }, { x: 172, y: 391, r: 55 }], monsters: [{ t: "blob", x: 480, y: 339 }, { t: "chunky", x: 332, y: 500 }, { t: "nest", x: 174, y: 138 }, { t: "blob", x: 491, y: 215 }, { t: "jumper", x: 228, y: 428, w: 1 }, { t: "chunky", x: 357, y: 167, w: 1, v: 1 }, { t: "chunky", x: 328, y: 272, w: 1, v: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "lake-03", stage: 23, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ss...", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 436, y: 255 }, { t: "bush", x: 146, y: 276 }, { t: "lilyrock", x: 438, y: 684 }], goo: [{ x: 123, y: 151, r: 63 }, { x: 255, y: 434, r: 76 }, { x: 410, y: 345, r: 71 }, { x: 395, y: 201, r: 58 }, { x: 215, y: 259, r: 57 }, { x: 199, y: 648, r: 67 }, { x: 448, y: 191, r: 51 }, { x: 90, y: 480, r: 67 }, { x: 345, y: 522, r: 64 }, { x: 134, y: 582, r: 68 }], monsters: [{ t: "blob", x: 151, y: 144 }, { t: "flyer", x: 239, y: 404 }, { t: "flyer", x: 433, y: 321 }, { t: "spitter", x: 373, y: 189, v: 1 }, { t: "flyer", x: 225, y: 246, w: 1 }, { t: "splitter", x: 201, y: 657, w: 1 }, { t: "flyer", x: 356, y: 342, w: 1 }, { t: "dasher", x: 180, y: 520, w: 1 }], animals: [{ s: "otter", x: 178, y: 347 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", "......ss....", "......ss....", ".www..ss....", ".www.ss.....", ".www.ss.....", ".www.ss.....", ".www..ss....", "......ss....", "......ss....", "......ss....", "......ss....", "......ss....", ".....ss.....", ".....ss....."], obstacles: [{ t: "driftwood", x: 426, y: 300 }, { t: "driftwood", x: 426, y: 560 }, { t: "rock", x: 308, y: 579 }, { t: "driftwood", x: 302, y: 732 }, { t: "driftwood", x: 271, y: 357 }, { t: "driftwood", x: 470, y: 432 }, { t: "lilyrock", x: 456, y: 674 }, { t: "reeds", x: 374, y: 215 }], goo: [{ x: 243, y: 528, r: 64 }, { x: 364, y: 157, r: 69 }, { x: 195, y: 603, r: 71 }, { x: 222, y: 214, r: 60 }, { x: 453, y: 152, r: 77 }, { x: 329, y: 302, r: 58 }, { x: 192, y: 194, r: 75 }, { x: 410, y: 775, r: 71 }, { x: 117, y: 651, r: 53 }, { x: 144, y: 271, r: 58 }], monsters: [{ t: "spitter", x: 241, y: 534, v: 1 }, { t: "flyer", x: 352, y: 140 }, { t: "blob", x: 223, y: 606 }, { t: "chunky", x: 245, y: 195, v: 1 }, { t: "jumper", x: 445, y: 166, w: 1 }, { t: "flyer", x: 341, y: 279, w: 1 }, { t: "spitter", x: 347, y: 482, w: 1 }, { t: "blob", x: 89, y: 248, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".wwss.......", ".wwss.......", ".wwss.......", ".wwwss......", "....ss......", "....ss......", "...ss.......", "...ss.......", "...ss.......", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 440, y: 706 }, { t: "tree", x: 426, y: 527 }, { t: "reeds", x: 112, y: 227 }, { t: "lilyrock", x: 364, y: 354 }], goo: [{ x: 475, y: 405, r: 85 }, { x: 326, y: 258, r: 84 }, { x: 276, y: 536, r: 71 }, { x: 205, y: 432, r: 72 }, { x: 303, y: 673, r: 67 }, { x: 372, y: 232, r: 88 }, { x: 357, y: 667, r: 74 }, { x: 88, y: 714, r: 70 }, { x: 231, y: 797, r: 54 }, { x: 495, y: 621, r: 62 }], monsters: [{ t: "jumper", x: 458, y: 399 }, { t: "chunky", x: 301, y: 255, v: 1 }, { t: "blob", x: 250, y: 555 }, { t: "nest", x: 188, y: 424 }, { t: "blob", x: 319, y: 654, w: 1 }, { t: "spitter", x: 402, y: 220, w: 1 }, { t: "splitter", x: 473, y: 135, w: 1 }, { t: "dasher", x: 360, y: 481, w: 1 }], animals: [{ s: "turtle", x: 194, y: 248 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", "......ss....", "......ss....", "......ss....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "driftwood", x: 261, y: 567 }, { t: "lilyrock", x: 357, y: 526 }, { t: "rock", x: 394, y: 749 }, { t: "driftwood", x: 337, y: 694 }, { t: "lilyrock", x: 432, y: 700 }, { t: "tree", x: 86, y: 466 }, { t: "reeds", x: 126, y: 590 }], goo: [{ x: 333, y: 227, r: 57 }, { x: 264, y: 456, r: 81 }, { x: 384, y: 177, r: 73 }, { x: 97, y: 173, r: 85 }, { x: 447, y: 269, r: 66 }, { x: 244, y: 265, r: 81 }, { x: 297, y: 401, r: 69 }, { x: 260, y: 443, r: 70 }], monsters: [{ t: "flyer", x: 318, y: 228 }, { t: "spitter", x: 252, y: 453, v: 1 }, { t: "nest", x: 409, y: 159 }, { t: "spitter", x: 83, y: 178, w: 1 }, { t: "splitter", x: 456, y: 251, w: 1 }, { t: "nest", x: 218, y: 246, w: 1 }, { t: "blob", x: 173, y: 658, w: 2 }, { t: "dasher", x: 141, y: 530, w: 2 }, { t: "blob", x: 276, y: 132, w: 2 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 131, y: 226 }, { t: "bush", x: 394, y: 709 }], goo: [{ x: 353, y: 436, r: 56 }, { x: 98, y: 365, r: 61 }, { x: 287, y: 139, r: 73 }, { x: 230, y: 472, r: 74 }, { x: 362, y: 604, r: 62 }, { x: 202, y: 323, r: 58 }, { x: 139, y: 656, r: 55 }, { x: 326, y: 776, r: 65 }], monsters: [{ t: "blob", x: 342, y: 414 }, { t: "flyer", x: 127, y: 339 }, { t: "chunky", x: 297, y: 149, v: 1 }, { t: "blob", x: 233, y: 462 }, { t: "dasher", x: 345, y: 587, w: 1 }, { t: "blob", x: 217, y: 329, w: 1 }, { t: "blob", x: 106, y: 696, w: 1 }, { t: "blob", x: 99, y: 416, w: 1 }, { t: "spitter", x: 462, y: 306, w: 2, v: 1 }, { t: "spitter", x: 158, y: 543, w: 2 }, { t: "splitter", x: 470, y: 143, w: 2 }, { t: "jumper", x: 187, y: 634, w: 2 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "lake-04", stage: 24, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", "...ss.......", "...ss.......", "...ss...www.", "...ss...www.", "...ss...www.", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 100, y: 160 }, { t: "lilyrock", x: 130, y: 580 }, { t: "reeds", x: 172, y: 673 }, { t: "reeds", x: 81, y: 291 }], goo: [{ x: 224, y: 574, r: 64 }, { x: 145, y: 391, r: 67 }, { x: 435, y: 621, r: 65 }, { x: 416, y: 323, r: 89 }, { x: 381, y: 612, r: 58 }, { x: 260, y: 478, r: 68 }, { x: 256, y: 241, r: 67 }, { x: 414, y: 617, r: 75 }, { x: 207, y: 526, r: 71 }], monsters: [{ t: "blob", x: 251, y: 556 }, { t: "blob", x: 129, y: 381 }, { t: "blob", x: 451, y: 605 }, { t: "blob", x: 411, y: 338 }, { t: "blob", x: 375, y: 607 }, { t: "splitter", x: 234, y: 449, w: 1 }, { t: "blob", x: 258, y: 256, w: 1 }, { t: "mini", x: 221, y: 619, w: 1 }, { t: "blob", x: 316, y: 181, w: 1 }, { t: "mini", x: 249, y: 333, w: 1 }, { t: "blob", x: 298, y: 684, w: 2 }, { t: "splitter", x: 492, y: 214, w: 2 }, { t: "splitter", x: 88, y: 467, w: 2 }, { t: "splitter", x: 343, y: 510, w: 2 }, { t: "splitter", x: 483, y: 683, w: 2 }], animals: [{ s: "frog", x: 160, y: 314 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".www.ss.....", ".www.ss.....", ".www..ss....", ".www..ss....", "......ss....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 489, y: 677 }, { t: "tree", x: 102, y: 383 }, { t: "pine", x: 482, y: 309 }, { t: "bush", x: 385, y: 356 }, { t: "lilyrock", x: 419, y: 496 }, { t: "bush", x: 111, y: 769 }], goo: [{ x: 300, y: 142, r: 68 }, { x: 141, y: 252, r: 59 }, { x: 300, y: 437, r: 58 }, { x: 199, y: 160, r: 87 }, { x: 501, y: 457, r: 66 }, { x: 290, y: 622, r: 77 }, { x: 389, y: 451, r: 67 }, { x: 375, y: 730, r: 50 }, { x: 490, y: 750, r: 53 }], monsters: [{ t: "blob", x: 282, y: 143 }, { t: "blob", x: 146, y: 255 }, { t: "mini", x: 302, y: 452 }, { t: "splitter", x: 193, y: 163 }, { t: "splitter", x: 482, y: 444 }, { t: "mini", x: 302, y: 601, w: 1 }, { t: "blob", x: 263, y: 668, w: 1 }, { t: "blob", x: 407, y: 607, w: 1 }, { t: "mini", x: 175, y: 358, w: 1 }, { t: "mini", x: 465, y: 379, w: 1 }, { t: "blob", x: 86, y: 161, w: 2 }, { t: "mini", x: 215, y: 315, w: 2 }, { t: "splitter", x: 341, y: 710, w: 2 }, { t: "splitter", x: 332, y: 293, w: 2 }, { t: "splitter", x: 420, y: 127, w: 2 }], animals: [{ s: "turtle", x: 346, y: 179 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 105, y: 650 }, { t: "tree", x: 133, y: 696 }, { t: "reeds", x: 396, y: 252 }], goo: [{ x: 331, y: 398, r: 61 }, { x: 146, y: 437, r: 88 }, { x: 213, y: 627, r: 69 }, { x: 416, y: 580, r: 77 }, { x: 292, y: 173, r: 83 }, { x: 104, y: 572, r: 72 }, { x: 159, y: 808, r: 55 }, { x: 204, y: 808, r: 68 }, { x: 455, y: 280, r: 69 }], monsters: [{ t: "blob", x: 309, y: 381 }, { t: "blob", x: 140, y: 411 }, { t: "mini", x: 212, y: 604 }, { t: "mini", x: 401, y: 580 }, { t: "splitter", x: 293, y: 156 }, { t: "splitter", x: 81, y: 554, w: 1 }, { t: "mini", x: 299, y: 598, w: 1 }, { t: "splitter", x: 382, y: 713, w: 1 }, { t: "splitter", x: 446, y: 377, w: 1 }, { t: "blob", x: 495, y: 178, w: 1 }, { t: "blob", x: 303, y: 462, w: 2 }, { t: "splitter", x: 218, y: 516, w: 2 }, { t: "splitter", x: 109, y: 310, w: 2 }, { t: "blob", x: 339, y: 215, w: 2 }, { t: "splitter", x: 80, y: 207, w: 2 }], animals: [{ s: "otter", x: 377, y: 405 }], start: { x: 288, y: 860 } }], tier: 22 }, { id: "lake-05", stage: 25, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.www.", "....ss..www.", "....ss..www.", "....ss..www.", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 432, y: 385 }, { t: "lilyrock", x: 119, y: 234 }, { t: "lilyrock", x: 293, y: 329 }, { t: "reeds", x: 283, y: 726 }, { t: "lilyrock", x: 168, y: 449 }], goo: [{ x: 284, y: 223, r: 67 }, { x: 342, y: 412, r: 88 }, { x: 235, y: 122, r: 82 }, { x: 189, y: 712, r: 73 }, { x: 370, y: 193, r: 57 }, { x: 122, y: 532, r: 80 }, { x: 318, y: 449, r: 47 }, { x: 409, y: 245, r: 73 }, { x: 212, y: 350, r: 59 }], monsters: [{ t: "chunky", x: 295, y: 213, v: 1 }, { t: "flyer", x: 363, y: 400 }, { t: "dasher", x: 242, y: 124 }, { t: "blob", x: 208, y: 705, w: 1 }, { t: "flyer", x: 360, y: 175, w: 1 }, { t: "nest", x: 123, y: 537, w: 1 }], animals: [{ s: "frog", x: 188, y: 289 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".....ss.....", ".www.ss.....", ".www.ss.....", ".www.ss.....", ".www.ss.....", ".www.ss.....", "....ss......", "....ss......", "....ss......", "...ss.......", "...ss.......", "...ss.......", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 143, y: 651 }, { t: "pine", x: 478, y: 679 }, { t: "tree", x: 495, y: 320 }, { t: "driftwood", x: 491, y: 389 }, { t: "driftwood", x: 410, y: 458 }, { t: "lilyrock", x: 257, y: 353 }], goo: [{ x: 87, y: 200, r: 60 }, { x: 352, y: 525, r: 83 }, { x: 247, y: 261, r: 87 }, { x: 319, y: 290, r: 64 }, { x: 267, y: 492, r: 72 }, { x: 419, y: 231, r: 85 }, { x: 292, y: 184, r: 69 }, { x: 403, y: 597, r: 72 }, { x: 295, y: 609, r: 67 }, { x: 464, y: 625, r: 70 }], monsters: [{ t: "jumper", x: 91, y: 181 }, { t: "splitter", x: 343, y: 543 }, { t: "spitter", x: 219, y: 279 }, { t: "nest", x: 323, y: 268 }, { t: "blob", x: 241, y: 473, w: 1 }, { t: "nest", x: 438, y: 207, w: 1 }, { t: "spitter", x: 141, y: 253, w: 1, v: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......sswww.", ".....ss.www.", ".....ss.www.", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 430, y: 505 }, { t: "pine", x: 90, y: 466 }, { t: "tree", x: 462, y: 812 }, { t: "driftwood", x: 219, y: 230 }, { t: "driftwood", x: 129, y: 614 }, { t: "lilyrock", x: 274, y: 395 }], goo: [{ x: 98, y: 260, r: 65 }, { x: 170, y: 122, r: 63 }, { x: 380, y: 535, r: 65 }, { x: 320, y: 265, r: 64 }, { x: 520, y: 104, r: 60 }, { x: 450, y: 290, r: 62 }, { x: 287, y: 617, r: 69 }, { x: 87, y: 545, r: 46 }, { x: 463, y: 258, r: 50 }, { x: 174, y: 435, r: 45 }], monsters: [{ t: "dasher", x: 118, y: 233 }, { t: "spitter", x: 183, y: 127 }, { t: "flyer", x: 360, y: 520 }, { t: "nest", x: 338, y: 266 }, { t: "blob", x: 496, y: 120, w: 1 }, { t: "nest", x: 468, y: 261, w: 1 }, { t: "splitter", x: 372, y: 153, w: 1 }, { t: "spitter", x: 218, y: 334, w: 1, v: 1 }], animals: [{ s: "otter", x: 157, y: 418 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", ".wwwss......", ".www.ss.....", ".www.ss.....", ".www.ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 452, y: 791 }, { t: "pine", x: 440, y: 505 }, { t: "lilyrock", x: 134, y: 170 }, { t: "lilyrock", x: 105, y: 594 }, { t: "tree", x: 133, y: 752 }, { t: "bush", x: 206, y: 251 }], goo: [{ x: 365, y: 523, r: 68 }, { x: 396, y: 219, r: 81 }, { x: 323, y: 315, r: 87 }, { x: 467, y: 322, r: 79 }, { x: 145, y: 243, r: 64 }, { x: 286, y: 221, r: 62 }, { x: 356, y: 344, r: 63 }, { x: 282, y: 284, r: 64 }, { x: 254, y: 501, r: 71 }], monsters: [{ t: "splitter", x: 345, y: 496 }, { t: "splitter", x: 419, y: 199 }, { t: "chunky", x: 303, y: 326 }, { t: "jumper", x: 455, y: 323, w: 1 }, { t: "spitter", x: 133, y: 251, w: 1 }, { t: "chunky", x: 272, y: 198, w: 1, v: 1 }, { t: "jumper", x: 406, y: 614, w: 2 }, { t: "blob", x: 174, y: 616, w: 2 }, { t: "spitter", x: 231, y: 394, w: 2, v: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss......", ".wwwss......", ".wwwss......", ".www.ss.....", ".www.ss.....", ".www.ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 436, y: 204 }, { t: "pine", x: 466, y: 154 }, { t: "tree", x: 494, y: 297 }, { t: "tree", x: 444, y: 398 }, { t: "tree", x: 109, y: 191 }, { t: "driftwood", x: 457, y: 772 }, { t: "driftwood", x: 290, y: 658 }, { t: "driftwood", x: 254, y: 762 }], goo: [{ x: 78, y: 289, r: 88 }, { x: 436, y: 573, r: 71 }, { x: 312, y: 441, r: 74 }, { x: 187, y: 395, r: 66 }, { x: 289, y: 562, r: 64 }, { x: 256, y: 115, r: 82 }, { x: 371, y: 198, r: 73 }, { x: 166, y: 786, r: 55 }, { x: 328, y: 391, r: 55 }], monsters: [{ t: "spitter", x: 82, y: 260 }, { t: "blob", x: 431, y: 552 }, { t: "splitter", x: 325, y: 452 }, { t: "chunky", x: 201, y: 374 }, { t: "jumper", x: 288, y: 550, w: 1 }, { t: "blob", x: 278, y: 128, w: 1 }, { t: "spitter", x: 279, y: 296, w: 1 }, { t: "spitter", x: 318, y: 221, w: 1, v: 1 }, { t: "blob", x: 112, y: 373, w: 2 }, { t: "nest", x: 191, y: 223, w: 2 }, { t: "splitter", x: 348, y: 356, w: 2 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "lake-06", stage: 26, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".www...ss...", ".www...ss...", ".www...ss...", ".www...ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 128, y: 168 }, { t: "pine", x: 494, y: 712 }, { t: "lilyrock", x: 96, y: 577 }, { t: "driftwood", x: 393, y: 752 }, { t: "reeds", x: 395, y: 380 }, { t: "bush", x: 277, y: 660 }], goo: [{ x: 422, y: 522, r: 85 }, { x: 267, y: 240, r: 77 }, { x: 402, y: 153, r: 67 }, { x: 259, y: 565, r: 78 }, { x: 237, y: 487, r: 88 }, { x: 102, y: 666, r: 68 }, { x: 318, y: 198, r: 47 }, { x: 180, y: 589, r: 60 }, { x: 275, y: 546, r: 61 }, { x: 370, y: 338, r: 61 }], monsters: [{ t: "nest", x: 443, y: 517 }, { t: "spitter", x: 263, y: 254 }, { t: "blob", x: 411, y: 144 }, { t: "dasher", x: 268, y: 554 }, { t: "spitter", x: 256, y: 464, w: 1, v: 1 }, { t: "flyer", x: 78, y: 640, w: 1 }, { t: "blob", x: 375, y: 243, w: 1 }, { t: "dasher", x: 286, y: 164, w: 1 }], animals: [{ s: "turtle", x: 365, y: 454 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", "....ss......", "....ss..www.", "....ss..www.", "...ss...www.", "...ss...www.", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss....."], obstacles: [{ t: "driftwood", x: 158, y: 447 }, { t: "lilyrock", x: 396, y: 611 }, { t: "rock", x: 289, y: 570 }, { t: "lilyrock", x: 312, y: 265 }, { t: "tree", x: 81, y: 724 }, { t: "pine", x: 102, y: 189 }, { t: "bush", x: 228, y: 386 }, { t: "bush", x: 178, y: 273 }], goo: [{ x: 409, y: 262, r: 63 }, { x: 254, y: 155, r: 60 }, { x: 232, y: 603, r: 63 }, { x: 116, y: 337, r: 78 }, { x: 191, y: 714, r: 63 }, { x: 370, y: 158, r: 87 }, { x: 461, y: 588, r: 65 }, { x: 435, y: 315, r: 62 }, { x: 321, y: 457, r: 54 }, { x: 347, y: 542, r: 55 }], monsters: [{ t: "chunky", x: 428, y: 278 }, { t: "nest", x: 225, y: 150 }, { t: "blob", x: 205, y: 613 }, { t: "blob", x: 139, y: 322 }, { t: "blob", x: 211, y: 710, w: 1 }, { t: "spitter", x: 381, y: 141, w: 1 }, { t: "nest", x: 338, y: 394, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".wwwss......", ".wwwss......", ".wwwss......", ".wwwss......", ".wwwss......", "....ss......", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 456, y: 816 }, { t: "tree", x: 84, y: 147 }, { t: "pine", x: 445, y: 351 }, { t: "reeds", x: 113, y: 728 }, { t: "driftwood", x: 386, y: 396 }], goo: [{ x: 220, y: 605, r: 66 }, { x: 455, y: 216, r: 60 }, { x: 499, y: 129, r: 64 }, { x: 339, y: 595, r: 66 }, { x: 159, y: 131, r: 56 }, { x: 409, y: 692, r: 63 }, { x: 247, y: 705, r: 63 }, { x: 220, y: 779, r: 71 }], monsters: [{ t: "blob", x: 207, y: 597 }, { t: "chunky", x: 437, y: 234 }, { t: "blob", x: 484, y: 141 }, { t: "blob", x: 354, y: 615 }, { t: "flyer", x: 186, y: 121, w: 1 }, { t: "blob", x: 402, y: 704, w: 1 }, { t: "flyer", x: 385, y: 298, w: 1 }, { t: "dasher", x: 223, y: 253, w: 1 }, { t: "jumper", x: 249, y: 171, w: 2 }, { t: "blob", x: 248, y: 500, w: 2 }, { t: "flyer", x: 441, y: 576, w: 2 }], animals: [{ s: "frog", x: 320, y: 175 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss...www.", "...ss...www.", "....ss..www.", "....ss..www.", "....ss..www.", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss....."], obstacles: [{ t: "driftwood", x: 207, y: 463 }, { t: "lilyrock", x: 309, y: 519 }, { t: "lilyrock", x: 454, y: 273 }, { t: "rock", x: 256, y: 261 }, { t: "tree", x: 450, y: 769 }, { t: "pine", x: 114, y: 238 }, { t: "lilyrock", x: 334, y: 636 }, { t: "reeds", x: 321, y: 425 }, { t: "reeds", x: 420, y: 356 }], goo: [{ x: 380, y: 162, r: 83 }, { x: 289, y: 342, r: 85 }, { x: 396, y: 445, r: 88 }, { x: 204, y: 131, r: 64 }, { x: 144, y: 566, r: 87 }, { x: 320, y: 166, r: 69 }, { x: 101, y: 791, r: 55 }, { x: 258, y: 730, r: 60 }, { x: 369, y: 351, r: 48 }, { x: 149, y: 593, r: 57 }], monsters: [{ t: "chunky", x: 408, y: 172 }, { t: "jumper", x: 273, y: 349 }, { t: "spitter", x: 420, y: 424 }, { t: "spitter", x: 184, y: 147, w: 1 }, { t: "splitter", x: 169, y: 586, w: 1 }, { t: "spitter", x: 296, y: 168, w: 1 }, { t: "nest", x: 99, y: 360, w: 2 }, { t: "jumper", x: 244, y: 549, w: 2 }, { t: "spitter", x: 162, y: 300, w: 2, v: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.www.", ".....ss.www.", ".....ss.www.", "....ss..www.", "....ss......", "....ss......", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 132, y: 624 }, { t: "tree", x: 466, y: 383 }, { t: "tree", x: 145, y: 560 }, { t: "lilyrock", x: 106, y: 258 }, { t: "reeds", x: 93, y: 736 }], goo: [{ x: 314, y: 156, r: 55 }, { x: 450, y: 267, r: 64 }, { x: 161, y: 120, r: 87 }, { x: 355, y: 239, r: 81 }, { x: 257, y: 250, r: 77 }, { x: 91, y: 377, r: 57 }, { x: 350, y: 714, r: 51 }, { x: 185, y: 749, r: 64 }, { x: 101, y: 191, r: 57 }, { x: 187, y: 785, r: 61 }], monsters: [{ t: "blob", x: 339, y: 132 }, { t: "jumper", x: 426, y: 251 }, { t: "dasher", x: 178, y: 125 }, { t: "jumper", x: 347, y: 232 }, { t: "dasher", x: 257, y: 241, w: 1 }, { t: "splitter", x: 84, y: 392, w: 1 }, { t: "splitter", x: 422, y: 683, w: 1 }, { t: "nest", x: 215, y: 374, w: 1 }, { t: "splitter", x: 210, y: 515, w: 2 }, { t: "dasher", x: 249, y: 671, w: 2 }, { t: "flyer", x: 399, y: 178, w: 2 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "lake-07", stage: 27, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", "....ss......", "....ss......", "....ss......", ".....ss.....", ".www.ss.....", ".www.ss.....", ".www..ss....", ".www..ss....", ".www..ss....", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 86, y: 388 }, { t: "tree", x: 492, y: 760 }, { t: "lilyrock", x: 494, y: 685 }, { t: "reeds", x: 176, y: 407 }, { t: "bush", x: 357, y: 296 }], goo: [{ x: 346, y: 140, r: 58 }, { x: 225, y: 507, r: 64 }, { x: 458, y: 306, r: 76 }, { x: 140, y: 297, r: 59 }, { x: 129, y: 188, r: 66 }, { x: 442, y: 397, r: 86 }, { x: 231, y: 386, r: 50 }, { x: 262, y: 563, r: 69 }], monsters: [{ t: "chunky", x: 341, y: 142 }, { t: "blob", x: 229, y: 492 }, { t: "chunky", x: 471, y: 306, v: 1 }, { t: "spitter", x: 117, y: 271 }, { t: "dasher", x: 126, y: 168, w: 1 }, { t: "blob", x: 471, y: 386, w: 1 }, { t: "flyer", x: 170, y: 309, w: 1 }], animals: [{ s: "otter", x: 340, y: 425 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".....ss.....", ".....ss.www.", ".....ss.www.", "......sswww.", "......sswww.", "......sswww.", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 455, y: 721 }, { t: "lilyrock", x: 92, y: 360 }, { t: "tree", x: 485, y: 597 }, { t: "bush", x: 484, y: 205 }], goo: [{ x: 213, y: 299, r: 86 }, { x: 134, y: 265, r: 82 }, { x: 223, y: 510, r: 66 }, { x: 221, y: 611, r: 61 }, { x: 114, y: 201, r: 64 }, { x: 353, y: 296, r: 70 }, { x: 263, y: 788, r: 56 }, { x: 276, y: 761, r: 63 }], monsters: [{ t: "jumper", x: 224, y: 277 }, { t: "flyer", x: 114, y: 271 }, { t: "spitter", x: 235, y: 491, v: 1 }, { t: "dasher", x: 229, y: 613 }, { t: "dasher", x: 142, y: 194, w: 1 }, { t: "blob", x: 360, y: 272, w: 1 }, { t: "dasher", x: 294, y: 125, w: 1 }, { t: "jumper", x: 293, y: 371, w: 2 }, { t: "blob", x: 177, y: 353, w: 2 }, { t: "splitter", x: 122, y: 653, w: 2 }], animals: [{ s: "frog", x: 350, y: 425 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss..www.", "....ss..www.", "....ss..www.", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 113, y: 705 }, { t: "pine", x: 473, y: 621 }, { t: "tree", x: 108, y: 377 }, { t: "tree", x: 143, y: 192 }, { t: "reeds", x: 451, y: 559 }, { t: "reeds", x: 379, y: 250 }], goo: [{ x: 196, y: 466, r: 75 }, { x: 295, y: 148, r: 86 }, { x: 206, y: 165, r: 82 }, { x: 257, y: 392, r: 60 }, { x: 272, y: 535, r: 63 }, { x: 153, y: 280, r: 77 }, { x: 295, y: 266, r: 62 }, { x: 471, y: 753, r: 56 }], monsters: [{ t: "dasher", x: 223, y: 475 }, { t: "nest", x: 325, y: 152 }, { t: "spitter", x: 219, y: 175, v: 1 }, { t: "dasher", x: 238, y: 394 }, { t: "spitter", x: 297, y: 552, w: 1, v: 1 }, { t: "spitter", x: 132, y: 298, w: 1 }, { t: "spitter", x: 498, y: 486, w: 1 }, { t: "spitter", x: 476, y: 199, w: 2, v: 1 }, { t: "spitter", x: 176, y: 536, w: 2 }, { t: "splitter", x: 345, y: 709, w: 2 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.www.", ".....ss.www.", ".....ss.www.", "......sswww.", "......ss....", "......ss....", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 489, y: 291 }, { t: "tree", x: 128, y: 815 }, { t: "bush", x: 123, y: 463 }, { t: "reeds", x: 147, y: 607 }, { t: "reeds", x: 203, y: 648 }], goo: [{ x: 398, y: 172, r: 70 }, { x: 310, y: 472, r: 77 }, { x: 91, y: 254, r: 71 }, { x: 240, y: 229, r: 77 }, { x: 210, y: 550, r: 84 }, { x: 271, y: 152, r: 83 }, { x: 348, y: 764, r: 54 }, { x: 370, y: 782, r: 55 }], monsters: [{ t: "jumper", x: 415, y: 169 }, { t: "spitter", x: 297, y: 462 }, { t: "flyer", x: 110, y: 255 }, { t: "dasher", x: 247, y: 208 }, { t: "chunky", x: 212, y: 540, w: 1 }, { t: "spitter", x: 289, y: 130, w: 1, v: 1 }, { t: "blob", x: 258, y: 624, w: 1 }, { t: "dasher", x: 263, y: 296, w: 1 }, { t: "blob", x: 417, y: 264, w: 2 }, { t: "flyer", x: 427, y: 358, w: 2 }, { t: "splitter", x: 90, y: 153, w: 2 }], animals: [{ s: "turtle", x: 333, y: 267 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss.....", ".....ss.....", ".wwwss......", ".wwwss......", ".wwwss......", ".www.ss.....", ".www.ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 89, y: 374 }, { t: "lilyrock", x: 478, y: 332 }, { t: "tree", x: 141, y: 709 }, { t: "lilyrock", x: 135, y: 171 }, { t: "lilyrock", x: 413, y: 396 }], goo: [{ x: 228, y: 306, r: 74 }, { x: 134, y: 230, r: 74 }, { x: 403, y: 210, r: 56 }, { x: 356, y: 520, r: 89 }, { x: 312, y: 444, r: 69 }, { x: 252, y: 222, r: 57 }, { x: 313, y: 189, r: 52 }, { x: 366, y: 706, r: 66 }, { x: 461, y: 470, r: 45 }, { x: 254, y: 689, r: 73 }], monsters: [{ t: "blob", x: 227, y: 300 }, { t: "spitter", x: 143, y: 244, v: 1 }, { t: "chunky", x: 422, y: 216, v: 1 }, { t: "spitter", x: 368, y: 530, v: 1 }, { t: "chunky", x: 328, y: 415, w: 1 }, { t: "spitter", x: 230, y: 207, w: 1, v: 1 }, { t: "flyer", x: 299, y: 562, w: 1 }, { t: "blob", x: 492, y: 680, w: 1 }, { t: "jumper", x: 288, y: 654, w: 2 }, { t: "splitter", x: 407, y: 650, w: 2 }, { t: "splitter", x: 487, y: 507, w: 2 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "lake-08", stage: 28, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss.....", ".....ss.....", ".wwwss......", ".wwwss......", ".wwwss......", ".wwss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 453, y: 329 }, { t: "tree", x: 469, y: 759 }, { t: "tree", x: 143, y: 405 }, { t: "pine", x: 491, y: 712 }, { t: "bush", x: 388, y: 216 }, { t: "reeds", x: 319, y: 229 }, { t: "lilyrock", x: 112, y: 233 }], goo: [{ x: 457, y: 627, r: 85 }, { x: 189, y: 345, r: 71 }, { x: 490, y: 430, r: 56 }, { x: 186, y: 600, r: 86 }, { x: 205, y: 193, r: 72 }, { x: 323, y: 302, r: 83 }, { x: 319, y: 475, r: 54 }, { x: 310, y: 502, r: 50 }, { x: 360, y: 807, r: 53 }, { x: 439, y: 563, r: 52 }], monsters: [{ t: "dasher", x: 482, y: 598 }, { t: "dasher", x: 212, y: 335 }, { t: "spitter", x: 494, y: 418, v: 1 }, { t: "dasher", x: 185, y: 611 }, { t: "dasher", x: 217, y: 212, w: 1 }, { t: "spitter", x: 344, y: 309, w: 1, v: 1 }, { t: "jumper", x: 246, y: 560, w: 1 }, { t: "dasher", x: 463, y: 197, w: 1 }], animals: [{ s: "frog", x: 399, y: 447 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", "......ss....", ".www..ss....", ".www..ss....", ".www.ss.....", ".www.ss.....", ".www.ss.....", "....ss......", "....ss......", "....ss......", "...ss.......", "...ss.......", "...ss.......", ".....ss.....", ".....ss....."], obstacles: [{ t: "rock", x: 120, y: 297 }, { t: "rock", x: 391, y: 509 }, { t: "driftwood", x: 117, y: 647 }, { t: "lilyrock", x: 315, y: 589 }, { t: "tree", x: 472, y: 259 }, { t: "pine", x: 432, y: 409 }, { t: "tree", x: 452, y: 544 }, { t: "lilyrock", x: 193, y: 731 }], goo: [{ x: 241, y: 231, r: 83 }, { x: 371, y: 275, r: 68 }, { x: 345, y: 144, r: 57 }, { x: 344, y: 361, r: 81 }, { x: 139, y: 185, r: 60 }, { x: 439, y: 345, r: 79 }, { x: 400, y: 628, r: 53 }, { x: 454, y: 813, r: 68 }, { x: 387, y: 656, r: 48 }, { x: 190, y: 266, r: 61 }], monsters: [{ t: "jumper", x: 223, y: 241 }, { t: "blob", x: 349, y: 249 }, { t: "jumper", x: 358, y: 158 }, { t: "blob", x: 344, y: 354 }, { t: "nest", x: 146, y: 167, w: 1 }, { t: "jumper", x: 464, y: 346, w: 1 }, { t: "nest", x: 293, y: 502, w: 1 }, { t: "dasher", x: 219, y: 520, w: 1 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ssww.", ".......ssww.", ".......ssww.", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 106, y: 297 }, { t: "pine", x: 110, y: 738 }, { t: "lilyrock", x: 201, y: 515 }], goo: [{ x: 361, y: 582, r: 68 }, { x: 252, y: 157, r: 65 }, { x: 271, y: 542, r: 79 }, { x: 337, y: 177, r: 64 }, { x: 360, y: 347, r: 76 }, { x: 470, y: 552, r: 73 }, { x: 422, y: 248, r: 67 }, { x: 202, y: 313, r: 71 }, { x: 223, y: 383, r: 73 }], monsters: [{ t: "dasher", x: 373, y: 553 }, { t: "jumper", x: 242, y: 135 }, { t: "spitter", x: 283, y: 541, v: 1 }, { t: "blob", x: 341, y: 188 }, { t: "blob", x: 378, y: 332, w: 1 }, { t: "spitter", x: 488, y: 523, w: 1 }, { t: "splitter", x: 320, y: 397, w: 1 }, { t: "nest", x: 467, y: 159, w: 1 }, { t: "blob", x: 147, y: 216, w: 2 }, { t: "spitter", x: 405, y: 252, w: 2, v: 1 }, { t: "blob", x: 214, y: 363, w: 2 }, { t: "blob", x: 452, y: 654, w: 2 }], animals: [{ s: "turtle", x: 335, y: 490 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "driftwood", x: 268, y: 597 }, { t: "lilyrock", x: 175, y: 626 }, { t: "driftwood", x: 454, y: 228 }, { t: "driftwood", x: 425, y: 702 }, { t: "lilyrock", x: 91, y: 276 }, { t: "reeds", x: 283, y: 219 }], goo: [{ x: 82, y: 398, r: 75 }, { x: 243, y: 459, r: 64 }, { x: 392, y: 408, r: 66 }, { x: 111, y: 154, r: 83 }, { x: 188, y: 398, r: 84 }, { x: 291, y: 403, r: 63 }, { x: 364, y: 511, r: 69 }, { x: 192, y: 355, r: 57 }], monsters: [{ t: "splitter", x: 81, y: 397 }, { t: "spitter", x: 232, y: 469 }, { t: "jumper", x: 399, y: 386 }, { t: "chunky", x: 115, y: 157, v: 1 }, { t: "flyer", x: 199, y: 394, w: 1 }, { t: "blob", x: 289, y: 411, w: 1 }, { t: "splitter", x: 203, y: 126, w: 1 }, { t: "flyer", x: 107, y: 542, w: 2 }, { t: "splitter", x: 351, y: 251, w: 2 }, { t: "chunky", x: 190, y: 237, w: 2 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.www.", "......sswww.", "......sswww.", "......sswww.", ".....ss.www.", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 87, y: 343 }, { t: "lilyrock", x: 96, y: 439 }, { t: "pine", x: 453, y: 147 }, { t: "reeds", x: 279, y: 522 }], goo: [{ x: 524, y: 313, r: 61 }, { x: 157, y: 362, r: 61 }, { x: 204, y: 207, r: 78 }, { x: 322, y: 239, r: 79 }, { x: 107, y: 130, r: 83 }, { x: 263, y: 602, r: 84 }, { x: 346, y: 712, r: 64 }, { x: 211, y: 467, r: 57 }, { x: 271, y: 378, r: 45 }, { x: 374, y: 680, r: 71 }], monsters: [{ t: "spitter", x: 495, y: 323, v: 1 }, { t: "nest", x: 176, y: 338 }, { t: "spitter", x: 194, y: 216, v: 1 }, { t: "spitter", x: 296, y: 223 }, { t: "nest", x: 131, y: 131, w: 1 }, { t: "jumper", x: 236, y: 599, w: 1 }, { t: "spitter", x: 123, y: 551, w: 1 }, { t: "spitter", x: 371, y: 179, w: 1 }, { t: "dasher", x: 301, y: 441, w: 2 }, { t: "flyer", x: 162, y: 640, w: 2 }, { t: "spitter", x: 343, y: 511, w: 2, v: 1 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "lake-09", stage: 29, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".wwwss......", ".wwwss......", ".wwwss......", "...ss.......", "...ss.......", "...ss.......", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 97, y: 167 }, { t: "tree", x: 95, y: 595 }, { t: "pine", x: 426, y: 451 }, { t: "lilyrock", x: 449, y: 336 }, { t: "lilyrock", x: 307, y: 676 }, { t: "lilyrock", x: 409, y: 719 }], goo: [{ x: 297, y: 530, r: 61 }, { x: 461, y: 566, r: 88 }, { x: 305, y: 396, r: 69 }, { x: 390, y: 268, r: 61 }, { x: 80, y: 305, r: 56 }, { x: 185, y: 410, r: 85 }, { x: 268, y: 213, r: 54 }, { x: 222, y: 663, r: 54 }, { x: 486, y: 554, r: 66 }, { x: 480, y: 274, r: 46 }], monsters: [{ t: "dasher", x: 286, y: 528 }, { t: "jumper", x: 469, y: 539 }, { t: "blob", x: 289, y: 407 }, { t: "blob", x: 369, y: 281 }, { t: "dasher", x: 88, y: 292, w: 1 }, { t: "blob", x: 200, y: 392, w: 1 }, { t: "nest", x: 455, y: 179, w: 1 }, { t: "nest", x: 258, y: 133, w: 1 }], animals: [{ s: "otter", x: 147, y: 340 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".www...ss...", ".www...ss...", ".www...ss...", ".www...ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 437, y: 395 }, { t: "pine", x: 494, y: 593 }, { t: "lilyrock", x: 154, y: 741 }, { t: "bush", x: 283, y: 334 }], goo: [{ x: 272, y: 567, r: 61 }, { x: 440, y: 602, r: 62 }, { x: 479, y: 217, r: 56 }, { x: 142, y: 365, r: 83 }, { x: 371, y: 565, r: 63 }, { x: 273, y: 451, r: 88 }, { x: 264, y: 639, r: 70 }, { x: 242, y: 564, r: 71 }, { x: 388, y: 702, r: 62 }, { x: 347, y: 448, r: 62 }], monsters: [{ t: "jumper", x: 265, y: 541 }, { t: "jumper", x: 413, y: 596 }, { t: "flyer", x: 487, y: 213 }, { t: "blob", x: 160, y: 343 }, { t: "spitter", x: 356, y: 550, w: 1 }, { t: "spitter", x: 269, y: 431, w: 1, v: 1 }, { t: "blob", x: 406, y: 170, w: 1 }, { t: "blob", x: 411, y: 488, w: 2 }, { t: "flyer", x: 363, y: 435, w: 2 }, { t: "chunky", x: 179, y: 188, w: 2, v: 1 }], animals: [{ s: "turtle", x: 163, y: 269 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss.....", ".....ss.www.", ".....ss.www.", ".....ss.www.", ".....ss.www.", "....ss......", "....ss......", "....ss......", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 95, y: 745 }, { t: "pine", x: 480, y: 374 }, { t: "pine", x: 138, y: 339 }, { t: "bush", x: 138, y: 543 }], goo: [{ x: 301, y: 164, r: 87 }, { x: 457, y: 485, r: 70 }, { x: 389, y: 301, r: 64 }, { x: 146, y: 173, r: 69 }, { x: 278, y: 535, r: 65 }, { x: 245, y: 563, r: 66 }, { x: 177, y: 797, r: 63 }, { x: 260, y: 224, r: 46 }, { x: 89, y: 288, r: 69 }], monsters: [{ t: "jumper", x: 291, y: 152 }, { t: "flyer", x: 475, y: 471 }, { t: "spitter", x: 382, y: 292 }, { t: "splitter", x: 170, y: 193, w: 1 }, { t: "nest", x: 292, y: 545, w: 1 }, { t: "blob", x: 219, y: 534, w: 1 }, { t: "nest", x: 239, y: 276, w: 2 }, { t: "blob", x: 479, y: 279, w: 2 }, { t: "nest", x: 143, y: 423, w: 2 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", "...ss...www.", "...ss...www.", "...ss...www.", "....ss..www.", "....ss......", "....ss......", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 88, y: 219 }, { t: "tree", x: 90, y: 634 }, { t: "tree", x: 437, y: 671 }, { t: "tree", x: 462, y: 793 }, { t: "reeds", x: 245, y: 320 }], goo: [{ x: 111, y: 162, r: 58 }, { x: 95, y: 352, r: 85 }, { x: 175, y: 156, r: 78 }, { x: 495, y: 143, r: 89 }, { x: 272, y: 715, r: 65 }, { x: 329, y: 240, r: 79 }, { x: 341, y: 689, r: 68 }, { x: 422, y: 567, r: 71 }, { x: 285, y: 380, r: 70 }], monsters: [{ t: "spitter", x: 88, y: 141, v: 1 }, { t: "splitter", x: 115, y: 339 }, { t: "blob", x: 202, y: 175 }, { t: "dasher", x: 483, y: 162 }, { t: "dasher", x: 295, y: 717, w: 1 }, { t: "nest", x: 356, y: 217, w: 1 }, { t: "chunky", x: 256, y: 414, w: 1 }, { t: "spitter", x: 212, y: 481, w: 1 }, { t: "flyer", x: 244, y: 124, w: 2 }, { t: "blob", x: 184, y: 592, w: 2 }, { t: "blob", x: 379, y: 143, w: 2 }], animals: [{ s: "frog", x: 124, y: 447 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", ".......ss...", ".......ss...", ".......ssww.", ".......ssww.", ".......ssww.", ".......ss...", "......ss....", "......ss....", "......ss....", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 438, y: 188 }, { t: "pine", x: 474, y: 328 }, { t: "tree", x: 125, y: 655 }, { t: "lilyrock", x: 487, y: 403 }, { t: "reeds", x: 177, y: 402 }, { t: "bush", x: 294, y: 479 }], goo: [{ x: 158, y: 467, r: 78 }, { x: 257, y: 260, r: 82 }, { x: 183, y: 590, r: 75 }, { x: 90, y: 379, r: 80 }, { x: 256, y: 643, r: 56 }, { x: 109, y: 164, r: 78 }, { x: 373, y: 420, r: 74 }, { x: 393, y: 458, r: 55 }, { x: 352, y: 385, r: 68 }], monsters: [{ t: "chunky", x: 182, y: 480 }, { t: "splitter", x: 257, y: 269 }, { t: "blob", x: 193, y: 567 }, { t: "spitter", x: 115, y: 369, v: 1 }, { t: "flyer", x: 261, y: 649, w: 1 }, { t: "chunky", x: 130, y: 181, w: 1 }, { t: "blob", x: 368, y: 349, w: 1 }, { t: "nest", x: 353, y: 196, w: 2 }, { t: "dasher", x: 101, y: 522, w: 2 }, { t: "nest", x: 377, y: 457, w: 2 }], animals: [], start: { x: 288, y: 860 } }] }, { id: "lake-10", stage: 30, region: "lake", rooms: [{ terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......sswww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ssww.", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 446, y: 265 }, { t: "lilyrock", x: 125, y: 542 }, { t: "reeds", x: 236, y: 724 }], goo: [{ x: 350, y: 168, r: 84 }, { x: 299, y: 644, r: 68 }, { x: 262, y: 407, r: 65 }, { x: 337, y: 478, r: 84 }, { x: 157, y: 239, r: 83 }, { x: 80, y: 342, r: 72 }, { x: 323, y: 548, r: 65 }, { x: 116, y: 238, r: 54 }, { x: 356, y: 590, r: 70 }, { x: 377, y: 811, r: 72 }], monsters: [{ t: "nest", x: 370, y: 180 }, { t: "jumper", x: 293, y: 620 }, { t: "splitter", x: 241, y: 409 }, { t: "spitter", x: 331, y: 457, w: 1 }, { t: "nest", x: 146, y: 240, w: 1 }, { t: "nest", x: 106, y: 341, w: 1 }], animals: [{ s: "frog", x: 376, y: 331 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", ".www..ss....", ".www..ss....", ".www...ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".......ss...", ".....ss.....", ".....ss....."], obstacles: [{ t: "pine", x: 118, y: 747 }, { t: "tree", x: 131, y: 254 }, { t: "tree", x: 83, y: 149 }, { t: "tree", x: 99, y: 622 }, { t: "reeds", x: 428, y: 758 }, { t: "lilyrock", x: 250, y: 270 }], goo: [{ x: 247, y: 225, r: 87 }, { x: 419, y: 501, r: 68 }, { x: 354, y: 261, r: 62 }, { x: 324, y: 171, r: 78 }, { x: 282, y: 471, r: 79 }, { x: 288, y: 589, r: 74 }, { x: 133, y: 800, r: 70 }, { x: 241, y: 748, r: 74 }, { x: 395, y: 303, r: 53 }], monsters: [{ t: "flyer", x: 252, y: 200 }, { t: "flyer", x: 438, y: 482 }, { t: "blob", x: 365, y: 267 }, { t: "blob", x: 321, y: 165 }, { t: "nest", x: 304, y: 469, w: 1 }, { t: "splitter", x: 312, y: 564, w: 1 }, { t: "splitter", x: 469, y: 258, w: 1 }, { t: "flyer", x: 333, y: 367, w: 2 }, { t: "dasher", x: 353, y: 692, w: 2 }, { t: "blob", x: 166, y: 681, w: 2 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "......ss....", "......ss....", "......ss....", "......ss....", ".www..ss....", ".www..ss....", ".www..ss....", "......ss....", "......ss....", "......ss....", "......ss....", "......ss....", ".....ss.....", ".....ss....."], obstacles: [{ t: "lilyrock", x: 474, y: 715 }, { t: "lilyrock", x: 446, y: 487 }, { t: "pine", x: 128, y: 167 }, { t: "reeds", x: 89, y: 666 }, { t: "reeds", x: 320, y: 397 }, { t: "lilyrock", x: 108, y: 267 }], goo: [{ x: 436, y: 336, r: 88 }, { x: 446, y: 190, r: 85 }, { x: 209, y: 450, r: 65 }, { x: 346, y: 241, r: 69 }, { x: 154, y: 359, r: 69 }, { x: 445, y: 258, r: 74 }, { x: 152, y: 459, r: 62 }, { x: 484, y: 179, r: 59 }], monsters: [{ t: "chunky", x: 410, y: 349 }, { t: "dasher", x: 450, y: 189 }, { t: "jumper", x: 235, y: 422 }, { t: "nest", x: 322, y: 244, w: 1 }, { t: "blob", x: 132, y: 351, w: 1 }, { t: "spitter", x: 433, y: 267, w: 1, v: 1 }, { t: "flyer", x: 372, y: 155, w: 2 }, { t: "jumper", x: 226, y: 685, w: 2 }, { t: "spitter", x: 190, y: 249, w: 2 }], animals: [{ s: "otter", x: 217, y: 320 }], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", ".....ss.....", "....ss..www.", "....ss..www.", "....ss..www.", "...ss...www.", "...ss.......", "...ss.......", "....ss......", "....ss......", "....ss......", "...ss.......", "...ss.......", "...ss.......", ".....ss.....", ".....ss....."], obstacles: [{ t: "tree", x: 113, y: 684 }, { t: "lilyrock", x: 119, y: 520 }, { t: "lilyrock", x: 227, y: 681 }, { t: "reeds", x: 274, y: 351 }], goo: [{ x: 224, y: 565, r: 78 }, { x: 185, y: 293, r: 75 }, { x: 358, y: 189, r: 57 }, { x: 88, y: 394, r: 87 }, { x: 137, y: 376, r: 82 }, { x: 457, y: 232, r: 82 }, { x: 389, y: 586, r: 57 }, { x: 156, y: 753, r: 66 }], monsters: [{ t: "dasher", x: 253, y: 585 }, { t: "spitter", x: 157, y: 290 }, { t: "blob", x: 378, y: 187 }, { t: "chunky", x: 104, y: 413, v: 1 }, { t: "flyer", x: 155, y: 366, w: 1 }, { t: "nest", x: 483, y: 236, w: 1 }, { t: "blob", x: 379, y: 671, w: 1 }, { t: "spitter", x: 201, y: 505, w: 1, v: 1 }, { t: "jumper", x: 462, y: 628, w: 2 }, { t: "dasher", x: 222, y: 169, w: 2 }, { t: "dasher", x: 348, y: 449, w: 2 }], animals: [], start: { x: 288, y: 860 } }, { terrain: [".....ss.....", ".....ss.....", ".....ss.....", "....ss......", "....ss......", "....ss......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", "...ss.......", ".....ss.....", ".....ss....."], obstacles: [{ t: "driftwood", x: 140, y: 300 }, { t: "driftwood", x: 436, y: 300 }, { t: "lilyrock", x: 140, y: 640 }, { t: "lilyrock", x: 436, y: 640 }], goo: [{ x: 315, y: 340, r: 70 }, { x: 131, y: 441, r: 65 }, { x: 424, y: 470, r: 74 }, { x: 480, y: 211, r: 68 }, { x: 184, y: 172, r: 72 }, { x: 448, y: 484, r: 67 }], monsters: [{ t: "boss", x: 288, y: 330 }, { t: "jumper", x: 150, y: 460 }, { t: "spitter", x: 426, y: 460 }], animals: [], start: { x: 288, y: 860 } }], intro: "boss", boss: true }];

  // src/app.ts
  init_quality();

  // src/game/play.ts
  init_balance();

  // src/render/streamLook.ts
  function visualWidth(w) {
    return w < 30 ? w : 30 + 26 * (1 - Math.exp(-(w - 30) / 45));
  }

  // src/render/roomView.ts
  init_balance();
  init_quality();
  init_rng();

  // src/render/background.ts
  init_balance();

  // src/data/obstacles.ts
  var OBSTACLES = {
    tree: { shape: "circle", r: 30, blocksShots: true, sprite: "ob_tree", foot: 18 },
    pine: { shape: "circle", r: 26, blocksShots: true, sprite: "ob_pine", foot: 16 },
    bush: { shape: "circle", r: 24, blocksShots: false, sprite: "ob_bush", foot: 14 },
    rock: { shape: "circle", r: 26, blocksShots: true, sprite: "ob_rock", foot: 14 },
    boulder: { shape: "circle", r: 40, blocksShots: true, sprite: "ob_boulder", foot: 20 },
    stump: { shape: "circle", r: 20, blocksShots: true, sprite: "ob_stump", foot: 12 },
    log: { shape: "rect", w: 112, h: 34, blocksShots: true, sprite: "ob_log", foot: 17 },
    fence: { shape: "rect", w: 144, h: 18, blocksShots: false, sprite: "ob_fence", foot: 9 },
    fencev: { shape: "rect", w: 18, h: 144, blocksShots: false, sprite: "ob_fencev", foot: 72 },
    house: { shape: "rect", w: 150, h: 96, blocksShots: true, sprite: "ob_house", foot: 48 },
    barrel: { shape: "circle", r: 20, blocksShots: true, sprite: "ob_barrel", foot: 12 },
    crate: { shape: "rect", w: 46, h: 40, blocksShots: true, sprite: "ob_crate", foot: 20 },
    hay: { shape: "circle", r: 30, blocksShots: true, sprite: "ob_hay", foot: 16 },
    well: { shape: "circle", r: 32, blocksShots: true, sprite: "ob_well", foot: 18 },
    cart: { shape: "rect", w: 104, h: 52, blocksShots: true, sprite: "ob_cart", foot: 26 },
    reeds: { shape: "circle", r: 22, blocksShots: false, sprite: "ob_reeds", foot: 12 },
    lilyrock: { shape: "circle", r: 30, blocksShots: true, sprite: "ob_shellrock", foot: 16 },
    driftwood: { shape: "rect", w: 110, h: 30, blocksShots: true, sprite: "ob_driftwood", foot: 15 }
  };

  // src/render/background.ts
  init_rng();
  var COLS = ROOM.width / ROOM.tile;
  var ROWS = ROOM.height / ROOM.tile;
  var T = ROOM.tile;
  var REGION_LOOK = {
    forest: { base: ".", edge: "#3f7a2a", borderA: "border_tree", borderB: "border_pine", borderLow: "border_bush", fill: "#3f7a2a", path: "#" },
    village: { base: ".", edge: "#4a7f32", borderA: "border_tree", borderB: "border_bush", borderLow: "border_bush", fill: "#4a7f32", path: "c" },
    lake: { base: ".", edge: "#3d7d4a", borderA: "border_tree", borderB: "ob_reeds", borderLow: "ob_reeds", fill: "#3d7d4a", path: "s" }
  };
  function cellAt(room, c, r) {
    c = Math.max(0, Math.min(COLS - 1, c));
    r = Math.max(0, Math.min(ROWS - 1, r));
    return room.terrain?.[r]?.[c] ?? ".";
  }
  function buildBackground(room, region, seedKey, scale) {
    const cv = document.createElement("canvas");
    cv.width = Math.round(ROOM.width * scale);
    cv.height = Math.round(ROOM.height * scale);
    const ctx2 = cv.getContext("2d");
    ctx2.imageSmoothingEnabled = true;
    ctx2.imageSmoothingQuality = "high";
    ctx2.scale(scale, scale);
    const seed = hashString(seedKey);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const h2 = (seed ^ Math.imul(c + 1, 73856093) ^ Math.imul(r + 1, 19349663)) >>> 0;
      const v = h2 % 10;
      const f = frame(`g_${v < 4 ? 0 : v < 7 ? 1 : v < 9 ? 2 : 3}`);
      if (f) ctx2.drawImage(f.img, f.x, f.y, f.w, f.h, c * T, r * T, T + 0.5, T + 0.5);
    }
    const kinds = [["s", "sand"], ["#", "path"], ["c", "cobble"], ["w", "water"]];
    for (const [ch, name] of kinds) {
      for (let j = 0; j <= ROWS; j++) for (let i = 0; i <= COLS; i++) {
        let m = 0;
        if (cellAt(room, i - 1, j - 1) === ch) m |= 1;
        if (cellAt(room, i, j - 1) === ch) m |= 2;
        if (cellAt(room, i - 1, j) === ch) m |= 4;
        if (cellAt(room, i, j) === ch) m |= 8;
        if (!m) continue;
        const f = frame(`t_${name}_${m}`);
        if (f) ctx2.drawImage(f.img, f.x, f.y, f.w, f.h, (i - 0.5) * T, (j - 0.5) * T, T + 0.5, T + 0.5);
      }
    }
    const rng = new Rng(seed ^ 2654435769);
    const decor = region === "lake" ? ["d_shell", "d_tuft", "d_pebble_0", "d_flower_3", "d_clover", "d_tuft"] : region === "village" ? ["d_flower_0", "d_flower_1", "d_tuft", "d_pebble_1", "d_clover", "d_flower_4", "d_leaf"] : ["d_flower_0", "d_flower_2", "d_tuft", "d_mushroom", "d_pebble_0", "d_clover", "d_flower_1", "d_tuft", "d_leaf"];
    const n = 46;
    for (let i = 0; i < n; i++) {
      const x = rng.range(ROOM.wall + 10, ROOM.width - ROOM.wall - 10), y = rng.range(ROOM.wall + 10, ROOM.height - ROOM.wall - 10);
      const ch = cellAt(room, Math.floor(x / T), Math.floor(y / T));
      if (ch !== ".") continue;
      const f = frame(rng.pick(decor));
      if (f) drawFrame(ctx2, f, x, y, rng.range(0.85, 1.15), rng.chance(0.5));
    }
    for (const d of room.decor ?? []) {
      const f = frame(d.t);
      if (f) drawFrame(ctx2, f, d.x, d.y);
    }
    const g1 = ctx2.createLinearGradient(0, 0, ROOM.wall * 1.6, 0);
    g1.addColorStop(0, "rgba(20,50,10,0.45)");
    g1.addColorStop(1, "rgba(20,50,10,0)");
    ctx2.fillStyle = g1;
    ctx2.fillRect(0, 0, ROOM.wall * 1.6, ROOM.height);
    const g2 = ctx2.createLinearGradient(ROOM.width, 0, ROOM.width - ROOM.wall * 1.6, 0);
    g2.addColorStop(0, "rgba(20,50,10,0.45)");
    g2.addColorStop(1, "rgba(20,50,10,0)");
    ctx2.fillStyle = g2;
    ctx2.fillRect(ROOM.width - ROOM.wall * 1.6, 0, ROOM.wall * 1.6, ROOM.height);
    const g3 = ctx2.createLinearGradient(0, 0, 0, ROOM.wall * 1.6);
    g3.addColorStop(0, "rgba(20,50,10,0.4)");
    g3.addColorStop(1, "rgba(20,50,10,0)");
    ctx2.fillStyle = g3;
    ctx2.fillRect(0, 0, ROOM.width, ROOM.wall * 1.6);
    const g4 = ctx2.createLinearGradient(0, ROOM.height, 0, ROOM.height - ROOM.wall * 1.6);
    g4.addColorStop(0, "rgba(20,50,10,0.4)");
    g4.addColorStop(1, "rgba(20,50,10,0)");
    ctx2.fillStyle = g4;
    ctx2.fillRect(0, ROOM.height - ROOM.wall * 1.6, ROOM.width, ROOM.wall * 1.6);
    return cv;
  }
  function buildStatics(room, region, seedKey) {
    const out = [];
    const rng = new Rng(hashString(seedKey) ^ 5369127);
    const look = REGION_LOOK[region];
    for (const o of room.obstacles) {
      const def = OBSTACLES[o.t];
      if (!def) continue;
      let name = def.sprite;
      if (o.t === "tree" && Math.round(o.x + o.y) % 2) name = "ob_tree2";
      if (o.t === "house" && Math.round(o.x) % 2) name = "ob_house2";
      out.push({ name, x: o.x, y: o.y + def.foot, flip: o.t !== "house" && o.t !== "gate" && rng.chance(0.5), scale: 1, sortY: o.y + def.foot * 0.5 });
    }
    const side = (x) => {
      for (let y = 30; y < ROOM.height + 40; y += rng.range(58, 74)) {
        const nm = rng.chance(0.55) ? look.borderA : look.borderB;
        out.push({ name: nm, x: x + rng.range(-10, 10), y, flip: rng.chance(0.5), scale: rng.range(0.85, 1.05), sortY: y });
      }
    };
    side(16);
    side(ROOM.width - 16);
    for (let x = 70; x < ROOM.width - 50; x += rng.range(58, 70)) {
      if (Math.abs(x - ROOM.width / 2) < 140) continue;
      out.push({ name: rng.chance(0.6) ? look.borderA : look.borderB, x, y: 34 + rng.range(-6, 6), flip: rng.chance(0.5), scale: rng.range(0.85, 1.05), sortY: 34 });
    }
    for (let x = 60; x < ROOM.width - 40; x += rng.range(50, 64)) {
      if (Math.abs(x - ROOM.width / 2) < 70) continue;
      out.push({ name: look.borderLow, x, y: ROOM.height - 8, flip: rng.chance(0.5), scale: rng.range(0.9, 1.1), sortY: ROOM.height + 100 });
    }
    return out;
  }

  // src/render/roomView.ts
  init_save();

  // src/render/particles.ts
  init_quality();
  var Particles = class {
    constructor() {
      this.list = [];
      this.texts = [];
      this.cache = /* @__PURE__ */ new Map();
    }
    fr(name) {
      let f = this.cache.get(name);
      if (f === void 0) {
        f = frame(name) ?? null;
        this.cache.set(name, f);
      }
      return f;
    }
    spawn(name, x, y, o = {}) {
      const cap = quality().particles;
      let p;
      for (const q of this.list) if (!q.alive) {
        p = q;
        break;
      }
      if (!p) {
        if (this.list.length >= cap) return null;
        p = {};
        this.list.push(p);
      }
      const frames2 = Array.isArray(name) ? name.map((n) => this.fr(n)).filter(Boolean) : null;
      Object.assign(p, {
        f: Array.isArray(name) ? frames2[0] ?? null : this.fr(name),
        frames: frames2,
        fps: 12,
        x,
        y,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        g: 0,
        drag: 0,
        life: 0,
        max: 0.6,
        scale: 1,
        scale1: 1,
        rot: 0,
        vr: 0,
        alpha: 1,
        fadeIn: 0,
        additive: false,
        ground: false,
        alive: true,
        flip: false
      }, o);
      return p;
    }
    text(text, x, y, color = "#ffffff", size = 22, life = 0.9, stroke = "#3a2416") {
      let t2 = this.texts.find((q) => !q.alive);
      if (!t2) {
        if (this.texts.length > 40) return;
        t2 = {};
        this.texts.push(t2);
      }
      Object.assign(t2, { text, x, y, vy: -60, life: 0, max: life, color, size, alive: true, stroke });
    }
    update(dt) {
      for (const p of this.list) {
        if (!p.alive) continue;
        p.life += dt;
        if (p.life >= p.max) {
          p.alive = false;
          continue;
        }
        if (p.drag) {
          const k = Math.max(0, 1 - p.drag * dt);
          p.vx *= k;
          p.vy *= k;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.g) {
          p.vz -= p.g * dt;
          p.z += p.vz * dt;
          if (p.z < 0) {
            p.z = 0;
            p.vz = -p.vz * 0.35;
            p.vx *= 0.6;
            p.vy *= 0.6;
          }
        }
        p.rot += p.vr * dt;
        if (p.frames && p.frames.length) p.f = p.frames[Math.min(p.frames.length - 1, Math.floor(p.life * p.fps))];
      }
      for (const t2 of this.texts) {
        if (!t2.alive) continue;
        t2.life += dt;
        t2.y += t2.vy * dt;
        t2.vy *= 1 - dt * 2.5;
        if (t2.life >= t2.max) t2.alive = false;
      }
    }
    draw(ctx2, ground) {
      for (const p of this.list) {
        if (!p.alive || p.ground !== ground || !p.f) continue;
        const k = p.life / p.max;
        let a = p.alpha * (k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1);
        if (p.fadeIn && p.life < p.fadeIn) a *= p.life / p.fadeIn;
        const s = p.scale + (p.scale1 - p.scale) * k;
        if (p.additive) {
          ctx2.globalCompositeOperation = "lighter";
        }
        drawFrame(ctx2, p.f, p.x, p.y - p.z, s, p.flip, p.rot, a);
        if (p.additive) ctx2.globalCompositeOperation = "source-over";
      }
    }
    drawTexts(ctx2, font) {
      ctx2.textAlign = "center";
      ctx2.textBaseline = "middle";
      ctx2.lineJoin = "round";
      for (const t2 of this.texts) {
        if (!t2.alive) continue;
        const k = t2.life / t2.max;
        const pop = k < 0.15 ? 0.6 + k / 0.15 * 0.5 : k < 0.25 ? 1.1 - (k - 0.15) / 0.1 * 0.1 : 1;
        ctx2.globalAlpha = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
        ctx2.font = `${Math.round(t2.size * pop)}px ${font}`;
        ctx2.lineWidth = Math.max(3, t2.size * 0.22);
        ctx2.strokeStyle = t2.stroke;
        ctx2.strokeText(t2.text, t2.x, t2.y);
        ctx2.fillStyle = t2.color;
        ctx2.fillText(t2.text, t2.x, t2.y);
      }
      ctx2.globalAlpha = 1;
    }
    clear() {
      for (const p of this.list) p.alive = false;
      for (const t2 of this.texts) t2.alive = false;
    }
    count() {
      let n = 0;
      for (const p of this.list) if (p.alive) n++;
      return n;
    }
  };

  // src/render/roomView.ts
  var GOO_COLOR = {
    blob: "violet",
    mini: "amber",
    spitter: "pink",
    splitter: "amber",
    dasher: "indigo",
    chunky: "plum",
    nest: "berry",
    jumper: "teal",
    flyer: "berry",
    boss: "royal"
  };
  var BOSS_COLOR = { forest: "royal", village: "amber", lake: "teal" };
  var RoomView = class {
    constructor(sim, region, seedKey) {
      this.gooScale = 0.75;
      this.fx = new Particles();
      this.time = 0;
      this.scale = 1;
      this.offX = 0;
      this.offY = 0;
      this.shake = 0;
      this.shakeX = 0;
      this.shakeY = 0;
      this.hurtFlash = 0;
      this.vis = /* @__PURE__ */ new Map();
      this.rng = new Rng(77);
      this.cleanWave = null;
      this.gateFade = 1;
      this.blooms = 0;
      this.runDist = 0;
      this.lastPX = 0;
      this.lastPY = 0;
      this.sortBuf = [];
      this.font = '"Fredoka","Jua",sans-serif';
      this.showRange = 0;
      this.winTimer = 0;
      this.slowmo = 0;
      this.muzzleX = 0;
      this.muzzleY = 0;
      this.lift = /* @__PURE__ */ new Map();
      this.sim = sim;
      this.region = region;
      this.bgScale = quality().bgScale;
      this.bg = buildBackground(sim.def, region, seedKey, this.bgScale);
      this.statics = buildStatics(sim.def, region, seedKey);
      this.statics.push({ name: "gate_posts", x: ROOM.width / 2, y: ROOM.wall + 6, flip: false, scale: 1, sortY: ROOM.wall });
      this.brush = frame("brush") ?? null;
      this.stamps = [0, 1, 2, 3].map((i) => frame(`goostamp_${i}`) ?? null);
      this.goo = document.createElement("canvas");
      this.goo.width = Math.round(ROOM.width * this.gooScale);
      this.goo.height = Math.round(ROOM.height * this.gooScale);
      this.gooCtx = this.goo.getContext("2d");
      this.paintGoo();
      this.lastPX = sim.player.x;
      this.lastPY = sim.player.y;
    }
    // Goo layer: union of organic splats, given thickness (dark lower rim, light
    // upper rim), gloss and bubbles. Washing erases straight through it.
    paintGoo() {
      const g = this.gooCtx;
      const s = this.gooScale;
      const r = new Rng(this.sim.def.goo.length * 31 + 5);
      const W = this.goo.width, H = this.goo.height;
      const mask = document.createElement("canvas");
      mask.width = W;
      mask.height = H;
      const m = mask.getContext("2d");
      m.scale(s, s);
      m.fillStyle = "#fff";
      const blob = (x, y, rad) => {
        const n = 40;
        const ph = r.range(0, 6.28), ph2 = r.range(0, 6.28);
        m.beginPath();
        for (let i = 0; i <= n; i++) {
          const a = i / n * Math.PI * 2;
          const k = 1 + 0.1 * Math.sin(a * 3 + ph) + 0.06 * Math.sin(a * 5 + ph2);
          const px = x + Math.cos(a) * rad * k, py = y + Math.sin(a) * rad * k * 0.92;
          if (i === 0) m.moveTo(px, py);
          else m.lineTo(px, py);
        }
        m.closePath();
        m.fill();
      };
      for (const b of this.sim.def.goo) {
        blob(b.x, b.y, b.r);
        const n = Math.max(2, Math.round(b.r / 34));
        for (let i = 0; i < n; i++) {
          const a = r.range(0, 6.28), d = b.r * r.range(0.7, 0.95);
          blob(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, b.r * r.range(0.22, 0.38));
        }
      }
      const tint = (col) => {
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const x = c.getContext("2d");
        x.drawImage(mask, 0, 0);
        x.globalCompositeOperation = "source-in";
        x.fillStyle = col;
        x.fillRect(0, 0, W, H);
        return c;
      };
      g.clearRect(0, 0, W, H);
      g.drawImage(tint("#e9d8ff"), 0, -3 * s);
      g.drawImage(tint("#6e3fae"), 0, 5 * s);
      g.drawImage(tint("#b385ea"), 0, 0);
      g.save();
      g.globalCompositeOperation = "source-atop";
      g.scale(s, s);
      for (const b of this.sim.def.goo) {
        const gr = g.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.05, b.x, b.y, b.r * 1.1);
        gr.addColorStop(0, "rgba(255,255,255,0.32)");
        gr.addColorStop(0.5, "rgba(255,255,255,0.06)");
        gr.addColorStop(1, "rgba(90,40,150,0.18)");
        g.fillStyle = gr;
        g.beginPath();
        g.arc(b.x, b.y, b.r * 1.3, 0, Math.PI * 2);
        g.fill();
        for (let i = 0; i < Math.round(b.r / 14); i++) {
          const a = r.range(0, 6.28), d = r.range(0, b.r * 0.8), x = b.x + Math.cos(a) * d, y = b.y + Math.sin(a) * d, rr = r.range(2.5, 6.5);
          g.fillStyle = "rgba(235,215,255,0.55)";
          g.beginPath();
          g.arc(x, y, rr, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "rgba(255,255,255,0.75)";
          g.beginPath();
          g.arc(x - rr * 0.35, y - rr * 0.35, rr * 0.35, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = "rgba(255,255,255,0.4)";
        g.beginPath();
        g.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.42, b.r * 0.28, b.r * 0.09, -0.5, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
    erase(x, y, r) {
      const g = this.gooCtx;
      const s = this.gooScale;
      const b = this.brush;
      if (!b) return;
      g.globalCompositeOperation = "destination-out";
      const k = r * 2 * s / b.w * 1.25;
      g.drawImage(b.img, b.x, b.y, b.w, b.h, x * s - b.w * k / 2, y * s - b.h * k / 2, b.w * k, b.h * k);
      g.globalCompositeOperation = "source-over";
    }
    layout(l) {
      const availH = l.viewH - l.top - l.bottom;
      this.scale = Math.min(l.viewW / ROOM.width, availH / ROOM.height);
      this.offX = (l.viewW - ROOM.width * this.scale) / 2;
      this.offY = l.top + Math.max(0, (availH - ROOM.height * this.scale) * 0.4);
    }
    worldToScreen(x, y) {
      return [this.offX + x * this.scale, this.offY + y * this.scale];
    }
    // ------------------------------------------------------------------ events → effects
    onEvent(e) {
      const fx = this.fx;
      const r = this.rng;
      switch (e.t) {
        case "hit": {
          const v = this.vis.get(e.id);
          if (v) {
            v.vy -= 2.4;
            v.vx += 2;
          }
          const m = this.sim.monsters.find((q) => q.id === e.id);
          const col = GOO_COLOR[e.kind];
          for (let i = 0; i < 2; i++) fx.spawn(`p_goo_${col}`, e.x + r.range(-16, 16), e.y + r.range(-10, 10), { z: 18, vz: r.range(80, 200), vx: r.range(-90, 90), vy: r.range(-30, 40), g: 600, max: 0.7, scale: r.range(0.7, 1.1) });
          if (m) fx.spawn("p_water_s", e.x, e.y, { z: 10, vz: 140, vx: r.range(-120, 120), g: 700, max: 0.5 });
          break;
        }
        case "burst": {
          const col = e.boss ? BOSS_COLOR[this.region] : GOO_COLOR[e.kind];
          const big = e.r > 40;
          const n = big ? 22 : 12;
          fx.spawn(["fx_splash_0", "fx_splash_1", "fx_splash_2", "fx_splash_3", "fx_splash_4", "fx_splash_5"], e.x, e.y + e.r * 0.4, { fps: 16, max: 0.4, scale: e.r / 24, ground: false });
          fx.spawn("fx_softring", e.x, e.y + e.r * 0.3, { max: 0.45, scale: e.r / 30, scale1: e.r / 10, ground: true, alpha: 0.8 });
          for (let i = 0; i < n; i++) {
            const a = r.range(0, 6.28), sp = r.range(120, 320) * (big ? 1.4 : 1);
            fx.spawn(`p_goo_${col}`, e.x, e.y, { z: 20, vz: r.range(150, 380), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, g: 900, max: r.range(0.5, 0.9), scale: r.range(0.8, 1.5), drag: 1.5 });
          }
          for (let i = 0; i < n; i++) {
            const a = r.range(0, 6.28), sp = r.range(90, 260);
            fx.spawn("p_water", e.x, e.y, { z: 16, vz: r.range(200, 420), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6, g: 1e3, max: r.range(0.45, 0.8), scale: r.range(0.6, 1.1) });
          }
          for (let i = 0; i < (big ? 8 : 4); i++) fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], e.x + r.range(-e.r, e.r), e.y + r.range(-e.r, e.r * 0.5), { fps: 8, max: 0.45, scale: r.range(0.8, 1.3), vy: -40 });
          for (let i = 0; i < 3; i++) fx.spawn("p_bubble", e.x + r.range(-20, 20), e.y + r.range(-10, 10), { vy: r.range(-70, -30), vx: r.range(-30, 30), max: r.range(0.8, 1.3), scale: r.range(0.6, 1) });
          this.shake = Math.max(this.shake, e.boss ? 14 : big ? 6 : 2.5);
          if (e.combo >= 3) fx.text(`x${e.combo}`, e.x, e.y - e.r - 14, e.combo >= 6 ? "#ffe066" : "#ffffff", 22 + Math.min(14, e.combo * 1.5), 0.8);
          if (e.boss) {
            this.slowmo = 0.6;
            for (let i = 0; i < 30; i++) fx.spawn(["p_conf_0", "p_conf_1", "p_conf_2", "p_conf_3", "p_conf_4"][i % 5], e.x, e.y, { z: 40, vz: r.range(300, 600), vx: r.range(-300, 300), vy: r.range(-200, 100), g: 600, vr: r.range(-8, 8), max: 1.6, drag: 1 });
          }
          this.vis.delete(-1);
          break;
        }
        case "clean": {
          this.erase(e.x, e.y, e.r);
          if (this.blooms < 70 && r.chance(0.1)) {
            this.blooms++;
            const a = r.range(0, 6.28), d = r.range(0, e.r * 0.7);
            this.addBloom(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d);
          }
          break;
        }
        case "cleanWave":
          this.cleanWave = { x: e.x, y: e.y, r: 0 };
          break;
        case "cocoonHit": {
          for (let i = 0; i < 2; i++) fx.spawn("p_goo_violet", e.x + r.range(-20, 20), e.y, { z: 30, vz: r.range(80, 180), vx: r.range(-80, 80), g: 600, max: 0.6 });
          break;
        }
        case "rescue": {
          fx.spawn("fx_rays", e.x, e.y - 10, { max: 1.1, scale: 0.5, scale1: 1, alpha: 0.85, vr: 0.6, additive: quality().glow, ground: true });
          fx.spawn(["fx_splash_0", "fx_splash_1", "fx_splash_2", "fx_splash_3", "fx_splash_4", "fx_splash_5"], e.x, e.y + 14, { fps: 14, max: 0.45, scale: 1.05, ground: true });
          for (let i = 0; i < 10; i++) fx.spawn("p_heart", e.x, e.y - 50, { z: 10, vz: r.range(120, 280), vx: r.range(-140, 140), vy: r.range(-60, 30), g: 260, max: r.range(0.9, 1.4), scale: r.range(0.7, 1.2), drag: 1 });
          for (let i = 0; i < 12; i++) fx.spawn("p_goo_violet", e.x, e.y - 10, { z: 20, vz: r.range(150, 350), vx: r.range(-220, 220), vy: r.range(-120, 120), g: 900, max: 0.8, drag: 1.2 });
          for (let i = 0; i < 6; i++) fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], e.x + r.range(-40, 40), e.y + r.range(-60, 10), { fps: 8, max: 0.6, scale: r.range(1, 1.6) });
          this.slowmo = 0.45;
          this.shake = Math.max(this.shake, 4);
          break;
        }
        case "playerHit": {
          this.hurtFlash = 1;
          this.shake = Math.max(this.shake, 7);
          for (let i = 0; i < 8; i++) fx.spawn("p_goo_violet", e.x, e.y - 30, { z: 20, vz: r.range(100, 240), vx: r.range(-150, 150), vy: r.range(-60, 60), g: 800, max: 0.7 });
          fx.text(`-${e.dmg}`, e.x, e.y - 70, "#ffd0e8", 24, 0.8, "#6d2aa0");
          break;
        }
        case "shieldPop": {
          fx.spawn("fx_ring", e.x, e.y - 24, { max: 0.35, scale: 0.6, scale1: 1.4, alpha: 0.9 });
          for (let i = 0; i < 8; i++) fx.spawn("p_bubble", e.x + r.range(-30, 30), e.y - 24 + r.range(-30, 30), { vx: r.range(-80, 80), vy: r.range(-80, 40), max: 0.6, scale: r.range(0.5, 0.9) });
          break;
        }
        case "pressureFull": {
          fx.spawn("fx_ring", e.x, e.y + 4, { max: 0.4, scale: 0.4, scale1: 1.2, alpha: 0.85, ground: true });
          for (let i = 0; i < 6; i++) fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], e.x + r.range(-30, 30), e.y - r.range(10, 60), { fps: 8, max: 0.5, vy: -60 });
          break;
        }
        case "spit": {
          fx.spawn("p_goo_pink", e.x, e.y - 20, { z: 10, vz: 120, vx: r.range(-40, 40), g: 500, max: 0.4, scale: 0.7 });
          break;
        }
        case "land": {
          fx.spawn("fx_softring", e.x, e.y, { max: 0.45, scale: e.r / 50, scale1: e.r / 26, ground: true, alpha: 0.9 });
          for (let i = 0; i < 10; i++) {
            const a = r.range(0, 6.28);
            fx.spawn("p_dust", e.x + Math.cos(a) * e.r * 0.6, e.y + Math.sin(a) * e.r * 0.3, { vx: Math.cos(a) * 80, vy: Math.sin(a) * 40, max: 0.5, scale: r.range(0.8, 1.3) });
          }
          this.shake = Math.max(this.shake, 6);
          break;
        }
        case "split":
          fx.spawn("fx_softring", e.x, e.y, { max: 0.3, scale: 0.6, scale1: 1.4, ground: true });
          break;
        case "pickup": {
          if (e.kind === "coin") fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], this.sim.player.x + r.range(-10, 10), this.sim.player.y - 40, { fps: 10, max: 0.3, scale: 0.6 });
          if (e.kind === "heal") {
            fx.text("+HP", this.sim.player.x, this.sim.player.y - 70, "#ffb3c6", 20, 0.8);
            for (let i = 0; i < 4; i++) fx.spawn("p_heart", this.sim.player.x + r.range(-20, 20), this.sim.player.y - 30, { vy: -80, max: 0.7, scale: 0.6 });
          }
          break;
        }
        case "roomClear":
          this.winTimer = 1.3;
          break;
        case "gateOpen": {
          for (let i = 0; i < 16; i++) fx.spawn("p_goo_violet", ROOM.width / 2 + r.range(-60, 60), ROOM.wall, { z: 30, vz: r.range(150, 300), vx: r.range(-200, 200), vy: r.range(-40, 120), g: 800, max: 0.8 });
          fx.spawn(["fx_splash_0", "fx_splash_1", "fx_splash_2", "fx_splash_3", "fx_splash_4", "fx_splash_5"], ROOM.width / 2, ROOM.wall + 10, { fps: 14, max: 0.45, scale: 2 });
          break;
        }
        case "trailPop": {
          fx.spawn("fx_ring", e.x, e.y, { max: 0.25, scale: 0.3, scale1: 0.7, alpha: 0.8, ground: true });
          for (let i = 0; i < 4; i++) fx.spawn("p_water_s", e.x, e.y, { z: 6, vz: 140, vx: r.range(-100, 100), vy: r.range(-60, 60), g: 600, max: 0.4 });
          break;
        }
        default:
          break;
      }
    }
    addBloom(x, y) {
      if (x < ROOM.wall + 8 || x > ROOM.width - ROOM.wall - 8 || y < ROOM.wall + 8 || y > ROOM.height - ROOM.wall - 8) return;
      if (this.sim.world.isWaterAt(x, y)) return;
      const names = ["d_flower_0", "d_flower_1", "d_flower_2", "d_flower_3", "d_flower_4", "d_clover"];
      const f = frame(names[this.rng.int(0, names.length - 1)]);
      if (!f) return;
      const g = this.bg.getContext("2d");
      g.save();
      g.setTransform(this.bgScale, 0, 0, this.bgScale, 0, 0);
      drawFrame(g, f, x, y, this.rng.range(0.85, 1.2), this.rng.chance(0.5));
      g.restore();
      this.fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], x, y - 8, { fps: 10, max: 0.3, scale: 0.6 });
    }
    // ------------------------------------------------------------------ update
    update(dt) {
      this.time += dt;
      this.fx.update(dt);
      const sim = this.sim;
      const p = sim.player;
      for (const m of sim.monsters) {
        let v = this.vis.get(m.id);
        if (!m.alive) {
          if (v) this.vis.delete(m.id);
          continue;
        }
        if (!v) {
          v = { sx: 1, sy: 1, vx: 0, vy: 0, rise0: Math.max(m.rise, 0.01), seen: true };
          this.vis.set(m.id, v);
        }
        const k = 170, c = 9;
        v.vx += (-(v.sx - 1) * k - v.vx * c) * dt;
        v.vy += (-(v.sy - 1) * k - v.vy * c) * dt;
        v.sx += v.vx * dt;
        v.sy += v.vy * dt;
        if (m.hitTime < 0.1) {
          v.vx += (this.rng.next() - 0.5) * 40 * dt * 10;
          v.vy += (this.rng.next() - 0.5) * 40 * dt * 10;
        }
      }
      if (this.cleanWave) {
        const w = this.cleanWave;
        w.r += dt * 1300;
        const g = this.gooCtx;
        g.save();
        g.globalCompositeOperation = "destination-out";
        g.beginPath();
        g.arc(w.x * this.gooScale, w.y * this.gooScale, w.r * this.gooScale, 0, Math.PI * 2);
        g.fill();
        g.restore();
        for (let i = 0; i < 3; i++) {
          const a = this.rng.range(0, 6.28);
          const x = w.x + Math.cos(a) * w.r, y = w.y + Math.sin(a) * w.r;
          if (x > ROOM.wall && x < ROOM.width - ROOM.wall && y > ROOM.wall && y < ROOM.height - ROOM.wall) this.fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], x, y, { fps: 10, max: 0.35, scale: 0.9 });
        }
        if (w.r > 1500) {
          this.cleanWave = null;
          this.gooCtx.clearRect(0, 0, this.goo.width, this.goo.height);
        }
      }
      if (sim.gateOpen) this.gateFade = Math.max(0, this.gateFade - dt * 2.5);
      const d = Math.hypot(p.x - this.lastPX, p.y - this.lastPY);
      this.runDist += d;
      this.lastPX = p.x;
      this.lastPY = p.y;
      if (p.moving && d > 0 && this.rng.chance(0.12)) this.fx.spawn("p_dust", p.x - p.vx * 0.03, p.y + 4, { max: 0.35, scale: 0.6, vy: -10, ground: true });
      for (const s of sim.segs) {
        if (s.kind === 2 || !s.hit) continue;
        if (this.rng.chance(quality().streamFx ? 0.7 : 0.35)) {
          const back = Math.atan2(s.y0 - s.y1, s.x0 - s.x1);
          const a = back + this.rng.range(-1.1, 1.1);
          this.fx.spawn("p_water_s", s.x1, s.y1, { z: 8, vz: this.rng.range(60, 200), vx: Math.cos(a) * this.rng.range(80, 220), vy: Math.sin(a) * this.rng.range(40, 140), g: 800, max: 0.4, scale: this.rng.range(0.8, 1.4) * Math.min(2, s.w / 14) });
        }
        if (this.rng.chance(0.25)) this.fx.spawn("p_mist", s.x1, s.y1, { max: 0.5, scale: 0.4 * Math.min(2.2, s.w / 12), scale1: 0.9 * Math.min(2.2, s.w / 12), alpha: 0.6, vy: -20 });
      }
      if (p.pressure >= 1 && sim.segs.length && this.rng.chance(0.3)) {
        const s = sim.segs[0];
        const t2 = this.rng.next();
        this.fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], s.x0 + (s.x1 - s.x0) * t2, s.y0 + (s.y1 - s.y0) * t2, { fps: 12, max: 0.25, scale: 0.6 });
      }
      if (this.shake > 0 && quality().shake) {
        this.shake = Math.max(0, this.shake - dt * 40);
        this.shakeX = (this.rng.next() - 0.5) * this.shake;
        this.shakeY = (this.rng.next() - 0.5) * this.shake;
      } else {
        this.shakeX = this.shakeY = 0;
        this.shake = 0;
      }
      this.hurtFlash = Math.max(0, this.hurtFlash - dt * 2.4);
      this.winTimer = Math.max(0, this.winTimer - dt);
      this.slowmo = Math.max(0, this.slowmo - dt);
      if (!p.firing && !p.moving && sim.state === "fight" && p.stillTime > 0.25) this.showRange = Math.min(1, this.showRange + dt * 3);
      else this.showRange = Math.max(0, this.showRange - dt * 4);
    }
    // ------------------------------------------------------------------ render
    render(ctx2, dpr, viewW, viewH) {
      const sim = this.sim;
      const s = this.scale;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2.fillStyle = REGION_LOOK[this.region].fill;
      ctx2.fillRect(0, 0, viewW, viewH);
      ctx2.setTransform(dpr * s, 0, 0, dpr * s, dpr * (this.offX + this.shakeX), dpr * (this.offY + this.shakeY));
      ctx2.imageSmoothingEnabled = true;
      ctx2.drawImage(this.bg, 0, 0, ROOM.width, ROOM.height);
      ctx2.globalAlpha = 0.93;
      ctx2.drawImage(this.goo, 0, 0, ROOM.width, ROOM.height);
      ctx2.globalAlpha = 1;
      this.fx.draw(ctx2, true);
      this.drawMarks(ctx2);
      this.drawRangeAndPressure(ctx2);
      const sh = frame("shadow");
      if (sh) {
        for (const m of sim.monsters) if (m.alive) {
          const k = m.rise > 0 ? 1 - m.rise / MONSTER_RULES.spawnRise : 1;
          let sx = m.x, sy = m.y + m.r * 0.55;
          if (m.kind === "jumper" && m.state === 2) {
            const mm = m;
            void mm;
          }
          drawFrame(ctx2, sh, sx, sy, m.r * 2.3 * this.sim.scaleOf(m) * Math.max(0, Math.min(1, k)) / 60, false, 0, 0.9);
        }
        drawFrame(ctx2, sh, sim.player.x, sim.player.y + 5, 0.85);
        for (const f of sim.followers) drawFrame(ctx2, sh, f.x, f.y + 2, 0.55, false, 0, 0.8);
        for (const c of sim.cocoons) if (!c.freed) drawFrame(ctx2, sh, c.x, c.y + 24, 1.1, false, 0, 0.8);
      }
      this.drawPickups(ctx2);
      this.drawSorted(ctx2);
      this.drawStreams(ctx2);
      this.fx.draw(ctx2, false);
      this.drawHeroes(ctx2);
      this.drawBullets(ctx2);
      this.fx.drawTexts(ctx2, this.font);
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      const p = sim.player;
      const low = p.hp / sim.run.stats.maxHp < 0.3 && sim.state === "fight";
      const a = Math.max(this.hurtFlash * 0.55, low ? 0.18 + Math.sin(this.time * 5) * 0.08 : 0);
      if (a > 0.01) {
        const g = ctx2.createRadialGradient(viewW / 2, viewH / 2, Math.min(viewW, viewH) * 0.35, viewW / 2, viewH / 2, Math.max(viewW, viewH) * 0.7);
        g.addColorStop(0, "rgba(170,70,220,0)");
        g.addColorStop(1, `rgba(150,50,200,${a})`);
        ctx2.fillStyle = g;
        ctx2.fillRect(0, 0, viewW, viewH);
      }
    }
    drawMarks(ctx2) {
      for (const k of this.sim.marks) {
        if (k.kind === "land") {
          const prog = Math.max(0, Math.min(1, 1 - k.t / 0.8));
          ctx2.save();
          ctx2.fillStyle = `rgba(170,80,230,${0.18 + prog * 0.2})`;
          ctx2.strokeStyle = "rgba(255,255,255,0.85)";
          ctx2.lineWidth = 3;
          ctx2.beginPath();
          ctx2.ellipse(k.x, k.y, k.r, k.r * 0.62, 0, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.stroke();
          ctx2.fillStyle = `rgba(140,50,200,${0.35 + prog * 0.25})`;
          ctx2.beginPath();
          ctx2.ellipse(k.x, k.y, k.r * prog, k.r * 0.62 * prog, 0, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.restore();
        } else if (k.kind === "dash" && k.x2 !== void 0) {
          const pulse = 0.55 + Math.sin(this.time * 18) * 0.25;
          ctx2.save();
          ctx2.lineCap = "round";
          ctx2.strokeStyle = `rgba(120,110,240,${0.35 * pulse + 0.15})`;
          ctx2.lineWidth = k.r * 1.5;
          ctx2.beginPath();
          ctx2.moveTo(k.x, k.y + 10);
          ctx2.lineTo(k.x2, k.y2 + 10);
          ctx2.stroke();
          ctx2.setLineDash([14, 12]);
          ctx2.lineDashOffset = -this.time * 80;
          ctx2.strokeStyle = `rgba(255,255,255,${0.8 * pulse})`;
          ctx2.lineWidth = 4;
          ctx2.beginPath();
          ctx2.moveTo(k.x, k.y + 10);
          ctx2.lineTo(k.x2, k.y2 + 10);
          ctx2.stroke();
          ctx2.restore();
        } else if (k.kind === "spawn") {
          const st = this.stamps[0];
          const prog = 1 - Math.max(0, k.t - MONSTER_RULES.spawnRise) / 1.1;
          if (st) drawFrame(ctx2, st, k.x, k.y + k.r * 0.5, k.r * 1.6 * Math.max(0.2, prog) / 112, false, this.time, 0.85);
        }
      }
    }
    drawRangeAndPressure(ctx2) {
      const p = this.sim.player;
      const st = this.sim.run.stats;
      if (this.showRange > 0.01) {
        ctx2.save();
        ctx2.globalAlpha = this.showRange * 0.55;
        ctx2.strokeStyle = "#ffffff";
        ctx2.lineWidth = 3;
        ctx2.setLineDash([10, 12]);
        ctx2.lineDashOffset = -this.time * 20;
        ctx2.beginPath();
        ctx2.ellipse(p.x, p.y - 14, st.range, st.range, 0, 0, Math.PI * 2);
        ctx2.stroke();
        ctx2.restore();
      }
      if (p.pressure > 0.02) {
        const full = p.pressure >= 1;
        ctx2.save();
        ctx2.lineCap = "round";
        ctx2.strokeStyle = "rgba(30,60,110,0.35)";
        ctx2.lineWidth = 7;
        ctx2.beginPath();
        ctx2.ellipse(p.x, p.y + 4, 30, 15, 0, 0, Math.PI * 2);
        ctx2.stroke();
        ctx2.strokeStyle = full ? `rgba(255,255,255,${0.85 + Math.sin(this.time * 20) * 0.15})` : "#6fd6ff";
        ctx2.lineWidth = full ? 6 : 5;
        ctx2.beginPath();
        ctx2.ellipse(p.x, p.y + 4, 30, 15, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.pressure);
        ctx2.stroke();
        if (full && quality().glow) {
          ctx2.globalCompositeOperation = "lighter";
          ctx2.globalAlpha = 0.35 + Math.sin(this.time * 12) * 0.1;
          draw(ctx2, "fx_glow", p.x, p.y + 2, 0.9, false, 0, 1, 1, 0.5);
        }
        ctx2.restore();
      }
    }
    drawPickups(ctx2) {
      const t2 = this.time;
      for (const k of this.sim.pickups) {
        if (!k.alive) continue;
        const bob = 5 + Math.sin(t2 * 6 + k.x) * 3;
        if (k.kind === "coin") draw(ctx2, `p_coin_${Math.floor(t2 * 10 + k.x) % 4}`, k.x, k.y - bob, 0.9);
        else if (k.kind === "xp") draw(ctx2, "p_xp", k.x, k.y - bob, 0.8);
        else draw(ctx2, "p_heal", k.x, k.y - bob, 1);
      }
      for (const b of this.sim.bubbles) if (b.alive) draw(ctx2, "p_bubble", b.x, b.y - 8 + Math.sin(t2 * 4 + b.x) * 2, 0.9, false, 0, Math.min(1, b.life * 2));
    }
    drawSorted(ctx2) {
      const sim = this.sim;
      const buf = this.sortBuf;
      buf.length = 0;
      for (const s of this.statics) buf.push({ y: s.sortY, k: 0, o: s });
      for (const m of sim.monsters) if (m.alive) buf.push({ y: m.y + m.r * 0.5, k: 1, o: m });
      for (const c of sim.cocoons) if (!c.freed) buf.push({ y: c.y + 20, k: 2, o: c });
      for (const f of sim.followers) if (f.joy <= 0) buf.push({ y: f.y, k: 3, o: f });
      buf.push({ y: sim.player.y, k: 4, o: sim.player });
      buf.sort((a, b) => a.y - b.y);
      for (const it of buf) {
        if (it.k === 0) {
          const s = it.o;
          draw(ctx2, s.name, s.x, s.y, s.scale, s.flip);
          if (s.name === "gate_posts") this.drawGate(ctx2);
        } else if (it.k === 1) this.drawMonster(ctx2, it.o);
        else if (it.k === 2) this.drawCocoon(ctx2, it.o);
        else if (it.k === 3) this.drawFollower(ctx2, it.o);
        else this.drawPlayer(ctx2);
      }
    }
    drawGate(ctx2) {
      const x = ROOM.width / 2, y = ROOM.wall + 2;
      if (this.gateFade > 0) {
        const k = this.gateFade;
        draw(ctx2, "gate_goo", x, y, 1 + (1 - k) * 0.2, false, 0, k, 1 + Math.sin(this.time * 3) * 0.02, k);
      } else if (this.sim.gateOpen && this.sim.state !== "done") {
        const bob = Math.sin(this.time * 6) * 8;
        draw(ctx2, "mk_arrow", x, y + 70 + bob, 0.9, false, 0, 0.95);
      }
    }
    drawMonster(ctx2, m) {
      const v = this.vis.get(m.id);
      let rise = 1;
      if (m.rise > 0) rise = 1 - m.rise / Math.max(MONSTER_RULES.spawnRise, v?.rise0 ?? 0.6);
      if (rise <= 0) {
        const st = this.stamps[1];
        if (st) drawFrame(ctx2, st, m.x, m.y + m.r * 0.5, m.r * 1.5 / 112, false, this.time * 0.5, 0.9);
        return;
      }
      rise = Math.min(1, Math.max(0, rise));
      const telegraph = m.state === 1 && (m.kind === "spitter" || m.kind === "dasher" || m.kind === "chunky" || m.kind === "nest" || m.kind === "jumper" || m.kind === "boss");
      const expr = m.hitTime < 0.16 ? "hit" : telegraph ? "charge" : "normal";
      let name;
      if (m.boss) name = `m_boss_${this.region}_${expr}`;
      else if (m.kind === "flyer") name = `m_flyer_${expr}_${Math.floor(this.time * 8 + m.id) % 2}`;
      else name = `m_${m.kind}_${expr}`;
      const sc = this.sim.scaleOf(m) * (m.r / baseR(m.kind));
      let sx = v ? v.sx : 1, sy = v ? v.sy : 1;
      let lift = 0;
      if ((m.kind === "blob" || m.kind === "mini") && m.state === 1) {
        const ph = Math.sin(Math.min(1, 1 - m.timer / MONSTER_RULES.hopMove) * Math.PI);
        lift = ph * 12;
        sy *= 1 + ph * 0.12;
        sx *= 1 - ph * 0.08;
      } else if (telegraph) {
        const k = 1 + Math.sin(this.time * 30) * 0.04;
        sx *= k * (m.kind === "spitter" ? 1.12 : 1.05);
        sy *= (m.kind === "jumper" ? 0.85 : 1.08) / k;
      } else {
        const br = Math.sin(this.time * 4 + m.id) * 0.03;
        sx *= 1 + br;
        sy *= 1 - br;
      }
      if (m.kind === "jumper" && m.state === 2) {
        const k = 1 - Math.max(0, m.timer) / MONSTER_RULES.jumpTime;
        lift = Math.sin(k * Math.PI) * 120;
        sy *= 1.1;
        sx *= 0.92;
      }
      if (m.boss && m.state === 3) {
        const k = 1 - Math.max(0, m.timer) / 0.85;
        lift = Math.sin(k * Math.PI) * 220;
      }
      if (m.kind === "flyer") lift = 34 + Math.sin(this.time * 3 + m.id) * 6;
      if (m.kind === "dasher" && m.state === 2) {
        sx *= 1.18;
        sy *= 0.86;
      }
      const flip = this.sim.player.x < m.x;
      this.lift.set(m.id, lift + m.r * 0.15 * sc);
      const by = m.y + m.r * 0.6 - lift;
      const s2 = sc * (0.3 + 0.7 * rise);
      draw(ctx2, name, m.x, by + (1 - rise) * 10, s2, flip, 0, rise < 1 ? 0.5 + rise * 0.5 : 1, sx, sy * (0.4 + 0.6 * rise));
      if (m.hitTime < 0.07 && quality().glow) {
        ctx2.globalCompositeOperation = "lighter";
        draw(ctx2, name, m.x, by, s2, flip, 0, 0.32, sx, sy);
        ctx2.globalCompositeOperation = "source-over";
      }
      if (m.boss) this.drawBossBar(ctx2, m);
    }
    drawBossBar(ctx2, m) {
      const w = 180, x = m.x - w / 2, y = m.y - m.r * 2.1;
      ctx2.save();
      ctx2.fillStyle = "rgba(58,36,22,0.8)";
      roundRect(ctx2, x - 3, y - 3, w + 6, 16, 8);
      ctx2.fill();
      ctx2.fillStyle = "#e2c2ff";
      roundRect(ctx2, x, y, w * Math.max(0, m.hp / m.maxHp), 10, 5);
      ctx2.fill();
      ctx2.restore();
    }
    drawCocoon(ctx2, c) {
      const k = Math.max(0, c.hp / c.maxHp);
      const wob = c.hitTime < 0.15 ? Math.sin(this.time * 50) * 0.05 : 0;
      const f = Math.floor(this.time * 3 + c.id) % 2;
      const pulse = 0.5 + Math.sin(this.time * 4 + c.id) * 0.5;
      ctx2.save();
      ctx2.strokeStyle = `rgba(255,244,170,${0.55 + pulse * 0.4})`;
      ctx2.lineWidth = 4;
      ctx2.beginPath();
      ctx2.ellipse(c.x, c.y + 26, 40 + pulse * 5, 15 + pulse * 2, 0, 0, Math.PI * 2);
      ctx2.stroke();
      ctx2.restore();
      if (quality().glow) {
        ctx2.globalCompositeOperation = "lighter";
        draw(ctx2, "fx_glow", c.x, c.y + 4, 1 + pulse * 0.15, false, 0, 0.22 + pulse * 0.12);
        ctx2.globalCompositeOperation = "source-over";
      }
      draw(ctx2, `a_${c.species}_trapped_${f}`, c.x, c.y + 28, 1.08);
      const idx = k > 0.66 ? 0 : k > 0.33 ? 1 : 2;
      draw(ctx2, `cocoon_${idx}`, c.x, c.y + 32, 0.95 + k * 0.15, false, 0, 0.4 + k * 0.5, 1 + wob, 1 - wob);
      const bob = Math.sin(this.time * 3 + c.id) * 4;
      draw(ctx2, "mk_help", c.x + 28, c.y - 52 + bob, 1);
    }
    // A just-freed animal pops out of its cocoon above every effect: a big hop,
    // a squash-and-stretch and a soft glow, so the reward is the thing you see.
    drawHeroes(ctx2) {
      for (const f of this.sim.followers) {
        if (f.joy <= 0) continue;
        const k = Math.min(1, 1 - f.joy / 1.1);
        const hop = k < 0.6 ? Math.sin(k / 0.6 * Math.PI) * 54 : Math.abs(Math.sin((k - 0.6) * 16)) * 10;
        const pop = 1 + 0.4 * Math.max(0, 1 - k * 1.6);
        const sq = k < 0.08 ? 1 - k * 3 : 1;
        draw(ctx2, "fx_glow", f.x, f.y - 26 - hop, 0.9 * pop, false, 0, 0.75 * (1 - k * 0.7));
        draw(ctx2, `a_${f.species}_happy_${Math.floor(this.time * 10) % 3}`, f.x, f.y + 4 - hop, 0.88 * pop, f.facing < 0, 0, 1, 1 / sq, sq);
      }
    }
    drawFollower(ctx2, f) {
      let name;
      let lift = 0;
      const id = f.idx * 1.7;
      if (f.joy > 0 || this.winTimer > 0) {
        name = `a_${f.species}_happy_${Math.floor(this.time * 10 + id) % 3}`;
      } else if (f.moving) name = `a_${f.species}_walk_${Math.floor(this.time * 10 + id) % 4}`;
      else if (f.cheer > 0.4 && Math.sin(this.time * 4 + id) > 0.6) {
        name = `a_${f.species}_happy_${Math.floor(this.time * 10) % 3}`;
      } else name = `a_${f.species}_idle_${Math.sin(this.time * 0.9 + id) > 0.96 ? 1 : 0}`;
      if (f.joy > 0) lift = Math.abs(Math.sin(f.joy * 9)) * 12;
      draw(ctx2, name, f.x, f.y + 4 - lift, 0.88, f.facing < 0);
    }
    drawPlayer(ctx2) {
      const sim = this.sim;
      const p = sim.player;
      const t2 = this.time;
      const tier = sim.run.stats.gunTier;
      let name;
      const speed = Math.hypot(p.vx, p.vy);
      if (sim.state === "dead") name = `kid_sad_${Math.floor(t2 * 2) % 2}`;
      else if (p.hurtTime < 0.32) name = "kid_hurt_0";
      else if (speed > 30) name = `kid_run_${Math.floor(this.runDist / 22) % 6}`;
      else if (p.firing) name = `kid_shoot_${Math.floor(t2 * 10) % 2}`;
      else if (this.winTimer > 0) name = `kid_win_${Math.floor((1.3 - this.winTimer) * 8) % 4}`;
      else name = `kid_idle_${Math.floor(t2 * 4) % 4}`;
      const flip = p.facing < 0;
      const blink = p.invuln > 0 && p.hurtTime < 1.2 && Math.floor(t2 * 16) % 2 === 0;
      const alpha = blink ? 0.45 : 1;
      const S = 0.9;
      const dead = sim.state === "dead";
      const pack = tier >= 5 ? 2 : tier >= 3 ? 1 : 0;
      if (!dead) draw(ctx2, `pack_${pack}`, p.x - p.facing * 13 * S, p.y - 30 * S, S * (tier >= 5 ? 1.05 : 0.95), flip, 0, alpha);
      let aim = p.firing ? p.aim : p.facing > 0 ? 0.35 : Math.PI - 0.35;
      if (!p.firing && speed > 30) aim = p.facing > 0 ? 0.15 : Math.PI - 0.15;
      if (this.winTimer > 0 && !p.firing && speed < 30) aim = p.facing > 0 ? -0.9 : Math.PI + 0.9;
      const hx = p.x + p.facing * 6 * S, hy = p.y - 22 * S;
      const left = Math.cos(aim) < 0;
      const behind = Math.sin(aim) < -0.55;
      const gunName = `gun_${tier}`;
      const gs = S * (1 + 0.04 * tier);
      if (!dead && behind) draw(ctx2, gunName, hx, hy, gs, false, aim, alpha, 1, left ? -1 : 1);
      draw(ctx2, name, p.x, p.y + 6, S, flip, 0, alpha);
      if (!dead && !behind) draw(ctx2, gunName, hx, hy, gs, false, aim, alpha, 1, left ? -1 : 1);
      if (p.shield) draw(ctx2, "mk_shield", p.x, p.y - 26, 0.62 + Math.sin(t2 * 4) * 0.02, false, 0, 0.9);
      const [mx, my] = point(gunName, "muzzle");
      const k = gs / 2;
      const myy = left ? -my : my;
      this.muzzleX = hx + (Math.cos(aim) * mx - Math.sin(aim) * myy) * k;
      this.muzzleY = hy + (Math.sin(aim) * mx + Math.cos(aim) * myy) * k;
      void GUN_TIERS;
    }
    drawStreams(ctx2) {
      const sim = this.sim;
      const t2 = this.time;
      const q = quality();
      const pr = sim.player.pressure;
      for (const s of sim.segs) {
        const x0 = s.kind === 2 ? s.x0 : this.muzzleX, y0 = s.kind === 2 ? s.y0 : this.muzzleY;
        let x1 = s.x1, y1 = s.y1;
        if (s.hitId >= 0) {
          const l = this.lift.get(s.hitId);
          if (l) y1 -= l * 0.8;
        }
        const len = Math.hypot(x1 - x0, y1 - y0);
        if (len < 2) continue;
        const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
        const wob = Math.sin(t2 * 9 + s.kind) * Math.min(6, len * 0.02);
        const cx = (x0 + x1) / 2 + nx * wob, cy = (y0 + y1) / 2 + ny * wob + len * 0.05;
        const w = visualWidth(s.w);
        ctx2.save();
        ctx2.lineCap = "round";
        ctx2.lineJoin = "round";
        const path = () => {
          ctx2.beginPath();
          ctx2.moveTo(x0, y0);
          ctx2.quadraticCurveTo(cx, cy, x1, y1);
        };
        if (q.glow) {
          path();
          ctx2.strokeStyle = `rgba(140,220,255,${0.22 + pr * 0.18})`;
          ctx2.lineWidth = w * 1.8;
          ctx2.stroke();
        }
        path();
        ctx2.strokeStyle = "rgba(28,98,170,0.9)";
        ctx2.lineWidth = w + 3;
        ctx2.stroke();
        path();
        ctx2.strokeStyle = pr >= 1 ? "#8fe2ff" : "#55c2f5";
        ctx2.lineWidth = w;
        ctx2.stroke();
        path();
        ctx2.strokeStyle = "rgba(210,245,255,0.95)";
        ctx2.lineWidth = w * 0.5;
        ctx2.stroke();
        if (q.streamFx) {
          path();
          ctx2.setLineDash([w * 1.4, w * 1.6]);
          ctx2.lineDashOffset = -t2 * (700 + pr * 500);
          ctx2.strokeStyle = "rgba(255,255,255,0.9)";
          ctx2.lineWidth = Math.max(2, w * 0.22);
          ctx2.stroke();
          ctx2.setLineDash([]);
        }
        if (s.kind !== 2) {
          ctx2.fillStyle = "rgba(235,250,255,0.9)";
          ctx2.beginPath();
          ctx2.arc(x0, y0, Math.min(w * 0.6, 16), 0, Math.PI * 2);
          ctx2.fill();
        }
        ctx2.restore();
        if (s.hit) {
          const f = Math.floor(t2 * 20 + s.kind) % 4;
          draw(ctx2, `fx_impact_${f}`, x1, y1 + 6, 0.6 + w / 22, false, Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2);
        }
      }
    }
    drawBullets(ctx2) {
      const t2 = this.time;
      const sh = frame("shadow");
      const contrast = save().settings.contrast;
      for (const b of this.sim.bullets) {
        if (!b.alive) continue;
        if (sh) drawFrame(ctx2, sh, b.x, b.y + 16, b.r / 30, false, 0, 0.7);
        if (contrast) {
          ctx2.lineWidth = 6;
          ctx2.strokeStyle = "#1b1b1b";
          ctx2.beginPath();
          ctx2.arc(b.x, b.y, b.r * 1.25, 0, Math.PI * 2);
          ctx2.stroke();
          ctx2.lineWidth = 3.5;
          ctx2.strokeStyle = "#ffe600";
          ctx2.stroke();
        }
        draw(ctx2, `goo_drop_${Math.floor(t2 * 8 + b.x * 0.1) % 2}`, b.x, b.y, b.r / 7.5 * 1);
      }
    }
  };
  function baseR(kind) {
    const R = { blob: 26, mini: 17, spitter: 26, splitter: 30, dasher: 26, chunky: 44, nest: 40, jumper: 28, flyer: 22, boss: 75 };
    return R[kind] ?? 26;
  }
  function roundRect(ctx2, x, y, w, h2, r) {
    ctx2.beginPath();
    ctx2.moveTo(x + r, y);
    ctx2.arcTo(x + w, y, x + w, y + h2, r);
    ctx2.arcTo(x + w, y + h2, x, y + h2, r);
    ctx2.arcTo(x, y + h2, x, y, r);
    ctx2.arcTo(x, y, x + w, y, r);
    ctx2.closePath();
  }

  // src/sim/bot.ts
  init_balance();

  // src/sim/nav.ts
  init_balance();
  var NAV_CELL = 24;
  var NAV_COLS = ROOM.width / NAV_CELL;
  var NAV_ROWS = ROOM.height / NAV_CELL;
  var FlowField = class {
    constructor(world, inflate = 16) {
      this.blocked = new Uint8Array(NAV_COLS * NAV_ROWS);
      this.dist = new Int32Array(NAV_COLS * NAV_ROWS);
      this.queue = new Int32Array(NAV_COLS * NAV_ROWS);
      for (let r = 0; r < NAV_ROWS; r++) for (let c = 0; c < NAV_COLS; c++) {
        const x = c * NAV_CELL + NAV_CELL / 2, y = r * NAV_CELL + NAV_CELL / 2;
        this.blocked[r * NAV_COLS + c] = world.overlapsSolid(x, y, inflate, true) ? 1 : 0;
      }
    }
    build(tx, ty) {
      const d = this.dist;
      d.fill(-1);
      let c = clampi(Math.floor(tx / NAV_CELL), 0, NAV_COLS - 1), r = clampi(Math.floor(ty / NAV_CELL), 0, NAV_ROWS - 1);
      let head = 0, tail = 0;
      const start = r * NAV_COLS + c;
      d[start] = 0;
      this.queue[tail++] = start;
      while (head < tail) {
        const i = this.queue[head++];
        const ci = i % NAV_COLS, ri = (i - ci) / NAV_COLS;
        const nd = d[i] + 1;
        if (ci > 0) this.visit(i - 1, nd, tail) && tail++;
        if (ci < NAV_COLS - 1) this.visit(i + 1, nd, tail) && tail++;
        if (ri > 0) this.visit(i - NAV_COLS, nd, tail) && tail++;
        if (ri < NAV_ROWS - 1) this.visit(i + NAV_COLS, nd, tail) && tail++;
      }
    }
    visit(i, nd, tail) {
      if (this.dist[i] !== -1 || this.blocked[i]) return false;
      this.dist[i] = nd;
      this.queue[tail] = i;
      return true;
    }
    // Direction (unit) to move from (x,y) toward the target along the field. Returns null if no path.
    dir(x, y, out) {
      const c = clampi(Math.floor(x / NAV_CELL), 0, NAV_COLS - 1), r = clampi(Math.floor(y / NAV_CELL), 0, NAV_ROWS - 1);
      const i = r * NAV_COLS + c;
      let best = this.dist[i] < 0 ? 1e9 : this.dist[i], bx = 0, by = 0, found = false;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const cc = c + dc, rr = r + dr;
        if (cc < 0 || rr < 0 || cc >= NAV_COLS || rr >= NAV_ROWS) continue;
        const j = rr * NAV_COLS + cc;
        const v = this.dist[j];
        if (v < 0) continue;
        if (dr && dc && (this.blocked[r * NAV_COLS + cc] || this.blocked[rr * NAV_COLS + c])) continue;
        const cost = v + (dr && dc ? 0.41 : 0);
        if (cost < best) {
          best = cost;
          bx = cc * NAV_CELL + NAV_CELL / 2 - x;
          by = rr * NAV_CELL + NAV_CELL / 2 - y;
          found = true;
        }
      }
      if (!found) return false;
      const l = Math.hypot(bx, by) || 1;
      out.x = bx / l;
      out.y = by / l;
      return true;
    }
    reachable(x, y) {
      const c = clampi(Math.floor(x / NAV_CELL), 0, NAV_COLS - 1), r = clampi(Math.floor(y / NAV_CELL), 0, NAV_ROWS - 1);
      return this.dist[r * NAV_COLS + c] >= 0;
    }
  };
  function clampi(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  // src/sim/bot.ts
  init_rng();
  var BOT_EXPERT = { name: "expert", reaction: 0.06, margin: 16, horizon: 0.7, greed: 0, mistakes: 0, rescue: true };
  var BOT_PLAYER = { name: "player", reaction: 0.22, margin: 4, horizon: 0.45, greed: 0.35, mistakes: 0.08, rescue: true };
  var BOT_NOVICE = { name: "novice", reaction: 0.32, margin: 0, horizon: 0.35, greed: 0.5, mistakes: 0.15, rescue: false };
  var SKILL_PRIORITY = ["thick", "multi", "splash", "pierce", "chain", "turbo", "vitality", "shield", "keep", "range", "speed", "trail", "magnet", "heal"];
  var Bot = class {
    constructor(profile, seed) {
      this.timer = 0;
      this.cur = { mx: 0, my: 0 };
      this.nav = null;
      this.navSim = null;
      this.navTimer = 0;
      this.navTarget = { x: 0, y: 0 };
      this.dodgeHold = 0;
      this.profile = profile;
      this.rng = new Rng(seed);
    }
    chooseSkill(options, hpRatio) {
      if (hpRatio < 0.45 && options.includes("heal")) return "heal";
      let best = options[0], bi = 99;
      for (const o of options) {
        const i = SKILL_PRIORITY.indexOf(o);
        if (i >= 0 && i < bi) {
          bi = i;
          best = o;
        }
      }
      return best;
    }
    decide(sim, dt) {
      this.timer -= dt;
      this.dodgeHold -= dt;
      if (this.timer > 0) return this.cur;
      this.timer = this.profile.reaction * (0.8 + this.rng.next() * 0.4);
      this.cur = this.think(sim);
      return this.cur;
    }
    threatAt(sim, x, y, t0) {
      const pr = sim.player.r;
      const H = this.profile.horizon;
      const M = this.profile.margin;
      let danger = 0;
      for (const b of sim.bullets) {
        if (!b.alive) continue;
        const rx = b.x - x, ry = b.y - (y - 6), vx = b.vx, vy = b.vy;
        const vv = vx * vx + vy * vy;
        let t2 = vv > 0 ? -(rx * vx + ry * vy) / vv : 0;
        t2 = Math.max(t0, Math.min(H, t2));
        const cx = rx + vx * t2, cy = ry + vy * t2;
        const d = Math.hypot(cx, cy);
        const lim = b.r + pr + M;
        if (d < lim) danger += (lim - d) / lim * 2 + (1 - t2 / H);
      }
      for (const m of sim.monsters) {
        if (!m.alive || m.rise > 0.3) continue;
        const d = Math.hypot(m.x - x, m.y - y) - m.r * sim.scaleOf(m) - pr;
        const lim = (m.kind === "dasher" && m.state === 2 ? 60 : 34) + M;
        if (d < lim) danger += (lim - d) / lim * 1.6;
      }
      for (const k of sim.marks) {
        if (k.kind === "land") {
          const d = Math.hypot(k.x - x, k.y - y);
          if (d < k.r + pr + M) danger += 2.5;
        } else if (k.kind === "dash" && k.x2 !== void 0) {
          const d = segDist(x, y, k.x, k.y, k.x2, k.y2);
          if (d < k.r + pr + M + 6) danger += 2.2;
        }
      }
      return danger;
    }
    think(sim) {
      const p = sim.player;
      const P = this.profile;
      if (sim.state === "dead" || sim.state === "done") return { mx: 0, my: 0 };
      const danger = this.threatAt(sim, p.x, p.y, 0);
      const greedy = p.pressure > 0.7 && this.rng.next() < P.greed;
      if (danger > 0.35 && !greedy || this.dodgeHold > 0) {
        if (this.dodgeHold > 0 && danger <= 0.35) return this.cur;
        return this.dodge(sim);
      }
      if (this.rng.next() < P.mistakes) {
        const a = this.rng.next() * Math.PI * 2;
        return { mx: Math.cos(a) * 0.8, my: Math.sin(a) * 0.8 };
      }
      const range = sim.run.stats.range;
      if (sim.state === "clear") {
        const c = sim.cocoons.find((cc) => !cc.freed);
        if (c) return this.approach(sim, c.x, c.y, range * 0.7);
        if (sim.pickupsLeft() > 0 && sim.stateTime < 1.4) return { mx: 0, my: 0 };
        if (sim.gateOpen) return this.moveTo(sim, ROOM.width / 2, ROOM.wall - 20);
        return { mx: 0, my: 0 };
      }
      const nx = p.x, ny = p.y - 14;
      let inRange = false;
      let nearest = null;
      for (const m of sim.monsters) {
        if (!m.alive || m.rise > 0) continue;
        const d = Math.hypot(m.x - nx, m.y - ny) - m.r;
        if (!nearest || d < nearest.d) nearest = { x: m.x, y: m.y, d };
        if (d <= range && sim.world.lineOfSight(nx, ny, m.x, m.y)) inRange = true;
      }
      if (P.rescue) {
        const few = sim.aliveCount() <= 2;
        for (const c of sim.cocoons) {
          if (c.freed) continue;
          const d = Math.hypot(c.x - nx, c.y - ny);
          if (few && d > range * 0.8 && this.threatAt(sim, c.x, c.y + 60, 0) < 0.5) return this.approach(sim, c.x, c.y, range * 0.7);
        }
      }
      if (inRange) return { mx: 0, my: 0 };
      if (nearest) return this.approach(sim, nearest.x, nearest.y, range * 0.8);
      return { mx: 0, my: 0 };
    }
    dodge(sim) {
      const p = sim.player;
      const speed = sim.run.stats.moveSpeed;
      let best = { mx: 0, my: 0 }, bestScore = -1e9;
      const N = 16;
      for (let i = 0; i <= N; i++) {
        let mx = 0, my = 0;
        if (i < N) {
          const a = i / N * Math.PI * 2;
          mx = Math.cos(a);
          my = Math.sin(a);
        }
        const step = i < N ? 0.28 : 0;
        const x = p.x + mx * speed * step, y = p.y + my * speed * step;
        if (i < N && sim.world.overlapsSolid(x, y, p.r, true)) continue;
        let score = -this.threatAt(sim, x, y, step * 0.6) * 10;
        score -= Math.abs(x - ROOM.width / 2) * 4e-3 + Math.abs(y - ROOM.height * 0.6) * 2e-3;
        if (sim.goo.at(x, y)) score -= 0.6;
        if (i === N) score += 0.5;
        if (score > bestScore) {
          bestScore = score;
          best = { mx, my };
        }
      }
      this.dodgeHold = 0.12;
      return best;
    }
    approach(sim, tx, ty, stopDist) {
      const p = sim.player;
      const d = Math.hypot(tx - p.x, ty - p.y);
      if (d < stopDist && sim.world.lineOfSight(p.x, p.y - 14, tx, ty)) return { mx: 0, my: 0 };
      return this.moveTo(sim, tx, ty);
    }
    moveTo(sim, tx, ty) {
      const p = sim.player;
      if (sim.world.lineOfSight(p.x, p.y, tx, ty) && !this.blockedLine(sim, p.x, p.y, tx, ty)) {
        const dx2 = tx - p.x, dy2 = ty - p.y;
        const d2 = Math.hypot(dx2, dy2) || 1;
        return { mx: dx2 / d2, my: dy2 / d2 };
      }
      if (!this.nav || this.navSim !== sim) {
        this.nav = new FlowField(sim.world, p.r + 2);
        this.navSim = sim;
        this.navTimer = 0;
      }
      this.navTimer -= this.profile.reaction;
      if (this.navTimer <= 0 || Math.hypot(this.navTarget.x - tx, this.navTarget.y - ty) > 40) {
        this.nav.build(tx, Math.max(ROOM.wall + 24, ty));
        this.navTarget = { x: tx, y: ty };
        this.navTimer = 0.5;
      }
      const o = { x: 0, y: 0 };
      if (this.nav.dir(p.x, p.y, o)) return { mx: o.x, my: o.y };
      const dx = tx - p.x, dy = ty - p.y;
      const d = Math.hypot(dx, dy) || 1;
      return { mx: dx / d, my: dy / d };
    }
    blockedLine(sim, x0, y0, x1, y1) {
      const d = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.ceil(d / 20);
      for (let i = 1; i <= n; i++) {
        const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
        if (y < ROOM.wall + sim.player.r) break;
        if (sim.world.overlapsSolid(x, y, sim.player.r - 2, true)) return true;
      }
      return false;
    }
  };
  function segDist(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const l2 = dx * dx + dy * dy;
    let t2 = l2 > 0 ? ((px - x0) * dx + (py - y0) * dy) / l2 : 0;
    t2 = Math.max(0, Math.min(1, t2));
    return Math.hypot(px - (x0 + dx * t2), py - (y0 + dy * t2));
  }

  // src/sim/room.ts
  init_balance();
  init_rng();

  // src/sim/goo.ts
  init_balance();
  var GOO_CELL = 16;
  var GOO_COLS = ROOM.width / GOO_CELL;
  var GOO_ROWS = ROOM.height / GOO_CELL;
  var GooGrid = class {
    constructor(blobs) {
      this.cells = new Uint8Array(GOO_COLS * GOO_ROWS);
      this.initial = 0;
      this.remaining = 0;
      for (const b of blobs) this.stamp(b.x, b.y, b.r);
      this.initial = this.count();
      this.remaining = this.initial;
    }
    stamp(x, y, r) {
      const c0 = Math.max(0, Math.floor((x - r) / GOO_CELL)), c1 = Math.min(GOO_COLS - 1, Math.floor((x + r) / GOO_CELL));
      const r0 = Math.max(0, Math.floor((y - r) / GOO_CELL)), r1 = Math.min(GOO_ROWS - 1, Math.floor((y + r) / GOO_CELL));
      const rr = r * 0.92 * (r * 0.92);
      for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
        const cx = col * GOO_CELL + GOO_CELL / 2, cy = row * GOO_CELL + GOO_CELL / 2;
        const dx = cx - x, dy = cy - y;
        if (dx * dx + dy * dy <= rr) this.cells[row * GOO_COLS + col] = 1;
      }
    }
    count() {
      let n = 0;
      for (let i = 0; i < this.cells.length; i++) n += this.cells[i];
      return n;
    }
    at(x, y) {
      const c = Math.floor(x / GOO_CELL), r = Math.floor(y / GOO_CELL);
      if (c < 0 || r < 0 || c >= GOO_COLS || r >= GOO_ROWS) return false;
      return this.cells[r * GOO_COLS + c] === 1;
    }
    // Returns number of cells cleaned.
    clean(x, y, r) {
      const c0 = Math.max(0, Math.floor((x - r) / GOO_CELL)), c1 = Math.min(GOO_COLS - 1, Math.floor((x + r) / GOO_CELL));
      const r0 = Math.max(0, Math.floor((y - r) / GOO_CELL)), r1 = Math.min(GOO_ROWS - 1, Math.floor((y + r) / GOO_CELL));
      const rr = r * r;
      let n = 0;
      for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
        const i = row * GOO_COLS + col;
        if (!this.cells[i]) continue;
        const cx = col * GOO_CELL + GOO_CELL / 2, cy = row * GOO_CELL + GOO_CELL / 2;
        const dx = cx - x, dy = cy - y;
        if (dx * dx + dy * dy <= rr) {
          this.cells[i] = 0;
          n++;
        }
      }
      this.remaining -= n;
      return n;
    }
    clearAll() {
      this.cells.fill(0);
      this.remaining = 0;
    }
    cleanRatio() {
      return this.initial === 0 ? 1 : 1 - this.remaining / this.initial;
    }
  };

  // src/sim/world.ts
  init_balance();
  var COLS2 = ROOM.width / ROOM.tile;
  var ROWS2 = ROOM.height / ROOM.tile;
  var StaticWorld = class {
    constructor(room) {
      this.colliders = [];
      this.water = new Uint8Array(COLS2 * ROWS2);
      this.minX = ROOM.wall;
      this.maxX = ROOM.width - ROOM.wall;
      this.minY = ROOM.wall;
      this.maxY = ROOM.height - ROOM.wall;
      for (const o of room.obstacles) {
        const def = OBSTACLES[o.t];
        if (!def) continue;
        this.colliders.push({
          kind: def.shape,
          x: o.x,
          y: o.y,
          r: def.r ?? 0,
          w: def.w ?? 0,
          h: def.h ?? 0,
          blocksShots: def.blocksShots,
          type: o.t
        });
      }
      if (room.terrain) {
        for (let row = 0; row < ROWS2; row++) {
          const line = room.terrain[row] || "";
          for (let col = 0; col < COLS2; col++) if (line[col] === "w") this.water[row * COLS2 + col] = 1;
        }
      }
    }
    isWaterAt(x, y) {
      const c = Math.floor(x / ROOM.tile), r = Math.floor(y / ROOM.tile);
      if (c < 0 || r < 0 || c >= COLS2 || r >= ROWS2) return false;
      return this.water[r * COLS2 + c] === 1;
    }
    // Push a circle out of walls, obstacles and (optionally) water. Returns true if it collided.
    resolve(p, r, solidWater, ignoreObstacles = false) {
      let hit = false;
      if (p.x < this.minX + r) {
        p.x = this.minX + r;
        hit = true;
      }
      if (p.x > this.maxX - r) {
        p.x = this.maxX - r;
        hit = true;
      }
      if (p.y < this.minY + r) {
        p.y = this.minY + r;
        hit = true;
      }
      if (p.y > this.maxY - r) {
        p.y = this.maxY - r;
        hit = true;
      }
      if (!ignoreObstacles) {
        for (const c of this.colliders) {
          if (c.kind === "circle") {
            const dx = p.x - c.x, dy = p.y - c.y;
            const rr = r + c.r;
            const d2 = dx * dx + dy * dy;
            if (d2 < rr * rr) {
              const d = Math.sqrt(d2) || 1e-3;
              p.x = c.x + dx / d * rr;
              p.y = c.y + dy / d * rr;
              hit = true;
            }
          } else if (pushOutRect(p, r, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h)) hit = true;
        }
      }
      if (solidWater) {
        const t2 = ROOM.tile;
        const c0 = Math.floor((p.x - r) / t2), c1 = Math.floor((p.x + r) / t2);
        const r0 = Math.floor((p.y - r) / t2), r1 = Math.floor((p.y + r) / t2);
        for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
          if (col < 0 || row < 0 || col >= COLS2 || row >= ROWS2) continue;
          if (this.water[row * COLS2 + col]) {
            if (pushOutRect(p, r, col * t2, row * t2, t2, t2)) hit = true;
          }
        }
      }
      return hit;
    }
    overlapsSolid(x, y, r, solidWater = true) {
      if (x < this.minX + r || x > this.maxX - r || y < this.minY + r || y > this.maxY - r) return true;
      for (const c of this.colliders) {
        if (c.kind === "circle") {
          const dx = x - c.x, dy = y - c.y, rr = r + c.r;
          if (dx * dx + dy * dy < rr * rr) return true;
        } else {
          const cx = clamp(x, c.x - c.w / 2, c.x + c.w / 2), cy = clamp(y, c.y - c.h / 2, c.y + c.h / 2);
          const dx = x - cx, dy = y - cy;
          if (dx * dx + dy * dy < r * r) return true;
        }
      }
      if (solidWater) {
        const t2 = ROOM.tile;
        for (let row = Math.floor((y - r) / t2); row <= Math.floor((y + r) / t2); row++)
          for (let col = Math.floor((x - r) / t2); col <= Math.floor((x + r) / t2); col++) {
            if (col < 0 || row < 0 || col >= COLS2 || row >= ROWS2) continue;
            if (this.water[row * COLS2 + col]) {
              const cx = clamp(x, col * t2, col * t2 + t2), cy = clamp(y, row * t2, row * t2 + t2);
              const dx = x - cx, dy = y - cy;
              if (dx * dx + dy * dy < r * r) return true;
            }
          }
      }
      return false;
    }
    // Distance along a ray until it hits a shot-blocking obstacle or wall. Returns maxDist if clear.
    rayBlock(x, y, dx, dy, maxDist) {
      let best = maxDist;
      if (dx > 0) best = Math.min(best, (this.maxX - x) / dx);
      if (dx < 0) best = Math.min(best, (this.minX - x) / dx);
      if (dy > 0) best = Math.min(best, (this.maxY - y) / dy);
      if (dy < 0) best = Math.min(best, (this.minY - y) / dy);
      for (const c of this.colliders) {
        if (!c.blocksShots) continue;
        const d = c.kind === "circle" ? rayCircle(x, y, dx, dy, c.x, c.y, c.r * 0.85) : rayRect(x, y, dx, dy, c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
        if (d >= 0 && d < best) best = d;
      }
      return Math.max(0, best);
    }
    lineOfSight(x0, y0, x1, y1) {
      const dx = x1 - x0, dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      if (len < 1) return true;
      return this.rayBlock(x0, y0, dx / len, dy / len, len) >= len - 1;
    }
  };
  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
  function pushOutRect(p, r, rx, ry, rw, rh) {
    const cx = clamp(p.x, rx, rx + rw), cy = clamp(p.y, ry, ry + rh);
    const dx = p.x - cx, dy = p.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 >= r * r) return false;
    if (d2 > 1e-4) {
      const d = Math.sqrt(d2);
      p.x = cx + dx / d * r;
      p.y = cy + dy / d * r;
    } else {
      const left = p.x - rx, right = rx + rw - p.x, top = p.y - ry, bottom = ry + rh - p.y;
      const m = Math.min(left, right, top, bottom);
      if (m === left) p.x = rx - r;
      else if (m === right) p.x = rx + rw + r;
      else if (m === top) p.y = ry - r;
      else p.y = ry + rh + r;
    }
    return true;
  }
  function rayCircle(ox, oy, dx, dy, cx, cy, r) {
    const fx = ox - cx, fy = oy - cy;
    const b = fx * dx + fy * dy;
    const c = fx * fx + fy * fy - r * r;
    if (c < 0) return 0;
    const disc = b * b - c;
    if (disc < 0) return -1;
    const t2 = -b - Math.sqrt(disc);
    return t2 >= 0 ? t2 : -1;
  }
  function rayRect(ox, oy, dx, dy, rx, ry, rw, rh) {
    let tmin = -Infinity, tmax = Infinity;
    if (Math.abs(dx) < 1e-9) {
      if (ox < rx || ox > rx + rw) return -1;
    } else {
      let t1 = (rx - ox) / dx, t2 = (rx + rw - ox) / dx;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
    }
    if (Math.abs(dy) < 1e-9) {
      if (oy < ry || oy > ry + rh) return -1;
    } else {
      let t1 = (ry - oy) / dy, t2 = (ry + rh - oy) / dy;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
    }
    if (tmax < 0 || tmin > tmax) return -1;
    return tmin < 0 ? 0 : tmin;
  }

  // src/sim/run.ts
  init_balance();
  init_stats();
  init_rng();
  var NO_MODS = { monsterHp: 1, monsterSpeed: 1, monsterDmg: 1, bulletSpeed: 1, playerDps: 1, bigMonsters: false, coinMul: 1 };
  function createRun(level2, meta, opts) {
    const stats = computeStats(meta, {}, 0);
    return {
      level: level2,
      stage: level2.stage,
      scaleStage: level2.tier ?? level2.stage,
      roomIndex: 0,
      xpLevel: 1,
      xp: 0,
      pendingLevelUps: 0,
      skills: {},
      skillOrder: [],
      coins: 0,
      rescued: [],
      washed: 0,
      roomsCleared: 0,
      hp: stats.maxHp,
      revives: opts.revives,
      shield: false,
      hits: 0,
      dmgBy: {},
      pressureFulls: 0,
      meta,
      stats,
      time: 0,
      mods: opts.mods ?? NO_MODS,
      known: opts.known.slice(),
      seed: opts.seed,
      rng: new Rng(opts.seed ^ 1540483477),
      bestCombo: 0,
      daily: !!opts.daily,
      cleanSum: 0,
      noHitRooms: 0
    };
  }
  function runScale(run) {
    return stageScale(run.scaleStage);
  }
  function refreshStats(run) {
    const old = run.stats;
    const s = computeStats(run.meta, run.skills, run.rescued.length);
    s.dps *= run.mods.playerDps;
    if (s.maxHp > old.maxHp) run.hp += s.maxHp - old.maxHp;
    run.hp = Math.min(run.hp, s.maxHp);
    run.stats = s;
    return s;
  }
  function addXp(run, amount) {
    run.xp += amount * run.stats.xpMult;
    while (run.xp >= xpToNext(run.xpLevel + run.pendingLevelUps)) {
      run.xp -= xpToNext(run.xpLevel + run.pendingLevelUps);
      run.pendingLevelUps++;
    }
  }
  function xpProgress(run) {
    return Math.min(1, run.xp / xpToNext(run.xpLevel + run.pendingLevelUps));
  }
  function rollSkillChoices(run, count = 3) {
    const hpRatio = run.hp / run.stats.maxHp;
    const pool = SKILLS.map((d) => ({ id: d.id, w: skillWeight(d, run.skills[d.id] || 0, hpRatio) })).filter((p) => p.w > 0);
    const out = [];
    while (out.length < count && pool.length) {
      const total = pool.reduce((a, p) => a + p.w, 0);
      let r = run.rng.next() * total;
      let i = 0;
      for (; i < pool.length - 1; i++) {
        r -= pool[i].w;
        if (r <= 0) break;
      }
      out.push(pool[i].id);
      pool.splice(i, 1);
    }
    return out;
  }
  function applySkill(run, id) {
    if (id === "heal") {
      run.hp = Math.min(run.stats.maxHp, run.hp + run.stats.maxHp * 0.4);
    } else {
      run.skills[id] = (run.skills[id] || 0) + 1;
      run.skillOrder.push(id);
      if (id === "shield") run.shield = true;
    }
    const before = run.stats.maxHp;
    refreshStats(run);
    if (id === "vitality") run.hp = Math.min(run.stats.maxHp, run.hp + run.stats.maxHp * 0.2);
    void before;
    run.pendingLevelUps = Math.max(0, run.pendingLevelUps - 1);
    run.xpLevel++;
  }

  // src/sim/room.ts
  var TAU = Math.PI * 2;
  var GATE_X = ROOM.width / 2;
  var RoomSim = class {
    constructor(run, roomIndex, seed) {
      this.monsters = [];
      this.bullets = [];
      this.cocoons = [];
      this.followers = [];
      this.pickups = [];
      this.bubbles = [];
      this.segs = [];
      this.events = [];
      this.marks = [];
      this.state = "fight";
      this.time = 0;
      this.stateTime = 0;
      this.gateOpen = false;
      this.wave = 0;
      this.maxWave = 0;
      this.waveTimer = -1;
      this.nextId = 1;
      this.navTimer = 0;
      this.targetTimer = 0;
      this.target = null;
      this.multiAim = [];
      this.cleanTimer = 0;
      this.trailPts = [];
      this.comboTimer = 0;
      this.combo = 0;
      this.killQueue = [];
      this.tmp = { x: 0, y: 0 };
      this.hitThisRoom = false;
      this.cleanedCells = 0;
      this.run = run;
      this.def = run.level.rooms[roomIndex];
      this.isLast = roomIndex === run.level.rooms.length - 1;
      this.rng = new Rng(seed);
      this.world = new StaticWorld(this.def);
      this.goo = new GooGrid(this.def.goo);
      this.nav = new FlowField(this.world, 18);
      const st = this.def.start ?? { x: GATE_X, y: ROOM.height - ROOM.wall - 70 };
      this.player = {
        x: st.x,
        y: st.y,
        vx: 0,
        vy: 0,
        r: PLAYER.radius,
        hp: run.hp,
        invuln: 1,
        moving: false,
        stillTime: 0,
        firing: false,
        aim: -Math.PI / 2,
        pressure: 0,
        pressureFullSent: false,
        streamLen: 0,
        facing: 1,
        shield: run.shield,
        shieldTimer: 0,
        trailTimer: 0,
        onGoo: false,
        hurtTime: 99
      };
      for (const mp of this.def.monsters) {
        const w = mp.w ?? 0;
        this.maxWave = Math.max(this.maxWave, w);
        if (w === 0) this.spawnMonster(mp.t, mp.x, mp.y, MONSTER_RULES.roomStartDelay + MONSTER_RULES.spawnRise + this.rng.range(0, 0.25), 0, 0, mp.v ?? 0);
      }
      for (const a of this.def.animals) {
        const hp = RESCUE.cocoonHp * Math.sqrt(runScale(run).hp);
        this.cocoons.push({ id: this.nextId++, species: a.s, x: a.x, y: a.y, r: RESCUE.cocoonRadius, hp, maxHp: hp, freed: false, hitTime: 99 });
      }
      run.rescued.forEach((s, i) => {
        this.followers.push({ species: s, x: st.x + (i % 2 ? 16 : -16), y: st.y + 34 + i * 30, vx: 0, joy: 0, idx: i, moving: false, cheer: 0, facing: 1 });
      });
      for (let i = 0; i < 60; i++) this.trailPts.push(st.x, st.y + 300 - i * 5);
      this.nav.build(this.player.x, this.player.y);
    }
    // ---------------------------------------------------------------- spawning
    spawnMonster(kind, x, y, rise, wave, parent = 0, variant = 0) {
      const base = MONSTERS[kind];
      const sc = runScale(this.run);
      const mods = this.run.mods;
      const big = mods.bigMonsters && kind !== "boss" ? 1.35 : 1;
      const hp = base.hp * sc.hp * mods.monsterHp * (big > 1 ? 1.6 : 1);
      const m = {
        id: this.nextId++,
        kind,
        x,
        y,
        vx: 0,
        vy: 0,
        r: base.r * big,
        hp,
        maxHp: hp,
        speed: base.speed * sc.speed * mods.monsterSpeed * (big > 1 ? 0.8 : 1),
        contact: base.contact * sc.dmg * mods.monsterDmg,
        state: 0,
        timer: this.rng.range(0, 0.4),
        cd: (base.cooldown ?? 2) * this.rng.range(0.5, 1) / sc.tempo,
        rise,
        tx: x,
        ty: y,
        alive: true,
        boss: kind === "boss",
        parent,
        hitTime: 99,
        phase: 0,
        pattern: 0,
        airborne: kind === "flyer",
        wave,
        variant
      };
      this.monsters.push(m);
      return m;
    }
    spawnWave(w) {
      for (const mp of this.def.monsters) if ((mp.w ?? 0) === w) {
        this.spawnMonster(mp.t, mp.x, mp.y, MONSTER_RULES.spawnRise, w, 0, mp.v ?? 0);
      }
    }
    emit(e) {
      this.events.push(e);
    }
    drain() {
      const e = this.events;
      this.events = [];
      return e;
    }
    aliveCount() {
      let n = 0;
      for (const m of this.monsters) if (m.alive) n++;
      return n;
    }
    // ---------------------------------------------------------------- main step
    step(dt, input) {
      this.time += dt;
      this.stateTime += dt;
      if (this.state === "dead") {
        this.updatePickups(dt);
        return;
      }
      this.updatePlayer(dt, input);
      this.navTimer -= dt;
      if (this.navTimer <= 0) {
        this.nav.build(this.player.x, this.player.y);
        this.navTimer = 0.2;
      }
      this.updateMonsters(dt);
      this.updateBullets(dt);
      this.updateStream(dt);
      this.processKills();
      this.updateTrail(dt);
      this.updatePickups(dt);
      this.updateFollowers(dt);
      this.updateMarks(dt);
      this.updateFlow(dt);
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
      this.run.time += dt;
    }
    // ---------------------------------------------------------------- player
    updatePlayer(dt, input) {
      const p = this.player;
      const s = this.run.stats;
      const mag = Math.hypot(input.mx, input.my);
      const wasMoving = p.moving;
      p.moving = mag > 0.05;
      p.onGoo = this.goo.at(p.x, p.y + 8);
      const speed = s.moveSpeed * (p.onGoo ? s.gooSlow : 1) * Math.min(1, mag);
      const tvx = p.moving ? input.mx / mag * speed : 0, tvy = p.moving ? input.my / mag * speed : 0;
      const dvx = tvx - p.vx, dvy = tvy - p.vy;
      const dl = Math.hypot(dvx, dvy);
      const maxDv = PLAYER.accel * dt;
      if (dl <= maxDv) {
        p.vx = tvx;
        p.vy = tvy;
      } else {
        p.vx += dvx / dl * maxDv;
        p.vy += dvy / dl * maxDv;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (this.gateOpen && Math.abs(p.x - GATE_X) < ROOM.gateWidth / 2 && p.y < ROOM.wall + p.r + 4) {
        this.state = "done";
        this.emit({ t: "exit" });
      }
      this.world.resolve(p, p.r, true);
      if (Math.abs(p.vx) > 12) p.facing = p.vx > 0 ? 1 : -1;
      p.invuln = Math.max(0, p.invuln - dt);
      p.hurtTime += dt;
      if (p.moving) {
        p.stillTime = 0;
        p.pressure = Math.max(0, p.pressure - s.pressureDrain * dt);
        if (p.pressure < 0.95) p.pressureFullSent = false;
        if (p.firing) {
          p.firing = false;
          p.streamLen = 0;
          this.emit({ t: "fireStop" });
        }
        const lx = this.trailPts[this.trailPts.length - 2], ly = this.trailPts[this.trailPts.length - 1];
        if (Math.hypot(p.x - lx, p.y - ly) > 6) {
          this.trailPts.push(p.x, p.y);
          if (this.trailPts.length > 800) this.trailPts.splice(0, 2);
        }
      } else {
        p.stillTime += dt;
      }
      void wasMoving;
      if (s.shieldRegen > 0 && !p.shield) {
        p.shieldTimer += dt;
        if (p.shieldTimer >= s.shieldRegen) {
          p.shield = true;
          p.shieldTimer = 0;
          this.emit({ t: "shieldUp" });
        }
      }
      if (s.trail > 0 && p.moving && this.state === "fight") {
        p.trailTimer -= dt;
        if (p.trailTimer <= 0) {
          p.trailTimer = SKILL_VALUES.trailEvery;
          this.bubbles.push({ x: p.x, y: p.y + 6, life: 2.2, alive: true });
        }
      }
    }
    hurtPlayer(dmg, src, fx, fy) {
      const p = this.player;
      if (p.invuln > 0 || this.state === "dead" || this.state === "done") return;
      if (p.shield) {
        p.shield = false;
        p.shieldTimer = 0;
        p.invuln = 0.6;
        this.emit({ t: "shieldPop", x: p.x, y: p.y });
        return;
      }
      const d = Math.max(1, Math.round(dmg * this.run.stats.armor));
      p.hp -= d;
      p.invuln = this.run.stats.invuln;
      p.hurtTime = 0;
      p.pressure *= PLAYER.pressureKeepOnHit;
      p.pressureFullSent = false;
      this.run.hits++;
      this.hitThisRoom = true;
      this.run.dmgBy[src] = (this.run.dmgBy[src] || 0) + d;
      const dx = p.x - fx, dy = p.y - fy;
      const l = Math.hypot(dx, dy) || 1;
      p.vx += dx / l * 160;
      p.vy += dy / l * 160;
      this.emit({ t: "playerHit", dmg: d, src, x: p.x, y: p.y });
      if (p.hp <= 0) {
        p.hp = 0;
        this.state = "dead";
        this.stateTime = 0;
        p.firing = false;
        p.streamLen = 0;
        this.segs.length = 0;
        this.emit({ t: "dead" });
      }
    }
    revive(frac) {
      const p = this.player;
      p.hp = Math.max(1, Math.round(this.run.stats.maxHp * frac));
      p.invuln = 2.2;
      this.state = this.aliveCount() > 0 || this.waveTimer >= 0 || this.wave < this.maxWave ? "fight" : "clear";
      this.stateTime = 0;
      for (const b of this.bullets) b.alive = false;
      for (const m of this.monsters) {
        if (!m.alive) continue;
        const dx = m.x - p.x, dy = m.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 220) {
          m.x += dx / d * (220 - d);
          m.y += dy / d * (220 - d);
          this.world.resolve(m, m.r, !m.airborne, m.airborne);
        }
        if (m.state !== 0 && m.kind !== "boss") {
          m.state = 0;
          m.cd = 1.5;
        }
      }
    }
    // ---------------------------------------------------------------- targeting + stream
    candidates() {
      const out = [];
      for (const m of this.monsters) {
        if (!m.alive || m.rise > 0 || m.kind === "jumper" && m.state === 2 || m.boss && m.state === 3) continue;
        out.push({ kind: "m", m, x: m.x, y: m.y, r: m.r * this.scaleOf(m) });
      }
      for (const c of this.cocoons) if (!c.freed) out.push({ kind: "c", c, x: c.x, y: c.y, r: c.r });
      return out;
    }
    scaleOf(m) {
      return MONSTER_RULES.minScale + (1 - MONSTER_RULES.minScale) * (m.hp / m.maxHp);
    }
    pickTargets() {
      const p = this.player;
      const range = this.run.stats.range;
      const nx = p.x, ny = p.y - 14;
      const list = this.candidates().map((t2) => ({ t: t2, d: Math.hypot(t2.x - nx, t2.y - ny) - t2.r })).filter((o) => o.d <= range).map((o) => ({ ...o, los: this.world.lineOfSight(nx, ny, o.t.x, o.t.y) }));
      list.sort((a, b) => a.los === b.los ? a.d - b.d : a.los ? -1 : 1);
      if (this.target && list.length) {
        const cur = list.find((o) => o.t.m && o.t.m === this.target.m || o.t.c && o.t.c === this.target.c);
        if (cur && cur.los === list[0].los && cur.d < list[0].d * 1.25 + 20) {
          list.splice(list.indexOf(cur), 1);
          list.unshift(cur);
        }
      }
      return list.map((o) => o.t);
    }
    updateStream(dt) {
      const p = this.player;
      const s = this.run.stats;
      this.segs.length = 0;
      const canFire = !p.moving && p.stillTime >= PLAYER.fireDelay && (this.state === "fight" || this.state === "clear");
      if (!canFire) {
        if (p.firing) {
          p.firing = false;
          this.emit({ t: "fireStop" });
        }
        p.streamLen = 0;
        return;
      }
      this.targetTimer -= dt;
      let targets = null;
      if (this.targetTimer <= 0 || !this.targetValid()) {
        targets = this.pickTargets();
        this.targetTimer = 0.12;
        this.target = targets[0] ?? null;
      }
      if (!this.target) {
        if (p.firing) {
          p.firing = false;
          this.emit({ t: "fireStop" });
        }
        p.streamLen = 0;
        p.pressure = Math.max(0, p.pressure - dt * 0.6);
        return;
      }
      const nx = p.x, ny = p.y - 14;
      const tgt = this.target;
      const want = Math.atan2(tgt.y - ny, tgt.x - nx);
      if (!p.firing) {
        p.firing = true;
        p.aim = want;
        p.streamLen = 0;
        this.emit({ t: "fireStart" });
      }
      p.aim = turnToward(p.aim, want, PLAYER.aimTurnRate * dt);
      p.facing = Math.cos(p.aim) >= 0 ? 1 : -1;
      p.streamLen = Math.min(s.range + 40, p.streamLen + PLAYER.streamSpeed * dt);
      p.pressure = Math.min(1, p.pressure + dt / s.pressureCharge);
      if (p.pressure >= 1 && !p.pressureFullSent) {
        p.pressureFullSent = true;
        this.run.pressureFulls++;
        this.emit({ t: "pressureFull", x: p.x, y: p.y });
      }
      const pressMul = 1 + (s.pressureMax - 1) * Math.pow(p.pressure, 1.4);
      const dps = s.dps * pressMul;
      const width = s.width * (1 + PLAYER.pressureWidth * p.pressure);
      const ox = nx + Math.cos(p.aim) * 26, oy = ny + Math.sin(p.aim) * 26;
      const main = this.castStream(ox, oy, p.aim, Math.min(p.streamLen, s.range + 30), dps * dt, width, 0, s.pierce);
      if (s.chain > 0 && main) {
        let from = main;
        const hitSet = /* @__PURE__ */ new Set([main]);
        for (let k = 0; k < s.chain; k++) {
          let best = null, bd = SKILL_VALUES.chainRange;
          for (const m of this.monsters) {
            if (!m.alive || m.rise > 0 || hitSet.has(m)) continue;
            const d = Math.hypot(m.x - from.x, m.y - from.y);
            if (d < bd) {
              bd = d;
              best = m;
            }
          }
          if (!best) break;
          hitSet.add(best);
          this.damageMonster(best, dps * dt * SKILL_VALUES.chainDmg);
          this.segs.push({ x0: from.x, y0: from.y, x1: best.x, y1: best.y, w: width * 0.55, kind: 2, hit: true, hitId: best.id });
          from = best;
        }
      }
      if (s.multi > 0) {
        if (!targets) targets = this.pickTargets();
        const others = targets.filter((t2) => !(t2.m && t2.m === tgt.m) && !(t2.c && t2.c === tgt.c));
        for (let k = 0; k < s.multi; k++) {
          const t2 = others[k];
          if (!t2) {
            this.multiAim[k] = p.aim;
            continue;
          }
          const w2 = Math.atan2(t2.y - ny, t2.x - nx);
          this.multiAim[k] = turnToward(this.multiAim[k] ?? p.aim, w2, PLAYER.aimTurnRate * dt);
          this.castStream(ox, oy, this.multiAim[k], Math.min(p.streamLen, s.range + 30), dps * dt * SKILL_VALUES.multiDmg, width * 0.7, 1, 0);
        }
      }
      this.cleanTimer -= dt;
      if (this.cleanTimer <= 0) {
        this.cleanTimer = 0.05;
        for (const seg of this.segs) {
          if (seg.kind === 2) continue;
          const len = Math.hypot(seg.x1 - seg.x0, seg.y1 - seg.y0);
          const rr = Math.max(10, seg.w * PLAYER.streamClean);
          for (let d = 30; d < len; d += 26) {
            const x = seg.x0 + (seg.x1 - seg.x0) * d / len, y = seg.y0 + (seg.y1 - seg.y0) * d / len;
            const n = this.goo.clean(x, y, rr);
            if (n > 0) {
              this.cleanedCells += n;
              this.emit({ t: "clean", x, y, r: rr * 1.15 });
            }
          }
          const ir = PLAYER.impactClean + seg.w * 1.2;
          this.cleanedCells += this.goo.clean(seg.x1, seg.y1, ir);
          this.emit({ t: "clean", x: seg.x1, y: seg.y1, r: ir * 1.1 });
        }
      }
    }
    targetValid() {
      const t2 = this.target;
      if (!t2) return false;
      if (t2.m) return t2.m.alive && t2.m.rise <= 0;
      if (t2.c) return !t2.c.freed;
      return false;
    }
    // Ray-casts one stream, applies damage, appends render segments. Returns first monster hit.
    castStream(ox, oy, ang, len, dmg, width, kind, pierce) {
      const dx = Math.cos(ang), dy = Math.sin(ang);
      const block = this.world.rayBlock(ox, oy, dx, dy, len);
      const hits = [];
      for (const m of this.monsters) {
        if (!m.alive || m.rise > 0 || m.kind === "jumper" && m.state === 2 || m.boss && m.state === 3) continue;
        const r = m.r * this.scaleOf(m) + width * 0.3;
        const d = rayCircle(ox, oy, dx, dy, m.x, m.y, r);
        if (d >= 0 && d <= block) hits.push({ d, m, r });
      }
      for (const c of this.cocoons) {
        if (c.freed) continue;
        const d = rayCircle(ox, oy, dx, dy, c.x, c.y, c.r + width * 0.3);
        if (d >= 0 && d <= block) hits.push({ d, c, r: c.r });
      }
      hits.sort((a, b) => a.d - b.d);
      let first = null;
      let endD = block;
      let hitAny = false;
      let lastId = -1;
      const maxHits = 1 + pierce;
      for (let i = 0; i < hits.length && i < maxHits; i++) {
        const h2 = hits[i];
        const mul = i === 0 ? 1 : SKILL_VALUES.pierceDmg;
        if (h2.m) {
          this.damageMonster(h2.m, dmg * mul);
          if (!first) first = h2.m;
        }
        if (h2.c) this.damageCocoon(h2.c, dmg * mul);
        hitAny = true;
        lastId = h2.m ? h2.m.id : -1;
        endD = h2.d + h2.r * 0.6;
        if (i === maxHits - 1 || i === hits.length - 1) {
          if (pierce > 0 && i < maxHits - 1) endD = block;
        }
      }
      if (pierce > 0 && hitAny && hits.length < maxHits) endD = block;
      this.segs.push({ x0: ox, y0: oy, x1: ox + dx * endD, y1: oy + dy * endD, w: width, kind, hit: hitAny || endD < len - 2, hitId: pierce > 0 && endD >= block ? -1 : lastId });
      return first;
    }
    damageMonster(m, dmg) {
      if (!m.alive) return;
      m.hp -= dmg;
      if (m.hitTime > 0.09) this.emit({ t: "hit", id: m.id, x: m.x, y: m.y, kind: m.kind });
      m.hitTime = 0;
      if (m.boss && m.phase === 0 && m.hp < m.maxHp * 0.5) {
        m.phase = 1;
        this.emit({ t: "bossPhase", phase: 1 });
      }
      if (m.hp <= 0) {
        m.alive = false;
        this.killQueue.push(m);
      }
    }
    damageCocoon(c, dmg) {
      if (c.freed) return;
      c.hp -= dmg;
      if (c.hitTime > 0.12) this.emit({ t: "cocoonHit", id: c.id, x: c.x, y: c.y });
      c.hitTime = 0;
      if (c.hp <= 0) this.freeCocoon(c);
    }
    freeCocoon(c) {
      c.freed = true;
      const run = this.run;
      const brave = this.aliveCount() > 0;
      const first = !run.known.includes(c.species) && !run.rescued.includes(c.species);
      run.rescued.push(c.species);
      const idx = this.followers.length;
      this.followers.push({ species: c.species, x: c.x, y: c.y, vx: 0, joy: 1.1, idx, moving: false, cheer: 0, facing: 1 });
      const healed = refreshStats(run).rescueHeal;
      this.player.hp = Math.min(run.stats.maxHp, this.player.hp + run.stats.maxHp * healed);
      const sc = runScale(run);
      this.dropCoins(c.x, c.y, Math.round((RESCUE.rescueCoins + (brave ? RESCUE.braveRescueCoins : 0)) * sc.coin * run.stats.coinMult * run.mods.coinMul));
      this.dropXp(c.x, c.y, RESCUE.rescueXp);
      this.goo.clean(c.x, c.y, 70);
      this.emit({ t: "clean", x: c.x, y: c.y, r: 80 });
      this.emit({ t: "rescue", species: c.species, x: c.x, y: c.y, brave, first });
    }
    processKills() {
      let guard = 0;
      while (this.killQueue.length && guard++ < 200) {
        const m = this.killQueue.shift();
        this.onKilled(m);
      }
    }
    onKilled(m) {
      const run = this.run;
      const s = run.stats;
      const sc = runScale(run);
      run.washed++;
      this.combo = this.comboTimer > 0 ? this.combo + 1 : 1;
      this.comboTimer = 2.2;
      run.bestCombo = Math.max(run.bestCombo, this.combo);
      const r = m.r;
      this.emit({ t: "burst", x: m.x, y: m.y, r, kind: m.kind, boss: m.boss, combo: this.combo });
      const br = s.burstRadius * (m.r > 40 ? 1.3 : 1);
      for (const o of this.monsters) {
        if (!o.alive || o === m || o.rise > 0) continue;
        const d = Math.hypot(o.x - m.x, o.y - m.y) - o.r;
        if (d < br) this.damageMonster(o, s.dps * s.burstDmg);
      }
      const cr = s.burstClean * (m.r > 40 ? 1.5 : 1) * (m.boss ? 2 : 1);
      this.cleanedCells += this.goo.clean(m.x, m.y, cr);
      this.emit({ t: "clean", x: m.x, y: m.y, r: cr * 1.1 });
      const base = MONSTERS[m.kind];
      const coinBonus = this.combo >= 3 ? 1 : 0;
      this.dropCoins(m.x, m.y, Math.max(1, Math.round((base.coins + coinBonus) * sc.coin * s.coinMult * run.mods.coinMul)));
      this.dropXp(m.x, m.y, base.xp);
      if (this.rng.chance(REWARDS.healDropChance) && !m.parent) this.pickups.push(this.makePickup("heal", m.x, m.y, REWARDS.healDropAmount));
      if (m.kind === "splitter") {
        this.emit({ t: "split", x: m.x, y: m.y });
        for (const sgn of [-1, 1]) {
          const c = this.spawnMonster("mini", m.x + sgn * 20, m.y, 0.18, m.wave, m.id);
          c.vx = sgn * 220;
          c.vy = -60;
        }
      }
    }
    makePickup(kind, x, y, value) {
      const a = this.rng.range(0, TAU), sp = this.rng.range(90, 220);
      return { kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, value, magnet: false, age: 0, alive: true };
    }
    dropCoins(x, y, total) {
      const n = Math.min(6, Math.max(1, Math.ceil(total / 3)));
      let left = total;
      for (let i = 0; i < n; i++) {
        const v = i === n - 1 ? left : Math.floor(total / n);
        left -= v;
        if (v > 0) this.pickups.push(this.makePickup("coin", x, y, v));
      }
    }
    dropXp(x, y, total) {
      const n = Math.min(5, Math.max(1, Math.round(total)));
      for (let i = 0; i < n; i++) this.pickups.push(this.makePickup("xp", x, y, total / n));
    }
    // ---------------------------------------------------------------- monsters
    updateMonsters(dt) {
      const p = this.player;
      for (const m of this.monsters) {
        if (!m.alive) continue;
        m.hitTime += dt;
        if (m.rise > 0) {
          m.rise -= dt;
          continue;
        }
        switch (m.kind) {
          case "blob":
          case "mini":
            this.hopChase(m, dt);
            break;
          case "splitter":
            this.walkChase(m, dt, 1);
            break;
          case "spitter":
            this.spitter(m, dt);
            break;
          case "dasher":
            this.dasher(m, dt);
            break;
          case "chunky":
            this.chunky(m, dt);
            break;
          case "nest":
            this.nest(m, dt);
            break;
          case "jumper":
            this.jumper(m, dt);
            break;
          case "flyer":
            this.flyer(m, dt);
            break;
          case "boss":
            this.boss(m, dt);
            break;
        }
        const slow = m.hitTime < 0.1 && !m.boss ? 0.55 : 1;
        m.x += m.vx * dt * slow;
        m.y += m.vy * dt * slow;
        if (!(m.kind === "jumper" && m.state === 2) && !(m.boss && m.state === 3)) this.world.resolve(m, m.r * 0.9, !m.airborne, m.airborne);
        if (this.state === "fight" && !(m.kind === "jumper" && m.state === 2) && !(m.boss && m.state === 3)) {
          const rr = m.r * this.scaleOf(m) * 0.85 + p.r;
          const dx = p.x - m.x, dy = p.y - m.y;
          if (dx * dx + dy * dy < rr * rr) this.hurtPlayer(m.contact, m.kind, m.x, m.y);
        }
      }
      const ms = this.monsters;
      for (let i = 0; i < ms.length; i++) {
        const a = ms[i];
        if (!a.alive || a.rise > 0) continue;
        const fa = a.boss || a.kind === "nest";
        for (let j = i + 1; j < ms.length; j++) {
          const b = ms[j];
          if (!b.alive || b.rise > 0) continue;
          const fb = b.boss || b.kind === "nest";
          if (fa && fb) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const rr = (a.r + b.r) * 0.8;
          const d2 = dx * dx + dy * dy;
          if (d2 < rr * rr && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const push = rr - d;
            const ka = fa ? 0 : fb ? 1 : 0.5, kb = 1 - ka;
            a.x -= dx / d * push * ka;
            a.y -= dy / d * push * ka;
            b.x += dx / d * push * kb;
            b.y += dy / d * push * kb;
          }
        }
      }
    }
    seekDir(m) {
      const p = this.player;
      const o = this.tmp;
      const dx = p.x - m.x, dy = p.y - m.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 140 || m.airborne || this.world.lineOfSight(m.x, m.y, p.x, p.y)) {
        o.x = dx / d;
        o.y = dy / d;
        return o;
      }
      if (!this.nav.dir(m.x, m.y, o)) {
        o.x = dx / d;
        o.y = dy / d;
      }
      return o;
    }
    hopChase(m, dt) {
      m.timer -= dt;
      if (m.state === 0) {
        m.vx *= 0.8;
        m.vy *= 0.8;
        if (m.timer <= 0) {
          m.state = 1;
          m.timer = MONSTER_RULES.hopMove;
        }
      } else {
        const dir = this.seekDir(m);
        const sp = m.speed * 1.75;
        m.vx = dir.x * sp;
        m.vy = dir.y * sp;
        if (m.timer <= 0) {
          m.state = 0;
          m.timer = MONSTER_RULES.hopRest * this.rng.range(0.8, 1.3);
        }
      }
    }
    walkChase(m, dt, mul) {
      const dir = this.seekDir(m);
      m.vx += (dir.x * m.speed * mul - m.vx) * Math.min(1, dt * 4);
      m.vy += (dir.y * m.speed * mul - m.vy) * Math.min(1, dt * 4);
    }
    fireBullet(m, ang, speedMul = 1) {
      const base = MONSTERS[m.kind];
      const sc = runScale(this.run);
      const sp = (base.bulletSpeed ?? 200) * speedMul * this.run.mods.bulletSpeed * sc.bullet;
      const r = base.bulletR ?? 13;
      this.bullets.push({
        x: m.x + Math.cos(ang) * (m.r * 0.8),
        y: m.y + Math.sin(ang) * (m.r * 0.8) - 6,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        r,
        dmg: (base.bulletDmg ?? 12) * sc.dmg * this.run.mods.monsterDmg,
        life: 6,
        src: m.kind,
        alive: true
      });
    }
    aimAt(m) {
      return Math.atan2(this.player.y - m.y, this.player.x - m.x);
    }
    spitter(m, dt) {
      const p = this.player;
      const base = MONSTERS.spitter;
      const d = Math.hypot(p.x - m.x, p.y - m.y);
      if (m.state === 0) {
        let want = 0;
        if (d < 210) want = -1;
        else if (d > 400) want = 1;
        const dir = want === 1 ? this.seekDir(m) : { x: (p.x - m.x) / (d || 1), y: (p.y - m.y) / (d || 1) };
        m.vx += (dir.x * m.speed * want - m.vx) * Math.min(1, dt * 3);
        m.vy += (dir.y * m.speed * want - m.vy) * Math.min(1, dt * 3);
        m.cd -= dt;
        if (m.cd <= 0 && d < 560 && this.world.lineOfSight(m.x, m.y, p.x, p.y) && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          m.vx = 0;
          m.vy = 0;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else if (m.state === 1) {
        m.vx = 0;
        m.vy = 0;
        m.timer -= dt;
        if (m.timer <= 0) {
          const a = this.aimAt(m);
          if (m.variant === 1) {
            this.fireBullet(m, a - 0.26);
            this.fireBullet(m, a);
            this.fireBullet(m, a + 0.26);
          } else this.fireBullet(m, a);
          this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
          m.state = 0;
          m.cd = base.cooldown * this.rng.range(0.85, 1.15) / runScale(this.run).tempo;
        }
      }
    }
    dasher(m, dt) {
      const p = this.player;
      const base = MONSTERS.dasher;
      const d = Math.hypot(p.x - m.x, p.y - m.y);
      if (m.state === 0) {
        this.walkChase(m, dt, 1);
        m.cd -= dt;
        if (m.cd <= 0 && d < 380 && this.world.lineOfSight(m.x, m.y, p.x, p.y) && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          const a = this.aimAt(m);
          m.tx = Math.cos(a);
          m.ty = Math.sin(a);
          this.marks.push({ kind: "dash", x: m.x, y: m.y, x2: m.x + m.tx * MONSTER_RULES.dashSpeed * MONSTER_RULES.dashTime, y2: m.y + m.ty * MONSTER_RULES.dashSpeed * MONSTER_RULES.dashTime, t: base.telegraph, r: m.r });
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else if (m.state === 1) {
        m.vx *= 0.7;
        m.vy *= 0.7;
        m.timer -= dt;
        if (m.timer <= 0) {
          m.state = 2;
          m.timer = MONSTER_RULES.dashTime;
          this.emit({ t: "dash", id: m.id });
        }
      } else if (m.state === 2) {
        m.vx = m.tx * MONSTER_RULES.dashSpeed * this.run.mods.monsterSpeed;
        m.vy = m.ty * MONSTER_RULES.dashSpeed * this.run.mods.monsterSpeed;
        m.timer -= dt;
        const nx = m.x + m.vx * dt, ny = m.y + m.vy * dt;
        if (m.timer <= 0 || this.world.overlapsSolid(nx, ny, m.r * 0.9, true)) {
          m.state = 3;
          m.timer = base.cooldown;
          m.vx *= 0.2;
          m.vy *= 0.2;
        }
      } else {
        m.vx *= 0.85;
        m.vy *= 0.85;
        m.timer -= dt;
        if (m.timer <= 0) {
          m.state = 0;
          m.cd = 0.6 + this.rng.range(0, 0.6);
        }
      }
    }
    chunky(m, dt) {
      const base = MONSTERS.chunky;
      if (m.state === 0) {
        this.walkChase(m, dt, 1);
        m.cd -= dt;
        if (m.cd <= 0 && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else {
        m.vx *= 0.8;
        m.vy *= 0.8;
        m.timer -= dt;
        if (m.timer <= 0) {
          const n = m.variant === 1 ? 12 : MONSTER_RULES.chunkyRing;
          const off = this.rng.range(0, TAU);
          for (let i = 0; i < n; i++) this.fireBullet(m, off + i / n * TAU, 0.9);
          this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
          m.state = 0;
          m.cd = base.cooldown * this.rng.range(0.9, 1.1) / runScale(this.run).tempo;
        }
      }
    }
    nest(m, dt) {
      const base = MONSTERS.nest;
      m.vx = 0;
      m.vy = 0;
      const children = this.monsters.filter((o) => o.alive && o.parent === m.id).length;
      if (m.state === 0) {
        m.cd -= dt;
        if (m.cd <= 0 && children < MONSTER_RULES.nestMaxChildren && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else {
        m.timer -= dt;
        if (m.timer <= 0) {
          const a = this.rng.range(0, TAU);
          const x = clamp(m.x + Math.cos(a) * (m.r + 30), 80, ROOM.width - 80), y = clamp(m.y + Math.sin(a) * (m.r + 30), 80, ROOM.height - 80);
          this.spawnMonster("blob", x, y, 0.35, m.wave, m.id);
          this.emit({ t: "spawn", id: m.id, kind: "blob" });
          m.state = 0;
          m.cd = base.cooldown;
        }
      }
    }
    jumper(m, dt) {
      const p = this.player;
      const base = MONSTERS.jumper;
      if (m.state === 0) {
        this.walkChase(m, dt, 1);
        m.cd -= dt;
        const d = Math.hypot(p.x - m.x, p.y - m.y);
        if (m.cd <= 0 && d < 460 && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph;
          m.tx = p.x;
          m.ty = p.y;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else if (m.state === 1) {
        m.vx = 0;
        m.vy = 0;
        m.timer -= dt;
        if (m.timer <= 0) {
          m.tx = clamp(p.x, ROOM.wall + m.r, ROOM.width - ROOM.wall - m.r);
          m.ty = clamp(p.y, ROOM.wall + m.r, ROOM.height - ROOM.wall - m.r);
          m.state = 2;
          m.timer = MONSTER_RULES.jumpTime;
          m.sx = m.x;
          m.sy = m.y;
          this.marks.push({ kind: "land", x: m.tx, y: m.ty, t: MONSTER_RULES.jumpTime, r: MONSTER_RULES.jumpShock });
        }
      } else if (m.state === 2) {
        m.timer -= dt;
        const mm = m;
        const k = 1 - Math.max(0, m.timer) / MONSTER_RULES.jumpTime;
        m.vx = 0;
        m.vy = 0;
        m.x = mm.sx + (m.tx - mm.sx) * k;
        m.y = mm.sy + (m.ty - mm.sy) * k;
        if (m.timer <= 0) {
          m.state = 3;
          m.timer = 0.5;
          this.world.resolve(m, m.r * 0.9, true);
          this.emit({ t: "land", x: m.x, y: m.y, r: MONSTER_RULES.jumpShock });
          const d = Math.hypot(p.x - m.x, p.y - m.y);
          if (d < MONSTER_RULES.jumpShock + p.r && this.state === "fight") this.hurtPlayer(base.bulletDmg * runScale(this.run).dmg * this.run.mods.monsterDmg, "jumper", m.x, m.y);
        }
      } else {
        m.timer -= dt;
        m.vx = 0;
        m.vy = 0;
        if (m.timer <= 0) {
          m.state = 0;
          m.cd = base.cooldown * this.rng.range(0.85, 1.2) / runScale(this.run).tempo;
        }
      }
    }
    flyer(m, dt) {
      const p = this.player;
      const base = MONSTERS.flyer;
      m.timer += dt;
      const dx = p.x - m.x, dy = p.y - m.y;
      const d = Math.hypot(dx, dy) || 1;
      const want = d > 170 ? 1 : -0.4;
      const perpX = -dy / d, perpY = dx / d;
      const wob = Math.sin(m.timer * 2.6 + m.id) * 0.9;
      m.vx += (dx / d * want * m.speed + perpX * wob * m.speed - m.vx) * Math.min(1, dt * 2.5);
      m.vy += (dy / d * want * m.speed + perpY * wob * m.speed - m.vy) * Math.min(1, dt * 2.5);
      m.cd -= dt;
      if (m.cd <= 0 && this.state === "fight" && d < 480) {
        this.fireBullet(m, this.aimAt(m), 1);
        this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
        m.cd = base.cooldown * this.rng.range(0.8, 1.2) / runScale(this.run).tempo;
      }
    }
    boss(m, dt) {
      const p = this.player;
      const base = MONSTERS.boss;
      const fast = m.phase === 1 ? 0.7 : 1;
      if (m.state === 0) {
        this.walkChase(m, dt, 0.8);
        m.cd -= dt;
        if (m.cd <= 0 && this.state === "fight") {
          m.state = 1;
          m.timer = base.telegraph * fast;
          m.pattern = (m.pattern + 1) % 4;
          m.tx = p.x;
          m.ty = p.y;
          this.emit({ t: "telegraph", id: m.id, kind: m.kind });
        }
      } else if (m.state === 1) {
        m.vx *= 0.8;
        m.vy *= 0.8;
        m.timer -= dt;
        if (m.timer <= 0) {
          const pat = m.pattern;
          if (pat === 0) {
            m.state = 2;
            m.timer = 0.9;
            m.k = 0;
          } else if (pat === 1) {
            const minions = this.monsters.filter((o) => o.alive && o.parent === m.id).length;
            const n = Math.min(3, 6 - minions);
            for (let i = 0; i < n; i++) {
              const a = i / 3 * TAU + this.rng.range(0, 1);
              this.spawnMonster(m.phase ? "splitter" : "blob", clamp(m.x + Math.cos(a) * 110, 90, ROOM.width - 90), clamp(m.y + Math.sin(a) * 110, 90, ROOM.height - 90), 0.4, m.wave, m.id);
            }
            this.emit({ t: "spawn", id: m.id, kind: "blob" });
            m.state = 0;
            m.cd = base.cooldown * fast;
          } else if (pat === 2) {
            m.state = 3;
            m.timer = 0.85;
            m.tx = clamp(p.x, 130, ROOM.width - 130);
            m.ty = clamp(p.y, 130, ROOM.height - 130);
            m.sx = m.x;
            m.sy = m.y;
            this.marks.push({ kind: "land", x: m.tx, y: m.ty, t: 0.85, r: 120 });
          } else {
            m.state = 4;
            m.timer = 0;
            m.k = 0;
          }
        }
      } else if (m.state === 2) {
        const mm = m;
        m.timer -= dt;
        m.vx = 0;
        m.vy = 0;
        const shotsDone = mm.k;
        const due = Math.floor((0.9 - m.timer) / 0.3) + 1;
        if (shotsDone < Math.min(3, due)) {
          const n = m.phase ? 14 : 11;
          const off = shotsDone * 0.22;
          for (let i = 0; i < n; i++) this.fireBullet(m, off + i / n * TAU, 0.85);
          mm.k++;
          this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
        }
        if (m.timer <= 0) {
          m.state = 0;
          m.cd = base.cooldown * fast;
        }
      } else if (m.state === 3) {
        const mm = m;
        m.timer -= dt;
        const k = 1 - Math.max(0, m.timer) / 0.85;
        m.x = mm.sx + (m.tx - mm.sx) * k;
        m.y = mm.sy + (m.ty - mm.sy) * k;
        m.vx = 0;
        m.vy = 0;
        if (m.timer <= 0) {
          this.world.resolve(m, m.r * 0.9, true);
          this.emit({ t: "land", x: m.x, y: m.y, r: 120 });
          if (Math.hypot(p.x - m.x, p.y - m.y) < 120 + p.r && this.state === "fight") this.hurtPlayer(base.contact * runScale(this.run).dmg * this.run.mods.monsterDmg, "boss", m.x, m.y);
          const n = m.phase ? 12 : 8;
          for (let i = 0; i < n; i++) this.fireBullet(m, i / n * TAU + 0.2, 0.75);
          m.state = 0;
          m.cd = base.cooldown * fast;
        }
      } else if (m.state === 4) {
        const mm = m;
        m.vx = 0;
        m.vy = 0;
        m.timer -= dt;
        if (m.timer <= 0) {
          const a = this.aimAt(m);
          this.fireBullet(m, a - 0.22, 1.1);
          this.fireBullet(m, a, 1.1);
          this.fireBullet(m, a + 0.22, 1.1);
          this.emit({ t: "spit", x: m.x, y: m.y, kind: m.kind });
          mm.k++;
          m.timer = 0.55;
          if (mm.k >= (m.phase ? 4 : 3)) {
            m.state = 0;
            m.cd = base.cooldown * fast;
          }
        }
      }
    }
    // ---------------------------------------------------------------- bullets
    updateBullets(dt) {
      const p = this.player;
      for (const b of this.bullets) {
        if (!b.alive) continue;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        if (b.life <= 0) {
          b.alive = false;
          continue;
        }
        if (b.x < ROOM.wall - 10 || b.x > ROOM.width - ROOM.wall + 10 || b.y < ROOM.wall - 10 || b.y > ROOM.height - ROOM.wall + 10) {
          b.alive = false;
          continue;
        }
        for (const c of this.world.colliders) {
          if (!c.blocksShots) continue;
          if (c.kind === "circle") {
            const dx2 = b.x - c.x, dy2 = b.y - c.y;
            if (dx2 * dx2 + dy2 * dy2 < c.r * 0.8 * (c.r * 0.8)) {
              b.alive = false;
              break;
            }
          } else if (Math.abs(b.x - c.x) < c.w / 2 && Math.abs(b.y - c.y) < c.h / 2) {
            b.alive = false;
            break;
          }
        }
        if (!b.alive) continue;
        const rr = b.r * 0.8 + p.r * 0.85;
        const dx = b.x - p.x, dy = b.y - (p.y - 6);
        if (dx * dx + dy * dy < rr * rr && this.state === "fight") {
          if (p.invuln <= 0) {
            b.alive = false;
            this.hurtPlayer(b.dmg, b.src, b.x - b.vx * 0.05, b.y - b.vy * 0.05);
          }
        }
      }
      if (this.bullets.length > 64) this.bullets = this.bullets.filter((b) => b.alive);
    }
    // ---------------------------------------------------------------- trail bubbles
    updateTrail(dt) {
      if (!this.bubbles.length) return;
      const s = this.run.stats;
      for (const b of this.bubbles) {
        if (!b.alive) continue;
        b.life -= dt;
        if (b.life <= 0) {
          b.alive = false;
          continue;
        }
        for (const m of this.monsters) {
          if (!m.alive || m.rise > 0 || m.airborne) continue;
          if (Math.hypot(m.x - b.x, m.y - b.y) < m.r + 12) {
            b.alive = false;
            for (const o of this.monsters) {
              if (o.alive && o.rise <= 0 && Math.hypot(o.x - b.x, o.y - b.y) < SKILL_VALUES.trailRadius + o.r)
                this.damageMonster(o, s.dps * SKILL_VALUES.trailDmg * s.trail);
            }
            this.goo.clean(b.x, b.y, 40);
            this.emit({ t: "trailPop", x: b.x, y: b.y });
            this.emit({ t: "clean", x: b.x, y: b.y, r: 44 });
            break;
          }
        }
      }
      this.processKills();
      if (this.bubbles.length > 40) this.bubbles = this.bubbles.filter((b) => b.alive);
    }
    // ---------------------------------------------------------------- pickups
    updatePickups(dt) {
      const p = this.player;
      const s = this.run.stats;
      const allMagnet = this.state === "clear" || this.state === "done";
      for (const k of this.pickups) {
        if (!k.alive) continue;
        k.age += dt;
        const dx = p.x - k.x, dy = p.y - 8 - k.y;
        const d = Math.hypot(dx, dy) || 1;
        if (!k.magnet && k.age > 0.45 && (d < s.pickupRadius || allMagnet && k.age > 0.5)) k.magnet = true;
        if (k.magnet && this.state !== "dead") {
          const sp = Math.min(1100, 260 + k.age * 900);
          k.vx = dx / d * sp;
          k.vy = dy / d * sp;
          if (d < p.r + 12) {
            this.collect(k);
            continue;
          }
        } else {
          const f = Math.max(0, 1 - dt * 4.5);
          k.vx *= f;
          k.vy *= f;
        }
        k.x += k.vx * dt;
        k.y += k.vy * dt;
        if (!k.magnet) {
          k.x = clamp(k.x, ROOM.wall + 10, ROOM.width - ROOM.wall - 10);
          k.y = clamp(k.y, ROOM.wall + 10, ROOM.height - ROOM.wall - 10);
        }
      }
      if (this.pickups.length > 80) this.pickups = this.pickups.filter((k) => k.alive);
    }
    collect(k) {
      k.alive = false;
      const run = this.run;
      if (k.kind === "coin") run.coins += k.value;
      else if (k.kind === "xp") addXp(run, k.value);
      else if (k.kind === "heal") this.player.hp = Math.min(run.stats.maxHp, this.player.hp + run.stats.maxHp * k.value);
      this.emit({ t: "pickup", kind: k.kind, value: k.value, x: k.x, y: k.y });
    }
    pickupsLeft() {
      let n = 0;
      for (const k of this.pickups) if (k.alive) n++;
      return n;
    }
    // ---------------------------------------------------------------- followers
    updateFollowers(dt) {
      const p = this.player;
      const pts = this.trailPts;
      const n = pts.length / 2;
      for (const f of this.followers) {
        if (f.joy > 0) {
          f.joy -= dt;
          continue;
        }
        const back = Math.min(n - 1, (f.idx + 1) * 7);
        let tx = pts[(n - 1 - back) * 2], ty = pts[(n - 1 - back) * 2 + 1];
        if (!p.moving) {
          const a = Math.PI / 2 + (f.idx % 2 ? 1 : -1) * (0.9 + Math.floor(f.idx / 2) * 0.45);
          const rr = 46 + Math.floor(f.idx / 2) * 14;
          const gx = p.x + Math.cos(a) * rr, gy = p.y + Math.sin(a) * rr * 0.8;
          const mix = Math.min(1, p.stillTime * 1.5);
          tx = tx + (gx - tx) * mix;
          ty = ty + (gy - ty) * mix;
        }
        const dx = tx - f.x, dy = ty - f.y;
        const d = Math.hypot(dx, dy);
        const sp = Math.min(d * 7, 480);
        if (d > 2) {
          f.x += dx / d * sp * dt;
          f.y += dy / d * sp * dt;
        }
        f.moving = sp > 30;
        if (Math.abs(dx) > 3) f.facing = dx > 0 ? 1 : -1;
        if (p.firing && !f.moving) f.cheer += dt;
        else f.cheer = 0;
      }
    }
    // ---------------------------------------------------------------- telegraph marks
    updateMarks(dt) {
      for (const k of this.marks) k.t -= dt;
      if (this.marks.length) this.marks = this.marks.filter((k) => k.t > 0);
    }
    // ---------------------------------------------------------------- room flow
    updateFlow(dt) {
      if (this.state === "fight") {
        if (this.aliveCount() === 0) {
          if (this.wave < this.maxWave) {
            if (this.waveTimer < 0) {
              this.waveTimer = MONSTER_RULES.waveDelay;
              for (const mp of this.def.monsters) if ((mp.w ?? 0) === this.wave + 1) {
                this.marks.push({ kind: "spawn", x: mp.x, y: mp.y, t: MONSTER_RULES.waveDelay + MONSTER_RULES.spawnRise, r: MONSTERS[mp.t].r });
                this.emit({ t: "spawnMark", x: mp.x, y: mp.y, delay: MONSTER_RULES.waveDelay });
              }
            }
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) {
              this.wave++;
              this.waveTimer = -1;
              this.spawnWave(this.wave);
            }
          } else {
            this.state = "clear";
            this.stateTime = 0;
            this.run.roomsCleared++;
            for (const b of this.bullets) b.alive = false;
            this.emit({ t: "roomClear" });
            this.emit({ t: "cleanWave", x: this.player.x, y: this.player.y });
            this.goo.clearAll();
            this.run.cleanSum += 1;
            for (const c of this.cocoons) if (!c.freed) c.hp = Math.min(c.hp, c.maxHp * 0.3);
          }
        }
      } else if (this.state === "clear") {
        if (!this.gateOpen && this.stateTime > 0.7) {
          this.gateOpen = true;
          this.emit({ t: "gateOpen" });
        }
      }
    }
    cocoonsLeft() {
      return this.cocoons.filter((c) => !c.freed).length;
    }
  };
  function turnToward(a, b, max) {
    let d = b - a;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    if (Math.abs(d) <= max) return b;
    return a + Math.sign(d) * max;
  }

  // src/game/play.ts
  init_analytics();
  var DT = 1 / 60;
  var PlayScreen = class {
    constructor(o, uiRoot, onDone) {
      this.acc = 0;
      this.paused = "none";
      this.hud = {};
      this.ribbonQ = [];
      this.ribbonBusy = false;
      this.revivesUsed = 0;
      this.lastHp = -1;
      this.lastCoins = -1;
      this.lastXp = -1;
      this.lastFriends = -1;
      this.lastLv = -1;
      this.hintState = { moved: false, fired: false, pressureShown: false, rescueShown: false, gateShown: false, idleTime: 0, rangeShown: 0, rescueTime: 0 };
      this.roomStart = 0;
      this.coinStreak = 0;
      this.coinStreakT = 0;
      this.finished = false;
      this.stageBanner = 0;
      this.introShown = false;
      this.botInput = { mx: 0, my: 0 };
      this.ghostBase = null;
      this.ribbonCur = null;
      this.ribbonTimers = [];
      this.o = o;
      this.onDone = onDone;
      this.run = createRun(o.level, o.meta, { known: o.known, seed: o.seed, mods: o.daily?.mods, revives: o.revives, daily: !!o.daily });
      this.input = getInput();
      this.input.release();
      this.input.joy.everMoved = false;
      this.input.enabled = !o.bot;
      this.bot = o.bot ? new Bot(o.bot, o.seed) : null;
      this.ui = h("div", { class: "play-ui" });
      uiRoot.appendChild(this.ui);
      this.buildHud();
      this.hint = h("div", { class: "hint" });
      this.banner = h("div", { class: "banner" });
      this.fade = h("div", { class: "fade" });
      this.ribbon = h("div", { class: "ribbon" });
      this.ui.append(this.hint, this.banner, this.ribbon, this.fade);
      this.enterRoom(0);
      track("run_start", { stage: o.level.stage, attempt: o.attempt, daily: !!o.daily, assist: o.meta.assist, gunTier: this.run.stats.gunTier });
    }
    // ---------------------------------------------------------------- HUD
    buildHud() {
      const pauseBtn = h("button", { class: "btn-icon hud-pause", "aria-label": t("pause.title"), onclick: once(() => this.openPause()) }, icon("ic_pause", 30));
      const hpFill = h("div", { class: "bar-fill hp" });
      const hpText = h("div", { class: "bar-text" });
      const hp = h("div", { class: "hud-hp" }, icon("ic_heart", 30, "hud-hp-ic"), h("div", { class: "bar" }, hpFill, hpText));
      const coinText = h("span", { class: "num" }, "0");
      const coins = h("div", { class: "hud-coins pill" }, icon("p_coin_0", 26), coinText);
      const xpFill = h("div", { class: "bar-fill xp" });
      const lv = h("div", { class: "hud-lv" }, "Lv 1");
      const xp = h("div", { class: "hud-xp" }, lv, h("div", { class: "bar thin" }, xpFill));
      const rooms = h("div", { class: "hud-rooms" });
      const friends = h("div", { class: "hud-friends" });
      const top = h("div", { class: "hud-top" }, pauseBtn, hp, coins);
      const hud = h("div", { class: "hud" }, top, h("div", { class: "hud-row2" }, xp, rooms), friends);
      this.ui.appendChild(hud);
      Object.assign(this.hud, { hpFill, hpText, coinText, xpFill, lv, rooms, friends, coins, hp, root: hud });
      this.joyEl = h("div", { class: "joy" }, h("div", { class: "joy-knob" }));
      this.ui.appendChild(this.joyEl);
    }
    hudHeight() {
      const r = this.hud.root?.getBoundingClientRect();
      return r ? r.bottom + 4 : 90;
    }
    updateHud() {
      const p = this.sim.player;
      const st = this.run.stats;
      const hp = Math.ceil(p.hp);
      if (hp !== this.lastHp) {
        if (this.lastHp >= 0 && hp < this.lastHp) {
          this.hud.hp.classList.remove("shake");
          void this.hud.hp.offsetWidth;
          this.hud.hp.classList.add("shake");
        }
        this.lastHp = hp;
        this.hud.hpFill.style.width = `${Math.max(0, Math.min(100, p.hp / st.maxHp * 100))}%`;
        this.hud.hpText.textContent = `${num(hp)} / ${num(st.maxHp)}`;
        this.hud.hpFill.classList.toggle("low", p.hp / st.maxHp < 0.3);
      }
      if (this.run.coins !== this.lastCoins) {
        if (this.lastCoins >= 0) {
          this.hud.coins.classList.remove("pop");
          void this.hud.coins.offsetWidth;
          this.hud.coins.classList.add("pop");
        }
        this.lastCoins = this.run.coins;
        this.hud.coinText.textContent = num(this.run.coins);
      }
      const xp = Math.round(xpProgress(this.run) * 100);
      const lvShown = this.run.xpLevel + this.run.pendingLevelUps;
      if (xp !== this.lastXp || lvShown !== this.lastLv) {
        this.lastXp = xp;
        this.lastLv = lvShown;
        this.hud.xpFill.style.width = `${xp}%`;
        this.hud.lv.textContent = t("hud.lv", { n: lvShown });
      }
      if (this.run.rescued.length !== this.lastFriends) {
        this.lastFriends = this.run.rescued.length;
        this.hud.friends.replaceChildren(...this.run.rescued.map((s) => icon(`p_${s}`, 34, "friend")));
      }
    }
    updateRoomDots() {
      const n = this.run.level.rooms.length;
      this.hud.rooms.replaceChildren(...Array.from({ length: n }, (_, i) => h("span", { class: "dot" + (i < this.run.roomIndex ? " done" : i === this.run.roomIndex ? " cur" : "") + (i === n - 1 && this.run.level.boss ? " boss" : "") })));
    }
    // ---------------------------------------------------------------- rooms
    enterRoom(i) {
      this.run.roomIndex = i;
      this.sim = new RoomSim(this.run, i, this.o.seed * 131 + i * 17);
      this.view = new RoomView(this.sim, this.run.level.region, `${this.run.level.id}:${i}`);
      this.layout();
      this.roomStart = this.run.time;
      this.lastHp = -1;
      this.updateRoomDots();
      audio.playMusic(this.run.level.boss && i === this.run.level.rooms.length - 1 ? "bgm_boss" : `bgm_${this.run.level.region}`);
      if (this.o.newMonster && !this.o.tutorial && !this.introShown && this.sim.def.monsters.some((m) => m.t === this.o.newMonster)) {
        this.introShown = true;
        const k = this.o.newMonster;
        setTimeout(() => this.showBanner(t("toast.newMonster"), t(`monster.${k}`), t(`monster.${k}.desc`), `m_${k === "boss" ? "boss_" + this.run.level.region : k === "flyer" ? "flyer" : k}_normal${k === "flyer" ? "_0" : ""}`), 500);
      }
      if (i === 0 && !this.o.tutorial) {
        setTimeout(() => this.showBanner(t(`region.${this.run.level.region}`), this.o.daily ? t("daily.title") : t("stage.short", { n: (this.run.level.stage - 1) % 10 + 1 }), "", null), 150);
      }
    }
    layout() {
      if (!this.view) return;
      const top = this.hudHeight();
      this.view.layout({ viewW: screen.w, viewH: screen.h, top, bottom: Math.max(6, screen.safe.bottom * 0.6) });
    }
    nextRoom() {
      this.paused = "transition";
      audio.loop("spray_loop", false);
      audio.play("whoosh", { vol: 0.7 });
      this.fade.classList.add("on");
      this.run.hp = this.sim.player.hp;
      this.run.shield = this.sim.player.shield;
      setTimeout(() => {
        this.enterRoom(this.run.roomIndex + 1);
        this.fade.classList.remove("on");
        this.paused = "none";
      }, 380);
    }
    // ---------------------------------------------------------------- loop
    frame(dtReal) {
      if (this.finished) return;
      const v = this.view;
      let scale = 1;
      if (v.slowmo > 0) scale = 0.35;
      if (this.paused === "none") {
        this.acc += Math.min(0.1, dtReal) * scale;
        let steps = 0;
        while (this.acc >= DT && steps < 6) {
          this.acc -= DT;
          steps++;
          const input = this.bot ? this.bot.decide(this.sim, DT) : { mx: this.input.joy.mx, my: this.input.joy.my };
          if (this.bot) this.botInput = input;
          this.sim.step(DT, input);
          for (const e of this.sim.drain()) this.onEvent(e);
          if (this.paused !== "none") break;
        }
        this.afterStep();
      }
      v.update(Math.min(0.05, dtReal) * (this.paused === "none" ? scale : this.paused === "cards" || this.paused === "pause" ? 0 : 1));
      v.render(screen.ctx, screen.dpr, screen.w, screen.h);
      this.drawJoystick();
      this.updateHud();
      this.updateHints(dtReal);
      const p = this.sim.player;
      if (p.firing && this.paused === "none") audio.loop("spray_loop", true, 0.32 + p.pressure * 0.25, 0.9 + p.pressure * 0.25);
      else audio.loop("spray_loop", false);
      this.coinStreakT -= dtReal;
      if (this.coinStreakT <= 0) this.coinStreak = 0;
    }
    drawJoystick() {
      const j = this.input.joy;
      if (this.o.ghostThumb && this.bot) {
        const { mx, my } = this.botInput;
        const on = Math.hypot(mx, my) > 0.15 && this.paused === "none";
        if (on && !this.ghostBase) {
          this.ghostBase = [screen.w * 0.6, screen.h * 0.8];
          j.everMoved = true;
        }
        if (!on) this.ghostBase = null;
        if (this.ghostBase) {
          this.joyEl.style.display = "block";
          this.joyEl.classList.add("ghost");
          this.joyEl.style.transform = `translate(${this.ghostBase[0]}px, ${this.ghostBase[1]}px)`;
          this.joyEl.firstChild.style.transform = `translate(${mx * 40}px, ${my * 40}px)`;
        } else this.joyEl.style.display = "none";
        return;
      }
      if (j.active && !this.bot) {
        this.joyEl.style.display = "block";
        this.joyEl.style.transform = `translate(${j.ox}px, ${j.oy}px)`;
        const knob = this.joyEl.firstChild;
        const dx = Math.max(-46, Math.min(46, j.x - j.ox)), dy = Math.max(-46, Math.min(46, j.y - j.oy));
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
      } else this.joyEl.style.display = "none";
      void draw;
    }
    afterStep() {
      const sim = this.sim;
      if (sim.state === "clear" && this.run.pendingLevelUps > 0 && (sim.pickupsLeft() === 0 || sim.stateTime > 1.6) && this.paused === "none" && !(sim.isLast && sim.state === "clear" && false)) {
        if (!sim.isLast) this.showCards();
        else this.run.pendingLevelUps = 0;
      }
      if (sim.state === "dead" && this.paused === "none" && sim.stateTime > 0.9) this.onDeath();
    }
    // ---------------------------------------------------------------- events
    onEvent(e) {
      this.view.onEvent(e);
      const run = this.run;
      switch (e.t) {
        case "hit":
          audio.play("goo_hit", { vol: 0.45, rate: e.kind === "chunky" || e.kind === "boss" ? 0.75 : e.kind === "mini" ? 1.3 : 1 });
          break;
        case "burst": {
          const big = e.r > 40;
          audio.play(big ? "goo_burst_big" : "goo_burst", { vol: 0.9, rate: 1 + Math.min(8, e.combo - 1) * 0.045, vary: 0.04 });
          buzz(big ? "medium" : "light");
          if (e.boss) {
            audio.stinger("stinger_clear");
            buzz("heavy");
          }
          break;
        }
        case "fireStart":
          audio.play("spray_start", { vol: 0.6 });
          if (!this.hintState.fired) {
            this.hintState.fired = true;
            track("tutorial_step", { step: "first_spray", t: Math.round(run.time) });
          }
          break;
        case "pressureFull":
          audio.play("pressure_full", { vol: 0.7 });
          buzz("tick");
          if (this.o.tutorial && !this.hintState.pressureShown) {
            this.hintState.pressureShown = true;
            this.announce(t("toast.pressure"), t("hint.pressure"), "small");
          }
          break;
        case "cocoonHit":
          audio.play("cocoon_hit", { vol: 0.6 });
          break;
        case "rescue": {
          audio.play("rescue", { vol: 1, vary: 0 });
          audio.duckMusic(0.45, 1.6);
          setTimeout(() => audio.play(`chirp_${1 + run.rescued.length % 3}`, { vol: 0.9 }), 350);
          buzz("success");
          const name = t(`species.${e.species}`);
          const cheer = run.rescued.length <= RESCUE.cheerMaxAnimals ? t("toast.cheer", { p: pct(RESCUE.cheerDamagePerAnimal) }) : "";
          this.announce(t("toast.rescued", { name }), [e.brave ? t("toast.brave") : "", cheer].filter(Boolean).join(" \xB7 "), "rescue");
          track("animal_rescue", { species: e.species, stage: run.stage, first: e.first, brave: e.brave });
          if (run.rescued.length === 1 && this.o.tutorial) track("tutorial_step", { step: "first_rescue", t: Math.round(run.time) });
          break;
        }
        case "playerHit":
          audio.play("player_hit", { vol: 0.9 });
          buzz("heavy");
          break;
        case "shieldPop":
          audio.play("shield_pop", { vol: 0.9 });
          buzz("light");
          break;
        case "spit":
          audio.play("enemy_spit", { vol: e.kind === "boss" || e.kind === "chunky" ? 0.8 : 0.5 });
          break;
        case "telegraph":
          if (e.kind === "chunky" || e.kind === "boss" || e.kind === "jumper" || e.kind === "dasher") audio.play("enemy_charge", { vol: 0.5 });
          break;
        case "dash":
          audio.play("enemy_dash", { vol: 0.6 });
          break;
        case "land":
          audio.play("enemy_land", { vol: 0.8 });
          buzz("light");
          break;
        case "split":
          audio.play("goo_split", { vol: 0.6 });
          break;
        case "pickup": {
          if (e.kind === "coin") {
            this.coinStreak++;
            this.coinStreakT = 0.4;
            audio.play("pickup_coin", { vol: 0.45, rate: 1 + Math.min(10, this.coinStreak) * 0.03, vary: 0.02 });
          } else if (e.kind === "xp") audio.play("pickup_xp", { vol: 0.35, rate: 1 + Math.min(12, this.coinStreak) * 0.02 });
          else audio.play("heal", { vol: 0.8 });
          break;
        }
        case "roomClear": {
          audio.play("room_clear", { vol: 0.9 });
          buzz("success");
          this.announce(t("toast.clean"), "", "clean");
          if (!this.sim.hitThisRoom) run.noHitRooms++;
          track("room_clear", { stage: run.stage, room: run.roomIndex, seconds: Math.round(run.time - this.roomStart), hit: this.sim.hitThisRoom });
          if (run.stage === 1 && run.roomIndex === 0 && this.o.tutorial) track("tutorial_step", { step: "first_room", t: Math.round(run.time) });
          break;
        }
        case "gateOpen":
          audio.play("gate_open", { vol: 0.8 });
          break;
        case "exit": {
          if (this.sim.isLast) this.finish("clear");
          else this.nextRoom();
          break;
        }
        case "bossPhase":
          audio.play("boss_roar", { vol: 0.9 });
          this.announce(t("toast.bossPhase"), "", "warn");
          buzz("medium");
          break;
        case "spawnMark":
          break;
        case "trailPop":
          audio.play("shield_pop", { vol: 0.35, rate: 1.4 });
          break;
        case "dead":
          audio.loop("spray_loop", false);
          audio.play("player_hit", { vol: 1, rate: 0.8 });
          buzz("fail");
          break;
        default:
          break;
      }
    }
    // ---------------------------------------------------------------- tutorial hints
    updateHints(dt) {
      const hs = this.hintState;
      const sim = this.sim;
      const p = sim.player;
      if (this.input.joy.everMoved && !hs.moved) {
        hs.moved = true;
        track("tutorial_step", { step: "move", t: Math.round(this.run.time) });
      }
      let text = "";
      let wx = p.x, wy = p.y - 120;
      let showHand = false;
      const human = !this.bot || !!this.o.ghostThumb;
      const tut = this.o.tutorial && human;
      if (tut && !hs.moved && this.paused === "none") {
        text = t("hint.drag");
        showHand = true;
        wy = p.y + 30;
      } else if (tut && hs.moved && !hs.fired && p.moving && sim.state === "fight" && this.run.time > 1.5) {
        text = t("hint.stop");
      } else if (tut && sim.state === "fight" && this.run.roomIndex === 0) {
        const c = sim.cocoons.find((cc) => !cc.freed);
        if (c && c.hp < c.maxHp) hs.rescueShown = true;
        if (c && Math.hypot(c.x - p.x, c.y - p.y) < 380 && !hs.rescueShown && hs.fired) {
          text = t("hint.rescue");
          wx = c.x;
          wy = c.y - 110;
          hs.rescueTime += dt;
          if (hs.rescueTime > 6) hs.rescueShown = true;
        }
      }
      if (!text && sim.state === "fight" && !p.moving && !p.firing && p.stillTime > 1.2 && this.o.firstRuns < 4 && human) {
        text = t("hint.range");
        hs.rangeShown += dt;
      }
      if (!text && sim.gateOpen && sim.state === "clear" && this.o.firstRuns < 3 && human) {
        hs.idleTime += p.moving ? 0 : dt;
        if (hs.idleTime > 2.2 && sim.cocoonsLeft() === 0) {
          text = t("hint.gate");
          wx = ROOM.width / 2;
          wy = ROOM.wall + 150;
        }
      }
      if (text) {
        const [sx, sy] = this.view.worldToScreen(wx, wy);
        if (this.hint.dataset.text !== text) {
          this.hint.dataset.text = text;
          this.hint.replaceChildren(...showHand ? [icon("mk_hand", 54, "hint-hand")] : [], h("span", {}, text));
        }
        this.hint.style.transform = `translate(${Math.round(Math.max(90, Math.min(screen.w - 90, sx)))}px, ${Math.round(Math.max(this.hudHeight() + 30, Math.min(screen.h - 60, sy)))}px) translate(-50%, -50%)`;
        this.hint.classList.add("show");
        this.hint.classList.toggle("with-hand", showHand);
      } else {
        this.hint.classList.remove("show");
        this.hint.dataset.text = "";
      }
    }
    // One big message at a time, in the upper middle of the screen.
    // One ribbon at a time. A rescue or a warning never waits behind a tip: it cuts
    // the tip short (the tip comes back afterwards) and goes ahead of other news.
    announce(title, sub = "", cls = "") {
      const item = { title, sub, cls };
      const urgent = cls === "rescue" || cls === "warn";
      if (urgent && this.ribbonBusy && this.ribbonCur?.cls === "small") {
        for (const id of this.ribbonTimers) clearTimeout(id);
        this.ribbonQ.push(this.ribbonCur);
        this.ribbonQ.unshift(item);
        this.nextRibbon();
        return;
      }
      if (this.ribbonQ.length >= 2) this.ribbonQ.shift();
      if (urgent) {
        const i = this.ribbonQ.findIndex((q) => q.cls !== "rescue" && q.cls !== "warn");
        if (i >= 0) this.ribbonQ.splice(i, 0, item);
        else this.ribbonQ.push(item);
      } else this.ribbonQ.push(item);
      if (!this.ribbonBusy) this.nextRibbon();
    }
    nextRibbon() {
      const it = this.ribbonQ.shift();
      this.ribbonCur = it ?? null;
      if (!it) {
        this.ribbonBusy = false;
        return;
      }
      this.ribbonBusy = true;
      this.ribbon.className = "ribbon " + it.cls;
      this.ribbon.replaceChildren(h("div", { class: "ribbon-title" }, it.title), it.sub ? h("div", { class: "ribbon-sub" }, it.sub) : "");
      void this.ribbon.offsetWidth;
      this.ribbon.classList.add("show");
      this.ribbonTimers = [window.setTimeout(() => this.ribbon.classList.remove("show"), 1150), window.setTimeout(() => this.nextRibbon(), 1400)];
    }
    showBanner(title, sub, desc, sprite) {
      this.banner.replaceChildren(
        ...sprite ? [icon(sprite, 64, "banner-ic")] : [],
        h("div", { class: "banner-txt" }, h("div", { class: "banner-title" }, title), sub ? h("div", { class: "banner-sub" }, sub) : null, desc ? h("div", { class: "banner-desc" }, desc) : null)
      );
      this.banner.classList.remove("show");
      void this.banner.offsetWidth;
      this.banner.classList.add("show");
      clearTimeout(this.stageBanner);
      this.stageBanner = window.setTimeout(() => this.banner.classList.remove("show"), 2600);
    }
    // ---------------------------------------------------------------- level-up cards
    showCards() {
      const choices = rollSkillChoices(this.run);
      if (!choices.length) {
        this.run.pendingLevelUps = 0;
        return;
      }
      this.paused = "cards";
      this.input.release();
      audio.loop("spray_loop", false);
      audio.play("level_up", { vol: 0.9 });
      buzz("medium");
      const lvl = this.run.xpLevel + 1;
      const pick = (id) => {
        if (!ready) return;
        ready = false;
        audio.play("card_pick", { vol: 0.9 });
        this.run.hp = this.sim.player.hp;
        applySkill(this.run, id);
        this.sim.player.hp = this.run.hp;
        if (id === "shield") {
          this.sim.player.shield = true;
        }
        track("skill_pick", { skill: id, options: choices.join(","), level: lvl });
        if (this.o.tutorial && lvl === 2) track("tutorial_step", { step: "first_skill", t: Math.round(this.run.time) });
        const card = body.querySelector(`[data-skill="${id}"]`);
        card?.classList.add("picked");
        setTimeout(() => {
          closeModal("levelup", true);
          this.paused = "none";
          this.lastHp = -1;
        }, 380);
      };
      let ready = false;
      setTimeout(() => ready = true, 350);
      const cards = choices.map((id) => {
        const stacks = this.run.skills[id] || 0;
        const max = SKILLS.find((s) => s.id === id).max;
        const desc = t(`skill.${id}.desc`, id === "shield" ? { s: SKILL_VALUES.shieldRegen[Math.min(2, stacks)] } : void 0);
        return h(
          "button",
          { class: "skill-card", "data-skill": id, onclick: () => pick(id) },
          icon(`ic_skill_${id}`, 64, "skill-ic"),
          h(
            "div",
            { class: "skill-txt" },
            h("div", { class: "skill-name" }, t(`skill.${id}.name`)),
            h("div", { class: "skill-desc" }, desc),
            id !== "heal" ? h("div", { class: "skill-dots" }, ...Array.from({ length: max }, (_, k) => h("span", { class: "sdot" + (k < stacks ? " on" : k === stacks ? " next" : "") }))) : null
          )
        );
      });
      const body = h("div", { class: "levelup" }, h("div", { class: "levelup-sub" }, t("levelup.pick")), ...cards);
      openModal(body, { id: "levelup", title: t("levelup.title"), titleIcon: "p_star", closable: false, cls: "modal-levelup" });
      if (this.bot) setTimeout(() => {
        ready = true;
        pick(this.bot.chooseSkill(choices, this.sim.player.hp / this.run.stats.maxHp));
      }, 900);
      void xpToNext;
    }
    // ---------------------------------------------------------------- pause / revive / end
    openPause() {
      if (this.paused !== "none" || this.finished) return;
      this.paused = "pause";
      this.input.release();
      audio.loop("spray_loop", false);
      const body = h(
        "div",
        { class: "pause" },
        h("button", { class: "btn btn-primary big", onclick: once(() => {
          closeModal("pause");
        }) }, icon("ic_play", 30), t("pause.resume")),
        h("button", { class: "btn btn-plain", onclick: once(() => this.o.onSettings()) }, icon("ic_gear", 28), t("pause.settings")),
        h("div", { class: "pause-note" }, t("pause.quitNote")),
        h("button", { class: "btn btn-warn", onclick: once(() => {
          closeModal("pause", true);
          this.finish("quit");
        }) }, icon("ic_exit", 28), t("pause.quit"))
      );
      openModal(body, { id: "pause", title: t("pause.title"), onClose: () => {
        if (this.paused === "pause") this.paused = "none";
      } });
    }
    // pause when the app goes to the background
    autoPause() {
      if (this.paused === "none" && !this.finished && !this.bot) this.openPause();
    }
    onDeath() {
      if (this.run.revives > 0 && !this.bot) {
        this.paused = "revive";
        const body = h(
          "div",
          { class: "revive" },
          h("div", { class: "revive-art" }, icon("kid_sad_0", 120)),
          h("div", { class: "revive-desc" }, t("revive.desc")),
          h("button", { class: "btn btn-primary big", onclick: once(() => {
            closeModal("revive", true);
            this.doRevive();
          }) }, icon("ic_heart", 30), t("revive.yes")),
          h("button", { class: "btn btn-plain", onclick: once(() => {
            closeModal("revive", true);
            this.finish("fail");
          }) }, t("revive.no"))
        );
        openModal(body, { id: "revive", title: t("revive.title"), closable: false });
      } else if (this.run.revives > 0 && this.bot) {
        this.doRevive();
      } else this.finish("fail");
    }
    doRevive() {
      this.run.revives--;
      this.revivesUsed++;
      this.sim.revive(this.run.stats.reviveHp);
      audio.play("revive", { vol: 1 });
      buzz("success");
      this.view.fx.spawn("fx_ring", this.sim.player.x, this.sim.player.y - 20, { max: 0.6, scale: 0.5, scale1: 3, alpha: 0.9 });
      this.paused = "none";
      track("revive", { stage: this.run.stage, room: this.run.roomIndex });
    }
    finish(result) {
      if (this.finished) return;
      this.finished = true;
      this.paused = "end";
      audio.loop("spray_loop", false);
      this.input.enabled = false;
      this.input.release();
      this.run.hp = this.sim.player.hp;
      refreshStats(this.run);
      const src = Object.entries(this.run.dmgBy).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const out = { run: this.run, result, seconds: Math.round(this.run.time), deathSource: src, revivesUsed: this.revivesUsed, roomsCleared: this.run.roomsCleared };
      track("run_end", { stage: this.run.stage, result, rooms: this.run.roomsCleared, seconds: out.seconds, rescued: this.run.rescued.length, coins: this.run.coins, washed: this.run.washed, hits: this.run.hits, deathSource: src, revivesUsed: this.revivesUsed, level: this.run.xpLevel, daily: this.run.daily });
      this.onDone(out);
    }
    // keep rendering the last frame under the result screen
    renderIdle(dt) {
      this.view.update(dt * 0.5);
      this.view.render(screen.ctx, screen.dpr, screen.w, screen.h);
    }
    destroy() {
      this.input.enabled = false;
      this.ui.remove();
      audio.loop("spray_loop", false);
    }
  };

  // src/app.ts
  init_progress();
  init_save();
  init_analytics();

  // src/ui/home.ts
  init_balance();
  init_progress();
  init_save();

  // src/render/mapView.ts
  init_balance();
  init_quality();
  init_rng();
  var MAP_W = 576;
  var STEP = 124;
  var TOP = 260;
  var BOTTOM = 220;
  var MAP_H = TOP + BOTTOM + (STAGE_COUNT - 1) * STEP + 3 * 140;
  var T2 = 48;
  var CHUNK = 480;
  function regionOf(stage) {
    return stage <= 10 ? "forest" : stage <= 20 ? "village" : "lake";
  }
  function buildNodes() {
    const out = [];
    for (let i = 0; i < STAGE_COUNT; i++) {
      const s = i + 1;
      const reg = Math.floor(i / 10);
      const y = MAP_H - BOTTOM - i * STEP - reg * 140;
      const x = MAP_W / 2 + Math.sin(i * 0.95 + 0.4) * 150 + Math.sin(i * 2.1) * 18;
      out.push({ stage: s, x, y, region: regionOf(s), boss: s % 10 === 0 });
    }
    return out;
  }
  var MapView = class {
    constructor() {
      this.nodes = buildNodes();
      this.scroll = 0;
      // world y at the top of the view
      this.vel = 0;
      this.scale = 1;
      this.viewW = 0;
      this.viewH = 0;
      this.top = 0;
      this.bottom = 0;
      this.time = 0;
      this.fx = new Particles();
      this.chunks = /* @__PURE__ */ new Map();
      this.props = [];
      this.rng = new Rng(4242);
      this.cleared = () => false;
      this.current = 1;
      this.newFriendAt = /* @__PURE__ */ new Set();
      this.washing = null;
      this.gooCache = /* @__PURE__ */ new Map();
      this.regionLabel = (k) => k;
      this.buildProps();
    }
    regionBand(y) {
      const i = this.nodes.findIndex((n2) => n2.y < y + STEP / 2);
      const n = this.nodes[Math.max(0, i)];
      return y > MAP_H - BOTTOM - 9.5 * STEP ? "forest" : y > MAP_H - BOTTOM - 19.5 * STEP - 140 ? n?.region ?? "village" : "lake";
    }
    bandAt(y) {
      const fEnd = this.nodes[9].y - 70, vEnd = this.nodes[19].y - 70;
      return y > fEnd ? "forest" : y > vEnd ? "village" : "lake";
    }
    buildProps() {
      const r = this.rng;
      const nearPath = (x, y) => {
        for (let i = 0; i < this.nodes.length - 1; i++) {
          const a = this.nodes[i], b = this.nodes[i + 1];
          for (let k = 0; k <= 8; k++) {
            const px = a.x + (b.x - a.x) * k / 8, py = a.y + (b.y - a.y) * k / 8;
            if (Math.hypot(px - x, py - y) < 70) return true;
          }
        }
        return false;
      };
      for (let i = 0; i < 260; i++) {
        const x = r.range(-20, MAP_W + 20), y = r.range(40, MAP_H - 20);
        if (nearPath(x, y)) continue;
        const band = this.bandAt(y);
        let name = band === "forest" ? r.pick(["ob_tree", "ob_tree2", "ob_pine", "ob_bush", "ob_tree", "ob_pine"]) : band === "village" ? r.pick(["ob_tree", "ob_bush", "ob_hay", "ob_barrel", "ob_tree2", "ob_bush"]) : r.pick(["ob_reeds", "ob_tree", "ob_shellrock", "ob_bush", "ob_reeds"]);
        if (band === "lake" && this.isLakeWater(x, y)) {
          if (r.chance(0.7)) continue;
          name = "ob_reeds";
        }
        this.props.push({ name, x, y, s: r.range(0.75, 1), flip: r.chance(0.5) });
      }
      const v = this.nodes[14];
      this.props.push({ name: "ob_windmill", x: v.x > MAP_W / 2 ? 110 : MAP_W - 110, y: v.y + 40, s: 0.9, flip: false });
      for (const k of [11, 16, 18]) {
        const n = this.nodes[k];
        this.props.push({ name: k % 2 ? "ob_house" : "ob_house2", x: n.x > MAP_W / 2 ? 96 : MAP_W - 96, y: n.y + 30, s: 0.55, flip: false });
      }
      this.props.sort((a, b) => a.y - b.y);
    }
    isLakeWater(x, y) {
      const top = this.nodes[29].y - 120, bot = this.nodes[20].y + 60;
      if (y < top || y > bot) return false;
      const cy = (top + bot) / 2;
      return Math.hypot((x - MAP_W * 0.5) / 1.1, (y - cy) / 2.6) < 120 && !this.onTrail(x, y);
    }
    onTrail(x, y) {
      for (let i = 0; i < this.nodes.length - 1; i++) {
        const a = this.nodes[i], b = this.nodes[i + 1];
        for (let k = 0; k <= 10; k++) {
          const px = a.x + (b.x - a.x) * k / 10, py = a.y + (b.y - a.y) * k / 10;
          if (Math.hypot(px - x, py - y) < 60) return true;
        }
      }
      return false;
    }
    layout(viewW, viewH, top, bottom) {
      this.viewW = viewW;
      this.viewH = viewH;
      this.top = top;
      this.bottom = bottom;
      this.scale = Math.min(viewW / MAP_W, 1.6);
      this.clampScroll();
    }
    visibleH() {
      return (this.viewH - this.top - this.bottom) / this.scale;
    }
    clampScroll() {
      const max = MAP_H - this.visibleH();
      this.scroll = Math.max(0, Math.min(max, this.scroll));
    }
    focus(stage) {
      const n = this.nodes[Math.max(0, Math.min(this.nodes.length - 1, stage - 1))];
      this.scroll = n.y - this.visibleH() * 0.58;
      this.vel = 0;
      this.clampScroll();
    }
    screenToWorld(sx, sy) {
      const ox = (this.viewW - MAP_W * this.scale) / 2;
      return [(sx - ox) / this.scale, (sy - this.top) / this.scale + this.scroll];
    }
    worldToScreen(x, y) {
      const ox = (this.viewW - MAP_W * this.scale) / 2;
      return [ox + x * this.scale, this.top + (y - this.scroll) * this.scale];
    }
    hitNode(sx, sy) {
      const [x, y] = this.screenToWorld(sx, sy);
      let best = null, bd = 56;
      for (const n of this.nodes) {
        const d = Math.hypot(n.x - x, n.y - 10 - y);
        if (d < bd) {
          bd = d;
          best = n;
        }
      }
      return best;
    }
    // ---------------------------------------------------------------- chunks (static ground + trail)
    chunk(i) {
      let c = this.chunks.get(i);
      if (c) return c;
      const sc = quality().bgScale;
      c = document.createElement("canvas");
      c.width = Math.round(MAP_W * sc);
      c.height = Math.round(CHUNK * sc);
      const g = c.getContext("2d");
      g.scale(sc, sc);
      g.translate(0, -i * CHUNK);
      const y0 = i * CHUNK, y1 = y0 + CHUNK;
      for (let ty = Math.floor(y0 / T2) * T2; ty < y1; ty += T2) for (let tx = 0; tx < MAP_W; tx += T2) {
        const hsh = (tx * 73856093 ^ ty * 19349663) >>> 0;
        const v = hsh % 10;
        const f = frame(`g_${v < 4 ? 0 : v < 7 ? 1 : v < 9 ? 2 : 3}`);
        if (f) g.drawImage(f.img, f.x, f.y, f.w, f.h, tx, ty, T2 + 0.5, T2 + 0.5);
      }
      const cell = (cx, cy) => this.isLakeWater(cx * T2 + T2 / 2, cy * T2 + T2 / 2) ? "w" : ".";
      for (let j = Math.floor(y0 / T2); j <= Math.ceil(y1 / T2); j++) for (let k = 0; k <= MAP_W / T2; k++) {
        let m = 0;
        if (cell(k - 1, j - 1) === "w") m |= 1;
        if (cell(k, j - 1) === "w") m |= 2;
        if (cell(k - 1, j) === "w") m |= 4;
        if (cell(k, j) === "w") m |= 8;
        if (!m) continue;
        const f = frame(`t_water_${m}`);
        if (f) g.drawImage(f.img, f.x, f.y, f.w, f.h, (k - 0.5) * T2, (j - 0.5) * T2, T2 + 0.5, T2 + 0.5);
      }
      g.lineCap = "round";
      g.lineJoin = "round";
      const trail = () => {
        g.beginPath();
        this.nodes.forEach((n, k) => {
          if (k === 0) g.moveTo(n.x, n.y + 120);
          const prev = this.nodes[k - 1];
          if (prev) {
            const mx = (prev.x + n.x) / 2, my = (prev.y + n.y) / 2;
            g.quadraticCurveTo(prev.x + (mx - prev.x) * 0.2, my + 20, n.x, n.y);
          } else g.lineTo(n.x, n.y);
        });
      };
      trail();
      g.strokeStyle = "#b47b47";
      g.lineWidth = 44;
      g.stroke();
      trail();
      g.strokeStyle = "#d9a46a";
      g.lineWidth = 36;
      g.stroke();
      trail();
      g.setLineDash([2, 22]);
      g.strokeStyle = "rgba(255,240,210,0.9)";
      g.lineWidth = 7;
      g.stroke();
      g.setLineDash([]);
      const rr = new Rng(i * 7 + 3);
      for (let k = 0; k < 18; k++) {
        const x = rr.range(0, MAP_W), y = rr.range(y0, y1);
        const f = frame(rr.pick(["d_flower_0", "d_flower_1", "d_flower_2", "d_tuft", "d_clover", "d_pebble_0", "d_tuft"]));
        if (f && !this.isLakeWater(x, y)) drawFrame(g, f, x, y, 0.9);
      }
      this.chunks.set(i, c);
      if (this.chunks.size > 7) {
        const first = this.chunks.keys().next().value;
        if (first !== i) this.chunks.delete(first);
      }
      return c;
    }
    invalidate() {
      this.chunks.clear();
    }
    gooFor(stage) {
      let g = this.gooCache.get(stage);
      if (!g) {
        const n = this.nodes[stage - 1];
        const r = new Rng(stage * 977);
        g = [];
        for (let k = 0; k < 5; k++) {
          const a = r.range(0, 6.28), d = r.range(14, 60);
          g.push([n.x + Math.cos(a) * d, n.y + Math.sin(a) * d * 0.7 + 6, r.range(36, 58), r.int(0, 3)]);
        }
        this.gooCache.set(stage, g);
      }
      return g;
    }
    // ---------------------------------------------------------------- frame
    update(dt) {
      this.time += dt;
      this.fx.update(dt);
      if (Math.abs(this.vel) > 1) {
        this.scroll += this.vel * dt;
        this.vel *= Math.pow(0.04, dt);
        this.clampScroll();
      } else this.vel = 0;
      if (this.washing) {
        this.washing.t += dt;
        const n = this.nodes[this.washing.stage - 1];
        if (this.washing.t < 1.2 && this.fx.count() < 120) {
          const a = this.rng.range(0, 6.28), d = this.rng.range(0, 70);
          this.fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], n.x + Math.cos(a) * d, n.y + Math.sin(a) * d * 0.7, { fps: 10, max: 0.5, scale: 1.2 });
          this.fx.spawn("p_water", n.x + this.rng.range(-50, 50), n.y, { z: 10, vz: this.rng.range(150, 300), vx: this.rng.range(-120, 120), g: 700, max: 0.7 });
        }
        if (this.washing.t > 1.6) this.washing = null;
      }
    }
    render(ctx2, dpr) {
      const s = this.scale;
      const ox = (this.viewW - MAP_W * s) / 2;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2.fillStyle = "#3f7a2a";
      ctx2.fillRect(0, 0, this.viewW, this.viewH);
      ctx2.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * (this.top - this.scroll * s));
      const y0 = this.scroll - 60, y1 = this.scroll + this.visibleH() + (this.bottom + 60) / s;
      for (let i = Math.max(0, Math.floor(y0 / CHUNK)); i <= Math.floor(y1 / CHUNK); i++) {
        if (i * CHUNK > MAP_H) break;
        ctx2.drawImage(this.chunk(i), 0, i * CHUNK, MAP_W, CHUNK);
      }
      for (const n of this.nodes) {
        if (n.y < y0 - 100 || n.y > y1 + 100) continue;
        const done = this.cleared(n.stage);
        let k = done ? 0 : 1;
        if (this.washing && this.washing.stage === n.stage) k = Math.max(0, 1 - this.washing.t / 1);
        if (k <= 0) continue;
        for (const [x, y, r, st] of this.gooFor(n.stage)) {
          const f = frame(`goostamp_${st}`);
          if (f) drawFrame(ctx2, f, x, y, r * 2 * k / 112 * 1.1, false, n.stage, 0.92);
        }
      }
      const items = [];
      for (const p of this.props) if (p.y > y0 - 40 && p.y < y1 + 220) items.push({ y: p.y, f: () => draw(ctx2, p.name, p.x, p.y, p.s, p.flip) });
      for (const n of this.nodes) if (n.y > y0 - 60 && n.y < y1 + 120) items.push({ y: n.y, f: () => this.drawNode(ctx2, n) });
      items.sort((a, b) => a.y - b.y);
      for (const it of items) it.f();
      for (const [stage, key] of [[1, "forest"], [11, "village"], [21, "lake"]]) {
        const n = this.nodes[stage - 1];
        const sy = n.y + 96;
        if (sy < y0 - 80 || sy > y1 + 160) continue;
        const sx = n.x > MAP_W / 2 ? n.x - 150 : n.x + 150;
        draw(ctx2, "mp_sign", sx, sy, 0.62);
        ctx2.save();
        ctx2.font = `22px "Fredoka","Jua",sans-serif`;
        ctx2.textAlign = "center";
        ctx2.textBaseline = "middle";
        ctx2.lineWidth = 4;
        ctx2.strokeStyle = "#6b4a32";
        ctx2.fillStyle = "#fff6e2";
        const label = this.regionLabel(key);
        ctx2.strokeText(label, sx, sy - 57);
        ctx2.fillText(label, sx, sy - 57);
        ctx2.restore();
      }
      this.fx.draw(ctx2, false);
    }
    drawNode(ctx2, n) {
      const done = this.cleared(n.stage);
      const cur = n.stage === this.current;
      const locked = n.stage > this.current && !done;
      const bob = cur ? Math.sin(this.time * 4) * 3 : 0;
      if (cur) {
        ctx2.save();
        ctx2.globalAlpha = 0.45 + Math.sin(this.time * 4) * 0.2;
        ctx2.fillStyle = "#fff6a0";
        ctx2.beginPath();
        ctx2.ellipse(n.x, n.y + 4, 50, 28, 0, 0, Math.PI * 2);
        ctx2.fill();
        ctx2.restore();
      }
      draw(ctx2, n.boss ? "mp_node_boss" : "mp_node", n.x, n.y + 8, 0.9, false, 0, locked ? 0.75 : 1);
      ctx2.save();
      ctx2.font = `${n.boss ? 26 : 23}px "Fredoka","Jua",sans-serif`;
      ctx2.textAlign = "center";
      ctx2.textBaseline = "middle";
      ctx2.lineWidth = 5;
      ctx2.strokeStyle = "#3a2416";
      ctx2.fillStyle = locked ? "#cfd6dc" : "#ffffff";
      const label = String((n.stage - 1) % 10 + 1);
      ctx2.strokeText(label, n.x, n.y - 4);
      ctx2.fillText(label, n.x, n.y - 4);
      ctx2.restore();
      if (n.boss) draw(ctx2, "ic_crown", n.x, n.y - 38, 0.45);
      if (done) draw(ctx2, "mp_flag", n.x + 26, n.y - 2, 0.7);
      if (locked && n.stage === this.current + 1) draw(ctx2, "ic_lock", n.x + 24, n.y - 20, 0.32);
      if (this.newFriendAt.has(n.stage) && !locked) {
        const fy = n.y - 64 + Math.sin(this.time * 3 + n.stage) * 3;
        draw(ctx2, "mk_help", n.x - 30, fy, 0.75);
      }
      if (cur) draw(ctx2, "mk_arrow", n.x, n.y - 70 + bob * 2, 0.6, false, Math.PI);
    }
    // drag scrolling
    drag(dy) {
      this.scroll -= dy / this.scale;
      this.clampScroll();
    }
    fling(vy) {
      this.vel = -vy / this.scale;
    }
    ensureVisible(stage) {
      const n = this.nodes[stage - 1];
      if (n.y < this.scroll + 80 || n.y > this.scroll + this.visibleH() - 80) this.focus(stage);
    }
    regionAt(stage) {
      return regionOf(stage);
    }
    void_() {
      void this.regionBand;
    }
  };

  // src/render/shelterView.ts
  init_balance();
  init_rng();
  var SH_W = 400;
  var T3 = 48;
  var DECOR_POS = {
    ball: [0.32, 0.35],
    cushion: [0.18, 0.08],
    bowl: [0.82, 0.08],
    flowers: [0.16, 0.86],
    pond: [0.78, 0.5],
    treehouse: [0.1, 0.42],
    slide: [0.84, 0.88],
    fountain: [0.5, 0.62]
  };
  var ShelterView = class {
    constructor() {
      this.W = SH_W;
      this.H = 900;
      this.scale = 1;
      this.top = 0;
      this.bottom = 0;
      this.viewW = 0;
      this.viewH = 0;
      this.pets = [];
      this.missing = [];
      this.decor = [];
      this.fx = new Particles();
      this.time = 0;
      this.rng = new Rng(99);
      this.bg = null;
      this.baskets = [];
      this.giftsReady = 0;
    }
    layout(viewW, viewH, top, bottom) {
      this.viewW = viewW;
      this.viewH = viewH;
      this.top = top;
      this.bottom = bottom;
      const availH = viewH - top - bottom;
      this.scale = viewW / SH_W;
      this.H = Math.max(520, Math.round(availH / this.scale));
      this.bg = null;
      this.placeBaskets();
      for (const p of this.pets) {
        p.y = Math.min(p.y, this.yardBottom());
      }
    }
    houseY() {
      return 112;
    }
    basketRows() {
      return Math.ceil(this.missing.length / 6);
    }
    yardTop() {
      return this.houseY() + 30 + this.basketRows() * 50;
    }
    yardBottom() {
      return this.H - 26;
    }
    setData(counts, bondOf, decor) {
      this.decor = decor.slice();
      const want = [];
      for (const s of SPECIES) {
        const n = counts[s.id] || 0;
        if (n > 0) {
          const k = Math.min(3, Math.max(1, bondOf(s.id)));
          for (let i = 0; i < k; i++) want.push(s.id);
        }
      }
      const next = [];
      const pool = this.pets.slice();
      let id = 1;
      for (const sp of want.slice(0, 26)) {
        const i = pool.findIndex((p) => p.sp === sp);
        if (i >= 0) {
          next.push(pool[i]);
          pool.splice(i, 1);
          continue;
        }
        const x = this.rng.range(50, SH_W - 50), y = this.rng.range(this.yardTop() + 20, this.yardBottom());
        next.push({ sp, x, y, tx: x, ty: y, state: "idle", t: this.rng.range(0.5, 3), facing: this.rng.chance(0.5) ? 1 : -1, gift: false, id: id++, target: null });
      }
      next.forEach((p, i) => p.id = i + 1);
      this.pets = next;
      this.missing = SPECIES.filter((s) => !(counts[s.id] || 0)).map((s) => s.id);
      this.placeBaskets();
      this.bg = null;
    }
    arrive(sp) {
      const p = this.pets.find((q) => q.sp === sp);
      if (!p) return;
      p.x = SH_W / 2;
      p.y = this.houseY() + 14;
      p.state = "happy";
      p.t = 1.6;
      p.tx = SH_W / 2 + this.rng.range(-80, 80);
      p.ty = this.yardTop() + 60;
      for (let i = 0; i < 10; i++) this.fx.spawn("p_heart", p.x, p.y - 30, { z: 10, vz: this.rng.range(120, 260), vx: this.rng.range(-120, 120), vy: this.rng.range(-40, 40), g: 250, max: 1.3, drag: 1 });
    }
    placeBaskets() {
      this.baskets = [];
      const n = this.missing.length;
      if (!n) return;
      const perRow = 6;
      const gap = 58;
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / perRow), col = i % perRow;
        const inRow = Math.min(perRow, n - row * perRow);
        const x0 = SH_W / 2 - (inRow - 1) * gap / 2;
        this.baskets.push({ sp: this.missing[i], x: x0 + col * gap, y: this.houseY() + 62 + row * 50 });
      }
    }
    setGifts(n) {
      this.giftsReady = n;
      const k = n <= 0 ? 0 : Math.min(Math.ceil(this.pets.length / 3), 5, Math.max(1, Math.floor(n / 15)));
      this.pets.forEach((p, i) => p.gift = i < k);
    }
    screenToWorld(sx, sy) {
      return [sx / this.scale, (sy - this.top) / this.scale];
    }
    hitPet(sx, sy) {
      const [x, y] = this.screenToWorld(sx, sy);
      let best = null, bd = 44;
      for (const p of this.pets) {
        const d = Math.hypot(p.x - x, p.y - 22 - y);
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
      return best;
    }
    hitBasket(sx, sy) {
      const [x, y] = this.screenToWorld(sx, sy);
      for (const b of this.baskets) if (Math.hypot(b.x - x, b.y - 16 - y) < 34) return b.sp;
      return null;
    }
    poke(p) {
      p.state = "happy";
      p.t = 1;
      for (let i = 0; i < 4; i++) this.fx.spawn("p_heart", p.x, p.y - 40, { vy: -90, vx: this.rng.range(-50, 50), max: 0.8, scale: 0.7 });
    }
    decorSpot(id) {
      const d = DECOR_POS[id];
      return [30 + d[0] * (SH_W - 60), this.yardTop() + (this.yardBottom() - this.yardTop()) * d[1]];
    }
    update(dt) {
      this.time += dt;
      this.fx.update(dt);
      const r = this.rng;
      for (const p of this.pets) {
        p.t -= dt;
        if (p.state === "walk") {
          const dx = p.tx - p.x, dy = p.ty - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 4) {
            p.state = p.target === "cushion" || p.target === "treehouse" ? "sleep" : p.target === "ball" || p.target === "slide" ? "play" : "idle";
            p.t = r.range(2, 6);
          } else {
            const sp = 40;
            p.x += dx / d * sp * dt;
            p.y += dy / d * sp * dt;
            if (Math.abs(dx) > 2) p.facing = dx > 0 ? 1 : -1;
          }
        } else if (p.t <= 0) {
          const roll = r.next();
          const owned = this.decor.filter((d) => DECOR_POS[d]);
          if (owned.length && roll < 0.35) {
            const d = r.pick(owned);
            const [x, y] = this.decorSpot(d);
            p.tx = x + r.range(-40, 40);
            p.ty = y + r.range(4, 30);
            p.target = d;
            p.state = "walk";
          } else if (roll < 0.75) {
            p.tx = r.range(40, SH_W - 40);
            p.ty = r.range(this.yardTop() + 20, this.yardBottom());
            p.target = null;
            p.state = "walk";
          } else if (roll < 0.88) {
            p.state = "sleep";
            p.t = r.range(3, 7);
          } else {
            p.state = "idle";
            p.t = r.range(1.5, 4);
          }
        }
      }
    }
    buildBg() {
      const sc = Math.min(2, this.scale * 2);
      const c = document.createElement("canvas");
      c.width = Math.round(SH_W * sc);
      c.height = Math.round(this.H * sc);
      const g = c.getContext("2d");
      g.scale(sc, sc);
      for (let y = 0; y < this.H; y += T3) for (let x = 0; x < SH_W; x += T3) {
        const h2 = (x * 73856093 ^ y * 19349663) >>> 0;
        const v = h2 % 10;
        const f = frame(`g_${v < 4 ? 0 : v < 7 ? 1 : v < 9 ? 2 : 3}`);
        if (f) g.drawImage(f.img, f.x, f.y, f.w, f.h, x, y, T3 + 0.5, T3 + 0.5);
      }
      g.lineCap = "round";
      g.strokeStyle = "#b47b47";
      g.lineWidth = 46;
      g.beginPath();
      g.moveTo(SH_W / 2, this.houseY());
      g.quadraticCurveTo(SH_W / 2 - 40, this.H * 0.6, SH_W / 2, this.H + 40);
      g.stroke();
      g.strokeStyle = "#d9a46a";
      g.lineWidth = 38;
      g.stroke();
      const rr = new Rng(5);
      for (let i = 0; i < 34; i++) {
        const f = frame(rr.pick(["d_flower_0", "d_flower_1", "d_flower_2", "d_flower_3", "d_tuft", "d_clover", "d_tuft"]));
        if (f) drawFrame(g, f, rr.range(16, SH_W - 16), rr.range(this.houseY() + 20, this.H - 10), 1);
      }
      const vg = g.createRadialGradient(SH_W / 2, this.H * 0.55, this.H * 0.3, SH_W / 2, this.H * 0.55, this.H * 0.85);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(20,50,10,0.25)");
      g.fillStyle = vg;
      g.fillRect(0, 0, SH_W, this.H);
      return c;
    }
    render(ctx2, dpr) {
      if (!this.bg) this.bg = this.buildBg();
      const s = this.scale;
      ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2.fillStyle = "#3f7a2a";
      ctx2.fillRect(0, 0, this.viewW, this.viewH);
      ctx2.setTransform(dpr * s, 0, 0, dpr * s, 0, dpr * this.top);
      ctx2.drawImage(this.bg, 0, 0, SH_W, this.H);
      const items = [];
      for (const [x, y, n] of [[30, 96, "ob_tree"], [372, 92, "ob_tree2"], [86, 70, "ob_pine"], [318, 66, "ob_pine"]]) items.push({ y, f: () => draw(ctx2, n, x, y, 0.75) });
      items.push({ y: this.houseY(), f: () => draw(ctx2, "sh_house", SH_W / 2, this.houseY(), 0.55) });
      for (let y = this.houseY() + 40; y < this.H + 100; y += 140) {
        items.push({ y: y + 140, f: () => {
          draw(ctx2, "ob_fencev", 8, y + 140, 0.7);
          draw(ctx2, "ob_fencev", SH_W - 8, y + 140, 0.7);
        } });
      }
      for (const d of this.decor) {
        if (!DECOR_POS[d]) continue;
        const [x, y] = this.decorSpot(d);
        items.push({ y: y + (d === "pond" ? -40 : 0), f: () => draw(ctx2, `dc_${d}`, x, y, d === "treehouse" ? 0.6 : d === "pond" || d === "fountain" || d === "slide" ? 0.65 : 0.75) });
      }
      for (const b of this.baskets) items.push({ y: b.y, f: () => {
        draw(ctx2, "sh_basket", b.x, b.y, 0.62);
        draw(ctx2, `sil_${b.sp}`, b.x, b.y - 26, 0.46, false, 0, 0.9);
        drawText(ctx2, "?", b.x + 16, b.y - 40, 16);
      } });
      for (const p of this.pets) items.push({ y: p.y, f: () => this.drawPet(ctx2, p) });
      items.sort((a, b) => a.y - b.y);
      const sh = frame("shadow");
      if (sh) for (const p of this.pets) drawFrame(ctx2, sh, p.x, p.y + 2, 0.55, false, 0, 0.7);
      for (const it of items) it.f();
      this.fx.draw(ctx2, false);
    }
    drawPet(ctx2, p) {
      const t2 = this.time + p.id * 0.37;
      let name;
      let lift = 0;
      if (p.state === "walk") name = `a_${p.sp}_walk_${Math.floor(t2 * 8) % 4}`;
      else if (p.state === "sleep") name = `a_${p.sp}_sleep_${Math.floor(t2 * 1.2) % 2}`;
      else if (p.state === "happy") {
        name = `a_${p.sp}_happy_${Math.floor(t2 * 10) % 3}`;
        lift = Math.abs(Math.sin(t2 * 9)) * 10;
      } else if (p.state === "play") {
        name = `a_${p.sp}_happy_${Math.floor(t2 * 6) % 3}`;
        lift = Math.abs(Math.sin(t2 * 6)) * 8;
      } else name = `a_${p.sp}_idle_${Math.sin(t2 * 0.8) > 0.97 ? 1 : 0}`;
      draw(ctx2, name, p.x, p.y - lift, 0.9, p.facing < 0);
      if (p.state === "sleep") draw(ctx2, "mk_zzz", p.x + 18, p.y - 46 - Math.sin(t2 * 2) * 3, 0.7, false, 0, 0.9);
      if (p.gift) draw(ctx2, "mk_excl", p.x, p.y - 62 + Math.sin(t2 * 4) * 4, 0.75);
    }
  };
  function drawText(ctx2, s, x, y, size) {
    ctx2.save();
    ctx2.font = `${size}px "Fredoka","Jua",sans-serif`;
    ctx2.textAlign = "center";
    ctx2.textBaseline = "middle";
    ctx2.lineWidth = 4;
    ctx2.strokeStyle = "#3a2416";
    ctx2.fillStyle = "#fff";
    ctx2.strokeText(s, x, y);
    ctx2.fillText(s, x, y);
    ctx2.restore();
  }

  // src/ui/home.ts
  init_stats();
  init_analytics();

  // src/ui/upgrades.ts
  init_balance();
  init_progress();
  init_save();

  // src/render/preview.ts
  var StreamPreview = class {
    constructor() {
      this.fx = new Particles();
      this.t = 0;
      this.width = 12;
      this.range = 250;
      this.tier = 0;
      this.shownW = 12;
      this.shownR = 250;
      this.pulse = 0;
      this.blobHp = 1;
      this.blobPop = 0;
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.raf = 0;
      this.last = 0;
      this.alive = true;
      this.canvas = document.createElement("canvas");
      this.canvas.className = "preview";
      this.ctx = this.canvas.getContext("2d");
      const loop = (ts) => {
        if (!this.alive) return;
        this.raf = requestAnimationFrame(loop);
        if (!this.canvas.isConnected) return;
        const dt = this.last ? Math.min(0.05, (ts - this.last) / 1e3) : 0.016;
        this.last = ts;
        this.frame(dt);
      };
      this.raf = requestAnimationFrame(loop);
    }
    set(width, range, tier, celebrate = false) {
      this.width = width;
      this.range = range;
      this.tier = tier;
      if (celebrate) {
        this.pulse = 1;
        for (let i = 0; i < 10; i++) this.fx.spawn(["p_sparkle_0", "p_sparkle_1", "p_sparkle_2"], 70 + Math.random() * 220, 40 + Math.random() * 60, { fps: 10, max: 0.6, scale: 1.2 });
      }
    }
    frame(dt) {
      const cw = this.canvas.clientWidth, ch = this.canvas.clientHeight;
      if (!cw || !ch) return;
      if (this.canvas.width !== Math.round(cw * this.dpr)) {
        this.canvas.width = Math.round(cw * this.dpr);
        this.canvas.height = Math.round(ch * this.dpr);
      }
      this.t += dt;
      this.fx.update(dt);
      this.shownW += (this.width - this.shownW) * Math.min(1, dt * 5);
      this.shownR += (this.range - this.shownR) * Math.min(1, dt * 5);
      this.pulse = Math.max(0, this.pulse - dt * 1.5);
      const g = this.ctx;
      const W = 400, H = 150;
      const k = Math.min(cw / W, ch / H);
      g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      const grd = g.createLinearGradient(0, 0, 0, ch);
      grd.addColorStop(0, "#bfeaff");
      grd.addColorStop(0.55, "#e6f7ff");
      grd.addColorStop(0.56, "#9bd86a");
      grd.addColorStop(1, "#6fb64a");
      g.fillStyle = grd;
      g.fillRect(0, 0, cw, ch);
      g.setTransform(this.dpr * k, 0, 0, this.dpr * k, this.dpr * (cw - W * k) / 2, this.dpr * (ch - H * k) / 2);
      const kx = 62, ky = 128;
      const reach = Math.min(300, 60 + this.shownR * 0.75);
      g.save();
      g.strokeStyle = "rgba(255,255,255,0.8)";
      g.lineWidth = 3;
      g.setLineDash([8, 8]);
      g.beginPath();
      g.moveTo(kx + 10, ky + 8);
      g.lineTo(kx + reach + 20, ky + 8);
      g.stroke();
      g.restore();
      const bx = kx + reach + 18, by = ky - 6;
      this.blobHp -= dt * (0.25 + this.shownW * 0.025);
      if (this.blobHp <= 0) {
        this.blobHp = 1;
        this.blobPop = 0.4;
        for (let i = 0; i < 12; i++) this.fx.spawn("p_goo_violet", bx, by - 20, { z: 10, vz: 150 + Math.random() * 200, vx: (Math.random() - 0.5) * 300, g: 800, max: 0.6 });
        for (let i = 0; i < 8; i++) this.fx.spawn("p_water", bx, by - 20, { z: 10, vz: 200 + Math.random() * 200, vx: (Math.random() - 0.5) * 260, g: 900, max: 0.6 });
      }
      this.blobPop = Math.max(0, this.blobPop - dt);
      const sc = this.blobPop > 0 ? 0 : 0.5 + 0.5 * this.blobHp;
      const wob = Math.sin(this.t * 30) * 0.06;
      if (sc > 0) draw(g, "m_blob_hit", bx, by + 20, 0.75 * sc + 0.15, true, 0, 1, 1 + wob, 1 - wob);
      else draw(g, `fx_splash_${Math.min(5, Math.floor((0.4 - this.blobPop) * 15))}`, bx, by + 10, 1.4);
      const S = 0.95;
      draw(g, `pack_${this.tier >= 5 ? 2 : this.tier >= 3 ? 1 : 0}`, kx - 12 * S, ky - 30 * S, S);
      draw(g, `kid_shoot_${Math.floor(this.t * 10) % 2}`, kx, ky + 6, S);
      const gun = `gun_${this.tier}`;
      const hx = kx + 6 * S, hy = ky - 22 * S;
      const aim = -0.06;
      draw(g, gun, hx, hy, S * (1 + 0.04 * this.tier), false, aim);
      const [mx, my] = point(gun, "muzzle");
      const kk = S * (1 + 0.04 * this.tier) / 2;
      const x0 = hx + Math.cos(aim) * mx * kk - Math.sin(aim) * my * kk, y0 = hy + Math.sin(aim) * mx * kk + Math.cos(aim) * my * kk;
      const x1 = bx - 10, y1 = by - 18;
      const w = visualWidth(this.shownW * (1 + this.pulse * 0.6));
      const path = () => {
        g.beginPath();
        g.moveTo(x0, y0);
        g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 8 + Math.sin(this.t * 8) * 3, x1, y1);
      };
      g.lineCap = "round";
      path();
      g.strokeStyle = "rgba(140,220,255,0.35)";
      g.lineWidth = w * 2;
      g.stroke();
      path();
      g.strokeStyle = "rgba(28,98,170,0.9)";
      g.lineWidth = w + 3;
      g.stroke();
      path();
      g.strokeStyle = "#55c2f5";
      g.lineWidth = w;
      g.stroke();
      path();
      g.strokeStyle = "rgba(210,245,255,0.95)";
      g.lineWidth = w * 0.5;
      g.stroke();
      path();
      g.setLineDash([w * 1.4, w * 1.6]);
      g.lineDashOffset = -this.t * 700;
      g.strokeStyle = "rgba(255,255,255,0.9)";
      g.lineWidth = Math.max(2, w * 0.22);
      g.stroke();
      g.setLineDash([]);
      if (Math.random() < 0.6) this.fx.spawn("p_water_s", x1, y1, { z: 4, vz: 80 + Math.random() * 120, vx: -60 - Math.random() * 120, vy: (Math.random() - 0.5) * 60, g: 700, max: 0.4, scale: Math.min(2, w / 12) });
      this.fx.draw(g, false);
    }
    destroy() {
      this.alive = false;
      cancelAnimationFrame(this.raf);
    }
  };

  // src/ui/upgrades.ts
  init_stats();
  function fmt(n, d = 0) {
    const v = Math.round(n * 10 ** d) / 10 ** d;
    return Number.isInteger(v) ? String(v) : v.toFixed(d);
  }
  function statPair(id, a, b) {
    switch (id) {
      case "power":
        return [num(a.dps), num(b.dps)];
      case "range":
        return [num(a.range), num(b.range)];
      case "health":
        return [num(a.maxHp), num(b.maxHp)];
      case "pressure":
        return [`${fmt(a.pressureMax, 2)}x`, `${fmt(b.pressureMax, 2)}x`];
      case "splash":
        return [num(a.dps * a.burstDmg), num(b.dps * b.burstDmg)];
    }
  }
  var UpgradePanel = class {
    constructor(opts) {
      this.rows = /* @__PURE__ */ new Map();
      this.onCoins = opts.onCoins;
      this.onEvolve = opts.onEvolve;
      this.preview = new StreamPreview();
      this.track = h("div", { class: "gun-track" });
      const list = h("div", { class: "up-list" });
      for (const def of UPGRADES) {
        const row = h("div", { class: "up-row", "data-id": def.id });
        this.rows.set(def.id, row);
        list.appendChild(row);
      }
      this.el = h("div", { class: "up-panel" + (opts.compact ? " compact" : "") }, h("div", { class: "preview-wrap" }, this.preview.canvas), this.track, list);
      this.refresh();
    }
    refresh(celebrate = false) {
      const st = computeStats(metaPower(), {}, 0);
      this.preview.set(st.width, st.range, st.gunTier, celebrate);
      const tier = gunTier();
      const total = upgradeTotal(save().upgrades);
      const next = GUN_TIERS[tier + 1];
      this.track.replaceChildren(
        h("div", { class: "gun-icons" }, ...GUN_TIERS.map((_, i) => h("div", { class: "gun-slot" + (i < tier ? " done" : i === tier ? " cur" : "") + (i === GUN_TIERS.length - 1 ? " final" : "") }, icon(`gun_${i}`, i === tier ? 46 : 34, i > tier ? "locked" : "")))),
        h("div", { class: "gun-label" }, h("b", {}, t(`gun.${tier}`)), h("span", {}, next ? t("upgrade.gunNext", { n: next.at - total }) : t("upgrade.gunFinal")))
      );
      for (const def of UPGRADES) this.renderRow(def.id, st);
    }
    renderRow(id, st) {
      const row = this.rows.get(id);
      const info = upgradeInfo(id);
      const open = featureUpgradeOpen(id);
      row.classList.toggle("locked", !open);
      if (!open) {
        row.replaceChildren(icon("ic_lock", 44, "up-ic"), h("div", { class: "up-txt" }, h("div", { class: "up-name" }, t(`upgrade.${id}.name`)), h("div", { class: "up-desc" }, t("stage.locked") + ` \xB7 ${t("stage.short", { n: upgradeUnlockStage(id) })}`)));
        return;
      }
      const meta = metaPower();
      const after = { ...meta, upgrades: { ...meta.upgrades, [id]: info.lv + 1 } };
      const st2 = computeStats(after, {}, 0);
      const [a, b] = statPair(id, st, st2);
      const afford = save().coins >= info.cost;
      const btn = h(
        "button",
        { class: "btn up-buy" + (info.maxed ? " maxed" : afford ? " ok" : " off"), "aria-label": t(`upgrade.${id}.name`), onclick: () => this.buy(id, btn) },
        info.maxed ? h("span", {}, t("common.max")) : h("span", { class: "up-cost" }, icon("p_coin_0", 24), h("span", {}, num(info.cost)))
      );
      row.replaceChildren(
        icon(`ic_up_${id}`, 52, "up-ic"),
        h(
          "div",
          { class: "up-txt" },
          h("div", { class: "up-name" }, t(`upgrade.${id}.name`), h("span", { class: "up-lv" }, t("upgrade.lv", { n: info.lv }))),
          h("div", { class: "up-stat" }, info.maxed ? t("upgrade.maxed") : t(`upgrade.stat.${id}`, { a, b })),
          h("div", { class: "up-desc" }, t(`upgrade.${id}.desc`))
        ),
        btn
      );
    }
    buy(id, btn) {
      const info = upgradeInfo(id);
      if (info.maxed) return;
      if (save().coins < info.cost) {
        audio.play("ui_locked", { vol: 0.7 });
        buzz("light");
        btn.classList.remove("shake");
        void btn.offsetWidth;
        btn.classList.add("shake");
        toast(t("upgrade.notEnough"), "p_coin_0");
        return;
      }
      const r = buyUpgrade(id);
      if (!r.ok) return;
      audio.play("upgrade_buy", { vol: 0.9 });
      buzz("medium");
      const row = this.rows.get(id);
      row.classList.remove("flash");
      void row.offsetWidth;
      row.classList.add("flash");
      this.refresh(true);
      this.onCoins();
      if (r.tierAfter > r.tierBefore) this.onEvolve(r.tierAfter);
    }
    destroy() {
      this.preview.destroy();
    }
  };

  // src/ui/popups.ts
  init_balance();
  init_quality();
  init_progress();
  init_save();
  init_analytics();
  init_stats();
  function openSettings(onChange) {
    if (isOpen("settings")) return;
    const s = save().settings;
    const body = h("div", { class: "settings" });
    const render = () => {
      const slider = (key, ic) => {
        const input = h("input", { type: "range", min: 0, max: 100, step: 5, value: Math.round(s[key] * 100), class: "slider", "aria-label": t(`settings.${key}`) });
        const val = h("span", { class: "set-val" }, `${Math.round(s[key] * 100)}`);
        input.addEventListener("input", () => {
          s[key] = Number(input.value) / 100;
          val.textContent = input.value;
          audio.setVolumes(s.music, s.sfx);
          markDirty();
        });
        input.addEventListener("change", () => {
          audio.play("ui_tap");
          track("settings_change", { key, value: s[key] });
        });
        return h("div", { class: "set-row" }, icon(ic, 40), h("span", { class: "set-label" }, t(`settings.${key}`)), input, val);
      };
      const toggle = (label, ic, on, fn, note) => h(
        "div",
        { class: "set-row" + (note ? " with-note" : "") },
        icon(ic, 40),
        h("span", { class: "set-label" }, label, note ? h("small", {}, note) : null),
        h("button", { class: "toggle" + (on ? " on" : ""), role: "switch", "aria-checked": on ? "true" : "false", "aria-label": label, onclick: () => {
          fn(!on);
          audio.play("ui_tap");
          render();
        } }, h("span", { class: "knob" }), h("span", { class: "tg-txt" }, on ? t("settings.on") : t("settings.off")))
      );
      const seg = (label, ic, cur, opts, fn, note) => h(
        "div",
        { class: "set-block" },
        h("div", { class: "set-row bare" }, icon(ic, 40), h("span", { class: "set-label" }, label, note ? h("small", {}, note) : null)),
        h("div", { class: "seg" }, ...opts.map(([v, l]) => h("button", { class: "seg-btn" + (v === cur ? " on" : ""), onclick: () => {
          if (v !== cur) {
            fn(v);
            audio.play("ui_tap");
            render();
          }
        } }, l)))
      );
      body.replaceChildren(
        slider("music", "ic_music"),
        slider("sfx", "ic_sfx"),
        toggle(t("settings.vibration"), "ic_vibe", s.vibration, (v) => {
          s.vibration = v;
          setHaptics(v);
          if (v) buzz("medium");
          markDirty();
          track("settings_change", { key: "vibration", value: v });
        }),
        toggle(t("settings.contrast"), "ic_eye", s.contrast, (v) => {
          s.contrast = v;
          markDirty();
          onChange();
          track("settings_change", { key: "contrast", value: v });
        }, t("settings.contrastNote")),
        seg(t("settings.language"), "ic_lang", s.lang, [["auto", t("settings.lang.auto")], ["ko", t("settings.lang.ko")], ["en", t("settings.lang.en")]], (v) => {
          s.lang = v;
          setLang(v === "auto" ? deviceLang() : v);
          markDirty();
          track("settings_change", { key: "lang", value: v });
          onChange();
          relabel();
        }),
        seg(t("settings.graphics"), "ic_gfx", s.quality === "auto" ? qualityLevel() : s.quality, [["low", t("settings.gfx.low")], ["medium", t("settings.gfx.medium")], ["high", t("settings.gfx.high")]], (v) => {
          s.quality = v;
          setQuality(v === "auto" ? defaultQuality() : v);
          markDirty();
          track("settings_change", { key: "quality", value: v });
        }, t("settings.gfxNote")),
        h(
          "div",
          { class: "set-links" },
          h("button", { class: "btn btn-plain", onclick: once(() => openCredits()) }, icon("ic_info", 28), t("settings.credits")),
          h("button", { class: "btn btn-warn", onclick: once(() => confirmReset()) }, icon("ic_reset", 28), t("settings.reset"))
        ),
        h("div", { class: "set-ver" }, t("settings.version", { v: "1.0.0" }))
      );
    };
    const relabel = () => {
      const el = document.querySelector(".modal-title");
      if (el) el.textContent = t("settings.title");
    };
    render();
    openModal(body, { id: "settings", title: t("settings.title"), titleIcon: "ic_gear", onClose: () => {
      flush();
      onChange();
    } });
  }
  function openCredits() {
    openModal(h("div", { class: "credits" }, ...t("settings.creditsText").split("\n").map((l) => h("p", {}, l))), { id: "credits", title: t("settings.credits") });
  }
  function confirmReset() {
    const body = h(
      "div",
      { class: "confirm" },
      h("p", {}, t("settings.resetConfirm")),
      h(
        "div",
        { class: "confirm-btns" },
        h("button", { class: "btn btn-plain", onclick: once(() => closeModal("reset")) }, t("common.cancel")),
        h("button", { class: "btn btn-warn", onclick: once(() => {
          resetSave();
          location.reload();
        }) }, t("settings.resetYes"))
      )
    );
    openModal(body, { id: "reset", title: t("settings.reset") });
  }
  function openStreak(onDone) {
    if (isOpen("streak")) return;
    const s = save();
    const day = Math.max(1, s.streak.day);
    const week = Math.floor((day - 1) / 7);
    const body = h("div", { class: "streak" });
    const render = () => {
      const cells = Array.from({ length: 7 }, (_, i) => {
        const d = week * 7 + i + 1;
        const r = streakReward(d);
        const got = d < day || d === day && s.streak.claimedToday;
        const today2 = d === day;
        return h(
          "div",
          { class: "stamp" + (got ? " got" : "") + (today2 ? " today" : "") },
          h("div", { class: "stamp-day" }, t("streak.day", { n: d })),
          r.species ? icon(got ? `p_${r.species}` : `sil_${r.species}`, 50) : icon("p_coin_0", 40),
          h("div", { class: "stamp-val" }, r.species ? t(`species.${r.species}`) : num(r.coins)),
          got ? icon("ic_check", 30, "stamp-check") : null
        );
      });
      const tomorrow = streakReward(day + 1);
      const giftName = tomorrow.species ? t("streak.visitor", { name: t(`species.${tomorrow.species}`) }) : t("streak.coins", { n: num(tomorrow.coins) });
      body.replaceChildren(
        h("div", { class: "stamps" }, ...cells),
        s.streak.claimedToday ? h("div", { class: "streak-next" }, icon(tomorrow.species ? `sil_${tomorrow.species}` : "ic_gift", 44), h("span", {}, t("streak.tomorrowHint", { gift: giftName }))) : h("button", { class: "btn btn-primary big", onclick: once(() => {
          const r = claimStreak();
          if (!r) return;
          audio.play(r.species ? "rescue" : "coin_burst", { vol: 1 });
          buzz("success");
          toast(r.species ? t("streak.visitor", { name: t(`species.${r.species}`) }) : `+${num(r.coins)}`, r.species ? `p_${r.species}` : "p_coin_0", 2400);
          render();
          onDone();
        }) }, icon("ic_gift", 32), t("common.claim"))
      );
    };
    render();
    openModal(body, { id: "streak", title: t("streak.title"), titleIcon: "ic_streak" });
    void STREAK_REWARDS;
  }
  function openMissions(onDone) {
    if (isOpen("missions")) return;
    const s = save();
    const body = h("div", { class: "missions" });
    const render = () => {
      const rows = s.missions.ids.map((id, i) => {
        const def = missionDef(id);
        const p = s.missions.progress[i];
        const done = p >= def.target;
        const claimed = s.missions.claimed[i];
        return h(
          "div",
          { class: "mission" + (claimed ? " claimed" : "") },
          h(
            "div",
            { class: "mission-txt" },
            h("div", { class: "mission-name" }, t(`mission.${id}`, { n: def.target })),
            h("div", { class: "bar thin mbar" }, h("div", { class: "bar-fill xp", style: `width:${Math.round(p / def.target * 100)}%` })),
            h("div", { class: "mission-prog" }, `${num(p)} / ${num(def.target)}`)
          ),
          claimed ? icon("ic_check", 40) : h("button", { class: "btn up-buy " + (done ? "ok" : "off"), onclick: () => {
            if (!done) {
              audio.play("ui_locked", { vol: 0.6 });
              return;
            }
            const c = claimMission(i);
            if (c) {
              audio.play("coin_burst", { vol: 0.9 });
              buzz("success");
              toast(`+${num(c)}`, "p_coin_0");
              render();
              onDone();
            }
          } }, h("span", { class: "up-cost" }, icon("p_coin_0", 24), h("span", {}, num(def.coins))))
        );
      });
      const allDone = s.missions.claimed.length > 0 && s.missions.claimed.every(Boolean);
      const ms = dailyRemainingMs();
      const hh = Math.floor(ms / 36e5), mm = Math.floor(ms % 36e5 / 6e4);
      body.replaceChildren(
        ...rows,
        h(
          "div",
          { class: "mission all" + (s.missions.allClaimed ? " claimed" : "") },
          icon("ic_gift", 48),
          h("div", { class: "mission-txt" }, h("div", { class: "mission-name" }, t("missions.all"))),
          s.missions.allClaimed ? icon("ic_check", 40) : h("button", { class: "btn up-buy " + (allDone ? "ok" : "off"), onclick: () => {
            const c = claimAllMissionsBonus();
            if (c) {
              audio.play("coin_burst");
              buzz("success");
              toast(`+${num(c)}`, "p_coin_0");
              render();
              onDone();
            } else audio.play("ui_locked", { vol: 0.6 });
          } }, h("span", { class: "up-cost" }, icon("p_coin_0", 24), h("span", {}, num(MISSION_ALL_BONUS))))
        ),
        h("div", { class: "mission-reset" }, t("missions.resetIn", { h: hh, m: mm }))
      );
    };
    render();
    openModal(body, { id: "missions", title: t("missions.title"), titleIcon: "ic_missions" });
  }
  function openDaily(mod, onPlay) {
    if (isOpen("daily")) return;
    const s = save();
    const body = h(
      "div",
      { class: "daily" },
      h(
        "div",
        { class: "daily-card" },
        icon(mod === "big" ? "m_chunky_normal" : mod === "fast" ? "m_dasher_normal" : mod === "swarm" ? "m_blob_normal" : "goo_drop_0", 80),
        h("div", {}, h("div", { class: "daily-mod" }, t(`daily.mod.${mod}`)), h("div", { class: "daily-desc" }, t(`daily.mod.${mod}.desc`)))
      ),
      h("div", { class: "daily-reward" }, icon("p_coin_0", 32), h("span", {}, s.daily.cleared ? t("daily.done", { n: DAILY.replayCoins }) : t("daily.reward", { n: DAILY.firstClearCoins }))),
      s.daily.streak > 0 ? h("div", { class: "daily-streak" }, icon("ic_streak", 30), t("daily.streak", { n: s.daily.streak })) : null,
      festivalOpen() && !festivalActive() ? h("div", { class: "daily-streak" }, icon("ic_festival", 30), h("span", {}, t("festival.next", { x: FESTIVAL.coinMul }))) : null,
      h("button", { class: "btn btn-primary big", onclick: once(() => {
        closeModal("daily", true);
        onPlay();
      }) }, icon("ic_play", 32), t("daily.play"))
    );
    openModal(body, { id: "daily", title: t("daily.title"), titleIcon: "ic_daily" });
  }
  function openFestival(onClose) {
    if (isOpen("festival")) return;
    const ms = festivalRemainingMs();
    const d = Math.floor(ms / 864e5), hh = Math.floor(ms % 864e5 / 36e5), mm = Math.floor(ms % 36e5 / 6e4);
    const left = d > 0 ? t("time.dh", { d, h: hh }) : hh > 0 ? t("time.hm", { h: hh, m: mm }) : t("time.m", { m: Math.max(1, mm) });
    const body = h(
      "div",
      { class: "unlock festival" },
      icon("ic_festival", 110, "unlock-ic"),
      h("div", { class: "unlock-title" }, t("festival.desc", { x: FESTIVAL.coinMul })),
      h("div", { class: "fest-left" }, t("festival.left", { t: left })),
      h("button", { class: "btn btn-primary big", onclick: once(() => closeModal("festival")) }, t("common.ok"))
    );
    openModal(body, { id: "festival", title: t("festival.title"), titleIcon: "ic_festival", onClose });
    track("festival_view", { remainingH: Math.round(ms / 36e5) });
  }
  var UNLOCK_ICON = { upgrades: "ic_upgrade", shelter: "ic_shelter", missions: "ic_missions", daily: "ic_daily", decor: "dc_cushion" };
  function openUnlock(f, onClose) {
    audio.play("unlock", { vol: 0.9 });
    buzz("success");
    const body = h(
      "div",
      { class: "unlock" },
      icon(UNLOCK_ICON[f], 110, "unlock-ic"),
      h("div", { class: "unlock-title" }, t(`unlock.${f}`)),
      h("button", { class: "btn btn-primary big", onclick: once(() => closeModal(`unlock-${f}`)) }, t("common.ok"))
    );
    openModal(body, { id: `unlock-${f}`, cls: "modal-unlock", onClose });
  }
  function evolveGains(a, b) {
    const A = GUN_TIERS[a], B = GUN_TIERS[b];
    const pc = (x, y) => Math.round((y / x - 1) * 100);
    const rangeMul = computeStats(metaPower(), {}, 0).range / (PLAYER.range + B.range);
    return [t("evolve.dmg", { v: pc(A.dmg, B.dmg) }), t("evolve.width", { v: pc(A.width, B.width) }), t("evolve.splash", { v: pc(A.splash, B.splash) }), t("evolve.range", { v: Math.round((B.range - A.range) * rangeMul) })];
  }
  function openEvolve(tier) {
    audio.stinger("stinger_evolve");
    buzz("heavy");
    const prev = Math.max(0, tier - 1);
    const body = h(
      "div",
      { class: "evolve" },
      h("div", { class: "evolve-row" }, icon(`gun_${prev}`, 70, "evolve-old"), icon("ic_arrow", 44), h("span", { class: "evolve-glow" }, icon(`gun_${tier}`, 120, "evolve-new"))),
      h("div", { class: "evolve-name" }, t(`gun.${tier}`)),
      h("div", { class: "evolve-stats" }, ...evolveGains(prev, tier).map((g) => h("span", { class: "evolve-stat" }, g))),
      tier < GUN_TIERS.length - 1 ? h("div", { class: "evolve-next" }, icon("gun_6", 54, "locked"), h("span", {}, t("upgrade.dream"))) : null,
      h("button", { class: "btn btn-primary big", onclick: once(() => closeModal("evolve")) }, t("common.ok"))
    );
    openModal(body, { id: "evolve", title: t("gun.evolved"), cls: "modal-evolve" });
  }

  // src/ui/home.ts
  function stageName(stage) {
    return t("stage.label", { r: t(`region.${regionOf(stage)}`), n: (stage - 1) % 10 + 1 });
  }
  function speciesWhere(sp, levels) {
    if (sp === "penguin") return t("shelter.whereStreak", { n: 2 });
    if (sp === "panda") return t("shelter.whereStreak", { n: 5 });
    const lv = levels.find((l) => l.rooms.some((r) => r.animals.some((a) => a.s === sp)));
    return lv ? t("shelter.where", { place: stageName(lv.stage) }) : "";
  }
  var HomeScreen = class {
    constructor(api, ui, tab = "map") {
      this.tab = "map";
      this.map = new MapView();
      this.shelter = new ShelterView();
      this.navBtns = {};
      this.pages = {};
      this.upPanel = null;
      this.drag = { on: false, id: -1, y0: 0, y: 0, x0: 0, moved: 0, t: 0, vy: 0, lastY: 0, lastT: 0 };
      this.badgeTimer = 0;
      // ---------------------------------------------------------------- input on the canvas
      this.onDown = (e) => {
        if (isOpen()) return;
        const d = this.drag;
        d.on = true;
        d.id = e.pointerId;
        d.y0 = d.y = d.lastY = e.clientY;
        d.x0 = e.clientX;
        d.moved = 0;
        d.t = d.lastT = performance.now();
        d.vy = 0;
        this.map.vel = 0;
      };
      this.onMove = (e) => {
        const d = this.drag;
        if (!d.on || e.pointerId !== d.id) return;
        const dy = e.clientY - d.y;
        d.y = e.clientY;
        d.moved += Math.abs(dy);
        const now = performance.now();
        const dt = Math.max(1, now - d.lastT);
        d.vy = d.vy * 0.6 + (e.clientY - d.lastY) / dt * 1e3 * 0.4;
        d.lastY = e.clientY;
        d.lastT = now;
        if (this.tab === "map") this.map.drag(dy);
      };
      this.onUp = (e) => {
        const d = this.drag;
        if (!d.on || e.pointerId !== d.id) return;
        d.on = false;
        if (d.moved < 10 && Math.abs(e.clientX - d.x0) < 10) this.tap(e.clientX, e.clientY);
        else if (this.tab === "map" && performance.now() - d.lastT < 80) this.map.fling(d.vy);
      };
      this.onWheel = (e) => {
        if (this.tab === "map" && !isOpen()) this.map.drag(-e.deltaY);
      };
      this.api = api;
      this.map.regionLabel = (k) => t(`region.${k}`);
      this.map.cleared = (s) => isCleared(s);
      this.root = h("div", { class: "home" });
      ui.appendChild(this.root);
      this.build();
      this.layout();
      this.refreshMapState();
      this.map.focus(this.map.current);
      this.setTab(tab, true);
      screen.canvas.addEventListener("pointerdown", this.onDown);
      window.addEventListener("pointermove", this.onMove);
      window.addEventListener("pointerup", this.onUp);
      screen.canvas.addEventListener("wheel", this.onWheel, { passive: true });
    }
    // ---------------------------------------------------------------- DOM
    build() {
      this.coinEl = h("span", { class: "num" }, num(save().coins));
      this.shelterHead = h("div", { class: "sh-head" });
      const settings = h("button", { class: "btn-icon", "aria-label": t("settings.title"), onclick: once(() => this.api.openSettings()) }, icon("ic_gear", 32));
      this.festPill = h("button", { class: "fest-pill", onclick: once(() => openFestival()) }, icon("ic_festival", 34), h("span", {}, t("festival.pill", { x: FESTIVAL.coinMul })));
      const top = h("div", { class: "topbar" }, h("div", { class: "pill coin-pill" }, icon("p_coin_0", 28), this.coinEl), h("div", { class: "grow" }, this.shelterHead, this.festPill), settings);
      this.side = h("div", { class: "side" });
      this.cta = h("button", { class: "btn btn-primary big cta", onclick: once(() => this.api.play(this.map.current)) });
      this.pages.map = h("div", { class: "page page-map" }, this.side, this.cta);
      this.pages.upgrade = h("div", { class: "page page-up" });
      this.giftBtn = h("button", { class: "btn btn-green gift-btn", onclick: once(() => this.collect()) });
      const shBtns = h(
        "div",
        { class: "sh-btns" },
        h("button", { class: "btn btn-plain sq", onclick: once(() => this.openAlbum()) }, icon("ic_paw", 32), h("span", {}, t("shelter.list"))),
        h("button", { class: "btn btn-plain sq decor-btn", onclick: once(() => this.openDecor()) }, icon("dc_flowers", 34), h("span", {}, t("shelter.decor")))
      );
      const shCta = h("button", { class: "btn btn-primary big cta", onclick: once(() => this.api.play(nextStage())) });
      this.pages.shelter = h("div", { class: "page page-shelter" }, h("div", { class: "sh-row" }, this.giftBtn, shBtns), shCta);
      this.pages.shelter.cta = shCta;
      const nav = h("div", { class: "nav" });
      for (const [k, ic, label] of [["upgrade", "ic_upgrade", "nav.upgrade"], ["map", "ic_map", "nav.map"], ["shelter", "ic_shelter", "nav.shelter"]]) {
        const b = h("button", { class: "nav-btn", "data-tab": k, onclick: () => this.setTab(k) }, icon(ic, 40), h("span", {}, t(label)));
        this.navBtns[k] = b;
        nav.appendChild(b);
      }
      this.root.append(this.pages.map, this.pages.upgrade, this.pages.shelter, top, nav);
    }
    refreshCoins() {
      this.coinEl.textContent = num(save().coins);
      this.coinEl.parentElement?.classList.remove("pop");
      void this.coinEl.offsetWidth;
      this.coinEl.parentElement?.classList.add("pop");
      this.refreshBadges();
    }
    refreshMapState() {
      this.map.current = nextStage();
      const known = new Set(SPECIES.filter((s) => (save().rescued[s.id] || 0) > 0).map((s) => s.id));
      this.map.newFriendAt = new Set(this.api.levels.filter((l) => l.rooms.some((r) => r.animals.some((a) => !known.has(a.s)))).map((l) => l.stage));
      const st = this.map.current;
      this.cta.replaceChildren(icon("ic_play", 32), h("span", { class: "cta-txt" }, h("span", { class: "cta-small" }, t("stage.play")), h("span", {}, stageName(st))));
      const sc = this.pages.shelter.cta;
      sc.replaceChildren(icon("ic_play", 32), h("span", { class: "cta-txt" }, h("span", { class: "cta-small" }, t("stage.play")), h("span", {}, stageName(st))));
      this.buildSide();
      this.refreshBadges();
    }
    buildSide() {
      const s = save();
      const items = [];
      const mk = (ic, label, badge, fn) => h("button", { class: "side-btn", onclick: once(fn) }, icon(ic, 40), h("span", {}, label), badge ? h("span", { class: "badge" }, "!") : null);
      items.push(mk("ic_streak", t("streak.title"), !s.streak.claimedToday, () => this.api.openStreak()));
      if (featureOpen("missions")) items.push(mk("ic_missions", t("missions.title"), missionsClaimable() > 0, () => this.api.openMissions()));
      if (featureOpen("daily")) items.push(mk("ic_daily", t("daily.title"), !s.daily.cleared, () => this.api.openDaily()));
      this.side.replaceChildren(...items);
    }
    refreshBadges() {
      const coins = save().coins;
      const canBuy = UPGRADES.some((u) => {
        const i = upgradeInfo(u.id);
        return featureUpgradeOpen(u.id) && !i.maxed && i.cost <= coins;
      });
      setBadge(this.navBtns.upgrade, canBuy && featureOpen("upgrades"));
      setBadge(this.navBtns.shelter, featureOpen("shelter") && giftsPending() >= 10);
      this.navBtns.upgrade.classList.toggle("hidden", !featureOpen("upgrades"));
      this.navBtns.shelter.classList.toggle("hidden", !featureOpen("shelter"));
    }
    setTab(tab, initial = false) {
      if (tab === this.tab && !initial) return;
      if (!initial) audio.play("ui_tap", { vol: 0.6 });
      this.tab = tab;
      for (const k of Object.keys(this.pages)) {
        this.pages[k].classList.toggle("on", k === tab);
        this.navBtns[k].classList.toggle("on", k === tab);
      }
      this.shelterHead.classList.toggle("on", tab === "shelter");
      this.festPill.classList.toggle("on", tab === "map" && festivalActive());
      if (tab === "upgrade") {
        if (!this.upPanel) {
          this.upPanel = new UpgradePanel({ onCoins: () => this.refreshCoins(), onEvolve: (tier) => this.api.evolve(tier) });
          const cta = h("button", { class: "btn btn-primary big cta-inline", onclick: once(() => this.api.play(nextStage())) }, icon("ic_play", 32), h("span", {}, t("stage.play")));
          const bonusBox = h("div", { class: "bonus-box" });
          this.pages.upgrade.replaceChildren(h("div", { class: "page-title" }, icon("ic_upgrade", 40), h("span", {}, t("upgrade.title"))), h("div", { class: "page-scroll" }, this.upPanel.el, bonusBox, h("div", { class: "dream" }, icon("gun_6", 64), h("span", {}, t("upgrade.dream"))), cta));
          this.pages.upgrade.bonus = bonusBox;
        } else this.upPanel.refresh();
        this.renderBonuses(this.pages.upgrade.bonus);
      }
      if (tab === "shelter") {
        this.syncShelter();
        track("shelter_open", { animals: this.shelter.pets.length });
        if (!save().flags.unlock_shelter && featureOpen("shelter")) {
          save().flags.unlock_shelter = true;
        }
      }
      if (tab === "map") {
        this.refreshMapState();
      }
      this.layout();
    }
    renderBonuses(box) {
      const meta = { upgrades: save().upgrades, bonds: bonds(), assist: false };
      const rows = SPECIES.filter((s) => meta.bonds[s.id]).map((s) => h("div", { class: "bonus-row" }, icon(`p_${s.id}`, 36), h("span", {}, t(`bonus.${s.bonus}`, { v: pct(s.per * (meta.bonds[s.id] || 0)) }))));
      box.replaceChildren(h("div", { class: "bonus-title" }, icon("ic_paw", 28), t("shelter.totalBonus")), ...rows.length ? rows : [h("div", { class: "bonus-empty" }, t("shelter.giftNone"))]);
      void bondBonus;
    }
    syncShelter(arrivals = []) {
      const s = save();
      this.shelter.setData(s.rescued, (sp) => bondProgress(sp).lv, s.decor);
      this.shelter.layout(screen.w, screen.h, screen.safe.top + 136, screen.safe.bottom + 172);
      for (const a of arrivals) this.shelter.arrive(a);
      const n = giftsPending();
      this.shelter.setGifts(n);
      const total = SPECIES.length;
      const have = SPECIES.filter((x) => (s.rescued[x.id] || 0) > 0).length;
      this.shelterHead.replaceChildren(h("div", { class: "sh-title" }, icon("ic_shelter", 32), h("span", {}, t("shelter.title"))), h("div", { class: "sh-count" }, t("shelter.count", { a: have, b: total })));
      this.giftBtn.replaceChildren(icon("ic_gift", 34), h("span", { class: "gift-txt" }, h("span", {}, n > 0 ? t("shelter.giftReady", { n: num(n) }) : t("shelter.giftNone")), h("span", { class: "gift-rate" }, t("shelter.giftRate", { n: num(giftRate()), h: GIFTS.capHours }))));
      this.giftBtn.classList.toggle("off", n <= 0);
      this.pages.shelter.querySelector(".decor-btn")?.classList.toggle("hidden", !featureOpen("decor"));
    }
    collect() {
      const n = collectGifts();
      if (n <= 0) {
        audio.play("ui_locked", { vol: 0.6 });
        toast(t("shelter.giftNone"), "ic_gift");
        return;
      }
      audio.play("gift_collect", { vol: 1 });
      audio.play("coin_burst", { vol: 0.8 });
      buzz("success");
      for (const p of this.shelter.pets) if (p.gift) {
        this.shelter.poke(p);
        for (let i = 0; i < 4; i++) this.shelter.fx.spawn(["p_coin_0", "p_coin_1", "p_coin_2", "p_coin_3"], p.x, p.y - 50, { fps: 12, z: 10, vz: 260 + Math.random() * 120, vx: (Math.random() - 0.5) * 140, g: 700, max: 0.9 });
      }
      toast(`+${num(n)}`, "p_coin_0");
      this.refreshCoins();
      this.syncShelter();
    }
    // ---------------------------------------------------------------- popups owned by home
    openStage(stage) {
      if (isOpen("stage")) return;
      const lv = this.api.levels.find((l) => l.stage === stage);
      if (!lv) return;
      const unlocked = stageUnlocked(stage);
      const species = [...new Set(lv.rooms.flatMap((r) => r.animals.map((a) => a.s)))];
      const animals = h("div", { class: "st-animals" }, ...species.map((sp) => {
        const known = (save().rescued[sp] || 0) > 0;
        return h("div", { class: "st-animal" }, icon(known ? `p_${sp}` : `sil_${sp}`, 64), h("span", {}, known ? t(`species.${sp}`) : "?"), !known ? h("span", { class: "tag-new" }, t("common.new")) : null);
      }));
      const c = save().cleared[`s${stage}`];
      const stars = h("div", { class: "st-stars" }, ...[0, 1, 2].map((i) => icon(c && c.stars > i ? "ic_star" : "ic_star_empty", 34)));
      const body = h(
        "div",
        { class: "stage-info" },
        h("div", { class: "st-sub" }, t("stage.animals")),
        animals,
        lv.intro && lv.intro !== "blob" ? h("div", { class: "st-goo" }, icon(lv.intro === "boss" ? `m_boss_${lv.region}_normal` : lv.intro === "flyer" ? "m_flyer_normal_0" : `m_${lv.intro}_normal`, 52), h("div", {}, h("div", { class: "st-goo-t" }, lv.intro === "boss" ? t("stage.boss") : t("stage.newGoo")), h("div", { class: "st-goo-n" }, t(`monster.${lv.intro}`)))) : null,
        c ? h("div", { class: "st-best" }, stars, h("span", {}, `${t("stage.cleared")} \xB7 ${t("stage.best")} ${Math.floor(c.best / 60)}:${String(c.best % 60).padStart(2, "0")}`)) : null,
        assistFor(stage) ? h("div", { class: "st-assist" }, icon("ic_heart", 30), h("span", {}, t("stage.helpOffer", { hp: assistFor(stage) * 30, dmg: assistFor(stage) * 20 }))) : null,
        unlocked ? h("button", { class: "btn btn-primary big", onclick: once(() => {
          closeModal("stage", true);
          this.api.play(stage);
        }) }, icon("ic_play", 32), t("stage.play")) : h("div", { class: "st-locked" }, icon("ic_lock", 30), t("stage.locked"))
      );
      openModal(body, { id: "stage", title: stageName(stage) });
    }
    openAlbum() {
      const s = save();
      const grid = h("div", { class: "album" }, ...SPECIES.map((sp) => {
        const known = (s.rescued[sp.id] || 0) > 0;
        return h("button", { class: "album-cell" + (known ? "" : " unknown"), onclick: () => this.openSpecies(sp.id) }, icon(known ? `p_${sp.id}` : `sil_${sp.id}`, 72), h("span", {}, known ? t(`species.${sp.id}`) : "?"));
      }));
      openModal(grid, { id: "album", title: t("shelter.list"), titleIcon: "ic_paw" });
    }
    openSpecies(sp) {
      if (isOpen("species")) return;
      const def = SPECIES.find((x) => x.id === sp);
      const bp = bondProgress(sp);
      const known = bp.count > 0;
      const body = h(
        "div",
        { class: "species" },
        icon(known ? `p_${sp}` : `sil_${sp}`, 120, "species-art"),
        h("div", { class: "species-name" }, known ? t(`species.${sp}`) : "?"),
        known ? h("div", { class: "species-bond" }, ...[1, 2, 3, 4, 5].map((i) => icon(i <= bp.lv ? "p_heart" : "ic_star_empty", 26, i <= bp.lv ? "" : "dim")), h("span", {}, t("shelter.bond", { n: bp.lv }))) : null,
        h("div", { class: "species-bonus" }, h("b", {}, t("shelter.bonusTitle")), h("span", {}, t(`bonus.${def.bonus}`, { v: pct(def.per * Math.max(1, bp.lv)) }))),
        known ? h("div", { class: "species-note" }, bp.maxed ? t("shelter.bondMax") : t("shelter.bondNext", { n: bp.toNext })) : h("div", { class: "species-note" }, speciesWhere(sp, this.api.levels)),
        known ? h("div", { class: "species-count" }, t("shelter.rescued", { n: bp.count })) : null
      );
      openModal(body, { id: "species", title: known ? t(`species.${sp}`) : t("shelter.empty") });
    }
    openDecor() {
      const s = save();
      const list = h("div", { class: "decor-list" });
      const render = () => list.replaceChildren(...DECOR.map((d) => {
        const owned = s.decor.includes(d.id);
        const btn = owned ? h("div", { class: "decor-owned" }, icon("ic_check", 28), t("shelter.decorOwned")) : h("button", { class: "btn up-buy " + (s.coins >= d.cost ? "ok" : "off"), onclick: () => {
          if (!buyDecor(d.id)) {
            audio.play("ui_locked", { vol: 0.7 });
            toast(t("upgrade.notEnough"), "p_coin_0");
            return;
          }
          audio.play("upgrade_buy", { vol: 0.9 });
          buzz("medium");
          this.refreshCoins();
          this.syncShelter();
          render();
        } }, h("span", { class: "up-cost" }, icon("p_coin_0", 24), h("span", {}, num(d.cost))));
        return h("div", { class: "decor-row" + (owned ? " owned" : "") }, icon(`dc_${d.id}`, 64), h("div", { class: "up-txt" }, h("div", { class: "up-name" }, t(`decor.${d.id}`)), h("div", { class: "up-desc" }, t("shelter.decorDesc"))), btn);
      }));
      render();
      openModal(list, { id: "decor", title: t("shelter.decor"), titleIcon: "dc_ball" });
    }
    tap(x, y) {
      if (this.tab === "map") {
        const n = this.map.hitNode(x, y);
        if (n) {
          audio.play("ui_tap", { vol: 0.7 });
          this.openStage(n.stage);
        }
      } else if (this.tab === "shelter") {
        const p = this.shelter.hitPet(x, y);
        if (p) {
          if (p.gift) {
            this.collect();
            return;
          }
          audio.play(`chirp_${1 + p.id % 3}`, { vol: 0.8 });
          this.shelter.poke(p);
          buzz("tick");
          setTimeout(() => this.openSpecies(p.sp), 260);
          return;
        }
        const b = this.shelter.hitBasket(x, y);
        if (b) {
          audio.play("ui_tap", { vol: 0.7 });
          this.openSpecies(b);
        }
      }
    }
    // ---------------------------------------------------------------- frame
    topInset() {
      return screen.safe.top + 70;
    }
    bottomInset() {
      return screen.safe.bottom + 92;
    }
    layout() {
      this.map.layout(screen.w, screen.h, screen.safe.top + 64, screen.safe.bottom + 176);
      this.shelter.layout(screen.w, screen.h, screen.safe.top + 136, screen.safe.bottom + 172);
    }
    frame(dt) {
      this.badgeTimer -= dt;
      if (this.badgeTimer <= 0) {
        this.badgeTimer = 5;
        if (this.tab === "shelter") {
          this.shelter.setGifts(giftsPending());
        }
        this.refreshBadges();
      }
      if (this.tab === "map") {
        this.map.update(dt);
        this.map.render(screen.ctx, screen.dpr);
      } else if (this.tab === "shelter") {
        this.shelter.update(dt);
        this.shelter.render(screen.ctx, screen.dpr);
      } else {
        const c = screen.ctx;
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.fillStyle = "#9bd86a";
        c.fillRect(0, 0, screen.canvas.width, screen.canvas.height);
      }
    }
    washMap(stage) {
      this.map.focus(stage);
      this.map.washing = { stage, t: 0 };
      setTimeout(() => audio.play("room_clear", { vol: 0.7 }), 200);
    }
    destroy() {
      screen.canvas.removeEventListener("pointerdown", this.onDown);
      window.removeEventListener("pointermove", this.onMove);
      window.removeEventListener("pointerup", this.onUp);
      screen.canvas.removeEventListener("wheel", this.onWheel);
      this.upPanel?.destroy();
      this.root.remove();
    }
    highest() {
      return highestCleared();
    }
  };
  function setBadge(el, on) {
    let b = el.querySelector(".badge");
    if (on && !b) {
      b = h("span", { class: "badge" }, "!");
      el.appendChild(b);
    }
    if (!on && b) b.remove();
  }

  // src/ui/result.ts
  init_balance();
  init_save();
  var TIPS = { spitter: "result.tip.spitter", flyer: "result.tip.spitter", blob: "result.tip.contact", mini: "result.tip.contact", splitter: "result.tip.contact", dasher: "result.tip.dasher", jumper: "result.tip.jumper", chunky: "result.tip.chunky", nest: "result.tip.contact", boss: "result.tip.boss" };
  var ResultScreen = class {
    constructor(ui, sum, act) {
      this.steps = [];
      this.timers = [];
      this.skipped = false;
      this.panel = null;
      const win = sum.result === "clear";
      const title = win ? t("result.clear") : sum.result === "quit" ? t("result.quit") : t("result.fail");
      this.coinEl = h("span", { class: "num" }, num(save().coins - sum.total));
      const head = h(
        "div",
        { class: "res-head " + (win ? "win" : "lose") },
        icon(win ? "kid_win_2" : "kid_sad_0", 96, "res-kid"),
        h("div", { class: "res-titles" }, h("div", { class: "res-stage" }, act.daily ? t("daily.title") : stageName(sum.stage)), h("div", { class: "res-title" }, title)),
        h("div", { class: "pill coin-pill res-coins" }, icon("p_coin_0", 26), this.coinEl)
      );
      const body = h("div", { class: "res-body" });
      const rows = h("div", { class: "res-rows" });
      body.appendChild(rows);
      const foot = h(
        "div",
        { class: "res-foot" },
        h("button", { class: "btn btn-plain res-sec", onclick: once(() => this.done(act.secondary.fn)) }, icon(act.secondary.icon, 30), h("span", {}, act.secondary.label)),
        h("button", { class: "btn btn-primary big res-pri", onclick: once(() => this.done(act.primary.fn)) }, icon(act.primary.icon, 32), h("span", {}, act.primary.label))
      );
      const skip = h("div", { class: "res-skip" }, t("result.tapSkip"));
      this.el = h("div", { class: "result" }, head, body, foot, skip);
      ui.appendChild(this.el);
      this.el.addEventListener("pointerdown", (e) => {
        if (!e.target.closest("button")) this.skip();
      });
      requestAnimationFrame(() => this.el.classList.add("show"));
      audio.stinger(win ? "stinger_clear" : "stinger_fail");
      buzz(win ? "success" : "light");
      const coinRow = h("div", { class: "res-row" }, icon("p_coin_0", 40), h("span", { class: "res-label" }, t("result.coins")), h("span", { class: "res-val" }, "0"));
      const add = (el) => {
        rows.appendChild(el);
        requestAnimationFrame(() => el.classList.add("in"));
      };
      this.step(250, () => {
        add(coinRow);
        this.countUp(coinRow.querySelector(".res-val"), sum.coinsRun, 900);
      });
      const fo = sum.festival ? 550 : 0;
      if (sum.festival) this.step(1150, () => {
        add(h("div", { class: "res-row bonus" }, icon("ic_festival", 40), h("span", { class: "res-label" }, t("result.festival", { x: FESTIVAL.coinMul })), h("span", { class: "res-val" }, `+${num(sum.festival)}`)));
        audio.play("pickup_coin", { vol: 0.9 });
      });
      if (sum.bonus) {
        const label = sum.bonusKind === "first" ? t("result.firstClear") : sum.bonusKind === "daily" ? t("daily.title") : t("result.clearBonus");
        this.step(1200 + fo, () => {
          add(h("div", { class: "res-row bonus" }, icon("ic_star", 40), h("span", { class: "res-label" }, label), h("span", { class: "res-val" }, `+${num(sum.bonus)}`)));
          audio.play("coin_burst", { vol: 0.8 });
        });
      }
      this.step((sum.bonus ? 1900 : 1300) + fo, () => {
        this.setCoins(save().coins);
        const animals = h("div", { class: "res-animals" });
        const row = h("div", { class: "res-row col" }, h("div", { class: "res-sub" }, icon("ic_paw", 30), h("span", {}, t("result.animals")), h("span", { class: "res-val" }, String(sum.rescued.length))), animals);
        add(row);
        sum.rescued.forEach((sp, i) => this.step(i * 260, () => {
          const isNew = sum.newSpecies.includes(sp) && sum.rescued.indexOf(sp) === i;
          const up = sum.bondUps.find((b) => b.species === sp);
          animals.appendChild(h("div", { class: "res-animal in" }, icon(`p_${sp}`, 64), isNew ? h("span", { class: "tag-new" }, t("common.new")) : up ? h("span", { class: "tag-bond" }, t("result.bond", { n: up.to })) : null));
          audio.play(`chirp_${1 + i % 3}`, { vol: 0.8 });
        }, true));
        if (!sum.rescued.length) animals.appendChild(h("div", { class: "res-none" }, "\u2014"));
      });
      const after = (sum.bonus ? 1900 : 1300) + fo + sum.rescued.length * 260 + 300;
      this.step(after, () => {
        add(h("div", { class: "res-row small" }, icon("ic_goo", 34), h("span", { class: "res-label" }, t("result.washed")), h("span", { class: "res-val" }, num(sum.washed)), icon("ic_check", 26), h("span", { class: "res-val" }, `${sum.rooms}/${sum.totalRooms}`)));
        if (sum.rescued.length || sum.result !== "clear") add(h("div", { class: "res-kept" }, t("result.kept")));
        if (!win && sum.result === "fail") add(h("div", { class: "res-tip" }, icon("ic_info", 30), h("span", {}, t(TIPS[sum.deathSource ?? ""] ?? "result.tip.generic"))));
      });
      if (act.showUpgrades) this.step(after + 350, () => {
        this.panel = new UpgradePanel({ compact: true, onCoins: () => this.setCoins(save().coins), onEvolve: act.onEvolve });
        const box = h("div", { class: "res-up" }, h("div", { class: "res-up-title" }, icon("ic_upgrade", 30), h("span", {}, t("result.upgradeHint"))), this.panel.el);
        body.appendChild(box);
        requestAnimationFrame(() => box.classList.add("in"));
        skip.remove();
      });
      else this.step(after + 200, () => skip.remove());
    }
    step(delay, fn, nested = false) {
      if (this.skipped) {
        fn();
        return;
      }
      this.steps.push(fn);
      const id = window.setTimeout(() => {
        const i = this.steps.indexOf(fn);
        if (i >= 0) {
          this.steps.splice(i, 1);
          fn();
        }
      }, delay);
      this.timers.push(id);
      void nested;
    }
    skip() {
      if (this.skipped) return;
      this.skipped = true;
      for (const id of this.timers) clearTimeout(id);
      while (this.steps.length) {
        const f = this.steps.shift();
        f();
      }
      this.el.querySelectorAll(".res-val[data-target]").forEach((el) => {
        el.textContent = num(Number(el.dataset.target));
      });
      this.setCoins(save().coins);
    }
    countUp(el, to, ms) {
      el.dataset.target = String(to);
      const t0 = performance.now();
      let lastTick = 0;
      const tick = () => {
        const k = Math.min(1, (performance.now() - t0) / ms);
        const v = Math.round(to * (1 - Math.pow(1 - k, 3)));
        el.textContent = num(this.skipped ? to : v);
        if (performance.now() - lastTick > 60 && k < 1) {
          audio.play("coin_tick", { vol: 0.35 });
          lastTick = performance.now();
        }
        if (k < 1 && !this.skipped) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    setCoins(n) {
      this.coinEl.textContent = num(n);
      this.coinEl.parentElement.classList.remove("pop");
      void this.coinEl.offsetWidth;
      this.coinEl.parentElement.classList.add("pop");
    }
    done(fn) {
      this.skip();
      fn();
    }
    destroy() {
      for (const id of this.timers) clearTimeout(id);
      this.panel?.destroy();
      this.el.remove();
    }
  };

  // src/ui/title.ts
  var TitleScreen = class {
    constructor(ui, onStart) {
      this.map = new MapView();
      this.time = 0;
      this.map.cleared = () => false;
      this.map.regionLabel = (k) => t(`region.${k}`);
      this.map.current = 1;
      const go = once(() => onStart(), 1e3);
      this.el = h(
        "div",
        { class: "title" },
        h(
          "div",
          { class: "title-logo" },
          h("div", { class: "logo-main" }, t("app.title")),
          t("app.title") !== "Splash Rescue" ? h("div", { class: "logo-sub" }, "Splash Rescue") : null
        ),
        h("div", { class: "title-art" }, icon("a_puppy_happy_1", 92, "ta-pup"), icon("kid_win_2", 150, "ta-kid"), icon("m_blob_hit", 84, "ta-blob")),
        h("button", { class: "btn btn-primary big title-go", onclick: go }, icon("ic_play", 34), h("span", {}, t("title.play")))
      );
      ui.appendChild(this.el);
    }
    layout() {
      this.map.layout(screen.w, screen.h, 0, 0);
      this.map.focus(1);
    }
    frame(dt) {
      this.time += dt;
      this.map.update(dt);
      this.map.scroll -= dt * 6;
      this.map.clampScroll();
      this.map.render(screen.ctx, screen.dpr);
    }
    destroy() {
      this.el.remove();
    }
  };

  // src/app.ts
  var LEVELS = levels_default.slice().sort((a, b) => a.stage - b.stage);
  var App = class {
    constructor(fresh) {
      this.scene = null;
      this.home = null;
      this.ui = document.getElementById("ui");
      this.params = new URLSearchParams(location.search);
      this.last = 0;
      this.acc = 0;
      this.capture = this.params.has("capture");
      this.playing = null;
      // current run (read by the capture tools)
      this.result = null;
      this.fpsSamples = [];
      this.debug = {};
      // ---------------------------------------------------------------- hub
      this.homeScene = null;
      this.fresh = fresh;
      onResize(() => this.scene?.layout?.());
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.scene?.autoPause?.();
          flush();
        } else {
          refreshDay();
        }
      });
      onLangChange(() => {
        if (this.home && this.scene === this.homeScene) this.rebuildHome(this.home.tab);
      });
    }
    start() {
      refreshDay();
      const stage = this.params.get("stage");
      if (this.params.has("editor")) {
        try {
          const d = JSON.parse(localStorage.getItem("splash-editor-test") || "null");
          if (d) {
            const lv = d.level;
            if (d.room) lv.rooms = lv.rooms.slice(d.room).concat(lv.rooms.slice(0, d.room));
            this.startRun(lv, null);
          }
        } catch {
          this.goHome("map");
        }
      } else if (stage) this.playStage(Number(stage));
      else if (this.params.has("home")) this.goHome(this.params.get("home") || "map");
      else this.showTitle();
      if (this.capture) {
        let ct = 0;
        audio.log = [];
        audio.logClock = () => ct;
        const w = window;
        w.__AUDIO_LOG__ = audio.log;
        w.__CAPTURE_T__ = () => ct;
        w.__advance = (n, dt = 1 / 30) => {
          for (let i = 0; i < n; i++) {
            this.tick(dt);
            ct += dt;
          }
        };
        return;
      }
      const loop = (ts) => {
        requestAnimationFrame(loop);
        const dt = this.last ? Math.min(0.1, (ts - this.last) / 1e3) : 1 / 60;
        this.last = ts;
        const cap = quality().fpsCap;
        this.acc += dt;
        if (cap < 60 && this.acc < 1 / cap - 2e-3) return;
        const step = this.acc;
        this.acc = 0;
        this.tick(step);
      };
      requestAnimationFrame(loop);
      setInterval(() => this.reportPerf(), 6e4);
      setInterval(() => this.autoQuality(), 5e3);
    }
    tick(dt) {
      if (dt > 0) {
        this.fpsSamples.push(1 / dt);
        if (this.fpsSamples.length > 600) this.fpsSamples.shift();
      }
      this.scene?.frame(dt);
      this.debug.onFrame?.(dt);
    }
    // Graphics on "auto": if frames keep arriving late (median under 3/4 of the
    // target rate over ~5 s), step down one level. Never steps back up in a session.
    autoQuality() {
      if (save().settings.quality !== "auto" || this.fpsSamples.length < 240) return;
      const a = this.fpsSamples.slice(-240).sort((x, y) => x - y);
      const med = a[120], cap = quality().fpsCap, lvl = qualityLevel();
      if (med >= cap * 0.75 || lvl === "low") return;
      setQuality(lvl === "high" ? "medium" : "low");
      this.fpsSamples.length = 0;
      track("perf_sample", { fpsMedian: Math.round(med), quality: quality().dprCap, lowered: lvl });
    }
    reportPerf() {
      if (this.fpsSamples.length < 60) return;
      const a = this.fpsSamples.slice().sort((x, y) => x - y);
      track("perf_sample", { fpsMedian: Math.round(a[Math.floor(a.length / 2)]), fpsP10: Math.round(a[Math.floor(a.length * 0.1)]), quality: quality().dprCap });
    }
    setScene(s) {
      this.scene?.destroy();
      this.scene = s;
      s?.layout?.();
    }
    // ---------------------------------------------------------------- title
    showTitle() {
      closeAll();
      audio.playMusic("bgm_home");
      const title = new TitleScreen(this.ui, () => {
        if (save().stats.runs === 0) this.playStage(1);
        else this.goHome("map");
      });
      this.home = null;
      this.setScene(title);
    }
    // relabel: rebuild the hub in place (language change) without closing the open popup or re-announcing
    goHome(tab = "map", opts = {}) {
      if (!opts.relabel) closeAll();
      this.result?.destroy();
      this.result = null;
      refreshDay();
      audio.playMusic(tab === "shelter" ? "bgm_shelter" : "bgm_home");
      const home = new HomeScreen({
        levels: LEVELS,
        play: (s) => this.playStage(s),
        playDaily: () => this.playDaily(),
        openSettings: () => openSettings(() => this.home?.refreshCoins()),
        openStreak: () => openStreak(() => {
          this.home?.refreshCoins();
          this.home?.refreshMapState();
          this.home?.syncShelter();
        }),
        openMissions: () => openMissions(() => {
          this.home?.refreshCoins();
          this.home?.refreshMapState();
        }),
        openDaily: () => openDaily(dailyChallenge(LEVELS).mod, () => this.playDaily()),
        evolve: (tier) => openEvolve(tier)
      }, this.ui, tab);
      this.home = home;
      const scene = { frame: (dt) => home.frame(dt), layout: () => home.layout(), destroy: () => home.destroy() };
      this.homeScene = scene;
      this.setScene(scene);
      const origSetTab = home.setTab.bind(home);
      home.setTab = (t2, initial = false) => {
        origSetTab(t2, initial);
        audio.playMusic(t2 === "shelter" ? "bgm_shelter" : "bgm_home");
      };
      if (tab === "shelter" && opts.arrive?.length) home.syncShelter(opts.arrive);
      if (tab === "shelter" && featureOpen("shelter") && !save().flags.unlock_shelter) markAnnounced("shelter");
      if (opts.wash) home.washMap(opts.wash);
      if (!opts.relabel) setTimeout(() => this.announceQueue(), opts.wash ? 1500 : 400);
    }
    rebuildHome(tab) {
      this.goHome(tab, { relabel: true });
    }
    announceQueue() {
      if (!this.home || this.scene !== this.homeScene) return;
      const list = pendingUnlocks().filter((f) => !(f === "shelter" && this.home?.tab === "shelter"));
      const hadUnlocks = list.length > 0;
      const next = () => {
        if (!this.home || this.scene !== this.homeScene) return;
        const f = list.shift();
        if (!f) {
          const s = save();
          const d = today();
          if (!hadUnlocks && !s.streak.claimedToday && s.stats.runs > 0 && !isOpen() && s.flags[`streakShown_${d}`] !== true) {
            s.flags[`streakShown_${d}`] = true;
            markDirty();
            openStreak(() => {
              this.home?.refreshCoins();
              this.home?.refreshMapState();
            });
            return;
          }
          const fk = `festivalShown_${festivalKey()}`;
          if (!hadUnlocks && festivalActive() && !isOpen() && !s.flags[fk]) {
            s.flags[fk] = true;
            markDirty();
            openFestival();
          }
          return;
        }
        markAnnounced(f);
        openUnlock(f, () => {
          this.home?.refreshMapState();
          setTimeout(next, 250);
        });
      };
      next();
    }
    // ---------------------------------------------------------------- play
    playStage(stage) {
      const level2 = LEVELS.find((l) => l.stage === stage) ?? LEVELS[0];
      this.startRun(level2, null);
    }
    playDaily() {
      const d = dailyChallenge(LEVELS);
      track("daily_start", { mod: d.mod });
      this.startRun(d.level, { mod: d.mod, mods: d.mods });
    }
    startRun(level2, daily) {
      closeAll();
      this.result?.destroy();
      this.result = null;
      this.home = null;
      const botName = this.params.get("bot");
      const bot = botName === "expert" ? BOT_EXPERT : botName === "novice" ? BOT_NOVICE : botName ? BOT_PLAYER : void 0;
      const seed = Number(this.params.get("seed") || Math.floor(Math.random() * 1e6));
      const s = save();
      const assist = daily ? 0 : assistFor(level2.stage);
      if (assist) track("assist_offer", { stage: level2.stage, fails: s.attempts[`s${level2.stage}`]?.failsInRow ?? 0, level: assist });
      const attempt = (s.attempts[`s${level2.stage}`]?.tries ?? 0) + 1;
      const play = new PlayScreen({
        level: level2,
        meta: metaPower(assist),
        known: knownSpecies(),
        seed,
        attempt,
        tutorial: level2.stage === 1 && s.stats.runs === 0 && !daily,
        firstRuns: s.stats.runs,
        bot,
        ghostThumb: this.capture && this.params.has("thumb"),
        newMonster: !daily && !s.cleared[`s${level2.stage}`] ? level2.intro ?? null : null,
        revives: 1,
        daily: daily ?? void 0,
        onSettings: () => openSettings(() => {
        })
      }, this.ui, (r) => this.onPlayDone(play, r, !!daily, daily?.mod));
      this.playing = play;
      this.setScene({ frame: (dt) => play.frame(dt), layout: () => play.layout(), destroy: () => play.destroy(), autoPause: () => play.autoPause() });
      if (assist) setTimeout(() => play.announce(t("stage.helpTitle"), t("stage.helpOffer", { hp: Math.round(assist * 30), dmg: Math.round(assist * 20) }), "small"), 1200);
    }
    onPlayDone(play, r, daily, mod) {
      const sum = applyRun(r.run, r.result, r.seconds, r.deathSource, daily);
      if (daily) track("daily_end", { mod, result: r.result });
      flush();
      this.scene = { frame: (dt) => play.renderIdle(dt), layout: () => play.layout(), destroy: () => play.destroy() };
      if (this.params.has("bot") && this.params.has("loop")) {
        setTimeout(() => this.playStage(nextStage()), 1500);
        return;
      }
      this.showResult(sum, daily);
    }
    showResult(sum, daily) {
      const win = sum.result === "clear";
      const next = nextStage();
      const goShelter = sum.newSpecies.length > 0 && featureOpen("shelter");
      const playLabel = win ? daily ? t("result.map") : t("result.next") : t("result.retry");
      const playFn = () => {
        if (daily && win) this.goHome("map");
        else if (daily) this.playDaily();
        else this.playStage(win ? next : sum.stage);
      };
      const primary = goShelter ? { label: t("result.home"), icon: "ic_shelter", fn: () => this.goHome("shelter", { arrive: sum.newSpecies }) } : { label: playLabel, icon: win ? "ic_play" : "ic_reset", fn: playFn };
      const secondary = goShelter ? { label: playLabel, icon: win ? "ic_play" : "ic_reset", fn: playFn } : { label: t("result.map"), icon: "ic_map", fn: () => this.goHome("map", { wash: sum.firstClear ? sum.stage : void 0 }) };
      audio.playMusic(null);
      if (featureOpen("upgrades") && !save().flags.unlock_upgrades) markAnnounced("upgrades");
      this.result = new ResultScreen(this.ui, sum, { primary, secondary, showUpgrades: featureOpen("upgrades"), onEvolve: (tier) => openEvolve(tier), daily });
    }
  };

  // src/main.ts
  async function boot() {
    const t0 = performance.now();
    if (true) (await Promise.resolve().then(() => (init_panel(), panel_exports))).applyPresetFromUrl();
    const { data: data2, fresh } = loadSave();
    setLang(data2.settings.lang === "auto" ? deviceLang() : data2.settings.lang);
    setQuality(data2.settings.quality === "auto" ? defaultQuality() : data2.settings.quality);
    setHaptics(data2.settings.vibration);
    const loading = document.getElementById("loading");
    const fill = loading.querySelector(".load-fill");
    const text = loading.querySelector(".load-text");
    text.textContent = t("loading.text");
    const sub = loading.querySelector(".load-sub");
    if (sub) sub.textContent = t("app.title") === "Splash Rescue" ? "" : "Splash Rescue";
    loading.querySelector(".load-logo").textContent = t("app.title");
    const canvas = document.getElementById("game");
    initScreen(canvas);
    initInput(canvas);
    initModals(document.getElementById("modals"));
    await Promise.all([
      loadAtlases((k) => {
        fill.style.width = `${Math.round(10 + k * 85)}%`;
      }),
      document.fonts ? Promise.race([Promise.all([document.fonts.load("20px Fredoka"), document.fonts.load("20px Jua", "\uAC00")]), new Promise((r) => setTimeout(r, 2500))]) : Promise.resolve()
    ]);
    fill.style.width = "100%";
    audio.init(window.__AUDIO_MANIFEST__ ?? null);
    audio.setVolumes(data2.settings.music, data2.settings.sfx);
    data2.stats.sessions++;
    const gapH = data2.stats.lastSession ? (Date.now() - data2.stats.lastSession) / 36e5 : 0;
    data2.stats.lastSession = Date.now();
    markDirty();
    initAnalytics(data2.installId, data2.stats.sessions, "1.0.0");
    if (fresh) track("install", { lang: document.documentElement.lang, quality: quality().dprCap });
    track("session_start", { session: data2.stats.sessions, daysSinceInstall: Math.floor((Date.now() - data2.createdAt) / 864e5), gapHours: Math.round(gapH) });
    track("load_complete", { ms: Math.round(performance.now() - t0) });
    void auth.signInSilently();
    const app = new App(fresh);
    window.__APP__ = app;
    loading.classList.add("done");
    setTimeout(() => loading.remove(), 500);
    app.start();
    if (true) {
      const dbg = await Promise.resolve().then(() => (init_panel(), panel_exports));
      dbg.initDebug(app);
    }
    const sessionStart = Date.now();
    window.addEventListener("pagehide", () => {
      save().stats.playSeconds += Math.round((Date.now() - sessionStart) / 1e3);
      markDirty();
      flush();
      track("session_end", { seconds: Math.round((Date.now() - sessionStart) / 1e3) });
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) flush();
    });
  }
  boot().catch((e) => {
    console.error(e);
    const el = document.querySelector("#loading .load-text");
    if (el) el.textContent = "Error: " + (e && e.message ? e.message : e);
    track("error", { message: String(e && e.message) });
  });
})();
