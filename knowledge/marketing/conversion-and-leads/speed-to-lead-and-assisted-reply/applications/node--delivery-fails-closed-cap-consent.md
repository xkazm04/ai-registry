---
layer: application
type: application
subject: speed-to-lead-and-assisted-reply
technique: delivery-fails-closed-cap-consent
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Two gates, both closed by default - the twin's approval and delivery verdicts

The Czech-first marketing workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08) implements the autonomy story of this subject as two pure functions in one
file, `src/lib/twin/types.ts`, and the structural fact the tree proves is the one the
technique rests on: **approval judges the text, delivery judges the act, they share no
inputs beyond the channel configuration, and every branch of both fails closed.**

## The approval gate: `decideDraft` (`types.ts:277-284`)

```ts
const clears =
  cfg.enabled && cfg.autonomy === "auto" && draft.confidence >= cfg.autoThreshold && draft.risks.length === 0;
return clears ? { status: "approved", autoApproved: true } : { status: "pending", autoApproved: false };
```

Four conjuncts, one place. The doc comment (`:270-276`) states the risks conjunct in
the technique's words - *"a risk always buys a human read, however confident the model
claims to be"* - and the disabled-channel case explicitly: a channel switched off whose
stored config still says `auto` *"may still receive a pending draft but never a
self-approved one"*. `DEFAULT_AUTO_THRESHOLD` is 80 (`:104`) and the sanitizer clamps
an operator's bar to 50-100 (`:571`), which is the "floor and ceiling around a
convention" the technique describes.

## The delivery gate: `decideDelivery` (`types.ts:311-328`)

The doc comment at `:298-309` is the technique's boundary statement verbatim:
*"approval is a judgement about the TEXT, delivery is a judgement about the ACT - a
draft a human approved last week must still be refused today if the channel was
switched off, the weekly cap is full, or the recipient's consent was withdrawn in
between."* The function takes the channel config, the draft's channel, and a context
of `{ sentThisWeek, consentOk: boolean | null, connectorConfigured }`, and its four
refusals are typed (`DeliveryRefusal`, `:292`): `disabled`,
`connector-unconfigured`, `cap-exceeded`, `consent-required`.

Three structural facts, each pinned by `test-unit/twin-delivery-gate.test.mjs`:

- **Unknown consent is refused like false** (`:323-324`; test `:75-86`, *"consent
  FAILS CLOSED - false and null both refuse, only true allows"*). The comment names why:
  *"an absent record has never been a permission"*, pointing at `mayContact` in
  `src/lib/leads/types.ts:170-173`, which returns true only when a record for the
  purpose is in force *and* granted.
- **A draft judged against another channel's config refuses** (`:314`; test
  `:110`) - the caller-bug-on-a-send-path rule.
- **The cap is judged before consent** (`:319-321` precede `:323`; test `:104-108`),
  and only for the operator's message - both refuse.

`defaultConsentRequired` (`:118-120`) returns true for exactly `sms` and `whatsapp`;
the comment grounds it in *"Czech/EU rules"*: those two are direct marketing to a person
by default, a reply to an enquiry or a review is service communication. A stored blob
that predates the field reads as the default (`:580`; test `:94-102`), and a junk cap
is dropped rather than clamped to 1 (`:133-142`) - both confirming the technique's
decision rules. The consent purposes themselves - `service`, `marketing_email`,
`marketing_sms`, `profiling`, each with basis, evidence text and `withdrawnAt`,
append-only - are the design in `docs/leads/design.md:186-216`, which also records the
Czech route (§ 7 of Act 480/2004 Sb.: opt-out for existing customers on similar
products, opt-in otherwise).

## The cap is counted inside the claim: `deliver.ts`

`src/lib/twin/deliver.ts:23-27` says why the count lives where it does: *"The weekly
cap is counted from the SAME state the claim mutates, so two concurrent sends on
`maxPerWeek: 1` cannot both pass"*. `sentThisWeek` (`:164-175`) counts only `sent`
drafts on the same channel whose `sentAt` falls in the same Monday-start local week -
the same `weekStartIso` the publishing cadence uses (`:161-163`). The gate is called
inside the `mutateTwin` transaction (`:259-265`) with `used` read from `prev.drafts`,
and consent is resolved *before* the claim (`:240`) only when the channel demands it
(`:215-219`), passing `null` through when the read fails (`:194`). A connector throw
after the claim triggers a retried revert (`:20-21`, `send-claim.ts`), so a message
that never left is not recorded as sent.

## The unattended loop honours both gates: `dispatch-step.ts`

`src/lib/twin/dispatch-step.ts:125-137` (`dispatchableChannels`) admits only channels
that are enabled, on `auto`, and wired to a non-`manual`, configured connector that
serves that channel - the header comment (`:17-28`) lists the refusals: never an
`assist` or `review` channel (*"a cron is not a human"*), never a `pending` draft,
never a demo project (`:171`), nothing at all when no real connector exists. The
drafting arm calls the *same* `decideDraft` (`:245`), replacing the intake's
placeholder `risks: ["inbound"]` (`inbound.ts:291-304`, there *"to stop an unanswered
message being auto-approved"*) with the model's list, and a gate refusal is *"COUNTED
and left alone"* (`:312-316`). Bounds per tick: 5 drafts, 10 sends, 500 projects,
half-hourly (`:70-84`). `test-unit/twin-dispatch-step.test.mjs:185-300` pins the
acceptance cases: a risk-free confident draft is written, approved and delivered; a
flagged risk keeps a 100-confidence draft pending (`:224`); an `assist` channel is never
drafted for (`:253`); an `auto` channel behind a `manual` connector is not dispatchable
(`:274`); a pending draft is never delivered (`:282`).

## Reconciliation

Everything the technique states is confirmed here; the tree is the source of two
upward lessons the draft had not carried - the cap counted inside the claim rather than
before it, and the placeholder risk on an unanswered inbound message. One deviation to
note against the standard: the consent read logs and returns `null` on failure
(`deliver.ts:192-195`), which the gate refuses correctly, but the refusal reason shown
to the operator is `consent-required` rather than a distinct "could not read consent";
the technique's fourth-state discipline would want the outage tellable apart from a
missing record.
