---
layer: application
type: application
subject: retry-backoff
technique: error-classification-for-retry
stack: node
status: forged
verified_on: 2026-10-27
---

# Write retries that need a proof of non-landing, in a DevSecOps control plane (Node)

afterlife (https://github.com/xkazm04/afterlife, commit `009c7893`, the same tree as the
GitLab hackathon showcase) drives GitLab through the `glab` CLI from two places: plain ESM
scripts that run in CI jobs (`gitlab/components/scripts/`, `gitlab/apply/`) and a Next.js
server whose adapter plans writes for an operator to run (`src/server/gitlab/adapter/`).
Both write to repositories they do not own. Neither has an idempotency key to send, so the
technique's proof-of-non-landing section is the only safe retry story available, and the
scripts realise it almost line for line.

## 1. Reads are marked, everything else is a write

`gitlab/components/scripts/lib/core/glab.mjs:1` states the rule in one sentence: "a read is
tried again on a transient failure, a write only when the caller proves it did not land".
The entry point is `export function glab(args, input, { read = false, unlanded } = {})`
(`:99`): `read` defaults to false, so a call nobody marked is a write, which is the
technique's fail-safe default. The whole decision is one line,
`const again = attempt < ATTEMPTS && transient(e) && (read || provenUnlanded(unlanded));`
(`:104`) — the class (`transient`) is necessary, and for a write the caller's proof is the
second half.

The transient set is classified against structure where glab still shows it, `const
TRANSIENT = new Set([429, 502, 503, 504]);` (`:39`), and its comment carries a judgement the
technique's draft lacked: "500 is not one: it can be the request's own fault" (`:38`). A
generic internal error is ambiguous about *cause*, not only about landing, and the repo
does not retry it even for reads. Text matching for the no-HTTP-answer case is quarantined
in the adapter as one named regex (`NETWORK`, `:41`), the technique's step 4.

## 2. The proof read answers exactly "not landed", or nothing

`provenUnlanded` (`:68-77`) is documented as "True only when the caller's read answered
true. No probe, a probe that throws, or any other answer: not proven." A proof read that
throws is logged ("could not read whether the write landed ... not trying it again") and
counts as no proof. That is the technique's step 3 in full.

The proofs themselves live with the write that knows its effect,
`gitlab/components/scripts/lib/repo-write.mjs:54-89`. An update is sent with
`last_commit_id` when the caller has it (`:64`); `unlandedOn` (`:65-70`) proves an update
unlanded when "the file's last commit is still `lastCommitId`" and a create when "the file
is not there" (comment, `:58-60`). In merge-request mode the commit goes onto a fresh branch,
so its proof is `unlandedOn(work, true), // the branch is new: no file there means no
commit` (`:83`).

## 3. The retry is conditional too, and the second step is never retried

The comment at `gitlab/components/scripts/lib/repo-write.mjs:60` is the technique's step 4 stated as an operational fact:
"A retry that races a late landing is refused by GitLab too (stale last_commit_id, file or
branch already there)." The precondition on the retried write, not the proof read, is what
closes the race. The same comment draws the boundary: "An update without lastCommitId has
no such proof and is never made again. Opening the MR is never retried." (`:61`); the
merge-request POST at `:85-88` passes no `unlanded`, so the multi-step write retries only
the step that can prove itself (step 6).

## 4. An unproven ambiguous write leaves as *landed: unknown*

`unknownIfAmbiguous` (`gitlab/components/scripts/lib/core/glab.mjs:79-86`) — "A write's failure with a 5xx or no HTTP answer:
GitLab may have done it and lost the answer. A 4xx (429 too) did not land." — sets
`e.landed = 'unknown'` and appends "[the write may or may not have landed: read GitLab before
making it again]" to the message. The outcome crosses the boundary as a typed field and as
an instruction, which is step 5 and the law `unknown-is-not-a-value` applied to an effect.

The clone helper in `gitlab/apply/lib.mjs:63-113` is the read-side contrast: a clone changes
nothing remote, so it is retried on network and server failures, three attempts in all
(`CLONE_ATTEMPTS = 3`, `:63`), with permanent evidence checked first so "An auth failure, a
missing repository or a missing branch never matches, so it is never retried" (`:65-68`,
decided at `:107`).

## Deviations recorded

- **A write rejected with 429 is known unlanded and still not retried without a probe.**
  `unknownIfAmbiguous` knows a 4xx "did not land", but `:104` still demands
  `provenUnlanded` for any write retry. The rejection *is* the proof; the repo leaves a
  safe retry unused. Conservative, so the cost is one surfaced failure, not a duplicate.
- **A stated Retry-After is shortened, not honoured.** `RETRY_AFTER_CAP_MS = 5000` (`:42`)
  and `Math.min(Number(after[1]) * 1000, RETRY_AFTER_CAP_MS)` (`:64`) retry earlier than the
  dependency asked. backoff-design's rule is that a stated wait longer than the budget ends
  the ladder as *over-budget wait*; here it becomes an early attempt that the limiter is
  likely to refuse again.
- **The two GitLab clients do not share the landing vocabulary.** The server adapter's
  `run` (`src/server/gitlab/adapter/client.ts:84-92`) never retries ("No retry: a write is
  never repeated without the operator.", `:84`), which is safe, but it marks only one
  ambiguous shape as unknown — exit 124 with an i/o timeout, "write outcome unknown. Read
  the branch or MR before retrying" (`:87-89`). A 502 on the same write goes through
  `failureToError` (`src/server/gitlab/errors.ts:58`) as a plain `api` error with no
  unknown-landing mark. One taxonomy, one authority: the scripts' `landed: 'unknown'` rule
  belongs in the adapter's error type as well.
