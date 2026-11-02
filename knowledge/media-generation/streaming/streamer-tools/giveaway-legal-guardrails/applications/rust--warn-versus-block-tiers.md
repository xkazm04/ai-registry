---
layer: application
type: application
subject: giveaway-legal-guardrails
technique: warn-versus-block-tiers
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97
---

# Warn and block tiers in a Rust streamer desktop core (CastleControl)

CastleControl is a desktop tool a human streamer runs beside a Twitch stream; its "Lots"
feature runs on-air draws, some of them prize giveaways. Citations were resolved against the
main checkout on 2026-11-02 (no `.claude/worktrees/*` copy was read); the workspace pins
`rust-version = "1.97"` (`Cargo.toml:8`). The project's own release checklist marks the
guardrails as code, not clearance: `docs/submission/checklist.md:86` "offline policy code is
not legal sign-off". This application describes product behaviour, not legal advice.

## Where the tiers live

The classifier is one pure function over the whole configuration,
`crates/cc-lots/src/policy.rs:91` `pub fn check_draw(policy: &DrawPolicy) -> DrawCheck`,
"independent of storage, clocks and previous checks" (`:90`). It reads every flag in one pass
and accumulates all reasons (`:96-119`), so the streamer sees every finding at once. A draw
with no prize short-circuits to no findings at all — `crates/cc-lots/src/policy.rs:92` "if policy.content !=
DrawContent::Prize" — which is the subject's "friction only where a prize is at stake",
confirmed; the README says it in product words: `crates/cc-lots/README.md:48` "Question,
idea and seat draws have no giveaway-policy friction."

The tier of each reason is decided in one place, `crates/cc-lots/src/policy.rs:65-68` `fn blocks`: the three
reasons that map to a `DrawRiskSetting` (paid entry, paid weight, prize over cap) plus
`MissingRules | MissingDisclaimer` block; everything else warns. The design table is
`docs/plan/01-analysis.md:113` "Setting on a prize draw", rows `:115-119`, with the rationale
at `:213` "Prize plus chance plus consideration makes an illegal lottery".

| Finding | Tier in the code | Standard's tier |
|---|---|---|
| Paid entry, paid weight (`crates/cc-lots/src/policy.rs:97-98`) | block, but acknowledgeable through `unlock` (`:160-171`) | block, not acknowledgeable |
| Prize over 500,000 cents without registration (`:99-102`) | block, cleared only by `confirm_registration` (`:175-189`) | fact-confirmation hold |
| Missing rules, missing disclaimer (`:113-114`) | block, not overridable (README `:58` "Rules/disclaimer blocks cannot be overridden") | block |
| Subscriber-only (`:103`) | warn | block unless an equal free route exists |
| Points without a free equal-odds path (`:104-107`) | warn | warn (contested consideration) |
| Missing age or region (`:108-112`) | warn, does not hold the seal | hold until answered |

## Confirmed

- **Refusal is enforced at the seal, not just shown.** `crates/cc-lots/src/draw.rs:91`
  "if draw.check().result == CheckResult::Blocked" refuses to seal; the core repeats the check
  at its own door, `crates/cc-core/src/lots/lifecycle.rs:16` "if
  convert::check(&draw.policy).result == CheckResult::Blocked", returning a typed
  `BlockedByPolicy` error.
- **Fact-confirmation is its own verb.** `crates/cc-lots/src/policy.rs:167-168` refuses a general unlock of the
  over-cap finding: "confirm registration for over-cap prizes".
- **Audit before effect, no stockpiling, no duplicates.** `crates/cc-lots/src/policy.rs:208-216` appends
  `LedgerEvent::DrawRiskAcknowledged` before pushing the acknowledgement; `:201-206` refuses
  "setting is not blocked on this draw"; `:198-199` returns `Ok(false)` on a repeat. The
  README states the failure path: `crates/cc-lots/README.md:53` "through
  `Store::append_ledger` **before** changing state".
- **Reconfiguration voids consent.** `crates/cc-lots/src/policy.rs:123-124` "Reconfiguration constructs a fresh
  value, so a previous acknowledgement cannot unlock changed settings", tested in
  `crates/cc-lots/tests/policy.rs:205` `unrelated_unlock_is_refused_and_configuration_changes_reset_consent`.
- **Integer cents, boundary pinned by a test.** `crates/cc-lots/src/policy.rs:5` "Amounts use integer USD cents,
  never floating point"; `crates/cc-lots/tests/policy.rs:24` `over_5000_usd_requires_registration_and_boundary_is_exact`.
- **Every block offers the no-prize exit and a fix, never an override.** The guided setup in
  `apps/desktop/src/rooms/lottery/flow-steps.ts:96` "This is blocked: on a prize draw, money may
  never buy entry or better odds. How shall we fix it?" offers only removal or `:43` "Make it a
  no-prize draw"; the registration step pairs the confirmation with `:107` "Lower it to $5,000".

## Deviations (the standard stays)

1. **A paid-entry lottery is acknowledgeable in the domain layer.** `crates/cc-lots/src/policy.rs:157-158`
   "Acknowledge a paid-entry/paid-weight risk", and the design table at `docs/plan/01-analysis.md:115`
   "Blocked; unlock needs a logged risk acknowledgement". The product path never wires `unlock`
   — the core builds `GuardedDraw::new` with no acknowledgements (`crates/cc-core/src/lots/lifecycle.rs:23`) after
   checking the raw policy — so in practice the block holds; the latent override should be
   removed rather than left for a later caller to find.
2. **Subscriber-only entry warns.** `crates/cc-lots/README.md:41-42` "A subscriber-only
   eligibility filter warns; a required purchase must additionally be marked `paid_entry`",
   while the design table at `docs/plan/01-analysis.md:115` puts "Entry needs a sub" in the block row. The
   code and the plan disagree; the standard sides with the plan.
3. **Warnings do not hold.** Missing age and region are findings, but `crates/cc-lots/src/draw.rs:91` seals any
   non-blocked draw; `docs/plan/01-analysis.md:116` promised "Warning, one click to proceed", and no
   acknowledgement of a warning is recorded.
4. **The exact line passes.** README `:44` "Exactly 500,000 cents is below the block"; the
   standard counts the edge as over when sources disagree, and the analysis itself cites two
   states without settling inclusivity (`docs/plan/01-analysis.md:117`).
5. **A missing value is zero.** `DrawPolicy::default` sets `prize_value_usd_cents: 0`
   (`crates/cc-lots/src/policy.rs:33`), and a prize with value 0 passes the cap; the guided flow does ask the value
   (`apps/desktop/src/rooms/lottery/flow-steps.ts:99` "What is the prize worth, in US dollars?"), but the domain does not treat "unset" as unknown.
6. **The product's registration confirmation is a flag, not the audited event.** The desktop
   sets `registration_confirmed: true` on the draw's policy (`apps/desktop/src/rooms/lottery/flow-steps.ts:104-108`), and the
   core reads that flag through `convert::check`; the audited `confirm_registration` with its
   ledger line exists only in the domain crate. The acknowledgement event itself records
   `draw_id` and `setting` only (`crates/cc-store/src/ledger.rs:86-89`), not the wording shown or
   the configuration covered.
7. **The screen reads declared switches, not the mechanism.** The policy's
   `free_entry_equal_odds` (`crates/cc-lots/src/policy.rs:13`) is a separate flag from the pool's own
   `free_join_equal_odds` rule — `crates/cc-core/src/lots/convert.rs:29` "free_entry_equal_odds:
value.free_entry_equal_odds" beside `:83` "free_join_equal_odds: value.free_join_equal_odds" —
so the
   risk screen and the pool that actually runs can be set apart by a client.
