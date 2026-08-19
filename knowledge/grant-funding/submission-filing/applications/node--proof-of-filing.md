---
layer: application
type: application
subject: submission-filing
technique: proof-of-filing
stack: node
status: forged
---

# Node — proof of filing derived, never stored

How the `grant-writing-nonprofits` repo turns "marked filed" from an
honor-system click into a defensible artifact, with one pure derivation
function feeding every surface.

## The derived proof object

`src/features/submissions/filing-profile.ts:209-241` is the whole model.
`ProofOfFiling` (lines 209-218) carries `filed`, `filedAt`,
`confirmationNumber`, `receiptRef`, `portalUrl`, and the load-bearing derived
flag:

```ts
verifiable: filed && (confirmationNumber !== null || receiptRef !== null)
```

(`proofOfFiling`, lines 223-241). `verifiable` is computed on read, never
persisted — the comment on lines 216-217 states the intent: "True once there
is *verifiable* evidence (a confirmation number or receipt), not just an
honor-system 'marked filed' click." The function is pure ("any surface —
pipeline row, report, success banner — renders a badge from this without
re-parsing", lines 220-222), so filed-vs-verified cannot drift between
surfaces. Evidence fields are opaque trimmed strings; `receiptRef` is an
explicit *reference* to an uploaded receipt with file infrastructure deferred
(line 27) — the record never couples to blob storage. The rationale recorded
at capture (`FilingContribution`, lines 23-27) names the business stake: the
confirmation number exists "for the success-fee + deadline guarantee" — the
surfaces that must key on `verifiable`, not `filed`.

## Evidence enters at the mark-filed moment, optionally

Confirmation number and receipt ref are two optional fields of the same
filing contribution captured when the org marks the submission filed
(`encodeFilingNotes`, lines 67-96): trimmed via `clean`, dropped when empty,
never blocking the transition. A filing without evidence lands as
filed-unverified — a legitimate state, upgradeable later because the proof is
re-derived from `notes` on every read; adding the confirmation number the
next morning flips `verifiable` with no status machinery.

## The one-way door underneath

`filed` means the record's status is in `FILED_STATUSES` (`filed_manually` /
`filed_auto`, lines 144-147), and that status is guarded upstream by the
irreversible transition in
`src/app/drafts/[grantId]/StatusTransitions.tsx:17-41`: marking a draft
Submitted is confirmed ("This is one-way — you can't move it back to
drafting") and only outcomes (awarded / declined) follow; the inline comment
records that earlier "Reversible later" copy contradicted the transition
guard and was fixed — honesty in the copy treated as a correctness bug.
Only abandonment reverses (lines 43-62), precisely because an abandoned draft
recorded no submission signal and resuming it "corrupts no metrics." The
proof object's `portalUrl` passes through `safeHttpUrl` (line 238) so even
the evidence path re-validates crowd-era URLs at read time.

## Deviations against the standard

Two gaps, standard unchanged: (1) the repo does not store the funder's
stamped submission instant separately from its own `filedAt`, so on-time
disputes lean on the local clock — the technique's "the funder's clock is the
clock" rule is the target for the v2 schema promotion; (2) there is no
post-submission validation state (federal portals can bounce a package after
issuing a tracking number), so `verifiable` proves receipt, not acceptance —
which the technique's vocabulary already keeps honest.
