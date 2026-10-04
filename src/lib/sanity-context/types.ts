export type ContextToolName =
  | "initial_context"
  | "schema_explorer"
  | "groq_query"
  | "array_field_reader";

export type ToolResult = {
  ok: boolean;
  tool: ContextToolName;
  data: unknown;
  error?: string;
};

export type OpenedDocument = {
  id: string;
  type: string;
  title: string;
  kind?: string;
  issuedOn?: string;
  code?: string;
};

export type ContextClient = {
  source: "fixture" | "live";
  call(name: ContextToolName, args?: Record<string, unknown>): Promise<ToolResult>;
  openedDocuments(): OpenedDocument[];
};

export const CONTEXT_TOOL_DESCRIPTIONS: Record<ContextToolName, string> = {
  initial_context:
    "Call this first. Returns a compressed schema overview, document counts, and how to query. Do not answer from memory.",
  schema_explorer:
    "Returns field lists and references for one type. Arguments: { typeName: string } where typeName is harbour, berth, sourceDocument, or claim.",
  groq_query:
    "Run a GROQ query. Arguments: { query: string, params?: Record<string, unknown> }. Follow supersedes, cites, and appliesTo. A later issuedOn does not win unless supersedes is set. Harbour-name match is not the standing figure.",
  array_field_reader:
    "Read one array field on one document (cites, appliesTo, effectBerths). Arguments: { documentId: string, fieldPath: string }.",
};
