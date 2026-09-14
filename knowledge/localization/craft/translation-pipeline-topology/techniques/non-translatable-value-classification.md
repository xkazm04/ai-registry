---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: non-translatable-value-classification
status: forged
laws: [coverage-is-counted-not-claimed, clean-strings-stay-untouched]
shared_with: []
use_when: [deciding which catalog values are sent to a translation engine at all, a machine translated an identifier or a URL, designing what do-not-translate means in a pipeline, an untranslated-value audit fires on keys nobody ever intended to translate, a human-owned translation was overwritten by a pipeline run]
---

# Non-translatable value classification

Not every value in a catalog is language. Some are numbers, switches, machine
dates, identifiers and addresses that happen to live beside sentences; some are
sentences that a human already owns and nobody may touch. A pipeline that sends
everything to an engine pays for both classes and corrupts one of them — an
engine handed an identifier will translate it, plausibly and irreversibly,
because that is the only thing it knows how to do.

Two mechanisms answer this, and they are routinely collapsed into a single
do-not-translate flag that then cannot express either one honestly: a
**classifier** that decides what is not language, and an **exclusion vocabulary**
that records what a human decided about a key. The classifier is a cheap
heuristic run per value; the exclusion classes are durable data about the key.
Both were read in one permissively licensed open engine, which is single-source
evidence for the exact shapes below — the reasoning for why the classes must
differ is what transplants, not any one implementation's field names.

## The pre-prompt classifier

Before a value is put in a request, decide whether it is language at all.
Decidable, cheap, and each class removes a distinct corruption:

- **Empty or whitespace-only** — nothing to translate; sending it invites the
  engine to invent a value for a key that had none.
- **Pure number** — the whole value parses as a numeral. An engine asked to
  translate it may localize its separators, which is a formatting decision the
  runtime owns, not a translation.
- **Boolean literal** — a serialized switch. Translated, it stops parsing.
- **A machine date** — a whole value in the ordering-stable international form.
  A display date is formatted from a value at runtime; a machine date in a
  catalog is a value that leaked, and translating it makes the leak permanent.
- **A system identifier** — a long token with mixed case, digits or separators
  and no spaces. This is the class that produces the worst outcome, because a
  translated identifier still looks like an identifier.
- **A URL** — a whole value that is an address.

Three rules keep the classifier from becoming its own defect source:

- **It decides on the whole value, never on a substring.** A number, an address
  or an identifier *inside* a sentence is skeleton, and protecting it is
  [the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)
  doing its job — a different mechanism, at a different layer. A classifier that
  starts carving substrings out of sentences is writing translations.
- **It errs toward translating.** A short all-caps token is a word (*OK*, *NEW*,
  *ON*) far more often than it is an identifier, so the identifier rule needs a
  length and composition floor and should let short tokens through. A false
  negative costs one request; a false positive ships the source string forever
  and no check downstream distinguishes it from a translation nobody got to.
- **It filters the request, not the catalog.** An excluded value still needs its
  target entry, written as the source value verbatim. Skipping the entry is a
  *different* decision, and it is the one below.

## Four exclusion classes, not one flag

What a human decided about a key is durable data with four distinct behaviours.
Most tools ship one of them and call it "do not translate"; the other three then
get improvised per project, differently each time.

- **Locked** — never translated; the target entry exists and carries the source
  value verbatim. The key is present everywhere, and identity is the intended
  outcome. Brand names, protocol keywords, a code sample.
- **Ignored** — dropped from the pipeline entirely; there is **no target entry
  at all**. Nothing claims this key is localized, and the runtime is expected to
  resolve it some other way.
- **Preserved** — the target is human-owned: keep whatever is there, fall back
  to the source value when absent. This is
  [the hand-authored exception contract](./hand-authored-exception-contract.md)
  mechanized at the value level — a standing instruction that no machine pass
  may write here, which is
  [clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)
  expressed as pipeline configuration rather than as good manners.
- **Allowlisted** — an explicit opt-in that **overrides the classifier**. The
  classifier is a heuristic, so an escape hatch that beats it is required: a
  numeral that is genuinely written out in some targets, an address whose path
  segment is localized, a short identifier that really is one.

Conflating them misbehaves in two specific, observable ways, and both are worth
stating as the reason the vocabulary has four words:

- **A flag that silently means *drop* loses the key.** The value was meant to be
  copied; instead the target catalog has no entry, and every consumer that
  assumes key parity now resolves a miss at runtime.
- **A flag that silently means *copy source* fills the catalog with
  source-language values** — which a coverage audit then reports as
  untranslated, because from the values alone that is exactly what they look
  like ([source-identical-value-audit](./source-identical-value-audit.md)). The
  locked set therefore belongs in that audit's allowlist by construction: it is
  the one part of the floor that is decided rather than discovered, and it is
  already written down ([coverage is counted, not
  claimed](../../../_laws.md#coverage-is-counted-not-claimed)). Mind the
  collision of words: the audit's allowlist admits values allowed to *match*
  the source, while the *allowlisted* class here marks values forced to be
  *translated*. A pipeline that names both the same way will one day merge them.

## Two assertions worth wiring

- **Excluded values must be identical between source and target.** Compare the
  locked set and every value the classifier excluded — minus the allowlisted
  ones, which were opted back *in* — across locales; a difference means
  something translated them anyway: a pipeline that ignored the class, a bulk
  edit, a reviewer being helpful. This is the cheapest signal in the topology,
  and it has no false positives, because identity is exactly what the pipeline
  itself wrote there.
- **An ignored key must be absent, not empty.** An empty string in the target is
  a third state nobody declared, and it renders as nothing rather than falling
  back. Assert absence, so *ignored* and *locked* cannot quietly converge.

A class is also part of what was asked of the engine, so a key moving between
classes changes the work — record the class where the unit's other translation
inputs are recorded rather than outside them
([source-hash-translation-cache](./source-hash-translation-cache.md)).

## When not to use it

- **A small hand-maintained catalog** where every value is read by a human
  anyway. The classifier's payoff is per request; below a few hundred units, the
  four-class vocabulary is bookkeeping for a decision one person remembers.
- **As a quality gate.** The classifier answers "is this language", never "is
  this good". A value it passes has been asserted about nothing.

## Failure modes

- **One flag for four behaviours.** The meaning drifts per project and per year;
  nobody can say afterward whether a flagged key was meant to be copied, dropped
  or defended, and the answer is usually all three across one catalog.
- **Classifying substrings.** The classifier starts protecting fragments inside
  sentences and becomes an unreviewable rewriting pass over translated text.
- **An aggressive identifier rule.** Short words ship untranslated in every
  locale, and the untranslated-value audit reads them as coverage debt that no
  reviewer can fix, because the pipeline re-excludes them on the next run.
- **Excluding without writing the entry.** The classifier's "not language" is
  read as the exclusion vocabulary's *ignored*, and a key vanishes from every
  target catalog that was supposed to carry it verbatim.
- **A preserved value overwritten once.** The human target is gone and the run
  that replaced it looks exactly like every other run; there is no finding,
  because the pipeline's own output is what it expected to see.
