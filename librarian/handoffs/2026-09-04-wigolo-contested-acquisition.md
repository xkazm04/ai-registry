# XL spec — `contested-acquisition` (software-engineering / integration)

**Status:** PROPOSED
**Source:** `librarian/sources/2026-09-04-wigolo.md` (vendor repository, commit `c6ad4479`)
**Routing count (Phase 2d, v2.2):** per-system 4 `corpus: NONE` in one system
(the acquisition subsystem, 10,245 lines); cross-system `HOME IF NEW` clause:
the same 4 share `software-engineering/integration`. Both clauses fire on one
system, so the handoff is **scoped to the system**, not to the repository.

## Why a subject and not four techniques

`software-engineering/integration/web-scraping` is a mature, well-forged subject
whose centre of gravity is **rules-as-data extraction into a dataset**. Its own
pipeline table gives Acquire one row and one failure story — *"network errors,
blocks, rate limits — loud failures"* — and its eight techniques sit at Extract,
Reconcile, Schedule and Detect. Acquire owns exactly one technique, and that one
(`negotiated-representation-probe`) is about content-type negotiation, not about
being refused.

This is the missing-stage-one shape the method predicts: a subject thorough from
stage two onward. The four mechanisms below all live at that stage, none has a
home, and they are not variations of one idea — they are a classifier, a
precedence rule, a credential-reuse rule and a trust-propagation rule.

**The discriminator against `web-scraping`, which must be stated in both
subjects and must not be resolved by preferring one:** `scrape-scheduling`
models `blocked` as a *terminal run outcome* — pause the schedule, page a human,
never retry — and that is correct for what it governs. A scheduled harvester has
an ongoing relationship with a target it will still need tomorrow; its cheapest
correct move on a refusal is to stop. The subject specified here governs the
other side of one question:

> **Is this a repeated harvest of a target you must still be welcome at
> tomorrow, or a single-shot retrieval of one document a caller is waiting
> for right now?**

For the second, stopping is not restraint, it is a silent empty answer. What it
owes instead is a *bounded, classified, honestly-reported* response — which is
this subject. Neither posture is a correction of the other.

## Placement (verified against the authority, not against a count)

`knowledge/software-engineering/taxonomy.json` — `integration` is a **flat**
category (`subjects: [...]`, no `subcategories`), currently 9 subjects. A 10th
does not create the forbidden both-subjects-and-subcategories shape.

- Resolved path: `knowledge/software-engineering/integration/contested-acquisition/`
- Link depth, identical to `web-scraping`: golden path uses `../../<category>/…`
  and `../../_laws.md`; a technique uses `../../../<category>/…` and
  `../../../_laws.md`.
- Taxonomy edit: **append** `"contested-acquisition"` to the `integration`
  subjects array. Never reorder.

## Proposed techniques

Each must carry `use_when` and a decision rule, not a description.

### 1. `classify-before-you-respond`

**Decision rule:** when an acquisition is refused, classify the refusal into a
closed set *before* selecting any response, and let the class decide which
responses are applicable — including the classes for which the applicable set is
empty. A class with no applicable response runs nothing and returns an honest
negative.

**Forces:** the responses are not fungible and not comparably priced — a
gesture, a model call, a person's attention. Running them speculatively spends
real money against an outcome the class already made impossible, and produces a
"we tried" the caller cannot distinguish from a genuine failure.

**Must carry:** the honest negative as a *first-class return value* that the
caller's refused path depends on — not the absence of a success.

**Anchors:** `src/fetch/challenge-classify.ts:1-40`, `src/fetch/solve-ladder.ts:8,94`.

### 2. `under-claim-the-solvable-class`

**Decision rule:** when capability and confidence are inversely ordered — the
more tractable the class, the less certain you are the evidence really is that
class — ambiguity resolves to the **least capable** class, always.

**Forces:** the evidence for the tractable classes is exactly the evidence an
adversary can fabricate, so an optimistic read produces a confident claim to
handle something you cannot, whose failure is indistinguishable from a real
attempt.

**Must carry:** why the usual most-specific-marker-wins and
highest-capability-wins precedences are both wrong here, and the test — *does
your classifier's error direction point at an honest refusal?*

**Anchors:** `src/fetch/challenge-classify.ts:22-33`.

### 3. `holder-reconstructed-binding`

**Decision rule:** when you hold a credential that its **issuer** bound to a
fingerprint it never disclosed to you, reconstruct the binding from what you can
observe: record the egress identity at the moment of harvest, refuse reuse on
mismatch, run the **same normalization on write and on read**, and fail closed
on an unparseable expiry.

**Forces:** the credential is bound to something like `{IP, UA, TLS}`; replaying
it from elsewhere is not merely useless, it is itself a signal. Two different
normalizations across the write and read sides kill reuse silently, and they do
it for exactly the population that needed reuse most.

**Must carry:** the refusal is *hard* where the presenting tier re-presents the
minting identity and *best-effort* where a re-validation path exists to catch
the miss; and the legacy-row rule — a stored value predating the capture is
treated as the only value it could have had, so it replays on that route alone.

**Boundary to state, not to absorb:**
`security/identity-and-access/device-pairing/techniques/token-binding-and-transport`
owns this from the **granting** side — born bound, constraints attach at mint.
That technique is complete for the credential *you* mint. This is the holder's
problem when the binding was never disclosed. Link it; do not restate it.

**Anchors:** `src/fetch/clearance-reuse.ts:40,52,64,73-90`.

### 4. `rung-trust-does-not-promote`

**Decision rule:** a delegated step's product carries that step's trust tier
forward. Use it for the request in hand; never store it where a later read will
find it indistinguishable from one you produced yourself.

**Forces:** a uniform interface across steps of unequal trust is exactly what
makes the tiers invisible at the point of reuse — the store is read by code that
has no idea which step filled it.

**Must carry:** the corollary that a delegated step which *egresses* the request
off-machine changes what may be logged, and that this is a property of the step,
not of the deployment.

**Anchors:** `src/fetch/escape-hatch.ts:9-18`.

### 5. `no-surface-no-rung`

**Decision rule:** a step that requires a human returns immediately — without
notifying and without polling — unless consent AND a surface both exist. A
timeout is not the safety net; the gate is.

**Forces:** on a headless or hosted deployment nobody is watching, and a step
that merely times out there burns every refused request's full budget waiting
for someone who will never arrive. Consent alone is not the gate: an operator
can consent on a host with no display.

**Must carry:** why the degradation must be *immediate and named* rather than
slow and shaped like a genuine failure.

**Anchors:** `src/fetch/human-solve.ts:8-20,84,108`.

### 6. `sequencer-owns-order-not-engines`

*(the drafter decides whether this is a technique or a golden-path section — it
is the weakest of the six)*

**Decision rule:** the module that decides *which* steps run and in *what order*
imports none of the engines that execute them; every step is injected. And: an
escalation that **wraps** the whole operation is not a slot in the sequence —
forcing it in misplaces it.

**Anchors:** `src/fetch/solve-ladder.ts:1-26,117-121`.

## Boundaries this subject must NOT absorb

- **Rate limiting, backoff and politeness.** Owned by
  `backend-platform/resilience/rate-limiting` and `…/retry-backoff`, and by
  `web-scraping`'s legitimacy posture. Cite; do not restate.
- **Extraction, rules, datasets, shape-change detection.** All `web-scraping`.
  This subject ends when the bytes are in hand.
- **The scheduled-harvest posture.** `scrape-scheduling` owns `blocked` as a run
  outcome and is right. State the discriminator; do not correct it.
- **Credential minting.** `device-pairing`. See technique 3.
- **Any circumvention recipe.** The subject is about spend discipline, honest
  reporting and trust propagation under refusal. It must not carry vendor
  detection strings, evasion techniques, or a "how to get past X" register. If a
  section can only be written by naming what to defeat, it does not belong here.

## Open questions the drafter must DECIDE, not discover

1. **The subject's own name for the refused state.** `web-scraping` already
   spends `blocked`. Pick a word that does not collide, and use it everywhere.
2. **Whether technique 6 survives.** It is half dependency injection (generic)
   and half a real observation (a wrapping escalation is not a rung). If only
   the second half is load-bearing, fold it into the golden path.
3. **Where the honest negative sits in the golden path's own pipeline table.**
   The subject needs a stage table like `web-scraping`'s, and the honest
   negative is an *output* of the acquire stage, not a failure of it.

## Amendments landing beside the subject (the director's job, not the worker's)

- `integration/document-text-extraction/techniques/recognition-boundary-and-escalation`
  — its rule is *"escalate the refusals, never the format,"* and its `When not
  to use this` enumerates one exception. The missing case: the cheap path can
  fail **without producing a verdict at all**. Anchors:
  `src/fetch/router.ts:56-90,401-423`.
- `security/identity-and-access/device-pairing/techniques/token-binding-and-transport`
  — one reciprocal paragraph naming the holder's side, pointing at technique 3.
- `integration/web-scraping/web-scraping.md` — the acquire row of the pipeline
  table says blocks are *loud*. Name the discriminator; point at the new subject.

## Primaries the drafter may spend its web budget on

The tree itself is the primary and it is on disk at the path given in the
dispatch. Prefer it. At most one fetch, and only for the public specification of
a refusal-signalling mechanism if the drafter needs one to write technique 1 at
the right altitude.

## Override the brief

If the neighbours' stated scopes contradict any placement or boundary above, say
so in the report and do the right thing instead. Both workers dispatched on
2026-08-22 overrode their briefs and both were right.
