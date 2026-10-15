// MotoPower / Marcimex — lienzo vertical y reglas de campaña.
export const VIRTUAL_WIDTH = 1080;
export const VIRTUAL_HEIGHT = 1920;
export const ROAD_LEFT_BOUND = 208;
export const ROAD_RIGHT_BOUND = 865;
export const PLAYER_TOP_BOUND = VIRTUAL_HEIGHT * 0.22;
export const PLAYER_BOTTOM_BOUND = VIRTUAL_HEIGHT * 0.92;
export const PLAYER_START_Y = VIRTUAL_HEIGHT * 0.78;
export const EVENT_START = "2026-10-14T00:00:00-05:00";
export const EVENT_END = "2027-01-14T23:59:59-05:00";
export const MAX_LIVES = 2;
export const MAX_FUEL = 100;
export const FUEL_DRAIN_PER_SEC = 1.5;
export const INVULNERABLE_SECONDS = 1.5;
export const FUEL_START_SECONDS = 3;
export const FUEL_LOW_THRESHOLD = 50;
export const BOOST_MULTIPLIER = 3.0;
export const BOOST_END_SPAWN_GRACE = 1.5;
export const BOOST_MAX_SECONDS = 5;
export const BOOST_COLOR = "#00E5FF";
export const BOOST_PAIR_INTERVAL = 3.5;
export const BOOST_PAIR_STAGGER = 320;
export const FUEL_ITEM_BOOST = 5;
export const FUEL_ITEM_AMOUNT = 15;
export const OIL_SLOW_MULTIPLIER = 0.8;
export const FUEL_FLOATER_SECONDS = 1;
export const FUEL_GAIN_COLOR = "#4CAF50";
export const FUEL_LOSS_COLOR = "#F44336";
export const FUEL_SAFE_ZONE = 520;
export const BASE_SCROLL_SPEED = 420;
export const START_SPEED_MULTIPLIER = 1.15;
export const END_SPEED_MULTIPLIER = 2.4;
export const SPAWN_INTERVAL_MIN = 3.0;
export const SPAWN_INTERVAL_MAX = 4.0;
export const SPAWN_X_MARGIN = 24;
export const SPAWN_Y_SAFE_ZONE = 260;
export const SPAWN_MAX_ATTEMPTS = 6;
export const SPAWN_BURST_SIZE = 2;
export const SPAWN_LANES = 4;
export const SPAWN_BURST_STAGGER = 400;
export const SIDE_BY_SIDE_X_RANGE = 250;
export const SIDE_BY_SIDE_Y_EPSILON = 180;
export const SIDE_BY_SIDE_SPEEDUP = 1.5;
export const SPAWN_QUEUE_GAP = 160;
export const SPAWN_OIL_SAFE_ZONE = VIRTUAL_HEIGHT;
export const ENEMY_SPEED_MIN = 0.45;
export const ENEMY_SPEED_MAX = 0.7;
export const SCORE_PER_SECOND = 10;
export const PLAYER_W = 78;
export const PLAYER_H = 166;
export const FUEL_W = 80;
export const FUEL_H = 90;
export const OIL_W = 100;
export const OIL_H = 60;

export function isEventActive(): boolean {
  const now = Date.now();
  const start = new Date(EVENT_START).getTime();
  const end = new Date(EVENT_END).getTime();
  return now >= start && now <= end;
}

// Settings belong to this campaign and persist on the local kiosk.
export interface GameSettings {
  duration: number;
  lives: number;
  oilPenalty: number;
  oilSlowSeconds: number;
  fuelPoints: number;
  fuelInterval: number;
  oilInterval: number;
  speedPercent: number;
}
export const defaultSettings: GameSettings = {
  duration: 90, lives: 2, oilPenalty: 100, oilSlowSeconds: 3,
  fuelPoints: 50, fuelInterval: 3, oilInterval: 5, speedPercent: 100,
};
export function loadSettings(): GameSettings {
  try {
    const value = JSON.parse(localStorage.getItem("motopower-settings-v1") || "{}");
    return sanitizeSettings(value);
  } catch { return { ...defaultSettings }; }
}
export function sanitizeSettings(value: Partial<GameSettings>): GameSettings {
  const number = (v: unknown, fallback: number, min: number, max: number) =>
    typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.round(v))) : fallback;
  return {
    duration: number(value?.duration, 90, 5, 120),
    lives: number(value?.lives, 2, 1, 9),
    oilPenalty: number(value?.oilPenalty, 100, 0, 9999),
    oilSlowSeconds: number(value?.oilSlowSeconds, 3, 1, 15),
    fuelPoints: number(value?.fuelPoints, 50, 0, 1000),
    fuelInterval: number(value?.fuelInterval, 3, 1, 30),
    oilInterval: number(value?.oilInterval, 5, 1, 30),
    speedPercent: number(value?.speedPercent, 100, 50, 200),
  };
}
export function saveSettings(value: GameSettings) {
  localStorage.setItem("motopower-settings-v1", JSON.stringify(sanitizeSettings(value)));
}
