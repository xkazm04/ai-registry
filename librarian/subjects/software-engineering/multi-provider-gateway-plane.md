---
subject: multi-provider-gateway-plane
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# multi-provider-gateway-plane

Born 2026-09-02 from `/intake` run `intake-portkey-0902` (intake 2.1.1, round 3 of the
2.x series, every worker Opus): a scoped forge handoff over the request plane of a
multi-provider gateway, where four design decisions carried `corpus: NONE` and one home -
the request plane of a process that fronts many providers for many callers - and a fifth
(the policy verdict in the status space) was decided into the subject by the drafter.
Placed in `backend-platform/resilience` (ninth of ten) beside `stream-proxy-hop`, which is
the same shape at N=1 and the boundary the golden path writes first; `retry-backoff` owns
the failure lane this plane composes over; `model-routing` owns which-model; the
normalization-for-accounting subject in the observability bundle is a boundary stated in
prose (record vs product). Two slug overrides argued by the drafter
(`router-versus-candidate-failure`, `adapter-direction-asymmetry`). Director review: gate
green, purity clean (false positives "laws", "trust", "invites"), `use_when` on all six,
taxonomy last, one cited line opened. Spec:
`docs/subject-proposal-multi-provider-gateway-plane.md` (EXECUTED). Fleet: pumper is the
structural peer (engines behind one interface) and received a direction proposal for
router-versus-candidate attribution; tracklight ingests rather than fronts. Deviations
for the source-tree backlog in the handoff plan: two carriers for one attribution, an
unevaluable predicate routing to default, an unbounded framer, falsy-means-absent on
three inherited keys.

## 2026-09-03 — [[2026-09-03-llmfit]] (intake `llmfit-0903`)

**Stage zero landed.** The subject was forged from a serving gateway and is thorough
from *"a request arrives"* onward; every section begins from a **configured tree of
candidates**. A hardware-fit advisor over six local runtimes supplied the half that
was missing — how a plane learns which upstreams exist and which implementation is
behind each address — and it is a missing *stage*, not a missing opinion.

Three techniques plus a golden-path section before "The failure this subject exists to
prevent": `upstream-identity-before-inventory`, `named-members-over-a-uniform-collection`,
`join-breadth-follows-the-wrong-match-cost`. Six applications now (`node` ×1, `rust` ×3
source-tree, plus the two the peer studies left).

**The finding to remember** is the third one, because it is a **cross-bundle
inversion** rather than a gap. The observability bundle publishes the opposite rule
for the same craft — match by *family*, not equality — and is right, because there a
miss silently deletes real spend from a total. Here a broad key marked 238 of 9,250
catalog rows installed from one install. The discriminator now stated on both sides in
prose (no link, per the cross-bundle rule): **does a miss delete something real, or
does a false positive assert something false?** If a later run finds a third sighting
of this shape, it is law-shaped, not technique-shaped.

**Structural fact from the source tree, worth keeping:** the `ModelProvider` trait is
implemented eight times and dispatched through zero times in 54k lines. Nobody wrote
that as a principle; it fell out of two requirements — per-member match semantics and
per-member failure policy — that a uniform collection cannot express.

## Open leads

- **Identity rules as dated observations.** The source dates every discriminator to
  the live server and version it was measured against. Whether a technique should
  require a *decay policy* on such a table, not merely a date, is unresolved. Return
  when a second source records one of these tables having gone stale in production.
- `upstream-identity-before-inventory` is unproven for the **policy** half: the source
  never routes a request, so whether `Unrecognized` is genuinely routable-around is
  untested. A serving gateway would settle it.
