---
layer: golden-path
type: golden-path
subject: llm-forensic-gating
status: forged
use_when:
  - letting a language model research or draft in an evidentiary domain
  - designing the contract between an analyst model and a publishable store
  - deciding what a model verdict may assert and what must be withheld
  - a model output defamed, fabricated, or leaked internals and you are hardening
techniques:
  - structured-verdict-schemas
  - entity-id-membership-gates
  - citation-required-per-claim
  - hallucinated-reference-sweep
  - prose-register-gates
  - groundedness-scoring-triage
  - human-review-doors
---

# LLM forensic gating

LLM forensic gating is the discipline of using a language model in an
adversarial evidentiary domain — accountability journalism, legal-change
forensics, conflict-of-interest analysis — while guaranteeing that the model
never authors a fact. The model is hired for the two things deterministic code
cannot do: it reads widely (registries, filings, explanatory memoranda, press)
and it interprets — it hypothesizes unstated effects, contrasts a bill's stated
reasoning with its researched consequences, connects a sponsor's money graph to
what a provision would change. Everything else — every number, every identifier,
every citation's reality, every register decision, every publish decision —
belongs to reviewable code and to a human. The subject exists because the
domain's failure asymmetry is extreme: **fabrication is the worst failure**. A
made-up statute number or an uncited accusation is not a bug ticket; it is a
false public statement about a named person, and it can defame.

The naive reading is prompt-side: write a careful instruction sheet, tell the
model not to invent citations, remind it to stay in the reader's language, ask
it to be fair. Every element of that is worth doing — the analyst contract is a
real artifact and a good one earns better drafts — and none of it is the
control. Prose rules do not survive the next model, the next batch, or the next
rephrasing of the prompt. Measured practice in this domain is blunt about it:
behavioural rules restated in briefs kept being violated *after* being written
down in response to the previous violation. The doctrine that ends the cycle is
**when a behavioural rule keeps being violated, stop restating it and give it
an observable output** — turn the rule into a deterministic check with a
machine-readable pass/fail, and make the pipeline structurally unable to
proceed past a fail.

## The architecture: a model inside a cage of gates

A gated forensic pipeline has a fixed shape, and each stage is one of this
subject's techniques:

1. **The payload ships the gate's scope.** Before any model runs, code
   assembles the brief: the entity under analysis, the facts the store already
   holds, and — critically — the closed lists the gates will later check
   against (the real reference numbers in scope, the real entity identifiers
   the model may cite). The model is told the lists; the gate keeps its own
   copy. Symmetry of information, asymmetry of authority.
2. **The verdict is a schema, not an essay.** The model returns one structured
   object under a strict schema — closed key set, enumerated categories,
   bounded scores, required fields. Shape drift is rejected mechanically,
   which converts "the model wandered" from an editorial judgment into a
   parse failure.
3. **Every claim carries its citation, and every citation is checked.**
   Sources split by kind — a fetched document must be an address, a store fact
   must be a known identifier, a legal reference must be a real instrument —
   and each kind has its own deterministic verification. A hypothesized effect
   with no citation is rejected whole: no uncited accusation, ever.
4. **The whole output is swept for fabricated references.** Not just the
   citation list — every prose field is scanned for anything shaped like a
   legal or registry reference, and each one must resolve against the known
   set. A hallucinated reference anywhere fails the entire verdict.
5. **Register is gated as strictly as accuracy.** Reader-facing prose is
   checked for internal jargon (pipeline identifiers, batch references, store
   addresses) and for language — because a sentence can be perfectly true,
   perfectly cited, perfectly schema-valid, and still be unpublishable, and
   accuracy gates never catch that class.
6. **What no deterministic check can see is scored, as triage.** A claim can
   pass every gate above while its cited source fails to support it. An
   independent verifier model scores that support — to order the review queue
   and bounce clear non-support into re-runs. A machine opinion about a
   machine lead: it feeds the door and never replaces it.
7. **Nothing the model produced is a finding until a human says so.** A
   passing verdict lands in a pending-review state; promotion to published
   runs through one audited write path a human drives. The model's output is a
   lead by construction, not by convention.

A verdict that fails any gate is discarded and re-run — never patched, never
persisted with a warning flag. Repair is authorship: the moment code "fixes" a
model's citation or trims its jargon, the pipeline has invented a claim no one
made. Rejection is the only honest response to a gate failure, and re-running
is cheap precisely because the contract is deterministic.

## The load-bearing distinctions

**Interpretation is licensed; assertion is not.** The model may say what a
provision *appears designed to do* and who *would plausibly benefit* — that is
its job, and demanding certainty would just teach it to hedge into uselessness.
What it may not do is present interpretation in the clothing of fact. The
schema enforces this structurally: hypothesized effects live in their own
field, each shackled to a citation; store-fact citations may only assert what
the cited record actually holds; severity and confidence are separate bounded
fields rather than adjectives buried in prose.

**A citation's kind determines its verification, and kinds do not substitute.**
A web finding cited as a store fact is a category error even when true — the
store never held that claim, so the citation manufactures provenance. The
craft rule: when a claim's substance exceeds what the cited record's own
fields hold, the claim must be re-grounded to the kind that can actually carry
it, or dropped. Checking this requires the gate to know each record type's
real field inventory — which is itself a reason to keep that inventory in one
importable place.

**The gate runs at every door, from one definition.** Persist time and render
time are different doors with different failure economics: the persist gate
keeps new violations out of the store; the render gate withholds violations
already inside it, non-destructively, while a rewrite catches up. Both doors
must run the *same* rule from the *same* module — a rule forked per door has
already drifted in measured practice, dropping content at one door that the
other door happily rendered. And the gate must be re-runnable from the stored
artifacts, so an orchestrator can re-verify a whole batch before any live
write, independent of whoever produced it.

**Human review is a door, not a rubber stamp.** The review surface has its own
contract: one code path allowed to change review state, an append-only audit
record written before the state change, decisions that can move a claim back
to pending but never silently to published, and terminal rejections that stay
terminal. Without that discipline, "a human reviewed it" is an unauditable
assertion — exactly the kind this domain exists to eliminate.

## Failure modes of the naive reading

- **Trusting the instruction sheet.** The contract said "only cite real
  references, when in doubt describe" — and outputs still carried fabricated
  ones. Contracts raise draft quality; only gates bound output quality.
- **Validating the citation list but not the prose.** The list checks clean
  while a fabricated reference sits in a narrative field, rendered verbatim to
  readers. The sweep must cover every string in the object.
- **Accuracy-only gating.** Batches of verdicts that were true, cited, and in
  the wrong language for every reader they rendered to; hundreds of
  factually-correct sentences carrying raw pipeline identifiers into public
  copy. Register is a first-class gate dimension.
- **Repairing instead of rejecting.** Normalizing a "probably meant" reference
  or stripping jargon in post converts a detectable model error into a silent
  pipeline fabrication. Discard and re-run.
- **Gate rules as regex whack-a-mole without an incident log.** Register gates
  grow rule by rule, each from a measured leak — and each rule needs its
  incident, its verified allowlist, and its regression cases kept next to it,
  or the next tightening pass will re-break what the last one fixed.
- **Letting the machine's verdict leak into published copy.** A passing
  verdict is still only a lead. The published surface must say which review
  actually happened — machine review is not human review, and copy that blurs
  them asserts a verification level no one performed.

## How the techniques compose

Structured verdict schemas define what the model may return at all;
entity-id membership gates and citation-required-per-claim bind every
assertion to something real and checkable; the hallucinated-reference sweep
extends the reality check from the citation slots to every character of
prose; prose register gates bound what may face a reader independent of
truth; groundedness-scoring triage orders what survives all of that by the
one question the deterministic stack cannot decide — whether each cited
source actually supports its claim — and human review doors are the only
exit into publication. The order is not optional: schema first (shape
failures make every later check unreliable), reality checks second, register
third, probabilistic triage after the deterministic gates and before the
door — never instead of either — human door last, and the
whole stack must be re-runnable as one command over stored verdicts, because
the gate you cannot re-run is a gate you cannot trust was ever run.
