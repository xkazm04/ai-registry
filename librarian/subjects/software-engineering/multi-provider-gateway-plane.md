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

## 2026-09-04 - a second gateway, two days later (`workweave-router-0904`)

`/intake` 2.5.0 over `weave-os/router` @ `1699cf6`, a Go model router for agentic
systems — the first *independent* system to reach this subject since it was forged
from a different gateway on 2026-09-02. That was the point of running it: a
single-sourced subject cannot tell which of its techniques describe gateways and
which describe one gateway.

**The routing count did not fire, and that is the finding.** Eight design decisions
across three systems, four unhomed; the largest system reached three, which under
v2.2 would be a forge — except its home already existed. Forty-eight hours earlier
this tree would have been a forge job. The Portkey run built the home that absorbed
it, and the corroboration arrived instead as two techniques inside it.

**Two techniques added.** `exclusive-authorship-of-a-measured-decision` merges two
design-record entries that turned out to be one root — *a decision you intend to
measure must be the only thing that determined the outcome you record.* Nothing may
answer in its place (a per-request fallback and an evaluation of the thing it
protects cannot coexist; the fallback is a survivorship filter attached to what it
protects, and the source names the four substitutes that buy availability without
it, plus the operator-lever/per-request distinction that most discussions of
"fallback" conflate). Nothing may override it afterwards (authority is the
*enumerated* suspension of six other writers, with the deliberate exception stated
and reasoned). And something must check — with the remedy that surprised the
technique: on a decided-versus-served mismatch, **drop the sample rather than
correct the record**, because a corrected row still attributes an outcome to a
selector that did not produce it.

`one-typed-carrier-for-echoed-state` covers a topology this subject had not
separated from the composer's: a plane that keeps no transcript, so the *client's
next request is the record*. Carrier chosen by which field a stock SDK is obliged to
round-trip rather than by where the state belongs; exactly one carrier, because a
second is a rejection surface rather than redundancy. The reusable half is a
discriminator the source states twice in opposite directions and never names:
**defensive redundancy is safe subtractively and unsafe additively** — stripping
twice is idempotent, carrying twice hands a well-behaved client an extra thing to
echo into a validator that refuses unknown keys.

**Corroboration for the subject's existing ground, from outside.** `router-versus-candidate-failure`
and `policy-verdict-in-the-status-space` both hold here: this router carries the
router/candidate distinction and answers 503 rather than synthesizing a
candidate-shaped error. `caller-scoped-normalization-strictness` holds on the
response path and was found to have a **request-path gap** it does not cover — a
requirement derived from what the wire path can *represent* (unknown extension
unions destroyed by an IR round trip) is a candidate filter, not a caller
preference, and the switch cannot recover material destroyed at ingress. Recorded
untriaged with anchors, not landed; it is a real gap and the first thing a later run
should take.

**Applied `code` to personas, shipped.** The technique's third rule found a live
defect: an audit flag computed from an enum with one variant, constant `false` on
0 of 6,163 real rows, over a model ladder free to downgrade two tiers. The
structural fact is better than the fix — the project writes the decided and the
served model to the same column, so the comparison the rule wants is not merely
absent but unstorable.

## Open leads (2026-09-04)

- **Where a substitution decision belongs when two layers can make it.** This router
  declines the wrapped-CLI ecosystem's own `--fallback-model` and keeps its failover;
  the fleet peer does the same. Two sightings. Return on a third, or on a system that
  moved the decision in either direction.
- **The deterministic half of an ML decision.** A measured incident (19.8% of
  balanced-cluster turns to maximum-tier arms, $821 of $1,022 of that cluster's
  spend) drove moving roster ownership and the deterministic selection walk out of an
  ML sidecar into a layer that validates fail-loud at boot, shrinking the sidecar to
  the inference only. `corpus: NONE`; nearest neighbour models the config axis, not
  this one. Untriaged for budget, not doubt — anchors are in the source note.
