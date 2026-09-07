---
name: agent-platform-error-ingestion
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/error-triage
---

# Agent platform error ingestion

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Some automated work announces its failures and some just stops, so a record
built only from the announcements is missing exactly the failures nobody noticed. The
record then lies in the reassuring direction: a fleet that emitted nothing looks
identical to a fleet that is fine, and a run that never ended looks identical to one
still working.

**Input.** The failure events the platform emits, the execution history that has to be
swept for runs which emitted nothing, and the record already held.

**Core action.** Catch failures both ways at once, keep what arrived before deriving
anything from it, and decide what is genuinely a repeat of a failure already held rather
than a second failure that happens to look the same.

**Output.** One searchable record covering announced and silent failures alike, with
repeats collapsed against a stable identity, a stated retention horizon, and the
coverage of each sweep recorded so a gap in the record is visible as a gap.

## Activities

1. Take the failures the platform announces *(observe)*
2. Sweep execution history for runs that stopped without announcing anything *(observe)*
3. Keep what arrived, as it arrived, before deriving anything from it *(act)*
4. Decide what is a repeat of a failure already held rather than a second one *(decide)*
5. Append to the record downstream reads, with the sweep's own coverage *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A run that stopped without saying anything ends up in the record alongside the ones
that announced themselves.**

- A run that has been unfinished longer than the horizon the adopter set for its kind of
  work is recorded as a failure, not left as in progress.
- The record distinguishes a failure the platform reported from one inferred by the
  sweep, because the second carries less detail and a reader should know that.
- A run that was retried and then succeeded is recorded according to a stated policy
  rather than being counted or dropped by accident.
- An inferred failure the operator sends back as a run that was merely long is kept with
  that verdict against the kind of work it belonged to, and the horizon for that kind
  widens, rather than the same long runs being declared dead by every sweep.

**A period the sweep did not cover is distinguishable from a period in which nothing
failed.**

- Every sweep records the window it covered, so a missed sweep leaves a stated hole
  rather than a quiet clean stretch.
- A sweep that ran and found nothing is recorded as having run, so the next one does not
  re-examine the same window and a stopped sweep is noticeable.
- A sweep resuming after an outage covers the window it missed, or says plainly that the
  window is unrecoverable, rather than starting fresh from now.

**One failure appearing twice is one record, and two identical failures are two.**

- Identity is taken from something the platform assigns to the occurrence, not from the
  shape of the message, so two genuinely separate failures that look alike are kept
  apart.
- The window over which repeats are collapsed is longer than the longest delay with
  which a failure can arrive, and it is stated rather than assumed.
- Nothing is discarded on ingest for being unrecognised; an unparseable failure is held
  raw and marked unparsed.

## Guidance

This layer adds no judgment beyond identity, and the identity has to come from the
occurrence rather than from the text, or two real failures that read the same become
one. Keep what arrived before normalising it: a normaliser that quietly drops what it
does not understand destroys the only copy. Silence is the failure mode this exists for,
which is why an uncovered window has to look different from a quiet one. Retention here
is the floor on every comparison anything downstream can make.

## Where this is worth adopting

- An operation whose automated work has grown past the point where anyone would notice a
  job that stopped running, since nothing arrives to notice.
- A fleet where the same failure is announced by an event and again by the sweep that
  finds the failed run, and both land as separate records until identity is taken from
  the run rather than from the message.
- A team about to start reporting on reliability, who need a record that reaches back
  far enough for the first report to compare against something.
- Recovering from an outage of the platform itself, when the honest question is which
  window the record covers and the tempting answer is to resume from now and never say
  so.
- An operator running several workspaces from one installation, who wants their failures
  in one place but not in one report.

## Connector types

None. This work needs no external connector: the tools the agent already has are enough.

## Recommended trigger

`time`. A silent failure emits nothing, so the only thing that finds it is regular
sampling, and a gap in the sampling is a hole in the record rather than a late report.
That is what keeps a clock here where most reading and digesting work in this corpus is
better self paced: the obligation is to have looked, not to have something to say.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- How long the record must reach back, because retention is the hard floor on what any
  later comparison can be made against and shortening it silently shortens every trend
  built on it.
- How long a run of each kind may legitimately take before silence means failure,
  because that horizon is the entire difference between catching a stopped run and
  reporting healthy long ones as dead.
- Which agents or workspaces belong in one record, since an operator running several may
  want one index and separate reports, or the reverse.
- Whether a failure that succeeded on retry counts as a failure here, which is a policy
  the adopter owns and which changes every number downstream.

## Dependencies

None.
