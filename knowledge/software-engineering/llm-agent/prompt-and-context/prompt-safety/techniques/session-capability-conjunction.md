---
layer: technique
type: technique
subject: prompt-safety
technique: session-capability-conjunction
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [every permission check passes and the run still leaked, an agent session can read third-party text and hold credentials and send data out, deciding which capability a session should never be given, forking or handing a transcript to another agent or seat, a gate judges one outbound request with no idea what the session already read]
---

# Session capability conjunction

A permission check asks one question about one action: may this session read
that file, fetch that page, call that endpoint? Each answer can be a correct
yes, and the run can still hand its secrets to a stranger, because the harm is
not in any action. It is in a **combination held by one context**. Three
capabilities are each ordinary alone:

- **A - it reads text a third party wrote**: a fetched page, an issue body, an
  inbox, a tool result, a document someone else authored.
- **B - it can reach private material**: credentials, customer records, a
  database, environment variables, the operator's files.
- **C - it can move data out or change state**: a send, a post, a push, a
  network-capable shell, a URL fetched with a query string.

A gives an attacker a voice inside the context, B gives that voice something
worth taking, and C gives it a door. With all three in one context, injected
text can drive B's material out through C using only calls that pass every
check. Per-action checks cannot see this by construction: the violation is a
predicate over the session's history, and the check is handed a single call.
**The rule is: no context holds all three. Where one must, the outbound step
is not autonomous.**

## Legs are sticky for the life of the context

A leg lights the moment its capability enters the context, and it stays lit
until the context ends. Text that was read cannot be un-read, and summarizing it
does not help, because an injected instruction survives into the summary (the
re-promotion path in the tool-boundary discipline). So a leg is a
**monotonic flag per context**, never a property of the current turn. Three
consequences teams miss:

- **Reachable counts as touched when the host cannot see the read.** A credential
  placed in the process environment or a mounted file lights B at spawn, before
  the first turn, because the model can read it through a call the host never
  inspects. Only material behind a door the host judges can wait until it is
  actually read.
- **A forked transcript inherits every leg.** Cloning a conversation into
  another agent, handing a plan with its full history to a second seat, or
  resuming a session copies the context, and the context is where the legs
  live. The new seat starts with A and B already lit, whatever its own roster
  says.
- **Only a fresh context resets.** A sub-agent that receives a structured,
  fenced brief starts clean for everything the brief does not carry. That is the
  one legitimate way to get all three capabilities into a workflow: split it, so
  the context that read the stranger never holds the key, or the context that
  holds the key never reads the stranger.

## Cut a leg at design time first

Tracking legs at runtime is the fallback, not the first move. The cheapest
enforcement is a roster that never grants one leg to a context at all, and it is
decided when the session is configured:

1. **Enumerate each session type's roster against the three legs.** A research
   session that reads the web gets no credentials. A session that holds
   credentials reads nothing a third party wrote. A session that does both gets no
   outbound channel and returns its product to a clean context that does.
2. **An undeclared roster is all three legs.** If the host cannot say which
   tools a session holds, because the roster belongs to the harness underneath,
   it cannot prove any leg absent and must treat every leg as lit
   ([failure ≠ empty success](../../../../_laws.md#failure-not-empty-success)
   applied to capability: "not known to be granted" is not "not granted").
3. **Destination scope shrinks C; it does not remove it.** Restricting a
   credential to a subset of resources bounds *where* a call may land, not
   *whether data leaves*. An in-scope destination the attacker can read (a
   shared channel, a public comment thread, a record another party syncs) is
   still an outbound channel. Count it as C.

## When a context must hold all three

Some sessions genuinely need to read third-party text, use a credential and act.
Then the gate moves from the roster to the outbound step, and it has three honest
shapes:

- **Refuse the outbound step** once A and B are both lit, and say so as a
  distinct outcome, never as a generic failure.
- **Require fresh human approval** for that step, showing where its arguments
  came from; the argument-provenance and consent rules in the tool-boundary
  discipline (`mcp-tools/untrusted-result-handling`) are this gate's approval
  screen. Approval fatigue is the cost, which is why design-time cuts come
  first: an approval that fires on every session trains a reflexive yes.
- **End the context and hand a fenced product to a new one** that holds only
  the leg it needs.

## The gate has to see the session

A gate that judges a request record carrying method, path and credential, and
nothing identifying the context that issued it, cannot express this rule at all.
It can still block the request, but only for reasons visible in the request.
So the outbound door needs the context's identity and its leg ledger in scope
([gate-sees-target](../../../../_laws.md#gate-sees-target): the target of this
decision is the session, not the call). And the ledger is written where the legs
become observable: at spawn for injected material, and at the tool-result
boundary for third-party text. A leg the host cannot observe (an internal shell
call that opens its own connection) is a door the host does not own. Record it
as unguarded rather than letting the proxied doors stand for all of C.

## What it does not cover

This stops the high-consequence path of an injection: disclosure through an
outbound action. It does nothing about an agent that is simply wrong, an
over-privileged roster used as intended, or a deliverable that is itself the
leak because the prose goes to a person (the read-side least-privilege rule in
this subject owns that). It is one fence. It is the one that does not depend on
the model telling instruction from data.

## Smells

- Every tool call is individually allowlisted and nothing records what the
  session has already read.
- Credentials injected into an agent's environment "because some tool might need
  them", in a session that also fetches pages.
- A plan or transcript forked to a second agent whose roster was reviewed while
  the history it inherited was not.
- A scoped credential cited as the exfiltration defense.
- An outbound gate whose request record has no session identity.
