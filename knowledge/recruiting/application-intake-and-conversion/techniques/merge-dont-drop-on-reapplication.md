---
layer: technique
type: technique
subject: application-intake-and-conversion
technique: merge-dont-drop-on-reapplication
status: forged
laws: [absence-of-evidence-is-not-evidence, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [handling duplicate applications to the same role, deciding what a repeat submission overwrites, building an all-or-nothing record rebuild]
---

# Merge, don't drop, on re-application

Someone applies. Two weeks later they apply again to the same role — with a
better document, a corrected phone number, a new job title, a portfolio that
now exists. The system sees a duplicate.

The standard behaviour is to drop it: a record exists, so the second
submission is noise. That behaviour rests on a premise that is almost always
false. **Re-applying is the only self-service "update my information" path
most candidates have.** They have no account, no profile page, no way to
correct a typo, no channel to tell you about the certification they finished.
Re-applying *is* the channel. Dropping it discards the update, keeps the stale
version, and teaches the candidate that your system does not work — the two
most common follow-up behaviours being a third attempt and an email to
whatever address they can find.

Creating a second independent record is not better. Now a recruiter sees the
same person twice, may review the worse copy, and every count in the funnel is
wrong.

## The rule

A repeat submission from the same person to the same role **merges into the
existing record**, updating what it carries and leaving alone what it does
not. Field by field:

- **Present and different in the new submission → update**, retaining the
  prior value in history. The candidate's latest declaration is their current
  one.
- **Absent from the new submission → leave the existing value untouched.**
  A missing field is [not a value](../../_laws.md#absence-of-evidence-is-not-evidence);
  it is silence, and silence must never blank a fact the candidate already
  gave you. This is the merge bug that costs the most and is noticed the
  latest — a short quick-apply overwriting a full application with emptiness.
- **Derived material — parsed documents, extracted skills, enrichments —
  rebuilds from the new source and replaces the old derivation wholesale**,
  because a derivation half from one document and half from another describes
  nobody. Rebuild is all-or-nothing (below).
- **Process state — stage, prior decisions, interview history, notes,
  timestamps of first contact — is preserved.** A re-application is new
  evidence, not a new candidate. Resetting someone at interview stage back to
  "received" because they uploaded a better résumé is a data-loss event
  wearing a feature's clothes.
- **Original application time is preserved**, and the re-application time
  recorded separately. Time-in-stage and response-time metrics measure the
  first arrival, or they measure nothing.

## The rebuild is all-or-nothing

Merging replaces derived material, which means it destroys before it creates,
which means a failure in the middle is catastrophic in a specific way: the old
parse is gone, the new one never completed, and the record now holds less than
it did before the candidate tried to help you.

So the rebuild is transactional in effect, whatever the storage layer offers:
build the replacement completely, validate it, and only then swap. **A failed
rebuild touches nothing.** The candidate's existing record survives exactly as
it was, the submission is recorded as received with a degraded reason, and the
gap becomes a visible task rather than a silent regression. A partially merged
record is worse than either version alone, because nobody can tell which
fields came from where.

The same reasoning bars the tempting shortcut of deleting the old record and
inserting a new one: that is a rebuild with no rollback and it takes the
process history with it.

## Identity: match conservatively, ask when unsure

Merging requires knowing it is the same person, and getting that wrong in the
wrong direction merges two different candidates — a privacy incident, not a
data-quality one. Identity has a strict precedence order, and using it in the
wrong order is where the damage happens:

1. **A token you issued** — the opaque identifier carried by the enrichment
   link in your own acknowledgement, scoped to one application. This is the
   strongest signal you will ever have, and it removes the requirement that
   the candidate re-type the *exact* address they used before, which is a
   coin-flip in practice. Validate its shape, confirm it belongs to this role,
   and degrade silently to the next rule if it is stale or mismatched — never
   error at the candidate over a link that expired.
2. **A contact address**, normalised. Two real people can share a name; an
   address is theirs. Address-first matching is what stops two same-named
   applicants from collapsing onto one record.
3. **A normalised name**, only as a fallback where no address was captured.
4. **Nothing.** An anonymous submission with neither is not matched at all —
   each gets its own record, because you cannot tell two anonymous applicants
   apart and guessing merges strangers.

Treat weak signals — a common name, a shared household phone, the same
employer — as *candidates for* a merge that a human confirms, never as a
merge.

Asymmetry is deliberate: a missed merge produces a duplicate, which is
annoying and reversible. A wrong merge exposes one person's application to
another's, which is neither. When unsure, do not merge; surface both records
side by side with the conflict named.

## A merge is a fresh act of consent, and a fresh declaration

Two things refresh on every repeat submission, and both are easy to forget
because the record already existed:

- **Consent and its retention clock.** The candidate has just handed you their
  data again; record the agreement and re-stamp the expiry rather than
  inheriting a permission given months ago for a version of the record that no
  longer exists. The consent-and-retention sibling owns the shape of that
  record; what belongs here is the trigger. Do it best-effort — a bookkeeping
  failure must never undo a filed application or block the acknowledgement.
- **Declared gate answers.** A repeat that re-answered the eligibility
  questions has re-verified them; refresh the recorded pass-state so a later
  enrichment step skips exactly those gates and no others.

The most valuable merge in practice is the one that makes a previously
unreachable record reachable — a submission that finally carries a contact
address. That case has a second obligation: the original acknowledgement had
nowhere to go, so send it now, to the address just captured. Backfilling
contact silently leaves the candidate believing nothing was received.

## Cases that are not merges

- **A different role.** Same person, different opening, separate application.
  Share the profile, never the process state.
- **A withdrawn or deleted record.** If the candidate withdrew or exercised a
  deletion right, a later submission starts fresh. Merging into a record they
  asked you to forget resurrects exactly what they revoked; the
  consent-and-retention sibling owns that boundary and it overrides this
  technique.
- **A submission after a terminal decision on that role.** Whether a
  re-application reopens a closed outcome is a policy decision for the
  reconsideration path, not something a merge should perform silently. Record
  it, surface it, let a person decide.

## The candidate must be told which record they touched

A merge is invisible unless you say so, and an invisible merge feels
identical to a drop. The acknowledgement after a repeat submission should
confirm plainly that the existing application was updated rather than
duplicated — which is also what stops the third and fourth attempt. Whatever
happens internally, the candidate's own action completed, and it must not
appear to have failed because of a constraint on your side that they cannot
[see or influence](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
