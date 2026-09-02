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
