---
layer: application
type: application
subject: hitl-approval
technique: cosmetic-vs-enforced-threshold-invariant
stack: react
verified_on: 2026-08-22
verified_against: react@19
---

# Two review ladders, one thrown error (React)

The manual-review queue in the Personas web client has both ladders the
technique describes and — unusually — knows it. `src/lib/reviewUtils.ts:4-27`
opens with the comparison drawn as a table, the invariant stated in prose, and
a runtime assertion twelve lines below enforcing it. It is the densest single
artifact for this technique anywhere in the tree, and its three defects are
each instructive.

## The two tables, side by side in a comment

The cosmetic ladder is `severityThresholdMinutes` (`reviewUtils.ts:28-32`):
critical 5 min, warning 30, info 120. The enforcing ladder is
`DEFAULT_ESCALATION_POLICY` (`src/stores/reviewStore.ts:86-90`): critical
30 min → `escalate`, warning 240 → `escalate`, info 480 → `auto_approve`. The
docblock renders both as one three-column table (`reviewUtils.ts:11-15`) and
labels each side by what it does — "**Urgency** is a cosmetic indicator … but
triggers no automated action", "**Escalation SLA** … drives real automated
behaviour" (`:17-22`) — then states the relation and the consequence of losing
it: "a review could be auto-approved while the UI still shows a calm
(non-urgent) state" (`:24-26`).

That the enforcing side is a *closed three-member* action set is visible in the
type: `EscalationAction = "auto_approve" | "escalate" | "none"`
(`src/lib/types.ts:182`), with the sweep honoring the third member by doing
nothing at all — `if (rule.action === "none") continue;`
(`reviewStore.ts:368`).

## The assertion

`reviewUtils.ts:36-45` walks the severity keys at module scope and throws:

```
[reviewUtils] Escalation SLA for "critical" (30m) is shorter than its urgency
threshold (5m). This would allow automated actions before the UI signals urgency.
```

Two of the technique's three properties for a good assertion are met exactly.
It fires at load — the comment says so, and says why: "Fires at module-load
time so misconfigurations surface immediately" (`:34-35`). And the message
names the **consequence**, not the mismatch, which is what stops the next
engineer from fixing a red build by relaxing the comparison.

## Three deviations, in increasing severity

**It permits equality.** The comparison is `if (sla < urgency)`
(`reviewUtils.ts:39`), and the docblock states the invariant as
`escalation SLA >= urgency threshold` (`:24`). A configuration where the two
are equal passes: the row turns urgent in the same tick that the sweep resolves
it, and the operator's window is zero. The standard's inequality is strict, and
a one-character change would make the code match its own docblock.

**It checks the ramp's start, not its end.** `getUrgencyLevel`
(`reviewUtils.ts:51-56`) returns 0 below the threshold and then ramps 0→1 over
twice the threshold again — full urgency at 3× the threshold, as its own
comment says (`:47-50`). So the *displayed* ladder has a last step at 15 / 90 /
360 minutes, and the assertion compares the SLA against the first step only.
With today's numbers the real relation still holds (15 < 30, 90 < 240,
360 < 480), which is a property of the values rather than of the check: set the
critical SLA to 10 minutes and the assertion passes while the machine escalates
a row whose glow is a third of the way up.

**Nothing imports the module.** `reviewUtils` has no importer anywhere in
`src/` — `getUrgencyLevel`, `getSlaCountdown` and `severityThresholdMinutes`
are referenced only from inside the file that defines them, and the review
surfaces (`ReviewRow.tsx`, `ReviewDetailPanel.tsx`, `FocusReviewCard.tsx`)
render neither a glow nor a countdown. The enforcing half, meanwhile, is fully
wired: `ReviewsSplitPane.tsx:33-38` calls `checkEscalations` on mount and every
30 seconds, and the sweep (`reviewStore.ts:350-395`) resolves overdue rows
behind a visibility check, a cross-tab lock, and a per-id in-flight claim with
an awaited resolve. The assertion sits on the side that *displays*; the side
that *acts* runs without ever loading it. This is the placement rule of the
technique demonstrated by its own violation — the check is correct, well
argued, well worded, and unreachable.

The one thing keeping the gap from having cost anything is a second accident:
`escalationEnabled` initializes from `localStorage.getItem(...) === "true"`
(`reviewStore.ts:281`) and no call site in `src/` ever invokes
`setEscalationEnabled`, so the enforcing ladder ships dormant and can only be
armed by hand in browser storage. The day a settings toggle is added, an
unasserted pair of tables starts driving `auto_approve` writes.

## What the same module gets exactly right

The classifier feeding both ladders defaults the way the sibling technique
requires. `parseManualReview` (`reviewStore.ts:29-58`) initializes
`severity = "critical"` before the parse and sets `parseError` whenever
`JSON.parse` throws *or* the payload's severity is not in the vocabulary, with
the rationale recorded inline: "The old behavior defaulted to `info` — under
DEFAULT_ESCALATION_POLICY that silently widens the SLA to 8h and routes the row
to auto_approve, so a malformed payload of a real critical event would be
quietly waved through" (`:35-39`). The marker reaches the operator in three
places (`ReviewRow.tsx:57`, `ReviewDetailPanel.tsx:111-116`,
`FocusReviewCard.tsx:66-83`) carrying the string "Malformed payload —
escalated to critical until reviewed" (`src/i18n/en.ts:2416-2419`), which is
the marker doing its job: the row is loud, and it says why it is loud. The
partial parse survives too — an unreadable body falls back to the raw payload
text rather than to an apology (`reviewStore.ts:56`).

The stored-policy reader is the absent-versus-invalid distinction in miniature:
`validateEscalationRule` (`reviewStore.ts:113-142`) returns the default
silently for a missing field and collects a per-field reason for an invalid
one, so the caller emits one aggregated report rather than a shrug or a storm
(`:198-207`). Its own comment names the bug it closed: a partial stored policy
like `{"critical":{}}` used to spread over the defaults and leave the action
undefined and the SLA `NaN`, "which silently disabled escalation across all
severities" (`:106-112`).
