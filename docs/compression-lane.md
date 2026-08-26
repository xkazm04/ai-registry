# The compression lane

Every document in `knowledge/` and `rules/` exists to be loaded into a context
window. The registry gates their *structure* (`check-bundles`), their *links*,
their `use_when` coverage and their *freshness* (`check-currency`). Nothing has
ever asked whether a document **earns its tokens**.

That is a gap in the registry's own machinery rather than in any bundle, which
is why it outranks bundle content: the fleet pays this bill on every session,
in every connected project, forever.

## The two halves, and why only one of them is a script

Measuring compressibility honestly requires a model in the loop — you cannot
know what a reader loses without asking a reader. Scripts in this registry take
no dependencies and call nothing, so the lane splits along the line the rest of
the registry already uses:

| Half | Artifact | What it does |
| --- | --- | --- |
| Deterministic | `scripts/compression-scan.mjs` | Ranks every document by the tokens it costs, weighted by how often those tokens are **re-billed at full rate**, and by repetition it can prove. Produces a worklist. Decides nothing. |
| Judgment | `docs/compression-brief.md` | The protocol a worker follows to compress one picked document under a screened quiz suite. Spends model calls; produces a diff. |

The scan is the cheap instrument that screens for the expensive one. It exists
so that model spend lands on the twenty documents where it repays, instead of
being sprayed across 3,300 where it does not.

## What the scan ranks on

**Exposure — how often the tokens are actually billed.** The registry knows
this from a document's position, and the tiers are far apart:

- **always-on** — `rules/*.md`. Loaded into every session of every connected
  project, whether or not the domain comes up. The most expensive tokens in
  the fleet by a wide margin.
- **entry** — a subject's golden path. Loaded whenever the subject is
  consulted at all, and read by the mapping instrument's deep pass.
- **routed** — a technique. Loaded when its golden path sends a reader to it.
- **stack-scoped** — an application. Loaded rarely, by one stack.

Inbound link count refines the tier: a technique nine documents point at is on
more paths than one nothing points at.

**Repetition it can prove.** Normalized word-shingles repeated *within* a
document, and repeated *across* documents in the same subject — a paragraph
living in both a golden path and its technique is paid twice whenever both
load. The scan reports these spans verbatim so a human can see what it found.

**It reports; it never judges.** Some repetition in this corpus is deliberate:
house vocabulary is repeated on purpose, law citations are formulaic on
purpose, and a golden path restating its technique's rule in one line is the
routing working. The scan cannot tell those from waste and does not try — the
same discipline that stops the librarian's scan from scoring unknown demand as
zero demand. A high repetition score is a place to look, not a verdict.

## The token figure is an estimate and says so

No tokenizer, no dependencies. The scan estimates from word and punctuation
counts under a stated rule and labels every figure as an estimate with its
rule attached, per
[count-carries-predicate](../knowledge/software-engineering/_laws.md#count-carries-predicate).
An estimate with a known bias is usable for *ranking*, which is all this
instrument claims; it is not usable as a bill, and the scan does not print one.

## The compression protocol is the corrected one, not the published one

The technique this lane implements comes from an outside prototype, and the
registry does not run it as published. Two corrections, both landed as
techniques in `llm-agent/evaluation-and-cost/eval-harness` in the same change
as this document, are mandatory here:

1. **Screen the quiz before trusting it**
   ([unaided-baseline-screening](../knowledge/software-engineering/llm-agent/evaluation-and-cost/eval-harness/techniques/unaided-baseline-screening.md)).
   A question about this corpus that an agent can answer *without the
   document* measures the agent, not the document — and this corpus is full of
   such questions, because it is largely composed of reasoning a strong model
   can reconstruct. Discard every question the deprived run answers. Expect the
   surviving set to be small; that is the finding, not a failure.
2. **Overshoot before stopping**
   ([overshoot-and-restore](../knowledge/software-engineering/llm-agent/evaluation-and-cost/eval-harness/techniques/overshoot-and-restore.md)).
   An agent told to shrink a document without breaking a quiz will shrink it
   barely, because the null edit is always green. Require a failure, then
   restore minimally.

Run in the other order — overshoot against an unscreened quiz — and the loop
will happily delete a whole document and stay green, because the model knew
the answers anyway. That is the specific way this lane can destroy content
while reporting success, and it is the reason the order is stated here.

## Authorizing a compression pass

Compression is an investment, not hygiene, and the break-even is in
*inclusions*
([context-budgeting](../knowledge/software-engineering/llm-agent/prompt-and-context/prompt-assembly/techniques/context-budgeting.md)).
A document at the top of the scan's worklist is a candidate; it is authorized
when the tokens it sheds, times the number of times it is loaded, exceeds the
cost of the pass. Always-on documents clear that bar almost automatically.
Stack-scoped applications almost never do, and the scan ranks them last for
that reason rather than by any judgment about their quality.

## What the first run found (2026-08-26)

The lane was built and run in the same session, and its first result is a
negative one worth carrying:

- **Mean measurable repetition across ~3,350 documents: 0.94%.** No document
  above 25%; six above 10%. The corpus has almost no verbatim redundancy.
- **The highest-scoring entry document tested at roughly two-thirds
  irreducible** under the Phase 1 screen — most of its load-bearing claims
  could not be reconstructed without it, and its central claim was predicted
  backwards by the deprived reader.
- The outside prototype this lane is modelled on halved its evaluation
  article. That article was synthetic, written with the redundant texture of
  ordinary documentation. **This corpus does not have that texture**, so its
  headline number does not transfer, and assuming it did would have licensed a
  destructive pass.

So the lane's standing default is: run the scan, do not run the compression.
The instrument's job here is to keep saying no cheaply — and to notice the day
that stops being the right answer, which is what the always-on lane's growth
would look like first.

One defect found in the instrument by reading its own output rather than
trusting it: overlapping shingles were counted as separate repetitions,
reporting 74% where the true figure was 15%. The self-test now asserts the
merge, per the negative-control discipline the deterministic subject already
carries.

## What this lane does not do

It does not edit anything. It does not run a model. It produces a ranked list
and a protocol, and every actual change to a document goes through the ordinary
gates and an ordinary review of the diff.
