# Sentry as the `monitoring` connector

What was learned mapping this recipe onto Sentry specifically. Nothing here is part of the
recipe: bind a different provider and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Sentry answers two of the four signals well and the other two not at all.** Errors and
latency are its subject, and its performance data carries per transaction durations and
percentiles. Traffic it knows only as the volume of what it was told about, and saturation it
does not know at all: there is no queue depth, no run queue, no connection pool wait. A scan
bound only here should say in the account that saturation was not covered, because otherwise a
clean report implies four signals were checked and two were.

**Everything it holds is sampled, and the sample rate is application configuration.** Both
error and transaction sampling can be set per release, per transaction and dynamically, so a
series read from here is a series about what was sent, not about what happened. Read the
current sample rate alongside the numbers and treat a change in it as a break in the baseline
rather than a movement in the infrastructure.

**Scope the credential to the projects the scan is accountable for.** Organizations and
projects are the natural boundary, and a token that reaches every project produces an account
mixing environments whose normals are unrelated. This is also the cheapest way to keep the
baseline from averaging a healthy staging project into a struggling production one.

**Percentiles here are computed by the provider over its own intervals.** The p95 shown for a
one hour window is not derivable from twelve five minute p95s, so a baseline must be built
from windows of one length and compared only against windows of that length. Choosing the
window once, at adoption, and never mixing it is the whole discipline.

## What transfers to any monitoring connector

- Say which of the four signals the bound provider can actually answer, and name the gaps.
- A sampled series is a series about what was sent; the sample rate belongs in the reading.
- Scope the credential so unrelated environments cannot share a baseline.
- Fix the percentile window once and compare only like against like.
