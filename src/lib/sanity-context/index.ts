import "server-only";

import { FixtureContextClient } from "./fixture";
import { LiveContextClient } from "./live";
import type { ContextClient } from "./types";

export type { ContextClient, ContextToolName, OpenedDocument, ToolResult } from "./types";
export { CONTEXT_TOOL_DESCRIPTIONS } from "./types";

function liveUrl(): { url: string; token: string } | null {
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) return null;
  const kb = process.env.SANITY_KB_MCP_URL;
  if (kb) return { url: kb, token };
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const slug = process.env.SANITY_CONTEXT_SLUG;
  if (projectId && dataset && slug) {
    return {
      url: `https://api.sanity.io/v2026-03-03/context/mcp/${projectId}/${dataset}/${slug}`,
      token,
    };
  }
  return null;
}

/** One swap point: live MCP when env is set, otherwise the committed seed fixture. */
export function createContextClient(): ContextClient {
  const live = liveUrl();
  if (live) return new LiveContextClient(live.url, live.token);
  return new FixtureContextClient();
}

export function contextMode(): "fixture" | "live" {
  return liveUrl() ? "live" : "fixture";
}
