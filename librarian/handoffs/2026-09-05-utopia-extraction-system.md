# Handoff — the extraction and ontology system of `github:deeplethe/utopia`

status: BANKED (operator focus excluded this system; not dispatched this session)
source: `librarian/sources/2026-09-05-utopia.md` (design record, system X)
commit: `75a44cbc9263a6cfe78ae4cd80b1770ede1df790`
origin: the source ORIGINATED these gaps; it does not authorize a word of them.
target: `software-engineering/llm-agent/prompt-and-context/llm-extracted-entity-graph`
  (EXISTING subject, four techniques, forged 2026-09-03 from ONE source — this tree is
  its first counterpart, so the dispatch is a reconcile as much as a deepen)
engine: `/deepen` (scoped, one subject) or `/reconcile` (the subject is single-sourced)

## Why banked and not dispatched

The intake run on 2026-09-05 was scoped by the operator to three questions — the
registry as a knowledge base, the memory system for agents, and Rust craft. The
extraction and ontology system is the largest system in the tree (six of the twenty-one
decision records, three write paths, a measurement bench) and it is outside all three.
Its routing count is written below so the next run does not re-derive it; a run that
opens this file with the clone at the pinned commit can dispatch in one step.

Routing count for system X: **2 NONE, 2 partial, all four sharing one existing home.**
Under v2.2 that is a technique pair-to-triple inside `llm-extracted-entity-graph`, not a
forge. The subject's own opening says it owns "what is left when no identity authority
exists"; every entry below is inside that boundary.

## The entries (from the design record)

**X1 — argument order is enforced by the signature at write time; types remain
guidance.** Forces: a declared vocabulary with domain and range on 97.8% of its
properties; the model wrote `person employee organization` backwards in 102 of 130
checkable facts across three rounds of prompt wording (57% → 35% violation rate, true
reversals flat at ~17%). Decision: when the subject violates the domain and the object
satisfies it, swap by signature and leave a `direction_corrected` trace; when the swap is
also illegal, drop the predicate and keep subject, object, time and evidence, with the
model's word surfaced as the relation's wording. Buys: reversals 39 → 0, violation rate
4%. Rejects: more prompt wording (measured flat), automatic swapping before entity types
were trustworthy (the "ancestor floor" had to land first). Where: decision record 0012
and `docs/pipeline.md` § 1; `ontology::judge_direction` in the store, shared by
extraction, adoption and merge (#190 / #196). Corpus: NONE — the subject's techniques
cover identity, accumulation, recall passes and fan-out writes; none owns what happens
when a typed relation's *direction* is a key-encoding convention the model cannot be
prompted into. Distinguish from types: "which types may participate" stays guidance
because a wrong gate destroys data systematically, "which side is the subject" is
enforced because it is not a claim about the world. Proposed slug:
`signature-enforces-order-not-type`.

**X2 — counting decides adoption; the model keeps only the question that needs meaning.**
Forces: an ontology that feeds back into the extraction prompt, so one document's
accidental wording becomes a standing instruction; the model asked to pick relations
skipped an 8-document phrasing and adopted a 1-document one. Decision: group phrasings by
inflectional base, count the union of documents per group (never a sum), adopt at
`MIN_DOCS = 2`; the model is asked only whether two groups are synonyms, reversibly.
Buys: deterministic adoption — the same corpus produces the same ontology, so the bench
can compare this stage at all. Rejects: subject-diversity thresholds (stricter, worse),
fact-count thresholds (admits the worst two), stemming (strips derivational suffixes,
`producer` = `produces`). Where: record 0007, `predicate_match::merge_key`. Corpus: NONE
— `accumulate-then-threshold-merge` is about a *node's* description, not the
vocabulary's growth. Proposed slug: `counted-adoption-into-the-vocabulary`.

**X3 — an undecided type and an unnamed relation stay empty.** Forces: a fallback class
used as control flow ("not decided yet" sitting in the ontology as if someone had
decided) and a fallback relation that was 40–55% of edges and displayed as "related".
Decision: nullable `type_id` and `predicate_id`, no sentinel row, wording recovered at
read time through one SQL function; the reader is told where a word comes from
(lighter edge, "not in the ontology; this is the source's wording"). Where: records
0009, 0010, `fact_surface_predicate`. Corpus: **partial** — the law
`unknown-is-not-a-value` covers the principle; the subject does not say what an
extraction writes when the vocabulary has no word. Promoting question: does
`surface-form-identity-and-its-risk` or the golden path state the empty-not-fallback
rule for *relations*? (Not read this run.)

**X4 — prefer splitting over merging; a namesake tie goes to review, not to candidate
order; a merge redirects pending pairs instead of closing them.** Forces: a wrong merge
mixes two entities' facts, which costs far more than one extra entity; two same-profile
candidates scored equal and the older code attached to whichever came first; containment
recall runs only at creation, so closing pending pairs on merge was permanent. Decision
and measurement: four runs over one corpus, entities merged 14 → 37 → 47 → 57, each fix
exposing the next layer (`docs/pipeline.md` § 2, "Three holes, one corpus"). Corpus:
**partial** — `surface-form-identity-and-its-risk` states the split/collision asymmetry
(catch) but not the queue mechanics: the tie rule and the redirect. Promoting question:
does any technique say what a merge does to *pending* pairs? If not, it is a boundary
case for an amendment there, and the tie rule is its second paragraph.

**Also in the tree, for the same dispatch:** the bench's rules (one fresh database per
run; a corpus the model has read must carry no accuracy key by design; `for_review`
counted as a miss; answer-key errors fixed only after the run, with the reason). The
eval-harness subject likely covers the revision rule; the memorised-corpus rule was not
found in it this run.

## Reconcile debt named up front

`llm-extracted-entity-graph` was forged from one repository on 2026-09-03 and has one
application. This tree is a second implementation of the same object under a *stronger*
regime (an imported vocabulary with signatures, a bitemporal ledger beneath, human review
queues) and disagrees with the subject's source on at least one point worth recording:
the subject's source normalises names and hopes; this tree keeps same-name entities apart
by type and profile and routes the doubtful pair to a person. The dispatch should read the
subject's golden path § "The key is a string" against `docs/pipeline.md` § 2 first.
