---
id: prior-art-teardown
dimension: D5
applies-when: "The repo competes with, or borrows from, other implementations of the same thing, and its reasons for adopting or rejecting each idea live only in the maintainers' heads."
---

# Prior-art teardown

**What it gives you:** the reasoning behind every borrowed design, written down where the next
contributor and the next agent session can read it - including the ideas that were considered and
refused, which is the half that is otherwise lost entirely.

**Dimension:** D5. **Starter:** [`starter/docs/prior-art/EXAMPLE.md`](starter/docs/prior-art/EXAMPLE.md),
[`starter/docs/prior-art/README.md`](starter/docs/prior-art/README.md).

## The shape

One directory, `docs/prior-art/`, holding one file per implementation studied. Each file carries
five sections. This is the *shape* - no repo's actual findings travel with it.

1. **What it is, and where it was read.** One paragraph, plus the version, commit or date the
   teardown reflects. A teardown with no pin is undated hearsay a year later.
2. **How it solves the problem, by subsystem.** Organized by the concern, not by their file
   layout. Every claim carries a citation to their source in `path:line` form, so a reader can
   check it rather than trust it.
3. **What we take.** Each item names the concern it answers here, and whether it is being copied
   or adapted. Adapted items say what changed and why the change was necessary.
4. **What we explicitly do NOT take, and why.** The most valuable section and the one nobody
   writes unprompted. A rejected idea with no recorded reason gets re-proposed every six months,
   and re-argued from zero each time.
5. **Where they are ahead of us.** Stated plainly. A teardown that only finds faults is
   advocacy, and it will be read as advocacy.

Then one rule for the backlog: **every roadmap or issue item borrowed from prior art cites the
teardown it came from.** The citation is the link between "we should do X" and the argument for X.

## Why this shape

Reading a competitor is expensive and nearly always done once, by one person, under deadline.
Without an artifact, the result is a handful of adopted features and a large silent inventory of
decisions - which alternatives were seen, which were rejected, what the rejection cost. That
inventory is what the next design argument needs and the only copy of it walks out with whoever
did the reading.

Sections 4 and 5 are what separate this from a feature-comparison table. Section 4 turns
"we don't do that" from a gap into a decision. Section 5 keeps the document honest enough to be
worth consulting: a teardown that never concedes anything stops being evidence and becomes a
morale document.

The `path:line` discipline is what makes the file durable. A claim about how someone else's
system works, with no pointer, cannot be re-checked when they change it or when someone doubts
it - and both happen.

## Rules

- Cite, do not paraphrase. `path:line` into their tree, or a quoted line. Reading their code is
  the point; asserting what it probably does is the failure mode.
- Pin the version. Prior art moves. An unpinned teardown silently becomes wrong.
- No vendored code. A teardown records what was learned and what was decided; copying source
  carries their license into the tree and belongs in a dependency, not in a document.
- One file per implementation, not one per feature. The comparison that matters is between whole
  designs, and cross-cutting choices only make sense inside one.
- Keep it in the repo, not in a wiki or a chat thread. It has to be reachable from the code it
  explains and diffable alongside it.

## How to tell it is working

- A design argument gets settled by a link instead of by re-reading someone else's source.
- Rejected ideas stay rejected, and their reasons are quotable.
- A backlog item can be traced to the observation that motivated it.
- An agent session asked to implement a borrowed feature finds the constraints without being
  told them.

## Adopting it

1. Copy `starter/docs/prior-art/` into the repo.
2. Write the first teardown for the implementation the project has actually already borrowed
   from - the reasoning exists, it is just undocumented, and writing it while it is recoverable
   is far cheaper than reconstructing it later.
3. Add the provenance citation to roadmap or issue items that came from it.
4. Re-pin a teardown when a decision is re-litigated against it, not on a schedule. These files
   age gracefully as long as their pins are honest.

## Anti-patterns

- A feature checklist with no reasons. It answers "what" and the expensive question is "why".
- Omitting the refusals. A teardown with no "we do not take this" section has recorded half the
  work and the cheaper half.
- Treating it as competitive intelligence. The audience is a contributor deciding how to build
  something, not a reader deciding what to buy.
- Letting it become a roadmap. The teardown records what another system does and what was
  decided about it; what gets built and when belongs in the backlog that cites it.
