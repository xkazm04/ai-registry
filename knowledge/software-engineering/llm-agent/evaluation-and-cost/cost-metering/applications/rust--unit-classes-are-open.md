---
layer: application
type: application
subject: cost-metering
technique: unit-classes-are-open
stack: rust
verified_on: 2026-09-04
verified_against: rust@2021
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The defended model axis beside the undefended unit axis

The version this is verified against is the Rust edition the workspace
manifest pins (`edition = "2021"`, workspace `0.0.1`) — a witness in the tree,
not a version a dispatch guessed. The workspace carries no `rust-version`
floor, so the edition is the strongest pin available here.

An LLM-telemetry service in Rust — a multi-backend ingest, price book, rollup
and operator API — carries the strongest treatment of the *unknown model*
problem this corpus has seen in a tree, and nothing at all for the *unknown
unit class*. The two halves sit a few hundred lines apart, and the asymmetry
is what this technique was written from.

## The half that is right, and better than the corpus was

The service holds a **null-cost invariant**: a call it cannot price stores
`cost_usd = NULL`, never a zero. Around it sits an unpriced-traffic ledger —
the `(provider, model)` pairs the price book has never heard of, ranked by
call count so the top row is the price worth adding first, each row carrying
first- and last-seen days so an operator can ask "is this still happening?"
And it carries one fixed note, shared by the CLI, the API and the tool surface
so all three say the same thing: every cost, margin and limit number over the
window is a **floor** until these are priced, closable with a rate write that
optionally back-fills the historical rows.

That is a stronger discipline than [price-tables](../techniques/price-tables.md)
recommends. The technique there says to price an unknown model at a
conservative *declared default* and count the miss. This tree declines to
invent a number at all and propagates a bound instead — and the bound is what
reaches the operator surfaces. The corpus rule was written for a product that
must still show a total; this tree shows the total *and* what it is a floor
of, which is strictly more honest and costs one ledger query the rollup
already implements. `unit-classes-are-open` carries that correction forward:
on the unit axis, prefer the floor to the default.

## The half that is missing, and why it cannot be fixed the same way

The canonical `TokenUsage` is two counters and two declared subsets. Its doc
comment states the convention carefully and correctly — the cached count is
*within* the input count rather than beside it, providers disagree about that
on the wire, and normalizing to the row's convention is each extractor's job;
reasoning is informational because providers count it inside output, where it
is billed. `total()` is `input + output`, which is exhaustive exactly as long
as every class the world reports nests under one of those two.

Nothing enforces that, and nothing can notice when it stops being true:

- Every field is `#[serde(default)]`, so a payload carrying a class the reader
  does not model decodes into a smaller, well-formed value.
- The client extractors read a fixed key list per provider — one of them reads
  three keys — with no branch for an unexpected key and no count of keys
  ignored.
- The OTLP mapping has four key groups and deliberately refuses to map a bare
  provider total, on the sound reasoning that a total cannot be split into
  input and output. An attribute matching none of the four groups is dropped
  on the same path, without the same deliberation.

The structural reason the model-axis fix does not transfer is worth stating,
because it is the technique's central claim and this tree demonstrates it:
**an unknown model is a lookup miss, and an unknown unit class is not.**
Something asks the price book about a model and gets no answer, so something
can count the miss, rank it, and surface it. Nothing asks anything about a
unit class. The keys the extractor was written to read are read; the rest were
never questions. So the identical defect that produces a loud ranked ledger on
one axis produces, on the other, a slightly smaller number.

## The A/B

The provider whose extractor reads three keys shipped a mode that books its
real consumption into two counters that extractor does not read: navigation
reasoning during exploration, and content the model loaded mid-call through
its own tool invocations. Both arms were run through the real extractor on a
payload of the documented shape, as a test in the client crate:

| arm | what it is | tokens |
| --- | --- | --- |
| A | the extractor as it stands | 2,000 |
| B | the payload's own self-reported total | 157,000 |

A **98.7% under-report**, and the operationally dangerous part is everything
that did *not* happen: no error, no `None`, no counter, no log line. The
optional field that exists on the struct marks an unknown *value*; there is no
representation at all for an unknown *class*.

The second arm pair is the one that reaches beyond this tree. Against static
fixed-rate ingestion of the same video, the ledger would report the new mode
as a **>99% saving**. The vendor's own published figures for that mode are
−88% tokens against −66% cost with no feature surcharge. Arm A is not
measuring the optimization; it is measuring the size of its own blind spot,
and the vendor's 22-point spread between its two brag numbers is the only
published description of what the mode actually did with the units.

## What this realization cannot do

It cannot say what the missing classes *cost*. The provider's developer
documentation names both counters and does not state whether they bill at the
input rate, the output rate, or their own — so the honest disposition here is
capture, null, and floor, not a nesting chosen to make the arithmetic close.
A reader copying this should resist the same temptation: folding an
unrecognized class into whichever direction looks plausible is the defect,
not the fix, and it is indistinguishable from correctness on inspection.

It also cannot yet say how much real traffic is affected. The count of
ingested events carrying unmodeled units is zero, and will read zero forever,
because the schema has nowhere to put it. That is the instrument the fix
builds, and until it exists the blast radius is an argument rather than a
number.
