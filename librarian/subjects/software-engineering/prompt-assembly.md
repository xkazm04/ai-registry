---
domain: software-engineering
subject: prompt-assembly
last_touched: 2026-08-27
touched_by: intake
dry_streak: 0
---

# prompt-assembly

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from a practitioner deep-dive

Gained `context-reachability` (6 -> 7 techniques). Source: [[2026-08-22-inside-deepwiki]].

`context-budgeting` split layers into floors and elastic allowances and never said what
makes a layer one or the other - so it was being decided by intuition about importance,
which is the wrong axis. Reachability is the right one: could the agent have obtained
this itself with the tools it already has? The two classes have opposite value curves
and opposite failure modes, which is what makes the split load-bearing rather than
taxonomic.

The non-obvious half, and the part the source did not state: reachable context needs a
HIGHER freshness bar than unreachable context, because an error there steers the agent
away from checking something it would otherwise have found.

## Open leads

- **The classification has to reach the feeders.** The technique says each feeder
  declares the class of what it contributes. `retrieval`, `agent-memory` recall and any
  state digest are the feeders; none of them currently says. If a later run touches any
  of the three, check whether the declaration belongs there too.
- **Reachability moves when the tool surface moves**, which ties this to
  `mcp-tools/orchestration-to-tool-migration`, landed in the same run. Two subjects now
  describe the same boundary from opposite sides; check the seam is stated once.

## Standing debt

- **Single stack** (`rust`). The new technique has no application.
- **Never swept by `/librarian`.**

## Declines

None.

## 2026-08-25 - /intake run 10 ([[2026-08-25-19-claude-code-mistakes]])

- New technique `task-envelope` (locate / done / check in place of role priming; primary: Zheng et al. EMNLP 2024 Findings). Registered in the golden path. The subject's identity layer is left alone - the technique distinguishes product identity from per-task priming.
- New application `rust--task-envelope` (verified against a companion tree at 874281302): three dispatched-worker prompts read; locate and done present, check absent and added cross-repo with tests.
- Gap noticed, not filled: no A/B on envelope content exists anywhere in the fleet. Return when a dev-op ledger has enough verdicts to compare.

## 2026-08-25 - /intake run 14 ([[2026-08-25-agentic-dev-paper-batch]])

- `task-envelope`'s check clause now carries the field numbers: ~26% of failed runs fabricate success, ~23% inaccurate self-reporting, ~3% unprompted self-correction. The run-10 rule, priced by two independent corpora within the same month.

## 2026-08-25 - /intake run 15 ([[2026-08-25-karpathy-coding-file]])

- `task-envelope` done-criterion sharpened to the machine-checkable finish line (task -> test-shaped target; the loop moves inside the session; weak criteria produce interruptions, not vague results). Now cites law 13 `silent-state-is-ungoverned`.

## 2026-08-26 - /intake run 23 ([[2026-08-26-knowledge-compressor]])

- `context-budgeting` gained "The ceiling is one constraint; the recurring bill is the other". The technique was framed end to end as a *fitting* problem - budgets, ladders, truncation - and fitting problems stop being interesting once there is room. But a standing layer at half its allowance is still billed every call, so there are two independent constraints and only one of them ever trips a ladder.
- Consequence landed with it: shrinking a layer is an **investment**, and the decision number is a break-even in **inclusions**, not tokens. Cited scale anchor from the source: an automated pass that halved a reference document repaid only after ~2,000 uncached inclusions.
- The non-obvious half, and the part the source could not have: **the denominator moves with cache state.** Cross-referenced against `model-routing/cache-continuity` (vendor multipliers banked 2026-08-25) - a cached prefix re-reads at ~0.1x, so the same shrink saves an order of magnitude less while cached, and the edit itself invalidates the entry at 1.25x. **A large, stable, cached standing layer can cost more to compress than to keep.** That inverts the naive advice and is the reason the section exists.
- Seam noted: this is the third subject pair describing one boundary from opposite sides (with `model-routing`). Stated in prose here, not linked - cross-bundle rules apply within `llm-agent` too by house convention.

## 2026-08-26 - /intake run 24 ([[2026-08-26-dhh-lex-fridman]])

- `task-envelope` gained "When done is not knowable, the envelope inverts": the technique's precondition, stated. For discovery tasks (the done criterion is learned by using something that does not exist yet) the vague prompt is correct; its deliverable is the done criterion for the next dispatch, and steering happens by differential choice among manifested variants. The finish-line/route split named: constraining the destination costs nothing, constraining the search spends the operator's guess where the model's search does better.
- The source demonstrated both modes itself: a library translation dispatched with a textbook envelope (single binary, pixel-identical, do not stop) beside a greenfield app built vague-then-steer. The discriminator came from the source's own contrast, not its stated advice.


## 2026-08-27 - /intake, from an open-tree vendor repository ([[2026-08-27-openexecutive-virtual-executive]])

Gained `cache-breakpoint-allocation` (9 -> 10 techniques). Registered bidirectionally.

**The missing stage was the cut itself.** `layered-composition` orders the layers by
volatility and stops at *one implicit boundary* - everything upstream of the first
volatile byte - which is the right model only for a provider that infers one.
`context-budgeting` prices compression against cache state.
`model-routing/cache-continuity` prices tier switches against the prefix treated as a
single monolithic asset. Three files surround the decision and none owns it: that
declared cut points are a **scarce request-wide budget** shared with tool declarations
and message history, that each block carries its own lifetime, and that allocating them
has a rule.

The rule landed as: spend a cut point only at a cadence boundary, merge adjacent layers
that change on the same cadence. The golden path layer table already carries a *Changes*
column, so the technique names that column the allocation map - **cut where the column
changes value, not where the topic does**. Splitting same-cadence layers is the common
waste and it is committed for reasons that feel like tidiness (one block per concern, per
owner, per table row).

Folded in rather than banked separately, per the standing critique that synthesis comes
from the skill: **the admission rule is the same question as the merge rule.** The house
slogan *no dynamic content in a cached block* is the wrong discriminator - it bans
process-stable computed values (a resolved timezone, an account identity) which are as
stable as constants for the whole life of the block, while permitting a hand-authored
string some caller rewrites per request. The test is mechanical: *can this value change
before this block expires?* The source own code violated its own contributor guide on
exactly this point and justified it correctly in a comment.

Also landed: blast radius runs downstream, so the cost of a layer is its position times
its cadence and never its size - which inverts the intuition that big layers are
expensive. And a `count-carries-predicate` caution on advertised hit rates: a
steady-state figure measured over late turns of long conversations excludes every cold
start and every fan-out call, and the two numbers differ by enough to reverse a caching
decision.

## Open leads

- **Non-negotiable segments outside the user-overridable region.** The source appends an
  identity block *after* a user persona override so a custom prompt cannot silently drop
  it, and degrades a placeholder substitution to append rather than to a no-op when the
  user deleted the placeholder. Sits between `layered-composition` (owned sections) and
  `variable-interpolation` (a missing variable is a loud failure) and may be a seam rather
  than a technique. Return on a second independent source, or when a connected project
  grows a user-editable system prompt with mandatory segments.
