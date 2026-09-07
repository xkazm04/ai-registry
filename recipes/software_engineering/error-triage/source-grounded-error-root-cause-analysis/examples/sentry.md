# Sentry as the `monitoring` connector

What was learned mapping this recipe onto Sentry specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Whether a trace can be grounded at all is decided at build time, months before this
recipe runs.** A minified frontend frame is readable only if the build uploaded its
source maps and the deployed bundle and the uploaded map are tied together. Sentry ties
them by an id injected into both at build time, and falls back to matching on the release
name when that id is absent. The fallback is where the silence lives: two builds
published under the same release name overwrite each other's artifacts, and two identical
builds under different names are treated as unrelated. Either way the frames come back
unreadable or wrong, and neither produces an error the analysis would notice. Check that
the failing event has readable in-app frames before promising a grounded report.

**A trace that cannot be symbolicated also groups badly, so the issue that arrived is
suspect too.** Minified names shift between builds, which splits one bug across a new
issue per deploy. An unsymbolicated issue is therefore usually both unanalysable and
younger than the bug it represents, and saying that is more useful than analysing it.

**The release on the event is the cheapest link to a revision, and it is only as good as
what the deploy pipeline sets.** Where the release name is a commit or carries one,
alignment is a lookup. Where it is a version string with no commit behind it, the
alignment step needs a map from release to revision that lives with the adopter, not in
the monitor.

**"Latest event" is a convenient default and sometimes the wrong sample.** The most
recent event may be from a different platform, a different release, or a client with an
unusual configuration. Where an issue spans releases, take an event from the release the
report is about and say which event was read, because two events under one issue can
support two different causes.

**Sentry's own suggested cause is an input, not the finding.** It is generated from the
same trace the report is meant to go beyond, so a report that agrees with it without
having read the source has done nothing this recipe exists for. Where it is used, say it
was.

## What transfers to any monitoring connector

- Establish that frames are readable before promising a grounded answer; unreadable
  frames are a pipeline finding, not a per-issue limitation.
- The link from a deployed artifact back to a revision is set by the deploy, not by the
  monitor, and where it is missing the recipe cannot be run honestly.
- One issue can hold events that disagree; name the event the report was built on.
