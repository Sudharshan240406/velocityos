import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 48,
          background:
            "radial-gradient(circle at top right, rgba(251,146,60,0.45), transparent 30%), linear-gradient(135deg, #020617 0%, #111827 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            borderRadius: 36,
            border: "1px solid rgba(255,255,255,0.15)",
            padding: 40,
            background: "rgba(255,255,255,0.04)",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                width: 88,
                height: 88,
                borderRadius: 24,
                background: "linear-gradient(135deg,#fb923c,#f43f5e,#22d3ee)",
                color: "#020617",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontWeight: 700,
              }}
            >
              V
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: 6 }}>VELOCITYOS</div>
              <div style={{ fontSize: 22, opacity: 0.7 }}>Gamified Deep Work for Future Builders</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.02, maxWidth: 900 }}>
              A supercar-inspired productivity operating system.
            </div>
            <div style={{ fontSize: 28, opacity: 0.82, maxWidth: 820 }}>
              Velocity Mode, Garage progression, AI Driver Coach, offline-first sync, and startup-grade polish.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
