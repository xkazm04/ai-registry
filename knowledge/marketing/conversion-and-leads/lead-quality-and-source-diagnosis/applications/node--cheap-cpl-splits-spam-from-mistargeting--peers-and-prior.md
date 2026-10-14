---
layer: application
type: application
subject: lead-quality-and-source-diagnosis
technique: cheap-cpl-splits-spam-from-mistargeting
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: better
---

# "Cheap" read against peers and the source's own prior - a fixed-constant floor made relative

Verified against the Czech-first marketing workspace at its master tip of 2026-10-14
(Node 24). Anchors: the deterministic cause floor in
`src/lib/ai/tools/lead-source-diagnosis.ts` (`pickCause`, `isCheapCpl`), the seed and
request builders in `src/lib/diagnoses/lead-source-request.ts`, and the period-drift
module in `src/lib/lead-quality/compute.ts`.

## The seam the tree disagreed with the technique on

The floor that picks a cause when the model leaves it empty (and the demo's pick)
decided "cheap" with one constant: cost per lead at or under 200 CZK. The file's own
comment admitted it "assume[s] a Czech SMB context; a different currency/business size
would want different anchors". The technique's standard is the opposite: cheap means
under half the peer median **and** under half the source's own prior, with the
absolute only as a labelled demo anchor. The tree already held both baselines - every
source row is projected into peers, and every row with a prior period yields a
period-over-period trend - but neither carried cost per lead, so the baselines were
unreachable from the decision.

## What A and B were

- **A**: `cheap = cpl <= 200`.
- **B**: peers and trend carry cost per lead (and its drift) through the seed, the
  request and the request validator; `cheap` is under half the paid-peer median AND,
  when a prior period exists, under half the prior CPL (a CPL that rose is not
  cheapening). With fewer than two paid peers there is no median and the old anchor
  stands in. An unpaid source is never cheap.

## What was read

The five illustrative sources, plus six constructed cases, through the real function.
Target: the cause label per case. Floor: every case that is not cheap-and-unqualified
keeps its label, and the model-contract gates stay green.

- The four sources that qualify acceptably are `ok` under both arms.
- The seam was chosen to be able to falsify the heuristic: the cold social lead-form
  source (24% qualified, CPL 178 against paid-peer median 432, CPL up 19% on its own
  prior) is **spam** under A and **mis-targeting** under B. It sits at 41% of the peer
  median, which A and the peer test both call cheap; the prior test is what separates
  it, because the source did not cheapen. The technique's trend rule reads a
  cheapening plus a quality collapse as spam; a rising CPL with falling quality is the
  honest-wrong-audience shape, and the severity falls from high to medium with it.
- A source at 190 CZK against peers near 300 is cheap under A and not under B; a
  source at 300 against peers near 900 is the reverse. Both are the currency-constant
  failure the technique names.

## Not measured, stated

Whether the model, which sees only the prompt, would have drawn the same line: the
prompt text was not changed, so the floor and the model can now disagree on a source
like the one above until the prompt carries the relative definition. Peers are the top
three by quality score, not all paid peers, so the median is of the best peers; a
spam source beside only expensive best-in-class peers reads cheaper than it would
against the whole set. The form-telemetry corroboration step has no producer in this
tree (no submission-time or disposable-domain signal exists), so "likely spam" copy
could not be gated on it.
