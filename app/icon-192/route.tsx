import { ImageResponse } from "next/og";

const size = {
  width: 192,
  height: 192,
};



export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background:
            "radial-gradient(circle at top, rgba(251,146,60,0.92), transparent 45%), linear-gradient(135deg, #020617, #0f172a)",
          color: "white",
          fontSize: 58,
          fontWeight: 700,
          border: "4px solid rgba(34,211,238,0.7)",
          boxShadow: "0 0 30px rgba(255,99,71,0.35)",
        }}
      >
        V
      </div>
    ),
    size,
  );
}
