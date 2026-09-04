---
source: youtube
kind: first-party practitioner account (tutorial explainer)
url: https://www.youtube.com/watch?v=VIsKIzFz_zA
title: "Rust's God Mode"
author: Code to the Moon
words: 3257
extracted: 7
accepted: 1
declined: 0
leads: 1
already_covered: 1
untriaged: 2
dispatched: 0
applied: 1
shipped: 1
run_id: intake-yt-viskiz
siblings: 2
rescan_when: n/a (not a repository class)
---

# A procedural-macro tutorial, mined for its constraints rather than its API

## Class and expected yield

A **first-party practitioner account in tutorial-explainer form**: a working
Rust educator building three procedural macros live, from a pass-through to a
timing wrapper to a collection literal. Not a repository, so no clone, no
design record and no routing count — the news method applied unchanged.

**Expected yield, stated before the triage table: low, 1–2 rows.** A
language-feature tutorial is made almost entirely of proper nouns, and this
corpus is oriented at agent and platform engineering, where this language
appears as an *application stack* rather than as a subject. That prediction
held exactly.

The yield was not in the macro API. It was in the three constraints the author
hits while building — each of which he states as a working rule, and one of
which he demonstrates as a defect and then declines to fix ("I'll leave that as
an exercise"), which is the shape this method values most.

## Siblings

Two live runs on the board at Phase 1 (`intake-ghcost-2` at phase 7 holding
prompt-assembly / agent-runtime-assembly / agent-instruction-files;
`intake-mcp-1` at phase 6 holding mcp-tools). Neither overlapped this run's
homes. `build-index --check` reported `knowledge/software-engineering/index.json`
stale on entry — a sibling's uncommitted content, left alone.

## Triage

| # | Shape | Title | Prior art | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|
| 1 | technique | Emitted code must not touch the caller's namespace | none that fits | real gap | 3/3/2 | untriaged → XL lead |
| 2 | technique | Mirror an unconstructible host-bound input type | codebase-stewardship/module-design | real gap (promoted) | 3/1/2 | **accepted** |
| 3 | correction | Filter-based extraction silently accepts malformed input | 9 subjects assert it | likely catch | — | already covered |
| 4 | technique | IR strength is set by the input's contract | integration/import-normalization | partial → no home | 2/3/2 | untriaged |
| 5 | technique | Generate in the target's syntax, not as strings | none that fits | real gap | 2/3/2 | untriaged |
| 6 | — | The three macro kinds; declarative vs procedural | — | strip: nothing | — | dropped at extraction |
| 7 | — | Type inference recovered by emitting operations | — | strip: thin | — | dropped at extraction |

`auto=1/0/1`, `fp=0`.

## Row 2 — accepted, landed, applied

**Claim.** The compiler's own token-stream type is available only inside
proc-macro crates, which makes it "really hard to test", so essentially every
macro converts to a drop-in replacement type on its first line and back on its
last. Anchor: `[00:06:25]`.

**Strip test.** Survives cleanly: *when a type can only be constructed inside a
privileged host context, the logic that manipulates it is untestable; adopt a
plain mirror type at the entry edge and convert back at the exit.*

**The promoting question, executed.** The row mapped to `module-design`, whose
`io-free-core` is the corpus's answer to "make this logic testable by removing
its dependencies". The question: *does `io-free-core` cover the case where the
input TYPE cannot be constructed outside the host, so "inputs are values" is
unreachable?* Answer, from reading the file: no. All four of its properties
presuppose that a test can build the input value; its decision rule and its
"when not to use it" section never contemplate an unconstructible one, and its
alternative branch (`seams-and-adapters`) is explicitly for dependencies with
many verbs. That is a **mechanism the corpus lacks**, not a boundary case of one
it has, so it lands as a technique rather than an amendment.

**Corroboration.** Training-data convergence, spent no fetch. The rule is
reachable without the source, and the ecosystem convergence the source reports
is itself the evidence: an entire language community pays two conversions per
call, which is not a thing that happens for a stylistic preference.

**Landed.** `module-design/techniques/mirror-type-at-the-edge.md`, plus the
golden path's technique list, its prose in the seams section (as the third
answer to the testability question, after the adapter and the I/O-free core),
and its summary entry. Bidirectional. Gate green.

**Applied — `code`, verdict `better`, proof `ab-paired`.** Seam found in a
managed Next project: a four-verdict operator-console authorization gate whose
verdict was computed inline after an ambient request-scoped cookie read.

- **Arm A was run, not predicted.** A probe asserting all four verdicts on the
  project's own unit lane reached **1 of 4**: the branch that returns before the
  cookie read passed, the other three threw `cookies was called outside a
  request scope` at the same line. Reachability stopped exactly at the
  host-bound read.
- **Arm B**: cookie jar mirrored to the two optional strings the verdict
  actually reads, all four verdicts moved to a pure function in a directory the
  unit lane actually collects from. **4 of 4**, six assertions, typecheck clean,
  full lane 221 files / 3040 tests green.
- Measurable: *branches of the decision the project's own runner can reach*,
  **1 → 4**. Committed on the project's active branch with a pathspec and
  doc-sync dismissal trailers; **not pushed**.

**What the tree corrected in the technique.** The draft said the remaining shim
"contains no branches". The tree produced a counterexample worth keeping: the
shim retained one guard, because reading cookies opts the route out of static
prerendering, so a branchless shim would have changed an unconfigured route's
rendering mode under cover of a testability refactor. The technique was amended
before commit to say **the shim must take no *verdict* branch** — a guard
deciding whether to touch the host at all is legitimate wherever touching the
host has a side effect on the host. Recorded in the application document too.

A useful correction to my own premise, found while measuring: `server-only` was
**not** the blocker. The project already aliases it to a stub in its vitest
config, which is why a sibling server-only module had tests all along. The
blocker was the ambient cookie accessor alone. The first framing would have
produced a technique aimed at the wrong constraint.

## Row 3 — already covered

The hash-set macro's `filter_map` drops every token that is not a literal, so
`{1 2 3}` with the commas removed is accepted as `{1, 2, 3}`. The author
demonstrates this and leaves it ("I'll leave that as an exercise"), which made
it the most promising row on extraction — a source implementing a good idea
badly is worth more than one implementing it well.

It is nonetheless a catch. The corpus asserts "detected, never silently
accepted" in at least nine subjects across five categories, and the source's
instance adds no boundary any of them lack. Recorded so nobody proposes it
again. Anchor: `[00:15:45]`.

## Rows 1, 4, 5 — untriaged, and the XL lead they add up to

All three survived the strip test and all three are real. None was banked
without its promoting question executed (round 17's declared focus), and the
answer in each case was the same: **the corpus has no home for them.**

1. **Emitted code must not touch the caller's namespace.** The generator opens
   its own scope so it binds nothing the caller can see, and refers to
   everything it needs by absolute path so it depends on none of the caller's
   imports. Anchors `[00:04:16]` (the unhygienic version, named as a defect),
   `[00:11:07]`, `[00:11:33]`.
4. **The intermediate representation's strength is set by the input's
   contract.** The weak token tree is used when the input is a DSL and may not
   be host syntax at all; the full syntax tree is opted into only when the input
   is guaranteed to be valid host code. Anchor `[00:08:09]`.
5. **Generate in the target language's own syntax with interpolation holes,
   not as strings.** The string form loses every tool that understands the
   target — the author's stated reason is syntax highlighting, but the class is
   general. Anchor `[00:04:42]`, `[00:06:00]`.

Their homes were checked and rejected on purpose, not by omission.
`build-and-release/codegen` is the obvious guess and is the wrong one: its
golden path defines its subject as *committed source derived from other
committed source*, and all seven of its techniques (registry, triggering,
drift gates, commit policy, post-merge regeneration, file headers, failure
isolation) are inapplicable to an expansion that produces no file.
`generated-file-hygiene` is about a file impersonating an authored one, not
about lexical capture. `import-normalization/intermediate-representation` owns
an import waist and its loss ledger, not the selection of a representation's
strength.

**So this is the run's real finding, and it is an escalation rather than a
landing.** Three mechanisms sharing one home-if-new is the method's own subject
trigger, and the corpus genuinely has a coherent hole here: **compile-time code
emission** — the contract between a generator and the two worlds it touches,
the host compiler and the caller's lexical scope. `research-map` also returned
a flat "the corpus has never heard of this" for *codemod transformation*, which
sits in the same hole.

It is not forged from this source. The whole evidence base is one sixteen-minute
introductory tutorial by one educator, and a source originates a finding, never
authorizes one — a subject off this would be exactly the failure the method's
first rule exists to prevent. **E4 escalation: the operator decides.**

**Return condition:** a second independent source on compile-time
metaprogramming — a macro-system design document, a compiler-plugin API's own
guidance, or a repository whose tree carries an expansion engine — at which
point the three mechanisms above are its proposed techniques and the spec is
cheap because the anchors are already here.

## Directions

`directions=n/a` — no design record (not a repository class), so Phase 7.6 did
not run.
