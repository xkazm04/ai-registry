---
layer: technique
type: technique
subject: quality-regression-gating
technique: unverified-vs-regressed-exit-states
status: forged
laws: [never-present-absence-as-an-answer, statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [wiring a benchmark into a pipeline step, designing exit codes for a gating command, a run without a baseline must not read as passing]
---

# Unverified vs regressed exit states

A pipeline step branches on an exit code, and an exit code is the narrowest
channel in the whole quality apparatus: every nuance of the statistical
verdict must survive compression into a handful of integers, because the
integer is all the pipeline sees. The naive contract is binary — zero for
fine, nonzero for not fine — and it destroys exactly the distinction that
matters most: **"we found a regression" and "we could not verify" are
different facts that warrant different responses.** A regression is
evidence of harm; an unverified run is *absence* of evidence, and absence
presented as either answer — green or red — is a lie in the direction the
reader least expects.

## The three-state contract

| State | Meaning | Typical pipeline response |
| --- | --- | --- |
| **Passed** (exit 0) | the statistical verdict ran and found no regression | proceed |
| **Regressed** (its own nonzero code) | the corrected test fired — evidence of harm | hard-fail the build, quote the verdict |
| **Unverified** (a *different* nonzero code) | no verdict exists: no baseline to gate against, a partial or halted run, a cancelled or refused run | policy decision — warn-and-proceed, or block, per channel |

The two nonzero codes are the entire point. Collapse them and one of two
failure modes is forced on every consumer:

- Unverified maps to 0 → a benchmark with no baseline, or a run that
  judged a third of its cases, reads as a green build. The gate silently
  stops gating the moment its preconditions erode, which is precisely
  when nobody is watching it.
- Unverified maps to the regression code → every newly added benchmark
  (no history yet) hard-fails the build. Teams respond by marking the
  step non-blocking, and now *real* regressions are non-blocking too.

With distinct codes, the policy question — "how strict is this channel
about unverifiable runs?" — moves to the pipeline definition, where it
belongs and where it is reviewable, instead of being decided irrevocably
by the tool's exit-code table.

## Procedure

1. Enumerate every terminal run status the tool can produce, and map each
   to exactly one of the three states. The unverified bucket collects
   everything that means "no defensible verdict": no baseline recorded,
   run halted by a cost ceiling, run cancelled by an operator, run
   refused by a pre-flight check (partial-run-never-green).
2. Reserve one exit code per state, document them as a public contract,
   and treat the mapping as frozen — pipelines encode these integers in
   places no deprecation notice reaches.
3. Make the gate mapping a pure function of the run's recorded status —
   the same status field the report and the API expose — so the exit
   code, the report banner, and the query surface can never disagree
   about what happened.
4. Pair the code with a one-line reason on the error stream ("no baseline
   recorded for this benchmark"; "run partial: 12 of 40 cases judged"),
   because the human reading a red pipeline sees the log before the docs.

## Decision rules

- **Gating is opt-in per invocation.** A plain benchmark run in a
  developer loop must not fail a shell on an unverified status; the same
  run under a `--gate`-style flag must. The flag is the declaration "I am
  a pipeline step", and only that declaration activates the contract.
- **When a status is unrecognized** (a legacy value, a newer writer than
  reader), decide the default *deliberately* and document it. Mapping
  unknowns to non-blocking keeps old pipelines alive across upgrades but
  means a misspelled status silently unguards the gate — acceptable only
  because statuses come from the same codebase; if statuses ever cross a
  trust boundary, unknown must mean unverified.
- **When a channel wants unverified to block** (a production promotion
  path), implement that in the pipeline's branch on the unverified code
  — never by remapping the tool's codes, which would fork the contract
  across channels.

## When not to use it

- Inside the run, before a verdict exists: intermediate statuses are the
  runner's internal state machine, not the gate's vocabulary. Only
  terminal statuses map.
- For infrastructure failure (the tool crashed, the network died): that
  is the conventional nonzero crash exit, distinct from all three states
  above — a crash is not an unverified *verdict*, it is no run at all,
  and retry logic should see it as such.
