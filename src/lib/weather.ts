export type WindObservation = {
  knots: number | null;
  directionDegrees: number | null;
  directionLabel: string;
  source: "open-meteo" | "unavailable";
  at: string | null;
};

const LABELS: Array<{ name: string; aliases: string[]; min: number; max: number }> = [
  { name: "N", aliases: ["north"], min: 350, max: 10 },
  { name: "NE", aliases: ["north-east", "northeast", "gregale"], min: 20, max: 70 },
  { name: "E", aliases: ["east"], min: 70, max: 110 },
  { name: "SE", aliases: ["south-east", "southeast", "scirocco", "sirocco"], min: 110, max: 160 },
  { name: "S", aliases: ["south"], min: 160, max: 200 },
  { name: "SW", aliases: ["south-west", "southwest", "libeccio"], min: 200, max: 250 },
  { name: "W", aliases: ["west"], min: 250, max: 290 },
  { name: "NW", aliases: ["north-west", "northwest", "mistral"], min: 290, max: 340 },
];

export function labelForDegrees(deg: number): string {
  for (const row of LABELS) {
    if (row.min <= row.max && deg >= row.min && deg < row.max) return row.name;
    if (row.min > row.max && (deg >= row.min || deg < row.max)) return row.name;
  }
  return "variable";
}

export function windNameMatches(ruleDirection: string, liveLabel: string, askedName: string | null): boolean {
  const rule = ruleDirection.toLowerCase();
  const asked = askedName?.toLowerCase() ?? null;
  if (asked && (rule === asked || rule.includes(asked) || asked.includes(rule))) return true;
  const row = LABELS.find((r) => r.aliases.includes(rule) || r.name.toLowerCase() === rule);
  if (!row) return rule === liveLabel.toLowerCase();
  if (asked && (row.aliases.includes(asked) || row.name.toLowerCase() === asked)) return true;
  return row.name === liveLabel;
}

export async function fetchHarbourWind(lat: number, lon: number): Promise<WindObservation> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "wind_speed_10m,wind_direction_10m");
  url.searchParams.set("wind_speed_unit", "kn");
  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as {
      current?: { wind_speed_10m?: number; wind_direction_10m?: number; time?: string };
    };
    const knots = json.current?.wind_speed_10m ?? null;
    const deg = json.current?.wind_direction_10m ?? null;
    return {
      knots: knots == null ? null : Math.round(knots * 10) / 10,
      directionDegrees: deg ?? null,
      directionLabel: deg == null ? "unknown" : labelForDegrees(deg),
      source: "open-meteo",
      at: json.current?.time ?? null,
    };
  } catch {
    return {
      knots: null,
      directionDegrees: null,
      directionLabel: "unknown",
      source: "unavailable",
      at: null,
    };
  }
}
