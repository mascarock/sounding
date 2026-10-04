import { SEED_COUNTS, SEED_DOCUMENTS } from "../../../sanity/seed-data";
import type { SeedDocument } from "../../../sanity/types";
import { documentTitle, runGroq } from "./groq-fixture";
import type { ContextClient, ContextToolName, OpenedDocument, ToolResult } from "./types";

const SCHEMA: Record<string, unknown> = {
  harbour: {
    fields: ["name", "slug.current", "lat", "lon", "seaArea"],
    refs: [],
  },
  berth: {
    fields: ["name", "depthAtChartDatum", "shelter", "reservedFor", "harbour"],
    refs: ["harbour -> harbour"],
    note: "depthAtChartDatum is the published chart figure. Notices may supersede it.",
  },
  sourceDocument: {
    fields: [
      "kind",
      "code",
      "title",
      "issuedOn",
      "harbour",
      "supersedes",
      "cites",
      "appliesTo",
      "subjectBerth",
      "body",
      "standingDepthMetres",
      "maxDraftMetres",
      "reservedWeekday",
      "reservedAfter",
      "closedFrom",
      "closedUntil",
      "windDirection",
      "minKnots",
      "effect",
      "effectBerths",
    ],
    refs: [
      "harbour -> harbour",
      "supersedes -> sourceDocument",
      "cites[] -> sourceDocument",
      "appliesTo[] -> berth",
      "subjectBerth -> berth",
      "effectBerths[] -> berth",
    ],
    kinds: ["almanacExcerpt", "harbourNotice", "siltSurvey", "weatherRule"],
    discipline:
      "Follow supersedes, cites, and appliesTo. A later issuedOn does not replace an earlier notice unless supersedes points at it.",
  },
  claim: {
    fields: ["statement", "about", "source", "validFrom", "topic"],
    refs: ["about -> berth|harbour", "source -> sourceDocument"],
    note: "Two claims about the same berth may conflict. Show both. Resolve with supersedes, not recency.",
  },
};

export class FixtureContextClient implements ContextClient {
  source = "fixture" as const;
  private started = false;
  private opened: OpenedDocument[] = [];
  private seen = new Set<string>();

  async call(name: ContextToolName, args: Record<string, unknown> = {}): Promise<ToolResult> {
    try {
      if (name !== "initial_context" && !this.started) {
        return {
          ok: false,
          tool: name,
          data: null,
          error: "Call initial_context first. The fixture will not run queries before orientation.",
        };
      }
      if (name === "initial_context") return this.initialContext();
      if (name === "schema_explorer") return this.schemaExplorer(args);
      if (name === "groq_query") return this.groqQuery(args);
      if (name === "array_field_reader") return this.arrayFieldReader(args);
      return { ok: false, tool: name, data: null, error: `Unknown tool ${name}` };
    } catch (error) {
      return {
        ok: false,
        tool: name,
        data: null,
        error: error instanceof Error ? error.message : "Tool failed",
      };
    }
  }

  openedDocuments(): OpenedDocument[] {
    return [...this.opened];
  }

  private record(doc: SeedDocument | Record<string, unknown> | null | undefined) {
    if (!doc || typeof doc !== "object") return;
    const id = typeof doc._id === "string" ? doc._id : undefined;
    if (!id || this.seen.has(id)) return;
    const full = SEED_DOCUMENTS.find((d) => d._id === id);
    if (!full) return;
    this.seen.add(id);
    this.opened.push({
      id,
      type: String(full._type),
      title: documentTitle(full),
      kind: typeof full.kind === "string" ? full.kind : undefined,
      issuedOn: typeof full.issuedOn === "string" ? full.issuedOn : undefined,
      code: typeof full.code === "string" ? full.code : undefined,
    });
  }

  private recordResult(data: unknown) {
    if (Array.isArray(data)) {
      for (const item of data) this.record(item as SeedDocument);
      return;
    }
    this.record(data as SeedDocument);
  }

  private initialContext(): ToolResult {
    this.started = true;
    const text = [
      "Sounding harbour briefing corpus (demonstration data, not an official publication).",
      "",
      "Types: harbour, berth, sourceDocument, claim.",
      `Counts: harbour ${SEED_COUNTS.harbour}, berth ${SEED_COUNTS.berth}, sourceDocument ${SEED_COUNTS.sourceDocument}, claim ${SEED_COUNTS.claim}, total ${SEED_COUNTS.total}.`,
      "",
      "Query with groq_query. Start from the harbour, then berths, then sourceDocument rows linked by harbour / appliesTo / subjectBerth.",
      "Walk supersedes (incoming and outgoing), cites, and appliesTo. Do not treat a harbour-name keyword hit as the standing figure.",
      "A later issuedOn does not win unless supersedes is set.",
      "Weather rules (kind == \"weatherRule\") carry windDirection, minKnots, effect, effectBerths. Join them to live wind at answer time.",
      "Claims exist so two statements about the same berth can be shown in conflict.",
      "Berth.depthAtChartDatum is the published chart figure and is often stale.",
    ].join("\n");
    return { ok: true, tool: "initial_context", data: { text, counts: SEED_COUNTS, types: Object.keys(SCHEMA) } };
  }

  private schemaExplorer(args: Record<string, unknown>): ToolResult {
    const typeName = String(args.typeName ?? args.type ?? "");
    const schema = SCHEMA[typeName];
    if (!schema) {
      return {
        ok: false,
        tool: "schema_explorer",
        data: null,
        error: `Unknown type ${typeName}. Try harbour, berth, sourceDocument, claim.`,
      };
    }
    return { ok: true, tool: "schema_explorer", data: { typeName, ...schema } };
  }

  private groqQuery(args: Record<string, unknown>): ToolResult {
    const query = String(args.query ?? "");
    if (!query) return { ok: false, tool: "groq_query", data: null, error: "query is required" };
    const params = (args.params as Record<string, unknown>) ?? {};
    const data = runGroq(query, params, SEED_DOCUMENTS);
    this.recordResult(data);
    return { ok: true, tool: "groq_query", data };
  }

  private arrayFieldReader(args: Record<string, unknown>): ToolResult {
    const documentId = String(args.documentId ?? args.id ?? "");
    const fieldPath = String(args.fieldPath ?? args.path ?? args.field ?? "");
    if (!documentId || !fieldPath) {
      return {
        ok: false,
        tool: "array_field_reader",
        data: null,
        error: "documentId and fieldPath are required",
      };
    }
    const doc = SEED_DOCUMENTS.find((d) => d._id === documentId);
    if (!doc) return { ok: false, tool: "array_field_reader", data: null, error: `Unknown document ${documentId}` };
    this.record(doc);
    const parts = fieldPath.split(".");
    let cur: unknown = doc;
    for (const part of parts) {
      if (cur == null || typeof cur !== "object") {
        cur = undefined;
        break;
      }
      cur = (cur as Record<string, unknown>)[part];
    }
    return { ok: true, tool: "array_field_reader", data: { documentId, fieldPath, value: cur ?? [] } };
  }
}
