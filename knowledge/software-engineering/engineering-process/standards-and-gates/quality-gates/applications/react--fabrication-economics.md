---
layer: application
type: application
subject: quality-gates
technique: fabrication-economics
stack: react
status: forged
verified_on: 2026-08-31
verified_against: react@19
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The rule nobody added, obeyed anyway (React 19, Tauri desktop)

Measured read-only against the tree at `e7fbae7bb`, over every `<img>` element
in the component sources: **63 rendered elements in 2,152 files.**

This tree was picked to test whether a gate demanding an unverifiable value
produces fabrications. It disproved the premise it was picked for and produced a
stronger result: **there is no such gate here, and the tree is full of the
fabrication anyway.**

The lint configuration carries twenty-one hand-written rules, several of them
squarely in this territory — a rule forcing a keyboard handler onto anything
carrying an interactive role, a reduced-motion fallback rule, a contrast rule
over text classes. None of them mentions alternative text, and the ecosystem's
standard plugin for it is not installed. Nothing in this repository has ever
asked an author for an image description.

## The two arms

Both arms ran over the same population with the same instrument — a parser that
walks every component file and reads each `<img>` tag's attributes. Only the
predicate differs.

| | predicate | findings | share of population |
| --- | --- | --- | --- |
| **A** | the rule as teams adopt it: does the element carry the attribute? | **1** | 1.6% |
| **B** | the technique: is the *no-content claim* one the markup can support? | **35** | 55.6% |

Arm A's single finding is a false positive, and finding that out is the first
result. It is a backdrop image at `DirectorCoachingTab.tsx:156`, carrying
`aria-hidden`, at five percent opacity, behind a comment reading "Decorative
backdrop — very low opacity, non-interactive, behind all content." It is
correct as written; the attribute is genuinely unnecessary because the element
is removed from the tree entirely. **Arm A's true backlog over this tree is
zero.** Adopting the standard rule here would report a clean codebase and one
finding whose fix is to make the markup slightly worse.

Arm B's 35 split into two shapes:

- **30 sites where the empty value sits on a runtime-computed source.**
  `src={user.avatar_url}`, `src={customSrc}`, `src={resolveAgentIconSrc(...)}`,
  `src={thumbUrl}`, `src={r.thumbnailDataUrl}`, `src={meta.iconUrl}`,
  `src={convertFileSrc(path)}`. The empty value is an assertion that the image
  carries no information — and the author could not have checked it, because
  what the element will show is not known where the assertion is written.
- **5 sites where the file's own name was used as the description.**
  `alt={item.fileName}`, `alt={asset.fileName}`, `alt={entry.name}`,
  `alt={current.name}`. This is the other cheap answer: a string that is always
  available, is never wrong in any checkable way, and adds nothing a reader of
  the surrounding markup did not already have.

The predicate for arm B is a screen and not a verdict, and the arm count says so
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): a
runtime-computed source *can* be decorative, and several of the 30 are — the
domain artwork at `BentoGrid.tsx:39` and `DomainLevel2.tsx:34` renders through
`object-cover absolute inset-0 opacity-45` and is unambiguously background. The
finding is not that all 30 are wrong. It is that **not one of the 30 is
distinguishable from a site where somebody gave up**, and after the fact nobody
can sort them without opening each one and reasoning about the feature.

## The structural fact: the honest declaration is the one that gets flagged

The single site in this tree that documents its decorative intent — in prose, in
a code comment, with the platform's actual remove-from-the-tree mechanism — is
the single site arm A reports. Every one of the 43 sites that used the cheap
token is silent, and every one of them passes.

Nobody designed that inversion. It falls out of the shape of the two mechanisms:
declaring an image decorative and declining to describe it are different acts
with different markup, and the required-attribute idiom offers only the second
one a value. The idiom teaches "an image needs this attribute", the empty string
satisfies it, and the empty string already means something else. This tree is
the clean experiment for that claim because there was no gate to blame: the
pressure came from the requirement's *shape*, propagated by convention and
editor completion, with no enforcement anywhere in the repository.

That sharpens the technique rather than contradicting it. A gate industrialises
the pressure and makes it measurable; it does not create it. The population to
worry about is any required field whose value domain already contains a cheap,
always-available, unfalsifiable answer — gate or no gate.

## What this tree would need

Not the standard rule. Adopting it here buys a green report over a population it
cannot see and costs one correct line. What the technique asks for is the
missing third value, and this platform already ships it: **`aria-hidden` is the
affirmative decorative declaration and the empty attribute is not.** Separating
them makes the 30 sites triageable — declared decoration on one side, an
enumerable backlog on the other — and it is the same move the technique
describes in the abstract, available here without inventing a vocabulary.

Sequencing matters and the arms show why. A rule added before the two are
separated raises 1 finding and certifies 62 sites, at which point the debt is
formally clean and nobody will look again. The census comes first; the rule
comes after there is a token for the answer that is currently unsayable.

## What this measurement cannot do

The instrument is a text parser over source files, not a renderer. It cannot
compute whether the surrounding markup already names the image for a reader —
several of the 30 sit beside a visible text label, which is precisely the case
where an empty value is correct. Deciding those needs the rendered accessibility
tree, which is the layer this project has no harness for at all. So the 35 is an
upper bound on real defects and an exact count of *undecidable* sites, which is
the number the technique actually cares about.
