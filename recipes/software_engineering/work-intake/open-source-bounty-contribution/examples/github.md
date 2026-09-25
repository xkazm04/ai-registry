# GitHub as the `source_control` connector

What was learned mapping this recipe onto GitHub specifically. Nothing here is part of
the recipe: swap the host and this file stops applying while the recipe does not change.

## What the mapping has to decide

**"Open and unclaimed" is three separate reads on GitHub, and none of them is the issue's
state alone.** An issue can be `open` and still be taken: it may be assigned, it may carry
a `claimed` or `in progress` label the project uses by convention, and it may have a linked
pull request that closes it. Check the assignee, the labels, the timeline for a linked PR,
and the open pull requests that reference the issue number before deciding it is free. The
issue being `open` is necessary and nowhere near sufficient.

**The rules live in known files, and their absence is itself a signal.** Look for
`CONTRIBUTING.md`, a `.github/` directory, an `AGENTS.md` or a `CODE_OF_CONDUCT.md`, and
any AI-contribution policy the project publishes in the contribution guide, the issue
template, or a pinned discussion. A project with none of these has not said AI is welcome;
it has said nothing, and the recipe still holds the change to the same bar and discloses
where the law, not the project, requires it.

**The target branch is a fact you read, not a default you assume.** GitHub's default branch
is not always where contributions go; some projects take fixes against a `develop` or a
release branch and the contribution guide says so. Opening a pull request against the wrong
base is a common, avoidable reason a good change is bounced.

**Disclosure has a natural home in the pull request body and in the trailer.** Where the
project asks for it, a plain line in the PR description and, if the project uses them, a
`Co-authored-by` or an assistance trailer in the commit is the honest form. The person
whose account opens the pull request is the author of record on GitHub, so the disclosure
is theirs to make and must reach them before they submit.

## What transfers to any source_control connector

- "Open" is not "available": assignment, a convention label, and a linked change request
  each mean taken, and only the host knows which the project uses.
- The contribution rules and the AI policy live in files the host serves; read them before
  writing, and treat their absence as silence rather than as permission.
- The base branch is read from the project, never assumed from the host's default.
