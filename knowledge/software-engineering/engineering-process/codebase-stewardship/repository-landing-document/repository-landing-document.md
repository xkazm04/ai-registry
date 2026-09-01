---
layer: golden-path
type: golden-path
subject: repository-landing-document
status: forged
use_when: [a repository's front page has grown into a manual, deciding what belongs on the front page and what routes onward, a project is about to be published where strangers will judge it in under a minute, the front page renders differently on the registry than on the code host]
techniques:
  - landing-document-as-router
  - multi-surface-degradation
  - input-channel-distinction
  - evidence-linked-badges
  - caption-carrying-figures
  - visual-text-cadence
  - style-rule-ships-its-detector
---

# The repository landing document

Every repository has one document that is read more than all its others
combined, and almost nobody has written down what it is for. It is the file
the code host renders when someone opens the project, the body a package
registry reproduces on the listing page, the text a plugin marketplace
excerpts into a card, and the thing a stranger scrolls for forty seconds
before deciding whether this project is worth an afternoon. It is
simultaneously an advertisement, a router, an install guide and a proof of
life — four jobs with four different readers — and because no one ever chose
between them, the usual outcome is a document that grew until its author got
tired.

That is the failure this subject exists to name, and it is not a failure of
writing quality. The prose in an overgrown landing document is usually fine.
The document is wrong at the level of *composition*: it answers questions only
some readers have, in the place every reader must pass through, with no way to
tell which paragraph is addressed to whom. The evaluator who wanted to know
what this is in ten seconds is reading a troubleshooting note about an
environment variable. The operator who wanted the install line is scrolling
past a paragraph of positioning. Both leave, and neither files a complaint,
because a landing document has no failing test and no crash — the reader who
bounced is a reader nobody ever hears from.

## The four readers, and why a single document cannot serve them serially

Four populations arrive at the same address. The **evaluator** wants to know
what this is and whether it is alive, and gives the page a screen and a half.
The **adopter** has already decided and wants the shortest path to a working
installation. The **user** is looking for a specific capability and wants to
know whether it exists before they invest in reading. The **contributor**
wants the local conventions and the gate. These are not stages of one journey;
they are four people, and three of them are wasting their time in any section
written for the fourth.

The naive resolution is to serve them in sequence — pitch, then install, then
features, then contribution notes — and it is the shape almost every
overgrown landing document actually has. It fails because sequence is only a
concession to the reader who is willing to scroll past three sections that are
not theirs, and readers on a shopfront are not. The correct resolution is
that the landing document answers **only the questions every reader has** and
**routes** the rest: a named destination, with a cell that says what is at
the other end, for each population it is dismissing. The landing document is a
switchboard that happens to also be an advertisement. Everything that follows
in this subject is a consequence of taking that sentence literally.

## The measurement that motivates the discipline

Surveyed on 2026-09-01 across seven working repositories on one engineer's
machine plus one published project, all eight counted by **a single
instrument** — words, figures, captions, badges, badges whose link target can
fail, reader-directed callouts, routed pages, and the longest unbroken run of
prose lines. One counter for every row, because two counters produce two
numbers and not a comparison
([count-carries-predicate](../../../_laws.md#count-carries-predicate)); an
earlier hand-count of the same fleet got a project wrong by scoring its badge
images as figures, which is the exact confusion the instrument exists to
remove.

**Seven of seven working repositories carry zero figures, zero captions, zero
reader-directed callouts and zero routed pages.** One of the seven has no
landing document at all. Their longest front page runs **3,444 words** while
routing nothing onward — a manual living in the shopfront — and their longest
unbroken prose run reaches **96 lines**, which is several screens of text with
nothing in it for the eye to land on. The published project, for comparison on
the same counter: **1,033 words**, three figures all captioned, five callouts,
four routed pages, longest prose run **19 lines**.

The prose-run figures above are counted against the closed break set that
[visual-text-cadence](./techniques/visual-text-cadence.md) defines, and that
definition is load-bearing rather than incidental: an earlier counter admitted
paragraph breaks and bare headings as breaks and read the same corpus at 39
lines rather than 96. Both numbers describe the same documents. Only one of them
counts what the rule says to count, which is why the rule states its break set
before it states its threshold.

That comparison is a reference and not a model, and the instrument says so in
the same table: three of the published project's seven badges link to targets
that cannot go red, which is a failure of a rule stated later in this very
subject. A practice that holds only because one repository does it is a
practice to distrust; the rules below are argued from what they cost and what
they buy, and the exemplar is scored against them like everything else.

What transfers from the survey is a *direction*, not a length. The healthy
landing document is the smaller half of a two-part system, and a project whose
front page is the only prose it has is not economical, it is unrouted. What
does not transfer is a word budget — a library, an application, a plugin and a
workspace of many packages have different reader populations, so the budget is
derived from the populations rather than fixed across them. That derivation is
[landing-document-as-router](./techniques/landing-document-as-router.md).

## Where this subject's walls sit

This subject owns the **composition of a repository's front page**: what earns
a place on it, what routes out of it, how a reader tells one kind of block
from another, what a figure must carry, how often prose may run without a
break, and what survives the several renderers that will show the document to
someone. It owns the question *does this element earn its place*, and nothing
about whether the element is still true.

Freshness is the neighbour, and the seam is sharp.
[docs-sync](../docs-sync/docs-sync.md) owns the coupling between a source
change and every prose surface that describes it: whether a claim has rotted,
what obligation a change incurs, how the rot is detected and repaired. A
landing document is one such coupled surface and inherits all of it. In
particular, a generated figure on the landing document is a coupled artifact
with its own rot problem, and that problem belongs next door: **this subject
decides whether a figure earns its place; that one decides whether it is still
true.** Say that once and stop — a landing document that carries a rot
discipline of its own has grown a second copy of a neighbour's machinery.

Two further neighbours are close enough to confuse.
[machine-authored-documentation](../machine-authored-documentation/machine-authored-documentation.md)
governs the acceptance of a document a model wrote, where the problem is that
the derivation cannot be re-run to disprove itself. A landing document is
hand-authored and its problem is composition, not truth; when a model drafts
one, that subject's acceptance gates apply *in addition* to this subject's
composition rules, and neither absorbs the other.
[docs-content-model](../../../ui-surfaces/published-surfaces/docs-content-model/docs-content-model.md)
governs a documentation *site* — a typed catalog of topic records, referential
invariants, per-topic freshness fields, draft gating. A landing document has
no catalog, no records and no navigation to derive; it is a single file whose
only structural relation to anything is the set of destinations it routes to.
The rule for picking: **if the artifact is one of many addressable pages, it
is a content model; if it is the one page nobody navigates to on purpose, it
is this subject.**

The claim-provenance neighbour needs its seam stated too, because badges look
like a shared problem and are not.
[public-claim-provenance](../../../ui-surfaces/published-surfaces/public-claim-provenance/public-claim-provenance.md)
governs claims an application renders on its own outward surfaces — a
roadmap's progress bar, a counter in a headline, a status page — where the
producing side is a build the project controls end to end. This subject
governs claims rendered *by a repository host on the project's behalf*, where
the project controls only the address it points at and the host controls the
rendering, the caching and whether the image loads at all. The provenance
discipline is the same discipline; the enforcement surface is not, and the
techniques differ because of it.

Finally, this subject does not own **release notes or changelogs**. They are
adjacent, they are frequently the destination of a routing row, and they are a
different artifact with a different clock: a changelog is append-only history
and rides the release pipeline, where a landing document is a standing claim
about the present that is rewritten in place.

## The seven walls

### 1. The document routes; it does not answer

A section belongs on the landing document when it answers a question **every**
reader has, and moves out — gaining a routing row as it goes — when it answers
a question only some readers have. That is the whole budget rule, and it is a
population rule rather than a word count, which is why it survives the move
from a library to a workspace of many packages. The routing row is the load-
bearing half: a destination cell that enumerates what is actually at the other
end routes a reader, and a cell that says *more information* routes nobody,
which makes it exactly as useful as no row at all while looking like diligence.
[landing-document-as-router](./techniques/landing-document-as-router.md).

### 2. The document renders on more surfaces than its author is looking at

The author writes against one renderer — the code host's, the richest one —
and every other surface degrades it silently. A package registry strips the
host's callout blocks to plain quotations. A marketplace card takes the first
paragraph and no images. A search result takes a sentence. A terminal viewer
takes the raw text. Nothing anywhere reports the degradation, so the author
never learns that the distinction their document depends on stopped existing
two surfaces down. The rule is that every **load-bearing** distinction must
survive to the plainest surface the document is published on, which in
practice means it is carried in words as well as in styling, and that a
project publishing to a stripping surface owes that surface a first paragraph
that stands alone.
[multi-surface-degradation](./techniques/multi-surface-degradation.md).

### 3. A reader must know what a block wants from them without reading it

A landing document contains at least three kinds of block that look identical
by default: something the reader types at a shell, something the reader says
to an agent, and something the reader only reads. Confusing the first two is
not a cosmetic failure — it produces a reader pasting a sentence of English
into a terminal, or typing a shell command at a conversational tool, and in
both cases the project's first impression is that it did not work. One visual
channel per input destination, never shared between two destinations, and
never a channel that carries no distinction at all — a decorative callout that
means nothing trains the reader to skip the callouts that mean something.
[input-channel-distinction](./techniques/input-channel-distinction.md).

### 4. A badge is a claim in the smallest available typeface

Badges are the most-copied and least-examined element on any landing document.
Each one is an assertion — this builds, this has no dependencies, this is
licensed thus, this supports that version — rendered small enough that nobody
audits it and prominent enough that everybody reads it. The characteristic
failure is not a false badge; it is a **badge that cannot become false**,
because it links to a homepage rather than to the artifact that would go red
if the claim stopped holding. Such a badge is decoration that survives the
truth it asserts, and it is indistinguishable, at a glance, from the one badge
on the row that is actually wired to a check.
[evidence-linked-badges](./techniques/evidence-linked-badges.md).

### 5. An uncaptioned figure asks the reader to guess

The markup a landing document is written in has no figure element and no
caption, so an image sits in the flow with nothing attached to it and the
reader supplies their own answer to *what am I looking at, and what is
different about it*. The naive fix — alternative text — is invisible to the
reader who can see the image, which is every reader this failure applies to.
Every figure carries a visible caption that states what the reader should
notice, and a comparison of two images carries what **differs** between the
panels, because the entire information content of a comparison is the delta
and the delta is exactly what an image pair does not state.
[caption-carrying-figures](./techniques/caption-carrying-figures.md).

### 6. The cadence is countable or it is taste

*Break up the prose* is advice, and advice loses every argument it has with a
contributor in a hurry, because two people can hold opposite opinions about
whether a page is dense and neither can be shown to be wrong. The rule that
survives is the one a reviewer can count: what the first screen must contain,
how far prose may run before a non-prose element breaks it, and which elements
count as breaks. The last clause is where this rule is usually lost — a badge
row and a horizontal rule are not breaks, they are furniture, and a cadence
rule that counts them certifies a wall of text as compliant.
[visual-text-cadence](./techniques/visual-text-cadence.md).

### 7. A style rule ships with the command that finds its violations

A house style is a set of claims about a corpus, and an unenforceable claim
about a corpus is false within two months of being written. The rule that
makes a style guide worth maintaining is that a rule may enter it **only if a
violation can be found by a command a reviewer can run** — and, crucially,
that the rule's exceptions are part of the detector rather than judgments
granted at review time. A carve-out that lives only in a reviewer's head
converts every run of the detector into a discussion, and detectors that
provoke discussions stop being run.
[style-rule-ships-its-detector](./techniques/style-rule-ships-its-detector.md).

## The absent landing document

One of the seven working repositories in the survey above has no landing
document at all, and it is worth deciding explicitly whether that is a
violation of this
subject or outside it. It is a violation, and the maximal one. A repository
without a landing document does not present no front page; it presents the
directory listing, which is a routing table generated by the file system,
ordered alphabetically, with no cells and no captions, addressed to nobody.
Absence is not neutrality — the surface renders either way, and the only
question is whether anything chose what it says.

## What this subject deliberately excludes

- **Whether the prose is still true**, and whether a coupled figure has
  rotted: [docs-sync](../docs-sync/docs-sync.md).
- **Whether a model wrote it, and how the draft is accepted**:
  [machine-authored-documentation](../machine-authored-documentation/machine-authored-documentation.md).
- **Documentation-site content models** — catalogs, draft gating, per-topic
  metadata, derived navigation:
  [docs-content-model](../../../ui-surfaces/published-surfaces/docs-content-model/docs-content-model.md).
- **Claims rendered by the application itself**:
  [public-claim-provenance](../../../ui-surfaces/published-surfaces/public-claim-provenance/public-claim-provenance.md).
- **Release notes and changelogs.** Adjacent, append-only, on a different
  clock, and usually the destination of a routing row rather than a section.

## The techniques

- [landing-document-as-router](./techniques/landing-document-as-router.md) —
  the population budget; the section that moves out and the row it leaves
  behind; destination cells that enumerate rather than gesture.
- [multi-surface-degradation](./techniques/multi-surface-degradation.md) — the
  render tiers a landing document is actually published on; load-bearing
  distinctions carried in words; the standalone first paragraph.
- [input-channel-distinction](./techniques/input-channel-distinction.md) — one
  visual channel per input destination; the channel that means nothing; the
  lead-in that survives the strip.
- [evidence-linked-badges](./techniques/evidence-linked-badges.md) — every
  badge links to the artifact that would go red; the badge that cannot fail is
  deleted; the row as a claim set.
- [caption-carrying-figures](./techniques/caption-carrying-figures.md) — the
  caption states what to notice; a comparison states the delta; the two idioms
  that substitute for a missing figure element.
- [visual-text-cadence](./techniques/visual-text-cadence.md) — the first
  screen's contract; the prose run limit; which elements count as breaks and
  which are furniture.
- [style-rule-ships-its-detector](./techniques/style-rule-ships-its-detector.md)
  — the admission test for a house rule; the carve-out inside the detector;
  what to do with the rule that cannot be detected.
