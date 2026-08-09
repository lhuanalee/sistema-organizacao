import { ImageResponse } from "next/og";

const SIZES = ["192", "512"];

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const px = SIZES.includes(size) ? Number(size) : 192;

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
          fontSize: px * 0.62,
        }}
      >
        🌿
      </div>
    ),
    { width: px, height: px }
  );
}
