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

## 1.3.0 - 2026-08-28 - kp (resume)

- **Phase 1b step 0 paid off on its first run, and the evidence is that it corrected the run in BOTH
  directions.** The `data-access` subject told me the repo was already conformant where my own prior
  scan note had implied a failure (its `safeRowParse` logs before returning null — that is the
  documented *degrade visibly* policy, not the banned silent skip), and it named two deviations the
  scan had entirely missed. Most valuable of all, it dissolved a blocking question rather than
  answering it: the queued ADR had stalled on "should a validation failure degrade or throw?", and
  the standard's answer is that the question is malformed — the *consumer* picks per read shape, and
  only silence is universally banned. A session's worth of deferred design was resolved by ten
  minutes of reading. Worth stating plainly for future runs: when a queued ADR carries open
  questions, check the governing subject BEFORE designing around them.
- **Turning on an enforcement without dry-running it against real data nearly shipped a 41% outage.**
  The plan was to wire a generated schema in enforcing mode. The seeded corpus validated 66/66 — a
  clean and completely false all-clear. Running the same schema read-only against the live database
  first showed 50 of 121 rows failing on a field the writer had silently stopped emitting. Every
  affected row would have vanished from the list. This generalizes past this repo and past
  validators: any decision shaped "turn on a check" (a validator, a lint rule at error, a new
  constraint, a stricter parser) needs a counted read-only run against production-shaped data before
  it is wired, and fixtures do not substitute — fixtures are precisely the data that never drifted.

  **APPLIED in 1.4.0** (this proposal, promoted the same session on the owner's call). Phase 7c
  gains a step 4 — measure what already violates the rule, before wiring it — and Phase 7b's Rollout
  template points at it for any enforcing change. 7B.b already told a lint-rule codification to check
  the new warning count and pause if it is enormous; that instinct was right and lived in only one of
  the two execution paths. It is now generalized from warnings to data and present in both.

  The applied version is stronger than the proposal, because finishing the work taught a second trap
  the proposal did not know about. Live data passing 100% is ALSO not sufficient: after the schema
  was corrected the live corpus validated 121/121, enforcement was switched on, and a test failed
  that asserts a deliberately thin payload stays readable. The producer's contract and the column's
  legal range are different things. So the step now says to check what the CONSUMERS and their tests
  treat as valid, not only what the producer currently emits — and that the honest end state, when
  the violators are legitimate, is a counted observation mode rather than enforcement.
- **The enforcement dry-run also produced the run's best finding, which is an argument for doing it
  even when you expect it to be clean.** The 50 failures were not noise to route around — they were
  real writer-vs-declaration drift that had been invisible in production for exactly the reason the
  decision was about. The check validated its own premise on contact with reality. A dry-run is
  therefore not just a safety gate; it is a finding generator, and should be framed as one.
- **Worktree feasibility, 3rd observation — and the first time the answer differed BY GATE.** The
  junction made `typecheck` pass (exit 0) and left `test:unit` failing 106 tests across 21 files,
  almost all route-handler tests whose imports came back `undefined`; copying the untracked local env
  in changed nothing. So the v1.3.0 instruction to re-test the slow gate is right but slightly
  under-specified: the split here was not fast-vs-slow but *which gate*, and the failing one was the
  test runner, not the bundler. Suggest the step say "re-test EVERY gate class you will rely on", not
  "the slow gate too". Also worth noting I had asserted this repo's answer in project memory last
  session without having actually tried the junction — the method's insistence on testing rather than
  defaulting caught my own stale inference, which is the best kind of evidence that the step belongs.
- **Resume mode can ADD to the backlog, and the method quietly assumes it only drains.** Phase 9 has
  no path for "executing a queued decision uncovered a new finding"; I wrote the ADR and backlog
  entry by hand from the Phase 8 templates. Small gap, but the drift signal in § Notes on use counts
  scans-that-fill against resumes-that-drain, and a resume that discovers something will skew that
  ledger unless it is recorded as both.

## 1.5.0 - 2026-08-29 - systedo-case

- **Phase 1b step 0 reads the registry's subjects and not the repo's own.** This repo keeps nine
  ADRs under `docs/adr/`, path-checked by a blocking gate, and ADR-0001 is literally the seam the
  chosen theme was about. Reading it before briefing the sub-agents changed the run's question from
  "was this seam ever thought about" to "did the known fixes become gates" - which is where all the
  yield turned out to be. The step lists an "architecture digest" but nothing tells the run to look
  for a decision-record directory, which is a different and more load-bearing artifact than a prose
  digest: an ADR names the test that pins it, so it hands you a falsifiable claim to go check.
  Suggest step 0 say: read the governing registry subjects AND the repo's own decision records, and
  treat any claim an ADR makes about a test as a claim to verify, not to trust.
- **Sub-agents are reliable about code and unreliable about history.** Two of five headline claims
  did not survive verification, and both were historical rather than structural: "byom_config is the
  residual unfixed instance" (wrong - `git log -S` puts the table in SCHEMA eight days BEFORE the
  migration ledger existed, so v1's `db.exec(SCHEMA)` covers it), and "feedback orders by two
  different fields" (wrong - the differing column name is written with the same value). An `Explore`
  agent reads files; it does not run `git log -S`, and when it reasons about when-and-why it is
  guessing from names and comments. The main session should re-derive every historical claim before
  Phase 5, because a false claim that reaches triage costs the user's judgment, not just time. Worth
  saying in 3c beside the convergence/conflict/surprise list: **history is a fourth category, and it
  is the one to verify.**
- **Dry run as finding generator, 4th observation - and this time it changed the DESIGN, not just
  the risk.** Measuring before wiring showed tables 34 = 34 and column SETS identical, with only
  ordinal position differing on two tables. Without that I would have shipped a normalized-DDL diff
  comparing column order, which `ALTER ADD COLUMN` guarantees will fork forever - a gate red on a
  non-difference, which is the fastest way to get a gate switched off. The registry text says
  "column order-insensitive" in passing; the dry run is what turned that clause from a detail into
  the reason the gate is shaped the way it is. The step is earning its place; it may deserve
  promoting from "measure what violates it" to "measure what violates it, and let the answer shape
  the check".
- **Record the EXIT CODE in the Phase 7c baseline, not the tail of the output.** I reported the
  security gate clean at baseline on the strength of `node scripts/sast.mjs | tail -6`, which showed
  the allowlist section and swallowed both the findings and the status. The gate had been red on
  master the whole time - three blocking findings, which then became one of the run's more valuable
  items. 7a already warns never to read an exit code through a pipe; 7c step 3 says "record the
  numbers" and should say "record the numbers AND the exit status", because the baseline is exactly
  where a pipe hides a pre-existing failure and makes you attribute it to yourself later.
- **On Windows, verify line endings before AND after every commit.** Two commits changed ~33 and ~72
  lines of content and ~226 and ~130 lines of file, because the editor rewrote LF files as CRLF. It
  is invisible in `git diff --stat` unless you also run `--ignore-all-space --stat` and compare the
  two numbers. On a shared checkout this is not cosmetic: it hands a concurrent agent a conflict on
  every line of files it never touched, which is precisely what the pathspec-commit discipline in
  7d exists to prevent. Cheap check, belongs beside 7d step 6's staged-index verification.

## 1.5.0 - 2026-09-01 - kp (error-handling; evaluation run, operator delegated)

- **The harness can refuse the fan-out, and the method has no branch for it.** Two of five `Explore`
  agents launched; the other three returned "concurrent subagent limit reached, do not retry"
  (a sibling run was sharing the pool). Phase 3 says "spawn 3-5 in parallel" and nothing else. The
  fallback that worked: run the refused angles in the main session with the same brief, say so in
  the scan note's per-angle summary, and count them as angles, not as sub-agents. Worth one line in
  3b: "if the harness refuses an agent, run that angle yourself against the same brief - do not
  drop the angle".
- **A number in a brief is treated as a fact by the agent that receives it, so it had better carry
  its predicate.** I put "1172 catch sites" and "48 ternaries" in the briefs from quick `grep -c`
  runs; both were wrong (923 by a brace matcher, 793 by the agent's own predicate; the 48 was an
  `-oE` sample). Both agents challenged them unprompted - the "verify premises" sentence from the
  personas run is now three-for-three - but the cost was theirs. The 3b template should say:
  background numbers carry the command that produced them, or are omitted.
- **The falsifier can be a comment.** My census flagged three empty catches in `core.ts`; all three
  were the literal `catch{}` inside comments that argue *against* bare catches. Shipping "3 to fix"
  would have made the new gate lie in the flattering direction. Ninth observation of
  verify-before-quoting; first where the headline example was prose, not code. Corollary for any
  regex census: read every hit in the smallest class before it becomes a count.
- **The deliverable contract held, and the artifact type it lacked is "the ratchet".** The largest
  finding was an unfinished generalization (`safeJsonError`: 79 adopters, 61 hold-outs, a doc
  claiming all). None of the three artifact kinds fit cleanly: an ADR alone is prose, a lint rule
  cannot express the predicate, a 61-file rollout is not one session. What shipped was a
  shrink-only allowlist test - the dry-run count IS the list, a new offender fails, a converted
  route must delist itself - plus an honest doc and a repo ADR. The 7c dry-run step already produces
  the number; the method should name "pin the count as a shrink-only list" as the sanctioned
  terminal artifact for a partial migration, because it is what turns a big finding into a
  one-session gate without pretending the migration happened.
- **Repo law beat the skill's commit prefix.** kp's `commit-msg` hook (added after the last
  architect run) accepts only conventional types; `architect: <step>` was rejected outright. 7d
  step 7 should say "the `architect:` prefix unless the repo's hook forbids it - then a conventional
  type with `architect:` in the body". Also: four sequenced execute-nows with a full lint per step
  cost ~20 min of lint alone in a worktree; the step gate should allow "lint the touched paths"
  between steps with the full lint at 7e.

## 1.5.0 - 2026-08-30 - personas
- A "performance" brief is a claim about an AXIS (cold-start / interaction / steady-state CPU / RAM growth), not a codebase. The scan data ranked differently per axis and the operator's pain was steady-state while my council led with cold-start; one clarifying select before ranking would have prevented the correction. Consider an axis question in Q2a when the free-form theme says "performance".
- Concurrent Sonnet builders editing ONE shared worktree with "no git mutations" briefs + orchestrator-serial pathspec commits: 8 builders, 11 commits, zero staging races or foreign sweeps. This is a viable middle ground between per-builder worktrees and sequential building; the write-set disjointness declaration in each brief is the load-bearing part.
- Builder briefs that end with "verify premises before editing; report deviations with reasoning" produced two materially self-correcting reports (an agent revised its own smell score after reading the governing standard; another refused two stale claims in MY brief). Cheap sentence, high yield.
- Watch worktree node_modules shape: a junction made at setup was silently replaced by a real materialized directory mid-run (unattributed builder action). Cleanup and disk accounting must handle both; main checkout was unharmed but only verified after the fact.
