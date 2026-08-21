---
layer: technique
type: technique
subject: candidate-identity-and-staleness
technique: label-collision-detection
status: forged
laws: [meaning-does-not-live-in-a-label, uncertainty-resolves-toward-the-candidate, say-only-what-the-record-holds]
shared_with: []
use_when: [auditing a store that was keyed on file names or display names, two candidate records look suspiciously like one person, migrating away from a label-derived identifier]
---

# Label collision detection

A label is what a human typed: an upload's file name, a display name, a title
someone entered in a form. Labels collide, constantly and predictably, because
people choose them for their own legibility and a large share of the world
chooses the same handful of generic words.

The failure this technique addresses is not hypothetical and not rare. Key a
candidate store on the document label and you will hold two different people
under one identifier within a few hundred applications — because a great many
people name their application document with the local word for "CV", or
"resume", or "application", or simply their own first name. Whichever record
arrives second either overwrites the first, is discarded as a duplicate, or is
merged into it. The merge is the worst case: a composite person made of one
candidate's employment and another's education, entirely plausible because
every individual fact in it is true.

## Why detection is a separate job from the fix

Switching the key to content-addressed identity stops new collisions. It does
nothing about the ones already in the store, and those do not announce
themselves — a merged record has no error state, no null field, no exception in
a log. It reads as a slightly unusual career. This is why a migration off
labels needs a *detector*, run over history, before anyone declares the problem
solved.

## The procedure

1. **Enumerate every place a label is compared.** Not stored — compared. Look
   for equality checks, uniqueness constraints, upserts, "already exists"
   branches, and cache keys built by string concatenation. Each is a collision
   site.
2. **Measure the collision rate you already have.** Group historical records by
   the label and count groups with more than one distinct underlying artifact.
   The number is almost always higher than the team's estimate, and it is the
   argument that gets the migration funded.
3. **Separate genuine repeats from collisions.** Within a group, compare the
   content digests. Same digest across records is one artifact legitimately
   submitted several times. Different digests under one label are candidate
   collisions.
4. **Classify each candidate collision.** Different content under one label is
   either one person who revised their document, or two people. Distinguish
   them on the strongest independent signals available — verified contact
   address, account, invitation token, submission provenance — never on the
   name inside the document, which is itself a label.
5. **Quarantine, do not auto-split.** A record you believe is a composite is
   flagged for a human, with both underlying artifacts shown side by side. An
   automated un-merge guesses which facts belonged to whom, and a wrong guess
   creates two wrong records instead of one.
6. **Instrument the live path.** After the migration, keep a counter on
   "distinct content arriving under an identical label". It should be a large,
   boring, expected number — and if it ever drops to zero, someone has
   reintroduced a label key upstream.

## Decision rules

- A label may be displayed, searched, and sorted. It may never be an equality
  key, a uniqueness constraint, or a component of a cache key.
- When two records share a label and differ in content, the default is **two
  records** — [uncertainty resolves toward the
  candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate). Keeping
  two records for one person costs a recruiter a moment of confusion; merging
  two people costs both of them a fair reading and is close to unrecoverable.
- Never resolve a collision by preferring the newer record. "Last write wins"
  on a person's identity means the second applicant deletes the first, and the
  first has no way to know it happened.
- Do not "fix" a collision by appending a timestamp or a counter to the label.
  That produces unique labels and no identity at all — the records are still
  unrelated to their true owners, just no longer visibly colliding.
- Report what the detector found in the terms the record supports: "two
  distinct documents recorded under one identifier" is a fact; "this record
  contains two people" is a conclusion a human confirms —
  [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds).

## Signals that a composite already exists

None is conclusive alone; two together warrant a human look.

- Overlapping employment periods that could not be held by one person, in a
  record with no stated concurrency.
- A career narrative that changes register or language partway through.
- Two different contact addresses or phone numbers on one record with no
  explicit update event.
- An analysis whose extracted facts contradict each other on stable
  attributes — different graduation years for the same institution, two
  mutually exclusive locations at one date.
- A record whose content digest set has more than one member for a period when
  the person made no submission.

## When not to use it

Do not run this detector on stores that were never label-keyed. It generates a
long list of legitimate same-name records and trains people to dismiss its
output, which is worse than not running it.

Do not apply it where the "label" is in fact a controlled, issued identifier —
an invitation token, an account handle, a government-issued reference. Those
are keys, not labels; the distinguishing question is whether the string was
*issued by a system* or *chosen by a person*.

And do not use collision detection as a general duplicate-person finder. It
finds one specific defect: distinct content sharing a human-chosen name. Person
matching across records with different labels is a different, probabilistic
problem, and this detector will find none of it.
