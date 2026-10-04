export type ParsedQuestion = {
  raw: string;
  harbourQuery: string | null;
  draftMetres: number | null;
  weekday: string | null;
  afterTime: string | null;
  month: number | null;
  day: number | null;
  windName: string | null;
  berthHint: string | null;
};

const HARBOURS: Array<{ q: string; aliases: RegExp }> = [
  { q: "Marsamxett", aliases: /marsamxett|marsamuscetto|lazzaretto/i },
  { q: "Mgarr (Gozo)", aliases: /m[gġ]arr|gozo/i },
  { q: "Xlendi", aliases: /xlendi/i },
  { q: "Grand Harbour", aliases: /grand\s+harbou?r|valletta/i },
  { q: "Syracuse", aliases: /syracuse|siracusa/i },
  { q: "Pozzallo", aliases: /pozzallo/i },
  { q: "Marzamemi", aliases: /marzamemi/i },
  { q: "Marina di Ragusa", aliases: /marina di ragusa|ragusa/i },
];

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  winter: 12,
};

export function parseQuestion(raw: string): ParsedQuestion {
  const harbour = HARBOURS.find((h) => h.aliases.test(raw));
  const draft = raw.match(/(\d+(?:\.\d+)?)\s*(m\b|metre|meter|draft|draught)/i);
  const weekday = WEEKDAYS.find((d) => new RegExp(`\\b${d}\\b`, "i").test(raw)) ?? null;
  const time = raw.match(/after\s*(\d{1,2})(?::(\d{2}))?/i);
  const monthName = Object.keys(MONTHS).find((m) => new RegExp(`\\b${m}\\b`, "i").test(raw));
  const wind = raw.match(/\b(gregale|scirocco|sirocco|libeccio|mistral)\b/i);
  const berthHint = [
    "inner pontoon",
    "inner basin east",
    "inner basin",
    "commercial quay",
    "visitor quay",
    "visitor west",
    "visitor pontoon",
    "marina a",
    "berth a",
    "tuna quay",
    "outer north",
    "outer south",
  ].find((hint) => raw.toLowerCase().includes(hint)) ?? null;

  return {
    raw,
    harbourQuery: harbour?.q ?? null,
    draftMetres: draft ? Number(draft[1]) : null,
    weekday,
    afterTime: time ? `${String(time[1]).padStart(2, "0")}:${time[2] ?? "00"}` : raw.match(/18:00|1800/) ? "18:00" : null,
    month: monthName ? MONTHS[monthName] : null,
    day: /after 18|friday/i.test(raw) ? 1 : 15,
    windName: wind ? wind[1].toLowerCase().replace("sirocco", "scirocco") : null,
    berthHint,
  };
}
