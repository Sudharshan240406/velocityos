import { ImageResponse } from "next/og";

const size = {
  width: 512,
  height: 512,
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
          background: "linear-gradient(135deg, #020617, #0f172a)",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 72,
            background:
              "radial-gradient(circle at top, rgba(251,146,60,0.92), transparent 45%), linear-gradient(135deg, #0f172a, #1e293b)",
            color: "white",
            fontSize: 110,
            fontWeight: 700,
            border: "10px solid rgba(34,211,238,0.7)",
            boxShadow: "0 0 60px rgba(255,99,71,0.3)",
          }}
        >
          V
        </div>
      </div>
    ),
    size,
  );
}
