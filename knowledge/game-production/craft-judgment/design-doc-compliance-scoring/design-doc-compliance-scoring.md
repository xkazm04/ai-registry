---
layer: golden-path
type: golden-path
subject: design-doc-compliance-scoring
status: forged
use_when: [scoring a design document against what was built, building a compliance or readiness metric, a dashboard number nobody trusts, reconciling a checklist with a code scan]
techniques:
  - declared-mapping-is-terminal
  - coverage-vs-conformance-split
  - no-neutral-constant-for-unmeasured
  - severity-weighted-scale-free-damping
  - evidence-age-envelope
  - bidirectional-gap-detection
---

# Design-document compliance scoring

A design document is a claim about a thing that does not exist yet. Compliance scoring is
the act of turning that claim into a proposition that can be checked against the thing that
now does exist — and reporting the result without inventing any of the parts nobody looked
at. It is the narrowest and most reusable discipline in production measurement, because
every organisation eventually builds one of these numbers and almost every one of them lies.

The naive reading is a percentage: walk the design, count what is done, divide. That number
is not merely imprecise, it is **worse than having no number at all**, because it is
actionable. Nobody schedules work off "unknown". Everybody schedules work off 72%. A
composite that mixes measurement with assumption converts ignorance into a decision, and the
decision is confidently wrong in a direction nobody can see from the number.

This subject is about scoring a **document against an implementation**. The adjacent
discipline of scoring a *project's* production state — readiness ladders, craft ladders,
what fraction of the content pipeline is standing up — is a separate concern with a
different unit of account; the seam is that this one always has a written design item as its
left-hand side, and cannot produce a finding about anything the document never claimed.
What to do about the gaps once found (sequencing, effort, ownership) is likewise a separate
concern. So is whether a quality verdict is still bound to the artifact it judged.

## The three quantities the single number was hiding

A conformance percentage that walks a design surface is silently a function of three
independent things, and it collapses them:

| Quantity | Basis (denominator) | Says |
| --- | --- | --- |
| **Mapping coverage** | declared design items | how much of the document the check can even *see* |
| **Evidence coverage** | items in scope | how much of what it sees has a verdict at all |
| **Conformance** | items with a verdict | of what was judged, how much matched |

These have different units and different owners. Mapping coverage is fixed by writing down
relations. Evidence coverage is fixed by running scans and reviews. Conformance is fixed by
writing code. Reporting one number that moves when any of the three moves means the reader
cannot tell which lever to pull, and — worse — a *fall* in one can be masked by a *rise* in
another. Split them at the type level, not at the presentation level: a report object that
carries only conformance has already destroyed the information, and no amount of careful
rendering downstream can recover it.

The rule: **conformance is never reported alone.** It travels with its evidence — how many
items were in scope, how many were measured, how old the measurements are. A conformance
figure detached from its basis is a number without a unit, and a number without a unit is
not information.

## The neutral constant is the disease

The characteristic failure has a shape you can recognise anywhere. Some part of the surface
has no measurement. The scoring function needs *a number* for it, so it supplies one that
feels fair: a mid-range default for the unscanned, a bonus for having no checklist to fail,
a bonus for having no detected gaps. Each of these is defensible in isolation. Together they
manufacture a score for a thing nobody has ever evaluated.

Measured on a real surface: a set of modules with no evidence whatsoever rendered exactly
70 out of 100, indistinguishable from a module that had been fully scanned and scored 70,
while a comparable set whose every row was explicitly *unknown* rendered 10 — **the same
epistemic state, a sixty-point spread, in opposite directions.** That is the whole argument
against imputation in one measurement. The unmeasured did not merely get a wrong number; it
got two contradictory wrong numbers depending on which code path produced its emptiness.

The fix is structural, not arithmetic. An unmeasured thing does not carry a low number, a
neutral number, or an averaged number. It carries a *flag*: measured or not. Make the
neutral constant unrepresentable in the type and it cannot be reintroduced by the next
person under deadline. Absence propagates upward as absence — silence must never surface as
green.

There is one corollary people miss: this applies to *statuses* as well as scores. If your
status taxonomy has a member meaning "nobody looked", that member must be excluded from the
conformance denominator entirely. Counting it as failure is as wrong as counting it as
success — it manufactures a conformance figure out of a coverage fact.

## A verdict is only as strong as the path that wrote it

Two rows can both say "implemented" and mean entirely different things: one because a
reviewer read the code and judged it, one because a static definition was inserted with no
verdict at all, one because the process that performed the change asserted its own success.
That last is a self-report, and a self-report is an input to a verdict, never a verdict.

So each verdict carries the provenance of the write path that set it, ranked: a judgment
made by an independent reviewer; an observation made against real state by a narrow rule; a
self-report from the actor that made the change; a seeded placeholder with no verdict; and
finally *unknown*, for records written before provenance was tracked — which say so honestly
rather than being back-dated into a source nobody observed. **A status without its
provenance is half a fact.** A compliance report that cannot say which rung its evidence
came from cannot defend any of its numbers, and back-filling provenance by assumption
repeats the neutral-constant error one layer down.

## Three clocks, and only one of them is on the wall

A compliance surface has three independent time axes, and dashboards conflate them
constantly. *When the arithmetic ran* is the least interesting and the most prominently
displayed — "last audit: just now", computed over evidence of any age. *When the evidence
was produced* is what freshness actually means. *How much evidence there is* is coverage,
which is not a time axis at all but gets read as one when a stale surface is re-summed and
the totals move.

Report the first only as a provenance stamp, never as freshness. Derive freshness from the
evidence timestamps of the **measured rows only** — the age of a row nobody gave a verdict
to says nothing about the age of the score. And where evidence carries no timestamp at all,
its age is *unknown*, which is never "fresh by default".

## Gaps have a direction, and there are three of them

A design item with no implementation and an implementation with no design item are both
findings, they have opposite remedies, and they are owned by different people. Reporting
only the first is exactly how a design document quietly becomes fiction: the code grows,
nothing in the report ever says the document has fallen behind, and eventually the document
describes a product that no longer exists.

The third direction is the honest one and it is routinely folded away: **neither side is
ahead, because nothing was ever evaluated.** Filing that as a design-ahead gap claims the
code is behind, which nobody knows. It is an evidence gap, and it belongs in its own
direction with its own remedy — go and look.

Direction also governs severity. A code-ahead finding on a completed item is usually
bookkeeping; a design-ahead finding on a critical item is work. Severity that ignores
direction produces a triage list where "tick this box" outranks "this subsystem does not
exist".

## Penalties are curves, and curves have properties

Once you have gaps, the temptation is to subtract points. Almost every hand-rolled penalty
is a capped linear term — subtract a couple of points per gap, cap the total. That form
fails in three ways at once: past the cap every additional defect is free, severity is
ignored, and the raw count makes a large area look worse than a small one for the same
defect *rate*, which teaches teams to split their areas rather than fix anything.

Do not reach for a formula. State the properties the curve must have, and derive:

- **Strictly decreasing** — every additional gap costs something, forever. No cap.
- **Scale-free** — driven by gap *density* against the measured surface, not by count.
- **Asymptotic, never reaching zero** — a score of exactly zero asserts certainty of total
  failure, and counting gaps cannot support that claim.
- **Severity-weighted** — a critical gap and a bookkeeping note are not one unit each.

And one exclusion rule that is easy to miss: a gap category already priced by the
conformance arithmetic must not also enter the penalty. If a not-implemented item already
scores zero credit and a partial one already scores half, adding them to the gap load
punishes them twice, and the second punishment is invisible in the number.

## The mapping is the foundation, and it is usually missing

Everything above presumes you can say which implementation evidences which design item. In
practice most teams infer that relation by fuzzy string similarity between a checklist label
and a symbol name, and then report the result as though the relation were known. On one real
surface, the substring guess related only 88 of 216 design items to anything at all — so
the entire cross-check was dark over 59% of the document, and the report said nothing about
that. The report's own visibility is a number, and it must be published.

A declared relation is terminal: where the mapping is written down, no heuristic may
override, extend or second-guess it. A guess may still stand in — but it is labelled as a
guess everywhere it appears, and the item is listed as unmapped, so a fallback hit is never
presented as a declared mapping.

## What the discipline gives back

Done properly, the output is not a prettier score. It is a report where every number can
answer three questions — what is the basis, how much of the basis was measured, and how old
the measurement is — and where the parts nobody looked at are the loudest thing on the page
rather than the quietest. That inversion is the entire value. A gap that is visible is
survivable. A gap that has been averaged into a plausible number is not.
