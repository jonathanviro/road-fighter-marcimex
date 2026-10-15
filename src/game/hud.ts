import { VIRTUAL_WIDTH, MAX_LIVES, MAX_FUEL, BOOST_MAX_SECONDS, BOOST_COLOR } from "./config";

interface HudData {
  score: number;
  lives: number;
  maxLives: number;
  fuel: number;
  boostTimer: number;
  progressPct: number;
}

const BAR_Y = 18;
const BAR_H = 14;
const ROW_Y = 60;

export function drawHud(ctx: CanvasRenderingContext2D, data: HudData) {
  ctx.save();

  // Fondo translúcido de la franja superior
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, 172);

  // --- Barra de progreso (meta) ---
  const barMargin = 24;
  const barW = VIRTUAL_WIDTH - barMargin * 2;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(barMargin, BAR_Y, barW, BAR_H);
  ctx.fillStyle = "#FFD400";
  ctx.fillRect(barMargin, BAR_Y, (barW * Math.max(0, Math.min(100, data.progressPct))) / 100, BAR_H);
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(barMargin, BAR_Y, barW, BAR_H);

  // --- Vidas (izquierda) ---
  ctx.textBaseline = "middle";
  ctx.font = "bold 40px system-ui, Arial";
  ctx.textAlign = "left";
  const heartsStr = `❤ ${data.lives}/${data.maxLives}`;
  ctx.fillStyle = "#fff";
  ctx.fillText(heartsStr, barMargin, ROW_Y + 34);

  // --- Score (centro) ---
  ctx.textAlign = "center";
  ctx.font = "bold 44px system-ui, Arial";
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 5;
  const scoreStr = `${Math.round(data.score)}`;
  ctx.strokeText(scoreStr, VIRTUAL_WIDTH / 2, ROW_Y + 34);
  ctx.fillStyle = "#fff";
  ctx.fillText(scoreStr, VIRTUAL_WIDTH / 2, ROW_Y + 34);

  // --- Fuel (derecha) ---
  const fuelBarW = 260;
  const fuelBarH = 36;
  const fuelX = VIRTUAL_WIDTH - barMargin - fuelBarW;
  const fuelY = ROW_Y + 10;
  const fuelRatio = Math.max(0, Math.min(1, data.fuel / MAX_FUEL));
  const lowFuel = fuelRatio <= 0.2;

  // Fondo con sombra para que resalte sobre la pista
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(fuelX - 6, fuelY - 6, fuelBarW + 12, fuelBarH + 12);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(fuelX, fuelY, fuelBarW, fuelBarH);

  const fuelColor = fuelRatio > 0.5 ? "#4CAF50" : lowFuel ? "#F44336" : "#FFC107";
  ctx.fillStyle = fuelColor;
  ctx.fillRect(fuelX, fuelY, fuelBarW * fuelRatio, fuelBarH);

  // Borde que parpadea en rojo cuando el tanque está crítico
  if (lowFuel && Math.floor(Date.now() / 400) % 2 === 0) {
    ctx.strokeStyle = "#F44336";
    ctx.lineWidth = 5;
  } else {
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
  }
  ctx.strokeRect(fuelX, fuelY, fuelBarW, fuelBarH);

  ctx.font = "bold 26px system-ui, Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#111";
  ctx.fillText(`⚡ ${Math.round(data.fuel)}`, fuelX + fuelBarW / 2, fuelY + fuelBarH / 2 + 1);

  // Aviso parpadeante cuando está por quedarse sin combustible
  if (lowFuel) {
    ctx.font = "bold 24px system-ui, Arial";
    ctx.textAlign = "right";
    ctx.fillStyle = "#F44336";
    ctx.fillText("¡SIN ENERGÍA!", VIRTUAL_WIDTH - barMargin, fuelY + fuelBarH + 24);
  }

  // --- Boost: tiempo restante cuando está activo ---
  if (data.boostTimer > 0) {
    const boostY = fuelY + fuelBarH + 14;
    const boostRatio = Math.max(0, Math.min(1, data.boostTimer / BOOST_MAX_SECONDS));

    ctx.font = "bold 22px system-ui, Arial";
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(fuelX - 6, boostY - 6, fuelBarW + 12, fuelBarH + 12);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(fuelX, boostY, fuelBarW, fuelBarH);
    ctx.fillStyle = BOOST_COLOR;
    ctx.fillRect(fuelX, boostY, fuelBarW * boostRatio, fuelBarH);
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(fuelX, boostY, fuelBarW, fuelBarH);

    ctx.font = "bold 26px system-ui, Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#111";
    ctx.fillText(
      `⚡⚡⚡ ${data.boostTimer.toFixed(1)}s`,
      fuelX + fuelBarW / 2,
      boostY + fuelBarH / 2 + 1,
    );
  }

  ctx.restore();
}
