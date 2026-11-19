// ---------------------------------------------------------------------------
// SIAGA — Flood Alert Kit: data model + derived values.
//
// ONE SOURCE OF TRUTH: a single gauge reading (Bendung Katulampa, Sungai
// Ciliwung) drives all four outputs — alert email, status page, evacuation
// PDF and warning card. Everything downstream of the reading (Siaga level,
// what residents must do, which areas are affected, when the water reaches
// Manggarai) is COMPUTED by the code below, never hard-coded per output.
// Change the reading and every output changes with it — that is the point
// of the kit: "one reading, one level, zero contradictions."
//
// SOURCES (all real, cited in the README):
// - Siaga thresholds for Bendung Katulampa: BNPB (Badan Nasional
//   Penanggulangan Bencana) — Siaga 4 < 80 cm, Siaga 3 80–<150 cm,
//   Siaga 2 150–<200 cm, Siaga 1 >= 200 cm.
// - Sample scenario: the REAL flood of Sunday 15 November 2015 (BNPB
//   chronology, 18:00–19:10 WIB): 50 → 70 → 90 → 110 → 130 → 150 → 170 →
//   210 cm. The template renders this real event as its sample; a live
//   deployment would replace `sampleData` with the latest gauge reading.
// - Flood travel time Katulampa → Pintu Air Manggarai: ~9 hours (BNPB).
// - Area names are real Ciliwung riverside neighbourhoods in Jakarta.
//   Shelter assignments, routes and contact details in the sample are
//   ILLUSTRATIVE — the template's job is the format, not the directory.
// ---------------------------------------------------------------------------

/** Siaga (alert) level. 1 is the most severe, 4 is normal. */
export type SiagaLevel = 1 | 2 | 3 | 4;

/**
 * The BNPB thresholds for Bendung Katulampa (TMA = Tinggi Muka Air, water
 * level in centimetres). Boundaries are inclusive at the lower end:
 * 80 cm is already Siaga 3, 150 cm is already Siaga 2, 200 cm is Siaga 1.
 */
export function levelFromTma(tmaCm: number): SiagaLevel {
  if (tmaCm >= 200) return 1;
  if (tmaCm >= 150) return 2;
  if (tmaCm >= 80) return 3;
  return 4;
}

/** Everything a level means: label, colours, what it means, what to do. */
export interface LevelInfo {
  level: SiagaLevel;
  /** e.g. "SIAGA 1" */
  code: string;
  /** e.g. "AWAS — DANGER" */
  name: string;
  /** Short headline for the alert. */
  headline: string;
  /** One sentence explaining the level. */
  meaning: string;
  /** Main colour (band, badge, chart). */
  color: string;
  /** Darker variant — text on white, must clear 4.5:1. */
  dark: string;
  /** Light tint — card backgrounds. */
  tint: string;
  /** What residents must do, in order. Computed per level, shared by all outputs. */
  actions: string[];
}

export const LEVEL_INFO: Record<SiagaLevel, LevelInfo> = {
  1: {
    level: 1,
    code: "SIAGA 1",
    name: "AWAS — DANGER",
    headline: "Evacuate now — the flood is on its way",
    meaning:
      "Water is above the danger line. Flood water is already moving downstream toward Jakarta — evacuate now, do not wait for it to arrive.",
    color: "#DC2626",
    dark: "#991B1B",
    tint: "#FEE2E2",
    actions: [
      "EVACUATE NOW to your nearest shelter — do not wait for the water.",
      "Bring documents, medicine, drinking water and a charged phone.",
      "Turn off electricity at the main switch before leaving the house.",
      "Never walk or drive through flood water — 30 cm can sweep you away.",
      "Call 112 (Jakarta Siaga) in an emergency.",
    ],
  },
  2: {
    level: 2,
    code: "SIAGA 2",
    name: "SIAGA — ALERT",
    headline: "Get ready to leave — water is high",
    meaning:
      "Water is high. Low-lying riverside areas may flood within hours — pack now so leaving takes minutes, not an hour.",
    color: "#EA580C",
    dark: "#9A3412",
    tint: "#FFEDD5",
    actions: [
      "Pack your evacuation bag now — documents, medicine, water, phone charger.",
      "Move valuables and documents to a higher floor.",
      "Be ready to leave at short notice — keep shoes and keys by the door.",
      "Check on elderly neighbours, children and anyone living alone.",
      "Do not drive through flooded roads.",
    ],
  },
  3: {
    level: 3,
    code: "SIAGA 3",
    name: "WASPADA — WATCH",
    headline: "Stay alert — water is above the watch line",
    meaning:
      "Water is above the watch line. Flooding downstream is possible if the rain keeps falling — watch the next reading.",
    color: "#CA8A04",
    dark: "#854D0E",
    tint: "#FEF3C7",
    actions: [
      "Stay updated — check the next gauge reading.",
      "Charge phones and power banks.",
      "Keep documents and medicine in one bag, ready to grab.",
      "Clear drains and gutters around your house.",
      "Stay away from the riverbank.",
    ],
  },
  4: {
    level: 4,
    code: "SIAGA 4",
    name: "NORMAL",
    headline: "Water level normal — no flood threat",
    meaning:
      "Water level is normal. There is no flood threat from the Ciliwung at this reading.",
    color: "#15803D",
    dark: "#166534",
    tint: "#DCFCE7",
    actions: [
      "No action needed — stay informed.",
      "Know your evacuation route before the rain comes.",
      "Keep phones charged during the wet season.",
      "Follow BPBD DKI Jakarta for the next reading.",
    ],
  },
};

export function levelInfo(level: SiagaLevel): LevelInfo {
  return LEVEL_INFO[level];
}

/** One gauge reading — the single input the whole kit renders. */
export interface GaugeReading {
  /** e.g. "KTL-20151115-1910" — printed on every output, unchanged. */
  id: string;
  gauge: string;
  river: string;
  /** Tinggi Muka Air in centimetres. */
  tmaCm: number;
  /** ISO timestamp with +07:00 offset (WIB). */
  recordedAtIso: string;
  /** Display form, e.g. "Sunday, 15 November 2015 · 19:10 WIB". */
  recordedAtLabel: string;
  trend: "rising" | "falling" | "steady";
  /** Rise in the last 10 minutes, in cm (from the chronology). */
  rise10mCm: number;
}

/** One point of the water-level chronology. */
export interface ChronologyPoint {
  /** e.g. "18:00" */
  time: string;
  tmaCm: number;
}

/** A riverside area. `thresholdLevel` is the mildest (highest-numbered)
 *  Siaga level at which the area starts to flood: the area is affected
 *  whenever the current level number is <= thresholdLevel. */
export interface AffectedArea {
  name: string;
  detail: string;
  thresholdLevel: SiagaLevel;
}

/** A shelter (sample assignments — see the header note). */
export interface Shelter {
  name: string;
  area: string;
  capacity: string;
}

/** An evacuation route (sample — see the header note). */
export interface EvacRoute {
  code: string;
  from: string;
  via: string;
  to: string;
}

export interface SiagaData {
  reading: GaugeReading;
  /** Hours for flood water to travel Katulampa → Pintu Air Manggarai (BNPB: ~9). */
  etaHoursToManggarai: number;
  chronology: ChronologyPoint[];
  areas: AffectedArea[];
  shelters: Shelter[];
  routes: EvacRoute[];
  hotline: string;
  hotlineLabel: string;
  source: string;
}

/** Arrival time at Manggarai, computed from the reading + the ~9 h travel time. */
export function manggaraiArrival(reading: GaugeReading, etaHours: number): Date {
  return new Date(new Date(reading.recordedAtIso).getTime() + etaHours * 3_600_000);
}

/** "04:10 WIB, Monday 16 November 2015" — computed, never typed in. */
export function formatArrivalWib(d: Date): string {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(d);
  const get = (t: string) => parts.find((x) => x.type === t)?.value ?? "";
  return `${p} WIB, ${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
}

/** Areas affected at the current level — derived, not listed by hand. */
export function affectedAreas(data: SiagaData): AffectedArea[] {
  const level = levelFromTma(data.reading.tmaCm);
  return data.areas.filter((a) => level <= a.thresholdLevel);
}

/** Rise between the last two chronology points, in cm. */
export function lastRiseCm(chronology: ChronologyPoint[]): number {
  if (chronology.length < 2) return 0;
  const n = chronology.length;
  return chronology[n - 1].tmaCm - chronology[n - 2].tmaCm;
}

// ---------------------------------------------------------------------------
// Sample scenario — the REAL flood of Sunday 15 November 2015 (BNPB).
// Chronology from BNPB's report of that evening. The template renders this
// real event as its sample; a live deployment replaces `sampleData` with
// the latest gauge reading and the whole kit re-derives itself.
// ---------------------------------------------------------------------------

export const sampleData: SiagaData = {
  reading: {
    id: "KTL-20151115-1910",
    gauge: "Bendung Katulampa",
    river: "Sungai Ciliwung",
    tmaCm: 210,
    recordedAtIso: "2015-11-15T19:10:00+07:00",
    recordedAtLabel: "Sunday, 15 November 2015 · 19:10 WIB",
    trend: "rising",
    rise10mCm: 40,
  },
  etaHoursToManggarai: 9,
  chronology: [
    { time: "18:00", tmaCm: 50 },
    { time: "18:10", tmaCm: 70 },
    { time: "18:20", tmaCm: 90 },
    { time: "18:30", tmaCm: 110 },
    { time: "18:40", tmaCm: 130 },
    { time: "18:50", tmaCm: 150 },
    { time: "19:00", tmaCm: 170 },
    { time: "19:10", tmaCm: 210 },
  ],
  areas: [
    {
      name: "Kampung Melayu",
      detail: "Riverside homes along the Ciliwung — lowest ground, floods first.",
      thresholdLevel: 2,
    },
    {
      name: "Bukit Duri",
      detail: "Low streets near the river, south of the gauge.",
      thresholdLevel: 2,
    },
    {
      name: "Bidara Cina",
      detail: "Riverside lanes; water reaches the lanes at watch level.",
      thresholdLevel: 3,
    },
    {
      name: "Cawang",
      detail: "Low-lying blocks east of the river.",
      thresholdLevel: 1,
    },
    {
      name: "Manggarai",
      detail: "Pintu Air Manggarai — where the flood wave arrives, ~9 hours after Katulampa.",
      thresholdLevel: 1,
    },
  ],
  shelters: [
    { name: "Posko Kampung Melayu", area: "Community hall, Kampung Melayu", capacity: "300 people" },
    { name: "Gelanggang Remaja Tebet", area: "Sports hall, Tebet", capacity: "500 people" },
    { name: "Sekolah Dasar Manggarai", area: "School hall, Manggarai", capacity: "250 people" },
  ],
  routes: [
    {
      code: "Route A",
      from: "Kampung Melayu",
      via: "Jl. MT Haryono",
      to: "Posko Kampung Melayu",
    },
    {
      code: "Route B",
      from: "Bukit Duri",
      via: "Jl. Prof. Dr. Soepomo",
      to: "Gelanggang Remaja Tebet",
    },
    {
      code: "Route C",
      from: "Manggarai",
      via: "Jl. Minangkabau",
      to: "Sekolah Dasar Manggarai",
    },
  ],
  hotline: "112",
  hotlineLabel: "Jakarta Siaga 112",
  source: "BNPB (Badan Nasional Penanggulangan Bencana) & BPBD DKI Jakarta",
};

/** The data the templates render when no `data` prop is passed. */
export const defaultData = sampleData;
