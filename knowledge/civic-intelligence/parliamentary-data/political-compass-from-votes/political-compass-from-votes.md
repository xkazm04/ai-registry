---
layer: golden-path
type: golden-path
subject: political-compass-from-votes
status: forged
use_when: [building a voter-representative matching tool, replacing an editorial questionnaire with recorded votes, scoring alignment between citizens and legislators, publishing a match ranking over real people]
techniques:
  - divisive-vote-selection
  - theme-balanced-drawing
  - non-positional-abstention-handling
  - comparability-floor-for-ranking
  - matching-model-choice
  - disclosed-scoring-rule
---

# A political compass from recorded votes

A voting advice application in its classic form is a questionnaire: an editorial
team writes thirty policy statements, parties or candidates place themselves on
each (or experts place them), a citizen answers the same statements, and a
distance metric produces a ranked match. The subject here is the inversion of
that design: **the questions are real roll calls the chamber actually took, and
every representative's "answer" is the ballot they actually cast.** Nobody
self-places, nobody is coded by an expert, and no editorial hand writes a
statement. The citizen answers a drawn set of real votes; alignment is computed
against the record.

The inversion buys two things the questionnaire cannot. First, it measures
**behavior, not promises** — the questionnaire literature itself concedes that
stated future positions routinely diverge from voting practice, and that the
divergence is worst exactly where accountability matters most. Second, it
removes the two most attackable editorial surfaces: statement wording (a framing
choice per question) and position coding (a judgment call per cell of the
matrix). What remains attackable is precisely what this subject disciplines:
which votes are drawn, how non-answers are treated, who may be ranked, and what
formula turns matches into an ordering.

## The honest trade: what the record cannot do

A principal practitioner states the limits before the strengths, because a
compass that oversells its evidence is the same defect as a questionnaire that
oversells its coding.

- **The agenda is not yours.** A questionnaire can ask about anything; the
  record only contains what the chamber chose to put to a recorded vote. Vote
  records are a *sample* of legislative behavior, and the sampling process is
  political — whole issue areas may never reach a recorded division. The
  compass measures alignment on the decided agenda, and must say so.
- **A ballot is not a position statement.** Representatives vote against bills
  they partly like, for procedural bargains, under coalition discipline.
  Aggregation over many votes is the defense — one ballot proves nothing, forty
  form a pattern — which is why the drawing rules and floors below exist.
- **Non-votes carry no direction.** An abstention or an absence is not a weak
  "no". A questionnaire can force an answer; the record cannot, and pretending
  otherwise fabricates positions at scale.

Stating these limits is not humility theater. The published-methodology
literature's sharpest finding is that **the match a citizen receives depends
strongly on the designer's model choices** — in controlled comparisons, a
majority of users get different advice under a different scoring model. That
finding does not go away because the positions are real ballots. It transfers
whole: selection, non-answer handling, and the scoring formula are still
designer choices, and the only honest response is to make each one
deterministic, disclosed, and checkable.

## The pipeline and its invariants

The compass is a short deterministic pipeline, and each stage carries one
non-negotiable invariant:

1. **Draw the question set from the record** — by a published mechanical rule,
   never by hand. Divisiveness is the core signal (a near-unanimous vote
   separates nobody), guarded by floors: procedural motions out, minimum
   participation, and — where an automated classifier supplies topic tags — a
   confidence floor that never reads a *missing* confidence as a low one.
   Every exclusion is counted and shown; a silent filter on this surface
   breaks the entire promise that the rule replaced the editor.
   ([divisive-vote-selection](./techniques/divisive-vote-selection.md))
2. **Balance the draw across themes** — a set drawn purely by divisiveness
   collapses onto whatever topic dominated the term. A round-robin draw across
   theme buckets, with a per-theme cap, keeps the compass a compass rather
   than a single-issue referendum.
   ([theme-balanced-drawing](./techniques/theme-balanced-drawing.md))
3. **Score only positional ballots.** Abstentions, present-not-voting, and
   absences enter neither the numerator nor the denominator of any rate. They
   are displayed as counts beside the rate, so nothing hides — but they never
   move a score in either direction.
   ([non-positional-abstention-handling](./techniques/non-positional-abstention-handling.md))
4. **Rank only where comparison is fair.** A representative who cast
   positional ballots on two of the citizen's twenty questions can show a
   100% rate on a sample that means nothing. Ranking eligibility requires
   positional overlap on at least half the answered questions; below the
   floor the entity is shown, with its computable rate, in an explicitly
   unranked tail.
   ([comparability-floor-for-ranking](./techniques/comparability-floor-for-ranking.md))
5. **Choose the matching model deliberately.** The agreement rate is one
   member of a studied family — distance metrics, answer scales, salience
   weights, spatial projections — and the family's measured property is that
   reasonable members hand a majority of users different top matches. Binary
   ballots close exactly one axis of that sensitivity (the metric); every
   other axis remains a design choice and is treated as one.
   ([matching-model-choice](./techniques/matching-model-choice.md))
6. **Publish the formula next to the result.** The scoring rule — including
   its tie-breaks, and an admission of which tie-breaks are meaningless — is
   rendered verbatim on the result surface, computed by one pure, tested
   function that both the page and the stated rule import from.
   ([disclosed-scoring-rule](./techniques/disclosed-scoring-rule.md))

Determinism is the through-line: the same ledger must always yield the same
questions and the same ranking. The moment a human can nudge the set or the
order, the tool stops being an instrument and becomes an editorial with a
progress bar — and in this domain an editorial that ranks named people by
"agreement with you" is a defamation surface.

## Groups score against their line, not their average

Citizens ask two questions: "which representative matches me" and "which party
matches me". The second is not the average of the first. A party's position on
a vote is its **line** — the strict majority direction of its members'
positional ballots on that vote. A party whose positional ballots split evenly
has *no line* on that vote, and the vote is simply not comparable for it — not
a half-match, not a coin flip. Scoring a group against a synthetic centroid
manufactures a position the group never took; scoring against the line scores
the group as the collective actor it claims to be, and lets internal division
show up honestly as reduced comparability.

## The reader's lens never touches the authoritative number

A mature compass lets the citizen re-weight — emphasize themes, adjust what
counts. The boundary rule is absolute: **a reader-weighted result is a
different artifact from the published one, and the two never mix.** The default
view shows the authoritative computation; the moment any weight differs from
the published methodology, *everything* on the surface — score, rank,
distribution — comes from the reader's recomputation and is labeled as the
reader's. There is no blended state. And a malformed weighting arriving from
outside (a shared link, a stale bookmark) is rejected, never silently repaired
to the nearest valid one — a repaired lens asserts a methodology its author
never chose.

## Failure modes of the naive reading

- **Abstention scored as disagreement** (or as a midpoint) — the largest
  systematic bias available, and it always punishes the same behavior:
  principled abstention and illness alike become manufactured opposition.
- **Ranking the incomparable** — thin-overlap entities floating to the top of
  the board on two-vote samples; the ranking reads as precision and is noise.
- **The silent filter** — one undisclosed exclusion (a dropped vote, an
  uncounted threshold) on the selection surface; when discovered, it converts
  every published match into "the tool that quietly picks its questions".
- **Divisiveness monoculture** — the most divided votes of a term cluster on
  one conflict; the compass silently becomes a referendum on that conflict.
- **The editorial relapse** — "just this once" swapping a drawn question for a
  more interesting one. The whole value of the inversion is that this move is
  impossible; one exception retires the claim permanently.
- **Method-blind confidence** — publishing matches without publishing the
  rule, as if real ballots made the scoring model neutral. The model
  sensitivity finding applies to this design too; disclosure is the response.
