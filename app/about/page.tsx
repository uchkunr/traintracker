import type { Metadata } from "next";
import { getLang } from "@/lib/server-lang";
import { AboutContent } from "./about-content";

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLang()) === "en";
  return {
    title: en ? "About | TrainTracker.uz" : "Loyiha haqida | TrainTracker.uz",
    description: en
      ? "Trains on a map: where the data comes from and how the position is calculated."
      : "Poyezdlar jadvali xaritada: ma’lumotlar qayerdan olingani va joylashuv qanday hisoblanishi.",
  };
}

export default function AboutPage() {
  return <AboutContent />;
}
