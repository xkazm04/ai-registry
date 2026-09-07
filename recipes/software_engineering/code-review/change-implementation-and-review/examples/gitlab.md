# GitLab as the `source_control` connector

What was learned mapping this recipe onto GitLab specifically. Nothing here is part of the
recipe: bind a different host and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Unresolved threads can be a hard merge blocker, and that is a setting rather than a
convention.** A project can require every discussion resolved before merge, which turns the
recipe's "answer or act on every comment" from good manners into the literal gate. Read the
project setting at adoption: where it is on, an unanswered thread stalls the change silently
and the reason is not shown on the merge button in a way anybody reads.

**Merge when pipeline succeeds is an in flight state with a real end, and it is easy to
mistake for done.** Setting it hands the merge to the pipeline, so the change is neither
merged nor waiting on a person. The observable end the recipe asks for is the merge event
itself, not the flag being set, and a pipeline that fails afterwards leaves the change open
with nobody notified.

**Approval rules are per project and can require specific approvers or a count.** A change can
be green, have every thread resolved, and still be unmergeable because an approval rule names
a group nobody in it is available from. That is worth surfacing as a waiting reason rather
than retried, because no amount of further work moves it.

**A draft merge request is marked in the title, and the marker is load bearing.** Removing the
prefix is the ready transition; leaving it on means approvals cannot complete. Because it
lives in the title, an automated title rewrite can silently un-ready or re-draft a change.

**The pipeline runs on a merged result ref, not only on the branch.** This is genuinely useful
and worth preferring: it tests what will land rather than what was written, which is exactly
the distinction that catches a change broken by movement on the target branch. Where the
setting is available, use it and say the verdict rests on it.

## What transfers to any hosted repository connector

- Find out whether unanswered discussion is a convention or an enforced gate here.
- A queued or conditional merge is still in flight; the end is the merge, not the intent.
- Distinguish "more work needed" from "waiting on a person nobody can summon".
- Prefer a check that runs against the merge result over one that runs against the branch.
