export interface StationInfo {
  country: string;
  image?: {
    src: string;
    alt: string;
    author: string;
    license: string;
    sourceUrl: string;
  };
}

const uzbekistan = { country: "O‘zbekiston" };

export const STATION_INFO: Record<string, StationInfo> = {
  "Toshkent Markaziy": {
    ...uzbekistan,
    image: {
      src: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/69/95/e7/caption.jpg?w=1200&h=1200&s=1",
      alt: "Toshkent Markaziy vokzali",
      author: "Tripadvisor",
      license: "Manba sayti",
      sourceUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/69/95/e7/caption.jpg?w=1200&h=1200&s=1",
    },
  },
  "Toshkent Janubiy": {
    ...uzbekistan,
    image: {
      src: "/stations/toshkent-janubiy.jpg",
      alt: "Toshkent Janubiy vokzali",
      author: "O‘zbekiston Temir Yo‘llari (ticket.elektropoyezd.uz)",
      license: "Manba sayti",
      sourceUrl: "https://ticket.elektropoyezd.uz/storage/assets/regions/tashkent.jpg",
    },
  },
  Samarqand: {
    ...uzbekistan,
    image: {
      src: "/stations/samarqand.jpg",
      alt: "Samarqand temiryo‘l vokzali",
      author: "O‘zbekiston Temir Yo‘llari (ticket.elektropoyezd.uz)",
      license: "Manba sayti",
      sourceUrl: "https://ticket.elektropoyezd.uz/storage/assets/regions/samarqand.jpg",
    },
  },
  Buxoro: {
    ...uzbekistan,
    image: {
      src: "/stations/buxoro.jpg",
      alt: "Buxoro temiryo‘l vokzali",
      author: "O‘zbekiston Temir Yo‘llari (ticket.elektropoyezd.uz)",
      license: "Manba sayti",
      sourceUrl: "https://ticket.elektropoyezd.uz/storage/assets/regions/buxoro.jpg",
    },
  },
  Qarshi: {
    ...uzbekistan,
    image: {
      src: "/stations/qarshi.jpg",
      alt: "Qarshi temiryo‘l vokzali",
      author: "O‘zbekiston Temir Yo‘llari (ticket.elektropoyezd.uz)",
      license: "Manba sayti",
      sourceUrl: "https://ticket.elektropoyezd.uz/storage/assets/regions/qashqadaryo.jpg",
    },
  },
  Andijon: {
    ...uzbekistan,
    image: {
      src: "https://uzrailpass.uz/uploads/images/stations/org/pPMYo7DG79GK.webp",
      alt: "Andijon temiryo‘l vokzali",
      author: "O‘ZTEMIRYO‘LYO‘LOVCHI",
      license: "Manba sayti",
      sourceUrl: "https://uzrailpass.uz/vip/andijon-temir-yol-vokzali",
    },
  },
  Namangan: {
    ...uzbekistan,
    image: {
      src: "https://uzrailpass.uz/uploads/images/stations/org/QVvIobohKEl0.jpg",
      alt: "Namangan temiryo‘l vokzali",
      author: "O‘ZTEMIRYO‘LYO‘LOVCHI",
      license: "Manba sayti",
      sourceUrl: "https://uzrailpass.uz/vip/namangan-temir-yol-stantsiyasi",
    },
  },
  "Qo'qon": {
    ...uzbekistan,
    image: {
      src: "/stations/qoqon.jpg",
      alt: "Qo‘qon temiryo‘l vokzali",
      author: "O‘zbekiston Temir Yo‘llari (ticket.elektropoyezd.uz)",
      license: "Manba sayti",
      sourceUrl: "https://ticket.elektropoyezd.uz/storage/assets/regions/fargona.jpg",
    },
  },
  "Marg‘ilon": {
    ...uzbekistan,
    image: {
      src: "https://uzrailpass.uz/uploads/images/stations/org/WV1h63xAqSLj.jpg",
      alt: "Marg‘ilon temiryo‘l vokzali",
      author: "O‘ZTEMIRYO‘LYO‘LOVCHI",
      license: "Manba sayti",
      sourceUrl: "https://uzrailpass.uz/vip/margilan-temir-yol-vokzali",
    },
  },
  Pop: {
    ...uzbekistan,
    image: {
      src: "https://uzrailpass.uz/uploads/images/pages/org/8cZIUtbVCb9e.jpg",
      alt: "Pop temiryo‘l stansiyasi",
      author: "O‘ZTEMIRYO‘LYO‘LOVCHI",
      license: "Manba sayti",
      sourceUrl: "https://uzrailpass.uz/pages/pop-station",
    },
  },
  Termiz: {
    ...uzbekistan,
    image: {
      src: "/stations/termiz.jpg",
      alt: "Termiz temiryo‘l vokzali",
      author: "O‘zbekiston Temir Yo‘llari (ticket.elektropoyezd.uz)",
      license: "Manba sayti",
      sourceUrl: "https://ticket.elektropoyezd.uz/storage/assets/regions/surxandaryo.jpg",
    },
  },
  Sariosiyo: {
    ...uzbekistan,
    image: {
      src: "https://uzrailpass.uz/uploads/images/stations/org/CiCRExpvEIAP.webp",
      alt: "Sariosiyo temiryo‘l vokzali",
      author: "O‘ZTEMIRYO‘LYO‘LOVCHI",
      license: "Manba sayti",
      sourceUrl: "https://uzrailpass.uz/vip/sariosiyo-temir-yol-vokzali",
    },
  },
  "Qo'ng'irot": {
    ...uzbekistan,
    image: {
      src: "/stations/qongirot.jpg",
      alt: "Qo‘ng‘irot temiryo‘l vokzali",
      author: "O‘zbekiston Temir Yo‘llari (ticket.elektropoyezd.uz)",
      license: "Manba sayti",
      sourceUrl: "https://ticket.elektropoyezd.uz/storage/assets/regions/qongirot.jpg",
    },
  },
  Xiva: {
    ...uzbekistan,
    image: {
      src: "/stations/xiva.jpg",
      alt: "Xiva temiryo‘l vokzali",
      author: "O‘zbekiston Temir Yo‘llari (ticket.elektropoyezd.uz)",
      license: "Manba sayti",
      sourceUrl: "https://ticket.elektropoyezd.uz/storage/assets/regions/xiva.jpg",
    },
  },
  Urganch: {
    ...uzbekistan,
    image: {
      src: "/stations/urganch.jpg",
      alt: "Urganch temiryo‘l vokzali",
      author: "O‘zbekiston Temir Yo‘llari (ticket.elektropoyezd.uz)",
      license: "Manba sayti",
      sourceUrl: "https://ticket.elektropoyezd.uz/storage/assets/regions/urganch.jpg",
    },
  },
  Shovot: uzbekistan,
  Olot: {
    ...uzbekistan,
    image: {
      src: "https://www.advantour.com/img/uzbekistan/bukhara/railway-station-banner.jpg",
      alt: "Olot temiryo‘l bekati",
      author: "Advantour",
      license: "Manba sayti",
      sourceUrl: "https://www.advantour.com/img/uzbekistan/bukhara/railway-station-banner.jpg",
    },
  },
  Shahrisabz: {
    ...uzbekistan,
    image: {
      src: "https://uzrailpass.uz/uploads/images/stations/org/DPcFtd8iLrKn.webp",
      alt: "Shahrisabz temiryo‘l vokzali",
      author: "O‘ZTEMIRYO‘LYO‘LOVCHI",
      license: "Manba sayti",
      sourceUrl: "https://uzrailpass.uz/vip/shahrisabz-vokzali",
    },
  },
  Navoiy: {
    ...uzbekistan,
    image: {
      src: "https://uzrailpass.uz/uploads/images/stations/org/VAae3I3nnog0.webp",
      alt: "Navoiy temiryo‘l vokzali",
      author: "O‘ZTEMIRYO‘LYO‘LOVCHI",
      license: "Manba sayti",
      sourceUrl: "https://uzrailpass.uz/vip/navoiy-temir-yol-vokzali",
    },
  },
  Jizzax: {
    ...uzbekistan,
    image: {
      src: "https://central-asia.guide/wp-content/uploads/2021/06/jizzakh_train_station-1024x683.jpg",
      alt: "Jizzax temiryo‘l vokzali",
      author: "Central Asia Guide",
      license: "Manba sayti",
      sourceUrl: "https://central-asia.guide/wp-content/uploads/2021/06/jizzakh_train_station-1024x683.jpg",
    },
  },
  Sirdaryo: {
    ...uzbekistan,
    image: {
      src: "https://avatars.mds.yandex.net/get-altay/10456159/2a0000018a9bfeba1aaedfc8ccb266124b10/orig",
      alt: "Sirdaryo temiryo‘l vokzali",
      author: "Yandex Maps",
      license: "Manba sayti",
      sourceUrl: "https://avatars.mds.yandex.net/get-altay/10456159/2a0000018a9bfeba1aaedfc8ccb266124b10/orig",
    },
  },
  Guliston: uzbekistan,
  Volgograd: { country: "Rossiya" },
  Moskva: {
    country: "Rossiya",
    image: {
      src: "https://mf.b37mrtl.ru/rbthmedia/images/2022.12/original/639b399b7b6e5e65c76e3984.jpg",
      alt: "Moskva Qozon temiryo‘l vokzali",
      author: "Russia Beyond",
      license: "Manba sayti",
      sourceUrl: "https://www.gw2ru.com/arts/3247-lenin-mausoleum-architect-shchusev",
    },
  },
  Qozon: {
    country: "Rossiya",
    image: {
      src: "https://vagon-vokzal.ru/wp-content/uploads/2018/11/kazan.jpg",
      alt: "Qozon-Passajir temiryo‘l vokzali",
      author: "Vagon-vokzal.ru",
      license: "Manba sayti",
      sourceUrl: "https://vagon-vokzal.ru/rzhd/vokzaly-rossii/kazan.html",
    },
  },
  Olmaota: {
    country: "Qozog‘iston",
    image: {
      src: "https://ekaraganda.kz/foto/1024_1d06384711d646b47415e2f4de8b0e7b.png",
      alt: "Olmaota-2 temiryo‘l vokzali",
      author: "EKaraganda",
      license: "Manba sayti",
      sourceUrl: "https://ekaraganda.kz/?id=143440&mod=news_read",
    },
  },
  Dushanbe: {
    country: "Tojikiston",
    image: {
      src: "https://files.structurae.net/files/photos/wikipedia/Duschanbe_Bahnhof.jpg",
      alt: "Dushanbe temiryo‘l vokzali",
      author: "Structurae / Wikimedia",
      license: "Manba sayti",
      sourceUrl: "https://structurae.net/en/structures/dushanbe-railway-station",
    },
  },
};
