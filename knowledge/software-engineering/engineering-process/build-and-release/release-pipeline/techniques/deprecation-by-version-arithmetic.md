---
layer: technique
type: technique
subject: release-pipeline
technique: deprecation-by-version-arithmetic
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [marking a public symbol deprecated, a deprecation tag that has outlived several releases with callers still attached, deciding which version removes a replaced API, a warning that names no removal point, reviewing what a release is allowed to delete, recording a downstream that hard-codes a published name, deciding whether a fast-moving public catalog owes an alias at all, retiring surface from a specification or wire contract whose implementations you do not control, a deprecation window consumers can skip over in one upgrade, checking that a named migration target still exists]
---

# Deprecation by version arithmetic

A deprecation is a promise with a date on it: *this still works, and on a
named future release it will not.* Most codebases write only the first half.
A doc-comment tag, a log line, a paragraph in a changelog — each says "this
is going away" and none says when, and a promise with no date is a promise
nobody can hold anyone to. The tag survives every release because no release
is the one it named. Callers keep arriving, because the symbol still works
and the tag is advisory. Years later the "deprecated" surface is larger than
the surface that replaced it, and deleting any of it is a breaking change
with no warning period, which is precisely the outcome the tag was written to
prevent.

The fix is not discipline. It is to make the promise an **operand**: the
deprecation carries two version numbers, and the code that carries them
compares them against the running version every time the symbol is used.

## The rule

**Every deprecation declares the version it began (`since`) and the version
it ends (`removed`), and the declaration enforces both against the version
the artifact reports about itself.** Three regimes fall out of two
comparisons:

- **Running version before `since`** — nothing happens. The symbol is not
  yet deprecated; the declaration is pre-staged and harmless.
- **`since` reached, `removed` not** — the warning fires, and the warning
  names `removed`. A caller reads "deprecated since 1.4; removed in 1.6" and
  knows how much runway they have, which is what a warning without a removal
  version cannot tell them.
- **`removed` reached** — the symbol *fails*. Not warns: fails, with the same
  message. The release that was promised to remove it does remove it, in
  effect, on the day it ships — even if nobody remembered to delete the
  source. Deletion becomes cleanup of something already dead rather than the
  act that kills it.

A declaration that names neither version is a removal, and fails
immediately. That is the correct reading of "deprecated" with no clock: the
author declined to promise a runway, so there is none.

The comparison must read the version the artifact reports about itself — the
same propagated truth [version-single-truth](./version-single-truth.md) puts
in the about-panel and the crash report — not a constant in the deprecation
module. A gate must see what it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)); a deprecation
check comparing against a version string somebody updates by hand fires on
the wrong release in both directions.

## Choose `removed` at declaration time, from policy

The removal version is not chosen per symbol. It is computed from a
**forecast rule the project states once**: a significant change is removed
at the next major; a minor change is removed two minors out (the minor after
the next one, so at least one full release carries the warning). The author
of the deprecation applies the rule to the current version and writes the
result. Two consequences:

- **The declaration cannot be left open.** "We will decide later" is the
  clockless tag again with extra ceremony.
- **Pre-release review is mechanical.** Before cutting a version, list every
  declaration whose `removed` equals the version about to ship. That list is
  the release's deletion work, and it is complete, because the declarations
  are the only place removals live.

The replacement named in the message must provide the same behaviour, not a
nearby one. A deprecation whose recommended successor changes semantics is a
migration disguised as a rename, and callers who follow the message
faithfully break in a way the warning never described.

## The operand is whatever the project actually advances

Version arithmetic presumes a version that moves. A library on a release
train has one. An application whose manifest version has read `0.1.0` for a
year does not, and a deprecation declared against it never fires — not
because the rule is wrong but because its operand is constant. Choose the
unit the project genuinely advances: a release version where one exists; a
date where releases are continuous; a caller count where the symbol is
internal and the honest promise is "removed when the last caller migrates".
The shape is identical — a since, a removed, a comparison against a live
reading — and the failure it prevents is the same: a promise nobody can
hold anyone to. Two of the three operands cannot be read from the artifact
alone (a date needs a clock, a caller count needs a scan), so the check
moves from the symbol's own code into a gate that runs per change; it does
not move out of existence.

## Test both APIs, and inject the version

The deprecation window is the one period where two APIs must both work, and
it is usually the period with the least test coverage, because the old tests
were migrated to the new API on the day the deprecation landed. Keep the old
tests; add the new ones; run both until `removed`. And make the version an
injectable parameter of the declaration so a test can assert all three
regimes without waiting for releases: pass a version before `since` and see
silence, pass one inside the window and see the warning name `removed`, pass
`removed` itself and see the failure. A deprecation mechanism that can only
be tested by shipping is untested.

## Decision rules

- **No `removed`, no deprecation.** A tag without a removal point is a
  comment, and comments do not retire anything.
- **The warning names the removal version.** A caller must be able to read
  their runway off the message.
- **`removed` is computed from the policy, not negotiated per symbol.**
- **The comparison reads the artifact's own version**, the single propagated
  truth, never a local constant.
- **At `removed`, fail loudly, even if the source is still there.** An
  optional guard is an absent one
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)); a
  deprecation that keeps working past its promised end has waived the
  promise silently.
- **Before each release, enumerate the declarations that fire in it** and
  delete their source in the same release.
- **The successor is behaviour-identical or the message says it is not.**

## When the symbol is a public name with consumers, the clock is necessary and not sufficient

Version arithmetic answers *when* a promise falls due. It cannot answer
whether keeping it would break someone, and for a public *name* — a command,
a mode, an alias routed to a canonical entry — that is the question the
removal actually turns on. A harness that consolidated some seventy public
names into a registry with aliases learned the shape the hard way: the
release that was promised to remove them arrived, and the deletion still had
to wait, because the clock was the only one of four conditions that had been
written down.

The gate that survived is a conjunction, and each term names a different
failure the clock alone would have let through:

- **Elapsed releases *and* elapsed time**, whichever is longer — enough
  shipped versions for callers to notice, and enough wall-clock for slow
  upgraders who skip versions. Two minors and ninety days was the number one
  project chose; the shape is the point.
- **Usage share** of the canonical name over the alias, from a *named*
  emitter, above a threshold on **two consecutive releases** — a single
  window can be a lucky sample. No telemetry is *not met*, never *met*: the
  absence of the number is not permission
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **Zero known critical consumers.** A named downstream that would break is
  a blocker of a different kind from the three above, and the difference
  matters at the next rule.

**A major version waives time, never a known consumer.** A major boundary
authorises breaking removal on its own — that is what the number promises —
so the temporal and share terms drop away. The consumer term does not: it is
about breaking something that exists, not about elapsed anything, and a
version bump does not clear it. Record the waiver on the eligibility record
with the blockers it waived, so the override is auditable rather than
invisible.

Two more rules come with the gate. **The check that decides removability
must not be the tool that removes.** Emit an eligibility record per name —
what is deletable now, what blocks it — and delete in a separate, reviewed
change that attaches the record; the invariant to test is *premature*
deletion, an artifact gone while its owner is still inside the window. And
**a name-retirement sweep over prose is a change to review, not a script to
trust**: a case-sensitive sweep that deleted every lowercase occurrence of a
retired mode left the documentation defining the mode hierarchy with holes
where its name had been, while the capitalised form survived a page away.

## Where the list of known consumers lives

"Zero known critical consumers" is a blocker with no mechanism attached until
the list lives somewhere that fails a build. A policy document, an ownership
file, a freeze-list in prose — all decay the same way: they are read by
whoever remembers they exist, which after two handovers is nobody.

**Pin the named consumer's dependency in an executable test.** A test that
asserts the specific published names a known downstream hard-codes fails at
build time, before review, and cannot be forgotten the way a paragraph can.
The rename that would break that consumer stops being a discovery the
consumer makes for you.

Two properties decide whether the pin is worth having:

- **It carries its own provenance.** The entry records *who* depends on the
  name and *where* that dependency was created, so the next person to hit the
  failure can go and ask whether it still exists. A freeze with no attribution
  is inherited forever, because nobody can prove it is safe to lift — which
  turns the pin into the thing it was written to prevent.
- **It pins names, not the surface.** A golden-file snapshot of the entire
  published surface fails on every legitimate addition, and a check that fails
  on every legitimate change teaches reviewers to bless its diff unread. Pin
  the two or three names that are actually load-bearing and the failure keeps
  its meaning.

One clause explains why the rename checklist's "grep for the old name" does
not already cover this: the consumer is in a different repository. A
repository-wide search cannot see it, and the search's clean result is
indistinguishable from there being nothing to find.

## When declining the window is correct

The window is owed to callers who hold a cached contract. Where they do not,
the arithmetic still runs and protects almost nobody, and a project may
deliberately rename in place with no alias and no deprecation period. That is
a defensible posture rather than a lapse — but only under all three of its
conditions:

- **Callers re-read the catalog every session.** A consumer that enumerates
  the published surface on each connection and selects from what it finds
  holds no compiled reference to break. The window protects whoever cached;
  if almost nobody caches, it protects almost nobody.
- **Catalog size is itself a quality metric.** A deprecation alias is not
  inert. In a catalog a probabilistic caller selects from, every retained name
  is a second plausible option sitting in the selection prompt at every
  listing, and the characteristic failure of such a caller is choosing wrong
  among near-synonyms. The alias is therefore *active misdirection*, and it
  reinflates precisely the number a breaking change was just spent to shrink.
- **Releases ship frequently, on a pre-stable train.** The rename reaches
  callers in days, and the version series has not yet promised stability.

Three compensating controls keep the decline honest rather than reckless: a
**mandatory breaking-change entry in the release record**, so the removal is
loud where the runway would have been; a preference for **batching** the
rename into a larger breaking release rather than shipping it alone, so
callers absorb one break instead of five; and **executable pins for the named
consumers who genuinely do cache**, per the section above — declining the
window for the population never waives the consumer term.

Then state the bill. The project that ran this posture renamed one capability
and renamed it again five releases later, and its own checklist concedes what
the posture costs: a caller holding a cached listing will silently stop
finding the renamed capability — no warning, no message naming a removal
version, just a capability that is no longer there. Declining the window buys
catalog quality and pays in silent breakage for the minority who cache. A
scope exemption stated without its bill is an excuse.

## Two assumptions the arithmetic makes, and what to do where they fail

Everything above assumes the declaring party can also *execute* the removal:
the symbol is deleted, the comparison fires in the caller's own process, and
the blast radius is bounded by one release the declarer controls. Two
regimes break that, and each needs a different substitute.

**The declarer does not own the running artifacts.** A specification, a wire
protocol, a published schema, an interoperability contract — here "removal"
deletes a line of prose, and every implementation of it keeps working. Worse,
removing on schedule does not retire the feature; it retires the *document
that described it*, so implementations diverge with nothing left saying what
the divergence was. In this regime `removed` honestly degrades from a promise
to an **eligibility floor**: the earliest release at which removal may
happen, not the one at which it must. That is a real weakening, and it must
be paid for, or the tag rots exactly as it does with no date at all. Three
controls together are the substitute:

- **One enumerable registry** of everything currently deprecated with its
  earliest removal, so "what is on the way out" is a query rather than a
  survey of prose. The registry is derived and carries no authority of its
  own — the removal decision stays where it was.
- **A standing announcement channel** — a permanent changelog heading —
  so a removal cannot land as a silent diff.
- **A marker obligation pushed onto the implementations that DO have a
  runtime**, made a criterion of whatever ladder grades them. This is the
  one that does the work: the declarer has no runtime, so it borrows one,
  and the requirement is chosen so a test can observe it — a native
  deprecation attribute plus a warning emitted when the feature is
  exercised. Delegated enforcement that cannot be asserted against is
  exhortation.

**The consumer's upgrade step is larger than the window.** This one is
subtler and it voids the window entirely rather than weakening it. All the
arithmetic reasons about the *declarer's* release cadence and never about the
*consumer's* upgrade granularity — but a consumer who jumps from a version
predating the deprecation to one postdating the removal, in a single hop,
**was never warned, however correct the window was.** Every marker fired in
releases they skipped.

> A deprecation window only warns someone whose upgrade step is smaller than
> the window.

So the window has a precondition, and it is about the consumer, not about
you: either upgrades are known to be incremental, or the artifacts consumers
actually upgrade must support a trailing range at least as long as the
window, so any single hop lands inside it and the marker is seen on the way
through. Where neither holds, the window is decoration and the honest options
are a longer trailing range, a migration the consumer runs rather than reads,
or a hard failure at the new version that names what was removed.

One corollary for the declaration itself: **verify the named replacement is
still live at both ends of the window** — when the deprecation is published
and again immediately before the removal executes. A window long enough to be
useful is long enough for its own migration target to be deprecated,
superseded, or never shipped, and a migration instruction pointing at
something that no longer exists is worse than none, because implementers
acted on it.

## When not to use this

Internal symbols with no callers outside the repository need no window:
delete them, in one change, with the callers. The window exists for callers
you cannot see. Product retirement — sunsetting a *feature* with flags,
migrations and user-facing notice — is entity-lifecycle territory and runs on
a different clock; and the mechanics of finding code that is already
unreferenced belong to dead-code. This technique sits between: the symbol is
referenced, the reference is external, and the question is on which version
the reference stops being honoured. The second exemption — a public catalog
whose callers re-read it every session — is set out above, and is only an
exemption while all of its conditions hold.
