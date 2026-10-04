import { JUDGE_CASES } from "../src/lib/agent/judge-cases";
import { walkBrief } from "../src/lib/agent/walker";
import { createContextClient } from "../src/lib/sanity-context";
import { SEED_COUNTS } from "../sanity/seed-data";

async function main() {
  console.log(`Sounding judge cases · seed ${SEED_COUNTS.total} documents`);
  console.log("");
  let failed = 0;
  for (const c of JUDGE_CASES) {
    const client = createContextClient();
    const answer = await walkBrief(client, c.question);
    const opened = answer.walked.map((d) => d.id);
    const missing = c.mustOpen.filter((id) => !opened.includes(id));
    const okVerdict = answer.verdict === c.expectedVerdict;
    const okChain = missing.length === 0;
    if (!okVerdict || !okChain) failed += 1;
    console.log(`Q  ${c.question}`);
    console.log(`   Expected verdict: ${c.expectedVerdict}`);
    console.log(`   Walker verdict:   ${answer.verdict} ${okVerdict ? "OK" : "FAIL"}`);
    console.log(`   Expected recommendation:`);
    console.log(`   ${c.expectedRecommendation}`);
    console.log(`   Walker recommendation:`);
    console.log(`   ${answer.recommendation}`);
    console.log(`   Documents walked:`);
    for (const id of opened) console.log(`     - ${id}`);
    console.log(`   Required ids: ${okChain ? "OK" : `MISSING ${missing.join(", ")}`}`);
    if (answer.keywordTrap) console.log(`   Keyword trap: ${answer.keywordTrap}`);
    console.log("");
  }
  if (failed) {
    console.error(`${failed} case(s) failed`);
    process.exitCode = 1;
  } else {
    console.log("All required chains opened and verdicts matched.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
