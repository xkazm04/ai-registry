---
layer: application
type: application
subject: entity-lifecycle
technique: blast-radius-computation
stack: node
verified_on: 2026-08-30
verified_against: node@24
---

# Member removal: one body for preview and act — and the enumeration that proved a feature unnecessary

The self-hosted recruiting app (`kp`, Next.js over one sqlite file, no
DB-level foreign keys) gained the technique end to end for member
removal in one commit (`b4c83c5c`), with the spec at
`docs/specs/2026-08-30-member-removal-blast-radius.md`.

## The preview runs the enforcement path

`reapUser(id, { dryRun })` (`app/_lib/db/users.ts:130`) is the single
implementation: the same DELETEs against `user_credentials`,
`memberships` and `users` execute inside one transaction, casualties are
counted per table from each statement's own change count, and dry-run
mode aborts the transaction through a rollback sentinel
(`DryRunRollback`, `:117-119`) carrying the tallied impact out. The
doc comment names the contract: "the SAME statements execute inside the
transaction and are rolled back, so the preview runs the enforcement
path and cannot drift from it." The receipt type is shared too —
`UserRemovalImpact` (`:112-115`) is "the receipt the destructive act
returns and the preview the confirm dialog shows," split into
casualties and survivors as the technique classifies them.

## The route: bare DELETE is the read-only what-if

`app/api/org/members/[userId]/route.ts:92` puts both modes on one
route: without `?confirm=true` the DELETE destroys nothing and returns
`{ preview: true, impact }`; the explicit confirm parameter arms
destruction and returns the receipt. Both modes sit behind the same
`members:manage` capability, with the reason written at the handler
(`:88-90`): the impact enumeration is reconnaissance and "must not be
cheaper to obtain than the act it previews." The service layer
(`removeMember`, `app/_lib/org-service.ts:243`) applies the last-owner
blocker in *both* modes — "a preview against a blocked target reports
the blocker, not counts" (`:236-237`) — and the confirm dialog renders
a failed probe as an explicit impact-unavailable state
(`app/features/settings/workspace/MemberConfirmModals.tsx:158`), never
as a reassuring zero.

## The finding worth the file: enumerate-first proved a feature unnecessary

The enumeration discipline paid before any delete ran. The spec's
schema walk (`docs/specs/2026-08-30-member-removal-blast-radius.md:38`)
found **no user-owned domain records at all** — jobs, pipeline, tasks
and the rest are workspace-owned throughout — so the
ownership-transfer/reassignment machinery a member-removal feature
normally drags in has "nothing to reassign" and was explicitly
descoped (`:72`). The one dangling reference, `invites.invited_by`,
detaches by design, and because the store enforces no FKs the posture
is recorded at the declaration site itself: the schema comment at
`app/_lib/db/core.ts:306-310` marks the column "RETAINED BY DESIGN on
member removal (cascade posture: detach) … absence of a cleanup is a
decision, not an omission," and the preview reports those invites as
survivors. Computing the radius first did not just make the dialog
honest — it replaced a planned subsystem with a documented decision.
