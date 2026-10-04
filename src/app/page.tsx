import { BriefingDesk } from "@/components/briefing-desk";
import { runBrief } from "@/lib/agent/run";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const question = (params.q ?? "").trim();
  let answer = null;
  let error: string | null = null;
  if (question) {
    try {
      answer = await runBrief(question);
    } catch (err) {
      error = err instanceof Error ? err.message : "The briefing desk could not reach the chain.";
    }
  }

  return (
    <main>
      <BriefingDesk question={question} answer={answer} error={error} />
    </main>
  );
}
