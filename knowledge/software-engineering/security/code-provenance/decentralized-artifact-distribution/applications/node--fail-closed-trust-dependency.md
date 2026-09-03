---
layer: application
type: application
subject: decentralized-artifact-distribution
technique: fail-closed-trust-dependency
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@22.16
---

# Demotion and deny-all in a federated plugin registry

Citations are against `github:emdash-cms/emdash` at commit
`7a5d9c1838f6afc5649b7bc0940eacf920b40dab`. The version witness is the root
`package.json` `engines` field — `"node": ">=22.16"` — which is the runtime
under which the aggregator's `typecheck` and `test:unit` workspace scripts run;
the tree pins no separate runtime for the aggregator itself.

This is the strongest realization of the technique in the tree, and it supplied
two of the technique's rules rather than merely confirming them.

## The timeout carries its derivation

`apps/aggregator/src/label-source-health.ts:1-4`:

```
// Two scheduled-maintenance intervals and twice the labeler identity TTL.
// A healthy idle subscription therefore gets a reconnect/catch-up opportunity
// before its authority is withdrawn at the exact boundary.
export const REQUIRED_LABEL_SOURCE_HEALTH_TIMEOUT_MS = 10 * 60 * 1_000;
```

Ten minutes is not a round number here; it is the sum of two named inputs
belonging to the *source*, not to the index, and the comment states the property
the sum is chosen to preserve — that an idle-but-healthy statement source gets a
full reconnect-and-catch-up cycle before it is demoted. This is the upward
lesson: the technique's rule that the health timeout be derived from the
source's own reconnect budget, and stated beside the constant, is written here
in three lines.

## Demotion is subtractive and propagates in one transaction

`markLabelSourceFailure` (line 101) issues three statements as a batch, and the
set is the technique's demotion rule almost clause for clause:

1. Record the failure: `health_failure_started_at` set once via `COALESCE` so it
   marks the *first* failure of a run rather than the latest, plus a failure
   count. This is what lets an operator distinguish a blip from an outage that
   started on Tuesday.
2. Withdraw authority: `trusted = 0` on the source, but **only** when it holds
   one of the three grants (`required_positive = 1 OR accepted_state = 1 OR
   redaction = 1`) and only when the elapsed time since last success — or since
   the first failure — has crossed the derived timeout. An advisory source going
   quiet demotes nothing.
3. Propagate to stored statements: `UPDATE label_state SET trusted = 0 WHERE
   src = ?`, guarded by an `EXISTS` re-check of the source's state. This is the
   half the technique warns is usually skipped; without it the demotion is
   decorative in exactly the queries that decide visibility.

The same batch sets `replay_pending = 1` and increments `replay_generation`,
which is the technique's recovery rule made structural. Restoration lives
elsewhere (`apps/aggregator/src/label-source-policy.ts:160-197`) and is guarded
on the generation counter: `trusted = 1, replay_pending = 0` applies only
`WHERE ... policy_version = ? AND replay_generation = ?`, and the function
confirms the result with a follow-up read requiring `replay_pending = 0` before
returning success. Reconnection alone restores nothing; a source that comes back
owes the gap, under the policy version it was demoted under, before it is
believed again.

The demotion is also load-bearing immediately rather than at the next rebuild:
`markLabelSourceFailure` returns whether it actually demoted, and the ingestor's
`recordFailure` (`apps/aggregator/src/label-ingestor.ts:245-252`) uses that
boolean to trigger a projection rebuild, so the listings that depended on the
source's approval disappear on the same pass that withdrew its authority.

Health and trust are separate columns throughout (`health_last_success_epoch`,
`health_failure_count` versus `trusted`, `active`), so "unreachable" and
"authoritative" are two queryable facts rather than one conjunction — the
observability obligation the technique lists.

## A policy that will not parse denies everything

`apps/aggregator/src/listing-policy.ts:81-132` is the second upward lesson and
the cleaner of the two. `buildListingPolicy` parses the trust policy from
configuration; both failure paths — a JSON parse throw (line 90) and a schema
validation failure (line 95) — return `invalidPolicy(...)`, which is not a
previous value and not a compiled-in default:

```
requiredPositiveSources: [],
acceptedStateSources: [],
redactionSources: [],
moderationPolicyVersion: "",
moderationPolicyHash: "invalid",
```

Every grant list empty. Because the evaluator requires a current positive
statement from *every* member of `requiredPositiveSources` and the aggregator's
deployed mode is `projection`, an empty required list combined with that mode
yields nothing visible rather than everything visible — the deny-all outcome.
The policy identity is set to the literal string `"invalid"` rather than to a
hash of an empty document (line 124), so a decision made under a broken policy
is attributable rather than silently indistinguishable from a decision made
under a valid one.

The emergency carve-out the technique permits is present and correctly shaped:
`invalidPolicy` clears the allowlist too unless the operator has explicitly
selected `allowlist` mode, and the operations runbook
(`apps/labeler/docs/runbooks.md:13-15`) states that the deployed service runs in
`projection`, that an exact-revision positive from every required source is
necessary for a listing to appear, and that the allowlist is "the only emergency
fallback" — with `open` explicitly forbidden on the deployed service. Nothing
selects the emergency mode automatically.

The independent validator in `packages/registry-moderation/src/policy.ts:60-62`
closes the remaining hole from the other side: a policy with an empty
`requiredPositiveSources` is rejected outright, so the empty list is reachable
only from the deny-all path — the assertion the technique asks for, implemented
as a type guard rather than as a test.

## Where the tree stops short of the standard

- **Demotions are not surfaced as security events.** The failure counters and
  timestamps are recorded per source, and the demotion boolean drives a
  projection rebuild — but that is the *effect*, not a signal. The only
  structured log on this path fires when the health update itself throws
  (`label_source_health_update_failed`); a successful withdrawal of a required
  source's authority emits nothing. The technique's rule is that a demotion
  which appears only as a drop in listing count is an incident a publisher
  discovers first.
- **The deny-all path has no adversarial test.** The invalid-policy branch is
  reachable and correct by inspection; what is absent is a test that deploys a
  malformed policy and asserts the catalogue is empty rather than open. That is
  the one assertion that would fail loudly if a future refactor made the empty
  lists mean "no requirement".
</content>
