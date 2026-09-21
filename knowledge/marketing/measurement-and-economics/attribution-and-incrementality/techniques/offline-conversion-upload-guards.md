---
layer: technique
type: technique
subject: attribution-and-incrementality
technique: offline-conversion-upload-guards
status: forged
laws: [not-measured-is-not-zero, a-gate-before-money-and-copy, platform-reported-is-not-causal]
shared_with: []
use_when: [pipeline stages such as qualified or won are being sent back to an ad platform, an automated job posts conversions to a platform on a schedule, a conversion export file is being built for manual upload]
---

# Offline conversion upload guards

A lead-generation business converts in its pipeline days after the click, where no
platform can see. Uploading the qualified and won stages back to the platform, keyed on
the click identifier the platform stamped on the landing URL, teaches the platform's
bidding which clicks were worth having. It is a measurement act with side effects:
every row changes what the platform optimises toward, and the platform offers no
retraction. The guards below are structural - each is a property of the data or the
job, never an instruction to an operator.

## The row

- **Click identifier rows only.** The platform matches an offline conversion to a
  click by its identifier and by nothing else; a row without one cannot be uploaded,
  not partially and not "unattributed". The exporter emits identifier rows only and
  states how many it dropped. A file silently missing a third of the conversions makes
  the operator conclude the ledger is broken rather than that their import lacks the
  identifier column. Below a coverage share - half is a convention - the surface
  nudges toward fixing the import rather than merely stating the number.
- **Blank is not zero.** A conversion of unknown value is uploaded with no value. Zero
  tells the platform the conversion was worth nothing, and the bidding learns it; an
  empty cell parsed as a number is the usual way zero arrives.
- **The timestamp carries its offset**, computed for the event's own instant and not
  for "now", so a winter conversion and a summer one are both right rather than
  uniformly shifted by an hour of daylight saving.
- **No identity.** The row carries the click identifier, the action, the time and an
  optional value; never a name, an e-mail or a phone number. Rows leave the product
  and survive an erasure, so they must be anonymous by construction.
- **Minted on the first crossing, never on regression.** A contact that re-qualifies
  updates its one row - the row's key is contact plus stage - rather than minting a
  second, and a contact that regresses mints nothing, because a negative row is a lie
  the file format cannot express.

## The job

Four independent guards, each pinned by a test, because a job that posts conversions
is the one job that is not idempotent by nature:

1. **A frozen authorisation.** Nothing sends unless the mapping is approved, and
   approval is minted only after a dry run the operator saw within a bounded age - a
   day is the convention - showing exactly the rows a real run would take. Changing
   the action or the stages revokes the approval. Paused stops the next tick dead.
2. **A per-row marker written in the same pass the acceptance was read.** An accepted
   row gains the marker immediately; the next query excludes it. Run the job twice and
   the second run sends zero rows.
3. **A claim over the day**, taken before a single row is read, so two overlapping
   invocations cannot both read the same unmarked rows before either marks them. The
   claim is released when the transport failed and nothing was sent, so the next tick
   retries; it is kept on a permanent rejection so the job does not hammer the same
   malformed request all day.
4. **A failure ceiling.** A rejected row is marked with its error and never with the
   upload marker, and after a small number of attempts it is no longer offered, so a
   permanently malformed identifier does not consume the batch forever. Rejected rows
   are normal traffic - a stale identifier, a conversion outside the click window -
   and do not fail the job.

The dry-run table, the downloadable file and the bytes that reach the platform are
built by one row rule, so the operator approves the set that is sent and not a
neighbour of it.

## What the platform adds, and what it does not

The platform's own documentation states two backstops: a conversion uploaded more
than sixty-three days after the click is not imported, and a duplicate on the
platform's key - identifier, action name, date and time - is counted once and answered
with an error. Neither replaces the guards. A resent row with a different timestamp
is a different conversion to the platform, and the window is why a pipeline that
qualifies slowly must upload on a schedule rather than in a quarterly batch.

The double count the platform cannot see is designed in by the operator: an online
form-submit action and an offline qualified action both marked primary, so one lead
counts twice in the column the bidding reads. One outcome per stage, one action per
outcome, and only the stage the business actually optimises toward marked primary.

## Decision rules

- When a row has no click identifier, drop it from the platform file and say so, and
  route it to whatever hand-mapped sheet a second platform accepts, because an
  unmatched row cannot be uploaded and a silent drop is read as a broken ledger.
- When a value is unknown, send no value, because zero is a claim of worthlessness the
  bidding will learn.
- When a send fails at the transport, release the day's claim and mark nothing,
  because nothing landed and the rows must be re-offered; when it fails permanently,
  keep the claim, because the same request fails again in an hour.
- When the project's data is illustrative, skip it entirely, because an illustrative
  conversion in a real account is a fabricated number in someone's reporting.
- When two conversion actions would fire for one lead, mark one primary, because the
  bidding column is the one place a double count compounds into spend.

## What is convention here

The half coverage nudge, the one-day dry-run age, the batch size and the attempt
ceiling are practitioner conventions. The identifier-only match, the sixty-three-day
window and the platform-side duplicate key are documented platform behaviour, and
dated: they are the platform's current rules and are re-checked, not assumed.

## When NOT to use

Do not upload from a pipeline whose stages are not stable - a board where "qualified"
is reassigned casually feeds the bidding noise with a ledger's confidence. Do not
upload a stage the business does not want more of; the platform optimises toward what
it is told, and a "contacted" upload buys contacts. Do not build the platform file for
a network that publishes no machine import contract; produce a hand-mappable sheet
whose columns mirror that network's interface and say that it is one, rather than
guessing a format the operator discovers by rejection.
