import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "Loyiha haqida | TrainTracker.uz",
  description:
    "O‘zbekiston poyezdlari xaritasi: ma’lumotlar qayerdan olingani va real vaqt qanday hisoblanishi.",
};

export default function AboutPage() {
  return <AboutContent />;
}
