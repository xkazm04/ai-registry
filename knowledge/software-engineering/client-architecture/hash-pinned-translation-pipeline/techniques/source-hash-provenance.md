---
layer: technique
type: technique
subject: hash-pinned-translation-pipeline
technique: source-hash-provenance
status: forged
laws: [derivation-names-recomputation, identity-survives-reuse]
shared_with: []
use_when: [deciding what a translated unit must record about its own origin, a bad rendering found months later with no way to find its siblings, provenance stored in a platform rather than in the shipped tree]
---

# Source-hash provenance

A translation is a derived value, and
[a derived value names how it is recomputed](../../../_laws.md#derivation-names-recomputation).
The recomputation path for a translated unit has exactly three inputs: the
source content, the target language, and the translating agent. The target
language is implied by where the file sits. The other two must be **recorded on
the unit**, or the derivation is unrepeatable and — much worse — uncheckable.

## The record

Four fields, per translated unit, and each earns its place by answering a
question somebody actually asks:

- **The unit's stable identity.** Which source unit this is a translation of.
- **The source-content hash.** The digest of the source content as it stood
  when this translation was made. This is the field the whole subject exists
  for; everything else is context around it.
- **The date.** When the translation was produced. It cannot substitute for the
  hash — a timestamp answers "when", never "of what", and file modification
  times are destroyed by a fresh checkout, bumped by a reformat, and unordered
  across machines. But paired with the hash it is what makes a report
  actionable: *"stale since March, translated by the bulk pass"* is a work
  order; *"stale"* is a fact.
- **The translating agent.** Human name, tool, or model identifier. When a bad
  rendering is found six months later, the useful question is never "fix this
  one" — it is **"what else did that pass produce?"**, and nothing but recorded
  agent identity answers it. Localization interchange practice goes one step
  further and records the agent that *produced* a translation separately from
  the agent that last *revised* it, and the distinction is worth copying: one
  field for both loses the ability to state "machine-drafted, human-reviewed",
  which is the single most valuable claim a provenance record makes.

## Identity must be minted, not inferred

The unit key that ties a record to its source unit
[has to survive reuse](../../../_laws.md#identity-survives-reuse). Two tempting
keys both fail under operations a content corpus actually undergoes:

- **Position** — the third item in the source list. Insert one unit above and
  every record below it now describes the wrong content, silently, with a
  perfectly valid-looking hash that will be compared against a different unit's
  text and reported as stale. The corpus is not stale; the keys shifted.
- **The source text itself** — keying on the string, as a translation memory
  does. This is not wrong, it is a different tool: a memory is a *lookup*
  ("have we translated this sentence before?") and it is genuinely useful, but
  it cannot answer "is the translation currently shipping in this file
  current?", because that question is about a location in an artifact and the
  memory has no locations.

The key is a slug minted once when the unit is created and carried through
every rename, reorder and rewrite of its content. If the corpus has no such
identity yet, that is the first work item — a pinning system on unstable keys
produces confident, wrong verdicts, which is worse than no verdicts.

## Where the record lives: with the artifact

The record ships **in the tree, beside the translations it describes**, not
only in a translation platform's database. The question "is this stale?" is
asked by a build gate on a machine with no credentials, by a reviewer holding a
branch, by an agent working offline against a checkout. A provenance store
reachable only by querying a service has turned a question about a local
artifact into a network call, and the first time the service is unreachable the
gate either fails the build for the wrong reason or — far more likely — is made
non-blocking, which ends the practice.

Two shapes work. A **per-locale sidecar** carries one record per unit for that
locale, so a whole locale's provenance is one readable artifact and a bulk
translation pass writes one file. **Inline provenance** puts the record next to
each translated unit, so a unit and its pin cannot be separated by a move. The
sidecar is easier to audit and easier to corrupt as a set; inline is harder to
audit and impossible to desynchronize. Choose by which failure you fear;
declare which you chose. What does not work is a third artifact in a third
place, updated by a third program.

## Carry legible dimensions beside the opaque digest

A twelve-character digest is unreadable by design, and a report built only from
digests forces a human to diff two revisions to learn anything about *what*
moved. So the source-hash manifest the pipeline computes should carry, next to
each digest, two or three **cheap human-legible dimensions of the same
content** — the title as text, the length of the summary, the length of the
body. They are not part of the digest's input and they are not authoritative;
they exist so that a reader comparing two runs can tell a typo fix from a
rewrite at a glance, and so that an emitter bug that starts hashing empty
bodies is visible as a column of zeroes rather than as a corpus of plausible
hex. The digest answers *whether*; the dimensions answer *roughly how much*,
which is exactly what a person triaging a drift report needs first.

## The pin is written by the tooling, never transcribed by the translator

The digest is machine-generated, opaque, and fixed-length — which is to say it
is the single worst kind of value to route through a step that paraphrases.
When a pipeline hands a translator a manifest of hashes and asks the
*translator* to copy the matching hash into each unit's record, it has put an
exact-fidelity value inside a channel built for inexact fidelity, and this is
sharply worse when the translator is a language model: transcription of long
opaque tokens is a known weak point, the corruption is one character in twelve,
and the corrupted record is syntactically perfect. A single wrong character
produces a unit that reports stale forever, is re-translated on every run,
never becomes fresh, and gives no clue why.

So: **the tooling writes the pin.** The translator returns target prose keyed
by unit identity; the pipeline computes or copies the digest and writes the
record itself, in the same write. If a manifest must be handed to a translating
agent at all, it is for context — knowing which units it is being asked to
produce — and never as data the agent is expected to reproduce byte for byte.
The general rule is worth stating beyond translation: **never route an exact
identifier through a generative step.**

## Write the record in the same operation as the translation

The provenance record is written **by the same operation that writes the
translated text**, in the same commit, ideally in the same file write. A
pipeline that translates first and stamps provenance in a later pass has a
window in which translations exist with no record, and every recovery from that
window is a guess: the recovering program cannot tell a unit translated
yesterday from current source apart from one translated last year, so it either
stamps everything current (falsely marking the whole corpus fresh, which is the
worst outcome the subject has) or marks everything unpinned (correct, and
expensive).

The corollary binds humans too. A translator who edits target prose by hand and
does not touch the record has just made the record a lie in the direction that
matters least — the target changed, the pin still describes the source
correctly — but a translator who *pulls in new source text* by hand and does
not restamp has made it a lie in the direction that matters most. The rule to
write down is: **the hash is restamped exactly when the unit is re-derived from
source, and never otherwise.**

## What the record is not

**It is not review state.** Freshness ("derived from current source") and
review ("a qualified human has signed this") are orthogonal, and both are
real. A unit can be fresh and unreviewed — the machine pass just re-derived
it — or stale and beautifully polished. Systems that carry one field for both
fail in both directions: a re-translation run silently discards human polish
because the field said "needs work", or a review pass marks stale text
"approved" because approval was the only state available. Carry two fields.
The freshness field is computed; the review field is asserted by a person; the
report shows both because *fresh but unreviewed* and *stale but reviewed* are
different queues with different owners.

**It is not a quality score.** Nothing in the record claims the translation is
good. It claims only that it was made from a particular source revision by a
particular agent on a particular date, which is precisely the claim a machine
can verify.

## When not to bother

Under a few hundred units and a handful of locales, "re-translate everything
each release" costs less than the provenance machinery and loses nothing,
because there is no accumulated human polish to churn. The practice starts
paying the moment either half of that stops being true: enough volume that a
full re-run is a budget line, or enough human review invested that a full re-run
would destroy work. Both thresholds arrive quietly, and the corpus that crosses
them without a pin has to be pinned retroactively at unknown truth — which is
the one migration in this subject with no clean answer.
