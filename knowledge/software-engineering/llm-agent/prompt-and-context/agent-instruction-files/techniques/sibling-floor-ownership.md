---
layer: technique
type: technique
subject: agent-instruction-files
technique: sibling-floor-ownership
status: forged
laws: [creation-names-reaper, count-carries-predicate]
shared_with: []
use_when: [auditing installed agent capabilities rather than a repository's own file, an owner cannot list which capabilities their agent loads, two installed capabilities have overlapping trigger descriptions, deciding whether an installed capability still earns its share of the discovery budget, an agent behaves in ways no repository file explains]
---

# Sibling-floor ownership

The subject opens on an asymmetry: the harness decides where the file
loads, in what order, and **with what siblings**; the author controls only
what the lines say. The siblings are then left alone, on the reasoning
that they are the harness's business.

They are not. The siblings are not context the harness supplies — they are
artifacts a person installed, one at a time, each written by an author who
is not the repository owner and maintained on a cadence that is not the
repository's. Every property the subject's position rests on holds for
them: paid on every session, advisory rather than enforced, and unable to
be cut per task. **The instruction file is the only part of the
always-loaded floor that anybody audits, and it is usually the smaller
part.**

## What the floor actually contains

Installed capabilities — reusable skills, tool servers, extension packs —
publish a name and a description into a discovery listing at session
start; their bodies load only on invocation. That progressive disclosure
is what makes a large catalog affordable, and it is also what makes the
catalog invisible. The per-entry cost is small and bounded, so no single
install is ever the one that is too expensive, and the listing budget ends
up consumed by an aggregate that nobody authored and nobody reviews.

The budget itself is a moving number, commonly expressed as a fraction of
the context window rather than a fixed size — one harness documents 1%, with
a per-description character cap applied first. It therefore changes with the
harness version and with the catalog, and *nominally* with the model — but a
documented fraction is a claim about a denominator, and in at least one
reported case (2026-05) the denominator was a fixed reference window rather
than the model's actual one, so a larger-context model bought no more room
and the listing was culled at the same size. A floor sized once and quoted
thereafter is not a fact about the current session
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
and neither is a floor derived from the documented formula. Measure the
loaded listing against the harness's own report — the report is what the
culling reads — or state the invariant and let that report answer the number.

## Installing and keeping are separate decisions — only one is ever made

Each install is locally justified: trying a community pack, testing an
approach against one task, borrowing a colleague's setup for an
afternoon. Every one of those is a reasonable decision at the moment it is
made, and none of them schedules the second decision. Nothing names the
reaper ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)),
so the retention question is never asked by anything, and an entry
installed for one afternoon is loaded for a year.

The signature is diagnostic and slightly embarrassing: **an owner who
cannot enumerate their own installed set from memory.** Practitioner
reports describe discovering long-forgotten experimental packs still
active months later, and audits that cut a catalog by an order of
magnitude in one sitting. The admission funnel this subject already
owns — [capability-before-steering](./capability-before-steering.md), then
[enforcement-demotion](./enforcement-demotion.md), then
[line-earning](./line-earning.md) — is run per line by an owner reading a
diff. It is never run per install, because an install produces no diff for
anyone to read.

## The aggregate has failure modes no single entry has

The reason a per-entry review cannot substitute: the defects live between
entries.

- **Collision.** The harness routes on descriptions, so two entries whose
  stated trigger conditions overlap make selection a coin-flip the owner
  never observes — and a forgotten experimental entry can win over the
  maintained one it duplicates. Asking "is this entry good?" cannot detect
  this. Only reading the listing end to end can.
- **Contradiction with the file.** An entry's body was written by a
  stranger, against a different repository, under different house rules,
  and it can contradict the instruction file the owner carefully earned.
  This is the observed shape of the clash a vendor found in its own
  transcripts, where the conflicting directives spanned system prompt,
  installed capabilities and user request rather than sitting inside any
  one of them — see
  [substrate-coupled-expiry](./substrate-coupled-expiry.md).
- **Provenance drift.** [single-source-topology](./single-source-topology.md)
  disciplines guidance the repository owns. An installed entry is a fork of
  somebody else's guidance that arrived pre-written, and it drifts on their
  schedule or on none at all.

## The audit

Four moves, and the order matters:

1. **Enumerate before judging.** The first finding of every such audit is
   the set of entries the owner had forgotten. Until the floor can be
   listed, it is not being governed.
2. **Read the listing, not the entries.** The unit of review is the
   description line, because that is what loads on every session and that
   is what routes. A superb body behind a vague description is a cost with
   a lottery ticket attached.
3. **Sort by triggerability, not by quality.** A well-written entry that
   never fires still charges its description to every session and returns
   nothing. The question is not whether it is good; it is whether this
   agent, on this owner's actual work, reaches it.
4. **Run the held-out trial at catalog scale.** The instrument from
   [substrate-coupled-expiry](./substrate-coupled-expiry.md) applies here
   unchanged: complete a representative task with the catalog disabled
   entirely and see what actually degrades. Retention kept out of unease
   rather than evidence is the same residue, and it takes the same
   countermeasure — archive reversibly, remove in a commit that touches
   nothing else.

## Where the boundary sits

State the split rather than merging the two halves, because their
governance is genuinely opposite. The repository-owned file is authored,
reviewed, versioned with the code, and inherited by everyone who clones
the tree. The sibling floor is installed, personal, cross-repository, and
has no diff, no reviewer and no owner of record. Same budget, same
always-loaded contract, opposite accountability — which is why a
repository can *require* its instruction file and can never see the floor
its agents actually arrive carrying.

That asymmetry sets the practical rule for anything a team needs to hold:
guidance that must reach every agent working in a tree belongs in the tree
the harness is pointed at, not in a capability each person installs for
themselves.
