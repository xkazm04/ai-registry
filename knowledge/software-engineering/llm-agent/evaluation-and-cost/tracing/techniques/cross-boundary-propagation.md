---
layer: technique
type: technique
subject: tracing
technique: cross-boundary-propagation
status: forged
laws: [identity-survives-reuse, gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [deciding whether a successor run continues or links, trace fragments that no viewer can rejoin, child spans starting before their parent, adopting trace identity at a boundary whose caller you do not control]
---

# Cross-boundary propagation

A run worth tracing rarely stays in one process. It starts in an interface,
crosses into an engine, spawns a subprocess, calls a remote producer, and may
hand off to a *successor run* hours later. The trace is only a tree if the
identities — trace id and parent span id — **survive every one of those
handoffs**. Each boundary that drops them fractures the record into fragments
that no viewer can rejoin, and the fracture is discovered exactly when
someone needs the end-to-end view: during an incident.

The rule: **identity crosses every boundary explicitly, as data in the
handoff envelope — never reconstructed on the far side, never inferred from
timing or naming.**

## The propagation contract

Two values travel: the **trace id** (which run) and the **parent span id**
(where in the tree the receiver's work attaches). The receiving side:

1. **adopts** the trace id — it must not mint a new one when handed one;
   double-minting is the most common fracture, and it is invisible locally
   because each fragment looks healthy on its own;
2. **opens its root-of-this-boundary span as a child** of the received
   parent id;
3. **propagates onward** — the contract is transitive; a middle tier that
   consumes the ids but forwards nothing re-fractures everything below it.

The carrier is explicit and boring: a named field in the request, the job
payload, the message envelope, the spawn arguments. Ambient carriers —
thread-locals, globals, "the current trace" — work in one process and betray
you at every queue, pool, and async boundary, because ambient context does
not follow the work; the envelope does.

## Boundary catalog

- **Process and language boundaries** (interface ↔ engine, engine ↔
  subprocess): the ids ride the invocation payload. Serialization must
  round-trip them byte-exactly — identity that survives reuse and restart is
  the law's requirement
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)), and a
  lossy re-encode (case-folding, truncation, re-formatting) is a silent
  identity change.
- **Queues and schedulers**: the ids are persisted *with the job*, because
  the dequeue may happen after a process restart, on another machine, next
  week. A job record without its trace identity permanently detaches
  everything the worker does.
- **Cooperative external producers**: pass the identity in whatever
  correlation slot the producer offers, so its own records can be joined back
  later. When the producer offers none, the caller's span *is* the boundary:
  everything the producer did is attributed to that one span, honestly
  opaque.
- **Parallel identity namespaces**: real runs accumulate ids — the run
  store's key, the trace id, an external protocol's correlation id, the
  producer's own session id. A second namespace is permissible **only if the
  join to the first is itself recorded** — a field on the same record, not a
  convention in someone's head. An id minted into its own namespace and
  never joined is not correlation; it is a second, unreachable story about
  the same run, and each unjoined namespace multiplies the guesswork of
  every future investigation.
- **Chained and successor runs**: see below — continuation is a decision,
  not a default.

## When the sender is not yours

Every boundary in the catalog above sits between tiers of one system, where
the sending side is code the same team wrote. A public ingress is not that. A
service that accepts calls from anyone adopts trace identity from whoever
calls it, and **adopted propagation metadata is an unvalidated write into the
record operators read during an incident.** Recorded verbatim, any caller
chooses the strings an investigator will be staring at — and the corruption
lands in exactly the surface people reach for when something is already
wrong, which is the worst possible timing and not a coincidence.

The discriminator is one question, asked per boundary: **is the sender inside
your trust boundary?** Internal tier to tier, adopt exactly as above. Public
or partner-facing ingress, **adopt after validating** — and the emphasis
belongs on *adopt*. Distrust does not reverse the contract: the receiver
still must not mint a fresh id when handed one, because double-minting
fractures the trace just as thoroughly at a public edge as at a private one.
What is added is a parse, not a refusal. The receiver adopts what parses.

Three rules make that concrete.

- **Bound every identity field, always.** This is the rule that generalises,
  and it is the one most often missing, because an identifier is short in
  every example anyone writes and is therefore the field nobody thinks to cap.
  One audited ingest service bounded every *other* caller-supplied identifier
  it accepted — a project id at 64 characters, a prompt identifier at 128,
  both validated with the limit named in the error and both tested at the
  boundary — while its three trace identifiers had no cap at all, so a single
  event could carry the entire request body limit as one identifier straight
  into the store. The discipline was present and had simply never been pointed
  at the trace fields. **Reject over the cap; never truncate.** Truncating an
  identifier is silently lossy in the one way that matters: two distinct
  traces sharing a prefix collapse into one, and the corruption is invisible
  in exactly the view built to explain an incident. For free-form state a
  truncation is defensible; for an identity it destroys the identity.
- **Validate an identity field against a grammar only where the boundary
  committed the caller to one.** Where the surface promises a format — a
  standard propagation header, whose grammar *is* its contract and which is
  meaningless if it does not conform — non-conformance is decidable and a
  failing value is rejected: mint a fresh root, and **record that an inbound
  value was rejected**, naming the boundary that received it. But a grammar is
  not always available, and its absence is often deliberate rather than
  sloppy: an ingest surface that accepts caller-chosen correlation ids by
  design has no alphabet to check against, and one such service pins opaque
  identifiers as a tested feature precisely because its callers never adopted
  the standard format. **Applying a grammar rule there deletes a shipped
  capability.** So bounding is the defence that always applies and grammar is
  the defence that applies where a format was promised — and where the grammar
  is unavailable, the bound is the whole of it. Say which case a boundary is
  in, rather than assuming the strict one. Propagation formats specify their identifiers exactly —
  fixed length, fixed alphabet, a forbidden all-zero value — so conformance
  is decidable, cheaply, at ingress where a format was promised. Dropping a
  rejected value silently leaves a fractured trace with no explanation of the
  fracture
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The
  validator must read the inbound field itself, not the envelope that looks
  trustworthy around it
  ([gate-sees-target](../../../../_laws.md#gate-sees-target)) — a request
  that arrived over an authenticated channel still carries propagation
  fields the caller wrote by hand.
- **Bound anything free-form.** Where the format allows a vendor-extension
  field carrying arbitrary key-value state, it gets a length cap at ingress,
  enforced before the value reaches the store.
- **Refuse the unbounded carrier entirely.** The propagation standards also
  define a general-purpose bag for arbitrary caller-supplied key-value state,
  unbounded by design. No cap makes it *safe* to record: a cap bounds volume,
  not content, and there is no grammar left to check the content against. A
  public boundary records none of it. Generalised: **a propagation field with
  no schema and no bound cannot be recorded at a trust boundary.** Note the
  limit this leaves standing, and state it rather than implying the boundary
  is now closed: a bound caps volume, not content. Whatever fits under the cap
  still lands verbatim in the store, the list view, the id in a path, and every
  log line read during an incident — control characters, escape sequences,
  homoglyphs, a string shaped like some other trace's id. Where no grammar is
  available to exclude them, the residue is an output-side obligation on the
  viewer and the log formatter, in a different layer, and the propagation
  boundary should say so instead of appearing to have solved it.

The seam is worth stating because neither neighbour covered it. This
technique owns propagation and, until this section, assumed a sender you
control;
[untrusted-result-handling](../../../runtime-and-io/mcp-tools/techniques/untrusted-result-handling.md)
owns untrusted data arriving as *results*. Untrusted data arriving as
*propagation metadata* is neither, and it is the one that writes straight
into the incident record.

## Chained runs: continue, or link — decide, don't drift

When run B is caused by run A — a follow-up turn, a healing attempt, a
scheduled successor — there are exactly two honest structures:

- **Continuation**: B's spans join A's trace, as children of the handoff
  point. Right when A and B are one logical run in the user's mind and the
  gap between them is short. The cost: the trace's lifetime and ceiling now
  span both.
- **New trace with a link**: B mints its own trace id and records A's
  identity as a *predecessor reference* (and A, when still writable, records
  a successor reference). Right when B is operationally its own run —
  separately retried, separately retained, separately billed.

Either is defensible; the failure mode is deciding *neither*: B silently
starts fresh with no reference, and the causal chain — the very thing an
investigator walks — exists only in someone's memory. Products with retries,
healing, or scheduling need the linked form as their default, because those
successor runs are precisely the ones investigated most.

## Clocks skew; only durations are portable

Each process stamps spans from its own clock, and clocks across process and
machine boundaries disagree — by milliseconds on one host, by seconds across
hosts. Two rules keep the waterfall honest:

- **A duration is trusted only from the clock that measured both ends.**
  Never compute an interval from a start stamped by one process and an end
  stamped by another; that interval measures clock skew, not work.
- **Alignment is a render-time adjustment, not a data mutation.** The viewer
  may shift a child fragment so it nests plausibly inside its parent (a child
  that "starts before" its cause is skew, not time travel), but the stored
  stamps stay as recorded, with the clock domain noted. Rewriting stamps at
  capture destroys the evidence needed to correct alignment later.

## Verify the seam, not the halves

Propagation bugs live *between* components, where neither side's tests look.
The test that catches them is end-to-end by construction: drive a run across
every boundary the product has — interface to engine, engine to subprocess,
across one queue, across one chained handoff — then assert **one trace id,
one root, zero orphans** in the assembled tree. Run it whenever a boundary
changes shape. Every fracture this technique names was shipped by a team
whose per-component trace tests were green.
