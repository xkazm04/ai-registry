---
subject: conditional-service-composition
domain: software-engineering
last_touched: 2026-10-06
touched_by: deepen
dry_streak: 0
---

# conditional-service-composition

Forged 2026-09-06 by `/intake` (harbor-0906, spec in
`librarian/handoffs/2026-09-06-conditional-service-composition.md`) with three techniques.
First application 2026-10-03 (conjunction-activated-fragments, tracklight, experiment,
better), which named a gap the technique did not carry: a composite condition is
refused when the orchestrator hard-references a constituent that was not requested.

## Touch log

### 2026-10-06 - `/deepen`, single subject (run dp-csc-1006)

Dispatched on the structural floor (3 techniques, floor 4) and the open gap above.
Four lanes: counter-evidence (web), training-data-only (blind), primary prior art
(web), and a real-resolver experiment.

**New technique: `requirement-closure-before-selection`.** Convergence: the blind lane
named the closure fixpoint (requests only, transitive, Kconfig `select` as the footgun)
unprompted; the prior-art lane found the same rule in four engines with verbatim
quotes (dependent declares; check-or-close; forcing "without visiting the
dependencies" yields illegal configurations; requirement is orthogonal to ordering);
the experiment measured it (requirement-as-condition 2/8 silent drops, engine-only 2/8
refusals, closure 0/0). Upper layers carry no product names; the measurement and the
`required: false` omission door live in the docker-compose application.

**Corrections (counter-evidence lane; each re-checked before landing):**
- conjunction-activated-fragments: "add disjunction and the reverse question becomes
  satisfiability" was wrong - monotone OR-of-ANDs stays reverse-checkable; negation
  (and exclusion declarations) is the line. Rule unchanged, reason corrected; gained
  "a condition is not a requirement" and the closed-selection gate assertion.
- specificity-ordered-layering: "arity is a restatement of containment" refuted - it
  is one linear extension; incomparable co-activatable fragments get a swap-order
  build gate (validated with a positive and a negative control). Locale collation
  measured reordering names (cs vs en). The source project's own sort uses
  locale-aware compare in both resolvers - the code-point rule corrects the source.
- intent-and-environment-in-one-namespace: proceed-on-fallback holds for an
  optimisation capability only; a required capability refuses.
- golden path: "a credential that was a mount is inlined" refuted - file-mounted
  secrets stay references as absolute host paths; lookups and env side files do
  inline (measured). Four commitments, six stages, fourth failure mode.

**Confirmed and left standing:** the probe tri-state; the arity-first sort as what
the source actually does; lexical-only drop-in ordering as common prior art.

**Declined:** per-field merge semantics (blind lane #4) - owned by settings and
overlay-merge-absence-semantics, and the golden path cedes the merge to the engine;
probe override/replay (blind lane #5) - the intent technique already names a forced
override mechanism, and the dump command covers the recorded resolution.

## Impact

The regenerated map (dry run, 2026-10-06) pairs this subject with **0 contexts** in any
project map, so no verdict went stale and no `/conform --stale` queue exists for it.
The seams used were found by inventorying compose files directly (tracklight,
systedo-case). That the join sees nothing is itself a lead: the subject governs
deploy/compose topology, which the context maps do not route here.

## Applied

- requirement-closure-before-selection - tracklight - experiment - better.
- conjunction (a condition is not a requirement) - tracklight - experiment - better.
- golden-path flattening correction - systedo-case - code - better (efd6d974, local).
- specificity incomparable-fragment gate - unapplied (no fleet fragment assembly).
- intent required-capability refusal - unapplied (no fleet capability probing).

## Open leads (banked, convergence rule applies)

- Transitive requirement chains were not exercised (tracklight has depth 1). Return:
  a topology with a requirement of a requirement.
- The source project's cross-file selector names one service under a name no
  service file carries (`koboldcpp` vs `kobold`), so the file is silently dropped
  or left with a dangling reference - corroborates the vocabulary gate; an upstream
  report candidate, not registry content.
- `required: false` warning at a real `up` (not dry run) unobserved.
- Map routing: contexts touching compose/deploy files do not join this subject.
  Return: the next `/librarian` routing pass.

## Saturation

Depth rung L3 (empirical: real resolver, n=8 requests x 3 arms). Last-pass yield: 1
technique + 4 corrections. Dry streak 0. Clocks: docker-compose application derives
its window from the stack; no override.
