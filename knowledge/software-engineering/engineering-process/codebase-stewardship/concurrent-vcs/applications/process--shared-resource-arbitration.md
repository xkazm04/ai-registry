---
layer: application
type: application
subject: concurrent-vcs
technique: shared-resource-arbitration
stack: process
verified_on: 2026-09-17
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Per-checkout daemons at fleet scale - the census that found none

The technique's namespace rule says duplication beats locking when a resource is
cheap to copy, and its 2026-09-17 boundary says "cheap" is a function of the live
worker count, with the per-checkout daemon (a language server, a watch-mode type
checker, a persistent test worker) as the class that inverts it. This fleet runs
agent sessions in linked worktrees at exactly the scale the boundary is about,
so it was opened as the seam that could show the class binding - or show that it
does not, which is what happened.

## The census

Arm A is the prediction the boundary makes for an editor-driven fleet: one
resident language server per open worktree. At the moment of the census the
three checkouts that host worker worktrees held **52 worktrees** between them
(3, 14 and 35), with five agent sessions live on the board. Arm B is the process
table: a filter over every process command line for language-server, type-checker
and LSP signatures. It returned **one** editor extension host and nothing per
worktree - zero language servers, zero watch-mode checkers.

The reason is structural and it is the fact worth recording. The fleet's workers
are command-line agent sessions, and a command-line session spawns no editor-side
daemon for the checkout it works in; its type checks and tests run as short-lived
subprocesses inside the session's own tool calls and exit with them. The resident
cost this fleet pays per worker is the session's own runtime - the same census
counted 58 session and runtime processes holding about 24.7 GB across five live
sessions - which is per *session*, not per *worktree*, and which no sharing move at
the worktree layer would reduce. The boundary's precondition (a tool that spawns
once per working copy and stays) is absent, so the verdict is `unmeasurable` here
rather than a confirmation or a refutation.

## The instance the fleet already runs

The technique's own example of the sharing shape - a dependency-install directory
linked into worker worktrees instead of duplicated per copy - is this fleet's
standing practice for its Node projects: the install directory is junctioned into
each worker worktree, and the liveness probe is that the worker's test runner
resolves and executes there. That realization pre-dates the boundary and was
written down as a hazard note, because the junction's removal must precede any
recursive delete of the worktree or the shared install is destroyed with it. It
is the per-copy-resident cost class solved by sharing plus a delivery check,
which is what the boundary prescribes.

## What this realization cannot do

It cannot measure the daemon class, because nothing here spawns a daemon per
worktree. The instrument that would make the verdict measurable is a worker
profile that runs an LSP-backed check inside each worktree and keeps the server
warm between calls - the shape an editor-integrated agent has and a CLI agent does
not. When such a worker exists in this fleet, re-run the same census against the
same worktree count and read the per-server working set before and after
consolidating them behind one server with a per-worktree diagnostics probe.
