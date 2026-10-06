---
layer: technique
type: technique
subject: llm-dialogue-quality-control
technique: measured-banned-pattern-list
status: forged
laws: [law-and-check-share-one-source, a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input]
shared_with: []
use_when: [building the filter that strikes stock phrasing from generated lines, a ban list has grown until nobody knows why an entry is on it, the generator model changed and the tells changed with it]
---

# Measured banned-pattern list

The named concern: keep one list of the phrases and structures that mark a line as
machine-made, prove each entry with a measurement or label it as editorial, and enforce it
with a filter after generation rather than with a prohibition in the prompt.

## Two tiers, never merged

A **measured** entry is a pattern that the production generator, under the production prompt,
produces many times more often than human dialogue of the same kind does. It carries its
evidence: the pattern, the over-representation ratio, the size of both samples, the model and
version that produced the generated sample, and the date. An **editorial** entry is a pattern
a lead has decided against — a cliché of the genre, a word the setting would not have, a
construction the house style forbids. It carries its owner and its reason.

Both tiers are legitimate and both are enforced. They are kept apart because they age
differently and are argued differently. A measured entry is a fact about one model; when the
model changes, it is re-measured and may fall off. An editorial entry is a decision; it changes
when its owner changes it. A merged list cannot be audited: a writer who wants to use a
forbidden word cannot tell whether they are arguing with evidence or with somebody's taste, and
the list grows by accretion until it forbids ordinary speech. The rule: **an entry without
either a measurement or a named owner is removed.**

A source is measured only if it counted. A published study that compared generated and human
text at stated sample sizes is a measurement; a community catalogue of "signs of machine
writing", however well curated, is a collection of editors' judgements and puts its entries in
the editorial tier. And a measurement on someone else's models is evidence that the pattern is
worth testing for, not proof that the production generator produces it: an entry imported from
a study is provisional until it is re-measured on the production prompt.

## Measuring

Sample the generator in volume with the production prompt — the same voice entries, the same
situations, the same constraints — and assemble a reference sample of human-written dialogue
of comparable genre, register and length. Count each candidate pattern per thousand lines in
both and rank by ratio. Seed the candidate patterns from three places: n-grams that are far
more frequent in the generated sample, a reviewer's notes on what made lines feel generated,
and the structural shapes known to recur in model prose. Report the ratio with its basis,
because "over-used" without the reference corpus and the counts is an opinion, which is
[a number carries its unit and its basis](../../../../_laws.md#a-number-carries-its-unit-and-basis).

The structural tier is the one a word list misses and the one that matters most in dialogue:
the three-item list; the "not X, but Y" reversal; a rhetorical question answered by the same
speaker; the closing aphorism that summarises the exchange; a speaker naming their own emotion
and its cause; address by name in most lines; every turn a complete, balanced sentence; a
reply that restates the question before answering it. Express each as a pattern a checker can
run, or as a rubric criterion where no pattern is precise enough, and say which.

## Enforcing

The list is applied **after generation, by a filter**, not written into the prompt. A
prohibition in the prompt names the thing and makes it more available to the model, and when
the model does obey, it substitutes the nearest neighbour — a banned noun is replaced by its
synonym in the same construction, and the line keeps the shape that made it generic. The prompt
carries the positive version of the instruction instead: what the speaker does, in rows from
their voice entry.

Lexical entries strike a candidate outright. A person may override a strike — the word is
right for this speaker in this moment — and the override is logged with the line and a written
reason. Overrides are the list's correction channel: an entry that is overridden again and
again is wrong for this cast and goes back to its owner. Structural entries are usually rationed rather
than forbidden — a three-item list is fine once in a scene and a tell when every speaker uses
one — so they carry a rate limit per scene or per speaker, and the filter counts across the
batch, not only within a line. The filter reads the list from its single canonical file;
nobody types a copy into a checker, which is
[the law and the check that enforces it share one source](../../../../_laws.md#law-and-check-share-one-source).
It reports, per batch, how many candidates it read, how many it struck and on which entry,
which is [an instrument proves it had input](../../../../_laws.md#an-instrument-proves-it-had-input);
a filter that read nothing must fail loudly rather than pass the batch.

## The ledger of phrases already spent

A script generates its own stock phrases. A line that is fresh in its slot becomes a tell when
the same image or turn of phrase appears in the fourth slot, or in a second character's mouth.
So every accepted line records its key phrases in a ledger, and the filter checks each
candidate against it as well as against the list: a hit on another speaker's phrase is a
strike, a hit on the same speaker's is a rate question. The ledger is the measured list's
local twin — measured on this script rather than on a corpus — and it is what keeps repetition
across a long project from accumulating unseen.

## Watching substitution

After a measured entry is enforced, re-measure. Generators route around a ban: the struck
phrase reappears as a sibling with the same rhythm. A list that only grows by appending each
new sibling is a list chasing a shape, and the right move is to promote the shape to a
structural entry. The strike rate per entry is itself a signal: an entry that strikes most of a
batch says the prompt is producing the pattern and needs a positive instruction upstream, not
a stricter filter downstream.

## Decision rules

- **When an entry has neither a measurement nor a named owner, remove it.**
- **When the generator model or its version changes, re-measure the measured tier** before
  trusting it; keep the editorial tier.
- **When a ban produces a sibling phrase in the same construction, promote the construction**
  to a structural entry rather than banning the sibling.
- **When one entry strikes most of a batch, fix the prompt**, because the filter is now doing
  the specification's job at the cost of the candidate count.
- **When a character's voice entry calls for a banned pattern** — a preacher who speaks in
  triads — the voice entry wins for that speaker, recorded as a named exception.
- **When an entry's only source is a catalogue rather than a count, file it as editorial.**
- **When a person overrides a strike, log the line and the reason**; never let an override
  happen by silently editing the list.

## When not to use this

A handful of hand-written lines with no generator needs a style note, not a measured list. A
list measured on a different model is a starting point, never a verdict on this one.

## Evidence status

That generated text over-uses particular words and constructions at measurable ratios against
human writing is established by primary measured studies of model fiction: one counted stock
phrases at hundreds to over a thousand times their human rate, a single invented name at tens
of thousands, and the "not X, it's Y" reversal at up to about six times, with over-use
clustering by model family. Those are prose measurements on other models; no dialogue-specific
ratio has been measured for a production generator here. Several patterns commonly listed as
tells rest only on a curated community catalogue, which this document treats as editorial. That a prohibition in
the prompt tends to plant the forbidden phrasing comes from model vendors' primary prompting
guidance and from practitioner reports, not from a controlled study. The two-tier split,
substitution watching and rate-limited structural entries are practitioner synthesis. None of
this has been tested in a played game.
