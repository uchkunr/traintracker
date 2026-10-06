import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrainTracker.uz",
    short_name: "TrainTracker",
    description: "Uzbekistan train map and timetable. O‘zbekiston poyezdlari xaritasi va jadvali.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf8",
    theme_color: "#176451",
    categories: ["travel", "navigation"],
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
