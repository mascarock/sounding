import { BriefingDesk } from "@/components/briefing-desk";
import { normalizeQuestion } from "@/lib/agent/input";
import { runBrief } from "@/lib/agent/run";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const question = normalizeQuestion(params.q);
  let answer = null;
  let error: string | null = null;
  if (question) {
    try {
      answer = await runBrief(question);
    } catch (err) {
      console.error("Briefing failed", err);
      error = "The briefing desk could not reach the chain. Fixture mode should still run without keys.";
    }
  }

  return (
    <main>
      <BriefingDesk question={question} answer={answer} error={error} />
    </main>
  );
}
