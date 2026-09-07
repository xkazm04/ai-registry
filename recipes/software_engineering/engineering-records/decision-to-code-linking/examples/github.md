# A hosted repository as the `source_control` connector, on GitHub

What was learned mapping this recipe onto GitHub specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The pull request is the best evidence this recipe will ever get, and it only exists on a
hosted binding.** A commit message says what changed. A pull request says why, in prose, and
often names the decision in words a commit never would, because somebody was explaining
themselves to a reviewer. A local checkout resolves the same connector type and has no pull
request at all, so the two are not interchangeable here: on a checkout the candidate set is
commits only and the confirmation step loses its strongest evidence.

**Squash merging hides the discussion behind a single commit.** The commit that lands on the
default branch is not the commit anybody talked about, and its message is often generated.
Follow the merge back to the pull request, or the reasoning that would have confirmed the
link is gone while the change is still visible.

**Search across a large organization returns coincidental matches, which is the exact
failure this recipe exists to avoid.** Scope candidate discovery to the repositories a
decision could plausibly appear in, and settle that scope at adoption. A wider search does
not find more true links; it finds more plausible ones.

**A candidate sweep can quietly return part of the activity.** Pagination and rate limits
mean a sweep can stop early and report success, and a partial sweep that found no candidate
is indistinguishable from a decision that was never implemented. Record how much of the
window was actually read.

**Reading the code is a different grant from reading pull requests, and this recipe needs
both and nothing else.** It never writes here; the write half goes to the note store.

## What transfers to any hosted source_control connector

- Where a review artifact exists, it carries the reasoning and the commit does not; prefer it.
- Any merge strategy that rewrites history separates the change from its discussion, so
  follow the merge rather than reading the landed commit.
- A sweep that may be partial must report its coverage, or absence of evidence becomes
  evidence of absence.
