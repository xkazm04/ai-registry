---
source: repository (vendor, re-scanned as a version delta)
kind: repository - vendor repository, re-read as a commit delta of a system already mined
url: https://github.com/microsoft/mcp
title: "microsoft/mcp - delta re-scan at b7533190"
author: microsoft
prior_scan: 2026-09-03 - [[2026-09-03-microsoft-mcp]]
commit: b7533190a98d989469dce9d61b0d4752943bceaa
delta: bc2a3b4e..b7533190 - 1364 files, +55676 / -9290, 34 days (33 since the mine), 194 commits, release tags 3.0.0-beta.41 to beta.50
words: changelog delta ~4,600 words read whole (11 release sections); 2 new design documents and 2 new skills skimmed; ~35 commits read at diff level; 4 workers re-opened 167 citations
method: 2.15.0, --delta under docs/upstream-brief.md, cloud dispatch (no run board, no fleet, no shared-ledger appends)
extracted: 20
accepted: 6
declined: 0
leads: 4 (all carried from the prior note; 1 updated)
already_covered: 7
untriaged: 6
citations_reopened: 167 checked / 147 re-pinned / 20 withdrawn (plus 8 corrected that were already wrong at the prior pin)
dispatched: 4 citation re-verification workers (read-only)
applied: 0 - fleet application skipped (cloud dispatch); handoff rows in the run's RESULT.md
shipped: 0
run_id: cloud-261006-acb716
siblings: n/a - cloud clone, sole writer
rescan_when: "the curated-mapping completeness assertions (every mapped name resolves, every command is claimed exactly once, no group is empty) leave DEBUG-only - the equality half already did on 2026-09-11; or a performance baseline JSON is committed under eng/ and the BaselinePath lines in eng/pipelines/templates/common.yml are uncommented; or an alias or deprecation mechanism appears for a tool name or a parameter (today none - a whole-area rename shipped without one); or the output-schema migration passes 50 commands (6 of 478 today); or 8 weeks elapse (2026-12-01)"
---

# microsoft/mcp, 33 days later — the vendor moved to the corpus on four points

## Why this ran, and which clause fired

`upstream-check.mjs --due` listed the repository on the tier 1 floor: 33 days since the
mine, 194 commits ahead. The prior `rescan_when:` was prose, so the script reported it
`undecidable`. Each clause was decided here from the tree:

| clause | fired? | evidence at `b7533190` |
| --- | --- | --- |
| output-schema migration past its five-command pilot to the whole surface | **no** | 6 production commands override `ResultTypeInfo` (5 App Configuration + `WorkspaceLogSearchCommand`), out of 478 `[CommandMetadata]` declarations. The pilot is losing ground, because new commands land unmigrated. `docs/output-schema-migration.md` is unchanged in the delta. |
| a deprecation mechanism appears | **no** | No `[Obsolete]`, alias, or deprecation path for a tool name or parameter. The window *exercised* the absence instead: #3689 renamed the whole `resilience` area to `resiliency` with no alias, and eight PRs removed unread parameters, all filed as breaking. |
| curated-mapping integrity assertions promoted out of DEBUG-only | **partly** | #3202 (2026-09-11) added `ConsolidatedToolMetadataTests`, which runs the metadata-equality assertion in CI in any build configuration. The completeness assertions in `ConsolidatedToolDiscoveryStrategy.cs:77-97, :132-147` are still `#if DEBUG`, and the new test `continue`s past unresolved names. |
| 8 weeks elapse | no | 33 days |

So the run was due on the floor, and one clause is half-true. The new condition above
splits that clause in two and adds an upstream event the delta made visible (the perf
baseline).

## Expected yield, said before the triage table

Said after the sweep and before scoring: **a high catch rate; 0-1 upper-layer landings,
because this delta's material lands on subjects that already model it and the +2 gate
rarely admits a boundary case; 2-4 application-layer landings, mostly citation repairs;
and at least one case of the vendor moving to the corpus's position.**

What landed: **0 upper-layer, 6 application-layer (4 re-pins, 2 of which withdraw a
present-tense finding; 2 new applications), 7 catches, 6 untriaged, 0 declines.** The
vendor moved to the corpus's position four times, not once. The prediction held on
shape and undercounted the corroboration. The OpenWiki law's reading, "a delta's
unique product is reversals", needs one qualifier for a vendor system already mined
once: here **every reversal was in the corpus's favour**, so the product was
corroboration written into applications, not new upper-layer content.

## The four reversals, each toward a rule this corpus already states

1. **The fail-open single-mode gate was closed** (#3466, 2026-09-11, eight days after
   the prior note recorded it). Single mode now runs the repository's own commands
   in-process, with dispatch-time checks, and the proxied path returns learn mode on an
   unresolved operation. `catalog-projection-modes` "policy is re-checked at the resolved
   operation". The application keeps the finding as history and withdraws it as current.
2. **The uniqueness gate now enumerates the constructed surface and fails when it is
   empty** (#3614, `CommandFactoryTests.cs:61-90`). `tool-identity-vs-tool-name`,
   "enumerate from the constructed surface, not from the source text". The old script
   still matches nothing. The publisher added the right gate beside it rather than fixing
   the wrong one.
3. **A verdict on every axis is now compiled in** (#3614: every `CommandMetadata`
   property is `required`, and `Unspecified` was removed). `tool-schema-design`, "an
   absent hint is not a verdict … fail to build rather than publish a default". It
   stops at the declaration: the JSON reader still defaults an unknown plane to
   `NotApplicable`.
4. **A read-only verdict that rested on a keyword filter was withdrawn** (#3202). The
   PR began by hardening the SQL blocklist and ended by deleting it, declaring the tools
   destructive, and moving authority to the database's own permissions. Annotation
   equality then forced the tools out of their read-only curated group. That is
   `tool-schema-design`'s "publish them honestly is a test", plus
   `catalog-projection-modes`'s "compression may not lie about blast radius", both
   observed working.

Two more that are not reversals but are paid-for failures in the corpus's favour:
#3837 (`--tool` allow-list matched by substring in both loaders that honour it) and
#3749 (single-proxy mode skipped the namespace filter on learn and execute). Both are
the "same policy, same answer" clause failing because the policy was re-implemented per
loader.

## Citations re-opened (brief rule 3)

Four applications cite this repository's commit. Each was re-opened line by line at
`b7533190` by a read-only worker, and the load-bearing withdrawals were re-checked by
the director by opening the tree. That check covered the single-mode resolution path,
the unknown-command result, the curated-group counts, the uniqueness test and the
`Id` values.

| application | checked | re-pinned | withdrawn | corrected at prior pin |
| --- | --- | --- | --- | --- |
| `mcp-tools/applications/dotnet--catalog-projection-modes.md` | 49 | 41 | 8 - SDK pin; the single-mode fail-open finding (4 anchors); three counts of the curated file | 2 - "~50 tool areas" (63); "every workaround is host-side" |
| `mcp-tools/applications/dotnet--tool-identity-vs-tool-name.md` | 44 | 36 | 8 - SDK pin (×2); identifier counts (×3); "nothing checks uniqueness" and "nothing parses the format" (×3) | 1 - telemetry-tag anchor was mis-cited |
| `mcp-tools/applications/dotnet--sanctioned-session-state.md` | 28 | 27 | 1 - SDK pin | 4 - source-file count, `AddReverseProxy` line, "every test uses the same display string", header-only session id |
| `test-harness/applications/dotnet--recorded-interaction-fixtures.md` | 46 | 43 | 3 - SDK pin; two `assets.json` counts | 1 - the 42 counted one file under `core/` |
| **total** | **167** | **147** | **20** | **8** |

Substantive withdrawals: two findings. The rest are a version pin that moved on its own
(`10.0.400` to `10.0.401`, #3751) and counts that grew. The distributed session package
had zero commits in the window, so every citation in that application holds at the same
line.

## Triage (v2.5 gate; scored rows only for upper-layer targets)

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|
| 1 | K | currency | S | Re-pin four applications to `b7533190` | mcp-tools, test-harness | dates-application | (currency rule) | **landed** |
| 2 | K | application | M | Catalog: withdraw single-mode fail-open; record #3466/#3837/#3749/#3630/#3202 split/new equality test | mcp-tools/catalog-projection-modes | corrects-claim | (tree opened) | **landed** |
| 3 | K | application | M | Identity: withdraw "nothing checks"; record #3614 gate, grandfathered ids, #3689 rename, #3202 kept id | mcp-tools/tool-identity-vs-tool-name | corrects-claim | (tree opened) | **landed** |
| 4 | K | application | S | Fixtures: playback stretches client timeouts (#3824) | test-harness/recorded-interaction-fixtures | dates-application | (tree opened) | **landed** (in the re-pin) |
| 5 | K | application | M | Second witness: hints corrected four times in a month | mcp-tools/tool-schema-design | fills-stack-gap | (tree opened) | **landed** `dotnet--tool-schema-design--microsoft-mcp` |
| 6 | K | application | M | A perf gate announced, never instantiated (#2510) | quality-gates/gate-liveness | fills-stack-gap (first dotnet) | (tree opened) | **landed** `dotnet--gate-liveness` |
| 7 | K | amendment | S | Playback timing has two clocks: zero the recording's, push the client's out of reach | test-harness/recorded-interaction-fixtures | new boundary | 1/0/1 | untriaged |
| 8 | K | amendment | S | "Read-only implies idempotent" holds only under the effect-only meaning of idempotent | mcp-tools/tool-schema-design | new boundary | 1/0/1 | untriaged |
| 9 | K | amendment | S | "Same policy" means one predicate shared by every loader's list and call path | mcp-tools/catalog-projection-modes | new boundary | 1/0/1 | untriaged |
| 10 | K | amendment | S | A wrong operation name is not an omission: answer with names only | mcp-tools/catalog-projection-modes | new boundary | 1/0/1 | untriaged |
| 11 | K | technique | M | Create is create-only; a flipped secure default applies on create, and an omitted option on update means preserve | mcp-tools (contested with `write-freshness-gate`'s write preconditions) | new-technique | 2/1/2 | untriaged |
| 12 | K | amendment | M | A delegated credential sent to a data-supplied host: bind the host to the credential's audience, check before token acquisition | browser-credential-boundary/outbound-fetch-destination-validation (contested with mcp-tools/authentication-and-scoping) | new boundary | 2/1/2 | untriaged |
| 13 | K | technique | S | Identity kept across a semantic change (#3202) | mcp-tools/tool-identity-vs-tool-name | none | - | already covered |
| 14 | K | - | S | npm wrapper wrote to stdout under stdio (#3184) | mcp-tools/transport-selection ("the output channel is sacred") | none | - | already covered |
| 15 | K | - | S | Truncated listing reported as success (#3840) | law failure-not-empty-success; tool-schema-design | none | - | already covered |
| 16 | K | - | S | Required verdicts (#3614) | tool-schema-design | none | - | already covered (written into row 5) |
| 17 | K | - | S | Write annotated read-only, shipped (#3818) | tool-schema-design | none | - | already covered (written into row 5) |
| 18 | K | - | S | Gate step absent unless a parameter is passed (#2510) | quality-gates/gate-liveness | none | - | already covered (written into row 6) |
| 19 | K | - | S | CLI option types diverged from `inputSchema` (#3772) | tool-schema-design ("assert on the listing a real client receives") | none | - | already covered (written into row 5) |
| 20 | K | lead | S | Nested-inference repair now validated against the catalog and documented | prior lead | - | - | lead updated |

`auto=0/6/0`, `fp=0`. Every admitted row ran under the corroboration table's
application or currency rule, which a tree read authorizes. Rows 7-12 were scored and
none reached +2. Rows 7-10 are true boundary cases with GAIN 1. Rows 11 and 12 carry
GAIN 2 but a contested home. Each is banked below with its anchors, so the next run can
re-score it for the price of one read.

## Untriaged, with anchors (unverified judgments; nobody declined these)

- **7. Two clocks in playback.** `core/Microsoft.Mcp.Core/src/Services/Http/HttpClientFactoryConfigurator.cs:47-53`
  and `core/Azure.Mcp.Core/src/Services/Azure/Helpers/AzureHelper.cs:192-199` (#3824):
  "The default timeout is not long enough to eliminate the possibility of retried
  requests. When that happens, the playback system returns an error due to request
  mismatch". The technique zeroes waits the recording carries. Nothing yet says that a
  client timeout which fires during playback sends a request the recording lacks. To
  promote: a second tree, or a measurement of a flake that disappears when the timeout is
  stretched.
- **8. The idempotent axis has two meanings.** `servers/Azure.Mcp.Server/docs/new-command.md:880`
  ("may produce different results or side effects"). A mechanical scan finds 10
  read-only, non-idempotent commands at `bc2a3b4` and 9 at `b7533190`. Two of the ten were
  the real mis-annotation #3818 fixed (`SmsSendCommand.cs`, `EmailSendCommand.cs`). The
  other nine are reads whose output varies. The technique's cross-axis rule would have
  caught #3818 at build time, and would also fire on honest reads under this vocabulary.
- **9. One predicate per policy.** #3837 (`CommandFactoryToolLoader.cs`, `RegistryToolLoader.cs`:
  `tool.Contains(toolKey, …)` to `string.Equals`, list and call) and #3749 ("Consistency
  across tool loaders", `SingleProxyToolLoader.IsNamespaceAllowed`).
- **10. A wrong name gets names only.** `BaseToolLoader.cs:106-131` `CreateUnknownCommandResult`;
  `servers/Azure.Mcp.Server/docs/azmcp-commands.md:106`. The same doc line adds "An
  `intent` that is not blank can trigger sampling and execution even when `learn=true`."
  So a learn request can execute, and that half deserves its own look.
- **11. Create-only, secure-on-create, preserve-on-omit.** #3800 (`VaultCreateCommand`
  rejects an existing vault: "Use azurebackup_vault_update to modify existing vaults.
  Creation also requires permission to read the target vault"), and #3755, #3758, #3759,
  #3761 (defaults flipped to the secure value on create, with "omitted security settings
  preserve existing … during updates"). For a model caller that cannot know whether a name
  exists, an upserting create turns a name collision into a mutation of someone else's
  resource. That cost is invisible in the annotations, because both verbs are already
  destructive. Home contested with `write-freshness-gate` ("deciding whether a write tool
  needs a precondition").
- **12. The credential's audience fixes the host family.**
  `core/Microsoft.Mcp.Core/src/Helpers/EndpointValidator.cs:130` (`ValidateAzureServiceEndpoint`),
  `EndpointValidator.AllowLists.cs:158-161` (per-cloud suffixes, for example
  `.vault.azure.net` / `.vault.azure.cn` / `.vault.usgovcloudapi.net`), and the operator-only escape hatch
  `SetDangerouslyDisabledSsrfProtectionNamespaces` (`:63`), which tool code is forbidden
  to touch (`.github/skills/harden-tool-url-inputs/SKILL.md:119`). Changelog: "Validated
  PostgreSQL server inputs against the configured Azure cloud before acquiring credentials
  or opening database connections" (#3740). The corpus says a data-supplied destination
  carries no credential of yours, so a feature needing one has a fixed upstream. Here
  the credential is the user's delegated token, and the upstream is a per-tenant host
  family. Five PRs and a new skill landed in the window (#3603, #3694, #3731, #3740,
  #3820). Training-data convergence exists: client libraries that check an
  authentication challenge's resource against the destination domain before sending a
  token. **Highest-value row of the run.** Suggested next step: a scoped `/deepen` on
  `browser-credential-boundary` (attention scan rank 12) with this row as its brief.

## Already covered (catches, verified by reading)

Rows 13-19 above. Row 13 is the instructive one. #3202 kept both identifiers
(`b73afaa5-…`, `81a28bca-…`) across a change from read-only to destructive. The tree's
own `docs/tool-rename-checklist.md:23` and the technique both say a semantic change
mints a new identifier, and the prior application wrote, "It also cannot express a
semantic change to a tool whose author does not remember the checklist". The delta
delivered that predicted event. It corroborates the technique and refutes nothing.

## Leads (carried; return conditions re-checked)

- **Signing inside a container format.** Not re-evaluated; no packaging-signing change was
  read in the delta. Return condition unchanged.
- **A cacheable catalog listing bets on the listing never varying by caller.** No
  caller-scoped listing appeared: namespace and tool filters are still per process
  (#3749 made them consistent, not per caller), and no `Cache-Control` is set in `core/`.
  Return condition unchanged.
- **Argument repaired by a nested inference.** *Updated.* The repair is now documented
  publicly (`azmcp-commands.md:106`: "the router can make one correction attempt using
  the supplied `intent` when the MCP client supports sampling"). The sampled name is now
  validated against the available catalog before dispatch (`BaseToolLoader.ResolveSampledCommandName`,
  `:96-104`). Still one sighting from one source; the return condition (a second sighting)
  stands.
- **The retired primitive left a hole.** The correction above still depends on the
  client's sampling capability, and the delta names no successor. Return condition
  unchanged.

## Prior untriaged rows whose upstream state moved (none landed by this run)

- "`ServerToolLoader` and `NamespaceToolLoader` are a live migration with the old
  process-spawning path still shipping": partly resolved upstream. #3466 stopped single
  mode spawning child processes for commands the repository manages.
- "`--tool` silently rewrites `--mode`": unchanged (`ServerStartCommand.cs:78-81`). The
  adjacent `--tool` matching was fixed (#3837).
- "`RegistryToolLoader` skips all initialization when the test proxy is set": unchanged
  (`RegistryToolLoader.cs:223-231`).
- "`IsMcpEndpointRequest` decides eviction by substring-matching a display string":
  unchanged (the package had no commits).
- The other seven were not re-checked.

## Swept, in reversal order

1. Changed operating documents: `docs/design/operation-plane-metadata.md` (new),
   `docs/design/log-analytics-basic-auxiliary-search.md` (new),
   `.github/skills/harden-tool-url-inputs/SKILL.md` (new), `new-command.md`,
   `azmcp-commands.md` (the routing-correction paragraph), `Authentication.md`
   (pipeline credential only, #3388).
2. The changelog's Fixed and Breaking lists for 3.0.0-beta.41 through beta.50, read
   whole. Rows 2-6 and 7-12 came from here.
3. Every file the prior applications cite by line (four workers).
4. Everything else last. The README diff (+146) is prompts and capability tables, and
   nothing was mined from it.

## Method notes for the lane

- `upstream-check.mjs` fires on **any** GitHub release published after the mine. This
  repository tags a release about twice a week (`Azure.Mcp.Server-3.0.0-beta.45` …
  `beta.50` inside the window). If those tags carry release objects, the mechanical
  clause fires on every sweep and stops discriminating. The 2026-09-23 row reported
  `undecidable`, which suggests they do not today. The new condition above therefore
  names no release and relies on upstream events plus a date.
- A delta's withdrawals are dominated by things nobody asserted on purpose: an SDK pin
  that moved by a patch and counts that grew. Of 20 withdrawals, 2 were findings.
