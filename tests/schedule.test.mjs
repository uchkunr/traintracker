import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const load = async (file, replacements = []) => {
  let code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const [from, to] of replacements) code = code.replaceAll(from, to);
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  return { url, module: await import(url) };
};
const schedule = await load('../lib/schedule.ts');
const { SCHEDULE, getServiceState, matchesDay, localDateKey, resolveArrival } = schedule.module;
const { module: rail } = await load('../lib/train-data.ts', [['"./schedule"', JSON.stringify(schedule.url)]]);
const network = JSON.parse(readFileSync(new URL('../public/railways.geojson', import.meta.url), 'utf8'));
const routes = rail.buildRoutes(network);
const entry = (number) => SCHEDULE.find((row) => row.number === number);
const time = (date) => Date.parse(`${date}+05:00`);
const state = (number, date) => getServiceState(entry(number), time(date));

test('67 intercity services, unique numbers and valid station names', () => {
  assert.equal(SCHEDULE.filter((row) => !row.kind).length, 67);
  assert.equal(new Set(SCHEDULE.map((row) => row.number)).size, SCHEDULE.length);
  const stations = new Set(rail.STATIONS.map((station) => station.name));
  for (const row of SCHEDULE) for (const station of [row.from, ...row.via, row.to]) assert.ok(stations.has(station), station);
});
const fixtures = [
  ['710F','08:37','14:18','Toshkent Markaziy','Buxoro'],
  ['716F','08:55','13:59','Toshkent Markaziy','Qarshi'],
  ['730F','07:20','14:14','Toshkent Markaziy','Andijon'],
  ['072F','22:34','09:39','Toshkent Janubiy','Olot'],
  ['071F','20:30','07:03','Olot','Toshkent Janubiy'],
  ['080F','21:13','11:11','Toshkent Janubiy','Termiz'],
  ['734F','17:55','01:00','Toshkent Markaziy','Andijon'],
  ['774F','06:33','11:12','Toshkent Markaziy','Shahrisabz'],
  ['305F','23:55','22:08','Toshkent Markaziy','Moskva'],
  ['315G','10:33','04:23','Qozon','Toshkent Markaziy'],
  ['001','14:41','08:42','Toshkent Markaziy','Olmaota'],
  ['301Z','19:26','13:51','Dushanbe','Toshkent Markaziy'],
];
for (const [number, departTime, arriveTime, from, to] of fixtures) test(`supplied timetable: ${number}`, () => {
  assert.deepEqual([entry(number).departTime, entry(number).arriveTime, entry(number).from, entry(number).to], [departTime, arriveTime, from, to]);
});
test('730F change takes effect on October 1, independent of machine timezone', () => {
  assert.equal(state('730F','2026-09-30T08:30:00').departure, time('2026-09-30T08:10:00'));
  assert.equal(state('730F','2026-10-01T08:30:00').departure, time('2026-10-01T07:20:00'));
  assert.equal(state('730F','2026-10-06T08:30:00').arrival, time('2026-10-06T14:14:00'));
});
test('072F even departure and odd arrival, overnight is still running', () => {
  const train = state('072F','2026-10-07T05:00:00');
  assert.equal(entry('072F').departDays.kind,'even'); assert.equal(entry('072F').arriveDays.kind,'odd');
  assert.equal(train.departure,time('2026-10-06T22:34:00')); assert.equal(train.arrival,time('2026-10-07T09:39:00')); assert.equal(train.status,'running');
});
test('071F odd departure and even arrival at month boundary uses calendar parity', () => {
  assert.equal(entry('071F').departDays.kind,'odd'); assert.equal(entry('071F').arriveDays.kind,'even');
  const departure=time('2026-01-31T20:30:00');
  assert.equal(resolveArrival(entry('071F'),departure),time('2026-02-02T07:03:00'));
  assert.equal(matchesDay({kind:'odd'},'2026-02-01'),true);
  assert.equal(matchesDay({kind:'even'},'2028-02-29'),false);
});
test('080F resolves previous departure, exact boundaries, progress', () => {
  const train=state('080F','2026-10-06T03:00:00');
  assert.equal(train.departure,time('2026-10-05T21:13:00'));
  assert.equal(train.arrival,time('2026-10-06T11:11:00'));
  assert.equal(train.status,'running'); assert.equal(train.runsToday,true);
  assert.ok(train.progress>0 && train.progress<1);
  assert.equal(state('080F','2026-10-06T11:11:00').status,'arrived');
  assert.equal(state('080F','2026-10-06T21:13:00').progress,0);
});
test('weekly inactive service shows next Sunday, no moving status', () => {
  const train=state('774F','2026-10-06T12:00:00');
  assert.equal(train.status,'waiting'); assert.equal(train.runsToday,false);
  assert.equal(train.nextDeparture,time('2026-10-11T06:33:00'));
});
test('multiple-day international trip uses independent Friday arrival', () => {
  const train=state('305F','2026-10-07T12:00:00');
  assert.equal(train.departure,time('2026-10-06T23:55:00'));
  assert.equal(train.arrival,time('2026-10-09T22:08:00')); assert.equal(train.status,'running');
});
test('Tuesday via Namangan arrives Wednesday, preserving via', () => {
  const train=state('734F','2026-10-07T00:30:00');
  assert.deepEqual(train.via,['Namangan']); assert.equal(train.departure,time('2026-10-06T17:55:00'));
  assert.equal(train.arrival,time('2026-10-07T01:00:00'));
});
test('all service states have finite, ordered dates, clamped progress and future next departure', () => {
  for (const date of ['2026-01-31T23:59:00','2026-02-01T00:00:00','2026-10-06T12:00:00','2028-02-29T12:00:00']) {
    const now=time(date);
    for (const row of SCHEDULE) { const train=getServiceState(row,now); assert.ok(train.arrival>train.departure); assert.ok(train.nextDeparture>now); assert.ok(train.progress>=0 && train.progress<=1); }
  }
});
test('Tashkent local day crosses at UTC 19:00', () => {
  assert.equal(localDateKey(Date.parse('2026-10-05T19:00:00Z')),'2026-10-06');
  assert.equal(localDateKey(Date.parse('2026-10-05T18:59:59Z')),'2026-10-05');
});
test('Tashkent terminals are independently sourced and used verbatim', () => {
  const central=rail.STATIONS.find((s)=>s.name==='Toshkent Markaziy');
  const south=rail.STATIONS.find((s)=>s.name==='Toshkent Janubiy');
  assert.deepEqual(central.coordinates,[69.2874028,41.2909763]);
  assert.deepEqual(south.coordinates,[69.2263009,41.2590009]);
  assert.notEqual(central.id,south.id); assert.notEqual(central.source,south.source);
  assert.equal(entry('710F').from,central.name); assert.equal(entry('080F').from,south.name);
  assert.equal(entry('080').to,south.name); assert.equal(entry('305').to,central.name);
});
// OSM stores the 19 km Kamchiq tunnel and a 24 km straight desert rail as single edges.
test('static real-rail geometry covers all domestic and Dushanbe services without city-to-city chords', () => {
  for (const row of SCHEDULE.filter((s)=>!s.kind&&![s.from,s.to].some((n)=>['Moskva','Qozon','Volgograd','Olmaota'].includes(n)))) {
    const route=routes[row.number]; assert.ok(route,row.number); assert.ok(route.coordinates.length>50);
    assert.deepEqual(rail.pointAlong(route,0).coordinates,route.coordinates[0]);
    const end=rail.pointAlong(route,1).coordinates; assert.ok(Math.abs(end[0]-route.coordinates.at(-1)[0])<1e-8);
    for(let i=1;i<route.coordinates.length;i++) assert.ok(route.cumulative[i]-route.cumulative[i-1]<30,`${row.number}: railway gap`);
  }
  for(const feature of network.features) assert.ok(feature.properties.osmWays.length);
});
test('every theme token pair meets specified contrast thresholds', () => {
  const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
  const luminance=(hex)=>hex.match(/[a-f0-9]{2}/gi).map((part)=>parseInt(part,16)/255).map((v)=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  for(const selector of [':root {']) {
    const block=css.split(selector)[1].split('}')[0]; const tokens=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[a-f0-9]{6});/gi)].map((m)=>[m[1],m[2]]));
    for(const [a,b,min] of [['foreground','background',4.5],['muted-foreground','background',4.5],['primary','background',4.5],['primary-foreground','primary',4.5],['accent-foreground','accent',4.5],['input','background',3],['rail-active','rail-casing',3],['rail-track','rail-casing',3]]) {
      const x=luminance(tokens[a]),y=luminance(tokens[b]);const ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
      assert.ok(ratio>=min,`${selector} ${a}/${b} ${ratio.toFixed(2)}`);
    }
  }
});
