import type { ScheduledTrain } from "./schedule";
import { ELECTRIC_STOPS } from "./electric-trains";
import { STATIONS } from "./train-data";

// Intermediate stops per train. Names/order from Yandex Rasp thread pages (cross-checked with tutu.ru, advantour, spot.uz),
// retrieved 2026-10-06. Dwell is minutes (source stop length, default 2). Arrival times are estimated in estimateStops().
export const TRAIN_STOPS: Record<string, [string, number][]> = {
  "710F": [["Guliston", 3], ["Jizzax", 3], ["Samarqand", 14], ["Navoiy", 4], ["Qiziltepa", 3]],
  "716F": [["Guliston", 3], ["Jizzax", 7], ["Samarqand", 19]],
  "712F": [["Guliston", 3], ["Jizzax", 3], ["Samarqand", 21], ["Kattaqo'rg'on", 2], ["Navoiy", 4], ["Qiziltepa", 3]],
  "730F": [["Pop", 2], ["Qo'qon", 2], ["Marg‘ilon", 2]],
  "732F": [["Pop", 2], ["Qo'qon", 2], ["Marg‘ilon", 2]],
  "734F": [["Pop", 4], ["Chust", 2], ["To'raqo'rg'on", 2], ["Namangan", 2]],
  "054F": [["Guliston", 2], ["Jizzax", 2], ["Samarqand", 22], ["Kattaqo'rg'on", 2], ["Navoiy", 5], ["Buxoro", 22], ["Miskin", 30], ["To'rtko'l", 8], ["Ellikqal'a", 6], ["Beruniy", 12], ["Qorao'zak", 2], ["Nukus", 22], ["Taxiatosh", 3], ["Xo'jayli", 2], ["Oltinko'l", 2]],
  "080F": [["Guliston", 2], ["Jizzax", 2], ["Samarqand", 13], ["Gumbaz", 4], ["Qashqadaryo", 12], ["Qarshi", 20], ["Dehqonobod", 4], ["Oqrabot", 20], ["Darband", 5], ["Boysun", 10], ["Tangimush", 3], ["Qumqo'rg'on", 20], ["Surxon", 2], ["Jarqo'rg'on", 3]],
  "082F": [["Guliston", 2], ["Jizzax", 2], ["Samarqand", 13], ["Gumbaz", 4], ["Qashqadaryo", 12], ["Qarshi", 20], ["Dehqonobod", 4], ["Oqrabot", 20], ["Darband", 5], ["Boysun", 10], ["Tangimush", 3], ["Qumqo'rg'on", 31], ["Sho'rchi", 3], ["Denov", 14]],
  "056": [["Guliston", 2], ["Jizzax", 3], ["Samarqand", 20], ["Juma", 4], ["Kattaqo'rg'on", 2], ["Navoiy", 15], ["Buxoro", 20], ["Jayhun", 18], ["Dovtepa", 13], ["Xazorasp", 8], ["Urganch", 10]],
  "072F": [["Guliston", 3], ["Jizzax", 3], ["Samarqand", 39], ["Juma", 7], ["Kattaqo'rg'on", 2], ["Zirabuloq", 14], ["Ziyovuddin", 2], ["Navoiy", 5], ["Qiziltepa", 5], ["Buxoro", 50], ["Yakkatut", 3], ["Qorako'l", 4]],
  "058Z": [["Guliston", 2], ["Jizzax", 3], ["Samarqand", 20], ["Juma", 4], ["Kattaqo'rg'on", 2], ["Navoiy", 15], ["Buxoro", 20], ["Jayhun", 18], ["Dovtepa", 13], ["Xazorasp", 8], ["Urganch", 30]],
  "076F": [["Guliston", 3], ["Jizzax", 3], ["Samarqand", 39], ["Juma", 7], ["Kattaqo'rg'on", 2], ["Zirabuloq", 14], ["Ziyovuddin", 2], ["Navoiy", 5], ["Qiziltepa", 5], ["Buxoro", 20], ["Xizirbobo", 19], ["Xazorasp", 5], ["Urganch", 10]],
  "092F": [["Pop", 4], ["Chust", 2], ["To'raqo'rg'on", 2], ["Namangan", 2]],
  "094F": [["Pop", 4], ["Chust", 2], ["To'raqo'rg'on", 2], ["Namangan", 2]],
  "096F": [["Pop", 4], ["Chust", 2], ["To'raqo'rg'on", 2], ["Namangan", 2]],
  "098F": [["Pop", 4], ["Chust", 2], ["To'raqo'rg'on", 2], ["Namangan", 2]],
  "125F": [["Marg‘ilon", 2], ["Qo'qon", 2], ["Pop", 2], ["Toshkent Janubiy", 2], ["Jizzax", 2], ["Samarqand", 2], ["Navoiy", 2], ["Buxoro", 2], ["Urganch", 2]],
  "125": [["Marg‘ilon", 2], ["Qo'qon", 2], ["Pop", 2], ["Toshkent Janubiy", 2], ["Jizzax", 2], ["Samarqand", 2], ["Navoiy", 2], ["Buxoro", 2]],
  "129F": [["Marg‘ilon", 2], ["Qo'qon", 2], ["Pop", 2], ["Toshkent Janubiy", 2], ["Jizzax", 2], ["Samarqand", 2], ["Qarshi", 2]],
  "127F": [["Namangan", 2], ["Chust", 2], ["Pop", 2], ["Toshkent Janubiy", 2], ["Jizzax", 2], ["Samarqand", 2], ["Navoiy", 2], ["Buxoro", 2]],
  "778F": [["Samarqand", 10], ["Navoiy", 3]],
  "768F": [["Guliston", 1], ["Dashtobod", 2], ["Jizzax", 2]],
  "764F": [["Samarqand", 10]],
  "774F": [["Samarqand", 10], ["Qarshi", 10]],
  "766F": [["Samarqand", 10], ["Kattaqo'rg'on", 2], ["Navoiy", 3]],
  "770F": [["Dashtobod", 2], ["Samarqand", 10], ["Navoiy", 3]],
  "772F": [["Dashtobod", 7], ["Samarqand", 10], ["Navoiy", 3]],
  "124F": [["Jizzax", 3], ["Samarqand", 28], ["Kattaqo'rg'on", 5], ["Navoiy", 5], ["Qiziltepa", 5], ["Buxoro", 30], ["Xazorasp", 35], ["Urganch", 63], ["Shovot", 3], ["Nukus", 33], ["Qo'ng'irot", 25], ["Beyneu", 120], ["Kulsary", 10], ["Makat", 32], ["Atyrau", 18], ["Ganyushkino", 120], ["Aksarayskaya", 140], ["Verkhniy Baskunchak", 23]],
  "305F": [["Keles", 90], ["Saryagash", 105], ["Arys", 20], ["Turkestan", 20], ["Kyzylorda", 30], ["Aralsk", 10], ["Aqtobe", 30], ["Orenburg", 57], ["Samara", 39], ["Syzran", 5], ["Penza", 41], ["Morshansk", 16]],
  "001": [["Keles", 80], ["Saryagash", 50], ["Shymkent", 10], ["Taraz", 10], ["Chu", 10]],
  "315F": [["Keles", 90], ["Saryagash", 105], ["Arys", 20], ["Turkestan", 20], ["Kyzylorda", 30], ["Aralsk", 10], ["Aqtobe", 30], ["Orenburg", 57], ["Samara", 39], ["Syzran", 41], ["Ulyanovsk", 32]],
  "302Z": [["Guliston", 2], ["Jizzax", 11], ["Samarqand", 30], ["Qarshi", 20], ["Qumqo'rg'on", 30], ["Denov", 2], ["Sariosiyo", 2], ["Qo'dukli", 120], ["Pakhtaabad", 2]],
  "709F": [["Qiziltepa", 3], ["Navoiy", 4], ["Samarqand", 10], ["Jizzax", 3], ["Guliston", 3]],
  "715F": [["Samarqand", 16], ["Jizzax", 4], ["Guliston", 2]],
  "711F": [["Qiziltepa", 3], ["Navoiy", 3], ["Samarqand", 32], ["Jizzax", 3], ["Guliston", 3]],
  "703F": [["Samarqand", 32], ["Jizzax", 3], ["Guliston", 3]],
  "729F": [["Marg‘ilon", 2], ["Qo'qon", 2], ["Pop", 2]],
  "731F": [["Marg‘ilon", 2], ["Qo'qon", 2], ["Pop", 2]],
  "733F": [["Namangan", 2], ["To'raqo'rg'on", 2], ["Chust", 2], ["Pop", 2]],
  "054": [["Oltinko'l", 3], ["Xo'jayli", 3], ["Taxiatosh", 3], ["Nukus", 20], ["Qorao'zak", 12], ["Ellikqal'a", 3], ["To'rtko'l", 5], ["Miskin", 20], ["Buxoro", 27], ["Navoiy", 8], ["Kattaqo'rg'on", 2], ["Samarqand", 28], ["Jizzax", 10], ["Dashtobod", 4], ["Guliston", 2]],
  "080": [["Jarqo'rg'on", 3], ["Surxon", 2], ["Qumqo'rg'on", 28], ["Tangimush", 2], ["Pulhokim", 8], ["Boysun", 6], ["Darband", 5], ["Oqrabot", 20], ["Dehqonobod", 3], ["Qarshi", 20], ["Samarqand", 33], ["Jizzax", 3], ["Guliston", 3]],
  "082": [["Denov", 10], ["Sho'rchi", 3], ["Qumqo'rg'on", 47], ["Tangimush", 2], ["Pulhokim", 8], ["Boysun", 6], ["Darband", 5], ["Oqrabot", 20], ["Dehqonobod", 3], ["Qarshi", 20], ["Samarqand", 33], ["Jizzax", 3], ["Guliston", 3]],
  "056J": [["Urganch", 20], ["Xazorasp", 5], ["Yangiobod", 6], ["Buxoro", 20], ["Navoiy", 4], ["Kattaqo'rg'on", 3], ["Samarqand", 17], ["Jizzax", 2], ["Yangiyer", 4], ["Guliston", 2]],
  "071F": [["Qorako'l", 3], ["Yakkatut", 3], ["Buxoro", 30], ["Qiziltepa", 21], ["Navoiy", 6], ["Ziyovuddin", 2], ["Kattaqo'rg'on", 2], ["Samarqand", 24], ["Jizzax", 2], ["Guliston", 2]],
  "058": [["Urganch", 30], ["Xazorasp", 5], ["Yangiobod", 6], ["Buxoro", 20], ["Qiziltepa", 4], ["Navoiy", 4], ["Kattaqo'rg'on", 3], ["Samarqand", 17], ["Jizzax", 2], ["Yangiyer", 4], ["Guliston", 2]],
  "076J": [["Urganch", 28], ["Xazorasp", 3], ["Buxoro", 23], ["Qiziltepa", 4], ["Navoiy", 6], ["Kattaqo'rg'on", 2], ["Juma", 3], ["Samarqand", 45], ["Jizzax", 3], ["Guliston", 2]],
  "091F": [["Namangan", 5], ["To'raqo'rg'on", 2], ["Chust", 2], ["Pop", 2]],
  "093F": [["Marg‘ilon", 2], ["Qo'qon", 2], ["Pop", 2]],
  "095F": [["Namangan", 5], ["To'raqo'rg'on", 2], ["Chust", 2], ["Pop", 2]],
  "097F": [["Namangan", 5], ["To'raqo'rg'on", 2], ["Chust", 2], ["Pop", 2]],
  "126": [["Buxoro", 2], ["Navoiy", 2], ["Samarqand", 2], ["Jizzax", 2], ["Toshkent Janubiy", 2], ["Pop", 2], ["Qo'qon", 2], ["Marg‘ilon", 2]],
  "126F": [["Urganch", 2], ["Buxoro", 2], ["Navoiy", 2], ["Samarqand", 2], ["Jizzax", 2], ["Toshkent Janubiy", 2], ["Pop", 2], ["Qo'qon", 2], ["Marg‘ilon", 2]],
  "130F": [["Qarshi", 2], ["Samarqand", 2], ["Jizzax", 2], ["Toshkent Janubiy", 2], ["Pop", 2], ["Qo'qon", 2], ["Marg‘ilon", 2]],
  "128F": [["Buxoro", 2], ["Navoiy", 2], ["Samarqand", 2], ["Jizzax", 2], ["Toshkent Janubiy", 2], ["Pop", 2], ["Chust", 2], ["Namangan", 2]],
  "777F": [["Navoiy", 3], ["Samarqand", 10]],
  "767F": [["Jizzax", 2], ["Dashtobod", 2], ["Guliston", 1]],
  "763F": [["Samarqand", 10]],
  "773F": [["Samarqand", 10], ["Qarshi", 10]],
  "765F": [["Navoiy", 3], ["Kattaqo'rg'on", 2], ["Samarqand", 10]],
  "769F": [["Navoiy", 3], ["Samarqand", 10], ["Dashtobod", 2]],
  "771F": [["Navoiy", 3], ["Samarqand", 10], ["Dashtobod", 2]],
  "123F": [["Verkhniy Baskunchak", 23], ["Aksarayskaya", 140], ["Ganyushkino", 120], ["Atyrau", 18], ["Makat", 32], ["Kulsary", 10], ["Beyneu", 120], ["Qo'ng'irot", 25], ["Nukus", 33], ["Shovot", 3], ["Urganch", 63], ["Xazorasp", 35], ["Buxoro", 30], ["Qiziltepa", 5], ["Navoiy", 5], ["Kattaqo'rg'on", 5], ["Samarqand", 28], ["Jizzax", 3]],
  "305": [["Morshansk", 16], ["Penza", 41], ["Syzran", 5], ["Samara", 39], ["Orenburg", 57], ["Aqtobe", 30], ["Aralsk", 10], ["Kyzylorda", 30], ["Turkestan", 20], ["Arys", 20], ["Saryagash", 105], ["Keles", 90]],
  "001X": [["Chu", 10], ["Taraz", 10], ["Shymkent", 10], ["Saryagash", 50], ["Keles", 80]],
  "315G": [["Ulyanovsk", 32], ["Syzran", 39], ["Samara", 40], ["Orenburg", 57], ["Aqtobe", 30], ["Shalkar", 25], ["Aralsk", 5], ["Kazalinsk", 19], ["Kyzylorda", 20], ["Turkestan", 15], ["Arys", 20], ["Saryagash", 100], ["Keles", 90]],
  "301Z": [["Pakhtaabad", 2], ["Qo'dukli", 120], ["Sariosiyo", 2], ["Denov", 2], ["Qumqo'rg'on", 30], ["Qarshi", 20], ["Samarqand", 30], ["Jizzax", 11], ["Guliston", 2]],
};

// Coordinates [lng, lat] for stops that are not in STATIONS (OpenStreetMap railway nodes). Stops without coordinates are interpolated.
export const STOP_COORDS: Record<string, [number, number]> = {
  "Aqtobe": [57.2142, 50.2808],
  "Aralsk": [61.6751, 46.8009],
  "Arys": [68.7935, 42.4193],
  "Atyrau": [51.9568, 47.1295],
  "Beruniy": [60.6273, 41.983],
  "Beyneu": [55.1966, 45.3221],
  "Boysun": [67.1987, 38.1048],
  "Chu": [73.761, 43.601],
  "Chust": [71.2412, 40.8831],
  "Darband": [67.0354, 38.1761],
  "Dashtobod": [68.4985, 40.133],
  "Dehqonobod": [66.4357, 38.3473],
  "Denov": [67.9064, 38.2722],
  "Dovtepa": [61.9226, 41.2097],
  "Ellikqal'a": [60.8572, 41.7597],
  "Gumbaz": [66.5443, 39.6249],
  "Jarqo'rg'on": [67.4048, 37.5011],
  "Juma": [66.664, 39.7159],
  "Kattaqo'rg'on": [66.2119, 39.8685],
  "Kazalinsk": [62.1578, 45.852],
  "Keles": [69.2059, 41.4068],
  "Kulsary": [53.9387, 46.948],
  "Kyzylorda": [65.4954, 44.8547],
  "Makat": [53.338, 47.6434],
  "Miskin": [61.2641, 41.3801],
  "Morshansk": [41.7658, 53.4413],
  "Nukus": [59.6427, 42.4378],
  "Oltinko'l": [58.998, 42.8311],
  "Oqrabot": [66.8298, 38.2608],
  "Orenburg": [55.0746, 51.7766],
  "Pakhtaabad": [68.1403, 38.4683],
  "Penza": [45.0123, 53.2044],
  "Pulhokim": [67.3443, 38.0914],
  "Qashqadaryo": [65.7451, 38.9255],
  "Qiziltepa": [64.8513, 40.0315],
  "Qo'dukli": [68.0618, 38.4046],
  "Qorako'l": [63.8467, 39.4964],
  "Qorao'zak": [60.379, 42.1068],
  "Qumqo'rg'on": [67.5916, 37.8342],
  "Samara": [50.1213, 53.1857],
  "Saryagash": [69.1476, 41.4651],
  "Shalkar": [59.622, 47.8341],
  "Sho'rchi": [67.7892, 38.0168],
  "Shymkent": [69.6103, 42.2987],
  "Syzran": [48.482, 53.1702],
  "Tangimush": [67.46, 37.9886],
  "Taraz": [71.3789, 42.8697],
  "Taxiatosh": [59.564, 42.3466],
  "To'raqo'rg'on": [71.4994, 40.939],
  "To'rtko'l": [61.0324, 41.5706],
  "Turkestan": [68.213, 43.2857],
  "Ulyanovsk": [48.3235, 54.2703],
  "Verkhniy Baskunchak": [46.723, 48.2293],
  "Xazorasp": [61.0662, 41.318],
  "Xo'jayli": [59.4369, 42.4048],
  "Yakkatut": [64.0713, 39.6467],
  "Yangiyer": [68.8249, 40.2963],
  "Zirabuloq": [65.9278, 39.916],
  "Ziyovuddin": [65.6587, 40.0279],
};

const rad = (degrees: number) => degrees * Math.PI / 180;
function kilometres(a: [number, number], b: [number, number]) {
  const h = Math.sin(rad(b[1] - a[1]) / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(rad(b[0] - a[0]) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export function stopNames(number: string) {
  return (ELECTRIC_STOPS[number] ?? TRAIN_STOPS[number] ?? []).map(([name]) => name);
}

const clock = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));

// Electric trains have the operator's real stop times; they are laid out from the trip departure so midnight rollovers stay correct.
function realStops(train: ScheduledTrain, rows: [string, string | null, string | null][]) {
  const span = train.arrival - train.departure;
  let minutes = 0, previous = clock(rows[0][2] ?? "00:00");
  const advance = (value: string) => { const at = clock(value); minutes += (at - previous + 1440) % 1440; previous = at; return minutes; };
  return rows.map(([name, arrival, departure], index) => {
    const arrivedAt = index === 0 ? 0 : advance(arrival ?? departure!);
    const leftAt = index === rows.length - 1 ? arrivedAt : departure ? advance(departure) : arrivedAt;
    return { name, progress: Math.min(1, arrivedAt * 60_000 / span), arrival: train.departure + arrivedAt * 60_000, dwell: leftAt - arrivedAt };
  });
}

// Stop times are estimates: the user-supplied departure/arrival are fixed, the stops are placed by distance along the stop sequence plus dwell.
export function estimateStops(train: ScheduledTrain) {
  const real = ELECTRIC_STOPS[train.number];
  if (real) return realStops(train, real);
  const stops = TRAIN_STOPS[train.number] ?? train.via.map((name): [string, number] => [name, 2]);
  const names = [train.from, ...stops.map(([name]) => name), train.to];
  const points = names.map((name) => STATIONS.find((station) => station.name === name)?.coordinates ?? STOP_COORDS[name]);
  const last = names.length - 1;
  const cumulative: (number | undefined)[] = [];
  let total = 0, previous: number | undefined;
  points.forEach((point, index) => {
    if (!point) return;
    if (previous !== undefined) total += kilometres(points[previous]!, point);
    cumulative[index] = total;
    previous = index;
  });
  const fractions = names.map((_, index) => {
    if (!total || cumulative[0] === undefined || cumulative[last] === undefined) return index / last;
    if (cumulative[index] !== undefined) return cumulative[index]! / total;
    let before = index, after = index;
    while (cumulative[before] === undefined) before--;
    while (cumulative[after] === undefined) after++;
    return (cumulative[before]! + (cumulative[after]! - cumulative[before]!) * (index - before) / (after - before)) / total;
  });
  const span = train.arrival - train.departure;
  const dwellMs = stops.map(([, minutes]) => minutes * 60_000);
  const totalDwell = dwellMs.reduce((sum, value) => sum + value, 0);
  const scale = totalDwell > span * 0.6 ? span * 0.6 / totalDwell : 1;
  const travel = span - totalDwell * scale;
  let dwellBefore = 0;
  return names.map((name, index) => {
    const dwell = index === 0 || index === last ? 0 : dwellMs[index - 1] * scale;
    const arrival = index === 0 ? train.departure : index === last ? train.arrival : Math.round((train.departure + fractions[index] * travel + dwellBefore) / 60_000) * 60_000;
    if (index > 0 && index < last) dwellBefore += dwell;
    return { name, progress: index === 0 ? 0 : index === last ? 1 : (arrival - train.departure) / span, arrival, dwell: Math.round(dwell / 60_000) };
  });
}
