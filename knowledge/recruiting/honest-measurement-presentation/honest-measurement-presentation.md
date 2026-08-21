---
layer: golden-path
type: golden-path
subject: honest-measurement-presentation
status: forged
use_when: [rendering a hiring analytics dashboard, colouring a metric red or green, deciding what an empty chart says, writing the headline sentence over a funnel, showing a period-over-period change]
techniques:
  - no-verdict-colour-without-a-goal-someone-set
  - a-dash-means-not-measured-never-zero
  - every-band-declares-its-no-data-answer
  - headline-may-not-outrun-its-qualifier
  - a-capped-table-says-what-it-dropped
  - absent-delta-when-there-is-no-comparison
---

# Honest measurement presentation

Most of the dishonesty in hiring analytics is not in the arithmetic. The rates
are computed correctly, the denominators are the agreed ones, the window is
the one the definition asks for — and the screen still tells a hiring manager
something untrue. It does it through a colour, a chip, a dash, an adjective, a
cut-off table and an empty state. Those are the six places a claim gets made
without anyone writing a claim.

This subject is the **register** a measurement surface has to write in. Its
premise is that rendering is a speech act: everything on a dashboard that a
reader could act on is an assertion, and every assertion inherits the same
obligations as a sentence — it must be something the record supports, it must
name what it was computed over, and it must be distinguishable from a guess.
A red row is a sentence. A "+4pts" chip is a sentence. A dash is a sentence.
A table showing eight rows out of forty is a sentence about the other
thirty-two.

## Why the rendering layer is where the lying happens

There is a structural reason the defects concentrate here rather than in the
metric layer. The metric layer is argued about. Somebody wrote a definition,
somebody disagreed, a decision got made, and the result is a number with a
provenance and a name. The rendering layer is *implemented*, usually late,
usually by whoever was building the panel, and its assertions are made in a
vocabulary — colour, position, size, the word "strong", an arrow glyph — that
nobody reviews as prose because it does not look like prose.

So the honesty rules of a measurement surface must be treated as
**load-bearing rather than stylistic**. That is the single most important
sentence in this subject. When a colour rule sits in the design system's
palette file and the "no goal, no colour" rule sits in a code review comment,
the palette wins every time. The rules belong with the metric contract, they
carry their incident with them, and a change to them is a change to what the
product claims — not a visual refresh.

There is a second-order consequence that costs teams a full re-discovery of
the same incident. **An honesty rule expressed as a branch inside a rendering
component is a guard nothing can see.** The characteristic failure is not that
someone deletes it; it is that the guard gets written, reviewed, translated
into four languages — and then left off the render path, where nothing fails
because nothing pins which branch the surface takes. The fix is structural:
resolve *which claim this surface is entitled to make* into a **value**, in a
pure module, and let the component do nothing but map that value to pixels.
Then a test can assert the entitlement against a real payload, and orphaning
the rule again breaks the build. Honesty rules that are not values are
decorations with good intentions.

## The three questions a rendered figure must answer before it renders

Every element on a measurement surface should be able to answer these, and the
answer determines the rendering, not the other way round:

1. **Is there a number?** Measured, not-measured, or not-applicable. These are
   three states, not one number and two edge cases. The metric layer decides
   which state applies; this surface's job is to *show the state beside the
   value* rather than flattening it into one.
2. **Is it good?** Only answerable against a benchmark somebody set. Without
   one there is no good and bad, only high and low — and high is not good.
3. **Compared with what?** A delta needs a prior period that actually exists
   and is actually comparable. No comparison, no delta.

A surface that renders confidently while unable to answer any of the three is
not a dashboard; it is a generator of confident-looking claims.

These are gates at different grains, and their **order is the argument**.
Movement licenses a rate at all — a conversion figure measures hand-offs, so
with zero recorded hand-offs every ratio is either absent or a 0% that means
*not yet*, not *we lose everyone here*. A goal licenses a judgement about the
rate. A comparable prior period licenses a delta. Each gate is checked before
the claim it enables, and the surface's entitlement is the last gate it
passed. Write that ladder down as one ordered resolution rather than as
scattered conditionals, or the branches will contradict each other the first
time a fourth case appears.

## A colour is a judgement, and a judgement needs a benchmark somebody set

This is the spine. The instinct that produces the defect is decent: a funnel
looks better with colour, and a stage that converts at 4% "obviously" needs
attention, so the panel paints it red against a sensible default threshold.
The defect is not the threshold's value. It is that **nobody in the
organisation agreed to it, and no surface disclosed it**.

What the reader sees is a red row. What the reader concludes is *our number is
failing our target*. Both halves of that sentence are false: the target was
not theirs, and "failing" is a verdict about a goal that was never set. A
hiring manager acts on that — reallocates sourcing spend, pressures an
interview panel, escalates to a stage owner — on the authority of a constant
somebody typed while building a component.

The rule, stated as a rule: **when no goal has been set for a metric, the
verdict is `none`, and `none` renders as neutral.** Not grey-because-broken.
Not a muted red. Neutral, with the number stated plainly and, where there is
room, an invitation to set a goal. `none` is not an error state and not a
degraded mode — it is the **correct answer** until somebody opens the goals
editor and commits to a target. A surface that treats it as a placeholder to
be filled by a default has misunderstood the whole subject.

The corollary reaches the language too. Without a goal there is no *weakest
link* — there is only a *lowest number*. Those are different objects. A
weakest link is a claim that a stage is underperforming relative to what it
should do; a lowest number is an ordering fact. Funnel stages have wildly
different natural conversion rates: an application-to-screen rate of 12% may
be excellent and an offer-acceptance rate of 70% may be a crisis, and a
surface that sorts by value and calls the bottom one the bottleneck has
promoted an ordering fact into a diagnosis. Where no goal exists, the honest
headline names the lowest stage as the lowest stage and stops. See
no-verdict-colour-without-a-goal-someone-set.

Goals also decay. A target set against last year's requisition mix judges this
year's numbers by a benchmark nobody re-agreed to, so a goal carries who set
it and when, and a stale one is shown with its age rather than silently
enforced. A benchmark that came from outside — an industry figure, a peer
median — is a benchmark someone still had to *adopt*; adoption is the act that
licenses the colour, and an unadopted external figure colours nothing.

## A dash means not measured; it never means zero

The second assertion nobody reads as an assertion. Zero and unmeasured are
different facts about the world and the visual distance between them on most
dashboards is nil: an empty bar, a "0%" tile, a flat line at the axis. Each of
those reads as *we measured, and it was nothing*.

In hiring the direction of that error is rarely neutral. A source with no
recorded hires reads as a bad source when the truth is that the attribution
was never wired up. A stage with no recorded transitions reads as a stalled
stage when the truth is that the board renames a column and the events stopped
mapping. A demographic slice with no data reads as zero representation.
Somebody reallocates budget, or files a compliance answer, on a number that
was never taken — the local reading of
[absence of evidence is not evidence](../_laws.md#absence-of-evidence-is-not-evidence).

So the dash is reserved, exclusively, for *not measured*, and every surface in
the product uses the same glyph for it. Zero renders as zero. A ratio whose
denominator is zero renders as a dash, not as 0% and never as an infinity or
a NaN leaking through a formatter. And the dash carries a reason wherever
there is room for one, because "—" alone generates a support conversation that
"no transitions recorded in this window" would have prevented. See
a-dash-means-not-measured-never-zero.

The same instinct governs a figure the product simply does not have. Where a
panel expects an external or benchmark figure and none is available, **hide
the figure rather than state the gap**. A tile reading "market median:
unavailable" is worse than no tile: it draws attention to an absence, invites
the reader to imagine what it would have said, and makes the surface look
broken rather than honest. Absence of a *measurement* is a state worth showing
where a reader is entitled to expect a number; absence of an *optional
enrichment* is a reason to render nothing at all. The test is whether the
reader would otherwise be misled about what was measured.

## Every band declares what it says when there is no data

A band is a function from a number to a meaning: good/watch/critical, strong/
mid/weak, healthy/aging/stale. Bands are the most reused objects on a
measurement surface — the colour, the legend, the chart floor, the sort, the
adjective in the summary sentence and the export all read from them — and the
recurring defect is that the band table is defined only over the numbers.

Then no-data arrives and each consumer improvises. The colour function falls
through to its last branch, which is usually the worst one. The sort treats it
as the minimum. The summary sentence picks the adjective for the bottom band.
Nothing crashed; the surface simply told the reader that an unmeasured thing
is critical. The fix is to make the no-data answer a **declared member of the
band definition** rather than a fallthrough: every band table names its
neutral tier, and the tier appears in the legend so a reader can see that
"grey means we did not measure this" is part of the vocabulary rather than a
rendering accident. See every-band-declares-its-no-data-answer.

## The headline may not outrun its qualifier

Measurement surfaces summarize. A tile has a big number and a small caption; a
funnel has a headline sentence over the stages; an insight card has a bold
claim with a footnote. The reader's attention is not evenly distributed across
those, and it never has been: the headline is read, the qualifier is read
sometimes.

That asymmetry means a qualifier cannot rescue a headline. "Offer acceptance
is down sharply" over a footnote reading "based on 3 offers" is a false
statement with a true note attached, and it is read as a false statement.
The rule is that **the headline is written at the confidence the weakest input
supports**, and the qualifier explains rather than retracts. If the sample
will not carry "down sharply", the headline says "3 offers this period — too
few to read a trend", which is both true and, usefully, more actionable.

This is the seam with the sibling discipline on small samples, and it is worth
stating precisely: **that discipline decides what may be claimed; this one
decides how the claim is shown.** When it rules that a figure is too thin to
support a rate, the ruling arrives here as a rendering obligation — suppress
the rate, state the count, and do not let a headline elsewhere on the page
quietly re-assert what was suppressed. The commonest way a suppression is
defeated is not by overriding it but by a second component on the same screen
computing the same thing without asking. See
headline-may-not-outrun-its-qualifier.

## A table that was cut says what it dropped

Every list on a dashboard is capped — top ten sources, top eight stages, the
first twenty roles — for perfectly good performance and legibility reasons.
The cap is invisible, and an invisible cap turns a partial view into a
universal claim. A reader looking at ten sources with a total underneath
believes they are looking at the sources.

Two harms follow, and the second is worse. The first is arithmetic: the rows
do not sum to the total, so a reader who adds them gets a different answer and
either mistrusts the panel or, more often, mistrusts the total. The second is
decision harm: what falls below the cut is exactly the long tail — the small
sources, the rare stages, the outlier roles — and the long tail is where the
interesting failures live. A capped table silently argues that nothing
interesting happened outside the top ten.

The obligation is small and always affordable: state the cap, state what was
excluded, and account for the remainder as an explicit row rather than letting
it vanish. "Top 8 of 34 sources; remaining 26 shown as Other" costs one line
and converts a misleading picture into a true one. See
a-capped-table-says-what-it-dropped.

## Three renderings that quietly rewrite the number

Three defects are worth naming separately because they happen inside the
formatter, where nobody looks for a claim.

**Clamping.** A ratio that exceeds the range the component was designed for
gets clamped to that range, and the clamp deletes the finding. A saved-hours
figure above the manual baseline it is measured against is not an error to be
capped at 100% — it is the signal. Show the out-of-range value and let the
band handle it; a design that cannot render 140% is a design constraint, not a
fact about the world.

**Summing what cannot be summed.** Two figures in different units — two
currencies, an hours ledger and a money ledger, a count and a rate — are shown
side by side and never combined, **and the reason they are not combined is
printed**. The temptation is a single impressive total. The honest artifact
states both terms and the sentence explaining why there is no third number,
and that sentence is usually the most credible thing on the surface.

**The accessible name that keeps the lie.** A cell can render an em dash
visually while its accessible name reads "0", or worse, leaks the arithmetic
that produced it. A legend built from an empty set can announce literal
non-finite words to a screen reader long after the visual layer was fixed.
Every rule in this subject applies to the accessible name, the tooltip, the
export cell and the generated digest, or it applies to one of four readers.

## No comparison, no chip

The delta chip — a small up or down arrow with a number, coloured — is the
highest-density claim on a dashboard. It asserts that a comparison period
exists, that it is comparable, that the change is real, and, through its
colour, that the change is good or bad. Most implementations assert all four
without checking any.

The rule is a refusal: **when there is no comparison, there is no chip.** Not
a zero chip, not a grey chip reading "0%", not "—%" in the chip's shape.
Nothing renders where the chip would be. A first period has no predecessor. A
metric that changed definition mid-window has no comparable predecessor. A
period where the prior value was unmeasured has no predecessor either, and
computing a change against an unmeasured prior is the dash-as-zero failure
wearing a different costume. A chip against a zero prior is not a percentage
change at all and must render as an absolute movement or not at all.

The colour on the chip is the same claim the funnel row makes, and it needs
the same licence: direction is not valence. Time-to-hire falling is usually
good; time-to-hire falling because a stage was skipped is not. Applications
rising is good until it is a spam wave. Without a goal or an explicitly
declared polarity for the metric, the chip states the direction and takes no
colour. See absent-delta-when-there-is-no-comparison.

## Grammar reserved for measurement

One more rule sits across all six. Tone, colour, banding and the confident
adjectives are **reserved for measured quantities**. When a surface renders a
model's self-reported confidence, or an inferred category, or a projection, it
does not get the band — because the band is the grammar of measurement and
lending it to a guess makes the guess look like a reading
([inference must look like inference](../_laws.md#inference-must-look-like-inference)).
The full guess-versus-measurement grammar is owned by the sibling discipline
on inference labelling and refusal; the boundary that matters here is that a
measurement surface may not import that grammar for a quantity the sibling has
already classified as inferred. A forecast on a hiring dashboard gets an
interval and a basis, not a green tile.

## The seams, stated plainly

- **Metric definitions** — what a stage conversion counts, which cohort basis,
  which window, which denominator — belong to the funnel-metrics discipline.
  This subject assumes a correct figure arrives and governs what the screen
  then says about it.
- **Small-sample honesty** decides *whether* a claim may be made at all, and
  at what strength. This subject renders the ruling. Where the two appear to
  conflict, the claim-side ruling wins and this surface's job is to make the
  suppression visible rather than to route around it.
- **One person's score on one screen** — the dial, the component breakdown,
  the assumptions beside the number — is a different surface with different
  rules, owned by the score-presentation discipline. It governs a claim about
  an individual, where the reader can be wrong about a person; this subject
  governs claims about populations, where the reader can be wrong about a
  process. The rules rhyme (both refuse a numeric default for absence, both
  lock bands to one table) and the failure costs do not. The boundary is
  crossed in both directions and both are errors: printing a cohort statistic
  on one candidate's card swaps one mis-scoped claim for another, and the
  measured figure belongs where its cohort is. When a surface is tempted to
  borrow across the seam, the honest move is to quote the number where it was
  computed and say whose number it is.
- **Inference grammar** — what a guess may look like — is owned by the
  inference-labelling discipline, and this surface consumes it.

## Two habits that make the whole register stick

**Give every shareable artifact a one-line publishability gate.** When a set of
figures leaves the product — a pack, an export, a slide, a digest — it carries
a single boolean answering *can this go in front of someone outside*, true only
when every headline figure is fully measured, plus the list of caveats that
made it false. This does two things at once: it forces the per-figure states to
be real rather than cosmetic, and it gives the person about to paste the
numbers into a deck the one thing they actually need. A surface whose honesty
is distributed across a hundred captions has no answer to that question; one
with a gate does.

**Make every rendered claim end in a decision.** The register that survives
contact with users is not hedging, it is instruction: not "conversion is low"
but "leave a human on rejections until this improves"; not "no goal set" but
"set a target and this row will tell you when it slips". A number that ends in
a decision is a number someone will check. A number that ends in an adjective
is decoration, and decoration is where the dishonesty hides, because nobody
argues with it.

## What an honest measurement surface looks like

Pulled together: every figure carries its state, and the state is visible
beside the value rather than encoded in it. Colour appears only where somebody
set a goal, and where nobody has, the surface says so plainly and offers the
editor. Dashes mean unmeasured, zeroes mean zero, and one glyph does each job
everywhere in the product. Bands name their no-data tier and the legend shows
it. Headlines are written at the strength of their weakest input, and
qualifiers explain instead of retracting. Capped tables state their cap and
account for the remainder. Delta chips appear only where a comparable prior
period exists, and they take colour only where direction has a declared
valence.

The result is a dashboard that is harder to read quickly and impossible to
read wrongly. That trade is the subject.
