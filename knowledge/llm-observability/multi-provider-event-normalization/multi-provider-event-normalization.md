---
layer: golden-path
type: golden-path
subject: multi-provider-event-normalization
status: forged
use_when: [ingesting LLM telemetry from apps you do not control, mapping standard telemetry spans to a costable event model, deciding what to do with a span the pipeline does not understand, reconciling divergent provider usage shapes]
techniques:
  - two-doors-one-pipeline
  - attribute-precedence-lists
  - provider-family-matching
  - per-provider-usage-extractors
  - refuse-to-derive
  - deterministic-span-derived-ids
---

# Multi-provider event normalization

An LLM observability operator receives telemetry it did not emit. The traffic
arrives in whatever shape the sender's instrumentation produced: one app posts
a hand-rolled JSON event from a thin client wrapper, another exports spans in
the industry's vendor-neutral telemetry standard, a third runs an SDK version
two years behind the current attribute names. Every downstream capability the
operator sells — cost attribution, usage caps, margin analysis, quality
scoring — consumes exactly one internal event model. Normalization is the act
of collapsing all of those wire shapes into that one model **without inventing
data**, and it is the single most adversarial interface in the product: the
sender cannot be upgraded, cannot be pinned, and cannot be trusted to have
read the documentation.

## The boundary: whose SDK is it?

The builder side of this craft — instrumenting one's *own* agent system,
choosing span structure, deciding what the emitting code records — belongs to
the neighboring engineering discipline of tracing and span emission. A builder
normalizes the one SDK they call: they know its response shape, they control
its version, and when the provider changes a field they ship a fix. This
subject begins where that control ends. The operator ingests shapes from
applications it does not control, on SDK versions it cannot pin, emitted by
instrumentation libraries that predate, extend, or misread the current
standard — and it must decide, span by span, what to accept, what to map, and
what to refuse. The design center is therefore not "parse the format" but
"survive the format's entire deployed history at once."

## Why this is hard: the standard itself is a moving target

The naive reading assumes a standards problem has a standards solution: adopt
the vendor-neutral generative-AI semantic conventions and map their
attributes. In the field, that standard is still formally pre-stable — every
generative-AI attribute in its registry carries a development-status badge —
and it has already churned through renames that broke deployed dashboards:
the provider-identity attribute was renamed mid-life; the token-usage
attributes migrated from "prompt/completion" names to "input/output" names;
prompt- and completion-content attributes were removed outright in favor of
opt-in structured message attributes. Meanwhile at least three
widely-deployed instrumentation ecosystems predate the standard or extend it
with their own attribute namespaces, and transition tooling encourages
emitters to send *both* old and new names simultaneously.

The consequence is structural, not transitional: **at any moment, honest
traffic arrives under several generations of names for the same fact.** A
normalizer keyed to exactly one generation silently drops the traffic of
every sender on a different one — and because the dropped fields are usually
token counts, the failure mode is not an error but an under-count that reads
as savings. The cure is to make multiplicity a first-class design element:
every internal field reads an ordered list of accepted attribute names,
newest-standard first, legacy and third-party conventions behind it
(attribute-precedence-lists), and provider identity is matched by family
substring rather than exact string, because hosted variants of the same
models arrive under namespaced identifiers (provider-family-matching).

## One internal model, one pipeline, many doors

The second load-bearing decision is topological. Offer as many ingestion
doors as adoption requires — a simple JSON endpoint for apps that will wrap
their provider calls, a standard-telemetry endpoint for apps already
instrumented — but make every door a *pure mapper* onto the single internal
event model, and route every mapped event through the same downstream
pipeline: validation, redaction, pricing, admission control
(two-doors-one-pipeline). The moment any door acquires its own validation or
its own pricing shortcut, the product has two accounting systems that will
disagree, and the disagreement will surface in a customer's invoice. The
same discipline governs clocks: a span carries its sender's timestamps, which
are fine for latency math and useless for accounting — the shared pipeline
re-stamps receipt time from the server's own clock for every door alike.

Client-side, the same one-model discipline applies in miniature: each
provider's response object exposes usage under a different shape — different
field names, different nesting, sometimes both snake-case and camel-case
duals of the same field across that provider's own SDK generations — so the
extraction is per-provider by construction, one small extractor per provider
family, each producing the identical usage tuple
(per-provider-usage-extractors). Resist the temptation to write one clever
generic extractor; the shapes are not variations on a theme, they are
independent designs, and a generic walker that guesses wrong produces a
number rather than an absence, which is the worse outcome.

## The refusal posture: what you do with what you don't understand

The question that separates a principal-grade normalizer from a naive one is
what happens at the edges of its understanding. Three edges recur:

- **A span that is not an LLM call at all.** A telemetry export is a
  firehose; alongside model calls come HTTP server spans, database client
  spans, queue consumers. These are refused with a stable machine-readable
  code — not stored, not silently dropped. Refusal with a code lets the
  sender debug their exporter filter; silent dropping teaches them nothing
  and hides your coverage gaps from you.
- **A field that could be derived but only by guessing.** The canonical case
  is a total-token count with no input/output split. Splitting a total by
  assumption corrupts cost math, because input and output tokens are priced
  differently; the disciplined move is to price from whatever split the span
  *does* carry and let the absence stay visible (refuse-to-derive). An
  invented number is worse than a missing one — the missing one announces
  itself; the invented one compounds into every aggregate.
- **A provider you have no model for.** An unrecognized provider string is
  accepted, stored with its raw identity preserved, and left unpriced. The
  event is real; only its costability is absent — and absence is a state to
  disclose, not a value to substitute.

Across all three, the posture is the same: **map what you understand, refuse
what you don't, and never manufacture the difference.** Every field the wire
did not supply is null, not zero; every span the mapper could not place is
rejected with a reason, not coerced; every derivation the math does not
license is declined, not approximated.

## Identity: idempotence against a sender you cannot stop

Senders you do not control also retry. A telemetry exporter that times out
re-exports the same batch; a client wrapper behind a flaky network posts the
same event twice. The normalizer's identity rule must make redelivery
harmless: derive the event id deterministically from the span's own identity
— trace id joined with span id — so a replayed export lands on the existing
row and flows into the duplicate-acknowledgement path instead of
double-counting spend (deterministic-span-derived-ids). A random id at the
mapping layer converts every sender-side retry into phantom cost. The same
determinism must extend to how trace references are canonicalized: both
doors must normalize trace ids through the one shared rule, or a
mixed-instrumentation trace splits into case-variant halves.

## Identity normalization is plural, on purpose

One further distinction the naive design misses: "normalize the model name"
is not one operation. Pricing wants an *algorithmic* normalization —
stripping a trailing date suffix so a dated model release resolves to its
family's price entry, because prices are published per family and a new
dated variant should price correctly on day one. Cross-installation
aggregation wants the *opposite* posture — a conservative, reviewed
allowlist of known aliases, where any identity not explicitly listed passes
through unchanged, because silently merging two models that are actually
different corrupts a shared leaderboard in a way no one installation can
detect. Same input, two normalizers, deliberately different risk appetites.
Collapsing them into one function forces one appetite onto both consumers
and gets at least one of them wrong.

## What good looks like

A mature normalizer is boring in operation and legible in failure. Its
precedence lists are documented as tables an operator can audit against the
standard's changelog. Its refusals carry codes a sender can act on. Its
provenance is kept: the raw provider string, the second model attribute, the
instrumentation scope all survive in metadata even after normalization,
because the day the mapping is discovered wrong, the raw material to re-map
is still there. And its accounting invariants hold under hostility: no
client-supplied clock feeds a budget window, no retry double-counts, no
absent field becomes a zero, and no guess becomes a number.
