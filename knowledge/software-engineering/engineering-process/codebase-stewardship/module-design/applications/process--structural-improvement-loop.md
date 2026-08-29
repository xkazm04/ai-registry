---
layer: application
type: application
subject: module-design
technique: structural-improvement-loop
stack: process
status: forged
verified_on: 2026-08-29
---

# A structural improvement loop over a knowledge corpus

The technique is written for a codebase. This realization runs the same four
stages over a *knowledge registry* — a corpus of markdown bundles rather than
source — which is a useful reconciliation precisely because the substrate is
different: everything that survives the substitution is the loop, and everything
that does not was really about code.

The pipeline is a prompt workflow, not a program. Two artifacts hold it:
`.claude/skills/librarian/SKILL.md` (the periodic pass; it lived at `skills/librarian/SKILL.md` when this document was first written and was re-read at the new location on the `verified_on` date) and, as a worked example of what
the pass emits, `docs/subject-proposal-module-design.md` (one specification,
reviewed and then executed — this subject is its output).

## The four stages, as realized

| stage | where it lives |
| --- | --- |
| sweep for candidates | `.claude/skills/librarian/SKILL.md:39-43` — `librarian-scan.mjs --json` emits per-subject counts, missing `use_when`, oldest `verified_on`, dry streak, and an attention score *with its reasons* |
| ground both ends | `SKILL.md:46-48`, `52-55` — verify the instrument, confirm one figure by opening one file, and stop if a gate is red |
| elicit the target | `SKILL.md:67-81` — "the three judgments a script cannot", applied on top of the scan's ordering |
| emit a specification | `SKILL.md:83-98` — scoped dispatch briefs; `docs/subject-proposal-module-design.md` is one such spec in full |

## Stage 0 is explicit here, and it is the strongest confirmation

The technique's rule that a pass finding nothing and a pass that could not run
must be spelled differently is not an abstraction in this tree — it is a scar.
`SKILL.md:45-48` records the incident verbatim: *"This registry once reported a
content gap at 0/267 over a corpus that was at 267/267, because a counter read a
different shape than the parser emitted."* The corrective is written as a
standing rule (`SKILL.md:37`, heading: "Never count anything yourself") plus a
per-run check: spot-check one number against one real file, every run.

Note the ordering discipline at `SKILL.md:52-54`: `check-bundles`, then
`build-index`, then `build-catalog` — *that order, because the catalog hash
covers the index* — and then the scan. A ranking computed over a corpus that
does not parse is a ranking of a proxy.

The companion rule is at `SKILL.md:141-142`: *"Dry is a result. A sweep that
finds nothing worth dispatching is a finding. Write it in the run note and stop.
Do not pad a worklist to look productive."* And at `SKILL.md:139-140`,
"Unknown is not zero" — an unswept subject is not a healthy one.

## Stage 2's grounding rule, in the form this tree taught

`SKILL.md:57-59` states it as a memory rule rather than an evidence rule:
*"Read the scan fresh. **Never carry forward last run's derived numbers** —
deepen learned this the expensive way, and the vault stores what was DONE, never
what was computed."*

That formulation is sharper than the general one and was folded upward into the
technique. The vault (`SKILL.md:110-121`) is built to enforce it: the persisted
notes hold last-touched dates, dry streaks, open leads and declines — facts
about what happened — and no scores. Everything numeric is re-derived per run.

## Stage 3: which judgments were withheld from the script

`SKILL.md:67-81` enumerates them, and each one is a case where the sweep has all
the data and still cannot decide:

- **Demand outranks structure** — with the discipline that when demand is
  unknown, it is reported as unknown rather than ranked as zero (`:70-72`).
- **Suppress the saturated** — a subject with a dry streak and no expired clock
  is not re-run, which is what stops the loop working settled ground (`:73-75`).
- **Systemic beats individual** — *"When one defect dominates the worklist
  across dozens of subjects, the fix is one systematic pass, not forty
  dispatches. Notice this before you dispatch, not after"* (`:76-78`). This was
  the second upward lesson; the technique now carries it at stage 3.
- **A due lead is cheaper than a fresh scan** (`:79-81`) — banked findings from
  earlier passes, each with a return condition, read before ranking.

## Stage 4: the spec, and what it contains

`docs/subject-proposal-module-design.md` is a specification emitted by an
earlier pass and executed later by a different actor. It carries, in order, the
elements the technique requires of one:

- **Grounded current shape, quoted, at both ends** (`:12-36`): the gap measured
  two ways — a slug match across the bundle, and a corpus-wide grep for the
  vocabulary — plus a four-row table of the adjacent subjects with what each
  *does* and *does not* own. That table is stage 2's output, and it is what
  makes the proposal arguable rather than a preference.
- **Target shape** (`:52-129`): five candidate techniques, each with the
  decision rule it must carry.
- **Scope control** (`:142-151`): an explicit list of what the change must *not*
  absorb — four boundaries, each naming the subject that already owns it.
- **The stop condition and the open decisions** (`:153-165`): three questions
  the spec deliberately does not answer, marked as *"open questions for the
  forger"* — decisions handed forward with their context rather than guessed.
- **Provenance and its ceiling** (`:167-183`): the source that raised the
  proposal is named as *one practitioner's application*, explicitly not the
  standard.

The corresponding execution contract is `docs/forge-brief.md:13-24`, which
states the two-phase order the spec's executor follows, and `:102-120`, the
hard rules the output is gated against. Spec and execution contract are separate
documents on purpose: one says what to build, the other says what "correct"
means, and merging them is what produces a review that answers neither.

## Cadence, and the honest gap

`.claude/skills/librarian/SKILL.md:146-152` is titled "Scheduling (not yet built)". The
pass is periodic in intent and manual in fact: *"Run manually; a scheduler is a
later wrapper"* (frontmatter, `:3`). The technique's cadence rule is therefore
**not** demonstrated here — this realization has the loop and does not yet have
the clock. What it has instead is a written statement of what the wrapper must
preserve when it arrives (`:148-152`), which is the second-best thing.

## Where this realization falls short of the standard

Recorded as gaps, with the standard unchanged:

1. **Grounding is sampled, not per-candidate.** `SKILL.md:47` requires one
   spot-check per run, not both ends of every candidate. That is a proportionate
   trade for a mechanical scan over a uniform corpus; it would be an unsafe one
   over a code tree, where the relation between two places *is* the finding and
   cannot be sampled.
2. **Most dispatches are briefs, not full specs.** Only the largest items get a
   document like the proposal cited above; routine work is dispatched as a
   scoped instruction (`SKILL.md:90-98`). The technique's rule — emit a spec
   because the change is reviewable only as a whole — applies to changes that
   are large enough to be unreviewable, and the tiering here is consistent with
   that, but the threshold is implicit rather than stated.
3. **No cadence.** As above.

## What transplanted, and what did not

Everything in stages 1-4 transplanted to a non-code corpus unchanged. Two things
did not, and both are worth naming: **characterization tests** have no analogue
here (there is no behaviour to pin, only a gate that checks structure —
`check-bundles.mjs`), and the **substitution test for scope** is weaker, because
a knowledge change has no diff-level "does the task still fail" question. Their
absence is a property of the substrate, not evidence against the rules.
