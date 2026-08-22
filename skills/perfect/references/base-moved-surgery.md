# Exception path — surgery for a base branch that moves under you

Not the default any more; the one-branch wave shape removes the cherry-pick class entirely. Reach for
these only when a concurrent session dirties or advances a file you must land into.

- **Union-merge discipline:** both-append conflicts are usually safe to keep-both — but only when each
  side is a complete declaration. NEVER blind-union hunks whose sides end mid-function (a glued
  function and a swallowed closing brace turned master red for two picks). Read every seam.
- **Concurrent-session DIRTY files:** never stash, never wait — commit *around* them.
  (a) Dirty generated/append file (a locale file, a barrel): stage `HEAD + your changes` straight into
  the index (`git hash-object -w` + `git update-index --cacheinfo`) and write
  `their-working-copy + your changes` to disk — their uncommitted work stays theirs, and their later
  commit can't revert your change.
  (b) Dirty source file: same index trick, content built by `git merge-file` (base=branch-fork,
  ours=HEAD, theirs=branch), plus a second merge-file for the working copy.
  (c) After re-applying another session's delta, **diff the result against the captured patch and
  require an exact match** — a reverted value edit leaves both a clean `git status` and a
  grep-for-the-key satisfied.
- **Shared append-files** (registry tables, barrel exports, generated name lists, generated locale
  artifacts): never wholesale-`checkout` a branch's version across sequential operations — it clobbers
  earlier ones' registrations and the typecheck catches it too late. Patch-union
  (`git diff branch~..branch -- file | git apply --3way`) or regenerate from source, always.
- **Regenerate generated files at merge conflicts** rather than taking either side. A 206-commit
  merge conflicted in exactly three files: one append-only ledger and two codegen outputs; taking
  either side would have dropped one of the two contributing sources; running the generators
  reconciled both automatically. Conflict count is a poor proxy for merge risk — 206 commits produced
  3 conflicts, of which 2 were not really conflicts at all.
- **Locale re-application:** don't hand-merge JSON. Re-apply the branch's key **adds/removes**
  programmatically over the base's current locales (flatten base vs branch per locale, set/delete on
  current, write), then run the repo's locale codegen and its locale check gate. Anchor any locale Edit
  on ASCII context — consoles render non-ASCII as `�` without the file being corrupted; the repo's
  encoding check, not the console, is the arbiter.
- **Non-interactive history repair** at quiescence works:
  `GIT_SEQUENCE_EDITOR="sed -i '1s/^pick/reword/'"` + `GIT_EDITOR=<script that writes the fixed message>`.
  Do it before any final SHAs are recorded — every descendant SHA changes. Never from inside a
  still-shared tree; only once every builder has reported.
- **A concurrency precondition is a measurement with a shelf life of minutes.** The merge that was
  unsafe at 19:00 was safe at 21:38 because the sibling had wrapped; an operator's approval given on
  "no dirty file is touched by an incoming commit" was false 14 minutes later because the live session
  had moved on to files the incoming commits also touched. Re-measure immediately before the mutating
  command, in both directions — **blocked is a timestamp, not a state**, and so is approved.
- **Slow pre-commit gates** (an LLM-backed hook that takes ~10 minutes on certain paths): run that
  commit `run_in_background`, continue reviewing, and read its output before the next state-changing
  action — never assume it passed.
