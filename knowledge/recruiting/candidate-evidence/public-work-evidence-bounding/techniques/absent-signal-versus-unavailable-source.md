---
layer: technique
type: technique
subject: public-work-evidence-bounding
technique: absent-signal-versus-unavailable-source
status: forged
laws: [absence-of-evidence-is-not-evidence, a-candidates-process-never-stalls-on-your-constraints, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [handling a throttled or failed fetch of public work, rendering a negative finding about a candidate's public output, designing what a public-work read returns when nothing came back]
---

# Absent signal versus unavailable source

Two sentences that a naive pipeline collapses into one result:

- *"Their public work shows no evidence of this capability."* — a claim about
  a person, derived from a record that was read.
- *"We could not read their public work."* — a claim about your
  infrastructure, derived from nothing at all.

The first is legitimate hiring evidence within its bounds. The second is not
evidence of any kind. They must never share a value, a field, a rendering, or
a downstream treatment. The general grammar for rendering "could not
determine" belongs to the inference-labelling subject; what this technique
adds is the specific arithmetic of public sources, which fail in ways
candidate documents do not.

## Public sources fail in five distinguishable ways

Each needs its own state, because each means something different to a reader
and to a retry:

1. **Throttled** — the source refused on quota. Retryable, tells you nothing,
   and is *your* condition, not the candidate's.
2. **Unreachable** — timeout, outage, transport failure. Retryable, tells you
   nothing.
3. **Not found** — the identifier does not resolve: deleted, renamed,
   mistyped, made private. Not retryable, and it is a fact about the link
   rather than about the person's capability.
4. **Forbidden** — the source exists but your access does not extend to it.
   Not an absence of work; an absence of permission.
5. **Read and empty** — the fetch succeeded and the record genuinely contains
   nothing in scope. This is the *only* one of the five that is evidence, and
   even then only within the declared budget.

Collapsing one through four into five is how a quota limit becomes an adverse
finding about a human being, authored by nobody, defensible by no one.

## Procedure

1. **Type the outcome at the boundary.** The routine that talks to the source
   returns a discriminated result — read-and-empty, or a named failure — and
   never an empty collection standing in for a failure. An empty list is the
   most dangerous return value in this subject precisely because every
   downstream consumer handles it without complaint.
2. **Propagate the type through every layer.** Aggregation, scoring, storage
   and rendering each preserve the distinction. A pipeline that carries it
   faithfully for four layers and flattens it in the fifth has the same bug,
   later and harder to find.
3. **Render the failure as a fact about the system, in the system's voice.**
   "This source could not be read (rate limited); nothing here has been
   assessed" — with no capability list, no gap list, and no score attached to
   the section.
4. **Never let a failure influence a comparative ranking.** A candidate whose
   source was throttled must not sort below one whose source was read; they
   sort as if the section did not exist.
5. **Degrade asymmetrically, because degradation is asymmetric.** A partial
   read can only ever *remove* evidence, never add it. So a positive finding
   made from what did arrive survives a degraded run — it was genuinely
   found — while every negative finding must be dropped wholesale, because
   "the evidence does not show it" is exactly the sentence the missing
   fetch would have falsified. Suppressing the negatives and keeping the
   positives is not inconsistency; it is the only reading the partial data
   supports.
6. **Give the degraded state one shared name, owned in one place.** The
   producer that detects the coverage loss and every surface that must
   suppress a reassurance because of it need to agree on the same marker. Two
   independently spelled versions of "this run was incomplete" drift, and the
   half that drifts is always the suppression, so the reassuring sentence
   reappears on a run that did not earn it.
7. **Retry on retryable states, on your own time, and let the candidate's
   process continue meanwhile**
   ([a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
   A degraded run proceeds with its provenance honestly downgraded; it does
   not block a person and it does not freeze a degraded read as authoritative.
8. **Record which state occurred with the artifact**, so a later reader can
   tell a review that saw nothing from a review that saw an empty record.

## A negative finding is scoped to the question that produced it

The second half of this technique catches teams who got the first half right.

When the read answers a *closed* question — "which of these ten required
capabilities appear in the evidence?" — then "no gaps" means "no gaps among
these ten". Rendered as an unqualified *none*, the artifact has claimed
coverage of a space it never examined, and a reader will price it as a
complete review. The fix is not to open the question up; a bounded checklist
is a perfectly good instrument. The fix is to render the bound with the
answer: *no gaps among the ten capabilities checked*.

The mirror-image error lives in the vocabulary itself. When the checklist's
entries overlap — two names for one capability, a broad term and its
specialisation, an alias and its canonical form — one real gap emits as two
or three findings, and the artifact reports a candidate as weaker than the
evidence says. Normalise the vocabulary to canonical entries before matching,
deduplicate findings after, and count gaps in canonical space. An inflated gap
count is an adverse read manufactured by a taxonomy.

## Decision rules

- **When any source in a multi-source read fails, the artifact says which
  ones.** A partial read presented as a whole read is the same over-claim as
  an unread body presented as an inspection.
- **When a failure is unresolved at decision time, the section is excluded,
  not zeroed.** An unmeasured section coerced to zero ranks a person worst on
  a number nobody computed
  ([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
- **When the state is ambiguous — a source that returns success with a
  suspiciously empty body — treat it as unavailable, not empty**
  ([uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When you cannot distinguish "no public work" from "no public work we can
  see", say the latter.** Absence of public work is never adverse anyway, so
  the cheaper honest phrasing costs nothing.
- **When the failure is chronic rather than incidental — a quota that is
  exhausted every afternoon — stop treating it as an exception.** A pipeline
  whose evidence base varies by time of day is producing incomparable reads
  and needs its budget or its scheduling fixed, not its error text softened.

## Anti-patterns

- **The empty-list return.** A failure path that returns "no items found"
  because it is the convenient shape. It will be indistinguishable from truth
  within one release.
- **The optimistic default.** "If we could not check, assume it is fine" — the
  same error in the flattering direction, and it corrupts a positive finding
  rather than manufacturing a negative one.
- **The score that absorbs the outage.** A composite number that silently
  drops a failed component and renormalises, so a degraded read renders as a
  confident one.
- **Retry storms against a throttled source.** They deepen the outage,
  and they make the evidence base depend on how many candidates were processed
  before this one.
- **The unqualified none.** A negative rendered without the bound of the
  question that produced it.

## When not to use it

- **When the source is candidate-supplied content already in hand.** A pasted
  document has no fetch to fail; the distinction that matters there is
  parseable versus unparseable, and it belongs to the parsing subject.
- **When failure states would be the only thing a candidate-facing surface
  shows.** A person reading their own status does not need your quota
  telemetry; they need to know their assessment is unaffected. Type it
  internally, summarise it externally.
