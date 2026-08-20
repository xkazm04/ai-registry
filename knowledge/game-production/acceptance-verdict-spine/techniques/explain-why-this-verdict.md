---
layer: technique
type: technique
subject: acceptance-verdict-spine
technique: explain-why-this-verdict
status: forged
laws: [one-authority-per-quantity, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [an operator asks why a unit is red, diagnosing a verdict takes a code bisect, a composed check reports a reason nobody can attribute]
---

# Explain why this verdict

The named concern: **a resolved verdict must be able to reconstruct, on demand, which
authority decided it and what each authority contributed** — without a debugger, a
log dive, or a read-only query against the verdict store.

The symptom that justifies building it: diagnosing a single red unit costs a
three-commit bisect and a manual query. The merge is correct and it is opaque, and
opacity in a gate is indistinguishable from unreliability to the person reading it.
People do not trust what they cannot interrogate; they route around it.

## What the explanation contains

One entry per layer, in the order the layers were applied. Each entry carries:

- **the layer's identity and a human name** — the vocabulary the operator will use
  when they ask someone for help;
- **its input**, rendered as status and rung;
- **its output**, rendered the same way, so a no-op is visibly a no-op;
- **whether it won** — did it change the verdict;
- **one plain sentence** saying what it did *or why it declined to act*. The declining
  case is the valuable one: "not applied, because a stored outcome only supersedes a
  deferred verdict and the checker decided this one itself" teaches the rule at the
  moment the reader needs it.

Above the entries, two summary fields: the final result, and the **deciding layer** —
the last one that changed the status. That single field is the direct answer to "why
is this unit this colour", and it is the operator's routing information: fix data,
re-run the runner, or re-judge.

For a composed checker, the checker entry additionally lists **every member**, each
with its own status, rung and reason, and a flag on the one whose result the
composition reported (see `first-non-pass-reporting-in-all-of`).

## The two guarantees, and why they are non-negotiable

**Display only, by construction.** The explanation re-applies the *same functions in
the same order* as the resolver. It does not reimplement the merge in more legible
form — that would create a second authority whose whole purpose is to be believed
about the first. If the explanation can disagree with the verdict, it is worse than
no explanation. Structure the code so that the final field of the explanation is the
resolver's output by construction, and state that guarantee where a future editor
will read it.

**On demand, never per render.** Explaining costs a re-run of the checker and each of
its members. That is affordable when a reader opens one disclosure and ruinous once
per unit per frame. Build it behind an explicit request and keep the resolution path
free of it.

## Decision rules

- **When a layer declines to act, say why it declined.** A silent no-op teaches
  nothing and looks like a bug.
- **When a judgment exists but was not applied, still report it** — with its standing
  and a plain statement of what it does and does not prove here. A judgment about
  content the unit no longer holds is
  [evidence about the past](./../../_laws.md#a-verdict-is-bound-to-its-content), and
  hiding it lets "not judged since the last change" read as "judged and passed".
- **When the explanation and the verdict could drift, collapse them.** Share the
  functions, not the logic.
- **When a reason is displayed anywhere, its author must be nameable.** If a surface
  can show a reason without being able to say which check produced it, the
  explanation is incomplete.

## Building it cheaply

The expensive-looking part — naming which member of a composition spoke — is cheap if
the composition records its members when it is built, as non-enumerable metadata on
the composed check. Grading is untouched; the explanation reads the metadata back and
re-runs the members. No registry, no parallel declaration to keep in sync, and a
plain check simply reports no members.

## When NOT to use this

- **When there is one authority and one check.** The reason field already is the
  explanation.
- **As a replacement for the reason field.** Every verdict carries its own reason
  always; the layer chain is the second question, asked by fewer people, less often.
- **On the hot path.** If you find yourself caching explanations to make a list view
  fast, you have put it in the wrong place.
- **As an audit log.** This reconstructs the *current* verdict from *current* inputs.
  It is not a history of what the verdict was yesterday; if you need that, record
  verdict transitions separately and do not confuse the two.
