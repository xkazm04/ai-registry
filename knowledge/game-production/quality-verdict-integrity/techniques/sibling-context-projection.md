---
layer: technique
type: technique
subject: quality-verdict-integrity
technique: sibling-context-projection
status: forged
laws: [one-authority-per-quantity, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [a grader reports cross-references as invented, grading one part of a multi-part artifact, deciding what context may accompany a judged payload]
---

# Sibling-context projection

Give the grader a compact, bounded, clearly demarcated view of the artifact's
peers, so it can tell a correct cross-reference from an invented one and catch a
genuine contradiction — without letting that context become part of the graded
object and without letting it excuse weak work.

## The problem it solves

A grader shown one part of a multi-part artifact in isolation has two blind
spots that point in opposite directions. It flags values that are correct
*because a sibling defines them* as invented or inconsistent — false positives,
and false positives are the most corrosive failure a quality layer has, because a
reviewer who overturns three verdicts stops reading the fourth. And it cannot
catch a real cross-part contradiction at all, because it has never seen both
sides. Adding sibling context fixes both blind spots with one input.

## Contamination versus context

The distinction that makes this safe:

- **The pipeline's own bookkeeping is contamination.** The instruction that
  generated the artifact, the plan, the retry log, the producer's self-reported
  success. It goes nowhere near the grader. It tells the grader what the thing
  was *meant* to be, and a grader shown the intent grades the intent.
- **The artifact's peers are context.** The sibling parts, in the shape a
  consumer would see them. They go in, in a labelled block, explicitly framed as
  reference material and never as part of the object under grade.

The measured difference in effect size between these two is the argument. Where
contamination inflated scores by nearly seventeen points on a hundred-point
scale, correctly supplied blind siblings moved them about four — against a
control noise floor of roughly half a point with a standard deviation near
three. Contamination replaces the grader's judgment; context removes a spurious
penalty. Numbers that far apart are not two versions of the same thing.

## Project structurally, and bound the projection

1. **Exclude the part under grade.** Its own content is the payload, not
   context.
2. **Lead with the high-signal cross-reference surface.** Whatever fields
   actually carry inter-part references — links, shared identifiers, derived
   values — are projected first and in full, ahead of everything else.
3. **Then top-level scalars**, and short scalar arrays.
4. **Then remaining nested structures, each individually capped**, so one fat
   sibling cannot consume the whole allowance before truncation reaches the
   others.
5. **Cap per sibling and in total**, and when the total is hit, say how many
   siblings were omitted rather than silently stopping. A budget shapes this
   output as it shapes any other: an unbounded projection floods the grader with
   tens of thousands of characters and buries the signal it was added to supply.
6. **Order deterministically.** Same inputs, same block — otherwise re-grades of
   unchanged content vary for no reason and the noise floor rises.

**Include nested structures by default.** The defect worth naming: a projection
that emitted only top-level scalars produced an *empty* context for every part
whose real content sat nested one level down — in one corpus, 314 of 816 parts, a
silent 38%, with no error anywhere. The feature was believed to be on for a year
of grading while more than a third of the corpus never received it.

So: **count the non-empty projections and treat a low rate as a harness defect.**
An emptiness rate is the only instrumentation that catches this class of bug,
because every individual component behaves correctly.

## Framing: redirect scrutiny, never lower the bar

When project rules or design constraints are injected alongside the sibling
context, the framing text has to do three things, and dropping any one of them
breaks it:

- **Name what is deliberate.** Content that correctly follows a binding
  constraint is not a defect; the grader must not dock it for the constraint's
  consequences, nor demand a different taxonomy, a bigger number or a larger
  scale than the constraint specifies.
- **Refuse to lower the bar.** Within those constraints, craft, coherence,
  specificity and completeness are judged exactly as rigorously — the rules
  explain the design's boundaries, they never excuse weak execution inside them.
  This is [grade against what ships](../../_laws.md#grade-against-what-ships-not-on-a-curve)
  surviving contact with context.
- **Make violation a defect.** A value that breaks a stated rule, or contradicts
  the sibling context, is itself a finding to call out and score down. Context
  that can only lower scrutiny is a loophole; context that can raise it is an
  instrument.

## Decision rules

- **When the grader reports invented references, add context before touching the
  criteria.** Loosening a criterion to stop false positives destroys the
  criterion; supplying the missing evidence fixes the cause.
- **When context is added or its projection changes, bump the standard's
  version.** The input changed; the instrument changed.
- **When a value appears in two parts, one of them owns it.** Context lets the
  grader *detect* the contradiction; it does not resolve which side is right.
  Single-source the value —
  [one authority per quantity](../../_laws.md#one-authority-per-quantity) — and
  treat a sibling contradiction as a defect in its own right.
- **When the projection is empty for a part, do not grade silently.** Record the
  emptiness with the verdict, so a later reader knows this one was graded blind.

## When not to use this

- **When the artifact is genuinely standalone**, siblings are noise and cost
  budget that would be better spent on the artifact itself.
- **When the siblings are themselves ungraded or known-bad**, context propagates
  their errors into the verdict as apparent consistency. Prefer no context to
  context from a part that is currently condemned.
- **When the grader is being asked a purely perceptual question** — does this
  look right — textual sibling context adds little and dilutes the payload.
  Reserve the budget for the thing being looked at.
