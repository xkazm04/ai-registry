---
layer: application
type: application
subject: sql-console
technique: safe-mode-guarding
stack: next
status: forged
verified_on: 2026-09-01
verified_against: next@16
---

# Next — one confirm gate, five actions, and the destination it never captures

A fleet-conformance application routes every destructive or expensive
one-click action through a single confirm gate, which makes it a clean test
of [safe-mode-guarding](../techniques/safe-mode-guarding.md)'s consent rule:
*a pending consent is bound to its target, including where the result lands.*
The repo pins the target well and pins the destination not at all — it
defends that seam with a modal overlay instead — and one directory over it
shows exactly the mechanism the amendment asks for, applied to a different
problem.

Paths are repo-relative; line numbers are at HEAD `a57f272c`.

## The shared gate, and where the pinning has to live

`src/components/ConfirmAction.tsx:1-20` states the single-gate premise in the
file header:

> Shared "are you REALLY sure" gate for one-click destructive / expensive
> actions… This is the ONE confirm they route through. WIRED: the segment
> `×` …; "Open draft PR" on a playbook card and a backlog row…; the practice
> fleet batch…; "Re-test"…; and goal delete…

Five actions, one gate — the console's shape exactly. The component is
deliberately stateless about targets: all copy builders live in this file
(`:11-12`, "do not scatter the wording into the call sites") but the *pending
descriptor* is each caller's. So the binding discipline is enforced call site
by call site, which is where it varies.

## Target-and-mode pinned at open: the good case

`src/features/standing/repositories/FoundationRolloutPanel.tsx` runs two
opposed actions from one dialog and pins both dimensions:

```ts
type Dialog = { repo: string; mode: "provision" | "revoke" } | null;   // :25
```

Each row's handler captures at open time — `setDialog({ repo: row.repo, mode:
"provision" })` and the `"revoke"` twin (`:155-162`) — and `submitDialog`
reads the descriptor back rather than re-reading the UI, choosing even the
HTTP verb from it (`:71-79`). A second lock sits on top:
`FoundationSecretsDialog.tsx:32-34` arms only when the typed phrase equals the
repo name, so the consent is spelled against its target. This is the
technique's rule met for *where the statement runs*.

`src/features/standing/repositories/useRepoSegmentsPanel.ts:33-34` shows the
self-voiding variant: `pendingDeleteId` is a bare id, and the descriptor is
*derived* — `segments.find((s) => s.id === pendingDeleteId) ?? null` — so a
target that leaves the list takes the dialog with it. That is the console's
"a switched connection voids the pending consent", achieved by derivation
rather than by an explicit compare.

## The destination is read live, not captured

`src/features/shared/practices/PlaybookCard.tsx` is the case where target and
destination separate. "Open draft PR" writes a real branch, commit and PR
**into a repo the user picks from a select** — the pick is the result's
destination, not merely a parameter. The pending consent is a bare boolean:

```ts
const [confirmingPr, setConfirmingPr] = useState(false);   // usePlaybookCard.ts:16
```

and the execution reads the destination live at confirm time —
`usePlaybookCard.ts:55`, `const repo = pick;` inside `openPr()`. The confirm
copy is likewise rebuilt from the live value each render,
`draftPrConfirm(c.pick, …)` (`PlaybookCard.tsx:125`). The invariant is stated
as a comment, and it is an argument from layout rather than from state
(`:115-116`):

> `pick` can't change while the overlay is up, so `openPr()` reads the
> confirmed repo.

That is true here, and it is the fragile form of the rule. It holds only
while the overlay is modal, only while the picker is behind it, and only
while nothing else can write `pick` — a router refresh, a parent re-render
seeding a default, a future keyboard path around the trap. The same argument
appears verbatim in the batch flows: `PracticeApplyBatch.tsx:41, 165-171` and
`PlaybookApplyBatch.tsx:51, 148-154` ("the overlay blocks the checkbox grid,
so `selected` is frozen while confirming"). And in
`PracticeDriftStrip.tsx:25-26, 36-56`, the targets *are* resolved before
opening (`setTargets(repos); setConfirming(tile);`) — but tile and targets are
two independent states never cross-checked at confirm time, so the capture is
there without the binding.

Nothing in this repo stores a descriptor of the shape `{ action, target,
destination }`, and nothing voids a consent because an output slot was
re-pointed. The amendment's positive form is absent here; what is present is
the substitute it warns about.

## The mechanism the repo already has

`src/features/admin/settings/DataErasurePreview.tsx:60-80` implements exactly
the binding the consent gate lacks, for the erase blast-radius count that
sits *beside* the armed confirm field:

```ts
const key = `${slug}|${includeAudit}|${open}`;
const [entry, setEntry] = useState<{ key: string; state: ErasePreviewState } | null>(null);
```

read back only on an exact match, with the header stating the invariant: *the
answer is stored WITH the request it answers … a count is structurally
incapable of outliving its request*, because "one frame of a wrong blast
radius beside an armed confirm field" is the failure. Substitute "statement"
for "count" and that is the amendment. The playbook flow needs the same
composite key with `pick` in it; then the overlay stops being load-bearing.

The server side already reasons this way — `src/app/api/org/erase/route.ts:136-140`
refuses an org-wide erase satisfied by a repo name, and
`src/app/api/org/loop/[id]/pr/route.ts:69` compares the typed confirm against
`lane.repoFullName`. The trusted-side guard sees its target; the client's
pending consent is the half that does not.
