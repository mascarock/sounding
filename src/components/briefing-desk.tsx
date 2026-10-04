import Link from "next/link";
import type { BriefAnswer } from "@/lib/agent/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/submit-button";

export const CHIPS = [
  "Friday after 18:00, Marsamxett inner pontoon, 1.7 m draft, gregale expected.",
  "Syracuse inner basin east, 2.8 m draft this weekend.",
  "Pozzallo commercial quay, 2.9 m draft.",
  "Xlendi visitor quay in December, 1.8 m draft.",
  "Marina di Ragusa berth A, 2.2 m — a later note says 1.9 m.",
];

const HARBOURS = [
  "Marsamxett",
  "Mgarr (Gozo)",
  "Xlendi",
  "Grand Harbour",
  "Syracuse",
  "Pozzallo",
  "Marzamemi",
  "Marina di Ragusa",
];

export function BriefingDesk({
  question,
  answer,
  error,
}: {
  question: string;
  answer: BriefAnswer | null;
  error: string | null;
}) {
  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-col gap-4 border-b border-cream/15 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brass">Day-boat harbour desk</p>
            <h1 className="mt-1 font-display text-5xl leading-none text-cream sm:text-6xl">Sounding</h1>
          </div>
          <Badge variant="brass">Central Mediterranean · eight harbours</Badge>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-foam sm:text-base">
          Demonstration data. Not an official navigation publication. Invented pocket notes and harbour notices —
          do not take these figures to sea.
        </p>
        <ul className="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-wider text-foam/80">
          {HARBOURS.map((name) => (
            <li key={name} className="border border-foam/20 px-2 py-1">
              {name}
            </li>
          ))}
        </ul>
      </header>

      <section className="flex flex-col gap-3">
        <label htmlFor="question" className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
          Ask as you would on the VHF
        </label>
        <form action="/" method="get" className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="question"
            name="q"
            defaultValue={question || CHIPS[0]}
            placeholder="Harbour, draft, day, wind…"
          />
          <SubmitButton />
        </form>
        <div className="flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <Link
              key={chip}
              href={`/?q=${encodeURIComponent(chip)}`}
              className="inline-flex max-w-full items-center justify-center rounded-sm border border-foam/30 bg-transparent px-3 py-1.5 text-left font-serif text-[13px] leading-snug text-cream hover:border-cream/60"
            >
              {chip}
            </Link>
          ))}
        </div>
      </section>

      {error ? (
        <Card className="border-signal/50">
          <CardContent className="py-6 text-signal">{error}</CardContent>
        </Card>
      ) : null}

      {!error && !answer ? (
        <Card>
          <CardContent className="space-y-3 py-8 text-foam">
            <p className="font-display text-2xl text-cream">The 2019 pocket notes are in this set, and they are often wrong.</p>
            <p>
              The standing figure lives on the notice that supersedes them, on the survey that notice cites, and on
              the weather rule joined to tonight&apos;s wind. A harbour-name hit is the unsafe answer.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {answer ? <AnswerPanel answer={answer} /> : null}
    </div>
  );
}

function AnswerPanel({ answer }: { answer: BriefAnswer }) {
  const hasConflict = answer.contradictions.length > 0;
  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-cream text-cream-ink">
        <CardHeader className="flex flex-col gap-2 border-cream-ink/15 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Recommendation</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-ink/60">
              {answer.verdict}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream-ink/60">
            {answer.mode === "llm" ? "Model + tools" : "Deterministic walker"} · {answer.contextSource}
          </span>
        </CardHeader>
        <CardContent className="space-y-3 py-5">
          <p className="font-display text-2xl leading-snug sm:text-3xl">{answer.recommendation}</p>
          <p className="text-sm text-cream-ink/70">
            Demonstration data. Not an official navigation publication.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">Live wind · Open-Meteo</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foam">
            {answer.wind.source === "unavailable" ? (
              <p>Live wind could not be fetched. Rules were still joined to any wind named in the question.</p>
            ) : (
              <p>
                {answer.wind.knots ?? "—"} kn from {answer.wind.directionLabel}
                {answer.wind.directionDegrees != null ? ` (${answer.wind.directionDegrees}°)` : ""}
                {answer.wind.at ? ` at ${answer.wind.at}` : ""}.
              </p>
            )}
            {answer.rules.length === 0 ? <p>No weather rule was opened for this harbour.</p> : null}
            {answer.rules.map((rule) => (
              <div key={rule.documentId} className="border-t border-cream/10 pt-2">
                <p className="text-cream">{rule.title}</p>
                <p>
                  {rule.triggered ? "Triggered" : "Did not trigger"} · {rule.detail}
                </p>
                <p className="mt-1 italic text-foam/80">{rule.effect}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={hasConflict ? "border-signal" : ""}>
          <CardHeader className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">Contradicting claims</p>
            {hasConflict ? <Badge variant="signal">Conflict</Badge> : <Badge>None opened</Badge>}
          </CardHeader>
          <CardContent className="space-y-4">
            {answer.contradictions.length === 0 ? (
              <p className="text-sm text-foam">No paired claims were opened for the same berth.</p>
            ) : (
              answer.contradictions.map((c) => (
                <div key={`${c.aboutId}-${c.left.sourceId}-${c.right.sourceId}`} className="space-y-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream">
                    {c.aboutName} · {c.topic}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ClaimSheet claim={c.left} standing={c.standingSourceId === c.left.sourceId} />
                    <ClaimSheet claim={c.right} standing={c.standingSourceId === c.right.sourceId} />
                  </div>
                  <p className="text-xs text-foam">{c.reason}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">Documents walked, in order</p>
        </CardHeader>
        <CardContent>
          {answer.walked.length === 0 ? (
            <p className="text-sm text-foam">No documents were opened.</p>
          ) : (
            <ol className="space-y-2">
              {answer.walked.map((doc, i) => (
                <li key={`${doc.id}-${i}`} className="flex gap-3 font-mono text-xs text-foam">
                  <span className="w-6 shrink-0 text-brass">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-cream">{doc.id}</span>
                  <span className="hidden sm:inline">{doc.code ?? doc.kind ?? doc.type}</span>
                  <span className="min-w-0 truncate text-foam/70">{doc.title}</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {answer.keywordTrap ? (
        <>
          <Separator />
          <p className="text-sm text-foam">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-brass">Keyword search would have been wrong. </span>
            {answer.keywordTrap}
          </p>
        </>
      ) : null}
    </div>
  );
}

function ClaimSheet({
  claim,
  standing,
}: {
  claim: { statement: string; sourceId: string; sourceTitle: string; issuedOn?: string };
  standing: boolean;
}) {
  return (
    <div className="bg-cream p-3 text-cream-ink">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream-ink/60">
        {standing ? "Standing" : "Contradicted"} · {claim.issuedOn ?? "undated"}
      </p>
      <p className="mt-1 text-sm leading-snug">{claim.statement}</p>
      <p className="mt-2 font-mono text-[10px] text-cream-ink/70">
        {claim.sourceId}
        <br />
        {claim.sourceTitle}
      </p>
    </div>
  );
}
