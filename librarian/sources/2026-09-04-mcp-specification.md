---
source: "web:langchain.com/blog + github:modelcontextprotocol/modelcontextprotocol"
kind: vendor release announcement (trigger) -> standards repository read as a system (the actual source)
url: https://www.langchain.com/blog/mcp-in-langchain-stateless-protocol-elicitation-and-more
title: "MCP in LangChain: Stateless Protocol, Elicitation, and More! -> the MCP specification at e76e9c5"
author: Sydney Runkle (blog) / the MCP maintainers and 43 SEP authors (the spec)
words: 1372 (blog) / 800505 in-tree markdown (spec repo), ~106000 read across five readers
extracted: 43 design entries + 12 scored rows
accepted: 12
declined: 0
leads: 3
already_covered: 9
untriaged: 13
dispatched: 5 parallel design readers
applied: 3
shipped: 1
run_id: intake-mcp-1
siblings: 1 live at claim (intake-ghcost-2), 2 by Phase 9 (intake-stencil-harness, which also holds mcp-tools)
rescan_when: "the conformance repository gains per-SEP traceability files that are visible from the specification tree (today the gate is unauditable from the artifact it gates); or the SDK tier table is published with a per-SDK assignment and a first relegation; or the tasks and apps extensions leave ext-* repositories for core; or 12 weeks elapse (2026-11-27)"
---

# The MCP specification — the corpus's own subject, checked against the standard

**The operator's framing decided the run.** The link was a vendor release
announcement about a framework's MCP client, and the instruction was to master
MCP rather than the framework. So the blog was read once as a trigger and then
set aside: its class yields numbers, its numbers are adoption figures, and the
actual source is the standard the post is describing. Cloned
`modelcontextprotocol/modelcontextprotocol` at `e76e9c5` — 800,505 words of
markdown, with `seps/` as its ADR directory (43 Specification Enhancement
Proposals, each carrying Motivation, Specification, Alternatives Considered
and Backwards Compatibility).

**Expected yield, stated before the triage table:** `mcp-tools` is a mature
12-technique subject whose golden path already models the 2026-07-28 stateless
architecture. The headline claims should be catches; findings should come from
second-order decisions. That held — and the surprise was the direction.

## The headline: the subject claimed a revision it did not document

Six load-bearing statements in `mcp-tools` reproduced the **2025-06-18**
protocol while the golden path claimed to describe 2026-07-28. Each was
verified by the director against the normative text, the wire schema, and the
diff between three published revisions in the same checkout — not from a
worker's report.

The provenance explains it and is the run's method finding. That section of
the golden path was written by the round-5 intake of a large vendor
*implementation catalog*. Mining implementations of a standard teaches you the
architecture's **shape**; only the standard teaches you its **rules**. The
round-5 note was right about where the material lived and could not have been
right about the rules, because it never read them.

| Corpus claim | Verified against | Verdict |
| --- | --- | --- |
| protocol error = "unknown tool, **malformed arguments**, unauthorized caller" | `server/tools.mdx` Error Handling, three revisions | false since 2025-11-25 |
| "elicitation makes servers requesters too" | no `ServerRequest` union in the schema; control: 1 hit in 2025-11-25 | false |
| "**Two** client-side primitives were retired" (sampling + logging) | `deprecated.mdx`: three, and logging is a **server** capability | wrong pair and count |
| "a catalog whose shape varies by caller **cannot be cached**" | `cacheScope: "private"` licenses exactly that | false clause |
| "**All of these** return a result, not a protocol error" | `-32021` splits the capability-absent case onto the protocol channel | one of four wrong |
| conditional requiredness rests on "a parser rejection is a **protocol error**" | premise is row 1; the remedy survives, the reason does not | void premise |

**The corrected discriminator is the run's best single sentence, and it is not
ours — it is the standard's, stated in its own definitions:** route an error to
**whoever can act on it**. Anything a differently-composed retry could fix goes
to the model. Anything only a re-listing or a different tool could fix goes to
the machinery. Anything only a new credential could fix goes to a third
destination the corpus did not have. The tell that the axis is the actor and
not the call boundary: **the same failure changes channel with the primitive** —
a missing required argument is a protocol error for a user-invoked prompt and
an in-band result for a model-invoked tool.

## What landed

**Six corrections** (the table above), across `mcp-tools.md`,
`tool-schema-design`, `server-composition`, `catalog-projection-modes`,
`client-integration` and `authentication-and-scoping`.

**Three new techniques**, and they are one story told three times — *statelessness
removed the container, and everything that leaned on it had to be re-derived*:

- `suspendable-request-classes` — only a call that invokes application
  semantics may pause for a person; the protocol's own metadata surface must be
  answerable by machine alone, or nothing can bootstrap, cache or proxy. The
  partition is total (3 invoke / 6 metadata / 1 stream across the complete
  request union) or it is a habit.
- `sealed-continuation-state` — a **carrier is not a reference**. Binding a
  handle to a principal works because the server stored the handle; there is
  nothing stored to bind a carrier to, so integrity protection is mandatory
  rather than good practice. And the seal still cannot buy single-use: that is
  a claim about history, history is a record, and the record is the state you
  were avoiding.
- `enumeration-without-a-scope` — recognising one handle needs no cross-call
  caller identity; correlating two needs exactly that. When the scope cannot be
  defined unilaterally, delete the operation rather than documenting the
  obligation — the leak becomes unrepresentable instead of merely discouraged.

**Two amendments to `server-composition`**: deterministic list ordering is a
*prompt-cache determinant* the server alone controls and the client alone pays
for; and a discovery response carries two hints, not one — freshness and
**sharing** — where the sharing scope is never an access control and its
failure is invisible to both endpoints.

**One amendment to `release-pipeline/deprecation-by-version-arithmetic`**
(a different subject, and the strongest cross-bundle result): the arithmetic
assumes the declarer can *execute* the removal, which a specification cannot —
so `removed` degrades from a promise to an eligibility floor, paid for by a
registry, a standing announcement channel, and a marker obligation delegated to
the implementations that do have a runtime. Plus the hole nobody had named:
**a deprecation window only warns someone whose upgrade step is smaller than
the window.** A consumer who jumps from before the deprecation to after the
removal in one hop was never warned, however correct the window was.

## Applied and shipped

**pumper — `code`, `better`, `ab-paired`, shipped as `1158645` (not pushed).**
Seam: `tools_call` dispatched arguments to handlers without ever checking them
against the `inputSchema` the server publishes for that tool.

- Arm A (measured, not assumed — the test was written first and **failed**):
  `search` with `{"q":"x","srot":"newest"}` returned `isError: false` and ran
  with the misspelled key silently dropped. `query_dataset` missing its
  declared-required `dataset` was likewise accepted.
- Arm B: both refused in-band with each violation named by JSON pointer; the
  refused request never reaches the index; the valid call is unaffected.
- Gate: 506 + 9 tests pass, clippy `-D warnings` clean.

**The tree corrected the finding mid-run, and that is the valuable half.** The
first reading was "no validation". False: the handlers *do* validate by hand,
and `search` already refuses a bad `sort` enum and a blank query **in band** —
the corrected registry rule, implemented before we wrote it down. The real
defect is narrower and worse: the set of constraints *enforced* lived in the
handlers while the set *published* lived in the schema, and they had drifted.
`additionalProperties` and `required` were in the second set and in no handler.

**Two source-tree applications** against the standard itself
(`spec--enumeration-without-a-scope`, `spec--sealed-continuation-state`), both
`structural-only` with the reason stated.

## Catches (9, verified by reading, not by slug)

Per-request self-description; no protocol sessions and state as an explicit
handle; *possession of a handle is not authentication* — where **the corpus is
stronger than the source and correctly so**, since the standard makes it
non-normative twice ("the protocol has no handle concept to enforce against")
while citing a live SDK hijack where a leaked session id was routed without
comparing the authenticated identity; notifications best-effort with polling;
durable handles for long work; the three-controller safety architecture; the
tools/resources/prompts split; schemas enforced server-side at dispatch; and
consent obligations at install, where `client-integration` carries two rules
the standard does not (treat an *edit* of an approved entry as a creation, and
prefer argument arrays over command strings).

Two of these the corpus states **better** than the standard does: the standard
never says notifications are lossy — it only implies it — and the corpus's
four-way consent enumeration has no counterpart in a spec whose install-consent
model is binary.

## Leads (with return conditions)

1. **The conformance gate is unauditable from the artifact it gates.** A SEP
   with observable protocol behaviour cannot reach Final without a merged
   conformance scenario and a traceability file — but no SEP in `seps/` records
   one, the template has no field for it, and three Standards/Extensions Track
   SEPs finalized after that rule mention conformance zero times. One Final SEP
   still reads "Links to implementations will be added once the SEP is
   accepted." The evidence lives in a second repository. *Return: the
   conformance repo becomes visible from the spec tree, or a SEP lands carrying
   its traceability file.* **Not established: whether the rule is enforced.**
   Only that it cannot be checked from here.
2. **A denominator can be narrowed safely only when the party who benefits
   cannot perform the narrowing.** The corpus's `declared-deviation-register`
   forbids removing accepted findings from a conformance denominator; this
   standard removes four categories including a `disputed` label — and is saved
   by a control the corpus does not state: only a *conformance maintainer* may
   apply that label, never the graded SDK. *Return: a second sighting of the
   remover-is-not-the-scored-party rule.*
3. **A law candidate at its second sighting:** an advisory field nobody is
   required to honour decays into a field nobody sends. Roots was deprecated
   for exactly this ("the specification describes roots as informational —
   servers are not required to respect them, which reduces their utility").
   *Return: a third sighting from a different bundle.*

## Untriaged (13, with anchors, promoting questions executed where cheap)

`$ref` to a network URI is an SSRF primitive inside a *tool definition*, with a
fail-closed rule for unresolvable refs (`basic/index.mdx:299-318` — question
executed, verified real, not landed for budget); JSON Schema dialect pinning
with a MUST-error on unsupported dialects; `x-mcp-header` argument mirroring
into HTTP headers with a MUST-reconcile-or-reject rule, which puts
model-composed strings into the routing fabric (**two readers found this
independently**); the error-code range partition and its "receivers MUST NOT
assume any meaning" legacy band; MCP Apps introducing a **fourth
trigger-puller** — server-supplied code that calls server tools and writes the
model's context, guarded only by MAY; `icons`/`websiteUrl` turning a listing
into a credential-free fetch-and-render surface; extension identifiers carrying
the compatibility promise so a breaking change takes a new name; strong
consistency on mint versus eventual consistency on mutate; the enterprise IdP
as a policy authority that is neither endpoint; the discovery-burden transfer
from server to client on a population-ratio argument; "fetch client metadata
only after authenticating the user" as a general rule for attacker-triggerable
outbound requests; the replacement-must-be-live-at-both-ends rule, **which was
stated in the design record and dropped from the published policy**; and the
DCR deprecation that breaks the lifecycle policy in the very revision that
adopted it.

## A candidate that died in verification

pumper emits `-32002` for an unknown resource URI, which the 2026-07-28
revision says implementations **MUST NOT** emit. It looked like a clean
conformance defect until the discriminating check: pumper advertises
`2025-06-18`/`2025-03-26`, where `-32002` is correct, and the spec explicitly
tells clients to keep accepting it from earlier-version servers. Not a defect.
Recorded so nobody re-derives it.

## Contention

`intake-stencil-harness` went live at Phase 6 holding `mcp-tools` among nine
subjects. This run's mcp-tools writes were complete before that claim appeared
and are committed first, so the sibling re-enters behind them on the golden
path's `techniques:` list. `index.json` and `catalog.json` were regenerated
under the `index` lock and **deliberately left uncommitted**: the sibling has
four uncommitted technique files in other subjects, and committing the
artifacts would bake their in-flight work into a hash under this run's name.

## Routing count (Phase 2d)

43 design entries across five systems. `corpus: NONE` per system 5/4/5/4/4;
whole-tree ~21. Every system clears three, which reads as a forge handoff five
times over — and resolves the other way on both clauses. **V1 is mechanical:**
`llm-agent/runtime-and-io` holds 10 subjects, exactly `MAX_CHILD_DIRS`, so no
new subject can land there at all. **HOME IF NEW resolves it:** 18 of 21 home
into `mcp-tools`, the rest into `release-pipeline` and `conformance-checking`,
all existing. Handoff: **no** — this is round 5's lesson a second time, and the
cap made it non-negotiable rather than a judgement.

## Fetches

**0 of 3 spent.** A specification repository carries its own primary material;
every claim above is anchored in the tree, in three of its published revisions,
or in a fleet tree that was opened.
