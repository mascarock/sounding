import type { SanityRef, SeedDocument } from "./types";

function ref(id: string, key?: string): SanityRef {
  return key ? { _type: "reference", _ref: id, _key: key } : { _type: "reference", _ref: id };
}

function refs(ids: string[]): SanityRef[] {
  return ids.map((id, i) => ref(id, `k${i}`));
}

function harbour(partial: {
  _id: string;
  name: string;
  slug: string;
  lat: number;
  lon: number;
  seaArea: string;
}): SeedDocument {
  return {
    _id: partial._id,
    _type: "harbour",
    name: partial.name,
    slug: { _type: "slug", current: partial.slug },
    lat: partial.lat,
    lon: partial.lon,
    seaArea: partial.seaArea,
  };
}

function berth(partial: {
  _id: string;
  harbour: string;
  name: string;
  depthAtChartDatum: number;
  shelter: string;
  reservedFor: string;
}): SeedDocument {
  return {
    _id: partial._id,
    _type: "berth",
    harbour: ref(partial.harbour),
    name: partial.name,
    depthAtChartDatum: partial.depthAtChartDatum,
    shelter: partial.shelter,
    reservedFor: partial.reservedFor,
  };
}

function doc(partial: {
  _id: string;
  kind: "almanacExcerpt" | "harbourNotice" | "siltSurvey" | "weatherRule";
  code: string;
  title: string;
  issuedOn: string;
  harbour: string;
  body: string;
  supersedes?: string;
  cites?: string[];
  appliesTo?: string[];
  subjectBerth?: string;
  standingDepthMetres?: number;
  maxDraftMetres?: number;
  reservedWeekday?: string;
  reservedAfter?: string;
  closedFrom?: string;
  closedUntil?: string;
  windDirection?: string;
  minKnots?: number;
  effect?: string;
  effectBerths?: string[];
}): SeedDocument {
  const out: SeedDocument = {
    _id: partial._id,
    _type: "sourceDocument",
    kind: partial.kind,
    code: partial.code,
    title: partial.title,
    issuedOn: partial.issuedOn,
    harbour: ref(partial.harbour),
    body: partial.body,
    cites: refs(partial.cites ?? []),
    appliesTo: refs(partial.appliesTo ?? []),
  };
  if (partial.supersedes) out.supersedes = ref(partial.supersedes);
  if (partial.subjectBerth) out.subjectBerth = ref(partial.subjectBerth);
  if (partial.standingDepthMetres !== undefined) out.standingDepthMetres = partial.standingDepthMetres;
  if (partial.maxDraftMetres !== undefined) out.maxDraftMetres = partial.maxDraftMetres;
  if (partial.reservedWeekday) out.reservedWeekday = partial.reservedWeekday;
  if (partial.reservedAfter) out.reservedAfter = partial.reservedAfter;
  if (partial.closedFrom) out.closedFrom = partial.closedFrom;
  if (partial.closedUntil) out.closedUntil = partial.closedUntil;
  if (partial.windDirection) out.windDirection = partial.windDirection;
  if (partial.minKnots !== undefined) out.minKnots = partial.minKnots;
  if (partial.effect) out.effect = partial.effect;
  if (partial.effectBerths) out.effectBerths = refs(partial.effectBerths);
  return out;
}

function claim(partial: {
  _id: string;
  statement: string;
  about: string;
  source: string;
  validFrom: string;
  topic: "depth" | "access" | "reservation" | "shelter" | "season";
}): SeedDocument {
  return {
    _id: partial._id,
    _type: "claim",
    statement: partial.statement,
    about: ref(partial.about),
    source: ref(partial.source),
    validFrom: partial.validFrom,
    topic: partial.topic,
  };
}

const harbours: SeedDocument[] = [
  harbour({
    _id: "harbour-marsamxett",
    name: "Marsamxett",
    slug: "marsamxett",
    lat: 35.9012,
    lon: 14.5088,
    seaArea: "Lazzaretto Creek",
  }),
  harbour({
    _id: "harbour-mgarr",
    name: "Mgarr (Gozo)",
    slug: "mgarr-gozo",
    lat: 36.0256,
    lon: 14.2954,
    seaArea: "Mgarr Harbour roads",
  }),
  harbour({
    _id: "harbour-xlendi",
    name: "Xlendi",
    slug: "xlendi",
    lat: 36.0298,
    lon: 14.2176,
    seaArea: "Xlendi Bay",
  }),
  harbour({
    _id: "harbour-grand-harbour",
    name: "Grand Harbour",
    slug: "grand-harbour",
    lat: 35.8881,
    lon: 14.5212,
    seaArea: "Dockyard Creek approaches",
  }),
  harbour({
    _id: "harbour-syracuse",
    name: "Syracuse",
    slug: "syracuse",
    lat: 37.0594,
    lon: 15.2936,
    seaArea: "Porto Grande, Ortigia",
  }),
  harbour({
    _id: "harbour-pozzallo",
    name: "Pozzallo",
    slug: "pozzallo",
    lat: 36.7204,
    lon: 14.8468,
    seaArea: "Pozzallo commercial basin",
  }),
  harbour({
    _id: "harbour-marzamemi",
    name: "Marzamemi",
    slug: "marzamemi",
    lat: 36.7432,
    lon: 15.1184,
    seaArea: "Marzamemi tuna harbour",
  }),
  harbour({
    _id: "harbour-marina-di-ragusa",
    name: "Marina di Ragusa",
    slug: "marina-di-ragusa",
    lat: 36.782,
    lon: 14.5548,
    seaArea: "Marina di Ragusa basin",
  }),
];

const berths: SeedDocument[] = [
  berth({ _id: "berth-marsa-inner-a", harbour: "harbour-marsamxett", name: "Inner Pontoon A", depthAtChartDatum: 2.1, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-marsa-inner-b", harbour: "harbour-marsamxett", name: "Inner Pontoon B", depthAtChartDatum: 2.1, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-marsa-inner-c", harbour: "harbour-marsamxett", name: "Inner Pontoon C", depthAtChartDatum: 2.1, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-marsa-outer-north", harbour: "harbour-marsamxett", name: "Outer North", depthAtChartDatum: 3.2, shelter: "good-ne", reservedFor: "visitors" }),
  berth({ _id: "berth-marsa-outer-south", harbour: "harbour-marsamxett", name: "Outer South", depthAtChartDatum: 3.0, shelter: "good-ne", reservedFor: "visitors" }),
  berth({ _id: "berth-marsa-fuel-wall", harbour: "harbour-marsamxett", name: "Fuel wall", depthAtChartDatum: 3.4, shelter: "poor", reservedFor: "fuel-barge" }),

  berth({ _id: "berth-mgarr-ferry-east", harbour: "harbour-mgarr", name: "Ferry East", depthAtChartDatum: 5.5, shelter: "good-ne", reservedFor: "ferry" }),
  berth({ _id: "berth-mgarr-visitor-west", harbour: "harbour-mgarr", name: "Visitor West", depthAtChartDatum: 2.6, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-mgarr-fishermen", harbour: "harbour-mgarr", name: "Fishermen's quay", depthAtChartDatum: 2.4, shelter: "good-ne", reservedFor: "working-boats" }),
  berth({ _id: "berth-mgarr-outer-hammer", harbour: "harbour-mgarr", name: "Outer hammer", depthAtChartDatum: 4.0, shelter: "poor", reservedFor: "visitors" }),
  berth({ _id: "berth-mgarr-waiting-buoy", harbour: "harbour-mgarr", name: "Waiting buoy", depthAtChartDatum: 3.0, shelter: "poor", reservedFor: "visitors" }),

  berth({ _id: "berth-xlendi-visitor-quay", harbour: "harbour-xlendi", name: "Visitor quay", depthAtChartDatum: 2.4, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-xlendi-inner-elbow", harbour: "harbour-xlendi", name: "Inner elbow", depthAtChartDatum: 1.8, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-xlendi-outer-mooring", harbour: "harbour-xlendi", name: "Outer mooring", depthAtChartDatum: 3.5, shelter: "poor", reservedFor: "visitors" }),
  berth({ _id: "berth-xlendi-caves-wall", harbour: "harbour-xlendi", name: "Caves wall", depthAtChartDatum: 1.2, shelter: "dinghy", reservedFor: "dinghy" }),
  berth({ _id: "berth-xlendi-dinghy-steps", harbour: "harbour-xlendi", name: "Dinghy steps", depthAtChartDatum: 0.8, shelter: "dinghy", reservedFor: "dinghy" }),

  berth({ _id: "berth-gh-lascaris", harbour: "harbour-grand-harbour", name: "Lascaris wharf", depthAtChartDatum: 8.0, shelter: "fair-inner", reservedFor: "cruise" }),
  berth({ _id: "berth-gh-boilers", harbour: "harbour-grand-harbour", name: "Boilers wharf", depthAtChartDatum: 4.0, shelter: "fair-inner", reservedFor: "navy" }),
  berth({ _id: "berth-gh-kalkara", harbour: "harbour-grand-harbour", name: "Kalkara Creek wall", depthAtChartDatum: 2.0, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-gh-french-creek", harbour: "harbour-grand-harbour", name: "French Creek layby", depthAtChartDatum: 3.5, shelter: "poor", reservedFor: "commercial" }),
  berth({ _id: "berth-gh-visitor-pontoon", harbour: "harbour-grand-harbour", name: "Visitor pontoon", depthAtChartDatum: 2.5, shelter: "fair-inner", reservedFor: "visitors" }),

  berth({ _id: "berth-syr-inner-east", harbour: "harbour-syracuse", name: "Inner Basin East", depthAtChartDatum: 3.5, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-syr-inner-west", harbour: "harbour-syracuse", name: "Inner Basin West", depthAtChartDatum: 3.2, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-syr-outer-mole", harbour: "harbour-syracuse", name: "Outer mole", depthAtChartDatum: 5.0, shelter: "good-ne", reservedFor: "visitors" }),
  berth({ _id: "berth-syr-yacht-club", harbour: "harbour-syracuse", name: "Yacht club wall", depthAtChartDatum: 2.8, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-syr-ortigia-wall", harbour: "harbour-syracuse", name: "Ortigia wall", depthAtChartDatum: 2.0, shelter: "poor", reservedFor: "visitors" }),

  berth({ _id: "berth-poz-commercial", harbour: "harbour-pozzallo", name: "Commercial quay", depthAtChartDatum: 3.0, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-poz-visitor-south", harbour: "harbour-pozzallo", name: "Visitor South", depthAtChartDatum: 2.2, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-poz-fishermen", harbour: "harbour-pozzallo", name: "Fishermen's ladder", depthAtChartDatum: 2.0, shelter: "fair-inner", reservedFor: "working-boats" }),
  berth({ _id: "berth-poz-outer-breakwater", harbour: "harbour-pozzallo", name: "Outer breakwater", depthAtChartDatum: 4.5, shelter: "poor", reservedFor: "visitors" }),
  berth({ _id: "berth-poz-ro-ro", harbour: "harbour-pozzallo", name: "Ro-ro layby", depthAtChartDatum: 6.0, shelter: "fair-inner", reservedFor: "commercial" }),

  berth({ _id: "berth-marz-tuna-quay", harbour: "harbour-marzamemi", name: "Tuna quay", depthAtChartDatum: 2.8, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-marz-inner-basin", harbour: "harbour-marzamemi", name: "Inner basin", depthAtChartDatum: 1.6, shelter: "good-se", reservedFor: "visitors" }),
  berth({ _id: "berth-marz-outer-arm", harbour: "harbour-marzamemi", name: "Outer arm", depthAtChartDatum: 3.2, shelter: "poor", reservedFor: "visitors" }),
  berth({ _id: "berth-marz-village-steps", harbour: "harbour-marzamemi", name: "Village steps", depthAtChartDatum: 1.1, shelter: "dinghy", reservedFor: "dinghy" }),
  berth({ _id: "berth-marz-seasonal-raft", harbour: "harbour-marzamemi", name: "Seasonal raft", depthAtChartDatum: 2.0, shelter: "fair-inner", reservedFor: "visitors" }),

  berth({ _id: "berth-mdr-public-quay", harbour: "harbour-marina-di-ragusa", name: "Public quay", depthAtChartDatum: 2.5, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-mdr-marina-a", harbour: "harbour-marina-di-ragusa", name: "Marina A", depthAtChartDatum: 2.4, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-mdr-marina-b", harbour: "harbour-marina-di-ragusa", name: "Marina B", depthAtChartDatum: 2.6, shelter: "fair-inner", reservedFor: "visitors" }),
  berth({ _id: "berth-mdr-fuel-pontoon", harbour: "harbour-marina-di-ragusa", name: "Fuel pontoon", depthAtChartDatum: 3.0, shelter: "poor", reservedFor: "fuel-barge" }),
  berth({ _id: "berth-mdr-outer-hammer", harbour: "harbour-marina-di-ragusa", name: "Outer hammer", depthAtChartDatum: 4.2, shelter: "poor", reservedFor: "visitors" }),
];

const documents: SeedDocument[] = [
  // --- Marsamxett chain: almanac → supersede → cite/reserve → weather ---
  doc({
    _id: "doc-alm-2019-marsa-pontoon",
    kind: "almanacExcerpt",
    code: "ALM-2019-MARSA-PONTOON",
    title: "2019 pocket note — Marsamxett inner pontoon",
    issuedOn: "2019-03-01",
    harbour: "harbour-marsamxett",
    appliesTo: ["berth-marsa-inner-a", "berth-marsa-inner-b", "berth-marsa-inner-c"],
    subjectBerth: "berth-marsa-inner-a",
    standingDepthMetres: 2.1,
    body: "Soundings Pocket Notes, 2019 sheet M-4. Marsamxett inner pontoon in Lazzaretto Creek: 2.1 metres at chart datum. Visiting day-boats are welcome alongside the three inner fingers. Water on the pontoon. No ferry overflow is listed.",
  }),
  doc({
    _id: "doc-hn-2024-17",
    kind: "harbourNotice",
    code: "HN-2024-17",
    title: "HN-2024-17 silt on the Marsamxett inner pontoon",
    issuedOn: "2024-03-17",
    harbour: "harbour-marsamxett",
    supersedes: "doc-alm-2019-marsa-pontoon",
    appliesTo: ["berth-marsa-inner-a", "berth-marsa-inner-b", "berth-marsa-inner-c"],
    subjectBerth: "berth-marsa-inner-a",
    standingDepthMetres: 1.4,
    body: "Harbour notice HN-2024-17, 17 March 2024. After winter silt in Lazzaretto Creek the inner pontoon sounds 1.4 metres at chart datum. The outer two visitor berths, Outer North and Outer South, are excepted and keep their published depths. This notice supersedes the 2019 pocket-note inner-pontoon depth.",
  }),
  doc({
    _id: "doc-hn-2025-03",
    kind: "harbourNotice",
    code: "HN-2025-03",
    title: "HN-2025-03 Friday ferry reservation, Marsamxett outers",
    issuedOn: "2025-02-03",
    harbour: "harbour-marsamxett",
    cites: ["doc-hn-2024-17"],
    appliesTo: ["berth-marsa-outer-north", "berth-marsa-outer-south"],
    subjectBerth: "berth-marsa-outer-north",
    reservedWeekday: "friday",
    reservedAfter: "18:00",
    body: "Harbour notice HN-2025-03, 3 February 2025. Citing HN-2024-17 (inner silt unchanged). The outer two visitor berths at Marsamxett are reserved for the scheduled ferry relief on Fridays after 18:00. Visiting craft may not occupy Outer North or Outer South in that window.",
  }),
  doc({
    _id: "doc-wr-marsa-gregale",
    kind: "weatherRule",
    code: "WR-M-G20",
    title: "Marsamxett gregale shelter rule",
    issuedOn: "2023-11-12",
    harbour: "harbour-marsamxett",
    appliesTo: ["berth-marsa-outer-north", "berth-marsa-outer-south", "berth-marsa-inner-a", "berth-marsa-inner-b", "berth-marsa-inner-c"],
    windDirection: "gregale",
    minKnots: 20,
    effect: "When a gregale (north-easterly) reaches 20 knots or more, the only visitor berths with usable shelter at Marsamxett are Outer North and Outer South. Inner fingers take beam chop over the pontoon.",
    effectBerths: ["berth-marsa-outer-north", "berth-marsa-outer-south"],
    body: "Weather berthing rule WR-M-G20. Join to the live wind. In a gregale at or above 20 knots the sheltered visitor berths at Marsamxett are exactly Outer North and Outer South.",
  }),
  doc({
    _id: "doc-alm-2019-marsa-fuel",
    kind: "almanacExcerpt",
    code: "ALM-2019-MARSA-FUEL",
    title: "2019 pocket note — Marsamxett fuel wall",
    issuedOn: "2019-03-01",
    harbour: "harbour-marsamxett",
    appliesTo: ["berth-marsa-fuel-wall"],
    subjectBerth: "berth-marsa-fuel-wall",
    standingDepthMetres: 3.4,
    body: "Soundings Pocket Notes, 2019 sheet M-5. Marsamxett fuel wall: 3.4 metres. Alongside for the harbour barge only. Not a visitor berth.",
  }),

  // --- Syracuse chain: almanac → silt survey ← cited by superseding notice ---
  doc({
    _id: "doc-alm-2019-syr-basin",
    kind: "almanacExcerpt",
    code: "ALM-2019-SYR-BASIN",
    title: "2019 pocket note — Syracuse inner basin",
    issuedOn: "2019-04-12",
    harbour: "harbour-syracuse",
    appliesTo: ["berth-syr-inner-east", "berth-syr-inner-west"],
    subjectBerth: "berth-syr-inner-east",
    standingDepthMetres: 3.5,
    body: "Soundings Pocket Notes, 2019 sheet S-2. Syracuse Inner Basin East: 3.5 metres at chart datum throughout. Suitable for a 3.0 metre draft. Visiting yachts use the east wall.",
  }),
  doc({
    _id: "doc-ss-2025-02",
    kind: "siltSurvey",
    code: "SS-2025-02",
    title: "SS-2025-02 Syracuse inner basin shoal",
    issuedOn: "2025-02-02",
    harbour: "harbour-syracuse",
    appliesTo: ["berth-syr-inner-east"],
    subjectBerth: "berth-syr-inner-east",
    standingDepthMetres: 2.2,
    body: "Silt survey SS-2025-02, 2 February 2025. Inner Basin East, Syracuse: four pole soundings average 2.2 metres at chart datum after winter flood debris. Survey only; not a berthing permission.",
  }),
  doc({
    _id: "doc-hn-2025-11",
    kind: "harbourNotice",
    code: "HN-2025-11",
    title: "HN-2025-11 Syracuse inner east closed over 2.0 m draft",
    issuedOn: "2025-02-11",
    harbour: "harbour-syracuse",
    supersedes: "doc-alm-2019-syr-basin",
    cites: ["doc-ss-2025-02"],
    appliesTo: ["berth-syr-inner-east"],
    subjectBerth: "berth-syr-inner-east",
    standingDepthMetres: 2.2,
    maxDraftMetres: 2.0,
    body: "Harbour notice HN-2025-11, 11 February 2025. Citing silt survey SS-2025-02. Inner Basin East is closed to drafts over 2.0 metres until the spring dredge. The 2019 pocket-note figure of 3.5 metres is superseded. Inner Basin West is not covered by this notice.",
  }),
  doc({
    _id: "doc-alm-2019-syr-mole",
    kind: "almanacExcerpt",
    code: "ALM-2019-SYR-MOLE",
    title: "2019 pocket note — Syracuse outer mole",
    issuedOn: "2019-04-12",
    harbour: "harbour-syracuse",
    appliesTo: ["berth-syr-outer-mole"],
    subjectBerth: "berth-syr-outer-mole",
    standingDepthMetres: 5.0,
    body: "Soundings Pocket Notes, 2019 sheet S-1. Syracuse outer mole: 5.0 metres. Exposed in a gregale. Visitors may lie-by if the inner basin is full.",
  }),
  doc({
    _id: "doc-wr-syr-gregale",
    kind: "weatherRule",
    code: "WR-S-G25",
    title: "Syracuse gregale chop rule",
    issuedOn: "2022-10-08",
    harbour: "harbour-syracuse",
    appliesTo: ["berth-syr-inner-east", "berth-syr-inner-west", "berth-syr-outer-mole"],
    windDirection: "gregale",
    minKnots: 25,
    effect: "In a gregale at or above 25 knots the inner basin takes short steep chop. Prefer the outer mole if a berth is offered there.",
    effectBerths: ["berth-syr-outer-mole"],
    body: "Weather berthing rule WR-S-G25. Gregale 25 knots or more: inner basin at Syracuse is uncomfortable; the outer mole is the named fallback.",
  }),
  doc({
    _id: "doc-hn-2024-ortigia",
    kind: "harbourNotice",
    code: "HN-2024-19",
    title: "HN-2024-19 Ortigia festival raft",
    issuedOn: "2024-07-19",
    harbour: "harbour-syracuse",
    appliesTo: ["berth-syr-ortigia-wall"],
    subjectBerth: "berth-syr-ortigia-wall",
    body: "Harbour notice HN-2024-19. Ortigia wall at Syracuse is closed 12–16 August for the invented lantern festival raft. No depth change.",
  }),
  doc({
    _id: "doc-alm-2019-syr-club",
    kind: "almanacExcerpt",
    code: "ALM-2019-SYR-CLUB",
    title: "2019 pocket note — Syracuse yacht club wall",
    issuedOn: "2019-04-12",
    harbour: "harbour-syracuse",
    appliesTo: ["berth-syr-yacht-club"],
    subjectBerth: "berth-syr-yacht-club",
    standingDepthMetres: 2.8,
    body: "Soundings Pocket Notes, 2019 sheet S-3. Syracuse yacht club wall: 2.8 metres. Members first; visitors if space. Not the inner basin.",
  }),

  // --- Pozzallo chain: later notice does not win unless supersedes ---
  doc({
    _id: "doc-alm-2019-poz-commercial",
    kind: "almanacExcerpt",
    code: "ALM-2019-POZ-COMM",
    title: "2019 pocket note — Pozzallo commercial quay",
    issuedOn: "2019-05-20",
    harbour: "harbour-pozzallo",
    appliesTo: ["berth-poz-commercial"],
    subjectBerth: "berth-poz-commercial",
    standingDepthMetres: 3.0,
    body: "Soundings Pocket Notes, 2019 sheet P-1. Pozzallo commercial quay: 3.0 metres at chart datum. Day-boats may lie outside working hours if the ro-ro is away.",
  }),
  doc({
    _id: "doc-hn-2024-44",
    kind: "harbourNotice",
    code: "HN-2024-44",
    title: "HN-2024-44 Pozzallo spoil, commercial quay 2.8 m",
    issuedOn: "2024-06-01",
    harbour: "harbour-pozzallo",
    supersedes: "doc-alm-2019-poz-commercial",
    appliesTo: ["berth-poz-commercial"],
    subjectBerth: "berth-poz-commercial",
    standingDepthMetres: 2.8,
    maxDraftMetres: 2.6,
    body: "Harbour notice HN-2024-44, 1 June 2024. Dredge spoil along the Pozzallo commercial quay reduces standing depth to 2.8 metres at chart datum. Visiting craft may use the quay only if under 2.6 metres draft. This notice supersedes the 2019 pocket-note depth.",
  }),
  doc({
    _id: "doc-hn-2025-08",
    kind: "harbourNotice",
    code: "HN-2025-08",
    title: "HN-2025-08 club sounding, Pozzallo commercial quay",
    issuedOn: "2025-03-12",
    harbour: "harbour-pozzallo",
    cites: ["doc-alm-2019-poz-commercial"],
    appliesTo: ["berth-poz-commercial"],
    subjectBerth: "berth-poz-commercial",
    standingDepthMetres: 3.2,
    body: "Harbour notice HN-2025-08, 12 March 2025. A visiting yacht-club party reported 3.2 metres alongside the Pozzallo commercial quay after an informal lead-line. This note cites the 2019 pocket note. It does not supersede HN-2024-44 and is not a standing figure.",
  }),
  doc({
    _id: "doc-alm-2019-poz-visitor",
    kind: "almanacExcerpt",
    code: "ALM-2019-POZ-VIS",
    title: "2019 pocket note — Pozzallo visitor south",
    issuedOn: "2019-05-20",
    harbour: "harbour-pozzallo",
    appliesTo: ["berth-poz-visitor-south"],
    subjectBerth: "berth-poz-visitor-south",
    standingDepthMetres: 2.2,
    body: "Soundings Pocket Notes, 2019 sheet P-2. Pozzallo Visitor South: 2.2 metres. Short stay. Watch the ferry wash.",
  }),
  doc({
    _id: "doc-hn-2023-poz-roro",
    kind: "harbourNotice",
    code: "HN-2023-21",
    title: "HN-2023-21 Pozzallo ro-ro layby",
    issuedOn: "2023-03-21",
    harbour: "harbour-pozzallo",
    appliesTo: ["berth-poz-ro-ro"],
    subjectBerth: "berth-poz-ro-ro",
    body: "Harbour notice HN-2023-21. Pozzallo ro-ro layby remains commercial only. Visiting yachts are not accepted on the ramp wall.",
  }),
  doc({
    _id: "doc-ss-2022-poz",
    kind: "siltSurvey",
    code: "SS-2022-07",
    title: "SS-2022-07 Pozzallo visitor south sounding",
    issuedOn: "2022-09-07",
    harbour: "harbour-pozzallo",
    appliesTo: ["berth-poz-visitor-south"],
    subjectBerth: "berth-poz-visitor-south",
    standingDepthMetres: 2.2,
    body: "Silt survey SS-2022-07. Visitor South at Pozzallo still 2.2 metres. No action. Included so a harbour-name search is noisy.",
  }),

  // --- Xlendi chain: seasonal close supersedes all-year almanac ---
  doc({
    _id: "doc-alm-2019-xlendi-quay",
    kind: "almanacExcerpt",
    code: "ALM-2019-XLENDI-QUAY",
    title: "2019 pocket note — Xlendi visitor quay all year",
    issuedOn: "2019-02-18",
    harbour: "harbour-xlendi",
    appliesTo: ["berth-xlendi-visitor-quay"],
    subjectBerth: "berth-xlendi-visitor-quay",
    standingDepthMetres: 2.4,
    body: "Soundings Pocket Notes, 2019 sheet X-1. Xlendi visitor quay: 2.4 metres, open all year, good holding along the inner face. Visiting day-boats welcome.",
  }),
  doc({
    _id: "doc-hn-2024-season-xl",
    kind: "harbourNotice",
    code: "HN-2024-SEASON-XL",
    title: "HN-2024-SEASON-XL Xlendi quay closed in winter",
    issuedOn: "2024-10-01",
    harbour: "harbour-xlendi",
    supersedes: "doc-alm-2019-xlendi-quay",
    appliesTo: ["berth-xlendi-visitor-quay"],
    subjectBerth: "berth-xlendi-visitor-quay",
    standingDepthMetres: 2.4,
    closedFrom: "11-01",
    closedUntil: "03-31",
    body: "Harbour notice HN-2024-SEASON-XL, 1 October 2024. The Xlendi visitor quay is closed from 1 November through 31 March for winter swell. It remains 2.4 metres when open, 1 April through 31 October. The 2019 all-year welcome is superseded. The outer mooring is not a winter substitute.",
  }),
  doc({
    _id: "doc-wr-xlendi-scirocco",
    kind: "weatherRule",
    code: "WR-X-S15",
    title: "Xlendi scirocco quay rule",
    issuedOn: "2021-09-04",
    harbour: "harbour-xlendi",
    appliesTo: ["berth-xlendi-visitor-quay", "berth-xlendi-outer-mooring"],
    windDirection: "scirocco",
    minKnots: 15,
    effect: "In a scirocco at or above 15 knots the visitor quay is untenable even in the open season. The outer mooring is the named fallback in settled nights only.",
    effectBerths: ["berth-xlendi-outer-mooring"],
    body: "Weather berthing rule WR-X-S15. Scirocco 15 knots or more at Xlendi: leave the visitor quay. Outer mooring only if the night is otherwise settled.",
  }),
  doc({
    _id: "doc-alm-2019-xlendi-caves",
    kind: "almanacExcerpt",
    code: "ALM-2019-XLENDI-CAVES",
    title: "2019 pocket note — Xlendi caves wall",
    issuedOn: "2019-02-18",
    harbour: "harbour-xlendi",
    appliesTo: ["berth-xlendi-caves-wall"],
    subjectBerth: "berth-xlendi-caves-wall",
    standingDepthMetres: 1.2,
    body: "Soundings Pocket Notes, 2019 sheet X-2. Xlendi caves wall: 1.2 metres, dinghy only. Do not put a keel on the rock shelf.",
  }),
  doc({
    _id: "doc-hn-2023-xlendi-steps",
    kind: "harbourNotice",
    code: "HN-2023-33",
    title: "HN-2023-33 Xlendi dinghy steps",
    issuedOn: "2023-05-30",
    harbour: "harbour-xlendi",
    appliesTo: ["berth-xlendi-dinghy-steps"],
    body: "Harbour notice HN-2023-33. Xlendi dinghy steps close at dusk in July and August for the invented swimming rope. No keel-boat change.",
  }),
  doc({
    _id: "doc-alm-2019-xlendi-elbow",
    kind: "almanacExcerpt",
    code: "ALM-2019-XLENDI-ELBOW",
    title: "2019 pocket note — Xlendi inner elbow",
    issuedOn: "2019-02-18",
    harbour: "harbour-xlendi",
    appliesTo: ["berth-xlendi-inner-elbow"],
    subjectBerth: "berth-xlendi-inner-elbow",
    standingDepthMetres: 1.8,
    body: "Soundings Pocket Notes, 2019 sheet X-3. Xlendi inner elbow: 1.8 metres. Local boats. Not offered as a winter visitor berth in later notices.",
  }),

  // --- Mgarr: ferry-hours supersede ---
  doc({
    _id: "doc-alm-2019-mgarr-visitor",
    kind: "almanacExcerpt",
    code: "ALM-2019-MGARR-VIS",
    title: "2019 pocket note — Mgarr visitor west always open",
    issuedOn: "2019-06-02",
    harbour: "harbour-mgarr",
    appliesTo: ["berth-mgarr-visitor-west"],
    subjectBerth: "berth-mgarr-visitor-west",
    standingDepthMetres: 2.6,
    body: "Soundings Pocket Notes, 2019 sheet G-2. Mgarr (Gozo) Visitor West: 2.6 metres, always available to visiting day-boats. Keep clear of the ferry turning circle.",
  }),
  doc({
    _id: "doc-hn-2024-mg-ferry",
    kind: "harbourNotice",
    code: "HN-2024-MG-FERRY",
    title: "HN-2024-MG-FERRY Visitor West closed in the ferry day",
    issuedOn: "2024-04-08",
    harbour: "harbour-mgarr",
    supersedes: "doc-alm-2019-mgarr-visitor",
    appliesTo: ["berth-mgarr-visitor-west"],
    subjectBerth: "berth-mgarr-visitor-west",
    standingDepthMetres: 2.6,
    closedFrom: "05-01",
    closedUntil: "09-30",
    body: "Harbour notice HN-2024-MG-FERRY, 8 April 2024. From 1 May through 30 September, Visitor West at Mgarr (Gozo) is closed 07:00–20:00 whenever the second ferry is on Ferry East. The 2019 always-available claim is superseded. Night arrivals after 20:00 may still use 2.6 metres.",
  }),
  doc({
    _id: "doc-wr-mgarr-gregale",
    kind: "weatherRule",
    code: "WR-G-G18",
    title: "Mgarr gregale working-quay rule",
    issuedOn: "2020-12-01",
    harbour: "harbour-mgarr",
    appliesTo: ["berth-mgarr-fishermen", "berth-mgarr-visitor-west", "berth-mgarr-outer-hammer"],
    windDirection: "gregale",
    minKnots: 18,
    effect: "In a gregale at or above 18 knots Visitor West and the outer hammer at Mgarr are exposed. The fishermen's quay is the named sheltered wall, and only with local permission.",
    effectBerths: ["berth-mgarr-fishermen"],
    body: "Weather berthing rule WR-G-G18. Gregale 18 knots or more at Mgarr (Gozo): do not use Visitor West. Fishermen's quay only if the owners agree.",
  }),
  doc({
    _id: "doc-alm-2019-mgarr-hammer",
    kind: "almanacExcerpt",
    code: "ALM-2019-MGARR-HAMMER",
    title: "2019 pocket note — Mgarr outer hammer",
    issuedOn: "2019-06-02",
    harbour: "harbour-mgarr",
    appliesTo: ["berth-mgarr-outer-hammer"],
    subjectBerth: "berth-mgarr-outer-hammer",
    standingDepthMetres: 4.0,
    body: "Soundings Pocket Notes, 2019 sheet G-1. Mgarr outer hammer: 4.0 metres. Roly. Day-boat waiting only.",
  }),
  doc({
    _id: "doc-hn-2022-mgarr-pilot",
    kind: "harbourNotice",
    code: "HN-2022-PILOT",
    title: "HN-2022-PILOT Mgarr radio",
    issuedOn: "2022-01-15",
    harbour: "harbour-mgarr",
    body: "Harbour notice HN-2022-PILOT. Call Mgarr (Gozo) harbour on invented channel 12 before crossing the ferry track. Not a depth notice.",
  }),
  doc({
    _id: "doc-ss-2023-mgarr-buoy",
    kind: "siltSurvey",
    code: "SS-2023-MG",
    title: "SS-2023-MG Mgarr waiting buoy",
    issuedOn: "2023-08-19",
    harbour: "harbour-mgarr",
    appliesTo: ["berth-mgarr-waiting-buoy"],
    subjectBerth: "berth-mgarr-waiting-buoy",
    standingDepthMetres: 2.9,
    body: "Silt survey SS-2023-MG. Waiting buoy at Mgarr (Gozo) sounded 2.9 metres. Still usable. No harbour notice followed.",
  }),
  doc({
    _id: "doc-alm-2019-mgarr-ferry",
    kind: "almanacExcerpt",
    code: "ALM-2019-MGARR-FERRY",
    title: "2019 pocket note — Mgarr Ferry East",
    issuedOn: "2019-06-02",
    harbour: "harbour-mgarr",
    appliesTo: ["berth-mgarr-ferry-east"],
    subjectBerth: "berth-mgarr-ferry-east",
    standingDepthMetres: 5.5,
    body: "Soundings Pocket Notes, 2019 sheet G-0. Mgarr Ferry East: 5.5 metres. Scheduled ferry only. Visitors are not welcome on this wall.",
  }),

  // --- Grand Harbour: weekend cruise close ---
  doc({
    _id: "doc-alm-2019-gh-pontoon",
    kind: "almanacExcerpt",
    code: "ALM-2019-GH-PONTOON",
    title: "2019 pocket note — Grand Harbour visitor pontoon",
    issuedOn: "2019-07-07",
    harbour: "harbour-grand-harbour",
    appliesTo: ["berth-gh-visitor-pontoon"],
    subjectBerth: "berth-gh-visitor-pontoon",
    standingDepthMetres: 2.5,
    body: "Soundings Pocket Notes, 2019 sheet H-3. Grand Harbour visitor pontoon: 2.5 metres, open every day. Convenient for a market run.",
  }),
  doc({
    _id: "doc-hn-2025-cruise",
    kind: "harbourNotice",
    code: "HN-2025-CRUISE",
    title: "HN-2025-CRUISE Saturday pontoon close",
    issuedOn: "2025-01-20",
    harbour: "harbour-grand-harbour",
    supersedes: "doc-alm-2019-gh-pontoon",
    appliesTo: ["berth-gh-visitor-pontoon"],
    subjectBerth: "berth-gh-visitor-pontoon",
    standingDepthMetres: 2.5,
    reservedWeekday: "saturday",
    reservedAfter: "08:00",
    body: "Harbour notice HN-2025-CRUISE, 20 January 2025. When a cruise liner is advertised at Lascaris, the Grand Harbour visitor pontoon is closed Saturdays 08:00–18:00 for tender wash. The 2019 every-day claim is superseded for that window. Depth remains 2.5 metres at other times.",
  }),
  doc({
    _id: "doc-hn-2024-wash",
    kind: "harbourNotice",
    code: "HN-2024-WASH",
    title: "HN-2024-WASH Grand Harbour wash warning",
    issuedOn: "2024-08-02",
    harbour: "harbour-grand-harbour",
    cites: ["doc-alm-2019-gh-pontoon"],
    appliesTo: ["berth-gh-visitor-pontoon", "berth-gh-kalkara"],
    body: "Harbour notice HN-2024-WASH, 2 August 2024. Heavy wash reported along the Grand Harbour visitor pontoon. This later note cites the 2019 pocket note. It does not supersede depths or opening hours.",
  }),
  doc({
    _id: "doc-alm-2019-gh-kalkara",
    kind: "almanacExcerpt",
    code: "ALM-2019-GH-KALKARA",
    title: "2019 pocket note — Kalkara Creek wall",
    issuedOn: "2019-07-07",
    harbour: "harbour-grand-harbour",
    appliesTo: ["berth-gh-kalkara"],
    subjectBerth: "berth-gh-kalkara",
    standingDepthMetres: 2.0,
    body: "Soundings Pocket Notes, 2019 sheet H-4. Kalkara Creek wall: 2.0 metres. Quiet alternative to the visitor pontoon.",
  }),
  doc({
    _id: "doc-hn-2023-boilers",
    kind: "harbourNotice",
    code: "HN-2023-BOILERS",
    title: "HN-2023-BOILERS navy wall",
    issuedOn: "2023-02-02",
    harbour: "harbour-grand-harbour",
    appliesTo: ["berth-gh-boilers"],
    subjectBerth: "berth-gh-boilers",
    body: "Harbour notice HN-2023-BOILERS. Boilers wharf in Grand Harbour remains navy. Visiting craft will be moved.",
  }),
  doc({
    _id: "doc-alm-2019-gh-lascaris",
    kind: "almanacExcerpt",
    code: "ALM-2019-GH-LASCARIS",
    title: "2019 pocket note — Lascaris cruise",
    issuedOn: "2019-07-07",
    harbour: "harbour-grand-harbour",
    appliesTo: ["berth-gh-lascaris"],
    subjectBerth: "berth-gh-lascaris",
    standingDepthMetres: 8.0,
    body: "Soundings Pocket Notes, 2019 sheet H-0. Lascaris wharf: 8.0 metres. Cruise ships. Not a day-boat berth.",
  }),

  // --- Marzamemi: daytime workboat reserve + scirocco ---
  doc({
    _id: "doc-alm-2019-marz-tuna",
    kind: "almanacExcerpt",
    code: "ALM-2019-MARZ-TUNA",
    title: "2019 pocket note — Marzamemi tuna quay",
    issuedOn: "2019-08-09",
    harbour: "harbour-marzamemi",
    appliesTo: ["berth-marz-tuna-quay"],
    subjectBerth: "berth-marz-tuna-quay",
    standingDepthMetres: 2.8,
    body: "Soundings Pocket Notes, 2019 sheet Z-1. Marzamemi tuna quay: 2.8 metres. Visitors welcome all day.",
  }),
  doc({
    _id: "doc-hn-2025-tuna",
    kind: "harbourNotice",
    code: "HN-2025-TUNA",
    title: "HN-2025-TUNA summer morning reserve",
    issuedOn: "2025-05-02",
    harbour: "harbour-marzamemi",
    supersedes: "doc-alm-2019-marz-tuna",
    appliesTo: ["berth-marz-tuna-quay"],
    subjectBerth: "berth-marz-tuna-quay",
    standingDepthMetres: 2.8,
    closedFrom: "06-01",
    closedUntil: "08-31",
    body: "Harbour notice HN-2025-TUNA, 2 May 2025. From 1 June through 31 August the Marzamemi tuna quay is reserved for working boats 05:00–14:00. The 2019 all-day visitor welcome is superseded for those mornings. Depth remains 2.8 metres after 14:00.",
  }),
  doc({
    _id: "doc-wr-marz-scirocco",
    kind: "weatherRule",
    code: "WR-Z-S16",
    title: "Marzamemi scirocco inner-only rule",
    issuedOn: "2021-04-21",
    harbour: "harbour-marzamemi",
    appliesTo: ["berth-marz-inner-basin", "berth-marz-tuna-quay", "berth-marz-outer-arm"],
    windDirection: "scirocco",
    minKnots: 16,
    effect: "In a scirocco at or above 16 knots only the inner basin at Marzamemi is named as sheltered. It sounds 1.6 metres on the chart.",
    effectBerths: ["berth-marz-inner-basin"],
    body: "Weather berthing rule WR-Z-S16. Scirocco 16 knots or more at Marzamemi: tuna quay and outer arm are exposed. Inner basin only, charted 1.6 metres.",
  }),
  doc({
    _id: "doc-alm-2019-marz-inner",
    kind: "almanacExcerpt",
    code: "ALM-2019-MARZ-INNER",
    title: "2019 pocket note — Marzamemi inner basin",
    issuedOn: "2019-08-09",
    harbour: "harbour-marzamemi",
    appliesTo: ["berth-marz-inner-basin"],
    subjectBerth: "berth-marz-inner-basin",
    standingDepthMetres: 1.6,
    body: "Soundings Pocket Notes, 2019 sheet Z-2. Marzamemi inner basin: 1.6 metres. Shallow. Local skiffs.",
  }),
  doc({
    _id: "doc-hn-2024-raft",
    kind: "harbourNotice",
    code: "HN-2024-RAFT",
    title: "HN-2024-RAFT Marzamemi seasonal raft",
    issuedOn: "2024-06-14",
    harbour: "harbour-marzamemi",
    appliesTo: ["berth-marz-seasonal-raft"],
    subjectBerth: "berth-marz-seasonal-raft",
    body: "Harbour notice HN-2024-RAFT. Seasonal raft at Marzamemi is laid 15 June–15 September, 2.0 metres, cash to the invented cooperative. Not a winter berth.",
  }),
  doc({
    _id: "doc-alm-2019-marz-arm",
    kind: "almanacExcerpt",
    code: "ALM-2019-MARZ-ARM",
    title: "2019 pocket note — Marzamemi outer arm",
    issuedOn: "2019-08-09",
    harbour: "harbour-marzamemi",
    appliesTo: ["berth-marz-outer-arm"],
    subjectBerth: "berth-marz-outer-arm",
    standingDepthMetres: 3.2,
    body: "Soundings Pocket Notes, 2019 sheet Z-3. Marzamemi outer arm: 3.2 metres. Swell in a scirocco.",
  }),

  // --- Marina di Ragusa: later shallower note does not win ---
  doc({
    _id: "doc-alm-2019-mdr-public",
    kind: "almanacExcerpt",
    code: "ALM-2019-MDR-PUBLIC",
    title: "2019 pocket note — Marina di Ragusa public quay",
    issuedOn: "2019-09-01",
    harbour: "harbour-marina-di-ragusa",
    appliesTo: ["berth-mdr-public-quay"],
    subjectBerth: "berth-mdr-public-quay",
    standingDepthMetres: 2.5,
    body: "Soundings Pocket Notes, 2019 sheet R-1. Marina di Ragusa public quay: 2.5 metres, free, no booking.",
  }),
  doc({
    _id: "doc-hn-2024-mdr-fee",
    kind: "harbourNotice",
    code: "HN-2024-MDR-FEE",
    title: "HN-2024-MDR-FEE public quay now booked",
    issuedOn: "2024-03-03",
    harbour: "harbour-marina-di-ragusa",
    supersedes: "doc-alm-2019-mdr-public",
    appliesTo: ["berth-mdr-public-quay"],
    subjectBerth: "berth-mdr-public-quay",
    standingDepthMetres: 2.5,
    body: "Harbour notice HN-2024-MDR-FEE, 3 March 2024. The public quay at Marina di Ragusa is now marina-managed. Depth remains 2.5 metres. Visitors must book. The 2019 free-and-open claim is superseded.",
  }),
  doc({
    _id: "doc-alm-2019-mdr-a",
    kind: "almanacExcerpt",
    code: "ALM-2019-MDR-A",
    title: "2019 pocket note — Marina di Ragusa berth A",
    issuedOn: "2019-09-01",
    harbour: "harbour-marina-di-ragusa",
    appliesTo: ["berth-mdr-marina-a"],
    subjectBerth: "berth-mdr-marina-a",
    standingDepthMetres: 2.4,
    body: "Soundings Pocket Notes, 2019 sheet R-2. Marina di Ragusa Marina A: 2.4 metres at chart datum. Finger berths, power.",
  }),
  doc({
    _id: "doc-hn-2025-mdr-a",
    kind: "harbourNotice",
    code: "HN-2025-MDR-A",
    title: "HN-2025-MDR-A winter rumour, Marina A 1.9 m",
    issuedOn: "2025-01-18",
    harbour: "harbour-marina-di-ragusa",
    cites: ["doc-alm-2019-mdr-a"],
    appliesTo: ["berth-mdr-marina-a"],
    subjectBerth: "berth-mdr-marina-a",
    standingDepthMetres: 1.9,
    body: "Harbour notice HN-2025-MDR-A, 18 January 2025. A skipper reported 1.9 metres in Marina A at Marina di Ragusa after winter rain. The note cites the 2019 pocket note. It does not supersede that pocket note. 2.4 metres remains the standing published figure until a superseding notice is issued.",
  }),
  doc({
    _id: "doc-hn-2023-mdr-fuel",
    kind: "harbourNotice",
    code: "HN-2023-FUEL",
    title: "HN-2023-FUEL Marina di Ragusa fuel hours",
    issuedOn: "2023-07-11",
    harbour: "harbour-marina-di-ragusa",
    appliesTo: ["berth-mdr-fuel-pontoon"],
    subjectBerth: "berth-mdr-fuel-pontoon",
    body: "Harbour notice HN-2023-FUEL. Fuel pontoon at Marina di Ragusa 08:00–18:00, cash. Not a night berth.",
  }),
  doc({
    _id: "doc-alm-2019-mdr-b",
    kind: "almanacExcerpt",
    code: "ALM-2019-MDR-B",
    title: "2019 pocket note — Marina di Ragusa berth B",
    issuedOn: "2019-09-01",
    harbour: "harbour-marina-di-ragusa",
    appliesTo: ["berth-mdr-marina-b"],
    subjectBerth: "berth-mdr-marina-b",
    standingDepthMetres: 2.6,
    body: "Soundings Pocket Notes, 2019 sheet R-3. Marina di Ragusa Marina B: 2.6 metres. Wider fingers than A.",
  }),
  doc({
    _id: "doc-wr-mdr-libeccio",
    kind: "weatherRule",
    code: "WR-R-L22",
    title: "Marina di Ragusa libeccio hammer rule",
    issuedOn: "2022-11-03",
    harbour: "harbour-marina-di-ragusa",
    appliesTo: ["berth-mdr-outer-hammer", "berth-mdr-marina-a", "berth-mdr-marina-b"],
    windDirection: "libeccio",
    minKnots: 22,
    effect: "In a libeccio (south-westerly) at or above 22 knots the outer hammer at Marina di Ragusa is untenable. Use the inner marina fingers.",
    effectBerths: ["berth-mdr-marina-a", "berth-mdr-marina-b"],
    body: "Weather berthing rule WR-R-L22. Libeccio 22 knots or more at Marina di Ragusa: leave the outer hammer. Inner marina A and B are the named shelter.",
  }),

  // Extra noisy documents so a harbour-name keyword hit is not the standing answer.
  doc({
    _id: "doc-alm-2019-marsa-radio",
    kind: "almanacExcerpt",
    code: "ALM-2019-MARSA-RADIO",
    title: "2019 pocket note — Marsamxett radio",
    issuedOn: "2019-03-01",
    harbour: "harbour-marsamxett",
    body: "Soundings Pocket Notes, 2019 sheet M-0. Call Marsamxett on invented channel 14. The inner pontoon is mentioned only as a landmark, not as a sounding.",
  }),
  doc({
    _id: "doc-alm-2019-mdr-radio",
    kind: "almanacExcerpt",
    code: "ALM-2019-MDR-RADIO",
    title: "2019 pocket note — Marina di Ragusa office",
    issuedOn: "2019-09-01",
    harbour: "harbour-marina-di-ragusa",
    body: "Soundings Pocket Notes, 2019 sheet R-0. Marina di Ragusa office VHF invented channel 9. Marina A is named at the desk, not sounded here.",
  }),
  doc({
    _id: "doc-ss-2024-gh-kalkara",
    kind: "siltSurvey",
    code: "SS-2024-03",
    title: "SS-2024-03 Kalkara after rain",
    issuedOn: "2024-03-28",
    harbour: "harbour-grand-harbour",
    appliesTo: ["berth-gh-kalkara"],
    subjectBerth: "berth-gh-kalkara",
    standingDepthMetres: 2.0,
    body: "Silt survey SS-2024-03. Kalkara Creek wall still 2.0 metres after March rain. No notice followed. Grand Harbour is named throughout.",
  }),
  doc({
    _id: "doc-hn-2022-poz-fish",
    kind: "harbourNotice",
    code: "HN-2022-19",
    title: "HN-2022-19 Pozzallo fishermen's ladder",
    issuedOn: "2022-11-19",
    harbour: "harbour-pozzallo",
    appliesTo: ["berth-poz-fishermen"],
    subjectBerth: "berth-poz-fishermen",
    body: "Harbour notice HN-2022-19. Fishermen's ladder at Pozzallo is working boats only at first light. Mentions the commercial quay as the next wall along.",
  }),
  doc({
    _id: "doc-alm-2019-mgarr-radio",
    kind: "almanacExcerpt",
    code: "ALM-2019-MGARR-RADIO",
    title: "2019 pocket note — Mgarr ferry signal",
    issuedOn: "2019-06-02",
    harbour: "harbour-mgarr",
    body: "Soundings Pocket Notes, 2019 sheet G-9. Mgarr (Gozo) ferry blasts: one long on departure. Visitor West is named as the waiting side.",
  }),
];

const claims: SeedDocument[] = [
  claim({ _id: "claim-marsa-inner-depth-alm", statement: "Inner pontoon at Marsamxett is 2.1 metres at chart datum; visitors welcome.", about: "berth-marsa-inner-a", source: "doc-alm-2019-marsa-pontoon", validFrom: "2019-03-01", topic: "depth" }),
  claim({ _id: "claim-marsa-inner-access-alm", statement: "Visiting day-boats are welcome alongside the three inner fingers.", about: "berth-marsa-inner-b", source: "doc-alm-2019-marsa-pontoon", validFrom: "2019-03-01", topic: "access" }),
  claim({ _id: "claim-marsa-inner-depth-hn17", statement: "Inner pontoon at Marsamxett sounds 1.4 metres at chart datum after winter silt.", about: "berth-marsa-inner-a", source: "doc-hn-2024-17", validFrom: "2024-03-17", topic: "depth" }),
  claim({ _id: "claim-marsa-inner-b-depth-hn17", statement: "Inner Pontoon B is included in the 1.4 metre inner-pontoon sounding.", about: "berth-marsa-inner-b", source: "doc-hn-2024-17", validFrom: "2024-03-17", topic: "depth" }),
  claim({ _id: "claim-marsa-inner-c-depth-hn17", statement: "Inner Pontoon C is included in the 1.4 metre inner-pontoon sounding.", about: "berth-marsa-inner-c", source: "doc-hn-2024-17", validFrom: "2024-03-17", topic: "depth" }),
  claim({ _id: "claim-marsa-outer-reserve", statement: "Outer North and Outer South are reserved for ferry relief on Fridays after 18:00.", about: "berth-marsa-outer-north", source: "doc-hn-2025-03", validFrom: "2025-02-03", topic: "reservation" }),
  claim({ _id: "claim-marsa-outer-south-reserve", statement: "Outer South is reserved for ferry relief on Fridays after 18:00.", about: "berth-marsa-outer-south", source: "doc-hn-2025-03", validFrom: "2025-02-03", topic: "reservation" }),
  claim({ _id: "claim-marsa-gregale-shelter", statement: "In a gregale at or above 20 knots the sheltered visitor berths are exactly Outer North and Outer South.", about: "berth-marsa-outer-north", source: "doc-wr-marsa-gregale", validFrom: "2023-11-12", topic: "shelter" }),

  claim({ _id: "claim-syr-east-alm", statement: "Syracuse Inner Basin East is 3.5 metres and suitable for a 3.0 metre draft.", about: "berth-syr-inner-east", source: "doc-alm-2019-syr-basin", validFrom: "2019-04-12", topic: "depth" }),
  claim({ _id: "claim-syr-east-survey", statement: "Four pole soundings average 2.2 metres at Inner Basin East.", about: "berth-syr-inner-east", source: "doc-ss-2025-02", validFrom: "2025-02-02", topic: "depth" }),
  claim({ _id: "claim-syr-east-notice", statement: "Inner Basin East is closed to drafts over 2.0 metres; 3.5 metres is superseded.", about: "berth-syr-inner-east", source: "doc-hn-2025-11", validFrom: "2025-02-11", topic: "depth" }),
  claim({ _id: "claim-syr-mole-alm", statement: "Syracuse outer mole is 5.0 metres.", about: "berth-syr-outer-mole", source: "doc-alm-2019-syr-mole", validFrom: "2019-04-12", topic: "depth" }),

  claim({ _id: "claim-poz-comm-alm", statement: "Pozzallo commercial quay is 3.0 metres at chart datum.", about: "berth-poz-commercial", source: "doc-alm-2019-poz-commercial", validFrom: "2019-05-20", topic: "depth" }),
  claim({ _id: "claim-poz-comm-hn44", statement: "Standing depth on the Pozzallo commercial quay is 2.8 metres after spoil; visitors only under 2.6 metres draft.", about: "berth-poz-commercial", source: "doc-hn-2024-44", validFrom: "2024-06-01", topic: "depth" }),
  claim({ _id: "claim-poz-comm-hn08", statement: "An informal club sounding reported 3.2 metres on the Pozzallo commercial quay.", about: "berth-poz-commercial", source: "doc-hn-2025-08", validFrom: "2025-03-12", topic: "depth" }),
  claim({ _id: "claim-poz-vis-alm", statement: "Pozzallo Visitor South is 2.2 metres.", about: "berth-poz-visitor-south", source: "doc-alm-2019-poz-visitor", validFrom: "2019-05-20", topic: "depth" }),

  claim({ _id: "claim-xlendi-quay-alm", statement: "Xlendi visitor quay is 2.4 metres and open all year.", about: "berth-xlendi-visitor-quay", source: "doc-alm-2019-xlendi-quay", validFrom: "2019-02-18", topic: "access" }),
  claim({ _id: "claim-xlendi-quay-season", statement: "Xlendi visitor quay is closed 1 November through 31 March.", about: "berth-xlendi-visitor-quay", source: "doc-hn-2024-season-xl", validFrom: "2024-10-01", topic: "season" }),
  claim({ _id: "claim-xlendi-scirocco", statement: "In a scirocco at or above 15 knots the visitor quay is untenable.", about: "berth-xlendi-visitor-quay", source: "doc-wr-xlendi-scirocco", validFrom: "2021-09-04", topic: "shelter" }),

  claim({ _id: "claim-mgarr-vis-alm", statement: "Mgarr Visitor West is 2.6 metres and always available.", about: "berth-mgarr-visitor-west", source: "doc-alm-2019-mgarr-visitor", validFrom: "2019-06-02", topic: "access" }),
  claim({ _id: "claim-mgarr-vis-ferry", statement: "Visitor West is closed 07:00–20:00 May–September when the second ferry is on.", about: "berth-mgarr-visitor-west", source: "doc-hn-2024-mg-ferry", validFrom: "2024-04-08", topic: "reservation" }),
  claim({ _id: "claim-mgarr-gregale", statement: "In a gregale at or above 18 knots use the fishermen's quay only, with permission.", about: "berth-mgarr-fishermen", source: "doc-wr-mgarr-gregale", validFrom: "2020-12-01", topic: "shelter" }),

  claim({ _id: "claim-gh-pontoon-alm", statement: "Grand Harbour visitor pontoon is 2.5 metres and open every day.", about: "berth-gh-visitor-pontoon", source: "doc-alm-2019-gh-pontoon", validFrom: "2019-07-07", topic: "access" }),
  claim({ _id: "claim-gh-pontoon-cruise", statement: "Visitor pontoon is closed Saturdays 08:00–18:00 when a cruise liner is at Lascaris.", about: "berth-gh-visitor-pontoon", source: "doc-hn-2025-cruise", validFrom: "2025-01-20", topic: "reservation" }),
  claim({ _id: "claim-gh-wash", statement: "Heavy wash is reported along the Grand Harbour visitor pontoon.", about: "berth-gh-visitor-pontoon", source: "doc-hn-2024-wash", validFrom: "2024-08-02", topic: "access" }),

  claim({ _id: "claim-marz-tuna-alm", statement: "Marzamemi tuna quay is 2.8 metres; visitors welcome all day.", about: "berth-marz-tuna-quay", source: "doc-alm-2019-marz-tuna", validFrom: "2019-08-09", topic: "access" }),
  claim({ _id: "claim-marz-tuna-work", statement: "1 June–31 August the tuna quay is reserved for working boats 05:00–14:00.", about: "berth-marz-tuna-quay", source: "doc-hn-2025-tuna", validFrom: "2025-05-02", topic: "reservation" }),
  claim({ _id: "claim-marz-scirocco", statement: "In a scirocco at or above 16 knots only the 1.6 metre inner basin is named as sheltered.", about: "berth-marz-inner-basin", source: "doc-wr-marz-scirocco", validFrom: "2021-04-21", topic: "shelter" }),

  claim({ _id: "claim-mdr-public-alm", statement: "Marina di Ragusa public quay is 2.5 metres, free, no booking.", about: "berth-mdr-public-quay", source: "doc-alm-2019-mdr-public", validFrom: "2019-09-01", topic: "access" }),
  claim({ _id: "claim-mdr-public-fee", statement: "Public quay remains 2.5 metres but visitors must book.", about: "berth-mdr-public-quay", source: "doc-hn-2024-mdr-fee", validFrom: "2024-03-03", topic: "access" }),
  claim({ _id: "claim-mdr-a-alm", statement: "Marina A at Marina di Ragusa is 2.4 metres at chart datum.", about: "berth-mdr-marina-a", source: "doc-alm-2019-mdr-a", validFrom: "2019-09-01", topic: "depth" }),
  claim({ _id: "claim-mdr-a-rumour", statement: "A skipper reported 1.9 metres in Marina A after winter rain.", about: "berth-mdr-marina-a", source: "doc-hn-2025-mdr-a", validFrom: "2025-01-18", topic: "depth" }),

  claim({ _id: "claim-marsa-fuel", statement: "Fuel wall is 3.4 metres and for the harbour barge only.", about: "berth-marsa-fuel-wall", source: "doc-alm-2019-marsa-fuel", validFrom: "2019-03-01", topic: "access" }),
  claim({ _id: "claim-xlendi-caves", statement: "Xlendi caves wall is 1.2 metres, dinghy only.", about: "berth-xlendi-caves-wall", source: "doc-alm-2019-xlendi-caves", validFrom: "2019-02-18", topic: "depth" }),
  claim({ _id: "claim-syr-club", statement: "Syracuse yacht club wall is 2.8 metres, members first.", about: "berth-syr-yacht-club", source: "doc-alm-2019-syr-club", validFrom: "2019-04-12", topic: "access" }),
  claim({ _id: "claim-mdr-b", statement: "Marina B at Marina di Ragusa is 2.6 metres.", about: "berth-mdr-marina-b", source: "doc-alm-2019-mdr-b", validFrom: "2019-09-01", topic: "depth" }),
];

export const SEED_DOCUMENTS: SeedDocument[] = [...harbours, ...berths, ...documents, ...claims];

export const SEED_COUNTS = {
  harbour: harbours.length,
  berth: berths.length,
  sourceDocument: documents.length,
  claim: claims.length,
  total: harbours.length + berths.length + documents.length + claims.length,
};
