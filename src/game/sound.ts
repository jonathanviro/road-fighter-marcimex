const AUDIO_SOURCES = {
  soundtrack1: "assets/sounds/soundtrack-lvl-1.mp3",
  countdown: "assets/sounds/cuenta-regresiva.mp3",
  fail: "assets/sounds/fail.mp3",
  loser: "assets/sounds/loser.mp3",
  fuel: "assets/sounds/fuel-coin.mp3",
  win: "assets/sounds/win.mp3",
} as const;

type SoundName = keyof typeof AUDIO_SOURCES;
type MusicName = "soundtrack1";

// La música de fondo va más baja para que se escuchen bien los efectos.
const MUSIC_VOLUME = 0.45;
const SFX_VOLUME = 1;

class SoundManager {
  private cache = new Map<SoundName, HTMLAudioElement>();
  private music: HTMLAudioElement | null = null;
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;
    for (const [name, src] of Object.entries(AUDIO_SOURCES)) {
      const audio = new Audio(src);
      audio.preload = "auto";
      this.cache.set(name as SoundName, audio);
    }
  }

  private element(name: SoundName): HTMLAudioElement | null {
    return this.cache.get(name) ?? null;
  }

  play(name: SoundName) {
    if (!this.initialized) return;
    const el = this.element(name);
    if (!el) return;
    try {
      el.currentTime = 0;
      el.volume = SFX_VOLUME;
      void el.play().catch(() => {});
    } catch {
      // ignorar
    }
  }

  playMusic(name: MusicName) {
    if (!this.initialized) return;
    const el = this.element(name);
    if (!el) return;
    if (this.music === el) {
      if (el.paused) void el.play().catch(() => {});
      return;
    }
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }
    this.music = el;
    el.loop = true;
    el.volume = MUSIC_VOLUME;
    el.currentTime = 0;
    void el.play().catch(() => {});
  }

  stopMusic() {
    if (!this.music) return;
    this.music.pause();
    this.music.currentTime = 0;
    this.music = null;
  }

  pauseAll() {
    for (const el of this.cache.values()) el.pause();
    this.music = null;
  }
}

export const sound = new SoundManager();
