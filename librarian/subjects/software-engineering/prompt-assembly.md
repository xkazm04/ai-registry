---
domain: software-engineering
subject: prompt-assembly
last_touched: 2026-09-04
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

## 2026-08-27 - /intake, from a coding-agent harness tree ([[2026-08-27-whip-coding-agent-harness]])

Gained `history-compaction` (10 -> 11 techniques). Registered bidirectionally, with a
paragraph added to the golden path's layer-table section.

**The missing stage was the transcript itself.** The layer table has five rows - identity,
policy, capability, context, task - and every one of them is *authored*: someone writes it,
derives it, or selects it per call. A multi-turn tool-using conversation carries a sixth
thing none of those verbs describes, and it is the only part of the prompt that grows as a
consequence of the system working correctly. `context-budgeting` is thorough from stage two
onward, which is exactly where a missing stage one hides.

Triaged as two candidates and merged on verification, because both are one root: **our
accounting versus their protocol.** Three invariants, all failing in the same silent
direction:

- **Pairing.** `context-budgeting`'s "cut at semantic boundaries" is insufficient here
  because the boundary is supplied by the protocol, not the reader: a tail of the last N
  messages opening with a result whose call is gone reads perfectly as prose and is
  rejected as protocol. Cuts are defined over call/result groups; the summary may not be
  inserted between a pair either; call ids must survive every rewrite.
- **Resume.** A third regime `continuation-prompts` does not enumerate. Not "preserved",
  not "lost", but **carried and structurally broken** - the record intact and missing the
  half of a pair that will never arrive, because the execution died with the turn. Repair
  with synthesized "did not complete" results before assembly. That repair is also the
  cheapest crash detector available, and a non-empty one is a report, not routine.
- **Size.** `context-budgeting` reserves "safety margin for counting error", hedging two
  estimates: an advertised window that is not what the request is measured against, and a
  local counter that may not be the provider's. A hedge is not a guarantee, so the reactive
  path exists - compact once on the provider's refusal and retry - guarded by a
  once-per-turn flag, without which a misclassified rejection becomes a compact/retry loop
  that shrinks the conversation to nothing and bills a summarization per iteration.

Closing section earns its place from the *economy* the source documents (route
summarization to a cheaper model): compaction is the one place model-generated text is
promoted into a standing layer of every later prompt, so its errors are not transient, and
anything load-bearing that exists only in the transcript is one compaction away from gone.

## Open leads

- **Untriaged, from the same source:** the `@`-mention expansion discriminator, already
  drawn by two implementations taking opposite sides - explicit mention rewritten into a
  synthetic read tool-call/result pair (so the model will not re-read it, and compaction
  treats it as a tool result rather than a giant user message) versus ambient IDE state
  injected as a mention-only reminder. Sits on `context-reachability`. Return when a second
  source draws it, or when a connected project grows file mentions.

## 2026-08-30 - intake ([[2026-08-30-headlong-agent-microharness]])

Gained `tiered-history-projection` - the second regime of the transcript layer,
stated on both sides of the boundary with `history-compaction`: replace-in-place
compaction governs a message list that IS the durable record; projection governs
a record that outlives the prompt and is re-rendered per call (geometric
staircase to birth, tiers as an id-index not testimony, sealed provenance-stamped
blocks, degradation that never drops coverage silently). Applied to a managed
tree as a simulation, verdict not-better there today; the technique carries the
adoption gate that seam produced (histories must outgrow the tail AND a
fetch-by-id affordance must exist). Corroborated in-tree against a harness's
design doc plus its implementation, zero fetches.


## 2026-08-30 - intake, operator-control-plane

**An XL spec was proposed and downgraded on reading the file** - the outcome
Phase 6 exists to produce. The candidate was a six-rule contract for shaping a
task before dispatch, mapped to a near-empty and read as a new subject.
`task-envelope` turned out to be a mature 200-line technique already owning
Locate / Done / Check and "state the wanted behaviour, not the forbidden one" -
three of the source's six rules in the corpus's own words. A competing subject
beside it would have misfiled the work.

What survived is an amendment, and it is the part `task-envelope` had no
position on: specificity is a **graded dial**, not a checklist.

- The rungs do not pay evenly. Locating is categorical - a task naming no path
  has no floor, while every other refinement improves a run that was already
  going to reach the right file. Grade on locating first and treat its absence
  as disqualifying.
- **The ladder is non-monotonic below a capability floor.** In a 216-cell grid
  pass rate rose with specificity for three models and *fell* for the smallest
  across two separate tasks. Added structure is itself instruction-following
  load; below some capacity it competes with the work instead of substituting
  for it. Each executor has a specificity optimum and for the weakest tier it is
  not the top rung - noted against `model-routing/capability-floors`.
- Task shape is lintable deterministically before dispatch. Return the rung, not
  a pass/fail. The linter's own paid-for failure: an unanchored ban-list matched
  a vague word inside an ordinary filename and refused a correct run - a false
  positive here blocks, which is the expensive direction.

## Standing

One amendment. The other eleven techniques were not swept.

## 2026-09-02 - `/intake` hermes-agent (run `intake-hermes-0902`, intake 2.1.1, Opus workers)

Two techniques: `amortized-compaction-cadence` (the schedule compaction runs on rather than the threshold it fires at - one unit of history folded per turn to hold occupancy flat, priced against the cached prefix; the cursor never absorbs what the operator wrote; A1 and A2 folded into one because the exemption is only statable in terms of the absorbable unit) and `deferred-interface-invalidation` (a command that mutates a standing layer takes effect next session by default, immediate as an opt-in; the one exempt rewrite is compression). `history-compaction`, `cache-breakpoint-allocation` and `fingerprinting-and-cache-keys` were read whole and none stated cadence or avoidance. Source-tree application `python--amortized-compaction-cadence` with the measured 22%-and-held occupancy. Deviations: no reclaim-size gate; a half-committed pass reports as committed; the report script measures occupancy but not the cache-hit side of the trade.

## 2026-09-03 - intake, rowboat (run intake-rowboat-0903)

Two techniques from a vendor repository read as a system (810-word landing
page, 56,285 words of in-tree design documents).

- **endpoint-sealed-continuation-metadata** - the half of a transcript that
  belongs to *where it happened*. Provider continuation blobs are sealed to
  the endpoint that minted them, so replay is gated per segment on strict
  provider-instance plus model-id equality AND a clean close; everything
  else, including the inline base whose provenance is unrecorded, is
  stripped. This is the reason composition needs the target model as an
  input, which the subject did not previously say anywhere.
- **elision-to-a-refetch-pointer** - a third answer beside compaction and
  tiered projection, for material that is still addressable at its source:
  elide to a pointer naming the way back, not to a summary. Sited as a
  decorator so the durable record is untouched, pure per message so prefix
  caches keep hitting, with the recomputability caveat written down.

**Applied `code`, verdict `better`**, in a connected observability tree: a
tool-server resource read emitted the whole body pretty-printed beside its
rendered form, unbounded. Paired on one fixture: 206,644 -> 43,628 bytes
(4.7x). The negative half is the more useful one and is in the application -
elision did NOT reach the byte threshold that triggers it, because it bounds
payload per item and cannot bound an unbounded item count.

Boundary now stated in the golden path under its own heading, between the
budget sections and the versioned-interface section.

## 2026-09-04 - intake (run `copilot-cost`)

Source: a first-party practitioner account of one team's harness cost work.
One technique landed, plus one application; the run's other three findings went
to the new sibling subject `tool-result-economy`.

- **compression-hardens-deferred-decisions** - found by the asymmetry hunt, not
  by a gap. `context-budgeting` models the *economics* of shrinking a standing
  layer with real care (break-even in inclusions, cache multipliers, a measured
  2,000-inclusion anchor) and models the *risk* of shrinking it with nothing.
  The mechanism: compression preferentially deletes hedges, because a hedge adds
  no assertion and so has no local justification - and a hedge is where
  authorship declined to decide and delegated to call time. Deleting it does not
  shorten the rule, it **makes the decision**, and it collapses toward the
  restrictive branch because that is the branch statable as a rule. The safe
  compression is the one that is shorter *and weaker*. Second half: the most
  compressible lines are the least tested lines by construction, so a
  compression pass walks down the untested column; and the ratchet is ordered -
  on a regression, write the test **before** changing the text again.

  This also repairs a one-directional edge in
  `eval-harness/certification-levels`: the ladder says the cheap level gates the
  expensive one and never says what an empirical catch owes the cheap level. It
  owes a test.

**Applied `simulation`, verdict `better`**, against an agent platform's
836-line build prompt. The expected precondition - a big standing layer with no
behavioural tests - was **wrong**: the project runs a ten-fixture behavioural
bench over that exact prompt, citing its rules by number. What the bench
measures is the mechanism instead, and the tree reached this technique's own
decision rule independently seven weeks earlier, from a regression: *select
questions by information value, not by template.* Mean 0.48, high band 0.285,
the round-cap dimension 0 or 1 on all ten fixtures, and the fully-specified
control drew four questions where the design says zero.

**Boundary with the new subject**, stated in both golden paths: an instruction
is a set of deferred decisions and compressing it makes them; a tool result has
no deferrals in it at all.
