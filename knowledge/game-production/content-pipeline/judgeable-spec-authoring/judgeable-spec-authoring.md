---
layer: golden-path
type: golden-path
subject: judgeable-spec-authoring
status: forged
use_when: [authoring a design spec that an automated grader will score, a corpus of specs has plateaued just below the shippable bar, deciding why competent content is not scoring as shippable, raising a content catalog from drafted to proven, briefing agents to repair specs against grader findings]
techniques:
  - enumeration-closure-as-arithmetic
  - register-discipline-in-a-spec
  - interpolated-counts-over-typed-counts
  - simulate-the-mechanism-not-the-constant
  - one-field-one-question
  - execute-the-rules-against-the-worked-example
  - quantity-ownership-and-the-bindable-row
---

# Judgeable spec authoring

A design spec that will be read by a strict automated reviewer is a different
deliverable from one that will be read by a colleague. The colleague fills gaps from
context, forgives a number that is off in the last digit, and reads a defensive
paragraph as diligence. The reviewer does none of that. It executes the rules against
the examples, recomputes every derivation from the stated inputs, checks every list
that claims to be complete, and reads argument as weakness.

This subject is the authoring craft on the other side of `acceptance-verdict-spine`
and `quality-verdict-integrity`. Those own how a verdict is produced and how it stays
bound to what it judged. This one owns the question the author faces: **given that a
strict grader will read this, what makes it shippable rather than competent?**

The distinction is not academic, because the two failure profiles are different. A
spec corpus authored without this discipline does not fail loudly — it clusters. It
arrives in a narrow band a few points under the bar and stays there, and every
individual artifact looks fine.

## The plateau is the diagnostic

The characteristic signature of an ungoverned spec corpus is not a spread of scores.
It is a **wall**.

In a measured campaign across ten content catalogs — 160 spec artifacts, each scored
as the median of three independent draws by a strict reviewer against a published
rubric with a shippable bar — a full authoring pass moved the corpus average from 73
to 82 and lifted cells at or above the bar from 3 to 21. But of the artifacts still
under the bar afterwards, **70 sat within five points of it and only 4 were more than
twenty points away**. Getting a spec to *nearly* shippable turned out to be routine.
Crossing was a different problem with different causes.

That shape is the useful finding. It means a corpus stuck under the bar is usually not
suffering from weak design work, and throwing more analysis at it is the wrong
prescription. Before the campaign, classifying every finding across 308 sub-bar
artifacts gave a distribution that barely mentions design quality at all:

| share of sub-bar artifacts | defect class |
| --- | --- |
| ~50% | the artifact contradicts **itself** — a field introduced in one block and absent from that same artifact's enumeration of the schema it belongs to |
| ~41% | a number that does not reproduce from the artifact's own stated derivation |
| ~10% each | an accessibility claim asserted rather than computed; a cross-reference that resolves to nothing; an unstated edge case or precedence |

Both dominant classes are **mechanical**. Neither requires taste, domain seniority, or
more research to fix. That is why a text-capable agent can carry a spec corpus to the
bar, and why the work is best organised as an audit against known defect classes
rather than as rewriting.

## The two audits that close half the gap

Everything in the first two rows of that table is caught by two passes that can be run
without reading the grader's findings at all.

**Close every list that claims to be complete, as arithmetic.** Not by adding the
missing name — by writing the closure as a sum that a reader can verify: the record
ships thirteen fields, this step reads eleven and names what each is for, two are owned
by named siblings, and eleven plus two is thirteen. A closure that does not add up is
worse than no closure, so the count must be produced by machine
(`enumeration-closure-as-arithmetic`).

**Recompute every derived number from the artifact's own inputs.** Not spot-checks —
all of them, including the superlatives. In one catalog two claims of the form "the
longest shipped string is X at N characters" had the right count for the wrong string;
both had survived earlier review because the number matched the string named
(`interpolated-counts-over-typed-counts`).

## Register is the ceiling

The finding that separates a plateau at just-under from a pass is not about content at
all. **A spec states; it does not argue.** Prose addressed to a reviewer rather than to
an implementer is scored as a defect, and it is the single most common thing holding a
technically sound artifact under the bar.

This was measured independently four times in one campaign, and it is worth stating the
evidence because it is counter-intuitive enough that authors do not believe it:

- one artifact scored 81 on voice and 92 after a sweep that removed nothing but
  self-narration;
- one sat pinned at 89 across three revisions while its completeness sub-score climbed
  90 → 92 → 94 and specificity reached 95 — tone was the only thing capping it;
- one crossed the bar, 89 → 90, on a pass whose entire content was **76 phrase
  replacements with no fact changed**;
- one moved 81 → 90 on a pass whose main work was deleting argument and spending the
  recovered budget on genuinely missing fields.

The class is wider than it first looks. It covers revision narration ("previously",
"no longer"), justification ("deliberately", "by design", "note that"), conceding or
pre-empting an objection, and meta-commentary about the artifact itself. And it cannot
be swept by hand: in two separate catalogs a careful manual pass was followed by a
mechanical sweep that found **23 and 28 further instances**, in one case a single
argumentative paragraph duplicated across five sibling steps
(`register-discipline-in-a-spec`).

The rewrite rule is not deletion. If a rationale is load-bearing, it is restated as a
design constraint in the artifact's own voice — *the floor applies after the multiply
because an integer grant cannot carry a fractional remainder* — rather than as a note
to whoever is reading.

## Contradiction is usually one field asked two questions

The 50% class has a recurring internal shape worth naming, because the obvious repair
is wrong. When an artifact keeps contradicting itself about a quantity, the reflex is
to pick the correct value and propagate it. That works when it is a stale copy. It
fails — and reintroduces the contradiction a revision later — when the artifact is
actually carrying **two different quantities under one name**.

A packaging spec used one identifier for both *which container ships this* and *is it
resident before the moment that needs it*; three sections then said incompatible
things, and naming the second axis dissolved all three at once and exposed a real
shipping bug underneath. The same shape recurred twice more in the same catalog: a rate
constant versus a clamp constant, a cooked size versus a resident size
(`one-field-one-question`).

The related discipline is ownership. Deleting duplicate statements of a quantity is
cheap; **nominating an owner on a stated principle** — the cost of a climb belongs to
the step holding the gate that creates it, not to the step holding the thresholds — is
what converts a deletion into content, and it is the authoring face of *one authority
per quantity* ([L3](../../_laws.md#one-authority-per-quantity)). Its mirror matters
just as much: a behaviour a downstream consumer must **bind** to needs a real row, even
a zero-delta one, because "it is not a row, the terminal sets the flag directly" is an
omission wearing a principle's clothes (`quantity-ownership-and-the-bindable-row`).

## Do not defend; split by evidentiary status

The instinct when a finding disputes a claim is to prove the claim. This reliably
lowers the score — one author added a paragraph demonstrating that two competing
weightings agreed to 0.03% and watched the number fall, with the reviewer's comment
naming *the artifact defending itself in front of the reader*.

What works is to **split the claim by what is actually established**: state the settled
parts flat as measurements, and label the unsettled part as pending with its model
fixed and a numeric threshold that would settle it. Same honesty, no argument, and the
pending item stays falsifiable and actionable by whoever can close it. Stated as a rule
the campaign kept re-proving: *an artifact that states its limits in one clause scores
above one that argues them in a paragraph, and both score above one that hides them.*

This is the authoring-side reading of *unmeasured is not a pass*
([L1](../../_laws.md#unmeasured-is-not-a-pass)) — the honest floor is a thing you
write down, not a thing you argue around.

## Re-binding beats prose

The largest single score movements in the campaign did not come from writing. They came
from discovering that a spec's blocked verification tier was blocked on a symbol that
**already existed**. Two artifacts were built on events described as unbuilt; reading
the source found a completion delegate and an equipment-changed delegate already
declared, already broadcasting, and already carrying the payload the design needed.
Re-binding converted two not-met verification tiers into met ones and moved the score
further than any amount of prose could have.

The general form: before writing another paragraph justifying why something is
deferred, **check whether the thing is deferred**. This is the same instinct as
*structural proof is necessary and never sufficient*
([L9](../../_laws.md#structural-proof-is-never-sufficient)) pointed
in the opposite direction — the spec is claiming *less* than the code supports, and the
claim is what is costing it.

## Authoring and judging are separate stages

Two operational rules earned by losing work, both about the boundary between producing
content and grading it.

**An author must not hold its own official verdict open.** An agent that authors and
then runs the grading medians will, on any interruption, terminate with content applied
and verdicts unrecorded — leaving a stored verdict that grades content the artifact no
longer holds. That is strictly worse than not grading at all, and it is the exact
failure *a verdict is bound to the content it judged*
([L6](../../_laws.md#a-verdict-is-bound-to-its-content)) exists to
prevent. Authors get cheap in-loop probes; the driver runs the official medians
afterwards, resumably, over the changed set.

**A single draw is not a verdict.** Independent authors measured the same unchanged
artifact scoring 87 then 82, and 80 then 70. Anything under about five points of
single-probe movement is noise, and treating it as signal produces revision spirals
that consume budget and change nothing. Official verdicts are medians.

The corollary authors find most useful: **expect the first probe on freshly rewritten
content to score below the artifact's recorded baseline.** It is judging new text under
fresh scrutiny, not re-judging the old. A cell that walked 75 → 71 → 78 → 86 → 87 → 88
→ 90 is the normal shape, not a warning sign — but budget three or four passes on a
genuinely broken field rather than one.

## The repair introduces the defect it is repairing

The most reliably reproduced hazard in the campaign, hit independently by five of ten
authors: **fixing self-contradiction introduces self-contradiction.** A rewritten
artifact acquires a drifted duplicate of its own summary block, a field ledger that
says "ten" over eleven names, a count sentence left stale by a row added later.

Three defences, in order of value:

1. **Interpolate every count sentence rather than typing it**, so a later edit cannot
   leave a number behind (`interpolated-counts-over-typed-counts`).
2. **Run a cross-artifact coherence checker over the whole entity after every batch**,
   and let it block an apply. A checker that blocks a change you intended is working;
   update the assertion rather than bypassing it.
3. **Spend probes on the largest rewrites, not the smallest.** Small careful edits
   mostly land; large rewrites introduce new defects at a rate worth paying to measure.

## What this cannot fix

Two honest limits, both worth stating before a campaign rather than discovering at the
end.

**A media deliverable is not text.** In the campaign every image-class artifact stayed
far below the bar — scores in the twenties to fifties — while its sibling text
artifacts crossed. Every finding was a property of the rendered image. No authoring
pass moves those, and dispatching a text author at them produces either nothing or a
fabrication.

**Some ceilings are enforced by the checker, not the content.** Two artifacts could not
reach a pass from authoring at all: one because two separate checks keyed on the same
field, so removing a duplicated derived value dropped the row out of passing; another
because the check modelled only one axis of a system, so a deliberate, documented
outlier the canon explicitly permits failed a tolerance test. These look exactly like
content defects from inside the artifact. The diagnostic is that the finding is
unfixable without either weakening a claim or changing the check — and weakening the
claim is the one move that is never allowed. Route them as checker defects and leave
the content honest.
