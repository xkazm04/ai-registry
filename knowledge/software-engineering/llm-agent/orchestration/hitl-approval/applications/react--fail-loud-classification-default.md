---
layer: application
type: application
subject: hitl-approval
technique: fail-loud-classification-default
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# The fall-through arm nobody wrote as a policy (React)

*Verified against the project tree at `bf2a1e249`.*

The technique's premise is that classification defaults fail on payloads that
will not parse — truncated, encoded wrong, written by a producer a version
ahead. This tree supplies a cheaper and more common route to the same place:
the producer and the consumer were written against different vocabularies, and
neither ever said so.

## The seam

`src/features/overview/sub_manual-review/components/ReviewListItem.tsx:11`:

```ts
const label = SEVERITY_LABELS[severity] ?? 'Info';
```

repeated verbatim at `ReviewDetailPanel.tsx:116`, with the bucket version of
the same decision in `src/features/fleet/monitor/monitorModel.ts:49-53` —
`critical` maps to critical, `warning`/`high` to warning, and everything else
`return 'info'`.

`SEVERITY_LABELS` (`libs/reviewHelpers.ts:13`) knows three tokens:
`info`, `warning`, `critical`. The producer knows more. The prompt that asks a
persona to raise a review specifies the schema as
`"severity": "info|warning|error|critical"`
(`src-tauri/src/commands/design/reviews.rs:685`), and a second writer in the
same file emits `severity: "high"` (`reviews.rs:1787`). So `error` — the second
loudest rung the producer is offered — arrived at the queue and was rendered
**Info**, and sorted last in the drawer that orders by severity rank.

No payload had to be malformed for the technique's failure to occur. The
consumer's `??` arm *was* the version skew, standing in for a schema agreement
that was never written down. And the composition the technique warns about is
present: this queue is one Night Shift resolves unattended overnight, a fact
documented in the shared write door at `src/lib/decisions/rowWrites.ts:22-25`.

## A and B

**A**: the two `?? 'Info'` sites and `severityBucket`'s `return 'info'`.

**B**: one resolver. `SEVERITY_LABELS` gains the tokens producers actually
emit (`error`, `high`); `resolveReviewSeverity` returns `{ label, defaulted }`
and gives anything it still cannot read the label `Unclassified` with
`defaulted: true`; `severityBucket` reads a `READABLE_SEVERITY` table and falls
through to `critical`, not `info`. Both render sites show the marker inline.
The marker is a boolean on the returned object rather than a phrase in a
string, so "how many pending items are unparsed defaults" is a question the
surface can be asked later.

## What was read

A unit test over the two functions. Under A,
`severityBucket('error')` returns `'info'` and the test fails on the first
token. Under B all four probes (`error`, `sev1`, `''`, `'CRITICAL '`) land
outside the mildest bucket, `resolveReviewSeverity('error')` reads `Error`
un-defaulted and `resolveReviewSeverity('sev1')` reads `Unclassified` with the
marker set. The 662 tests in the neighbouring feature trees and `tsc --noEmit`
stayed green, which matters here because `severityBucket` is shared with the
monitor drawer's sort and the quick-answer cards.

## The structural fact

The direction of a fall-through arm is invisible in review, and this tree shows
why: the `?? 'Info'` was not careless. `info` is the *first* key in
`SEVERITY_LABELS`, the *last* branch in `severityBucket`, and the *last* entry
in `SEVERITY_META` where it carries `rank: 2` — the whole file is ordered
loudest-first, so the quiet bucket is simply what you reach when you fall off
the end of a well-ordered list. The cheap default is not chosen; it is
inherited from the ordering convention. That is worth stating in the technique's
terms: the fall-through arm takes the shape of the data structure it sits at the
end of, and a loud default therefore has to be written on purpose against the
grain of the file.

## What this cannot do or prove

It does not prove anyone is safer overnight. The change makes an unreadable
severity loud on the surfaces that read these two functions; it does not
establish that the unattended resolver consults severity at all before
resolving, and nothing in this tree's frontend can establish that — the
question lives on the other side of the write door. If Night Shift ignores
severity, a loud bucket buys ordering and nothing else.

It also does not build the validator the technique asks for. There is still no
door at the entry point that reports every field that failed; this is the safety
net, applied at two of the consumers, and the third and fourth consumer of the
same vocabulary will be written the same way unless the mapping is made total.
The per-field diagnosis, the partial-parse preservation, and the raw-payload
fallback are all unimplemented here, and the `defaulted` marker is counted by
nobody — it is machine-readable, not yet machine-read.

Finally, the amendment this run could not test: the technique treats "absent"
and "present but unreadable" as distinct events. This change collapses them —
`resolveReviewSeverity(null)` and `resolveReviewSeverity('sev1')` both return
`Unclassified`. For an item's own classification the technique says that is
correct; for configuration it says it is not, and no configuration read was in
scope here.
