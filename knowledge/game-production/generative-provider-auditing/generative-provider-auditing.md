---
layer: golden-path
type: golden-path
subject: generative-provider-auditing
status: forged
use_when: [adopting a generative model into an asset pipeline, choosing between model variants for a content class, a provider changed its default or deprecated a model, deciding what a provider may be routed for]
techniques:
  - pin-a-model-per-asset-class
  - never-the-account-default
  - record-negative-benchmarks-in-place
  - capability-is-not-registry-membership
  - refuse-with-reason-not-greyed-out
  - arena-benchmark-protocol
---

# Generative provider auditing

A generative model reached through somebody else's endpoint is not a utility you call.
It is a **component of your pipeline that lives outside your version control**, and it
changes without asking you. Treating it as a utility — a URL, a key, a prompt, output —
is the posture that produces a shipping build full of assets nobody can account for:
made by a model whose identity is unrecorded, chosen over an alternative nobody wrote
down, for a content class nobody validated it against, and stored on a host that will
delete it on a retention schedule you never read.

Auditing is the opposite posture. Every generated artifact must be traceable to a named
model, deliberately selected for its class, on evidence that is still readable at the
point where the next person makes the same decision — and the artifact itself must be in
your custody, not the provider's.

**Boundary.** The general practice of *routing* between generative providers — choosing
among vendors, fallback chains, quota exhaustion, retry policy — is a separate concern
and belongs elsewhere; it is not re-taught here. What follows is only the audit
discipline that applies when the pipeline's output has to satisfy an engine and a
budget: which model is pinned to which asset class, what evidence stands behind that
pin, what the provider is registered to be used *for* as distinct from what it can do,
and who holds the resulting file. Likewise, spend metering and price books are a
neighbouring discipline; cost appears below only as a *benchmark axis*, never as an
accounting system.

## Four properties an audited provider has

A provider integration is audited when four questions have answers written down in code,
not in someone's memory:

| Property | The question | Failure when absent |
| --- | --- | --- |
| **Identity** | Which exact model version produced this class of asset? | Output drifts silently when the service moves its default |
| **Authority** | Which asset classes is this provider *registered* to serve? | The pipeline quietly starts using it for work nobody validated |
| **Evidence** | What was measured, on what task set, including what was rejected? | The rejected option gets re-tried every six months, at full cost |
| **Custody** | Where does the artifact live once it exists? | Output is lost to a retention policy, a billing lapse, or a deprecation |

None of the four is satisfied by a configuration file that names a provider and a key.

## Identity: an unpinned model is an unaudited engine

The pin is per **asset class**, not per pipeline. A single generative service usually
exposes several variants with genuinely different characters — one that respects a tight
primitive budget, one that produces denser and more detailed output, one tuned for a
different input modality. The class of thing you are making decides which is correct: a
background prop and a hero silhouette have different budgets, different acceptance
thresholds, and therefore different right answers. Pinning one model for the whole
pipeline discards that, and pinning nothing at all discards the ability to say what
produced anything.

Pinning also has to be *explicit against the account's default*. A hosted service's
default target moves, and every artifact produced after that moment came from a model
nobody audited — with no commit, no deploy and no diff to show for it. This is the single
most common way an audited pipeline stops being audited
(`never-the-account-default`, `pin-a-model-per-asset-class`).

The corollary is that a pin has a lifetime. Providers retire the exact versions they ask
you to pin. An audited integration therefore records not just the pinned identifier but
the date it was benchmarked, so that "this pin is three years old" is a visible state
rather than a discovery made when the endpoint starts returning errors.

One trap deserves naming, because it silently changes what a benchmark measures. A
variant a provider *markets* as a distinct model is often not one: it can be a **flag on
the model you already pinned**, or an older identifier wearing a newer date. Establish
which axis a candidate actually varies — against the provider's primary reference, not
its marketing surface — before benchmarking it. An arena run on a flag is a comparison
of two settings of one model, and reporting it as a model comparison mislabels the
finding for everyone who reads it later.

## Authority: capability is not registry membership

What a service *can technically do* and what your system *will route to it* are
different sets, and conflating them is how a pipeline starts producing a class of asset
against a model nobody validated for it. A provider that can also do speech, also do
music, also do longer clips is not thereby a supplier of speech, music or longer clips —
it becomes one only when someone benchmarks it for that class and registers it.

So the integration declares a **membership list**, not a capability list: the kinds this
provider is authorised to serve, and for every kind it does *not* serve, the reason. The
reason is the valuable half. "Not supported" teaches nothing; "the licence terms do not
permit commercial redistribution of this output class" or "benchmarked and rejected for
this class — it overshoots the budget" is documentation delivered exactly where someone
was about to make a mistake (`capability-is-not-registry-membership`).

Two consequences follow. First, a request for an unregistered kind is **refused with its
reason, before anything is billed** — never attempted, never silently downgraded
(`refuse-with-reason-not-greyed-out`). Second, licence terms are part of membership, not
a legal footnote. Whether the output of a given model may be shipped commercially, and
what provenance metadata it carries or must carry, decides whether the class may be
routed there at all — and machine-readable disclosure obligations for generated content
are a live constraint on shipped products, not a future one. A model that is technically
excellent and licensed non-commercially is not a candidate; it is a non-member with a
stated reason.

Licence status is declared *only for the kinds actually served*, and a kind with no
declared licence renders as **licence not declared** — never as permitted by default. A
licence badge attached to a kind the provider does not serve is a claim about output that
will never exist, and it is exactly the kind of tidy-looking metadata that later gets
trusted.

## Evidence: the negative result belongs at the decision point

Most benchmarking effort is wasted not because it was done badly but because its
*negative* results are stored somewhere nobody looks. A team evaluates a promising
variant, measures it, finds it worse, and writes that up. Six months later a different
person opens the integration, sees the promising variant listed by the provider, and
spends the same money to learn the same thing.

The fix is co-location, and it is nearly free: the rejection is written **where the next
person reaches for the option** — beside the pin, in the same declaration, with the
per-class numbers that produced the verdict. Not in a document, not in a ticket, not in
a chat log. A rejection recorded elsewhere is a rejection that will be re-litigated
(`record-negative-benchmarks-in-place`).

A recorded rejection carries its measurements with their units and their basis: the
budget it overshot and by how much, the defect rate it raised and against what baseline,
the task set it was measured on, and the harness that produced them — so the verdict is
re-runnable rather than merely asserted. "It looked worse" does not survive contact with
the next enthusiast. A number with its unit and its comparison arm does.

And a recorded reason is itself subject to re-measurement. When someone re-derives the
numbers behind a standing rejection and finds the stated mechanism wrong — the verdict
right, the explanation not — the correction is written *at the wrong claim*, marked as a
correction, with the new measurement beside it. Silently fixing the sentence loses the
information that the original reasoning was unsound, which is exactly what stops the same
reasoning being used again elsewhere.

## The benchmark that picks the right model

A comparison between generative model arms is only worth acting on if it was controlled,
and the controls are specific (`arena-benchmark-protocol`):

- **A fixed task set representative of your real classes** — the prompts behind your
  hardest shipping assets, held constant across arms and across runs.
- **Identical budgets across arms.** A budget is an instruction about the target, not
  only a ceiling; an arm handed a looser one produces different output for that reason
  alone, and the comparison then measures the budget, not the model.
- **The same grading applied to every arm**, drawn from the acceptance that decides
  whether an asset may enter the engine — never a judgement formed while looking at the
  outputs.
- **Results per class, never pooled.** An arm that wins on organic shapes and loses on
  hard-surface props has produced two findings; pooling destroys both.
- **Systems constraints measured alongside quality.** This is the lesson practitioners
  learn last and should learn first.

That last point deserves its own statement, because it inverts the naive expectation.
**The winning criterion is frequently a systems constraint, not a quality score.** When a
vision-language critic is chosen to grade generated output, the decisive property is
often that it can *coexist* with the generator it grades. Coexistence is broader than
memory: the larger candidate may fit comfortably and still lose because it requires a
runtime library version that breaks the generator's own weight loading — two models that
cannot share one environment impose an isolation cost on every evaluation, forever.
Latency ceilings, concurrency limits and cold-start behaviour work the same way. A
benchmark that measures only quality will confidently pick the model you cannot run, and
the entanglement cost is paid by the pipeline you already had working.

## Custody: output on someone else's host is not yours

Generated output that remains where the provider put it is a liability with a countdown
on it. Provider-side artifacts expire under retention policies, disappear with a lapsed
subscription, and vanish when a model is deprecated and its output store is retired with
it. The discipline is simple and non-negotiable: **fetch the artifact into your own
storage, verify the fetch, and only then release the provider-side copy.** Deleting
first, or trusting the provider's copy as the archive, converts a routine incident into
lost work.

Custody is also where provenance lands. The artifact you take custody of should arrive
carrying — or be immediately annotated with — the model identity that made it, the
prompt or input that produced it, and whatever signed provenance metadata the provider
attached. That record is what answers, at ship time, the question of whether a given
asset may be distributed commercially and what has to be disclosed about how it was made.
An asset whose origin is unrecorded is an asset you cannot clear.

## Failure modes of the naive reading

- **"We benchmarked it once."** A benchmark is bound to the model versions it examined.
  When a pin moves, the evidence behind it becomes evidence about the past.
- **"The provider says it supports that."** A capability claim from the party selling the
  capability is an input to a decision, never the decision.
- **"We'll write up why we rejected it."** Written up somewhere else is the same as not
  written. Co-location or nothing.
- **"One model for the whole pipeline is simpler."** It is, until the first class whose
  budget it cannot hit — at which point the pipeline has an unaudited exception.
- **"The best model won the benchmark."** Best on quality, pooled, under whatever budgets
  each arm defaulted to, judged by a criterion invented for the occasion.

The standing question an audited pipeline can answer for any shipped asset is: *which
model made this, why that one for this class, what lost to it and by how much, and who
holds the file.* If any of the four has no answer in code, the provider is a utility you
are calling and hoping about — not a component you have audited.
