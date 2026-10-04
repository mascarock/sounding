# How Sounding is built

## Schema

Four document types. The safe answer is not “the document that mentions the harbour.”

- `harbour` — name, slug, lat, lon. Eight ports. Coordinates exist so Open-Meteo can be joined at answer time.
- `berth` — harbour ref, published `depthAtChartDatum`, shelter, reservedFor. The depth on the berth is the chart / 2019 figure. It is often stale on purpose.
- `sourceDocument` — discriminated `kind`: `almanacExcerpt`, `harbourNotice`, `siltSurvey`, `weatherRule`. Relations: `supersedes` (one), `cites` (many), `appliesTo` (berths), `subjectBerth`. Weather rules add `windDirection`, `minKnots`, `effect`, `effectBerths`.
- `claim` — a quotable statement about a berth or harbour, with `source` and `validFrom`. Two claims about the same berth are how the desk shows a conflict.

A later `issuedOn` does not replace an earlier notice unless `supersedes` points at that notice. Pozzallo is the worked example: HN-2025-08 is later and sounds deeper; it cites the almanac and does not supersede HN-2024-44, so 2.8 m remains standing.

## Why search fails

A harbour-name match returns the 2019 pocket note. At Marsamxett that note says 2.1 m and visitors welcome. The standing inner depth is 1.4 m on HN-2024-17, which supersedes the pocket note. The outer two berths stay deep, but HN-2025-03 cites HN-2024-17 and reserves them for the ferry Friday after 18:00. The gregale rule names those same outer berths as the only sheltered visitor walls at 20 kn. A 1.7 m boat arriving Friday after 18:00 in a gregale has no safe visitor berth. None of that is in the document that merely mentions Marsamxett.

Syracuse is a different shape: a silt survey does not berth anyone; the notice that cites it and supersedes the almanac does. Xlendi is seasonal. Marina di Ragusa is the inverse of Pozzallo — a later shallower rumour does not win.

## Tools

The agent never reads the seed as a bag of text. It uses a Sanity Context-shaped interface:

1. `initial_context` first. The fixture refuses other tools until this runs.
2. `schema_explorer` for field lists and refs.
3. `groq_query` against the corpus (or the live MCP).
4. `array_field_reader` for `cites` / `appliesTo` / `effectBerths`.

`src/lib/sanity-context/index.ts` is the swap. If `SANITY_KB_MCP_URL` is set it wins; else the slug endpoint `POST https://api.sanity.io/v2026-03-03/context/mcp/{project}/{dataset}/{slug}` with a read token; else the committed fixture.

## What was not shipped

- No Sanity project was created here. The existing project is `59vrectd`, dataset `production`.
- No Studio app. Schema lives under `sanity/schema` for that project.
- No embeddings, no keyword index as the answer path, no auth, no database.
- No official almanac or harbour-authority text. The prose is short and invented.
- The LLM loop runs only when a provider key is present. Judges can score fixture mode with `npm run judge`.
