---
layer: golden-path
type: golden-path
subject: agent-instruction-files
status: forged
techniques:
  - line-earning
  - enforcement-demotion
  - single-source-topology
  - machine-owned-regions
  - instruction-freshness
  - restraint-amplifier-balance
  - capability-before-steering
  - workspace-ancestry-isolation
  - substrate-coupled-expiry
  - context-reset-redelivery
  - sibling-floor-ownership
  - capability-coverage-contract
---

# Agent instruction files

Every coding harness injects a repo-owned instruction file into the agent's
context at session start — the standing brief a repository writes to every
agent that will ever open it. The file is the inverse of
[prompt-assembly](../prompt-assembly/prompt-assembly.md): there, the system
author assembles the prompt and the content is an input; here, the repo owner
authors content for an assembler they do not control. The harness decides
where the file loads, in what order, and with what siblings; the author
controls only what the lines say. That asymmetry is the whole subject.

It extends one step past loading, and the step is easy to miss: the harness
also decides **when the file is read again**. What the agent holds is a copy
taken at one moment, and a session that clears or compacts its context gets
whatever the harness re-delivers — which is not necessarily what the file
says by then
([context-reset-redelivery](./techniques/context-reset-redelivery.md)).

The position: **the instruction file is a paid, advisory, always-loaded floor
— so every line must be unreachable by the agent, load-bearing in behavior,
and owned by exactly one source.** Paid: its tokens are spent on every
session, including the thousands that never touch what the line governs.
Advisory: the harness delivers it as context, not enforcement — the model
weighs it against everything else it reads, and compliance measurably dilutes
as the file grows. A floor: it cannot be cut per-task, so it competes only
against itself.

## What the file is for — and the measured record

The field measured this in 2026, twice, with results that look contradictory
and are not. Instruction files bought large efficiency gains — agents with a
developer-written file finish faster and spend fewer tokens, because the file
pre-answers the questions every session otherwise re-derives (which command,
which gate, which convention). The same files bought essentially **no
task-success gain**, and machine-generated overview files — the "describe
your repo" dumps the tooling offers to write — slightly *hurt* while raising
cost, because they pre-cache what the agent would have discovered anyway and
tax attention for it.

Both results point at one selection rule: the file is a path-compressor for
**unreachable** material only. What the agent can grep, list, or read is
reachable — restating it buys a few tool calls the first session and costs
every session thereafter. What no single file shows — the command with the
non-obvious flag, the convention visible only across fifty call sites, the
decision the team made and rejected alternatives for, the gotcha that cost an
afternoon — is where the file earns its load.
[line-earning](./techniques/line-earning.md) owns the admission test.

## Advisory, not enforced — and dilution is count-driven

The file's instructions are read, weighed, and sometimes lost. Two facts
about that loss are load-bearing:

- **Compliance falls with instruction count, roughly uniformly.** The
  folklore says put important rules first or last because models lose the
  middle; the measured result on instruction lists is that position barely
  matters and *count* does. Every line added makes every existing line
  slightly less followed. There is no safe place in the file for the line
  that matters — only a shorter file.
- **A rule that must always hold does not belong in prose.** The harness's
  deterministic surfaces — hooks, linters, type systems, CI gates — fire
  regardless of what the model decides. A style rule an agent follows 90% of
  the time is a style rule violated daily.
  [enforcement-demotion](./techniques/enforcement-demotion.md) owns the
  split: prose carries what requires judgment; everything checkable moves to
  a gate, and the file at most *names* the gate so the agent doesn't fight
  or reinvent it.

## One source, harness files as bridges

The ecosystem converged on a vendor-neutral standard file, with per-harness
files (differently named, differently loaded) layered around it. The
discipline is single-source: the repo's guidance lives once, and every
harness-specific file is a pointer or import, never a fork
([single-source-topology](./techniques/single-source-topology.md)). The
technique also owns the trap inside the convergence: harnesses disagree on
*combination semantics* — the standard says nearest-file-wins, some
harnesses concatenate everything they find — so a monorepo author cannot
assume override behavior and must write nested files as additive.

## Text is not always the instrument

The file answers failures the agent *would* not avoid. It cannot answer
failures the agent *could* not avoid — an absent tool, a denied permission,
a schema that makes the correct call unexpressible — and a line written
against one of those cannot succeed while still charging the dilution tax
to every line that could.
[capability-before-steering](./techniques/capability-before-steering.md)
owns the question that precedes both the admission test and the
enforcement sort: could the agent have complied at all? Its signature in a
repository is a rule restated with escalating force across several
revisions, which is nearly always a capability gap being sharpened as
though it were a wording problem.

## The file governs a span, not a repository

The author decides what the lines say; the harness decides where they
land, and *where* is broader than the repository. Discovery is an ancestry
walk with no boundary at the repo root — every directory from the launch
point up to the filesystem root contributes, all of it concatenated rather
than overridden — plus, lazily, the per-directory files beneath the launch
point that get touched. So the governed region is a cone, and any
directory a program creates inside it is briefed by a file written about
something else. This is the case where a well-earned, freshly maintained
file is nonetheless wrong, and it is
[workspace-ancestry-isolation](./techniques/workspace-ancestry-isolation.md)'s
subject: generated workspaces, evaluation sandboxes and cloned third-party
trees, where the fix is positional rather than editorial.

## Parts of the file are not yours

Instruction files accrete machine-written regions: a framework stamps its
own agent-rules block, a context-scan tool maintains a generated map between
markers. These regions are derived artifacts embedded in a hand-written
file, and they obey
[machine-owned-regions](./techniques/machine-owned-regions.md): fenced by
markers, naming their generator, edited only by regenerating — a hand edit
inside the fence is work scheduled for deletion.

## The file rots, and rot here is worse than absence

The agent follows the file *over its own investigation* — that is the point
of the file — so a stale line produces confident wrong action with no signal
attached. A dead path, a count that drifted, a rule protecting files that no
longer exist, a claim of enforcement whose hook never fires: each reads as
authoritative exactly because it sits in the trusted layer.
[instruction-freshness](./techniques/instruction-freshness.md) owns the
maintenance practice: claims carry their measurement date, enforcement
claims are verified against the gate actually firing, and pruning is a
first-class edit.

## The reader improves, and that rots the file too

Freshness couples the file to change rather than to the calendar, and
every change it names is repo-side — a renamed command, a moved
directory, a deleted file. The file's other reader moves on its own
schedule: when the model improves, nothing in the repository changes and
a line can still become inert. A guardrail minted against a weakness the
model no longer has keeps charging the dilution tax, and worse, now
suppresses behavior the current model would have got right — so a
correct, freshly audited line is not yet an earning one.
[substrate-coupled-expiry](./techniques/substrate-coupled-expiry.md)
owns the second axis: which lines expire (the judgment-shaped ones —
unreachability never expires), the held-out trial that measures removal
directly instead of trusting a line's origin story, and stamping a rule
with the substrate it was minted against so the next upgrade sorts the
file mechanically.

## The floor is bigger than your file

The harness loads the file with siblings, and the siblings are not the
harness's own furniture — they are capabilities a person installed one
at a time, authored by strangers and maintained on somebody else's
cadence. They are paid on every session, advisory, and uncuttable per
task: the position stated above holds for them word for word, and they
are usually the larger half of what the agent actually reads. Yet the
admission funnel runs per line, on a diff, and an install produces no
diff. [sibling-floor-ownership](./techniques/sibling-floor-ownership.md)
extends the standard to that half — enumerate before judging, review
descriptions rather than bodies, and treat installing and keeping as the
two separate decisions only one of which anybody ever makes.

## Failure modes this standard exists to prevent

- **The generated overview** — a machine-written tour of what the tree
  already shows; measured to cost more than it returns.
- **The style guide in prose** — checkable rules delivered as suggestions,
  diluting the lines only prose can carry.
- **The fork** — per-harness copies of the same guidance, refined
  independently until two agents follow different projects.
- **The 25k-token floor** — a file grown by accretion until it outweighs
  the task on every session and no line stands out.
- **The confident stale line** — guidance the agent trusts over its own
  eyes, describing a repo that no longer exists.
- **The phantom gate** — "enforced by X" where X has never fired; worse
  than no claim, because it retires the agent's own caution.
- **The two-audience document** — onboarding narrative for humans merged
  with agent instructions, bloating both and serving neither.
- **The cage without its animal** — a restraint minted against a failure
  mode the current model no longer has; accurate, inert, and actively
  suppressing behavior the model would now get right.
- **The unauthored floor** — a catalog of installed capabilities, each
  admitted on its own merits and the aggregate on nobody's, loading
  descriptions into every session that the owner can no longer enumerate.

## The techniques

- [line-earning](./techniques/line-earning.md) — the admission test: only
  unreachable, behavior-changing lines; added on observed failure, priced
  per session.
- [enforcement-demotion](./techniques/enforcement-demotion.md) — advisory
  prose versus deterministic gates; what stays prose, what demotes, and
  naming the gate instead of restating it.
- [single-source-topology](./techniques/single-source-topology.md) — one
  authoritative file, harness bridges as imports, nested files under
  divergent combination semantics, scoped loading for overflow.
- [machine-owned-regions](./techniques/machine-owned-regions.md) — marker
  fences, generator-named blocks, and the regeneration-only edit rule.
- [instruction-freshness](./techniques/instruction-freshness.md) — dated
  measured claims, verified enforcement, pruning as maintenance, and the
  audit that walks every line.
- [restraint-amplifier-balance](./techniques/restraint-amplifier-balance.md) —
  the composition count: a file of pure prohibitions produces a compliant
  agent that stops volunteering; every restraint cluster ships with the
  amplifier that licenses initiative, checkably.
- [capability-before-steering](./techniques/capability-before-steering.md) —
  the question before the admission test: could the agent have complied?
  Capability gaps get a capability fix and no line; the mechanical check,
  the two short-circuit tells, and the ordering an automated loop must
  follow.
- [workspace-ancestry-isolation](./techniques/workspace-ancestry-isolation.md) —
  the governed span: the ancestry walk past the repo root, upward
  inheritance and downward injection, the sibling layout that empties the
  span, and asserting the loaded set instead of the layout.
- [substrate-coupled-expiry](./techniques/substrate-coupled-expiry.md) —
  the second rot axis: the model improves and accurate lines go inert;
  restraints expire first, expired lines contradict rather than idle, and
  the held-out trial replaces the origin story as the measurement.
- [context-reset-redelivery](./techniques/context-reset-redelivery.md) —
  the third rot axis, and the only one that leaves the file innocent: the
  agent holds a *copy*, taken at one moment, and a clear or a compaction
  re-delivers whatever the injector cached rather than what the file now
  says; the tell is an instruction obeyed early in a session and not late.
- [sibling-floor-ownership](./techniques/sibling-floor-ownership.md) —
  the installed half of the always-loaded floor: the discovery budget
  nobody authored, install versus retain as separate decisions, the
  collision and contradiction that only the whole listing reveals.
