---
layer: technique
type: technique
subject: docs-content-model
technique: per-topic-freshness-metadata
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [no way to tell which documentation topic is out of date, designing optional fields whose emptiness must not be read as coverage, choosing how precisely a topic should name the sources it describes]
---

# Per-topic freshness metadata

Every documentation corpus past its first year contains topics that are true,
topics that are false, and no way to tell them apart. The reader cannot; the
author cannot without re-reading; a reviewer looking at the corpus sees a
uniform wall of equally-plausible prose. The fix is not a scanner — that comes
later and belongs to someone else. The fix is that **the record carries the
claim**, as typed fields, so that there is something to scan at all.

## The three fields

**Review date.** When a human last read this topic against the thing it
describes and concluded it was still true. Not the file's modification time,
which a formatting pass resets, and not the publication date, which never
moves. It is a human's assertion, and its whole value is that it is one.

**Checked-against version.** What the topic was verified against: a release
tag, a schema version, a product version. A review date alone dates the claim;
the version dates the *subject of the claim*, and the two answer different
questions. A topic reviewed recently against a version three releases old is a
different risk from one reviewed long ago against current — and the pair is
what lets a reader decide whether to trust the page in front of them.

**Watched sources.** Which parts of the product this topic makes claims about,
declared as data. This is the field that lets anything downstream be automatic
at all: without it, "has this topic gone stale" is unanswerable except by
reading, and reading does not scale past the corpus's first hundred pages.

All three are **optional**, and making them optional is a deliberate choice
with a cost that must be paid explicitly in the next section. The alternative
— required fields — buys uniform coverage and pays for it in fiction, because
an author who has not reviewed a topic and must supply a date will supply one.

## Absence is given a meaning, in the type, in writing

An optional field left empty is ambiguous by construction: "nobody filled this
in" and "there is nothing here to fill in" produce identical bytes. Leave the
ambiguity in place and every consumer resolves it in the direction that
produces no work, which folds the unknown into the healthy and turns the
model's blind spot into a health claim
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success):
a topic nobody has assessed must be spelled differently from a topic assessed
as current).

So each field's absence gets a declared meaning, written where the field is
declared — in the type's own documentation, which is the one place a
consumer's author is guaranteed to look:

- **No watched sources** means *this topic is intentionally conceptual* —
  prose that no code change can invalidate — and not *this topic was
  overlooked*. That meaning is only honest if somebody actually made the call
  per topic, which is why it is worth stating: the declaration converts an
  unfilled field into a decision that a reviewer can dispute.
- **No review date** means *never reviewed*, and it is the strongest signal in
  the set. It must never render as "up to date" and never be excluded from a
  denominator.
- **No checked-against version** means *the topic makes no version-specific
  claim*, which is common and legitimate for conceptual pages and suspicious
  for reference pages — a distinction a consumer can act on only because the
  meaning was declared.

The same discipline extends to every other optional field on the record, and
the clearest case is asset coverage: a topic that declares no illustration
recipe is *intentionally text-only*, not un-illustrated. Declaring it turns
"how illustrated is this corpus" from a number nobody trusts into a number
with a denominator.

## A backfilled date is not a review date

The temptation, once the fields exist, is to populate them in one pass so the
corpus is uniformly covered — dates derived from version-control history,
versions taken from whatever was current on the day of the backfill. It
produces a complete-looking table and it defeats the field, because the value
no longer records what the field's name promises: nobody read the topic, and
the version it names is the version that existed when the script ran, not the
version anything was checked against. A corpus where every topic carries a
plausible date is indistinguishable from a corpus where every topic is
trustworthy, and it will be read as the second.

If a backfill is unavoidable — and on a large existing corpus it often is —
give the backfilled values a different spelling from the earned ones: a
separate field, a sentinel, a flag on the record saying *derived, not
reviewed*. One character of distinction preserves the whole instrument. What
the backfill must never do is write into the same field a human review writes
into, because after that no consumer can tell the two apart and the honest
report is gone.

Any figure computed over these fields carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
"Ninety-two percent reviewed" is not a finding until it says whether the
never-reviewed topics were in the denominator, whether the intentionally
conceptual ones were, and what "reviewed" was measured against.

## Watch sets are deliberately coarse, and that is a decision, not sloppiness

The instinct is to name the exact artifacts a topic describes. Resist it. A
precise watch set is precise about a layout that moves: it goes stale under
the first refactor, silently stops matching anything, and then reports the
topic as untouched forever — the failure mode is a false *clean*, which is the
expensive direction.

A coarse set — the feature area, the module, the directory that owns the
behavior — over-matches instead. It flags a topic for review when something
nearby changed and the topic was fine. That costs a person a minute of
reading. The precise set's failure costs a reader's trust in the whole
surface, and it costs it invisibly.

State the asymmetry in the field's own documentation, because the next author
to touch it will otherwise "improve" the set by narrowing it. And declare a
review cadence *floor* alongside: a topic whose watched area genuinely has not
changed in a year is not thereby verified — the product around it moved, and
the passage of time is its own staleness signal.

## What the fields do not do

They do not detect drift. They are the data a detector reads, and the detector
— the pass that takes a topic's watched sources and its review date and
interrogates what changed since, across artifacts if it must — is the
docs-synchronization discipline's, not this one's. The division is worth being
strict about, because it is the one place this subject is tempted to grow a
second implementation of somebody else's gate: **a field on a record is a
content-model decision; a query over that field is a stewardship one.**

They also do not belong in the rendered page by default. A review date shown
on every topic is a promise the corpus has to keep on every topic, and the
first stale date a reader notices discredits the fresh ones beside it. Publish
the date where the corpus is healthy enough to defend it, and keep the fields
internal where it is not — but keep them, because the fields are what make the
health measurable in the first place.
