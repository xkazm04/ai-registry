---
layer: technique
type: technique
subject: political-compass-from-votes
technique: theme-balanced-drawing
status: forged
laws: [non-partisan-symmetry, every-cap-ships-its-population]
shared_with: []
use_when: [composing the final question set from ranked candidates, preventing a single conflict from dominating the compass, deciding per-theme caps and draw order]
---

# Theme-balanced drawing

Divisiveness ranking alone has a predictable pathology: the most divided votes
of a term cluster. One contested reform generates a dozen knife-edge divisions
— the bill, its amendments, its returns from the upper chamber — and a top-N
draw by margin yields a "compass" that is really a single-issue referendum
wearing twenty question marks. Questionnaire designers solve this editorially,
balancing statements across policy domains by hand. The record-based design
must solve it mechanically, and the mechanism is a **round-robin draw across
theme buckets**.

## The draw

Inputs: candidates that passed every selection gate, each carrying a theme tag
and its rank within that theme (by divisiveness, per the selection rule).

1. **Bucket by theme.** Each surviving candidate belongs to exactly one theme
   bucket; within a bucket, candidates are already ordered most-divided-first.
2. **Order the themes deterministically.** By candidate count descending —
   themes the chamber actually fought over get drawn first — with a fixed
   collation of the theme name as the tie-break. Any deterministic order
   works; what is forbidden is an editorial one.
3. **Draw round-robin.** Every theme's first pick, then every theme's second,
   and so on: up to a per-theme cap, until the total question cap fills. A
   theme that runs out of candidates simply yields its turn.

Two caps govern the draw and both are published constants: the **total** (a
citizen's patience — twenty questions is near the ceiling questionnaire tools
have converged on) and the **per-theme cap** (the anti-referendum guard — two
or three per theme means even the term's loudest conflict gets a bounded
share). Both are caps over a stated population: the surface reports how many
candidates each theme held, so the reader can see that "2 of 31" and "2 of 2"
are different statements about the same-sized slot.

## Themes are data, and inherit data discipline

Theme tags typically come from an automated classifier over vote titles and
attached documents. Three consequences:

- **The tag set is closed and published.** A drifting vocabulary re-buckets
  history; when the tag set changes, the draw changes, and the change must be
  visible as a methodology event, not a silent reshuffle.
- **Junk themes are excluded by name.** "Procedural" and "unclassifiable" are
  real classifier outputs and poor positions; excluding them is legitimate
  exactly once it is listed in the published rule and its rejections are
  counted.
- **Tag quality gates belong to selection, not to the draw.** By the time
  candidates reach bucketing, the confidence floor has run. The draw trusts
  its input; layering a second quality judgment here creates two half-rules
  where the selection surface promised one.

## Balance is symmetry, not proportionality

The round-robin deliberately does *not* draw themes proportionally to their
candidate counts. Proportional drawing reproduces the monoculture it exists to
prevent — the dominant conflict earns the dominant share. Equal turns per
theme is a symmetry claim: the compass gives every contested area of the
term's agenda an equal chance to distinguish representatives. This is the same
instinct as covering all parties identically: the tool does not amplify the
loudest fight, in either direction. The honest cost, stated rather than
hidden: a theme the chamber divided over forty times and a theme it divided
over three times weigh the same in the citizen's result. That is a defensible
published choice; an unpublished proportional weighting is neither.

## When not to use this

- **When tags do not exist yet.** A draw over untagged data has one bucket
  and silently degrades to pure divisiveness ranking. Ship it *as* pure
  divisiveness ranking, labeled as such, rather than pretending balance.
- **When the record is thin.** With very few qualifying candidates, per-theme
  caps mostly bind on nothing; keep the mechanism (it is deterministic and
  cheap) but expect and disclose an unbalanced set.
- **For reader-side re-weighting.** The draw fixes the *question set*; a
  citizen wanting environment to matter more belongs at the scoring lens, not
  here. Re-drawing per reader destroys comparability between readers'
  results and turns a published instrument into a per-session artifact.
