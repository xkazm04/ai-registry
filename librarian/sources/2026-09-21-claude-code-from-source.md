---
source: claude-code-from-source
kind: derived-architecture-book (repository) + first-party pipeline half
url: https://claude-code-from-source.com
repo: github.com/alejandrobalderas/claude-code-from-source@a6d5e452
title: "Claude Code from Source - Architecture, Patterns & Internals"
author: alejandrobalderas (book written by an agent pipeline)
words: 996 landing / 71197 in-tree
extracted: 16
accepted: 2
declined: 0
already_covered: 8
untriaged: 4
leads: 2
dispatched: 0
applied: 2
shipped: 1
run_id: cc-source-0921
siblings: 0
rescan_when: "a second edition or a chapter set regenerated against a post-2.1.27x build lands (the mined commit describes an ~2026-04 snapshot); or 8 weeks elapse (2026-11-16)"
---

# Claude Code from Source

## Class, and the expected yield said out loud first

Two systems in one source, with opposite reliability, routed per half.

**The book half** is a **second-hand derived account**: 18 chapters about a
system the author did not build, reconstructed by an agent pipeline reading
shipped source maps. It cannot authorize a claim about that system's behaviour
— the running harness on this machine is a higher tier and a newer one. The
mined commit is dated **2026-04-03**, roughly six months before this run, so
every version-shaped claim in it is a statement about a past build.

**The pipeline half** — the repo's own prompt and operating documents — is a
**first-party practitioner account**: the author built that, ran it, and
reports counts.

Expected yield stated before the table: **low on content, high on catches.**
This registry's `agent-memory`, `prompt-assembly`, `agent-instruction-files`,
`agent-runtime-assembly` and `quality-gates` subjects were forged and deepened
partly from agent-harness material, so a book describing an agent harness was
predicted to hit dense prior art. It did — 8 of 16 candidates are catches, and
in most the corpus states the rule better than the source does.

## The ingest read the advertisement; the tree is 71x bigger

`research-ingest` returned **996 words** — the landing page. The repository
behind it holds **71,197 words** across 18 chapter files plus the pipeline
prompt. Phase 2b applied: cloned at `a6d5e452`, swept operating documents
first (`CLAUDE.md`, `prompts/`), then the synthesis chapter, then the chapters
with the densest design content, README last. A note whose `words:` was the
first number would have mined the ad.

## Design record and the routing count

Grouped by system, per v2.2. Product names retained here; stripped at landing.

**System A — the described agent runtime.** 14 load-bearing decisions read
(generator loop with typed terminal states; files over a database for memory;
an LLM side-query selecting from a manifest rather than embeddings; warn on
staleness rather than expire; always-on index plus on-demand bodies;
self-describing tools carrying their own concurrency safety; speculative tool
execution during streaming; byte-identical prefixes for cache sharing across
forked children; hook config frozen at the trust boundary; two-phase skill
loading; response slot reserved at 8K and escalated to 64K; background
extraction as a cooperative safety net; the memory-path override excluding
repository-writable settings; disabling a capability requiring every
independent prompt-carrier to be disabled).

`corpus: NONE` count for System A: **1** — the response reservation. One more
(`the memory-path override`) resolved to a boundary case of a mechanism the
corpus already owns rather than a hole.

**System B — the book-production pipeline.** 6 decisions (research artifact is
an input never a draft; the human gate sits at the outline not the output; a
separate audit pass over the finished artifact for a constraint the generator
was already given; a revision phase whose dominant operation is deletion; a
clock-proofing rule inside the generation instruction; one concept one home
with cross-references). `corpus: NONE` count: **0**.

**Routing decision: stay in intake, no forge handoff.** Neither system reaches
three unmodelled decisions, and the `HOME IF NEW` clause does not fire either —
the one NONE has an existing home. That is the honest and slightly surprising
count: the corpus already models this architecture, which is what six months of
deepening against agent-harness material bought.

## Triage

Admission gate v2.5 (scored). Currency and lead rows routed under the
corroboration table rather than scored, per v2.8.

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Read | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Size the response reservation from the output distribution | prompt-assembly/context-budgeting | new-technique | 2/0/2 | real gap | **accept** |
| 2 | K | amendment | S | A non-code key under a permission carve-out is an authority | agent-runtime-assembly/operator-tier-code-loading | corrects-claim | 2/0/1 | real gap | **accept** |
| 3 | K | technique | M | The always-on tier must be governed as strictly as the on-demand tier | agent-memory/decay-and-forgetting | none | — | catch | already covered |
| 4 | K | technique | M | A prose rule in the producer's own instruction is not a gate | agent-instruction-files/enforcement-demotion | none | — | catch | already covered |
| 5 | K | technique | M | LLM recall beats keyword and embedding selection | agent-memory/recall-injection, scope-before-similarity | none | — | catch | already covered |
| 6 | K | amendment | S | Two caps, where the byte cap catches what the line cap misses | quality-gates/prose-rule-drift | none | — | catch | already covered |
| 7 | K | technique | M | Separate the subject of a question from the shape of its answer | agent-memory/recall-injection | none | — | catch | already covered |
| 8 | K | amendment | S | Warn about staleness, never expire | agent-memory/decay-and-forgetting, stale-served-versus-stale-answered | none | — | catch | already covered |
| 9 | K | technique | M | Lock body carries the holder; liveness beats the clock | concurrency-guards/cross-process-exclusion | none | — | catch | already covered |
| 10 | K | technique | M | Two-phase loading: metadata at startup, body on demand | agent-instruction-files | none | — | catch | already covered |
| 11 | K | amendment | S | A zero selection rate means different things at different denominators | agent-memory/coverage-instrumentation, recall-injection | none | 1/1/1 | partial | untriaged |
| 12 | K | amendment | S | Render the derived quantity, not the raw datum, when the model must reason on it | agent-memory/observation-clock | new-technique | — | partial | **lead** |
| 13 | K | technique | M | Disabling a capability means disabling every independent prompt-carrier | agent-instruction-files | none | 1/1/2 | partial | untriaged |
| 14 | K | technique | M | Per-invocation rather than per-type concurrency classification | concurrency-guards/guard-key-design | none | 1/1/2 | partial | untriaged |
| 15 | P | practice | S | A revision phase whose dominant operation is deletion (38% cut) | — | none | 1/2/1 | thin | untriaged |
| 16 | — | currency | S | The mined snapshot is ~6 months stale against the running harness | — | resets-clock | — | — | **lead** |

`auto=2/0/0` `fp=0`.

### Row 1's promoting question, executed

Row 1 arrived as `partial` — `context-budgeting` derives the global budget as
window minus response room minus margin, so the reservation is plainly in the
corpus. The promoting question: *does anything model the reservation as a
number the system chooses, rather than as a constant it is handed?* One file
read answered it. The technique names exactly one failure at that subtraction —
an answer squeezed to nothing — which is the **far** end. The near end (a
reservation charged on every call whether used or not) is unmodelled, and the
measurement that would size it sits one subject over in `output-budget-signal`,
collected and spent on a different question. Promoted to `real gap`.

The absence was established uncapped and with controls, per the last run's
declared focus: a positive control (a phrase known to exist returned exactly
its one file) and a negative control (a nonsense phrase returned zero) before
any absence was believed, then six uncapped patterns across the whole knowledge
tree.

### Row 2's argument

The technique's decision rule and its mechanical test are both stated over keys
that **name code**. A runtime can pass that test and still hand the untrusted
tier equivalent power through a key whose value a standing permission carve-out
consumes — no code named, tier check correctly answers no. The amendment widens
the rule from *code* to *authority* and adds the carve-out-inward audit. Scored
`+1` for refuting something the corpus asserts: the file's own test returns
green on a runtime compromised this way.

## Catches worth recording

The corpus does not merely cover these; in most it is sharper than the source.

- **Row 3** is the source's headline memory design, and `decay-and-forgetting`
  carries the rule almost verbatim — the always-on tier governed at least as
  strictly as the retrieved one, *because standing beats relevance* — with the
  measurement behind it, the per-tier reporting rule, and the observation that
  the tier with the least retrieval pressure is where a dead entry survives
  longest with the most authority. The source describes a design where nothing
  is ever retired and does not notice this is a question.
- **Row 5** is priced rather than corroborated, per the memory lane: the
  measured ladder puts verbatim storage with hybrid retrieval at 0.87 and raw
  retrieval at 0.89, *above* the compiled-truth arms at 0.84-0.86. The source's
  claim that model-driven selection beats embedding similarity is an argument
  about negation handling and infrastructure, not an accuracy result, and the
  ladder says store topology is not what separates arms — supersedence is.
- **Row 7 answers one of the memory lane's own open questions**, which is the
  most useful thing this run learned about the corpus rather than about the
  source. The lane lists "nobody separates the subject of a question from the
  shape of the answer it asks for" as an open contribution; `recall-injection`
  landed it, with a measured example and two complementary repairs. The lane's
  open-questions list is stale.
- **Row 4** is the pipeline half's best material and it lands on
  `enforcement-demotion`, which already states that a rule which must always
  hold, written as prose, is violated on schedule, and that the gate must
  observe the artifact rather than the model's intention to comply. The source
  supplies a number for it — an audit pass found 35 verbatim copies across 18
  chapters, against a generation instruction that had forbidden them in its own
  text. A measured rate for a rule the corpus already prices.

## Leads

- **Row 12 — staleness rendered as elapsed days rather than as a timestamp.**
  The source reports a small eval (3/3 against 0/3, identical body text) for
  framing a memory's age as an action cue at the decision point. Second-hand,
  tiny n, and the memory lane's rule is explicit that a published memory number
  is a lead and never evidence. It is also *testable here*: the memory-year
  harness takes a new arm in a few hundred lines. **Return when a
  staleness-rendering arm is run on that harness** — same store, same judge,
  age rendered two ways.
- **Row 16 — the source is a dated snapshot of a system this fleet witnesses
  directly.** Mined commit 2026-04-03; this registry's own memory holds
  verified harness facts from the 2.1.26x-2.1.27x line. Nothing to land: the
  corpus makes no claim keyed to that system's version, so there is no clock to
  reset. Recorded so a later run does not mistake the book for current.

## Untriaged

Rows 11, 13, 14, 15. Anchors held; nobody verified them and no judgment is
implied. Row 11 is the closest to real — `recall-injection` enumerates *two*
zero-item outcomes (empty vs failed) and the source splits the first one again
by denominator, which is the enumeration hunt firing — but `coverage-
instrumentation` already owns the denominator discipline and the increment was
not worth a landing on one source.

## Instruments and discipline

- 0 of 3 fetches spent. Corroboration was training-data convergence plus code
  read in a connected tree, which the class predicted.
- `research-map` run twice (14 terms, then 7, then 4), plus six uncapped greps
  with a positive and a negative control before any absence was believed.
- 0 siblings live at claim and throughout; no contention, no content lock taken.
- The declared focus's `when not to use` grep over the source returned **empty**
  — this book has no such blocks. Its "what transfers, what does not" section is
  the equivalent and was read. The focus paid off in the other direction: the
  hunt run against the *corpus* found `operator-tier-code-loading`'s own
  when-not-to-use block, which confirmed the amendment's scope.
- Clone deleted at Phase 9 by run id.

## Apply

Two rows, both `not-better`, both for honest reasons — and the first one is the
run's best moment. The tracklight seam was chosen because it could falsify (the
tree sets its own ceiling deliberately), and it did: the technique's headline
advice was already taken and its precondition fails there, so the recurring
cost it exists to recover is zero. What the seam returned instead was a 3.91x
overcommit between two crates that size the same response and never read each
other, with the request type carrying no field through which the derived number
could travel. Filed as a task in the project's own tree (`13dffd6`), not
shipped, because the fix is a type change across provider paths.
