---
layer: application
type: application
subject: model-routing
technique: cache-continuity
stack: rust
verified_on: 2026-11-16
verified_against: rust@1.96
---

# Cache continuity by construction: routing per prompt family (companion, Rust)

A desktop companion routes its model calls through one table,
`src-tauri/src/companion/model_routing.rs`: `MAIN` (frontier tier, low
effort) for conversational turns, `ASIDE` (mid tier, medium effort) for
status summaries and overnight guidance, `MICRO` (mid tier, low effort)
for titling, classification and triage legs. The table was calibrated by a
1,026-turn bench and every tier's comment cites the measurement that set
it — the subject's "route by class" stance, fully realized.

What the tree proves about *this* technique is stronger than an
instance: it shows the failure the technique names is **impossible by
construction** here, for a reason the authors did not have in mind.

## The structural fact

The three tiers are never applied to the same context. Each cheap tier
serves calls that have their **own prompt family**: `athena_reaction.rs`
`cli_text*` legs (`:328`, `:374`) build a small purpose-built prompt and
run it on `MICRO`; `night_shift/unattended.rs` (`:160`) and
`brain/briefing.rs` (`:173`) build one-shot prompts and run them on
`ASIDE`. The main conversation, resumed with `--resume <session>` in
`session/cli.rs` (`:70`), is pinned to `MAIN` — the model flag is
`companion_turn_model()` on chat turns and the canonical constant on
build turns (`:110-117`), and nothing on the resume path can change it.

So the conversation's cached prefix is only ever re-read by the model that
wrote it, and the cheap tiers only ever read prompts of a few hundred
tokens they wrote themselves. That is the technique's first rule — route
by class where the class has its own family; never swap the model under a
shared context — enforced by the shape of the code rather than by a rule
anyone wrote.

The comment on `MICRO` gives the tree's *own* reason for the separation,
and it is a quality reason, not a cost one: the micro tier "deliberately
receives NO constitution/act-doctrine: reinforcement at low effort
regressed awareness 94→78%". The authors kept the small model away from
the big prompt because the big prompt made the small model worse. The
cache arithmetic says the same design is also the cheap one — a
convergence from two directions that is better evidence for the technique
than either alone.

## What the tree does not track

- **Turn warmth.** The technique's horizon rule (past the cache lifetime,
  the incumbent's advantage is gone) needs the time since the last turn.
  `turn_ledger.rs` records per-turn prompt sizes and block hashes but the
  routing path does not read the previous turn's timestamp; the companion
  assumes warm, which the technique names as the safe default (a wrong
  "warm" costs nothing, a wrong "cold" costs the 1.25× write).
- **Cache-key changes as routing events.** `--effort` is passed on every
  turn from the tier constant or an env override (`cli.rs:127-142`); a
  bench run that changes `PERSONAS_ATHENA_EFFORT` mid-conversation
  invalidates the system-level prefix on the next turn, and the ledger
  would show a token spike with no cause recorded. The decision record
  the subject asks for would carry "prefix invalidated by effort change";
  this one does not.
- **The bench measured accuracy and latency, not cache cost.** The report
  that calibrated the tiers (`docs/plans/athena-model-bench-report.md`)
  ranks by correctness and p50/p90; a tier's cached-vs-uncached cost per
  turn is not among its columns. The tree's routing is cache-safe by
  structure, and the structure was chosen for other reasons — which is
  exactly why the technique should be written down where the next
  refactor can read it before it "simplifies" the three families into
  one.

## Re-read at `8d076db46a`, 2026-11-16

Re-checked read-only against the project's checkout at `8d076db46a`
(2026-11-08), toolchain pinned at 1.96.1. **The structural fact holds:**
every cheap tier still serves its own prompt family. The table under it
moved, and the arithmetic moved with it.

- **The tiers.** `MAIN` moved from the frontier tier to the mid tier at
  low effort on 2026-09-29, on the operator's decision. `MICRO` moved to
  the small tier at low effort on 2026-10-08, after a one-shot bench put it
  level with the mid tier on naming, extraction and JSON at about 95% lower
  cost. A fourth tier, `TRIAGE` (mid tier, low effort), took the verdict
  legs, because the small tier scored 92% against 100% on hard triage
  (`companion/model_routing.rs:25-77`). The micro legs are now
  `cli_text_with_usage` / `cli_text_tracked` /
  `cli_text_tracked_on` (`athena_reaction.rs:336,414,431`). The aside legs
  are at `night_shift/unattended.rs:298,324` and `brain/briefing.rs:174`.
  The cited bench report is no longer at `docs/plans/`; its successors are
  `docs/tests/model-bench/` and `scripts/test/*-model-bench.mjs`.
- **The cost argument no longer carries the separation on its own.** At the
  vendor sheet read 2026-11-16, the small tier costs a twentieth of the mid
  tier for prompts under 100k. The mid tier's cache read is 0.05×, which
  puts its *r/w* at 0.04. A mid-to-small swap under the main conversation is
  now close to break-even on the prefix alone, and cheaper once the turn
  produces any output. So the separation now rests on the tree's quality
  reasons: 94 → 78% awareness under the big prompt at low effort, and
  memory-write proposals at 0/3. These are the measured reasons
  [cache-continuity](../techniques/cache-continuity.md) now asks a pin to
  carry.
- **Warmth is now tracked, and it outlives the cache.** One long-lived
  process per conversation now serves MAIN turns (`session/warm.rs`, from
  2026-09-24). Per-turn context moved into the user message so the prefix
  stays byte-identical. The idle reaper kills a process after 20 minutes
  (:87), four times the vendor's default 5-minute cache lifetime. A turn that
  arrives after 5 to 20 idle minutes skips the process start but still
  pays the prefix write.
- **Defect, read and not run: a tier change does not reach a live
  conversation, and the ledger says it did.** `acquire` reuses a warm
  process when it is alive, has the same prefix hash and is on the same
  session (`session/warm.rs:509-519`). It does not compare the model or
  the effort the process was spawned with. Saving the tier table
  (`commands/companion/engine.rs:25-31`) does not kill warm sessions. The
  ledger row records "the model the spawn actually used — one source with
  the `--model` flag" from the tier resolved for *this* turn
  (`session/turn.rs:731-734`). After an operator changes the MAIN model or
  effort, an active conversation keeps the old model until it idles 20
  minutes or its prefix changes, and every row in the meantime names the
  new one. This keeps the cache warm by accident and breaks the
  served-versus-selected record the golden path requires. Fix: carry the
  launch's model and effort on `WarmProcess` and respawn on a mismatch.
