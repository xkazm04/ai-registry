---
layer: application
type: application
subject: digest-bound-operator-writes
technique: plan-twice-run-if-unchanged
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@22
---

# Plan twice, record, journal: the policy write door (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893
(the same tree as the hackathon mirror on GitLab). A Next.js 16 server that writes to
GitLab as the signed-in operator: tier-state records, policy merge requests, gap
merge requests. Every one of those writes goes through one preview/confirm door, and
that door realizes plan-twice, record-before-each-command and the preview-id journal
in about a hundred and fifty lines.

## Where each piece lives

| Piece | Anchor | What it does |
|---|---|---|
| The contract | `src/server/actions/run.ts:1` "preview, then confirm. The first call plans the commands and returns them with a digest" | States the whole technique in the file header |
| The digest | `src/server/actions/run.ts:45` "const digest = (intent: ActionIntent, commands: readonly PlannedCommand[]): string =>" | sha-256 over the intent's kind, the inbox item it settles (`intent.proposal`) and every command's `argv`; the readable `display` is left out. Comment at `:44` "Everything a confirm does: the commands, and the inbox item it settles once they ran." |
| The compare | `src/server/actions/run.ts:182` "if (b.preview.previewId !== previewId) return { status: 'changed', preview: b.preview };" | The confirm re-plans with the same `build` as the preview; a different digest runs nothing and returns the new preview |
| Record per command | `src/server/actions/run.ts:116` "const id = await recordCommand(db," | A `commands_run` row with operator, project, proposal, display, argv, risk is inserted before `deps.port.execute(cmd)` at `:119`; a failed insert throws and nothing is sent |
| Stop at first failure | `src/server/actions/run.ts:124` "break; // later commands depend on earlier ones (a branch, then its MR)" | Rows already written show where the sequence stopped |
| Record cannot finish | `src/server/actions/run.ts:126` "It ran. Only GitLab's refusal is a failed command" | If `finishCommand` throws after a successful send, the confirm throws (no answer), never `failed`; tested by `src/server/actions/__tests__/confirm/bookkeeping.test.ts:30` "is not answered as failed" |
| The journal | `src/server/actions/runs/journal.ts:1` "The run journal (action_runs, migration 0016): what each previewId's live confirm did" | `claim` at `:32` is one `insert ... on conflict do update ... where` that succeeds only for no row, `failed`, `cut`, a `running` row from another boot, or a `done` older than `RECALL_MS` (15 min, `:21`) |
| Cut on throw | `src/server/actions/run.ts:153` "a throw is no answer: the run is cut, and recalls as unknown" | `finish` in a `finally` with a null response stores `cut` |
| In-process guard | `src/server/actions/run.ts:166` "if (running.has(previewId)) return refused(STILL_RUNNING_REASON);" | A double click is refused before any read; the durable claim covers a second process |
| Client never composes | `src/server/actions/__tests__/handwritten.test.ts:28` "describe('src/app holds no hand-written write to belay-policy'" | Scans every non-test source under `src/app` for yq edits, a `.classes[` path, `git commit` into the policy repo, a field the schema lacks; the header at `:1` records the two drifts that motivated it |
| Issued-preview check | `src/server/actions/setup/run.ts:4` "issued   the previews it answered, for PREVIEW_TTL_MS: a confirm of an id it did not issue, or too long ago, is stale" | The setup door also refuses a confirm for an id the server never issued (`:73-74`) |

## Judgment calls worth copying

- **The settled inbox item is inside the digest.** Two plans with identical GitLab
  commands that would close different Needs-you items get different ids, so a stale
  or mistaken item id cannot ride an otherwise-equal plan.
- **Digest as the preview id.** No client-minted key is needed to recognise a repeat;
  the recall window bounds how long an identical plan is held back.
- **The client's unsure path recalls first.** `src/app/features/needs-you/model/slot/slot.ts:4`
  "the confirm got no answer, so the write may or may not have run: Run stays closed. Ask again first asks the server what"
  its previewId did; `unknown` leads to a fresh preview, which re-plans.

## Gaps against the technique

- The main policy door (`run.ts`) does not keep an issued-preview record; any client
  that can compute the sha-256 over a plan's public inputs can confirm without having
  previewed. The re-plan still guarantees the server runs only its own plan, so the
  gap is skipping the look, not running something different. The setup door
  (`setup/run.ts`) closes it; the two doors disagree.
- A `cut` row is claimable again (`journal.ts:36` "where action_runs.state in ('failed', 'cut')").
  That matches the technique: `confirm` re-plans and compares at `run.ts:182` before
  `once` claims, so a second confirm of a cut id runs only when the fresh reads still
  give the same digest, the same path the client's re-preview on `unknown` takes. The
  residual is a lost write whose landing changes nothing the plan reads; the
  precondition token covers file updates, so it is narrow here.
