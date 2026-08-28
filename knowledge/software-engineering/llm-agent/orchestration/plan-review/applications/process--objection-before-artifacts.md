---
layer: application
type: application
subject: plan-review
technique: objection-before-artifacts
stack: process
status: forged
verified_on: 2026-08-28
---

# Process — risks written by the proposer, and a director review that is the technique's positive half

Two realizations in this registry sit on opposite sides of
[objection-before-artifacts](../techniques/objection-before-artifacts.md), and reading
them together is what makes either instructive. Both are prompt pipelines, so
`verified_against` is omitted per the profile.

## The negative half: `architect`'s self-declared risks

`skills/architect/SKILL.md` presents each finding to a person with a `Risks:` block
(SKILL.md:410-413):

```
    Risks:
      - {risk 1, with mitigation}
      - {risk 2}
      - {risk 3}
```

Three risks, produced by the same pass that produced the proposed shape, with the
mitigation attached to each. Every admissibility property the technique requires is
absent, and each absence is visible in the template rather than inferred:

- **No separate reader.** This is rung one of the challenge ladder — a self-review with
  no boundary at all. The pass that argues for the change also states what is wrong with
  it, and states the answer in the same breath.
- **A count, not a floor with a cap.** Three slots invite three risks. A finding with one
  genuine risk pads to three; a finding with six lists three. The reserved way to say
  *this was examined and nothing material was found* does not exist, so an empty block
  and an unexamined finding render identically.
- **No anchor requirement.** Nothing binds a risk to a quotable span of the proposal.
- **No category set**, so the aggregate cannot be read: there is no way to ask whether
  premise-level concerns are being raised at all, or only design ones.
- **No disposition and therefore no gate.** The risks are prose inside a finding whose
  single verdict is the triage letter. Nothing in the pipeline is `pending` on them, so
  advancing past an unaddressed risk is not a bypass — it is the only available path.

The structural fact underneath all five: this pipeline's risk channel is **decorative by
construction**, not by neglect. It carries no state, so nothing can block on it, so
nothing reads it twice.

The timing, at least, is right and worth crediting. The risks appear at plan time, before
any artifact exists, at exactly the point the technique argues for. What the realization
shows is that timing alone buys nothing: a premise-level objection raised while it is
still cheap, by the party whose premise it is, with no way to be dispositioned, is
indistinguishable in effect from no objection.

## The positive half: worker briefs told to override, and a director who reads the diff

The forge and deepen directors in `.claude/skills/forge/` and `.claude/skills/deepen/`
run the other pattern. A subject worker receives a dispatch spec and a brief, and both
carry an instruction of a shape the technique would recognize —
`docs/subject-proposal-plan-review.md` states it in the header: *"Override this brief
where the tree argues otherwise, and say so in the report"*, defended immediately by
*"Both workers dispatched on 2026-08-22 overrode their briefs, both were right, and both
explained why. A brief that reads as non-negotiable buys compliance with a mistake."*

That is a chartered licence to disagree, issued before authorship, to a reader that is
not the author of the spec. And it lands somewhere the gated party cannot reach: workers
*"never touch shared files; never commit"*, and **"The Director reviews actual diffs,
never worker self-reports"** — *"purity grep over upper layers, a read of every new
technique, corrections checked against the file's prior voice"*
(`.claude/skills/deepen/SKILL.md:68-70`), with the forge director's version of the same
rule at `.claude/skills/forge/SKILL.md:101`: *"Never trust the forgers' green reports
alone."* That sentence is the gate reading its target rather than a claim about the
target, which is the property the technique's hard gate depends on. Read against the
technique, three of its properties hold and one is conspicuously partial:

- **Read-only reader, human writes the verdict** — holds. The worker cannot commit; the
  director does.
- **Objection raised before artifacts** — holds for the spec, which is challenged before
  the subject is written.
- **Rationale mandatory** — holds. "Say so in the report" is the rule, and the report is
  structured around the overrides.
- **The hard gate** — partial. Nothing in the pipeline is `pending` on an override; the
  director notices it by reading a report. An override that the worker declines to
  mention is invisible, and the only instrument against that is the diff review.

The last point is the honest one. This is a review that works because one person reads
every diff, which is the same property that makes it unmeasurable and unscalable — and
the registry's own capacity technique already says what that costs at the one-person
floor.

## What these realizations cannot do

Neither pipeline can produce the technique's cross-mode signal. That signal — change-time
objection counts rising means the plan-time charter is too loose — needs both modes
emitting into a persisted record with a category on each item, and neither realization
persists an objection at all. `architect`'s risks live in a scan note as prose; the
forge's overrides live in a worker report that is read once and superseded by the commit.

So the diagnosis the technique offers most cheaply is exactly the one that cannot be run
here, and no amount of care in either pipeline changes that. It is a storage gap, not a
discipline gap, and the smallest thing that would close it is the one thing neither
pipeline has: an objection with an identity that survives from the plan stage to the
change stage.
