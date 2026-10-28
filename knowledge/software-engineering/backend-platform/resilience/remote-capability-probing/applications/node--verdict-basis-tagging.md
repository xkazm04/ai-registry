---
layer: application
type: application
subject: remote-capability-probing
technique: verdict-basis-tagging
stack: node
status: forged
verified_on: 2026-10-27
---

# Basis-tagged capability verdicts and a single blocker, in a GitLab capability doctor (Node)

afterlife (https://github.com/xkazm04/afterlife, commit `009c7893`, the same tree as the
GitLab hackathon showcase) ships a `doctor` that reports which GitLab features a group's
plan and instance actually offer before the product switches any of them on. The probe is
`src/server/gitlab/capabilities.ts`; the blocker it consults is
`src/server/gitlab/doctor/blocker.ts`. It realises verdict-basis-tagging and, beside it,
single-blocker-short-circuit.

## 1. The triple, as types

`export type CapabilityStatus = 'available' | 'unavailable' | 'unknown';` and
`export type Basis = 'endpoint' | 'plan' | 'version' | 'none';` (`src/server/gitlab/capabilities.ts:14-15`),
and a row is `{ id: string; label: string; status: CapabilityStatus; basis: Basis; reason:
string }` (`:18`). The file's header states the contract: "Each capability is available,
unavailable or unknown, and never guessed" (`:1-2`).

## 2. Which endpoint outcomes are verdicts

`classifyEndpoint` (`:43-51`) is the technique's step 2: a 200 is available with reason
``GET ${endpoint} answered 200``; a `forbidden` or `not-found` error is unavailable with
the status and GitLab's message in the reason; anything else is unknown, and its reason
ends "not a verdict on the plan" (`:50`). A network, auth or rate-limit failure therefore
never tells an operator to upgrade.

Plan-basis and version-basis rows degrade to unknown, not to a guess:
`classifyPlan` returns `{ status: 'unknown', basis: 'plan', reason: 'the namespace plan
could not be read' }` when the plan is null (`:55`), and `classifyComponents` returns
`'the instance version could not be read'` with basis `version` (`:66`). Tier vocabulary is
normalised at one point, `planName` (`:34-41`): trials and legacy gold/silver/bronze map
onto the current ladder, and "unrecognised -> null" (`:34`), never the nearest rung.
Capabilities with no safe read say so with basis `none`: custom flows are "no REST read
endpoint (GraphQL only); the doctor sends only GETs" (`:130`). The Flows API row carries the
technique's "the route may not exist" caveat in its reason: "404 may also mean this list
route does not exist; confirm on the trial" (`:131`).

## 3. A refusal counts only when the group answered

The comment at `:118-119` is step 3 verbatim: "A 403/404 on a group route is a verdict on
the plan only when the group itself answered: a wrong AFTERLIFE_GROUP_ID or a group the
login cannot see answers 404/403 on every route, which says nothing about what the plan
has." `onGroup` (`:120-121`) returns unknown, basis none, "group ... could not be read, so
its endpoints cannot be judged" whenever the group read failed.

## 4. The single blocker

`src/server/gitlab/doctor/blocker.ts:1-3`: "The one thing that stops every probe: glab cannot start, GitLab cannot
be reached, glab is not logged in, or the group cannot be read. ... Any other failure is
not a blocker: the rows say unknown on their own and nothing is guessed." The five
preflight reads run at once and keep their errors (`src/server/gitlab/capabilities.ts:100-104`);
`findBlocker` (`src/server/gitlab/doctor/blocker.ts:17-46`) tests them by typed kind in causal order — binary,
network, auth, group — and names a group blocker only when `pre.user === null` (the user
read succeeded) and the group answered not-found or forbidden (`:39`). Each blocker
carries a `fix`: `glab auth login --hostname ${host}` for a login (`:36`).

Rows are thunks — "Thunks: a blocked probe spends no GET on a row." (`src/server/gitlab/capabilities.ts:123`)
— and for a binary, network or auth blocker every row becomes `{ status: 'unknown', basis:
'none', reason: `blocked by: ${blocker.text}` }` (`:138-142`). An unreadable group is the
technique's scoped exception: "An unreadable group is named, but the rows still run: its
routes say why they cannot be judged (onGroup), the rest answer." (`:137`). The render and
exits are in `src/server/gitlab/README.md:61-62`: `BLOCKED  <text>` and `  fix: <command>`,
and "Exit codes: 0 the probes answered, 2 every row unknown with no blocker, 3 blocked".

## Deviation recorded

**The README overstates the short-circuit for the group blocker.**
`src/server/gitlab/README.md:58-59` says that once any of the four blockers is named
"every row is unknown, basis none, "blocked by: ...", and no endpoint GET is sent". The
code (`src/server/gitlab/capabilities.ts:137-138`) deliberately runs the rows for a `group` blocker and
short-circuits only the other three. The code is the better design — account- and
instance-scoped rows still answer — and the document is the defect.
