---
source: tkdodo.eu/blog/the-vertical-codebase
kind: first-party practitioner account
url: https://tkdodo.eu/blog/the-vertical-codebase
title: The Vertical Codebase
author: Dominik Dorfmeister
words: 1889
extracted: 8
accepted: 1
declined: 0
leads: 1
already_covered: 2
untriaged: 4
applied: 1
shipped: 0
dispatched: 0
run_id: intake-vertical-0831
siblings: 2
---

# The Vertical Codebase

A practitioner post arguing that codebases should be grouped by domain rather
than by technical kind, written from ten-plus years of one product's decay.
**Class: first-party practitioner account** — the author works on the codebase
he uses as the worked example, so the account of what it looks like now is the
reliable half and the general prescription is n=1. Expected yield was stated
before the triage table as one to two findings, mostly catches, likely zero
fetches. That is what it produced. **0 of 3 fetches spent** — sixth consecutive
zero-fetch run for this class.

Two live siblings at claim time, both mining repositories by the same author
(`knip`, `pacer`); neither held `module-design`. By Phase 7 the board carried
seven live runs and the count is the reason this note records which subjects
were held rather than only which were written.

## The catch that shaped the run

The post's thesis — group by what code *does*, not what it *is* — is already
in the corpus, stated more generally and without the proper nouns the post is
built from. `module-design/locality-and-leverage` carries it in one sentence:

> Where a directory's name no longer predicts its contents, or where
> implementing one feature requires editing in three sibling trees, the
> grouping is describing a taxonomy of *kinds of file* rather than a taxonomy
> of *reasons to change*.

That single paragraph catches candidates 1 and 2 — the thesis and its
detection signature both. `structural-improvement-loop` independently lists
"a grouping whose name no longer predicts its contents" as a sweep candidate.
Nothing in the post's main argument was new to this corpus.

**The yield was in the section the post is least proud of.** Its closing
"Where's the catch?" names a cost of the structure it advocates: private code
means teams re-implement the same things. That is the half the corpus did not
have, and it survived because the corpus's own instruments cannot see it.

## Candidates

### 1. Group by domain, not technical kind — ALREADY COVERED
`module-design/locality-and-leverage`, physical co-location paragraph. Stated
better than the source and without product names.

### 2. Decay signature: one concern split across N kind-trees — ALREADY COVERED
Same paragraph ("editing in three sibling trees"), plus
`structural-improvement-loop` stage 1.

### 3. Hiding has a discovery cost the subject never prices — ACCEPTED
Anchor: *"Having 'private' code runs the risk of multiple teams
re-implementing the same things from scratch."*

Landed as an amendment, `## The cost that neither payoff prices`, inside
`locality-and-leverage`, plus one failure-mode bullet and two pointer edits in
the golden path.

Found by the enumeration hunt. The golden path's failure-mode list has nine
entries and **every one of them is structure being too weak, misplaced, or
decorative** — the structure nobody chose, depth in the wrong place, classitis,
the decorative seam, leaked information, temporal decomposition, the taste
argument, the unreviewable diff, green and rotting. There was no failure mode
for a boundary that *succeeded*. The subject prescribes hiding aggressively
("hiding is active, not passive"; internals opaque rather than merely
undocumented) and separately treats re-implementation as a defect — fifteen
times across the bundle, always as something fixed by *creating* a shared
primitive — and never connects the two.

The amendment's content, and the reason it is an amendment rather than a
technique: it extends the payoff model that file owns. Leverage is defined as
capability obtained per unit of interface learned, which silently assumes the
capability was *found*; discovery precedes learning. Hiding a module's
internals is free to callers and is what depth buys. Hiding its existence is a
different act with a different price, delivered by the same declaration as a
side effect nobody chose. The discriminator is the file's own change-coupling
test pointed the other way — would the two implementations have to change
together? Yes means waste caused by invisibility; no means the file's existing
rule already governs it and duplication is cheaper than the wrong abstraction.
That second branch is why this completes an axis the file had half-drawn.

Corroboration: no fetch. Training-data convergence — the autonomy-versus-
duplication trade is long-established (deliberately duplicating rather than
sharing across team boundaries, and the internal-sharing programmes that exist
because org boundaries make code undiscoverable), and it had simply never been
imported into this subject. Corpus-internal corroboration is stronger here
than a fetch would have been: the finding is a gap in *our* model, and the
file already carried the opposite pole.

### 4. Co-location buys cohesion, never decoupling — UNTRIAGED
Anchor: *"immediately increases cohesion, but doesn't automatically reduce
coupling."* The sequencing claim — that the regrouping move is a half-move and
people stop after step one — is not stated in the golden path, which names
visibility as gateable without saying the co-location move alone is
insufficient. Adjacent to what landed as #3; not verified.

### 5. Shared code becomes its own vertical, not a `shared/` bucket — UNTRIAGED
Plausibly caught by "a grouping whose name no longer predicts its contents",
which is exactly what a `utils/` bucket is. Not opened.

### 6. Routes as the seed heuristic for finding groupings — UNTRIAGED
Hedged in the source ("that's a good start"), n=1, and
`structural-improvement-loop` owns candidate discovery. Thin.

### 7. Structure gates agent effectiveness, not only agent output — LEAD
Anchor: *"agents are so good at new codebases, but not very effective on
codebases that have grown organically over years."* The golden path's "Why
this stopped being a slow problem" owns the forward direction — agents produce
structural erosion, with a benchmark cited. The source asserts the reverse
edge: prior structure sets agent throughput. If true it closes a loop, because
the thing degrading the structure is the thing the structure degrades.
Unmeasured opinion in the source, so it is banked rather than landed.
**Return condition:** when a measurement compares agent task success across
codebases of differing structural quality, or when a managed project has
enough trajectory history to compare its own well- and badly-structured
regions.

### 8. Boundaries need a gate, not a convention — UNTRIAGED (likely catch)
`quality-gates/enforcement-binding` and `prose-rule-drift` almost certainly
own "a rule not bound to a gate is prose". Not opened; the budget went to #3.

## Applied

One row owed, one filed. `experiment` mode, verdict `better`, on `personas`
(Rust workspace, commit `fe48e30e6`). Two arms over one tree: the technique's
existing scatter diagnostic against the amendment's signature. 232 candidates,
67 invisible to scatter, 52 surviving a forwarding-wrapper filter.

**The first instrument design was refuted by hand-verification and that is the
useful part.** Its top-ranked candidates — six `validate_*` functions and
`is_private_ip` — are private adapters forwarding to the public
implementation, which is the single-door discipline `seams-and-adapters`
prescribes, not duplication. Name collision plus visibility is not a detector.
The corrected predicate excludes a body that calls a function of its own name,
and only then does the measurement mean anything.

Three survivors were opened and they split along the amendment's own
discriminator: `strip_html_tags` (three copies, one public, one an identical
private duplicate, one a hand-rolled state machine that decodes no entities —
waste), `now_ms` (three byte-identical bodies, one public — waste), and
`hours_since` (two genuinely different jobs — correct divergence, governed by
the rule the file already had). The discriminator sorting them is the evidence
that the amendment is usable and not just true.

**Ship: 0. Blocker class: confirmation.** The operator's pick named a
candidate, not a project, and Phase 8 requires confirmation before a project
tree is touched. A secondary **indeterminacy** blocker sits on one of the two
waste cases independently: the chunker's weaker stripper may be deliberate —
the sanitizer library in a chunking hot path is a cost, and changing the strip
semantics moves chunk boundaries and therefore embeddings. The db-layer copy
carries no such question, being byte-identical to the public one.

## Run notes

- The gate went red at Phase 7 on
  `quality-gates/applications/node--excess-indicts-the-instrument.md` (unknown
  status `field-tested`; malformed `verified_against`), a file belonging to the
  live `knip` sibling. Not mine to fix; reported, not touched.
- Purity grep clean against the source's whole vocabulary, which for this post
  is unusually dense: a product name, a lint plugin, a build tool, a package
  manager, two framework names and the post's own two organising adjectives.
