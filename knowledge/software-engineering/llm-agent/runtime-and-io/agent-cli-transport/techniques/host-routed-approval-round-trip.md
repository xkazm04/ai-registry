---
layer: technique
type: technique
subject: agent-cli-transport
technique: host-routed-approval-round-trip
status: forged
laws: [gate-sees-target, identity-survives-reuse, unknown-is-not-a-value]
shared_with: []
use_when: [a wrapped coding agent runs behind an attended chat surface, choosing between a pre-set stance and full access for an interactive session, the child emits approval requests mid-turn and nobody answers them, a host already owns a review queue and passes the skip-all-permissions flag, mapping one permission selector onto several tools' native vocabularies]
---

# Host-routed approval round-trip

This subject's normal shape is batch: one process, one final envelope, and a
stance fixed before the run starts
([permission-stance-enforcement](./permission-stance-enforcement.md)). The
reason is that nobody is there. A child that stops to ask has no one to ask,
so everything it may do has to be decided in advance.

That reason goes away when the host puts a person in front of the child: a
chat surface, a console, a messaging channel where the operator is watching
the turn. The pre-set stance then becomes the wrong instrument, and this
technique is what replaces it.

## The inversion

A pre-set stance is one coarse decision made before anyone knows what the
task needs. On an attended surface it forces a bad choice. If the stance is
narrow enough to be safe, the task fails the first time it needs one command
outside the list. If the stance lets the task finish, it is usually full
access. In the field, operators pick full access, because a stalled chat is
visible and an over-broad grant is not.

The child already has a better instrument. Its own permission engine asks
one question at a time. Each question names a class (run this command,
apply this file change, widen these permissions) and carries its bound
parameters: the literal command, the working directory, the exact
permission set. That is the disclosure a consent gate needs
([consent-gates](../../../orchestration/hitl-approval/techniques/consent-gates.md)),
produced by the only component that knows what is about to execute
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Pre-setting
full access throws the question away. Leaving the request unanswered keeps
the question but has no answer channel: the turn stalls until the child's
own timeout, and the host logs a model failure.

The round-trip keeps the child's fine-grained engine and makes the host's
approval surface its answer channel.

## The procedure

1. **Run the child where it can ask.** Plain print mode cannot ask anything
   mid-turn. The round-trip needs an answer channel. One kind is a
   long-lived server mode in which the child sends approval requests to its
   client as requests the client must answer. The other is a delegation
   hook: a permission callback the host registers with the tool's
   programmatic interface, or a named tool on a host-supplied tool server.
   The procedure below is the same for both. Register the answering handler
   before the first turn. If a request arrives and no handler is registered,
   answer decline.
2. **Resolve who is asking from the child's own identifier.** At turn
   start, record which host session, user, channel and agent own the
   child's thread identifier. Each request carries that identifier, and the
   pending approval is created against the owners it resolves to. A thread
   the host cannot resolve is unknown, and unknown is not the default
   session ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
   Decline it rather than filing it where some unrelated conversation will
   see it.
3. **File it in the host's own approval service.** Use the same pending
   record, the same queue and the same decision records that the host's
   native gates use, so a child's request looks like any other gated action.
   Set severity by request class: command execution and permission widening
   are high, file changes are medium. Build the disclosure from the child's
   parameters, never from a summary the child writes about itself.
4. **Wait on the service's clock, and make it the shorter clock.** The
   host's approval timeout must expire before the child's request timeout.
   If the child's timeout expires first, it has already moved on, and the
   human's later answer lands on nothing while the record says "approved".
   A timeout resolves to decline, recorded as expired, never as proceed.
5. **Translate the verdict into the child's vocabulary exactly.** A
   command or file change gets accept or decline. A permission-widening
   request gets back exactly the set it asked for if approved, and the empty
   set otherwise, scoped to the current turn. Never return a wider set and
   never a session-long grant by default. A widening the human approved for
   one turn is not a standing grant.
6. **Fail closed on everything unrecognized.** A request method the handler
   does not know, an exception inside the handler, or an approval service
   that cannot be reached all answer decline. When the host cannot tell
   what it is being asked, the answer is no.

## The answer belongs to the conversation that asked

A pending approval records its originating session. Recording the session is
not the same as enforcing it. If the resolving path checks only the agent,
a person in a different conversation with the same agent can approve a
command whose context they have never seen. Worse, a "resolve the queue
head" shortcut can do it without anyone choosing to. The decision is a fact
about one (session, request) pair
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
So the resolver refuses a decision from outside the originating session, or
the originating session tree, unless the actor is an explicit administrator
and is recorded as one. A binding that is written down but never checked
protects the audit trail and nothing else.

## Presets are translated, not flattened

The round-trip does not remove the stance selector. It gives the "ask"
positions something to mean. Tools in this class spell their permission
models differently. One combines a sandbox level with an approval policy.
Another has a single permission mode with its own named positions. The host
offers one selector and maps each choice into each tool's native settings,
per tool. It never invents a universal switch, because a single switch
cannot express "sandboxed but ask before elevated actions" for one tool and
"accept edits, ask for commands" for another without losing one of them. The
presets each tool supports, and what they map to, are
[dated-capability-matrix](./dated-capability-matrix.md) rows. They are not
constants in a catalog.

## The event path is part of the gate

In server mode, approval requests and the turn's event stream share one
connection. A host that fans events out through bounded queues and drops on
overflow can drop the terminal turn event. The host then waits forever on a
turn that finished, which looks like an approval that never arrived. A
bounded queue that overflows must end the turn as failed and say why, and
the host's wait on a turn needs its own ceiling, like every other wait in
this subject.

## Near misses

The typical deviation is not a host that lacks the parts. It is a host that
has all of them and no wire between them. A desktop host was observed
launching the child in print mode with the skip-all-permissions flag, while
it already injected its own tool server into that child and already owned a
human review queue. Some print modes delegate permission prompts to a named
tool on a host-supplied tool server. With that hook, the round-trip needs no
server mode at all: the host's tool files the pending approval and returns
the verdict.

The second near miss is a "trusted runner" setting that answers every
request by picking an allow option, while the product's documentation says
the host never decides for the user. That is an unattended grant with no
scope, no expiry and no record. If auto-answering is wanted, it goes through
the pending record as a grant, recorded as the decider
([unattended-mode](../../../orchestration/hitl-approval/techniques/unattended-mode.md)),
not around it.

## Decision rules

- **Ask one question first: can the host reach a human inside the child's
  request timeout?** If not, fix the stance before the run
  ([permission-stance-enforcement](./permission-stance-enforcement.md)),
  and grant any auto-answering scope through
  [unattended-mode](../../../orchestration/hitl-approval/techniques/unattended-mode.md).
  If yes, use the round-trip.
- When the child offers neither a server mode nor a permission-delegation
  hook, use stance enforcement. Never scrape prompts out of a print-mode
  output stream and pretend to answer them.
- When the verdict is timeout, deny, unknown or error, answer decline. Only
  an explicit approval is accept.
- When the request widens permissions, return the requested set or the
  empty set, for this turn only.
- When a decision arrives from outside the originating session tree, refuse
  it unless an administrator is named in the record.
- When an approval request is really a question whose answer the machine
  cannot derive, it is elicitation
  ([mcp-tools](../../mcp-tools/mcp-tools.md)), not consent. No auto-answer
  grant covers it.

## When not to use this

- **Batch and unattended runs.** Nobody will answer, so every request
  becomes a stall that ends in decline. That is correct, but it wastes the
  run. Decide the stance beforehand.
- **`readonly-scan`.** That mode promises the child cannot write. A human
  approving a write request in the middle of a scan breaks the promise the
  mode was selected for. A scan's write requests are declined without being
  filed.
- **Long attended edit sessions that ask about every file.** Each prompt
  draws on the same attention budget. Pick a preset that accepts workspace
  edits, and use the round-trip only for elevated classes.
