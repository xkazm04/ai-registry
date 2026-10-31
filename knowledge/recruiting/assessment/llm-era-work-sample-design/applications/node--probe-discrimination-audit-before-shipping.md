---
layer: application
type: application
subject: llm-era-work-sample-design
technique: probe-discrimination-audit-before-shipping
stack: node
verified_on: 2026-10-31
verified_against: node@24
---

# The probe-strength gate and the cohort heatmap (Next.js server)

Two pure, import-free modules carry the audit: `app/_lib/devcase-probe-audit.ts`
(pre-ship) and `app/_lib/devcase-cohort.ts` (post-ship). Both are dependency-free
on purpose so the contract is unit-testable under bare `node --test`.

## Why it exists

The header comment (`devcase-probe-audit.ts:1-8`) is the standard's argument
almost word for word: the designer "bakes covert probes with a decisionSpace,
but nothing checks a probe actually DISCRIMINATES before the case meets a real
candidate — quality was asserted by the design prompt, never measured. A
take-home is only worth giving if it separates good from naive."

## The three criteria, verbatim

`auditProbe` (`:62-80`) is the structural audit and its three failure messages
are the standard's three criteria:

- `distinctOptions(decisionSpace) < 2` → "No forced choice — needs at least two
  distinct defensible options." (`MIN_OPTIONS = 2`, `:39`; options are
  normalized and de-duplicated at `:53-60`, so two restatements of one option
  do not pass.)
- empty `where` → "No concrete seam — nowhere in the task to plant the trap."
- empty `reveals` → "No good-vs-naive criterion — nothing to grade the handling
  against."

`loadBearing` is all three, not a score (`:77`). The rollup
`auditProbeStrength` (`:83-92`) is the standard's three-state verdict with the
majority rule made explicit: `none` when nothing is load-bearing, `strong` when
at least two are load-bearing **and** they are at least half the probes, `weak`
otherwise.

Re-checked 2026-10-31 at kp `6edf5d7`: the criteria are the same three, but `auditProbe`
no longer carries English sentences. It pushes issue codes (`no_choice`, `no_seam`,
`no_reveals`; `PROBE_ISSUE_CODES`, `:21`) and the sentences live in the catalog
(`messages/en.json` `devcase.probeAudit.issue.*`), worded as above. The floor is no longer a
local `MIN_OPTIONS`: it is `MIN_PROBE_DECISION_OPTIONS` (2), generated from
`pipeline/jobfit/devcase/design.py` into `app/_lib/contract-constants.generated.ts` and
imported at `:49`, so the Python health eval checks designed cases against the same number.

## The gate, and the one-door lesson

`enforceProbeGate` (`:111-125`) blocks approval with a 422 on a `none` verdict
unless the caller passes `overrideProbeAudit: true`, and returns
`auditReason: "probe-audit OVERRIDDEN (no load-bearing probes)"` for the audit
trail (`:96`) — the standard's rule that an override is recorded with a
decision behind it, never silent.

The extraction comment names the incident directly (`:102-110`): the doctrine
existed on the lifecycle approve path and the **manual** `POST /api/devcase`
path "previously had NO gate" (`bug-ui-scan-2026-07-09`), so a
non-discriminating case could reach candidates through the second door. Both
call sites now import the same guard —
`app/api/devcase/lifecycle/[id]/approve/route.ts:98` and
`app/api/devcase/route.ts:117` — with a single-sourced block message
(`PROBE_GATE_BLOCK_MESSAGE`, `:85-87`) so the two responses cannot drift. That
is the upward lesson the standard now carries: one shared guard, every approval
path.

Re-checked 2026-10-31 at kp `6edf5d7`: the extraction comment (`:102-110`) still says both
approve paths call the one guard, but no longer names `bug-ui-scan-2026-07-09` or says the
manual path "previously had NO gate"; it now reads "the exact bug this scan keeps finding
is a doctrine enforced in one path and forgotten in the parallel one."
`PROBE_GATE_BLOCK_MESSAGE` is gone: the 422 carries `code: "probe_audit_failed"` with the
same string as `error`, and the panel localizes from the code (`:114-117`). The two
responses still cannot drift, now because they share a code rather than a sentence. The
one-guard lesson stands.

The deeper audit is acknowledged as unbuilt (`:9-15`): "running a synthetic
strong-vs-naive submission through the evaluate path per probe is a follow-up;
the structural gate catches the common failure (an empty/degenerate
decisionSpace) cheaply and without an LLM call." A deviation from the standard's
two-depth rule, and an honestly recorded one.

## Deviation: `weak` ships unchallenged

The gate blocks only on `none`. A case where a single probe out of four is
load-bearing returns `weak`, surfaces in `DevProbeStrengthBanner.tsx:20`, and
approves without friction. The standard holds that a `weak` verdict is the case
most in need of one more design pass before it consumes a cohort's hours; here
that is a banner, not a decision point. Nothing in the record distinguishes "a
reviewer saw weak and accepted it" from "nobody looked".

## The cohort read

`probeMissHeatmap` (`devcase-cohort.ts:69-111`) rolls each probe's outcomes
across every submission. Two properties matter:

- **Rates divide by the evaluated subset, never the roster** (`:40-41`,
  `:106`): `missRate` is `(evaluated - detected) / evaluated` and is `null`
  when `evaluated === 0` — the not-measured state as a distinct value, exactly
  as the standard requires, instead of a zero that would read as a perfect
  probe or a one that would read as a dead one.
- **The interpretation is written into the module header** (`:1-6`): "a probe
  the entire field walks past is usually a MISCALIBRATED case (the seam is too
  hidden or ambiguous), not five weak candidates in a row." The inversion the
  standard's cohort section rests on came from here.

What the module does not do is carry a sample floor: a cell renders its rate at
`evaluated === 1`. The standard requires a claim to carry the sample size that
supports it, and one submission does not support "this probe does not
discriminate" — the panel (`DevCohortProbePanel.tsx:45`) shows
`evaluatedCount`, which makes the sample visible to a reader but does not stop
a one-candidate rate from being read as a finding.

Re-checked 2026-10-31 at kp `6edf5d7`: two changes narrow this deviation without closing it.
The panel now prints each cell's own sample beside its rate (`cohort.sample`,
`DevCohortProbePanel.tsx:81`), and the miscalibration headline counts a probe only when
`evaluated > 1` and its miss rate is 1 (`:39`). A cell still renders its rate at
`evaluated === 1`. Separately, `probeMissHeatmap` now leaves out submissions whose tooling
step ran on the deterministic template (`devcase-cohort.ts:23-33`, `:74`), which stamps
every probe missed and would otherwise make every keyless cohort read as 100% miss, and
`weakRate` divides by graded outcomes only (`:90-96`).
