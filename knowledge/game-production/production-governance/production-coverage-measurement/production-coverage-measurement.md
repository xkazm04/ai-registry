---
layer: golden-path
type: golden-path
subject: production-coverage-measurement
status: forged
use_when: [reporting how much of a project is actually produced, building a readiness dashboard, a status board is greener than the build, deciding what a completion percentage may claim]
techniques:
  - readiness-ladder
  - craft-ladder-and-medium-ceilings
  - engine-credibility-classes
  - source-provenance-marks
  - headless-operability-gate
  - audited-fact-drift-detection
---

# Production coverage measurement

Every project status board drifts toward green. Not because anyone lies — because each
individual optimism is locally defensible and they compound. The artist marks the
placeholder "in", because it is in. The tools engineer marks the generator "working",
because it ran once on their machine. The producer marks the feature "done", because
every sub-item was marked done by someone. Nobody committed a falsehood, and the board
now claims a shippable game that does not exist.

This subject is the structural defence. Not exhortation, not review meetings — a
reporting model whose shape makes the compounding optimism inexpressible. Four moves
carry it: **two orthogonal axes**, so neither can borrow the other's credit; **rungs that
each mean something strictly better**, so a rung cannot be added for political comfort;
**a provenance mark on every claim**, so an assertion and a measurement are different
values; and **the rule that unknown earns nothing**, so uncertainty cannot be read as
quality.

The model transplants. Anything with a long tail of heterogeneous work items and an
automated producer in the loop — a data migration, a compliance programme, a platform
rollout, a localisation pass — has the same failure and can adopt the same shape.

## Coverage and readiness are different questions

- **Coverage** asks *how much of the intended thing exists at all* — is the content mix
  what the design called for, is the tail represented or did production stop at the ten
  items everybody demos.
- **Readiness** asks *how much evidence stands behind each thing that exists*.

A project can be fully covered and entirely unready (everything exists as a placeholder),
or barely covered and fully ready (a beautiful vertical slice). Both are real, and one
number averaging them tells you nothing. A coverage figure with no readiness figure beside
it is the oldest way to make a placeholder project look finished.

Coverage needs a **declared expected mix** — per category, the share of the whole the
design intends. Without one, "we have three hundred and forty items" is a count, not
coverage: it carries no basis. With one, under-representation becomes quantitative. A
trigger that survives contact with real production: flag any value holding **less than
60% of its expected share**, and only where the expected count is at least one — loose
enough to tolerate normal lumpiness, tight enough to catch a category nobody started, and
guarded so a rounding artefact in a tiny category cannot manufacture a finding.

## The two ladders, and why one axis cannot do the job

The central insight: **how honestly automated a thing is** and **how close its craft is to
the commercial standard** are independent, and forcing them onto one axis destroys
information you need.

The **readiness ladder** measures the strength of the evidence that a thing exists and
works: nothing wired, a hollow shell, drafted, reviewed, proven, shipped. The **craft
ladder** measures distance from the standard set by the current top-tier commercial
product in the same genre, graded absolutely — never on a curve against the batch, never
against the artifact's own ambition.

Two states prove the axes orthogonal, and both occur constantly:

- **Fully automated placeholder** — a generator reliably produces this class, unattended
  and reproducibly, and the output is grey-box work a lead would hand back. High
  readiness, low craft.
- **Hand-made unautomated excellence** — a senior made one that could ship tomorrow, by
  hand, over three days, by a process nobody else can run. High craft, low readiness.

Collapse these onto one axis and you must choose which lie to tell. Keep them apart and
the report is actionable in both cases: automate the second, art-direct the first.

Orthogonality must be enforced in the plumbing, not just in the diagram. Store the two
verdicts separately, and make it structurally impossible for a craft score to reach the
code that computes readiness. Left adjacent, they leak within a quarter — a good craft
score starts nudging a readiness grade because "surely that means it works".

## Up must mean closer to shippable

A ladder is a ladder only if every step upward is strictly better in one stated
direction. Fix the direction — *closer to shippable* — and a whole class of well-meaning
additions becomes impossible.

The recurring temptation is rungs for **waiting** and **blocked**. Neither is a rung,
because **a declared gate is not progress**: an item waiting on a decision is not closer
to shipping than one nobody has looked at. Admit them and the ladder becomes a workflow
state machine, at which point the ordering means nothing and the percentage derived from
it means nothing either.

They are still real, so carry them as a **separate state alongside the rung**: a position
plus how the item sits at it. A waiting item renders at its **would-be rung** — the one it
will occupy once the declared gate runs — but hollow, marked, and excluded from every
count of reached rungs, so ambition is visible without being credited. A blocked item
keeps the rung *what did pass* earned it, so blocked items still sort and filter sanely
instead of collapsing into an undifferentiated red pile.

That distinction — **achievement, not ambition** — is the single most common way a status
board is quietly corrupted. The classic bug: a display maximises over the *highest
declared* evidence tier attached to an item rather than the highest *passed* one, and the
item that merely aspires to the strongest check renders identically to the one that passed
it. Anywhere a report reaches for a maximum, check what it is maximising over.

## Every grade explains itself in one line

A grade that cannot say why it is what it is gets argued with instead of acted on. Every
rung a report assigns carries a one-line rationale generated with it, phrased as an honest
"because": no artifact has ever been recorded for this; the checker passed but on
placeholder data and nothing in the stack can actually produce it; it passes, but its
producer's class needs an independent gate before the pass proves quality; a checker or a
judge condemned this.

The rationale is what makes the grade **falsifiable by a reader who knows the domain**.
The artist who reads "no artifact recorded" and knows there is one, filed where the
scanner does not look, has found a real defect in the measuring instrument in five
seconds. Without the line, they would have argued about the colour of the cell for a week.
The corollary governs changes too: when a rule **demotes** something, the demotion states
what it lost, appended to whatever reason was already there. A cell that silently comes
back a different colour teaches readers to distrust the whole board.

## What a producer's own claim is worth depends on the producer

A producer reporting its own output as valid is an input to a verdict, never the verdict.
But treating every self-report as worthless stalls production: some producers are
genuinely reliable at the low end of the craft ladder, and demanding an independent gate
for a result nobody disputes wastes the gate.

So **declare the class of producer**, and let the class decide what an unattended pass
buys. The axis that actually separates the classes is not who or what did the work — it is
whether **anything outside the artifact's own source could have made the check fail**. A
producer computing its result from inputs beyond itself has earned something when its
check passes. A producer emitting values a person typed, checked by a rule written against
those same values, has proven only that the author is self-consistent.

And **an undeclared class earns nothing** — no default, no average, no benevolent reading.
The standard failure is a fallback filing everything unrecognised into the
highest-credibility class, so every unaudited item looks exactly like one genuinely
produced by the best producer in the stack. That is uncertainty rendered as quality, and
the most expensive single bug this model exists to prevent.

## Provenance is a property of every claim

A report is a pile of claims of very different epistemic status, and rendering them
identically is how a guess becomes a fact by Wednesday. Mark each: **audited** (a machine
or an independent reader measured it), **authored** (declared by the thing itself, stored
as data), **inferred** (a heuristic guess), **unsourced** (no recorded origin at all).

The fourth value earns the vocabulary: naming the state is what lets you count unsourced
claims and drive them down, and a missing provenance must render loudly rather than
defaulting to the flattering case. And the marks must be **marks** — a glyph, a word, a
shape — never hue alone. A distinction carried only by colour is one a substantial share
of readers cannot see, and it vanishes entirely when the board is printed, screenshotted
into a deck, or pasted somewhere monochrome.

Precedence between sources runs audited over authored over inferred, with one deliberate
asymmetry: a **downward self-correction is always accepted immediately**. Nothing games a
report by looking worse on it, so a subject may always tell the board it earned less than
the audit credited it with, and may never tell it more.

## A step that needs a human at the keyboard is a demo

The strongest single predictor of whether a pipeline survives a deadline is whether each
step runs **headless** — no interactive session, no window open, no "then you click the
button". A step needing an operator present cannot be scheduled, re-run at scale,
reproduced by whoever inherits the project, or regression-tested. It is a demonstration of
feasibility, which is valuable, and it is not a production step. Crucially this is a
**reported property, not an assumption**: ask each step to declare it and read the
undeclared answer as no.

## The report rests on facts that move

Grades derive from recorded facts about the environment — what powers each step, which
capabilities exist, where the ceilings sit, what has been proven to run. Those facts
change, and every claim derived from a changed one is now suspect. The disciplined
response is precise: the derived claims do not become *wrong*, because you have no
evidence they are wrong. They become **unmeasured**, with a rationale naming the fact that
moved. Leaving them standing ("probably still fine") and marking them failed ("safest")
both destroy information; unmeasured is the true state and the only one producing the
right action, which is to re-measure.

## Aggregation is where the honesty is won or lost

**Never average across a ladder.** Rungs are ordinal; the mean of "hollow" and "proven" is
not "drafted". Report the distribution, and if one headline figure is demanded, define it
as the share at or above one named rung and quote the rung with the number every time.

**Silence never rolls up as green.** Unmeasured items are counted and shown as their own
band, never folded into the denominator's favour and never dropped from it.

**A parent is bounded by its children.** A feature cannot report a higher rung than its
weakest load-bearing part — unpopular precisely because it works.

**Fixtures are not deliverables.** Test harnesses and smoke checks that write into the same
store as real content will be counted as content unless something excludes them by rule.
One stub can red out a whole step whose real content is shippable.

## Seams with neighbouring concerns

The per-item acceptance ladder — what evidence one produced item needs — is its own
subject; this one **aggregates** those verdicts and adds the axes an item-level ladder has
no reason to carry. Scoring one design document against its implementation is separate:
coverage *and* conformance for a single specification pair, where this is coverage across
a whole catalogue. The rubric defining what each craft level means, including where a
medium's ceiling sits as a rubric property, is authored elsewhere; this subject owns the
ceiling only as a **project-wide reporting axis**. What a verdict is bound to and when it
expires belongs to verdict integrity, and deciding what to do next is prioritisation,
which consumes this report rather than producing it.
