export default function LockedScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0b0b0b",
        display: "grid",
        placeItems: "center",
        color: "#fff",
        fontFamily: "system-ui, Arial",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>
          Este juego ya no está disponible
        </div>
        <div style={{ fontSize: 16, opacity: 0.6 }}>
          La licencia de uso para este evento ha expirado.
        </div>
      </div>
    </div>
  );
}
