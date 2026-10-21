---
layer: application
type: application
subject: live-safety-rails
technique: detector-biased-to-false-positive
stack: rust
status: forged
verified_on: 2026-10-21
verified_against: rust@1.97.1
applied: simulation
ab_verdict: better
---

# Rust: a recall-first disclosure detector that runs ahead of every chat throttle

Shadowrunr OS (github.com/xkazm04/shadowrunr @ a9d8c33) is an AI-run villain livestream
whose brain crate filters chat, picks which messages the host answers, and gates what the
host says. Its self-harm disclosure path is the cleanest realization of the technique in
the tree: a lexicon with a built-in floor, a check that runs before the rate cap, flood
and copypasta handling, and a deterministic picker step that re-inserts safety-critical
messages whatever the model-based ranking did. First written against 4025231 on
2026-10-19; every anchor below was re-opened at a9d8c33 on 2026-10-21, 266 commits later.

## The bias is written down as the reason for the pattern

The built-in pattern carries the asymmetry as its doc comment:
`crates/shadowrunr-brain/src/moderation.rs:164 "It errs towards matching: a false positive costs one kind line,"`
and continues `crates/shadowrunr-brain/src/moderation.rs:165 "a miss can cost a life."`
That is the technique's tuning rule stated at the point of tuning, where the next person to
touch the regex will read it.

## A floor no policy file can switch off (upward lesson)

The per-platform rule file has its own `self-harm-disclosure` pattern, and it missed a real
phrasing caught in a run transcript. The fix was not to patch the file but to add a floor:
`crates/shadowrunr-brain/src/moderation.rs:162 "Always on, whatever the policy source, because the platform file's"`.
The lookup tries a configured non-blocking rule first and then always falls back to the
built-in pattern (`crates/shadowrunr-brain/src/moderation.rs:531 "gate_regexes()"`), and a
test pins the gap the floor closes:
`crates/shadowrunr-brain/src/moderation.rs:3083 "The file's pattern misses L167; the always-on fallback catches it."`
This is where the technique's "built-in floor" refinement came from.

## Direction decides the category (upward lesson)

Blocking `self-harm` rules exist to stop incitement aimed at other viewers. Run first, they
would drop a disclosure. The tree detects the disclosure first and, for a disclosing
message, evaluates term rules with the blocking self-harm rules excluded:
`crates/shadowrunr-brain/src/moderation.rs:1019 "rules (they target incitement, and"`
and the exclusion itself at
`crates/shadowrunr-brain/src/moderation.rs:1026 "r.category != SELF_HARM_CATEGORY || r.action != TermAction::Block"`.
The inverse is tested too: `crates/shadowrunr-brain/src/moderation.rs:3090 "kys loser"`.

## Detect first, then throttle (confirmed on the way in)

The candidate's own documentation lists the bypasses:
`crates/shadowrunr-brain/src/moderation.rs:610 "message skipped the rate cap, flood and copypasta handling, is picked first in its beat"`.
In clustering, nothing joins a safety candidate except an exact safety duplicate
(`crates/shadowrunr-brain/src/moderation.rs:1086 "is itself safety-critical (a raid pasting one line stays one pick, still"`,
and `crates/shadowrunr-brain/src/moderation.rs:1195 "if c.cand.safety.is_some() {"` refusing
near-duplicate merges), and a safety line is never recorded as copypasta, so a repeat next
beat is not dropped either
(`crates/shadowrunr-brain/src/moderation.rs:1230 "Never recorded as copypasta, so a repeat next beat is not dropped either."`).
The exact-duplicate merge is the legitimate exception the technique names: a pasted crisis
line stays one answered pick rather than a flood through the safety lane.

## Deterministic priority after the model picker (confirmed, and an upward lesson)

The picker's constraint step puts every safety candidate first and exempts it from the
fairness caps:
`crates/shadowrunr-brain/src/picker.rs:395 "Safety-critical candidates (self-harm disclosures) come first, in inbox order, every"`,
`crates/shadowrunr-brain/src/picker.rs:396 "lists them (the LLM picker may not have)"`,
`crates/shadowrunr-brain/src/picker.rs:397 "pick cap, the one-pick-per-viewer rule, the share and whale caps and novelty"`.
The clause about the LLM picker is the lesson: a model ranking chat for the show may leave
the quiet line out, so the guarantee lives in code after it.

## Manipulative and in danger at once (confirmed)

When a disclosure is also tagged as an injection, the payload is withheld but the distress
is passed to the model as such:
`crates/shadowrunr-brain/src/compose.rs:655 "<a possible distress signal mixed with an attempt to give you orders. Do not mock it:"`.

## The throttle on the way out (deviation; upward lesson, measured by simulation)

Between 4025231 and a9d8c33 the brain grew a per-beat speech budget that drops whole spoken
lines after generation, and a lag ceiling that drops lines queued too far behind the voice:
`crates/shadowrunr-brain/src/pace.rs:214 "whole lines, the last first, until the rest fits. The first line is always kept, so a beat"`.
It knows nothing about safety. Its first measured casualty was not a crisis line but a
sincere question:
`crates/shadowrunr-brain/src/lib.rs:1455 "sbx-20261021-172704-10m the budget trim dropped the only line answering a minor's"`
(and a sincere "are you an AI"). The fix carries an unaired pick into the next beat - for
ordinary picks only:
`crates/shadowrunr-brain/src/lib.rs:1467 "for c in pick.chosen.iter().filter(|c| c.safety.is_none()) {"`.
A crisis beat counts as delivered when any line aired, and that is what removes the viewer
from chat:
`crates/shadowrunr-brain/src/lib.rs:1395 "once the crisis line went out (so the help is delivered), the"`.

Simulation (2026-10-21): every recorded crisis beat in the checkout's run transcripts
(n=204, across the night tournament, the 3 h case runs, the rate-cap experiments and six
sandbox runs; all recorded before the trim existed) was replayed through `over_budget`,
ported line for line, at the default 260-character budget. The help pointer (the tree's own
`HELP_POINTER_PATTERN`) aired in 203 replies and was not the first line in 118: models open
with a softening sentence ("I'm setting the bit down for a moment") and put the help second.
**A, the trim as shipped: the pointer is cut in 92 of 204 while the opener airs**, which the
tree then records as a delivered handoff. **B, the trim may not drop the line carrying the
pointer: 0 of 204**, at a cost of 119 beats left over budget by a median 40 characters
(p90 90, max 181; about 2 s of speech at the tree's 18 characters a second). Verdict
`better`, with the cost stated. Limits: the replies predate the prompt's tighter length ask
that shipped with the trim, so the live rate is likely lower than 45%; the lag ceiling,
which never drops a first line either, was not replayed because it depends on the speech
queue at the time. No project change; return when the brain's pace gate is next touched,
and pin it with a test whose crisis reply carries the pointer second.

## Where the tree falls short

- **Two classes, not three, by default.** A grief pattern for sincere sadness now exists,
  but only behind an experiment flag that is off:
  `crates/shadowrunr-brain/src/moderation.rs:633 "Reconcile opt-5 experiment, off by default: a grief message"`
  and `crates/shadowrunr-brain/src/moderation.rs:656 "rate_cap_exemptions: false,"`.
  Even on, it only exempts the message from the rate cap; it does not set a care state or
  a register. The night tournament (night-0dd890a1ad, n as stated, 2026-10-18) failed
  `viewer-sincerely-sad` in 3 small-tier and 8 mid-tier runs of about 59 each - roughly
  even across tiers, which is what a missing class looks like.
- **Lexicon only.** There is no classifier OR'd with the regex, so oblique phrasings outside
  the pattern are caught only if someone adds them; recall on oblique phrasing, on risk
  folded into an ordinary request, and on other languages is unmeasured, and nothing
  reports it as such.
- **Sincere questions get a weaker bypass.** A sincere direct question skips the rate cap
  only after its viewer has gone unanswered for three beats
  (`crates/shadowrunr-brain/src/moderation.rs:627 "A sincere direct question skips the rate cap when its viewer has not been answered"`),
  so "are you an AI" still competes with ordinary chat for those three beats.
