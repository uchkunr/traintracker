export interface TrainInfo {
  brand: string;
  description: string;
  sources: { label: string; url: string }[];
  image?: { src: string; width: number; height: number; alt: string; author: string; license: string; licenseUrl: string; sourceUrl: string };
}

// Brand associations are documented historically; current trainset assignments are not asserted.
// The supplied timetable is authoritative here, not the older timetable in these sources.
const afrosiyob: TrainInfo = {
  brand: "Afrosiyob",
  description: "Afrosiyob qatnovlarida Talgo 250 rusumidagi elektropoyezdlar qo‘llanadi. Rasm shu poyezd turini ko‘rsatadi.",
  sources: [
    { label: "O‘zbekiston temir yo‘llari", url: "https://railway.uz/uz/informatsionnaya_sluzhba/novosti/36188/" },
    { label: "Talgo", url: "https://www.talgo.com/en/uzbekistan-acquires-two-additional-talgo-250-trains-for-its-high-speed-fleet" },
  ],
  image: {
    src: "/trains/afrosiyob.webp", width: 1136, height: 653,
    alt: "Afrosiyob turidagi Talgo 250 elektropoyezdi",
    author: "Serguei Bolachenko", license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Talgo_250_Afrosiyob.jpg",
  },
};
const sharq: TrainInfo = {
  brand: "Sharq",
  description: "Sharq - Toshkent va Buxoro o‘rtasidagi yo‘lovchi poyezdi.",
  sources: [{ label: "Qatnov haqida rasmiy ma’lumot", url: "https://api.mf.uz/media/filestore/Services_Report.pdf" }],
};
const nasaf: TrainInfo = {
  brand: "Nasaf",
  description: "Nasaf - Toshkent va Qarshi o‘rtasidagi yo‘lovchi poyezdi.",
  sources: [{ label: "Qatnov haqida rasmiy ma’lumot", url: "https://api.mf.uz/media/filestore/Services_Report.pdf" }],
};
export const TRAIN_INFO: Record<string, TrainInfo | undefined> = {
  "763F": afrosiyob, "764F": afrosiyob, "765F": afrosiyob, "766F": afrosiyob,
  "767F": afrosiyob, "768F": afrosiyob, "769F": afrosiyob, "770F": afrosiyob,
  "771F": afrosiyob, "772F": afrosiyob, "773F": afrosiyob, "774F": afrosiyob,
  "777F": { ...afrosiyob, sources: [...afrosiyob.sources, { label: "Transport vazirligi: 777/778", url: "https://t.me/s/Mintrans_uz?before=17133" }] },
  "778F": { ...afrosiyob, sources: [...afrosiyob.sources, { label: "Transport vazirligi: 777/778", url: "https://t.me/s/Mintrans_uz?before=17133" }] },
  "709F": sharq, "710F": sharq,
  "712F": { ...sharq, sources: [{ label: "O‘zbekiston temir yo‘llari: 712", url: "https://railway.uz/uz/informatsionnaya_sluzhba/novosti/36188/" }] },
  "715F": nasaf, "716F": nasaf,
};
// Photo converted from JPEG to WebP, resized to <=1136px; same CC BY-SA 3.0 license.
// Services absent from this map intentionally have no inferred brand or stock model.
