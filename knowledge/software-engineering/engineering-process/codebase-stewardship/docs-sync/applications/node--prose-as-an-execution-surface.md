---
layer: application
type: application
subject: docs-sync
technique: prose-as-an-execution-surface
stack: node
verified_on: 2026-09-04
verified_against: node@24
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# The population claim holds; the vector does not, and the tree says why

Assessed across eight checked-out projects of one fleet — a desktop
application, two web applications, an imaging service, a market-data service, a
civic-data platform, a grant-writing tool and a markdown renderer — for both
halves of the technique. The verdict is that the gate would catch nothing
today, and the *reason* is the useful part, because it is exactly the condition
the technique names as its own disqualifier.

## The credential half: a clean fleet-wide negative

Every prose document across all eight trees was swept for a credential
delivered as a positional argument — a documented command followed by a
recognisable key, token or session prefix. **Zero hits.** The fleet documents
its secrets through environment files and interactive prompts throughout.

A negative sweep at this scale is worth recording rather than discarding: the
technique's credential half describes a real and common failure, and this fleet
does not have it, so a future run reading this ledger does not re-run the
sweep. The return condition is a project growing a command-line tool that takes
a secret, which none of the eight currently ships.

## The install half: the population claim is confirmed, the vector is absent

The technique's distinctive claim is about **scope** — that the gate's
population is *text a reader will act on*, not *files with a documentation
extension*, and that a program's own emitted setup instructions belong in it.

The desktop application confirms the population claim directly. Its
infrastructure setup path emits actionable install commands as remediation
hints to the user (`src-tauri/src/commands/infrastructure/setup.rs:636`,
`:648`), and a further fallback line at `:563`. These are instructions a user
will follow, they live in compiled source, and no documentation-scoped gate in
that project's eleven-check chain has them in scope. The technique's population
rule describes this tree accurately.

But the vector is not here. Every emitted command names a package in a
first-party ecosystem index that no third party could hold, and the single bare
install line found across all eight projects' landing pages
(`pumper/README.md:112`, a task runner from the language's own registry) is
correct and unsquattable. The supply-chain half of this technique is
**conditional on a name being held by someone else**, which is precisely what
its own *when not to use this* says — and this fleet does not meet the
condition.

## Three cases walked under both policies

- **A user's setup fails and the app prints an install hint.** Under A, the
  hint is unchecked. Under B, a gate asserts it against an owned-namespace
  list. Same outcome: the hint is already correct, and the gate reports zero.
- **A contributor adds a landing-page quickstart with a bare install line.**
  Under A it ships. Under B it is flagged — but the flag is a false positive
  unless the package name is contested, and none of the fleet's are, so the
  gate would train contributors to dismiss it.
- **A project renames.** This is the one case where the arms diverge, and it is
  the case that would *falsify* this verdict: a rename releases the old index
  name to whoever claims it, and every unchanged install line in every document
  becomes a live delivery path overnight. Nothing in any of the eight trees
  would notice.

## The verdict, and what it costs the technique

`not-better` here is a statement about this fleet and not about the technique.
The gate's yield is zero because the disqualifying condition in the technique's
own closing section is met — the projects own every namespace they name — and a
gate installed anyway would be a decorative check that dismisses on every fire.

The technique needs no amendment for this: it already states the condition, and
this reading is the measured confirmation that the condition does the work it
was written to do. What the run adds is the **return condition**, which the
third case above supplies and which is sharper than the technique's phrasing:
the vector is created by a *rename*, not by a naming choice, so the check to
install is not a standing gate but a step in the rename runbook. A fleet with
no contested names today acquires one the first time it renames anything, and
the moment of exposure is the moment nobody is looking at documentation.
