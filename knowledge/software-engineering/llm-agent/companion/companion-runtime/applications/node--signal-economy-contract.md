---
layer: application
type: application
subject: companion-runtime
technique: signal-economy-contract
stack: node
status: forged
verified_on: 2026-08-24
---

# Two counts declined, and one placed where it clears (kp / Candi)

The interesting evidence here is two things this product decided **not** to do,
both recorded at the site of the decision, and both turning on the same test: can
the affordance a signal leads to resolve the thing the signal counts.

## Confirmed: the count reaches no badge, on purpose

`attentionCounts()` returns six keys, one per navigation badge in the recruiter
shell. The sixth is the companion's open proposals, and it is the only key no tab
declares. The reasoning sits on the type
(`app/_lib/attention.ts:43-52`):

> The ONLY key here with no `badgeKey` on any tab, deliberately: Candi lives in a
> dock, not a tab, so there is no nav item that could carry it. It is read by the
> dock's own state line, where Accept and Decline are one scroll away. It is also
> deliberately NOT folded into `decisions` — that count beacons the ControlDock
> orb and its one click routes to the Decisions tab, which has no affordance that
> can resolve a companion proposal. A number whose only affordance clears nothing
> is the failure `approval-kinds.ts` warns about.

The available badge was the tempting one: `decisions` already exists, already
beacons a persistent orb, and one more addend would have cost nothing to write.
It was refused because its single click lands on a surface where a proposal
cannot be accepted or declined — so the number could have risen and never fallen
by anything the operator did from where they saw it. The count went instead to
the dock's own state line, which is the surface that carries the two buttons that
change it.

Both halves are asserted, not merely intended
(`app/_lib/attention-tenancy.test.ts:158-167`): opening a proposal raises
`companion` by one for its own tenant and not for another, and the same test
closes with `assert.equal(after.decisions, before.decisions, "a proposal is not a
pipeline approval gate")`. A following test asserts that answering a proposal
clears it from the count — which is the placement rule's other half, that the
number the surface shows actually falls when the surface's own affordance is
used.

## Confirmed: the approval kind that was considered and refused

The same test applied one layer down. `APPROVAL_KINDS`
(`app/_lib/approval-kinds.ts:9-16`) is the host's registry of the six kinds that
mark a pipeline entry as waiting on a human; `needsHumanDecision()` (`:27`) is
what the `decisions` count and the Decisions tab read. Registering a seventh,
`companion_proposal`, is the obvious way to make companion proposals visible in
machinery that already exists. It was declined, and the reason is recorded
(`docs/features/companion/README.md:683-689`):

> A companion proposal lives in its own table with its own status lifecycle and
> its own resolution route, so adding the kind would have created a gate with no
> branch that can clear it — exactly what the registry in
> `app/_lib/approval-kinds.ts` warns against.

The registry's own header is what supplied the test (`approval-kinds.ts:5-7`): the
pipeline surface treats any non-null kind as "needs a human", but only specific
kinds have advance logic in the resolution path — so a kind with no branch
produces an entry that is permanently pending. Joining a host taxonomy is
cheap to write and expensive to have written, and the smaller-looking move — its
own table, its own route, its own count on its own surface — is the one that keeps
every number clearable.

## Deviation: the report-or-absorb gate itself has no autonomous producer yet

This is the placement half of the technique confirmed, not the whole technique.
The companion's one autonomous cycle at this point is the daily digest
(`app/_lib/companion-actions.ts:162-180`, the `generate_digest` spec), which is
operator-triggered by accepting a proposal — the case the technique's own closing
section exempts, since the person is already waiting for the answer. No cycle here
yet produces an outcome that has to choose between reporting and absorbing, so the
typed verdict on the outcome, and the reported-share ratio that instruments it,
have nothing to measure. The count placement was decided correctly in advance of
the gate that will need it.
