---
layer: application
type: application
subject: positioning-and-pricing-transparency
technique: ships-today-vs-claim-separation
stack: process
status: forged
verified_on: 2026-09-09
---

# A value-case document with per-claim ships-today lines and a named pre-launch caveat

The Adamant workspace at `systedo-case`, commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08), keeps its competitive positioning in one document, `docs/value-case.md`
(76 lines), linked from `PRODUCT.md:76`. The document is the process realisation of
the technique: three claims against named incumbents, each split into **Claim**, **What
ships today** and **Why it's hard to copy**, and a closing section that names an
unverified integration as not sales-safe. It proves the structural fact the technique
rests on - that the caveat lives in the same document as the claim it qualifies - and
it records, by omission, the deviations the technique forbids.

## The three-part shape per claim

Claim 1 (`docs/value-case.md:10-33`) is the second-national-platform unification claim.
`:12-19` states the claim and names both incumbent sets - two local feed and campaign
tools that "move product data into channels; they do not diagnose an account", and
three western diagnostics tools that "do not support [the platform] at all". `:21-26`
is the ships-today line, headed "What ships today (stated honestly, per the
channel-support pills)": the dominant platform is the live-data connector; the second
gets ad-copy limit checks, keyword suggestions and a typed RPC client; two social
platforms are publishing surfaces; and the sentence that does the technique's
reconciliation step: the claim "is about the workspace treating [it] as a first-class
channel ... not about claiming live ... sync it does not have yet." `:28-33` gives two
copy-difficulty blockers, one per incumbent set - market indifference for the western
tools ("a rewrite of their product assumptions for a market that doesn't move their
revenue"), architecture for the local tools ("build the measurement-and-diagnostics
spine from scratch").

Claim 2 (`:35-49`) is the grounded-diagnostics claim with the architecture blocker
("Owning the spine is the product; retrofitting it into an audit tool is a
re-architecture, not a feature", `:45-49`). Claim 3 (`:51-64`) is price, with the
cannibalisation blocker ("Incumbents cannot match 'free' without cannibalizing their
subscription base", `:60-64`) and a ships-today anchor to the metering and the
own-key model path.

## The pre-launch caveat is in the same file as the claim

`:66-75`, headed "Honest caveat - pre-launch must", says the second platform's RPC
method set "has not been verified against a live [platform] account", that the client
"degrades safely (an unknown method throws and the connector contributes nothing)",
and draws the conclusion the technique's decision rule states: "claim #1 leans on [the
platform] being real - verifying the RPC set against a live account is a pre-launch
must, before the [platform] pill on the landing page is load-bearing in sales
conversations." Safe degradation is given as the reason it may ship, not as a reason it
may be claimed - the technique's third decision rule, learned here.

## Deviations recorded honestly

- **Incumbent facts carry no source, date or refresh cadence.** `:52-56` says the
  three diagnostics tools "all sell monthly subscriptions in the hundreds-of-dollars-
  per-year to hundreds-per-month range, scaling with spend and account count";
  `:16-19` says the two local tools are feed tools, not intelligence workspaces. No
  citation, no snapshot date, no re-read plan. The scout's own "worse than standard"
  list (`scout-surfaces.md` F.2) names this. The standard is
  `competitor-facts-sourced-and-dated`; the document meets the separation technique
  and fails the sourcing one.
- **Positioning copy is not person-tested.** The value case has no record of a buyer
  persona reading it; the UAT rig exists (`uat/characters/marek-prospective-buyer.md`,
  `uat/rubric.md:133-149`) and was run against the pricing page, not the value case.
- **The sales-safety status is prose, not a field.** The caveat says which claim is
  not sales-safe, but nothing marks the claim itself; a reader who stops at `:33` has
  read claim 1 without its caveat. The technique's step 6 asks for the status at the
  claim.

## Where the claims are consumed structurally

The anti-fabrication half of the same discipline runs in code rather than in this
document: `src/lib/competitors/types.ts:44-54` admits a competitor to prompt grounding
only when `isCurated()` - manual, or a scan suggestion a person confirmed;
`src/lib/competitors/grounding.ts:21-24` hands the model only those names and tells it
"never state unverified competitor numbers - compare only on what's given"; and the
onboarding scan prompt at `src/lib/ai/tools/onboarding-scan.ts:43` labels its 0-5
proposed competitors as suggestions to confirm and forbids asserting "any facts or
numbers" about them. That is the generation-side seam this subject hands to
`grounded-marketing-generation`.
