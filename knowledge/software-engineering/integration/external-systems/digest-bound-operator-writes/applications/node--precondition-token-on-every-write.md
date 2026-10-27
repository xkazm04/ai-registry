---
layer: application
type: application
subject: digest-bound-operator-writes
technique: precondition-token-on-every-write
stack: node
status: forged
verified_on: 2026-10-27
verified_against: node@22
---

# Last commit id on every policy write, and the timeout that says failed (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893.
Writes go to GitLab through the `glab` CLI as the operator. Every update of an existing
file carries the repository-files API's `last_commit_id`; creations are checked after
the fact. This application also records how the same tree handles an unanswered write,
because the two techniques meet there.

## The token

| Piece | Anchor | What it does |
|---|---|---|
| The rule, documented | `src/server/actions/README.md:156` "`previewId` is a sha-256 of the commands and of the `proposal` they settle." | Lines 156-160 explain that a commit can still land between the confirm's read and the write, so every `tier-state.yml` write carries `last_commit_id` and GitLab refuses it (400) |
| No token, no plan | `src/server/actions/plans/context.ts:101` "GitLab did not say which commit last changed ${path}, so a write from a stale read could not be refused; nothing is planned" | `lastCommitOf` at `:99` validates the id against `COMMIT_ID` (40 or 64 hex) and throws `ActionRefused` otherwise |
| Why, at the site | `src/server/actions/plans/revoke.ts:3` "write carries the file's last_commit_id as it was read: if tier-state.yml moved in between (a tripwire demotion, another" | A revoke must never land over a demotion it did not see |
| Tested both ways | `src/server/actions/__tests__/stale.test.ts:49` "a commit between the last read and the write: GitLab refuses it, and the newer file stays" | And `:73` "no last commit from GitLab, no plan" |
| Post-condition for creations | `src/server/actions/run.ts:100` "Every branch MR (a plan that names its branch: plans/mr/branchMr.ts, F38): the MR it opened must be headed by its commit." | `checkHead` turns a `done` into a failed last result when the MR is not headed by the commit the plan made; the commit is learned by read-back (`:96`) because the files API answers only `{file_path, branch}` |

The token is in the argument vector, so it is in the digest: a newer read produces a
different preview id and the confirm answers `changed` before the remote is ever asked.

## No retry, and where unknown leaks into failed

The write client never retries: `src/server/gitlab/adapter/client.ts:84` "Runs a planned
write once. No retry: a write is never repeated without the operator." It classifies a
timeout after send as unknown in its message, at `:89` "glab timed out after 60 s; write
outcome unknown. Read the branch or MR before retrying".

That classification does not reach the status. `run.ts:121` "const exit = e instanceof
GitLabError && e.status ? e.status : 1;" gives the timeout (status `null`) exit 1, the
result is `ok: false`, and the confirm answers `failed` (`run.ts:140`). The journal then
stores `failed`, which `claim` treats as safe to run again, and the client's words read
it as a failure. The message is honest; the value is not. The repo is right about the
neighbouring case (a record that cannot be finished after a successful send throws, so
it recalls as unknown, `run.ts:126-127`), which shows the intended rule; the transport
timeout should take the same path, or the response should grow an `unknown` status.
What keeps the gap from causing a stale overwrite is the token above: a second confirm
re-plans, and if the first write had landed the file's last commit has moved.
