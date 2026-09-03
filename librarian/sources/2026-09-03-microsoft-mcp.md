---
source: github:microsoft/mcp
kind: repository - vendor repository read as a SYSTEM (a company's official catalog of MCP server implementations: one shared framework, ~50 tool areas, three servers, and a distributed HTTP-server package; the landing page is a catalog advertisement and contributed nothing)
url: https://github.com/microsoft/mcp
title: "microsoft/mcp - Catalog of official Microsoft MCP server implementations"
author: microsoft
commit: bc2a3b4eeceb2281cdf944920b7fdb2ccc73f5df
words: 2,340 landing / 374,116 in-tree markdown over 5,354 files; ~57,000 words read whole across three readers, ~47,000 skimmed structurally, plus ~4,000 lines of C# opened
method: 2.2.0 (round 5 of the 2.x series; every worker Opus, the director Opus)
extracted: 49 (26 design entries + 23 claim candidates)
accepted: 12
declined: 0
leads: 4
already_covered: 5
untriaged: 11
dispatched: 7 (3 design readers, 4 writers) + 3 recovery/apply workers
applied: see librarian/applied.md
shipped: 1 branch in a fleet project
routing_count: whole-tree 15 NONE; per system A5 / B4 / C6 - every system clears three, and EVERY cluster's home is an EXISTING subject (mcp-tools alone absorbs 9 entries), so both v2.2 clauses resolve to technique-grain landings
handoff: NONE - the first 2.x round where the count is met and the answer is not a forge. The corpus already owns this source's subject.
directions: 1 peer study (pumper) + 1 proposal, capped at one per project by the round-5 focus / see "Directions not proposed"
run_id: intake-msmcp-0903
siblings: 5 live at claim (vllm, voicebox, rusttrain, awesome-langchain, and this run); rusttrain holds test-harness and quality-gates, both of which this run also wrote into - see "Contention"
rescan_when: "the output-schema migration moves past its five-command pilot to the whole surface; or a deprecation mechanism appears (today there is provably none); or the curated-mapping integrity assertions are promoted out of DEBUG-only; or 8 weeks elapse"
---

# microsoft/mcp - the corpus's own subject, read as a system (round 5)

**Class read at Phase 2:** vendor repository. The tell was structural rather than
promotional - a `core/` framework carrying the mechanism, ~50 `tools/` areas carrying
almost none of it, and a landing page that is a catalog of servers. Expected yield for
the class: high design, low claim. That held exactly - 26 design entries against 23
claims, and the claims were mostly evidence for the design entries rather than findings
of their own.

**The routing decision, and why it is the round's method finding.** Both v2.2 clauses
fired and both resolved *away* from a forge. Per-system `corpus: NONE` came in at 5 / 4 / 6,
every system clearing three; the whole-tree count was 15. Under a naive reading that is a
forge handoff twice over. But the HOME-IF-NEW clause is counted against *existing* homes,
and nine of the fifteen home into `mcp-tools` - a subject this corpus forged on
2026-08-18 and has been deepening since. The remainder scatter across five more existing
subjects. So the count says "technique triples inside existing subjects", which is what
v2.2's own sentence prescribes and what this run did.

That is worth stating plainly because rounds 1-4 all handed off: **the routing count is
not a proxy for "needs a forge". A high count over ground the corpus already owns is a
sign the corpus was right about where this material lives.** No mid-run rule was needed
to reach that; the method text already carried it.

## What landed

**Four new techniques.**

- `mcp-tools/catalog-projection-modes` - the mechanism the subject was missing. One
  widely deployed host refuses any request carrying more than 128 tools *summed across
  every installed server*, so a publisher's catalog budget is shared with servers it has
  never heard of. The source answers with four projections of one command tree chosen at
  startup, and flipped its own default from ~128 tools to 25 as a documented breaking
  change. Carries the annotation-equality invariant that keeps compression honest, the
  re-check at the resolved operation (`gate-sees-target`), and the priced cost of the
  hand-maintained second authority.
- `mcp-tools/tool-identity-vs-tool-name` - the address a model calls is not the identity
  an operator correlates. A rename-stable identifier on the wire, the rule for when it
  may change, and why possession of one authorizes nothing.
- `mcp-tools/sanctioned-session-state` - the case the golden path asserts away. Opt-in
  twice, argue against yourself in your own documentation, degrade to nothing at one
  replica, and regenerate the owner identity per process so a restart is *detectable*
  rather than silently wrong - a deliberate, argued inversion of `identity-survives-reuse`.
- `test-harness/recorded-interaction-fixtures` - a hole, not a seam. A counted grep
  returns **zero** files anywhere under `knowledge/` for test proxies, record/playback,
  cassettes or sanitizers-at-rest, against a subject already carrying eleven techniques.
  The seam belongs in the production transport (so correct dependency injection becomes
  the precondition for recordability), the sanitizer/matcher pair is a fidelity dial whose
  two halves pull opposite ways, and the freshness debt is the corpus's own vicious-green
  failure in a form it did not cover.

**Seven amendments**, each a boundary case its file's own rule did not reach:
`tool-schema-design` twice (every declared argument is a promise the handler must keep -
the schema-vs-handler-use authority no schema/validator unification can detect, priced at
~50 breaking-change PRs to retire; and conditional requiredness as the one constraint that
leaves the schema), `client-integration` (the server's half of the elicitation contract -
the envelope is not the decision), `cross-boundary-propagation` (when the sender is not
yours), `deprecation-by-version-arithmetic` twice (when declining the window is correct,
with its conditions and its bill; and where the list of known consumers lives - an
executable pin, not a prose freeze-list), `gate-laddering` (the runtime rung, whose
severity splits by *audience* rather than by stage), and `same-change-enforcement`
(make the document derived and assert regeneration is a no-op - the strictly better case
its autopsy never names).

**One instrument.** `scripts/surface-snapshot.mjs` - the registry publishes surfaces and
had no artifact capturing "the published surface as of this commit" for diffing. Verified
by the director, not by its author's report: 8 bundles / 377 subjects / 2,489 techniques,
exit 0 on self-diff, exit 1 on a synthetic change, exit 2 when the snapshot is missing,
and a rename correctly classified as a rename rather than a break.

## The two findings that came from being contradicted

**1. The corpus was arguing from an unbounded world.** `tool-schema-design` says "One
tool, one operation. A `manage_events` tool with an `action` argument hides the real
operations from the selection step." That is correct, and it is reached in a world with no
ceiling on catalog size. `server-composition` mentions catalog inflation only as a
selection-*quality* caution. This source ships collapse-per-service as its **default**
under a hard, external, shared platform limit. The discriminator - is the budget yours? -
is what the new technique carries, and neither existing file could have stated it.

**2. A tree refuted the amendment it was being used to test, and improved it.** The
`cross-boundary-propagation` amendment says a propagation field with no schema and no
bound cannot cross a trust boundary - "only fields with a grammar can cross". Applied to
the fleet's own observability service, that rule would have broken a legitimate feature:
`normalize_trace_ref` deliberately passes opaque ids (`"req-1"`) through verbatim, and a
commit from this same morning *pinned* that behaviour with tests. The correct reading is
that grammar-validation and bounding are **separable**, and for an *identity* field the
bound is the load-bearing half while the grammar is not. Recorded here because it is the
kind of correction only a real tree produces.

## Contention (5 siblings live)

`rusttrain` holds `test-harness` and `quality-gates`; this run wrote into both. For
`test-harness` the golden path was genuinely contended - the sibling had already declared
two techniques there - so the edit was made under the `content` lock with the file
**re-read inside the lock**, and only this run's own line appended. That is the append
that would otherwise have silently deleted two of the sibling's declarations. For
`quality-gates` only a technique file was amended, which changes no shared list.

The gate finished red on 28 problems, **none of them in any subject this run touched** -
all in two siblings' untracked, in-flight subjects (`invariant-placement`,
`generator-uncertainty-scoring`). Reported, not repaired: they are the owning runs' to fix.
`index.json` and `catalog.json` were regenerated under the `index` lock and deliberately
**left uncommitted**, because a regeneration in a shared checkout absorbs siblings'
uncommitted content and committing it would bake their WIP into a hash under this run's
name.

## Catches (verified by reading, not by slug)

- **The AOT trimmed-publish acceptance app** - a whole console program exists so a trimmed
  publish can be *executed* rather than merely compiled. `out-of-graph-artifacts` already
  owns this ("Compiling is not exercising"), states the economics, and names the symptom
  class. The source adds one instance and a fixture-cost inversion; that is application
  material at most.
- **MCPB signing via a generic detached operation** - `signing-and-trust` and
  `detached-signatures-and-key-identity` cover the chokepoint, the managed key service and
  verification-without-the-key better than this tree does, and the tree never says which
  key its verifier trusts. Only the narrow mechanism (reserve the container's trailer to a
  fixed size *before* signing, because the signature's length is unknown until after)
  is uncovered - banked as a lead.
- **Per-PR changelog files with a closed section enum** - `changelog-generation` already
  has the closed vocabulary, the unmissable breaking marker and the regeneration warning.
  The source even credits the prior art itself.
- **Transport-blind handlers** - `transport-selection` owns the boundary; the authoring
  rule that follows is a sentence, not a technique.
- **The source's own tool-description evaluator** - it embeds tool descriptions and test
  prompts and scores whether the right tool ranks top-3 at >=0.4 confidence, and the
  authoring skill presents it as a **GATE**. It prints a failure marker and does not set
  the error flag, unlike the two checks immediately below it. So it is a
  `severity-by-construction` / `vacuous-by-evaluation` specimen, not an instrument to
  copy - the corpus reads this tree better than the tree reads itself.

## Leads (with return conditions)

- **Signing inside a container format.** Reserve the trailer, pad the signature. Return
  when a second artifact format forces the same pre-modification, or when
  `signed-artifacts` next takes a wave.
- **A catalog listing marked publicly cacheable is a bet on the listing never varying by
  caller.** True in this tree today (the projection is process-global) and false the
  moment any entitlement filtering lands, at which point the cache scope becomes a
  cross-tenant catalog leak. Return when a listing filtered by caller scope appears
  anywhere.
- **Argument repaired by a nested inference.** On an unknown operation name the router
  asks the caller's own model to re-resolve it from intent, and executes what comes back -
  the gates run after resolution, which is what makes it safe. The corpus has no
  vocabulary for "an executed operation that is a function of a second, unlogged
  inference". Return on a second sighting.
- **The retired primitive left a hole.** The golden path records that borrowing the
  client's model is deprecated and states it as settled. This tree agrees in code -
  every such call sits behind a compatibility pragma and a capability check - and still
  uses it, because nothing replaced it for the one job it was load-bearing for. Return
  when the successor mechanism is named anywhere.

## Untriaged (11, with anchors, unverified - nobody judged these)

Consolidation's metadata-equality invariant is DEBUG-only (`ConsolidatedToolDiscoveryStrategy.cs:117-122`);
`--tool` silently rewrites `--mode` while the adjacent `--namespace` + `--tool` conflict is
refused loudly (`ServerStartCommand.cs:69-77` vs `:254-261`); allowlist load failure yields
an empty allowlist by design (`IPluginFileReferenceAllowlistProvider.cs:83-92`);
`IsMcpEndpointRequest` decides distributed-state eviction by substring-matching a display
string (`SessionAffinityEndpointFilter.cs:162-187`); the credential chain's two human-facing
documents disagree with each other and with the code, in three different ways
(`Authentication.md:19-38`, `sovereign-clouds.md:88-97`, `CustomChainedCredential.cs:46-52`);
the sovereign-cloud vocabulary is hand-maintained in three places (enum, doc table,
exception string); the AOT package carve-out is gated by review only, with no check reading
the project file; a 20k-word human prompt document is the machine-read source of truth for
generated evals, with a per-row eligibility column whose four values do not quite account
for every row; `ServerToolLoader` and `NamespaceToolLoader` are a live migration with the
old process-spawning path still shipping; the elicitation response has four distinct
not-approved outcomes; `RegistryToolLoader` skips all initialization when the test proxy is
set, to avoid polluting recordings.

## Directions not proposed

- **tracklight** - received an apply row rather than a proposal (the seam already exists;
  see `librarian/applied.md`).
- **gravity, goat, politicas, personas, kp** - no MCP or tool-publishing surface; the
  forces this source answers do not arise there. Not proposed, and not a backlog item.
- The pass was capped at **one proposal per project** by the round-5 declared focus, since
  the fleet already carries twelve undecided proposals. The pumper study's ranked list
  holds the rest.

## Phase 1 finding: the directions ledger is not machine-portable

The round-5 focus asked for a count of direction proposals waiting. On this machine the
count is **0 observable** - and that is not a low number, it is a defect. The twelve
proposals from rounds 2-4 were committed into project checkouts that exist only on the
other machine; this box's checkouts of the same projects carry no `.ai/directions/` at
all. A ledger whose rows live in per-machine checkouts cannot be counted from a second
machine, so "how many proposals are waiting" is unanswerable from wherever the operator
happens to be sitting. Recorded as the round's second method finding.
