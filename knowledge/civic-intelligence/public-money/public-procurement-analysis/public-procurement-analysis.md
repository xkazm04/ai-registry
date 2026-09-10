---
layer: golden-path
type: golden-path
subject: public-procurement-analysis
status: forged
use_when: [ingesting a national contract registry, summing or comparing contract values, auditing a supplier's public revenue, designing procurement red-flag signals]
techniques:
  - contract-registry-record-model
  - payer-vs-receiver-direction
  - value-basis-non-summability
  - threshold-proximity-signals
  - contract-version-supersession
  - registry-coverage-blind-spots
---

# Public procurement analysis

A public contract registry looks like a ledger of public money. It is not. It is a
pile of **disclosure acts** — each record is "somebody published something about a
contract, under a legal duty, at a moment in time" — and every analytical conclusion
about public money has to be *derived* from those acts through a chain of explicit,
defensible inferences. The naive reading treats each row as a payment: sum the value
column, group by supplier, rank, publish. Every step of that pipeline is wrong in a
way that produces a specific, publishable, defamatory error: it sums numbers that are
not commensurable, attributes money in a direction the record never asserted, counts
the same contract several times through its amendment history, and calls a partial
sample a total. The principal practitioner's posture is that the registry is
*evidence about* public money, never a *statement of* public money, and the job is to
model exactly what each record asserts — no more.

## What a record actually asserts

A registry record asserts, at most: these parties entered an agreement; one of them
published it; the stated value, if any, is what the publisher chose to disclose, on
the basis the publisher chose; and this row is one version in the publication history
of one underlying contract. A contract-only disclosure does not establish payment or performance; sources
that also publish implementation transactions can support those distinct claims. Five
load-bearing distinctions fall out of this, and each is a technique in this subject:

1. **The record is not the contract** (contract-registry-record-model). Contract
   identity, version identity, party identity and publication identity are four
   different keys, and registries routinely expose two id sequences whose values
   overlap numerically. Confusing them silently duplicates or misattributes the
   entire corpus.
2. **The record may not state direction** (payer-vs-receiver-direction). A public
   body can appear on either side of money: it buys, but it also sells, leases, and
   collects. The same counterparty search returns both. Direction is a field, often
   optional; where it is absent the honest value is *unknown*, never an assumption
   from role.
3. **Values are disclosed on declared bases that do not add**
   (value-basis-non-summability). Tax-inclusive and tax-exclusive figures, foreign
   currency, framework ceilings versus call-off values, estimated versus final —
   these are different value bases. A total that mixes bases is an invented number,
   and converting between bases with an assumed rate is a second invented number.
4. **Versions can supersede** (contract-version-supersession). Distinguish
   disclosure corrections from legal amendments and preserve available history. Counting every
   row over-counts; counting only the latest row erases the amendment story that is
   often the finding itself.
5. **Coverage follows publication and retrieval policies**
   (registry-coverage-blind-spots). Below-threshold or exempt records may be absent;
   voluntary publication and query-role semantics also affect visibility. Each figure needs a coverage statement. A subset becomes a lower bound only
   under explicit identity, validity, additivity and nonnegative-amount conditions.

The sixth technique inverts the frame: once the record model is honest, the registry
becomes a detector. **Threshold-proximity-signals** reads clusters of contracts
sitting just under the legal competition thresholds as leads for artificial
splitting — among the best-documented procurement red flags in the field
literature, alongside single bidding in competitive markets.

## The failure modes of the naive reading

**The summed lie.** The most common published error is a per-supplier total: "firm X
received N from public bodies." Unpacked, that number typically mixes tax bases,
includes rows where the firm was the payer, counts amendments as separate contracts,
and was drawn from a capped or one-sided sweep. Four independent inflations and
deflations, all silent. The defense is structural, not editorial: every total ships
its composition (which bases, which directions, which version policy, what coverage),
and incompatible amounts remain separate subtotals; disclosure does not validate
a mixed sum. A reader who
cannot see the composition cannot trust the number — and in accountability work an
untrustable number about a named firm is a liability, not a product.

**The direction flip.** "Public body B has contracts worth N with firm X" reads as
"B paid X N." When the corpus contains concession fees, land sales, or rent flowing
the other way, the claim is not merely imprecise — it asserts the opposite of the
record. Direction-of-payment is the single field that separates "supplier to the
state" from "customer of the state," and where the registry leaves it blank the copy
must say "direction not stated," which is a different sentence from either.

**The version double-count.** Repeated publications can represent one agreement. Summing
records inflates the corpus by the repeated publications included. Publication corrections and separately
registered legal amendments must be distinguished before measuring this effect. The mirror error, keeping
only the latest version, destroys the amendment trail — and a contract awarded just
under a threshold and then grown by amendments past it is a classic red flag that
only the version history can show.

**The coverage mirage.** A registry sweep that returns 25 contracts for a firm is
read as "the firm has 25 public contracts." If the sweep was capped at 25, searched
only one party role, or the registry only mandates publication above a threshold,
the honest sentence is "at least 25 contracts are visible under these conditions."
Silent truncation converts a floor into a fake census; a downstream ranking built on
fake censuses is an editorial fiction with a data smell.

## The stance that makes the registry useful

None of this is a reason to distrust registries — it is the reason they reward
careful readers. The discipline is:

- **Model the record, not the wish.** Parse every field the registry defines,
  including the flags analysts are tempted to skip: validity, direction, basis,
  amendment linkage. The boring flags are where the corrections live.
- **Absence is a first-class value.** "Value not stated" is the publisher's own
  assertion and must survive the pipeline as null-with-a-reason — never zero, never
  imputed, never dropped without a count of what was dropped.
- **Fail loudly on shape drift.** Registries are living systems; columns move,
  schemas grow. A parser that guesses through drift fabricates values out of the
  wrong cell. Refusing to parse is recoverable; a silently wrong number that shipped
  is not.
- **Every derived signal is a lead.** Threshold clusters, supplier concentration,
  temporal clustering of related purchases — these select records for human review.
  They are never published as findings, because each has innocent explanations
  (budget-year timing, genuine lot structure, price-driven repeat awards) that only
  document-level review can eliminate.
- **Publish the method with the number.** The coverage statement, the version
  policy, the basis composition and the direction policy are part of the figure. A
  registry-derived claim that cannot state them is not ready to render.

Read the techniques in the order above when building an ingest; read
threshold-proximity-signals and registry-coverage-blind-spots first when reviewing
someone else's analysis, because those are where published work most often breaks.
