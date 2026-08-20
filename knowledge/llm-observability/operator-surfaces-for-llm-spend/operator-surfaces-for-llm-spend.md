---
layer: golden-path
type: golden-path
subject: operator-surfaces-for-llm-spend
status: forged
use_when:
  - designing the report/dashboard layer over an LLM spend store
  - exposing read tools and operator journeys to a coding agent
  - deciding which numbers a shared dashboard may show
  - unifying CLI, agent, and panel views of the same accounting data
techniques:
  - single-render-layer-many-consumers
  - glyph-encoded-business-thresholds
  - agent-prompts-as-dashboards
  - read-tools-default-writes-gated
  - secret-surfaces-never-exposed-to-agents
  - sql-panel-sets-over-the-relational-store
---

# Operator surfaces for LLM spend

Everything below this subject — telemetry, pricing, attribution, margin — ends
in a person reading a table and deciding something. The surface layer is where
the accounting becomes action: a rendered cost rollup, a slash-command journey
inside a coding agent, a panel wall on a shared screen, a terminal report in a
deploy log. A principal practitioner treats this layer as two things at once:
**a single rendering discipline** (one implementation of the tables, shared by
every consumer) and **a set of authorization boundaries** (each surface decides
not just how numbers look but *which numbers exist there at all*). Most teams
get the first half right eventually and never notice the second half until a
key roster shows up in a chat channel or an agent transcript.

The boundary with the builder's own instrumentation matters. A builder-side
surface shows "my run": one person's traces, one feature's cost, rendered for
the person who caused the spend. This subject is the multi-tenant operator
report — many customers' money, many projects' budgets, read by people (and
agents) whose entitlement varies. On the builder side the surface can be
maximally transparent because the reader owns everything shown. On the operator
side the surface itself carries authorization consequences: a margin table is
admin-grade financial data, a limit-status view names customers, an API key is
radioactive anywhere an agent might quote it back. The render layer must be
generic; the *placement* of each report on each surface must not be.

## One render layer, several consumers

The same operator reads spend through at least four doors: an agent quoting a
tool result into a conversation, a CLI on a terminal, a panel wall driven by
queries, and occasionally a raw API response in a script. If each door formats
its own tables, the doors disagree — different rounding, different orderings,
different treatment of the unpriceable row — and the operator learns to trust
none of them. The discipline is a single pure formatting layer that turns the
canonical structured payload into the canonical human rendering, with every
consumer calling the same functions and differing only in transport
(single-render-layer-many-consumers). The structured payload always rides
alongside the rendering, because a machine consumer must never be forced to
parse prose that was formatted for a human.

This centralization is also where honesty lives. The laws of the domain —
absence disclosed, nulls never read as zero, simulations stamped, truncation
announced — are only worth anything if every surface enforces them, and the
cheapest way to enforce a rule everywhere is to implement it once, in the
renderer, where no consumer can forget it. A currency caveat appended by the
render layer appears in the agent transcript, the terminal, and the export
alike; a caveat left to each consumer appears in one of them.

## Judgment compiled into the pixel

An operator triaging forty rows does not re-derive "is 12% margin bad" per
row. The render layer pre-computes the business judgment and encodes it as a
small visual vocabulary — loss, thin, healthy; breached, near, comfortable —
attached to each row (glyph-encoded-business-thresholds). The thresholds are
business rules, so they belong in exactly one function with the rule stated in
its documentation, not scattered across surfaces as ad-hoc conditionals. Signed
deltas get an explicit plus sign, because "+$13.00" and "$13.00" are different
claims and a what-if's headline is the sign. And a value that could not be
measured gets an em-dash, never a judgment glyph: rendering an absent ratio as
"healthy" or "loss" is presenting absence as an answer.

## The agent is a first-class operator — and an untrusted context

A conversational agent wired to read tools is now a primary spend surface, and
it changes the design in both directions.

Toward capability: the recurring operator journeys — "cost report with limit
warnings", "who is losing me money", "did the latest run regress" — are worth
packaging as prompts the agent platform surfaces as named commands. Each prompt
is a small operating procedure: which read tools to call, in what order, and
how to frame the result — present the pre-rendered table verbatim, call out
rules at or past a stated fraction of threshold, close with the biggest driver
and one concrete lever (agent-prompts-as-dashboards). A missing argument
degrades to a listing step or a question, never an error; a journey that errors
on its first step teaches the operator to stop using it.

Toward restraint: everything a tool returns enters the agent's context, and
context is a broadcast medium — quoted into replies, summarized into logs,
persisted into transcripts the operator does not control. So the tool surface
exposed to agents defaults to read-only, with every mutation gated behind an
explicit operator-set switch on top of the API's own authorization
(read-tools-default-writes-gated). And some capabilities are not gated but
*absent*: anything that mints or reveals a secret is never exposed over the
agent protocol at all, because a gate can be opened and a transcript cannot be
unwritten (secret-surfaces-never-exposed-to-agents). The distinction is load
bearing — gated means "off until a human turns it on"; absent means "no flag
exists that turns it on".

## The panel wall is an audience decision

A dashboarding system fed by a curated set of queries over the relational
store is the ambient surface: always on, glanceable, often on a screen a whole
team walks past (sql-panel-sets-over-the-relational-store). Curate the panel
set as a product — error rate, spend over time, spend by cohort, score trends,
health — and maintain the queries next to the schema they read, because a
renamed column silently blanks a panel and a blank panel reads as "nothing
happening".

Then apply the placement rule: the panel set is scoped to what its *audience*
is entitled to see, not to what the store contains. Operational health and
aggregate spend belong on the wall. Per-customer margin — a ranked list of who
is unprofitable, i.e. the company's P&L by name — does not, even though the
store can trivially produce it. Its deliberate omission from the wide-audience
surface, with the report living only behind authenticated admin-grade doors,
is the same decision as the secret-minting omission: the safest place for a
number that must not leak is a surface that never renders it.

## Failure modes of the naive reading

- **Per-consumer formatting.** Each surface grows its own table code; the
  agent and the CLI round differently; a fix to the truncation disclosure
  lands in one renderer and not the other. One payload, one renderer.
- **Prose-only tool results.** A rendering without the structured payload
  beside it forces downstream automation to scrape human formatting, and the
  first layout tweak breaks it.
- **Thresholds in the eye of each beholder.** "Thin margin" defined three
  slightly different ways on three surfaces produces three contradictory
  severity signals over identical data.
- **The write-capable agent by default.** A tool list where mutation works out
  of the box turns every prompt-injection or agent mistake into a spend event.
  Read is the default; write is a decision.
- **The helpful key-reveal tool.** Exposing credential material to an agent
  "for setup convenience" places a secret into a transcript forever. Absence,
  not gating.
- **The all-knowing wall.** Publishing every query the store can answer onto
  the shared dashboard because it was easy. The store's capability is not the
  audience's entitlement.
- **Journeys that assume their inputs.** An agent journey that hard-fails on
  a missing project id, instead of listing projects and asking, converts the
  most common invocation into a dead end.

The surface layer looks like polish and is actually policy. Every table is a
claim about the data, and every placement of a table is a claim about who may
read it; the craft is making both claims deliberately, once, in code.
