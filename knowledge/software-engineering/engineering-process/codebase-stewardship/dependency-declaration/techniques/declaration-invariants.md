---
layer: technique
type: technique
subject: dependency-declaration
technique: declaration-invariants
status: forged
laws: [one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [evaluating a proposed mechanism for declaring dependencies, a plugin cannot ship its own requirements, a generated manifest must be rebuilt whenever any participant changes, deciding whether a declaration mechanism will survive third-party extension]
---

# Declaration invariants

Three properties decide whether a declaration mechanism will still work when the
system has more parts than its designer imagined. They are cheap to check, they
fail independently, and each failure produces a different and recognisable cost —
which is what makes them a test rather than three synonyms for "good design".

| Invariant | Holds when | The question |
| --- | --- | --- |
| **Locality** | the declaration lives with the unit that needs it | can a unit state its own requirements? |
| **Composability** | declarations merge without global coordination | can two units that do not know about each other both be added? |
| **Scalability** | transitive edges need not be enumerated | does adding one thing require writing down everything it implies? |

Score a proposed mechanism on all three *before* adopting it. The score is not a
verdict — plenty of good mechanisms fail one deliberately — but each failure
predicts a specific cost, and a designer who has not priced that cost has not
made the trade, they have just not noticed it.

## Locality: can the unit speak for itself?

Locality fails when the declaration must live somewhere the depending unit does
not own: a host document, an application-level manifest, a central registry file.

The reason it hides is that **the first team pays nothing.** An application
declaring its own dependencies in its own top-level file has, from where it
stands, perfect locality — the declaration is right there, in a file it owns. The
defect only becomes visible when a *reusable* unit needs the same mechanism, and
by then the mechanism has shipped.

At that point a unit with requirements it cannot declare has exactly three moves,
and all of them are worse than declaring:

- **Push them onto consumers.** Documentation saying "you must also register
  these". Now every consumer performs a setup step correctly or fails in a way
  that looks like the unit is broken.
- **Absorb them.** Fold the requirement inside itself, which duplicates whatever
  it needed and forfeits sharing — see
  [vendored-copy-loses-composition](./vendored-copy-loses-composition.md).
- **Take them as parameters.** Expand the interface so consumers inject what the
  unit needs. This is sometimes genuinely right, and it is a real cost: the
  interface now describes the unit's internals, and every consumer learns them.

The corpus already argues why misplacement is a defect, in more general terms
than this subject needs to restate:
[locality-and-leverage](../../module-design/techniques/locality-and-leverage.md)
gives the operational form — *things that change together live together, things
that change for different reasons live apart* — and notes that the neglected half
is the second one. A unit's requirement list changes when and only when the unit
changes. Any mechanism that stores it elsewhere co-locates it with things that
change for unrelated reasons, which is the same rule broken by infrastructure
rather than by an author.

**The diagnostic:** ask who has to edit a file when a unit gains a dependency. If
the answer is anyone other than that unit's author, locality has failed.

## Composability: can two strangers both be added?

Composability fails when independent declarations cannot combine without a party
who knows about all of them. It is usually the consequence of a locality failure —
if declarations must live in one shared surface, something has to merge them — but
it can occur alone, wherever declarations can conflict and nothing defines
precedence.

**The diagnostic is a question about associativity.** Adding unit A and then unit
B should produce the same system as adding B and then A, and adding either alone
should not require knowing about the other. Where that fails, composition has
become an operation performed *on the whole set* rather than on one member, and
the mechanism's cost per unit grows with how many units already exist.

Two symptoms are worth recognising because they are usually described as
successes:

- **A generated merge file.** A single artifact assembled from every
  participant's needs, rebuilt whenever any of them changes. The generator is
  real work that genuinely helps, and it is also the proof: a mechanism that
  composes does not need one.
- **A registration order that matters.** When the documented fix for a conflict
  is "declare it earlier", precedence is being decided by traversal order, which
  is not a rule anyone can reason about locally.

Where declarations *can* legitimately conflict — two units wanting different
resolutions for one name — the mechanism needs a scope concept, so that both
resolutions can exist at once rather than one winning globally. A mechanism whose
namespace is flat has decided that conflicts are errors, which is a defensible
choice only if it can also state, from one authority, which declaration wins
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## Scalability: is the graph writable by hand?

Scalability fails when the mechanism requires every transitive edge to be
declared, not just the direct ones. Direct requirements are a short list an author
can write; the transitive closure is not, and the gap between them grows
superlinearly with depth.

The usual response is a generator, and the usual mistake is to treat that as
having solved it. A generated closure is a **derived artifact with no reaper**
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): it is
created by a build step, committed, read by the runtime, and nothing states when
it becomes wrong. Its staleness is invisible precisely because it looks like
source — a file full of plausible entries, most of them correct, one of them
describing a version that no longer exists.

So the honest formulations are two, and the technique that separates them is
[progressive-resolution](./progressive-resolution.md):

- Where the graph is **closed** — every participant known to one party at
  declaration time — enumeration is legitimate and its artifact should say what
  regenerates it and when it expires.
- Where the graph is **open** — arbitrary units, arbitrary depth, contributed by
  people who do not know about each other — enumeration cannot be complete, and
  presenting it as complete is the actual defect rather than the enumeration
  itself.

## Scoring, and what a failure is worth

Write the three verdicts down, with the cost each implies. The output is a
sentence rather than a grade:

> *Locality: fails — extensions cannot ship requirements, so every extension's
> setup is documentation. Composability: fails — one merged file, regenerated on
> any change. Scalability: holds — direct declarations only.*

Two failures out of three is not automatically a rejection. Mechanisms trade
these deliberately and correctly: a system with a closed, curated set of
participants may pick central declaration on purpose, because it wants exactly one
place to look and has no third-party extension story to protect. **What the score
prevents is the far more common case** — adopting a mechanism whose invariants
were never examined, and discovering the missing one at the moment somebody asks
for the extension model.

The trade only stays honest while the assumption behind it does. A mechanism
chosen because the participant set is closed has taken on a dependency on that
closure, and the day a plugin interface is announced is the day the trade needs
re-pricing rather than the day the mechanism gets one more special case.
