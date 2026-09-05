---
layer: golden-path
type: golden-path
subject: structured-output
status: reconciled
techniques:
  - extraction-strategies
  - schema-validation-and-repair
  - answer-coverage-gating
  - output-budget-signal
  - op-grammar-allowlisting
  - constrained-decoding-is-a-shared-budget
  - artifact-lifecycle
  - display-vs-machine-channels
  - extraction-observability
---

# Structured model output & artifact extraction

A generative model is a fluent author and an **unreliable serializer**. When a
turn's purpose is machine-actionable data — an object to persist, a set of
operations to apply, a plan for another system to execute — the surface you
build is not "ask nicely for JSON". It is an **extraction pipeline**: a staged
path from settled model text to exactly one of two outcomes — a validated
artifact the system may act on, or an honest, fully-described extraction
failure. Nothing in between ever escapes the pipeline. The half-parsed object,
the "close enough" payload, the guessed field — those are the ancestral
defects of this surface, and every rule below exists to make them impossible
rather than merely discouraged.

The subject's borders are sharp. Upstream,
[streaming-output](../../runtime-and-io/streaming-output/streaming-output.md) owns the transport:
chunk framing, typed stream events, run attribution, finalization. Extraction
operates on the **settled record** that finalization produces — never on the
live tail, which may end mid-token at any moment. Downstream, when the
artifact proposes consequential actions, the approval gate belongs to
[hitl-approval](../../orchestration/hitl-approval/hitl-approval.md): extraction ends at a
*validated proposal*, not at an executed one. And the adversarial framing —
model output as untrusted input crossing a trust boundary — is the
prompt-safety subject; here that framing lands as concrete mechanism: an
extractor never manufactures capability the caller did not explicitly grant.

When *not* to build this:

- **When the output is for human eyes only.** A turn whose product is prose
  needs no extraction — and must not be parsed opportunistically later. If a
  machine will ever need the data, design the machine channel now (see the
  two-channel rule below); scraping display text is how brittle systems are
  born.
- **When a deterministic source exists.** A model asked to restate what a
  database already knows is an expensive, lossy copy with a hallucination
  rate. Extract from models only what only a model can produce.
- **When generation can be constrained.** Where the producer supports
  grammar-constrained or schema-constrained decoding, use it — it shrinks the
  tolerant-parsing ladder dramatically. It does **not** remove the validation
  door: constrained decoding guarantees syntax, and syntax was never the
  contract. A well-formed object naming an entity that does not exist, a
  quantity out of range, or an operation outside the allowlist is exactly as
  dangerous well-formed as malformed.

## The model is an unreliable serializer

Treat this as a load-bearing fact, not a complaint. A model asked for a
structured payload will, some fraction of the time, wrap it in prose
("Here is the JSON you requested:"), fence it in a code block, fence it in a
code block *labeled with the wrong language*, emit two candidate payloads,
interleave commentary between fields, use typographic quotes, leave a
trailing comma, or stop three tokens early. None of these are exceptional;
all of them are Tuesday. The design consequence is a pair of dials set to
opposite extremes:

- **Syntactic tolerance: high.** The extractor meets the output where it is —
  fences, wrappers, near-miss syntax — via an ordered ladder of strategies,
  each cheap, each recorded when it fires. Owned by
  [extraction-strategies](./techniques/extraction-strategies.md).
- **Semantic strictness: total.** Once *some* candidate structure is in hand,
  meaning is enforced without mercy at a single validation door. Tolerance in
  this layer is where corrupted state comes from. Owned by
  [schema-validation-and-repair](./techniques/schema-validation-and-repair.md).

The two dials are commonly confused, and each confusion has a signature
failure. Strict syntax + strict semantics rejects half of genuinely usable
outputs and reads as "the feature is flaky". Tolerant syntax + tolerant
semantics accepts garbage and reads, weeks later, as unexplainable state. Only
tolerant-then-strict survives contact with a real model.

## The schema is the contract — and it is written twice

Every extraction has a schema: the shape, types, ranges, and vocabularies the
artifact must satisfy. That schema necessarily exists in two places — in the
**prompt**, where the model is told what to produce, and in the **validator**,
where the product is checked. These are two renderings of one contract, and
they drift exactly the way any two hand-maintained copies of one vocabulary
drift: someone extends the prompt and forgets the validator, or tightens the
validator and strands the prompt. Derive both from one authoritative
definition where the machinery allows it; where it does not, co-locate them
and let [extraction-observability](./techniques/extraction-observability.md)
catch the drift — a shift in which failure categories dominate is the drift
alarm going off.

Where the producer supports schema-constrained decoding, the contract is
written a **third** time — as the machine-readable schema sent with the
request — and the third copy is the one most likely to be typed out by hand
beside the domain model instead of generated from it. Derive it. The
vocabularies in the request schema, the vocabularies in the validator, and
the vocabulary the rest of the system actually scores against must be one
definition with three renderings, or the request constrains the model to a
menu the validator has stopped believing in.

Validation happens at **one door**. Every producer of a given artifact type —
the interactive flow, the batch job, the retry path, the import — passes
through the same validator. Sprinkling validation across call sites is
validation minus the call site added next quarter.

## The artifact's top level is an envelope

A generated artifact's outermost shape is an **envelope object, never a bare
collection**. The envelope carries what a consumer needs in order to decide
whether to trust the contents before reading them: the schema identity and
version, who or what produced it, what it describes, the counts it claims,
and a content hash short enough to read in a diff and stable enough to answer
"am I in sync, stale, or diverged" without a field-by-field comparison. A
bare collection is a shape with nowhere to put any of that, so the first
piece of metadata anyone needs forces a breaking change on every reader — and
until then, a consumer that fetched a truncated or wrong-version document has
no way to notice. The declared counts are load-bearing twice over: they are
also what lets a consumer who did not issue the request run the coverage
check below.

## Repair is a bounded loop, not an infinite hope

When validation rejects a candidate, the model that produced it is also the
cheapest repair tool available: hand back the typed, path-addressed errors
("field X missing; field Y must be one of …") and ask for a corrected
artifact. But repair is a **loop with a stated budget** — typically one or two
attempts — and a **give-up state that is a real outcome**, not an exception
that escapes sideways. Each iteration validates at the same single door as
the first attempt. An unbounded repair loop is an infinite hope with a cost
meter attached; a repair loop whose exhaustion is silent converts "the model
cannot produce this artifact" into whatever the caller's timeout renders as.
Owned by [schema-validation-and-repair](./techniques/schema-validation-and-repair.md).

## The closed op-grammar principle

The highest-stakes artifact is a **list of operations** — the model proposing
things the system should *do*. The governing principle: the model chooses
from a **closed, allowlisted vocabulary of operations**; anything outside the
vocabulary is data to display or discard, **never action**. Three rules make
the principle mechanical:

1. **One authority defines the vocabulary** — the dispatcher's allowlist, the
   prompt's menu, and any documentation all derive from a single definition.
2. **Unknown operations are counted and surfaced, never executed** — an op
   name outside the allowlist is a fact worth observing (it usually means the
   prompt drifted) but its execution path does not exist.
3. **References are validated before acting** — an allowlisted operation
   naming an entity id is only as safe as the check that the id exists, is of
   the right kind, and is within the caller's scope. The op-grammar is where
   the trust boundary from prompt-safety (plain text; forged separately)
   becomes enforcement: model text can *propose*, only validated dispatch can
   *do*.

Owned by [op-grammar-allowlisting](./techniques/op-grammar-allowlisting.md).
When the operations are consequential enough to need a human decision, the
validated proposal flows into
[hitl-approval](../../orchestration/hitl-approval/hitl-approval.md)'s gate rather than into
direct execution.

## Two channels, one turn

A turn that produces an artifact almost always also produces words for the
human. These are **two different products with two different consumers**, and
they must be separated at the extraction boundary and never re-crossed:

- The **machine channel** carries the validated artifact. It is never shown
  raw to the user — a wall of serialized payload in a conversation is both a
  usability failure and a subtle trust failure (the user starts editing it,
  quoting it, or expecting it to be authoritative prose).
- The **display channel** carries cleaned text: the machine payload stripped
  out and replaced, where the user should see something, by a purpose-built
  presentation — a card, a summary, an affordance to inspect or approve.
- **Neither channel is derived by parsing the other.** Parsing the display
  channel to recover data is the founding sin; rendering the machine channel
  as display text is its mirror.

Owned by [display-vs-machine-channels](./techniques/display-vs-machine-channels.md).

## Failed extraction is a first-class outcome

The pipeline's outcome set is closed, and its members are not
interchangeable:

| Outcome | Meaning | It is NOT |
| --- | --- | --- |
| **Artifact** | a candidate was found, validated, and (if applicable) repaired within budget | — |
| **Empty** | the request was open-ended and the model, legitimately, had nothing to propose — an explicit empty artifact that itself validated | a failure; and not available at all to a request that enumerated what to answer |
| **Extraction failed** | no candidate found, or validation exhausted the repair budget | an empty result |
| **Turn failed** | the producing run itself ended in error — there was never settled text to extract from | an extraction failure |

The empty row carries a qualifier that is easy to lose and expensive to
lose: **an empty artifact is only a legitimate outcome for a request that
did not enumerate its answers.** When the request named the units — score
these nine dimensions, classify these twelve records — a validated artifact
containing none of them has not "proposed nothing"; it has failed to answer,
while wearing the outcome reserved for honest silence. The validation door
cannot catch this on its own, because the count that makes it detectable
lives in the *request*, not in the schema: every field present is well
formed, and the ones that are absent were never required by a document that
does not know what was asked. That gap needs its own gate — answered units
against asked units, checked after validation and before use, with a
below-floor response failed as a whole. Owned by
[answer-coverage-gating](./techniques/answer-coverage-gating.md).

A parsed-but-unanswered response has a second cause worth separating from
the first: the response ran out of room. Producers cap how much they emit in
one turn, and the failure at that cap is a truncated artifact rather than an
error — which the tolerant ladder then partially recovers and the consumer
renormalizes over. Track output size against the producer's ceiling as a
**measurement of how the flow is built**, not as a runtime guard: when
responses routinely approach the ceiling the answer is to split the call,
never to raise the limit or add a fallback that hides the growth. Owned by
[output-budget-signal](./techniques/output-budget-signal.md).

Collapsing "extraction failed" into "empty" is this subject's rendition of
failure spelled as empty success: the operator sees "no suggestions" and
learns nothing, when the truth was "the model produced output we could not
use" — an actionable fact pointing at prompt drift, schema drift, or a
producer change.

There is a third spelling, and it is the worst of the three: **failure
spelled as a default-valued artifact**. A parse that returns an optional and
a caller that fills the miss with a default-constructed value — every field
zero, empty, or its declared fallback — has manufactured a *fully legal*
artifact out of a failure. Nothing downstream can flag it, because it
validates; the system then acts on the default (retries, escalates, reports
"no progress") and the resulting symptom carries no trace of its parser
origin. Default-construction is never a give-up path. The give-up path is
the extraction-failed outcome, which exists precisely so that no legal value
has to stand in for one.

The trap has a field-sized version that is easier to write and just as
damaging: a defensive coercion whose failure mode is a *valid in-range
value*. An absent number pushed through a conversion that yields a
non-number, then through a fallback that turns non-numbers into zero, is a
confident zero that travels — and zero is a legal score, so nothing
downstream will ever question it, least of all a gate that counts how much
was answered. Absence must be representable distinctly from every value the
field can legitimately hold, and the unit that could not supply a real value
is dropped rather than filled.

There is exactly one place a default *is* the right answer, and knowing its
border keeps the rule above from being argued away: a **declaration whose
absence has a defined meaning**. A human-authored settings document that is
missing or partly unreadable may legitimately resolve to documented
defaults — refusing to proceed over a typo is the worse failure, the
defaults are published, and the author can be told. None of those three hold
for a model-produced artifact: the default was never published as an answer,
the producer cannot be corrected in place, and the turn is not reproducible.
Declarations may default; extraction never does.

A failed extraction carries its evidence: the raw settled
text (retained under a size cap), the strategy trace, and the final
validation errors. It is diagnosable after the fact without re-running.

## The lifecycle is a reusable machine

Every extraction-bearing flow — generate a configuration, draft a plan,
synthesize a report — walks the same states, and the machine deserves to be
built **once** and parameterized, not re-improvised per flow:

| State | Meaning |
| --- | --- |
| **idle** | no run in flight for this flow |
| **running** | producer spawned; progress surfaced from the live stream |
| **extracting** | producer settled; strategies and validation (and repair turns) executing |
| **completed** | artifact available, or explicit empty |
| **failed** | turn failed or extraction failed — with the evidence attached |

Two properties are the ones implementations lose: **single-flight per flow**
(a second request while one is in flight is rejected or queued, never raced —
two concurrent extractions writing one artifact slot is a corruption engine),
and **every path out of `running` reaches exactly one terminal state** —
producer error, cancellation, teardown, and success all converge on the same
finalization. Owned by [artifact-lifecycle](./techniques/artifact-lifecycle.md).

## Operator posture: extraction is a measured system

Extraction quality decays silently. The prompt is edited, the producer is
upgraded, the schema grows a field — and the failure rate drifts from 2% to
20% without a single crash, because every individual failure is handled
"gracefully". The counters that make the decay visible — attempts, outcomes
by category, which strategy fired, repair-loop depth — are part of the
pipeline, not an afterthought, and each number carries its predicate. Owned
by [extraction-observability](./techniques/extraction-observability.md).

## The techniques

- [extraction-strategies](./techniques/extraction-strategies.md) — the ordered
  ladder from settled text to candidate structure: fenced blocks, whole-text
  parse, balanced-span detection, tolerant syntax repair, prose fallbacks —
  and why the ladder's order is part of the contract.
- [schema-validation-and-repair](./techniques/schema-validation-and-repair.md) —
  the single validation door, typed path-addressed errors, the bounded
  model-assisted repair loop, and give-up semantics.
- [answer-coverage-gating](./techniques/answer-coverage-gating.md) — answered
  units against asked units, where to set the coverage floor, and why a
  fallback must never wear the failed producer's name.
- [output-budget-signal](./techniques/output-budget-signal.md) — the output
  ceiling as a measurement that triggers splitting a call, the two kinds of
  unknown ceiling, and why "not measured" is not zero.
- [constrained-decoding-is-a-shared-budget](./techniques/constrained-decoding-is-a-shared-budget.md)
  — what changes once more than one contribution can request a constraint on
  the same request: a provider-capped capacity that fails on the innocent
  request, shedding by declared priority with the shed party told, and a
  grammar dialect that belongs to the route rather than to the model.
- [op-grammar-allowlisting](./techniques/op-grammar-allowlisting.md) — closed
  operation vocabularies, the unknown-op policy, reference validation before
  action, and the one dispatch door.
- [artifact-lifecycle](./techniques/artifact-lifecycle.md) — the reusable
  spawn → stream → extract → validate state machine, single-flight, progress
  surfacing, and convergent finalization.
- [display-vs-machine-channels](./techniques/display-vs-machine-channels.md) —
  cleaning the display text, replacing payloads with presentation, and the
  ban on cross-channel parsing.
- [extraction-observability](./techniques/extraction-observability.md) — the
  numbers that reveal prompt and schema drift before users do.
