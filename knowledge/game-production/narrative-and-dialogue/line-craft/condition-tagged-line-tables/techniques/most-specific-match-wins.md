---
layer: technique
type: technique
subject: condition-tagged-line-tables
technique: most-specific-match-wins
status: forged
laws: [unmeasured-is-not-a-pass, compiling-is-not-wiring]
shared_with: []
use_when: [choosing which of several matching lines plays, adding a special case without editing the general one, a well-written line never seems to play]
---

# Most specific match wins

The named concern: when an event is raised and several rows could answer it, choose the one
that fits the situation best, by a rule that is mechanical, explainable and stable under
additions. The rule is that every criterion of a row must hold for the row to be eligible,
and among eligible rows the most specific one wins. Everything else in this technique is
about making "most specific" mean what the writers think it means.

## The query and the match

An event is raised with a snapshot of facts: the event's own facts (who, to whom, how, by
what margin), the speaker's facts (mood, history with the addressee, what they have said
recently), and the world's facts (stage of the story, place, standings). The snapshot is
assembled once per query and every row is matched against the same snapshot, so two rows can
never disagree about what was true at the instant of the event.

A row's criteria are predicates over named facts — equality, a range, set membership, a
count compared against a threshold, a negation. All must pass. A criterion that names a fact
absent from the snapshot fails; it does not evaluate to false-and-therefore-satisfied for a
negated test, because an unknown fact is a distinct state and treating it as false turns
every *player has not yet met this rival* row into a match for every query that forgot to
carry the fact ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)). A row
that genuinely wants *never recorded* says so with an explicit unknown test.

## What specificity means

The base measure is the number of criteria a row passed. It is simple, a writer can predict
it, and it gives the cascade its shape: the generic row for an event has no criteria beyond
the event, a row for a particular speaker has one, a row for that speaker against that
rival has two, and the running gag has three. Adding a row never requires touching another.

Count alone fails in one direction, and the direction is the dangerous one. Criteria are not
equally informative: *the speaker is this character* and *it is raining* are cheap, while
*the player wrecked this speaker's brother last race* changes what any sane line would be. A
row padded with three cheap criteria outranks a row carrying the one that matters, and
writers learn to pad important rows with filler conditions to make them win — which works
until somebody adds a fourth filler row. The fix is a declared **tier** above the count:
rows are grouped into a small closed set of tiers (story-critical, relationship, situational,
generic), the highest eligible tier wins, and count breaks ties inside a tier. A per-criterion
weight is the finer alternative; it is more expressive and less predictable, and a table
written by several writers is better served by four tiers anyone can reason about.

Count is one shipped ranking among several. Even the engine this rule was first described for
let a criterion be optional and weighted, so "every criterion must hold" and "count the
criteria" were its defaults, not its laws. Other shipped systems rank by authored priority
bands and never count at all. One widely used tool ranks an unheard line above a more specific
line already heard. What every working form keeps is a precedence a writer can predict from the
row itself, with a declared top band for what must win.

Ties inside a tier and count are broken by an authored weight and then by a seeded random
choice. The random choice is seeded so that a test run, a replay and a bug report reproduce
the same line.

## Exhaustion and fall-through

The most specific row may be unable to speak: every line in it is cooling down, already used
this session, or barred by the speaker's talk budget. The rule is that selection then falls
to the next most specific eligible row, not to silence and not to a repeat of the line just
heard. This is how a running gag degrades gracefully — after its lines are spent, the
situation is answered by the less special row beneath it — and it is why the fallback row is
mandatory for every event.

Heard counts as used. A ranker that sorts by specificity first and consults what has been heard
only to break ties never exhausts its special row. It plays that row's line every time the row
is eligible, and the special case becomes the parrot. Whichever rule ranks them, a special line
that has been heard yields to a general line that has not. An event with no fallback row is an event that will eventually be
answered by nothing, in a moment nobody chose.

Silence is sometimes the correct answer, and then it is a row: an eligible, authored row that
says nothing, with its own tier and criteria. An authored silence wins or loses like any other
row; an accidental silence is a missing row and is reported as one.

## What the table must not pick

Matching chooses the best fit among the facts the snapshot carries, and that is exactly the
wrong instrument for a climactic beat, whose fitness depends on what the player has just felt,
what was said a moment ago and what the next scene needs — none of which is a fact. A matched
line at a climax lands worse than a placed one. The rule is that beats which must arrive in a
stated order are guaranteed, not matched. One way is to place them by sequence, outside the
table, and tell the table to stand down while they play. The other is to keep them inside the
table as must-play rows, in a band above every other band. Such a row is gated on the rows that
must precede it, played once, and exempt from cooldowns and the talk budget. What fails is a beat left to compete on count or on
chance. Where a placed beat wants reactive colour, it raises its own event and lets the table
supply a line *inside* the slot the beat reserved, never the beat itself.

## Checks the table owes before play

**No fallback.** Every event has at least one row with no criteria beyond the event.

**Shadowed row.** A row is dead if, in every situation where it is eligible, some other row
of a higher tier or greater count is eligible too and never exhausts. The common case is
mechanical: a row whose criteria are a subset of another row's at the same tier can still win,
but a row whose criteria are a superset of a higher-tier row's can win only while that row is
exhausted, and never if it cannot exhaust. Dead rows have
been written, reviewed, translated and possibly recorded; they compiled and nothing reaches
them ([compiling-is-not-wiring](../../../../_laws.md#compiling-is-not-wiring)).

**Unsatisfiable row.** Criteria that contradict each other, or that name a fact whose
declared domain cannot meet the test.

**Coverage.** For a recorded or simulated session, the share of rows ever selected. A row that
was never selected is not proven to work, whatever its text; the count of never-selected rows
is the backlog, not a quality figure.

## Decision rules

- **When a special case should pre-empt a general one, add a row with one more criterion**;
  never edit the general row to exclude the special case, because that couples the two and
  the next special case couples three.
- **When a row matters to the story, give it a tier**, not filler criteria.
- **When an event can be raised, give it a fallback row first**, even if the fallback is an
  authored silence.
- **When the chosen row is exhausted, fall through to the next eligible row**, never to a
  repeat of the line just heard.
- **When a fact may be missing from the snapshot, test for unknown explicitly**; never let a
  negated criterion pass on absence.
- **When a bug report says the wrong line played, answer it from a selection trace** — the
  eligible rows, their tiers and counts, and why the winner won — not from rereading the
  table.
- **When a beat must land in order, guarantee it.** Place it, or give it a must-play band with
  its prerequisites, exempt from cooldown and budget. Never leave it to count or chance.
- **When a special row has been heard, let an unheard general row answer** before it repeats.

## Evidence status

The selection rule itself — facts matched against tagged rows, the most specific match
winning, general rows as fallbacks, special cases added without code — is described in a
primary source, a studio engineer's conference talk on a shipped reactive-dialogue system, and
in a respected practitioner's essay naming the approach and its main risk; the dossier rates
both high. It read the talk only through its abstract and a summary. The slides with speaker
notes were read in full on 2026-10-09: the engine they describe also had weighted and optional
criteria, and it chose at random among equal matches. On the same date the web lane read
shipped selection code from two other systems. Both rank by priority bands, and one puts an
unheard line ahead of a more specific heard one. That lane and a blind training-data lane reached
the bounds on count ranking and on placed beats independently.

The rule that salience must not pick climactic beats comes from that essay and is
high-confidence as a claim of risk, not as a measured result. The essay's own proposed remedy
is to feed dramatic-arc state into the match. A shipped game delivers its ending through a
top-priority, play-once row gated on an earlier meeting, so "never matched" was too strong. A
field census of one shipped table found a ranker that sorts specificity before recency
([kotlin application](../applications/kotlin--line-table-schema.md)). The tier-above-count refinement, the explicit
unknown test, the seeded tie-break and the shadowed-row check are practitioner judgement, not
sourced claims. None of it has been tested in a played game for which this subject was written.

## When not to use this

When the next line depends on the line before it, the content is a conversation and belongs
in a sequenced graph; forcing a scene through a table produces exchanges that answer the
wrong question in the right words. And for a single event with one speaker and three lines,
a shuffled list is enough; the matching machinery earns its cost when several speakers,
several situations and several writers meet one event.
