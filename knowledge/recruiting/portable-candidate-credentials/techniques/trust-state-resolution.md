---
layer: technique
type: technique
subject: portable-candidate-credentials
technique: trust-state-resolution
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
use_when: [designing what a verification check returns, building a credential verification surface, adding a new failure case to a verifier]
---

# Trust-state resolution

## The concern

A verifier is asked one question and must return exactly one answer, drawn from a closed
set, produced by a stated order of checks. Everything else — badge colour, copy, whether
numbers render, what the reader is told to do next — hangs off that single resolved value.

The alternative, which is what most systems grow into, is a bag of independent booleans:
signed, valid, expired, present, complete. Each is set somewhere different, each is
checked somewhere different, and the surface ends up computing its own verdict inline
with a chain of conditionals that no two templates write the same way. The first
consequence is inconsistency; the second and worse is that a case nobody enumerated
lands in whatever branch happens to be last, which is usually the optimistic one.

One resolved state, computed once, in one place, is the technique.

## The state set

Closed, small, and each state must name a genuinely different thing a reader should do.

| State | Means | Reader's next move |
| --- | --- | --- |
| **verified** | signature checks, form version known, payload substantive, within freshness | trust the content as issued |
| **stale** | verified in every respect, outside the freshness window | trust it as a dated fact |
| **superseded** | verified, but sealed under a retired methodology | treat the result as uninterpretable today |
| **revoked** | the issuer deliberately withdrew it, usually because it was reissued | ask the bearer for the current one |
| **unsigned** | no signature material was ever attached | treat as an unattested claim, like any document |
| **structurally empty** | signature checks over a payload with no substance | treat as no assessment at all |
| **unverifiable** | cannot complete the check — unknown key, unknown form version, malformed envelope, backing record gone | no conclusion; ask the issuer |
| **tampered** | key known, version known, material well-formed, digest disagrees | treat the artifact as untrustworthy |

Resist the pressure to add a state per cause. Causes are *diagnostics*, carried alongside
the state for your own operators; they are not states. A verifier that returns eleven
states has pushed its internal taxonomy onto a stranger who wanted a yes or a no, and
per
[meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label), the
extra labels do not carry the
extra meaning anyway — the reader collapses them back to good, bad, or confusing.

## Procedure

**1. Resolve in a stated order, and let the first match win.** A workable order: has the
issuer withdrawn it (→ revoked); is signature material present at all (→ unsigned); can
the check be *performed* — key known, form version known, envelope well-formed, backing
record reachable (→ unverifiable); does the digest agree (→ tampered); is there substance
(→ structurally empty); is the methodology retired (→ superseded); is it within the window
(→ stale); otherwise verified.

The three placements that matter. **Revoked first**, because a deliberate issuer statement
outranks every derived check and a withdrawn credential's other properties are irrelevant.
**Unverifiable before tampered**, which has its own technique and its own reasons.
**Substance after integrity**, because an empty payload that also fails its signature is a
broken artifact, not an empty one.

Note the shape this gives the code: a single pure function from a small record of booleans
to one state, with no data access and no rendering in it. That is what makes the ordering
reviewable and testable at all — an order that lives as nested conditionals across three
templates is not an order, it is a rumour.

**2. Return one value plus a basis, never a bare flag.** The resolved state travels with
what was checked, what was skipped, the form version, the key generation, and the dates
involved. A verdict with no basis is the credential version of a rate with no denominator,
and the moment someone disputes it you will have nothing to show.

**3. Compute it server-side, once, in one function, and make it the only way to learn a
credential's status.** If a template can reach the payload and derive its own opinion, it
eventually will, and it will differ.

**4. Make the state exhaustive at the type level if your language allows, and make the
default branch a failure rather than a pass.** A new failure case added in six months must
either be handled everywhere or refuse to compile — never fall through to verified.

**5. Give every state its own copy, written for a stranger, not a diagnostic string.**
Each needs three sentences: what the system found, what that means, what to do next. The
copy is not decoration; it is where the technique either keeps its honesty or loses it.

## Decision rules

- **When a new failure cause appears, map it to an existing state before inventing one.**
  Most new causes are new flavours of unverifiable. Adding a state is justified only when
  a reader would genuinely act differently.
- **When two states could apply, the earlier one in the resolution order wins, and the
  order is chosen by which reading is safer for the bearer.** Per
  [say only what the record holds](../../_laws.md#say-only-what-the-record-holds), prefer
  the state that claims less.
- **When resolution cannot complete because of a transient outage on your side, that is
  unverifiable — and it must say "try again", not "no".** A momentary failure that renders
  as a negative verdict about a person's credential is your outage becoming their problem.
- **When the credential is presented on a surface the issuer controls and one the issuer
  does not, resolve identically.** A credential that looks better on the issuer's own page
  than on a copy the candidate exported is not portable; it is a hosted advertisement.
- **Never let a state be settable.** It is derived from the artifact and the register at
  read time, always. A stored status column drifts from the artifact the day someone
  backfills it.

## When not to use this

- **Not for the employer's internal audit verification.** That surface reports a census —
  scopes covered, records checked, where keying begins — because its reader is an auditor
  who wants coverage, not a stranger who wants a yes or no. The audit discipline owns it.
- **Not as a place to encode hiring outcomes.** Hired, rejected and withdrawn are not trust
  states. A credential attests an assessment, not a decision, and mixing the two puts a
  rejection on an artifact the candidate is meant to want to show.
- **Not a substitute for the copy work.** A perfectly modelled state machine rendered as
  seven coloured chips with no sentences is a verifier only its author can read.
