---
domain: software-engineering
subject: mcp-tools
last_touched: 2026-09-03
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
