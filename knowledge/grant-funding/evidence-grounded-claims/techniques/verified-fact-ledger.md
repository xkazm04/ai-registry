---
layer: technique
type: technique
subject: evidence-grounded-claims
technique: verified-fact-ledger
status: forged
laws: [never-fabricate-a-figure, provenance-per-field]
shared_with: []
use_when: [wiring organizational documents into a drafting pipeline, deciding what a generated narrative may state as fact, turning uploaded files into reusable grounding]
---

# Verified fact ledger

Uploaded organizational documents are inert bytes until something turns them
into claims a draft can safely make. The verified fact ledger is that
something: a typed, confidence-scored, source-cited store of facts extracted
from the organization's own documents, which serves as **the sole
authoritative number set** for every downstream drafting and review step.
The ledger is the pipeline's answer to "what may this proposal state as
fact?" — and the answer is: exactly what is in the ledger, verbatim, and
nothing else.

## The shape of a ledger entry

Each entry carries five things, all load-bearing:

- **A kind** from a closed taxonomy — organizational identity and scale
  facts (registration identifier, annual revenue, people served, board
  size, fiscal year) plus narrative-grounding facts (measurable program
  outcomes, program dosage, demographics of the population served, named
  partners). A closed taxonomy is what makes placeholders resolvable and
  duplicates detectable; free-form key-value pairs make both impossible.
- **A value, exactly as written in the source** — currency symbols, percent
  signs, commas, and qualifying detail (the assessment name, the sample
  size) preserved. Normalizing or rounding at storage time destroys the
  property the ledger exists for: that every value matches its document.
- **A confidence grade** — stated explicitly / inferred / uncertain.
- **The source document** — which uploaded file it came from.
- **The extraction method** — deterministic pattern vs model pass — so
  provenance is honest about how much to trust the reading, not just where
  it came from.

Cardinality is part of the type: an organization has one registration
identifier and one annual revenue, but *several* program outcomes,
demographics, and partners. Kinds that are legitimately plural accept
multiple entries; singular kinds keep the first confident match. A ledger
that stores five conflicting revenue figures is noise; one that stores only
one program outcome has thrown away the org's second-strongest claim.

## The injection contract

The ledger reaches the drafting model as a delimited block with an explicit
authority claim, and the framing does three jobs at once:

1. **These figures come from the organization's own documents and are the
   authoritative source** — establishing them above the model's world
   knowledge and above anything else in the prompt.
2. **Use the exact value wherever one fits; never round or alter** —
   verbatim fidelity as an instruction, backed by the storage rule above.
3. **Do not state any other figure as fact** — the exclusive clause, which
   is the one that actually bites. Without it the ledger is decoration:
   the model uses the real facts *and* invents companions for them.

Each injected line carries its source filename, so the model can attribute
("per our audited financials…") and so the writer reviewing the draft sees
sourcing inline. The block renders to nothing when the ledger is empty —
callers interpolate it unconditionally, and an empty ledger degrades to the
placeholder discipline rather than to silence about grounding.

## Decision rules

- When a draft needs a figure and the ledger has one of the matching kind,
  use it exactly as stored — never a paraphrase of it.
- When the ledger lacks the figure, the draft emits a bracketed
  placeholder; the ledger is never extended from the drafting side.
  Writing happens downstream of the ledger, additions happen upstream via
  extraction from a document.
- When two entries of a singular kind conflict (two documents, two revenue
  figures), surface the conflict to the writer; do not let recency or
  confidence silently pick. A wrong-but-sourced figure is still wrong.
- When a fact's source document is removed, its entries leave the ledger
  with it. An orphaned fact is an unsourced fact.

## When not to use

The ledger holds *verifiable organizational facts* — not narrative prose,
not the org's mission language, not external citations. Third-party
statistics (census data, published research the need statement cites) have
a different verification path — a citation to a public source — and mixing
them into the org-facts ledger muddies the authority claim that makes the
block work. And do not build the ledger from the model's summary of the
documents: it is built by extraction that quotes, not summarization that
paraphrases.
