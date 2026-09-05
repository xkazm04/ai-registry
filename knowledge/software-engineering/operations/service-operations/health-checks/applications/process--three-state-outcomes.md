---
layer: application
type: application
subject: health-checks
technique: three-state-outcomes
stack: process
status: forged
verified_on: 2026-09-04
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Three states over a documentation corpus's own citations

A knowledge corpus makes a dated claim on every application document: a
`verified_on` field asserting that somebody resolved that document's
citations on that date. The corpus's integrity gate walks every markdown
link and reports a five-figure count of links checked. The two facts look
like they support each other. They do not overlap at all.

The version is pinned by the corpus repository's head commit (`444fc57`); it ships
no release artifact, so the commit is the witness for both arms.

## Arm A — the gate as it stands

The gate resolves relative links and skips absolute ones by an explicit
guard, one line, matching `https?:`, `mailto:` and `#`. Its headline count
is therefore **internal links only**, and it announces itself as "links
checked" without the qualifier.

The excluded population is exactly the one that decays unobserved. An
internal link can only break when somebody edits this repository, and the
gate catches that on the same commit. An external citation breaks when a
third party reorganizes a website — no commit, no diff, no signal, and the
`verified_on` beside it keeps asserting a resolution that is now false. The
gate is blind precisely where the clock runs.

Measured: **0 of 172** external prose citations checked, across 48 files.

## Arm B — the same corpus under a three-state sweep

The same population, probed once, classified by this technique's vocabulary
and given a remediation policy per state
(`scripts/check-citations.mjs`, advisory, never edits a file):

| state | n | what it authorizes |
| --- | --- | --- |
| alive | 151 | nothing |
| gone (404/410 only) | 1 | a human confirmation, then repoint or annotate |
| unverifiable | 20 | a visible marker; no claim about the citation |

One citation is genuinely dead — a supranational funding page cited by a
grant-format application, 404 today. It had been invisible to every gate run
since it broke.

**The verdict is `better`**: the sweep found a real defect the standing gate
cannot see, at the cost of one advisory script and no build coupling.

## The number that argues for the third state

The 20 unverifiable are **18x 403, one 405, one 429** — no 5xx, no DNS
failures, no timeouts on the second run. That distribution is not noise; it
is well-defended documentation sites declining a scripted HEAD. Every one of
those citations is fine when a person opens it.

So the collapse this technique warns about has a price tag here:

- **unverifiable → failed**, and a maintainer bulk-removing what the checker
  called dead would have deleted **21 citations to retire 1** — a 95% false
  deletion rate, and it would have removed the *best-maintained* sources in
  the corpus, because aggressive bot defence correlates with being a serious
  publisher rather than an abandoned one.
- **unverifiable → alive**, the tempting alternative, keeps the 20 and
  silently re-certifies anything that dies behind a 403 later — and 403 is
  the modal response in this population, so the blind spot is the largest
  single class.

Neither collapse is survivable, which is the technique's claim, met with a
number.

## The apply step corrected the finding before it shipped

The first version of this sweep reported **6 gone**. Five were its own
extraction bug: a URL regex run over raw markdown pulled `${...}`
interpolations, a `(.*?` regex fragment and a `{a,b,c}` brace expansion out
of fenced code blocks and read them as citations. The corpus had already
named the cause —
[checker-false-positive-discipline](../../../../engineering-assessment/maturity-and-conformance/conformance-checking/techniques/checker-false-positive-discipline.md)
under *"never pattern-match a language you have a parser for"*.

Stripping fenced blocks and inline spans before matching moved the count
from 6 to 1, a **6x error in the alarming direction**, and the corrected
number is the one above. Recorded because a liveness checker's own
false-positive rate is the first thing its verdict depends on, and because
the narrowing — not deleting the check — is the remedy this corpus
prescribes.

## What this realization cannot do

The sweep is a single observation, so it cannot distinguish *cannot probe
now* from *cannot probe ever*: a host that 403s a script today may be
permanently bot-hostile or briefly cross. The split needs the persistence
this technique's remediation section asks for — a first-failure timestamp on
the row and N consecutive runs — which requires storing results across runs,
and nothing here does yet. Until then every non-definitive failure is
reported as the transient case, which is the safe direction and not the
honest one.

It is also advisory by construction and wired into no gate. That is
deliberate under the measure-before-promoting rule, and it means the check
protects nothing today: it reports, and a human decides. The return
condition for promoting it is a stored history that makes the persistence
predicate computable.
