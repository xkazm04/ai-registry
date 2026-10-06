---
layer: application
type: application
subject: mcp-tools
technique: tool-identity-vs-tool-name
stack: dotnet
verified_on: 2026-10-06
verified_against: dotnet@10.0.401
---

# `MicrosoftMcpToolId` — a rename-stable identity whose first uniqueness gate grepped for syntax the tree no longer uses

`microsoft/mcp` at commit `b7533190a98d989469dce9d61b0d4752943bceaa` — Microsoft's
official MCP server monorepo, a shared `core/Microsoft.Mcp.Core` framework over 66 tool
areas in `tools/` and three servers in `servers/`. The stack version is witnessed by
`global.json`, which pins the SDK to `10.0.401` with `rollForward: latestFeature`
(`Directory.Build.props:4` sets `net10.0`). The tree declares 477 distinct tool
identifiers across 478 command classes, which makes it a good place to ask whether the
mechanism's guarantees survive contact with that many authors.

Re-pinned on 2026-10-06 from the first reading at `bc2a3b4eeceb2281cdf944920b7fdb2ccc73f5df`
(2026-09-03, 443 identifiers across 444 classes), 194 commits earlier. Every citation was
re-opened at the new commit. The first reading's central negative finding, that nothing
checked uniqueness, stopped being true in that window. It is kept below as history,
beside the gate that replaced it, under "What the delta did".

The identity itself is implemented exactly as the technique describes, in about forty
lines. `Helpers/McpHelper.cs:20` declares the wire key —
`public const string ToolIdMetaKey = "MicrosoftMcpToolId"` — `:48-54`
(`InjectToolIdMetadata`) writes it into a `CallToolResult`'s `_meta`, and `:61-71`
(`GetToolIdFromMeta`) reads it back with full type-checking (present, a `JsonValue`, of
kind `String`). Every command carries one: `Commands/CommandMetadataAttribute.cs:17`
declares `public required string Id { get; init; }`, documented as "A unique identifier
for the command (GUID string)", and `Commands/BaseCommand\`2.cs:33-53` reads the
attribute reflectively in the base constructor and *throws* if the attribute is absent or
invalid. Identity is therefore not a convention a command author can forget; a command
without one cannot be constructed.

## Both halves of the wire contract are present

The technique insists the identifier ride on the tool definition *and* on every result,
because either alone leaves a consumer unable to correlate without state of its own.
`CommandFactoryToolLoader.cs` does both:

- **Definition**: `:284` seeds the published tool's `_meta` with
  `[new(McpHelper.ToolIdMetaKey, command.Id)]`, beside the annotation block built at
  `:275-282` and the optional `SecretHint`/`LocalRequiredHint` keys (`:285-294`).
- **Result**: `:242` returns `McpHelper.InjectToolIdMetadata(callToolResult, command.Id)`
  on the success path, and the *refusal* paths carry it too — `:156` (read-only denial),
  `:172` (HTTP-mode denial), `:221` (argument-parse error). A denied call is still attributable to the tool that
  was denied, which is the case a name-keyed consent ledger most needs and most often
  loses.

The identifier is also the telemetry key: `:138-142` sets `TagName.ToolId` alongside
`ToolSource = "internal"` and the annotation summary, and the proxy loaders re-read it
off the child's `_meta` to tag their own spans (`ServerToolLoader.cs:278`,
`SingleProxyToolLoader.cs:720` on its proxied path, `RegistryToolLoader.cs:149`). Since
#3466 single-proxy mode runs the repository's own commands in-process and tags
`baseCommand.Id` directly (`SingleProxyToolLoader.cs:503`). So the rename-stable string
really is what the traces are keyed on, not merely something published beside them.

## The boundary holds: possession addresses nothing

This was one of the facts to hunt — can a caller invoke by identifier? **No, and the
reason is structural rather than defensive.** `GetToolIdFromMeta` has exactly four
non-test callers in the whole tree (`ServerToolLoader.cs:278`,
`SingleProxyToolLoader.cs:720`, `RegistryToolLoader.cs:149`, and the helper itself), and
every one of them is on the *outbound* path: reading an id off a definition the server
just produced, in order to re-attach it to a span or a result. Nothing reads an
identifier off an inbound request. Dispatch is by name throughout — a dictionary keyed on
tool name in `CommandFactoryToolLoader.cs:33`, `namespaceCommands.TryGetValue(command, …)`
in `NamespaceToolLoader.cs:363`, a tool-name comparison in the proxy loaders
(`SingleProxyToolLoader.cs:710`, plus `AllCommands.TryGetValue(command, …)` at `:472`). A
grep for a lookup keyed on `.Id` in the core project returns nothing. There is no second
door because nobody built one, which is the strongest form of the guarantee: the property
is not enforced, it is unimplementable without new code.

The rename rule is documented rather than mechanized, and correctly scoped.
`docs/tool-rename-checklist.md:23`: "Update the `Id` property to a new unique GUID **if
the semantic meaning of the tool has changed materially** (not required for pure
name-only fixes)." The checklist's own definition of a rename (`:9-13`) covers any
segment of the command hierarchy — group, resource, leaf — and explicitly excludes
description and title edits, so the two vocabularies are separated in the document as
well as in the code.

## The structural fact: the script gate matches nothing, and a second gate replaced it

The technique says uniqueness must be a build failure, not a review question, because
duplicates arrive the ordinary way — a command copied as a starting point for a new one.
This tree has a script gate wired into two entry points that is a no-op and, since
#3614 (b596786c, 2026-09-11), a test gate that is not.

`eng/scripts/Test-ToolId.ps1:19-47` walks `tools/` for `*Command.cs`, and for each line
tests one regex:

```
if ($line -match 'public override string Id => "(.*)";')
```

collecting matches into a dictionary and failing when any key holds more than one file.
It is called from `eng/scripts/Analyze-Code.ps1:77` and `eng/scripts/Preflight.ps1:148`,
so it runs where a developer and a build would expect it to.

**At this commit that pattern matches zero lines in the repository.** Not zero
duplicates — zero *lines*. Commands no longer override an `Id` property; identity moved
onto `[CommandMetadata(Id = "…", Name = "…", …)]` at the class declaration
(`CommandMetadataAttribute.cs:11-32`, consumed at `BaseCommand\`2.cs:43`). Grep the old
form across `tools/`, `core/` and `servers/` and you get nothing; grep the attribute form
and you get 478 declarations. The script therefore builds an empty dictionary, finds zero
keys with count greater than one, prints "Total violations: 0", and passes. The refactor
that made identity mandatory is the same refactor that silently disarmed the check that
made it unique — the script reads a syntax proxy rather than the fact it gates, and
its green is indistinguishable from a real green. At the re-pin the script is unchanged and
still matches nothing.

The consequence is present in the shipped tree, and it is the exact failure the technique
predicts. `tools/Azure.Mcp.Tools.Cosmos/src/Commands/CosmosListCommand.cs:15` declares
`Id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"` — a placeholder string, character for
character the same one used by the framework's own fixture at
`core/Microsoft.Mcp.Core/tests/Microsoft.Mcp.Core.Tests/Commands/BaseCommandMetadataTests.cs:19`
and asserted on at `:52`. A production command is shipping the test's dummy identity: not
a collision between two real tools, but proof that the copy-from-an-example path is live. The new
test cannot see it either: the fixture is never registered, so the placeholder is a
well-formed GUID that is unique within the population the test walks. Six further identifiers are not GUIDs at all — strings
like `a5e2f7i9-8j6h-8e0i-2g1f-3h6i7j8e9f0g`, GUID-shaped but containing `i`, `j` and `k`,
which are not hexadecimal. The attribute's doc comment says "GUID string"; the runtime `IsValid()`
(`CommandMetadataAttribute.cs:55-58`) checks only for whitespace.

Two secondary gaps in the same script, worth naming because they would survive a fix to
the regex. It scans only `tools/` — 466 of the 478 declarations — so the eleven command classes
declared under `core/` (the server's own `server start`/`info`/`tools list` surface, and
four test fixtures including the one whose placeholder GUID leaked into a production
command) and one under `servers/` (a performance-benchmark `NoOpCommand`) are outside its
population entirely. And it keys on a source-text match rather
than on the constructed command set, so an identifier produced by any means other than a
literal in a `*Command.cs` file is invisible to it.

## What the delta did (2026-09-03 to 2026-10-06)

Four events in 33 days tested the mechanism in production, more than a first reading
could. Each is checkable in the history.

- **The gate the technique prescribes arrived as a second mechanism, not as a fixed
  regex.** #3614 added
  `core/Azure.Mcp.Core/tests/Azure.Mcp.Core.Tests/Commands/CommandFactoryTests.cs:61-90`
  (`AllRegisteredCommands_HaveValidUniqueIds`). It walks the constructed
  `commandFactory.AllCommands`, asserts the population is not empty (`:76`),
  `Guid.TryParse`s each `Id`, rejects `Guid.Empty`, and fails on a duplicate. That is the
  technique's "enumerate from the constructed surface, and fail when that list is empty",
  shipped by the publisher eight days after this document recorded its absence. It covers one server's
  registered set. The `tools/Fabric.*` command classes and the `core/` fixtures stay
  outside both gates.
- **Identity was kept over format.** The same PR's log reads "Fix build, fix invalid
  CommandMetadata.Id GUIDs, add regression tests" and then "Revert GUID updates on
  existing invalid GUIDs". The six non-hexadecimal identifiers are still shipped, and the
  new test exempts them by type name (`:64-72`). The publisher chose continuity of an
  existing identity over correcting its spelling. That is the technique's rule that a
  name-only or format-only fix never moves the identifier. The changelog entry for the
  same PR (`servers/Azure.Mcp.Server/CHANGELOG.md:158`) says the six were "replaced …
  with valid GUIDs"; the code says they were not, and the code is what ships.
- **A namespace-wide rename kept every identity.** #3689 (69555a0a, 2026-09-22) renamed
  the `resilience` area to `resiliency`. That changed every wire name in the area through
  one line (`ResilienceManagementSetup.cs`, `Name => "resiliency"`). All 30 identifiers
  that survived the window are byte-identical before and after; the thirty-first belonged
  to a tool removed separately (#3790). Telemetry keyed on the identifier spans the
  rename with no backfill. Every surface keyed on the *name* broke: the changelog files
  the rename under **Breaking Changes** and tells clients to update "tool allow-lists,
  saved tool names, or namespace filters". The address/identity split did exactly what
  the technique says, and exactly no more.
- **A semantic change kept its identity, against the tree's own checklist.** #3202
  (1fa50320, 2026-09-11) made the MySQL and PostgreSQL `database query` commands
  destructive, non-idempotent and not read-only. Their old read-only claim had rested on
  a statement filter, and the filter was dropped. The names did not change. Neither did
  the identifiers: `b73afaa5-4c3f-41e8-9ef3-c54e75215a97` and
  `81a28bca-014c-4738-9e1a-654d77cb2dd8` are the same at both commits. That is the case
  `docs/tool-rename-checklist.md:23` exists for ("if the semantic meaning of the tool has
  changed materially"), and it is the case this document predicted the build could not
  catch. Any ledger keyed on the identifier carries a read-only-era history, or a
  read-only-era approval, straight across the change. The discontinuity reached consumers
  through two other channels. The annotations flipped. And in consolidated mode, where
  annotation equality forced both commands out of their read-only group into a new one,
  the change also arrived as an address change. Contrast #3818 (1121197a, 2026-10-01):
  it corrected the Communication `email send` and `sms send` commands from read-only to
  not read-only and also kept their identifiers. That one is consistent with the rule,
  because the commands' effect did not change; only a wrong declaration of it was
  corrected.

## What this realization cannot do

It cannot detect a rename. The identifier makes one *detectable in principle* — same id,
new name — but nothing in the tree consumes the pairing: there is no published
id-to-name history, no assertion that an id's name changed, no artifact a downstream
could diff. The correlation the technique promises is available to whoever operates the
telemetry backend and to nobody else in the repository. The `resiliency` rename above
is the proof: 30 identities survived it, and the only record that they did is the
absence of a diff on 30 attribute lines.

It also cannot express a semantic change to a tool whose author does not remember the
checklist. Minting a new GUID on a material behaviour change is a bullet in a markdown
file, and the build cannot tell a rewritten handler from a reformatted one. The first
reading wrote that as a prediction. #3202 is the observed instance. The new uniqueness
test can now tell an author that a pasted GUID is already in use, but only among the
commands one server registers.
