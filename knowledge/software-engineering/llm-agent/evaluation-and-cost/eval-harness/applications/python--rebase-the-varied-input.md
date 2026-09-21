---
layer: application
type: application
subject: eval-harness
technique: rebase-the-varied-input
stack: python
status: forged
verified_on: 2026-09-17
verified_against: python@3.12
applied: code
ab_verdict: better
proof: ab-paired
---

# The clock-purity check that could not see a clock (personas memory-year harness)

The harness has no interpreter pin in its tree, so the version here is the one the
paired proof ran on (3.12.1), not a declared floor. The seam is the harness's
clock-purity check. It replays a short scenario at two base dates 400 days apart and
asserts that every recalled context is identical, so that any backend reading the wall
clock fails. The check's docstring states that purpose, and the check had never failed.

This seam was chosen because it could **falsify** the technique. The harness already
injects a clock into every backend, and it already has a purity check aimed at exactly
this defect. If the check worked, the technique would be a restatement of something
this tree does. It did not work.

## What the tree did

Before comparing, the check normalised both replays:

- `evals/memory-year/memory_year/checks/clock_purity.py:3 "is reading the wall clock"`
  is the stated purpose.
- `evals/memory-year/memory_year/checks/clock_purity.py:26 "return ID_RE.sub("<id>", DATE_RE.sub("<date>", text))"`
  masks every date to one placeholder, then every id.

The mask on dates was necessary under a value comparison. Every correct backend prints
the injected instant, so the two replays legitimately differ in every date. It was also
the whole defect, because a date rendered from the writer's clock lands in exactly that
field.

The id half failed the opposite way.
`evals/memory-year/memory_year/checks/clock_purity.py:19 "[0-9a-f]{16,64}"` is the
id pattern, and its word boundaries are **four literal backspace bytes (0x08)**, not
backslash-b. The pattern matched only an id wrapped in backspace characters, which no
recall text contains. The commit that introduced it described it as normalising ids. It
never matched one.

## A and B

Same smoke scenario, first 30 simulated days, base shift 400 days, the deterministic
layer (no scheduled model passes), no model calls in any cell.

- **A**: the check at the tree's head.
- **B**: each date rebased onto its offset from its own replay's base, dates that the
  fixture itself writes compared as written, id boundaries restored as backslash-b,
  plus a `--self-test` that runs the check against the full-history backend and a copy
  of it that renders the wall clock.

| Backend | A | B |
| --- | --- | --- |
| full-history | PASS 0/46 | PASS 0/46 |
| none | PASS 0/46 | PASS 0/46 |
| raw-retrieval | PASS 0/46 | PASS 0/46 |
| hybrid-verbatim | PASS 0/46 | PASS 0/46 |
| **full-history rendering the wall clock** | **PASS 0/46** | **FAIL 46/46** |

Target: a backend wrong on every recalled line went from passed to caught. Floor: every
backend that runs offline kept its verdict. The four model-bound backends (the two-tier
pipeline, compiled truth, write-time verdicts and one vendor adapter) need a live bridge
or a paid model and were **not** re-checked. The return condition names them.

Before B was written, a count confirmed that neither scenario's fixtures contain a
literal date (0 tokens in both, with a positive control asserted). So the rebase alone
would have passed the floor today. The literal-date exemption exists because the
scenario extension that the observation-clock technique asks for would seed absolute
dates, and a pure rebase would then fail every correct backend.

## What the tree's shape says

The check was written for this defect, names it in its own docstring, and had been green
on every backend it ever ran. A pass there was consistent with a clean fleet and with a
blind instrument, and nothing in the run could tell the two apart. The negative-control
arm settled it in one run, at zero model cost. It now ships in the check as
`--self-test`, so the next edit to the normaliser is tested against the case the
normaliser exists for.

## What this realization cannot do

- It checks only the deterministic layer by default. A model-driven consolidation pass
  produces different text on each run whatever the clock does, so its clock discipline
  is still unasserted here.
- It does not re-verify the four model-bound arms whose earlier PASS verdicts rest on the
  old mask. Those verdicts are unproven until re-run, not refuted.
- It rebases dates only. A backend that renders a wall-clock *time of day* in a format
  the day pattern does not match would still pass.

## Where it landed

Committed on the project's branch `intake/clock-purity-rebase` (`3c606cf51`), not on the
active branch, because another session had a merge open in the shared checkout at commit
time. Not pushed.

Return condition: re-run the two-tier pipeline's clock purity with the deterministic
layer only once its simulation bridge is up, because the old mask may have hidden a
rendered wall-clock date there.
