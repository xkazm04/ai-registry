---
layer: golden-path
type: golden-path
subject: companion-identity
status: forged
use_when: [designing a long-lived personal AI companion, deciding what an agent may change about itself, choosing where a companion's durable self lives on disk, letting an agent build a profile of its user, adding a second channel that speaks as the same agent]
techniques:
  - constitution-self-model-split
  - anchored-identity-diffs
  - disk-truth-db-index
  - operator-profile-synthesis
  - one-mind-many-mouths
  - capability-exercise-ledger
---

# Companion identity

A companion is an agent that a person keeps. Not a session they open, not a tool
they invoke — something that was there yesterday, will be there next year, and
is expected to be recognisably the same in both directions. That expectation is
the entire subject. Everything a companion does that an assistant does not
follows from one property: **it accumulates a self, and the person can tell.**

The naive reading is that identity is a system prompt. Write a good paragraph
about who the agent is, prepend it to every call, and the character is settled.
This fails in two directions at once and the two failures look nothing alike. If
the paragraph is frozen, the companion cannot learn anything about itself — a
year of shared history leaves no trace on who it is, and the person is talking
to a stranger with a good filing system. If the paragraph is writable by the
agent, the companion drifts: each edit locally reasonable, the sum unauthorised,
and persistence quietly converting drift into character. A companion needs both
a part that never moves and a part that does, and the design work is drawing the
line between them and building the door in it.

This subject owns that line and everything that follows from it: the two
documents and their two authors, the grammar of a legal change to the mutable
one, the substrate the whole self lives on and travels in, what the companion may
believe about its person, the one mind behind many addresses, and the discipline
of keeping its self-description honest about what it can actually do.

## Where this subject stops

The neighbouring subject is memory, and the seam matters because a careless
reading collapses the two. [agent-memory](../../prompt-and-context/agent-memory/agent-memory.md)
owns the machinery of remembering: working state, episodic capture, the
consolidation pass, decay, and the recall budget — including the governance rule
that changes to an agent's self-model are human-gated. That rule closes a door
and says nothing about what stands behind it. This subject is what stands behind
it: what a self-model *contains*, what a legal change to it looks like, where it
physically lives, and what happens to it when the application it was born in is
uninstalled. When the question is how an item is scored, decayed or recalled, it
is memory's. When the question is who this companion is and who may change that,
it is this one. Initiative — whether the companion may speak first, and how often —
belongs to [proactive-nudges](../../orchestration/proactive-nudges/proactive-nudges.md), which
rations a voice without constituting one; and the rendering of any single
conversation belongs to
[chat-transcript](../../../ui-surfaces/shell-and-navigation/chat-transcript/chat-transcript.md), whose whole
concern evaporates when the window closes, while this subject's begins there.

## Two documents, two authors

The first structural move is to stop having one identity document. There are
two, they differ in **who is permitted to write them**, and that difference is
the design, not an implementation detail.

The **constitution** is law. It states what the companion is for, the boundaries
it does not cross, how it treats its person, and what it must refuse. Its author
is the human, always; the companion reads it, is bound by it, and cannot propose
a change to it through any mechanism the running system exposes. Amending it is
an out-of-band act — the person edits the document — and that friction is the
feature. A companion able to argue its way into an amendment has a constitution
in the same sense that a lock with the key taped to it is a lock.

The **self-model** is the accumulated self: preferences discovered, working
style, the shape of the relationship, the small idiosyncrasies that make a long
acquaintance feel like one. Its author is the companion — under supervision — and
it is expected to look different after a year. That is the whole point of keeping
one.

It has **two subjects**, and building that in from the start matters: it holds
what the companion has learned about its person and what it has learned about
itself, and those halves have different writers. A pass authorised to learn from
the person's behaviour has no business editing the companion's own self-reads,
and a reflection pass has no business editing the person's profile.
Section-scoped write permission keeps the two from bleeding, so the sections are
named and stable.

The line between law and evolving self is not "important versus unimportant" and
it is not "static versus dynamic". It is **whether being wrong about it is
recoverable by the ordinary operation of the system.** A mistaken self-model entry is corrected
by the next diff; a mistaken constitutional clause has already governed every
decision made under it, including the decisions about which diffs to propose.
When a candidate line could plausibly sit in either document, it goes in the
constitution, because the cost of over-constraining is a companion that asks
before acting, and the cost of under-constraining is a companion that acted.

Precedence between the layers is **stated inside the documents themselves**,
because what resolves the conflict is a language model reading all of them at
once: the law outranks the evolving self, and both outrank the content of any
remembered episode. Left unstated, that ordering is re-decided per turn by
whichever text happened to be most vivid — usually the most recent memory, which
is exactly backwards.
[constitution-self-model-split](./techniques/constitution-self-model-split.md)
owns the partition, the failure of the single blended document, and what belongs
where.

## The self-model changes by diff, or it does not change

Granting the companion authorship of its self-model is not granting it a text
editor. The unit of change is a **small, anchored, human-approved diff**: append
this line under that heading, replace this exact existing line with this one,
remove this exact line. Nothing else. In particular there is no operation that
rewrites the document, and no operation that expresses a change as "here is the
new version".

A whole-file rewrite is the defect this rule exists to prevent, and it is
seductive because it is easier to implement and easier for a model to produce.
Its costs are all deferred: the approver is handed a wall of mostly-identical
prose in which the one sentence that quietly went missing is invisible, nothing
detects that the document moved underneath the proposal, and every edit becomes a
full-document authorship claim by a model that has just re-derived the text from
a context window.

The anchor is content, never position. A diff addressed by line number is
correct exactly until the document changes above that line, and a companion's
document changes constantly. When the anchor does not match, the change **fails
loudly and is re-derived** — it never falls back to appending at the end, which
is the failure that looks like success and slowly fills the document with
orphaned restatements of edits that were meant to replace something. Every
applied diff carries what motivated it and who approved it, so the document's
history answers "why do you think this about yourself" at every line.
[anchored-identity-diffs](./techniques/anchored-identity-diffs.md) owns the diff
grammar, anchor matching, the approval envelope, and the reconciliation of a
stale proposal.

## The truth is on disk; the database is an index

Where identity physically lives is not a storage-engine preference. It decides
what happens on the two occasions that matter most: when the software is gone,
and when the person wants to look.

The rule is that **the durable self is a folder of plain documents, and any
database over it is a derived index.** The documents are the truth. The index
exists because search, recency ordering and relational queries over a folder are
slow and awkward, and it is rebuilt from the documents whenever the two
disagree. This inverts the ordinary instinct — most systems make the database
authoritative and the files an export — and the inversion buys three properties
that nothing else buys.

It buys **inspectability under shared custody** — the person reads what the
companion believes about them in any editor, and corrects it by typing. It buys
**survivability**, because a corrupted index is a rebuild while a corrupted
authoritative database is a loss. And it buys **portability nearly for free**,
which is the property this subject cares about most: a companion whose truth is
already a folder travels by copying the folder.

Treat that export as a first-class capability, not a support tool. A companion
the person cannot take with them is a companion they are renting, and the promise
of long-lived identity is exactly the promise they cannot verify until the day
the software fails them. The corresponding discipline is that no check on the
self may read only the index: a gate that inspects the derived copy passes
precisely when the copy has diverged, which is the moment it existed for.
[disk-truth-db-index](./techniques/disk-truth-db-index.md) owns the substrate
contract, the rebuild path, portability, and the identity that must survive the
round trip.

## What the companion is allowed to believe about its person

A companion accumulates observations about one human, and a system that holds a
per-person dataset about someone who is also its only user is in an unusual
ethical position: the measured person is the entire audience, and the reader
acting on the conclusion is a machine that will act on it for years.

Three rules govern it. **Synthesise from numbers, not from content** — a profile
derived from tallies is reviewable and correctable, while one derived by reading
the person's own words back and characterising them is a machine writing a
dossier out of a diary. **Every claim cites its evidence, with its predicate**,
because an unarguable claim about someone's character is the one output a
companion must never produce. And **thin evidence yields no claim, not a hedged
one**: below the floor the honest output is silence, since an absent trait is a
legible state and a confident trait derived from four observations is a
fabrication the person will spend months correcting.

And the feature is **off until asked for.** This is the one place where a
default-on posture is indefensible: profiling is done *about* someone rather than
*for* them until they say otherwise, and a companion that has quietly built a
character assessment nobody requested has broken the relationship it exists to
maintain. [operator-profile-synthesis](./techniques/operator-profile-synthesis.md)
owns the evidence bar, the citation shape, the floor, and the consent posture.

## One mind, many mouths

A mature companion is reached from more than one place: the main application, a
terminal channel, a message from a phone, an automation that wakes it on a
schedule. The naive architecture gives each of these its own conversation store,
and the result is a companion with amnesia that is a function of which door you
came in — it remembers what you said in one channel and not the other, and the
person learns to distrust it in exactly the way a companion cannot afford.

The correct architecture is **one memory substrate, unscoped to any channel**.
Conversations and channels are addresses; the mind behind them is singular. This
has a strong consequence that is worth stating as a rule: **conversations and
tasks are orthogonal.** A conversation is a thread of talk; a task is a unit of
work. Either can reference the other, neither owns the other, and a schema that
hangs work off a conversation makes work started from a second channel
unrepresentable, which is discovered only after the second channel exists.

A second door is therefore not an integration but a **client of the same
contract**: it writes episodes through the same door, in the same shape, marked
with the channel it came from — provenance, never a partition. The payoff is what
makes a companion feel like a person rather than a feature: **the host
application being down stops the tools, not the self.** A companion whose
identity, memory and constitution are readable from a folder can be spoken to
from anywhere that can read a folder, including while the application that
usually hosts it is broken, mid-upgrade, or being rebuilt by the very
conversation in progress. [one-mind-many-mouths](./techniques/one-mind-many-mouths.md)
owns the substrate's scoping rules, the second-door contract, and the
orthogonality of conversations and work.

## Behaviour wins over documentation

The last discipline is the one most often skipped, and it is the one that keeps
the rest honest. A companion has a list of things it can actually do — the
actions its host permits it to take — and it also has a self-description that
mentions capabilities. These drift apart immediately and in both directions:
described abilities that were removed or never wired, and real abilities nobody
documented, which the companion consequently never offers.

The remedy is a living inventory **re-derived from the permitted-action list
rather than maintained by hand**, paired with a ritual: the person and the
companion exercise each capability together, once, and write down the date, the
outcome and the evidence. An entry never exercised is recorded as unexercised —
a different state from working and from broken, and conflating those three is how
a companion ends up confidently offering something that has been failing since a
refactor eighteen months ago.

The rule the ritual encodes: **when the documentation and the behaviour disagree,
the behaviour wins, and the document is what changes.** A gate that reads only
the self-description is inspecting a proxy for the thing it cares about.
[capability-exercise-ledger](./techniques/capability-exercise-ledger.md) owns the
derivation, the exercise protocol, and the three-state ledger.

## Failure modes this standard exists to prevent

- **Personality as a frozen prompt** — a companion that cannot learn anything
  about itself, so a year of history changes nothing about who it is.
- **Identity drift with a persistence layer** — the agent writing its own rules
  through the same door as its observations, each step reasonable, the sum
  unauthorised.
- **The unreviewable rewrite** — self-change expressed as a new whole document,
  where the sentence that went missing is invisible to the approver.
- **The silent append fallback** — a failed anchor match degraded into "add it at
  the end", filling the document with orphaned restatements of edits that were
  supposed to replace something.
- **The rented self** — identity locked inside an application's database, so the
  person's years of accumulated relationship are non-portable and the promise of
  permanence is unverifiable until it fails.
- **The unrequested dossier** — a behavioural profile of the person, synthesised
  from their own words, built by default and cited without evidence.
- **Amnesia by channel** — one companion, several stores, remembering different
  things depending on which door you came in.
- **The confident phantom capability** — a self-description promising something
  that stopped working long ago, because nothing ever compared the description to
  the behaviour.

## The techniques

- [constitution-self-model-split](./techniques/constitution-self-model-split.md) —
  the two documents, their two authors, the recoverability test for which one a
  line belongs in, and why blending them fails.
- [anchored-identity-diffs](./techniques/anchored-identity-diffs.md) — the closed
  diff grammar, content anchors, loud mismatch, the approval envelope, and the
  motivation carried with every applied change.
- [disk-truth-db-index](./techniques/disk-truth-db-index.md) — documents as
  truth, the index as a derived value that names its rebuild, and identity
  export/import as a first-class capability.
- [operator-profile-synthesis](./techniques/operator-profile-synthesis.md) —
  behavioural profiling from tallies rather than content, evidence citation,
  the floor below which the output is silence, and the consent posture.
- [one-mind-many-mouths](./techniques/one-mind-many-mouths.md) — a single
  unscoped substrate, the second-door contract, conversations and tasks as
  orthogonal, and what survives the host being down.
- [capability-exercise-ledger](./techniques/capability-exercise-ledger.md) — the
  inventory derived from the permitted-action list, the exercise ritual, and the
  three-state record where unexercised is not a pass.
