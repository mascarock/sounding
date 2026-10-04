# Sounding

Sounding is a small day-boat harbour briefing desk for the Sanity challenge, Path One. It shows why an agent must walk structured Sanity-shaped context instead of stopping at the first plausible harbour note.

**Demonstration data only. Not an official navigation publication. Do not use this for real navigation.** Every pocket note, notice, depth, ferry reservation, and weather rule in this repository is invented.

## The Trick

Marsamxett, Friday evening, strong gregale, 1.7 m draft.

The 2019 pocket note says the Marsamxett inner pontoons sound 2.1 m at chart datum and that visiting day-boats are welcome alongside the three inner fingers. A keyword search for "Marsamxett" can easily stop there and quote the old book.

HN-2024-17 replaces that pocket note. It says winter silt has reduced the inner pontoon to 1.4 m, except that Outer North and Outer South keep their published depths.

HN-2025-03 then cites HN-2024-17 and reserves those two outer berths for the ferry on Fridays after 18:00.

The gregale rule says that in a north-easterly at 20 kn or more, those same two outer berths are the only visitor berths with usable shelter. So a 1.7 m visitor arriving Friday after 18:00 in a strong gregale has no safe visitor berth. The right answer is no-go, not the old 2.1 m welcome.

## Run The Fixture

Fixture mode is the default and needs no Sanity token, no LLM key, and no live knowledge-base call. It uses the committed invented corpus and the same four tool names as the live path:

- `initial_context`
- `schema_explorer`
- `groq_query`
- `array_field_reader`

Run the desk on port 43173:

```bash
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173).

Run the judge:

```bash
npm run judge
```

The judge checks three traps:

- Marsamxett: no safe visitor berth, because the 2019 2.1 m inner-pontoon note is superseded by HN-2024-17 at 1.4 m, and the only sheltered outer berths are reserved after 18:00 Friday.
- Syracuse: no-go for Inner Basin East at 2.8 m, because the 2019 3.5 m note is superseded by HN-2025-11 after the silt survey.
- Pozzallo: no-go at 2.9 m on the commercial quay, because the later 3.2 m informal note does not supersede HN-2024-44.

Proof files:

- [docs/proof/judge.txt](docs/proof/judge.txt) is a saved fixture judge run.
- [docs/proof/sounding.webm](docs/proof/sounding.webm) shows the Marsamxett answer with the old 2019 2.1 m note and the later HN-2024-17 / 1.4 m notice.
- [docs/proof/sounding-vo.mp3](docs/proof/sounding-vo.mp3) is the voiceover audio for the walkthrough.
- [docs/proof/desk-marsamxett.png](docs/proof/desk-marsamxett.png) and [docs/proof/desk-marsamxett-mobile.png](docs/proof/desk-marsamxett-mobile.png) are desktop and mobile screenshots.

## How The Desk Works

The app starts with `initial_context`, asks the schema what fields and references exist, queries harbours, berths, source documents, and claims, then follows `supersedes`, `cites`, `appliesTo`, and weather-rule `effectBerths`.

The deterministic walker is enough for judging. If an LLM key is present, the model can run the same tools, but fixture mode needs no token and remains the default.

## Local Setup

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173).

Build check:

```bash
npm run build
```

## Sanity Setup

Use the existing Sanity project. Do not create another one.

- Project id: `59vrectd`
- Dataset: `production`
- Knowledge base: `kbl6C1tJBXli`

Fixture mode needs no token. Keep `SANITY_API_READ_TOKEN` empty in the repo, and keep LLM keys empty in the repo.

`.env.example` names the project and dataset with empty secret fields. Copy it to `.env.local` only for local live testing, then set a read token on your own machine. Optional LLM providers are checked in this order: `XAI_API_KEY`, `OPENAI_API_KEY`, then `GROQ_API_KEY`.

To import the invented corpus into the existing dataset, see [sanity/IMPORT.md](sanity/IMPORT.md).

## Judge Cases

The saved fixture output is in [docs/proof/judge.txt](docs/proof/judge.txt). `npm run judge` checks:

- Marsamxett: the 2019 2.1 m visitor welcome is replaced by a 1.4 m notice; the only sheltered outer berths are then reserved for the ferry Friday after 18:00.
- Syracuse: a 2019 3.5 m inner-basin note is superseded by HN-2025-11 after a silt survey, closing Inner Basin East to drafts over 2.0 m.
- Pozzallo: a later 3.2 m informal sounding does not supersede HN-2024-44, so the standing commercial-quay limit remains 2.8 m with visitors only under 2.6 m draft.

## Security Notes

The repository should not contain `.env` files, read tokens, or LLM API keys. `.gitignore` ignores `.env*` except `.env.example`, `node_modules`, build outputs, and the nested `salt-wharf/` checkout.

Fixture mode is deliberately public-demo friendly: no login, no token, no Sanity credential, and no LLM key are required to run or judge it.
