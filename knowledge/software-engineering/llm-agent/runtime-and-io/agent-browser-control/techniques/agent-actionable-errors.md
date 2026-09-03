---
layer: technique
type: technique
subject: agent-browser-control
technique: agent-actionable-errors
status: forged
laws: [failure-not-empty-success, verdict-survives-boundary, one-validation-door]
shared_with: []
use_when: [an agent repeats the same failing browser command, a driver stack trace reaches the model, writing the message for a timeout or a stale reference, deciding what an unknown-command error should contain]
---

# Agent-actionable errors

When a browser action fails, the message that reaches the agent is the entire
recovery. There is no person in the loop to read a driver's stack trace,
recognize the shape, and try the thing that usually works. The agent reads
the text and does what the text suggests; if the text suggests nothing, the
agent repeats the command, or abandons the task, or — worst — reasons its way
to a plausible next step that was wrong. The decision rule of this technique
follows directly: **an error the agent cannot act on without a human is a
defect in the tool, not in the agent.** Every error surfaced to the agent is
written to that standard, and the standard is enforced at one door.

## The message carries the next command

An actionable error has three parts, in this order, because the agent reads
the first line most carefully. **What failed**, at the altitude of the command
the agent issued: the element, the navigation, the reference — not the driver
call underneath it. **Why**, as far as it is known, in one clause. **What to
run next**, as a literal command the agent can issue. The recovery is the
point; the rest is context for choosing between recoveries.

The canonical cases, because they account for most of the failures an agent
sees:

- **A stale reference.** "Reference `@e3` (button "Save") is stale — the
  element no longer exists. Run `snapshot` for fresh references." The former
  role and accessible name are in the message so the agent can find the
  element again in the new snapshot without re-reading the whole tree.
- **An unknown reference.** "Reference `@e9` not found. Run `snapshot`." The
  table was cleared — by navigation, most likely — and the agent's picture of
  the page is from before that.
- **An ambiguous selector.** "Selector matched multiple elements. Be more
  specific, or use references from `snapshot`." The steer toward references is
  deliberate: the agent wrote a selector, which is the thing this subject
  discourages, and the error is the place to say so.
- **A timeout — which one.** Navigation and interaction time out for different
  reasons and recover differently. "Page navigation timed out; the address may
  be unreachable or the page slow" versus "element not found or not
  interactable within the timeout; check the target or run `snapshot`". A
  bare "timed out" forces the agent to guess which, and it guesses wrong half
  the time.
- **A busy daemon.** "Command timed out; the daemon is alive and busy, not
  restarting. Retry, or raise the load." The agent must not conclude the
  browser is dead, and must know that a retry is the right move.
- **An unknown command.** The input named, the closest real command by edit
  distance, and — when the command exists in a newer build — an upgrade hint.
  A typo and a version skew are different mistakes.

## Strip the driver, keep the verdict

Driver errors arrive as multi-line messages with call-site detail, internal
method names and a stack. None of that is actionable and all of it costs
context. The rewriting door **strips internals** — the first line is kept only
when nothing more specific matched — and **maps the driver's failure class to
the tool's own**, by matching on the error's type and on stable markers in its
text. The second half of that is a maintained liability, as it is anywhere
prose is matched: each pattern is a bet that upstream wording holds, so the
patterns live only in the door and are ordered specific-before-general.

What must survive the rewrite is the **class**. A stale reference, a timeout,
an ambiguity, an unknown command: each is a distinct verdict that the agent —
and any tool wrapping the agent — should be able to branch on, and a verdict
that survives only as a friendly sentence has not survived
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
Where the surface returns structured output, the class is a field; where it
returns text, the first phrase is stable enough to key on and is treated as a
contract.

## One door, and failure spelled as failure

The rewriting happens at **one door**, the point where a command's result
leaves the daemon for the agent, and every handler's error passes through it
([one-validation-door](../../../../_laws.md#one-validation-door)). Rewriting
at call sites produces the familiar decay: the common paths are friendly, the
path added last quarter throws raw, and the agent meets the raw one on the
worst day. The door also owns the egress hygiene that page-derived text needs
— an error that quotes an element's name is quoting attacker-authored text,
and it is sanitized like any other page content.

Two things the door must never do. It must never turn a failure into an empty
success — a command that could not run and a command that ran and found
nothing are different results with different next commands
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
and an empty string with a zero exit is the most expensive lie a tool can tell
an agent. And it must never reassure beyond what is known: "the page may be
slow" is honest; "the page is fine, try again" is a guess dressed as a fact,
and an agent will act on it.

## Where the exit code goes

The command surface's exit status is part of the message. A busy daemon, a
dead daemon, a stale reference and a genuine page error are different
outcomes; collapsing them into one non-zero code discards a verdict the
wrapping harness could have branched on. The code is drawn from the same
closed vocabulary the daemon's lifecycle decisions use, so "busy" from the
liveness probe and "busy" from a command timeout are the same code and the
same first phrase.

## Decision rules

- Every error surfaced to the agent names what failed at command altitude,
  why in one clause, and the next command literally.
- Stale and unknown references carry the element's former role and name and
  say `snapshot`; ambiguous selectors steer to references; timeouts say which
  of navigation or interaction; busy says alive-and-busy and retry.
- Strip driver internals; map to a closed class vocabulary at one door; keep
  prose patterns only there, specific-before-general.
- Never empty success, never unfounded reassurance, never a bare non-zero
  exit where the verdict was known.
- Sanitize page-derived text inside the error like any other egress.

## The boundary

[user-facing-mapping](../../../../backend-platform/resilience/error-handling/techniques/user-facing-mapping.md)
translates failures for a *person* — someone with judgment, a support channel
and a screen that can show a suggestion beside a message — and its registry of
message-plus-suggestion pairs is the right shape there. This technique is the
same idea applied to a reader with no judgment to fall back on, where the
suggestion is not advice but the next command and the standard is
correspondingly stricter: a person can survive a vague message, and an agent
cannot. [agent-readable-build-outcomes](../../../../engineering-process/continuous-integration/machine-paced-delivery/techniques/agent-readable-build-outcomes.md)
does the same for a pipeline's verdict; this one does it for the browser's.

## When not to use this

Diagnostic output meant for the daemon's own log — the stack, the driver's
call, the raw message — keeps all of it, because that reader is a person
debugging the tool and the internals are exactly what they need. One failure,
two representations: raw toward the log, actionable toward the agent, and
neither pretending to be the other.
