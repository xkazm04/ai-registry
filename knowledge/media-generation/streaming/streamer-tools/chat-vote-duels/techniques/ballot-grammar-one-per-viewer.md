---
layer: technique
type: technique
subject: chat-vote-duels
technique: ballot-grammar-one-per-viewer
status: forged
laws: []
shared_with: []
use_when: [deciding which chat lines count as votes in a timed duel, collapsing repeated or changed votes from one viewer, fixing when a vote window opens and closes]
---

# Ballot grammar, one per viewer

A chat vote is read out of free text, and the reading is where most duels are lost. The
technique fixes three things before the window opens: **the grammar** a line must match
to be a ballot, **the identity** a ballot belongs to, and **the window** inside which it
counts. Each is chosen to make the count predictable by a viewer who has seen the
overlay's one-line instruction and nothing else.

## The grammar

Declare for each contender a small set of tokens: its position ("1", "2"), its letter
("A", "B") where letters are shown, and at most one short keyword where the contenders
have names worth typing. Then choose one of two positional grammars and print it on the
overlay:

- **Whole line.** After trimming surrounding whitespace and folding case, the whole
  line equals one token. Strict and unambiguous; the room must vote and talk in separate
  lines.
- **First word.** The line's first word, delimited by whitespace, is a token, and
  everything after it is commentary. "1 that intro was better" votes one. It is the
  grammar rooms learn fastest, it lets a viewer argue in the same line as the vote, and
  its known price — "1 is worse than 2" votes one — is paid in a rule the viewer could
  read.

Allow the decorations the room types without thinking, such as a single trailing
exclamation mark, and say which in the configuration rather than in the parser's habits.
A token glued to more characters ("12", "1st") is not the token. Everything else is not
a ballot.

What neither grammar does is search. A parser that looks for a token anywhere in the
line counts "honestly 2 is worse" for two, counts "2 hours ago I said 1" for both or
neither, and counts the joke along with the vote. Reading intent out of prose is a
judgement, and judgements disagree with the viewer who made them; a positional grammar
disagrees with nobody, because it is visible. Under a whole-line grammar with keywords, a
line that matches two contenders is ambiguous and a token that names no contender in
this duel — "3" in a two-way duel, the previous pairing's keyword — is an unknown option;
neither is counted. Keywords must be distinct after case folding and must not be a prefix
of each other or of the position tokens, which is checked when the duel is configured,
not discovered in the window.

Platform decorations that precede the text are read past, not into. A paid message whose
platform-inserted amount marker comes first, followed by "2", is a ballot for two, counted once. The payment
is the platform's business and the acknowledgement is the show's; it never adds a vote,
and the instrument should be able to report how many counted ballots arrived on paid
messages precisely so anyone can see they weighed one each.

Do not normalise beyond what was declared. Stripping emotes, collapsing repeated
letters, translating number words: each one widens the grammar invisibly, and the room
cannot learn an invisible grammar. If a measured share of plainly intended votes is
failing the grammar, widen it deliberately, between duels, and update the instruction.

## The identity

The voter is the platform's stable account identifier. Display names change mid-stream
and can be imitated; a tally keyed on names counts a renamed viewer twice and lets an
impersonator overwrite somebody else's ballot. Keep the display name beside the ballot
for showing, never as the key.

Before identity comes the line itself. Chat reaches a tool by more than one road — the
live feed, a page read after a reconnect, a replay of the moderation record — and the
same line can arrive twice. Collapse lines by their message identifier first, so a
redelivery is never a second ballot and never a "repeat" either; it is the same line.

One identity holds one ballot per window, and the duel states which one stands:

- **First ballot stands.** Every counted ballot is permanent, so each side's total only
  ever rises while the window is open, and the race on the overlay never steps
  backward. Later ballots from the same viewer are repeats. This is the safer default
  for a tool that shows a live count, because a total that falls on air reads as
  tampering however innocent the cause.
- **Latest ballot stands.** A second ballot replaces the first, so the streamer can
  argue the room round and the swing is the entertainment. Totals can fall mid-window,
  and the overlay must make that legible — the replaced count moves visibly to the
  other side — or it will look like a correction.

Whichever rule applies, it is stated on screen, and the displaced ballot is kept with
its status, not deleted, so the viewer's history is reconstructible.

## The window

The window opens and closes on the counting authority's clock. A ballot's time is the
time recorded with the line in the record the authority counts from — never a timestamp
the viewer's client supplied, and never the moment some process happened to read the
line, because read times differ between processes and between a live count and a
recount. Lines timed before open or after close are outside the window, whatever they
say. Announce the close in advance on the overlay with a visible countdown read from the
same authority, so that the line a viewer sends at the last second is judged by the
clock the viewer was shown.

A window that can be paused is not one interval but a list of open spans. Pausing
closes the current span; resuming opens a new one; a line counts only when its time
falls inside a span. Chat typed during the pause — when the streamer is explaining the
next pairing — and chat from an earlier attempt at the same pairing that was undone or
restarted never leaks into the count.

The window is not extended silently. If the streamer needs more time, extending is an
explicit operation, said on stream and shown on the countdown, and it is only possible
before the close; after the close, the result is final.

## Decision rules

- **When defining tokens**, choose whole-line or first-word matching, check
  distinctness and prefix freedom at configuration, and print the accepted form on the
  overlay. Never search the line.
- **When a whole-line grammar matches two contenders**, the line is ambiguous and
  uncounted; never pick one.
- **When a line arrives twice**, collapse it by message identifier before applying any
  identity rule.
- **When a viewer votes again**, apply the stated rule by stable identity (first stands
  by default where a live count is shown) and keep the displaced ballot as a record.
- **When a paid message carries a vote**, read past the platform prefix and count it
  once.
- **When the clock is in question**, the time recorded with the line decides, checked
  against the window's open spans; client timestamps are display data.
- **When the room keeps missing the grammar**, widen it between duels, deliberately, and
  update the instruction; never widen it mid-window.

## When not to use it

A platform's native poll widget already has its own grammar, identity and window, and a
tool that reads the widget's result inherits them rather than re-parsing chat; this
technique applies when the tool counts chat itself. In a room of five, a strict grammar
is pedantry — the streamer can read the five lines aloud and the conversation is the
vote.
