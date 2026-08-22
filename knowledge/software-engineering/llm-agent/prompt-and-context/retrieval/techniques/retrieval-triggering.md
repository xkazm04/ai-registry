---
layer: technique
type: technique
subject: retrieval
technique: retrieval-triggering
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary, derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [deciding whether a request needs the corpus at all, cutting retrieval latency and context spend, diagnosing answers that were degraded by irrelevant recall, wiring a retrieval call into an agent turn]
---

# Retrieval triggering

Every other technique in this subject begins at *query*. Something upstream had
already decided to retrieve; the pipeline's job was to do it well. This
technique owns the decision itself: **should this request consult the corpus at
all?**

It is a real decision with a real cost on both sides, and leaving it unmodelled
means it gets made implicitly — usually as "always", occasionally as "whenever
this particular call site remembered to". Retrieval that should not have run
costs latency, spends context budget that the request needed for something
else, and — worst — injects material the consumer will treat as evidence
([relevance-floors](./relevance-floors.md) explains why presence in the slice
*is* the judgment). Retrieval that should have run and did not produces a
confident answer from parametric knowledge alone, which is the failure mode
that looks most like success.

## The decision rule

Retrieve when the request depends on something the model cannot be assumed to
carry. That resolves to four triggers, and they are worth enumerating because
"is this a knowledge question?" is too vague to implement:

1. **Named specifics.** The request names an entity, identifier, document, or
   value that belongs to the corpus rather than to the world — a record, a
   customer, an internal decision. Anything the model could only know by
   having read this corpus.
2. **Recency past the horizon.** The request is about a period after the
   model's knowledge ends, or about state that changes faster than any
   training run.
3. **Precision the model cannot be trusted to hold.** Exact figures, quotes,
   version numbers, dates. A model that half-remembers these produces the
   most expensive kind of wrong answer, because it is specific.
4. **An explicit ask.** The consumer requested grounding. This one is not a
   judgment call, and it outranks every heuristic below.

And skip when the request is fully answerable from general competence: a
reformulation, a summarisation of material already in context, a stylistic
transformation, small talk, an arithmetic step. The tell is that nothing in the
request points *outward*.

## The trigger is one authority, not a habit at each call site

Whether to retrieve is a vocabulary
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
and every call site that decides for itself is another dialect of it. Three
agents that each "retrieve when it seems relevant" will disagree about the same
request, and no one can answer "why did this turn consult the corpus and that
one not" — which is the question that arrives the first time an answer is
wrong.

So the trigger lives in one place, takes the request and the available corpora
as input, and returns a decision with a **reason**. The reason is what makes
the whole thing debuggable: `retrieved: named-specifics` and
`skipped: no-outward-reference` are records; a bare boolean is not.

## A skip is not an empty result

The three-way distinction this subject already insists on for results applies
one stage earlier
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Downstream, and in any trace, these are three different facts:

- **Not retrieved** — the trigger decided the request did not need the corpus.
- **Retrieved, nothing qualified** — the corpus was consulted and does not
  speak to this query. The honest empty.
- **Retrieval unavailable** — a lane was down, an embedder was missing, the
  index was mid-rebuild.

Collapsing them produces the two classic support conversations: "why didn't it
use my documents" answered with a shrug, and a degraded system reporting the
same shape as a healthy one that found nothing.

## Confidence, and the cost of being wrong in each direction

The trigger is a classifier, so it has two error modes and they are not equally
expensive. A false skip yields an ungrounded answer the consumer cannot tell
from a grounded one. A false retrieve yields wasted budget and some irrelevant
context, which the floors are already there to blunt.

**The errors are asymmetric, so the threshold is not the midpoint.** Bias
toward retrieving when uncertain, and let relevance floors absorb the cost of
being over-eager — that is the layer built for it. The exception is a request
where injected irrelevance is itself dangerous (a rewriting task that must not
absorb foreign facts), and those are enumerable rather than inferred.

## Escalation beats a perfect first guess

The trigger does not have to be right once. A cheap, permissive first pass plus
a **retrieve-after-the-fact** path is usually better than an expensive
classifier: the agent starts to answer, notices it needs a specific it does not
have, and retrieves then. This converts a prediction problem into an
observation problem, and observation is more reliable.

The rule that keeps it honest: a late retrieval is still a retrieval and is
recorded as one. An answer that was revised after consulting the corpus has a
different provenance from one that was grounded up front, and the trace should
be able to tell them apart.

## The threshold is derived and says how to recompute it

Any tuned trigger — a similarity cutoff, a classifier score, a heuristic
weighting — is a derived value and
[names its recomputation](../../../../_laws.md#derivation-names-recomputation).
It is derived from a labeled set of requests with known correct decisions, the
same machinery
[retrieval-evaluation](./retrieval-evaluation.md) uses for floors, and it is
owed a revisit whenever the corpus's scope changes, whenever a new corpus is
added, and whenever the model behind the trigger changes. A trigger tuned
against one corpus and inherited by a second is measuring nothing.

Measure both directions. Skip rate alone looks like efficiency; skip rate with
its false-skip rate is the actual finding
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
