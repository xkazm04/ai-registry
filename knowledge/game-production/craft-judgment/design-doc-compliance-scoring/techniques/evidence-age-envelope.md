---
layer: technique
type: technique
subject: design-doc-compliance-scoring
technique: evidence-age-envelope
status: forged
laws: [a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a dashboard shows a fresh timestamp over old evidence, choosing how long a verdict stays current, rolling up evidence of mixed ages]
---

# Evidence age envelope

## The concern

A verdict has a shelf life. It was true about a thing at a moment; the thing has been
changing since. A compliance report that carries verdicts of unknown vintage is reporting on
a state of the world that may not have existed for months — and the failure is silent,
because a stale verdict looks exactly like a current one.

The characteristic symptom: the most prominent freshness indicator on the page is the time
the **arithmetic** ran. "Last audit: just now", computed over evidence of any age. That
timestamp is a provenance stamp for the computation and says nothing whatsoever about the
currency of the inputs.

## The envelope

Do not report a single "last updated". Report the **envelope** of the evidence that the
score was actually computed from:

- the **newest** contributing verdict — is any of this current at all;
- the **oldest** contributing verdict — how far back the weakest input reaches;
- the count of contributing verdicts carrying **no timestamp**, which have an age nobody
  knows and must never default to fresh.

Only **measured** items contribute. The age of an item nobody gave a verdict to says nothing
about the age of the score, and letting unjudged items into the envelope makes the envelope
a function of scan scheduling rather than of evidence.

## Deriving a freshness state

Collapse the envelope into a small named state, and keep the states honest:

| State | Condition |
| --- | --- |
| unknown | nothing measured, or nothing dated — never "fresh by default" |
| stale | even the newest verdict is past the envelope: none of this is current |
| aging | the newest is inside, but the oldest is past, or some evidence is undated |
| fresh | every contributing verdict is inside the envelope and dated |

Pass the current instant **in** rather than reading a clock inside the derivation. That makes
the function pure and, more importantly, lets a consumer measure evidence age against *the
run that produced the report* — which is the comparison the display exists to make. A
freshness state recomputed against wall-clock time on every render tells the reader how long
the page has been open.

## Choosing the envelope

The envelope is set by the **change rate of the thing the verdict describes**, not by
convenience:

- Fast-moving implementation under active development: days to a few weeks. Thirty days is a
  defensible default for an area someone is working in weekly.
- Stable subsystems in maintenance: a quarter or more.
- Frozen or archived surfaces: effectively unbounded — but say so explicitly rather than
  letting the default silently pass everything.

Two refinements worth the effort. First, **state the threshold in the output**, so a reader
can see what "stale" is being judged against instead of inferring it. Second, prefer binding
a verdict to a fingerprint of the content it judged wherever that is available — content
identity beats elapsed time, because a subsystem untouched for a year has evidence that is
old and still perfectly valid, while one edited an hour after review has evidence that is
fresh and already wrong. Age is the fallback for surfaces where content identity is not
obtainable; where both exist, use both, and let either one demote.

## What happens at expiry

**Expired evidence becomes unmeasured again. It does not become failing.** This is the rule
people get wrong, and getting it wrong is expensive in both directions: treating stale
evidence as a failure generates phantom work and trains people to distrust the metric;
treating it as a pass is the neutral-constant error with a clock on it.

So expiry moves the item out of the conformance denominator and into the coverage gap, with
a finding whose remedy is *go and re-verify*, and whose effort is usually trivial. A milder
transitional variant — keep stale evidence in the score but report freshness as a separate,
prominent axis — is a legitimate first step when demotion would empty the report overnight,
but it is a step, not a destination, and it should be labelled as one.

## Comparing timestamps is not trivial

An envelope is only as good as its ordering, and this is a real defect that ships. Comparing
timestamps as raw strings is correct only while every value has the identical shape. The
moment one carries a zone offset or is a date without a time, string ordering compares by
first differing character and the reported "oldest" is not the oldest.

Rules: parse before comparing. When a value will not parse, fall back to a total order that
cannot let it *win* the comparison — an unparseable legacy value must not silently become the
reported extreme of the envelope. And normalise at the write boundary so the problem is rare,
rather than only at the read boundary where it is invisible.

## Rolling up

A parent's envelope is the extremes of its children's — earliest oldest, latest newest, summed
undated count — not a value generated when the roll-up ran. Preserving the envelope through
aggregation is what stops one freshly-reviewed area from making a whole project look current.

## When not to use this

- **Immutable artifacts with immutable verdicts** — a signed release audit does not decay,
  it describes a thing that cannot change. Bind to the artifact, drop the clock.
- **Continuously re-derived evidence** where every value is recomputed each run: the envelope
  is always one run wide and the machinery is noise.
- **Where a content fingerprint is available and cheap for the whole surface** — then age is
  a weaker proxy for the thing you can already measure exactly, and should be reported as
  context rather than used as a gate.
