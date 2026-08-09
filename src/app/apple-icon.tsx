import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Full-bleed, no extra rounding — iOS applies its own corner mask.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#DFF0DC",
          fontSize: 120,
        }}
      >
        🌿
      </div>
    ),
    { ...size }
  );
}
