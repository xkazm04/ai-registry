---
layer: golden-path
type: golden-path
subject: agent-runtime-assembly
status: forged
use_when: [composing the hook chain that wraps model and tool calls, deciding who may load code into the agent runtime and what happens when it fails, a remote operation outlives the turn that started it, choosing how durable conversation state is stored and resumed]
techniques:
  - semantic-hook-placement
  - assembly-identity
  - operator-tier-code-loading
  - host-routes-win
  - bounded-projection-of-external-work
  - checkpoint-mode-custody
  - observer-and-mutator-surfaces
  - rewrite-before-the-gate
  - honest-hook-registry
  - session-scoped-capability
  - guard-input-custody
  - additive-input-at-the-call-boundary
  - indeterminate-closure-on-interruption
  - substituted-result-attribution
---

# Agent runtime assembly

Between the door that admits a run and the call that reaches the model sits a
layer most agent systems never name. It is the code that decides, per run,
which hooks wrap the model call and the tool call and in what order; which
contributed code is allowed into the process and under whose authority; what
the running loop holds in its own memory and what it merely reads from a
store that will outlive it; and how the durable record of the conversation is
written so that a later process can read it back. This subject is that layer.
Call it the **runtime assembly**: the act of turning a configuration into one
executable pipeline, and the properties that pipeline must have before the
first model call is made.

The naive reading treats all of this as plumbing — a list of features that
happen to be switched on, wired together in whatever order the file was
written. The principal position is different: **a run is an assembled
artifact with an identity, not a list of features that are on.** Every hook's
position in the chain is a correctness property, because the chain decides
what wraps what, and therefore which gate sees which result. Code that extends
the runtime enters by the operator's hand and fails in its own lane, because a
contribution that can take the host down has been granted more than it was
given. And the loop holds only what survives a compaction and a restart;
everything else is a projection of a store that outlives the run. The
techniques are these three sentences made operational - the first six from the
runtime that raised the subject, four more from a peer runtime's extension host
and capability surface, reconciled against them.

## Where this subject starts and stops

The neighbours are precise, and the seams are where a runtime rots first.

**The prompt is not this subject.** The artifact the model reads — its
layers, its budget, its cut, and the digest that keeps a cached session honest
— belongs to [prompt-assembly](../../prompt-and-context/prompt-assembly/prompt-assembly.md).
That subject composes text; this one composes the *code around the call*.
The two fingerprints they define answer different questions, and the boundary
is written out under [assembly-identity](./techniques/assembly-identity.md):
the prompt fingerprint says whether a session may continue; the assembly
identity says whether two deployments ran the same agent.

**The wire is not this subject.** How a tool server describes itself, what
crosses the connection, and how a result is fenced on arrival is
[mcp-tools](../mcp-tools/mcp-tools.md). That subject stops at the host's door
and says so — it excludes "plugin systems that load code into the host's
address space" from its scope in its own words. This subject picks up exactly
there: the in-process extension that has no protocol boundary to protect it,
and the host-side custody of work a tool server runs for hours.

**The job record is not this subject.** The durable row, the closed status
vocabulary, the lease whose expiry is evidence of a dead executor — those are
[job-coordination](../../../backend-platform/work-execution/job-coordination/job-coordination.md).
[bounded-projection-of-external-work](./techniques/bounded-projection-of-external-work.md)
*consumes* a lease it does not define: it says what the agent loop may hold
about work that has such a record, not how the record is kept.

**The fleet and the child are not this subject.** What sessions exist and
what they collectively produced is
[fleet-orchestration](../../orchestration/fleet-orchestration/fleet-orchestration.md);
whether a process is alive and how it is ended is
[subprocess-lifecycle](../subprocess-lifecycle/subprocess-lifecycle.md). The
receipt ledger that fleet-orchestration's completion verification reads is
stamped by a hook, and *where that hook sits* is this subject's first example;
what the parent does with the receipts stays there.

**The replay viewer is not this subject.** Watching a finished run happen again
is [time-travel-replay](../../evaluation-and-cost/time-travel-replay/time-travel-replay.md),
which disclaims restore in its own words. Resuming a conversation from an
earlier point *is* a restore, of durable state that may not be self-contained,
and [checkpoint-mode-custody](./techniques/checkpoint-mode-custody.md) owns
what the runtime does when the store's representation makes a naive fork lie.

The rule a reader uses to pick: if the question is about the text the model
sees, go to prompt-assembly; about what crosses a process boundary, go to
mcp-tools or subprocess-lifecycle; about a record's lifecycle, go to
job-coordination. If the question is about *how the code around one model
call is put together, extended, and kept honest about state* — it is here.

## The chain is a contract, and order is what it says

A production runtime wraps the model call and the tool call in hooks: a
sanitizer that scrubs input, a gate that refuses a write without proof of
freshness, an accountant that counts progress, a receipt stamper that records
what ran, an authorizer that can refuse a call outright. Each is written as if
it were alone. None of them is. The chain composes them, and composition
decides which hook sees the *result* of which other hook — and that is not a
preference. A gate that can answer a call itself, short-circuiting with its own
result, is invisible to every hook inside it. If the receipt stamper sits
inside the authorizer, every refused call is a call the ledger never saw, and
the verifier reading that ledger is blind on exactly the calls it most wants
to see. If a write gate sits inside the progress accountant, a blocked write
costs a slot it never used.

So the standard names the invariant instead of the order: **the outermost
tool wrapper is the one whose omission would gap a ledger**, and every other
placement is derived from what a hook needs to see. That gives contributed
hooks a vocabulary — I need the logical model call, or the physical one; the
tool call as the model sees it, or the raw call as the transport does — in
place of a list index that breaks the moment the host inserts something. One
final composition point renders the chain, and the ordering invariants are
checked there, at compose time, so a regression is a startup failure rather
than a ledger with holes discovered by an audit.
[semantic-hook-placement](./techniques/semantic-hook-placement.md) owns the
placement classes, the single composition point, and the validated
invariants.

## The assembly has an identity, and it answers one question

Once the chain is a contract, the assembled runtime is a thing that can be
compared — this deployment against that one, this run against the last. That
comparison needs an identity, and identity here is a digest with a scope
chosen for exactly one question: **did this agent's assembly change?**

The scope is the whole discipline. Every hook that affects behaviour declares
its policy parameters — thresholds, modes, the digest of any long text it
carries — as its own identity, so the assembly does not have to probe a
hook's internals to know what it does. The digest sorts what is
order-insensitive (the tool roster, the skill set) and preserves what is not
(the hook order, which the previous section made a contract). And it
*excludes the host build*, because a digest that folded in the build would
move on every redeploy and could never again distinguish "we changed the
agent" from "we shipped on Tuesday". The prompt's own fingerprint is one field
inside this descriptor, not a competitor to it.
[assembly-identity](./techniques/assembly-identity.md) owns the declaration
rule, the sort-versus-preserve split, and the written boundary with the prompt
fingerprint.

The same one-authority discipline reaches the capability roster. Where a
policy decides which tools a run may hold, the assembly-time filter that
withholds a capability from the roster and the run-time check that refuses
its execution must derive from *one* policy, or the model is shown a tool the
executor will refuse — a fluent invitation to fail. That pairing is now
[session-scoped-capability](./techniques/session-scoped-capability.md), which
adds the rule this paragraph could only imply: the capability resolves from the
session's own source, never from a process-wide slot.

## Code enters by the operator's hand and fails in its own lane

A runtime that accepts contributions — hooks, tools, routes — has an
extension surface, and an extension that loads into the process is code
execution with the process's privileges. The general shape of that problem is
the delivery system's injected-code-scope-ladder, whose rule is to push code
down to the narrowest tier that still works and give each tier one enumerable
door. The runtime needs its own tier rule because its tiers are not machine,
repository and step: they are **the startup configuration only an operator
can write** and **the configuration an authenticated caller can write through
the service itself**, and the second must never be able to name code. An
administrator with service access may configure behaviour; only the operator
who controls the process's startup may load code into it.

Two consequences follow. A load failure is fatal only when the operator marked
that contribution *required* — the default is that a broken extension is
diagnosed, attributed, and skipped, because the alternative turns every later
failure (a missing native library, a deleted snapshot) into a startup abort
recoverable only by shell access. And at run time a contributed hook runs
*isolated*: its failure emits an attributed diagnostic and the chain passes
through without repeating a downstream side effect. The subtle rule is how
fail-open decides what a failure *is*: by the **origin** of a cancellation,
not its class. A contributor's internal timeout raises the same exception the
host raises when it cancels a run, and propagating it would end an otherwise
successful run as cancelled and skip every successor. Only a genuine host
cancellation propagates.
[operator-tier-code-loading](./techniques/operator-tier-code-loading.md) owns
the two tiers, the required flag, the isolation wrapper, and the origin rule.

Routes are the second seam of the same surface. A contribution that mounts
handlers onto the host's service is claiming paths, and a path it claims may
already be the host's — including an authentication-exempt one. The standard
builds contributed routers early, so their construction failures surface with
the rest of loading, but mounts them *last*, so the host's handler always
wins; and it rejects a contribution atomically when an existing route
*provably* covers one of its paths for the same method, while allowing what
it cannot prove rather than guessing. [host-routes-win](./techniques/host-routes-win.md)
owns the mount order, the proof, and why the predicate must classify the path
the router actually matches on.

## The loop holds only what survives

The agent loop is the least durable place in the system. Its context is
compacted when it grows; its process is restarted on deploy; its run ends when
the turn does. Anything the loop *holds* — a handle to remote work, a status
it polled, a partial result — is lost at the first of those events, and the
loop cannot tell which one is coming. So the rule is not "persist important
things"; it is that **the loop holds nothing that a store does not hold
first**, and reads back a projection sized for what it is doing now.

The sharpest instance is work that outlives a turn: a tool server accepts an
operation that runs for hours and hands back a handle. If the loop keeps the
handle in context and polls, liveness is tied to a model turn and the handle
dies with the run. The standard submits from the loop and never polls from
it: only *submit* is visible to the model, and it returns a local identity
after the remote handle is durably persisted; a background runtime outside
any run polls under a lease it borrows from the job discipline; the store is
the truth. A result that arrives after that lease expired, or after a cancel
was requested, is discarded even from the right owner, because a late write
would overwrite a peer's newer state. Delivery back into the conversation is
an idempotent internal run whose trusted instruction sits *outside* the input
boundary and whose remote payload is framed as untrusted — a delivery
instruction inside the input boundary is an injection channel from the remote
server. [bounded-projection-of-external-work](./techniques/bounded-projection-of-external-work.md)
owns the visibility rule, the discard rules, and the framed delivery.

## Durable state has a custodian, and the custodian has a mode

The conversation's durable record is written by the graph engine in a
representation the runtime chooses, and that choice has consequences the
runtime must own. A store that writes the complete state at every step is
self-contained and expensive — storage grows with the square of the turn
count. A store that writes deltas is cheap and *not* self-contained: reading
one checkpoint means walking its ancestry, and a shared parent carries the
abandoned sibling's writes as well as the live branch's. The two
representations cannot be mixed by accident, so the **mode is frozen once per
process, before the graph compiles**, and every checkpoint carries a marker
that says which mode wrote it.

Compatibility is then asymmetric on purpose. A process that reads complete
state can be handed a delta checkpoint and silently return an *empty*
conversation — a partial read wearing the costume of a valid one — so that
direction fails closed. A process that reads deltas can materialize a complete
checkpoint trivially, so that direction stays open. Every read goes through
one accessor that injects the marker, runs the gate, and materializes; a raw
read is the door left open. And when a resume would fork state that is not
self-contained — regenerate from an earlier turn, continue from a
client-supplied checkpoint — the runtime does not fork: it writes the
requested checkpoint's complete state onto the current head and proceeds
linearly, rather than reimplementing the store's ancestry walk and getting the
sibling's writes wrong. [checkpoint-mode-custody](./techniques/checkpoint-mode-custody.md)
owns the freeze, the accessor, the asymmetry, and the linearized resume.

## The loop has exactly two doors, and both are disciplined

A unit of work looks closed from the outside: one input starts it, and it
runs until the model stops asking for tools. Two things nonetheless have to
get in and out of it mid-flight, and each is a place where a runtime that
improvises acquires a defect it will not find for months.

**Something arrives while it is running.** A person types a follow-up. The
tempting design cancels the unit and restarts with the new message, and it
is wrong for reasons that live in other parts of the runtime entirely: it
resets the context transform so the model forgets the batch it just read, it
marks the preceding work unclean so the sealed continuation metadata is
voided on every steer, and it cannot be applied at all to a unit suspended on
a human decision. The alternative accepts the message *into* the running unit
at the model-call boundary, purely additively.
[additive-input-at-the-call-boundary](./techniques/additive-input-at-the-call-boundary.md)
owns the boundary's exact position, the drain that keeps the loop ignorant of
the queue, the record-before-request reference that makes recovery correct,
and the budget reset that stops a steered agent being given less room than a
fresh one.

**Something ends while nothing is watching.** A process dies with a call
outstanding, and recovery has to write a result it does not have. Writing
failure looks conservative and is a definite verdict the runtime has not
earned; the honest closure is a third status saying the outcome is unknown
and nothing was retried.
[indeterminate-closure-on-interruption](./techniques/indeterminate-closure-on-interruption.md)
owns that status, the rule that it is a first-class value and never a
distinguishing string inside a failure message, and the ordering obligation
that makes the whole record safe to read: every unresolved call is closed
before the terminal event is written, so a terminated unit's record is
complete for every later consumer rather than for the ones that remembered to
special-case it.

## Failure modes this standard exists to prevent

- **The index placement** — a contribution inserted at position three of a
  list the host later grows, now wrapping the wrong thing.
- **The gapped ledger** — a receipt layer inside a short-circuiting gate, so
  the calls that were refused are the calls no verifier can see.
- **The moving identity** — an assembly digest that includes the build, so
  every redeploy reads as an agent change and the comparison means nothing.
- **The probed hook** — assembly identity computed by reading a hook's private
  attributes, which the next refactor silently renames.
- **Code through the service door** — an authenticated caller who can write
  configuration can name an entry point, and configuration becomes execution.
- **The fatal optional** — a broken contribution nobody marked required takes
  the whole host down.
- **The propagated timeout** — a contributor's cancellation ends the host's
  run as cancelled and skips its successors.
- **The shadowed host route** — a contributed handler mounted before the
  host's, claiming an authentication-exempt path.
- **The handle in context** — remote work whose only reference lives in the
  model's window, lost to the first compaction.
- **The late write** — a status result landing after lease expiry and
  overwriting the successor's state.
- **The instruction in the input** — a delivery instruction inside the
  untrusted boundary, which the remote server can now author.
- **The silent partial read** — a full-mode process reading a delta
  checkpoint and returning an empty conversation as if it were the whole one.
- **The lying fork** — a branch in delta mode that replays the answer it was
  meant to replace, because the shared parent carried both siblings' writes.

## The techniques

- [semantic-hook-placement](./techniques/semantic-hook-placement.md) — a
  contribution declares where it sits by what it needs to see, never by
  index; one final composition point; ordering invariants validated at
  compose time; the outermost tool wrapper is the one whose omission would
  gap a ledger.
- [assembly-identity](./techniques/assembly-identity.md) — every
  behaviour-affecting hook declares its policy parameters as an identity;
  the digest sorts the order-insensitive, preserves the order-sensitive,
  excludes the build; the boundary with the prompt fingerprint.
- [operator-tier-code-loading](./techniques/operator-tier-code-loading.md) —
  code entry points only from startup configuration the service cannot
  write; fatal only when marked required; contributed hooks isolated,
  failing open by the origin of the failure, never its class.
- [host-routes-win](./techniques/host-routes-win.md) — contributed routes
  built early and mounted last; atomic rejection on a proven shadow; the
  unprovable allowed, not guessed; the predicate classifies the path the
  router actually matches on.
- [bounded-projection-of-external-work](./techniques/bounded-projection-of-external-work.md)
  — submit from the loop, never poll from it; only submit is model-visible;
  the store is the truth and the loop reads a bounded projection; late and
  post-cancel results discarded; framed idempotent delivery.
- [checkpoint-mode-custody](./techniques/checkpoint-mode-custody.md) — the
  mode frozen per process; one accessor gates every read; compatibility
  fails closed toward the silent partial read and stays open the other way;
  a fork of non-self-contained state is rewritten as a linear head write.
- [additive-input-at-the-call-boundary](./techniques/additive-input-at-the-call-boundary.md)
  — mid-unit input injected additively at the model-call boundary rather than
  by cancel-and-restart; the three properties supersede destroys; a
  caller-supplied drain the loop cannot see past; the record written before
  the request that must reference it; the budget reset per accepted input;
  delivery as earliest-safe-point, stated.
- [indeterminate-closure-on-interruption](./techniques/indeterminate-closure-on-interruption.md)
  — outstanding work closed as unknown rather than failed; the status
  first-class instead of a string a downstream classifier re-parses; every
  unresolved call closed before the terminal event; the sort between
  indeterminate, re-issuable, unstarted and unreadable.
- [observer-and-mutator-surfaces](./techniques/observer-and-mutator-surfaces.md)
  — two registration surfaces with opposite return contracts: an observer
  surface whose returns the emitter discards, and a closed vocabulary of
  points that may change behaviour; refusal is a typed result, never a
  thrown exception; a contribution's power is legible from its registration.
- [rewrite-before-the-gate](./techniques/rewrite-before-the-gate.md) — the
  rewriting point runs outside every gate that evaluates the value, so
  policy judges what executes; the original travels beside the effective
  value with per-frame provenance; the continuation is single-use, and
  fall-through is conditioned on whether the call beneath already ran.
- [substituted-result-attribution](./techniques/substituted-result-attribution.md)
  — a frame that returns without entering the continuation is a producer, so
  the result names it: replay and substitution spelled differently, freshness
  stamped at the time the value was obtained, and the decisions made against
  the named tool's identity re-evaluated when a different producer answered.
- [honest-hook-registry](./techniques/honest-hook-registry.md) — a timeout
  is available only where abandonment has a safe direction, so coverage is
  an allowlist whose exemptions are named with reasons; no event name
  enters the registry ahead of a live emit site, and an unknown
  registration is refused rather than stored.
- [session-scoped-capability](./techniques/session-scoped-capability.md) — a
  capability that exists because of which client is connected resolves from
  the session's own source, never from a process environment slot; one
  resolver folds in the named group; the assembly-time filter and the
  run-time refusal derive from one policy on one session.
- [guard-input-custody](./techniques/guard-input-custody.md) — a guard's
  policy inputs sit outside the write reach of the party it constrains, so
  re-reading a rule per decision is custody's opposite rather than its
  freshness; a missing input fails loudly instead of degrading; and the
  strongest form is a ceiling issued by whoever grants the resource, which
  the governed process can spend but cannot raise.
