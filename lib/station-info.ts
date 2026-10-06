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
      src: "https://uzrailpass.uz/uploads/images/stations/org/nnmocTEyyuJK.jpg",
      alt: "Toshkent Janubiy vokzali",
      author: "UzRailPass",
      license: "Manba sayti",
      sourceUrl: "https://uzrailpass.uz/uploads/images/stations/org/nnmocTEyyuJK.jpg",
    },
  },
  Samarqand: {
    ...uzbekistan,
    image: {
      src: "/stations/samarqand.webp",
      alt: "Samarqand temiryo‘l vokzali",
      author: "Akhemen",
      license: "CC BY-SA 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Samarkand_Railway_Station.jpg",
    },
  },
  Buxoro: {
    ...uzbekistan,
    image: {
      src: "https://www.advantour.com/img/uzbekistan/bukhara/railway-station-banner.jpg",
      alt: "Buxoro temiryo‘l vokzali",
      author: "Advantour",
      license: "Manba sayti",
      sourceUrl: "https://www.advantour.com/img/uzbekistan/bukhara/railway-station-banner.jpg",
    },
  },
  Qarshi: {
    ...uzbekistan,
    image: {
      src: "/stations/qarshi.webp",
      alt: "Qarshi temiryo‘l vokzali",
      author: "Mrjavokh1r",
      license: "CC BY-SA 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Karshi_railway_station.jpg",
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
      src: "https://cdn.uza.uz/2023/09/20/17/09/zFZRVScSU8rzQVocypyzY9OJ7Wzcva66_normal.jpg",
      alt: "Qo‘qon temiryo‘l vokzali",
      author: "O‘zA",
      license: "Manba sayti",
      sourceUrl: "https://uza.uz/en/posts/participants-of-the-international-festival-of-handicrafts-solemnly-welcomed-in-kokand_522147",
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
      src: "https://uzrailpass.uz/uploads/images/stations/org/shByuR5l1CVZ.webp",
      alt: "Termiz temiryo‘l vokzali",
      author: "O‘ZTEMIRYO‘LYO‘LOVCHI",
      license: "Manba sayti",
      sourceUrl: "https://uzrailpass.uz/vip/termiz-temir-yol-stantsiyasi",
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
  "Qo'ng'irot": uzbekistan,
  Xiva: {
    ...uzbekistan,
    image: {
      src: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/ac/04/96/caption.jpg?w=1200&h=-1&s=1",
      alt: "Xiva temiryo‘l vokzali",
      author: "Tripadvisor",
      license: "Manba sayti",
      sourceUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/ac/04/96/caption.jpg?w=1200&h=-1&s=1",
    },
  },
  Urganch: {
    ...uzbekistan,
    image: {
      src: "https://yuz.uz/file/news/5403bf43f2a7597d7cf10a1c324bc0e7.jpg",
      alt: "Urganch temiryo‘l vokzali",
      author: "Yuz.uz",
      license: "Manba sayti",
      sourceUrl: "https://yuz.uz/file/news/5403bf43f2a7597d7cf10a1c324bc0e7.jpg",
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
