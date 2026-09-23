---
layer: technique
type: technique
subject: model-call-outcome-integrity
technique: credential-posture-at-the-call-door
status: forged
laws: [absent-guard-is-loud, one-authority-per-vocabulary]
shared_with: []
use_when: [a flat-rate seat and a metered account can both serve the same call, spawning a child process that may inherit credentials, an outcome must record which billing relationship paid, redaction lists and environment lists have drifted apart]
---

# Credential posture at the call door

The credentials visible at the moment of the call decide **which commercial relationship
pays**, and often silently. The seam owns that decision explicitly, strips what must not
apply, and records which posture was used.

## The failure this prevents

Some engines can be reached two ways: through a flat-rate seat already paid for, or
through a metered account billed per token. The mechanism that chooses between them is
frequently just *the presence of a credential in the environment*.

That produces a failure with no error and no log line. A credential set for an unrelated
purpose — another tool, a test, a colleague's shell profile — is inherited by the call,
and work that should have drawn on a seat is billed per token instead. Nothing fails.
Usage looks normal. The invoice arrives at the end of the month.

The reverse is equally quiet: a call intended to be metered and attributed to a project
silently draws on a personal seat, and the project's cost record is wrong in the
flattering direction.

Three independent implementations have converged on the same countermeasure, which is
how this earned a technique rather than a note.

## The rule

**At the single point where the call leaves the process, construct the credential
environment deliberately.** Do not pass the ambient environment through.

1. Decide the posture first — seat or metered — from configuration, not from what happens
   to be present.
2. **Remove** the credentials belonging to the posture *not* chosen. For a subprocess this
   means constructing its environment rather than inheriting it.
3. Record the posture on the outcome. Which relationship paid is a property of the call,
   and reconciliation needs it later.

## One list, not two

The set of credential names matters in at least two places: the environment given to the
call, and the redaction applied to anything logged. Maintaining them as two literals is a
drift waiting to happen — and it has happened, with one list stripping more names than the
other scrubbed, so a secret that could not reach the child could still reach the log.

**One named constant, referenced by both, with a test that asserts they are the same
set.** A new credential name is added once. This is worth stating because both sites look
complete on their own, and the gap only exists in the relationship between them.

## Untrusted callees

Where the call executes something the model produced — a tool invocation, generated code,
an agent with file access — the same door governs, and the posture is stricter: none of
the calling system's credentials go through it, and the environment is an explicit
allowlist of fixture values. A call site with the ability to mutate its environment is a
different risk class from one that returns text, and the seam should treat that ability as
a declared property rather than an emergent one.

## Decision rules

- **Absence of a credential is a decision, not a default.** A seam that behaves
  differently depending on an unset variable is configured by accident.
- **Never infer posture from what is present.** Infer it from what was configured, then
  make the environment match.
- **Record the posture even when it did not change anything.** The value of the field is
  in the run where it turns out to be surprising.
- **A credential-shaped name in a place credentials do not belong is refused loudly**, at
  the earliest point it can be seen, rather than passed along to be discovered by whatever
  it reaches.
