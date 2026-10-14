---
layer: application
type: application
subject: hitl-approval
technique: author-advisories-yield-to-the-users-mode
stack: go
status: forged
verified_on: 2026-10-14
verified_against: go@1.27
---

# Tiered permission checkers in an agent runtime (docker-agent)

Read from a clone of `docker/docker-agent` at commit `f412343dc305`; stack
witnessed by `go.mod` (`go 1.27`). Nothing was run.

## What the tree does

Checkers carry a tier. The decision function walks them in order and lets deny
and allow win outright, but handles an ask by tier:
`pkg/runtime/toolexec/permissions.go:104 "Team-tier ask is advisory under Balanced/"`
falls through to the mode, while a session-tier ask always prompts. The user
documentation states the principle as a warning,
`docs/configuration/permissions/index.md:76 "author defaults never outrank you"`,
and gives the priority list for a new session, with the author's two
declarations last before the historical default.

Resume does not re-apply defaults:
`docs/configuration/permissions/index.md:71 "Resuming a session never re-applies defaults"`.

## The hole the tree leaves

Allow rules are not tiered:
`docs/configuration/permissions/index.md:147 "Allow patterns from either source auto-approve the tool"`.
An agent file fetched from a registry can therefore approve a destructive call
that a user's fail-closed run would have refused. The technique records this as
the boundary of the rule; the open question is whether demoting author allows
under auto-deciding modes would break the agents that depend on them.

## What this realization cannot do

It does not show the user which tier produced a rule in the confirmation prompt
beyond a source label in denial messages, and it has no way to mark an author
allow as unreviewed.
