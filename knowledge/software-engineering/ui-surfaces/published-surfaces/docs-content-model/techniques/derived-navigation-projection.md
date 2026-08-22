---
layer: technique
type: technique
subject: docs-content-model
technique: derived-navigation-projection
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [a sidebar list drifting from the real topic set, a count typed into prose going stale, deciding what crosses the server-client boundary for navigation]
---

# Derived navigation projection

A documentation surface needs the same catalog in four or five different
shapes: a grouped tree for the sidebar, a flat ordered sequence for the
previous/next arrows, a URL list for the machine-readable site inventory, a
term-and-summary list for the search index, and one or two numbers for the
landing page. Each of those is a **projection** — a pure function from the
catalog to a smaller shape — and the technique is the discipline of never
letting any of them become a second stored thing that a human maintains.

## The second list is the failure this exists to prevent

The sidebar is where it always starts. Someone needs a tree, the catalog is
flat, writing the grouping function takes ten minutes and typing the tree
takes two, so the tree gets typed. It is correct on the day it is written. It
drifts on the day a topic is added by someone who does not know the second
list exists, which is the same day a reviewer looks at a green build and a
correct-looking sidebar and approves it. Two hand-maintained copies of one
vocabulary are a race with a delay fuse
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and the fuse in a documentation surface is unusually long, because nothing
fails when a topic is merely absent from navigation — it just quietly stops
existing for every reader who navigates instead of searching.

The projection function is the fix, and it is small: group by category, order
by declared position, break ties by stable identity so the output is
deterministic across builds and unrelated diffs stay out of the review.

## Ordering is declared data, and it is the one field that must not be implicit

Alphabetical ordering is not a curriculum, and a documentation section is a
curriculum: the topic a newcomer needs first is rarely the one whose title
starts with A. So position is a field on the record, declared by the author.
Two consequences follow.

First, positions collide and gap, and both are fine — the projection sorts,
it does not index. What it must not do is depend on the *order of the source
declaration*, which is invisible in review, changes under any tooling that
reformats, and gives an author no way to express intent.

Second, ties need a stable second key. Two topics at the same position sorted
only by position will swap places between builds, which shows up as a diff in
generated output that nobody can explain and everybody eventually stops
reading.

## Counts are the smallest projection, and the one that rots first

A number typed into a sentence — *"eleven sections covering sixty-three
topics"* — has no relationship to the thing it counts. It was true once. It
becomes false silently, in a commit that had nothing to do with it, and it is
read by exactly the audience least able to detect it: a first-time reader on
the landing page, who now knows the surface is not maintained.

Derive it, and derive it from the same visible set the navigation uses. Then
carry the predicate with it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
"sixty-three topics" must mean the same population as the sidebar shows, or
the reader will count the sidebar and find a different number. If drafts are
hidden, the count is over visible topics; if a section is excluded from
navigation for some other reason, the count excludes it too, and the phrase
that names the number says what it counted.

One refinement worth taking where the number is prose rather than a
measurement: **round down and say "more than."** A derived exact count in a
marketing sentence invites the reader to audit it against the sidebar and
makes every off-by-one a visible inconsistency; a count floored to a round
number and rendered with a plus stays true under any growth and under small
disagreements between populations. It is not a licence to skip the predicate —
the floor must still be taken over the visible set, or the hedge is covering
for a consumer that skipped the door rather than for honest imprecision.

## Where the projection is computed decides whether it saved anything

This is the part that is easy to get wrong and invisible when you do. The
projection function and the catalog it reads are in the same module graph. If
a client-side component imports the projection function, it imports the
catalog transitively — the whole record set, every summary, every field —
and the reader downloads all of it to render a list of titles. The code looks
like a derivation and behaves like an inlined copy of the corpus.

The rule: **the boundary is drawn at the projected value, not the projection
function.** Compute where the catalog already lives — the build step, the
server render, the generation pass — and hand the small result across. A
sidebar tree of titles and slugs is a fraction of the record set that produced
it, and that fraction is the entire point of splitting metadata from bodies in
the first place.

Two decision rules that follow:

- **When the consumer needs the projected value, pass the value.** The
  projection module should be importable only from the side that has the
  catalog, and saying so in its own header is worth more than it sounds,
  because the mistake is made by the next person adding a feature, not by the
  author.
- **When the consumer must re-project — a client filtering navigation as the
  user types — pass a trimmed record set, deliberately.** Name what was
  trimmed. The failure to avoid is not "data crossed the boundary"; it is
  "data crossed the boundary by accident and nobody knows how much."

## Cached and pre-rendered projections name their recomputation

A navigation tree baked into a build output, an inventory file written to
disk, a search index emitted at deploy: all are stored derived values, and
each one names how it is rebuilt
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
In this model the recomputation is cheap and total — re-run the projection
over the catalog — which is a genuine advantage over an incrementally
maintained index, and it should be stated where the artifact is produced so
that nobody ever repairs one of these by editing the output.

## When not to project

Two cases justify a declared structure that is not a pure function of the
catalog, and they are both about the navigation carrying information the
records do not:

- **A curated entry path** — a hand-ordered "start here" sequence that
  deliberately crosses categories. That is content, not navigation, and it
  belongs in a record of its own with the same referential assertions as any
  other, not in a hard-coded array.
- **Externally addressed nodes** — a navigation entry pointing somewhere
  outside the catalog. Model it as an entry kind on the record so the
  projection stays total; a special case handled in the projection function is
  a second list wearing a function's clothes.
