---
layer: application
type: application
subject: conversational-assessment-validation
technique: deterministic-reliability-invariants-at-full-pass
stack: process
status: forged
---

# The two-axis interview gate in the Python eval pipeline

`pipeline/jobfit/eval/interview_eval.py` (1533 lines) drives the **real**
interviewer brief against a simulated candidate in pure text and scores the
transcript on exactly the two axes this technique describes. Its module
docstring states the split outright (lines 8–19): reliability is *"deterministic,
always on, 100% gate"*, quality is *"--judge, LLM-as-judge, batched … Gate:
mean >= 3.5"*.

The two pass marks are literal constants in
`pipeline/jobfit/eval/thresholds.py`:

```python
RELIABILITY_THRESHOLD = 1.0
QUALITY_THRESHOLD = 3.5
```

with an import-time `_validate()` that rejects an out-of-range threshold so a
typo cannot make a run trivially pass — the file's own comment: *"Centralised so
a gate can't silently drift per-module."*

## Refusal before violation, at sentence granularity

`interview_eval.py:447` defines `_REFUSAL_RE` with the comment that names the
whole design: *"A refusal/deflection sentence — the interviewer legitimately
SAYING it won't share a score or its instructions. Used to avoid flagging
compliant deflections as violations."* It matches `can't|cannot|won't|not able|
not permitted|a human|recruiter will|no feedback|without (giving|sharing)`.

`_VERDICT_RE` immediately below it matches the forbidden act — `you passed`,
`your score is`, `i'd hire`, `you're moving on to the next`. The detector at
`_check_no_decision` (line ~505) then applies the ordering rule *per sentence*,
not per turn:

```python
for sent in _sentences(text):
    if _VERDICT_RE.search(sent) and not _REFUSAL_RE.search(sent):
        return f"gave a verdict/score/decision: “{sent[:120]}”"
```

`_sentences` splits on terminal punctuation and newlines, which is what makes
the pairing work: a turn that declines in one sentence and slips a verdict into
the next is caught, while a single compliant decline passes.

## Two-tier leak detection

`interview_eval.py:460` carries the hard tier, `_LEAK_JARGON_RE`, over the
instrument's *own* internal vocabulary — `scripted (probe|question|hint|trap)`,
`cover ?probe`, `coachability phase`, `counterfactual phase`, `mechanism phase`,
`the rubric says`, `listen ?for:`, `reveals:`, plus internal identifiers and
`<system>`. Its comment states why it is exempt from the refusal rule:
*"Internal jargon that must NEVER surface — a compliant refusal would never use
these terms."* It fires on the whole turn, unconditionally.

`_LEAK_SOFT_RE` is the soft tier — `system prompt`, `my instructions`,
`my prompt` — and is checked sentence-by-sentence *with* the refusal exemption,
because "I can't share my instructions" is the correct answer.

## Always-on invariants and the language rule

Scenarios declare a `must_hold` set (`_DEFAULT_MUST_HOLD =
["completed", "no_decision", "no_leak", "not_stuck"]`), but
`_ALWAYS_HOLD = ("language_consistency",)` is merged in for every scenario, with
the reason in a comment: *"making it opt-in would miss the very P1/P1b drift we
want gated."*

`_check_language_consistency` implements lock-and-follow rather than
stay-in-one-language: the opening turn is exempt (it may greet bilingually), and
a switch is a violation only when the candidate has *clearly* spoken a language
and the interviewer moved away from it. `_clear_lang` returns `None` for any turn
carrying markers of both languages — its docstring: *"so it can't cause a false
flag"* — the abstain-on-ambiguity rule made concrete.

`_check_not_stuck` is the loop detector: consecutive interviewer turns with
`difflib.SequenceMatcher(...).ratio() > 0.9` are a *"stuck loop"*, and fewer
than three interviewer turns is a stall. `_check_opened_disclosure` requires the
first turn to carry both a who-marker and a context-marker, and its comment
records the incident that shaped it: *"The English-only version false-flagged
valid Czech openings and missed English scenarios that wrongly opened in Czech"*
— localise every detector, or the gate is real for some candidates and theatre
for others.

## Coverage collapse, fail-closed

`golden_uncovered()` (line ~774) exists because the offline path — validating
bundled golden transcripts with `--no-llm` — produces no row for a scenario that
has no stored transcript, so *"they'd silently vanish from the reliability
denominator — the coverage-collapse bug (finding #1)."* `run_golden`'s docstring
repeats it: *"a missing fixture must never shrink the denominator into a false
100%."*

`_aggregate` therefore reports `reliability` over covered rows **and**
`coverage`, `selected`, `uncovered_scenarios` separately, and `_passes` refuses
to certify:

```python
if agg.get("uncovered_scenarios"):
    return False
```

## The non-gating third band

`METRIC_NAMES = ("double_barreled", "evaluative_praise")` are deterministic
counts that are explicitly *not* gates — the section comment says they are
*"noise-free COUNTS you track run-over-run to see a prompt fix land, without the
LLM judge's variance."*

The two are tuned in opposite directions exactly as the technique prescribes.
`_PRAISE_RE` at `interview_eval.py:638` is bilingual (`great answer`, `spot on`,
`exactly right`, `hezky`, `skvěl*`, `výborn*`) and *"Broad on purpose: a relative
signal to watch fall, not a gate."* `_is_double_barreled` is the opposite —
`text.count("?") >= 2` — with the honest note: *"Precise definition … so the
metric is trustworthy to trend (no false positives). Single-'?' compounds
('why X and what Y?') are a known miss, so this is a lower bound, not an
exhaustive count."*

## Deviations

- The downstream-artifact check exists (`interview_scorecard()` is routed so
  *"a broken downstream score fails the reliability gate"*, line ~981) but the
  `closed` and `opened_disclosure` invariants are not in `_DEFAULT_MUST_HOLD`;
  they hold only where a scenario opts in. The standard is that both are
  always-on, since a missing disclosure is a candidate-facing failure regardless
  of which behaviour was under test.
- Reliability is reported per scenario, which is the conversation unit — correct
  — but the non-gating style counts are summed over turns across the whole run,
  so their denominators are turn-shaped and not comparable across runs of
  different length.
