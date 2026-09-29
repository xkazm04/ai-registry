---
layer: application
type: application
subject: hypothesis-not-verdict-soft-signals
technique: benign-alternative-stated-alongside-the-risk
stack: process
status: forged
verified_on: 2026-09-29
applied: code
ab_verdict: better
---

# The soft-signal panel: five deterministic detectors, each with its innocent reading

`pipeline/jobfit/soft_signals.py` is the candidate-level soft-signal panel of a
Python CV-analysis pipeline. Its module docstring (`:1-19`) states the design
stance the standard asks for, in its own words:

> "a CV yields *hypotheses*, not verdicts. Every signal carries a `source` (how it
> was inferred), a `confidence`, a `needs_confirmation` flag, and a
> `suggested_probe` — so the panel routes to the work-sample (devcase) and the
> interview rather than pretending to decide."

It is deterministic and LLM-free "so it is cheap and unit-testable", and a
language model's own `recruiter_risk_flags` are folded in only as "lower-trust
hypotheses (clearly labelled `cv-hypothesis`)". Re-read on 2026-09-29 against kp
`d9c8b17f`.

## The sentence, and the word it had to lose

`_tenure_instability` (`:150-176`) is the hardest case in the domain. When this
application was first written it was held up as the model sentence, verbatim:
"Short average tenure can signal flight risk — or fast growth. Confirm the
reasons." Its shape was right: the number leads and carries its sample (`avg`
*and* `n_jobs`, so "1.4 years" is never separated from "across 4 roles"), both
readings share one sentence, the sentence ends on the confirmation imperative, and
the confidence is an honest coin flip.

Its adverse reading was not. "Flight risk" is a prediction about the person, and
the subject's own golden path forbids it in every rendering at every confidence.
The sentence passed the technique's shape test while carrying a word on the
forbidden list, and nothing in the repo or in this application caught it for five
weeks. Since `d9c8b17f`:

```python
detail=(
    "Short average tenure can mean contract or project work, fast growth — or roles "
    "that ended early; the CV does not say which. Confirm what each move was."
),
...
suggested_probe="Walk through the last three moves: what each role added and what you were looking for next.",
```

Both readings are about the record, the sentence admits what the document cannot
say, and the probe asks about the work rather than the reasons for leaving.
`TestTenureSentenceStaysOnTheRecord` (`tests/test_soft_signals.py:185-197`) pins
all four properties. It was red against the old module.

The detector still refuses to fire on thin data: `if n_jobs < 3 or not years or
years <= 0: return None`, and `if avg >= 1.6: return None` (`:154-158`). The
docstring is honest about its own limit: "best-effort, no structured dates".

## The pairing is enforced by construction, and now by the export too

`_vague_delivery` (`:179-196`) and `_concrete_ownership` (`:248-265`) read the
same underlying property — how many quantified-outcome markers `_METRIC_RE`
(`:59-65`) finds across work evidence — in opposite directions, and they are
mutually exclusive by threshold: vague returns `None` at `metric_hits >= 1` with
the comment "has at least some concrete numbers — handled as a strength
elsewhere"; concrete returns `None` below 2. `test_soft_signals.py:62-83` pins the
exclusivity in both directions.

Exclusive on screen was not symmetric off it. `vague_delivery` carried
`needs_confirmation=True` and `concrete_ownership` carried `False`, and the
copyable checklist keeps only rows that need confirmation, so the adverse twin
left the screen and the favourable one never did. Measured over the 66 seeded
candidates in `data/seed_candidates/candidates.json`: 60 showed a probed strength
that the export dropped, and 32 got a risks-only export while a strength sat on
the panel. Since `d9c8b17f` both strengths need confirmation. The counts are 0 and
0, and the export went from 42 `TO CONFIRM` lines and 11 `STRENGTH` lines to 42
and 76.

## A deterministic detector read a candidate's gender

`_METRIC_RE` is bilingual (`snížil|zvýšil|zrychlil|zlepšil|ušetřil` alongside the
English verbs). The first reading of this file praised that on the grounds that a
one-language concreteness detector turns a language into a vagueness finding. The
tree found the deeper version of the same failure a day later. The Czech stems
ended at a word boundary, and the l-participle's suffix carries gender and number.
"Snížil jsem náklady" (he cut costs) scored as quantified impact. The identical
"Snížila jsem náklady" (she cut costs) scored zero, which fired the
`vague_delivery` antipattern on a named person. Commit `029471eb` (2026-08-21)
added `(?:a|i|y|o)?`, and `TestCzechAchievementVerbs` pins five inflected forms.
The name-neutrality registry did not catch it. Its gendered prose pair carries no
achievement verb, so the detector's own vocabulary was never perturbed.

## Confidence that scales with the sample, capped below certainty

`_claim_vs_evidence` (`:76-104`) computes `round(min(0.4 + 0.12 * n, 0.85), 2)` over
`n` uncited strong claims — one shrug, five a pattern, never certainty — while the
folded model flags (`:294-320`) get a flat `confidence=0.4` set by the tier, not
by the model. That is the standard's tier-capped confidence rule implemented as
two lines of arithmetic.

## Retired: the exported line dropped the alternative

`SoftSignalPanel.to_interview_checklist` (`pipeline/jobfit/models.py:322-334`)
used to compose `[RED FLAG] label — probe`, so the benign reading was gone from
the one artifact that leaves the screen. Since 2026-08-21 it composes
`[TO CONFIRM] label — detail — probe`, and its comment names the reason: "RED
FLAG made it read as a finding, and dropping `detail` deleted the benign
alternative the on-screen panel shows". `TestChecklistExport`
(`tests/test_soft_signals.py:249-287`) pins the line.

## Gaps: the detectors never read them, the model fold did

No deterministic detector in the panel reads employment gaps, breaks or
dates of absence. That restraint matches the standard's hardest rule. The model's
free-text flags had no such restraint, and the fold only dropped entries that
state the absence of a risk: "Two-year employment gap is unexplained." was pinned
in a test as a flag that must *survive* into the panel. Since `d9c8b17f`,
`is_forbidden_reading` (`:277-291`) drops any flag that reads a gap, a trait
("flight risk", "job hopper", loyalty, culture fit, overqualified) or a life
circumstance before the panel is built. `TestForbiddenReadingsNeverFold`
(`tests/test_soft_signals.py:147-182`) pins ten such flags as dropped and seven
skill, credential, injection and salary flags as kept. It was red on all ten
against the old module.

## Deviation: the raw model list still travels

The filter guards the panel only. `job_fit.recruiter_risk_flags` is still stored
unfiltered, rendered as a list on the job-fit tab, bulleted into the provenance
export (`app/_lib/provenance-dossier.ts:110`), and turned into red-flag-defense
questions by the interview kit. The technique's rule is to drop a forbidden
category before storage. The trust boundary for that is the parse site
(`pipeline/jobfit/pipeline.py:1136`), not the fold.
