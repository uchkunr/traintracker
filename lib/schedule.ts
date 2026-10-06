export type DayRule = { kind: "daily" | "even" | "odd" } | { kind: "weekdays"; days: number[] };
export interface ScheduleEntry {
  number: string;
  from: string;
  via: string[];
  to: string;
  departTime: string;
  departDays: DayRule;
  arriveTime: string;
  arriveDays: DayRule;
  kind?: "electric";
  routeId?: number;
  price?: number;
  region?: string;
  cancelled?: string;
  inbound?: boolean;
}
export const TIME_ZONE = "Asia/Tashkent";
// User-supplied timetable, 6 October 2026. All times use UTC+5, including foreign terminals.
const INTERCITY_SCHEDULE: ScheduleEntry[] = [
  {
    "number": "710F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Buxoro",
    "departTime": "08:37",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "14:18",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "716F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Qarshi",
    "departTime": "08:55",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "13:59",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "712F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Buxoro",
    "departTime": "20:32",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "02:29",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "730F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Andijon",
    "departTime": "07:20",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "14:14",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "732F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Andijon",
    "departTime": "17:55",
    "departDays": {
      "kind": "weekdays",
      "days": [
        3,
        4,
        5,
        6
      ]
    },
    "arriveTime": "00:17",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        4,
        5,
        6,
        0
      ]
    }
  },
  {
    "number": "734F",
    "from": "Toshkent Markaziy",
    "via": [
      "Namangan"
    ],
    "to": "Andijon",
    "departTime": "17:55",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2,
        0
      ]
    },
    "arriveTime": "01:00",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3,
        1
      ]
    }
  },
  {
    "number": "054F",
    "from": "Toshkent Janubiy",
    "via": [],
    "to": "Qo'ng'irot",
    "departTime": "16:00",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "10:47",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "080F",
    "from": "Toshkent Janubiy",
    "via": [],
    "to": "Termiz",
    "departTime": "21:13",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "11:11",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "082F",
    "from": "Toshkent Janubiy",
    "via": [],
    "to": "Sariosiyo",
    "departTime": "21:13",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "11:40",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "056",
    "from": "Toshkent Janubiy",
    "via": [],
    "to": "Xiva",
    "departTime": "21:45",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2,
        3,
        5,
        6
      ]
    },
    "arriveTime": "11:37",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3,
        4,
        6,
        0
      ]
    }
  },
  {
    "number": "072F",
    "from": "Toshkent Janubiy",
    "via": [],
    "to": "Olot",
    "departTime": "22:34",
    "departDays": {
      "kind": "even"
    },
    "arriveTime": "09:39",
    "arriveDays": {
      "kind": "odd"
    }
  },
  {
    "number": "058Z",
    "from": "Toshkent Janubiy",
    "via": [],
    "to": "Shovot",
    "departTime": "21:45",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1,
        4,
        0
      ]
    },
    "arriveTime": "12:01",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        2,
        5,
        1
      ]
    }
  },
  {
    "number": "076F",
    "from": "Toshkent Janubiy",
    "via": [],
    "to": "Xiva",
    "departTime": "22:35",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1
      ]
    },
    "arriveTime": "13:51",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        2
      ]
    }
  },
  {
    "number": "092F",
    "from": "Toshkent Markaziy",
    "via": [
      "Namangan"
    ],
    "to": "Andijon",
    "departTime": "17:55",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1
      ]
    },
    "arriveTime": "01:00",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        2
      ]
    }
  },
  {
    "number": "094F",
    "from": "Toshkent Markaziy",
    "via": [
      "Namangan"
    ],
    "to": "Andijon",
    "departTime": "07:14",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1
      ]
    },
    "arriveTime": "14:13",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        1
      ]
    }
  },
  {
    "number": "096F",
    "from": "Toshkent Markaziy",
    "via": [
      "Namangan"
    ],
    "to": "Andijon",
    "departTime": "04:30",
    "departDays": {
      "kind": "weekdays",
      "days": [
        3
      ]
    },
    "arriveTime": "11:27",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3
      ]
    }
  },
  {
    "number": "098F",
    "from": "Toshkent Markaziy",
    "via": [
      "Namangan"
    ],
    "to": "Andijon",
    "departTime": "07:14",
    "departDays": {
      "kind": "weekdays",
      "days": [
        6
      ]
    },
    "arriveTime": "14:13",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        6
      ]
    }
  },
  {
    "number": "125F",
    "from": "Andijon",
    "via": [],
    "to": "Xiva",
    "departTime": "15:36",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1,
        2,
        5,
        6
      ]
    },
    "arriveTime": "13:51",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        2,
        3,
        6,
        0
      ]
    }
  },
  {
    "number": "125",
    "from": "Andijon",
    "via": [],
    "to": "Urganch",
    "departTime": "15:36",
    "departDays": {
      "kind": "weekdays",
      "days": [
        3,
        4,
        0
      ]
    },
    "arriveTime": "13:11",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        4,
        5,
        1
      ]
    }
  },
  {
    "number": "129F",
    "from": "Andijon",
    "via": [],
    "to": "Termiz",
    "departTime": "16:30",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1,
        2,
        3,
        5,
        0
      ]
    },
    "arriveTime": "13:30",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        2,
        3,
        4,
        6,
        1
      ]
    }
  },
  {
    "number": "127F",
    "from": "Andijon",
    "via": [
      "Namangan"
    ],
    "to": "Qo'ng'irot",
    "departTime": "17:20",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2,
        3,
        6
      ]
    },
    "arriveTime": "19:23",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3,
        4,
        0
      ]
    }
  },
  {
    "number": "778F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Buxoro",
    "departTime": "06:10",
    "departDays": {
      "kind": "weekdays",
      "days": [
        5,
        6,
        0
      ]
    },
    "arriveTime": "10:16",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        5,
        6,
        0
      ]
    }
  },
  {
    "number": "768F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Samarqand",
    "departTime": "08:00",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "10:25",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "764F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Qarshi",
    "departTime": "06:33",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    "arriveTime": "10:07",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    }
  },
  {
    "number": "774F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Shahrisabz",
    "departTime": "06:33",
    "departDays": {
      "kind": "weekdays",
      "days": [
        0
      ]
    },
    "arriveTime": "11:12",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        0
      ]
    }
  },
  {
    "number": "766F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Buxoro",
    "departTime": "07:30",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "11:42",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "770F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Buxoro",
    "departTime": "08:30",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "12:42",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "772F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Buxoro",
    "departTime": "19:48",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "00:06",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "124F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Volgograd",
    "departTime": "01:30",
    "departDays": {
      "kind": "weekdays",
      "days": [
        3,
        0
      ]
    },
    "arriveTime": "09:31",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        5,
        2
      ]
    }
  },
  {
    "number": "305F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Moskva",
    "departTime": "23:55",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2,
        4
      ]
    },
    "arriveTime": "22:08",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        5,
        0
      ]
    }
  },
  {
    "number": "001",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Olmaota",
    "departTime": "14:41",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "08:42",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "315F",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Qozon",
    "departTime": "23:55",
    "departDays": {
      "kind": "weekdays",
      "days": [
        0
      ]
    },
    "arriveTime": "13:47",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3
      ]
    }
  },
  {
    "number": "302Z",
    "from": "Toshkent Markaziy",
    "via": [],
    "to": "Dushanbe",
    "departTime": "14:48",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2
      ]
    },
    "arriveTime": "09:33",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3
      ]
    }
  },
  {
    "number": "709F",
    "from": "Buxoro",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "16:51",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "23:06",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "715F",
    "from": "Qarshi",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "18:40",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "23:54",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "711F",
    "from": "Buxoro",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "05:17",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "12:01",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "703F",
    "from": "Qarshi",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "05:40",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "12:04",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "729F",
    "from": "Andijon",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "15:09",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "21:10",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "731F",
    "from": "Andijon",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "06:37",
    "departDays": {
      "kind": "weekdays",
      "days": [
        4,
        5,
        6,
        0
      ]
    },
    "arriveTime": "12:42",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        4,
        5,
        6,
        0
      ]
    }
  },
  {
    "number": "733F",
    "from": "Andijon",
    "via": [
      "Namangan"
    ],
    "to": "Toshkent Markaziy",
    "departTime": "05:55",
    "departDays": {
      "kind": "weekdays",
      "days": [
        3,
        1
      ]
    },
    "arriveTime": "12:42",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3,
        1
      ]
    }
  },
  {
    "number": "054",
    "from": "Qo'ng'irot",
    "via": [],
    "to": "Toshkent Janubiy",
    "departTime": "12:35",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "07:28",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "080",
    "from": "Termiz",
    "via": [],
    "to": "Toshkent Janubiy",
    "departTime": "19:18",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "09:42",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "082",
    "from": "Sariosiyo",
    "via": [],
    "to": "Toshkent Janubiy",
    "departTime": "18:39",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "09:42",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "056J",
    "from": "Xiva",
    "via": [],
    "to": "Toshkent Janubiy",
    "departTime": "18:00",
    "departDays": {
      "kind": "weekdays",
      "days": [
        3,
        4,
        6,
        0
      ]
    },
    "arriveTime": "08:22",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        4,
        5,
        0,
        1
      ]
    }
  },
  {
    "number": "071F",
    "from": "Olot",
    "via": [],
    "to": "Toshkent Janubiy",
    "departTime": "20:30",
    "departDays": {
      "kind": "odd"
    },
    "arriveTime": "07:03",
    "arriveDays": {
      "kind": "even"
    }
  },
  {
    "number": "058",
    "from": "Shovot",
    "via": [],
    "to": "Toshkent Janubiy",
    "departTime": "17:56",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2,
        5,
        1
      ]
    },
    "arriveTime": "08:22",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3,
        6,
        2
      ]
    }
  },
  {
    "number": "076J",
    "from": "Xiva",
    "via": [],
    "to": "Toshkent Janubiy",
    "departTime": "15:15",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2
      ]
    },
    "arriveTime": "05:23",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3
      ]
    }
  },
  {
    "number": "091F",
    "from": "Andijon",
    "via": [
      "Namangan"
    ],
    "to": "Toshkent Markaziy",
    "departTime": "18:16",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2
      ]
    },
    "arriveTime": "01:23",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3
      ]
    }
  },
  {
    "number": "093F",
    "from": "Andijon",
    "via": [
      "Qo'qon"
    ],
    "to": "Toshkent Markaziy",
    "departTime": "16:30",
    "departDays": {
      "kind": "weekdays",
      "days": [
        6
      ]
    },
    "arriveTime": "22:47",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        6
      ]
    }
  },
  {
    "number": "095F",
    "from": "Andijon",
    "via": [
      "Namangan"
    ],
    "to": "Toshkent Markaziy",
    "departTime": "17:20",
    "departDays": {
      "kind": "weekdays",
      "days": [
        4
      ]
    },
    "arriveTime": "00:27",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        5
      ]
    }
  },
  {
    "number": "097F",
    "from": "Andijon",
    "via": [
      "Namangan"
    ],
    "to": "Toshkent Markaziy",
    "departTime": "17:20",
    "departDays": {
      "kind": "weekdays",
      "days": [
        5
      ]
    },
    "arriveTime": "00:27",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        6
      ]
    }
  },
  {
    "number": "126",
    "from": "Urganch",
    "via": [],
    "to": "Andijon",
    "departTime": "14:50",
    "departDays": {
      "kind": "weekdays",
      "days": [
        4,
        5,
        1
      ]
    },
    "arriveTime": "12:42",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        5,
        6,
        2
      ]
    }
  },
  {
    "number": "126F",
    "from": "Xiva",
    "via": [],
    "to": "Andijon",
    "departTime": "15:15",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2,
        3,
        6,
        0
      ]
    },
    "arriveTime": "12:42",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        2,
        3,
        5,
        6
      ]
    }
  },
  {
    "number": "130F",
    "from": "Termiz",
    "via": [],
    "to": "Andijon",
    "departTime": "17:15",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2,
        3,
        4,
        6,
        1
      ]
    },
    "arriveTime": "13:34",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        3,
        4,
        5,
        0,
        2
      ]
    }
  },
  {
    "number": "128F",
    "from": "Qo'ng'irot",
    "via": [
      "Namangan"
    ],
    "to": "Andijon",
    "departTime": "09:50",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1,
        4,
        5
      ]
    },
    "arriveTime": "13:20",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        2,
        5,
        6
      ]
    }
  },
  {
    "number": "777F",
    "from": "Buxoro",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "18:08",
    "departDays": {
      "kind": "weekdays",
      "days": [
        5,
        6,
        0
      ]
    },
    "arriveTime": "22:16",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        5,
        6,
        0
      ]
    }
  },
  {
    "number": "767F",
    "from": "Samarqand",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "17:40",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "20:07",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "763F",
    "from": "Qarshi",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "17:29",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1,
        3,
        4,
        5,
        6
      ]
    },
    "arriveTime": "21:04",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        1,
        3,
        4,
        5,
        6
      ]
    }
  },
  {
    "number": "773F",
    "from": "Shahrisabz",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "16:24",
    "departDays": {
      "kind": "weekdays",
      "days": [
        0
      ]
    },
    "arriveTime": "21:04",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        0
      ]
    }
  },
  {
    "number": "765F",
    "from": "Buxoro",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "16:16",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "20:30",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "769F",
    "from": "Buxoro",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "15:03",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "19:17",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "771F",
    "from": "Buxoro",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "03:27",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "07:42",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "123F",
    "from": "Volgograd",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "19:59",
    "departDays": {
      "kind": "weekdays",
      "days": [
        2,
        5
      ]
    },
    "arriveTime": "04:48",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        5,
        1
      ]
    }
  },
  {
    "number": "305",
    "from": "Moskva",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "06:05",
    "departDays": {
      "kind": "weekdays",
      "days": [
        6,
        1
      ]
    },
    "arriveTime": "04:23",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        2,
        4
      ]
    }
  },
  {
    "number": "001X",
    "from": "Olmaota",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "19:20",
    "departDays": {
      "kind": "daily"
    },
    "arriveTime": "12:58",
    "arriveDays": {
      "kind": "daily"
    }
  },
  {
    "number": "315G",
    "from": "Qozon",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "10:33",
    "departDays": {
      "kind": "weekdays",
      "days": [
        4
      ]
    },
    "arriveTime": "04:23",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        0
      ]
    }
  },
  {
    "number": "301Z",
    "from": "Dushanbe",
    "via": [],
    "to": "Toshkent Markaziy",
    "departTime": "19:26",
    "departDays": {
      "kind": "weekdays",
      "days": [
        1
      ]
    },
    "arriveTime": "13:51",
    "arriveDays": {
      "kind": "weekdays",
      "days": [
        2
      ]
    }
  }
];
// Suburban electric trains, from the ticket.elektropoyezd.uz snapshot (latest.json, 6 Oct 2026).
// When a train number is listed on several overlapping routes the longest run is kept.
const ELECTRIC_SCHEDULE: ScheduleEntry[] = [
  {"number": "7201", "from": "Toshkent Janubiy", "via": [], "to": "Chinorkent", "departTime": "08:47", "departDays": {"kind": "daily"}, "arriveTime": "10:33", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 1, "price": 30000, "region": "Toshkent"},
  {"number": "7202", "from": "Chinorkent", "via": [], "to": "Toshkent Janubiy", "departTime": "10:53", "departDays": {"kind": "daily"}, "arriveTime": "12:32", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 1, "price": 30000, "region": "Toshkent", "inbound": true},
  {"number": "7203", "from": "Toshkent Janubiy", "via": [], "to": "Chinorkent", "departTime": "12:15", "departDays": {"kind": "daily"}, "arriveTime": "13:53", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 1, "price": 30000, "region": "Toshkent"},
  {"number": "7204", "from": "Chinorkent", "via": [], "to": "Toshkent Janubiy", "departTime": "14:19", "departDays": {"kind": "daily"}, "arriveTime": "15:52", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 1, "price": 30000, "region": "Toshkent", "inbound": true},
  {"number": "6442", "from": "Xojikent", "via": [], "to": "Toshkent Janubiy", "departTime": "05:20", "departDays": {"kind": "daily"}, "arriveTime": "07:44", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 2, "price": 10000, "region": "Toshkent", "inbound": true},
  {"number": "6440", "from": "Xojikent", "via": [], "to": "Toshkent Janubiy", "departTime": "06:25", "departDays": {"kind": "daily"}, "arriveTime": "08:53", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 2, "price": 10000, "region": "Toshkent", "inbound": true},
  {"number": "6429", "from": "Toshkent Janubiy", "via": [], "to": "Xojikent", "departTime": "07:46", "departDays": {"kind": "daily"}, "arriveTime": "10:01", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 2, "price": 10000, "region": "Toshkent"},
  {"number": "6430", "from": "Xojikent", "via": [], "to": "Toshkent Janubiy", "departTime": "10:24", "departDays": {"kind": "daily"}, "arriveTime": "12:43", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 2, "price": 10000, "region": "Toshkent", "inbound": true},
  {"number": "6435", "from": "Toshkent Janubiy", "via": [], "to": "Xojikent", "departTime": "13:32", "departDays": {"kind": "daily"}, "arriveTime": "15:53", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 2, "price": 10000, "region": "Toshkent"},
  {"number": "6436", "from": "Xojikent", "via": [], "to": "Toshkent Janubiy", "departTime": "16:12", "departDays": {"kind": "daily"}, "arriveTime": "18:23", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 2, "price": 10000, "region": "Toshkent", "inbound": true},
  {"number": "6437", "from": "Toshkent Janubiy", "via": [], "to": "Xojikent", "departTime": "16:50", "departDays": {"kind": "daily"}, "arriveTime": "19:03", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 2, "price": 10000, "region": "Toshkent"},
  {"number": "6441", "from": "Toshkent Janubiy", "via": [], "to": "Xojikent", "departTime": "18:55", "departDays": {"kind": "daily"}, "arriveTime": "21:19", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 2, "price": 10000, "region": "Toshkent"},
  {"number": "6453", "from": "Xovos", "via": [], "to": "Toshkent Janubiy", "departTime": "04:00", "departDays": {"kind": "daily"}, "arriveTime": "07:17", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 3, "price": 12000, "region": "Sirdaryo", "inbound": true},
  {"number": "6412", "from": "Toshkent Janubiy", "via": [], "to": "Xovos", "departTime": "09:21", "departDays": {"kind": "daily"}, "arriveTime": "12:30", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 3, "price": 12000, "region": "Sirdaryo"},
  {"number": "6411", "from": "Xovos", "via": [], "to": "Toshkent Janubiy", "departTime": "13:05", "departDays": {"kind": "daily"}, "arriveTime": "16:31", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 3, "price": 12000, "region": "Sirdaryo", "inbound": true},
  {"number": "6454", "from": "Toshkent Janubiy", "via": [], "to": "Xovos", "departTime": "19:00", "departDays": {"kind": "daily"}, "arriveTime": "22:51", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 3, "price": 12000, "region": "Sirdaryo"},
  {"number": "6414", "from": "Toshkent Janubiy", "via": [], "to": "Guliston", "departTime": "13:01", "departDays": {"kind": "daily"}, "arriveTime": "15:19", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 4, "price": 12000, "region": "Sirdaryo", "cancelled": "Texnik sabablarga ko'ra"},
  {"number": "6413", "from": "Guliston", "via": [], "to": "Toshkent Janubiy", "departTime": "15:39", "departDays": {"kind": "daily"}, "arriveTime": "18:00", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 4, "price": 12000, "region": "Sirdaryo", "inbound": true, "cancelled": "Texnik sabablarga ko'ra"},
  {"number": "6407", "from": "Sirdaryo", "via": [], "to": "Toshkent Janubiy", "departTime": "04:36", "departDays": {"kind": "daily"}, "arriveTime": "06:25", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 5, "price": 12000, "region": "Sirdaryo", "inbound": true},
  {"number": "6418", "from": "Toshkent Janubiy", "via": [], "to": "Sirdaryo", "departTime": "20:05", "departDays": {"kind": "daily"}, "arriveTime": "22:19", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 5, "price": 12000, "region": "Sirdaryo"},
  {"number": "7049", "from": "Bekobod", "via": [], "to": "Toshkent Markaziy", "departTime": "06:00", "departDays": {"kind": "daily"}, "arriveTime": "09:16", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 6, "price": 15000, "region": "Sirdaryo", "inbound": true},
  {"number": "7050", "from": "Toshkent Markaziy", "via": [], "to": "Bekobod", "departTime": "18:34", "departDays": {"kind": "daily"}, "arriveTime": "21:38", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 6, "price": 15000, "region": "Sirdaryo"},
  {"number": "7094", "from": "Qo'qon", "via": [], "to": "Namangan", "departTime": "14:00", "departDays": {"kind": "daily"}, "arriveTime": "16:21", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 7, "price": 20000, "region": "Farg'ona"},
  {"number": "7092", "from": "Namangan", "via": [], "to": "Qo'qon", "departTime": "17:00", "departDays": {"kind": "daily"}, "arriveTime": "19:11", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 7, "price": 20000, "region": "Farg'ona", "inbound": true},
  {"number": "6312", "from": "Qo'qon", "via": [], "to": "Andijon", "departTime": "05:50", "departDays": {"kind": "daily"}, "arriveTime": "08:33", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 8, "price": 15000, "region": "Farg'ona"},
  {"number": "6313", "from": "Andijon", "via": [], "to": "Qo'qon", "departTime": "17:10", "departDays": {"kind": "daily"}, "arriveTime": "19:45", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 8, "price": 15000, "region": "Farg'ona", "inbound": true},
  {"number": "7091/93", "from": "Qo'qon", "via": [], "to": "Qo'qon", "departTime": "05:10", "departDays": {"kind": "daily"}, "arriveTime": "13:43", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 9, "price": 20000, "region": "Farg'ona"},
  {"number": "6317", "from": "Shahrisabz", "via": [], "to": "Qarshi", "departTime": "05:20", "departDays": {"kind": "daily"}, "arriveTime": "07:44", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 10, "price": 10000, "region": "Qashqadaryo", "inbound": true},
  {"number": "6318", "from": "Qarshi", "via": [], "to": "Shahrisabz", "departTime": "16:51", "departDays": {"kind": "daily"}, "arriveTime": "19:13", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 10, "price": 10000, "region": "Qashqadaryo"},
  {"number": "6315", "from": "Qarshi", "via": [], "to": "Buxoro", "departTime": "08:14", "departDays": {"kind": "daily"}, "arriveTime": "11:00", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 11, "price": 12000, "region": "Buxoro"},
  {"number": "6316", "from": "Buxoro", "via": [], "to": "Qarshi", "departTime": "13:30", "departDays": {"kind": "daily"}, "arriveTime": "16:24", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 11, "price": 12000, "region": "Buxoro", "inbound": true},
  {"number": "6379", "from": "Sariosiyo", "via": [], "to": "Termiz", "departTime": "03:45", "departDays": {"kind": "daily"}, "arriveTime": "07:43", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 12, "price": 15000, "region": "Surxondaryo", "inbound": true},
  {"number": "6376", "from": "Termiz", "via": [], "to": "Sariosiyo", "departTime": "06:32", "departDays": {"kind": "daily"}, "arriveTime": "09:54", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 12, "price": 15000, "region": "Surxondaryo"},
  {"number": "6375", "from": "Sariosiyo", "via": [], "to": "Termiz", "departTime": "10:54", "departDays": {"kind": "daily"}, "arriveTime": "14:25", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 12, "price": 15000, "region": "Surxondaryo", "inbound": true},
  {"number": "6378", "from": "Termiz", "via": [], "to": "Sariosiyo", "departTime": "13:01", "departDays": {"kind": "daily"}, "arriveTime": "16:36", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 12, "price": 15000, "region": "Surxondaryo"},
  {"number": "6377", "from": "Sariosiyo", "via": [], "to": "Termiz", "departTime": "17:46", "departDays": {"kind": "daily"}, "arriveTime": "21:17", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 12, "price": 15000, "region": "Surxondaryo", "inbound": true},
  {"number": "6380", "from": "Termiz", "via": [], "to": "Sariosiyo", "departTime": "18:00", "departDays": {"kind": "daily"}, "arriveTime": "22:10", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 12, "price": 15000, "region": "Surxondaryo"},
  {"number": "6381", "from": "Darband", "via": [], "to": "Termiz", "departTime": "05:36", "departDays": {"kind": "daily"}, "arriveTime": "08:41", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 13, "price": 15000, "region": "Surxondaryo", "inbound": true},
  {"number": "6382", "from": "Termiz", "via": [], "to": "Darband", "departTime": "16:02", "departDays": {"kind": "daily"}, "arriveTime": "19:16", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 13, "price": 15000, "region": "Surxondaryo"},
  {"number": "6384", "from": "Surxonobod", "via": [], "to": "Termiz", "departTime": "05:05", "departDays": {"kind": "daily"}, "arriveTime": "07:40", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 14, "price": 15000, "region": "Surxondaryo", "inbound": true},
  {"number": "6383", "from": "Termiz", "via": [], "to": "Surxonobod", "departTime": "18:10", "departDays": {"kind": "daily"}, "arriveTime": "20:45", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 14, "price": 15000, "region": "Surxondaryo"},
  {"number": "6352", "from": "Miskin", "via": [], "to": "Qo'ng'irot", "departTime": "04:27", "departDays": {"kind": "daily"}, "arriveTime": "10:48", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 15, "price": 30000, "region": "Qoraqalpog'iston", "inbound": true},
  {"number": "6351", "from": "Qo'ng'irot", "via": [], "to": "Miskin", "departTime": "12:40", "departDays": {"kind": "daily"}, "arriveTime": "18:53", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 15, "price": 30000, "region": "Qoraqalpog'iston"},
  {"number": "6356", "from": "Qo'ng'irot", "via": [], "to": "Nukus", "departTime": "12:40", "departDays": {"kind": "daily"}, "arriveTime": "14:53", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 16, "price": 10000, "region": "Qoraqalpog'iston"},
  {"number": "6355", "from": "Nukus", "via": [], "to": "Qo'ng'irot", "departTime": "08:40", "departDays": {"kind": "daily"}, "arriveTime": "10:48", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 16, "price": 10000, "region": "Qoraqalpog'iston", "inbound": true},
  {"number": "6354", "from": "Nukus", "via": [], "to": "Urganch", "departTime": "10:00", "departDays": {"kind": "weekdays", "days": [4]}, "arriveTime": "13:30", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 17, "price": 25000, "region": "Qoraqalpog'iston"},
  {"number": "6353", "from": "Urganch", "via": [], "to": "Nukus", "departTime": "16:50", "departDays": {"kind": "daily"}, "arriveTime": "20:15", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 17, "price": 25000, "region": "Qoraqalpog'iston", "inbound": true},
  {"number": "6202", "from": "Urgut", "via": [], "to": "Samarqand", "departTime": "06:30", "departDays": {"kind": "daily"}, "arriveTime": "07:34", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 18, "price": 10000, "region": "Samarqand"},
  {"number": "6203", "from": "Samarqand", "via": [], "to": "Urgut", "departTime": "18:20", "departDays": {"kind": "daily"}, "arriveTime": "19:24", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 18, "price": 10000, "region": "Samarqand", "inbound": true},
  {"number": "6462", "from": "Navoiy", "via": [], "to": "Uchquduq", "departTime": "05:30", "departDays": {"kind": "weekdays", "days": [1, 3, 5]}, "arriveTime": "11:11", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 24, "price": 20000, "region": "Navoiy"},
  {"number": "6461", "from": "Uchquduq", "via": [], "to": "Navoiy", "departTime": "14:50", "departDays": {"kind": "weekdays", "days": [1, 3, 5]}, "arriveTime": "21:01", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 24, "price": 20000, "region": "Navoiy", "inbound": true},
  {"number": "7055", "from": "Urganch Aerovokzal", "via": [], "to": "Xiva", "departTime": "08:40", "departDays": {"kind": "daily"}, "arriveTime": "09:22", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 27, "price": 25000, "region": "Xiva"},
  {"number": "7058", "from": "Xiva", "via": [], "to": "Urganch Aerovokzal", "departTime": "21:00", "departDays": {"kind": "daily"}, "arriveTime": "21:42", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 27, "price": 25000, "region": "Xiva", "inbound": true},
  {"number": "7208", "from": "Parkent", "via": [], "to": "Toshkent Janubiy", "departTime": "06:47", "departDays": {"kind": "daily"}, "arriveTime": "08:08", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 28, "price": 10000, "region": "Toshkent", "inbound": true},
  {"number": "7207", "from": "Toshkent Janubiy", "via": [], "to": "Parkent", "departTime": "18:24", "departDays": {"kind": "daily"}, "arriveTime": "19:37", "arriveDays": {"kind": "daily"}, "kind": "electric", "routeId": 28, "price": 10000, "region": "Toshkent"},
];

export const SCHEDULE: ScheduleEntry[] = [...INTERCITY_SCHEDULE, ...ELECTRIC_SCHEDULE];


const DAY = 86_400_000;
const OFFSET = 5 * 3_600_000;

export function localDateKey(timestamp: number): string {
  return new Date(timestamp + OFFSET).toISOString().slice(0, 10);
}

export function matchesDay(rule: DayRule, localDate: string): boolean {
  const date = new Date(`${localDate}T00:00:00Z`);
  if (rule.kind === "daily") return true;
  if (rule.kind === "even") return date.getUTCDate() % 2 === 0;
  if (rule.kind === "odd") return date.getUTCDate() % 2 !== 0;
  return "days" in rule && rule.days.includes(date.getUTCDay());
}

export function resolveArrival(entry: ScheduleEntry, departure: number): number {
  const midnight = Date.parse(`${localDateKey(departure)}T00:00:00+05:00`);
  for (let offset = 0; offset <= 7; offset += 1) {
    const day = localDateKey(midnight + offset * DAY);
    const arrival = Date.parse(`${day}T${entry.arriveTime}:00+05:00`);
    if (arrival > departure && matchesDay(entry.arriveDays, day)) return arrival;
  }
  throw new Error(`Arrival rule has no occurrence: ${entry.number}`);
}

export function getServiceState(entry: ScheduleEntry, now: number) {
  const day = localDateKey(now);
  const midnight = Date.parse(`${day}T00:00:00+05:00`);
  const trips: { departure: number; arrival: number }[] = [];
  for (let offset = -8; offset <= 8; offset += 1) {
    const date = localDateKey(midnight + offset * DAY);
    if (!matchesDay(entry.departDays, date)) continue;
    const time = entry.number === "730F" && date < "2026-10-01" ? "08:10" : entry.departTime;
    const departure = Date.parse(`${date}T${time}:00+05:00`);
    trips.push({ departure, arrival: resolveArrival(entry, departure) });
  }
  const active = trips.filter((trip) => trip.departure <= now && now < trip.arrival).at(-1);
  const next = trips.find((trip) => trip.departure > now)!;
  const arrived = trips.filter((trip) => trip.arrival <= now && localDateKey(trip.arrival) === day).at(-1);
  const trip = active ?? arrived ?? next;
  const status = active ? "running" as const : arrived ? "arrived" as const : "waiting" as const;
  const progress = status === "running" ? Math.max(0, Math.min(1, (now - trip.departure) / (trip.arrival - trip.departure))) : status === "arrived" ? 1 : 0;
  const runsToday = trips.some((item) => item.departure < midnight + DAY && item.arrival >= midnight);
  return { ...entry, ...trip, nextDeparture: next.departure, status, progress, runsToday };
}

export type ScheduledTrain = ReturnType<typeof getServiceState>;

export function formatDays(rule: DayRule): string {
  if (rule.kind === "daily") return "Har kuni";
  if (rule.kind === "even") return "Juft sanalar";
  if (rule.kind === "odd") return "Toq sanalar";
  return "days" in rule ? rule.days.map((day) => ["Yak", "Du", "Se", "Chor", "Pay", "Ju", "Shan"][day]).join(", ") : "";
}

export function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat("uz", { timeZone: TIME_ZONE, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(timestamp);
}

export function formatDuration(milliseconds: number): string {
  const minutes = Math.round(milliseconds / 60_000);
  return `${Math.floor(minutes / 60)} soat ${minutes % 60} daq.`;
}
