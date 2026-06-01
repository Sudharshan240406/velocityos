import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 96,
          background:
            "radial-gradient(circle at top, rgba(251,146,60,0.92), transparent 45%), linear-gradient(135deg, #020617, #0f172a)",
          color: "white",
          fontSize: 156,
          fontWeight: 700,
          border: "12px solid rgba(34,211,238,0.7)",
          boxShadow: "0 0 80px rgba(255,99,71,0.35)",
        }}
      >
        V
      </div>
    ),
    size,
  );
}
