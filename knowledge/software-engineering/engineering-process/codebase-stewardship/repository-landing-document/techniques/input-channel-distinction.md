---
layer: technique
type: technique
subject: repository-landing-document
technique: input-channel-distinction
status: forged
laws: [verdict-survives-boundary]
shared_with: []
use_when: [a front page mixes shell commands with sentences meant for an agent, a reader pasted the wrong block somewhere and it failed, choosing a visual treatment for a new kind of block]
---

# One channel per input destination

A landing document for anything installable contains blocks the reader is
meant to *do something with*, and at least three destinations for them: a
shell, a conversational agent, and their own eyes. The document's markup
renders all three identically by default — a fenced block is a fenced block,
whether it holds a package-manager invocation or an English sentence — so the
reader's only way to know where a block goes is to read it and infer. Most
readers do not read; they scan for the monospace rectangle and copy it.

The failure this produces is small, silent and expensive out of proportion to
its size. A reader pastes a sentence of English at a shell and gets a
not-found error. A reader types a shell command at a conversational tool and
gets a paragraph of apology. In both cases the project's first observable
behaviour is failure, at the exact moment the reader was deciding whether it
works, and the project never hears about it, because the reader concludes the
tool is broken rather than that the document was ambiguous.

## The rule

> **One visual channel per input destination. Never one channel shared
> between two destinations, and never a channel that carries no
> distinction.**

Three clauses, and the third does as much work as the first two. A document
that decorates ordinary prose with the same treatment it uses for agent
instructions has not created a channel; it has trained the reader that the
treatment means nothing, and the reader then skips the instances where it
meant something. Decorative emphasis is not free — it spends the one signal
the document has.

Assigning the channels is a local choice and only the assignment's properties
matter. In practice the monospace fenced block is claimed by the shell,
because that association is universal and a project cannot win a fight against
it. Agent speech therefore takes a different channel — a callout block, a
quotation, a distinctly labelled box — and the reader learns the mapping from
the first instance and applies it to the rest. Where the host offers several
*kinds* of callout, varying the kind by intent (this one is the ordinary path,
this one is the shortcut, this one is the question you ask months later) is a
legitimate second dimension, and it is a dimension and not a third channel:
all of them still mean *say this*.

## The distinction must survive the strip

The channel a project chooses is almost always host-specific, and
host-specific block syntax degrades on every other surface the document is
published to — a callout arrives at a package registry as a plain quotation,
and at a plain-text viewer as its literal markup. A distinction carried only
by tinting is therefore a distinction that exists on one surface and is absent
on the rest, which is
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary):
a classification that survives only as presentation has not survived to the
boundary that acts on it, and the boundary here is a reader deciding where to
paste.

So the channel carries **a lead-in in text**, inside the block, that names the
destination in words: a short phrase, a labelled heading line, a single
consistent glyph — anything that is still there when the styling is gone. With
the lead-in present, the rich surface gets both signals and the poor surface
gets one, and no surface gets zero. Without it, the technique holds on tier
one and evaporates everywhere else.

This is what makes a collapsing channel **admissible**. The alternative rule —
use only syntax that renders identically everywhere — is available, and it is
worse: it forfeits the clarity of the surface most readers are actually on in
order to protect surfaces where one phrase of text would have sufficed. Choose
the rich channel, and pay the one phrase.

## Consistency is the whole value

A channel assignment is worth exactly as much as its consistency. Two blocks
of agent speech in different treatments teach the reader that the treatment is
random, and one shell command in the agent channel poisons every other block
in the document, because the reader who was burned once now reads all of them
before copying — which is the state the technique existed to leave.

The practical consequence is that the assignment belongs in the project's
written conventions rather than in a contributor's memory, and it belongs
there in the detectable form
[style-rule-ships-its-detector](./style-rule-ships-its-detector.md)
demands. The detectable form here is unusually easy: the set of block
treatments in the document is finite and enumerable, and a rule that says
*every fenced block is a shell command and every callout opens with the
lead-in phrase* is a two-line search away from being checkable.

## When not to bother

A document with exactly one input destination does not need channels. If
everything the reader is asked to do happens at a shell, one treatment is
correct and adding a second is the decorative case the rule forbids. The
technique switches on at the second destination, and the tell that a project
has crossed that line is a block whose content is a sentence rather than a
command.
