import { memo, useRef, useState } from "react";
import ScreenScale from "../components/ScreenScale";
import { sound } from "../game/sound";

export default memo(function StartScreen({
  onPlay,
  onOpenSettings,
}: {
  onPlay: () => void;
  onOpenSettings: () => void;
}) {
  const [disabled, setDisabled] = useState(false);

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlay = () => {
    if (disabled) return;

    sound.init(); // desbloquea el audio dentro del gesto del usuario
    onPlay();
  };

  // 10 taps en la pantalla en menos de 5s abren el menú de configuración
  const handleBackgroundTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 10) {
      tapCountRef.current = 0;
      onOpenSettings();
      return;
    }
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 5000);
  };

  return (
    <ScreenScale background="assets/general/start_background.png">
      <div
        onClick={handleBackgroundTap}
        style={{ position: "absolute", inset: 0 }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "2%",
            textAlign: "center",
            fontSize: 15,
            color: "rgba(245,245,245,0.6)",
            fontFamily: "Inter, system-ui, Arial, sans-serif",
            letterSpacing: 0.3,
          }}
        >
          Desarrollado por <b style={{ color: "rgba(166,240,13,0.75)" }}>VYLIUN S.A.S</b>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "16.5%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src="assets/general/btn_play_normal.png"
            alt="JUGAR"
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            style={{
              width: "34%",
              height: "auto",
              cursor: disabled ? "default" : "pointer",
              opacity: disabled ? 0.6 : 1,
              animation: disabled
                ? "none"
                : "pulseScale 1.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </ScreenScale>
  );
});
