---
source: youtube:RqcEK7sWesQ
kind: practitioner listicle on design canon - six textbook OOP mistakes with toy examples, no vendor, no measurements
url: https://www.youtube.com/watch?v=RqcEK7sWesQ
title: "You Think This Is Good OOP... It's Not"
author: a software-design educator (creator channel)
words: 3256
extracted: 8
accepted: 3
declined: 0
leads: 1
already_covered: 2
untriaged: 1
dispatched: 0
---

# Six things mistaken for good OOP - canon arriving at a corpus that stated it in other words

A creator's "N mistakes" over class design: inheritance for implementation reuse,
configuration as subclasses, independent features as a hierarchy, the god base class,
the subtype that throws on its parent's verb, and abstracting before the meaning is
shared. Every item is thirty-year-old canon (composition over inheritance, the
substitution principle, interface segregation, the wrong-abstraction rule), and every
item survives the strip test trivially - there are no proper nouns to strip.

## The class, and the yield it predicts

Not a vendor listicle (nothing to fetch, no rule that "moved") and not a first-party
account (the examples are constructed, not operated). Closest to a **listicle on
canon**: reliable for the existence of a rule, never a primary for it, and
corroborated entirely by training-data convergence plus the corpus's own neighbouring
techniques. Predicted yield before the table: mostly catches, one or two amendments,
zero fetches. Actual: two catches, three amendments folded from five items, one lead,
0 of 3 fetches. The prediction held.

The interesting property of the class: **the corpus already carried every item at
the module altitude under a different vocabulary**, and what the source supplied was
the mechanism-level instance - the class hierarchy - that the module-level rule never
names. `module-design` is deliberately mechanism-neutral (its golden path says
architecture styles are vocabularies, not answers), so the amendments are written at
the module altitude and mention the class mechanism only as one way of building the
wrong boundary.

## Home: `module-design` (software-engineering / engineering-process / codebase-stewardship)

Single home; the map's other hits (image-prompt-composition, jurisdiction-modelling's
membership inheritance, engine-adapters) were slug coincidences, except the last,
which is the same finding from the media side - see item 4.

## Candidates

### 1 + 5 - Subtyping is a substitution promise -> AMENDMENT on `seams-and-adapters`

Anchors [00:02:37] "if you inherit because you need some implementation detail, you
probably wanted composition" and [00:13:45] the read-only queue accepted wherever the
writable queue is, failing at runtime. Two items, one root: a subtype that exists to
borrow a method, and a subtype that refuses a verb, both type-check as substitutes and
both fail as one. The technique's contract-suite section already catches a *double*
that drifts; it had never said that the same suite catches a production adapter that
narrows the guarantee, or that the fix is in the interface (split at the capability
that differs), not in the adapter. New section "An adapter that refuses a verb is not
an adapter", with the composition corollary folded in as its last paragraph. The
detection signal is module-depth's merged-module test read from the adapter's side.

Corroboration: training-data convergence (the substitution principle and the
segregation principle are canon), plus `engine-adapters` in the same bundle already
saying "every adapter implements every verb, and the unsupported ones no-op, throw, or
lie" for media engines. Written from the corpus, not the video.

### 2 + 3 - A variation is data until it changes a guarantee -> AMENDMENT on `module-depth`

Anchors [00:06:04] "types should represent different behaviour or constraints or
meaning, not every possible combination of settings" and [00:07:48] "if you have
features that can be switched or combined independently, don't encode every
combination as a subclass". `module-depth` § "Depth is placed" already carries the
options-bag failure and sends a caller's different need to "a different module rather
than a mode flag" - which, read alone, invites exactly the lattice the video shows.
The corpus had one side of the discriminator; the amendment writes the other side and
the question that separates them: *would the module be wrong to choose a default?* A
value is the caller's fact (parameter); a policy is the module's job (decision). The
video's own closing trade-off - a validation flag couples the step to the module;
lift the step out - landed as the section's last sentence.

### 6 - Abstract on shared meaning, not shape -> CATCH, plus one sentence on `locality-and-leverage`

Anchor [00:17:40]. `locality-and-leverage` already says "duplication is cheaper than
the wrong abstraction, and the test is not 'do these look the same' but 'would a
change to one require a change to the other'". The corpus states it better than the
source. One signal the corpus did not have, cheap enough to add as a sentence: the
video's base importer returns untyped records because the two things it unifies
(customers, orders) have no common type - **when the shared unit can only be typed at
the top of the hierarchy, the similarity was in the steps, not the meaning.** Added.

### 4 - God base class -> capability interfaces -> ALREADY COVERED

Anchor [00:12:04]. `module-depth` § "When not to use it": a module whose callers
"use disjoint parts of it, with no two callers touching the same subset" was several
modules merged. `engine-adapters` (ui-surfaces/media-playback) carries the fix as
capability declaration. The video's "stamp coupling" name is not in the corpus and
does not need to be; the detection rule is.

### 7 - Classes only for invariants; otherwise data or a function -> LEAD

Anchor [00:18:05]: objects "protect invariants, combine state with meaningful
behaviour on that state, expose clear boundaries"; classes "shouldn't be a default";
protocols for interfaces; plain functions where there is no state or identity. This is
a unit-kind selection rule and the corpus has none - `module-design` chooses
boundaries and never says what kind of unit sits inside one. It is also a stance the
golden path's mechanism-neutrality deliberately avoids taking. **Return condition:** a
second independent source from a different run states a unit-kind rule (in any
language's terms), at which point the pair is a convergence and the rule goes into the
golden path as doctrine rather than into a technique as a preference. Altitude if it
lands: doctrine.

### 8 - Law of Demeter aside -> UNTRIAGED

Anchor [00:05:38], a one-line mention while fixing item 2 (reaching through a config
object held by another object). Not extracted as a candidate; recorded so the next run
does not re-derive it. Nobody verified whether the corpus carries the reach-through
rule.

## Untriaged

| # | Title | Anchor | Note |
| --- | --- | --- | --- |
| 8 | Reach-through access (Law of Demeter) | [00:05:38] | mentioned in passing; not mapped |

## Declines

None. The operator was not present; picks were made on registry impact.

## What the run says about the skill

- A canon listicle's yield is the *mechanism-level instance* of a rule the corpus
  holds at module altitude. Write the amendment at the corpus's altitude and cite the
  mechanism as an example; do not let the source pull the subject down to its language.
- The map's empties ("liskov", "mixin", "duplication": no prior art) were all false
  holes: the concepts were present under the corpus's own vocabulary
  (substitutability, contract suite, wrong abstraction). Read the home before trusting
  a zero on a canon term.
