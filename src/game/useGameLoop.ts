import { useEffect, useRef, useState } from "react";
import { loadGameImages } from "./loader";
import { drawHud } from "./hud";
import { sound } from "./sound";
import type { Entity, GameImages } from "./types";
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  ROAD_LEFT_BOUND,
  ROAD_RIGHT_BOUND,
  PLAYER_TOP_BOUND,
  PLAYER_BOTTOM_BOUND,
  PLAYER_START_Y,
  MAX_LIVES,
  MAX_FUEL,
  FUEL_DRAIN_PER_SEC,
  INVULNERABLE_SECONDS,
  FUEL_START_SECONDS,
  FUEL_LOW_THRESHOLD,
  BOOST_MULTIPLIER,
  BOOST_END_SPAWN_GRACE,
  BOOST_PAIR_INTERVAL,
  BOOST_PAIR_STAGGER,
  FUEL_ITEM_BOOST,
  FUEL_ITEM_AMOUNT,
  OIL_SLOW_MULTIPLIER,
  FUEL_FLOATER_SECONDS,
  FUEL_GAIN_COLOR,
  FUEL_LOSS_COLOR,
  FUEL_SAFE_ZONE,
  BASE_SCROLL_SPEED,
  START_SPEED_MULTIPLIER,
  END_SPEED_MULTIPLIER,
  SPAWN_INTERVAL_MIN,
  SPAWN_INTERVAL_MAX,
  SPAWN_X_MARGIN,
  SPAWN_Y_SAFE_ZONE,
  SPAWN_MAX_ATTEMPTS,
  SPAWN_BURST_SIZE,
  SPAWN_LANES,
  SPAWN_BURST_STAGGER,
  SIDE_BY_SIDE_X_RANGE,
  SIDE_BY_SIDE_Y_EPSILON,
  SIDE_BY_SIDE_SPEEDUP,
  SPAWN_QUEUE_GAP,
  SPAWN_OIL_SAFE_ZONE,
  ENEMY_SPEED_MIN,
  ENEMY_SPEED_MAX,
  SCORE_PER_SECOND,
  PLAYER_W,
  PLAYER_H,
  FUEL_W,
  FUEL_H,
  OIL_W,
  OIL_H,
  loadSettings
} from "./config";

export type GameEndReason = "fuel" | "crashes" | "finished";

export interface HudSnapshot {
  score: number;
  lives: number;
  fuel: number;
  progressPct: number; // 0-100

  countdown: number | null; // 3,2,1 o null si no aplica

  finished: boolean; // partida completada exitosamente (lanza confeti)
}

interface UseGameLoopParams {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onGameEnd: (score: number, reason: GameEndReason) => void;
  started: boolean; // true cuando el jugador cerró las instrucciones

}

export function useGameLoop({ canvasRef, onGameEnd, started }: UseGameLoopParams) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [hud, setHud] = useState<HudSnapshot>({
    score: 0,
    lives: MAX_LIVES,
    fuel: MAX_FUEL,
    progressPct: 0,

    countdown: null,

    finished: false,
  });

  const imagesRef = useRef<GameImages | null>(null);
  const onGameEndRef = useRef(onGameEnd);
  onGameEndRef.current = onGameEnd;
  const startedRef = useRef(started);
  startedRef.current = started;

  useEffect(() => {
    let alive = true;
    loadGameImages().then((imgs) => {
      if (!alive) return;
      imagesRef.current = imgs;
      setReady(true);
    }).catch(e => {if (alive) setError(e.message);});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const imgs = imagesRef.current;
    if (!canvas || !imgs) return;
    const canvasEl: HTMLCanvasElement = canvas;
    const ctx = canvasEl.getContext("2d")!;

    const settings = loadSettings();
    const duration = settings.duration;


    let levelTime = 0; // segundos transcurridos en el nivel actual
    let score = 0;
    let lives = settings.lives;
    let fuel = MAX_FUEL;
    let scrollOffset = 0;
    let entities: Entity[] = [];
    let spawnTimer = 3; // los primeros enemigos no aparecen hasta ~3s de juego
    let totalTime = 0;
    let boostTimer = 0; // segundos restantes de velocidad máxima
    let boostPairTimer = 1.5; // al arrancar el boost, el primer par llega pronto
    let slowTimer = 0; // segundos restantes de freno (combustible malo)
    let fuelTimer = settings.fuelInterval;
    let oilTimer = settings.oilInterval;
    let floaters: {
      text: string;
      x: number;
      y: number;
      color: string;
      life: number; // 1 -> 0, se desvanece mientras sube
    }[] = [];

    let playerX = VIRTUAL_WIDTH / 2;
    let playerY = PLAYER_START_Y;
    let playerPose: "straight" | "left" | "right" = "straight";
    let dragging = false;

    let invulnerableTimer = 0;
    let countdown: number | null = null; // 3-2-1, inicia al cerrar instrucciones
    let countdownTimer = 0;
    let initialCountdown = true; // distingue el inicio de la vida perdida
    let frozen = false; // congela el juego durante countdown / game over
    let gameEnded = false;
    let finished = false; // recorrido completado
    let countdownStarted = false; // evita disparar la cuenta regresiva dos veces

    let musicStarted = false; // la música arranca cuando el juego empieza


    function easeInQuad(t: number): number {
      return t * t;
    }


    function speedMultiplier(): number {
      const t = Math.min(1, levelTime / duration);
      return START_SPEED_MULTIPLIER + (END_SPEED_MULTIPLIER - START_SPEED_MULTIPLIER) * easeInQuad(t);
    }



    function rampScrollSpeed() {
      return BASE_SCROLL_SPEED * speedMultiplier() * settings.speedPercent / 100;
    }

    function currentScrollSpeed() {
      if (boostTimer > 0) return BASE_SCROLL_SPEED * BOOST_MULTIPLIER * settings.speedPercent / 100;
      if (slowTimer > 0)
        return BASE_SCROLL_SPEED * OIL_SLOW_MULTIPLIER * settings.speedPercent / 100;
      return rampScrollSpeed();
    }

    function roadImage() {
      return imgs!.roadLevel1;
    }




    function hasSpaceFor(x: number, w: number, zonePx = SPAWN_Y_SAFE_ZONE): boolean {
      const left = x - w / 2 - SPAWN_X_MARGIN;
      const right = x + w / 2 + SPAWN_X_MARGIN;
      for (const ent of entities) {
        if (ent.y > zonePx) continue; // fuera de la zona, no importa
        const entLeft = ent.x - ent.w / 2;
        const entRight = ent.x + ent.w / 2;
        if (left < entRight && right > entLeft) return false;
      }
      return true;
    }

    function randomEnemyKind(): {
      kind: Entity["kind"];
      w: number;
      h: number;
    } {
      const kind = ["car_a", "car_b", "car_c", "car_d", "car_e", "car_f"][Math.floor(Math.random() * 6)] as Entity["kind"];
      const image = {car_a: imgs!.enemyCarA, car_b: imgs!.enemyCarB, car_c: imgs!.enemyCarC, car_d: imgs!.enemyCarD, car_e: imgs!.enemyCarE, car_f: imgs!.enemyCarF}[kind as "car_a" | "car_b" | "car_c" | "car_d" | "car_e" | "car_f"];
      const w = kind === "car_e" || kind === "car_f" ? 80 : 100;
      return { kind, w, h: w * image.height / image.width };
    }

    function randomEnemyFactor() {





      return (
        ENEMY_SPEED_MIN +
        Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN)
      );
    }

    function spawnEnemyInBand(
      kind: Entity["kind"],
      w: number,
      h: number,
      band: number,
      yOffset = 0,
    ) {
      const laneWidth = (ROAD_RIGHT_BOUND - ROAD_LEFT_BOUND) / SPAWN_LANES;
      const zonePx = kind === "oil" ? SPAWN_OIL_SAFE_ZONE : SPAWN_Y_SAFE_ZONE;
      for (let attempt = 0; attempt < SPAWN_LANES; attempt++) {
        const lane = (band + attempt) % SPAWN_LANES;
        const x = ROAD_LEFT_BOUND + laneWidth * (lane + 0.5);
        if (hasSpaceFor(x, w, zonePx)) {
          const factor =
            kind === "oil" ? 1 : randomEnemyFactor();
          entities.push({
            kind,
            x,
            y: -h + yOffset, // nace arriba y baja hacia el jugador
            w,
            h,
            speed: factor * currentScrollSpeed(),
            speedFactor: factor,
          });
          return;
        }
      }
    }

    function spawnFuelItem(kind: Entity["kind"]) {



      for (let attempt = 0; attempt < SPAWN_MAX_ATTEMPTS; attempt++) {
        const x = ROAD_LEFT_BOUND + (Math.floor(Math.random() * SPAWN_LANES) + 0.5) * (ROAD_RIGHT_BOUND - ROAD_LEFT_BOUND) / SPAWN_LANES;
        if (hasSpaceFor(x, FUEL_W, FUEL_SAFE_ZONE)) {
          entities.push({
            kind,
            x,
            y: -FUEL_H,
            w: FUEL_W,
            h: FUEL_H,


            speed: currentScrollSpeed(),
            speedFactor: 1,
          });
          return;
        }
      }
    }


    function shuffledLanes() {
      const lanes = Array.from({ length: SPAWN_LANES }, (_, i) => i);
      for (let i = lanes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
      }
      return lanes;
    }

    function spawnEntity() {



      const lanes = shuffledLanes();
      for (let n = 0; n < SPAWN_BURST_SIZE; n++) {
        const e = randomEnemyKind();
        const yOffset = n === 0 ? 0 : -SPAWN_BURST_STAGGER;
        spawnEnemyInBand(e.kind, e.w, e.h, lanes[n], yOffset);
      }
    }

    function spawnBoostPair() {



      const lanes = shuffledLanes();
      for (let n = 0; n < SPAWN_BURST_SIZE; n++) {
        const e = randomEnemyKind();
        const yOffset = n === 0 ? 0 : -BOOST_PAIR_STAGGER;
        spawnEnemyInBand(e.kind, e.w, e.h, lanes[n], yOffset);
      }
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, delay: number) => timers.push(setTimeout(fn, delay));
    function triggerLifeLoss() {
      if (frozen) return;
      lives -= 1;
      sound.play("fail");
      if (lives <= 0) {
        frozen = true;
        gameEnded = true;
        sound.stopMusic();
        later(() => sound.play("loser"), 700);
        later(() => onGameEndRef.current(Math.round(score), "crashes"), 900);
        return;
      }
      frozen = true;
      countdown = 3;
      countdownTimer = 1;
      initialCountdown = false;
      invulnerableTimer = INVULNERABLE_SECONDS;
      sound.play("countdown");
    }

    function triggerFuelLoss() {
      if (frozen || gameEnded) return;
      frozen = true;
      gameEnded = true;
      sound.stopMusic();
      later(() => sound.play("loser"), 400);
      later(() => onGameEndRef.current(Math.round(score), "fuel"), 600);
    }

    function pushFloater(text: string, color: string, offsetY = 0) {

      floaters.push({
        text,
        x: playerX,
        y: playerY - PLAYER_H / 2 + offsetY,
        color,
        life: FUEL_FLOATER_SECONDS,
      });

      if (floaters.length > 8) floaters.shift();
    }

    let _scale = 1;
    let _ox = 0;
    let _oy = 0;

    function toVirtual(clientX: number, clientY: number) {
      const r = canvasEl.getBoundingClientRect();
      return {
        x: (clientX - r.left - _ox) / _scale,
        y: (clientY - r.top - _oy) / _scale,
      };
    }

    function updatePlayerPosition(clientX: number, clientY: number) {
      const v = toVirtual(clientX, clientY);
      const halfW = PLAYER_W / 2;
      const minX = ROAD_LEFT_BOUND + halfW;
      const maxX = ROAD_RIGHT_BOUND - halfW;
      const clampedX = Math.max(minX, Math.min(maxX, v.x));
      const clampedY = Math.max(
        PLAYER_TOP_BOUND,
        Math.min(PLAYER_BOTTOM_BOUND, v.y),
      );

      if (clampedX < playerX - 2) playerPose = "left";
      else if (clampedX > playerX + 2) playerPose = "right";
      else playerPose = "straight";

      playerX = clampedX;
      playerY = clampedY;
    }

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      canvasEl.setPointerCapture(e.pointerId);
      dragging = true;
      updatePlayerPosition(e.clientX, e.clientY);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      updatePlayerPosition(e.clientX, e.clientY);
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      if (canvasEl.hasPointerCapture(e.pointerId)) canvasEl.releasePointerCapture(e.pointerId);
      playerPose = "straight";
    };

    canvasEl.addEventListener("pointerdown", onPointerDown);
    canvasEl.addEventListener("pointermove", onPointerMove);
    canvasEl.addEventListener("pointerup", onPointerUp);
    canvasEl.addEventListener("pointercancel", onPointerUp);

    const resize = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    };
    resize();
    addEventListener("resize", resize);

    let raf = 0;
    let last = performance.now();
    let hudTimer = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;


      if (startedRef.current && !countdownStarted && !gameEnded) {
        countdownStarted = true;
        countdown = 3;
        countdownTimer = 1;
        frozen = true;
        initialCountdown = true;
        sound.play("countdown");
      }

      if (countdown !== null) {
        countdownTimer -= dt;
        if (countdownTimer <= 0) {
          countdown -= 1;
          countdownTimer = 1;
          if (countdown <= 0) {
            countdown = null;
            frozen = false;

            if (!musicStarted) {
              musicStarted = true;
              sound.playMusic("soundtrack1");
            }
          }
        }
      }

      const finishImg = imgs!.finish;
      const finishFw = ROAD_RIGHT_BOUND - ROAD_LEFT_BOUND;
      const finishFh =
        finishImg.height > 0 ? finishFw * (finishImg.height / finishImg.width) : 0;
      const finishY =
        playerY -
        rampScrollSpeed() * (duration - levelTime);

      if (!frozen && !gameEnded && startedRef.current) {
        const scrollSpeed = currentScrollSpeed();
        scrollOffset += scrollSpeed * dt;
        levelTime += dt;
        totalTime += dt;
        score += SCORE_PER_SECOND * dt;

        fuel -= FUEL_DRAIN_PER_SEC * dt;
        if (fuel <= 0) {
          fuel = 0;
          triggerFuelLoss();
        }

        if (invulnerableTimer > 0) invulnerableTimer -= dt;
        if (boostTimer > 0) {
          boostTimer -= dt;
          if (boostTimer <= 0) {
            boostTimer = 0;

            spawnTimer = Math.max(spawnTimer, BOOST_END_SPAWN_GRACE);
          }
        }
        if (slowTimer > 0) slowTimer -= dt;



        if (!(finishY > -SPAWN_Y_SAFE_ZONE)) {
          if (boostTimer <= 0) {
            spawnTimer -= dt;
            if (spawnTimer <= 0) {
              spawnTimer =
                SPAWN_INTERVAL_MIN +
                Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
              spawnEntity();
            }
          } else {
            boostPairTimer -= dt;
            if (boostPairTimer <= 0) {
              boostPairTimer = BOOST_PAIR_INTERVAL;
              spawnBoostPair();
            }
          }





          const canSpawnFuel =
            totalTime >= FUEL_START_SECONDS || fuel < FUEL_LOW_THRESHOLD;
          fuelTimer -= dt;
          if (canSpawnFuel) {
            if (fuelTimer <= 0) {
              fuelTimer = settings.fuelInterval;
              spawnFuelItem("fuel");
            }
          }
          oilTimer -= dt;
          if (oilTimer <= 0) {
            oilTimer = settings.oilInterval;
            spawnEnemyInBand("oil", OIL_W, OIL_H, Math.floor(Math.random() * SPAWN_LANES));
          }
        }





        const vehicles = entities.filter(
          (e) => e.kind.startsWith("car_"),
        );
        const entScrollSpeed = currentScrollSpeed();
        for (const ent of entities) {
          if (ent.speedFactor !== undefined) {
            ent.speed = ent.speedFactor * entScrollSpeed;
          }
        }





        for (let i = 0; i < vehicles.length; i++) {
          const a = vehicles[i];
          for (let j = i + 1; j < vehicles.length; j++) {
            const b = vehicles[j];
            if (Math.abs(a.x - b.x) > SIDE_BY_SIDE_X_RANGE) continue;
            if (Math.abs(a.y - b.y) > SIDE_BY_SIDE_Y_EPSILON) continue;
            const front = a.y > b.y ? a : b; // el que va más adelante (abajo)
            const back = front === a ? b : a;
            front.speed = Math.min(
              Math.max(front.speed, back.speed) * SIDE_BY_SIDE_SPEEDUP,
              entScrollSpeed,
            );
          }
        }

        for (const ent of entities) {
          ent.y += ent.speed * dt;
        }





        vehicles.sort((a, b) => b.y - a.y); // frente (abajo) primero
        for (let i = 1; i < vehicles.length; i++) {
          const back = vehicles[i];
          for (let j = 0; j < i; j++) {
            const front = vehicles[j];
            if (Math.abs(back.x - front.x) >= (back.w + front.w) / 2 - 4) continue;


            const minGap = (back.h + front.h) / 2 + SPAWN_QUEUE_GAP;
            if (front.y - back.y < minGap) {
              back.y = front.y - minGap;
            }
          }
        }

        const survivors: Entity[] = [];
        for (const ent of entities) {
          if (ent.y - ent.h / 2 > VIRTUAL_HEIGHT + 60) continue;

          const overlapX =
            Math.abs(ent.x - playerX) < (ent.w + PLAYER_W) / 2 - 14;
          const overlapY =
            Math.abs(ent.y - playerY) < (ent.h + PLAYER_H) / 2 - 14;

          if (!frozen && overlapX && overlapY) {
            if (ent.kind === "fuel") {
              const energyGain = Math.min(FUEL_ITEM_AMOUNT, MAX_FUEL - fuel);
              fuel = Math.min(MAX_FUEL, fuel + FUEL_ITEM_AMOUNT);
              score += settings.fuelPoints;
              boostTimer = FUEL_ITEM_BOOST;
              slowTimer = 0;
              sound.play("fuel");
              pushFloater(`+${settings.fuelPoints} PUNTOS`, FUEL_GAIN_COLOR);
              pushFloater(`+${Math.round(energyGain)} ENERGÍA`, FUEL_GAIN_COLOR, 66);
              continue;
            }
            if (ent.kind === "oil") {
              score = Math.max(0, score - settings.oilPenalty);
              slowTimer = settings.oilSlowSeconds;
              boostTimer = 0;
              sound.play("fail");
              pushFloater(`−${settings.oilPenalty} PUNTOS`, FUEL_LOSS_COLOR);
              continue;
            }

            if (invulnerableTimer <= 0) {
              triggerLifeLoss();
              continue;
            }
          }
          survivors.push(ent);
        }
        entities = survivors;

        if (!gameEnded && levelTime >= duration) {
          frozen = true; gameEnded = true; finished = true;
          sound.stopMusic(); sound.play("win");
          later(() => onGameEndRef.current(Math.round(score), "finished"), 300);
        }
      }

      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      const scale = Math.min(
        canvasEl.width / VIRTUAL_WIDTH,
        canvasEl.height / VIRTUAL_HEIGHT,
      );
      const vw = VIRTUAL_WIDTH * scale;
      const vh = VIRTUAL_HEIGHT * scale;
      const ox = (canvasEl.width - vw) / 2;
      const oy = (canvasEl.height - vh) / 2;
      _scale = scale;
      _ox = ox;
      _oy = oy;

      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);



      const bg = roadImage();
      if (bg.height > 0) {
        const bgH = bg.height;
        const overlap = 1;
        const offset = (-scrollOffset) % bgH;
        for (let y = -offset - bgH; y < VIRTUAL_HEIGHT; y += bgH) {
          ctx.drawImage(bg, 0, Math.round(y), VIRTUAL_WIDTH, bgH + overlap);
        }
      }

      if (finishFh > 0 && finishY + finishFh > 0 && finishY < VIRTUAL_HEIGHT) {
        ctx.drawImage(finishImg, ROAD_LEFT_BOUND, finishY, finishFw, finishFh);
      }

      for (const ent of entities) {
        let img: HTMLImageElement;
        const imageMap = {car_a: imgs!.enemyCarA, car_b: imgs!.enemyCarB, car_c: imgs!.enemyCarC, car_d: imgs!.enemyCarD, car_e: imgs!.enemyCarE, car_f: imgs!.enemyCarF, fuel: imgs!.fuelItem, oil: imgs!.oilSlick};
        img = imageMap[ent.kind];
        ctx.save();
        ctx.drawImage(
          img,
          ent.x - ent.w / 2,
          ent.y - ent.h / 2,
          ent.w,
          ent.h,
        );
        ctx.restore();
      }

      const showPlayer =
        invulnerableTimer <= 0 || Math.floor(now / 100) % 2 === 0;
      if (showPlayer) {
        const playerImg =
          playerPose === "left"
            ? imgs!.playerLeft
            : playerPose === "right"
              ? imgs!.playerRight
              : imgs!.playerStraight;
        ctx.drawImage(
          playerImg,
          playerX - (PLAYER_H * playerImg.width / playerImg.height) / 2,
          playerY - PLAYER_H / 2,
          PLAYER_H * playerImg.width / playerImg.height,
          PLAYER_H,
        );
      }

      if (floaters.length > 0) {
        ctx.font = "bold 56px system-ui, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = floaters.length - 1; i >= 0; i--) {
          const f = floaters[i];
          f.life -= dt;
          f.y -= 70 * dt;
          if (f.life <= 0) {
            floaters.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = Math.min(1, f.life * 1.5);
          ctx.lineWidth = 8;
          ctx.strokeStyle = "rgba(0,0,0,0.7)";
          ctx.strokeText(f.text, f.x, f.y);
          ctx.fillStyle = f.color;
          ctx.fillText(f.text, f.x, f.y);
        }
        ctx.globalAlpha = 1;
      }

      const progressPct = Math.min(
        100,
        (levelTime / duration) * 100,
      );
      drawHud(ctx, { score, lives, maxLives: settings.lives, fuel, boostTimer, progressPct });

      if (countdown !== null && countdown > 0) {
        ctx.save();
        ctx.font = "bold 220px system-ui, Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 10;
        ctx.strokeText(
          String(countdown),
          VIRTUAL_WIDTH / 2,
          VIRTUAL_HEIGHT / 2,
        );
        ctx.fillStyle = "#FFD400";
        ctx.fillText(String(countdown), VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2);
        ctx.font = "bold 44px system-ui, Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText(
          initialCountdown ? "¡Prepárate!" : "¡Vida perdida! Continúa...",
          VIRTUAL_WIDTH / 2,
          VIRTUAL_HEIGHT / 2 + 160,
        );
        ctx.restore();
      }

      ctx.restore();


      hudTimer += dt;
      if (hudTimer >= 0.1 || countdown !== null) {
        hudTimer = 0;
        setHud({
          score: Math.round(score),
          lives: Math.max(0, lives),
          fuel: Math.max(0, Math.round(fuel)),
          progressPct: Math.round(progressPct),
          countdown,
          finished,
        });
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      canvasEl.removeEventListener("pointerdown", onPointerDown);
      canvasEl.removeEventListener("pointermove", onPointerMove);
      canvasEl.removeEventListener("pointerup", onPointerUp);
      canvasEl.removeEventListener("pointercancel", onPointerUp);
      sound.stopMusic();
    };
  }, [ready, canvasRef]);

  return { ready, hud, error };
}
