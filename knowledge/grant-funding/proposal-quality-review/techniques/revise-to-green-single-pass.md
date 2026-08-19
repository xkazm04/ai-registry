---
layer: technique
type: technique
subject: proposal-quality-review
technique: revise-to-green-single-pass
status: forged
laws: [never-fabricate-a-figure]
shared_with: []
use_when: [a generated draft fails its quality gates, deciding how much self-repair a drafting pipeline should attempt, multiple generation routes need the same repair behavior]
---

# Revise to green, single pass

When a freshly generated section fails review, the pipeline gets exactly one
chance to repair it before a human sees it. The technique is a bounded
self-revision loop with a contract strict enough to state in four clauses:

1. **Fire on critical only.** A draft with quality flags but no critical
   failures ships as-is — quality findings are the writer's to weigh, and
   spending a model call to chase them buys latency, cost, and the risk of
   the revision breaking something that was fine.
2. **One extra call, ever.** Revise once; re-critique if you like, but never
   revise again in the same generation. If the revision still fails, that is
   a signal about the generator or the gate — surface it, don't grind it.
3. **Prompt with the exact failures, and only the failures.** The revision
   prompt is the original generation prompt — grounding, guidance, all of
   it — plus an appended block listing each failed check's label and
   measured detail ("word count 812, band 300–750"; "matched: 'Certainly,'"),
   plus the instruction: fix only what failed, keep everything that was
   good, output only the revised section text.
4. **Fail open to the original.** If the revision call throws, times out, or
   returns empty, keep the first draft. A worse-but-present draft the review
   has honestly flagged beats a blank; the failures remain visible to the
   writer either way.

## Why one pass is the right number

Zero passes wastes the cheapest quality lever available: most critical
failures on generated prose — meta-narration, a leading heading, a missing
required block — are trivially fixable by a model that is *told what it did
wrong*, and a single targeted revision converts the majority of them.

Unbounded passes are worse than they look. The marginal conversion rate
collapses after the first attempt: a draft that failed the same gate twice
is usually failing for a structural reason — grounding that genuinely
contains no usable figure (where inventing one to satisfy a quantification
gate would violate
[never fabricate a figure](../../_laws.md#never-fabricate-a-figure)), or a
rubric bug. Iterating hides that signal inside a retry loop, multiplies cost
and latency on precisely the requests that were already slowest, and — the
subtle one — each round-trip is another chance for the model to drift from
the grounding while chasing a mechanical check.

The single pass is also the honest basis of a product claim: "every draft is
self-checked against the rubric and repaired once" is verifiable and
defensible — the stated reason a reviewed draft is worth more than a raw
model dump. "We iterate until it's perfect" is neither.

## One loop, many call sites

Every generation route — full multi-section drafts, single-section panels,
post-award report sections — must run *this same loop with this same
contract*. The observed drift pattern when they don't: the flagship route
gets the loop, and the smaller routes ship a single ungraded call, so the
product's quality guarantee silently applies to some of its output. The cure
is structural: implement the loop once, parameterized by callbacks for the
per-site concerns — how to run the model (billing, abort, sanitization), and
what to emit at the "revising" and "replaced" moments so a streaming surface
can show honest progress. The contract clauses live in the shared
implementation where no call site can weaken one.

Keep the loop's pieces pure where possible: building the revision prompt
from a critique is a pure function, unit-testable without a model, and the
fixture for it is every incident where a revision prompt confused the model.

## When not to use it

Do not run the loop on human-written text — an unrequested machine rewrite
of a writer's own words is a trust violation; for human text the review
reports and the writer revises. Do not use it to chase quality-severity
findings even "while we're at it": mixing them into the revision prompt
dilutes the critical fixes and invites gratuitous rewriting. And do not
suppress the critique from the final response after a successful revision —
the writer should see both that checks failed and that the repair passed,
or trust in the green stamp becomes faith.
