import { useEffect, useRef, type ReactNode } from "react";
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from "../game/config";

export default function ScreenScale({
  children,
  background,
}: {
  children: ReactNode;
  background?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resize = () => {
      const el = ref.current;
      if (!el) return;
      const s = Math.min(
        window.innerWidth / VIRTUAL_WIDTH,
        window.innerHeight / VIRTUAL_HEIGHT,
      );
      el.style.width = `${VIRTUAL_WIDTH * s}px`;
      el.style.height = `${VIRTUAL_HEIGHT * s}px`;
    };
    resize();
    addEventListener("resize", resize);
    return () => removeEventListener("resize", resize);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={ref}
        style={{
          position: "relative",
          overflow: "hidden",
          ...(background
            ? {
                backgroundImage: `url(${background})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}
