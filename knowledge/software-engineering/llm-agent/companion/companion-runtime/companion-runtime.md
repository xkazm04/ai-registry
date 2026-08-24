---
layer: golden-path
type: golden-path
subject: companion-runtime
status: forged
use_when: [building a persistent companion agent inside an application, a second channel needs the same companion brain, deciding where autonomous cycles run and what they may change, a companion's actions are outgrowing an ad-hoc command list]
techniques:
  - host-seam-contracts
  - metered-llm-seam
  - headless-turn-stream
  - action-catalog-single-source
  - autonomous-cycle-hosting
  - operative-working-set
  - signal-economy-contract
---

# Companion runtime

A companion is an agent that persists. It is there tomorrow, it remembers what
happened yesterday, it does some of its work while nobody is watching, and it
belongs to a person rather than to a task. The parts of that a team designs
first are the personality and the conversation surface. The part that decides
whether the thing survives contact with a second channel, a second surface, or
a second year is neither: it is the **runtime** — the machine that hosts a
companion inside an application without becoming that application.

The naive reading is that a companion is a feature. It reads the app's stores
directly, calls the app's model client, renders into the app's chat panel, and
wakes on the app's timer. Every one of those couplings is invisible while there
is exactly one surface, and every one of them is load-bearing the moment a
second arrives — a terminal channel, an automation, a test harness, a second
device. The principal reading inverts it: **the companion runtime is a guest,
and the application is its host.** The runtime declares the small set of things
it needs from a host, and everything else — where the pixels are, which
database, which transport, whose clock — is the host's business and is
substitutable.

That inversion is not architectural taste. It is what makes the companion
*testable without a user interface*, *reachable from more than one mouth*, and
*meterable at all*, and each of those three is a property nobody can retrofit
cheaply once the couplings have spread.

## The host is a contract, not an environment

A runtime that binds to its host through "whatever is importable" has no seam;
it has an ambient dependency on a whole application. The discipline is to
enumerate what the host must provide, in one place, as an object the runtime is
handed at construction. For a companion the set is small and stays small:

| Capability | What the runtime asks for | What it deliberately does not ask for |
| --- | --- | --- |
| **Store** | read and write the companion's durable state — identity, memory, conversations, ledgers | a schema, a query language, a connection pool |
| **Model leg** | "run this request and tell me what it cost" | which vendor, which model, which key, which retry policy |
| **Turn sink** | somewhere to emit typed turn events as they happen | a renderer, a socket, a component tree |
| **Pressure source** | the current time, and the signals that say work has accumulated | a scheduler, a timer, a job queue |
| **Action executor** | perform one validated action from the catalog, and report the outcome | the application's internal command surface |

Everything else the runtime needs, it owns. When a runtime file reaches for the
host application's own modules, the seam has leaked and the companion no longer
travels — and the leak is undetectable by reading the runtime alone, because
locally each reach is the shortest path to a working feature.

The test that keeps the seam honest is mechanical: **the runtime's own tests run
against doubles for all five capabilities, with no application, no interface, no
network, and no real model.** A runtime that cannot be constructed in a test is
not portable; it is merely well-organized inside one host.

And the proof is not the test. **The proof is a second consumer.** The trap to
name explicitly, because it is the common outcome rather than the rare one: a
second channel that *re-implements* the companion's behaviour — its own prompt
assembly, its own memory read, its own episode write, kept aligned with the first
by discipline — is evidence the seam does **not** exist. It is a parity contract
maintained by hand, and hand parity drifts silently toward whichever copy is
edited more. [host-seam-contracts](./techniques/host-seam-contracts.md) owns the
seam, the doubles, and the second-consumer test.

## Every model call is a leg, and there is one door

A companion talks to a model for many different reasons: a conversational turn
with a person waiting, a maintenance pass over accumulated material, an unbidden
reaction to something that just happened, a one-shot micro-call to title a
thread. These differ in latency tolerance, in model tier, in how much they may
spend — and above all in *visibility*, because only the first has a human
watching it who would notice if it went wrong or went expensive.

That asymmetry is why a companion's model access must be one function and not a
convention. The rule: **no leg exists outside the seam, and the leg's kind is a
required argument to it.** A required argument is the difference between a
chokepoint and a habit — a new leg cannot be written without its author stating
what kind of work it is, which is the same statement that selects its model
tier, its ceiling, and its ledger row. Optional-with-default is the failure
mode: the default is always "interactive", the background legs inherit it, and
the first anyone learns of it is an invoice that a dashboard cannot explain.
One shared parser reads every response, and where usage cannot be read the row
is written with cost **unknown** — never zero, never omitted. Pricing, ledger
shape and budget enforcement belong to
[cost-metering](../../evaluation-and-cost/cost-metering/cost-metering.md); what
this subject adds is the runtime obligation that makes that subject's
enforcement-point enumeration *closed by construction* rather than by audit.
[metered-llm-seam](./techniques/metered-llm-seam.md) owns it.

## A turn is a function, not a screen

The single most useful shape in this subject: **a turn is a function that takes
a conversation and an input and returns a stream of typed events.** It does not
know what a window is. Transport — an in-process call from a desktop surface, a
request over a local port, a terminal channel, a test driver — is an *adapter*
over that function, and adapters carry no turn logic. When the turn logic lives
in the transport, there is exactly one transport forever, and the second one is
a rewrite disguised as an integration.

Two runtime concerns ride on that shape and belong to nobody else. **Turn
concurrency** — a companion that accepts two turns at once on one conversation
interleaves two model streams into one history and produces a transcript that is
individually plausible and jointly corrupt; the runtime therefore holds one lock
per conversation identity, and a second arrival is rejected, queued, or
supersedes the first as a stated policy rather than as whatever the race
produced. And **interruption** — stopping a turn is an outcome, not an absence:
the stream ends with an interrupted verdict, the partial content is preserved or
discarded by declared rule, and the lock is released on every exit path. The
event vocabulary, framing, backpressure and finalization semantics of the stream
itself belong to
[streaming-output](../../runtime-and-io/streaming-output/streaming-output.md);
this subject owns the callable and its concurrency.
[headless-turn-stream](./techniques/headless-turn-stream.md) owns it.

## The companion's actions are a closed catalog with one author

A companion that can only talk needs none of this. A companion that can *do* —
change a setting, open a surface, schedule something, compose a view — has an
action vocabulary, and an action vocabulary is a closed set that will be written
down more than once unless something prevents it. The characteristic decay is
worth stating in full because every instance of it looks reasonable while it is
happening: the vocabulary appears in the prompt that teaches the model what it
may emit, in the validator that checks what came back, in the executor that
performs it, in the capability document a human reads, and in the surface that
renders the result. Five copies, five authors, five edit histories. The failure
is never a crash. It is **asymmetry**: a kind the prompt teaches and the
validator rejects, a kind the validator accepts and no executor performs, a
field the executor requires and the prompt never mentions. The model is blamed
for hallucinating a capability it was, in fact, taught.

The standard is one declaration and four derivations — the teaching text, the
validator, the executor binding and the capability document are all generated
from, or checked against, a single table of kinds, per
[one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary).
The catalog additionally decides, per kind, whether the action is a read the
companion may perform on its own or a mutation that must be proposed and
approved; the approval machinery itself is
[hitl-approval](../../orchestration/hitl-approval/hitl-approval.md)'s, and the
extraction of a validated payload from model text is
[structured-output](../../prompt-and-context/structured-output/structured-output.md)'s.
What this subject insists on is that the envelope those two subjects pass between
them has exactly one definition. That insistence has to survive a process
boundary and a language boundary intact, because the component that teaches a
model is very often not the component that executes: where they are separate, the
catalog crosses **as data on every request** and the far side names no kind of its
own, which turns a generation step into a serialization step and leaves the count
of authorities at one. It also has to survive a deploy, since a proposal waits for
a person while the catalog it was validated against is code that ships — so the
same table is consulted again at acceptance, and a proposal whose kind the catalog
has since dropped is retired rather than run. And one more thing the post-mortem of every
model-composed surface eventually teaches: **anything the model can compose, a
person must be able to reset in one action.** A surface with no reset is a
surface whose worst generated state is permanent.
[action-catalog-single-source](./techniques/action-catalog-single-source.md)
owns it.

## Autonomy is hosted, not merely running

A companion does work between conversations. That work is not "a loop that
happens to be running" — it is a cycle the runtime *hosts*, with an admission
decision, a boundary, a ceiling, and a landing place for its output. The runtime
concerns are process-level and independent of what any particular cycle
computes: a cycle never overlaps itself, a cycle never runs concurrently with a
live turn on the same companion, every cycle declares what it may spend before
it starts, and every cycle's mutations land in a class the runtime declared in
advance — where a young system's honest answer for anything structural is
**propose only**, with a human adopting or rejecting. A cycle that reorganizes
the companion's own knowledge without asking has been given the one power whose
mistakes are hardest to see and hardest to undo.

What *triggers* a memory pass — accumulated material rather than a clock, one
read for both the admission measurement and the consumed window, drain-forward
truncation, and validation of every identifier a model hands back — is
[agent-memory](../../prompt-and-context/agent-memory/agent-memory.md)'s
consolidation discipline and is not restated here. This subject owns the
hosting.
[autonomous-cycle-hosting](./techniques/autonomous-cycle-hosting.md) owns it.

## Two stores, two clocks

At runtime a companion holds its state in two places that should never be
merged. The **durable brain** survives restart, is shared by every channel, and
is the only thing allowed to speak as knowledge. The **operative working set** —
what is happening right now, this hour: which work is in flight, what just
failed, what the person is in the middle of — lives for the life of the process,
is rebuilt on boot from durable sources plus live observation, and is never
quoted as durable truth.

Collapsing them is tempting in both directions and wrong in both. Persist the
operative set and every restart publishes a stale "right now" as fact — the
worst kind of confident wrongness, because recency is exactly the property it
claims. Move durable memory into process lifetime and the companion is amnesiac
across a crash it never notices. What each store is *for* — the layers, the
transitions, the value model — is
[agent-memory](../../prompt-and-context/agent-memory/agent-memory.md)'s subject.
How a long-lived process holds both, rebuilds one, and keeps cycles from writing
through the wrong one is
[operative-working-set](./techniques/operative-working-set.md).

## Report, or absorb

Autonomous work produces outcomes, and the runtime must decide what happens to
each one. The instinct is to surface them: the cycle ran, so say so. That
instinct, followed, turns a companion into a system that narrates its own
housekeeping, and a person who is told about six consolidations and one thing
that matters will learn to skip all seven.

So every autonomous outcome passes a **report-or-absorb** decision made by the
runtime at the moment it is produced, on the outcome's own terms: does this
change what the person would do, or is it maintenance the companion is supposed
to handle quietly? Absorbed outcomes still exist — they are recorded, countable,
and inspectable on demand — they simply do not initiate contact. Only outcomes
that clear this bar become candidates, and *only then* does the attention policy
of
[proactive-nudges](../../orchestration/proactive-nudges/proactive-nudges.md) —
budgets, quiet windows, dedup, efficacy — get consulted. Two gates in series,
not one: this subject decides whether there is anything to say, that subject
decides whether now is the time to say it. The same first gate governs the
quietest form a report takes — a standing count — with one addition that
placement makes necessary: a number is worth raising only where the click it
invites can clear it.
[signal-economy-contract](./techniques/signal-economy-contract.md) owns the
first gate.

## The boundary

This subject is the machine, and its neighbours are what the machine carries,
what it costs, and who it sounds like. Memory is the clearest line: the memory
subject owns what a memory *is* — the layers, the capture and consolidation
judgments, decay, recall budgets, provenance — while this subject owns only how
a long-lived process *hosts* those stores, which is a question about lifetimes,
locks and restarts and never about what deserves to be remembered; when a rule
is about the content of an item, it is theirs, and when it is about the process
holding the item, it is ours. Cost divides the same way: the metering subject
owns price tables, ledger rows, budgets and attribution axes, and this subject
owns only the obligation that a companion have exactly one door those rules can
be applied at, so their enumeration of enforcement points is closed rather than
hopeful. The nudge subject begins where this one ends — an outcome this runtime
decided was worth reporting becomes that subject's candidate, and everything
about when, how often, and how quietly it reaches a person is theirs. Against
the two siblings inside this same area the split is by layer rather than by
topic: `companion-identity` owns who the companion is and what it may believe
about itself, `conversation-orchestration` owns what an exchange looks like to a
person, and this subject owns the runtime both of them run on — the rule a reader
uses is that anything a second, non-visual channel would also need is here, and
anything that exists only because a human is looking is there. And where a
provider layer travels between applications as a package, the packaging
discipline is
[voice-io](../../runtime-and-io/voice-io/voice-io.md)'s; this subject packages
the brain, not an engine, and its proof of portability is a second mouth rather
than a second application.

## What this subject refuses

- **The ambient host.** A runtime that reaches into its application's modules
  rather than through a declared seam, and therefore has one host forever — and
  its usual companion, the second channel that re-implements the runtime instead
  of calling it, sold as portability and drifting from the day it ships.
- **The unmetered leg.** Any path to a model that does not pass the one door,
  any leg whose kind is inferred from a default, and any call whose cost could
  not be read being recorded as free, per
  [unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value).
- **Turn logic inside a transport.** A companion whose second surface is a
  rewrite rather than an adapter.
- **The five-copy vocabulary.** An action catalog written down separately for
  the prompt, the validator, the executor, the document and the surface — its
  cross-process form, a second catalog kept beside the prompt because the prompt
  lives in another language — and the model-composed surface with no way back to
  a good state.
- **The self-directed reorganizer.** A background cycle that restructures the
  companion's own knowledge without proposing it first.
- **The narrating housekeeper.** Autonomous maintenance reported as news
  because nothing decided it should not be.

## The techniques

- [host-seam-contracts](./techniques/host-seam-contracts.md) — the five host
  capabilities and nothing more; construction-time injection; test doubles;
  the second consumer as the only real proof.
- [metered-llm-seam](./techniques/metered-llm-seam.md) — one model entry point,
  leg kind as a required argument, one shared usage parser, unknown cost as a
  typed value.
- [headless-turn-stream](./techniques/headless-turn-stream.md) — the turn as a
  function returning typed events; transports as adapters; one active turn per
  conversation; interruption as an outcome.
- [action-catalog-single-source](./techniques/action-catalog-single-source.md) —
  one declaration of the action vocabulary and four derivations; validation
  symmetry; the catalog as wire data when the teacher and the executor are
  different processes; read versus approval-gated mutation; the proposal that
  outlives its catalog; the reset path.
- [autonomous-cycle-hosting](./techniques/autonomous-cycle-hosting.md) — cycle
  admission, single-flight, non-overlap with live turns, declared ceilings,
  propose-only mutation classes, restart safety.
- [operative-working-set](./techniques/operative-working-set.md) — the
  process-lifetime "what is happening now" store beside the durable brain;
  reconstruction on boot; why merging them fails in both directions.
- [signal-economy-contract](./techniques/signal-economy-contract.md) — the
  report-or-absorb decision every autonomous outcome makes, before any
  attention policy is consulted; and the count surfaced only where its own
  affordance can clear it.
