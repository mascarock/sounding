---
title: I built a harbour desk that refuses the old book
published: false
tags: sanitychallenge
---

I built Sounding for the Sanity challenge as a tiny day-boat harbour desk, because I wanted the failure mode to feel concrete. Not "the chatbot hallucinated", but "a skipper searched the harbour name and got the old pocket note."

The demo data is invented and explicitly not for navigation. The story is Marsamxett on a Friday evening in a strong gregale. The 2019 pocket note says the inner pontoons have 2.1 m and visitors are welcome. HN-2024-17 supersedes that with 1.4 m on the inner fingers, except the two outer visitor berths. HN-2025-03 then reserves those outer berths for the ferry after 18:00 on Fridays. The weather rule says those same outer berths are the only visitor shelter in a strong gregale.

So the answer is not "inner pontoon, 2.1 m". It is no safe visitor berth.

I made the app walk the corpus like structured harbour paperwork rather than like a bag of search snippets. It starts with `initial_context`, asks the schema for the shape of the documents, queries the harbour and berths, then follows `supersedes`, `cites`, `appliesTo`, and weather-rule `effectBerths`. The screen shows the question, the answer, the old claim, the standing notice, and the document replacement chain, because the useful part of this demo is seeing why the old answer lost.

Fixture mode is the default and needs no token. The public repo leaves `SANITY_API_READ_TOKEN` and all LLM keys empty, but the same swap point can use the existing Sanity project `59vrectd`, dataset `production`, and knowledge base `kbl6C1tJBXli` when a local read token is provided. The deterministic walker is enough to run the judge; an LLM can call the same tools if a local provider key exists.

The thing I liked most about this build was that "latest document wins" was not good enough. Pozzallo has a later, deeper informal sounding that does not supersede the standing notice. Syracuse has a silt survey that matters only because a harbour notice cites it and supersedes the old book. The relationships carry the truth.

The final desk is still a demo, but it has the rule I wanted: a keyword answer can be fast and wrong, while a context answer has to show its walk.
