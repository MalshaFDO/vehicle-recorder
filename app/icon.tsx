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
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(160deg, #020617 0%, #0f172a 40%, #10b981 140%)",
          position: "relative",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 34,
            borderRadius: 110,
            border: "10px solid rgba(255,255,255,0.18)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 180,
              fontWeight: 900,
              letterSpacing: "-0.12em",
              lineHeight: 0.88,
            }}
          >
            AF
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              opacity: 0.95,
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
