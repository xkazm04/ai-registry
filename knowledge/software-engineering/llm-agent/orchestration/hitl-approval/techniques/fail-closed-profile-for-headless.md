---
layer: technique
type: technique
subject: hitl-approval
technique: fail-closed-profile-for-headless
status: forged
laws: [gate-sees-target, unknown-is-not-a-value, absent-guard-is-loud]
shared_with: []
use_when: [running an agent with no human to answer prompts, choosing what an approval gate does when nobody can be asked, a tool call the classifier cannot label, an unrecognised policy value in configuration, a headless run that hangs on a confirmation]
---

# Fail-closed profile for headless runs

[unattended-mode](./unattended-mode.md) is the *open* door: a scoped, expiring,
audited grant that answers gates on the operator's behalf. It presupposes an
operator who decided to grant. A different situation arrives more often than
the grant does: the process was simply started somewhere nobody is watching,
as a server mode, a scheduled job or a tool exposed to another agent, and there is
no one to ask and no grant either. What does the gate do then?

Two defaults are available and both are wrong. Prompting anyway hangs the run
on a question nobody will see, or silently resolves to whatever the transport
does with an unanswerable prompt. Approving everything is the unattended grant
issued by nobody. The right default is a **named profile that never asks and
refuses whatever it would not positively allow**.

## The rule: a closed table from (policy x classification) to a verdict

Approval is a pure function of a policy chosen for the session and a label the
call received *before* any decision. Keep it pure (no I/O) so the whole table
can be enumerated in a test.

| policy | positively safe | positively destructive | unlabelled |
| --- | --- | --- | --- |
| strict | ask | ask | ask |
| balanced | allow | ask | ask |
| fail-closed (headless) | allow | **deny** | **deny** |
| open | allow | allow | allow |

Five properties carry the design:

- **The classifier is three-valued, and "unknown" is not "safe".** Positive
  knowledge of safety (a read-only declaration, a recognised read-only command)
  is one class, positive knowledge of harm another, and everything the
  classifier knows nothing about is a third that no policy treats as safe. A
  classifier that fails or has no pattern must *degrade to unknown*, never
  block and never pass: classification is a label, the verdict is the table's.
  See [fail-loud-classification-default](./fail-loud-classification-default.md)
  for the intake-side form.
- **The headless profile never prompts, by construction.** Its fallback for
  everything not allowed is a verdict, not a question. A profile that "asks
  unless nobody is there" has a branch that depends on runtime presence
  detection, and that branch is where the hang or the silent pass lives.
- **Explicit allow rules still win over the fail-closed fallback; explicit
  deny rules win over everything, including the open policy.** The operator
  keeps one lever for "this specific destructive call is fine here" without
  changing the profile, and one for "never, in any mode".
- **An unrecognised policy value resolves to the strictest policy.** A
  misspelt or newer-than-this-binary value must never widen approval. Validate
  the value at load as well, naming the field, so the typo fails loudly and
  the strictest-fallback is only the backstop.
- **Denial is a tool result the model reads, with its source.** The refusal
  names which rule or which profile produced it, so the agent can route
  around it and the transcript can be audited. It is not an exception.

## Where the policy is stored, and what carries over

A policy is state of the *session*, so it must survive the operations that
rebuild a session's surroundings:

- **Resuming never re-applies defaults.** The stored policy is kept unless the
  resumer passes an explicit one. Re-applying author or global defaults on
  resume lets a configuration edit loosen a conversation that was started
  strict.
- **Delegated and handed-off sessions inherit the active policy** rather than
  resetting to the configured default. A sub-agent that starts open inside a
  strict parent is a privilege escalation by indirection.
- **The policy is changeable mid-session through a declared door**, with the
  change recorded; escalation can be offered from the confirmation prompt, which is
  exactly where a human present has the context to choose it.

## Smells

- A headless mode whose approval behaviour is "whatever the prompt layer does
  with no terminal".
- A classifier whose failure path returns *safe*.
- A policy enum parsed with a default arm that is more permissive than the
  strictest value.
- A test of the approval path that runs with a human-present fixture only.
- A sub-agent whose session policy is read from configuration, not from its
  parent.
