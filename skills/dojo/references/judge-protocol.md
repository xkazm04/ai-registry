# Judge protocol — pairwise, blind, one reason

Two doctrine lines govern everything below:

> **Scores are a pre-filter, never a verdict.**
> **The disagreement between score and eye is the finding worth keeping.**

A machine judge exists to ORDER the human's attention, not to replace it. The
human's pick in Foundry -> Dojo is the only verdict; everything a judge emits is
evidence about which pairs deserve eyes first and whether the challenger is even
worth parking.

## The pair

- **Seed-matched**: the same scene and the same seed produce both arms. The seed
  is the control — without it a pair compares two rolls of the dice, not two
  recipes.
- **Blind order**: the judge is never told which arm is the challenger. Present
  the two images in randomized order as "A" and "B"; map the pick back to
  `baseline`/`challenger` after the answer. A judge that knows which arm is new
  grades the novelty, not the image.
- **One pick + ONE reason**: `judge_pick` is `"baseline" | "challenger" | "tie"`,
  `reason` is one sentence naming the deciding difference. Never 1-10 scores —
  a scale invites averaging, and averaging is where the interesting
  disagreements go to die. A judge that cannot name a reason picks `tie`.

Per-pair fields (see `cycle-contract.md` for the full shapes): `judge_pick` +
`reason` from the chokepoint judge; `gemini_pick` + `gemini_reason` from the
joint judge while both run.

## The two judges (early cycles)

1. **Chokepoint judge** — per-image readback through the consuming repo's
   recognize router (what is actually in each image, in words), then a reasoned
   pairwise pick through its reason router or a dispatched Fable subagent that
   sees the two readbacks plus the claim. Strength: the reasoning is legible and
   the routers are the repo's own instrumented chokepoints.
2. **Gemini joint judge** — both images plus the improvement's claim in ONE
   multimodal request, answering pick + reason directly. Strength: it sees
   pixels side by side; nothing is lost in the readback.

Both picks are logged on every pair. Neither is trusted yet — that is the point.

## The numbers

- `judge_pick_rate` = challenger picks / total pairs (chokepoint judge). Ties
  count in the denominator, not the numerator — a tie is not a win.
- `gemini_agreement` = pairs where both judges picked the same arm / pairs where
  both picked (ties excluded from both sides). This is agreement BETWEEN judges,
  computed before any human is involved.
- Once verdicts exist, per-judge human tracking = pairs where that judge's pick
  matches the human's improvement-level verdict direction, over gated cycles.

The tab shows pick-rate and judge agreement per cycle; the ledger row carries
`judge_pick_rate` and `gemini_agreement` so the trend survives the media.

## The meta-A/B — retiring a judge

Running two judges is itself an A/B, and it resolves by evidence, never by
preference: once **at least 3 gated cycles** show one judge tracking the human
verdicts better than the other, the overlay (`.claude/dojo/config.md`) pins the
winner under `judges` and the other is dropped from future cycles. Record the
decision in the overlay with the cycles it was earned from. Before that
threshold, both run and both are logged — dropping a judge on one cycle's
agreement is exactly the score-over-eye mistake the doctrine lines forbid.

If the pinned judge later diverges from the human across multiple cycles, that
divergence is a finding: reopen the meta-A/B, say so in the report, and let the
evidence re-pin.
