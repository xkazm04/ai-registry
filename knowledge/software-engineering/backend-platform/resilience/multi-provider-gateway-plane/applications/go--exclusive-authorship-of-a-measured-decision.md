---
layer: application
type: application
subject: multi-provider-gateway-plane
technique: exclusive-authorship-of-a-measured-decision
stack: go
status: forged
verified_on: 2026-09-04
verified_against: go@1.25.0
---

# The plane that removed its own fallback, and wrote down what replaced it

`weave-os/router` at `1699cf603e0bfd7cd87c027d7e6407155b20b53e` is the positive
instance of all three rules, and it is useful mainly because it states the
*reasoning* rather than only the rule. The stack version is witnessed by the
module's own `go 1.25.0` directive (`go.mod:3`), not by a dispatch's guess.

## Nothing answers in its place, and the replacement is enumerated

`docs/POLICY_ROUTER_HARNESS.md` puts it in four sentences under the ownership
boundary: *"There is no strategy fallback. If a serving policy cannot return a
valid selection after bounded transient retries, the client receives HTTP 503.
Availability comes from healthy replicas, readiness gates, immutable artifacts,
and staged rollout rather than a second hidden policy."*

The value is in the last clause. Most statements of this rule stop at the
prohibition and leave the availability question unanswered, which is why the
rule loses the argument the first time a policy process crashes. Here the four
substitutes are named, and each reappears as a release gate the policy must pass
before it serves production traffic: at least two ready replicas surviving a
single-replica loss test; a readiness probe that asserts the *exact artifact and
roster are loaded* rather than that the process is up; an immutable artifact ID
plus a verified SHA-256, with production forbidden from resolving `latest` or a
mutable URL; and installation allowlisting before a global promotion.

The operator-lever distinction is explicit in the promotion procedure: promote
by changing the default strategy, *"keep an explicit installation override
available for operational rollback; do not add an automatic per-request
fallback."* Both moves substitute one selector for another; only the second is
forbidden, and the file does not conflate them.

## The measured failure that produced the rule

The tree records why, twice, and neither instance is hypothetical.

The retirement is stated as a prohibition in the root guide's *What to NOT do*:
*"Do NOT re-introduce heuristic-vs-cluster A/B switch. Heuristic retired because
silent-fallback behavior masked cluster regressions."* The corollary — that a
runtime fallback is not an A/B — is given as the correct alternative in the same
breath: ship the alternate strategy as another package and promote it on its own
merits.

`internal/router/CLAUDE.md` states the same rule as an obligation on every new
`Router` implementation: *"Failure modes return errors, not silent fallbacks…
silent fallback to a default model masks regressions + lets quality silently
degrade in eval + prod."* The two failure surfaces are named separately, which
is the point — a fallback corrupts the evaluation *and* the production signal,
and a team that only holds the second reason will accept a fallback in the
eval-only path.

## The suspension list is written down, with its exception

`authoritative_per_turn_selection` is where the second rule is implemented, and
the harness contract lists exactly what a `true` disables for those turns:
automatic session reuse, expected-value planner overrides, model-changing
baseline failover, semantic-cache hits, and router-generated summarizer calls —
plus a bypass of post-selection synthetic loop breakers, stated with its
invariant: *"so one accepted policy action maps to one selected model dispatch
attempt."*

Six writers, enumerated rather than assumed. The document also does the harder
half — it names the mechanism that is deliberately **not** in the list and says
why: the subscription usage-bypass gate *"decides whether a turn is routed and
billed at all"*, so it sits upstream of selection rather than beside it and the
`/route` call is never made for those turns. An exception stated with its reason
is the difference between a list a reader can extend and a list a reader has to
reverse-engineer.

## The mismatch check, and the remedy that surprised the technique

`POST /outcome` carries `selected_model`, `selected_provider`, `served_model`,
`served_provider` and — the field that does the work —
`selected_served_model_match`. The decided value and the served value are
separate fields on the same record, so the comparison is a property of the row
rather than a join somebody has to remember to write.

The remedy on mismatch is the part worth copying: *"An authoritative model
mismatch is marked ineligible for training and logged as an error."* Not
corrected, not silently accepted — **excluded from the thing the record feeds**,
and raised as an error rather than a warning, because a mismatch means a writer
nobody inventoried is still live. This is the instance that put the "drop the
sample rather than correct the record" rule in the technique; the rule is not
obvious and the tree is the only place it was found stated.

## What this realization cannot do

Three limits a reader should price before copying it.

The plane is a hosted service with a control plane, so every substitute for the
fallback is available to it: it can run two replicas, stage a rollout by
installation, and answer 503 because a caller's client will retry. **A
single-process, single-operator deployment has none of those**, and the honest
port of this rule there is not "return an error to your user" — it is to keep the
substitution and make it *visible*, which is what the technique's first
"when not to use it" clause covers. The rule as written is about substitutions
that are invisible downstream, and a desktop application that can show the user
which model answered has made it visible.

The exclusivity is also only as good as the enumeration, and the enumeration is
maintained by hand. Nothing in the tree tests that the list of suspended
mechanisms is complete; a seventh mechanism added next quarter is caught by the
`selected_served_model_match` check *after* it has already polluted some rows,
not before. The mismatch check is the backstop precisely because the list will
be wrong.

Finally, the strongest claim here — that the fallback was masking regressions —
is recorded as a design rationale, not as a measurement. The tree states the
conclusion and the decision it drove; it does not publish the before-and-after
numbers that would let a reader size the effect. The 19.8% / $821-of-$1,022
figure that *is* published belongs to a different failure (a silently-dropped
roster binding, `docs/HMM_GO_SELECTION.md`) and should not be borrowed as
evidence for this one.
