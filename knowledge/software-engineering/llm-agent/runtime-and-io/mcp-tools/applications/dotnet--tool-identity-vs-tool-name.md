---
layer: application
type: application
subject: mcp-tools
technique: tool-identity-vs-tool-name
stack: dotnet
verified_on: 2026-09-03
verified_against: dotnet@10.0.400
---

# `MicrosoftMcpToolId` — a rename-stable identity whose uniqueness gate greps for syntax the tree no longer uses

`microsoft/mcp` at commit `bc2a3b4eeceb2281cdf944920b7fdb2ccc73f5df` — Microsoft's
official MCP server monorepo, a shared `core/Microsoft.Mcp.Core` framework over ~50 tool
areas in `tools/` and three servers in `servers/`. The stack version is witnessed by
`global.json`, which pins the SDK to `10.0.400` with `rollForward: latestFeature`
(`Directory.Build.props:4` sets `net10.0`). The tree publishes 443 distinct tool
identifiers across 444 command classes, which makes it a good place to ask whether the
mechanism's guarantees survive contact with that many authors.

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

- **Definition**: `:282` seeds the published tool's `_meta` with
  `[new(McpHelper.ToolIdMetaKey, command.Id)]`, beside the annotation block built at
  `:275-280` and the optional `SecretHint`/`LocalRequiredHint` keys (`:283-292`).
- **Result**: `:240` returns `McpHelper.InjectToolIdMetadata(callToolResult, command.Id)`
  on the success path, and the *refusal* paths carry it too — `:148` (read-only denial),
  `:164` (HTTP-mode denial), `:213`. A denied call is still attributable to the tool that
  was denied, which is the case a name-keyed consent ledger most needs and most often
  loses.

The identifier is also the telemetry key: `:230-232` sets `TagName.ToolId` alongside
`ToolSource = "internal"` and the annotation summary, and the proxy loaders re-read it
off the child's `_meta` to tag their own spans (`ServerToolLoader.cs:282`,
`SingleProxyToolLoader.cs:353`, `RegistryToolLoader.cs:143`). So the rename-stable string
really is what the traces are keyed on, not merely something published beside them.

## The boundary holds: possession addresses nothing

This was one of the facts to hunt — can a caller invoke by identifier? **No, and the
reason is structural rather than defensive.** `GetToolIdFromMeta` has exactly four
non-test callers in the whole tree (`ServerToolLoader.cs:282`,
`SingleProxyToolLoader.cs:353`, `RegistryToolLoader.cs:143`, and the helper itself), and
every one of them is on the *outbound* path: reading an id off a definition the server
just produced, in order to re-attach it to a span or a result. Nothing reads an
identifier off an inbound request. Dispatch is by name throughout — a dictionary keyed on
tool name in `CommandFactoryToolLoader.cs:33`, `namespaceCommands.TryGetValue(command, …)`
in `NamespaceToolLoader.cs:373`, `ProtocolTool.Name` comparison in the proxy loaders. A
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

## The structural fact: the uniqueness gate matches nothing

The technique says uniqueness must be a build failure, not a review question, because
duplicates arrive the ordinary way — a command copied as a starting point for a new one.
This tree has the gate, wires it into two entry points, and it is a no-op.

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
and you get 444 declarations. The script therefore builds an empty dictionary, finds zero
keys with count greater than one, prints "Total violations: 0", and passes. The refactor
that made identity mandatory is the same refactor that silently disarmed the check that
made it unique — the gate is reading a syntax proxy rather than the fact it gates, and
its green is indistinguishable from a real green.

The consequence is present in the shipped tree, and it is the exact failure the technique
predicts. `tools/Azure.Mcp.Tools.Cosmos/src/Commands/CosmosListCommand.cs:15` declares
`Id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"` — a placeholder string, character for
character the same one used by the framework's own fixture at
`core/Microsoft.Mcp.Core/tests/Microsoft.Mcp.Core.Tests/Commands/BaseCommandMetadataTests.cs:19`
and asserted on at `:51`. A production command is shipping the test's dummy identity: not
a collision between two real tools, but proof that the copy-from-an-example path is live
and that nothing on it checks. Six further identifiers are not GUIDs at all — strings
like `a5e2f7i9-8j6h-8e0i-2g1f-3h6i7j8e9f0g`, GUID-shaped but containing `i`, `j` and `k`,
which are not hexadecimal. The attribute's doc comment says "GUID string"; nothing parses
it as one, so the format is a comment.

Two secondary gaps in the same script, worth naming because they would survive a fix to
the regex. It scans only `tools/` — 434 of the 444 declarations — so the ten command classes
declared under `core/` (the server's own `server start` surface, and the test fixture
whose placeholder GUID leaked into a production command) are outside its population
entirely. And it keys on a source-text match rather
than on the constructed command set, so an identifier produced by any means other than a
literal in a `*Command.cs` file is invisible to it.

## What this realization cannot do

It cannot detect a rename. The identifier makes one *detectable in principle* — same id,
new name — but nothing in the tree consumes the pairing: there is no published
id-to-name history, no assertion that an id's name changed, no artifact a downstream
could diff. The correlation the technique promises is available to whoever operates the
telemetry backend and to nobody else in the repository.

It also cannot express a semantic change to a tool whose author does not remember the
checklist. Minting a new GUID on a material behaviour change is a bullet in a markdown
file; the build cannot tell a rewritten handler from a reformatted one, and — while
`Test-ToolId.ps1` matches nothing — it could not even tell the author that the GUID they
pasted was already in use.
