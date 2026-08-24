---
name: reconcile
description: "Run the external-reconcile lane as its director: pick a bundle's single-stack subjects, choose world-class counterparts by class (repository, specification, public record), pin them, dispatch scoped Opus workers under docs/reconcile-brief.md, review every diff, then run the technique cycle that lands measured disproofs and two-sighting families. Portable across devices - resolves everything from the registry checkout, not from any one machine's project fleet. Use when a bundle carries single-source debt and an operator wants a wave."
category: ai-native
memory: project
version: 1.0.0
tags: reconcile, external-evidence, waves, cycles, dispatch
---

# Reconcile - direct the external-evidence lane

The lane that earns a subject its second source. `docs/reconcile-brief.md` is the
CONTRACT - the worker rules, the counterpart classes, the evidence standard per
class, and the purity line all live there and are not repeated here. This skill is
the director's seat: what to target, whom to dispatch, what to review, when to
edit a technique, and what to write down so the next run knows what this one did.

Say the division out loud once per session: **workers write applications;
the director writes everything else.** A worker that edits a technique, a law
file, or another subject's folder has left its contract, whatever it found.

## Invocation

```
/reconcile <bundle>              # profile the bundle, propose a wave, dispatch on approval
/reconcile <bundle> --cycle      # technique cycle only: land what converged, bank the rest
/reconcile status                # read the vault for the lane's open threads; touch nothing
```

## The wave, step by step

**1. Profile from the index, never by hand.** `knowledge/<bundle>/index.json`
gives every subject's techniques, applications, stacks and `use_when`. Targets
are subjects whose applications sit on one stack (one SOURCE - the stack was
always the proxy), and within each, an UNCOVERED technique. Read the golden path
before hinting; the hint names a technique and a place to look, and the brief
makes it refutable.

**2. Choose counterparts by class, grade them reputed.** Class A clones; class B
fetches a specification with a conformance artifact; class C queries a register
or published dataset. The brief's class table decides what "executed evidence"
means for each. A candidate is `reputed` on the watchlist until a worker
measures it. Check the consult side before dispatching a bundle: a consumer
need not be on THIS device - `librarian/projects.md` maps one machine's
checkouts, and absence there is absence of a local checkout, not of a consumer.
When no consumer is known on any device, say so in the run note and let the
operator decide; a reconciled bundle nobody consults was measured once and it
was worth nothing.

**3. Pin before dispatch.** Class A: shallow-clone into the worker's scratch
namespace (`<scratch>/oss-mastery/worker-<subject>/`), record commit + version.
On this platform two clone faults recur: parallel clones can finish with an
empty git index (repair: `git reset --mixed HEAD` - worktree untouched), and
deep trees can abort checkout on path length (repair: `git checkout --` the
paths that matter; say what stayed unrestorable). Classes B/C: the worker pins
publisher, edition, URL, retrieval date and a digest where the format allows -
the director only names the counterpart and the terms-first rule.

**4. Dispatch one Opus worker per subject, in parallel.** The prompt carries:
read the brief first; the subject resolved FROM the index (never a constructed
path); the pin; the hint with its fates (confirmed / refuted / passed over /
not conformance-testable); the executed-evidence expectation for the class; the
frontmatter block verbatim - `source:` always, `verified_on:` as the day the
citations RESOLVE (workers have corrected the director on this; let them); NO
`verified_against` on external evidence; the 130-line ceiling; the mandatory
citation re-check pass; scratch namespacing; report shape (file, pin, fate,
sharpest finding, executed evidence, leads, cross-subject proposals, could-not-
verify). Tell workers not to run the index builder - one rebuild happens at
close-out.

**5. The scan half, when it applies.** Repos get the maturity scan if the scan
service is running on this device; standards and registers do not - the
watchlist carries a dedicated section for them instead. A missing scan service
is a skipped half, not a blocked wave.

**6. Review diffs, not reports.** Read every application whole. Spot-check
citations yourself: class A against the clone, class B/C against the artifacts
the worker saved in scratch - and re-fetch at least one pin live. Verify
frontmatter discipline mechanically (line count, `source:`, no
`verified_against`). Purity-grep any technique the cycle later touches. This
review is the lane's ceiling - near eight subjects a sitting - and the ceiling
is kept, not optimized away.

**7. Close out in one pass.** Gates in order (`check-bundles`, `build-index`,
`build-catalog`); watchlist rows to `measured`/`CONSUMED`; a first-touch
subject note per subject (frontmatter: `last_touched`, `touched_by:
external-reconcile`, `dry_streak: 0`; body: pin, fate, sharpest sightings,
technique-edit candidates banked, cross-subject proposals); a dated paragraph
appended to the domain note - append, never regenerate; one run note
(`librarian/runs/`) with the landed table, convergence section, deviations and
declines; one commit by pathspec listing exactly the wave's files.

## The cycle

Run after a wave, separately, so the wave's diff stays applications-only.

- **A measured disproof lands immediately.** When a harness executed a
  technique's own sentence and it failed, the technique is wrong-as-written;
  correct it, keep the file's prior voice, and leave the measurement in the
  application - the technique carries the rule, never the lab coat.
- **A family lands at two independent sightings**, phrased for each consuming
  technique in its own context. One sighting - however good - stays banked in
  the subject note with the convergence rule named.
- **Four sightings opens a law conversation**; the cycle never writes a law.
- **Check claimed second sightings before counting them.** A worker saying
  "this may pair with the rust application" is a proposal; open the rust
  application and look.
- Purity-grep every edited technique (product, company, agency, standards-body
  names; repo paths; file extensions). Mark landed candidates in the subject
  notes - a dated LANDED line above the original record, which stays.

## Rules that are not negotiable

- The brief binds; this file only sequences it.
- One rebuild of index and catalog per sitting, at close-out, by the director.
- Commit by pathspec on a shared checkout - a sibling session's uncommitted
  work must never ride along, and generated files committed by pathspec capture
  every sibling's uncommitted inputs, so commit your skill edits before anyone
  rebuilds the catalog.
- Branch-or-not follows the operator: on a shared checkout with a sibling
  mid-flight, commit locally and record the pull-request obligation; an
  unattended run branches first. Ship to the default branch only on the
  operator's explicit word.
- Dry is a result. A bundle with no single-source debt gets a run note, not an
  invented wave.

## Reflection

Append one entry to `LESSONS.md` beside this file for any run that taught
something - the same append-only lane deepen, forge, intake and librarian
carry. What the lane has already paid for is seeded there; read it before the
first dispatch of a session.
