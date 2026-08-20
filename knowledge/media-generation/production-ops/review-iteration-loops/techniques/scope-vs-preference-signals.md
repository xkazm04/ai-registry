---
layer: technique
type: technique
subject: review-iteration-loops
technique: scope-vs-preference-signals
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [a review note collides with an earlier scoping decision, wiring a feedback channel next to an existing governance surface, auditing a pipeline for authority bypasses]
---

# Scope vs preference signals

A production pipeline accumulates two different kinds of creator signal.
**Scope signals** are structural commitments made on a surface built for
them: this material is in, that material is out, this element is required
and cannot be removed. **Preference signals** are notes — expressions of
today's taste about weight, phrasing, and position. The technique is one
precedence rule and its enforcement: **when a preference collides with a
scope decision, the scope decision wins, and the preference is refused with
directions to the surface where the decision lives.**

## Why precedence, not recency

The tempting rule is "latest signal wins" — the note came later, so it must
reflect the creator's current intent. This is wrong for three reasons:

- **Deliberation asymmetry.** The scoping surface presented the material,
  its evidence, and the consequences of exclusion; the decision made there
  was informed. A note is dashed off against a render, often without the
  scoped-out material even visible. Treating them as equal-rank overwrites
  a considered decision with an offhand one.
- **Visibility asymmetry.** If a note silently overrides scope, the scoping
  surface still *displays* the old decision. The creator now has two
  authorities showing opposite answers and no complaint from either — each
  surface believes it is being honored, and the disagreement is discovered
  only when someone notices the output contradicting the board.
- **The bypass generalizes.** A channel that can override one governance
  decision can override them all. The concrete incident shape: a required
  element that the scoping surface refuses to remove — the control disabled,
  the reason displayed — removed anyway by a note, from every render at
  once. A revision path that can quietly do what the governance layer
  forbids is not a revision path; it is a bypass with a friendlier name.

## The enforcement, both directions

The precedence must hold in both directions of the scope boundary:

- **Out stays out.** A card the creator descoped may not be given weight or
  screen time by a note, however good the note's reasoning. The refusal
  names the card and says where to bring it back: *out of scope on the
  triage surface — bring it back into scope there first.* The fix flows
  through the front door.
- **Required stays in.** A note asking to descope mandatory material is
  refused with the standing reason the material is required — the same
  reason the scoping surface displays next to its disabled control. The
  refusal text should be *that* reason, not a fresh paraphrase, so the two
  surfaces demonstrably speak with one voice.
- **Opt-in material is opt-in.** Where a class of material requires
  explicit adoption (synthesized conclusions, editorial framings), silence
  about an item is a refusal, not an omission — an item never taken into
  scope is treated exactly like one taken out. And material the engine
  knows exists but was not shown reads as *exists, unread* — never as
  *does not exist*; absence of the text is not evidence of absence.

## Decision rules

- When a note and a scope decision collide, refuse the note; never apply it
  "provisionally" or split the difference.
- The refusal must name the governing surface and the concrete action that
  would legitimately achieve what the note wanted. A refusal without a
  route reads as obstruction; with a route it reads as governance.
- Scope checks run against the *current* scope state at plan time, not a
  snapshot from when the notes were written — a creator may legitimately
  re-scope and then note in the same session, and the later scope state is
  the binding one (scope-to-scope, recency does decide; it is only
  note-over-scope that is forbidden).
- Audit the pipeline for second doors: any transform that mutates weight or
  presence must run the same scope guards. A guard implemented once per
  engine is a guard that drifts.

## When NOT to use it

The precedence governs collisions, not conversation. A note that *argues*
with a scope decision ("I know I cut this, but the ending is weaker without
it") is valuable signal — the answer is still a refusal on this channel,
but one worth flagging prominently, because it predicts a re-scoping. And
in pipelines with no scoping surface at all, do not fake precedence by
promoting the oldest notes to "scope"; build the surface first — precedence
between signal kinds only means something when the kinds are actually
collected differently.
