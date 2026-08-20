---
layer: golden-path
type: golden-path
subject: proposal-quality-review
status: forged
use_when: [grading a generated or human-written proposal section before filing, designing quality gates for a drafting pipeline, deciding what blocks submission vs what merely warns, adding a paid human review tier to an automated product]
techniques:
  - critical-vs-quality-severity
  - section-word-band-checks
  - placeholder-and-jargon-detection
  - rubric-mirrors-prompt-guidance
  - revise-to-green-single-pass
  - expert-review-tier-operation
---

# Proposal quality review

A seasoned grant editor reading a draft before filing runs two very different
processes at once. The first is mechanical: is every required section present,
is anything still a placeholder, is the budget section actually about money,
does the narrative fit the length the funder will tolerate, did the writer
leave the scaffolding of the writing process visible in the product. The
second is judgment: does this argument land, does the theory of change hold,
would this reviewer panel believe this organization. The subject of proposal
quality review is the discipline of splitting those two processes apart, doing
the first one deterministically and exhaustively, and being honest that the
second one cannot be automated — only staffed.

The split matters because the mechanical process, done by hand, is where human
reviewers waste their attention and miss things anyway. A checklist a machine
can run — word counts, placeholder patterns, required-concept presence,
formatting artifacts — should never consume an expert's reading time, and a
machine runs it identically on the ten-thousandth draft. Conversely, the
judgment process, faked by a machine, is where automated products quietly lie:
a model asked "is this proposal good?" produces confident prose about quality
it cannot actually assess. The principal practitioner automates only what can
be asserted, and routes everything else to either the writer or a human
expert — with the boundary drawn explicitly, not blurred by an enthusiastic
score.

## The review is a battery of pure assertions

The deterministic tier is a library of **gates**: small, pure predicates over
a section's text, each with an identity, a label a writer can act on, and a
severity. Purity is load-bearing. A gate that takes text in and returns
pass/fail with a detail string is unit-testable, runs inline at zero marginal
cost, produces the same verdict on the same draft forever, and can serve two
masters at once — the interactive product grading a draft the moment it is
generated, and an offline regression harness grading the drafting pipeline
itself against a fixed corpus. One gate library, two consumers, is the
architecture; two divergent copies is the failure mode, because the corpus the
pipeline is certified against silently stops being the corpus the product
enforces.

The gates fall into recognizable families:

- **Existence and shape** — non-empty, actually prose rather than a refusal
  or an echo, no formatting the funder's portal will mangle (a pipe-drawn
  table pasted into a plain-text field is garbage on arrival).
- **Process residue** — the draft must not narrate its own production. An
  opening like "Certainly, here is your narrative…" or a section that begins
  by labeling itself with a heading is the writing process leaking into the
  product, and it is the single most recognizable tell of an unedited
  machine draft.
- **Length** — per-section word bands derived from what each funder family
  actually reads ([section-word-band-checks](./techniques/section-word-band-checks.md)).
- **Unfinished work** — placeholders, fill-in slots, and the vague filler
  vocabulary that experienced program officers read as padding
  ([placeholder-and-jargon-detection](./techniques/placeholder-and-jargon-detection.md)).
- **Required substance** — a budget section that names no currency, a needs
  section with no figure, a logic model missing one of its four blocks, an
  evaluation section that never mentions measurement. These are cheap
  keyword-presence checks, and they are shallow on purpose: they assert that
  the section *engages* its required concepts, not that it argues them well.
- **Grounding** — statistics asserted as fact that appear nowhere in the
  verified source material the draft was built from. This family exists
  because of the domain's cardinal risk: a fabricated figure in a funding
  application ([never-fabricate-a-figure](../../_laws.md#never-fabricate-a-figure)).

Every gate carries one of two severities, and the distinction is the load
bearing wall of the whole subject
([critical-vs-quality-severity](./techniques/critical-vs-quality-severity.md)):
**critical** failures are contract violations that make the draft unsafe to
ship as-is; **quality** failures are guidance drift — shippable, worth
tightening, never blocking. Collapse the two and the review either blocks on
style (writers learn to ignore it) or ships fabrications (the product becomes
a liability).

## The rubric is the prompt, reflected

When the draft under review was machine-generated, the review must grade
against the same instructions the generator received — same target lengths,
same banned vocabulary, same required concepts, per section, per funder
family ([rubric-mirrors-prompt-guidance](./techniques/rubric-mirrors-prompt-guidance.md)).
A critic with its own independent standard produces two failure modes at
once: drafts that follow their instructions and fail review anyway, and
drafts that ignore their instructions and pass. The funder family's own
scoring dimensions set both the generation guidance and the review rubric —
[the funder sets the form](../../_laws.md#the-funder-sets-the-form) — so a
federal needs section is gated on evidence figures, an arts section on naming
the actual work rather than adjectives, an organizing section on theory of
change and base. One generic rubric misfits all of them.

## Failure feeds back once, precisely

A review that only reports is half a product. When a generated draft fails a
critical gate, the pipeline sends it back — but under a strict contract
([revise-to-green-single-pass](./techniques/revise-to-green-single-pass.md)):
one revision call, prompted with the exact failed checks and nothing else,
instructed to fix only what failed and keep what was good; and if the
revision itself fails or comes back empty, the original draft survives. The
loop is deliberately not iterative. A bounded self-check against a
program-officer-shaped rubric is the honest, defensible claim an automated
drafting product can make — "every draft is checked and repaired against the
rubric before you see it" — and it is precisely the claim that separates a
reviewed draft from a raw model dump. An unbounded loop, by contrast, is a
cost and latency hazard chasing gates the model may be structurally unable to
satisfy.

## Clean is a bounded claim, and the reviewer of record is human

Two honesty rules govern what the review is allowed to say about itself.

First: a report with zero findings certifies nothing unless every applicable
check actually ran —
[clean is not ready unless every check ran](../../_laws.md#clean-is-not-ready).
Checks that depend on optional inputs (parsed funder requirements, an
organization's declared mission vocabulary) silently skip when those inputs
are absent, and a skipped check must be *named* in the verdict, not folded
into a green stamp. "No issues found" and "not checked" must be impossible to
confuse; a product that confuses them is selling certainty it does not have.

Second: passing every automated gate bounds the *shape* of the draft, never
its persuasive quality. The tier above the machinery is a human expert review
([expert-review-tier-operation](./techniques/expert-review-tier-operation.md)),
and it is an operations problem as much as an editorial one: a paid queue
with claim and completion semantics, one active review per draft, refunds
only while the expert's time is still uncommitted — and the whole tier
dormant, invisible, and unbilled whenever no qualified reviewer is actually
staffed. Selling a human service you cannot staff is the operational twin of
the green stamp that didn't run its checks.

## Failure modes of the naive reading

- **The single quality score.** One 0–100 number blends fabrication risk with
  word-count drift; writers can neither trust it nor act on it. Severity
  split plus named gates, always.
- **The independent critic.** A review standard maintained apart from the
  generation guidance drifts, and every drift manufactures either false
  failures or false passes.
- **The optimistic clean stamp.** Coverage not reported; absent inputs read
  as passing checks.
- **The infinite repair loop.** Retrying until green burns budget on gates
  the draft may never satisfy, and hides systematic generation defects that
  a single honest failure would have surfaced.
- **The blocked stylist.** Style findings promoted to blockers; the writer
  learns the review cries wolf and starts overriding it — including the one
  time it was right.
- **The phantom expert tier.** A human-review button that charges before
  confirming a human exists to do the work.
