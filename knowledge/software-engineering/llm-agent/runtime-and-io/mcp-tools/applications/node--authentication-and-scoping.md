---
layer: application
type: application
subject: mcp-tools
technique: authentication-and-scoping
stack: node
verified_on: 2026-09-23
verified_against: node@24
applied: code
ab_verdict: better
proof: structural-only
---

# Two tokens named "ci": when a label keyed a lease

`xkazm04/ascent` exposes an organisation's follow-up work queue to agents
through a tool-protocol door at `src/app/api/mcp/route.ts`. Each agent
authenticates with an organisation API token that carries scopes. The package
manifest pins `engines.node` to `24.x`, which is the witness for the stamp
above. Read at tree `aff9991a` on 2026-09-23. The fix described here is
commit `ea78013b` (2026-09-05).

## The defect

Three keys were derived from the token's human-chosen **name**:

- the audit actor, `token:<name>`. The per-token daily write ceiling counts
  audit rows on that string (`countTokenWritesToday` in
  `src/app/api/mcp/gates.ts`);
- the work-queue holder stored on a claimed row, `agent:<name>`;
- the holder comparison in the brief and report handlers, which matched that
  string exactly.

The token-issuing function enforces no uniqueness on names. Two live tokens
named `ci` were therefore one actor. They shared one daily budget, their
audit lines were indistinguishable, and token B could read the brief for,
and file a report against, a row token A had leased. The last of these is
the technique's point: the name had become an authorization key.

## The fix, and its test

All three keys now use the token's minted id (`route.ts:237` for the audit
actor, `:273` for the principal's actor). The name travels as a label: as
`tokenName` in the audit metadata (`:296`), and as `label` on the principal
(`:280`), where the operator's lane view uses it because an id would mean
nothing to a person.

`route.test.ts:319` builds two tokens with the same name and different ids.
It asserts that they produce two distinct principal actors and two distinct
audit actors, and so share no counter and no lease. The test discriminates:
with the name form restored, both assertions fail, because the actors
collapse to one string. The storage layer has its own pair in
`src/lib/db/followup-claims.test.ts`. Token B's brief and report on A's
lease are refused and A's succeed, with the legacy `ci` form passed on both
calls so the transitional arm cannot serve as a back door.

## The transitional arm

Rows claimed before the change still held `agent:<name>`.
`holderActors()` (`src/lib/db/followup-claims.ts:317`) therefore matches the
id form **or** the legacy name form, and the legacy form comes only from the
calling token's own current name (`route.ts:278`). This is the technique's
transitional match. It keeps the old ambiguity for the rows written before
the change and adds none after. Its doc comment names its end: leases last
hours, so every old-form row lapses within a day of deploy, and after that
the arm is to be removed.

At this tree, eighteen days after that one-day horizon, the arm and its
`legacyActor` field are still present. This document did not check whether
any old-form row is still live. The technique's rule applies unchanged: the
match is safe only while it has an end.

## Verdict

The mechanism and its guard test match the rule. The failure followed the
technique's escalation path: an audit-attribution ambiguity became a quota
collision, then a cross-credential authorization defect. It was closed at
the key. No per-handler check was added. The one open item is the
transitional arm that outlived its stated end.
