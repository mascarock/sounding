import type { OpenedDocument } from "../sanity-context";
import type { WindObservation } from "../weather";

export type Contradiction = {
  aboutId: string;
  aboutName: string;
  topic: string;
  left: { statement: string; sourceId: string; sourceTitle: string; issuedOn?: string };
  right: { statement: string; sourceId: string; sourceTitle: string; issuedOn?: string };
  standingSourceId: string | null;
  reason: string;
};

export type RuleTrigger = {
  documentId: string;
  title: string;
  windDirection: string;
  minKnots: number;
  effect: string;
  triggered: boolean;
  against: "question" | "live" | "both" | "neither";
  detail: string;
};

export type BriefAnswer = {
  question: string;
  mode: "walker" | "llm";
  contextSource: "fixture" | "live";
  verdict: "go" | "no-go" | "conditional";
  recommendation: string;
  contradictions: Contradiction[];
  walked: OpenedDocument[];
  wind: WindObservation;
  rules: RuleTrigger[];
  keywordTrap: string;
  harbourName: string | null;
};

export type SourceRow = {
  _id: string;
  _type?: string;
  kind?: string;
  code?: string;
  title?: string;
  issuedOn?: string;
  body?: string;
  harbour?: { _ref?: string };
  supersedes?: { _ref?: string };
  cites?: Array<{ _ref?: string }>;
  appliesTo?: Array<{ _ref?: string }>;
  subjectBerth?: { _ref?: string };
  standingDepthMetres?: number;
  maxDraftMetres?: number;
  reservedWeekday?: string;
  reservedAfter?: string;
  closedFrom?: string;
  closedUntil?: string;
  windDirection?: string;
  minKnots?: number;
  effect?: string;
  effectBerths?: Array<{ _ref?: string }>;
};

export type BerthRow = {
  _id: string;
  name?: string;
  depthAtChartDatum?: number;
  shelter?: string;
  reservedFor?: string;
  harbour?: { _ref?: string };
};

export type ClaimRow = {
  _id: string;
  statement?: string;
  topic?: string;
  validFrom?: string;
  about?: { _ref?: string };
  source?: { _ref?: string };
};

export type HarbourRow = {
  _id: string;
  name?: string;
  lat?: number;
  lon?: number;
  slug?: { current?: string };
};
