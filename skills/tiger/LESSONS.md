# Lessons - tiger

Append-only reflection lane. One entry per run that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0 - 2026-08-17 - ascent
- Redesign applied -> v2.0: lenses judged call sites in the abstract; "at its potential" only means something relative to a job. Added the golden-use-case frame (`use_case` on every engine note/finding, roster bound >=2 judges per UC, per-UC grounding questions, `engine/_expected/*` for call sites the use cases imply before the code exists, UC3 privacy check under Lens A).

## 2.0 - 2026-08-22 - ai-registry
- Generalized into the registry skills lane as v2.1.0 (minor bump from 2.0 for the generalization, per the lane's v2 contract). Four lineages were folded into one body: the ascent 2.0 copy (the most evolved - lens A/B/C naming, the use-case frame, grounding-audit refinements in both directions, computed-but-not-wired, memory and use-case grounding, degrade-path disclosure parity, the two-model split / clamp-protects-the-number / configured-vs-realized / judge-blind rules, the `engine/` vault layout and continuity contract), the 1.0 workspace copy (identical in the Personas repo and the user library - the grounding bar hard rule "quote the prompt text + one real sampled output or mark `ungrounded`", the measured Lens-3 judging rules of 2026-07: forced ranking with a named separator, >=2 judge families across model families, more effort is not better, a hard output cap collapses the effort axis, suspect the prompt framing when every cell disappoints; the matrix-shaping rule; the no-API-key Agent-tool recipe with redacted reasoning; vault-write verification; the `scan` and `backlog` modes; cost-awareness and the `(call-site, model, thinking, input-hash)` cache key; the value ledger; the `modality` / `wrapper` / `fingerprint` / `status` / `recommended_model` note keys), and the kp / systedo-case bare copies (a strict subset of 1.0; nothing unique survived beyond "a separate judge, never the model under test", which 1.0 already carried).
- The value frame became overlay-driven: the app declares its jobs / use cases and the judges bound to each in `tiger/README.md` at `init`; without a declaration every finding carries `use_case: cross` and the roster is `uat/characters/*`. Every project name, use-case text, judge name and repo path left the body; ascent's table, roster binding and expected kills moved to a per-repo overlay that complements its existing `tiger/` vault.
- One lesson lifted from ascent's vault backlog (P1-5, 2026-06-20) into the trust rules: an L1 "X is missing" claim about a durable artifact must be code-verified (`grep` / `git log -L`) before it is actioned - the export column the walker reported missing had existed for weeks.
- Long material moved out of the body to keep it under the lane's 500-line cap: the dial-by-dial checklists to `references/lenses.md` (also the default content for `tiger/lenses/*.md`), the note templates incl. the README overlay shape to `references/vault-notes.md`. The lane is ASCII-only and its gate enforces it, so the body and this file were written ASCII (the ascent entry above keeps its wording; its arrows and dashes are transliterated).

## 2.2.1 - 2026-09-05 - kp (KandiDate)

- **Verify the Lens C axis exists in the app before planning a matrix.** The skill states
  *model x thinking level* as the axis. This app has no thinking/effort axis at all: no
  adapter sends an Anthropic `thinking` block, an OpenAI `reasoning_effort` or a Gemini
  thinking budget, and its default engine (a local CLI) cannot express one. `init` should ask
  the question explicitly - grep the adapters for the parameter, do not infer it from the
  vendor's capability list - and record the axis the app CAN vary. Here it was
  model x provider x `max_tokens`, and `max_tokens` was load-bearing: a prior in-repo bench
  had measured models "failing" that were truncating at a base cap. A matrix built on the
  assumed axis would have produced recommendations the operator cannot apply.
- **Check whether temperature is controlled before calling any comparison controlled.** Every
  text call here leaves temperature unset, so a benchmark compares each vendor's default
  sampling. That belongs in the recipe section as a stated limit, not discovered at judging
  time.
- **Assign discovery agents PACKAGES, not themes, and enumerate the expected slug list up
  front.** Five agents split by domain worked well, but two independently filed the same call
  site under different slugs (one agent noticed and merged, which cost a wasted note), and
  three sites inside a package one agent owned had no owner because the assignment listed
  files by theme rather than saying "every LLM touchpoint in this directory". The
  `ls`-and-backfill verification caught the gap - keep it, it earned its place again.
- **A "no eval corpus" finding is upstream of the whole method, and `init` should say so in
  the backlog header.** This app captures no prompt or response on any path, which means Lens
  B's grounding bar (quote a real sampled output) cannot be met from logs, and `benchmark` has
  no fixture source. Naming that as item 1 - and stating plainly that every Lens B item is
  therefore a code-grounded audit rather than a value verdict - keeps the run honest instead
  of letting theoretical verdicts read as observed ones.
- **The "computed-but-not-wired" hunt is worth putting in the discovery agent's prompt
  verbatim, with its shapes enumerated.** Giving agents the four shapes (used post-hoc only;
  present on the same entity and not passed; re-sorted or truncated before the prompt window;
  a complete feature with a producer and no caller) produced the run's sharpest findings
  across four independent areas. The variant worth adding to the skill: **a cache keyed on an
  input the prompt does not contain** - editing it buys a paid, byte-identical re-run. That is
  a grounding failure and a cost failure in one, and neither lens finds it alone.

## 2.2.1 - 2026-09-05 - kp (KandiDate) - `run --use-case automation`

- **Verify a fallback/honesty guard per FIELD, not per wrapper.** A wrapper that decides "was
  this really the model's answer?" by comparing the coerced result to the deterministic
  template is only as strong as the coercer's weakest field: one field that lacks a
  `or deterministic[...]` fallback makes the dicts differ, the guard silently passes, and an
  empty reply is stamped as the model's work. In the case measured here the omitted field was
  the ADVERSE one (`redFlags`), so the guard held whenever the candidate looked good and failed
  whenever there was something bad to lose - the exact inversion a per-wrapper read cannot see.
  Lens A should enumerate the coercer's fields, not just locate the guard.
- **Run the refuter on inherited findings BEFORE the Character agents, not after.** The skill
  puts adversarial verification in Phase L2. This run put it in L1 alongside the Characters and
  it destroyed 2 of 13 inherited items - one a stale-note error of exactly the class the skill's
  own trust rules warn about. Every Character-hour spent judging a refuted finding is wasted,
  and worse, a Character can "confirm" a false premise by reasoning from it.
- **An L1 Character prompt must explicitly forbid model calls.** Given a working provider CLI
  on the machine, a Lens-B agent will use it - it is the most direct way to satisfy the
  grounding bar's "quote a real sampled output" requirement, so the agent is following the
  method when it does this. The results were the strongest evidence of the run, but the level
  was not the one requested and real budget was spent unasked. Either the L1 prompt says "make
  no model calls even if a provider is available", or `run` should detect an available provider
  and ask.
- **A cost lens can legitimately conclude "this is not a cost surface".** Lens C priced the
  whole use case at under $2 of floor-to-ceiling spread and correctly redirected the attention
  to quality, then REFUSED to benchmark three sites whose grounding gaps meant a benchmark
  would measure the wrong thing. That refusal is a first-class Lens C output and the skill
  should name it as one - "do not benchmark yet, fix the prompt first" belongs beside
  `keep | downgrade | upgrade`.

### Redesign proposal (NOT applied here - needs a version bump and a registry commit)
Move the adversarial refuter out of Phase L2 and make it the FIRST step of Phase L1 in `run`,
operating on the inherited backlog rather than on this run's output. Findings that do not
survive it never reach the Character agents. This run is the evidence: 2 of 13 destroyed, and
the two destroyed items were among the more confidently worded. Suggested bump: 2.2.1 -> 2.3.0
(step refinement). Not applied because it changes the file every project runs and warrants the
operator's sign-off first.

## 2.2.1 - 2026-09-05 - kp (KandiDate) - build waves after `run --use-case automation`

- **Group build waves by WRITE SET including docs, not just source.** Two agents in one wave held
  disjoint code but the same coupled feature doc, so a concurrent edit could have silently dropped
  one agent's paragraph. It happened to merge cleanly; that was luck, and the orchestrator only
  knew because it diffed the file against both reports afterwards. A wave plan must enumerate the
  doc each lane will touch and treat a shared doc as a collision.
- **An agent cannot complete a change whose lockstep counterpart is outside its write set, and it
  will not always be able to tell you.** A builder fenced a prompt-injection path correctly but
  could not bump the prompt version, because a CI gate pins the Python constant to a TS constant in
  a file another lane held. Cached entries would have served pre-fence output for the full TTL: the
  fix would have been real in the code and absent in production. It flagged this in its report,
  which is the only reason it was caught. **The orchestrator must own cross-cutting version and
  schema bumps explicitly**, and should ask each builder "what could you not finish from inside
  your write set?" rather than relying on it to volunteer.
- **Building the fix finds defects the audit cannot.** Two of the sharpest findings of the whole
  session came from builders, not auditors: a test that ASSERTED the bug as intended behaviour
  (found twice, independently, on two different fallback wrappers), and a consumer that only became
  wrong once the fix made a previously-unreachable value reachable. Budget for a "findings opened
  by the build" section in the backlog; a wave that opens none has probably not looked.
- **Give the builder the tension, not the patch.** The highest-quality results came from prompts
  that named the competing constraint and refused to resolve it — "wire the must-haves in without
  turning the case into a checklist, because this repo deliberately protects the decision space",
  "verifying an absence is not a mirror of verifying a presence". Agents given the conflict found
  better answers than the audit had, and one of them corrected the finding itself.
- **A refuter that runs against inherited findings pays for itself twice.** Round two killed one
  finding outright and halved another before any builder touched them — and one of the killed items
  had been mapped to a registry technique in the backlog, so a refuted claim was carrying the
  authority of a standard. Verify before you cite, and re-check the standards mapping whenever a
  finding's verdict changes.
