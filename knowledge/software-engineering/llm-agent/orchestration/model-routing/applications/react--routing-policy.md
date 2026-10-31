---
layer: application
type: application
subject: model-routing
technique: routing-policy
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# BYOM routing policy in the Personas settings surface (React)

How this repo realizes the routing-policy technique on the client: the BYOM
(bring-your-own-model) policy editor — allow/block lists, complexity-based
routing rules, tag-scoped compliance rules — with per-rule edit-time
validation, a save gate that refuses to persist a policy with blocking errors,
and the audit/usage read side beside it.

## 1. Policy is data, and its shape is the technique's rule kinds

`ByomPolicy` (consumed via `src/features/settings/sub_byom/libs/useByomSettings.ts`)
is exactly the technique's catalog: `allowed_providers` / `blocked_providers`
(allow/block lists), `routing_rules` keyed by `task_complexity`
(`simple | standard | critical` — measurable-property routing, labeled in
`byomHelpers.ts:22-26` as "Formatting, linting, small edits" up to
"Architecture changes, security work"), and `compliance_rules` binding
`workflow_tags` → `allowed_providers` (tag-scoped compliance). Provider ids
come from the Rust-generated `EngineKind` binding, and the label map is
`satisfies Record<EngineKind, string>` (`byomHelpers.ts:12-14`) — so the
client cannot invent a provider the backend vocabulary does not define. The
technique's "policy references vocabularies; it never defines them," enforced
by the compiler.

## 2. Per-rule validation at edit time, with severities that encode precedence

`validateByomPolicy` (`src/features/settings/sub_byom/libs/byomHelpers.ts:79-196`)
runs on every edit (`useByomSettings.ts:265`, a `useMemo` — no IPC round-trip)
and mirrors the backend evaluator's `ByomPolicy::validate()`. Its severity
assignments are a small masterclass in fail-open vs fail-closed reasoning:

- an unknown provider in the **block** list is a blocking `error`, because
  the backend evaluator silently drops unparseable entries — "a typo …
  would make the block ineffective at execute-time. Refuse the save instead
  of letting the bypass through" (`byomHelpers.ts:87-92`);
- the same typo in the **allow** list is only `info`, because unknown allowed
  entries fail closed ("not allowed = blocked") — no security regression;
- a compliance rule allowing a provider the top-level policy blocks gets an
  `error` naming the precedence: "the block takes precedence"
  (`byomHelpers.ts:140-148`; the wording now lives in the i18n catalog as
  `settings.byom.policy_warn_compliance_allows_blocked`).

That is the technique's "a rule that can never match warns when written," plus
"block beats allow" as a documented, user-visible contract rather than an
accident of evaluation order.

## 3. The save gate, and the refuse-to-wipe guard

`handleSave` (`useByomSettings.ts:143-181`) enforces two gates before any
write. Blocking validation errors refuse the save with a count. And if the
initial policy *load* failed — corrupt JSON or a transient IPC error — saving
is refused outright, with the rationale in the comment: the in-memory value
would be `defaultPolicy()` (empty lists, no rules, disabled), and persisting
it "would silently overwrite the on-disk policy … a policy wipe is a security
regression" (`useByomSettings.ts:145-152`). This is the one-door discipline
applied to the policy store's write side: the door refuses when it cannot see
what it would be overwriting.

The change-review posture is dirty-state based: `isDirty` compares against a
saved snapshot (`policyEqual`, `useByomSettings.ts:40-56,100`), the panel
surfaces an unsaved-changes marker and an explicit discard, and
`useUnsavedGuard` (`ByomSettings.tsx:33-38`) blocks navigation away from an
unreviewed edit. **Honest gap against the technique's governance bar:** this
is edit-session review, not a versioned before/after diff with blast radius
and recorded approval — the policy has no version id for decision records to
cite (see policy-governance; reported as a deviation, not patched here).

## 4. The read side: decision records and drift timeseries

The same hook lazily loads the governance read surface per tab
(`useByomSettings.ts:130-141`): `listProviderAuditLog(50)` and
`getProviderUsageStats()` / `getProviderUsageTimeseries(30)`. The backing
store is `src-tauri/db/src/repos/execution/provider_audit.rs` — an append-only
insert whose row carries the technique's minimum decision record almost
field-for-field: `model_used`, `was_failover`, `routing_rule_name`,
`compliance_rule_name`, `cost_usd`, `status` (`provider_audit.rs:11-38`), with
per-provider daily timeseries and a `failover_count` aggregate
(`provider_audit.rs:127-190`) as the drift detector.

**The counter-example lives on the same screen.** `ByomAuditLog.tsx:71`
renders `{entry.model_used || '-'}` — and the 2026-08-17 census measured
`model_used` as NULL on 4,001 of 4,001 live rows, `routing_rule` NULL on all
of them (zero routing rules have ever been configured). The audit surface
exists, the schema is right, and the column has never been written: a gate
that reads intentions (the policy file) instead of behavior (populated
decision records) would call this system fully governed. It is the
gate-sees-target law rendered as a table of dashes.
