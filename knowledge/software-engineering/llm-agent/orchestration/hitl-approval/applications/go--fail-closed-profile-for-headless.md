---
layer: application
type: application
subject: hitl-approval
technique: fail-closed-profile-for-headless
stack: go
status: forged
verified_on: 2026-10-14
verified_against: go@1.27
---

# The restricted safety mode in an agent runtime (docker-agent)

Read from a clone of `docker/docker-agent` at commit `f412343dc305`; stack
witnessed by `go.mod` (`go 1.27`). Nothing was run.

## What the tree does

Approval is one pure function, and the file's own comment says the whole matrix
can be unit-tested without a runtime. Its restricted arm,
`pkg/runtime/toolexec/permissions.go:140 "case session.SafetyPolicyRestricted:"`,
allows safe calls and denies the rest. The documented meaning is the
technique's profile: `pkg/runtime/toolexec/permissions.go:127 "Restricted is the fail-closed profile for"`,
and the next lines say it never prompts and denies whatever it would not allow.
An unrecognised value resolves to strict:
`pkg/runtime/toolexec/permissions.go:129 "Unrecognised modes are treated as strict"`.

The classifier is three-valued and cannot block:
`pkg/safety/safety.go:8 "a labeller must never block a call."` Failures degrade
to the unknown class, which the restricted row denies.

Resume and delegation follow the technique. The user documentation says
`docs/configuration/permissions/index.md:71 "delegated sub-agent sessions inherit the active session's mode"`
and that a resume keeps the stored mode.

## Where the tree stops short

An explicit allow rule overrides the restricted fallback by design, which is the
lever the technique asks for, and also the hole described in
[author-advisories-yield-to-the-users-mode](../techniques/author-advisories-yield-to-the-users-mode.md):
the same lever is available to an author-tier file.

## What this realization cannot do

The classifier's safe class rests on a pattern list for shell commands and on
annotations the tool's author supplies, so a tool that declares itself read-only
is trusted as such. The tree records the annotation origin separately
(`pkg/safety/safety.go:36 "OriginAnnotation Origin"`), but only the legacy mode
treats the two origins differently.
