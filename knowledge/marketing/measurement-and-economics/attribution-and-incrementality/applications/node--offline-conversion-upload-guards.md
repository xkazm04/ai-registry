---
layer: application
type: application
subject: attribution-and-incrementality
technique: offline-conversion-upload-guards
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Offline conversion upload guards - a ledger, an exporter and a drain

The workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea` realises the
technique across three pure modules and one scheduled step, and it is the tree's
strongest realisation of anything in this subject: every guard the technique names is
a property of the data or the job, pinned by a unit test, and the upward lessons in
the technique - blank is not zero, mint on the first crossing, the marker in the same
pass, the released claim - were taken from here. The structural fact it proves is that
**a non-idempotent send can be made safe by four independent guards without any of
them being an instruction to a person.**

## The row: `src/lib/leads/conversion-events.ts`

- **Key is contact plus stage** (`conversion-events.ts:42-46, 86-88`):
  `conversionEventId = ${contactId}_${kind}`, "so a contact that regresses out of
  qualified and re-qualifies later updates its one row instead of minting a second
  (which would double-count on upload)".
- **Mint on the first crossing, never on regression** (`conversion-events.ts:119-133`):
  `qualified` on the first crossing of rank 0 to at least 1, `won` on the first
  crossing to rank 3, a direct jump mints both, "a rank REGRESSION mints nothing:
  retracting an already-uploaded conversion is a live-API problem ... and silently
  emitting a negative row here would be a lie the file format cannot express".
- **Blank is not zero** (`conversion-events.ts:56-60, 90-96`): `value: number | null`
  with "`null` = unknown - deliberately NOT 0", and `conversionValue` returns null for
  anything not finite and strictly positive: "A 0 (an empty CSV cell parsed as a
  number, a placeholder) is NOT a value."
- **No identity** (`conversion-events.ts:12-18`): the row carries a contact id, an
  attribution triple, a click id and an optional value, never a name, e-mail or phone;
  ledger rows survive an erasure because they hold no PII (`:20-24`).
- **Coverage said out loud** (`conversion-events.ts:192-200`): `gclidCoverage` is "the
  number the strip is honest with", and `LOW_COVERAGE = 0.5` in
  `src/components/app/modules/leads/ConversionLedgerStrip.tsx:63` nudges toward the
  import column below half - the technique's convention, labelled as such here.

## The exporter: `src/lib/conversions/google-csv.ts`

Click-identifier rows only (`google-csv.ts:4-10, 88-91`): "a conversion row without
one cannot be uploaded at all - not partially, not 'unattributed'", the file reports
`dropped` (`:110`), and the header row is pinned by a unit test because "a reordered
or renamed column is a rejected upload". The timestamp offset is derived per event
instant through the platform's tz database (`google-csv.ts:18-21, 64-79`), so January
and July rows are both correct. Value is blank when unknown (`:23-25, 97`). The
second network's exporter, `src/lib/conversions/sklik-sheet.ts:1-20`, is the
technique's last "when NOT to use" rule realised: no published machine contract, so a
hand-mappable sheet whose headers mirror the interface, keeping the identifier-less
rows that the platform file cannot carry.

## One row rule for dry run, file and wire

`src/lib/conversions/google-upload.ts:4-11, 39-60` states it as the file's purpose:
"THE POINT OF THIS FILE IS THAT IT IS NOT A SECOND FILTER" - `uploadableRow` imports
the stamp rule from the CSV exporter, and a unit test pins the two builders
row-for-row, so "the operator approves what the dry run showed them". The value is
omitted, never 0 (`:55-57`).

## The job: `src/lib/conversions/drain-step.ts`

The header (`drain-step.ts:4-25`) names the four guards and their test file,
`test-unit/conversions-drain.test.mjs`:

1. **Frozen authorisation** - `isDrainEligible` requires `approved`, minted only after
   a dry run seen within `DRY_RUN_MAX_AGE_MS = 24 h` (`src/lib/conversions/mapping.ts:13-16, 66-69`);
   editing the action or stages drops the approval (`mapping.ts:149-152`); `paused`
   stops the tick (`drain-step.ts:175-176`).
2. **Per-row marker in the same pass** - `markUploadOutcome` (`drain-step.ts:128-162`)
   sets `uploaded` on accepted rows and increments `uploadError.attempts` on rejected
   ones, "A failure NEVER writes `uploaded`"; the write at `:213-216` "happens in the
   SAME pass as the read of the acceptance, and it upserts by event id". The test at
   `conversions-drain.test.mjs:188` asserts a second drain sends zero.
3. **Daily claim** - `claimSentPeriod` before a single row is read (`drain-step.ts:180-181`);
   released on a transport throw when nothing was sent, kept on a `permanent`
   classification (`:227-235`), pinned at `conversions-drain.test.mjs:273`.
4. **Failure ceiling** - `DRAIN_MAX_ATTEMPTS = 3` (`mapping.ts:73`), enforced in
   `drainCandidates` (`drain-step.ts:111-126`), pinned at `:235` of the test.

Demo projects are skipped (`drain-step.ts:27-29, 173`): "an illustrative conversion in
a real ... account is a fabricated number in someone's reporting". Rejected rows
count as normal traffic and do not fail the step (`:278-281`).

## Where the tree stops short

The tree uploads by click identifier only; the platform's documented alternative
identifiers for consent-limited browsers and the user-provided-data path are absent,
which is the scout's organic F-item ("no enhanced conversions"). The
sixty-three-day click window is not checked before send - a stale row is discovered
by rejection and burns one of its three attempts. And the primary/secondary action
design that prevents the operator-designed double count is outside the tree, which
maps one action per stage and leaves the platform-side primary flag to the operator.
The standard stays on all three; the guards the tree does have are the technique's
source.
