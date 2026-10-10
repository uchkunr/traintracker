import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/seo/page-shell";
import { isLang, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

const EMAIL = "uchkunrakhimov@gmail.com";

const COPY = {
  uz: {
    title: "Foydalanish shartlari",
    description: "TrainTracker.uz dan foydalanish shartlari: ma’lumotlar aniqligi, javobgarlik va mustaqillik.",
    updated: "Oxirgi yangilanish: 2026-yil 10-oktabr",
    sections: [
      ["Xizmat", "TrainTracker.uz bepul ma’lumot sayti. U poyezdlar jadvalini xaritada ko‘rsatadi va chipta sotmaydi."],
      ["Aniqlik", "Poyezdlar GPS bilan kuzatilmaydi: joylashuv jadvaldan hisoblanadi, kechikish va o‘zgarishlar hisobga olinmaydi. Oraliq bekatlardagi vaqtlar taxminiy. Safardan oldin vaqt va narxni eticket.railway.uz saytida tekshiring."],
      ["Javobgarlik", "Sayt boricha taqdim etiladi. Noto‘g‘ri ma’lumot sabab poyezdga ulgurmaslik yoki boshqa yo‘qotishlar uchun muallif javob bermaydi."],
      ["Mustaqillik", "Loyiha mustaqil, O‘zbekiston temir yo‘llari va boshqa tashuvchilar bilan bog‘liq emas. Poyezd nomlari ularning egalariga tegishli."],
      ["Xarita va rasmlar", "Xarita ma’lumotlari © OpenStreetMap hissadorlari (ODbL), xarita qatlamlari OpenFreeMap va OpenMapTiles. Bekat rasmlari mualliflariga tegishli, manbasi rasm ostida ko‘rsatilgan."],
      ["O‘zgarishlar", "Sayt va shu shartlar o‘zgarishi yoki to‘xtatilishi mumkin. Yangi tahrir shu sahifada chiqadi."],
    ],
    contact: "Aloqa",
  },
  en: {
    title: "Terms of use",
    description: "Terms for using TrainTracker.uz: data accuracy, liability and independence.",
    updated: "Last updated: 10 October 2026",
    sections: [
      ["Service", "TrainTracker.uz is a free information site. It shows the train timetable on a map and does not sell tickets."],
      ["Accuracy", "Trains are not tracked by GPS: the position is worked out from the timetable, and delays and changes are not included. Times at intermediate stops are estimates. Check times and fares on eticket.railway.uz before you travel."],
      ["Liability", "The site is provided as is. The author is not responsible for a missed train or any other loss caused by wrong information."],
      ["Independence", "The project is independent and not affiliated with Uzbekistan Railways or any other operator. Train names belong to their owners."],
      ["Map and photos", "Map data © OpenStreetMap contributors (ODbL), map tiles by OpenFreeMap and OpenMapTiles. Station photos belong to their authors; the source is shown with each photo."],
      ["Changes", "The site and these terms may change or stop. A new version will appear on this page."],
    ],
    contact: "Contact",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "/terms", { title: COPY[lang].title, description: COPY[lang].description });
}

export default async function TermsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = COPY[lang];
  return (
    <PageShell lang={lang} path="/terms">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{c.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{c.updated}</p>
      <div className="mt-8">
        {c.sections.map(([heading, text]) => (
          <section key={heading} className="grid gap-2 border-t border-border py-5 md:grid-cols-[9rem_1fr] md:gap-8">
            <h2 className="text-sm font-semibold text-muted-foreground">{heading}</h2>
            <p className="text-sm leading-relaxed">{text}</p>
          </section>
        ))}
        <section className="grid gap-2 border-t border-border py-5 md:grid-cols-[9rem_1fr] md:gap-8">
          <h2 className="text-sm font-semibold text-muted-foreground">{c.contact}</h2>
          <a href={`mailto:${EMAIL}`} className="text-sm font-semibold underline-offset-4 hover:text-primary hover:underline">{EMAIL}</a>
        </section>
      </div>
    </PageShell>
  );
}
