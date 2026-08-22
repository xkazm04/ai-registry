---
layer: technique
type: technique
subject: catalog-pipeline-authoring
technique: archetype-view-coherence-ratchet
status: forged
laws: [law-and-check-share-one-source, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a convention is followed by almost everything and enforced by nothing, declaring an invariant over an existing corpus, a step whose kind and rendering disagree]
---

# The archetype–view coherence ratchet

A step declares a kind and a rendering shape. Nothing structurally stops a step of one
kind from rendering in a shape none of its peers use — and when that happens, the step
is either mis-kinded or mis-viewed, and until an invariant exists, nothing says which.
Worse, nothing even says it happened.

The fix is a declared map from each kind to the rendering shapes it may present, plus a
ratchet that keeps the map honest. But the map is only affordable, and only correct,
because of *how* it is obtained. This technique is really about that method, and the
method generalises to any convention that is followed by almost everything and enforced
by nothing.

## The three-part method

### 1. Measure — find the invariant that is already almost true

Enumerate the whole corpus and tabulate the actual pairs. Do not propose the rule
first. What comes back is a table of (kind, shape) pairs with counts, and the shape of
that table tells you what to do:

- **Most kinds map to exactly one shape.** These are free — declare and move on.
- **One or two kinds map to two shapes with substantial counts on both.** These are
  genuinely two-shaped and the map must say so, with a one-line note explaining the
  split. A kind used by 115 steps in one shape and 11 in another is not a violation
  pattern; it is two legitimate uses, and pretending otherwise forces eleven false
  corrections.
- **A handful of pairs have a count of one or two.** These are your divergences, and
  they are the whole point of measuring: you now know exactly how many there are and
  exactly which steps they are.

The measurement also tells you whether the rule is worth declaring at all. If the
corpus is 100% conformant with no near-misses, the invariant may be trivially true and
buying nothing. If it is 70% conformant, you have not found an invariant; you have
found an aspiration, and declaring it means funding a migration.

The affordable zone is roughly 98–100% conformance with a countable exception list.

### 2. Correct or grandfather — and prefer correcting

For each divergence, decide by asking which cohort the step's **payload shape and
checker already match**. That question has an objective answer and it usually resolves
the ambiguity immediately: a step whose payload is a flat record graded field-by-field
belongs to the record cohort whatever its rendering says, and a step whose payload is a
single prose string graded by length belongs to the brief cohort.

If the divergence count is small enough to fix in one sitting — four out of several
hundred is small enough — **correct them all and declare the map with no exception list
at all.** A ratchet with an empty exception list is the strongest form: there is nothing
to burn down, and any failure is unambiguously new. This is the outcome to aim for, and
measuring first is what makes it reachable.

If the count is too large to fix at once, grandfather — but grandfather **by
enumeration, never by rule**. List the specific steps, count them, and assert the count
as a ceiling that may only fall. A rule-shaped exception ("steps in this class are
exempt") is not a grandfather list; it is a permanent second standard, and it will
attract new members.

### 3. Ratchet — reject the new, burn down the old

Once declared, three properties keep it durable:

- **New violations are rejected** by an automated check reading the same declaration
  the renderer reads. One source: the map, the check and the renderer must not be able
  to disagree.
- **The exception count may only fall.** Assert the number. A grandfather list that is
  not counted is a grandfather list that grows.
- **Widening is a recorded decision, not a remedy.** Adding a shape to a kind requires
  a written one-line reason committed alongside the widening. Never widen a map to make
  a failing step pass — that inverts the direction of authority, letting the corpus
  amend the rule instead of the rule constraining the corpus.

## Decision rules

- **Derive, never design.** A rule invented before the corpus exists is either
  toothless or unaffordable. The measurement is not a preliminary; it is the technique.
- **Resolve a divergence toward the cohort the payload already matches**, not toward
  the rendering the author happened to pick. The payload and its checker are the
  stronger evidence of what the step actually is.
- **Never widen a kind to cover a one-off.** One step is corrected; three steps are a
  recorded widening; a whole new shape is a vocabulary question, not a map question.
- **Keep the honest two-shaped entries.** Forcing a genuinely bimodal kind into one
  shape produces a map that everyone works around, which is worse than a map that
  admits the second shape with a reason.
- **A count of zero exceptions must be asserted, not assumed.** "We fixed them all" is
  a claim about the past; the assertion is what makes it a property of the present.

## Where else this applies

Anywhere a convention is nearly universal and unenforced. Naming conventions across a
corpus of assets. Which fields a class of records must populate. Which internal callers
are permitted to reach a subsystem directly. Which content classes must terminate on a
particular step. In every case the sequence is the same: count what is actually true,
declare the near-universal, correct the countable residue, assert the residue count,
and require a written reason for any widening.

The reason the method works is that it inverts the usual economics of invariants. A
designed invariant costs a migration to adopt and is therefore never adopted. A derived
one costs a handful of corrections, which is a single afternoon — and from that
afternoon onward the invariant is free, because the ratchet makes the corpus maintain
it.

## When not to use this

Do not ratchet a rule you are not confident is *right*, only that it is currently true.
A near-universal accident is not an invariant; it may be an artifact of the order the
corpus was built in. Before declaring, articulate why the rule *should* hold — why a
step of this kind rendering in that shape would be genuinely wrong. If that sentence
cannot be written, you have measured a coincidence.

Do not apply it to a corpus still growing fast in shape. A ratchet declared over a
dozen steps when a hundred are coming will be widened repeatedly, and a map amended
every week teaches nobody anything.
