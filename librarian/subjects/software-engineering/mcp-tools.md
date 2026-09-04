---
domain: software-engineering
subject: mcp-tools
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# mcp-tools

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from a practitioner deep-dive

Gained `orchestration-to-tool-migration` (6 -> 7 techniques). Source:
[[2026-08-22-inside-deepwiki]].

The subject governed how a tool is shaped - schema, transport, scoping, result trust -
and not what earns a place on the surface at all. That answer is not stable: it is
derived from model capability, which moves, so pipelines accumulate scaffolding
compensating for limitations that have since lifted.

Home was the run's hardest call. `agent-chaining` owns event-wired peer-to-peer chains
and `fleet-orchestration` owns session supervision; neither is the orchestration/agency
dial. Recorded here because the next run to meet a finding of this shape will face the
same question, and the answer is that the tool surface is where the dial is visible.

### 2026-08-22 - external reconcile, [[2026-08-22-5]]

Gained `node--transport-selection` against
`modelcontextprotocol/typescript-sdk` @ `3924de9` (2.0.0-alpha line) — second
stack; the single-stack debt is cleared. Hint held and was strengthened: the
dual-era tree makes the technique's claims visible as a literal diff.

### 2026-08-24 - `/deepen`, source-driven (MCP roadmap post, 2026-08-22)

Counter-evidence pass against the golden path and both spec-facing techniques
came back **all-confirmed** — every standing claim (stateless sessions, MRTR
elicitation, sampling/logging deprecation, handle discipline, task handles)
matches the shipped 2026-07-28 spec as reported by multiple independent
secondary sources. No corrections needed; that is the result.

Two earned widenings, both from *shipped* spec rather than roadmap
speculation:

- `authentication-and-scoping` gained **client identity** (CIMD replacing
  dynamic client registration, mandatory RFC 9207 issuer validation,
  issuer-bound credentials, DPoP-bound tokens) — a real coverage gap: the
  technique governed tokens and scopes but not how a client proves who it is.
  Includes a dated (2026-08) note on the open non-interactive-agent-identity
  question and the honest interim pattern.
- `transport-selection` gained a dated **horizon section** on the declared
  HTTP-over-stdio unification: framing is the mutable layer (keep it behind
  an SDK seam), the identity/reach decision logic is durable. Added because
  it changes what a consumer building a server today should invest in, not
  because the roadmap is spec.

Declined as not-knowledge: SDK developer-experience priority (tooling churn),
and writing any roadmap item into a technique as if it were standing spec.

## Open leads

- **The seam with `prompt-assembly/context-reachability`**, landed the same run: granting
  a tool changes what context is worth injecting. Two subjects, one boundary, opposite
  sides. Worth one deliberate read before either is deepened.
- **The orchestration/agency dial is under-covered corpus-wide.** Two of three picks this
  run were about it. That is a `/deepen` target on its own rather than something to wait
  for a source to raise.

From the 2026-08 roadmap (each with a return condition — none is spec yet):

- **Tasks extension (SEP-2663) → core promotion.** Golden path already
  describes the poll-based handle correctly. Return when a spec release
  actually promotes it (quarterly cadence; check ~2026-11) — at that point
  "extension" wording in the golden path becomes stale.
- **Server-initiated events (webhooks/channels).** Would soften the standing
  claim that "polling remains the correctness path." Return when the
  Triggers & Events WG ships something normative; until then the claim is
  correct and load-bearing.
- **Agent identity via workload identity federation / token exchange.**
  The auth technique now carries the dated open-question note; return when
  a SEP lands to replace the interim pre-provisioned-token pattern.
- **Progressive discovery for 100+ tool catalogs.** The practice is already
  in the golden path and client-integration as host-side discipline; return
  when a protocol-level mechanism ships, which would move it from "host
  curation" to "wire feature."

From the reconcile (convergence rule applies):

- The transport decides what silence means: same timeout, capability signal on
  one transport, availability signal on the other — the decision table needs
  the row.
- Per-request self-description is an HTTP obligation, not universal —
  parenthood guarantees one peer whose era cannot change.
- Era/version lists as physically separate artifacts, never one list filtered
  at use.
- A probe should run on a disposable sibling, so a server that dies on an
  unrecognized request is classified, not lost.
- Documented opt-in security (deprecate the in-transport check, ship a pure
  helper, tell the consumer to mount it) — proposed by the worker as a
  possible LAW-layer theme (safe defaults vs composable defaults); needs more
  sightings before a law is even drafted.

## Cross-subject proposals

- Strong uncovered evidence for node--client-integration (auth seams, response
  cache, a shipped v1→v2 codemod) — banked for a future wave.
- createMcpHandler + listenRouter + serverEventBus → a node counterpart for
  server-composition.

## Standing debt

- **Never swept by `/librarian`.**

## Declines

None.

## Applied to the technique layer

- 2026-08-22-8: **checks on unless deliberately removed** (opt-in-guard family) applied to `transport-selection` ([[2026-08-22-8]]).
- 2026-08-22-10: `transport-selection` now cites the promoted `absent-guard-is-loud` law ([[2026-08-22-10]]).


## 2026-08-27 - /intake, from an open-tree vendor repository ([[2026-08-27-openexecutive-virtual-executive]])

Gained `egress-argument-gating` (7 -> 8 techniques). Registered bidirectionally.

**Found by the asymmetry hunt, and it is a clean instance of it.**
`authentication-and-scoping` models the inbound question in full - who is calling, what
may they reach. The outbound question gets **one bullet** inside
`untrusted-result-handling`: *constrain which tools can move data out*. That is a policy,
not a mechanism. Both files "cover" the seam and score identically to a slug map; only
opening both shows that one has a model and the other has a sentence.
`security/credential-vault/brokered-egress` is a different concern - whether the caller
may hold the secret, not who may receive the resource - and is not a duplicate.

What the gateway in the source demonstrated that one bullet cannot:

- **Two orthogonal scans, each blind where the other sees.** A value-shaped scan (every
  string value, identifier-shaped tokens must resolve to the allow-list) survives unknown
  field names, which is its whole purpose over a third-party schema. A key-shaped scan
  survives capabilities modelled as booleans or enums, which carry no identifier for the
  value scan to find. The gateway **writes its own residual hole down** - a novel key name
  carrying a non-string value - and that practice went into the technique, because a gate
  whose limits are unstated is read as total.
- **Strategy is chosen by whether the argument surface is enumerable**, and both
  strategies live in one file: a stable tool gets a *key* allow-list (an unknown key is
  where a recipient smuggles in via a raw blob or custom headers); an unstable one gets
  the value scan. Prefer the loud failure wherever the schema permits it.
- **A principal allow-list cannot express a population.** The sharpest sentence in the
  repository. A roster answers *is this person permitted*; a share-to-anyone or a
  whole-domain grant has no principal, so the check finds nothing to reject and returns
  allowed - the widest possible grant passing cleanly through a well-formed check asked
  the wrong question. Refused categorically, by a rule that runs *before* the allow-list.
- **The gate is directional.** Narrowing access stays permitted; only widening trips it.
  A gate that refuses the operation blocks the remediation as firmly as the breach.

Boundary stated in the document rather than linked: this is a host-side gate on the call,
and it does not replace the server-side entitlement check that `gate-sees-target` already
requires - the host is the only party that knows the sanctioned set, the server the only
one that can read the resource.

## Open leads

- **Tool-server process topology follows tenancy cardinality.** The source co-locates a
  tool server as a child process rather than a separate service, argued from the product
  being single-tenant - one install, one organisation, one account - so the server is
  inherently one-per-install. Adjacent to `transport-selection`. Return when a second
  source argues topology from cardinality; one instance is a habit, two is a rule.

## 2026-08-31 - reference-index run

Touched by [[2026-08-31-voltagent-agent-papers]]. One amendment to
`untrusted-result-handling`, from **Family B** (two independent sightings).

The technique's premise - tool output as attacker-influenced text delivered into the
decision-maker's working memory - selects one direction of the arbitration, and every
mechanism in the file implements only that one: fence, attribute, never re-promote,
validate shape, gate egress. All of them lower a result's weight; none raises it. The
excluded case is the honest tool returning a correct result that contradicts the model's
prior, where the prior wins by default.

The literature disagrees on which side actually wins, and **the disagreement is the
finding** rather than something to resolve by majority: the arbitration outcome varies
by model, by setup and by conflict type, so a system implementing distrust alone has not
picked a conservative tiebreaker - it has picked an unpredictable one. Below some
capability line the failure is lopsided: a small model will call a tool correctly and
then answer from its prior anyway, with nothing in the transcript recording that it did.

The golden path claims the tool boundary is a trust boundary "in both directions" and
both of its stated directions run the same way; it also calls this technique the one
least optional in the set. Enumeration hunt, paid.

Applied to `personas` as `structural-only`: the agent layer contains **no arbitration
vocabulary at all** - conflict, contradiction, disagreement, mismatch, any spelling,
zero hits. A codebase does not grow a decision it has no word for.

## 2026-08-31 — `/intake` (`semantica`)

8 techniques, unchanged — amended `transport-selection` rather than minting a
competing technique beside it. **Triage had this as a new technique and Phase 6
downgraded it**, which is the honest outcome: the file already says "the output
channel is sacred… a stray print statement into the framed channel corrupts the
conversation — the classic first bug of every hand-rolled server."

What the amendment adds is the half author discipline cannot reach. "Do not print"
is a rule a server author can keep about their own source and cannot keep about
their dependencies: the source's incident was a progress indicator **inside an
export routine**, three layers down, fixed process-wide at startup rather than by
removing a print. Two properties the corpus did not carry: the failure presents as a
**hang** expiring on a timeout (300 s on an empty graph), not as a parse error, so it
is diagnosed as a slow tool; and it is **load-dependent**, so it passes every small
test and fails on the user's real input. The mirror obligation on the library author
— attach a console display only for a real terminal — is stated too, since a library
that decorates a redirected stream is corrupting log files as well as protocols.

Phase 7.5: **unapplied, and stated rather than manufactured.** The amendment governs
the process that *is* a stdio server; every fleet project is on the host side. The
host half was checked anyway and is clean — 6 spawn sites, stdout and stderr piped
separately at all of them, never merged, confirming `output-normalization`'s
existing rule. A simulation over invented server code was declined. Return
condition: the first managed project shipping a stdio protocol server.


## 2026-09-02 - intake `deer-flow` ([[2026-09-02-deer-flow]], run intake-deer-flow-0902)

**New technique `write-freshness-gate`** - the second host-side gate over tool
calls beside `egress-argument-gating`. A write to an existing artifact is
admitted only with proof the model saw its current version: a full-content
hash stamped on the read result, compared against the file now. The four
properties that make it an agent technique rather than a restatement of
optimistic concurrency: the proof lives on the read message so context loss
is proof loss, structurally; writes never refresh it, so consecutive edits
force a re-read; check-and-write is one critical section per (writer, path)
so a same-turn parallel duplicate is refused deterministically; and the gate
fails open with a log on its own breakage and closed only on a stale mark
(the in-path split from quality-gates' unmeasurable-criteria).

**Home contested and decided.** The concept grep found no subject owning an
agent's edit tools. The general stale-writer discipline lives in
concurrency-guards (attempt-attribution) and client-state
(optimistic-write-path), and the technique says so; this subject holds the
model-facing gate because the tool boundary is the trust boundary and the
gate stands on it.

**Unapplied.** No managed project exposes its own write tool to a model; the
one tool server in the fleet publishes feature-matrix and harness tools only.
Return: a managed project that grows a write tool over shared artifacts.

Untriaged with anchors in the source note: command-substitution audit by
*position* rather than pattern (value position captures, command position
executes, an interpreter's code-string flag is an execution context anywhere,
heredoc bodies are data) - no subject owns command auditing and this is the
nearest gate shape.


## 2026-09-02 - boundary sentence from intake `deer-flow` v2 ([[2026-09-02-deer-flow-v2]], run intake-deer-flow-0902-v2)

The scope paragraph's "plugin systems that load code into the host's address
space" now says where that ground lives: `agent-runtime-assembly` owns
in-process plugin loading (operator-tier-code-loading, host-routes-win) and
the host's custody of long-running tool work (bounded-projection-of-external-work).
This subject keeps the wire half - "long-running work gets a durable handle,
not a held connection" - and stops at the host's door, as its golden path
already said. Edited under the content lock; one paragraph, no other change.

### 2026-09-03 - `/intake`, from a vendor's official MCP server monorepo

Gained three techniques (9 -> 12) and two amendments. Source: [[2026-09-03-microsoft-mcp]].

**`catalog-projection-modes`** is the one that mattered. The subject already framed
sprawl correctly - "Sprawl is a quality defect, not a cosmetic one" - but framed it
entirely as *selection quality*, a soft statistical cost, and assigned the remedy
(progressive discovery) to the host. The source is a publisher whose host does neither:
one widely deployed editor host refuses any request carrying more than 128 tools summed
across every installed server, so the catalog budget is hard, external, and shared with
servers the publisher cannot see. Over the line nothing works. It answers with four
projections of one command tree, and flipped its own default from ~128 tools to 25 as a
documented breaking change - a publisher spending a breaking change to shrink its own
catalog is the strongest available evidence that catalog size is a quality property.

The technique had to be written *against* `tool-schema-design`, which says one tool one
operation and calls an `action` argument a way of hiding operations from selection. That
rule is right, and it was reached in a world with no ceiling. The discriminator now sits
in the golden path's sprawl section: is the budget yours? Two sub-rules carry the weight -
operations may be merged only when their safety annotations are equal on every axis (or
the merged tool's consent tier is a lie), and policy must be re-checked at the *resolved*
operation, because under compression the listing no longer names what is invoked and a
listing-only filter gates nothing.

**`tool-identity-vs-tool-name`** was the thinnest of the three and was kept separate
deliberately. `tool-schema-design` addresses the two readers of a *call*; identity has
neither reader - it addresses a third party the schema document never contemplates, the
operator correlating a tool across time. Filed as a bullet there it would not be found by
anyone whose symptom is "my rename split the telemetry".

**`sanctioned-session-state`** is the case the golden path asserts away. The path is
correct that the protocol removed sessions and that a handle is not authentication; it
left no room for the deployment that genuinely must route a caller back to its state. The
source ships that capability arguing against itself in its own documentation, opt-in
twice so no transitive dependency can acquire it, and regenerates the owner identity per
process - a deliberate inversion of `identity-survives-reuse`, argued rather than hidden,
because an owner identity that survives restart is exactly what makes a stale record
indistinguishable from a live one.

Amendments: `tool-schema-design` gained the third authority (schema vs *handler use* - an
argument the handler never reads is a contract lie no schema/validator unification can
detect, and the source paid ~50 breaking-change PRs to retire them) and a carve for
conditional requiredness; `client-integration` gained the server's half of the elicitation
contract, where the real defect lives - a client returns accept even when the user picked
reject, because the choice is in the declared payload field and not the envelope.

Four leads and eleven untriaged rows with anchors are in the source note.

## 2026-09-04 - the transport rung (from `Sylinko/Everywhere`, applied on `tracklight`)

`tool-schema-design` gained a second exit from the schema, and the shape is the one the
subject keeps producing: **an enumeration that denied too much.** The file named
conditional requiredness as "the one constraint that leaves the schema" and carved the
boundary tightly - "formats, ranges, enums and unconditional requiredness stay". A
consumer that forwards tools to an endpoint accepting a *narrower subset* than the
schema was authored in must strip exactly formats and ranges, and there the rule
resolves to the worst outcome available: enforced by nobody and invisible to the model,
strictly weaker than the prose it was steering away from. The amendment replaces
"schema over prose" with **place each constraint on the highest rung the transport
carries** - exact lowering that keeps enforcement, demotion into the description where
no equivalent exists, and silence as the outcome to make impossible rather than choose.

Two things came from the *applied* tree rather than the mined one, and they are the
better half. A generated catalog of 64 tools and 203 parameters, published with six
schema keywords and no bounds at all, demotes constraints to prose as house style and
carries **the reason with the bound** - "clamped to 4..=90, below the evidence floor a
trend cannot be presented" - which the mined source does not; it emits a bare
`Constraints: minimum=1, maxItems=10.` The reader on the prose rung reasons, so a bare
numeral wastes the rung. And the structural fact nobody built that tree to prove: its
pinned tool contract covers names, types and required sets and **not descriptions**, so
a surface that demotes as policy has routed its load-bearing constraints into the one
part of the published surface with no drift guard. Demotion trades silent
non-enforcement for silent drift, and the amendment now says so.

Applications: `rust--tool-schema-design` (the publisher side, A=1 -> B=0, shipped) and
`dotnet--tool-schema-design` (the consumer side - the allowlist, the reference-integrity
gate that must run *after* pruning because pruning is what orphans a definition, and the
alternation merge whose lost exclusivity is recorded nowhere).

Twelve untriaged design candidates from the same tree - two clusters with existing homes
in `native-shell-integration` and `terminal-multiplexing` - are in the source note with
their forces and anchors.

## 2026-09-04 - boundary record only, no change to this subject (run `intake-ghcost-2`)

`server-composition` states, under "Change is announced, not assumed", that a
list-changed notification's entire content is "re-list" and that **the notification
deliberately carries no payload** - the listing remains the single authority and the
notification is only an invalidation hint.

`agent-runtime-assembly/bounded-projection-of-external-work` now states the opposite
for its own case: a completion delivery carries the result inline. Both are correct,
and the discriminator is written on that side rather than duplicated here:

> A notification that **invalidates a mutable authority** carries no payload - it would
> be a racing copy of something that can already be stale, and the reader must re-read
> anyway. A notification that **announces a completed, immutable result its producer
> already holds** carries it - the result *is* the authority. The test is one question:
> told only that something happened, would the reader have to go somewhere else for the
> truth?

`server-composition`'s rule is the first branch and needs no edit: a tool listing is
mutable by construction, which is exactly why the notification defers to it. This note
exists so a later run recognises the shape instead of re-litigating it, and so the
apparent contradiction between the two subjects reads as a boundary rather than a
defect. A field test of the discriminator across another tree's completion path found
8 branches over 7 call sites matching it, with one refinement worth carrying if this
subject ever restates the rule: **the discriminator applies per fact, not per
notification** - one message may carry one fact and point at another.

No knowledge file in this subject was modified by this run; another session was live
in `mcp-tools` at the time.


## 2026-09-04 - the subject claimed a revision it did not document (run `intake-mcp-1`)

Source: the Model Context Protocol specification repository at `e76e9c5`, mined
because the operator routed a vendor blog post to the standard it describes.

**Six load-bearing statements reproduced the 2025-06-18 protocol while the golden
path claimed to describe 2026-07-28.** Each was verified against normative text,
the wire schema, and the diff across three published revisions in one checkout -
not from a worker's report. The error-channel rule was the worst of them: input
validation was filed as a protocol error, which the standard reversed fifteen
months before the revision this subject claims to document, and the corrected
discriminator is not "did the call happen" but **who can act on the answer** -
provable because the same failure changes channel between a user-invoked prompt
and a model-invoked tool.

**The provenance is the finding worth carrying forward.** That section was
written by the round-5 mine of a large vendor *implementation catalog*. Mining
implementations of a standard teaches you its architecture, and this subject's
architecture section is correct. It does not teach you the rules, because an
implementation shows one vendor's reading and a reading is not a citation. **A
subject forged from implementations of a published standard carries a standing
debt against the standard itself**, and nothing in the method currently creates
one - `rescan_when` attaches to the source that was mined, so a repository
re-scan re-checks the repository and never the specification behind it.

Three techniques added, all consequences of one force (statelessness removed the
container, so everything leaning on it had to be re-derived):
`suspendable-request-classes`, `sealed-continuation-state`,
`enumeration-without-a-scope`. `server-composition` gained list ordering as a
prompt-cache determinant and the sharing half of a discovery hint.

**One structural lesson about this corpus, not about the source.** The
`requestState` mechanism was already here - fully, accurately, with the HMAC
envelope and the TTL and the principal binding - inside a *dated application*
about one SDK's transport, framed as "echoed back as an ordinary argument",
which is the vocabulary of the rule it is an exception to. The gap was placement,
not coverage. **An application can carry a mechanism its subject never learned,
and nothing structural surfaces it**, because applications are read as evidence
for techniques rather than as candidates to become them.

Contention: `intake-stencil-harness` claimed this subject at its Phase 6 while
this run was at Phase 9. This run's writes were complete and are committed first;
the sibling re-enters behind them on the `techniques:` list.


## 2026-09-04 - wan2gp (intake)

Two amendments, both found by reading this subject's files for their **unqualified
sentences** before drafting anything, and both landing on the scope those sentences
suppress.

- `write-freshness-gate` said "Writes never refresh marks" and called it "the whole
  cure for drift". The reason it gives is sound for appends and substring replaces,
  whose result depends on content the writer did not supply — and does not reach a
  whole-artifact write, where the writer holds the authoritative copy and a readback
  returns its own argument. The amendment gives the mechanical discriminator and the
  two conditions that make a refresh honest (server-verified evidence in the result;
  source completeness reported separately from write success).
- `catalog-projection-modes` made a routing tool self-teaching for the *operation
  name* and stopped there, leaving the model holding a name and inventing its
  arguments — the failing first call that section exists to prevent, arriving one
  round trip later. The second rung answers the omitted `arguments` with that
  operation's schema, which is how the file's own claim that "the original rule
  stands" inside a compressed server becomes true: the constraint is served as a
  result because the listing is what the budget took away.

**The subject-level fact worth recording, which is not about either amendment.**
Both landings are `unapplied` fleet-side, and the search was done rather than
assumed: six trees, per-project `git grep`, **zero agent-facing write tools and zero
compressed catalogs**. All twelve of this subject's applications are external stacks.
That is not an accident of one run — **this fleet consumes MCP and this subject is
written for publishers**, so its apply rows can only ever be source-tree applications
until a fleet project starts publishing. A later run should read this paragraph
instead of re-searching six trees.

**Return condition on that fact** (it is a cached absence and must expire like any
lead): when a managed project publishes an agent-facing write tool over shared
artifacts, or runs a tool catalog against a host ceiling it does not control.

Two source-tree applications landed instead, both recording where the source does
**not** meet the standard: it has no freshness gate at all, and its per-action
`access` tiers — which correctly classify blast radius — never cross the wire as
behaviour annotations, so the honest annotation set the technique demands is already
computable there and simply is not published.

Board: 2 siblings live by Phase 7, neither holding these two technique files;
`check` was clear immediately before the first write.
