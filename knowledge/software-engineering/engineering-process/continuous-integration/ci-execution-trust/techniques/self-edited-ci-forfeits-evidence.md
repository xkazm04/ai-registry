---
layer: technique
type: technique
subject: ci-execution-trust
technique: self-edited-ci-forfeits-evidence
status: forged
stage: team
laws: [claimant-does-not-adjudicate, unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [a pipeline result decides whether a change merges without a person, an automated author can push changes that include the pipeline definition, deciding which files count as the pipeline's configuration, a change edits a file the pipeline definition includes]
---

# A change that edits its own pipeline forfeits its evidence

A pipeline result is evidence about a change only relative to the definition that produced it.
The definition decides which jobs run, what each one asserts, which failures are tolerated and
what artefact is emitted as the verdict. When the change under judgement also edits that
definition, the change chose its own examination: it can drop the test that would fail, mark a
job as allowed to fail, swap the scanner for one that finds nothing, or replace the evidence job
with one that writes a passing report directly. A green result from that pipeline is not a
verdict on the change. It is a statement the change made about itself, and per
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate) such a
statement never decides the verdict.

This is a different defect from the one
[untrusted-contribution-lanes](./untrusted-contribution-lanes.md) closes. The lane split stops
foreign code from reaching a credential; it says nothing about whether a verdict can be
believed. The problem here exists with no credential in sight and with an author inside the
trusted set — most sharply an automated author that has push rights on its own branches and
whose results are meant to merge without a person reading them.

The rule: **a change that touches the pipeline's configuration earns no automatic approval, no
automatic merge, and no proof mark. It waits for a person, with the reason stated.**

## What counts as the pipeline's configuration

The naive reading checks one file — the root pipeline definition — and misses most of the
surface. The configuration is everything the definition's evaluation reads from the changed
repository:

- **The root definition**, at the path the project is configured to use, which is not always
  the default path. Read the configured path; do not assume it.
- **The directory of platform-adjacent configuration** the delivery system reads by convention
  — templates, agent configuration, job hooks. Treat the whole directory as configuration
  rather than enumerating which files in it matter today.
- **Every file the definition includes from this repository**, followed transitively through
  the included files. That covers a local include, a bare-string include that resolves locally,
  and a cross-project include whose project names *this* project. A cross-project spelling of a
  local file is a local file.
- **As the head has them.** The includes are resolved against the proposed revision, because
  the proposed revision's includes are what ran. A file the base included and the head stopped
  including is irrelevant; a file the head newly includes is in scope even if the base never
  heard of it.

Remote includes, published templates and versioned components outside the repository are not
the change's to edit and stay out of scope — unless one of them includes a file back from the
changed repository, which brings that file in. A definition hosted in another project is out of
the change's reach only on the same condition, and only once someone has checked that the
platform really evaluates it from there.

## Fail closed on everything the walk cannot see

The walk is an evaluation of the definition, and per
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) every place it cannot
evaluate resolves to "touches the configuration", never to "does not":

- A definition or included file that **does not parse**: touches. A parse failure is the
  cheapest way to hide an include from a reader that gives up.
- An included file that **cannot be read** for any reason other than "not found": touches. Not
  found is a definite answer — the include resolves to nothing — but a permission error, a
  timeout or a server error is unknown, and an unreadable file is never an absent one.
- An include the walker **cannot resolve from the revision alone** — a path or a project
  containing a variable, a wildcard whose matches it does not expand: touches, naming the
  include. The variable's value is set at run time by someone, and a wildcard's matches change
  when a file is added beside it.
- **More includes than the cap** the walker allows: touches. The cap is a guard against a
  definition built to exhaust the reader, and exceeding it is a finding.

Each forced answer carries its reason, because a person will read it. A project whose
definition includes by wildcard waits on every automated change until it lists its includes by
name; say that in the reason, since it is the remedy.

## What the forfeit does and does not do

The consequence is a **wait**, not a block. The change may be perfectly good, and a person
reading the configuration diff can approve it in the ordinary way. What is withheld is
everything automatic: the proof mark, the approval, the merge, and the standing the change would
have added to its author's record. If an earlier revision of the same change already carried a
proof mark, the mark is removed when a later revision touches the configuration — the mark
describes the change, and the change now chose its own jobs.

The forfeit holds at every level of autonomy. An automated author trusted to merge routine
changes unattended is trusted on evidence its own changes do not shape; a change that reshapes
the evidence is outside the class that trust was earned on, whatever the class's standing.

It does not certify the scripts the jobs invoke. A job that runs a test script still runs the
version of that script the change carries, and the change may have weakened it. That residual
belongs to the evidence checks themselves — the test that must fail at the base and pass at the
head, the assertion that no test was weakened — and is not closed by this technique. What this
technique removes is the change's control over *which jobs ran and what they reported*, which
per [gate-sees-target](../../../../_laws.md#gate-sees-target) is the precondition for the other
checks reading anything real.

## The alternative: evaluate the trusted definition

The other honest resolution is to never run the head's definition for evidence at all: evaluate
the definition from the protected branch and point it at the head's code. Platforms offer this
as a privileged trigger, and it has a well-known hazard — the trusted definition then checks out
and executes the change's code with the trusted context's credentials, which is the
"pwn request" pattern. Choose it only when the evidence job holds nothing and executes the
change's code under the same constraints as the untrusted lane. Where the delivery system offers
no such trigger, or the evidence must run in the change's own pipeline, forfeiting is the
resolution.

## Decision rules

- When a result can merge or prove a change without a person, check the change against its
  configuration surface before reading the result.
- The surface is the configured root definition, the platform-adjacent directory, and every
  local include followed transitively at the head.
- Not-parseable, not-readable (other than not found), not-resolvable and over-the-cap all count
  as touching, with the reason.
- Touching means wait: no proof mark, no approval, no merge; remove an earlier revision's mark.
- The forfeit applies at every autonomy level.
- Script content is the evidence checks' problem; job selection is this one's.

## When not to use it

A repository where every change is read by a person before it merges gets little from the walk:
the person reads the configuration diff anyway. The technique earns its cost when a pipeline
result substitutes for that reading — automated merges, proof marks that feed a trust record,
any gate that acts on green.
