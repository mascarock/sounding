import { NextResponse } from "next/server";
import { MAX_QUESTION_LENGTH, normalizeQuestion } from "@/lib/agent/input";
import { runBrief } from "@/lib/agent/run";
import { contextMode } from "@/lib/sanity-context";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let question = "";
  try {
    const body = (await req.json()) as { question?: string };
    question = normalizeQuestion(body.question);
  } catch {
    return NextResponse.json({ error: "Send JSON { question }." }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ error: "Ask a harbour question." }, { status: 400 });
  }
  try {
    const answer = await runBrief(question);
    return NextResponse.json({ ...answer, contextMode: contextMode() });
  } catch (error) {
    console.error("Briefing API failed", error);
    return NextResponse.json(
      { error: `Briefing failed. Questions are capped at ${MAX_QUESTION_LENGTH} characters and fixture mode needs no keys.` },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    contextMode: contextMode(),
    harbours: [
      "Marsamxett",
      "Mgarr (Gozo)",
      "Xlendi",
      "Grand Harbour",
      "Syracuse",
      "Pozzallo",
      "Marzamemi",
      "Marina di Ragusa",
    ],
  });
}
