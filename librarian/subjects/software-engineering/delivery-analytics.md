---
subject: delivery-analytics
domain: software-engineering
last_touched: 2026-08-31
dry_streak: 0
---

# delivery-analytics

First touch: 2026-08-31, an `/intake` run on a development mailing list archive
(`pgsql-hackers-2026-08`). Not selected from the librarian worklist - the
subject was reached from the source, and it is not on the top-15 attention list.

## State

6 -> 7 techniques, 3 -> 4 applications (the new one `rust`, retiring the
all-`node` single-stack condition on this subject).

Landed:

- `post-landing-repair-density` - the repairs a change required after a declared
  instant, as a graded failure signal available while the revert decision is
  still open.
- `revert-linkage` amended: its opening claim was "a revert is the only failure
  signal available from change history alone." It is the *terminal* one, not the
  only one, and the file now says so and points at the sibling technique. The
  golden path carried the same claim and got the same correction plus a new
  section.
- `applications/rust--post-landing-repair-density.md`, verdict `better`.

## What made the finding available

**The subject's own "when not to use this" named the hole.** `revert-linkage`
already said "a team that reverts readily and a team that fixes forward differ
in policy, not in reliability" - a stated blind spot, sitting one paragraph
under a stated completeness claim, for months. The source did not reveal a gap
so much as make it impossible to keep reading past. A subject that documents its
own limits well is a subject where the next finding is cheap; that is worth
knowing before the next sweep here.

The golden path's framing was the weaker half: it filed fix-forward under
*revert undercounting to be disclosed*, which is the move that keeps a second
signal invisible by treating it as noise in the first.

## Open

- The technique's severity-classing step was **refuted by its own A/B** and now
  carries the limitation: severity cannot be read off commit subjects, because
  hardening and repair share a vocabulary. Whether a cheap non-manual classifier
  exists at all is unanswered - the one tested nominated three hardening commits
  out of four top rows.
- `delivery-metric-denominators` is called "the spine of the subject rather than
  one technique among six" by the golden path. The new technique's density
  figure is a ratio and was written to that discipline, but the two files do not
  cross-reference; a later pass should decide whether the spine claim should
  absorb it.

### 2026-09-17 - `/harvest backlog` wave 5, one technique + one amendment

`path-class-confounded-with-size`, from the widest convergence in the backlog - four independent sources routing review depth by the paths a change touches. They do not reduce to one post, and that is the trap: **they converge on a design, not on a result.** None of the four measured it, and path-based required review has been a platform default for a decade, which explains the convergence without validating it. Four sources for 'practitioners build this' and zero for 'it predicts risk'. The instrument is the transferable part. **The comparator is other code at the same size, never the bottom class.** A bottom class of docs, tests, config and assets always shows a large gap, because the finding underneath it is that code is riskier than prose - which needs no taxonomy and licenses no routing. The paths holding the dangerous machinery are the paths holding the load-bearing machinery, and that is edited in large changes: median churn ran an order of magnitude above the bottom class. A glob table selects a size distribution as a side effect. Report the observed ratio against the **centre of the permutation null**, not against 1.0, because a class concentrated in the large-change bands has a null ratio above 1.0 before any path effect exists. And **plant the effect you claim not to see before reporting that you do not see it** - a synthetic class with the same size distribution carrying a real 1.15x lift turned the same test red 20 of 20 trials, which is what makes this a powered null rather than an absence of power. Two globs did carry signal size-matched and neither was a security glob: a migration directory and a long-lived-session module. **What predicted repair was irreversible state and long-lived state - categories the risk vocabulary of security review does not contain.** One of the two was also a name-match false positive, which is the other failure: a glob matches vocabulary, and the vocabulary of a domain overlaps security's in ways nobody auditing the table notices. The half that held is the opposite of the emphasis these sources are written with: an auto-approve tier drawn on non-code paths is defensible from history; a top tier drawn on security paths is not. Kept separate from the reservation rule, which is about authority and blast radius and never rested on repair frequency.
