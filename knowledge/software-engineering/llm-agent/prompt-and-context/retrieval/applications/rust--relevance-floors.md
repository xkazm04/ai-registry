---
layer: application
type: application
subject: retrieval
technique: relevance-floors
stack: rust
status: forged
verified_on: 2026-09-15
verified_against: rust@1.80
applied: experiment
ab_verdict: better
---

# The floor that could have been squared, and the test that could not tell

*Verified against `xkazm04/personas` at `cf54b904b` (`src-tauri/Cargo.toml` declares
`rust-version = "1.80.0"`; `Cargo.lock` pins `rusqlite 0.38.0` and `sqlite-vec 0.1.6`),
read on 2026-09-15. The contrasting tree is `Shubhamsaboo/awesome-llm-apps` at `4593569`.*

## The occasion: a fix that was still wrong

A news-and-podcast agent in the tutorial monorepo converted FAISS distances into a
cosine similarity so its floor could read "85%"
(`advanced_ai_agents/multi_agent_apps/ai_news_and_podcast_agents/beifong/tools/embedding_search.py:15-23`).
The formula is `1 - distance**2 / 2`, which is right for a Euclidean distance. The
indexes it searches (`IndexFlatL2`, IVF over an `IndexFlatL2` quantizer, `IndexHNSWFlat`,
`processors/faiss_indexing_processor.py:22-54`) return the *squared* distance, so the
value is squared twice. The 0.85 floor admits true cosines down to about 0.726, and the
relevance printed into the agent's context overstates every hit. The commit that
introduced the function was itself a fix for a threshold applied to a raw distance.
Two readers found the double square independently.

## The seam chosen to falsify: personas' companion floor

Personas stores 384-dimensional normalized MiniLM vectors in a `vec0` table that
declares no metric, so its KNN is L2, and it floors recall at
`MAX_VECTOR_DISTANCE = 1.30` (`src-tauri/core/src/retrieval/mod.rs:40-50`). The doc
comment derives the floor from the same identity, `L2² = 2(1 − cos)`, and concludes it
keeps `cos ≳ 0.15`. That conclusion is true only if sqlite-vec returns the root. If it
returned the square, like the FAISS indexes above, the floor would admit `cos ≥ 0.35`
and the comment would be wrong in the same way the tutorial was.

The C source settles the unit, and its naming is itself the trap: every path under
`distance_l2_sqr_float` returns `sqrt(...)` despite the name
(`sqlite-vec 0.1.6`, `sqlite-vec.c:374-404`).

## The experiment

A standalone crate pinned to the lockfile's two versions ran the real `vec_distance_l2`
over unit vectors and evaluated two assertion sets against the real index and against a
squared-distance index (the real outputs squared):

| | real index | squared index |
|---|---|---|
| orthogonal pair | 1.4142 | 2.0 |
| cos 0.85 pair | 0.5477 | 0.30 |
| **A:** the assertions `vec_distance_l2_kind_scan` makes (order only) | pass | **pass** |
| **B:** known-pair pin (√2 and √0.3) | pass | **fail** |
| cosine admitted by the 1.30 floor | ≥ 0.155 | ≥ 0.350 |

The finding held: the documented maths is right. What the seam showed is that nothing
in the suite would notice if it stopped being right. The existing test
(`src-tauri/src/companion/brain/embeddings.rs:458-505`) proves the function resolves and
orders; an engine upgrade, a metric flag or a switch to a library that returns the square
passes it. The pin is filed as personas' next change, under `--features ml`, which this
run did not build.

## What the realization cannot do

The pin proves the unit, not the normalization. The floor's identity also assumes the
embedder returns length-one vectors, which the store trusts and does not check. A second,
unrelated mislabel sits beside it: `search_similar` is documented as "Cosine search" over
the L2 table (`embeddings.rs:347`). It is harmless while the floor comment is right, and it
is the kind of sentence that makes the next reader apply the wrong formula.
