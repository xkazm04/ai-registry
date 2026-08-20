---
layer: application
type: application
subject: hypothesis-not-verdict-soft-signals
technique: a-confirmation-probe-per-signal
stack: process
status: forged
---

# `probe_kind`: the CV hypothesis becomes a targeted probe inside the work sample

The interesting half of this pipeline's soft-signal design is not that every signal
carries a suggested question — it is that some signals carry a *machine-followable*
route into a work sample, which is what closes the loop the standard describes as
hypothesis → targeted test.

## The field, and the two-condition rule

`SoftSignal` (`pipeline/jobfit/models.py:273-284`) carries the full record —
`source`, `confidence`, `needs_confirmation`, `suggested_probe` — plus:

```python
probe_kind: str | None = None   # devcase covert-probe kind, when one fits
```

`panel_to_probe_briefs` (`pipeline/jobfit/soft_signals.py:265-283`) applies exactly
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

`_claim_vs_evidence` (`soft_signals.py:66-94`) is the sole detector setting
`probe_kind="verification_trap"`, with the suggested probe built around the
specific uncited capability:

```python
suggested_probe=f"Deep-dive on {uncited[0]}: have them extend or debug real code using it — surface vs depth.",
probe_kind="verification_trap",
```

This matches the standard's decision rule that an overclaim on a named capability
is the clearest case for a demonstration over a conversation. The other four
antipatterns are conversational by nature — `_tenure_instability`'s "walk through
the last three moves" cannot be answered by an exercise, and the pipeline does not
pretend otherwise.

## The consumer, and what the brief becomes

`pipeline/jobfit/devcase/design.py:226-231` takes `focus_probes` as "CV-hypotheses
to confirm". On the deterministic path (`:369-380`) each brief becomes an extra
cover probe appended to the designed case:

```python
for i, b in enumerate(focus_probes or []):  # targeted probes from the CV soft-signal panel
    kind = b.get("kind") or "verification_trap"
    if kind not in PROBE_KINDS:
        kind = "verification_trap"
    det_probes.append({"id": f"t{i + 1}", "kind": kind,
                       "where": f"a task that exercises {b.get('focus') or 'the claimed strength'}", ...})
```

The unknown-kind clamp against `PROBE_KINDS` (`:81`) is a small piece of the
standard's trust discipline: a brief cannot invent a probe kind the sample design
does not know how to build.

## Pinned as a contract, end to end

`pipeline/jobfit/tests/test_soft_signals.py` pins both halves. `:25-36` asserts an
uncited strong claim fires, needs confirmation, and carries
`probe_kind == "verification_trap"`; `:38-44` asserts it does *not* fire when the
capability is cited in evidence. `TestProbeBridge` (`:105-139`) then walks the
whole bridge: the panel yields a brief whose `focus` names the capability
(`:116-120`), `design_case(..., focus_probes=briefs)` appends a targeted probe
whose `where` mentions that capability (`:122-132`), and the case is unchanged
when no focus is supplied (`:134-139`). The negative test is what makes the
positive one mean something.

## Deviation: the bridge is tested but not wired

`pipeline/jobfit/pipeline.py:406-413` builds the panel — under a soft wrapper, so
a failure degrades rather than blocks — and stores it on the result (`:433`). No
production caller invokes `panel_to_probe_briefs`; only the tests do. The loop
from hypothesis to targeted test therefore exists as a proven capability with no
runtime path, which means in production every signal is interview-only.

The standard does not move. A probe route that exists and is unused is closer to
correct than a route that does not exist, but the value only lands when the
work-sample designer is actually handed the briefs — one call at the point the
case is designed for a candidate whose panel is already on the result.

## Deviation: no signal state, so the checklist only grows

Neither `SoftSignal` nor `SoftSignalPanel` has a field for *confirmed*, *refuted*
or *not asked*, and nothing carries an interview answer back. The standard's rule
that an answered probe permanently outranks the signal, and that a refuted
hypothesis must not be re-emitted by the next re-parse of the same document, has
no representation here — a re-run of the analysis produces the same antipatterns
regardless of what the interview established.
