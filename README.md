# Sounding

A day-boat harbour briefing desk for eight central Mediterranean harbours: Marsamxett, Mgarr (Gozo), Xlendi, Grand Harbour, Syracuse, Pozzallo, Marzamemi, and Marina di Ragusa.

A skipper asks a question the 2019 pocket notes get dangerously wrong. The standing answer is recovered only by walking `supersedes`, `cites`, and `appliesTo`, then joining a weather rule to live wind from Open-Meteo.

**Demonstration data. Not an official navigation publication.** The notices are invented.

## Run in fixture mode (no keys)

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173). Leave `.env` empty. The agent reads `sanity/seed-data.ts` through the same tools a live Sanity Context MCP exposes: `initial_context`, `schema_explorer`, `groq_query`, `array_field_reader`.

```bash
npm run judge
```

Prints three scripted questions, the expected recommendation, the documents walked, and whether the walker opened the required chain.

```bash
npm run build
```

## Point at the Sanity project

The project already exists. Do not create another.

- Project id: `59vrectd`
- Dataset: `production` (public)
- Organization: mascarock (`o1r4ucepz`)
- Manage: https://www.sanity.io/organizations/o1r4ucepz/project/59vrectd

`.env.example` already has that project id and dataset. Copy it to `.env.local` if you want. Leave `SANITY_API_READ_TOKEN` empty in the repo; set a read token only on your machine. Context Knowledge Bases is enabled on the organization.

1. Import the seed (`sanity/IMPORT.md`) into `production`.
2. Optionally set `SANITY_CONTEXT_SLUG` or `SANITY_KB_MCP_URL`.
3. Restart. `src/lib/sanity-context/index.ts` is the only swap: live MCP when a token (and slug or KB URL) is set, fixture otherwise.

Optional tool-calling loop (max 8 calls), first key found wins: `XAI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY`. Without a key the deterministic walker writes the answer from documents it opened.

Live wind uses the Open-Meteo forecast endpoint for the harbour latitude and longitude. No API key.

## What this is not

Not a compliance catalog, a docs chatbot, a blog, or a generic RAG demo. Keyword search for a harbour name returns the 2019 excerpt and the unsafe figure.
