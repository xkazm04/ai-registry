---
layer: application
type: application
subject: agent-memory
technique: self-trained-capture-filter
stack: node
verified_on: 2026-09-07
verified_against: node@22
applied: unapplied
ab_verdict: unmeasurable
proof: structural-only
---

# A noise bank that learns from the extractor's silence (Node)

`memory-lancedb-pro` at `1a683cf5` runs an LLM extractor over conversation
turns and, because most turns yield nothing, screens them first with an
embedding-similarity noise bank that trains on the extractor's own empty
answers. The version witness is the CI pin — `node-version: 22` across every
job in `.github/workflows/ci.yml` — since the package declares no `engines`
field.

It is the clearest instance of this technique the registry has read, and it
splits cleanly: the entrance is a model implementation, and the loop has no
exit at all.

## The entrance: an empty result is not a signal until its cause is typed

`extractAndPersist` returns a discriminated union (`src/smart-extractor.ts:177`)
whose arms separate the reasons a candidate list can come back empty, and only
one of them reaches the learner (`:730-756`):

| arm | cause | trains the bank |
| --- | --- | --- |
| `llm_failure` | gateway error, null response | no |
| `malformed` | model answered, parse failed | no |
| `empty_input` | every turn stripped to nothing upstream | no — the call is never made (`:1770`, `:1811`) |
| policy-emptied | the model produced candidates, grounding/validation dropped them all | no (`:743-748`) |
| `ok`, zero candidates | the model answered and found nothing | **yes** (`:738-739`) |

The comment at the policy-emptied branch states the rule better than a
specification would: the model *did* emit candidates, so that is a verdict
about those candidates and not evidence the conversation is noise. Six cases in
`test/smart-extractor-noise-gating.test.mjs:95-178` pin one arm each. This is
the half worth copying wholesale, and it is why the technique's first section
is written as a taxonomy rather than a warning.

## The loop: two mutators, no exit

`src/noise-prototypes.ts` (172 lines) has exactly `init()` and `learn()`. There
is no unlearn, remove, clear, re-test or decay, and no caller performs one — the
only mutation call in the tree is `noiseBank.learn(vec)` at
`src/smart-extractor.ts:1693`.

The screen runs at `index.ts:4669`, **before** `extractAndPersist` at
`index.ts:4738`; when everything is filtered, `index.ts:4674-4676` returns with
no LLM call. So a prototype learned from one honest empty answer blocks its
whole 0.82-cosine neighbourhood before the only oracle that could contradict it
ever runs. The two exits that exist are FIFO eviction after 200 further learned
prototypes (`noise-prototypes.ts:138`) and process restart — the bank is a plain
in-memory array (`:50`) rebuilt at `index.ts:2777`, with no serialization
anywhere in the file. Its effective retention policy is "until the plugin
reloads", which is stated in no document.

## The two constants are in the wrong order

- match bar: **0.82** (`noise-prototypes.ts:41`, applied `:112-118`)
- dedup-on-learn bar: **0.90** (`:43`, applied `:129-132`)

Material at cosine 0.85 to an existing prototype is therefore already screened
out as noise, yet still admitted as a *new* prototype — the bank grows with
vectors it already covers, and the 200-cap then evicts the oldest genuine
entry. The inline note on the constant records that it was *lowered* from 0.95
to "reduce noise bank bloat", which is the symptom treated one threshold too
late. No test covers the ordering, the cap, either threshold, or eviction.

## The learned object is not the matched object

`learnAsNoise` embeds the last 300 characters of the **concatenated batch**
(`src/smart-extractor.ts:1690`). `isNoise` is applied to **individual
messages** of length 9–300 (`:1613-1618`); shorter and longer texts bypass the
screen entirely. A tail of a concatenation and a single message are different
distributions, and the threshold separating them was chosen as though they were
the same. Nothing in the tree pairs them in a test.

## Why this is `unapplied`, and what would change it

No managed project in the fleet carries a learned pre-filter, and the absence
was read rather than assumed. The fleet's one memory system takes the opposite
route the technique's closing section prescribes for stable noise: the
sleep-cycle gate in `personas` is a stated-rule screen — an interval floor, a
pressure threshold in characters, a minimum staleness — whose every skip
returns a human-readable reason, and which consumes no outcome of the
consolidation it gates. Its dedup is by content hash and stable keys, not by
embedding similarity, so the `add_bar <= match_bar` invariant has nothing to
bind to either.

**Return condition:** a fleet project adds a screen in front of an LLM judge
whose decision is derived from that judge's past output — or `personas`' sleep
cycle gains a pressure term computed from prior cycle yields, which would turn
its stated-rule gate into a learned one and make all five disciplines binding.

## What this realization cannot do

Nothing here measures the filter's error rate, and the tree could not: screened
items are dropped with a debug log (`src/smart-extractor.ts:1656-1661`), no
counter records the screen rate, no sampling lane sends a fraction past the
screen, and no metric would distinguish a well-tuned bank from one that has
widened until it blocks a topic. The technique's recording section is written
from that absence, not from an instrument this tree provides.
