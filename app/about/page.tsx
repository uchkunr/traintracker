import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "Loyiha haqida | TrainTracker.uz",
  description: "Poyezdlar jadvali xaritada: ma’lumotlar qayerdan olingani va joylashuv qanday hisoblanishi.",
};

export default function AboutPage() {
  return <AboutContent />;
}
