---
layer: application
type: application
subject: readiness-passports
technique: audit-the-live-system-not-the-plan
stack: process
status: forged
verified_on: 2026-10-27
---

# A hackathon submission audited sixteen hours out (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon submission repository on GitLab). This is a `process` realization: the
audit was a working session, not code, and most of what it found lives in the session record
rather than in the tree. Where the tree carries the result, it is cited; where it does not,
that is said.

## What the audit found (session record, no anchor in the tree)

With about sixteen hours left, the plan said the demo would be filmed one day and submitted on
the deadline day, the team's own docs gave a 14:00 deadline, and the README said the agent flows
"come next". The live checks, made against the platform's API and the official rules page, found
the opposite of the documents on every line that mattered: no pipelines on the submission
repository, no merge requests, issues or agent sessions on the demo project, no recorded
deployment address, an official deadline one hour earlier than the docs said, and a pass/fail
first-stage gate the plan never mentioned. The remaining work was then ranked by the gate it
failed and split into parallel tracks with one committer for the shared tree. None of these
observations is recoverable from the repository; they are recorded here as the technique's
founding case, not as cited evidence.

The same session paid for the technique's first caution: automated page loads and API polling
from the owner's machine tripped the forge's per-address rate limit, and the owner's own browser
was blocked. Verification was throttled and repeated page loads stopped.

## What the tree carries afterwards

The README that shipped is the audit's output in the shape the technique asks for: claims tied
to artifacts, and unbuilt work named as such.

- **Each claim of a run links its evidence.** `README.md:161` "## What ran on GitLab" lists the
  registered flows, the merge request the patcher opened and the one the guardrail blocked, each
  as a link to the platform page that shows it (`README.md:166-174`).
- **Anonymous-reader visibility is stated.** `README.md:176` "The agent session pages need a
  signed-in GitLab account." — the reviewer is told in advance which evidence will not open.
- **Built-but-not-run is separated from ran.** The architecture diagram's legend says "Solid
  lines ran on GitLab during the hackathon; dashed lines are built and tested in this repository
  but not yet wired on the demo project" (`README.md:65-66`), and `README.md:328` "**Not yet
  wired on GitLab:**" names the CI components and flows that are defined but not registered.

## Deviation recorded

The audit itself left no artifact: no dated checklist of requirements with the observation that
settled each one. The technique's "date the audit" caution is met only by the commit that carries
the corrected README; the next reader cannot tell which requirement was checked how, or when.
