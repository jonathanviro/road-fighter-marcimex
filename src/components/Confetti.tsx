import { useMemo } from "react";
import { createPortal } from "react-dom";

// Confeti: bidones de combustible (fuel_item.png) cayendo al finalizar un nivel.
// Se renderiza con un portal directo a <body> para quedar encima de TODO
// (modales, pantalla de resultados, etc.) sin importar su z-index.
const FUEL_IMG = "assets/general/fuel_item.png";

export default function Confetti({ count = 90 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        width: 22 + Math.random() * 20,
        duration: 2.8 + Math.random() * 2.2,
        delay: Math.random() * 2,
      })),
    [count],
  );

  const content = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {pieces.map((p) => (
        <img
          key={p.id}
          src={FUEL_IMG}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-50px",
            width: p.width,
            height: p.width * 1.25,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );

  return createPortal(content, document.body);
}
