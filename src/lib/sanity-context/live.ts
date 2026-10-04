import type { ContextClient, ContextToolName, OpenedDocument, ToolResult } from "./types";

type JsonRpc = {
  jsonrpc: "2.0";
  id: number;
  result?: { content?: Array<{ type: string; text?: string }>; tools?: unknown[] };
  error?: { message: string };
};

export class LiveContextClient implements ContextClient {
  source = "live" as const;
  private opened: OpenedDocument[] = [];
  private seen = new Set<string>();
  private started = false;

  constructor(
    private url: string,
    private token: string,
  ) {}

  async call(name: ContextToolName, args: Record<string, unknown> = {}): Promise<ToolResult> {
    if (name !== "initial_context" && !this.started) {
      return {
        ok: false,
        tool: name,
        data: null,
        error: "Call initial_context first.",
      };
    }
    try {
      if (name === "initial_context") {
        const inline = await this.fetchInitialContextHttp();
        if (inline) {
          this.started = true;
          return { ok: true, tool: name, data: inline };
        }
      }
      const data = await this.rpc("tools/call", { name, arguments: args });
      if (name === "initial_context") this.started = true;
      this.harvestIds(data);
      return { ok: true, tool: name, data };
    } catch (error) {
      return {
        ok: false,
        tool: name,
        data: null,
        error: error instanceof Error ? error.message : "Live MCP call failed",
      };
    }
  }

  openedDocuments(): OpenedDocument[] {
    return [...this.opened];
  }

  private async fetchInitialContextHttp(): Promise<unknown | null> {
    try {
      const url = new URL(this.url);
      url.pathname = `${url.pathname.replace(/\/$/, "")}/initial-context`;
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!res.ok) return null;
      const text = await res.text();
      return { text };
    } catch {
      return null;
    }
  }

  private async rpc(method: string, params: Record<string, unknown>): Promise<unknown> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
    });
    if (!res.ok) {
      throw new Error(`Sanity MCP HTTP ${res.status}`);
    }
    const body = (await res.json()) as JsonRpc;
    if (body.error) throw new Error(body.error.message);
    const content = body.result?.content;
    if (Array.isArray(content)) {
      const text = content.map((c) => c.text ?? "").join("\n");
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
    return body.result ?? body;
  }

  private harvestIds(data: unknown) {
    const visit = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      const rec = node as Record<string, unknown>;
      if (typeof rec._id === "string" && !this.seen.has(rec._id)) {
        this.seen.add(rec._id);
        this.opened.push({
          id: rec._id,
          type: typeof rec._type === "string" ? rec._type : "unknown",
          title:
            typeof rec.title === "string"
              ? rec.title
              : typeof rec.name === "string"
                ? rec.name
                : rec._id,
          kind: typeof rec.kind === "string" ? rec.kind : undefined,
          issuedOn: typeof rec.issuedOn === "string" ? rec.issuedOn : undefined,
          code: typeof rec.code === "string" ? rec.code : undefined,
        });
      }
      for (const v of Object.values(rec)) visit(v);
    };
    visit(data);
  }
}
