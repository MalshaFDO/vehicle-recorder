import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AutoFlash Vehicle Recorder",
    short_name: "AutoFlash",
    description: "Capture vehicle videos and manage the AutoFlash vehicle database.",
    start_url: "/login",
    display: "standalone",
    background_color: "#f3f6fb",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/AFLOGO.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: "/AFLOGO.jpg",
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
  };
}
