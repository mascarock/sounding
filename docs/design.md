# Design Notes

Sounding is a day-boat briefing desk over invented harbour paperwork. The point is to answer from the standing chain of notices, citations, berth links, and weather rules instead of from the first keyword hit.

## Question Walk

```mermaid
flowchart TD
  A[Skipper question] --> B[Parse harbour, berth hint, draft, day, time, wind]
  B --> C[initial_context]
  C --> D[schema_explorer: sourceDocument]
  D --> E[groq_query: harbour and berths]
  E --> F[groq_query: old pocket notes]
  F --> G[Follow supersedes links]
  G --> H[Follow cites links]
  H --> I[Open berth-specific notices and rules]
  I --> J[Compare conflicting claims]
  J --> K[Apply depth, reservation, season, and wind rules]
  K --> L[Desk answer with walked documents and replacement chain]
```

For Marsamxett, the 2019 pocket note is opened because it is the old harbour source. HN-2024-17 is then opened because it supersedes that pocket note. HN-2025-03 is opened because it cites HN-2024-17 and reserves the outer berths. The gregale rule is opened because weather can change which berths count as sheltered.

## Secret Boundary

```mermaid
flowchart LR
  A[Public repo] --> B[Invented fixture corpus]
  A --> C[Empty .env.example fields]
  B --> D[Fixture context tools]
  D --> E[Judge and demo desk]

  F[Local .env.local on developer machine] --> G[Optional Sanity read token]
  F --> H[Optional LLM keys]
  G --> I[Live Sanity context]
  H --> J[Optional model tool loop]

  A -. does not store .-> G
  A -. does not store .-> H
```

Fixture mode is the default path and needs no token. The public repo names the Sanity project, dataset, and knowledge base so the setup is understandable, but read tokens and model keys stay out of git.
