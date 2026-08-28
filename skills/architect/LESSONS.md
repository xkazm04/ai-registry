# Lessons - architect

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-24 - ai-registry

- **Re-seated onto the lane's overlay contract (1.0.0 -> 1.1.0).** The body declared itself "personas-specific", hardcoded `C:/Users/kazda/Documents/Obsidian/personas` in four places, and made Phase 0 `exit 1` when that vault was absent. On a second machine the vault is at a different root, so the skill did not degrade — it aborted before Phase 1. That is the failure mode the lane doctrine's "the body is generic" rule exists to prevent: a body that cannot run is not a shared library item, it is one machine's script.
- **The overlays already existed; nothing read them.** `.claude/perfect/config.md` had been carrying personas' gates, repo law and context-source provenance for rounds, and `/perfect` resolved a vault from a candidate list. `/architect` sat beside it in the same repo reading none of that and holding its own frozen copy of the same facts. The gap was not missing configuration — it was a body that never asked.
- **Phase 0 now creates rather than aborts.** `VAULT` resolves from an overlay candidate list, first existing wins, and falls back to `<repo>/.architect/` which it creates. Every other project-specific value moved to `.claude/architect/config.md` with a default: context sources (default `context-map.json`, else `CLAUDE.md`), area menu, gates, repo law, docs/lint/test-guard codification vehicles, smoke, the coverage name set.
- **What stayed in the body is the craft.** The nine themes, the five scan angles, the four-way triage, the ADR contract, the aging-strong-pattern review, the commit-on-top discipline and the staged-index verification are all method, not project. Re-seating touched where the run gets its facts, never how it thinks.

## 1.1.0 - 2026-08-28 - ascent

- **Removed the one-execute-now-per-session recommendation (1.1.0 -> 1.2.0).** Phase 6 told the run to
  push back when a user marked more than one finding `execute now` ("doing N changes in one session is
  high-risk - pick the highest priority and queue the rest?"). On ascent's first run the owner answered
  `All=1` and the step turned into a turn spent negotiating scope the owner had already chosen. The
  triage menu IS the scope decision; re-litigating it after the user has answered is the skill second-
  guessing an explicit instruction.
- **What replaced it is the part that was actually load-bearing: sequencing.** Multiple execute-nows now
  run as one session ordered by ASCENDING RISK with the gate re-run between findings, and the sequence
  stated before work starts. That preserves the real value the warning was groping at - attribution when
  something regresses - without making the user defend their triage. The warning was solving a
  correctness problem with a permission prompt.
- **First-run vaults make Phase 4 a no-op, and the run should say so.** Phase 4 (surface against existing
  memory) reads four vault files that are all empty on run #1. The method has no first-run branch, so the
  honest move was to state "vault empty, no cross-check, no aging patterns" and move on. Worth an
  explicit line in the method rather than leaving each run to improvise it.
- **The five-angle fan-out earned its cost, and the conflict lane is where the value showed up.** Angle 1
  (usage map) read three coexisting org-auth mechanisms as competing drift; angle 4 (auth), which
  individually read all 34 routes the grep flagged, established they are a composition hierarchy
  bottoming out in one resolver. A single-angle scan would have shipped angle 1's wrong read as a
  finding. The Phase 3c "Conflict" instruction is the guardrail that caught it - keep it prominent.

## 1.2.0 - 2026-08-28 - kp

- **The highest-yield finding shape in a mature repo is "the correct version already exists here, and
  one copy drifted."** Three of the four things this run shipped had an in-repo correct sibling:
  `reopenEntriesByJobId` carried the lost-update guard its twin `closeEntriesByJobId` lacked;
  `group-eval.ts` wrapped the PK rebuild that `core.ts` left bare three times; `seedExampleJd` checked
  its own slug where three sibling seeders counted rows. None of these is a missing idea, so none
  needs a design — the fix is mechanical, the reviewer already agrees with it, and the ADR writes
  itself because the rationale is quoted from the correct copy's own comment. The five default angles
  all ask some version of "what is wrong here"; none asks "where does the same pattern appear twice
  with different rigour?" That question would have found these faster and is nearly free to add.
- **An excluded instance needs the same evidence as an included one.** The seed-gate finding was "this
  is wrong in N places"; I triaged one instance out on a plausible-sounding argument about user
  behaviour (nobody would deliberately empty a fixture-only table). The regression test failed on its
  first run and refuted it in thirty seconds — the fixture team's rows live in a shared table, so
  clearing your own data empties it incidentally. Writing the test before fixing the scope, rather than
  after, is what caught it. Generalizes: when a finding's reach is "N call sites", the ones you decide
  to skip are findings too, and the cheapest evidence is the test you were going to write anyway.
- **Proving a negative is a finding, and the method should say so.** The transaction angle went hunting
  for `await`-inside-a-sync-transaction — the highest-value bug class in that stack — and found zero.
  That result was worth as much as any defect it could have found: it converted a suspected weakness
  into a codifiable strength, and the resulting lint rule shipped at `error` with nothing to migrate,
  which is the cheapest gate a repo will ever get. Phase 3d's output structure counts weak patterns,
  strong patterns, swaps and bug classes; it has no slot for "the bug class you feared is absent,
  here is the gate that keeps it absent." Runs will under-report these because a clean sweep reads as
  a null result.
- **An angle briefed to be even-handed will invert, and that is the point.** The tenancy angle was
  pointed at a possible weakness, came back 1/5 healthy, and produced the run's best strong pattern —
  because its prompt said in as many words "be even-handed; this may become a lint rule." Worth keeping
  that sentence in the 3b template for any angle aimed at a mechanism the repo is proud of.
- **Confirms ascent's first-run note (1.1.0).** Vault empty, Phase 4 a no-op, Phase 1d nothing to age;
  stating that in the opening line and moving on was correct and cost nothing. Two projects now.

### Redesign proposal (NOT applied — no version bump)

- **Phase 3a should carry a sixth standing angle: "internal precedent."** Its brief: find places where
  the same pattern is implemented twice at different levels of rigour, and report the pair. Cheap,
  repo-agnostic, and on this run it would independently have surfaced three of the four shipped items.
  I have not applied it because a sixth parallel agent changes the run's cost profile for every
  consuming project, and that trade deserves a deliberate call rather than a drive-by edit — it may
  belong as a *replacement* for one of the five when the theme is a mature subsystem, not an addition.
- **Phase 7a's worktree default needs a feasibility test.** The method makes a worktree the default for
  multi-file rollouts, but a fresh worktree has no installed dependencies, so in this repo none of the
  gates could run there — `typecheck` shells out to a Python codegen step and `tsc`, `test:unit` needs
  the tree's `node_modules`. Validating every rollout step matters more than physical isolation when
  the repo law already mandates pathspec-only staging, so the honest choice was the main checkout, and
  I said so in the scan note. The method should ask "can the gate run in a worktree?" before defaulting
  to one, rather than making the operator discover the answer at step 1 of the rollout.
- **A CRLF hazard worth one line somewhere in Phase 7d.** Two edited files were silently rewritten
  whole because the editor changed their line endings, which would have committed as thousand-line
  diffs. The existing "verify `git diff --cached --stat` before committing" step caught it — that step
  earns its keep and should perhaps name this as one of the things it catches, since a whole-file diff
  on a file you changed twelve lines of is otherwise easy to wave through.

## 1.2.0 — 2026-08-28 — personas-web

- **The registry read belongs BEFORE the sub-agents, not after.** This repo is wired to an org
  knowledge registry whose `motion` subject already governed two of the run's findings. Reading it
  late changed nothing about the findings but changed everything about their framing: they became
  deviations from a named standard rather than one reviewer's taste, which is the difference between
  "queue" and "execute" at triage. It also **overturned a strong-pattern candidate** — the repo's
  global reduced-motion CSS reset, which I had scored as load-bearing, is the standard's explicitly
  named "global-kill trap" (the repo merely uses its least-bad form, epsilon rather than zero).
  Codifying it would have entrenched a documented anti-pattern. Applied as Phase 1b step 0 + the
  `## Knowledge registry` overlay key.
- **A registry read also creates an upward obligation.** The standard said "wrap the non-subscribing
  reader and forbid the raw one" but never addressed server rendering, where the same reader is not
  merely stale but *wrong* — and the failure mode inverts the accommodation. That gap was worth more
  than the local fix. Added the `registry` codification vehicle (7B.d2) so a run can contribute up
  instead of only consuming.
- **Worktree feasibility, 2nd observation, new failure mode.** Last time the gates could not run in a
  worktree for want of dependencies. This time a `node_modules` junction made `tsc`/lint/vitest work
  — and the *bundler* still refused it ("Symlink [project]/node_modules is invalid, it points out of
  the filesystem root"), so the final build gate never ran. The feasibility test now has to cover the
  slow gate too, not just a cheap one. Applied in Phase 7a.
- **Never read an exit code through a pipe.** `npx next build 2>&1 | tail -35` reported exit 0 for a
  build that died — `tail` succeeded. I nearly recorded a passing build gate that had actually
  FATAL'd. Worth the one line it now costs in 7a, because the failure is silent and self-flattering.
- **Calibration, 8th observation of verify-before-quoting — and the first where the agent's *example*
  was wrong rather than its count.** A sub-agent's flagship "dead `use client` directive" called
  `useId()`, which server components cannot do; the directive was required. Its adjacent claim of
  "~60 such files" then collapsed, because the classifier behind it was wrong, not merely imprecise.
  Refinement: when an agent's headline EXAMPLE falsifies, re-derive the count yourself rather than
  discounting it — a bad exemplar means a bad filter, and the number is not salvageable by adjustment.
  Two other agents' counts (221/395/354/115/12) reproduced exactly, so the rule is about verifying,
  not about distrusting.
- **The best finding was a fix the repo already owned.** The highest-payoff item was not a gap but an
  unfinished generalization: a documented, postmortem-carrying hook fixing this exact bug class,
  applied to one page while the component wrapping *every route* still had the defect. Worth adding to
  the Phase 3c synthesis prompts as a named shape — "a fix that exists but was never generalized" is
  cheaper to ship and easier to defend than anything invented during the scan, because the design
  argument was already won.
