---
layer: application
type: application
subject: candidate-archetype-routing
technique: signal-scored-routing-not-rule-matching
stack: process
status: forged
---

# The detection engine as data, in a spawned Python pipeline

The hiring pipeline in this repo is a Python analysis process (`pipeline/jobfit/`)
spawned by a TypeScript app. Archetype detection lives in `pipeline/jobfit/registry.py`,
but almost none of the *policy* does: the signals, their weights, the thresholds and the
contradiction rules are all rows in `pipeline/jobfit/archetypes.json`, and `registry.py`
is a small evaluator over them.

## The signal table is eight rows of data

`archetypes.json:66-75` is the whole detector:

```json
{ "id": "enrolled", "when": { "signal": "is_enrolled", "truthy": true }, "scores": { "student": 2.0 }, "reason": "currently enrolled" },
{ "id": "yre_low", "when": { "signal": "years_relevant_experience", "lt": 1 }, "scores": { "student": 1.5 } },
{ "id": "yre_high", "when": { "signal": "years_relevant_experience", "gte": 3 }, "scores": { "bau": 1.5 } },
{ "id": "switch_strong", "when": { "all": [ { "signal": "wants_domain_change", "truthy": true }, { "signal": "has_substantial_experience", "truthy": true } ] }, "scores": { "career_switcher": 3.0 } }
```

Every property the standard asks for is visible in those four lines. The signals are
observable facts, not conclusions. The weights are round numbers, ordinal rather than
fitted. The heaviest weight in the table (`switch_strong`, 3.0) is a **compound** signal
— wanting a domain change *and* having substantial experience — worth more than either
part, with `switch_weak` at 1.0 covering the same intent without the experience. And one
row (`substantial`) scores *two* archetypes at once (`bau: 1.0, career_switcher: 0.5`),
which a rule chain cannot express at all.

`docs/features/candidates/README.md:84` publishes this same table to the team as a
two-column markdown table under the heading "Signal-scored, not rule-matched" — the
"it can be shown" property, realized as documentation that is a transcription of the
configuration rather than a description of code.

## Accumulate, rank, derive confidence from the margin

`registry.py:192-206` is the entire scoring loop, and it does nothing the standard does
not ask for:

```python
scores = {a: 0.0 for a in ids}
for rule in _DETECTION["signals"]:
    if _eval(rule["when"], ctx):
        for archetype, delta in rule["scores"].items():
            scores[archetype] += delta
        if rule.get("reason"):
            reasons.append(_render(rule["reason"], ctx))

total = sum(scores.values())
if total <= 0:
    reasons.append(_DETECTION["defaultReason"])
    return _DETECTION["defaultArchetype"], _DETECTION["defaultConfidence"], reasons

best = max(ids, key=lambda a: scores[a])
return best, round(scores[best] / total, 2), reasons
```

No early exit. Confidence is the winner's **share of the total mass** — the second of the
two derivations the standard names — so a candidate whose signals split across two
archetypes gets a low number by construction. And the third element of the return tuple
is the list of reasons that fired, rendered from templates in the data
(`{years_relevant_experience:g} years of relevant experience`), so the explanation is
carried alongside the class at no extra cost.

Tie-breaking is deterministic and documented rather than accidental: `archetype_ids()`
(`registry.py:62-64`) returns ids "in declaration order — the order also breaks detection
score ties", and `max` takes the first maximum. A tie still produces a low share, so it
trips review — the combination the standard permits.

## The condition language is deliberately tiny

`_eval` (`registry.py:131-145`) supports exactly `all`, `any`, `truthy`, `not`, `lt` and
`gte`. That is the whole grammar. It is small enough that a contract test can validate
every rule in the file: `pipeline/jobfit/tests/test_registry.py` walks the condition trees
recursively (`_signal_names`) and asserts that every referenced signal name is one of the
six the evaluator actually builds into its context, and that every scored key is a real
archetype id. Its docstring states the purpose exactly: rules "fail loudly at CI time
rather than letting a typo in the data desync the fairness gate or silently no-op a
checklist item."

This is the answer to the obvious objection against data-driven rules — that moving logic
into a config file trades compile-time safety for runtime surprises. Here the config is
narrow enough to be fully validated, so it is not a trade.

## Contradictions run in both directions

`archetypes.json:76-86` carries a contradiction block per archetype, including for the
unprotected default:

- `student` + three or more years of relevant experience while not enrolled → confidence
  capped at 0.65, reason "contradiction: 3+ years of relevant experience for a 'student'";
- `bau` + enrolment *or* under a year of experience → capped at 0.65, "enrollment / <1y
  experience suggests early-career";
- `career_switcher` without substantial experience → capped at 0.7, phrased as a note
  rather than an accusation: "'switcher' usually implies prior professional experience".

The second of those is the one most implementations omit, and it is the one that keeps a
possibly-early-career candidate from being routed unprotected at full confidence.

## Where this falls short of the standard

- **The cap is an assignment, not a `min`.** `registry.py:186-189` sets
  `confidence = contradiction["confidence"]` in a loop over the matching rules, so with
  two or more contradictions for one archetype the *last* one wins, and a weaker cap
  placed later would silently raise the confidence a stronger earlier rule set. It is
  latent — each archetype currently has exactly one rule — and it is one word away from
  the standard's `min(confidence, ceiling)`.
- **The signal table has no review cadence.** The standard asks for periodic sampling of
  low-confidence and reviewer-corrected routings to check whether a weight is
  systematically misreading a career shape. Nothing in the repo samples the routing
  population; the weights have been correct since they were written, as far as anyone can
  demonstrate.
