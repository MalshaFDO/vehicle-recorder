import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

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
          borderRadius: 42,
          background:
            "linear-gradient(160deg, #020617 0%, #0f172a 42%, #10b981 140%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 74,
              fontWeight: 900,
              letterSpacing: "-0.12em",
              lineHeight: 0.9,
            }}
          >
            AF
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            AutoFlash
          </div>
        </div>
      </div>
    ),
    size
  );
}
