import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageShell } from "@/components/seo/page-shell";
import { isLang, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

const EMAIL = "uchkunrakhimov@gmail.com";

const COPY = {
  uz: {
    title: "Maxfiylik siyosati",
    description: "TrainTracker.uz qanday ma’lumot yig‘adi: shaxsiy ma’lumot yo‘q, cookie’siz statistika va bitta til cookie’si.",
    updated: "Oxirgi yangilanish: 2026-yil 10-oktabr",
    sections: [
      ["Qisqacha", "Saytda ro‘yxatdan o‘tish yo‘q. Ism, telefon yoki e-pochta kabi shaxsiy ma’lumotlar yig‘ilmaydi."],
      ["Statistika", "Saytga nechta odam kirishini bilish uchun Vercel Web Analytics ishlatiladi. U cookie yozmaydi va sizni aniqlamaydi. Faqat umumiy raqamlar ko‘rinadi: qaysi sahifa ochilgani, mamlakat, qurilma, brauzer va qaysi saytdan kelingani."],
      ["Cookie", "Faqat bitta cookie bor: traintracker-lang. U tanlagan tilingizni bir yil eslab qoladi. Reklama va kuzatuv cookie’lari yo‘q."],
      ["Boshqa xizmatlar", "Sayt Vercel’da joylashgan. Xarita OpenFreeMap (tiles.openfreemap.org) va unpkg.com’dan yuklanadi. Har qanday sayt kabi bu serverlar IP manzilingizni ko‘radi. Chipta havolalari eticket.railway.uz va ticket.elektropoyezd.uz saytlariga olib boradi, u yerda ularning o‘z qoidalari amal qiladi."],
    ],
    contact: "Savollar",
  },
  en: {
    title: "Privacy policy",
    description: "What TrainTracker.uz collects: no personal data, cookie-free statistics and one language cookie.",
    updated: "Last updated: 10 October 2026",
    sections: [
      ["In short", "There are no accounts. No personal data such as your name, phone number or email is collected."],
      ["Statistics", "Vercel Web Analytics counts visits. It sets no cookies and does not identify you. Only totals are visible: which page was opened, the country, device, browser and the site you came from."],
      ["Cookies", "There is one cookie, traintracker-lang. It remembers your language for a year. There are no advertising or tracking cookies."],
      ["Other services", "The site is hosted on Vercel. The map loads from OpenFreeMap (tiles.openfreemap.org) and unpkg.com. Like any website, these servers see your IP address. Ticket links lead to eticket.railway.uz and ticket.elektropoyezd.uz, where their own policies apply."],
    ],
    contact: "Questions",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return pageMetadata(lang, "/privacy", { title: COPY[lang].title, description: COPY[lang].description });
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = COPY[lang];
  return (
    <PageShell lang={lang} path="/privacy">
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
