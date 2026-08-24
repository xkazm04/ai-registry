---
layer: technique
type: technique
subject: conversation-orchestration
technique: model-proposed-quick-replies
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [every turn ends in a blank input box, a suggestion chip performs an action, chips from an old turn still offered three exchanges later]
---

# Model-proposed quick replies

A companion that answers well and then falls silent has handed the
orchestration back to the user. The next move exists — the model usually knows
what it is — but the user has to invent the sentence that asks for it, and the
cost of inventing that sentence is where conversations end.

Quick replies close that gap: the model proposes two to four short next
messages in the same in-band grammar as its progress beats, and the surface
renders them as chips beneath the turn. The mechanism is trivial. The
discipline is not, because a chip sits at the junction of three things that must
not merge — a model's suggestion, a user's intent, and the system's actions.

## Proposal grammar and bounds

Reuse the beat convention's shape: a distinctly-marked line, one proposal per
line, lifted from the stream by the same sieve. Sharing the mechanism means one
sieve, one marker authority, and one place a malformed line is handled — three
separate line grammars for three separate in-band features is how a parser
becomes a dialect.

The bounds are part of the instruction, not the renderer's cleanup job:

- **Two to four, five when the branch space is genuinely that wide.** One chip
  is a dead end dressed as a choice; a row the user reads instead of thinking
  costs more than typing would have. State the target in the instruction and
  state the ceiling too, because a model given only a target treats it as a
  floor.
- **Short enough to read without scanning** — a handful of words, phrased as
  something the user would actually say, in the user's voice rather than the
  companion's ("show me the failures", not "would you like to see the
  failures?").
- **Distinct.** Three chips that differ by a synonym are one chip and two
  distractions. Where the model produces near-duplicates, the surface may drop
  the extras; it never invents replacements.
- **Optional.** A turn that legitimately has no next move proposes nothing, and
  the surface renders nothing. A renderer that pads to a fixed count with
  generic filler ("tell me more") teaches the user that the chips are noise, and
  they will be ignored afterwards including on the turns where they were good.

## A chip sends a message; it never performs an action

This is the rule the whole technique exists to protect. A chip's press composes
its text as a user message and submits it through **the same door every typed
message goes through**
([one-validation-door](../../../../_laws.md#one-validation-door)) — same
validation, same busy-thread policy, same record. It is visible in the
transcript as a user turn, because that is what it is.

What a chip must never do is invoke a capability directly. The moment pressing a
chip writes something, sends something, or spends something, an unreviewed model
proposal has become a one-click action, and the approval discipline that governs
consequential actions has been routed around by a suggestion the model wrote
about itself. The two are easy to confuse on screen — both are small buttons
under a message — which is precisely why the boundary has to be structural:
proposals go through the message door; consequential actions go through the
approval surface, which is a different row, differently styled, with a different
record.

The related trap is the chip that *looks* like a command. "Delete them" as chip
text is a message the user is choosing to send, and it will be read by the model
as a request — which is fine, and is the model's next turn's problem, and is
still not the chip performing a deletion. Keep the mechanism honest and the
wording will follow.

## Chips belong to their turn and go stale with it

A chip set is a property of the turn that proposed it, keyed by that turn's
identity, and it is offered only while it is the conversation's most recent
turn. Chips still sitting under a turn three exchanges later are proposing a
next step for a conversation that has already moved on, and pressing one sends a
message whose context evaporated — the classic result being a companion that
answers a question nobody currently has.

Two consequences follow. Re-opened history renders past chips **inert or not at
all**; they are part of the record of what was offered, not a live control. And
a pressed chip is spent: the set disappears when one is used or when the user
types anything, because both are the user answering.

## Accessibility and the keyboard

Chips are interactive elements in document order, reachable by tab, labelled by
their text. Where the surface offers a keyboard accelerator — a digit per chip
is the natural one, and is the same interaction the ambient surface uses for its
numbered options — **register it with the application's own keyboard authority,
not on the global event target**. A bare listener guarded only against text
fields is not enough: the digits it claims are the same digits some other
surface claims, and the observed result is one keypress firing both. Whichever
overlay currently owns the keyboard is served first, and this row yields.

## When not to use this

- **When the next step is a decision with consequences.** That is an approval
  or a confirmation, with its own record and its own affordance, not a
  suggestion chip.
- **When the surface has no room to be ignored.** In a dense ambient surface the
  same proposals should be rendered as numbered options, per the two-surface
  routing rule — chips are a chat affordance.
- **When the model's proposals are consistently poor.** Measure whether chips
  are pressed. An unused chip row is not neutral: it occupies the space directly
  under every answer, it trains the eye to skip that space, and removing it is a
  better outcome than leaving a feature the user has learned to ignore.
