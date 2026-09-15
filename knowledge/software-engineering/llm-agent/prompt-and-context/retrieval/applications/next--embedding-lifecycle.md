---
layer: application
type: application
subject: retrieval
technique: embedding-lifecycle
stack: next
status: forged
verified_on: 2026-09-15
verified_against: next@16.3
applied: simulation
ab_verdict: unmeasurable
---

# One role for both sides of a search: a pattern library, a fit score, and a tutorial

*Verified against `xkazm04/systedo-case` at `aab65a29` (`package.json` pins
`next 16.3.3`), `xkazm04/kp` at its `main` head on 2026-09-15, and
`Shubhamsaboo/awesome-llm-apps` at `4593569`. All three call the same asymmetric
embedding family, which accepts a per-call task type.*

## Case 1: the tutorial that names the wrong role

`rag_tutorials/gemini_agentic_rag/agentic_rag_gemini.py:29-37` defines `embed_query` with
`task_type="RETRIEVAL_DOCUMENT"` and makes `embed_documents` a loop over it, so every
query is embedded as a document. Across the same monorepo's RAG apps the split is four
wrong (the other three omit a model's required query prefix) against five right, which
is the tell that the choice is made by whichever wrapper was copied, not by anyone.

## Case 2: the pattern library that names no role

systedo-case grounds its AI surfaces in a library of winning patterns.
`src/lib/patterns/store.ts:158` ranks it with `embedTexts([query, ...texts])`: the query
and every pattern in one call, one role. `src/lib/patterns/embeddings.ts:66-80` sends
`embedContent` with no `taskType`, and the vector cache at `:12-18` is keyed on the text's
hash alone. The queries are short situation sentences built in `src/lib/patterns/query.ts`
(a campaign's type and ROAS); the documents are lesson texts. The two sides play different
parts, which is the case the amendment says wants two roles. Adopting it is two small
edits: a role parameter on `embedOne`, and the role folded into the cache key, so a
pattern whose text equals a query does not hand its document vector to the query.

## Case 3: the fit score that should keep one role

kp's opt-in embedding bridge (`pipeline/jobfit/embedding_bridge.py:69-90`) embeds a CV and a
job advertisement with one call and no task type, then takes their cosine. Both sides are
the same kind of thing, compared symmetrically. The amendment's rule changes nothing here,
except that the similarity role would be the explicit choice if one were named. It is the
control case.

## Why the verdict is unmeasurable

Whether explicit roles help the pattern library is an empirical question about this
workload. Czech metric sentences against Czech lessons might be close enough to symmetric
that the role is inert. That would falsify the rule here, and it was not measured. The
instrument that would measure it: a labelled query set (queries from the three builders in
`query.ts`, relevant patterns judged in one saved tenant library) scored for recall at 5
under the unspecified role and under explicit query and document roles. The key is
configured on this machine; the labels are what is missing.
