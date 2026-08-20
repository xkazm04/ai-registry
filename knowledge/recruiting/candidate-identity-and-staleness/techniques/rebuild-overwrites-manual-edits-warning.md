---
layer: technique
type: technique
subject: candidate-identity-and-staleness
technique: rebuild-overwrites-manual-edits-warning
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [offering a re-run or refresh of a generated candidate record, a recruiter can edit machine-extracted fields, migrating or bulk-recomputing stored analyses]
---

# Rebuild overwrites manual edits

Re-running an analysis presents itself as a refresh: the same input, a newer
pipeline, a better answer. It is not a refresh. Between the first run and the
re-run, humans have been working on that record — correcting a mangled job
title, deleting an employer the extractor invented, fixing a date, annotating
that the gap was parental leave, softening a description that read unfairly.

A rebuild that regenerates from the source discards all of it. What makes this
severe is *which* content is destroyed: the human corrections were the most
reliable content in the record, and they are replaced by the machine errors
they were made to fix. The recruiter usually does not notice for weeks. When
they do, they stop trusting corrections in general, and the cost of that is far
larger than the original defect.

## The three rules, in order of preference

**1. Preserve.** Where the shape of the data allows it, a human-authored value
survives a regeneration. This requires the record to know which fields a human
touched — [every decision names its
actor](../../_laws.md#every-decision-names-its-actor) applied to a data field
rather than to a decision. A field carrying a human author is not overwritten
by a machine pass; it is left in place, and the machine's competing value is
kept alongside as a proposal the human can accept.

**2. Warn, specifically.** Where preservation is not possible, the action is
gated by a warning that names what will be lost: how many edited fields, which
ones, and when they were edited. A generic "this will overwrite existing data"
is dismissed reflexively — it is indistinguishable from the dialogue every
system shows before every action. A warning that says *four fields you edited
last Tuesday will be replaced* is read.

**3. Never silently.** If the system cannot tell which fields a human touched,
that is a modelling gap to fix, not a licence to overwrite. In the interim,
warn on every rebuild of any record that has ever been edited, and say you
cannot be precise about which parts.

## The procedure

1. **Stamp authorship at write time.** Every field or block records whether it
   was machine-generated or human-authored, and when. Retrofitting this later
   is possible but the history is lost, so the retrofit starts by treating every
   pre-existing record as possibly-edited.
2. **Diff before acting.** At rebuild time, compute what would change against
   what a human authored. If the intersection is empty, proceed without
   ceremony — most rebuilds touch nothing a person cared about, and warning
   there is how a warning gets trained away.
3. **Present the intersection, not the diff.** The recruiter does not need to
   see every changed token; they need to see the edits at risk.
4. **Offer the third option.** Accept the rebuild, keep the current record, or
   — the one that is usually wanted — rebuild and re-apply my edits on top.
5. **Snapshot before overwriting.** A rebuild that destroys human work must be
   reversible for a meaningful window, and the undo must be discoverable from
   the record, not from a support request.
6. **Record the event.** Who rebuilt, when, what was replaced. A record whose
   contents changed with no event behind it is unauditable, and the question
   "who deleted my correction" must have an answer.

## Bulk rebuilds are the dangerous case

The single-record path gets a dialogue and is usually fine. The damage happens
in migrations and backfills, where a pipeline upgrade recomputes thousands of
records overnight and nobody is standing at a dialogue.

- A bulk rebuild **skips** records carrying human edits by default and reports
  the count skipped. Those are handled deliberately, not swept along.
- If the migration genuinely must include them, it snapshots first and produces
  a list a human can walk.
- It never runs unattended over a population it has not first counted. "How
  many of these have been edited?" is the question that must be answered before
  the job is scheduled, not after.
- The skipped set is [uncertainty resolving toward the
  candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate) in a
  quiet form: those corrections usually exist because the machine reading was
  unfair to someone.

## Decision rules

- Human-authored beats machine-generated on every automatic path. A machine
  overwrites a human only when a human chooses it, per record.
- Warnings name the loss concretely, or they are noise.
- No warning where nothing edited will be lost — precision is what keeps the
  warning credible.
- A rebuild is an event with an actor and a timestamp, never an invisible
  refresh.
- Preserve a reversal path with a stated window, and say the window in the
  warning.
- Do not describe the outcome of a rebuild before it runs — "this will improve
  the extraction" is a claim the record does not hold
  ([say only what the record
  holds](../../_laws.md#say-only-what-the-record-holds)). Say what changes, not
  that it gets better.

## When not to use it

Do not gate rebuilds of records that carry no human authorship at all. A purely
derived artifact — a cache entry, a recomputed index — should refresh freely,
and putting a confirmation in front of it teaches people to click through
confirmations.

Do not use warnings as a substitute for the authorship model. A team that warns
on everything because it cannot tell what a human touched has converted an
engineering problem into a recruiter's problem, and the recruiter will solve it
by not re-running anything, which leaves the whole population on a stale
instrument.

And do not preserve human edits across a change in the *source document*. If
the candidate submitted a new document, the old corrections describe the old
artifact and re-applying them silently is a fabrication — surface them for
review instead, attached to the record they came from.
