---
source: web
kind: first-party practitioner account (book form, design-dense)
url: https://stencil.so/blog/harness-playbook
title: The Harness Playbook
author: the author of the `omp` agent harness (a fork of `Pi`)
words: 21593
extracted: 30
accepted: 4
declined: 0
deferred: 3
untriaged: 3
leads: 2
already_covered: 9
applied: 4
shipped: 1
dispatched: 5
run_id: intake-stencil-harness
siblings: 3
rescan_when: "omp² ships the Director stack and the session DOM as built rather than designed (the document says states range from shipped to still being thought through, and the two load-bearing chapters are the least built); or a second independent harness publishes a postmortem of extension-owned state; or 8 weeks elapse (2026-10-30)"
---

# The Harness Playbook

A postmortem plus a replacement architecture for an agent harness, written by
the person who built the first one. Seven chapters — the state, the runtime,
the control plane, the inference, the tool surface, the interface, the stack —
each of which is a system with its forces stated. This is the densest
*design* source this skill has mined that is not a repository, and it is the
first where the routing count had to be taken over an article.

**Class and expected yield.** First-party practitioner account, in book form.
Stated before the triage table: high on design decisions, near-zero on
quotable claims, and zero fetches expected because this class corroborates
corpus-internally. Both predictions held — 0 of 3 fetches spent, and every
landing was argued against a corpus file rather than against the source's
prose.

**Container check.** 21,593 words over a document that should be an article is
exactly the "confidently large" shape that usually means a decoded container.
It was not: the first screen is prose, the body is prose, and the length is
real — the source is a book with two appendices, one of which is a complete
TLA+ specification.

**Instruments.** Four parallel design-read workers, one per system group, each
required to open the candidate golden paths rather than trust a slug map. The
maps were noisy to the point of uselessness here — *component model rendering*
returned 157 matched subjects on slug overlap alone, and the top four hits
were in three different bundles. The reliable instrument was a **directory
enumeration** of `knowledge/software-engineering/llm-agent/*/`, which is the
round-16 lesson repeating: the maps put you in a neighbourhood, the listing
tells you what is actually there. One worker found three homes by directory
enumeration that no slug search would have surfaced.

## The routing count (Phase 2d)

**30+ load-bearing decisions across 6 systems; 15 with no home.**

Per system: runtime 5 unhomed, inference 4, tool-surface/interface 3, state 1,
control plane 1. Three systems clear the per-system threshold.

**Neither clause fires a forge.** Every proposed home is the `techniques/`
directory of a subject that **already exists** — `agent-runtime-assembly` ×4,
`untrusted-extension-host` ×2, then singles across `subprocess-lifecycle`,
`structured-output`, `prompt-assembly`, `agent-cli-transport`,
`fleet-orchestration`, `terminal-multiplexing`, `session-continuation`. No
three share a *new* home, so the XL trigger's second clause does not fire
either.

This is the second run in two days to reach that conclusion, and it is now
worth stating as a finding about the corpus rather than about the source: **a
first-rate system in this domain no longer produces a subject.** The registry's
`llm-agent` category holds 34 subjects across five subcategories, and a
seven-chapter harness architecture landed entirely inside them. A forge
handoff was also structurally unavailable — `/forge` scouts a clone, and this
source is an article — so had the count fired, the path would have been a spec
plus one in-session forge worker, not a scout wave.

## What landed

Four techniques, each argued against a corpus file the director opened
personally rather than against the source's prose.

### 1. `ordered-yield-composition` — session-continuation

`single-loop-authority` holds the continuation authority **"to one value per
session"** and resolves a second claimant from a **"closed set"**: refuse /
adopt / artifact-only. All three work the same way underneath — they ensure
the second loop does not exist *as a loop*. The source runs a fourth: keep
both alive, give them a total order, and let the innermost frame see the
candidate yield first with exactly one consumer per yield.

Two things make this more than an addition. The corpus's stated **safe
default is `refuse`**, and `refuse` is verbatim the source's postmortem
anti-pattern — an exclusivity check restated by hand at six entry points, with
the user told to exit one mode before entering another. And the corpus's
`adopt` carries a reconcile-or-refuse fork for irreconcilable yield
conditions that **simply does not arise** under an ordered stack, because two
conditions evaluated at different depths never have to merge.

The `one-authority-per-vocabulary` law survives intact and is the reason the
technique is legitimate: the stack *is* the authority. The corpus's error was
identifying the authority with a behaviour rather than with an arbiter. The
landing therefore scopes `single-loop-authority` to claimants with no defined
order — one paragraph, its own sentences left true — and writes the ordered
model as a sibling.

Corroboration is **training-data convergence, not the source**: an ordered
interceptor chain with single consumption is long-established practice
(middleware chains, chain-of-responsibility) reachable without this document.
That matters because the source's own Director stack is *designed and not
fully shipped*, which alone could not authorize a technique.

### 2. `cancellation-needs-a-terminable-unit` — subprocess-lifecycle

The strongest single finding, and it is a **discriminator rather than a
contradiction**. `guest-execution-bounding` opens by stating its own
precondition: the guest runs *"on the host's thread, inside the host's
process… the operating system's remedy — kill the process — is the host's own
death."* So the corpus is right that cooperative counting is the answer *where
no terminable unit exists*. The source is right that a kill boundary is
mandatory where one does. Neither had written the question that separates
them.

Beside it, `cancellation-and-finalization` step 1 concedes the signal is
**"Best effort: the producer may comply promptly, slowly, or never"** and then
spends every remaining step on the surface — stop applying, flip the control,
finalize through one door. Honest about the display, silent about the work
that keeps burning. The technique closes that with the two counts the ladder
already knows (signalled, reaped) and the rule that placement decides
cancellability, so it must be decided in that order.

### 3. `speculative-compaction-splice` — prompt-assembly

`amortized-compaction-cadence` opens **"Two schedules, and what each one
buys"** and prices batch against amortized as a deployment-decided trade.
Both are *triggered*, and both do the work in the turn's path — which is the
shared assumption, not a law. The third schedule forks at a derived margin
below the threshold, compacts beside the conversation, and splices the summary
in as a prefix. It takes amortized's stall-free property **without** the
per-turn prefix break that document treats as the unavoidable price, because
it breaks the prefix exactly as often as batch does.

The second half is the one the corpus had no view on at all: the splice keeps
the live turns *after* the summary, so the model does not resume looking at a
handoff message standing alone as the newest thing in its history.

The landing adds the two things the source leaves out and any implementation
needs: the margin is **derived** from measured summarization latency against
tokens-per-turn (a round percentage never revisited is a threshold trigger
with extra steps), and the losing case — the live branch crosses the hard
threshold, or the summarization fails — must degrade to blocking on the
in-flight request rather than silently becoming no compaction.

### 4. `constrained-decoding-is-a-shared-budget` — structured-output

The golden path says of constrained decoding: *"Where the producer supports
grammar-constrained or schema-constrained decoding, use it"* — a per-call
quality decision, with the correct standing caution that it guarantees syntax
and syntax was never the contract. It has no notion that the capacity is
**finite and shared**: providers cap how many strict schemas a request may
carry, so enough independently authored contributions push a request past the
ceiling and the provider then rejects *every* request, including ones needing
no constraint. The request that breaks is not the one that asked for too much.

Second half: **the dialect belongs to the route, not the model.** The golden
path's third-copy rule — one definition, rendered as the machine-readable
schema sent with the request — assumes one wire schema per contract, which a
re-routed model breaks. There is one definition and potentially one rendering
per route.

## Catches — nine, and several are the corpus winning outright

1. **"Unknown, not false"** — the source states it as a compiler rule;
   `dated-capability-matrix` already carries it as a named law with a
   verification-method tier ranking the source has no equivalent of.
2. **Capability on the member, not the group** — `model-identity` goes further
   than the source: the group's advertised capability is the *intersection*,
   not the union. The source's class/provider layering never confronts it.
3. **JSON repair** — `schema-validation-and-repair` is materially stronger:
   the source says "repair malformed JSON"; the corpus bounds the loop,
   forbids deletion-shaped repairs and forbids default-construction as a
   give-up path.
4. **Small local models for harness work** — dropped as a *feature, not a
   decision*: the source gives no force beyond latency and money.
   `model-routing`'s headless-micro-call class already routes it,
   `history-compaction` adds the caution the source lacks (a summary's errors
   are not transient), and `on-device-vs-cloud` owns the placement with a
   seven-axis matrix.
5. **The shared daemon** — the source's "N agents share one dev server" aside
   is owned whole by `persistent-browser-daemon`, including the failure the
   source does not mention: busy is not dead.
6. **Ceilings vs estimates** — `host-resource-protection` is sharper than the
   source on why a blocking cap must be a ceiling, plus the nested-deadline
   rule the source's "one budget in one place" never reaches.
7. **Terminal escapes** — `output-sanitization` owns the class ("what does
   this surface execute?"), the entity round-trip and one-door-per-sink; the
   source's community-renderer example is an instance of it.
8. **Semantic over literal** — `token-enforcement` states it as an enforceable
   lint and generalizes past color.
9. **Descend an altitude** — `oracle-before-gate` names the move the source's
   interpreted-shell approval performs, *and* names the trap the source walks
   past: narrowing an item opaque **in kind** multiplies unverifiable items
   while every queue metric improves.

## Deferred — contention, not judgment (V5)

Three rows whose home is `mcp-tools`, which sibling run `intake-mcp-1` held
throughout this run with five uncommitted technique files in it. Their write
lands first; these are re-enterable behind it and carry no judgment.

- **Roster size is priced in wall clock, not tokens.** `mcp-tools`' sprawl
  section names two costs (prompt space, selection quality) and
  `catalog-projection-modes` adds a third (an externally imposed count
  ceiling). **Latency is on none of them.** The source measured it: a roster
  cut to five essential tools went from ~2× a competitor's wall clock to
  36.6s against its 42.2s, median of 6 runs, fresh session each — because tool
  grammar constrains the token *generation* process, not just the prefix.
- **A fifth catalog projection.** `catalog-projection-modes` says "Four
  projections cover the observed range" and **all four are schema-shaped**.
  The source's rule — *bounded operation set: schema; open-ended operation
  set: code surface* — is a fifth member on a discriminator the corpus does
  not use. The corpus's trigger is also narrower ("is the ceiling imposed by
  someone you do not control?"); the source projects with no external ceiling
  because of the latency cost the corpus does not know about.
- **When folding operations into one tool is honest.** `tool-schema-design`
  says "One tool, one operation", and `Read`-materializes-any-resource
  violates it with no external ceiling. But the corpus's rule targets a real
  defect (an `action` argument hiding semantically distinct operations from
  selection) that this fold does not have. Missing discriminator: *a fold is
  honest when the operations are one operation from the caller's point of
  view and the variant is derivable from the arguments; dishonest when the
  caller must choose among them.*

## Untriaged — with promoting questions executed

Per the round-17 focus, no row is banked here without its promoting question
answered.

- **Delta storage is not inherently ancestry-dependent** (`checkpoint-mode-custody`).
  Its enumeration couples "delta ⇒ walking ancestry ⇒ not self-contained". The
  source ships deltas that *are* self-contained because the materialization
  unit is the whole session at a journal point, not a checkpoint row.
  *Promoting question:* is the non-self-containment caused by delta encoding
  or by checkpoint rows plus ancestry pointers? *Answer:* the latter — which
  promotes the row to a real gap, but its landing is a rewrite of a technique
  in a subject carrying an uncommitted sibling file, so it is banked rather
  than declined.
- **Producer-cadence smoothing is not adaptive flushing** (`render-throttling`).
  That technique forbids an adaptive cadence and is right: speeding up flushes
  under load costs most exactly when the stream can least afford it. The
  source varies the *release rate of buffered content* while holding the flush
  interval fixed — a different knob. *Promoting question:* does the technique
  distinguish arrival cadence from flush cadence on the input side? *Answer:*
  no, it draws that line only between arrival and render, so a reader
  following it declines to smooth. Real gap, small, and it needs the
  guardrails the source omits (never reorder, never drop, bypass at
  finalization).
- **The transcript-as-protocol technique** (E9) scored `accept` (3/1/3) and was
  **not executed** — capacity, not judgment, and recorded as such. Anchors:
  `chat-transcript` states one lifecycle for all rows ("Streaming and settled
  are two phases of one turn, never two elements that swap") and therefore
  nothing licenses committing a streaming row's prefix early — safe on a
  re-renderable scroll container, unavailable on irreversible native
  scrollback. `terminal-multiplexing` owns the substrate but treats replay as
  a bounded ring for re-attach, never as an exactly-once history with a
  resize policy.

## Leads

- **Formal specification as a design practice has no home in the corpus.** An
  uncapped concept sweep (temporal logic, model checking, refinement,
  invariant checker, property-based, fuzzing) returns 40 files, and *all* of
  them are input generation — `test-input-generation` owns "generate inputs
  against a model", including `model-based-oracle` and `exhaustive-when-bounded`.
  Nothing owns "specify the invariant and get a counterexample." The source
  replaced a fuzzer with a TLA+ model for exactly this reason and ships the
  spec. **Return condition:** when a second source specifies rather than
  fuzzes a protocol, or when a fleet project has an invariant a test cannot
  reach.
- **Language choice as a prior for machine-generated code.** The source argues
  that defaults, standard libraries and canonical project shapes act as a
  prior on what a model writes, and that a language permitting twenty equally
  normal local styles asks the model to make twenty decisions before reaching
  the product problem. Interesting, unproven, and the source's own evidence is
  an anecdote about widget prompts. **Return condition:** when someone
  measures it — same prompt, same model, two ecosystems, a rubric.

## Applied — 4 owed, 4 written, 1 shipped

- **`constrained-decoding-is-a-shared-budget` → tracklight, `code`, `better`,
  shipped.** The dialect half was already built correctly there (one schema
  rendered into three provider dialects, with an overridable base URL — the
  technique's "same model, several routes" force, live). The budget half has
  no seam: one claimant only, recorded as the case where the rule is genuinely
  unnecessary. **The structural fact nobody designed:** the result type already
  degrades the *sibling* guarantee in-band — `determinism: Determinism`, read
  at 66 sites, explicitly weaker when sampling knobs were rejected and
  retried without them — while schema enforcement rode on `eprintln`. So a
  caller could not distinguish provider-enforced syntax from prose that looks
  structured, and parsed the second as the first. Measurable: call sites that
  can tell the two apart from the value they hold — **A=0, B=all**. Shipped
  with a proof test; `cargo fmt --check` and `clippy -D warnings` green, 127
  engine tests pass.
- **`cancellation-needs-a-terminable-unit` → personas, `experiment`, `better`.**
  `cancel()` fires a cooperative token and writes `"Cancelled by user"`
  unconditionally; the stale sweeper does the same on a timer. **29 spawn
  sites, 2 bind the handle, and both are in a unit test** — 27 production
  tasks are un-abortable, so reaped is not low but structurally zero, while
  `.abort()` is used 15 times elsewhere in the tree. The mechanism exists and
  is not wired to the cancel path. The tree concedes it in its own doc
  comment. Filed as the project's next change with the cheap half separated:
  stop asserting a reclaim before making the population reclaimable.
- **`ordered-yield-composition` → unapplied.** personas has 18 restated checks
  of two mode flags across 8+ files — the right *shape* — but its modes gate
  permission rather than a candidate yield, and claiming the mechanism applies
  without establishing that would be the overclaim this method warns about.
  Return condition: when a fleet project grows two behaviours that each want
  to hold a session open.
- **`speculative-compaction-splice` → unapplied.** No fleet project runs a
  conversation-window compaction it owns; personas' compaction hits are memory
  and review records, not transcript spend-down. Return condition: when a
  project compacts a transcript against a provider window.

## Instrument notes for the next run

- **The board's `check` disagreed with the board's own `list`.** `list` showed
  `intake-mcp-1` holding `mcp-tools`; `check` on the full nested path returned
  *clear*, because the sibling's claim is registered in a shorter path form
  (`software-engineering/llm-agent/mcp-tools`) and the strings never matched.
  Two independent observations (the listing, plus five untracked files in that
  subject) beat the one instrument that had to normalize a path. **Do not
  trust `check` alone to establish an absence of contention.**
- **A PowerShell here-string inside the Bash tool** silently produced a commit
  whose subject line was `@`. Caught by reading the message back; fixed by
  amend. Use a heredoc in Bash, per the tool's own instruction.
- The three `mcp-tools` deferrals are the highest-value re-entry available to
  the next run: all three are argued, anchored, and blocked only on a sibling
  finishing.
