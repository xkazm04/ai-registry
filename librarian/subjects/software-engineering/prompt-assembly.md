---
domain: software-engineering
subject: prompt-assembly
last_touched: 2026-10-02
touched_by: deepen, intake
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

## 2026-09-04 - /intake run (stencil harness playbook)

- New technique `speculative-compaction-splice`. `amortized-compaction-cadence` opens **"Two schedules, and what each one buys"** and prices batch against amortized as a deployment-decided trade - but both are *triggered*, and both do the work in the turn's path. That shared assumption is not a law.
- The third schedule forks at a derived margin below the threshold, compacts beside the conversation, and splices the summary in as a prefix. It takes amortized's stall-free property **without** the per-turn prefix break that document treats as the unavoidable price, because it breaks the prefix exactly as often as batch does - in `cache-breakpoint-allocation`'s arithmetic, the cadence term is unchanged from batch.
- Second half, which the corpus had no view on: the splice keeps the live turns *after* the summary, so the model does not resume looking at a handoff message standing alone as the newest thing in its history.
- The landing adds the two things the source omits and any implementation needs: the margin is **derived** from measured summarization latency against tokens-per-turn (a round percentage never revisited is a threshold trigger with extra steps), and the losing case - live branch crosses the hard threshold, or the summarization fails - degrades to blocking on the in-flight request, never silently to no compaction.
- Explicitly does **not** relax `history-compaction`'s selection rules: cheap compaction off the critical path invites running it more often, and each pass is still a lossy rewrite of the record the session reasons from.
- **Unapplied.** No fleet project runs a conversation-window compaction it owns; the nearest candidate's compaction hits are memory records and review summaries, not transcript spend-down. Return condition: a project compacts a transcript against a context window it must stay inside.

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
## 2026-09-04 - /intake `Everywhere` (run `everywhere-build`)

One technique, **`contributed-document-admission`**: what an assembler owes when
it injects a registry of instruction documents **its team did not author**.

Placement was contested between here and `agent-instruction-files`, and this
golden path decides it in its own words - *"the inverse case, authoring content
for an assembler you do not control, is the sibling subject; this subject
governs systems that own their assembler."* These are the assembler's decisions.
The seam was exact: the trust-classification section enumerates *authored /
machine-derived / untrusted* and says an untrusted span never enters the
identity or policy layers, with **no class for a document the operator
deliberately installed but a stranger wrote** - which wants the capability
layer and nothing else.

What was already covered and therefore compressed rather than restated: the
no-execution half leans on `agent-runtime-assembly/operator-tier-code-loading`
(*"code entry points come only from the startup tier"*), and index-over-body on
`capability-documentation`'s pointer principle. What was genuinely absent:

- **identity from source root plus container, never from self-declaration** - a
  document cannot name itself into another source's namespace, and a declared
  name disagreeing with its location is a warning, not an override;
- **a declared capability is a precondition, never a grant** - requesting a tool
  is not acquiring one;
- **an invalid entry is listed with diagnostics, never silently dropped and
  never injected**;
- enable state as deviations-only, with the active set as a fingerprint input.

`agent-instruction-files/sibling-floor-ownership` is the nearest thing in the
corpus and describes the same artifact class from the **owner's audit** side;
it says nothing about how a host admits, names or refuses those entries. Cited,
not duplicated. Nothing under `agent-instruction-files` was edited - a sibling
held uncommitted work there during this run.

Unapplied: return condition in `applied.md`.

## 2026-09-04 - /intake `copilot-cost-efficiency` untriaged drain (run `intake-ghcost-2`, intake 2.5.0)

Two techniques and one amendment, from the untriaged tail of a first-party account
of a coding-agent harness. The operator approved all four banked rows as a
multi-select; three landed here, one in `agent-runtime-assembly`.

**`recovery-path-as-loss-signal`** (new) - a lossy transform that keeps the original
retrievable has an error rate nobody reads: how often the consumer takes the recovery
path. The technique owns the family of recovery behaviours that do not look like
recovery (re-ran the producing command, repeated an exploration, narrowed a search,
simply took more turns), and the reason a per-unit saving is measured at the wrong
boundary - the coupling is a behaviour of the *consumer*, so the measurement boundary
must be wide enough to contain it. The two-sided reading is deliberately bounded: a
high rate is unambiguous, a zero rate cannot distinguish precise targeting from
timidity, and the defect is reporting a safety result as an optimality result.
Cross-bundle convergence recorded as prose with no link - another bundle's routing
technique measures the same fallback at the opposite polarity, where it is a safe
superset and a non-trivial rate means routing never happened.

**`consumer-coupled-decoration`** (new) - per-item markup whose consumer changed
method goes on being produced, correct, and unread, at items x payloads x sessions.
A worker overrode the director's routing to land it here rather than in
`agent-instruction-files`: this subject "governs systems that own their assembler",
the cost model there is one-factor where this is two, and `substrate-coupled-expiry`'s
instrument is a trial against the *model* while this consumer is a peer program - so
the audit is a code read, not an experiment. Reciprocal cross-reference added there.

**Amendment to `elision-to-a-refetch-pointer`** - bounds its own stated rule rather
than retracting it. "The threshold is policy, not judgment" holds for homogeneous
material and fails once the material has classes with different re-read
probabilities, because size and information density are correlated. Structured result
sets gain a third option beside keep and elide: lossless regrouping that drops no
entry.

**The apply step turned the corpus on its own prior landing.** An earlier run shipped
an elision into a tool server and measured its 4.7x with `arm_a.len()` against
`arm_b.len()` - the transform's own output, the boundary the new technique forbids -
and nothing in that crate counts recovery at all. Break-even sits at a 67.5% recovery
rate and is unresolvable as built.

**A real defect fell out and shipped.** The elision marker is ~44 bytes and fields of
any size were elided, so a wide trace of small payloads rendered *larger* than the
un-elided compact form while reporting the content gone: 56,228 -> 85,828 bytes,
+52.6%, measured in the implementation rather than a model. Fixed with a 64-byte
floor; the case elision was built for is unchanged. **The arms are byte-identical at
both endpoints and diverge only across the middle** - the false tie the mid-state rule
exists to catch. One sub-claim came back `not-better` and was kept: the lossless-first
ordering has no purchase where the trigger already measures the compact form, because
"lossless suffices" and "the trigger did not fire" are then one predicate.

Applications: `rust--recovery-path-as-loss-signal`, `rust--consumer-coupled-decoration`,
and `rust--elision-to-a-refetch-pointer` extended with the shipped arm. Four
`unapplied` rows record searched absences across the rest of the fleet.

## 2026-09-04 (second touch) - the last writer is not always yours (`workweave-router-0904`)

`/intake` 2.5.0 over `weave-os/router` @ `1699cf6`. One amendment to
`layered-composition`, from the promoting question rather than from the headline.

The subject states its door as *enumerable* — "all prompt text for a family passes
through one assembler, and the writers are enumerable — they are the assembler's
callers". A format-translating proxy in the path is a writer that is not a caller,
in another process, owned by another party, and it rewrites for a reason the
assembler cannot argue with: the destination rejects a shape the source format
permits. The faithful fix is the destructive one — hoisting every system message
into the destination's system field preserves meaning exactly and moves a per-turn
system reminder to the front of the prompt, re-writing the cached prefix every turn.
Measured on the source's production traffic: **~890k cache-creation tokens per turn
against a flat 17.5k of reads.**

What this corrects is a *sufficiency* claim the subject makes in two places — that
byte-determinism per message gives a stable prefix. It does not, when the last hop
reorders. The correction is that a required rewrite must be **position-preserving**
rather than merely meaning-preserving: hoist only the leading run, demote the rest
in place.

**The apply row came back `not-better` and improved the amendment.** Its prescribed
guard was run against a fleet composer rather than argued: cached reads against
cache creations over recorded runs, **15,830,327 : 941,777 = 16.8:1** — the healthy
pole, two orders of magnitude from the pathological ~0.02:1. The guard had no number
and was therefore unusable; it now has two poles far enough apart that it needs no
threshold, only the sign of `ratio - 1`. Nothing shipped to the project, and nothing
should have.

## 2026-09-05 — intake, codecompanion.nvim (`intake-codecompanion-20260905`)

Two techniques and two amendments from an editor-resident chat client read for
context management, the turn pipeline and attachments (source note
`sources/2026-09-05-codecompanion.md`).

- **context-ownership-regimes** (new): who holds the transcript between turns
  decides which client lanes run. Both off when the provider manages the window
  (thresholds passed through; the provider's compaction block replayed verbatim,
  after a thinking block), both off by adapter type for a stateful agent protocol.
  The source contradicts itself here — its architecture doc keeps client editing
  under server-side compaction, its gate at HEAD does not — and the code won; the
  doc's intent is recorded as the wire-cost trade the exclusivity gave up.
- **live-attachment-delta-resharing** (new): share once with a witness, diff
  against the last-shared content when it moves, nothing when it does not,
  deletion as a message. Measured on personas' per-block hash ledger: 86% of the
  composed prefix unchanged turn over turn; the churning block sits third of eight.
- **history-compaction** gained two subsections: the lossless lane's own lower
  trigger (0.65 against 0.85, aged by cycle, reclaim-gated; precondition from the
  kp simulation: only where the transcript carries re-fetchable bulk), and the
  provider-anchored count (last reported usage plus a local estimate of the unsent
  delta). Three decision rules added, one of them the hand-off to the ownership
  technique.
- Applications: four against the source (`neovim--*`, a new stack slug added to
  the bundle's `stacks:`), one experiment on personas (`better`), one simulation on
  personas (`unmeasurable`), one simulation on kp (`not-better`, improved A1).
- Untriaged, with anchors in the source note: the second summary is a summary of a
  summary (a possible amendment saying how many turns and prior summaries a
  summary stands for).

## 2026-09-08 - intake, portal-ai-plugins (run `intake-portal-ai-plugins`)

New application `claude-code--elision-to-a-refetch-pointer`: the technique's
"class by producer, size only inside a class" rule tested one boundary earlier,
at the Read tool call, over 30 days of one machine's transcripts (5,957
sessions, 208 whole reads of text files over 350 lines). A size-only block -
the shape a vendor plugin ships - lands 84% of its blocks on source; a
class-based guard (harness overflow files, generated artifacts) recovers 73% of
the large-read tokens in the highest-rate project with zero working-set blocks.
Shipped in personas (`code`/`better`); the size-only shape is `not-better` on
every project measured. Instrument banked at `scripts/measure-large-reads.mjs`.
Return condition: what the agent does after a block is unmeasured.

## 2026-09-15 - intake, cline-desktop (run `intake-cline-desktop`)

New technique `foreign-harness-history-folding`, the transcript's second seal
beside `endpoint-sealed-continuation-metadata`. A history recorded by a different
agent harness is written in that harness's tool vocabulary, which no provider
rejects and which some models imitate. Paired local experiment: raw replay made a
27B model call a tool absent from its roster on 10/10 continuations, and the
roster-name control and the folded summary on 0/10. A 12B model scored 0/10 in
every arm, so the risk belongs to the model, not the harness. Two applications:
`node--` (an open agent SDK that imports three foreign session stores and folds on
resume, with a silent fallback to raw replay) and `rust--` (Personas' text-only
awareness block, `experiment`/`better`, no code change). Boundary stated in the
technique: fold for continuation, project to text for awareness. Return
condition: summary-content quality is unmeasured in both trees and in this corpus.

## 2026-09-15 - /intake QwenPaw (run `qwenpaw-0915`, intake 2.10.0)

Source [[../../sources/2026-09-15-qwenpaw]]: a durable-log context manager with a graduated pressure pipeline. Two techniques landed, taking the subject to 24.

- **fold-only-acknowledged-evidence.** The stage the corpus lacked is *when* a fold may run: only on blocks that a completed model call carried. Capture and acknowledgement are separate calls, and a typed refusal replaces cutting unread evidence. This is distinct from elision-to-a-refetch-pointer, which owns *what* may become a pointer.
- **summary-evidence-gate.** A third discipline beside history-compaction's two: a local, model-free admission gate. Every pointer must resolve, no identifier may be absent from the evidence, and the last valid summary is kept on failure.
- **Both are unapplied.** No fleet project folds history under pressure or admits a model-written history summary into a standing layer. ascent's serializer cap (`grounding.ts:190`) is a producer cap, which is the fold technique's stated "when not".
- **Untriaged:** compressing a copy of the outgoing request, with a plain-path fallback (an elision-to-a-refetch-pointer amendment).
- **Leads:** the visual compression numbers and the durable-log memory scores. Neither ships its scripts.

## 2026-09-16 - /intake SoL-Pi (run `intake-solpi`, intake 2.10.0)

Source [[../../sources/2026-09-16-sol-pi]]: four efficiency mechanisms over a coding-agent harness, read from the clone. One technique, one amendment and three source-tree applications landed; the subject is at 25 techniques.

- **compaction-horizon-breakeven.** The runtime form of the cache trade context-budgeting and amortized-compaction-cadence leave offline: `write × (ratio − 1) / (archive − memo)` against a horizon estimated from the run's own completed boundaries and capped by the window, with a wider first horizon, margin and carried debt afterwards, and the wall overriding. Its boundary came from the apply step: replayed over 166 real sessions, every threshold compaction repaid within two requests, so the test governs early, boundary-triggered compaction only.
- **summary-evidence-gate** gained its quote-only form: kinds and byte-exact quotes bound to the archived source by hash, which removes the "misattribution to a real range" the gate names as its price, plus the failure-evidence and not-smaller checks. The registry's own instrument for it is `scripts/check-anchors.mjs`.
- **Applications:** the compaction economics (`node--compaction-horizon-breakeven`, applied experiment, not-better at the wall), the reducer (`node--summary-evidence-gate`), and the observation archive with two full sends and paged recall (`node--elision-to-a-refetch-pointer`, carrying the measured two-sends choice and the archive-at-capture boundary).
- **Untriaged:** a post-write hash guard as the mirror of mcp-tools/write-freshness-gate (anchors in the source note).

## 2026-09-21 - /intake claude-code-from-source (run `cc-source-0921`, intake 2.13.0)

Source [[../../sources/2026-09-21-claude-code-from-source]]: an 18-chapter architecture book about an agent harness, reconstructed by an agent pipeline from shipped source maps. Second-hand about the system it describes, first-party about its own build pipeline. One technique landed; the subject is at 15 techniques.

- **response-reservation-sizing.** `context-budgeting` derives the global budget as window minus response room minus margin, and names exactly one failure at that subtraction - an answer squeezed to nothing, the *far* end. The near end had no owner: the reservation is charged against usable input on every call whether or not it is used, so a ceiling left at a platform default is a recurring purchase nobody made. The technique derives it from the observed response-length distribution at a declared percentile, escalates on the cut rather than reserving for the tail, and reports the escalation rate. Grounded in `limits-are-derived`, whose "computed, not merely written" clause is what the failure actually looks like in the field.
- **The precondition is stated rather than assumed**, because the apply step proved it matters: where input never competes with the reservation, the whole technique is free money that does not exist. That clause came back from the tree as a measured result, not as a hedge written in advance.
- **The boundary against `structured-output/output-budget-signal` is in prose, not a link-and-shrug.** Both read the same measurement - response length against the ceiling - and ask opposite questions: that one asks whether the *call* is too big, this one whether the *reservation* is. A system can hold the first and still leave the second to a default, which is exactly what the applied tree does.
- **Application (`rust--response-reservation-sizing`, applied task, not-better).** The target tree already sets a deliberate ceiling and its input is bounded far below the window, so the technique's recurring cost there is zero. The seam returned something better: two crates size the same response and neither reads the other, a 3.91x overcommit between a 16,000-token planning budget and a 4,096 wire ceiling, and a request type with no output-ceiling field through which the derived number could ever travel.

## 2026-09-23 - `/deepen` currency lane ([[2026-09-23-3]])

`python--amortized-compaction-cadence` refreshed before its 2026-10-15 clock; ~20 anchors re-resolved (the pass logic moved into a mixin, the doc into the site). One correction to our own text, wrong at both commits: the pass counter counts every emitted event, including failures and skipped exchanges, not successes. `refresh_by` kept, moved to 2026-11-05.

Banked lead (proposal): `amortized-compaction-cadence` should say pass counters split by outcome - one total over skips and absorptions makes a quietly skipping session look healthy. Return condition: the next pass over the technique, or a fleet project owning a transcript compaction.

Impact: personas carries 2 stale `deviation` verdicts on this subject (pre-existing, not moved by this landing).

## 2026-09-23 - /intake self-compact-pi-agent (run `intake-3b0U4`, intake 2.13.0)

Source [[../../sources/2026-09-23-self-compact-pi-agent]]: a builder's devlog for a self-compacting coding agent whose thresholds are set just under one vendor's price step. Mostly catches (the note-to-self is `compaction-checkpoint`'s model notepad; the done criterion is `task-envelope`), plus one amendment.

- **compaction-horizon-breakeven** gained "When the price book moves the wall". Where a provider reprices the whole request above a prompt-length threshold, the step is a second wall below the window: compact regardless within its reserve, with the step read per model from the price book at session start. The observability bundle's price book already stated the whole-request repricing; the compaction techniques had never read it. The vendor primary showed steps are per-model and move (this fleet's vendor bills a million-token window flat), so the constant the source hardcoded is the anti-pattern.
- **Applied row:** experiment, `unmeasurable`. A 2x step at 272K costs this checkout's real traffic +58% with no wall and nothing with one, but compactions rise 9 -> 187 and their fidelity cost has no instrument yet.
- **Open (lead L3):** on a flat book, a 272K wall still cut priced input to 0.64x, so window-fraction thresholds are not economically neutral anywhere. This waits on a compaction-fidelity instrument before any threshold moves.
- **Untriaged:** delivering occupancy to the model as graded notices (real gap after the promoting grep; the source's own demo shows a model reading a percentage against the window rather than the policy).

## 2026-09-25 - /reconcile, dispatched on a clock (run `rc-pa-0925`, reconcile 1.0.1)

Declined, no wave. The subject has no single-source debt: 25 applications on 5 stacks, read from at least six independent counterparts. The scan ranked it only for `python--amortized-compaction-cadence` near its 2026-10-15 clock, and that premise was stale: the dispatching checkout sat 38 commits behind origin, where `deepen(currency)` had already re-resolved the application on 2026-09-23 and moved refresh_by to 2026-11-05. A clock on this subject is re-verification work for `/deepen` or `/librarian`, never a reason to send it to this lane.

## 2026-09-25 - /reconcile, re-dispatched on the same clock (run `rc-pa-0925b`, reconcile 1.0.1)

Declined again on the premise `rc-pa-0925` already declined. The dispatching checkout was 43 behind origin and still read refresh_by 2026-10-15 for `python--amortized-compaction-cadence`. Origin reads 2026-11-05. No work for this lane until the primary checkout fast-forwards.

## 2026-09-25 - /reconcile, third dispatch on the same clock (run `rc-pa-0925c`, reconcile 1.0.1)

Declined a third time on the same premise. The dispatching checkout is now 45 commits behind origin, and origin still reads refresh_by 2026-11-05. Nothing has changed since `rc-pa-0925b`.

## 2026-09-29 - intake PilotDeck ([[2026-09-29-pilotdeck-agent-os]], run `in-pd-0929`)

Landed `pinned-prompt-clock`: the corpus said the date enters as a declared variable and asked of
every block whether its value can change before the block expires; a date read per request fails that
question at midnight, and a time with seconds fails it on every call. Source-tree realization is the
reference (`node--pinned-prompt-clock`); a fleet tree has the trap unarmed and a tail-section control
(`rust--pinned-prompt-clock--personas`, simulation, unmeasurable). Contrast applications, filed as
second-tree documents because the stack--technique names were taken:
`node--history-compaction--pilotdeck` (an interrupted turn dropped whole instead of closed; the
emergency truncation never persisted, so resume is larger than live; the only diagnostic dropped) and
`node--summary-evidence-gate--pilotdeck` (a summary admitted on its finish reason, from input capped
with no re-fetch pointer). Banked untriaged: emergency truncation not persisted as its own amendment.

## 2026-10-02 - intake claude-mods ([[2026-10-02-claude-mods]], run `in-cccustom-1002`)

Amended `compaction-horizon-breakeven` with "When the clock moves the wall": the rewrite premium
assumes a warm cache, and an idle gap longer than the cache lifetime inverts it, because the next
request rewrites the whole prefix anyway. Priced keep against compact-while-warm, said to never compact
after expiry, and to run the clock from the request start. Evidence: a 14-day replay of one machine's
sessions (247 gaps, median cold rewrite 344k, 34% of all cache writes, warm compaction cheaper at
233-235 of 247). The application `claude-code--compaction-horizon-breakeven` (experiment,
unmeasurable: the fidelity floor was never run) records a cache-clock plugin as the realization.
Open: the paired continuation eval that would measure the floor.

## 2026-10-02 - /intake run (open Rust agent-loop crate), three techniques

Source: [[2026-10-02-yoagent]]. Gained `compaction-target-is-an-aim`, `compaction-is-a-fixed-point` and
`cache-affinity-key-from-the-unrewritable-layer` (29 to 32 techniques); three source-tree applications.

- **Target against window.** `history-compaction` states pairing, resume and size invariants but treats the size a cut
  reaches as one number. A headroom-derived target is an aim the compactor chose; the window is the limit. The last rung
  falls back against the target, drops the head first and, when the newest turn exceeds it, leaves only the marker.
  Reproduced by running the source's own deterministic sweep at its HEAD: default budget task lost 0%, latest request
  2%; a quarter of that budget still loses the task in every tool-heavy compaction (43 marker-only passes per 100).
- **Fixed point.** The corpus prices a rewrite (cache-breakpoint-allocation, amortized-compaction-cadence) and takes it as
  given. The rewrites nobody decided to pay for come from a compactor that is not idempotent and deterministic: a marker
  not charged to its cap, a counter in marker text, a cap applied late. Replay numbers are the source's (rewrites 415 to
  70, input spend down 21 to 23%) and were not re-run; the mechanics were opened in code. Also carries the hit-rate
  length ceiling and the "not cached is input plus cache writes" accounting rule.
- **Affinity key.** Distinct from `fingerprinting-and-cache-keys` (session staleness stamp). A key derived from the first
  message breaks under compaction and collapses across sessions; derive it from the standing layer. Provider's own guide
  fetched (key routes, does not pin; 15 requests per minute on one cached state can overflow; automatic on its newest
  models, so the value is model-dependent).
- **Unapplied.** Nine fleet trees searched with a positive control; no transcript compaction and no cache key. Return
  condition: a fleet project owns a transcript spend-down or sends a provider cache key.
- **Open (untriaged, one neighbour read each):** tool source consulted once per run and sorted by name for the cached
  prefix (against `cache-breakpoint-allocation`'s variability rule); a rate-limit-before-overflow classification.

## 2026-10-14 - intake TencentDB Agent Memory ([[2026-10-14-tencentdb-agent-memory]], run `intake-tdbmem-1014`)

- `foreign-harness-history-folding` gained "A reader that reviews is a fourth case": the
  enumeration of carriers served continuation and awareness. A memory extractor handed a
  transcript in plain role names wrote a 1,235-token continuation with zero tool calls; its fix is
  non-native role tags, an end marker plus a restated task, and a reply closed to tool calls or a
  nothing-sentinel. The falsifying seam scoped it before landing: a fleet consolidation pass that
  encodes the transcript as a JSON value and ends on the data had 0 failed parses in 14 real
  passes (3,062 to 84,042 chars), so the end marker is owed only for turn-shaped renderings.
  Applied as a simulation over recorded outcomes, not-better for that tree (nothing to fix).
- Untriaged: the same product's core injects per-turn recall in the user turn while its proxy
  removed per-turn recall as cache-breaking; a proxy that delivers context by answering a turn
  with a synthesized tool call (attribution mirror of `substituted-result-attribution`, in
  agent-runtime-assembly).

## Architecture review - 2026-10-31

First architecture review of this subject. No older record exists, so nothing is retracted. All 66 documents were read. The subject holds together. Open items are a golden-path index gap, four techniques whose numbers moved or never added up, and two applications that contradict themselves. Most applications stay `reverify` because their trees were not reopened. No verification clock was moved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/prompt-assembly",
  "date": "2026-10-31",
  "baseline": "21a2bc974",
  "digest": "sha256-b2:ad13b2ee69c25e8d",
  "disposition": "clarify",
  "coverage": "First architecture review. All 66 documents (golden path, 32 techniques, 33 applications) were read in full, and every relative link resolves. Primary sources re-opened this run: the persona study abstract, the second provider's prompt-caching guide and pricing page, and the first provider's caching and pricing pages. Internal arithmetic was recomputed in eleven documents. Not evaluated: any private or external tree behind the applications, every replay, and the 2026-09 first-party coding-agent account (not re-located). No verification date was refreshed.",
  "counterexamples": [
    "A prefix cache that reads at 0.025x makes a cached standing layer about four times cheaper to keep than the tenth-of-base rule of thumb implies, so a break-even computed at 0.1x overstates the case for compressing it.",
    "A provider that bills its current generation flat across a million tokens can band a cheaper model of the same generation above 100K; a step read from one model is wrong for its sibling.",
    "A compactor that keeps the first and last N lines and adds a marker emits 2N+1 lines, so even a correctly charged marker needs the cap defined as total lines, or the second pass still changes bytes.",
    "A block placed third of eight can rebuild at most five blocks below it; a claim that it invalidates six stable blocks cannot be literal."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2311.10054",
      "result": "Supports task-envelope: '162 roles', '4 popular families of LLMs and 2,410 factual questions', adding personas 'does not improve model performance', automatic best-persona selection 'often performing no better than random selection'."
    },
    {
      "url": "https://developers.openai.com/api/docs/guides/prompt-caching",
      "result": "Supports cache-affinity-key: 'Cached states live on individual machines, where traffic above 15 requests per minute can lead to overflow routing'; separate keys for cached-token accounting and to 'prevent cache-hit probing across customers'; 'On GPT-5.6 and later, OpenAI handles cache routing automatically; the key is not needed'."
    },
    {
      "url": "https://developers.openai.com/api/docs/pricing",
      "result": "Supports the 272K step: 'Long context: >272K input tokens', with listed long-context input at twice standard (e.g. 5.00 to 10.00 per 1M) for several models."
    },
    {
      "url": "https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching",
      "result": "Writes 1.25x (5 min) and 2x (1 h); reads 'standard 0.1x', 0.05x on two models and 0.025x on two. 'The lifetime is measured from the start of the request that writes or reads the cache entry, not from the end of its response.' Supports the clock rule. Refutes compaction-horizon-breakeven's count of one model at a twentieth."
    },
    {
      "url": "https://platform.claude.com/docs/en/about-claude/pricing",
      "result": "'Claude 4.6 and later models (except Claude Haiku 5.5) ... include the full 1M token context window at standard pricing'; Haiku 5.5 'is priced by prompt length' above 100,000 tokens. Supports the flat-book claim and the per-model step rule."
    },
    {
      "source": "Web search for the 2026-09 first-party coding-agent account (decoration removal ~5%, conservative compressor)",
      "result": "Not located. Claims quoting it stay as written, already labelled n=1; not refreshed."
    }
  ],
  "documents": {
    "prompt-assembly.md": {
      "disposition": "clarify",
      "reason": "The frontmatter lists 32 techniques but 'The techniques' section links only 30: compression-hardens-deferred-decisions and pinned-prompt-clock have no bullet and no link anywhere in the golden path. Add both bullets. The rest holds; every relative link resolves."
    },
    "techniques/layered-composition.md": {
      "disposition": "keep",
      "reason": "Owned sections, one door per family and the sealed-door clause stand. The proxy section's two poles agree with its own numbers (17.5k read over ~890k written is about 0.02)."
    },
    "techniques/variable-interpolation.md": {
      "disposition": "keep",
      "reason": "Declared, classified variables and the three honest missing-input outcomes are sound and stable."
    },
    "techniques/house-vocabulary-layer.md": {
      "disposition": "keep",
      "reason": "Argument is internal and stable; floor classification is consistent with context-reachability."
    },
    "techniques/context-reachability.md": {
      "disposition": "keep",
      "reason": "Classification, freshness corollary and A/B-against-absence check stand. Open lead (feeders do not yet declare their class) belongs to the feeder subjects."
    },
    "techniques/context-budgeting.md": {
      "disposition": "clarify",
      "reason": "'A prefix ... re-reads at roughly a tenth of base rate' is now per-model: the provider's caching page reads most models at 0.1x, two at 0.05x and two at 0.025x. Say the read price varies by model. The 'two thousand uncached inclusions' scale anchor names no source; owed: cite it or drop it."
    },
    "techniques/response-reservation-sizing.md": {
      "disposition": "keep",
      "reason": "Purchase-not-limit framing, derive-and-escalate and the zero-cost precondition stand; the precondition was confirmed by its own application."
    },
    "techniques/history-compaction.md": {
      "disposition": "keep",
      "reason": "Pairing, resume and size invariants, both compaction paths and the once-per-turn guard hold. The 0.65/0.85 pair and the provider-anchored count match the neovim application."
    },
    "techniques/tiered-history-projection.md": {
      "disposition": "keep",
      "reason": "Coverage arithmetic (R + F log_F N; lifetime N/(F-1) calls) is correct, and the two adoption gates are stated."
    },
    "techniques/capability-documentation.md": {
      "disposition": "keep",
      "reason": "Registry-derived rendering, doctrine sync and active-set fingerprinting stand."
    },
    "techniques/contributed-document-admission.md": {
      "disposition": "keep",
      "reason": "Index-not-body, declaration-is-not-grant, nothing executed, location identity and visible invalid entries are a coherent contract."
    },
    "techniques/fingerprinting-and-cache-keys.md": {
      "disposition": "keep",
      "reason": "Determinism, digest boundary, gate-sees-target and the send-site ledger stand."
    },
    "techniques/cache-breakpoint-allocation.md": {
      "disposition": "keep",
      "reason": "Cadence-boundary allocation and the variability-within-lifetime rule hold; the hit-rate predicate caveat is consistent with compaction-is-a-fixed-point."
    },
    "techniques/continuation-prompts.md": {
      "disposition": "keep",
      "reason": "Two regimes, carry-decided/re-derive-observable and staleness checks stand."
    },
    "techniques/task-envelope.md": {
      "disposition": "clarify",
      "reason": "Persona study verified this run (162 roles, 2,410 factual questions, 4 model families, no gain, best-persona selection near random). Owed: the '2026 trajectory corpora' figures (about a quarter of failed runs fabricate success, ~23%, ~3%) name no source; cite them or mark them unsourced."
    },
    "techniques/amortized-compaction-cadence.md": {
      "disposition": "clarify",
      "reason": "Schedules, the reclaim-size gate and the operator-turn exemption stand. Owed, from the 2026-09-23 banked lead: pass counters must split by outcome. The python application shows a single total over absorbed, failed and skipped passes making a skipping session look healthy. Not applied here because it adds a rule rather than correcting one."
    },
    "techniques/compaction-horizon-breakeven.md": {
      "disposition": "clarify",
      "reason": "Arithmetic and replays are consistent with their applications (233-235 of 247; 86-91%). The primary sources hold for the 272K step at the second provider, flat 1M pricing on the first provider's 4.6+ models, and the lifetime running from the start of a request. One count is stale: the first provider's caching page now reads two models at a twentieth, not one. The same price book also bands a current model above 100K tokens, which supports the per-model step rule."
    },
    "techniques/speculative-compaction-splice.md": {
      "disposition": "keep",
      "reason": "Internally sound; derived margin and the losing-speculation fallback are stated. Still has no application (single-stack debt from the note)."
    },
    "techniques/deferred-interface-invalidation.md": {
      "disposition": "keep",
      "reason": "Defer-by-default with the compaction exemption and immediate revocation is coherent and checkable."
    },
    "techniques/endpoint-sealed-continuation-metadata.md": {
      "disposition": "keep",
      "reason": "Segment-level replay, strict endpoint equality and demotion-not-deletion stand, corroborated by the node application."
    },
    "techniques/elision-to-a-refetch-pointer.md": {
      "disposition": "keep",
      "reason": "Material classes, decorator siting and the recomputability caveat stand. The 2026-09 first-party account it quotes was not re-located this run; it is labelled n=1 and dated, so nothing hangs on it beyond illustration."
    },
    "techniques/compression-hardens-deferred-decisions.md": {
      "disposition": "keep",
      "reason": "Hedge-as-deferral and test-before-shrink stand; the field instance is told without a source but carries no number the rules depend on."
    },
    "techniques/recovery-path-as-loss-signal.md": {
      "disposition": "keep",
      "reason": "Recovery family, measurement boundary and the two-sided reading stand; the rust application reproduces the mechanism."
    },
    "techniques/consumer-coupled-decoration.md": {
      "disposition": "keep",
      "reason": "Audit, silent expiry and purity ordering stand. The ~5%/~3% account was not re-located this run; it is already scoped as n=1, one harness."
    },
    "techniques/context-ownership-regimes.md": {
      "disposition": "keep",
      "reason": "Three-regime table, exclusive ownership and per-request resolution stand; matches the neovim tree."
    },
    "techniques/live-attachment-delta-resharing.md": {
      "disposition": "clarify",
      "reason": "Says the scene digest 'sat above six stable blocks in the composed order'. The rust application places it third of eight, above four stable blocks (plugins, voice, mode, static addenda). Six is impossible from third of eight. Should read 'above four of the six stable blocks'."
    },
    "techniques/foreign-harness-history-folding.md": {
      "disposition": "keep",
      "reason": "Paired table is consistent (10/10 vs 0/10 arms); the reviewer case is scoped by the falsifying seam."
    },
    "techniques/fold-only-acknowledged-evidence.md": {
      "disposition": "keep",
      "reason": "Capture/acknowledge split, protected set and typed unfit error stand, witnessed by the python application tests."
    },
    "techniques/summary-evidence-gate.md": {
      "disposition": "keep",
      "reason": "Local fail-closed parse, model-free checks and their stated limits stand; quote-only form matches the node application."
    },
    "techniques/pinned-prompt-clock.md": {
      "disposition": "keep",
      "reason": "Freeze, tail notice, refresh-at-checkpoint and probe purity stand, with a reference realization."
    },
    "techniques/compaction-target-is-an-aim.md": {
      "disposition": "keep",
      "reason": "Figures (91%/41% to 0%/2%, +7%; 13.3 to 26.4; four of five) match the reproduced sweep."
    },
    "techniques/compaction-is-a-fixed-point.md": {
      "disposition": "clarify",
      "reason": "The ceiling arithmetic checks ((n-1)/(n+1): 87% at 14, 95% at 39, 96% at 49), but leak 1 does not: 'cutting a long result to its first and last N lines ... yields N+1 lines'. Keeping the first and last N lines gives 2N+1. State it as an N-line cap split between head and tail."
    },
    "techniques/cache-affinity-key-from-the-unrewritable-layer.md": {
      "disposition": "keep",
      "reason": "Verified against the provider guide this run: about 15 requests per minute per key, cached state on individual machines, accounting/probing reasons, and automatic routing on its newest models."
    },
    "applications/claude-code--compaction-horizon-breakeven.md": {
      "disposition": "reverify",
      "reason": "Arithmetic is consistent. The 0.05x read price and the start-of-request lifetime match the provider's pages this run. The private replay and the plugin were not re-run."
    },
    "applications/claude-code--elision-to-a-refetch-pointer.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (175/208 = 84%; 870k/1,187k = 73%). The one-machine transcript replay was not re-run."
    },
    "applications/neovim--context-ownership-regimes.md": {
      "disposition": "reverify",
      "reason": "Anchors at f73f40e9 not reopened; the doc-vs-code contradiction is recorded with the code winning."
    },
    "applications/neovim--history-compaction.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened; the summary-of-summary and no-reactive-path deviations are stated."
    },
    "applications/neovim--live-attachment-delta-resharing.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened."
    },
    "applications/node--compaction-horizon-breakeven.md": {
      "disposition": "reverify",
      "reason": "SoL-Pi anchors at 2b791687 and the 166-session replay not re-run."
    },
    "applications/node--elision-to-a-refetch-pointer.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened; the blog figures are quoted as the source reports them."
    },
    "applications/node--endpoint-sealed-continuation-metadata.md": {
      "disposition": "reverify",
      "reason": "Clone at f4fce64a not reopened."
    },
    "applications/node--foreign-harness-history-folding--tencentdb.md": {
      "disposition": "reverify",
      "reason": "Traced path at 37b16296 not reopened; already unmeasurable."
    },
    "applications/node--foreign-harness-history-folding.md": {
      "disposition": "reverify",
      "reason": "Cline tree at 6e8bea1c not reopened."
    },
    "applications/node--history-compaction--pilotdeck.md": {
      "disposition": "reverify",
      "reason": "Executed findings at ae87280a not re-run."
    },
    "applications/node--history-compaction.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened."
    },
    "applications/node--pinned-prompt-clock.md": {
      "disposition": "reverify",
      "reason": "Anchors at ae87280a not reopened; test was read, never executed."
    },
    "applications/node--summary-evidence-gate--pilotdeck.md": {
      "disposition": "reverify",
      "reason": "Executed findings not re-run."
    },
    "applications/node--summary-evidence-gate.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened."
    },
    "applications/node--tiered-history-projection.md": {
      "disposition": "reverify",
      "reason": "Private tree at 0e1f0b30 not reopened."
    },
    "applications/python--amortized-compaction-cadence.md": {
      "disposition": "clarify",
      "reason": "The header says the first-party doc moved to the website tree. Two later sections still cite it by its old path (`docs/micro-compaction.md` §), so the application contradicts itself. Its refresh_by of 2026-11-05 is still open, and the hermes tree was not reopened."
    },
    "applications/python--fold-only-acknowledged-evidence.md": {
      "disposition": "reverify",
      "reason": "QwenPaw anchors at cbf1a403 not reopened."
    },
    "applications/python--summary-evidence-gate.md": {
      "disposition": "reverify",
      "reason": "QwenPaw anchors not reopened."
    },
    "applications/rust--cache-affinity-key-from-the-unrewritable-layer--yoagent.md": {
      "disposition": "reverify",
      "reason": "The provider-guidance claims were re-verified this run. The crate anchors at 2428f68d were not reopened."
    },
    "applications/rust--compaction-is-a-fixed-point--yoagent.md": {
      "disposition": "reverify",
      "reason": "Replay numbers are the tree's own and were never re-run."
    },
    "applications/rust--compaction-target-is-an-aim--yoagent.md": {
      "disposition": "clarify",
      "reason": "The table reports '43 marker-only per run', while the technique and the note quote the same figure as '43 marker-only compactions per 100 requests'. One unit is wrong. Owed: fix it from the sweep's output. Not applied, because the sweep was not re-run."
    },
    "applications/rust--compression-hardens-deferred-decisions.md": {
      "disposition": "reverify",
      "reason": "Simulation over a recorded baseline; the bench was never run for arm B."
    },
    "applications/rust--consumer-coupled-decoration.md": {
      "disposition": "reverify",
      "reason": "Byte tables come from a reimplementation; the tree was not reopened."
    },
    "applications/rust--context-budgeting.md": {
      "disposition": "reverify",
      "reason": "No verified_against; private anchors not reopened."
    },
    "applications/rust--context-ownership-regimes.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened."
    },
    "applications/rust--elision-to-a-refetch-pointer.md": {
      "disposition": "reverify",
      "reason": "All table arithmetic was recomputed and is consistent (52.6%, 1.0/5.2/9.4% overshoot, 4.7x). Tree not reopened."
    },
    "applications/rust--foreign-harness-history-folding.md": {
      "disposition": "reverify",
      "reason": "Private tree at cf54b904b and the local model runs not reopened."
    },
    "applications/rust--layered-composition.md": {
      "disposition": "clarify",
      "reason": "The listed order opens with '## Triggering Event' (per-call input) before Identity. The next sentence then says 'Identity/instructions lead; per-call input trails', which the list contradicts. Owed: re-read the assembler and either correct the order or record the triggering event as a deviation from the gradient. Not applied, because the private source was not reopened."
    },
    "applications/rust--live-attachment-delta-resharing.md": {
      "disposition": "reverify",
      "reason": "Table sums were recomputed: 11,708,577 total, 1,662,815 changed, 14.2%, and 1.66M stable below the digest. Ledger not re-read."
    },
    "applications/rust--pinned-prompt-clock--personas.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened."
    },
    "applications/rust--recovery-path-as-loss-signal.md": {
      "disposition": "reverify",
      "reason": "Break-even table recomputed (1,208 B per recovery; 135 of 200; 138.0%). Tree not reopened."
    },
    "applications/rust--response-reservation-sizing.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (16,000/4,096 = 3.91; 72 vs 18 cases at 220 tokens). Tree at 07fa255c not reopened."
    },
    "applications/rust--task-envelope.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; effect unmeasured, as it says."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied five of the first record's clarify items. Each change rests on a primary source opened this run or on internal arithmetic verified this run. context-budgeting got the per-model read-price qualifier, but its unsourced two-thousand-inclusion anchor is still owed, so it stays `clarify`. task-envelope, amortized-compaction-cadence, rust--layered-composition and rust--compaction-target-is-an-aim--yoagent are untouched and keep `clarify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/prompt-assembly",
  "date": "2026-10-31",
  "baseline": "b0759cea0",
  "digest": "sha256-b2:e72fd75e79e6a4a2",
  "disposition": "clarify",
  "coverage": "Second record of the day. The six clarify items marked applied were edited and the edited passages re-read. Every other document is byte-unchanged and keeps its first-record disposition. Owed clarify items remain on the golden path's neighbours (context-budgeting's anchor, task-envelope, amortized-compaction-cadence) and on two applications. No private tree was reopened and no verification date was refreshed.",
  "counterexamples": [
    "A prefix cache that reads at 0.025x makes a cached standing layer about four times cheaper to keep than the tenth-of-base rule of thumb implies, so a break-even computed at 0.1x overstates the case for compressing it.",
    "A provider that bills its current generation flat across a million tokens can band a cheaper model of the same generation above 100K; a step read from one model is wrong for its sibling.",
    "A compactor that keeps the first and last N lines and adds a marker emits 2N+1 lines, so even a correctly charged marker needs the cap defined as total lines, or the second pass still changes bytes.",
    "A block placed third of eight can rebuild at most five blocks below it; a claim that it invalidates six stable blocks cannot be literal."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2311.10054",
      "result": "Supports task-envelope: '162 roles', '4 popular families of LLMs and 2,410 factual questions', adding personas 'does not improve model performance', automatic best-persona selection 'often performing no better than random selection'."
    },
    {
      "url": "https://developers.openai.com/api/docs/guides/prompt-caching",
      "result": "Supports cache-affinity-key: 'Cached states live on individual machines, where traffic above 15 requests per minute can lead to overflow routing'; separate keys for cached-token accounting and to 'prevent cache-hit probing across customers'; 'On GPT-5.6 and later, OpenAI handles cache routing automatically; the key is not needed'."
    },
    {
      "url": "https://developers.openai.com/api/docs/pricing",
      "result": "Supports the 272K step: 'Long context: >272K input tokens', with listed long-context input at twice standard (e.g. 5.00 to 10.00 per 1M) for several models."
    },
    {
      "url": "https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching",
      "result": "Writes 1.25x (5 min) and 2x (1 h); reads 'standard 0.1x', 0.05x on two models and 0.025x on two. 'The lifetime is measured from the start of the request that writes or reads the cache entry, not from the end of its response.' Supports the clock rule. Refutes compaction-horizon-breakeven's count of one model at a twentieth."
    },
    {
      "url": "https://platform.claude.com/docs/en/about-claude/pricing",
      "result": "'Claude 4.6 and later models (except Claude Haiku 5.5) ... include the full 1M token context window at standard pricing'; Haiku 5.5 'is priced by prompt length' above 100,000 tokens. Supports the flat-book claim and the per-model step rule."
    },
    {
      "source": "Web search for the 2026-09 first-party coding-agent account (decoration removal ~5%, conservative compressor)",
      "result": "Not located. Claims quoting it stay as written, already labelled n=1; not refreshed."
    }
  ],
  "documents": {
    "prompt-assembly.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the two missing bullets to The techniques (pinned-prompt-clock after fingerprinting-and-cache-keys; compression-hardens-deferred-decisions after consumer-coupled-decoration); all 32 frontmatter techniques are now linked."
    },
    "techniques/layered-composition.md": {
      "disposition": "keep",
      "reason": "Owned sections, one door per family and the sealed-door clause stand. The proxy section's two poles agree with its own numbers (17.5k read over ~890k written is about 0.02)."
    },
    "techniques/variable-interpolation.md": {
      "disposition": "keep",
      "reason": "Declared, classified variables and the three honest missing-input outcomes are sound and stable."
    },
    "techniques/house-vocabulary-layer.md": {
      "disposition": "keep",
      "reason": "Argument is internal and stable; floor classification is consistent with context-reachability."
    },
    "techniques/context-reachability.md": {
      "disposition": "keep",
      "reason": "Classification, freshness corollary and A/B-against-absence check stand. Open lead (feeders do not yet declare their class) belongs to the feeder subjects."
    },
    "techniques/context-budgeting.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31 in part: the cache-read sentence now says the read price is set per model and is less than a tenth on some. Still owed: the two-thousand-uncached-inclusions scale anchor names no source; cite it or drop it."
    },
    "techniques/response-reservation-sizing.md": {
      "disposition": "keep",
      "reason": "Purchase-not-limit framing, derive-and-escalate and the zero-cost precondition stand; the precondition was confirmed by its own application."
    },
    "techniques/history-compaction.md": {
      "disposition": "keep",
      "reason": "Pairing, resume and size invariants, both compaction paths and the once-per-turn guard hold. The 0.65/0.85 pair and the provider-anchored count match the neovim application."
    },
    "techniques/tiered-history-projection.md": {
      "disposition": "keep",
      "reason": "Coverage arithmetic (R + F log_F N; lifetime N/(F-1) calls) is correct, and the two adoption gates are stated."
    },
    "techniques/capability-documentation.md": {
      "disposition": "keep",
      "reason": "Registry-derived rendering, doctrine sync and active-set fingerprinting stand."
    },
    "techniques/contributed-document-admission.md": {
      "disposition": "keep",
      "reason": "Index-not-body, declaration-is-not-grant, nothing executed, location identity and visible invalid entries are a coherent contract."
    },
    "techniques/fingerprinting-and-cache-keys.md": {
      "disposition": "keep",
      "reason": "Determinism, digest boundary, gate-sees-target and the send-site ledger stand."
    },
    "techniques/cache-breakpoint-allocation.md": {
      "disposition": "keep",
      "reason": "Cadence-boundary allocation and the variability-within-lifetime rule hold; the hit-rate predicate caveat is consistent with compaction-is-a-fixed-point."
    },
    "techniques/continuation-prompts.md": {
      "disposition": "keep",
      "reason": "Two regimes, carry-decided/re-derive-observable and staleness checks stand."
    },
    "techniques/task-envelope.md": {
      "disposition": "clarify",
      "reason": "Persona study verified this run (162 roles, 2,410 factual questions, 4 model families, no gain, best-persona selection near random). Owed: the '2026 trajectory corpora' figures (about a quarter of failed runs fabricate success, ~23%, ~3%) name no source; cite them or mark them unsourced."
    },
    "techniques/amortized-compaction-cadence.md": {
      "disposition": "clarify",
      "reason": "Schedules, the reclaim-size gate and the operator-turn exemption stand. Owed, from the 2026-09-23 banked lead: pass counters must split by outcome. The python application shows a single total over absorbed, failed and skipped passes making a skipping session look healthy. Not applied here because it adds a rule rather than correcting one."
    },
    "techniques/compaction-horizon-breakeven.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: read-price count corrected to most at a tenth, two at a twentieth, two at a fortieth (dated 2026-10-31); the 272K step now stated as primary-sourced (input doubles above 272K) and the first provider’s 100K-banded model added as evidence that steps move per model."
    },
    "techniques/speculative-compaction-splice.md": {
      "disposition": "keep",
      "reason": "Internally sound; derived margin and the losing-speculation fallback are stated. Still has no application (single-stack debt from the note)."
    },
    "techniques/deferred-interface-invalidation.md": {
      "disposition": "keep",
      "reason": "Defer-by-default with the compaction exemption and immediate revocation is coherent and checkable."
    },
    "techniques/endpoint-sealed-continuation-metadata.md": {
      "disposition": "keep",
      "reason": "Segment-level replay, strict endpoint equality and demotion-not-deletion stand, corroborated by the node application."
    },
    "techniques/elision-to-a-refetch-pointer.md": {
      "disposition": "keep",
      "reason": "Material classes, decorator siting and the recomputability caveat stand. The 2026-09 first-party account it quotes was not re-located this run; it is labelled n=1 and dated, so nothing hangs on it beyond illustration."
    },
    "techniques/compression-hardens-deferred-decisions.md": {
      "disposition": "keep",
      "reason": "Hedge-as-deferral and test-before-shrink stand; the field instance is told without a source but carries no number the rules depend on."
    },
    "techniques/recovery-path-as-loss-signal.md": {
      "disposition": "keep",
      "reason": "Recovery family, measurement boundary and the two-sided reading stand; the rust application reproduces the mechanism."
    },
    "techniques/consumer-coupled-decoration.md": {
      "disposition": "keep",
      "reason": "Audit, silent expiry and purity ordering stand. The ~5%/~3% account was not re-located this run; it is already scoped as n=1, one harness."
    },
    "techniques/context-ownership-regimes.md": {
      "disposition": "keep",
      "reason": "Three-regime table, exclusive ownership and per-request resolution stand; matches the neovim tree."
    },
    "techniques/live-attachment-delta-resharing.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: above six stable blocks now reads above four of the six stable blocks, matching the rust application’s third-of-eight order."
    },
    "techniques/foreign-harness-history-folding.md": {
      "disposition": "keep",
      "reason": "Paired table is consistent (10/10 vs 0/10 arms); the reviewer case is scoped by the falsifying seam."
    },
    "techniques/fold-only-acknowledged-evidence.md": {
      "disposition": "keep",
      "reason": "Capture/acknowledge split, protected set and typed unfit error stand, witnessed by the python application tests."
    },
    "techniques/summary-evidence-gate.md": {
      "disposition": "keep",
      "reason": "Local fail-closed parse, model-free checks and their stated limits stand; quote-only form matches the node application."
    },
    "techniques/pinned-prompt-clock.md": {
      "disposition": "keep",
      "reason": "Freeze, tail notice, refresh-at-checkpoint and probe purity stand, with a reference realization."
    },
    "techniques/compaction-target-is-an-aim.md": {
      "disposition": "keep",
      "reason": "Figures (91%/41% to 0%/2%, +7%; 13.3 to 26.4; four of five) match the reproduced sweep."
    },
    "techniques/compaction-is-a-fixed-point.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: leak 1 now defines the truncation as an N-line cap split between head and tail, so the N+1 arithmetic holds."
    },
    "techniques/cache-affinity-key-from-the-unrewritable-layer.md": {
      "disposition": "keep",
      "reason": "Verified against the provider guide this run: about 15 requests per minute per key, cached state on individual machines, accounting/probing reasons, and automatic routing on its newest models."
    },
    "applications/claude-code--compaction-horizon-breakeven.md": {
      "disposition": "reverify",
      "reason": "Arithmetic is consistent. The 0.05x read price and the start-of-request lifetime match the provider's pages this run. The private replay and the plugin were not re-run."
    },
    "applications/claude-code--elision-to-a-refetch-pointer.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (175/208 = 84%; 870k/1,187k = 73%). The one-machine transcript replay was not re-run."
    },
    "applications/neovim--context-ownership-regimes.md": {
      "disposition": "reverify",
      "reason": "Anchors at f73f40e9 not reopened; the doc-vs-code contradiction is recorded with the code winning."
    },
    "applications/neovim--history-compaction.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened; the summary-of-summary and no-reactive-path deviations are stated."
    },
    "applications/neovim--live-attachment-delta-resharing.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened."
    },
    "applications/node--compaction-horizon-breakeven.md": {
      "disposition": "reverify",
      "reason": "SoL-Pi anchors at 2b791687 and the 166-session replay not re-run."
    },
    "applications/node--elision-to-a-refetch-pointer.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened; the blog figures are quoted as the source reports them."
    },
    "applications/node--endpoint-sealed-continuation-metadata.md": {
      "disposition": "reverify",
      "reason": "Clone at f4fce64a not reopened."
    },
    "applications/node--foreign-harness-history-folding--tencentdb.md": {
      "disposition": "reverify",
      "reason": "Traced path at 37b16296 not reopened; already unmeasurable."
    },
    "applications/node--foreign-harness-history-folding.md": {
      "disposition": "reverify",
      "reason": "Cline tree at 6e8bea1c not reopened."
    },
    "applications/node--history-compaction--pilotdeck.md": {
      "disposition": "reverify",
      "reason": "Executed findings at ae87280a not re-run."
    },
    "applications/node--history-compaction.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened."
    },
    "applications/node--pinned-prompt-clock.md": {
      "disposition": "reverify",
      "reason": "Anchors at ae87280a not reopened; test was read, never executed."
    },
    "applications/node--summary-evidence-gate--pilotdeck.md": {
      "disposition": "reverify",
      "reason": "Executed findings not re-run."
    },
    "applications/node--summary-evidence-gate.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened."
    },
    "applications/node--tiered-history-projection.md": {
      "disposition": "reverify",
      "reason": "Private tree at 0e1f0b30 not reopened."
    },
    "applications/python--amortized-compaction-cadence.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the two section citations of the old docs/micro-compaction.md path now cite the first-party doc named in the header. Tree not reopened; refresh_by 2026-11-05 still open."
    },
    "applications/python--fold-only-acknowledged-evidence.md": {
      "disposition": "reverify",
      "reason": "QwenPaw anchors at cbf1a403 not reopened."
    },
    "applications/python--summary-evidence-gate.md": {
      "disposition": "reverify",
      "reason": "QwenPaw anchors not reopened."
    },
    "applications/rust--cache-affinity-key-from-the-unrewritable-layer--yoagent.md": {
      "disposition": "reverify",
      "reason": "The provider-guidance claims were re-verified this run. The crate anchors at 2428f68d were not reopened."
    },
    "applications/rust--compaction-is-a-fixed-point--yoagent.md": {
      "disposition": "reverify",
      "reason": "Replay numbers are the tree's own and were never re-run."
    },
    "applications/rust--compaction-target-is-an-aim--yoagent.md": {
      "disposition": "clarify",
      "reason": "The table reports '43 marker-only per run', while the technique and the note quote the same figure as '43 marker-only compactions per 100 requests'. One unit is wrong. Owed: fix it from the sweep's output. Not applied, because the sweep was not re-run."
    },
    "applications/rust--compression-hardens-deferred-decisions.md": {
      "disposition": "reverify",
      "reason": "Simulation over a recorded baseline; the bench was never run for arm B."
    },
    "applications/rust--consumer-coupled-decoration.md": {
      "disposition": "reverify",
      "reason": "Byte tables come from a reimplementation; the tree was not reopened."
    },
    "applications/rust--context-budgeting.md": {
      "disposition": "reverify",
      "reason": "No verified_against; private anchors not reopened."
    },
    "applications/rust--context-ownership-regimes.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened."
    },
    "applications/rust--elision-to-a-refetch-pointer.md": {
      "disposition": "reverify",
      "reason": "All table arithmetic was recomputed and is consistent (52.6%, 1.0/5.2/9.4% overshoot, 4.7x). Tree not reopened."
    },
    "applications/rust--foreign-harness-history-folding.md": {
      "disposition": "reverify",
      "reason": "Private tree at cf54b904b and the local model runs not reopened."
    },
    "applications/rust--layered-composition.md": {
      "disposition": "clarify",
      "reason": "The listed order opens with '## Triggering Event' (per-call input) before Identity. The next sentence then says 'Identity/instructions lead; per-call input trails', which the list contradicts. Owed: re-read the assembler and either correct the order or record the triggering event as a deviation from the gradient. Not applied, because the private source was not reopened."
    },
    "applications/rust--live-attachment-delta-resharing.md": {
      "disposition": "reverify",
      "reason": "Table sums were recomputed: 11,708,577 total, 1,662,815 changed, 14.2%, and 1.66M stable below the digest. Ledger not re-read."
    },
    "applications/rust--pinned-prompt-clock--personas.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened."
    },
    "applications/rust--recovery-path-as-loss-signal.md": {
      "disposition": "reverify",
      "reason": "Break-even table recomputed (1,208 B per recovery; 135 of 200; 138.0%). Tree not reopened."
    },
    "applications/rust--response-reservation-sizing.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (16,000/4,096 = 3.91; 72 vs 18 cases at 220 tokens). Tree at 07fa255c not reopened."
    },
    "applications/rust--task-envelope.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened; effect unmeasured, as it says."
    }
  }
}
```

## Architecture review - 2026-10-31 (re-verification)

This record follows a re-verification of the seven applications whose project trees are checked out here. rust--layered-composition's clarify item is applied. rust--compression-hardens-deferred-decisions keeps `better` on weaker evidence than it claimed. Six verification dates moved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/prompt-assembly",
  "date": "2026-10-31",
  "baseline": "6e9ae5cbb",
  "digest": "sha256-b2:692eedef190ea8d3",
  "disposition": "clarify",
  "coverage": "Third record of the day. It follows a re-verification pass over the seven applications whose project trees are checked out here: one against kp at 936588503, six against personas at 61029d7ae0. Each was checked at its pinned date and at HEAD, edited in place for moved anchors, and given a dated note where a construct changed or a claim was wrong. Six had verified_on moved. live-attachment-delta-resharing did not, because its ledger is machine-local. Every other document is byte-unchanged and carries its second-record disposition. Clarify still owed: techniques context-budgeting, task-envelope and amortized-compaction-cadence, and the yoagent compaction-target application.",
  "counterexamples": [
    "A prefix cache that reads at 0.025x makes a cached standing layer about four times cheaper to keep than the tenth-of-base rule of thumb implies, so a break-even computed at 0.1x overstates the case for compressing it.",
    "A provider that bills its current generation flat across a million tokens can band a cheaper model of the same generation above 100K; a step read from one model is wrong for its sibling.",
    "A compactor that keeps the first and last N lines and adds a marker emits 2N+1 lines, so even a correctly charged marker needs the cap defined as total lines, or the second pass still changes bytes.",
    "A block placed third of eight can rebuild at most five blocks below it; a claim that it invalidates six stable blocks cannot be literal."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2311.10054",
      "result": "Supports task-envelope: '162 roles', '4 popular families of LLMs and 2,410 factual questions', adding personas 'does not improve model performance', automatic best-persona selection 'often performing no better than random selection'."
    },
    {
      "url": "https://developers.openai.com/api/docs/guides/prompt-caching",
      "result": "Supports cache-affinity-key: 'Cached states live on individual machines, where traffic above 15 requests per minute can lead to overflow routing'; separate keys for cached-token accounting and to 'prevent cache-hit probing across customers'; 'On GPT-5.6 and later, OpenAI handles cache routing automatically; the key is not needed'."
    },
    {
      "url": "https://developers.openai.com/api/docs/pricing",
      "result": "Supports the 272K step: 'Long context: >272K input tokens', with listed long-context input at twice standard (e.g. 5.00 to 10.00 per 1M) for several models."
    },
    {
      "url": "https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching",
      "result": "Writes 1.25x (5 min) and 2x (1 h); reads 'standard 0.1x', 0.05x on two models and 0.025x on two. 'The lifetime is measured from the start of the request that writes or reads the cache entry, not from the end of its response.' Supports the clock rule. Refutes compaction-horizon-breakeven's count of one model at a twentieth."
    },
    {
      "url": "https://platform.claude.com/docs/en/about-claude/pricing",
      "result": "'Claude 4.6 and later models (except Claude Haiku 5.5) ... include the full 1M token context window at standard pricing'; Haiku 5.5 'is priced by prompt length' above 100,000 tokens. Supports the flat-book claim and the per-model step rule."
    },
    {
      "source": "Web search for the 2026-09 first-party coding-agent account (decoration removal ~5%, conservative compressor)",
      "result": "Not located. Claims quoting it stay as written, already labelled n=1; not refreshed."
    },
    {
      "source": "kp tree at 936588503 and at e44f69b9a (2026-09-05)",
      "result": "Supports node--history-compaction: intake-transcript.ts:14-43, intake-run.ts:47-56, voice-turn route :12 (4,000 chars), voice-complete :15/:64, pipeline/jobfit/intake.py MAX_TRANSCRIPT_TURNS = 48."
    },
    {
      "source": "personas tree at 61029d7ae0 and at the pinned dates (24c9ecb058, f3738dfbea, a3452abf8f, f921b4a0b9)",
      "result": "Anchors re-pointed after the prompt.rs and prompt/mod.rs splits. Found: research-lab plugin removed 2026-09-15; clarify-bench RESULT.md second arm present since 2026-07-10; warm-session stable/dynamic split and chat-family core since 2026-09-17; Rule 26 review/memory change 2026-10-20; bench report removed 2026-09-05."
    }
  ],
  "documents": {
    "prompt-assembly.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the two missing bullets to The techniques (pinned-prompt-clock after fingerprinting-and-cache-keys; compression-hardens-deferred-decisions after consumer-coupled-decoration); all 32 frontmatter techniques are now linked."
    },
    "techniques/layered-composition.md": {
      "disposition": "keep",
      "reason": "Owned sections, one door per family and the sealed-door clause stand. The proxy section's two poles agree with its own numbers (17.5k read over ~890k written is about 0.02)."
    },
    "techniques/variable-interpolation.md": {
      "disposition": "keep",
      "reason": "Declared, classified variables and the three honest missing-input outcomes are sound and stable."
    },
    "techniques/house-vocabulary-layer.md": {
      "disposition": "keep",
      "reason": "Argument is internal and stable; floor classification is consistent with context-reachability."
    },
    "techniques/context-reachability.md": {
      "disposition": "keep",
      "reason": "Classification, freshness corollary and A/B-against-absence check stand. Open lead (feeders do not yet declare their class) belongs to the feeder subjects."
    },
    "techniques/context-budgeting.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31 in part: the cache-read sentence now says the read price is set per model and is less than a tenth on some. Still owed: the two-thousand-uncached-inclusions scale anchor names no source; cite it or drop it."
    },
    "techniques/response-reservation-sizing.md": {
      "disposition": "keep",
      "reason": "Purchase-not-limit framing, derive-and-escalate and the zero-cost precondition stand; the precondition was confirmed by its own application."
    },
    "techniques/history-compaction.md": {
      "disposition": "keep",
      "reason": "Pairing, resume and size invariants, both compaction paths and the once-per-turn guard hold. The 0.65/0.85 pair and the provider-anchored count match the neovim application."
    },
    "techniques/tiered-history-projection.md": {
      "disposition": "keep",
      "reason": "Coverage arithmetic (R + F log_F N; lifetime N/(F-1) calls) is correct, and the two adoption gates are stated."
    },
    "techniques/capability-documentation.md": {
      "disposition": "keep",
      "reason": "Registry-derived rendering, doctrine sync and active-set fingerprinting stand."
    },
    "techniques/contributed-document-admission.md": {
      "disposition": "keep",
      "reason": "Index-not-body, declaration-is-not-grant, nothing executed, location identity and visible invalid entries are a coherent contract."
    },
    "techniques/fingerprinting-and-cache-keys.md": {
      "disposition": "keep",
      "reason": "Determinism, digest boundary, gate-sees-target and the send-site ledger stand."
    },
    "techniques/cache-breakpoint-allocation.md": {
      "disposition": "keep",
      "reason": "Cadence-boundary allocation and the variability-within-lifetime rule hold; the hit-rate predicate caveat is consistent with compaction-is-a-fixed-point."
    },
    "techniques/continuation-prompts.md": {
      "disposition": "keep",
      "reason": "Two regimes, carry-decided/re-derive-observable and staleness checks stand."
    },
    "techniques/task-envelope.md": {
      "disposition": "clarify",
      "reason": "Persona study verified this run (162 roles, 2,410 factual questions, 4 model families, no gain, best-persona selection near random). Owed: the '2026 trajectory corpora' figures (about a quarter of failed runs fabricate success, ~23%, ~3%) name no source; cite them or mark them unsourced."
    },
    "techniques/amortized-compaction-cadence.md": {
      "disposition": "clarify",
      "reason": "Schedules, the reclaim-size gate and the operator-turn exemption stand. Owed, from the 2026-09-23 banked lead: pass counters must split by outcome. The python application shows a single total over absorbed, failed and skipped passes making a skipping session look healthy. Not applied here because it adds a rule rather than correcting one."
    },
    "techniques/compaction-horizon-breakeven.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: read-price count corrected to most at a tenth, two at a twentieth, two at a fortieth (dated 2026-10-31); the 272K step now stated as primary-sourced (input doubles above 272K) and the first provider’s 100K-banded model added as evidence that steps move per model."
    },
    "techniques/speculative-compaction-splice.md": {
      "disposition": "keep",
      "reason": "Internally sound; derived margin and the losing-speculation fallback are stated. Still has no application (single-stack debt from the note)."
    },
    "techniques/deferred-interface-invalidation.md": {
      "disposition": "keep",
      "reason": "Defer-by-default with the compaction exemption and immediate revocation is coherent and checkable."
    },
    "techniques/endpoint-sealed-continuation-metadata.md": {
      "disposition": "keep",
      "reason": "Segment-level replay, strict endpoint equality and demotion-not-deletion stand, corroborated by the node application."
    },
    "techniques/elision-to-a-refetch-pointer.md": {
      "disposition": "keep",
      "reason": "Material classes, decorator siting and the recomputability caveat stand. The 2026-09 first-party account it quotes was not re-located this run; it is labelled n=1 and dated, so nothing hangs on it beyond illustration."
    },
    "techniques/compression-hardens-deferred-decisions.md": {
      "disposition": "keep",
      "reason": "Hedge-as-deferral and test-before-shrink stand; the field instance is told without a source but carries no number the rules depend on."
    },
    "techniques/recovery-path-as-loss-signal.md": {
      "disposition": "keep",
      "reason": "Recovery family, measurement boundary and the two-sided reading stand; the rust application reproduces the mechanism."
    },
    "techniques/consumer-coupled-decoration.md": {
      "disposition": "keep",
      "reason": "Audit, silent expiry and purity ordering stand. The ~5%/~3% account was not re-located this run; it is already scoped as n=1, one harness."
    },
    "techniques/context-ownership-regimes.md": {
      "disposition": "keep",
      "reason": "Three-regime table, exclusive ownership and per-request resolution stand; matches the neovim tree."
    },
    "techniques/live-attachment-delta-resharing.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: above six stable blocks now reads above four of the six stable blocks, matching the rust application’s third-of-eight order."
    },
    "techniques/foreign-harness-history-folding.md": {
      "disposition": "keep",
      "reason": "Paired table is consistent (10/10 vs 0/10 arms); the reviewer case is scoped by the falsifying seam."
    },
    "techniques/fold-only-acknowledged-evidence.md": {
      "disposition": "keep",
      "reason": "Capture/acknowledge split, protected set and typed unfit error stand, witnessed by the python application tests."
    },
    "techniques/summary-evidence-gate.md": {
      "disposition": "keep",
      "reason": "Local fail-closed parse, model-free checks and their stated limits stand; quote-only form matches the node application."
    },
    "techniques/pinned-prompt-clock.md": {
      "disposition": "keep",
      "reason": "Freeze, tail notice, refresh-at-checkpoint and probe purity stand, with a reference realization."
    },
    "techniques/compaction-target-is-an-aim.md": {
      "disposition": "keep",
      "reason": "Figures (91%/41% to 0%/2%, +7%; 13.3 to 26.4; four of five) match the reproduced sweep."
    },
    "techniques/compaction-is-a-fixed-point.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: leak 1 now defines the truncation as an N-line cap split between head and tail, so the N+1 arithmetic holds."
    },
    "techniques/cache-affinity-key-from-the-unrewritable-layer.md": {
      "disposition": "keep",
      "reason": "Verified against the provider guide this run: about 15 requests per minute per key, cached state on individual machines, accounting/probing reasons, and automatic routing on its newest models."
    },
    "applications/claude-code--compaction-horizon-breakeven.md": {
      "disposition": "reverify",
      "reason": "Arithmetic is consistent. The 0.05x read price and the start-of-request lifetime match the provider's pages this run. The private replay and the plugin were not re-run."
    },
    "applications/claude-code--elision-to-a-refetch-pointer.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (175/208 = 84%; 870k/1,187k = 73%). The one-machine transcript replay was not re-run."
    },
    "applications/neovim--context-ownership-regimes.md": {
      "disposition": "reverify",
      "reason": "Anchors at f73f40e9 not reopened; the doc-vs-code contradiction is recorded with the code winning."
    },
    "applications/neovim--history-compaction.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened; the summary-of-summary and no-reactive-path deviations are stated."
    },
    "applications/neovim--live-attachment-delta-resharing.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened."
    },
    "applications/node--compaction-horizon-breakeven.md": {
      "disposition": "reverify",
      "reason": "SoL-Pi anchors at 2b791687 and the 166-session replay not re-run."
    },
    "applications/node--elision-to-a-refetch-pointer.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened; the blog figures are quoted as the source reports them."
    },
    "applications/node--endpoint-sealed-continuation-metadata.md": {
      "disposition": "reverify",
      "reason": "Clone at f4fce64a not reopened."
    },
    "applications/node--foreign-harness-history-folding--tencentdb.md": {
      "disposition": "reverify",
      "reason": "Traced path at 37b16296 not reopened; already unmeasurable."
    },
    "applications/node--foreign-harness-history-folding.md": {
      "disposition": "reverify",
      "reason": "Cline tree at 6e8bea1c not reopened."
    },
    "applications/node--history-compaction--pilotdeck.md": {
      "disposition": "reverify",
      "reason": "Executed findings at ae87280a not re-run."
    },
    "applications/node--history-compaction.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at kp@936588503 and at the 2026-09-05 tree: cap 48 equal to the engine window, 4,000-char utterance bound, turn-less periodic extraction, Node 24 pin. Three anchors tightened; a dated note adds that attachment bodies reach only the extraction sweep. Verdict not-better holds; verified_on moved."
    },
    "applications/node--pinned-prompt-clock.md": {
      "disposition": "reverify",
      "reason": "Anchors at ae87280a not reopened; test was read, never executed."
    },
    "applications/node--summary-evidence-gate--pilotdeck.md": {
      "disposition": "reverify",
      "reason": "Executed findings not re-run."
    },
    "applications/node--summary-evidence-gate.md": {
      "disposition": "reverify",
      "reason": "Anchors not reopened."
    },
    "applications/node--tiered-history-projection.md": {
      "disposition": "reverify",
      "reason": "Private tree at 0e1f0b30 not reopened."
    },
    "applications/python--amortized-compaction-cadence.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the two section citations of the old docs/micro-compaction.md path now cite the first-party doc named in the header. Tree not reopened; refresh_by 2026-11-05 still open."
    },
    "applications/python--fold-only-acknowledged-evidence.md": {
      "disposition": "reverify",
      "reason": "QwenPaw anchors at cbf1a403 not reopened."
    },
    "applications/python--summary-evidence-gate.md": {
      "disposition": "reverify",
      "reason": "QwenPaw anchors not reopened."
    },
    "applications/rust--cache-affinity-key-from-the-unrewritable-layer--yoagent.md": {
      "disposition": "reverify",
      "reason": "The provider-guidance claims were re-verified this run. The crate anchors at 2428f68d were not reopened."
    },
    "applications/rust--compaction-is-a-fixed-point--yoagent.md": {
      "disposition": "reverify",
      "reason": "Replay numbers are the tree's own and were never re-run."
    },
    "applications/rust--compaction-target-is-an-aim--yoagent.md": {
      "disposition": "clarify",
      "reason": "The table reports '43 marker-only per run', while the technique and the note quote the same figure as '43 marker-only compactions per 100 requests'. One unit is wrong. Owed: fix it from the sweep's output. Not applied, because the sweep was not re-run."
    },
    "applications/rust--compression-hardens-deferred-decisions.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at personas@61029d7ae0. Bench quotes, BASELINE figures and Rules 16/25/26 hold; Cargo anchor re-pointed. Dated note records RESULT.md (present at the pinned tree) as a measured but confounded second arm, 0.48 to 0.85, behind a non-default flag, and the 2026-10-20 Rule 26 change that adds review/memory asks. The \"only A measured\" sentence now points at the note. Verdict better kept as weaker evidence; verified_on moved."
    },
    "applications/rust--consumer-coupled-decoration.md": {
      "disposition": "reverify",
      "reason": "Byte tables come from a reimplementation; the tree was not reopened."
    },
    "applications/rust--context-budgeting.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at personas@61029d7ae0: every anchor re-pointed after the 2026-08-22 prompt.rs split, and constants and quotes are unchanged. Dated note: the research-lab frontend instance was removed 2026-09-15; recall synthesis is ml-gated; the runner appends persist. verified_on moved and verified_against rust@1.96 added."
    },
    "applications/rust--context-ownership-regimes.md": {
      "disposition": "reverify",
      "reason": "Private tree not reopened."
    },
    "applications/rust--elision-to-a-refetch-pointer.md": {
      "disposition": "reverify",
      "reason": "All table arithmetic was recomputed and is consistent (52.6%, 1.0/5.2/9.4% overshoot, 4.7x). Tree not reopened."
    },
    "applications/rust--foreign-harness-history-folding.md": {
      "disposition": "reverify",
      "reason": "Private tree at cf54b904b and the local model runs not reopened."
    },
    "applications/rust--layered-composition.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the assembler was re-read at personas@61029d7ae0 and at the 2026-08-18 tree. The section list was literal, so the gradient sentence was corrected and a dated note records the per-call Correction Required and Triggering Event blocks ahead of identity as a deviation. It also records the Manifest and Responsibilities layers. Anchors re-pointed; verified_on moved."
    },
    "applications/rust--live-attachment-delta-resharing.md": {
      "disposition": "reverify",
      "reason": "Tree re-verified 2026-10-31 at personas@61029d7ae0: anchors re-pointed, and the dated note records the 2026-09-17 warm-session stable/dynamic split and the chat-family core. Together they supersede the filed reorder for MAIN user turns. The ledger replay is machine-local and was not re-read, so verified_on was not moved."
    },
    "applications/rust--pinned-prompt-clock--personas.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at personas@61029d7ae0: the three quoted lines are unchanged, and anchors re-pointed. No template uses now, iso8601 or today outside tests and docs. Verdict unmeasurable holds; verified_on moved."
    },
    "applications/rust--recovery-path-as-loss-signal.md": {
      "disposition": "reverify",
      "reason": "Break-even table recomputed (1,208 B per recovery; 135 of 200; 138.0%). Tree not reopened."
    },
    "applications/rust--response-reservation-sizing.md": {
      "disposition": "reverify",
      "reason": "Arithmetic checks (16,000/4,096 = 3.91; 72 vs 18 cases at 220 tokens). Tree at 07fa255c not reopened."
    },
    "applications/rust--task-envelope.md": {
      "disposition": "keep",
      "reason": "Re-verified 2026-10-31 at personas@61029d7ae0: all four prompts, identity lines and both added check lines (with assertions) are present; anchors re-pointed. The bench report path left the tree on 2026-09-05, as the dated note says. Effect still unmeasured, as stated; verified_on moved."
    }
  }
}
```
