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
