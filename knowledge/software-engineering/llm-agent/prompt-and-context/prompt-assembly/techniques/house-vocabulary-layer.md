---
layer: technique
type: technique
subject: prompt-assembly
technique: house-vocabulary-layer
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse]
shared_with: []
use_when: [output is verbose or generic and instructions to be concise are not working, an agent renames the project's own concepts, onboarding an agent onto an established domain, deciding what belongs in a persistent context file]
---

# House vocabulary layer

Agent output that is unreadable — bloated, hedged, full of general-purpose
phrasing that says little — reads like a style problem, and it is almost always
treated as one. The instinctive fixes are all instructions: be concise, avoid
filler, write plainly, adopt this tone.

They underperform, consistently, and the reason is that **the output is not
badly styled, it is ungrounded.** A model with no vocabulary for the specific
thing it is discussing falls back on general language, and general language is
verbose by construction: where a domain has a word, prose without that word
needs a clause. Instructing it to be brief while withholding the words that
would make brevity possible asks it to compress a description of something it
has no name for.

The fix is to supply the names. A **house vocabulary layer** is an owned section
of the prompt carrying the project's own terms — the nouns for its concepts, the
verbs for its operations, the distinctions it treats as load-bearing — so that
the model writes in the language the reader already thinks in.

## Why this outperforms a style instruction

- **It shortens output as a side effect.** A named concept costs one word.
  Replacing a paraphrase with a term is compression that loses nothing, unlike
  a length instruction, which compresses by dropping content and cannot know
  which content mattered.
- **It is checkable.** "Was this concise?" is a judgment. "Did it use the
  project's term for this, or invent one?" is close to an assertion, and it can
  be reviewed by someone who knows the domain in seconds.
- **It fixes the failure underneath the symptom.** A model that renames a
  concept has not merely written awkwardly — it has demonstrated that it is not
  reasoning about the same object the team is, and the prose is the first place
  that becomes visible. Verbosity here is a *diagnostic*, and treating it as a
  style defect suppresses the signal.

A short leading instruction naming an external plain-language standard is worth
including alongside — it is cheap and it sets a register. But it is the smaller
half, and shipping it alone is what produces the familiar result of an agent
that is tersely generic instead of verbosely generic.

## What belongs in it

Terms that are **frequent in this domain and load-bearing in it**, with one line
each. Frequency alone selects common words; what earns a slot is a term whose
local meaning is narrower, different, or more specific than its general one.

- **The concepts** — the nouns the team argues about, each with the distinction
  it draws and, where it exists, the thing it is deliberately *not*.
- **The operations** — the verbs, especially where a general word has been given
  a precise local meaning.
- **The deliberate exclusions** — terms the project has decided against, and
  what to say instead. This is the highest-value line per character, because it
  is the only way to stop a model reaching for the obvious synonym.

What does not belong: anything the model would use correctly anyway, and
anything that is really a rule rather than a name. A vocabulary layer that
grows into a style guide has become a second policy section with no owner.

## One authority, and identity that survives paraphrase

The vocabulary has exactly one source
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary))
— a single file the team maintains and the assembler renders. The failure it
prevents is specific and common: a definition inlined into three prompts, then
refined in one of them, after which two features disagree about what a core term
means and neither looks wrong when read alone.

That file is also the natural home for the terms in every other artifact a
person reads: the same names should appear in documentation, in interfaces, and
in the prompt, or the model's output is fluent in a dialect the reader does not
speak.

**A term's identity is the term itself, not its definition text**
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
Definitions get sharpened; references to them must not break when they do, which
means other layers cite the term and never restate it. A restated definition is
a fork with a delay.

## Budgeting it, and keeping it fresh

The layer is small and permanent, which makes its budget question easy: it is a
**floor**, not an elastic allowance. Its whole value is supplying names the model
does not otherwise have, which is by definition material the agent could not
have obtained itself — see
[context-reachability](./context-reachability.md), where that is the property
that distinguishes what may be cut under pressure from what may not.

Being unreachable also raises its accuracy bar rather than lowering it. A term
defined wrongly here is worse than absent: the model adopts it confidently and
its output reads *more* authoritative while meaning something the team does not.
Prune the layer when the domain's language moves, and treat a term nobody uses
any more as a defect and not as harmless residue.
