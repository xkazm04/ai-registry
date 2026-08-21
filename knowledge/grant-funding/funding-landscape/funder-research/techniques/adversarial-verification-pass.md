---
layer: technique
type: technique
subject: funder-research
technique: adversarial-verification-pass
status: forged
laws: [never-fabricate-a-figure, untrusted-text-is-data]
shared_with: []
use_when: [deciding whether a discovered opportunity is real, hardening a research pipeline against confident fabrication, choosing between cheap and expensive verification signals]
---

# Adversarial verification pass

Discovery output cannot be verified by inspecting discovery output. A
fabricated program is optimized — by the very fluency of the instrument that
produced it — to look exactly like a real one: plausible funder, plausible
amounts, a web address on a believable domain. The only test that
discriminates is contact with the world. The technique: a **second,
independent pass whose explicit job is to refute the candidate**, with its own
web access, a burden of proof placed on existence, and a fail-closed default.

## The adversarial framing

The verifier is not asked "is this correct?" — a framing that invites
agreement, since the candidate is the only evidence in view and it looks
fine. It is asked to *independently confirm*, with the instrument pointed the
other way:

- **Fetch, don't recall.** The verifier must retrieve the claimed source — and
  search beyond it if needed — and confirm three separable facts: the funder
  exists, the program exists, and applications are open today. Confirmation
  from the verifier's memory of the world is worthless here; memory is the
  same substrate the fabrication came from.
- **Default to refuted.** Every failure — page unreachable, page exists but
  describes something else, verdict unparseable, the verification call itself
  erroring or timing out — resolves to "not confirmed," never to "probably
  fine." The pass must be built so it *cannot throw*: any exception becomes a
  refuted verdict with the failure as its reason. A verification stage that
  crashes open is a verification stage that fabricators pass through at
  exactly the moments infrastructure is flaky.
- **Separate real from open.** "The program exists" and "applications are
  open now" are distinct verdicts with distinct downstream meaning: refuted
  existence drops the candidate outright; confirmed-real-but-not-open is a
  legitimate intelligence row (a recurring program to watch) that must not
  enter the actionable corpus as applyable. Collapsing the two into one
  boolean loses the difference between a lie and a season.
- **Demand a reason.** The verdict carries a short free-text justification.
  It costs nothing, it lets a reviewer audit refusals for over-strictness,
  and a verifier forced to articulate *why* it confirmed is measurably harder
  to satisfy than one returning a bare boolean.
- **Localize the pass.** Tell the verifier what language the source is likely
  in. A verifier that expects one language and lands on a page in another
  refutes real programs — a systematic false-negative bias against exactly
  the jurisdictions where research-grade discovery matters most.

## Layering with cheap signals

A deterministic reachability probe — request the claimed address, accept any
success or redirect — is nearly free and worth running. But understand what
each layer can and cannot conclude:

- **Reachability failure is weak evidence.** Funder sites reject automated
  requests routinely; a blocked probe on a real page is common. So an
  unreachable address *lowers confidence* but must not drop the candidate on
  its own — the adversarial pass, which browses more like a person, rescues
  real-but-probe-blocked programs.
- **Reachability success is weaker evidence.** A live page proves a server
  answers, not that the program is real or open. Probe success never
  substitutes for the adversarial verdict.
- **Order by cost.** Structural validation and duplicate checks run first,
  then the probe, then the adversarial pass — the expensive check runs only
  on candidates that survived everything cheaper.

## Decision rules

- When the verifier refutes, drop the candidate from staging but keep it in
  the run log with the refusal reason — refusal patterns are how you tune
  both the discovery instruction and the verifier itself.
- When the verifier confirms real but not open, route the row to funder
  intelligence, never to the actionable corpus.
- When refusal rates spike on one jurisdiction, suspect the verifier's
  language or source assumptions before suspecting a fabrication wave —
  systematic false negatives cluster geographically.
- When budget forces sampling, verify every row from generative discovery and
  sample rows from structured feeds — the fabrication risk lives in the
  generative path.

## When not to use

Do not spend adversarial passes on rows from a trusted structured feed
already covered by ingest-time validation — the pass exists for
research-grade, generatively discovered candidates, and applying it uniformly
burns budget where the risk isn't. Do not let a confirmed verdict promote a
row on its own authority: verification is one input to the human gate, not a
bypass of it. And never share context between discoverer and verifier — a
verifier that can see the discovery conversation inherits its assumptions,
and independence is the property the whole technique rests on.
