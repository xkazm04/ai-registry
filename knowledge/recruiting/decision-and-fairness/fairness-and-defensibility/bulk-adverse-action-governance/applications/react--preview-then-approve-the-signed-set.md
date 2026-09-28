---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: preview-then-approve-the-signed-set
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
---

# The reviewer's half of the signed set: a screening-wave modal

The server half of this technique (the token, the single predicate, the gate at the
write boundary) is recorded in the node application beside this one. This file is the
other half: the client that a recruiter reviews through. A token can only bind what the
reviewer was shown, and this client's job is to make sure the preview on screen, the
token it carries and the exclusions it echoes all belong to the same set. Read against
a TypeScript applicant-tracking app on React 19 (`react` `^19.3.0`), pinned to one
commit on 2026-09-26.

## The lifecycle is a reducer, not a hook

`app/features/hiring/decisions/decisionsScreenWaveMachine.ts` holds the whole
preview -> confirm -> commit -> refusal -> re-preview lifecycle as a pure
`waveReduce(state, event)` (`:98`) with a `never`-typed default (`:152-156`), so a new
event without a transition is a compile error. The hook
(`useDecisionsScreenWave.ts`) keeps only the network and the debounce; every state
change goes through `dispatch`. The reason given at the top of the machine (`:3-10`) is
the argument for doing this at all: the wave is "the one irreversible, email-sending door"
in the tab, and one of its rules had already shipped as a bug fix while it lived inside
`useState`s and a ref with nothing asserting it. The rules below are tested without a DOM
in `decisionsScreenWaveMachine.test.ts`.

## The token rides the preview, and the client never computes it

The preview request is a dry run posted on open and on every slider change, debounced
350 ms (`useDecisionsScreenWave.ts:37-77`). The commit echoes `preview?.approvalToken`
from the preview currently on screen (`:88`). The client never derives a token, so it
has nothing to disagree with the server about. What it must get right is *which*
preview's token it sends. That is why the exclusions are held twice in state:

- `spared` (`decisionsScreenWaveMachine.ts:59-61`) is what the reviewer has asked for,
  and it drives the *next* preview.
- `previewSpare` (`:62-65`) is the exclusion list the *displayed* preview was computed
  with. The success event carries it (`:104`), and the commit echoes it
  (`useDecisionsScreenWave.ts:88`), not `spared`.

If the two were one field, a click between a preview and its commit would send the new
exclusion list with the old token. The server re-derives the signed set from the echoed
list, so that pair is refused as a mismatch, which is safe, but for a reason nobody on
screen could explain.

## Per-person exclusion is a new set to approve

A **Spare** button on every reject row (`DecisionsScreenWaveLists.tsx:94-109`) takes one
person out of the wave without moving the sliders that reshape everyone else. Its title
states the consequence: "Take {name} out of this wave. The approval then covers the set
without them." The toggle is a reducer transition (`decisionsScreenWaveMachine.ts:142-151`)
that sorts the list and **bumps `refreshNonce`**, so every exclusion forces a fresh
preview and a fresh token (comment at `:149`: "A new exclusion is a new set to approve").
A spared person moves to the keep list with the reason code `recruiterSpared`, rendered as
"kept: you spared them in this preview, so the wave will not reject them", and keeps an
**Undo** on the same row (`DecisionsScreenWaveLists.tsx:158`). The spare list survives
every re-preview, including the one a refusal triggers (test "the spared set survives a
refusal's re-preview").

The committed view is frozen. `spareToggled` returns the state unchanged once `committed`
is set (`decisionsScreenWaveMachine.ts:145`: "sparing after the fact is the reconsider
queue's job, not this modal's"), and the modal passes no `onToggleSpare` to the committed
list (`DecisionsScreenWaveModal.tsx:75`), so no per-row control renders there. This matches
the technique's division of labour: exclusion belongs before the signature, and reversal
after it goes through the reconsider queue.

Landed 2026-09-23 (`bef78eaa3`).

## Refusals are typed by what they ask the reviewer to do

The server's 409 carries a `reason` from a closed set, and the client maps it through
`REFUSAL_EFFECT` (`decisionsScreenWaveMachine.ts:29-35`). That map is typed as a total
`Record<ScreenWaveRefusalReason, ...>`, so a new server reason is a type error in the
client:

| reason | re-preview | blocks commit | wave already landed |
| --- | --- | --- | --- |
| `required`, `expired`, `mismatch` | yes | no | no |
| `spent` | yes | no | **yes**, so the queue reloads |
| `unattributed` | no | **yes**, for the modal's life | no |

The docblock (`:18-28`) names the two failures a single "re-preview on 409" had. On
`unattributed` it looped, because no re-preview names an approver and the commit would
fail again. On `spent` it mis-narrated a retried commit whose first attempt had landed,
leaving already-rejected people with live buttons in the queue behind the modal. The
second case is the one the technique does not spell out: **a token that can be spent
once needs its own refusal**. A retry after a lost response otherwise reads as
"the set changed", and the honest message is "this already happened". An unrecognised
409 reason falls back to `mismatch` (`app/_lib/screen-wave-contract.ts:193-200`), which
re-previews and so fails safe.

The refusal notice must outlive the re-preview it triggers. `keepCommitNotice` is armed by
the refusal and consumed on exactly the next settle, whichever way that preview went
(`:47-50`, `:104`, `:111`). Without it, the fresh preview cleared the "set changed" line
about 350 ms later and the reviewer saw a clean-looking list with no explanation (bug fix
`40fc5ac3`, cited at `:7-10`).

Landed 2026-09-23 (`6d12c9814`, over the one import-free wire contract `f02e7a3ad`).

## What the lists disclose

`DecisionsScreenWaveLists.tsx` renders the reject list and the keep list in one view, so
the boundary is visible from both sides. Per row:

- the score, or "—" when there is none, so an unscored keep never reads as a real 0
  (`:128`, `:151-153`);
- a "JD edited since this score" chip when the score predates the role description's last
  edit (`:47-55`);
- the **effective** floor when a per-family override differs from the displayed global
  floor (`:60-72`), with a count line above the list (`:119-123`). The floor is withheld
  while a re-preview is in flight (`globalFloor == null`, `:61`;
  `DecisionsScreenWaveModal.tsx:73`). Before that fix, every row showed a fabricated
  "family floor N" badge for the whole debounce window of each slider drag;
- the reason, rendered from the structured `reasonCode` with "would"/"did" phrasing
  chosen by the run's `dryRun`, plus a tie-adjustment note when the cutoff moved to spare
  a tie (`:77-87`);
- after commit, a comms-failure badge on a row whose notification failed (`:129-133`).

## Nothing fires by default

Commit is disabled with a stated reason in an `aria-live` line, not just a `title`: a
blocking refusal first, then auto-reject off, then nothing to reject
(`DecisionsScreenWaveModal.tsx:56-66`, `:96-104`). Enabled, it opens a second
confirmation (`DecisionsScreenWaveConfirmModal.tsx`) whose body names the count and the
three consequences: "reject {count} candidates, queue their rejection notifications, and
seal each decision to the tamper-evident audit record. This cannot be undone." The file
header states the division: the server token covers a *stale* set, and the confirm step
covers an accidental click on a *fresh* one (`:3-6`).

## Deviations from the standard

- **Grouping by reason is still per-list, not per-reason.** The standard groups the cohort
  by reason, so a reviewer can act on a whole bucket and notice when a bucket swells. Here
  the reject and keep lists carry per-row reason text only. The family-override count line
  is the one aggregate. It shows that a disclosure-by-bucket shape exists here, but it has
  not been applied to reasons. Unchanged since the node application recorded it on
  2026-08-30.
- **The run defaults to auto-reject on.** The modal header says so (`:8-9`): the recruiter
  opened it, so the switch starts on. That does not breach "the default action is
  nothing", because nothing commits without two explicit clicks. But the preview's first
  frame is a reject list, not an empty one, and the standard's argument against automation
  bias applies to what the reviewer sees first.
