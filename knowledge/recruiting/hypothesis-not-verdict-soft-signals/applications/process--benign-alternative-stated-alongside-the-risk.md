---
layer: application
type: application
subject: hypothesis-not-verdict-soft-signals
technique: benign-alternative-stated-alongside-the-risk
stack: process
status: forged
---

# The soft-signal panel: five deterministic detectors, each with its innocent reading

`pipeline/jobfit/soft_signals.py` is the candidate-level soft-signal panel of a
Python CV-analysis pipeline. Its module docstring (`:1-18`) states the design
stance the standard asks for, in its own words:

> "a CV yields *hypotheses*, not verdicts. Every signal carries a `source` (how it
> was inferred), a `confidence`, a `needs_confirmation` flag, and a
> `suggested_probe` — so the panel routes to the work-sample (devcase) and the
> interview rather than pretending to decide."

It is deterministic and LLM-free "so it is cheap and unit-testable", and a
language model's own `recruiter_risk_flags` are folded in only as "lower-trust
hypotheses (clearly labelled `cv-hypothesis`)".

## The model sentence, verbatim

`_tenure_instability` (`:140-159`) is the hardest case in the domain and the
cleanest realization of this technique anywhere in the repo:

```python
return SoftSignal(
    key="tenure_instability",
    kind=ANTIPATTERN,
    label=f"~{avg:.1f} yr average across {n_jobs} roles",
    detail="Short average tenure can signal flight risk — or fast growth. Confirm the reasons.",
    confidence=0.5,
    source=CV_STRUCTURAL,
    needs_confirmation=True,
    suggested_probe="Walk through the last three moves and the reason for each transition.",
)
```

Every element of the standard's sentence is present: the number leads and carries
its sample (`avg` *and* `n_jobs`, so "1.4 years" is never separated from "across
4 roles"); the adverse and innocent readings share one sentence joined by an
em-dash and "or"; the sentence ends on the confirmation imperative; the confidence
is an honest coin flip rather than a hedge; and the probe is askable verbatim,
about the record rather than about the person.

The detector also refuses to fire on thin data — `if n_jobs < 3 or not years or
years <= 0: return None`, and `if avg >= 1.6: return None` (`:143-148`) — so the
claim only exists where a sample supports it. The docstring is honest about its
own limit: "best-effort, no structured dates".

## The pairing is enforced by construction

`_vague_delivery` (`:161-182`) and `_concrete_ownership` (`:227-243`) read the
same underlying property — how many quantified-outcome markers `_METRIC_RE`
(`:49-56`) finds across work evidence — in opposite directions, and they are
mutually exclusive by threshold: vague returns `None` at `metric_hits >= 1` with
the comment "has at least some concrete numbers — handled as a strength
elsewhere"; concrete returns `None` below 2. `test_soft_signals.py:61-82` pins the
exclusivity as a contract in both directions, which is exactly the test shape the
pairing technique asks for.

`_METRIC_RE` is bilingual (`snížil|zvýšil|zrychlil|zlepšil|ušetřil` alongside the
English verbs), which matters more than it looks: a concreteness detector that
only recognises one language turns a language into a vagueness finding.

## Confidence that scales with the sample, capped below certainty

`_claim_vs_evidence` (`:66-94`) computes `round(min(0.4 + 0.12 * n, 0.85), 2)` over
`n` uncited strong claims — one shrug, five a pattern, never certainty — while the
folded model flags (`:245-263`) get a flat `confidence=0.4` set by the tier, not
by the model. That is the standard's tier-capped confidence rule implemented as
two lines of arithmetic.

## Deviation: the exported line drops the alternative

`SoftSignalPanel.to_interview_checklist` (`pipeline/jobfit/models.py:291-298`)
composes the copyable line as:

```python
tag = "RED FLAG" if s.kind == ANTIPATTERN else "STRENGTH"
out.append(f"[{tag}] {s.label} — {s.suggested_probe}")
```

`s.detail` — the field holding "can signal flight risk — or fast growth" — is not
in the line. So the one artifact that leaves the screen reads `[RED FLAG] ~1.4 yr
average across 4 roles — Walk through the last three moves…`: the innocent reading
is gone and an adverse category word has been prepended in its place. The
front-end mirrors the same composition deliberately, "so the copied list and the
Python-side checklist can't drift in shape"
(`app/_components/results/interview/SoftSignalsSection.tsx:20-26`), which
propagates the loss rather than catching it.

The standard stands: whatever line is exportable is the line the rule applies to.
The fix is one field wider — carry `detail` into the composed line, and replace
the `RED FLAG` tag with the neutral `TO CONFIRM`, since every line in that list is
by construction a `needs_confirmation` item.

## Deviation: gaps are absent, and that is the right absence

No detector in the panel reads employment gaps, breaks or dates-of-absence. Given
that `years_experience` and evidence counts are both available, that restraint is
a deliberate one and matches the standard's hardest rule — the panel reads the
shape of what is described, never the shape of what is missing from a life.
