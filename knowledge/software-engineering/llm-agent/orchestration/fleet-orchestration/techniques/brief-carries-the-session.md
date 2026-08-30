---
layer: technique
type: technique
subject: fleet-orchestration
technique: brief-carries-the-session
status: forged
laws: [absent-guard-is-loud]
shared_with: []
use_when: [writing the task for a dispatched session, a worker ignored a rule the dispatcher considered settled, deciding whether to fork the conversation or start a fresh session, a worker re-derived something the dispatcher already knew, choosing which worker class runs a task]
---

# The brief carries the session

A dispatcher that has been working for an hour holds a great deal it never
wrote down: the files it has read, the constraints it discovered, the
decisions it settled with the human, the approach it already rejected. When
it dispatches a worker, it tends to write the brief as if the worker were
*itself, a moment ago* — and the worker is not. A dispatched session is a
fresh process. It inherits the dispatcher's **standing** inputs, sometimes,
and its **session** state never.

The split is precise and worth stating as the inventory it is.

## What a fresh worker gets, and what it does not

A worker in a new session starts with: its own system prompt (not the
dispatcher's), the brief, and — depending on the worker class — the
repository's standing instruction files and a snapshot of version-control
state taken at the *parent's* start. That is all. It does not receive the
dispatcher's conversation history, the files the dispatcher already read,
the dispatcher's persistent memory, its output style, or the skills it had
already loaded.

Two consequences are the ones that bite:

- **Everything learned in-session is gone unless the brief carries it.**
  The constraint discovered at turn twelve, the decision the human made at
  turn thirty, the file that turned out to be the real owner of the
  behaviour — none of it exists for the worker. The dispatcher's mental
  model of "what we know" is mostly session state, and session state does
  not travel.
- **The standing files are class-dependent, and the cheap classes skip
  them.** Harnesses commonly give their lightweight research and planning
  workers *no* instruction files at all, to keep them fast. So a rule that
  lives in the repository's standing file — the one the dispatcher
  considers settled precisely because it is written down — is invisible to
  exactly the workers most often dispatched. A brief that assumes the
  standing file loaded is an absent guard
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)): the
  rule protects the sessions that happen to load it and not the fleet.

## Decision rules

- **Restate every invariant the worker must hold, in the brief, every
  time.** Branch discipline, what must never be pushed or deleted, which
  gate must pass, what needs approval. Do not reference the standing file
  ("follow the repo conventions") — restate the lines that matter. The
  cost is a paragraph; the failure it prevents is a worker that violates
  a rule nobody told it, in a session nobody is watching.
- **Carry settled decisions as decisions, with the rejected alternative
  named.** "Use the existing packer; the truncating variant was considered
  and rejected because a partial record is worse than none." Without the
  rejected alternative the worker re-derives it, often choosing it, because
  it looks reasonable — the dispatcher's reason for rejecting it was
  session state.
- **Carry pointers to what was read, not the contents.** The worker can
  open files; it cannot know which ones matter. A list of the files that
  turned out to be load-bearing compresses the worker's first twenty tool
  calls and stays fresh, because the worker reads the live file.
- **Fork when the task needs the session; dispatch fresh when it needs
  isolation.** Some harnesses offer a worker that inherits the whole
  conversation. It is the right tool when the task is *continuation* —
  the context is the point — and the wrong one when the task is a clean
  read that the dispatcher's accumulated context would bias. Choosing by
  cost alone gets this backwards: the fork's context is already cached
  and cheap; the fresh worker's is uncached and must be rebuilt from the
  brief. A fresh worker is cheaper only when the brief it needs is small.
- **Choose the worker class by what it loads, not only by what it can
  do.** If a task depends on the standing instruction file, a class that
  skips it is the wrong class regardless of speed. Either use a class
  that loads it, or restate the dependency in the brief — and say which
  you did, so the next dispatcher does not assume.
- **Tell the worker what it cannot see.** One line — "you have none of
  the conversation that produced this brief; if a constraint seems
  missing, ask rather than infer" — converts silent inference into a
  question, which the dispatcher can answer and a guess cannot be.

## The dispatcher's blind spot, named

The reason this technique exists is that the dispatcher is the worst
judge of what the brief is missing: everything missing is something the
dispatcher knows so well it no longer registers as knowledge. The
practical remedy is structural — a brief template whose sections are the
inventory above (invariants, decisions with rejected alternatives,
load-bearing files, what the worker cannot see, the write set from
[parallel-dispatch](./parallel-dispatch.md)) — so that an empty section is
visible as empty, rather than an omission nobody can see.

## The one brief where completeness is the wrong goal

Everything above treats a fuller brief as a better one. That holds for
every handoff whose purpose is **continuation** — the receiver's job is to
carry the work forward, and anything the sender knew is a head start.

It inverts for the handoff whose purpose is **judgment**. When the
receiving seat exists to form an independent verdict on the sending seat's
work — the review half of the produce–review pair in
[heterogeneous-model-panels](./heterogeneous-model-panels.md) — the
sender's reasoning is not context, it is an anchor. A reviewer that reads
why the producer believes the work is correct before forming its own view
is no longer sampling an independent opinion; it is scoring a case already
argued. The pair was bought precisely to decorrelate the two seats, and a
brief carrying the producer's narrative spends that on the way in.

This is worth stating because the subject's model of reviewer
independence has been **one-dimensional**: the pair decorrelates by
*provenance*, fixing the routing constraint at "producer's family ≠
reviewer's family." That closes the shared-blind-spot channel and does
nothing about the content channel. A reviewer trained apart from the
producer, handed the producer's argument, is independent in exactly the
way that no longer matters. Both channels have to be closed, and they are
closed by different mechanisms — one by routing, one by the brief.

**So scope the brief by the receiver's role, not by what the sender
knows.** Concretely, a review brief carries:

- the artifact under review, and how to run or reproduce it;
- the invariants and the acceptance criteria the work is judged against —
  these are the *task's* constraints, authored before the work, and
  carrying them anchors nothing;
- what changed, as a factual inventory: files touched, interfaces moved,
  scope boundaries.

And withholds:

- the producer's account of *why* its approach is right;
- its self-assessment, its confidence, and its own list of what it thinks
  is weak;
- the alternatives it considered and rejected, with its reasons.

That last exclusion is the one that will feel wrong, because carrying
rejected alternatives is a decision rule above — and it is correct above,
for a continuation worker that would otherwise re-derive and adopt the
rejected option. For a reviewer, the same paragraph pre-refutes the
objection it was convened to raise. **The identical content is a head
start for a continuation and a thumb on the scale for a verdict**, which
is why the split is by role rather than by content type.

The withheld material is not destroyed. It belongs in the record the
verdict is filed against, readable *after* the reviewer has committed to a
view — which preserves it for the dispatcher and for anyone auditing the
disagreement, while keeping it out of the input that produced the verdict.

Two consequences worth carrying:

- **A single brief template cannot serve both roles.** A template built
  from the continuation inventory, used for review, silently reintroduces
  the anchor every time — and it will be used that way, because it is the
  one that exists.
- **A dispatcher's summary of a worker's output is the same hazard.** When
  a dispatcher relays one worker's result to a second worker for checking,
  it is authoring exactly the narrative this section excludes. Relay the
  artifact; let the checker read it.
