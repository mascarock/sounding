import { NextResponse } from "next/server";
import { runBrief } from "@/lib/agent/run";
import { contextMode } from "@/lib/sanity-context";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let question = "";
  try {
    const body = (await req.json()) as { question?: string };
    question = (body.question ?? "").trim();
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Briefing failed" },
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
