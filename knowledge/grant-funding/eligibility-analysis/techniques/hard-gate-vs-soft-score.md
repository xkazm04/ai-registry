---
layer: technique
type: technique
subject: eligibility-analysis
technique: hard-gate-vs-soft-score
status: forged
laws: [hard-gates-precede-soft-scores]
shared_with: []
use_when: [wiring eligibility checks into a scored matching pipeline, deciding what an AI layer may override, an ineligible opportunity outranked eligible ones]
---

# Hard gate vs soft score

The technique is a separation of powers: eligibility checks are deterministic
gates whose fail is terminal, and fit scoring — heuristic or model-driven — is
a soft judgement that operates only inside the space the gates leave open.
The two must be different code paths with different authority, not two
weighted terms in one formula.

## Procedure

1. **Compute all gates first, deterministically.** No model call, no prompt,
   no sampled randomness. Same inputs, same verdict, every run. Each gate
   returns `{status: pass | fail | unknown, detail}` — the detail is the
   user-facing explanation and is written at gate time, not reconstructed
   later.
2. **Compute the fit score independently.** The scoring layer (a model
   reading the opportunity against the applicant's mission, or a keyword
   heuristic standing in for it) never sees authority over the gates. It may
   read the gate results as context; it may not amend them.
3. **Derive the verdict in one shared function.** `verdict(fitScore, gates)`:
   if any *hard-blocking* gate failed → ineligible, regardless of score;
   otherwise band the score (e.g. strong / possible / weak). Every pipeline
   path — model-scored and heuristic-fallback alike — must call this same
   function, or the two paths drift and the fallback quietly forgets the
   gate.
4. **Declare which gates hard-block.** Not every fail carries the same
   evidence class. A fail from structured, authoritative data (declared
   applicant codes, a registered legal form, a published close instant)
   hard-blocks. A fail from a heuristic (prose inference, a capacity rule of
   thumb) should either be prevented at the source — heuristics return pass
   or unknown, not fail — or excluded from the hard-block set. Make the
   hard-block set an explicit list in the verdict function, reviewed whenever
   a gate's evidence class changes.

## Decision rules

- **When a model asserts eligibility against a failed gate, the gate wins,
  because** the model read prose and the gate read structure; fluent prose
  about "organizations like yours" is exactly the failure mode the gate
  exists to stop.
- **When a gate returns unknown, do not block — pass control to the fit
  layer and surface the open question, because** unknown means the data
  declined to answer, and deleting an opportunity for missing metadata
  punishes the sparse markets hardest.
- **When adding a new gate, decide its hard-block status by its
  false-positive cost, because** a false fail hides an opportunity forever
  while a false pass merely survives to a stage where a human still reads
  the listing.
- **When caching verdicts, key on every field any gate reads** — applicant
  jurisdiction, entity type, location, revenue, and the opportunity's codes,
  bounds and dates — **because** an eligibility verdict is a function of the
  *pair*, and a profile edit that is missing from the cache key serves stale
  answers indefinitely.

## Anti-symmetry: gates never argue fit

The separation cuts both ways. A pass is permission, not endorsement: gates
must not add points, and gate details must not use persuasive language
("great match for you"). Keeping gate output flat and factual is what lets
the fit layer's enthusiasm be read as the opinion it is.

## When not to use

Do not build a gate/score split when the domain genuinely has no hard
criteria — a discovery feed ranked purely by topical relevance, with no
submission act at stake, is pure soft scoring and a fake gate adds ceremony.
And do not promote soft signals into gates to "be safe": a capacity
heuristic elevated to a hard block converts a rule of thumb into censorship
of the corpus.
