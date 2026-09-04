---
layer: application
type: application
subject: agent-runtime-assembly
technique: operator-tier-code-loading
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.95
proof: structural-only
---

# The immutable core is named three times, and mounted read-write

The version witness is the tree's own toolchain pin: `mise.toml` declares
`rust = "1.95"` and `Cargo.toml`'s `workspace.package.rust-version` agrees, with
`edition = "2024"`. Read at commit `7801005`.

This is a self-modifying agent harness: a long-running agent with read-write
access to the source tree that defines its own behaviour, able to edit that
source, rebuild, and restart onto the result. Its whole safety argument rests on
one claim — that some part of itself is out of its reach — and the interesting
structural fact is that **the tree names that part three different ways and
enforces none of them.**

The three statements, all load-bearing, all in first-party documents:

- the landing page: "The **only** thing it can't muck with is an event log";
- the architecture essay: the harness "is the **only** part of Exo which cannot
  be modified by the agent";
- that same essay's footnote: "Whether or not the agent can modify the
  exo-harness is actually a policy consideration. The system technically allows
  it, but ... it's disallowed on the default configuration."

Two "only"s naming different components, and a footnote conceding the second is
configuration rather than mechanism. A reader cannot determine from the tree's
own documents what the trust root is.

## The mechanism exists and the default path does not use it

This is the part worth recording, because it is the shape of the thing rather
than a documentation defect. The sandbox mount API is capability-complete for
the claim: `SandboxMount` carries an access mode with `ReadOnly` and `ReadWrite`
variants, and the serialized form has both `ro` and `rw` spellings. Nothing
needed to be built.

The canonical startup script mounts the entire repository root — the harness
crate and every other crate included — into the agent's shared sandbox with the
read-write flag, in one line, unconditionally. There is no path filter between
that mount and the build, and no policy check on the way to the rebuild tool. So
the "default configuration" that the footnote says disallows harness
modification is precisely the configuration that permits it.

A neighbouring flag is worth naming because it looks like an access control and
is not: mounts carry an `internal` boolean, but every consumer treats it as
display scoping — whether the mount appears in a listing — never as permission.

## Why the tier rule predicts this

The technique's tiers are ordered by who writes the configuration, and this tree
adds the writer the table did not have: the model itself. The
[fourth row](../techniques/operator-tier-code-loading.md) argues that such a tier
cannot take the third row's inversion, because install-time consent is
structurally unavailable when the point of the tier is to remove the human. This
tree is that argument's field instance, and it went further than the rule's
worst case: it did not merely skip consent, it left the code-entry surface at
the *widest* tier — the running source of the harness itself — while describing
the system as one where that surface is closed.

The generalisable observation is not "they forgot a flag". It is that **a trust
root stated in prose and unbound to a mechanism drifts to the permissive
reading**, and the drift is invisible because every document still asserts the
strict one. Where a system's safety claim is "X cannot be modified", the review
question is not whether the documents say so — it is which line of code would
have to change for the claim to become false, and whether anything fails when it
does.

## What this tree cannot tell us

The read is structural: the mount flag, the type, the absence of a path filter.
It is not a behavioural proof that an agent editing the harness crate produces a
running modified harness — that requires executing the rebuild path, which needs
the full toolchain and a live model, and was not run here. What the structure
establishes is narrower and sufficient for the technique: **no mechanism is
positioned to refuse it.**
