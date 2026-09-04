---
layer: application
type: application
subject: agent-memory
technique: memory-governance
stack: claude-code
status: forged
verified_on: 2026-09-04
verified_against: claude-code@2.1.261
---

# The harness's own auto-memory, read as a governed store (Claude Code)

This registry has asked since 2026-08-22 whether it is itself an instance of
this subject worth documenting. The answer is yes, and the instance is not the
registry's knowledge lane — it is the coding harness's **auto-memory**: a
per-repository directory of agent-written markdown that the harness loads on
every session, on by default since a 2026 release. It is a consolidated store
with an always-include tier, a kind vocabulary, provenance stamps and no human
gate, and it was read here as it stands for this registry's checkout.

## The store

`~/.claude/projects/<repo>/memory/` holds a `MEMORY.md` index plus topic
files. For this registry on 2026-09-04: 34 files, one of them the index at 35
lines. The harness loads the first 200 lines (or 25 KB) of the index into
every session and reads topic files on demand — which makes the index the
**always-include tier** of recall-injection and the topic files the
relevance tier, with the cap on the index being the one budget in the system
that is enforced rather than argued.

Each topic file opens with frontmatter the harness writes:

```
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6f22a963-…
  modified: 2026-09-02T16:34:57.433Z
```

## What conforms

- **A kind vocabulary, closed at the top.** `type` takes `feedback`,
  `project`, `reference` (and `user`); in this store 22 files are `feedback`,
  10 `project`, 1 `reference`, and every topic file carries one. The kinds
  are consolidation's typed outputs in miniature — `feedback` is the
  correction-and-preference kind, `project` the fact kind, `reference` the
  pointer.
- **Provenance to the episode.** `originSessionId` names the session the
  memory was distilled from, and `modified` dates it. That is the
  episode-id provenance row this subject demands, written by the harness,
  not by the model. 30 of 33 topic files carry it.
- **Corrections carry their grade.** The entry `execute-handoffs-in-session`
  is `type: feedback`, is titled "Operator rule (2026-09-02)", and quotes the
  operator's words with the date. An operator-issued correction remembered
  as an event, marked as operator-issued, is the governance technique's
  highest-grade write, and the store does it.

## What deviates

- **The kind is chosen by the writer it governs.** The `type` field is what
  the lane assignment would read — and the model sets it. Nothing prevents an
  inferred preference from being filed as `feedback`, which is the technique's
  lane-shopping case ("a self-model proposal wearing preference clothes"), and
  nothing distinguishes, within `feedback`, an operator's literal words from
  the agent's reading of them. The file quoted above does so by convention,
  in its own prose; the schema does not.
- **No human gate on standing rules.** The operator rule above is a standing
  rule about how the agent must behave, written by the agent into a file that
  loads on every session, with no approval recorded anywhere. The provenance
  says which session; nothing says who signed. The technique's top lane —
  "human-gated, always" — is realised as *human-issued, agent-committed*,
  which is the proposal lane's shape with the review step skipped.
- **Provenance is optional in practice.** 3 of 33 topic files lack
  `originSessionId` (all three `type: feedback`), and the index carries none.
  The harness stamps it when it writes; a file written by another path — or
  edited by hand — is a belief with no episode behind it, indistinguishable at
  read time from one that has one.
- **The always-include tier has a size cap and no admission argument.** The
  200-line cut on the index is a ceiling; nothing asks whether an entry earned
  its place there over the relevance tier, so the index is grown by whatever
  was written last and trimmed by whatever falls past line 200 — a truncation
  from the bottom, which is oldest-out only if entries are appended in order.

## What this realization cannot do

It is a structural read of one store on one machine: 34 files, one operator.
It measures neither how often the model files a kind wrongly nor how often a
standing rule was committed that the operator would have rejected, and with a
single human owner the proposal lane's failure — a belief about a person
recalled as settled fact into every later interaction — has one subject and
no control. The finding is that the harness supplies the fields a governed
store needs and leaves the governance to convention; whether convention holds
is a question for a store with more than one writer.
