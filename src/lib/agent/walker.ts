import type { ContextClient } from "../sanity-context";
import { fetchHarbourWind, windNameMatches, type WindObservation } from "../weather";
import { parseQuestion } from "./parse-question";
import type {
  BerthRow,
  BriefAnswer,
  ClaimRow,
  Contradiction,
  DocumentRelation,
  HarbourRow,
  RuleTrigger,
  SourceRow,
} from "./types";

async function groq<T>(client: ContextClient, query: string, params: Record<string, unknown> = {}): Promise<T> {
  const result = await client.call("groq_query", { query, params });
  if (!result.ok) throw new Error(result.error ?? "groq_query failed");
  return result.data as T;
}

function mmdd(month: number, day: number): string {
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function inClosedWindow(from: string, until: string, month: number, day: number): boolean {
  const cur = mmdd(month, day);
  if (from <= until) return cur >= from && cur <= until;
  return cur >= from || cur <= until;
}

function timeGte(asked: string | null, reservedAfter: string | undefined): boolean {
  if (!reservedAfter) return Boolean(asked);
  if (!asked) return true;
  return asked >= reservedAfter;
}

function asList<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function pickSubjectBerths(berths: BerthRow[], hint: string | null): BerthRow[] {
  if (!hint) return berths.filter((b) => b.reservedFor === "visitors");
  const h = hint.toLowerCase().replace("berth ", "");
  const named = berths.filter((b) => (b.name ?? "").toLowerCase().includes(h));
  if (named.length) return named;
  if (h.includes("inner pontoon")) return berths.filter((b) => /inner pontoon/i.test(b.name ?? ""));
  if (h.includes("inner basin")) return berths.filter((b) => /inner basin/i.test(b.name ?? ""));
  return berths.filter((b) => b.reservedFor === "visitors");
}

function standingDocFor(
  docs: SourceRow[],
  berthId: string,
  topic: "depth" | "access" | "reservation" | "season",
): SourceRow | null {
  const relevant = docs.filter((d) => {
    const applies = (d.appliesTo ?? []).some((r) => r._ref === berthId) || d.subjectBerth?._ref === berthId;
    if (!applies) return false;
    if (topic === "depth") return d.standingDepthMetres != null || d.maxDraftMetres != null;
    if (topic === "reservation") return Boolean(d.reservedWeekday || /reserv/i.test(d.body ?? ""));
    if (topic === "season") return Boolean(d.closedFrom);
    return true;
  });
  if (!relevant.length) return null;
  const start =
    relevant.find((d) => d.kind === "almanacExcerpt") ??
    relevant.find((d) => !d.supersedes) ??
    relevant[0];
  let current = start;
  for (let i = 0; i < 8; i += 1) {
    const next = relevant.find((d) => d.supersedes?._ref === current._id);
    if (!next) break;
    current = next;
  }
  return current;
}

function groundedSentence(doc: SourceRow | null | undefined, fallback: string): string {
  if (!doc) return fallback;
  const body = (doc.body ?? "").trim();
  const parts = body.split(/(?<=\.)\s+/);
  const useful =
    parts.find((s) => /(metre|reserved|supersed|closed|sound|gregale|scirocco)/i.test(s) && s.length > 30) ??
    parts.find((s) => /\d/.test(s) && s.length > 50) ??
    parts[1] ??
    parts[0] ??
    body;
  return useful || fallback;
}

export async function walkBrief(client: ContextClient, question: string): Promise<BriefAnswer> {
  const parsed = parseQuestion(question);
  const start = await client.call("initial_context");
  if (!start.ok) throw new Error(start.error ?? "initial_context failed");
  await client.call("schema_explorer", { typeName: "sourceDocument" });

  if (!parsed.harbourQuery) {
    return {
      question,
      mode: "walker",
      contextSource: client.source,
      verdict: "conditional",
      recommendation:
        "Name one of the eight harbours — Marsamxett, Mgarr (Gozo), Xlendi, Grand Harbour, Syracuse, Pozzallo, Marzamemi, or Marina di Ragusa — and a draft. The walker will not guess a harbour.",
      documentRelations: [],
      contradictions: [],
      walked: client.openedDocuments(),
      wind: { knots: null, directionDegrees: null, directionLabel: "unknown", source: "unavailable", at: null },
      rules: [],
      keywordTrap: "",
      harbourName: null,
    };
  }

  const harbour = await groq<HarbourRow | null>(
    client,
    '*[_type == "harbour" && (name match $q || slug.current match $q)][0]{ _id, name, lat, lon, slug }',
    { q: parsed.harbourQuery },
  );
  if (!harbour?._id) {
    return {
      question,
      mode: "walker",
      contextSource: client.source,
      verdict: "conditional",
      recommendation: `No harbour document matched “${parsed.harbourQuery}”.`,
      documentRelations: [],
      contradictions: [],
      walked: client.openedDocuments(),
      wind: { knots: null, directionDegrees: null, directionLabel: "unknown", source: "unavailable", at: null },
      rules: [],
      keywordTrap: "",
      harbourName: parsed.harbourQuery,
    };
  }

  const berths = asList(
    await groq<BerthRow[]>(
      client,
      '*[_type == "berth" && harbour._ref == $hid]{ _id, name, depthAtChartDatum, shelter, reservedFor, harbour }',
      { hid: harbour._id },
    ),
  );

  const almanacs = asList(
    await groq<SourceRow[]>(
      client,
      '*[_type == "sourceDocument" && kind == "almanacExcerpt" && harbour._ref == $hid]{ _id, kind, code, title, issuedOn, body, harbour, supersedes, cites, appliesTo, subjectBerth, standingDepthMetres, maxDraftMetres, reservedWeekday, reservedAfter, closedFrom, closedUntil }',
      { hid: harbour._id },
    ),
  );

  const openedIds = new Set(almanacs.map((d) => d._id));
  const docsById = new Map(almanacs.map((d) => [d._id, d]));

  const pull = async (query: string, params: Record<string, unknown>) => {
    const rows = asList(await groq<SourceRow[]>(client, query, params));
    for (const row of rows) {
      if (!openedIds.has(row._id)) {
        openedIds.add(row._id);
        docsById.set(row._id, row);
      }
    }
    return rows;
  };

  const sourceProj =
    '{ _id, kind, code, title, issuedOn, body, harbour, supersedes, cites, appliesTo, subjectBerth, standingDepthMetres, maxDraftMetres, reservedWeekday, reservedAfter, closedFrom, closedUntil, windDirection, minKnots, effect, effectBerths }';

  await pull(`*[_type == "sourceDocument" && supersedes._ref in $ids]${sourceProj}`, { ids: [...openedIds] });

  const citeOr = [...openedIds].map((_, i) => `$id${i} in cites[]._ref`).join(" || ");
  const citeParams: Record<string, unknown> = {};
  [...openedIds].forEach((id, i) => {
    citeParams[`id${i}`] = id;
  });
  if (citeOr) {
    await pull(`*[_type == "sourceDocument" && (${citeOr})]${sourceProj}`, citeParams);
  }

  await pull(
    `*[_type == "sourceDocument" && harbour._ref == $hid && kind == "weatherRule"]${sourceProj}`,
    { hid: harbour._id },
  );

  const subject = pickSubjectBerths(berths, parsed.berthHint);
  const subjectIds = subject.map((b) => b._id);
  if (subjectIds.length) {
    const applyOr = subjectIds.map((_, i) => `$b${i} in appliesTo[]._ref || subjectBerth._ref == $b${i}`).join(" || ");
    const applyParams: Record<string, unknown> = { hid: harbour._id };
    subjectIds.forEach((id, i) => {
      applyParams[`b${i}`] = id;
    });
    await pull(`*[_type == "sourceDocument" && harbour._ref == $hid && (${applyOr})]${sourceProj}`, applyParams);
  }

  await pull(`*[_type == "sourceDocument" && supersedes._ref in $ids]${sourceProj}`, { ids: [...openedIds] });

  for (const id of [...openedIds]) {
    await client.call("array_field_reader", { documentId: id, fieldPath: "cites" });
  }

  const claims = asList(
    await groq<ClaimRow[]>(
      client,
      '*[_type == "claim" && about._ref in $ids]{ _id, statement, topic, validFrom, about, source }',
      { ids: berths.map((b) => b._id) },
    ),
  );

  const docs = [...docsById.values()];
  const docLabel = (doc: SourceRow | null | undefined): string => doc?.code ?? doc?._id ?? "unknown document";
  const documentRelations: DocumentRelation[] = docs.flatMap((doc) => {
    const rows: DocumentRelation[] = [];
    const superseded = doc.supersedes?._ref ? docsById.get(doc.supersedes._ref) : null;
    if (superseded) {
      rows.push({
        relation: "supersedes",
        fromId: doc._id,
        fromCode: docLabel(doc),
        fromTitle: doc.title ?? docLabel(doc),
        fromIssuedOn: doc.issuedOn,
        fromExcerpt: groundedSentence(doc, ""),
        toId: superseded._id,
        toCode: docLabel(superseded),
        toTitle: superseded.title ?? docLabel(superseded),
        toIssuedOn: superseded.issuedOn,
        toExcerpt: groundedSentence(superseded, ""),
        detail: `${docLabel(doc)} replaces ${docLabel(superseded)}.`,
      });
    }
    for (const citedRef of doc.cites ?? []) {
      const cited = citedRef._ref ? docsById.get(citedRef._ref) : null;
      if (!cited) continue;
      rows.push({
        relation: "cites",
        fromId: doc._id,
        fromCode: docLabel(doc),
        fromTitle: doc.title ?? docLabel(doc),
        fromIssuedOn: doc.issuedOn,
        fromExcerpt: groundedSentence(doc, ""),
        toId: cited._id,
        toCode: docLabel(cited),
        toTitle: cited.title ?? docLabel(cited),
        toIssuedOn: cited.issuedOn,
        toExcerpt: groundedSentence(cited, ""),
        detail: `${docLabel(doc)} cites ${docLabel(cited)}.`,
      });
    }
    return rows;
  });
  let wind: WindObservation = {
    knots: null,
    directionDegrees: null,
    directionLabel: "unknown",
    source: "unavailable",
    at: null,
  };
  if (typeof harbour.lat === "number" && typeof harbour.lon === "number") {
    wind = await fetchHarbourWind(harbour.lat, harbour.lon);
  }

  const rules: RuleTrigger[] = docs
    .filter((d) => d.kind === "weatherRule")
    .map((d) => {
      const dir = d.windDirection ?? "";
      const min = d.minKnots ?? 0;
      const askedHit = parsed.windName ? windNameMatches(dir, wind.directionLabel, parsed.windName) : false;
      const liveHit =
        wind.knots != null && wind.knots >= min && windNameMatches(dir, wind.directionLabel, null);
      const triggered = askedHit || liveHit;
      const against = askedHit && liveHit ? "both" : askedHit ? "question" : liveHit ? "live" : "neither";
      const liveBit =
        wind.source === "unavailable"
          ? "Live wind was unavailable."
          : `Live wind is ${wind.knots ?? "—"} kn from ${wind.directionLabel}${wind.directionDegrees != null ? ` (${wind.directionDegrees}°)` : ""}.`;
      const askedBit = parsed.windName
        ? `The question assumes a ${parsed.windName}.`
        : "The question does not name a wind.";
      return {
        documentId: d._id,
        title: d.title ?? d.code ?? d._id,
        windDirection: dir,
        minKnots: min,
        effect: d.effect ?? d.body ?? "",
        triggered,
        against,
        detail: `${askedBit} ${liveBit} Rule threshold is ${min} kn ${dir}.`,
      };
    });

  const contradictions: Contradiction[] = [];
  const byBerth = new Map<string, ClaimRow[]>();
  for (const c of claims) {
    const about = c.about?._ref;
    if (!about) continue;
    const list = byBerth.get(about) ?? [];
    list.push(c);
    byBerth.set(about, list);
  }
  for (const [berthId, list] of byBerth) {
    const depthish = list.filter((c) => c.topic === "depth" || c.topic === "access" || c.topic === "season");
    if (depthish.length < 2) continue;
    const uniqueSources = [...new Map(depthish.map((c) => [c.source?._ref, c])).values()].sort((a, b) =>
      (a.validFrom ?? "").localeCompare(b.validFrom ?? ""),
    );
    if (uniqueSources.length < 2) continue;
    const leftC = uniqueSources[0];
    const rightC = uniqueSources[uniqueSources.length - 1];
    const leftDoc = leftC.source?._ref ? docsById.get(leftC.source._ref) : undefined;
    const rightDoc = rightC.source?._ref ? docsById.get(rightC.source._ref) : undefined;
    const berth = berths.find((b) => b._id === berthId);
    let standingSourceId: string | null = null;
    let reason = "Later issuedOn does not decide this. Only a supersedes link does.";
    if (rightDoc && leftDoc && rightDoc.supersedes?._ref === leftDoc._id) {
      standingSourceId = rightDoc._id;
      reason = `${rightDoc.code ?? rightDoc._id} supersedes ${leftDoc.code ?? leftDoc._id}.`;
    } else if (leftDoc && rightDoc && leftDoc.supersedes?._ref === rightDoc._id) {
      standingSourceId = leftDoc._id;
      reason = `${leftDoc.code ?? leftDoc._id} supersedes ${rightDoc.code ?? rightDoc._id}.`;
    } else {
      const standing = standingDocFor(docs, berthId, "depth");
      standingSourceId = standing?._id ?? null;
      if (standing) reason = `Standing figure is ${standing.code ?? standing._id} because of the supersedes chain, not the later date.`;
    }
    contradictions.push({
      aboutId: berthId,
      aboutName: berth?.name ?? berthId,
      topic: leftC.topic ?? "depth",
      left: {
        statement: leftC.statement ?? "",
        sourceId: leftC.source?._ref ?? "",
        sourceTitle: leftDoc?.title ?? leftC.source?._ref ?? "",
        issuedOn: leftDoc?.issuedOn,
      },
      right: {
        statement: rightC.statement ?? "",
        sourceId: rightC.source?._ref ?? "",
        sourceTitle: rightDoc?.title ?? rightC.source?._ref ?? "",
        issuedOn: rightDoc?.issuedOn,
      },
      standingSourceId,
      reason,
    });
  }

  const askedMonth = parsed.month ?? 6;
  const askedDay = parsed.day ?? 15;
  const draft = parsed.draftMetres;

  const weatherActive = rules.some((r) => r.triggered && (r.against === "question" || r.against === "both" || (!parsed.windName && r.against === "live")));
  const activeRuleDocs = docs.filter((d) => d.kind === "weatherRule" && rules.some((r) => r.documentId === d._id && r.triggered && (parsed.windName ? r.against === "question" || r.against === "both" : r.against === "live" || r.against === "both")));
  const allowedByWeather = new Set(activeRuleDocs.flatMap((d) => (d.effectBerths ?? []).map((r) => r._ref).filter(Boolean) as string[]));

  type Eval = { berth: BerthRow; ok: boolean; reasons: string[] };
  const evaluations: Eval[] = (subject.length ? subject : berths).map((berth) => {
    const reasons: string[] = [];
    if (berth.reservedFor && berth.reservedFor !== "visitors") {
      reasons.push(`${berth.name} is reserved for ${berth.reservedFor} on the berth record.`);
      return { berth, ok: false, reasons };
    }
    const depthDoc = standingDocFor(docs, berth._id, "depth");
    const standingDepth = depthDoc?.standingDepthMetres;
    const maxDraft = depthDoc?.maxDraftMetres;
    if (draft != null && maxDraft != null && draft > maxDraft) {
      reasons.push(groundedSentence(depthDoc, `${depthDoc?.code} closes this berth over ${maxDraft} m draft.`));
    }
    if (draft != null && standingDepth != null && draft > standingDepth) {
      reasons.push(groundedSentence(depthDoc, `${depthDoc?.code} records ${standingDepth} m, which is less than the ${draft} m draft.`));
    }
    const seasonDoc = docs.find((d) => (d.closedFrom && (d.subjectBerth?._ref === berth._id || (d.appliesTo ?? []).some((r) => r._ref === berth._id))) && inClosedWindow(d.closedFrom, d.closedUntil ?? d.closedFrom, askedMonth, askedDay) && standingDocFor(docs, berth._id, "season")?._id === d._id);
    if (seasonDoc) {
      reasons.push(groundedSentence(seasonDoc, `${seasonDoc.code} closes this berth in the asked season.`));
    }
    const reserveDoc = docs.find((d) => {
      if (!d.reservedWeekday) return false;
      if (!(d.subjectBerth?._ref === berth._id || (d.appliesTo ?? []).some((r) => r._ref === berth._id))) return false;
      if (parsed.weekday && d.reservedWeekday !== parsed.weekday) return false;
      if (parsed.weekday && d.reservedWeekday === parsed.weekday && timeGte(parsed.afterTime, d.reservedAfter)) return true;
      return false;
    });
    if (reserveDoc) {
      reasons.push(groundedSentence(reserveDoc, `${reserveDoc.code} reserves this berth at the asked time.`));
    }
    if (weatherActive && allowedByWeather.size && !allowedByWeather.has(berth._id)) {
      const wr = activeRuleDocs[0];
      reasons.push(groundedSentence(wr, wr?.effect ?? "The weather rule does not name this berth as sheltered."));
    }
    return { berth, ok: reasons.length === 0, reasons };
  });

  const usable = evaluations.filter((e) => e.ok);
  const keywordAlmanac =
    almanacs.find((a) => parsed.berthHint && (a.body ?? "").toLowerCase().includes(parsed.berthHint)) ??
    almanacs.find((a) => /visitor|pontoon|quay|basin|commercial/i.test(`${a.title} ${a.body}`)) ??
    almanacs[0];
  const keywordTrap = keywordAlmanac
    ? `Keyword search for “${harbour.name}” would have opened ${keywordAlmanac.code ?? keywordAlmanac._id} and repeated: ${groundedSentence(keywordAlmanac, keywordAlmanac.title ?? "")}`
    : "";

  const sentences: string[] = [];
  const askedNames = (subject.length ? subject : evaluations.map((e) => e.berth)).map((b) => b.name ?? b._id);
  if (draft == null) {
    sentences.push("The question does not state a draft, so no depth clearance can be invented.");
  }
  if (usable.length === 0) {
    sentences.push(
      `No safe visitor berth at ${harbour.name}${askedNames[0] ? ` (${askedNames.join(", ")})` : ""}${draft != null ? ` for a ${draft} m draft` : ""}${parsed.weekday ? ` arriving ${parsed.weekday}` : ""}${parsed.afterTime ? ` after ${parsed.afterTime}` : ""}${parsed.windName ? ` in a ${parsed.windName}` : ""}.`,
    );
    const reasonSet = new Set<string>();
    for (const ev of evaluations) {
      for (const r of ev.reasons) {
        if (!reasonSet.has(r)) {
          reasonSet.add(r);
          sentences.push(r);
        }
      }
    }
    for (const doc of docs) {
      if (doc.kind === "almanacExcerpt") continue;
      if (doc.supersedes || (doc.cites ?? []).length || doc.kind === "weatherRule" || doc.kind === "siltSurvey") {
        const line = groundedSentence(doc, "");
        if (line && !sentences.includes(line)) sentences.push(line);
      }
    }
    for (const c of contradictions) {
      if (c.reason && !sentences.includes(c.reason)) sentences.push(c.reason);
    }
  } else {
    const pick = usable[0];
    const depthDoc = standingDocFor(docs, pick.berth._id, "depth");
    sentences.push(
      `${harbour.name}: ${pick.berth.name} is the standing visitor option in the documents opened${draft != null ? ` for a ${draft} m draft` : ""}.`,
    );
    if (depthDoc?.standingDepthMetres != null) {
      sentences.push(groundedSentence(depthDoc, `${depthDoc.code} records ${depthDoc.standingDepthMetres} m.`));
    }
    for (const c of contradictions) {
      if (c.reason && !sentences.includes(c.reason)) sentences.push(c.reason);
    }
  }

  const unique = [...new Set(sentences.filter(Boolean))].slice(0, 8);
  const verdict = usable.length === 0 ? "no-go" : evaluations.some((e) => !e.ok) ? "conditional" : "go";

  return {
    question,
    mode: "walker",
    contextSource: client.source,
    verdict,
    recommendation: unique.join(" "),
    documentRelations,
    contradictions,
    walked: client.openedDocuments(),
    wind,
    rules,
    keywordTrap,
    harbourName: harbour.name ?? null,
  };
}
