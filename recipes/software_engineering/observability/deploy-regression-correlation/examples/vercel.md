# Vercel as the `cloud` connector

What was learned mapping this recipe onto Vercel specifically. Nothing here is part of the
recipe: bind a different platform and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Most deployments in the list never served a user.** Every pushed branch produces a preview
deployment, so an unfiltered deployments list is mostly pull request activity. Filter to the
production target before the list means anything; otherwise the correlation window fills with
changes that could not possibly have caused a production error, and the ranking is dominated
by noise that scales with how many branches are open.

**The timestamp that matters is when traffic moved, not when the build finished.** A
deployment carries a creation time and a ready time, and neither is necessarily the moment the
production alias pointed at it. Promotion and instant rollback move the alias without creating
a new deployment, so the newest deployment is not always the one serving. Align the error
series against alias changes where they can be read, and say which timestamp was used when
they cannot.

**A rollback looks like a deploy.** Rolling back produces another alias change, so an error
series that recovers immediately after a change is often recovering because of it. Reading the
sequence without that distinction names the rollback as the regression, which is the most
embarrassing failure available here. Treat a change immediately preceding a recovery as a
candidate fix, not a candidate cause.

**The commit metadata is good, and it is the reason to use this source.** Production
deployments carry the commit, the message, the branch and the author, which is most of what
the handoff to the person on call needs. That is what this connector contributes; the error
series has to come from somewhere else, and the two clocks need to be reconciled before
anything is compared.

## What transfers to any cloud or platform connector

- Establish which deployments actually served production traffic before counting them.
- Separate build time, ready time and traffic switch time; only the last one can cause an error.
- A pointer or alias move is a change even though it creates no new artifact.
- A change immediately before a recovery is a fix, not a cause.
