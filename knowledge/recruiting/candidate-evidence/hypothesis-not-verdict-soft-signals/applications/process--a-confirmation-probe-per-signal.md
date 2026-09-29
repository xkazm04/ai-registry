---
layer: application
type: application
subject: hypothesis-not-verdict-soft-signals
technique: a-confirmation-probe-per-signal
stack: process
status: forged
verified_on: 2026-09-29
---

# `probe_kind`: the CV hypothesis becomes a targeted probe inside the work sample

The interesting half of this pipeline's soft-signal design is not that every signal
carries a suggested question — it is that some signals carry a *machine-followable*
route into a work sample, which is what closes the loop the standard describes as
hypothesis → targeted test. Re-read on 2026-09-29 against kp `d9c8b17f`.

## The field, and the two-condition rule

`SoftSignal` (`pipeline/jobfit/models.py:303-313`) carries the full record —
`source`, `confidence`, `needs_confirmation`, `suggested_probe` — plus:

```python
probe_kind: str | None = None   # devcase covert-probe kind, when one fits
```

`panel_to_probe_briefs` (`pipeline/jobfit/soft_signals.py:323-340`) applies exactly
the routing rule the technique states, as a single conjunction over the
antipatterns:

```python
for s in panel.antipatterns:
    if s.needs_confirmation and s.probe_kind:
        briefs.append({"kind": s.probe_kind, "focus": s.evidence[0] if s.evidence else s.label,
                       "rationale": s.suggested_probe})
```

Its docstring names the fallthrough explicitly — "everything else is
interview-only (see `to_interview_checklist`)" — so a signal is never lost; it is
routed to a conversation instead of an exercise. An already-confirmed signal
cannot re-enter as an exercise, because the first condition excludes it.

## Only one detector currently earns a probe kind, and it is the right one

`_claim_vs_evidence` (`soft_signals.py:76-104`) is the sole detector setting
`probe_kind="verification_trap"`, with the suggested probe built around the
specific uncited capability:

```python
suggested_probe=f"Deep-dive on {uncited[0]}: have them extend or debug real code using it — surface vs depth.",
probe_kind="verification_trap",
```

This matches the standard's decision rule that an overclaim on a named capability
is the clearest case for a demonstration over a conversation. The other
antipatterns are conversational by nature, and the pipeline does not pretend
otherwise. The tenure probe is one of them: since `d9c8b17f` it asks "what each
role added and what you were looking for next" rather than "the reason for each
transition", because a reason for leaving is answered well only by disclosing a
layoff, an illness or a family move.

## The consumer, and what the brief becomes

`pipeline/jobfit/devcase/design.py:237-248` takes `focus_probes` as "CV-hypotheses
to confirm". On the deterministic path (`:420-423`) each brief becomes an extra
cover probe appended to the designed case, with the kind clamped:

```python
for i, b in enumerate(focus_probes or []):  # targeted probes from the CV soft-signal panel
    kind = b.get("kind") or "verification_trap"
    if kind not in PROBE_KINDS:
        kind = "verification_trap"
```

The unknown-kind clamp against `PROBE_KINDS` (`:90`) is a small piece of the
standard's trust discipline: a brief cannot invent a probe kind the sample design
does not know how to build. The model path (`:354-357`) now receives the same
briefs as prompt context.

## Pinned as a contract, end to end

`pipeline/jobfit/tests/test_soft_signals.py` pins both halves. `:26-37` asserts an
uncited strong claim fires, needs confirmation, and carries
`probe_kind == "verification_trap"`; `:39-45` asserts it does *not* fire when the
capability is cited in evidence. `TestProbeBridge` (`:290-324`) then walks the
whole bridge: the panel yields a brief whose `focus` names the capability,
`design_case(..., focus_probes=briefs)` appends a targeted probe whose `where`
mentions that capability, and the case is unchanged when no focus is supplied
(`:319-324`). The negative test is what makes the positive one mean something.

## Deviation: the bridge has a door and still no caller

`pipeline/jobfit/pipeline.py:519-529` builds the panel — under a soft wrapper, so
a failure degrades rather than blocks — and stores it on the result (`:550`). Since
the first reading, the work-sample CLI grew a `--focus-probes-json` input
(`pipeline/jobfit/devcase/devcase_cli.py:285-287`, `:558-567`). Nothing passes it: a
search of the app and scripts finds no caller, and no production path invokes
`panel_to_probe_briefs`. So in production every signal is still interview-only.

The standard does not move. A probe route that exists and is unused is closer to
correct than a route that does not exist, and the CLI input halves the remaining
work. The value lands when the case designer is handed the briefs of the candidate
whose panel is already on the result.

## Deviation: no signal state, so the checklist only grows

Neither `SoftSignal` nor `SoftSignalPanel` has a field for *confirmed*, *refuted*
or *not asked*, and nothing carries an interview answer back. The standard's rule
that an answered probe permanently outranks the signal, and that a refuted
hypothesis must not be re-emitted by the next re-parse of the same document, has
no representation here — a re-run of the analysis produces the same antipatterns
regardless of what the interview established.
