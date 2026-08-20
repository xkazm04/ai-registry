---
layer: technique
type: technique
subject: multi-provider-event-normalization
technique: refuse-to-derive
status: forged
laws: [never-present-absence-as-an-answer, nullable-never-zero]
shared_with: []
use_when: [deciding whether to split or impute a missing field at ingest, handling spans that are not LLM calls, reviewing a mapper for invented data]
---

# Refuse to derive

When the wire did not supply a fact and the fact cannot be computed without
an assumption, **decline to compute it**. Map what is present, refuse what
is out of scope with a stable machine-readable code, and let genuine
absences remain absent. A normalizer's authority ends at translation; the
moment it starts estimating, it is manufacturing evidence that every
downstream consumer will treat as measurement.

## The canonical case: a total that cannot be split

Some senders report only a total-token count, no input/output split. The
temptation is to derive: assume a typical ratio, or halve it, or attribute
everything to input. All of these corrupt cost math, because input and
output tokens carry different prices — often by a large multiple — so any
assumed split produces a confidently wrong cost that no later audit can
distinguish from a real one. The disciplined mapping is: **do not map the
total at all.** Price the event from whatever split it does carry (possibly
none), and let the unpriced or partially-priced state be visible. A total
is not an input count and not an output count; putting it in either column
is a lie with good posture.

This generalizes: two attributes may only feed one internal field when they
name the *same fact* across naming generations. Related-but-different facts
— a total vs a component, a request-time guess vs a response-time
measurement — never share a mapping, however convenient the arithmetic.

## The refusal boundary: out-of-scope input gets a code

A telemetry export is a firehose of everything the sender instruments. The
spans that are not LLM calls — HTTP handlers, database clients, queue
consumers — are not errors and not events; they are out of scope. Refuse
them with a stable, machine-readable code and a human-readable reason,
distinguishing at minimum:

- **not-in-scope**: the span carries none of the accepted generative-AI
  attribute namespaces. The sender's exporter filter is too broad; the code
  tells them so.
- **malformed-in-scope**: the span is generative-AI-shaped but missing a
  fact the model cannot exist without (no model identity at all). The
  sender's instrumentation is broken; a different code tells them *that*.

Silent dropping is the worst of all options: the sender learns nothing,
and the operator's own coverage gaps become invisible. Coerced acceptance
is nearly as bad: a database span stored as a zero-token LLM event pollutes
every count it touches.

## Decision rules

- **When a field is optional and absent, store null** — never a default
  that reads as a measurement. Zero is a claim; null is an admission.
- **When a field is required and absent, refuse the record** with the
  malformed code — do not synthesize a placeholder identity.
- **When a value is present but implausible** (negative cost, non-finite
  number), treat it as absent, not as data — filter, don't clamp; a clamped
  value is an invented one.
- **When refusing, always code the refusal.** Codes are API surface:
  stable, documented, countable. A rising refusal-code rate is an
  operational signal; a rising silent-drop rate is nothing.
- **When absence flows downstream, it stays labeled.** An unpriced event
  contributes to counts but not to cost totals, and the total discloses how
  many rows it could not price — absence presented inside an aggregate as
  zero is absence presented as an answer.

## The line this technique draws

Refuse-to-derive does not forbid *computation* — latency from two
timestamps, cost from tokens times a price book, are derivations licensed
by arithmetic on supplied facts. It forbids computation that smuggles in an
**assumption about the sender**: a ratio they didn't report, an identity
they didn't claim, a clock they didn't stamp. The test for any proposed
derivation: could two honest senders with identical wire data have
different true values for this field? If yes, the derivation is a guess.

## When not to use it

Deliberate, disclosed estimation has a legitimate place downstream —
imputed pricing for known models, simulated what-ifs — where estimation
announces itself in the payload and lives outside the ingest path. The
refusal posture is specifically for the normalization boundary, where
whatever is written becomes the permanent record of what the sender said.
Do not extend refusal into rejecting merely-unfamiliar-but-valid traffic:
an unknown provider is accepted unpriced, not refused — refusal is for
out-of-scope and malformed, not for "new to me."
