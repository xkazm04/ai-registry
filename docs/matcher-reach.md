# What the matcher can reach, measured

`build-registry-map.mjs` joins a project's contexts to the registry's subjects. Everything
downstream reads that join: `/conform` judges the pairs it names, and the `knowledge-sync`
clause carried by 18 skills says to "take its subjects from the map". So a subject the join
misses is a standard that cannot be applied, and a subject it ranks badly is a standard a
session will not reach.

This document records what the join actually does, measured against labels the fleet paid
for rather than against intuition. Nothing here has been changed; the measurement is the
deliverable, and the change it implies is a decision, not a patch.

## The labels

| set | n | what it is | clean? |
| --- | ---: | --- | --- |
| `source: "conform"` pairings | 53 | a reader opened the code and established a pairing **the matcher had not produced** | **yes** |
| `state: conformant \| deviation` | 199 | a reader judged the subject as governing | no — judged *because* the matcher surfaced it |
| `state: not-applicable` | 60 | a reader judged the precondition fails here | no — same conditioning |

Only the first set is uncontaminated. The other two are conditioned on the matcher having
published the pair in the first place, so a high score on them measures agreement with
past behaviour, not correctness. They are recorded because they are the only labelled
negatives that exist, and because their circularity is itself worth writing down.

## The finding

**The subject the corpus names `table` was never unmatched.** On the context
`display-table-primitives` — whose files are `UnifiedTable.tsx`, `SortableHeader.tsx`,
`ColumnResize.tsx`, `DataGrid.tsx` — it ranks **#8 at score 648**, `use_when`-grounded,
comfortably above the relative floor. `TOP = 5` cuts it. What outranks it is
`quality-gates` (786), `test-harness` (748), `fleet-orchestration` (719), `motion` (715),
`narrative-scroll-surface` (705).

Those are all *large* subjects, and that is the mechanism: the score is a **sum** of
per-token contributions, so a subject carrying twenty-one techniques accumulates more
matching terms than one carrying six, whatever the precision of the match. **The matcher
rewards subject size.** A small subject whose name is the context's own noun loses to a
large subject that merely shares vocabulary with it.

The same shape appears with the opposite diction: on another repo the word "table" occurs
eleven times in the context's own tracked catalogue, and the subject still does not
publish. Two repos, opposite vocabularies, same outcome — the scorer, not the projects.

## A second failure mode, found three times in one afternoon

Size is not the only bias. The matcher also pairs a subject to **the layer that talks about
the thing rather than the layer that is it**, and the two mistakes compound.

- `job-coordination` scored **545** on a BFF route folder whose twenty files forward every
  call upstream and hold no record, no claim and no lease — and **zero** on the context
  holding the job table, the persisted state mirror, the claim and the owner heartbeat.
- `mcp-tools` was matched to **seventeen of one repo's forty-six contexts** and to none of
  the code under `crates/server/src/mcp/`, which is in no context at all. In a third repo
  the same subject is the densest unjudged strong pair in the map.

The mechanism is vocabulary, and it is structural rather than accidental: a proxy's words
*are* the domain's words — route, job, request, probe — while an implementation's words are
its own nouns — scan, stem, speaker, claim, heartbeat. A lexical join therefore scores the
proxy high and the implementation at nothing, and the map then reads as covered.

This one is worse than the size bias because it is invisible to every count. The subject is
present, the pair is `strong`, and a reader checking "is this subject paired anywhere in
this repo?" gets yes. The correction has two halves and doing only one is worse than doing
neither: refuse the resonant pair with an argued `not-applicable`, **and** add the pair on
the context whose precondition actually holds.

## The curve

Recall of the 53 clean positives, and false positives over the 60 labelled negatives, as a
function of the published cap. `norm` is a candidate that divides each contribution by the
L2 norm of the subject's token bag — the cosine denominator, which removes the size reward.

| cap | recall (baseline) | recall (norm) | fp (baseline) | pairs (baseline) |
| ---: | ---: | ---: | ---: | ---: |
| **5** *(shipping today)* | **6%** | 8% | 75% | 3,585 |
| 8 | 13% | 15% | 87% | 5,150 |
| 10 | 19% | **32%** | 90% | 5,976 |
| 12 | 28% | **40%** | 92% | 6,628 |
| 15 | 40% | 42% | 93% | 7,316 |
| 40 | 49% | 51% | 98% | 8,350 |

Read the false-positive column with the circularity warning above: a `not-applicable`
verdict exists only where the matcher already published the pair, so the column mostly
restates that. It is not evidence the candidate is safe.

## What it means

1. **The published cap, not the scorer, is what hides most of the misses.** Six per cent of
   the pairings readers established are visible at `TOP = 5`. The scorer had ranked nearly
   half of them somewhere.
2. **Size normalization is a real improvement where it can be measured** — recall at a cap
   of ten nearly doubles, 19% to 32% — and it is a one-line change to the contribution term.
3. **There is a ceiling near 50%.** Uncapped and normalized, the matcher still never finds
   half the pairings a reader established. That half is not a tuning problem: it is
   vocabulary the lexical join cannot cross, and the honest response is the coverage
   question the method already has (`/conform` §6), not a better constant.

## Why nothing was changed

Raising the cap or normalizing the score rewrites every pair in every project's map — about
4,700 pairs across thirteen repositories — and the only clean label set has 53 members.
This repository's law for a change that reaches other people's repositories is
propose-then-adopt. The measurement is committed; the decision is not taken.

Reproduce with `scripts/check-context-coverage.mjs` for reach, and by adding `norm` to the
contribution term in `build-registry-map.mjs` for the curve.
