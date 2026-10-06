---
layer: application
type: application
subject: mcp-tools
technique: catalog-projection-modes
stack: dotnet
verified_on: 2026-10-06
verified_against: dotnet@10.0.401
---

# Four projections over one command tree in the Microsoft MCP monorepo

`microsoft/mcp` at commit `b7533190a98d989469dce9d61b0d4752943bceaa` is Microsoft's
official MCP server monorepo: a shared `core/Microsoft.Mcp.Core` framework, 66 tool
areas under `tools/`, three servers under `servers/`, and a distributed HTTP server
package. The stack version is witnessed by `global.json`, which pins the SDK to
`10.0.401` with `rollForward: latestFeature`; `Directory.Build.props:4` sets
`<TargetFramework>net10.0</TargetFramework>`. This is the tree the technique was
written from, and it is a good witness because it did not choose to compress — it was
forced to, and the forcing document is in the repository.

Re-pinned on 2026-10-06 from the first reading at `bc2a3b4eeceb2281cdf944920b7fdb2ccc73f5df`
(2026-09-03), 194 commits earlier. Every citation below was re-opened at the new commit.
Two of the first reading's findings stopped being true in that window because the
publisher fixed them. They are kept below as history, with the commit that closed each.

The forcing document is `servers/Azure.Mcp.Server/TROUBLESHOOTING.md:123-147`: the
editor host rejects a request carrying more than 128 tool definitions, "Combining
multiple comprehensive toolsets (like GitHub MCP 'all' + Azure MCP 'all') exceeds this
limit." The first workaround offered is host-side (custom chat modes, `:138`). The
others are the server's own: selective loading by namespace (`:149`), consolidated mode
(`:182`) and single-tool mode (`:207`). The publisher's own remedy is
`servers/Azure.Mcp.Server/CHANGELOG.md:2917`, filed under **Breaking Changes**:
"Changed the default startup mode to list tools at the namespace level instead of at an
individual level, reducing total tool count from around 128 tools to 25." A publisher
paying the full cost of breaking its consumers to shrink its own listing is the
technique's strongest evidence, and it is here as a shipped changelog entry rather than
as an argument.

## The closed set, and the fact that a mode is a composition rather than a loader

`Areas/Server/Options/ModeTypes.cs:9-36` declares four constants — `single`,
`namespace`, `all`, `consolidated` — with `Default = NamespaceProxy`, and
`ServerStartCommand.cs:217-228` refuses anything else at startup with an error that
names the whole set. The choice is made once, in `ServiceCollectionExtensions.cs:72`,
`:81`, `:132`, `:168`, before any request; nothing downstream reads
`ServerRuntimeConfiguration.Mode` to decide behaviour.

The technique says "the same command tree published at several resolutions." The tree
refines that in a way the technique does not anticipate: **a mode is not one projection,
it is a composition of several, and one process routinely publishes two resolutions at
once.** Namespace mode builds a `CompositeToolLoader` (`ServiceCollectionExtensions.cs:81-130`)
holding a `ServerToolLoader` for external proxied servers, the `NamespaceToolLoader` for
in-process areas, *and* a second `CommandFactoryToolLoader` configured with its own
runtime configuration whose `Namespace` list is the utility namespaces plus `extension`
(`:104-129`) — that is, a handful of operations published individually, at full
resolution, alongside the compressed family routers, because they must be reachable
regardless of which families were loaded. The projection is a property of a *loader*,
not of the server; the mode flag picks the mixture.

Consolidated mode makes the same point harder. It is not a fifth loader. It builds a
synthetic `CommandFactory` whose "namespaces" are the curated groups
(`ConsolidatedToolDiscoveryStrategy.CreateConsolidatedCommandFactory`, areas assembled
at `:123-129`, factory at `:153-159`) and then hands that factory to the *same*
`NamespaceToolLoader`, with the constructor's `applyFilter` argument set to `false`
(`ServiceCollectionExtensions.cs:159-163`; the parameter is declared at
`NamespaceToolLoader.cs:27-31` and used at `:40-47`). The curated cross-cutting
projection is implemented as the family projection over a fabricated family tree, which
is why it inherits routing, learn-mode and dispatch-time policy for free and why none of
that code knows it is running curated. This is the technique's "nothing downstream knows
which projection is running" achieved by construction rather than by discipline.

## The self-teaching schema, verbatim

`NamespaceToolLoader.cs:75-100` is the routing schema: `intent`, `command`, `parameters`,
`learn`, `"required": ["intent"]`, `additionalProperties: false`. Only free prose is
required; the operation name is optional. And `:195-198` is the escalation the technique
asks for, in four lines:

```
if (!learn && !string.IsNullOrEmpty(intent) && string.IsNullOrEmpty(command))
{
    learn = true;
}
```

A call that states an intent and names no operation does not error — it is silently
promoted to a sub-catalog request (`InvokeToolLearn`, `:204`). An ignorant first call is
valid by construction. The description string the router publishes (`:135-139`) then
teaches the calling convention in prose: "This tool is a hierarchical MCP command
router. To invoke a command, set `command` and wrap its args in `parameters`."

**A *wrong* name is answered differently from an *absent* one since #3630 (3e4b86ec,
2026-09-17).** Before it, an operation name that did not resolve was also promoted to
learn mode, and the model received the whole sub-catalog with every argument schema.
Now `BaseToolLoader.CreateUnknownCommandResult` (`BaseToolLoader.cs:106-131`) returns an
error naming the operations available under the current configuration, with no
descriptions and no schemas, and points at `learn=true` with an empty intent for the
full ladder. The technique's ladder is written for omissions, and the tree keeps it for
omissions. A misnamed operation gets one cheaper rung: a list of valid names. The
publisher's documentation (`servers/Azure.Mcp.Server/docs/azmcp-commands.md:106`) states
this, and adds that "An `intent` that is not blank can trigger sampling and execution
even when `learn=true`."

## Policy at the resolved operation: present in all four, fail-open in one until #3466

This was the structural fact to hunt, and the tree both confirmed the rule and, at the
first reading, refuted its own implementation of it.

Every projection filters the listing *and* re-checks at dispatch:

| projection | listing filter | dispatch re-check |
|---|---|---|
| `all` (`CommandFactoryToolLoader`) | `:59-60` | `:145-174` |
| `namespace`/`consolidated` (`NamespaceToolLoader`) | `:120-130` | `:375-407` |
| `single` (`SingleProxyToolLoader`) | `:227-237`, `:327`, `:351` | `:507-539` (in-repo), `:717-753` (proxied) |
| proxied children (`ServerToolLoader`) | `:484-485` | `:286-313` |

Both dimensions are re-evaluated — `ReadOnly` and `IsHttpMode`/`LocalRequired`. An
explicit policy denial is returned as an in-band `CallToolResult` with `IsError` and the
tool identifier in `_meta`, not as a protocol error. The listing-side rule is a
group-level *all* match (`CommandGroup.AllToolsInGroupMatch`,
`core/Microsoft.Mcp.Core/src/Commands/CommandGroup.cs:103-122`, applied at
`NamespaceToolLoader.cs:120-130`): a family is hidden only when *every* command in it is
disallowed, so a mixed family stays listed and its disallowed members are refused when
called. Since #3630 the refusal usually happens first at resolution, because the
operation is resolved against the already-filtered child list
(`NamespaceToolLoader.cs:334-351`, which returns `CreateUnknownCommandResult` with no
`_meta` tool id), with the policy re-check at `:375-407` behind it. A mixed family is
precisely the case the technique says a listing-only gate would leak, and it is the
common case, not the corner.

**A negative finding, since closed.** At `bc2a3b4` the entire enforcement block in
`SingleProxyToolLoader.cs:346-387` was nested inside `if (resolvedTool != null)` with no
`else`. An operation missing from the downstream listing skipped both checks and fell
through to `client.CallToolAsync` at `:395`. Its two siblings returned learn mode on
the same condition. #3466 (f4ee8ea9, 2026-09-11) rewrote the loader. Commands managed
in the repository now execute in-process (`LocalCommandModeAsync`, with checks at
`:507-539`). Proxied registry servers return learn mode when `resolvedTool == null`
(`:706-711`) before the checks at `:717-753`. The shape the technique warns about was
real in a shipped tree and was closed upstream within eight days of being recorded here:
under compression, a gate that runs only when the argument resolves is not a gate on the
argument.

**Two further policy defects closed in the same window, both shaped by the projection
count.** The `--tool` allow-list was matched by substring containment in both loaders that honour
it (`CommandFactoryToolLoader`, `RegistryToolLoader`), on both the listing and the
dispatch side (`tool.Contains(toolKey, …)`). Allowing
`eventgrid_subscription_list` therefore also listed and executed `subscription_list`.
#3837 (51a04b9a, 2026-10-05) changed all four sites to case-insensitive equality and
added a list-and-call test matrix. Separately, single-proxy mode did not apply the
`--namespace` filter to its learn and execute paths. #3749 (5bf6e024, 2026-09-25) added
one `IsNamespaceAllowed` predicate and applied it at every entry point; the commit log
calls the change "Consistency across tool loaders". Both defects follow from the
technique's "the same policy and the same answer" being implemented separately in each
loader, once per projection and twice per loader. The fix in both cases was to make the
comparison identical everywhere, not to add a check.

A second, subtler divergence: the proxy path decides read-only from the *published
annotation* of the downstream tool (`resolvedTool.Annotations?.ReadOnlyHint != true`,
`SingleProxyToolLoader.cs:724`, proxied path only; `ServerToolLoader.cs:286`), while the
in-process loaders read the command's own metadata (`cmd.Metadata.ReadOnly`,
`NamespaceToolLoader.cs:376`; `baseCommand.Metadata.ReadOnly`,
`SingleProxyToolLoader.cs:508`). Across a proxy boundary the gate is therefore reading
the remote's self-description. The `!= true` form is the right defensive spelling — a
missing annotation denies rather than allows — but a lying child server is trusted, and
nothing in the tree cross-checks it.

## Annotation equality as a merge precondition, and what it costs in Release

`ConsolidatedToolDiscoveryStrategy.cs:99-118` is the technique's "one honest annotation
set for all merged members" rule as code: for every command folded into a curated group,
`AreMetadataEqual` (`:199`) compares `Destructive`, `Idempotent`, `OpenWorld`,
`ReadOnly`, `Secret` and `LocalRequired`, and a mismatch produces an error message naming
both sides field by field. The refusal is at startup, where the operator can act, exactly
as prescribed. There is no union-worst-case fallback anywhere in the file.

The delta produced the case the rule exists for. #3202 (1fa50320, 2026-09-11) made the
MySQL and PostgreSQL `database query` commands destructive, non-idempotent and not
read-only. Their old read-only claim had rested on a SQL verb and keyword filter, and
that filter was dropped. They had been members of the read-only curated group
`get_azure_databases_details`. Equality forbade them from staying there, so the change
created a new group, `execute_azure_database_query`
(`servers/Azure.Mcp.Server/src/Resources/consolidated-tools.json:774`), whose metadata
is destructive and not read-only. The changelog files the move under **Breaking
Changes**. One annotation change on one operation became an address change in the
compressed projection, while the uncompressed name stayed the same. The rule did what
the technique says it should: it refused to let a read-only parent hide a destructive
child.

Then it is paid for only in developer builds. The throw at `:114` is inside `#if DEBUG`
(`:112-117`); the `#else` arm is `_logger.LogWarning(errorMessage)`. The same split
governs the completeness assertions: the check that every operation named in a group's
`mappedToolList` actually resolved is `#if DEBUG` (`:77-97`) **and** is additionally
skipped whenever `ReadOnly` is set or a `Namespace` filter is present (`:79`) — two
ordinary operator flags; and the check that every registry command was claimed by some
group is `#if DEBUG` with a `LogWarning` release arm (`:132-147`). Worst of all, a group
that matched *nothing* never reaches any assertion: `:72-75` is a bare `continue` on
`matchingCommands.Count == 0`, in every configuration, debug included. A curated workflow
can lose all of its operations and vanish from the catalog with no signal, in a
developer's own build. The technique's cautionary paragraph is not a construction; it is
a transcription of this file, and at the re-pin it still is.

One of the assertions has since been paid for outside the developer build, and the
delta shows why. #3202's own log records that marking the query commands destructive
"left them mismatched against the read-only get_azure_databases_details tool, which made
the server fail to start in consolidated mode" — in a debug build, where the throw is
live. The same PR added
`servers/Azure.Mcp.Server/tests/Azure.Mcp.Server.Tests/Infrastructure/ConsolidatedToolMetadataTests.cs`.
The test builds the real service container, walks every curated group's
`mappedToolList`, and fails on any metadata mismatch, so the equality half now gates CI
in any build configuration. It does three things less than the technique asks:

- It **skips mapped names that do not resolve** ("Definitions can include commands that
  are not registered in this server build", then `continue`). So the completeness half
  is still DEBUG-only.
- It does **not** check that every command is claimed by exactly one group.
- It **re-implements** the comparison (`MetadataMatches`) rather than calling
  `AreMetadataEqual`. The equality rule now has two copies, and a seventh axis added to
  one would not reach the other. Neither copy compares `OperationPlane`, which became a
  required field in the same month (#3614).

## The second authority, measured

`servers/Azure.Mcp.Server/src/Resources/consolidated-tools.json` is 5,574 lines of
hand-authored JSON: **161 groups** claiming **418 operations** (417 distinct), each group
carrying a name, a description, a full `toolMetadata` block with a prose justification
per axis, and a `mappedToolList`. At the first reading it was 4,933 lines, 142 groups and
386 operations. It grew by 19 groups in 33 days, through about two dozen commits. Four
measurements are worth more than the file:

- **The curated projection does not fit under the ceiling it exists to serve.** 161
  published routing tools is above 128. (This is an upper bound: a group that matches no
  live command is skipped silently, `:72-75`.) The mode that most explicitly targets the
  host limit is, at full breadth, over it. It fits only once a `Namespace` filter or the
  read-only flag trims the input (`FilterCommands`, `:164-185`), which are the same flags
  that switch off the completeness assertions. The publisher's own page still
  recommends it as "Well under VS Code's 128-tool limit" (`TROUBLESHOOTING.md:203`).
- **95 of the 161 groups map exactly one operation.** More than half of the "curated
  cross-cutting workflow bundles" compress nothing; they are a rename with a hand-written
  description attached. The mean group size is 2.6. (At the first reading, before
  f4ee8ea9, the setup built each group with its name in place of its description, so the
  hand-written descriptions were authored but never published. They are published now,
  `ConsolidatedToolDiscoveryStrategy.cs:243-246`.)
- **One operation is claimed by two groups.** `deploy_architecture_diagram_generate`
  appears in both `deploy_azure_resources_and_applications` and
  `design_azure_architecture`. The technique's second assertion is "every operation in
  the registry is claimed by exactly one group"; this file violates it, and nothing in
  the tree checks that direction — `unmatchedCommands.Remove(commandName)` (`:120`) is a
  set removal, so a second claim is a no-op rather than a collision.
- **The rate is the price.** Nineteen new groups in a month is nineteen hand-maintained
  `toolMetadata` blocks whose equality with their members is checked only in developer
  builds.

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
