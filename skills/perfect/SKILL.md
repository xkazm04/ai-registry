---
name: perfect
description: "Session-after-session product perfection loop. The strongest available model at xhigh reasoning (currently Fable 5) directs - it walks the repo's context map context-by-context, proposes up to 5 challenged, high-value directions per context (features, design elevations, significant optimizations), gates them with the user until the pool is full, then orchestrates Opus-class builder subagents on ONE shared branch - grouped so their write sets cannot collide - while making every review/merge decision itself. All state lives in a linked Obsidian vault (or <repo>/.perfect/) so any future session resumes the loop exactly where the last one stopped; per-repo specifics (vault path, gates, Class B/C files, repo law, taste) come from .claude/perfect/config.md. Invoke with /perfect [init|propose|build|status|smoke|reflect] [context-name]."
category: workflow
memory: vault
version: 2.5.0
tags: loop, director, builders, shared-branch, vault, product-quality
argument-hint: "[init|propose|build|status|smoke|reflect] [context]"
contexts: tracked
---

# Perfect — the direction-and-delivery loop

> One model configuration is best at *judgment* — seeing what would make a product excellent, challenging its own ideas, reviewing diffs ruthlessly. A well-scoped builder is great at *execution* inside a tight brief. `/perfect` wires the two together in a permanent loop: **the strongest model at xhigh directs, Opus-class builders build, the vault remembers.** Each session moves the product measurably closer to the best UX, architecture, and feature quality it can have; no session ever starts from zero.

## Roles — Director and Builders

- **Director (the main session — the strongest available model at xhigh reasoning; currently Fable 5, Opus 5 acceptable fallback).** Owns everything that is judgment: opportunity-scoring contexts, drafting directions, adversarially challenging them before the user ever sees them, running the acceptance gate, writing builder briefs, answering builders' product questions mid-flight, reviewing every diff, deciding merge/redo/drop, running the repo gates, committing, and writing the vault. The Director **never delegates a decision** to a builder and never rubber-stamps a builder's diff.
- **Builders (Opus-class subagents, `model: "opus"`, one per *lot* — see Phase B step 1).** Each receives a tight brief (direction specs + acceptance criteria + an explicit **write set** + repo-convention digest) and implements **in the wave's single shared tree**, alongside its siblings. Isolation is not what keeps them from colliding — disjoint grouping is. Builders return a structured report; when they hit a genuine product ambiguity they **return the question instead of guessing** — the Director answers via `SendMessage` and the builder continues.
- **Scouts (Explore subagents, cheap).** Produce the per-context current-state brief the Director synthesizes directions from. Never used for judgment.

## Project overlay

This file is the **method** and is repo-agnostic. Everything a repo is — its vault, gates, registries, conventions, taste — lives in ONE overlay the Director reads in Phase 0: **`.claude/perfect/config.md` in the consuming repo** (a tracked file, so it travels with the clone and survives the vault, which is not version-controlled). The vault no longer carries a `config.md`; on the first 2.3 run, if `$VAULT/Perfect/config.md` exists and the repo overlay does not, move it to `.claude/perfect/config.md` and say so. **The loop runs with no overlay at all** — every key below has a default — but say in the resumption sentence that defaults are in force. Never paste one repo's overlay into this file; a project copy that did so shadowed the library copy unnoticed (see LESSONS).

Overlay shape: YAML frontmatter for scalars, markdown `##` sections for lists and prose. Keys (default in brackets):

```yaml
---
product: "<product name>"             # brief header  [the repo directory name]
stack: "<one-line stack description>" # brief header  [detected from package.json / manifest, or "unknown"]
vault: ["<abs obsidian root>", ...]   # candidate roots, first existing wins; on init, CREATE the first
                                      # named root if none exists (operators keep per-project vaults there)
                                      # rather than silently falling back  [<repo>/.perfect]
vault_subdir: Perfect                 # namespace inside the vault (share one vault across repos); "" = the root itself  [Perfect]
base_branch: master                   # the wave forks from / lands on it  [detected from origin/HEAD, else current]
wave_size: 3                          # max concurrent lots  [3]
lot_caps: {}                          # per-toolchain caps, e.g. {rust: 2} when a shared target dir serialises  [{}]
pool_target: 10                       # accepted directions before Build  [10]
round_shape: pool                     # pool (fill to target) | round (propose 1-3 contexts, gate, build now)  [pool]
cooldown_rounds: 2                    # a context proposed sits out this many rounds  [2]
commit_format: "feat(<context>): <title>"   # per-direction commit subject  [feat(<context>): <title>]
context_map: context-map.json         # the queue source  [context-map.json; absent -> provisional map, see Init]
active_runs_ledger: ""                # path of a live-sessions ledger if the repo keeps one  [none; git status only]
locale_count: 1                       # sizing multiplier for string-heavy work  [1]
---
```

| Section | What it carries | Default when absent |
|---|---|---|
| `## Gates` | `always:` (integration gate), `when <condition>:` (conditional gates), `slow:` (long pre-commit/LLM gates — run `run_in_background`, read output before the next state-changing action), `builder:` (what each builder must pass before reporting) | detect from `package.json` scripts (`typecheck`/`check`, `lint`, `test`); else `npx tsc --noEmit` when a tsconfig exists; say what was detected |
| `## Class B` | append-only registries builders may edit by anchored insert | barrel `index.ts` exports, `CHANGELOG.md`, doc maps |
| `## Class C` | Director-only files (+ how the Director applies builders' reports: codegen commands, locale regeneration) | the git index, the context map, anything under a `generated/` dir or marked codegen |
| `## Repo law` | the convention digest pasted verbatim into every brief; out-of-scope walls; where the authoritative rules file is | "read the repo's CLAUDE.md/AGENTS.md first; reuse before building" |
| `## Context sources` | provenance rules: who generates the map, which name set the app anchors to, known disagreements, docs mapped per context | the map is the queue AND the name source; verify provenance as in Phase 0 |
| `## Smoke` | dev server URL/port + a new-code marker, read-only DB query recipe, seed scripts, visual-pass notes (themes, locales) | `/perfect smoke` degrades to an SSR `curl` pass or is skipped — say which |
| `## Opportunity arcs` | strategic-fit inputs for queue scoring (active programs, settled verdicts) | memory only |
| `## Vetoes` | settled/retired things never to re-suggest (beyond auto-memory) | memory only |
| `## User taste` | learned acceptance pattern; Phase P weights the slate by it | outcome-value over cosmetic churn; engine depth over chrome |
| `## Skill improvement log` | Phase W appends 2-4 bullets per session; `/perfect reflect` reads it | created on first wrap |

Writes to the overlay (taste, improvement log) are committed scoped — `git commit --only .claude/perfect/config.md` — never via a bare commit (§ Guardrails).

## The vault — durable loop state

Resolve `VAULT` = first existing `vault` candidate, else `<repo>/.perfect/` (same schema — still an Obsidian-openable folder; git-ignore it when a concurrent agent shares the branch). Then use `$VAULT/<vault_subdir>/`:

```
Perfect/
  Perfect.md               # HOME / Map-of-Content - always reflects current truth:
                           #   mission, the scored context QUEUE with the CURSOR,
                           #   the ACCEPTED POOL (n/target), shipped ledger headline, link to last session
  contexts/<name>.md       # one per context-map context (long-lived, updated in place)
  directions/<slug>.md     # one per direction (long-lived; the atom of the whole loop)
  sessions/<YYYY-MM-DD[-n]>.md  # immutable run records, each ends with a `next:` pointer
```

**Context note** (`contexts/<name>.md`):
```markdown
---
name: <context-map name>        type: perfect/context
group: <group>                  category: ui|api|lib|logic|data|test|config
opportunity: <0-10>             # value reach x headroom x strategic fit (Director's judgment)
last_proposed: <YYYY-MM-DD|never>   cooldown_until: <date|->
directions: ["[[<slug>]]", ...]
---
## Current state   (scout brief digest + file:line evidence - refreshed each proposal pass)
## Direction history   (proposed / accepted / REJECTED-and-why - rejections are memory too)
## Shipped   (direction -> commit SHA -> observed effect)
```

**Direction note** (`directions/<slug>.md`):
```markdown
---
slug: <kebab, stable>           type: perfect/direction
context: "[[<context-name>]]"   lens: feature|ux|optimization|robustness|wildcard
status: proposed | accepted | building | shipped | failed | dropped | rejected
size: S|M|L                     # must fit ONE builder session (<=15 files, no cross-context schema break)
proposed: <date>  accepted: <date|->  shipped: <date|->  commit: <sha|->
---
## What & why   (the user value, one paragraph, no fluff)
## Evidence   (file:line AND symbol of the gap/opportunity in today's code)
## Acceptance criteria   (3-6 checkable bullets - the builder's contract AND the review checklist)
## Risks / non-goals
## Build record   (builder report digest, review verdict, gate results - filled during build)
```

**Session note**: phases run, contexts covered, accept/reject tallies, build outcomes with SHAs, deltas, and **`next: <the exact resumption instruction for the following session>`**.

Vault hygiene: slugs are stable; **update notes, never duplicate**. Subagents may fail to write files in some harnesses — after any parallel phase the Director MUST `ls` the target dir and **backfill missing notes from the agents' returned content** before trusting "written".

**The vault is NOT version-controlled and Obsidian's file-recovery never sees agent writes** (it only snapshots edits made in the app). A clobbered note is gone. Therefore, every write obeys these three rules — learned 2026-07-29, when a session destroyed a sibling session's note:

1. **Never `open(path,'w')` a session note.** `sessions/<date>.md` is NOT unique — two `/perfect` sessions on one day collide. Check existence first and take the next free `-2`, `-3` suffix. Same for any note you did not create this session.
2. **Re-read `Perfect.md` immediately before writing it, never patch the Phase-0 copy from memory.** A sibling session that wraps mid-run rewrites the cursor, `pool`, `shipped_total` and `last_session` — a regex written against the Phase-0 text silently no-ops against the new text while your other replacements land, producing a self-contradicting header (exactly how the 2026-07-29 damage went unnoticed for several minutes).
3. **An operator's "that session is finished" means it finished — including its wrap.** It does NOT mean the vault still matches what you read before it wrapped. Re-read; do not assume.

When you do clobber something: say so immediately, stop, attempt recovery from the surviving derived sources (`Perfect.md`'s cursor, `directions/*` frontmatter, `git log`, auto-memory, the active-runs ledger), and leave the reconstruction **labelled as a reconstruction** with what is lost stated explicitly. Never quietly write over the gap.

## The loop — a vault-driven state machine

Every invocation starts the same way; the vault decides which phase runs.

### Phase 0 — Recall & register
1. **Confirm which copy of this skill is registered** — compare a distinctive phrase of this file's `description:` against the available-skills listing. A project copy can be silently shadowed by a library or registry copy and nothing warns you; edits to the wrong copy govern nothing. Then read the overlay (§ Project overlay) and resolve `VAULT`.
2. Read `Perfect.md` (+ last session's `next:` pointer). If missing → run **init** (below).
3. Read the context map; diff against `contexts/*` — new contexts get notes + a queue slot, removed ones get archived (`status: retired` in frontmatter).
   **First verify the map's PROVENANCE and say which source you chose and why.** A context map is usually written by an external scan, not by the repo, so it can be arbitrarily stale or come from a peer device; if it carries metadata, print it:
   ```bash
   node -e 'const m=require("./context-map.json");console.log(m.generator,m.generated_at,JSON.stringify(m.stats||m.project||{}))'
   ```
   If `generated_at` is far behind `git log -1 --format=%cd`, say so in the resumption sentence and treat the queue as provisional — a context that has since been split or renamed will score wrong. **Shape is not provenance:** a registered-name dump, a rendered context doc and the app's own DB can all disagree with the map (one repo measured a 208 / 49 / 773 three-way split with a 2-name intersection). Use the map for the QUEUE and the overlay's `## Context sources` name set for anything an external ledger anchors to (§ App context coverage).
4. Repo rituals: `git status` — repos host **parallel sessions**; note foreign WIP files and never sweep them into your commits. If the overlay names an `active_runs_ledger`, read it, surface overlaps, append this session's entry. Scan auto-memory and the overlay's `## Vetoes` for signals that veto directions (shipped programs, "honest ceiling" verdicts, retired subsystems — don't re-suggest what a prior campaign settled).
5. **Coverage check**: if `.personas/` exists, note which contexts have gone stale in the ledger (no fresh node in 30d — § App context coverage). Stale-and-high-opportunity outranks stale-and-low; a context with fresh coverage is a weaker cursor candidate than one the loop has never anchored. This is a queue *tiebreaker*, never an override of the user's steer.
6. Announce the resumption point in one sentence, then go where the state machine points: pool < target → **Propose**; pool ≥ target (or user said `build`, or `round_shape: round` and a gated slate awaits) → **Build**.

### Init (first run only)
1. Scaffold the vault tree; if no overlay exists, scaffold `.claude/perfect/config.md` from the defaults above and record what you detected (gates, base branch, Class B/C **derived from THIS repo, not assumed** from another project's set). If no context map exists, build a provisional one from the repo's top-level source directories (one context per directory, `file_paths` filled) and mark the queue provisional.
2. Score every context 0-10 for **opportunity** = user-facing reach × headroom (distance from "perfect", judged from context-map metadata, the repo's docs, and memory) × strategic fit (the overlay's `## Opportunity arcs` + active arcs in memory). Write the ranked **queue** into `Perfect.md` with the cursor at the top. Don't deep-read code yet — scoring is refined per-context at proposal time. A repo that memory says is "already polished" over-reports gaps at a distance — score headroom conservatively there.
3. Write session note; proceed straight into Propose.

### Phase P — Propose (context by context, until the pool holds the target)
Loop while `pool < pool_target` and the user hasn't said stop (under `round_shape: round`: pick 1–3 contexts, gate, build that slate the same session — the pool never accumulates past the target, which is a hard cap):

1. **Cursor** = highest-opportunity context not on cooldown; at equal opportunity prefer the least-recently-slated context, and a never-slated context outranks any re-visit (fresh contexts keep yielding full slates while twice-visited ones go thin). **Prefetch**: before presenting context *k*, launch the scout for context *k+1* in the background — one ahead, never two (staleness risk).
2. **Scout** (Explore, "very thorough", read-only): given the context's `file_paths`, `entry_points`, `db_tables`/`api_routes` (+ any doc the overlay maps to it — its "conventions & gotchas" are pre-scouted evidence the scout must re-verify) → return a current-state brief: what exists, what's rough, dead ends, UX seams, perf smells, with `file:line` evidence. **A component only "exists" if it RENDERS — trace every surface the brief describes to an actual mount point.** A file with zero consumers is a *finding*, not a feature; whole panels have shipped that no route ever mounted. Where the repo has a sample-vs-live data seam, say which side the surface is wired to.
   **Delta re-scout (contexts with prior ships):** brief the scout to (a) verify the prior ships still cohere AND delivered their downstream payoff — "did it work", not just "did it merge"; (b) re-verify parked follow-ups against today's code (they drift); (c) walk the user's daily loop for honest residuals. Say explicitly that **"near-polished, N small residuals" is a perfectly good verdict** — this phrasing reliably produces zero manufactured findings.
3. **Draft up to 5 directions** — one per lens by default: **feature** (new user value), **ux** (design/flow elevation), **optimization** (perf/cost/significant simplification), **robustness** (failure modes, observability, architecture), **wildcard** (the non-obvious idea a great PM would pitch). The count is what the evidence honestly supports — **never pad** (thin slates of 1–3 keep winning at the gate). Each sized to ONE builder session; a bigger vision ships as its phase-1 slice.
   **Weight the slate by the overlay's `## User taste`** — the lens spread is a starting point, not a quota. The recurring pattern: users accept **outcome-value work** (features/optimizations with a visible payoff) and reject **cosmetic churn**; pre-filter the 5 through that lens and say in the presentation that you did. Default depth is the *engine*, not the chrome: for any context with backend/algorithmic substance, most directions should be architecture-level (data model, algorithms, lifecycle, prompt/eval paths, cost structure); UI surfacing appears at most once-twice unless the user steers otherwise. For a showcase/marketing repo the "engine" is demo-data realism, motion, IA and page performance. Scout prompts must match this depth (trace the full pipeline, not just the components).
   **Highest-yield direction shape: mine the user's own recent corrections for rules, then grep the codebase for places that violate them.** "Your stated rule, broken in code at these line numbers" beats an invented improvement (5/5 accept where first tried).
4. **Challenge before presenting** (the Director argues against itself; a direction that fails any check is replaced, not presented):
   - Does it already exist in code? (scout evidence, not assumption)
   - Was it already proposed/rejected/shipped? (check `contexts/<name>.md` history + memory + any backlog the overlay names — campaign ledgers are dense; many "obvious" ideas are already DONE)
   - Does it conflict with an active arc or a "removed/settled, don't re-suggest" memory?
   - Is the value claim concrete — can I name the user moment it improves?
   - Can one builder session genuinely ship it behind the acceptance criteria (locale cost × `locale_count` included)?
   - **Data-path rule:** any "surface X gains signal Y from Z" direction requires the scout to have verified the payload actually carries Y at **EVERY read site that should show it** — list projection, detail/drawer, route — not just Y's existence at the write path or one primary reader. A parity claim without a verified data path is not presentable (two premise failures and a three-round projection blind spot earned this).

   **State a predicted EFFECT as a hypothesis to measure, never as an assertion.** Write "measure which cells move and report it", not "this will move cells off green — that is the point". A confident prediction in a direction note is an instruction to confirm it, and a builder that believes it may tune toward it. Round 13: the Director asserted a provenance fix would cost greens; measured, it lost none and lifted 17 cells off RED — wrong in DIRECTION, not degree, and it only survived contact because the criteria demanded a measurement.

   **Director self-check before the gate** — a proposal that fails any of these never reaches the user:
   - Names the concrete files it will touch (from scout evidence, not guessed).
   - Names the user-visible outcome in one sentence a non-developer would care about.
   - States why it beats the next-best alternative direction for this context.
   - Survives the taste filter above (outcome-value, not cosmetic churn).
   - Any benefit claim survives a fact-check against the product's **default** configuration, not its most flattering one.
5. **Present** the slate in chat — numbered, each: title · lens · size · one-paragraph why · evidence · acceptance criteria. Then gate with **AskUserQuestion (multiSelect)** — the tool caps options at 4 per question AND requires ≥ 2 options per question, so: ≤ 4 directions fit one question; 5 split as Q1 = 1–3, Q2 = 4–5 in one call; a single-direction slate needs a second option (a rider or an explicit "skip") to be valid (labels = `N · short title`, description = one-line value claim + size). The user can annotate via "Other" (e.g. `edit 2: …`, `stop`); selecting nothing = none accepted.
6. Record outcomes in the vault (rejected ones too, with the user's implied reason — rejections steer future proposals). Accepted → `directions/<slug>.md` with `status: accepted`, pool counter++, context gets `cooldown_until`. Update `Perfect.md` after every context, not at session end — a killed session must lose nothing. Emit the coverage node now (§ App context coverage).
7. **A `none` gate that carries a steer** (the user says what they wanted instead) is a re-scout order, not a rejection of the context: promote the steer to the overlay's `## User taste` if it generalizes, re-scout at the steered depth/angle, and re-propose the SAME context once before advancing the cursor. Never re-present any rejected direction.

### Phase B — Build (ONE branch, disjoint builders, the Director decides everything)

> **Process efficiency is the first constraint, ahead of defensive isolation.** The per-context-worktree shape this loop used through v1 bought protection against **a collision that correct grouping prevents for free** — and charged for it in worktree setups, node_modules junctions, N cherry-picks with union-merge hazards, a whole extra cross-builder integration phase, and junction-ordered teardown. One repo measured the bill: 3 worktree setups + 3 junctions, single compiles of **24m05s and 28m29s** because three *different source paths* thrashed one shared build cache, a stale artifact that let the check pass while the test failed, siblings clobbering a shared test exe twice, and master red for two picks.
>
> **The rule: isolation is not the answer to collision risk — disjoint grouping is. A wave with a high collision risk is a wave that is grouped wrong.** Fix the grouping; don't build machinery around the mistake.

1. **Partition by write set — the load-bearing step; get this right and the rest is bookkeeping.**
   For each accepted direction derive its **write set**: the files it will actually modify, taken from the direction's `## Evidence` (`file:line` + symbol) plus a Director read of the call path. *A guessed write set is worthless* — if you cannot name the files, the direction is not ready to build, and that is the same reachability discipline Phase P step 4 demands. **That read doubles as the evidence spot-check:** verify each direction's single load-bearing evidence line in the source before dispatch — one grep per direction. Measured in a 3-wave session: every Director spot-check held, while un-spot-checked scout claims produced a ~30% brief-defect rate (wrong line, wrong scope, wrong premise), each caught by a builder reading code the Director had only read *about*.
   Group directions into builder **lots** so write sets are **pairwise disjoint**:
   - Two directions overlap → they go in the **SAME lot** (one builder, sequentially) or one is **deferred** to the next wave. Never split an overlap across concurrent builders.
   - No disjoint partition exists → **the wave is one builder.** That is a legitimate, honest outcome, not a failure of the plan.
   - ≤ `wave_size` lots concurrent; ≤ 3 directions per lot (a 4-direction brief exceeds one agent-session budget); `lot_caps` bind per toolchain (e.g. ≤ 2 lots that touch a crate sharing one target dir).
   - Lots need not follow context boundaries. Disjointness is the criterion; one context can be two lots, and two small contexts can share one.
   - When two lots consume the SAME wire/payload format, name the **format owner** in both briefs — the other consumes a frozen interface.
   - **A live non-wave agent or sibling session is a write-set constraint, not just a hazard.** Files held by an agent that is not part of this wave are **reserved** exactly like a sibling lot's — defer any direction that needs them (one wave deferred 3 of 5 directions for exactly this reason).
   Class C files (step 3) are excluded from write-set analysis — nobody but the Director touches them, so they cannot create overlap.
   Present the wave plan in one screen — **lot ↔ directions ↔ write set** — and say explicitly which directions were merged or deferred to reach disjointness. On user go (or `/perfect build`), execute.

2. **One branch for the whole wave.** No per-builder worktree, no per-builder branch, no per-direction merge.
   ```bash
   git switch -c perfect/<YYYY-MM-DD>      # from a clean base_branch
   ```
   Every builder works in this one tree and commits onto this one branch. One source tree means warm incremental rebuilds and one coherent typecheck, and it means the wave is **continuously integrated** rather than integrated at the end.
   **A branch switch is a whole-tree mutation and obeys the same sibling-safety rule as `git add -A`.** Before creating the wave branch, check `git status`, the active-runs ledger if any, AND for in-flight agents in this checkout. If any shows a live sibling, **do not switch branches** — either commit onto the current branch with `git commit --only <paths>` scoping, or put the wave in **ONE** worktree (never one per builder — same branch, same protocol) using the junction recipe in `${CLAUDE_SKILL_DIR}/references/worktree-recipe.md`. Its one-line law: a relative-target `mklink //J` silently creates the junction somewhere else and still prints "Junction created" — **the `Test-Path …\.bin\tsc` assertion is the evidence, the message is not**; tear down junction FIRST, then `git worktree remove`.

3. **The shared-resource protocol.** One tree means shared mutable state; each piece gets exactly one owner. The full block — which goes **verbatim into every brief** — is `${CLAUDE_SKILL_DIR}/references/shared-resource-protocol.md`; the law in brief:
   - **Class A — your own write set.** Yours alone; edit freely.
   - **Class B — append-only registries** (overlay `## Class B`). Editing allowed, but **re-read the file immediately before each edit and anchor on a string unique to your change** — never rewrite one whole.
   - **Class C — Director-only** (overlay `## Class C`; derive it from THIS repo — a repo with no locale codegen and no bindings has a thin list: say so rather than importing another project's machinery). Builders *report* what they need and the Director applies it once at quiescence, running each codegen once.
   - **Commits — builders still commit their own work** (never-lose-work beats commit hygiene, and builder death is the norm), through an index-safe form in ONE step: `git add <only your NEW files> && git commit --only <every path in this commit> -m '...'`. `--only` builds the commit from those paths alone and *disregards whatever else is staged*, so a sibling's in-flight staging can never ride along. The one-step form minimises the window in which a freshly `git add`ed new file sits unprotected in the shared index — a foreign session's bare commit once swept two such files into itself (`--only` cannot defend the reverse direction). **Never** `git add -A` / `git add .` / `git add -u` / bare `git commit` / `git commit -a` / `git stash` / `git checkout <path>` / `git restore` / **`git commit --amend`** (a sibling can commit between your commit and the amend, and the amend then re-messages *their* commit). An `index.lock` race fails loudly and harmlessly — retry it, never work around it. `--only` takes **whole files**: a shared Class-B registry carries a sibling's in-flight line into your commit, so that range may not be bisectable — say so in the message. An isolated index (`GIT_INDEX_FILE` seeded by `git read-tree HEAD`) is an equivalent form some repo laws mandate; both take whole-file working-tree content, so neither protects against a sibling's unstaged edit inside YOUR file — the write-set discipline is what does.
   - **Builds:** a shared build cache's own lock serialises compiles for free; what a shared tree cannot protect against is a sibling's half-written source. **A compile or type error in a file outside your write set is a sibling's transient state: re-run once, then report it — never fix it.** Same for a test that fails in a suite you do not own. Report the *file* the error names, not just the count — a tree-wide typecheck is not a verdict on one builder; the file name is what separates "my work is broken" from "a sibling is mid-edit".

4. **Brief** each lot from `${CLAUDE_SKILL_DIR}/references/builder-brief.md` (overlay `## Repo law` + `## Gates › builder` + the protocol verbatim); launch with `model: "opus"`, `subagent_type: "general-purpose"`, all briefs in one message so they run concurrently. **Brief quality bar:** the write set, the protocol verbatim, and the exact builder gates. Director review time is for judgment, not gate failures.

5. **Mid-flight decisions**: a builder returning `DECISION NEEDED: …` gets an answer from the Director via `SendMessage` — product calls, trade-offs and scope cuts are the Director's alone. A builder that stops without its final report gets one `SendMessage` nudge.
   **Builder-death recovery (session limits WILL kill builders): inspect and salvage BEFORE assuming loss.** A builder that dies has usually already done the work and died at its gate/report/commit step (two of three parallel builders once died this way with complete, lint-clean directories on disk). Lint the orphaned files scoped, confirm the entry point exists, confirm the only type errors belong to *still-running* siblings, then snapshot as `wip(…)` with **`git commit --only <its write set> --no-verify`** and a message that says plainly what was and was NOT verified — *not* `git add -A`, which was safe only while the tree was private. Then finish inline or re-brief a fresh builder with "continue from the WIP commit" — re-dispatching pays full price to regenerate work that already exists.
   **Dead builders cannot clean up after themselves:** sweep their temp routes/scripts, and distinguish them from a still-running sibling's (deleting the live one's scratch route mid-run breaks it). Name temp artifacts per-builder so ownership is legible — builders share one harness scratchpad, so a generically named temp file gets overwritten mid-wave (a commit-message file was, once).

6. **Review — the Director earns its title here.** Per direction: `git show <sha>` (the commits are already atomic and already on the wave branch — there is no branch-vs-base diff to get wrong). Review against the acceptance criteria, the overlay's `## Repo law` (shared-component reuse, design tokens, i18n completeness, error/IPC chokepoints, LOC caps, both themes where the repo ships two), and taste. Verdict per direction: **keep** / **redo with notes** (SendMessage; the builder fixes in place with a follow-up commit) / **drop** (`git revert` that commit, `status: failed`, reason recorded). Never accept on "tests pass" alone — read the diff. Hold commit messages to the Director's own bar; reword at review if needed.
   **Docs-vs-code check:** when a diff documents a behavior (contract text, formula, doc comment, architecture doc edit), grep for the code that implements it before keeping it — one builder shipped a beautifully-documented decay formula with the implementing SQL never written. A contract describing behavior the code doesn't have is worse than nothing.
   **Gate calibration:** gate on *no NEW warnings in files this diff touched* — a full-crate/full-tree lint at `-D warnings` fails on hundreds of pre-existing warnings in mature repos; compare against the base branch's warnings for the same files before blaming the diff.
   **Builder refusals are signal, not disobedience.** A builder that argues an instruction down with evidence and satisfies the acceptance criterion another way has done its job; weigh the evidence.
   **A criterion written to BOUND one change will sometimes block fixing a larger defect that change uncovers.** That is the criterion working, not failing — but the Director must then decide, not leave it. Round 13: "no audited step may change class" correctly bounded an engine-fallback fix and correctly stopped the builder fixing the *real* defect one seam down (an unrecognised engine name defaulting into the TRUSTED bucket, mis-classing 95 audited steps). The builder reported and refused; the Director landed it as a separate commit in the same wave — because that wave's own change had just routed 10 newly-un-condemned cells through the mismatch. **If your wave creates an overstatement, your wave corrects it.**
   **Re-measure a builder's headline number before repeating it.** The same round reported 82 affected steps; the independent re-count found 95 (a whole engine string had been missed). Builder numbers are evidence, not verdicts.
   **Any branch-vs-base comparison, for any purpose, is three-dot or it is wrong** — and after a squash merge neither form answers "did this land": grep for a signature symbol instead.

7. **Integration gate, once, at quiescence.** After every builder has reported and been reviewed, run the overlay's `## Gates › always` (+ the `when` gates whose condition the wave met) on the wave branch. This is confirmation rather than discovery — one branch means the builders' work was already compiling against each other all along (the old shape needed a separate cross-builder phase to catch one builder retiring a type-union member another targeted). Reds are fixed inline as Director commits **and the output is read BEFORE the next state-changing action** (two rounds committed while an unread test run was showing failures). A departing builder that flags a regression in its final report is gate input, not noise. `slow` gates run in the background and are read before the next state change.

8. **Land the wave: ONE merge.** Apply any Class C work (regenerate from the builders' reported fragments, run each codegen once) and commit it. Then:
   ```bash
   git switch <base_branch> && git merge --ff-only perfect/<date>    # or --no-ff if the base has moved
   ```
   The per-direction commits *are* the atomic history — no cherry-pick, no squash-per-direction, no N-way conflict resolution. If the base moved under you, this is one ordinary content merge instead of N. Re-run the gates on the base after the merge. When a conflict lands in a generated file, **regenerate from source** rather than taking either side (a 206-commit merge conflicted in 3 files; the generators reconciled both codegen outputs automatically).

9. **Doc-sync in the same turn**: structural or user-visible changes update the doc the overlay maps for that area in the SAME change (+ the doc map if a doc is added or removed; + the context map if a direction changed which files a context owns).

10. **Cleanup**: delete the wave branch once merged; if a wave worktree was used, tear it down per the recipe and verify the main checkout's real `node_modules` is still intact before moving on.

**Exception path — surgery for a base branch that moves under you** (union-merge discipline, committing *around* a concurrent session's dirty files via the index, shared append-files, locale re-application, non-interactive history repair): `${CLAUDE_SKILL_DIR}/references/base-moved-surgery.md`. Not the default any more; reach for it only when a concurrent session dirties or advances a file you must land into.

### Phase W — Wrap (every session, even interrupted ones)
1. Update every touched vault note; write the session note with the **`next:` pointer** (e.g. `next: propose — cursor at <context>, pool 7/10` or `next: build wave 2 — <ctx-a> + <ctx-b> remain`).
2. `Perfect.md` headline refreshed: pool count, queue cursor, shipped-total, last-session link. If an active-runs ledger exists, move this session's entry to Recently completed with SHAs.
3. **Flush the memory outbox** — § App context coverage — for every context this session touched, including in a session that only proposed.
4. **Reflect on the skill itself**: 2-4 bullets in the overlay's `## Skill improvement log` — what dragged, what the user overrode, what the next round should change. This log is the input for the between-rounds skill revision.

## Direction quality bar (what earns a slot in the 5)

- **Value-first**: names the user moment it improves; "nice refactor" is not a direction unless it unlocks something.
- **Evidence-backed**: cites today's code (`file:line`), not vibes — **and cites the SYMBOL beside the line number**, because coordinates rot. In a multi-wave session they rot within hours: a wave-3 brief cited `file.ts:43-46` and wave 2 had already pushed that code to ~55-62 by inserting a function above it. A symbol survives; a line number is a convenience.
- **Claims about what a consumer USES must be traced, never inferred from what it is FOR.** "This input is unused, so dropping it is free" is the single most expensive wrong premise this loop has produced (twice) — a consumer described as ranking on status alone in fact re-graded data, compared drift, and bound verdicts to a content hash.
- **One-session-shippable**: ≲ 15 files, no cross-context schema breaks; else slice it. String-heavy work is bigger than it looks (× `locale_count`).
- **Novel to the vault**: not shipped, not pending, not previously rejected (unless the world changed — say so).
- **Lens-diverse**: default one per lens; substituting a second entry in one lens requires the Director to say why.
- **Fact-checked**: a benefit claim must survive a check against the product's *default* configuration.
- **Bugfixes stand alone**: a live defect is NEVER bundled into an enhancement direction — a rejection of the enhancement would strand the defect. Present the fix as its own (usually S) direction; standalone re-presentation of a previously-bundled fix has been accepted instantly, twice.

## Builder brief — what every brief must carry

Template: `${CLAUDE_SKILL_DIR}/references/builder-brief.md`. Non-negotiable contents: the stack line and NOT-ALONE framing (n builders, branch name); the explicit write set and the outside-write-set rule (re-run once, report the FILE, never fix); the shared-resource protocol verbatim with the overlay's Class B/C lists; the one-step `git add … && git commit --only …` form and the forbidden-git list; commit-message quoting (bash **single** quotes or a uniquely-named `-F` file — never the PowerShell `@'...'@` here-string through the bash tool, which keeps a lone `@` as the subject; never double quotes around backticks, which run command substitution and silently eat the word; verify with `git log --format=%s -1`); temp files in the harness scratchpad only, named with the lot id, never at the repo root and never in a test tree; per-direction atomic commits in `commit_format`, committed the moment each is verified; compiles in the foreground (background only past the 600s cap, then block on the result — never end a turn on a pending gate); search-before-building; a first-run test failure is the test doing its job; criterion-beats-instruction; no interactive git; source-guard tests updated in the same commit when a file moves; the overlay's `## Repo law` digest and `builder` gates; `DECISION NEEDED` protocol; the final report format (per direction → status, commits, files, verification evidence, open risks).

## Modes

- **`/perfect`** — resume the loop wherever the vault says it stopped (the default; covers init on first run).
- **`/perfect propose [context]`** — force a proposal pass (optionally jump the cursor to a named context).
- **`/perfect build`** — build now with the current pool even if < target.
- **`/perfect status`** — read-only: queue, cursor, pool, in-flight builds, shipped ledger, last session. No agents.
- **`/perfect smoke`** — live L2 verification pass over recent waves' shipped surfaces, per the overlay's `## Smoke`: drive the running dev instance (verify a new-code marker first — never trust a stale port; probe for the app's `<title>`/marker rather than assuming, since another tool may hold the usual port), read-mostly navigation, **kill and recreate browser tabs between route hops** (rapid mid-hydration navigation can wedge a tab — a wedged tab once produced a false P0), and use **read-only DB queries against the live DB** (`sqlite3 "file:<path>?mode=ro"`) as the primary diagnostic — one `GROUP BY` beats an hour of DOM archaeology. Cover both themes and a non-default locale where the repo ships them. **Plan B when no browser is available:** an SSR `curl` of the touched routes grepping for the new surface's markers covers the server-rendered half; the INTERACTIVE half stays owed and is tracked in the `Perfect.md` cursor until a browser session clears it. Record verified / not-driven / fixes in a `sessions/<date>-smoke` note; small fixes commit inline (gates BEFORE commit). Run after every ~2-3 waves; state-dependent surfaces that keep rolling over go to a fresh-DB harness session instead.
- **`/perfect reflect`** — read the overlay's `## Skill improvement log` + last sessions and propose concrete edits to THIS skill file (method) or to the overlay (repo specifics) — and say which.

## Guardrails

- **Never stash, never `git add -A` on the shared tree** — per-file staging, staged-count check before every commit; other sessions' work is sacred. `git add <file>` of an existing path sweeps foreign WIP — author NEW files, never hunk-split from an agent (`git add -p`/`-i`/`rebase -i` hang the harness). Inside a wave, `git commit --only <paths>` is the form that makes this safe by construction; a repo whose law lets foreign sessions bare-commit into a shared checkout should be asked (via its CLAUDE.md) to use `--only` too — the method cannot defend that direction.
- **Efficiency outranks defensive isolation.** Before adding any protective step to this loop, ask whether the risk it defends against is instead a signal that the *grouping* is wrong. Machinery that exists to survive a bad wave plan should be deleted and the wave plan fixed.
- **Cost discipline**: scouts are Explore-tier; builder-tier spend goes only to accepted work; the Director never re-runs a scout whose brief is < 1 round old (it's in the context note).
- **Honest ledger**: a direction only reaches `shipped` with gates green AND the Director having read the diff; anything else is `failed` with a reason. No silent drops — every accepted direction's fate is recorded.
- **Interruptibility is a feature**: write the vault incrementally (after every context in P, after every merge in B) so a killed session resumes losslessly.
- **The user is the product owner**: the gate is theirs; the Director challenges but never overrides a rejection, and repeated rejections of a lens/context recalibrate the queue scores. A go-ahead is scoped to the facts it was given: **re-measure a concurrency precondition immediately before the mutating command** — "blocked" and "approved" are both timestamps, not states (a merge unsafe at 19:00 was safe at 21:38; an approval true when asked was false 14 minutes later).
- **The overlay's out-of-scope walls hold** (route paths, schema/RLS, runners, `.env*`, protected files — whatever the repo lists). **Push only when the user says so**; commits to the base branch are fine, `git push` is not automatic.

## App context coverage (the Personas ledger — the second memory)

The vault is this loop's *working* memory; the **Personas Memory Ledger** is its *measured* memory. This skill declares `contexts: tracked`, so the Personas app renders a per-context coverage bar for `/perfect` — but that bar reads ONLY from skill-attributed ledger nodes; a vault note the app never sees counts for nothing. **Writing the vault and not the outbox is the one failure mode that makes a productive session look like a dead one.** Fleet/CLI sessions have no DB access, so the ledger is fed by an append-only JSONL outbox at the repo root — `.personas/memory-outbox.jsonl` (create `.personas/` if absent; **append, never rewrite** — parallel sessions share this file):

```json
{"type":"node","kind":"progress","title":"<=200 chars: what you did in this context","body":"optional detail","context":"<exact context name the app knows>","skill":"perfect"}
```

Always set both `"skill":"perfect"` and `"context":"<name>"`; the name must be one the app knows (overlay `## Context sources`) — an unrecognized name is NOT an error, it silently counts toward nothing. Emit **incrementally**: after each context's gate resolves (Phase P), after each merge (Phase B), backfill at Wrap. Coverage is earned, not declared — only for contexts where this session produced real evidence. Skip silently when not Personas-managed. Kinds, caps, dedupe, name-source pitfalls and ingest timing: `${CLAUDE_SKILL_DIR}/references/context-coverage.md`.

---

<!-- clause: knowledge-sync v1 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, gitignored, to `.ai/consults.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"perfect@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/perfect/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - perfect` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/perfect` in a consuming repo is a symlink to `<registry>/skills/perfect` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/perfect` and `git -C <registry> commit -m "skill(perfect): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/perfect/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/perfect` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->

## Model choice (bake-off 2026-09-01, kp / round 24)

The Director role already names Fable with Opus as fallback; the head-to-head confirmed the ordering and sharpened it. Fable shipped six directions across two contexts (including the same dead design-law lint gate the architect run found) and built a refused lot inline; Opus shipped three standard-anchored directions across three disjoint contexts, rejected four candidates with reasons, and reconciled the stale vault claim by claim. Both refuted the same carried lead. The operator merged both. Rule kept: Fable directs; when a slate must be thin and every direction must cite a standard, an Opus director is not a downgrade.
