---
layer: technique
type: technique
subject: proposal-quality-review
technique: critical-vs-quality-severity
status: forged
laws: [never-fabricate-a-figure, hard-gates-precede-soft-scores]
shared_with: []
use_when: [designing a gate library for draft review, deciding whether a new check should block, defining what "green" means for a reviewed draft]
---

# Critical vs quality severity

Every deterministic check in a proposal review carries exactly one of two
severities, assigned when the gate is written, never at run time:

- **Critical** — a contract or correctness violation. The draft is unsafe to
  ship as-is: it asserts an unverified statistic as fact, it narrates its own
  production ("Certainly, here is your narrative…"), it opens with a heading
  the funder's form will duplicate, it is empty or is a refusal rather than
  prose, it is missing a structurally required block, it is in the wrong
  language, or it leaked content that untrusted input tried to inject.
- **Quality** — guidance drift. The draft is shippable but worth tightening:
  it runs long or short of the section's band, it uses banned filler
  vocabulary, it still carries fill-in placeholders the writer must resolve,
  it lacks the quantification or currency figures its section type calls for,
  it drew a table where prose was asked for.

The severity is a property of the *gate*, not of the finding's size. A single
ungrounded percentage is critical; forty style squiggles are quality.

## The definition of green

The aggregate verdict is computed from severities, and the computation is the
technique's sharpest rule: **green means zero critical failures — quality
flags may remain.** Green is the signal that drives automation (a
self-revision pass fires on critical failures only; a submission gate blocks
on critical failures only), while quality findings drive the writer's
attention. This is the same shape as
[hard gates preceding soft scores](../../_laws.md#hard-gates-precede-soft-scores)
one level down: deterministic blockers are decided first and absolutely, and
no amount of stylistic polish may override them — nor may a pile of
stylistic findings block a draft that is substantively safe.

Report both numbers always: passed/total for the full battery, and the
critical-failure count separately. A writer shown "9 of 11 passed" cannot
act; shown "green, 2 quality flags: runs long (812 words, band 300–750);
uses 'leverage'", they can.

## Decision rules for assigning severity

When adding a gate, classify by consequence, not by confidence in the check:

- **Would a program officer stop reading, or would filing this create a
  falsifiable claim?** Critical. Fabricated figures are the canonical case —
  [never fabricate a figure](../../_laws.md#never-fabricate-a-figure) makes
  the grounding gate critical by law, not by taste.
- **Is it machine-draft residue that instantly identifies the text as
  unedited output?** Critical. Meta-narration and leading self-labels are
  contract violations of the "output only the section text" instruction, and
  they survive into filed applications with reputational cost.
- **Is it a matter of degree — length, tone, density of figures?** Quality.
  Degrees have tolerances; tolerances warn.
- **Is it honest scaffolding?** Quality, with care. A bracketed fill-in slot
  is the *anti-fabrication* form — the draft refused to invent a number — so
  it must not be treated like a defect of the generator. It is a quality
  flag at review time and a hard blocker only at the final submission gate,
  where an unresolved slot genuinely cannot be filed.
- **When genuinely torn, choose quality.** A wrongly-critical gate teaches
  writers to distrust and override the review; a wrongly-quality gate costs
  one missed tightening. The failure costs are asymmetric.

## When not to use it

Do not add a third severity. The pressure is constant ("major/minor/info",
"error/warning/notice/hint") and every added level blurs the one boundary
that matters: does this block automation or not. If a finding needs finer
routing, encode that in the gate's identity and label, not in a severity
ladder. The only legitimate second axis is *audience* — some findings are
for the writer, some for the pipeline operator — and that is metadata, not
severity.

Do not let a model assign severity at run time. A reasoning model asked to
grade "how serious is this?" produces a different answer per invocation; the
entire value of the deterministic tier is that the same draft gets the same
verdict forever.
