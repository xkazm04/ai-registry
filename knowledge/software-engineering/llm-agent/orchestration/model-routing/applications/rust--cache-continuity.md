---
layer: application
type: application
subject: model-routing
technique: cache-continuity
stack: rust
verified_on: 2026-08-25
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
