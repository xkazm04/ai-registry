---
layer: technique
type: technique
subject: data-retention
technique: destructive-override-floor
status: forged
laws: [one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [exposing a configurable window that drives deletion, reviewing a destructive setting for fat-finger risk, deciding whether to clamp or refuse a bad value]
---

# Destructive-override floor

A minimum on a configurable value that **drives irreversible destruction**,
enforced by refusing the out-of-range configuration rather than by
correcting it. The technique is narrow and it is the highest-leverage thing
in this subject: it is the only guard standing between one mistyped digit
and the unattended, permanent loss of a customer's history.

## The threat it addresses

The threat is not malice and not a logic bug. It is that a per-tenant
window is a number a human types, in a form, months before the tick that
acts on it — and every property that makes retention useful makes this
mistake maximally expensive:

- **Unattended.** No human is present when the value is used.
- **Scheduled.** The gap between the typo and the consequence is long
  enough that nobody connects them.
- **Irreversible.** There is no undo, and if the deleted population *is*
  the history, there is not even a record of what was destroyed.
- **Silent when correct.** A purge that deletes 99% of a tenant's rows
  looks, on every dashboard, exactly like a purge that worked.

A value meant as a hundred, entered as a one, is not a degraded
configuration. It is a valid instruction to destroy nearly everything, and
the system will carry it out faithfully.

## Refuse, do not clamp

Given a below-floor value, there are three possible behaviours and only one
is correct.

- **Clamp** (silently raise to the floor): the tempting design and the
  wrong one. The tenant's stored configuration still holds the dangerous
  number, nobody is told, the screen may still display it, and the
  misconfiguration lies dormant until someone lowers the floor, removes the
  clamp, or migrates the setting — at which point it fires. A clamp
  converts an error into a secret.
- **Obey**: the null design, and the incident.
- **Refuse**: the tenant is **skipped** — no deletion at all for that
  tenant — and an error is recorded into the run's result so the run
  reports partial success rather than success. The dangerous value is now
  visible, the data is intact, and a human is in the loop before anything
  is destroyed.

Refusal must be **loud in the run's own status**, not merely a log line. A
run that skipped a tenant and reported "completed" has produced an empty
success indistinguishable from real success
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)); the
correct output is a partial-success status carrying the per-tenant errors,
routed somewhere that pages a person. A guard nobody hears is a guard that
converts an obvious future incident into an unobvious one.

## The floor lives at the one door

The floor is enforced where the window is resolved into a cutoff — the
single door every deletion path passes through
([one-validation-door](../../../../_laws.md#one-validation-door)) — not in the
settings form. Form-level validation is a courtesy to the operator and is
worth having, but it is not the guard: values arrive from imports,
migrations, scripts, support tooling and future surfaces that were not
written yet. Only a floor at the resolver holds for all of them.

The floor value itself is a named constant with a written justification —
"below this, the remaining history cannot support the product's core
promise" — chosen from the obligation, not from a feeling. If nobody can
state what the floor protects, the floor will be argued away the first time
a customer asks for a shorter window.

## The opt-in is out of band

Genuinely short windows are legitimate; a customer may be in a regime that
demands them. So the floor has an override — and its channel is the design
decision. Put the override **outside the request path**: an environment-
level flag set at deployment by an operator, not a parameter any caller can
pass and not a checkbox on the same form that carries the risky number. The
separation is the entire point: the person who types the window must not
also be the person who authorises bypassing the check on it. A per-request
override reduces the floor to a suggestion, since the code path that
mistypes the window is the same one that would pass the flag.

Record which mode a run executed in. "Purged tenant X to a 5-day window
with the floor bypass active" is a defensible operational record;
"purged tenant X" is not.

## Sentinel and direction

Floors apply only in the destructive direction. The keep-everything
sentinel and any window *above* the floor pass untouched. Flooring the
sentinel — treating "keep everything" as an out-of-range small number —
would be the single case where the safety mechanism causes the loss it
exists to prevent, and it is a real bug that gets written whenever the
sentinel is a magic zero and the check is a naive less-than.

Test all four cases explicitly, because three of them look alike in
passing: sentinel (untouched), above floor (untouched), below floor without
opt-in (skipped, error raised, run partial), below floor with opt-in
(applied, recorded).

## When not to use this

- **Non-destructive knobs.** A floor that refuses is expensive ceremony for
  a setting whose worst case is a slow query; clamp or validate normally.
- **When the floor cannot be justified.** An arbitrary minimum with no
  stated obligation behind it will be bypassed by whoever meets the first
  legitimate customer requirement below it, and the bypass will become the
  default path.
- **Where the destruction is already gated on a live human** who names the
  target ([confirm-by-echo](./confirm-by-echo.md)); there the operator is
  present and the guard belongs at the confirmation, not in a floor that
  blocks a supported operation.
