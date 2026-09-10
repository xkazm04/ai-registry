# Lessons - spark

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets. Merged from every copy of this skill on 2026-08-22 when it moved into the registry lane.

## 1.0 - 2026-08-22 - ascent
- Order metaphor/shape questions before presentation questions; a presentation answer given before the metaphor changed had to be re-asked.
- Brief builders: "new files are committed before guard tests run — never edit a guard test to pass pre-commit." One builder widened a doc-sync guard's file enumeration to untracked files; reverted by the Director.
- A new org-scoped table makes the erase/retention path a mandatory touched context; targeting missed it, a builder's question caught it.
- Parallel static-design + live-prototype experiments (5 metaphors) are a strong input for the visual-metaphor wave; the operator chose from the static canvas, so treat prototypes as comparison, not seed.

## 1.0.0 - 2026-08-23 - ai-registry
- Lane-conformance audit (docs/skills-lane.md "the body is generic"): the 1.0.0 body hardcoded ONE repo's specifics - a literal Obsidian vault path, that repo's gate commands (`npm run check`, `check:i18n:strict`, `cargo clippy`, `npm run test:rust`), `context-map.json` as an unconditional requirement, and three host rituals (an active-runs ledger, a decision-capture command, an i18n translate pipeline) stated as method steps. A second repo could not run the skill without either editing the body or silently failing the steps. 1.1.0 moves all of it behind a `## Project overlay` (repo `.claude/spark/config.md` -> vault `config.md` -> defaults) and turns the host rituals into overlay-declared `## Rituals` hooks the loop runs only when declared. Method, roles, waves, liveness rules, worktree/commit doctrine and the retro are unchanged.

## 1.1.0 - 2026-08-24 - personas
- Translator fan-out prompts that say "keep brand/technical terms" cause agents to keep product METAPHOR names (UI variant labels) untranslated, tripping raw-English-value gates. Briefs should enumerate the actual brand list and say metaphor/feature labels are translatable.

## 1.1.0 - 2026-08-25 - personas
- When the base branch moves mid-spark (parallel sessions), merge it into the spark branch BEFORE the final ratchet-gate pass; attribute gate drift per-rule against `git diff base...HEAD -U0` added-line ranges — against stale baselines the drift is unattributable and reads as someone else's.
- A ratchet tool's bulk "update baselines" command updates EVERY drifted rule, including rises your own cleanup just introduced — review its diff before committing it.
- Builder briefs should end with "run the repo's formatter before handback"; two commits bounced on a format-staged hook.
- One conformance builder fed the full list of gate rises (with the per-rule attribution method) closed 13/15 for real — cheaper and better than the Director hand-fixing or blanket-ratcheting.

## 1.1.0 - 2026-08-24 - kp
- Two parallel builders in ONE worktree: one ran `git add` mid-flight and the Director's pathspec commit swept the sibling's half-done files (recovered via soft-reset + restage). Builder briefs must say NEVER stage; only the Director touches the index.
- Long-running dev servers bit twice in one spark: a cached ensureDb missed new DDL and a cached i18n catalog rendered raw key paths - both misread as code defects. When a round changes schema or catalogs, a dev-server restart is part of verification, not optional.
- Wave 1 framed identity as import-vs-fresh; the fork that actually mattered (live shared state vs copy) only surfaced in wave 2 and the operator overrode toward it. Put the sharpest architecture fork in wave 1 even when it seems premature.

## 1.1.0 - 2026-08-25 - ascent

Six work packages (a cumulative-scope question answered at the top rung), 5 scouts, 4 waves, 15 questions, 0 builder bounces.

- **Phase 4 partitions source directories but not DOC surfaces, and on a build of more than three packages the feature doc is where they converge.** Two parallel builders were given disjoint code territories and the same `docs/features/<area>/README.md` plus the same doc-map. Markdown has no compiler and no merge conflict at edit time, so a lost update would have been silent. The fix that worked mid-flight: exactly ONE package owns a doc file; the others write their section to a scratch file that the Director merges mechanically. See the redesign proposal below.
- **A scout claiming a capability is ABSENT must show the repo-wide grep, not the subsystem-scoped one.** A scout reported "no provider adapter supports tool calling"; one adapter had shipped a working tool-config for a different feature all along, and the scout had only grepped the subsystem the design targeted. The skill already requires a shown grep for *other consumers* of a shared helper — this is the mirror case, and it is more dangerous: an absence claim licenses building something, and needs wider evidence than a presence claim.
- **An acceptance criterion that asserts an ORDERING must name the mechanism that makes the ordering observable.** "Assert the turn has not started when the handler returns" is unfalsifiable — a stream's `start()` runs synchronously during construction, so it has already run. The builder caught it and substituted a subclass that timestamps its own construction. A criterion nobody can fail is worse than no criterion.
- **A source-reading guard must normalize line endings.** A test that read a module and matched a snippet containing a literal newline passed in the worktree it was authored in and failed the moment the branch was checked out elsewhere, because autocrlf rewrote the file. This class is invisible to every gate that runs where the code was written — including the builder's own, the Director's pre-merge run, and CI on the same platform.
- **Repairing a red test file requires stress-running it, not accepting one green.** Three dead time-bomb fixtures were masking a one-in-ten flake underneath them; a single passing run after the repair would have shipped it. A red file hides its own flakes.
- **Restore the lockfile immediately after the worktree `npm install`**, not at merge. `npm install` in a fresh worktree can prune optional/peer entries and rewrite it; carrying it dirty across every package is one careless staging call away from a junk commit.
- **Tooling, and the sharpest one:** never embed backticks in a string passed to `python -c` from bash — bash performs command substitution first. A prose string being written into a config file contained a `git add -A` example and bash EXECUTED it, staging a parallel session's uncommitted work. A mixed `git reset` recovered it with nothing lost. The skill's worktree doctrine already says only the Director touches the index; that has to include not touching it by accident, so the operational rule is to write files with the file tool rather than through a shell-quoted string.

### Redesign proposal

Phase 4's `### Work packages` schema should carry a doc-ownership field alongside "files touched" — proposed wording: *"name the doc surface each package owns; where two packages document one feature, exactly one owns the file and the others emit sections for the Director to merge."* NOT applied here: this is the first run to hit it, and the skill's own rule is that a SKILL.md edit needs two sessions pointing at the same flaw and an operator gate. Recorded so the second occurrence is recognised immediately.
## 1.1.0 - 2026-08-27 - politicas
- Liveness rule needs a fourth half: a CATEGORICAL prop "exists" only once its values were sampled against an independent register. The scout confirmed `electoral_arena` was populated on 5 240 nodes; it was self-declared and wrong for 1 296 municipalities, and the loader builder found it — the design had already windowed findings by it.
- A brief's wire contract should carry only helper symbols a scout verified at `file:line` (or say "builder verifies"). One asserted helper (`asciiFold` in a module that does not export it) cost a builder a detour.
- Rules composed over "every X carries a Y" data flood by construction (every bill had a forensic verdict → every sponsorship became a negative finding). When a scout reports a closed census (141/141), the design wave should ask what the rule's floor is, not whether the source is live.
- Repo commit-msg doc-sync rungs are a Phase-0 scout item: which docs are coupled to which globs, and what dismissal trailer they accept — three commits bounced before the overlay carried it.

## 1.1.0 - 2026-08-27 - gravitone
- "Builder briefs must say NEVER stage" (kp lesson) is not enough: one builder ran `git stash` from a gate command and popped it. Say "never stage, never stash" — a stash is a staging of everything.
- When the repo already carries a built-but-unmounted vocabulary (here: trailer types + an 11-rule checker with no producer), the operator overrode BOTH minimal recommendations toward the full surface. Scout for "types with no producer/consumer" explicitly and put the full option first in the wave when one exists.
- A scout's single most valuable finding was that a step's "engine" was a mocked clock with no route and no prompt read — it turned the engine question from "which model" into "fixture or route". Ask every scout: does this surface actually call anything?

## 1.2.0 - 2026-08-30 - gravitone-gcloud
- A spark can legitimately span two repos (product surface in the consuming repo, a new registry-lane skill as a work package). What worked: treat the registry package as parallel WP with its own gate (check-skills, not tsc), let the Director commit it in the registry checkout, and keep the shared wire contract verbatim in BOTH the product types and the skill's references/ - name-for-name.
- Kill-verify builder smoke servers before removing the worktree: one survived its own "killed" report, held the next-swc binary, and blocked `git worktree remove`. Check the smoke port with a socket query, then delete.

## 1.2.0 - 2026-08-30 - gravitone-gcloud
- Parallel builders that each run TREE-WIDE gates cross-attribute failures (one builder's ratchet run flagged a sibling's committed lint rise; a third was transiently blamed). The fix that worked: require every builder report to separate "gates on my files" from "gates on the tree" - attribution became instant, and the sibling's catch of a real defect was a net win. Consider adding this split to the Phase-5 builder-brief template.
- Pre-committing shared-file wire types (the step-store records) as a Director commit BEFORE the parallel fan-out turned "sequential when packages share files" into "parallel with zero shared files". Cheap, and it made three-way parallelism safe.
- Scout liveness rule has a write-side blind spot: a brief predicated a default on "no record exists", but the consumer SAVES AN EMPTY RECORD on mere hydration, so record-existence was meaningless. Scout question to add alongside the field-population rule: "what does the consumer write on mere hydration/open?"

## 1.1.0 - 2026-08-31 - personas
- Builder census dry-run: requiring builders to run the repo's ratchet rules against their own file set BEFORE reporting pre-fixed 8 would-be violations in one WP; promote to standard builder-brief boilerplate in repos with ratchet gates.
- Per-WP atomic commits require per-shared-file ownership declared in the briefs (command registration files, module decl files, generated barrels); when WPs entangle those, plan ONE stage-level commit up front rather than discovering non-compilable intermediate states at staging time.
- Parallel builders cut off by a provider usage limit resume losslessly via SendMessage (7th consecutive confirmation); long parallel stages should expect mid-flight cutoffs.
- Rebase executed inside a linked worktree: `git rebase --continue` can loop on a phantom conflict with a clean index; recovery is commit --no-edit, rebase --quit, then branch -f to the detached tip - and the branch ref must be verified from the MAIN checkout in both rev-list directions before the rebase is called done.
- Scout boilerplate (third occurrence): an API scouted for a foreign consumer must capture the request ENVELOPE (exact field names), not just routes.

## 1.2.0 - 2026-09-01 - ascent (weekly-digest, evaluation run, operator absent)
- **Phase 2 has no branch for "the Agent tool is unavailable".** The shared subagent pool was saturated by sibling runs ("concurrent subagent limit reached, do not retry"), so the Director scouted three contexts itself under the same evidence rules and said so in `## Scout digest`. The skill should name that fallback explicitly rather than leave the Director to improvise it.
- **Pre-commit the wire types AND compilable stubs (final signatures, `null`/`""` bodies) before the fan-out** — second run where this turned a sequential model→panel dependency into fully parallel packages with zero shared files (first: gravitone-gcloud 2026-08-30). Worth a sentence in Phase 5 step 2.
- **Doc ownership, third occurrence** (ascent 2026-08-25 redesign proposal; the overlay log; here): one package owns the doc file and leaves a `<!-- WPn doc section merges here -->` placeholder; the other writes its section to scratch; the Director's merge is one string replacement. The Phase 4 `### Work packages` schema still carries no doc-ownership field — the two-sessions bar for a SKILL.md edit is met, gated on the operator.
- A wave question whose alternative the repo already forbids (here: server panel vs API route, with the chunk map's header ruling it out) is convention, not a question — the Director's completeness checklist should be allowed to close "API surface" by citing the convention instead of spending a question on it.
- Delegate mode (operator absent) took the recommended option 9/9; that is not a taste signal and must not be mirrored into `## Question taste`.

## 1.2.0 - 2026-09-01 - ascent (Fable vs Opus bake-off, weekly-digest)
- Near-identical architectures from both models; the operator merged Fable's output and kept Opus's method. Four method edits landed in 1.3.0: registry subject before the waves, the snapshot-rewritten-timestamp liveness rule, doc ownership on work packages, and the scout fallback.
- `Recommendation.createdAt` is populated by the query the consumer calls and is still not an "opened at": every scan re-creates the row set, so counting it reports the whole carried-forward backlog as new each night. The honest count is a first-appearance diff on a durable identity.
- A documented whole-fleet period delta is correct at 90 days and inverts at 7: one entity onboarded mid-window makes every dimension read as a decline nobody experienced. The shortest window a surface offers sets its cohort rule.
- An API session limit killed the Director and both builders mid-report on both runs. Everything the builders had written survived; recovery is to re-read the tree and review the files, not to re-dispatch.
- When a gate cannot run for an environmental reason (Turbopack refuses a `node_modules` junction), substitute the narrowest command that still exercises the property (`next build --webpack`) and report both the refusal and the substitute; never "passed", never merely "skipped".
- A delegate that takes 9/9 recommended options produces no `## Question taste` signal; do not mirror it.

## 1.2.0 - 2026-09-01 - ascent (model bake-off)

- Context: weekly-digest.
- `model: fable`. Both models produced a near-identical architecture (a new Bought tab, server panel, no route or table, wire-contract pre-commit, two parallel builders). The operator merged Fable's output (it also retargeted the Slack push and registered a follow-up idea) and asked that Opus's method be kept: the registry subject read before the waves, the snapshot-rewritten-timestamp liveness rule, the doc-ownership field on work packages, and the scout fallback. Those four edits are in Phases 2, 4 and 5 above.

## 1.3.1 - 2026-09-04 - ai-registry

- The dated `## Model choice (bake-off 2026-09-01, ...)` section moved out of the SKILL.md body into the block above. The lane spec (`docs/skills-lane.md`, "The body is generic") says a body may carry no project name, and this one named ascent; a dated finding about a run is what `LESSONS.md` owns. Content preserved verbatim; nothing else in the body changed, so a patch bump.

## 1.3.2 - 2026-09-06 - ascent

- **A new optional input needs a named CALLER in the contract, or it ships dead.** The brief listed
  the wire-level inputs a pure brief builder would accept (`subjectContexts`, `repo`) and the
  package that produces the function; no package owned the call site (the dispatch route), which
  sat outside every territory. The builder shipped the pure half and correctly said "no caller";
  the Director wired it. Phase 4's contract-completeness rule should read: every new field names its
  producer AND its first consumer, and the consumer is inside some package's file scope.
- **Two builders coding the same absent value drift on omit-vs-null.** A skill doc said a missing
  revision "reads as `revisionsBehind: null`"; the script omits the key. State the absent-value
  convention once in `### Data & API` (omit / null / 0, and why) so parallel packages inherit it.
- **The merge step must not assume the main checkout is on `base_branch`.** Both hosts' main
  checkouts were on foreign branches with dirty trees; the fix that worked was `git checkout
  <base> && git merge --ff-only` inside the spark worktree (a branch can be checked out in only one
  worktree, and the base was free), after rebasing the spark branch onto it there.

## 1.3.2 - 2026-09-08 - firetv (Study Desk maths module)
- **When the operator stops a wave to clarify, the option set was too narrow — not the question wrong.** The rejected wave here produced the run's best answer (an authored syllabus whose topics carry a reference band per national system, rather than the binary of "adopt a curriculum" vs "author one blind") only because the operator reframed it. Phase 3 should treat a mid-wave stop as a signal to widen options before re-asking, and say so.
- **Detect contradictions between the operator's own answers and propose the synthesis instead of re-asking.** Two picks here were incompatible (batch the whole set into one read; speak up at the moment of error). Offering the resolution — one photo, then walk the set item by item speaking at each slip — cost one question and preserved both intents. Worth naming as a move in the wave-composition guidance.
- **The liveness rule needs a client/server half.** The rule covers "a surface only exists if it renders" and "a field only exists if a query populates it", but a builder lost work importing a filesystem-backed module into a client component. Add: *a module only exists for a surface if that surface's runtime can import it* — scouts should state the boundary for anything a screen might consume.
- **Parallel builders sharing one dev server and one data directory is a real cost, and a worktree is not always the fix.** When the gates need a running server, installed dependencies and a browser harness, worktrees duplicate all three. The cheaper rule is data isolation: a builder that writes app data uses a scratch identity and reports what it wrote. One builder here wrote a fabricated learner memory that would have been read into every later prompt.

## 1.3.2 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 1.4.0 - 2026-09-09 - clon-fable (extraction spark, delegate mode)
- **An extraction spark has an empty target repo; Phase 2 should say where the scouts go.** The idea was "pull feature X out of repos A and B into a new package". The target had nothing to scout, so the two scouts were pointed at the PARENT repos with the same evidence rules; the digest became the foundation of the whole design. Worth one sentence in Phase 2: "when the target is a new repo, scout the repos the idea is extracted from, and say so in `## Targeting`".
- **A fixture number that a spec elsewhere derives must be derived or labelled illustrative.** The prototype brief stated a draft's confidence (49) and a parts breakdown that summed to 37; the contract's formula yields 28. Three parallel builders each resolved the contradiction differently. When a brief carries a number a sibling package computes, compute it from the contract or mark it "illustrative, not arithmetic".
- **Parallel UI builders sharing one browser and one ad-hoc dev server cross-contaminate.** Two builders re-pointed each other's Chrome tabs and reused one builder's port, which outlived its owner (the gravitone 2026-08-30 lesson, third occurrence). Brief parallel UI builders with "own port, kill it on exit, or verify headless" — the headless Playwright builder had the cleanest run.
- **Delegate mode with the three-prototype handshake as the real gate worked**: 14 Director decisions, 0 re-asks, 0 builder bounces; the operator's question is the prototype pick, not the waves. Not a taste signal (per ascent 2026-09-01).

## 1.4.0 - 2026-09-09 - clon-fable (build phase of the founding extraction spark)
- **Order the wave before the work it determines, even when the work looks independent.** The contract pass was dispatched before the operator answered the guardband question, so it implemented a symmetric band and needed a full second pass. Nothing about the package looked like it depended on that answer until it did.
- **Phase 2's "read the governing subject BEFORE the waves" earns its keep on a greenfield build, not just a brownfield one.** Reading fifteen subjects before a line of Rust found twelve deviations, three structural in the confidence design — including a band wider than the gap to its own threshold, which meant the model rather than the backbone decided sends. Read after the build that is a rewrite; read before, it was one question.
- **A doc can declare a policy the schema cannot compute, and nothing fails.** The per-channel privacy projection was written into two documents at founding; the `fact` table carried neither the provenance nor the flag it needed. No test could fail, because the rule simply had no way to exist. Worth adding to the liveness rules: for every policy a doc declares, name the column that computes it.
- **The Director's live smoke is a phase, not a courtesy — and it must run the real artifact.** Both packages were green in isolation and the integration was broken twice: no CORS layer, then a client calling a hardcoded port instead of its own origin. Fixture mode hid both perfectly, because a fixture never crosses the seam. The method says "UI work gets observed, not assumed"; this run is the argument for making that observation run the built binary rather than a dev harness.
- **Gates that cross-check each other catch the author in the same minute.** Changing a price in the contract immediately failed the workflow gate, which compares the workflow's embedded copy verbatim. One-authority enforced by a machine instead of by memory.
- **Stub-first parallelism, third project running.** The Director committing the core's public API as compilable stubs cost one turn, made a real core→server dependency into two file-disjoint packages, and produced better questions: the core builder returned five signature objections rather than reshaping the API silently.
- Rate-limit resumption via SendMessage confirmed twice more (8th and 9th); on-disk work intact both times, zero rework.
