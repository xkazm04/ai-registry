---
layer: application
type: application
subject: mcp-tools
technique: catalog-projection-modes
stack: dotnet
verified_on: 2026-09-03
verified_against: dotnet@10.0.400
---

# Four projections over one command tree in the Microsoft MCP monorepo

`microsoft/mcp` at commit `bc2a3b4eeceb2281cdf944920b7fdb2ccc73f5df` is Microsoft's
official MCP server monorepo: a shared `core/Microsoft.Mcp.Core` framework, ~50 tool
areas under `tools/`, three servers under `servers/`, and a distributed HTTP server
package. The stack version is witnessed by `global.json`, which pins the SDK to
`10.0.400` with `rollForward: latestFeature`; `Directory.Build.props:4` sets
`<TargetFramework>net10.0</TargetFramework>`. This is the tree the technique was
written from, and it is a good witness because it did not choose to compress — it was
forced to, and the forcing document is in the repository.

The forcing document is `servers/Azure.Mcp.Server/TROUBLESHOOTING.md:123-147`: the
editor host rejects a request carrying more than 128 tool definitions, "Combining
multiple comprehensive toolsets (like GitHub MCP 'all' + Azure MCP 'all') exceeds this
limit," and every workaround offered is host-side (custom chat modes, the tool picker).
The publisher's own remedy is `CHANGELOG.md:2686`, filed under **Breaking Changes**:
"Changed the default startup mode to list tools at the namespace level instead of at an
individual level, reducing total tool count from around 128 tools to 25." A publisher
paying the full cost of breaking its consumers to shrink its own listing is the
technique's strongest evidence, and it is here as a shipped changelog entry rather than
as an argument.

## The closed set, and the fact that a mode is a composition rather than a loader

`Areas/Server/Options/ModeTypes.cs:9-36` declares four constants — `single`,
`namespace`, `all`, `consolidated` — with `Default = NamespaceProxy`, and
`ServerStartCommand.cs:205-215` refuses anything else at startup with an error that
names the whole set. The choice is made once, in `ServiceCollectionExtensions.cs:72`,
`:92`, `:143`, `:188`, before any request; nothing downstream reads
`ServerRuntimeConfiguration.Mode` to decide behaviour.

The technique says "the same command tree published at several resolutions." The tree
refines that in a way the technique does not anticipate: **a mode is not one projection,
it is a composition of several, and one process routinely publishes two resolutions at
once.** Namespace mode builds a `CompositeToolLoader` (`ServiceCollectionExtensions.cs:92-141`)
holding a `ServerToolLoader` for external proxied servers, the `NamespaceToolLoader` for
in-process areas, *and* a second `CommandFactoryToolLoader` configured with its own
runtime configuration whose `Namespace` list is the utility namespaces plus `extension`
(`:115-140`) — that is, a handful of operations published individually, at full
resolution, alongside the compressed family routers, because they must be reachable
regardless of which families were loaded. The projection is a property of a *loader*,
not of the server; the mode flag picks the mixture.

Consolidated mode makes the same point harder. It is not a fifth loader. It builds a
synthetic `CommandFactory` whose "namespaces" are the curated groups
(`ConsolidatedToolDiscoveryStrategy.CreateConsolidatedCommandFactory`, areas assembled
at `:128-134`, factory at `:158-164`) and then hands that factory to the *same*
`NamespaceToolLoader`, with the constructor's `applyFilter` argument set to `false`
(`ServiceCollectionExtensions.cs:179-183`; the parameter is declared at
`NamespaceToolLoader.cs:29-33` and used at `:41-45`). The curated cross-cutting
projection is implemented as the family projection over a fabricated family tree, which
is why it inherits routing, learn-mode and dispatch-time policy for free and why none of
that code knows it is running curated. This is the technique's "nothing downstream knows
which projection is running" achieved by construction rather than by discipline.

## The self-teaching schema, verbatim

`NamespaceToolLoader.cs:77-102` is the routing schema: `intent`, `command`, `parameters`,
`learn`, `"required": ["intent"]`, `additionalProperties: false`. Only free prose is
required; the operation name is optional. And `:219-222` is the escalation the technique
asks for, in four lines:

```
if (!learn && !string.IsNullOrEmpty(intent) && string.IsNullOrEmpty(command))
{
    learn = true;
}
```

A call that states an intent and names no operation does not error — it is silently
promoted to a sub-catalog request (`InvokeToolLearn`, `:230`). An ignorant first call is
valid by construction. The description string the router publishes (`:137-142`) then
teaches the calling convention in prose: "This tool is a hierarchical MCP command
router… To invoke a command, set `command` and wrap its args in `parameters`."

## Policy at the resolved operation: present in all four, fail-open in exactly one

This was the structural fact to hunt, and the tree both confirms the rule and refutes its
own implementation of it.

Every projection filters the listing *and* re-checks at dispatch:

| projection | listing filter | dispatch re-check |
|---|---|---|
| `all` (`CommandFactoryToolLoader`) | `:59-60` | `:137-166` |
| `namespace`/`consolidated` (`NamespaceToolLoader`) | `:122-132` | `:381-413` |
| `single` (`SingleProxyToolLoader`) | `:250-251` | `:346-387` |
| proxied children (`ServerToolLoader`) | `:470-471` | `:286-313` |

Both dimensions are re-evaluated — `ReadOnly` and `IsHttpMode`/`LocalRequired` — and the
denial is returned as an in-band `CallToolResult` with `IsError` and the tool identifier
in `_meta`, not as a protocol error. The listing-side rule is a group-level *all* match
(`AllToolsInGroupMatch`, `NamespaceToolLoader.cs:122-132`): a family is hidden only when
*every* command in it is disallowed, so a mixed family stays listed and its disallowed
members are refused at dispatch. That is precisely the case the technique says a
listing-only gate would leak, and it is the common case, not the corner.

**The negative finding.** In `SingleProxyToolLoader.cs:346-387` the entire enforcement
block is nested inside `if (resolvedTool != null)` (`:351`) with no `else`. If the
resolved operation cannot be found in the downstream listing, both checks are skipped and
control falls through to `client.CallToolAsync(command, parameters, …)` at `:395`.
Its two siblings do not do this: `ServerToolLoader.cs:276-280` returns learn mode when
`resolvedTool == null`, with the comment "Sampling resolved to a command that doesn't
exist at all," and `NamespaceToolLoader.cs:373-377` logs an error and returns learn mode
on the same condition. So the in-process rewrite of the older out-of-process loader kept
the two checks and dropped the closed branch that guards them. The blast radius is narrow
— an unresolvable name usually fails downstream anyway — but the shape is the one the
technique warns about: under compression the operation arrives as an argument, and a gate
that only runs when the argument resolves is not a gate on the argument.

A second, subtler divergence: the two proxy loaders decide read-only from the
*published annotation* of the downstream tool (`resolvedTool.ProtocolTool.Annotations?.ReadOnlyHint != true`,
`SingleProxyToolLoader.cs:357`; `ServerToolLoader.cs:286`), while the in-process loaders
read the command's own metadata (`cmd.Metadata.ReadOnly`, `NamespaceToolLoader.cs:381`).
Across a proxy boundary the gate is therefore reading the remote's self-description. The
`!= true` form is the right defensive spelling — a missing annotation denies rather than
allows — but a lying child server is trusted, and nothing in the tree cross-checks it.

## Annotation equality as a merge precondition, and what it costs in Release

`ConsolidatedToolDiscoveryStrategy.cs:104-123` is the technique's "one honest annotation
set for all merged members" rule as code: for every command folded into a curated group,
`AreMetadataEqual` (`:204`) compares `Destructive`, `Idempotent`, `OpenWorld`,
`ReadOnly`, `Secret` and `LocalRequired`, and a mismatch produces an error message naming
both sides field by field. The refusal is at startup, where the operator can act, exactly
as prescribed. There is no union-worst-case fallback anywhere in the file.

Then it is paid for only in developer builds. The throw at `:119` is inside `#if DEBUG`
(`:117-122`); the `#else` arm is `_logger.LogWarning(errorMessage)`. The same split
governs the completeness assertions: the check that every operation named in a group's
`mappedToolList` actually resolved is `#if DEBUG` (`:82-102`) **and** is additionally
skipped whenever `ReadOnly` is set or a `Namespace` filter is present (`:84`) — two
ordinary operator flags; and the check that every registry command was claimed by some
group is `#if DEBUG` with a `LogWarning` release arm (`:137-152`). Worst of all, a group
that matched *nothing* never reaches any assertion: `:77-80` is a bare `continue` on
`matchingCommands.Count == 0`, in every configuration, debug included. A curated workflow
can lose all of its operations and vanish from the catalog with no signal, in a
developer's own build. The technique's cautionary paragraph is not a construction; it is
a transcription of this file.

## The second authority, measured

`servers/Azure.Mcp.Server/src/Resources/consolidated-tools.json` is 4,933 lines of
hand-authored JSON: **142 groups** claiming **386 operations**, each group carrying a
name, a description, a full `toolMetadata` block with a prose justification per axis, and
a `mappedToolList`. Three measurements are worth more than the file:

- **The curated projection does not fit under the ceiling it exists to serve.** 142
  published routing tools is above 128. The mode that most explicitly targets the host
  limit is, at full breadth, over it — it only fits once a `Namespace` filter or the
  read-only flag trims the input (`FilterCommands`, `:169-190`), which are the same flags
  that switch off the completeness assertions.
- **82 of the 142 groups map exactly one operation.** More than half of the "curated
  cross-cutting workflow bundles" compress nothing; they are a rename with a hand-written
  description attached. The mean group size is 2.7.
- **One operation is claimed by two groups.** `deploy_architecture_diagram_generate`
  appears in both `deploy_azure_resources_and_applications` and
  `design_azure_architecture`. The technique's second assertion is "every operation in
  the registry is claimed by exactly one group"; this file violates it, and nothing in
  the tree checks that direction — `unmatchedCommands.Remove(commandName)` (`:125`) is a
  set removal, so a second claim is a no-op rather than a collision.

The maintenance procedure for the second authority is `docs/tool-rename-checklist.md`,
which instructs a renamer to "Update `core/Microsoft.Mcp.Core/src/Areas/Server/Resources/consolidated-tools.json`
— if the renamed tool appears in any `mappedToolList` array, replace the old tool name."
**That path does not exist in this tree.** The only `consolidated-tools.json` is under
`servers/Azure.Mcp.Server/src/Resources/`. The written procedure for keeping the parallel
list honest points at a file the renamer will not find, which is what an unpaid second
authority looks like from the documentation side.

## What this realization cannot do

It cannot tell an operator what the projection cost them. Nothing emits the derivation
the technique asks for — the number 25 appears in a changelog sentence and the number 128
in a troubleshooting page, and no artifact ties them together or recomputes either when
areas are added. It cannot detect an operation claimed twice, or a group that compresses
nothing, or a curated group whose members all disappeared, in any configuration a user
runs. And it cannot make consent honest at the host: the annotation the host sorts on is
the group's hand-written `toolMetadata`, correct by construction only for merges that
passed a check which, in the shipped artifact, is a log line.
