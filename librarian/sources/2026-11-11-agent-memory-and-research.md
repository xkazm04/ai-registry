---
source: batch
kind: batch
url: "https://www.anthropic.com/research/components-of-agent-memory, https://www.perplexity.ai/hub/blog/open-sourcing-space"
urls:
  - https://www.anthropic.com/research/components-of-agent-memory
  - https://www.perplexity.ai/hub/blog/open-sourcing-space
  - https://www.perplexity.ai/hub/blog/escaping-space-part-i
  - https://code.claude.com/docs/en/memory
title: "Agent memory and research, /shift batch of 2 web articles from 2 vendors"
author: "2 vendors: Anthropic; Perplexity"
words: 9900
extracted: 22
accepted: 0
declined: 0
leads: 7
already_covered: 11
untriaged: 3
currency: 1
dispatched: 0
applied: 0
shipped: 0
run_id: shift-agent-memory-and-research
siblings: 2
fetches: 9
---

# Agent memory and research, mined under /shift, 2026-11-11

Plan `plan-web-20261110`, cluster `agent-memory-and-research`, board run
`shift-agent-memory-and-research`. The question: should the registry's memory lane (`memory/`), its skills'
`memory:` scopes, or the research skills change in how an agent keeps memory across sessions and runs open
research tooling? Two vendor pages: A = Anthropic's research post on the components of agent memory, P =
Perplexity's post open-sourcing its agent sandbox platform. Miners spent 5 fetches, all returned as
summaries. The lander spent 4 raw reads, text taken from the page itself: post A, post P, P's linked escape
evaluation ("Escaping SPACE: Part I", the primary for P's only measured claim), and the harness's memory
documentation for the currency row. It also read the installed harness build's shipped strings for the
same row. No GPU, no model call, no download, no install, no clone. No memory file was opened. Phase 7.7:
gate=skipped. `librarian-scan` was not run, so GAIN is scored at the lower value wherever it would matter.

**Expected yield, stated first:** A is a first-party research post on the vendor's own experiments, in the
memory lane, so catches against `agent-memory`, one currency row and leads, with any mechanism sent to the
memory-year ladder as an arm before it becomes a technique. P is a vendor release announcement, so numbers
and catches. That held. P was placed in this cluster by its title: it is a sandbox platform, not memory or
research tooling, and its one finding sits in run isolation.

**Voices:** two vendors, one voice each, on unrelated subjects. P's announcement and its escape evaluation
are one voice. There is no within-batch convergence.

## What landed

- **Currency, `agent-memory/applications/claude-code--memory-governance`.** The index cap sentence was
  re-resolved against the harness's memory documentation and the installed build (2.1.322): the first 200
  lines or the first 25 KB of the index, whichever comes first, and topic files read on demand with the
  model's ordinary file tools. The read found a change the application did not carry. The cap now has a
  write-time door: near a limit the harness reminds the model to keep one line per entry and merge or drop
  stale entries, and over a limit the write succeeds but returns an error asking for a rewrite. The
  deviation bullet "trimmed by whatever falls past line 200" was amended to say this. The door judges size
  and argues no entry's standing, so the bullet's claim of no admission argument stands. `verified_on`
  2026-11-11, `verified_against` claude-code@2.1.322. The 2026-09-04 store counts are kept and dated as
  that read. Admitted under the corroboration table, which governs currency: vendor docs and the shipped
  build.

Nothing else landed. Every upper-layer row rests on one vendor's prose or one vendor's measurement, and
none clears +3 without a second voice or a measurement of our own.

## Source A: the components of agent memory

First-party research post (published 2026-11-06). No run counts, seeds or error bars, and prompts are
paraphrased. Under memory-lane rule 2 a published memory number is a lead and never evidence. The post's
hierarchy (transcripts, notes, compiled representations, an injected layer, with an offline pass between
them) is agent-memory's golden path almost layer for layer.

| # | Claim | Prior art | Read | G/R/C | Outcome |
| --- | --- | --- | --- | --- | --- |
| A1 | A model given a memory folder often did not read it. Prompted to read memory first and test its theories, its score nearly doubled. A stronger model read memory before answering 9 times in 10 unprompted, the older one less than half the time | `recall-injection` models three **pushed** tiers. No technique owns a **pulled** tier's read rate | real gap | 2/2/2 | **lead** (L-A1 below) |
| A2 | A fixed write rule ("record only failures") cost the stronger models much of their memory gain | `episodic-capture` § capture is generous, judgment is deferred | likely catch | 2/2/1 | already covered |
| A3 | Compiled wiki alone 48 %, search alone 53 %, both 61 % of graded criteria on 25 questions, with about 20,000 tokens saved per question | Golden path: a compiled form "works as an index into the record, not a replacement"; memory-lane open question 4 (an arm keeping a summary and routing to the evidence has not been built) | partial | n/a (arm) | **lead** (L-A3 below) |
| A4 | Multi-document items 87 % with the wiki vs 73 % search alone; single-document briefs no clear gain; one wiki grew larger than its documents | `context-hierarchy`; nothing prices compiled size against source size | partial | 1/2/1 | untriaged (reported as a column on L-A3's arm) |
| A5 | Several agents writing one shared page kept 41 of 57 facts; one agent per contract writing its own page kept all of them | Golden path (distilled-in-place loses what distillation dropped), `addresses-before-compression`, `scope-before-similarity` | likely catch | 1/2/1 | already covered; three variables move at once |
| A6 | An offline pass checks a note against the transcript and corrects it; one wrong location note stalled a run; focus checks on what changes, tune cadence to access | `consolidation` read-back is a write-time door; `sql--consolidation` records "cited file changed and nothing re-checked it"; no technique models re-verification after write time | partial | 2/2/1 | untriaged. Return when a fleet tree shows a standing belief served stale after its evidence changed |
| A7 | Keep the injected layer small; an incorrect note is carried into every session | `recall-injection` (always-include tier is a tax forever); memory lane's measured +4 from governing the always-on tier | catch | - | already covered, and the corpus has the measurement |
| A8 | The harness loads only the first 200 lines or 25 KB of the index | `claude-code--memory-governance` | currency | currency rule | **landed** (above) |
| A9 | The offline pass can promote notes into the injected layer | The application's no-admission-argument deviation | thin | - | **lead**: return when the coding harness's memory docs describe an offline promotion pass. The docs read today describe none |
| A10 | Detailed state records went stale; strategy and plans stayed useful (one run per arm, model confounded with policy) | `working-memory`; `decay-and-forgetting` | thin | 1/2/1 | **lead**: unfalsifiable as reported. Return when a second source separates the model from the note policy |
| A11 | Writing notes in the moment draws attention from the task | `consolidation` § batched; `episodic-capture` | catch | - | already covered |
| A12 | A second offline pass repaired dangling links and added an index page | `consolidation` § reachability outranks description | catch | - | already covered |

**L-A3, the middle arm (memory-lane open question 4).** Instrument: one adapter on the personas
memory-year harness (ingest, consolidate, recall, cost) that keeps per-page compiled truth and routes to
raw-record retrieval on every probe. Same consumer, judge, budget and elaboration as every ladder row.
Seam: the ladder's compiled-truth arm and its verbatim-plus-hybrid-retrieval arm, as the two parents.
Target: accuracy above the better parent with staleness no worse than the compiled arm. Floor: read tokens
per probe no more than the hybrid arm's plus the compiled page. Falsifier: accuracy at or below the better
parent, or staleness above the compiled arm: then the detail-versus-currency trade has no free middle on
that scenario. Report beside it: write tokens per event and compiled bytes against raw bytes (A4). Price
the consolidate call first: the source spent millions of offline tokens per corpus. Model calls only, no
GPU. A builder seat at `width.build`, not a miner. Return condition: the arm runs.

**L-A1, the read rate of a pulled memory.** The corpus assumes recall is pushed. Two memories here are
pulled: the harness auto-memory's topic files (the index is pushed, the bodies are read on demand, which
the docs confirm) and the registry's knowledge lane ("Query first ... then open only" what a hit names).
Instrument: session replay over the harness transcripts, read by an operator or lander seat. Per session
count (a) topic-file reads against index lines whose topic the task touched, (b) registry query calls
before the first edit of a decision-bearing path, (c) sessions with neither, reading the matched rows and
not only the count. Seam: the "Query first" paragraph of `AGENTS.md` and the index-versus-topic split in
`claude-code--memory-governance`. A caught outcome teaches: if (c) is high, `recall-injection` owes a
pulled-tier section with read rate as the tier's health signal; if near zero, A1 is a weak-model artefact.
Return condition: the replay is run.

## Source P: open-sourcing SPACE, and its escape evaluation

Vendor release announcement (2026-10-15) with a linked first-party measurement (2026-09-23) that states its
protocol: nine model configurations, two tasks, four settings, three runs each, 216 runs. Re-read from the
page text by the lander. SPACE is the vendor's agent sandbox platform (a microVM per sandbox, a control
plane, credentials and network held outside the sandbox, change-based snapshots), released under
Apache-2.0. It says nothing about agent memory or research.

| # | Claim | Prior art | Read | G/R/C | Outcome |
| --- | --- | --- | --- | --- | --- |
| P1 | Every network bypass exploited a policy written in names and enforced on addresses: a forged DNS answer from inside the sandbox mapped an allowed name to the blocked address, and an allowed name's shared address served other tenants selected by SNI or Host. Fixed by source-address validation, a relay validating request authority, SNI and Host allowlisted and DNS-attributed to the destination, and refusing protocols with no verifiable name | `os-enforced-run-boundary` step 3 (allow named hosts) and § an allowed host is a channel. Nothing owns how a named allowlist is enforced | real gap | 2/0/2 | untriaged (below) |
| P2 | VM isolation and network confinement are separate boundaries: no escape in 108 runs while bypasses succeeded | Same technique: filesystem and network confinement come together or not at all | catch | - | already covered, a measured instance |
| P3 | Bypasses appeared only with partial network: 11 of 54 runs, none of 54 with no network | § an allowed host is a channel; open egress per task | catch | - | already covered, now measured |
| P4 | Agents with root, a time budget and the gateway's source found mechanisms a fixed probe list would not hold; the DNS forgery was found only with source access | Step 6 fixed list; `fixture-repo-testing` | partial | 1/0/1 | **lead**: return when a fleet boundary passes the extended fixed list and is later bypassed, or a second source measures adaptive against fixed probing |
| P5 | Eight of ten third-party sandbox platforms showed a network-policy bypass | `process--os-enforced-run-boundary` records the fleet's runs as unenforced | thin | - | **lead**: return when the fleet adopts any sandbox's name-based egress allowlist; probe it with P1's two probes first |
| P6 | One agent identified the shared-address route and declined it on the instruction alone | Technique opening: only an enforced boundary turns the arrangement into a guarantee | catch | - | already covered |
| P7 | The sandbox is untrusted; credentials and network access are managed outside it | Step 4; `brokered-egress`; `agent-editable-children-get-no-secrets` | catch | - | already covered |
| P8 | Change-based snapshots and checkpoints make create, restore and branch cheap (the README calls them incubating) | `execution-state-checkpointing` § capture cost, § a resume is a duplicate | catch | - | already covered |
| P10 | Agents on legitimate tasks cross boundaries working around failures | `unattended-run-isolation` golden path; the fleet's own 2026-09-27 probe | catch | - | already covered |

P9 (throughput and creation-speed claims against the vendor's predecessor) was not extracted: a vendor's
comparative number ages before it lands.

**P1, re-scored after the verbatim re-read, and why it still banks.** The lander read the evaluation post
and confirmed both mechanisms, the fixes and the counts, so RISK falls from 1 to 0. The re-read also found
the evidence the miner's score lacked. The vendor's third-party test required, inside each sandbox, that
the allowlisted baseline succeed and that direct requests to the forbidden hostname or address, and the
forbidden TLS SNI, fail. Those are step 6's network probes. The bypass still succeeded on seven of the nine
platforms reported. So the technique's proof procedure passes a boundary that is open, a negative finding
against step 6's "prove it" (+1). It stays an amendment, not a technique: the file's own rule (deny by
default, allow named hosts, prove before the queue) survives, and the finding is the case where its
enforcement fails. Adding probes beside the existing ones keeps every standing sentence true, so it
appends. GAIN 1 + 1 = 2, RISK 0, COST 2: G-R = 2, below +3. Untriaged.

The amendment as drafted, for the run that lands it. Step 3: a list written in names must be enforced on
names at every layer; a gateway that resolves the name and then admits by destination address admits every
service sharing that address and any address the sandbox can make the name resolve to; do not accept DNS
answers the sandbox can author (validate the source address of its packets); for TLS require SNI and Host
allowlisted and resolving to the destination; refuse protocols that carry no name to check. Step 6: two
probes beside the three, (a) a blocked name through an allowed name's address (SNI or Host mismatch) and
(b) a DNS answer forged from inside the run mapping an allowed name to a blocked address, then a connection
to that name. § Whatever egress remains: an allowed host's address is a channel for every service sharing
it. If the enforcement point is a proxy that sees only the CONNECT name, (b) may not apply, and the
sentence must say which point it covers.

`reconsider?` Return condition: one more voice makes it 3/0/2 and it lands. That voice can be a second
source fetched in-run on enforcing named egress at shared infrastructure (the domain-fronting literature is
the known one, and is training-data convergence only until fetched), or probes (a) and (b) run on a fleet
allowlist. No fleet seam today: fleet runs are recorded unenforced, so the apply step would be a
simulation row on `process--os-enforced-run-boundary`.

**Repository lead (P-repo).** The SPACE repository (Apache-2.0) was not cloned. A design read belongs in a
repository run routed to `agent-operations/run-safety` and `execution-state-checkpointing`, scoped to its
docs, the egress gateway and node-manager code where P1's fixes live, and the incubating
snapshot, checkpoint and branch operations. The question for the branch operation is what it re-derives
(`resume-mints-a-duplicate`). Clone, read only, never execute. Return condition: the operator queues it. No
queue row was added.

## Leads

- L-A1 read rate of a pulled memory (instrument and seam above).
- L-A3 the compiled-plus-raw middle arm on the memory-year ladder (instrument and seam above).
- A9 offline promotion into the injected layer, when the coding harness documents one.
- A10 state records versus strategy notes, when a second source separates model from policy.
- P4 adaptive probing beside the fixed list.
- P5 third-party sandbox egress allowlists, when the fleet adopts one.
- P-repo the SPACE repository's design read.

## For the cluster question

No change to the memory lane, to skills' `memory:` scopes, to `/research` or to `/deepen`. The memory lane
is an organizational notes lane that nothing injects into a session, so A's injected-layer warnings do not
reach it. The `memory:` scopes say where a skill reads and writes and prescribe no write category, so A2's
failure has no instance there, and the skills that depend on memory already instruct the read, which is
A1's refined arm. SPACE persists machine state, not beliefs, and is not research tooling.

## Not extracted

The per-model tables in both sources (dated comparisons of named models); A's "memory as prediction"
framing; the scope exclusion of weights and compaction from memory (it agrees with the corpus); the linked
sleep-time compute paper and the vendor cookbooks (separate sources, the paper is the next fetch if A6 is
promoted); P's partner launches and throughput numbers; the repository's API lifecycle as read from its
README (the advertisement, see P-repo); the names of evaluation corpora and benchmarks.
