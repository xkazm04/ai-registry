---
layer: technique
type: technique
subject: repository-landing-document
technique: evidence-linked-badges
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [adding a badge to a front page, auditing a badge row nobody has looked at in a year, a badge asserts a property no automated check enforces]
---

# Badges that link to what would go red

A badge is a claim, rendered in the smallest typeface the page has. *This
builds. This has no dependencies. This is licensed thus. This supports that
runtime version.* Nobody audits a badge — it is four hundred pixels of image
sitting above the first paragraph — and everybody reads it, which is the worst
possible combination of properties for an assertion about a system.

The failure is not the badge that is wrong. A wrong badge can be noticed and
corrected. The failure is the badge that **cannot become wrong**: one whose
link goes to a project homepage, a specification page, a marketing site, or a
version string typed into the badge's own address. Such a badge asserts a
property and is wired to nothing that observes the property, so it survives
the property going false, indefinitely and invisibly. That is
[gate-sees-target](../../../../_laws.md#gate-sees-target) applied to a claim
surface rather than a build step: the badge is a check over a proxy, and it
reads green exactly when the proxy has diverged from the thing it stands for,
which is the only moment it mattered.

## The rule

> **Every badge links to the artifact that would go red if its claim stopped
> holding. A badge whose link target cannot fail is deleted.**

Two clauses, and the second is the one that gets argued about, so state it
plainly: deletion is the remedy, not a footnote or a caveat. A badge cannot be
qualified, because a badge has no room for a qualification — the whole element
is a word and a colour. The only two states available to it are *present and
wired* or *absent*.

Worked through the usual row:

- A **build or check badge** links to the run history of the workflow it
  reports. Wired by construction; this is the badge everything else is
  compared against.
- A **no-dependencies badge** links to the job that proves it — the one that
  installs the artifact into a bare environment and executes it. It does not
  link to a manifest, because a manifest is an intention, and it does not link
  to a homepage, because a homepage is nothing.
- A **version-support badge** links to the configuration that pins the
  version, or to the matrix that tests it. Typing the version into the badge's
  own address makes the badge its own authority, and a claim that is its own
  authority is decoration.
- A **licence badge** links to the licence file in the tree. This one is
  admissible with a weaker check because the target is the artifact itself:
  the file either says that or it does not, and a reader can confirm it in one
  click.
- A **conformance or ecosystem badge** — *implements this specification*,
  *available in that catalog* — links to the project's own entry in that
  catalog, never to the specification. The entry disappears when the claim
  stops being true; the specification does not.
- A **statistic badge** carries its predicate
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate))
  or it is not a badge, it is a number in a costume. *Coverage* over what
  population, measured by which run? A percentage with no predicate is reused
  by readers for whichever claim they wanted it to support.

## The row is a claim set, and it is audited as one

Individual badges pass or fail individually; the row has a property none of
them has. A row in which some badges are wired and some are decoration is
**worse than a row that is entirely decoration**, because the reader cannot
tell them apart and therefore discounts all of them — including the build
badge, which was the one honest signal on the page. A single unwired badge
launders itself using the credibility of the ones beside it, and spends theirs.

Measured on 2026-09-01 in the one project of eight surveyed that carries a
badge row at all: seven badges, of which **four link to a target that can go
red and three do not**. The project is otherwise the strongest landing
document in the survey, which is the point worth taking — this is not a
failure of care, it is a failure that care does not catch, because a badge row
is assembled once and never re-read. So the audit is periodic and mechanical:
enumerate the badges, and for each one name the artifact that changes colour
when the claim breaks. A badge for which nobody can name that artifact in a
sentence has already failed.

## What a badge may not be used for

**A badge may not carry a claim that has no automated check anywhere in the
project.** The temptation runs the other way — the property matters, so it
gets a badge, and the badge stands in for the check nobody wrote. This is the
purest form of the failure the whole subject watches for: reputation paid out
in the document while the enforcement is never built. If the claim is worth
asserting on the front page, it is worth a check, and the correct order is
check first, badge second. If it is not worth a check, it is a sentence in the
prose, where it reads as an author's statement rather than as an instrument's
verdict.

**A badge may not restate the project's identity.** A badge saying the
project's own name, or its category, asserts nothing that can be false and
occupies the scarce space above the first paragraph — the same space that,
three surfaces down, is the entire excerpt a reader gets.

## When a badge row is the wrong element entirely

For a repository nobody outside the team will read, the row is pure cost: the
audience already knows the build state from the pipeline they watch, and the
badges are maintenance on a signal with no recipient. Badges pay for
themselves on a **published** landing document, where a stranger is deciding
in seconds whether the project is alive and has no other instrument. Below
that, a single check badge is usually the whole correct row.
