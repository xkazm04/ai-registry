---
layer: technique
type: technique
subject: chat-vote-duels
technique: deterministic-tie-break-said-aloud
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [choosing what decides a level head-to-head vote, a bracket needs a winner from every pairing, a tie was resolved and the room wants to know why]
---

# Deterministic tie-break, said aloud

A two-way vote lands level more often than people expect. Small rooms tie because the
numbers are small; late bracket rounds tie because both contenders are favourites; and
any duel where the streamer argues hard for the underdog drifts toward the middle. A
bracket cannot carry a tie forward, so every duel needs a winner, and the rule that
produces it is the most scrutinised decision in the instrument — it is the one moment
the count alone did not decide.

## The rule is chosen before the window opens

The tie rule is part of the duel's configuration, fixed before the first ballot, and it
does not change after the count is known. A rule chosen at the moment of the tie is a
choice of winner, whatever it is called.

It must be **deterministic**: given the same ballots, it always produces the same
winner. And it must be **checkable from what the room watched**. Rules that pass both
tests:

- **Higher seed advances.** The most legible rule for a bracket, provided the seeding was
  public before the first round. It rewards the contender the bracket already favoured,
  which is a fact the streamer should accept before choosing it.
- **First to the tied total.** The side whose count reached the final level first wins.
  It rewards early support and is checkable from the live count the room watched, but
  only if the overlay's updates were frequent enough to show the race.
- **Sudden death.** A short second window between the two, under the same grammar. It is
  the most satisfying on stream and the most expensive in time; it needs its own tie rule
  for the case it ties again, and that rule must be one of the others.

A random draw is acceptable only when it is itself verifiable — a published seed fixed
before the window, or a public randomness source the room can check. An unseeded coin
flip inside the tool may be perfectly fair and is still a hidden decision: nobody
watching can tell it from a thumb on the scale.

What is never a tie rule is whatever the code happened to do. The first key out of a
hash map, the option listed first in an array, the order of a sort with no tiebreaker:
each is deterministic in a given build and arbitrary across builds, and each was chosen
by nobody. Make the tie path explicit in code and cover it with a test of an exact tie.

## Said before, and said after

**Before the window opens**, the rule is stated where the room will see it — a line on
the overlay, a sentence from the streamer. A rule announced after a tie looks invented
for that tie, even when it was in the configuration all along.

**When the rule decides**, the result says so: "tied at 41 — higher seed advances". The
result screen for a tie-break win differs from the one for a count win, because they are
different claims; presenting a tie-break winner exactly like a clean winner states a
margin that does not exist. Keep the tie in the record of the duel as well, so that a
bracket history shows which rounds the rule decided.

## Every result names how it was decided

A tie-break is one of three ways a duel ends, and the record carries which: **the
count** decided it, **the tie rule** decided it, or **the streamer called it**. A human
streamer will sometimes overrule the room — a contender turned out to break the rules,
the pairing was a bit — and a tool that makes that impossible teaches the streamer to
fake it by closing the window early or retyping the bracket, which is worse. So the call
is a first-class verdict: it records the count it overrode beside the winner, it is
labelled as the streamer's call on the panel and on the overlay, and once recorded it is
not rewritten — a second press during the result screen moves the show on, it does not
change the winner.

The overlay's word for each kind is written for the room, not copied from the code: "chat
chose", "tied 12–12 · better seed goes through", "streamer's call". An enumeration value
printed raw is technically a label and practically a riddle.

A final result is not edited. When a duel has to be undone — it opened on the wrong
pairing, the streamer called it by mistake — the undo reopens the pairing as a fresh
window whose count starts at nothing, said aloud on stream, and the voided result stays
in the duel's record as voided rather than vanishing.

## Ties that are not ties

A tie is judged on the counted ballots at the close, after replacement and moderation.
A level count on the live overlay a second before the close is not a tie, and a level
count produced by a gap in the chat feed is not a clean tie either — it is a duel
counted over a gap, which should be reported before any rule is applied to it. Where the
duel is weighted, a weight tie with a gap in heads goes to more voters before the
configured rule is consulted, because heads are the room.

## Decision rules

- **When configuring a duel**, pick a deterministic, checkable rule and record it with
  the duel; a sudden death carries a second rule for its own tie.
- **When opening the window**, put the rule on screen and in the streamer's opening line.
- **When a tie is decided**, label the result as a tie-break win naming the rule and the
  level total; never present it as a count win.
- **When choosing a random tie-break**, use only a verifiable source fixed before the
  window; otherwise choose another rule.
- **When the streamer overrules the count**, record a call with the overridden count
  beside it and label it as a call on every face; never present it as the room's choice.
- **When a result must be undone**, reopen the pairing as a fresh window and keep the
  voided result in the record.
- **When reviewing the code**, find the tie path and the test that exercises it; if
  either is missing, the rule is whatever the runtime does. Seed comparison deserves its
  own look: seeds stored as text compare "10" before "9" unless the comparison is
  numeric, and a tie rule that sorts seeds as strings advances the wrong contender in
  every bracket of ten or more.

## When not to use it

A duel that is a pure conversation starter — a "which do you prefer" with nothing riding
on it — can end level and simply say so. The technique applies wherever a winner is
needed: a bracket, a choice the streamer will act on, anything that will be quoted.
