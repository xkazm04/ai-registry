---
name: idea-architecture-verdict
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/codebase-health
---

# Idea architectural fit verdict

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** An idea reaches a ranking queue carrying only its own enthusiasm, so whoever
ranks it has to work out for themselves who it helps, what it costs and whether the
architecture even allows it. The verdict that comes back is usually made of the two easy
halves: what already exists that this fits, and what it would contradict. The half that
decides most arguments is the one nobody produces unprompted, which is what the idea
assumes is already there and is not.

**Input.** The idea as it arrived with its stated constraints, the real architecture it
would land in, and the decisions and conventions already settled here, including the
options this project has already considered and turned down.

**Core action.** Decide first whether this is even an architecture question, then say
what the idea fits, what it contradicts, and what it assumes exists that does not, being
willing to conclude that it should not be done and saying why in terms a later scan can
respect.

**Output.** A verdict naming who benefits, what it costs, what it would break, what is
missing that it needs, and what would tell you it worked, short enough to read and
specific enough to disagree with.

## Activities

1. Take the idea as it arrived, with its stated constraints *(observe)*
2. Decide whether this touches the architecture at all or is an ordinary change
*(decide)*
3. Check it against the real code and the decisions already settled *(observe)*
4. Say what it fits, what it contradicts, and what it needs that is absent *(decide)*
5. Say what it costs and what would tell you afterwards that it worked *(decide)*
6. Hand the verdict on, with anything unverified marked as unverified *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**An idea reaches the ranked queue already carrying what a reviewer would otherwise have
had to work out: who it helps, what it costs, and whether the architecture allows it.**

- Each verdict states who benefits, what it is worth, and what would tell you afterwards
  that it worked.
- The verdict names what the idea needs that does not yet exist, not only what it fits
  and what it breaks, because the missing piece is the part a reader will not find by
  looking at what is there.
- An idea that contradicts a settled decision or duplicates shipped work is turned away
  with the reason attached, and an idea that revives an option this project already
  rejected is answered by whether the original reason still holds rather than by the
  rejection itself.
- The verdict is short enough to read in one sitting and specific enough that somebody
  could disagree with a named part of it.

**The expensive verdict is spent on the ideas that can actually move the architecture,
and the rest are passed through cheaply and said to be ordinary.**

- An idea with no measurable effect on the structure is recorded as ordinary and
  returned quickly, rather than given a full verdict that reads like one.
- A verdict never becomes a design document: this work decides whether, and leaves how
  to whoever builds it.

**When the evidence for a claim is not in the code, the verdict says so instead of
presenting a guess as a reading.**

- A verdict produced without access to the code still arrives, labelled as unverified,
  rather than being reported as blocked.
- A judgment about deployment, infrastructure or a general principle is marked as weaker
  evidence than a judgment about code, because for those the code does not contain the
  answer and reading it harder does not help.
- Every claim the verdict makes about what exists can be traced to something that was
  read, and anything else is stated as an assumption in its own right.

## Guidance

Decide first whether this is even an architecture question. Most ideas are not, and
treating every one as though it were is how a verdict becomes a ritual nobody reads.
Then say what the idea fits, what it contradicts, and what it assumes exists that does
not. The last is the one nobody produces unaided and the one that settles arguments. A
good idea that fights the grain of this codebase is still a net loss, and the grain is
this project's own idiom rather than the industry's current one.

## Where this is worth adopting

- A ranking queue where ideas arrive as one enthusiastic sentence, so ranking them means
  someone opening the repository for each one, and in practice they get ranked by who
  suggested them.
- A team that keeps relitigating an option it rejected two years ago, where nobody can
  say whether the reason for the rejection is still true and so the argument restarts
  from taste every time.
- A codebase with a strong local idiom that a stream of well-intentioned proposals would
  each individually improve and collectively dissolve, where the useful verdict is that
  a good idea does not fit here.
- An operator receiving ideas from several producers, human and automated, who needs the
  cheap ones waved through as ordinary so the expensive judgment is spent on the few
  that could actually move the structure.
- A moment when the codebase cannot be reached at all, where the honest deliverable is a
  labelled verdict built on assumptions rather than a blocked queue with nothing in it.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[codebase](examples/codebase.md) for `source_control`.

## Recommended trigger

`event`. The verdict exists only in response to an idea arriving, and it has to be there
before the idea is ranked, so this work wakes on arrival rather than sweeping for
unjudged ideas. A sweep would also produce its verdicts in the wrong order, because the
idea that most needs one is the newest.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the adopter is optimising for right now, because worth is meaningless without
  knowing what counts as worth here, and it changes more often than the architecture
  does.
- The decisions already settled and the constraints that are genuinely hard, so a
  verdict can cite them rather than rediscover them, and so a revived option can be
  answered on its original reason.
- This project's own idiom, which is not the same as current practice in its language or
  framework, and is the thing a fit judgment is actually made against.
- Which lenses the verdict should cover, since the useful ones differ between a product
  with users and an internal tool with three.

## Dependencies

None.
