---
layer: application
type: application
subject: live-safety-rails
technique: detector-biased-to-false-positive
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# Rust: a recall-first disclosure detector that runs ahead of every chat throttle

Shadowrunr OS (github.com/xkazm04/shadowrunr @ 4025231) is an AI-run villain livestream
whose brain crate filters chat, picks which messages the host answers, and gates what the
host says. Its self-harm disclosure path is the cleanest realization of the technique in
the tree: a lexicon with a built-in floor, a check that runs before the rate cap, flood
and copypasta handling, and a deterministic picker step that re-inserts safety-critical
messages whatever the model-based ranking did. Every anchor below was re-opened on
2026-10-19.

## The bias is written down as the reason for the pattern

The built-in pattern carries the asymmetry as its doc comment:
`crates/shadowrunr-brain/src/moderation.rs:155 "It errs towards matching: a false positive costs one kind line,"`
and continues `crates/shadowrunr-brain/src/moderation.rs:156 "a miss can cost a life."`
That is the technique's tuning rule stated at the point of tuning, where the next person to
touch the regex will read it.

## A floor no policy file can switch off (upward lesson)

The per-platform rule file has its own `self-harm-disclosure` pattern, and it missed a real
phrasing caught in a run transcript. The fix was not to patch the file but to add a floor:
`crates/shadowrunr-brain/src/moderation.rs:153 "Always on, whatever the policy source, because the platform file's"`.
The lookup tries a configured non-blocking rule first and then always falls back to the
built-in pattern (`crates/shadowrunr-brain/src/moderation.rs:514 "gate_regexes()"`), and a
test pins the gap the floor closes:
`crates/shadowrunr-brain/src/moderation.rs:2044 "The file's pattern misses L167; the always-on fallback catches it."`
This is where the technique's "built-in floor" refinement came from.

## Direction decides the category (upward lesson)

Blocking `self-harm` rules exist to stop incitement aimed at other viewers. Run first, they
would drop a disclosure. The tree detects the disclosure first and, for a disclosing
message, evaluates term rules with the blocking self-harm rules excluded:
`crates/shadowrunr-brain/src/moderation.rs:839 "rules (they target incitement, and"`
and the exclusion itself at
`crates/shadowrunr-brain/src/moderation.rs:846 "r.category != SELF_HARM_CATEGORY || r.action != TermAction::Block"`.
The inverse is tested too: `crates/shadowrunr-brain/src/moderation.rs:2051 "kys loser"`.

## Detect first, then throttle (confirmed)

The candidate's own documentation lists the bypasses:
`crates/shadowrunr-brain/src/moderation.rs:593 "message skipped the rate cap, flood and copypasta handling, is picked first in its beat"`.
In clustering, nothing joins a safety candidate except an exact safety duplicate
(`crates/shadowrunr-brain/src/moderation.rs:906 "is itself safety-critical (a raid pasting one line stays one pick, still"`,
and `crates/shadowrunr-brain/src/moderation.rs:1013 "if c.cand.safety.is_some() {"` refusing
near-duplicate merges), and a safety line is never recorded as copypasta, so a repeat next
beat is not dropped either
(`crates/shadowrunr-brain/src/moderation.rs:1048 "Never recorded as copypasta, so a repeat next beat is not dropped either."`).
The exact-duplicate merge is the legitimate exception the technique names: a pasted crisis
line stays one answered pick rather than a flood through the safety lane.

## Deterministic priority after the model picker (confirmed, and an upward lesson)

The picker's constraint step puts every safety candidate first and exempts it from the
fairness caps:
`crates/shadowrunr-brain/src/picker.rs:265 "Safety-critical candidates (self-harm disclosures) come first, in inbox order, every"`,
`crates/shadowrunr-brain/src/picker.rs:266 "lists them (the LLM picker may not have)"`,
`crates/shadowrunr-brain/src/picker.rs:267 "pick cap, the one-pick-per-viewer rule, the share and whale caps and novelty"`.
The clause about the LLM picker is the lesson: a model ranking chat for the show may leave
the quiet line out, so the guarantee lives in code after it.

## Manipulative and in danger at once (confirmed)

When a disclosure is also tagged as an injection, the payload is withheld but the distress
is passed to the model as such:
`crates/shadowrunr-brain/src/compose.rs:536 "<a possible distress signal mixed with an attempt to rewrite your rules; \"`.

## Where the tree falls short

- **Two classes, not three.** The detector distinguishes disclosure from everything else.
  Sincere sadness without danger has no class; it is left to the persona and a situation
  test. The night tournament (night-0dd890a1ad, n as stated, 2026-10-18) failed
  `viewer-sincerely-sad` in 3 small-tier and 8 mid-tier runs of about 59 each - roughly
  even across tiers, which is what a missing class looks like.
- **Lexicon only.** There is no classifier OR'd with the regex, so oblique phrasings outside
  the pattern are caught only if someone adds them; recall on oblique phrasing and on other
  languages is unmeasured, and nothing reports it as such.
