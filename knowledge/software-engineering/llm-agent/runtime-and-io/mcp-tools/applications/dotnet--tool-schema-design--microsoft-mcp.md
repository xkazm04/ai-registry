---
layer: application
type: application
subject: mcp-tools
technique: tool-schema-design
stack: dotnet
verified_on: 2026-10-06
verified_against: dotnet@10.0.401
---

# Behaviour hints as declarations: one month of a publisher correcting them

`microsoft/mcp` at commit `b7533190a98d989469dce9d61b0d4752943bceaa` is Microsoft's
official MCP server monorepo, with 478 command classes over 66 tool areas. The stack
version is witnessed by `global.json`, which pins the SDK to `10.0.401` with
`rollForward: latestFeature`. This is the second tree for this technique on this stack.
The first (`dotnet--tool-schema-design.md`) is a consumer lowering a schema for a
narrower endpoint. This one is the publisher's side of "Publish them honestly is a
test, not an intention". It is read as a delta: 194 commits between
`bc2a3b4eeceb2281cdf944920b7fdb2ccc73f5df` (2026-09-02) and this pin (2026-10-06), in
which the publisher corrected its own behaviour hints four times. Each correction tests
one rule of that section, and each is a commit anyone can open.

## "Every tool carries a verdict on every axis" — adopted, at the declaration only

#3614 (b596786c, 2026-09-11, "Make command metadata properties required") turned every
property of `[CommandMetadata]` into a C# `required` member:
`core/Microsoft.Mcp.Core/src/Commands/CommandMetadataAttribute.cs:35-53` covers
`OperationPlane`, `Destructive`, `Idempotent`, `OpenWorld`, `ReadOnly`, `Secret` and
`LocalRequired`. It also removed the `Unspecified` member from `ToolOperationPlane`. A
command whose author never decided an axis no longer compiles. That is the technique's
"fail to build rather than publish a default", reached by the publisher through the
language's own `required` rather than through a separate check.

It stops at the declaration. The wire reader still has a default:
`ToolMetadataJsonConverter.cs:37` maps any unrecognised operation-plane value to
`ToolOperationPlane.NotApplicable`, and the changelog for the same PR says "missing,
unknown, or legacy `unspecified` operation-plane JSON values deserialize as
`NotApplicable`." A tool description that reaches this server from elsewhere, through a
proxied or registry server, can therefore still arrive with no verdict and be read as
having one. In this tree "an absent hint is not a verdict" holds where tools are
authored and fails where they are deserialized.

## The dangerous direction, shipped — and the axis check that would have caught it

#3818 (1121197a, 2026-10-01) flipped `ReadOnly` from `true` to `false` on the
Communication `email send` and `sms send` commands. Its changelog says they "are now
correctly marked as write operations so they are excluded when the server runs with
`--read-only`." Until then, an operator who started the server read-only to prevent
side effects was still offered two tools that send messages to people. That is the error
the technique calls the dangerous direction: a write annotated read-only, which a
trusting host auto-approves.

The technique's first rule would have rejected both at build time. At `bc2a3b4` both
commands declared `ReadOnly = true` **and** `Idempotent = false`. That is the cross-axis
contradiction the technique names: a read-only verdict is idempotent by definition, so a
registry that lets the two disagree is publishing a contradiction. A mechanical scan of
every `[CommandMetadata]` block under `tools/` finds **10** read-only, non-idempotent
commands at `bc2a3b4`, including both send commands. At this pin it finds **9**: the two
send commands are gone and a new search command (`Azure.Mcp.Tools.Adme`) has joined. No
command in either tree declares read-only and destructive at once.

The remaining nine show where the check needs the publisher's vocabulary before it can
be turned on. All nine are reads by any effect-based definition: model completions and
embeddings, a search, and device and query reads against an IoT hub. They are marked non-idempotent because the
publisher's own definition of the axis counts output variance as well as effect.
`servers/Azure.Mcp.Server/docs/new-command.md:880` says "`false`: Command may produce
different results or side effects when executed multiple times", and every curated
group carries the same sentence (`consolidated-tools.json:564`). Under that definition
"read-only implies idempotent" is false for any read whose answer changes, so the
contradiction check would fire on honest reads as well as on the two real mis-annotations.
The axis means "repeated calls have no additional effect" in the technique and "repeated
calls return the same thing" in this tree, and the cross-axis rule holds only under the
first. A publisher that wants the check has to separate the two meanings first.

## A read-only verdict that rested on a filter

#3202 (1fa50320, 2026-09-11) is the costliest correction in the window, and its commit
log records the whole arc. The MySQL and PostgreSQL `database query` commands were
published read-only. The verdict rested on a statement validator: a regex over a list of
"dangerous" keywords and obfuscation functions (`MySqlService.cs:24-77` at `bc2a3b4`)
and a tokenizer for PostgreSQL. The PR began by hardening the filter. It stopped matching
keywords inside string literals, decoded Unicode escapes before matching, added a regex
timeout, and blocked `UESCAPE`. Then it removed the filter: "rejecting statements by SQL
verb or dangerous-identifier blocklist is no longer meaningful - the signed-in user's
database permissions are the authority." The commands were re-declared destructive,
non-idempotent and not read-only. The remaining validation is structural only: empty
input, maximum length, comments, stacked statements.

The technique's second rule is the instrument that would have settled this without an
arms race. It drives each read-only handler against a recording stand-in and fails on
any effectful call. A filter cannot be proven complete, but a stand-in shows whether a
crafted statement reaches the backend as a write. The publisher reached the same end by
another route. It stopped claiming what it could not prove and moved authority to the
system that owns the effect. The read-only claim was false while the filter was missing
cases, and the corrected declaration is true for every statement.

## "What is advertised on the wire equals the registry" — one surface, two renderings

#3772 (a9a215d4, 2026-09-28) fixed the CLI's `tools list` and `--learn` output, which
had reported every option's `type` as `string` while the MCP `inputSchema` reported the
real types. The changelog's fix makes the CLI "consistent with the MCP tool
`inputSchema`". Two renderings of one argument set had drifted, and the rendering a
model never saw was the wrong one. That is the technique's "assert on the listing a real
client receives". In this case the second client was the publisher's own CLI.

## Retiring unread arguments: the price, paid on schedule

The technique prices the retirement of unread arguments at breaking-change cost, once
per surface. In this window the publisher filed eight more such PRs, one per service
area (#3638, #3640, #3641, #3644, #3646, #3648, #3649, #3650). Every one shipped under
**Breaking Changes**, with no deprecation window and no alias. For example: "Removed the
unused `subscription` parameter from all Key Vault tools." No mechanism for deprecating
a parameter exists anywhere in the tree at either pin.

## What this realization cannot do

It cannot prove a hint. All four corrections were found by people. Not one arrived with a
probe that would catch the next instance. #3614 makes a missing verdict impossible to
author, but it cannot make a present verdict true. #3818 changed two attribute lines and
added no test that drives a read-only command and watches for effects. The axis-consistency
check, which would have caught #3818 for free, cannot be switched on until the
publisher's `Idempotent` stops meaning two things.
