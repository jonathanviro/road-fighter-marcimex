import BrandModal from "./BrandModal";
import { loadSettings, FUEL_ITEM_AMOUNT } from "../game/config";
export default function InstructionsOverlay({onStart}:{onStart:()=>void}) {
  const s = loadSettings();
  return <BrandModal><p className="eyebrow">BIKE LIFE · MARCIMEX</p><h1>¡DOMINA LA PISTA!</h1>
    <ul className="instructions">
      <li>Arrastra tu moto con el dedo para esquivar el tráfico.</li>
      <li>Tienes <b>{s.lives} {s.lives===1 ? "vida" : "vidas"}</b>. Cada choque con un vehículo te quita una.</li>
      <li>Recoge combustible para recuperar hasta <b>{FUEL_ITEM_AMOUNT} de energía</b>, sumar <b>{s.fuelPoints} puntos</b> y activar el impulso.</li>
      <li>Evita el aceite: resta <b>{s.oilPenalty} puntos</b> y reduce tu velocidad durante <b>{s.oilSlowSeconds} segundos</b>.</li>
      <li>La partida termina si pierdes tus vidas o te quedas sin energía. ¡Llega a la meta en {s.duration} segundos!</li>
    </ul><button className="primary full" onClick={onStart}>COMENZAR</button>
  </BrandModal>;
}
