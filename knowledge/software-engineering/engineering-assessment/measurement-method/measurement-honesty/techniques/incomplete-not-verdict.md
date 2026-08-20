---
layer: technique
type: technique
subject: measurement-honesty
technique: incomplete-not-verdict
status: forged
laws: [failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [a collection stage partly failed but downstream still produced a report, designing the boundary between ingestion and analysis, deciding what confidence to attach to a run]
---

# An incomplete run is not a verdict

The fetches timed out. An authorization scope was missing. A rate limit
truncated the listing at the first page. The collection stage returns an object
of the right shape with empty fields, and the analysis stage — which was built
to interpret data, not to audit its provenance — does its job faithfully and
reports: little activity, no automated checks, no reviews. The output is not a
measurement of the subject. It is **an ingestion failure wearing a verdict's
clothes**, and it is the single most believable dishonest number a reporting
system can emit, because a damning result looks exactly like this.

The structural cause is that emptiness is ambiguous downstream and unambiguous
upstream. At the moment of the failed fetch, the system knew. One layer later
that knowledge is gone and only the empty array remains. So the fix must live
at the boundary, and it must read the acquisition record rather than the
derived values — [gate-sees-target](../../../../_laws.md#gate-sees-target): a check
that runs over the derived numbers is checking a proxy, and passes precisely
when the proxy diverges from the thing it was meant to observe.

## The completeness predicate

Insert an explicit predicate between collection and interpretation. It answers
one question — *did we acquire enough to interpret?* — and it reads only the
provenance of the run:

- **Was any hard-required source unavailable?** A source without which the
  report has no subject is a short-circuit on its own.
- **What fraction of attempted acquisitions succeeded?** Not how many artifacts
  were retrieved — what share of the attempts returned. Fifty of fifty is high
  confidence; fifty of five hundred is fifty successes and four hundred fifty
  unknowns.
- **Was any listing truncated?** A capped or paginated-out listing means the
  denominator of everything derived from it is unknown, which is worse than
  small.
- **Did the run degrade to a fallback path?** A cached, stale, or estimated
  substitute is a legitimate answer to *keep the page up* and an illegitimate
  input to *publish a verdict*.
- **Were errors recorded that no derived value reflects?** The most dangerous
  class: a failure that left no trace in the output shape.

The predicate returns a boolean plus the *reasons*. Reasons are the entire
value of the mechanism — an incomplete run that cannot say why is
indistinguishable from a flaky product.

Two properties of the predicate itself matter as much as its inputs:

- **Derive it; do not merely read a stamped field.** The obvious implementation
  reads a flag the collector wrote. That works for runs produced by the current
  collector and fails for every record that predates the flag, was reconstructed,
  or came from an older path — and those are exactly the records that get
  re-interpreted months later with nobody watching. The predicate therefore also
  recognizes the *structural* signature of emptiness: a result whose measured-set
  is empty means the same thing as the flag, whether or not the flag is there.
- **Fail closed.** When the predicate cannot tell, it says incomplete. A check
  that cannot see its target must not certify it — passing on ignorance is the
  one outcome that converts an ingestion failure into a signed statement.

## The outcome must be a different kind, not a flagged score

The common half-measure is to compute the report anyway and attach
`incomplete: true`. It fails for a reason worth stating precisely: **a flag is
optional to read, and a number is not.** Every consumer that forgets the flag —
a sort, an export, a digest, a chart, a screenshot — silently promotes the
fabrication back to a verdict, and the flag's presence in the payload creates
the impression that the problem was handled.

Model incompleteness as a distinct result *variant*, so that consuming the
value at all requires deciding what to do about it. The scored branch carries
numbers; the incomplete branch carries reasons, the attempted-versus-succeeded
tallies, and a retry affordance — and carries **no score field at all**. What a
consumer cannot read, it cannot leak. This is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) applied at
the pipeline seam: the run that could not gather must not produce the same
artifact type as the run that gathered and found little.

Three consequences follow directly:

- **Incomplete runs do not persist as history.** Writing them to the series
  puts a fabricated trough in every trend, and trends are read long after the
  incident is forgotten. Store the run as an incident record instead.
- **Incomplete runs do not feed rankings, gates, or notifications.** Whether a
  gate treats "could not verify" as blocking or as skip is the gate's decision
  to make explicitly — this technique's job is to ensure the gate is given the
  distinction rather than a low number.
- **Incomplete runs retry with backoff rather than being memorialized.** Most
  are transient by construction, and the correct user-visible artifact is
  "analysis incomplete — retrying", not a verdict with an apology.

## Confidence comes from success rate

The recurring modeling error deserves its own rule, because it is the version
of this failure that survives a careful review:

> **Coverage confidence is a function of the acquisition success rate, not of
> how many artifacts were collected.**

Confidence derived from volume rises as the source gets bigger and says nothing
about whether you saw it; a large subject partially fetched will out-confidence
a small subject fetched completely, which is exactly backwards. Compute
confidence as succeeded-over-attempted, and record both numbers so the ratio
can be audited later. One correction rides along with the rule: a *perfect*
success rate over a **truncated** listing is still low coverage, because the
attempts themselves were capped — truncation clamps confidence to a ceiling
regardless of how well the attempted subset went.

Three guardrails around that value:

- **Validate it at the trust boundary, once, into a single binding.** A
  confidence or ratio arriving from any computation you do not own can be
  non-finite, negative, or above one — an empty denominator alone produces a
  non-finite value that propagates through arithmetic silently until it renders.
  Sanitize where it enters, and have *both* the downstream math and the
  persisted or displayed field read that one sanitized value. The instructive
  near-miss is a guard written as a local for the arithmetic only, while the
  rendered field kept the raw estimate: the result was a correctly computed
  score sitting beside a non-finite confidence, which serializes to null and
  breaks every percentage render and threshold check downstream. Same value, one
  binding — then they cannot drift.
- **Remember what the confidence value gates.** It is rarely just a label. A
  coverage or confidence number typically also decides whether a run is cached,
  reused, or promoted to a stored record — so an inflated one does not merely
  mislead a reader, it *persists* a degraded observation and serves it as fresh
  for the life of the cache. A confidence that pins high regardless of how many
  acquisitions failed is therefore a data-retention bug as much as an honesty
  one. Scale it by the success rate, and let a degraded run fall below the
  reuse threshold on its own.
- **Do not let confidence become a discount rate.** Multiplying a score by its
  confidence produces a number that is neither the measurement nor the
  uncertainty, and that no reader can decompose. Confidence travels *beside* the
  value, or it gates the value's publication; it does not blend into it.

## When not to use it

- **When partial acquisition is the normal operating mode** and the report is
  explicitly framed as a sample — a sampled scan, an opportunistic sweep. Then
  the honest artifact is the sampled result with its sampling rate disclosed,
  and a completeness predicate that fires on every run is noise.
- **When there is no retry path and the report must ship.** A one-shot
  observation of a transient subject cannot be re-collected; here the output
  degrades to the observed subset with the gaps named, using
  [renormalize-over-present](./renormalize-over-present.md) — never to a verdict.
- **As a substitute for fixing the collector.** A completeness predicate that
  fires constantly is telling you about an instrument, not about subjects.
  Suppressing its output rather than repairing the acquisition converts a
  visible problem into an invisible one at the exact site where visibility
  existed.
