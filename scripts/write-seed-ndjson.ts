import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEED_COUNTS, SEED_DOCUMENTS } from "../sanity/seed-data";

const dir = dirname(fileURLToPath(import.meta.url));
const out = join(dir, "..", "sanity", "seed.ndjson");
writeFileSync(out, SEED_DOCUMENTS.map((doc) => JSON.stringify(doc)).join("\n") + "\n");
console.log(`Wrote ${SEED_COUNTS.total} documents to sanity/seed.ndjson`);
console.log(JSON.stringify(SEED_COUNTS, null, 2));
