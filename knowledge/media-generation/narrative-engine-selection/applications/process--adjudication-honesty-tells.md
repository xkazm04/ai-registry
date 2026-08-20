---
layer: application
type: application
subject: narrative-engine-selection
technique: adjudication-honesty-tells
stack: process
status: forged
verified_on: 2026-08-19
---

# Adjudication honesty tells in a video-studio methodic (process)

The source studio's `knowledge/ENGINES.md` carries the tells as a dedicated
subsection of the Adjudication engine entry — "D-honest vs D-rigged — the
distinction the generator must know" (`knowledge/ENGINES.md:168-209`) — and
it is the frankest part of the file: it states the three tells, then audits
its own asset schema against them and reports that the rigged path is the
default.

## The three tells as written

`knowledge/ENGINES.md:170-183` states them exactly as the technique does,
"all checkable without knowing the subject":

1. "Is the premise itself in the candidate set?" — otherwise the video
   "adjudicates only *causes*, never *whether* — and the viewer is walked
   past the load-bearing claim while feeling rigorously informed";
2. "Can any candidate actually win against the author's prior?" — three
   framings of one conclusion make the adjudication "decorative";
3. "Is the counter-evidence admitted or pre-excluded?" — a challenge of the
   form "name an X — but you can't say [the most common X]" is
   "unfalsifiable by construction"; the steel-man is called "the single most
   reliable honesty signal in either engine."

## The self-audit: the schema defaults to the rigged path

`:184-209` is the upward lesson. The methodic checks each tell against its
own research-notebook schema and finds only one partially checkable. The
sharpest finding is on tell 2 (`:192-201`): the notebook schema *requires*
`verdict` — the one-sentence answer — "written during research, not during
scripting", because answer-early delivery needs it at 0:40. But "a verdict
fixed before the candidates are weighed IS the author's prior" — so
"D-rigged is the default path out of a conforming notebook, reached by
following the schema correctly. Two files, one repo, neither citing the
other." The file rules this "a live contradiction to be resolved, not a
tension to be balanced": either `verdict` becomes revisable and is recorded
with the candidate that produced it, or tell 2 is unenforceable and the
honesty section is decoration.

The enforcement remedy is named at `:206-209`: a `candidates[]` array on the
notebook — each candidate with supporting and defeating fact ids and its own
outcome, the premise permitted to be one of them — "so the weighing is
stored, gateable, and survives a second render. Until then the honesty
standard of this engine lives only in prose… and evaporates the moment a
script is regenerated."

## Corroboration and the flawed exemplar

Two adjacent parts of the file complete the technique's picture:

- **The density corroboration** (`:211-214`, thresholds at `:359-385`): the
  diagnostics table defines causal-opener density, turn count, and the
  AND-THEN count ("must be **zero**"), all MEASURED over the n=10 pooled
  corpus. The one adjudication witness ran 15% causal-opener density — the
  lowest of ten sources, against 38% for a comparably contested subject —
  and the file draws the technique's exact conclusion: "a low score on this
  engine is a signal the theories are being announced rather than weighed."
- **Skeleton vs execution** (`:216-225`): the adjudication witness itself is
  filed with its skeleton catalogued and its execution explicitly rejected —
  uncited "study after study" sourcing, group attribution of individual
  crimes, and a pre-excluding challenge — with the instruction "Keep the
  engine; take the honesty standard from" the corpus's two contested-subject
  witnesses that steel-man and source their numbers. This is the
  technique's file-the-flawed-exemplar rule performed in situ.

## Status

Confirmed: all three tells, the corroborating diagnostic, and the
skeleton/execution split exist as working doctrine with real incident
provenance. Deviation, self-reported: none of the tells is machine-enforced
— tell 3's nearest field (`counter_positions_to_state_fairly[]`) "records
what *should* be stated, not what the render did with it" (`:202-204`). The
standard holds: until the weighing is stored, every adjudication render is
unaudited by default and may not be reported as honest.
