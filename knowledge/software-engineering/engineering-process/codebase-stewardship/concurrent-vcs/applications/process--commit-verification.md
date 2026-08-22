---
layer: application
type: application
subject: concurrent-vcs
technique: commit-verification
stack: process
verified_on: 2026-08-22
---

# Three verification checks that reported the wrong thing

The technique's rules — count the staged set, read the log back, treat a
rejected publish as a question rather than a verdict — were all in force
during a multi-week refactor campaign run by several concurrent sessions on
one checkout. What follows is what happened to the *checks themselves*, which
is the layer the technique warns is unsubstitutable and the layer nobody
audits.

## 1. The private index went stale and staged a reversed diff

The repo's parallel-safety doctrine (`.claude/CLAUDE.md`, "Parallel-safety
primitives" §5) prescribes an isolated index: copy the index aside, stage into
the copy, commit from the copy. Seeding it with `cp .git/index "$IDX"` has a
self-inflicted footgun that the readback caught twice in one session: after
the ritual's own commit, the real `.git/index` is stale relative to the new
head, so the **second** isolated commit inherits that staleness and silently
records the first commit's files as **deleted** while reverting its
modifications. Measured here: 4 new documents recorded as deleted *and* a
181-line checker extension reverted, none of it visible in the hook output.

The fix is one word: seed with `GIT_INDEX_FILE="$IDX" git read-tree HEAD`
instead of copying. Every property the ritual was adopted for survives — a
sibling's `git add` still cannot touch the private index — and it is always
anchored to the commit being built on rather than to whatever the shared index
last saw. The same class recurred today in the other direction: the shared
index held a **reversed diff** that would have deleted a helper added minutes
earlier, and the pre-commit staged-diff inspection was the only thing that saw
it.

Which is the technique's own caveat, earned: that inspection is a
time-of-check-to-time-of-use race and guarantees nothing about the commit. It
is still the only instrument pointed at this failure, and it has now paid for
itself twice.

## 2. The deletion check greps the commit message

The recovery check for §1 — "did this commit silently record deletions?" — was
written as:

```
git show --stat <sha> | grep delete
```

`git show` prints the **message** above the stat block, so this greps the
prose too. Measured 2026-08-22: it fired on a commit with zero deletions,
because the message contained the word *delete*. A false alarm on the check
guarding a silent data-losing failure is worse than it sounds — the next true
positive arrives already discounted. The correct form suppresses the message
and matches the stat vocabulary:

```
git show --stat --format= <sha> | grep 'delete mode'
```

Same family as everything else in this application: the instrument answered a
question adjacent to the one asked, and the answer looked exactly like the
real one.

## 3. A rejected publish reported success, because of a pipe

`git push | tail` returns **tail's** exit status. A push rejected on the
compare-and-swap therefore exited 0, and the session came within one readback
of reporting the branch as published. The technique already says a rejected
push is not a verdict on your content and must be answered with an ancestry
test against a freshly fetched remote — but that entire paragraph presumes
you know the push was rejected. Through a filter, you do not.

The rule this repo now carries: **never run a version-control command that
reports an outcome through a pipe.** Not through a pager, not through a
truncating filter, not through a formatter. If the output is too long, write
it to a file and read the file; the exit status is the verdict and a pipe
replaces it with an unrelated one. The same defect had already been recorded
here against a checker (`docs/concepts/golden-paths/cross-artifact-drift-gate.md`
notes a red run "pushed past" through a pipe) — it took a second instance, on
the publish step, before the rule was generalized from checkers to every
command whose exit code carries meaning.

## What the three have in common

None of them is a missing check. Each is a check that ran, produced output,
and whose output shape was indistinguishable from the success it was
supposed to be able to deny — a stale index that stages cleanly, a grep that
matches prose, a pipe that launders a refusal. Verification is the layer that
cannot be substituted; that makes it the layer whose own liveness has to be
proven, with the same seeded failure any other gate would get.
