---
layer: technique
type: technique
subject: modelled-performance-estimates
technique: scoped-calibration-fallback
status: forged
laws: [derivation-names-recomputation, deletion-is-not-repair]
shared_with: []
use_when: [correcting a modelled estimate against real measurements, a correction table fits the cases you have and misses the ones you do not, adding an entry to a lookup table and needing to know what else moves, a heuristic fallback is being tuned to fit its newest outlier]
---

# Scoped calibration fallback

A model produces a shape; measurement supplies the magnitude. The correction
that joins them — a factor, a table of per-category coefficients, an offset —
is what turns a systematically optimistic ceiling into a number worth
publishing. It is also the component most likely to rot, and it rots quietly,
because every internal check it has is a check against the cases it was fitted
on.

The governing rule is about **scope**, not about fit quality:

> **A correction's fallback must be arranged so that adding an entry only ever
> moves the thing that entry names.**

## Why a global factor is the wrong instrument

A single multiplier tuned across everything measured is attractive because it
is one number and it demonstrably improves the average. It is the wrong
instrument for three reasons, none of which is about accuracy.

**It is unreviewable.** A change to a global factor moves every estimate the
system produces, including for configurations nobody has ever measured. The
reviewer's only possible question is "did the average improve", which the
author has already answered yes. There is no way to ask "what got worse",
because the set of things that got worse is unbounded.

**It regresses on what you did not measure.** The factor absorbs whatever is
peculiar about the sample. When the sample skews toward one class of system —
and it always does, because that is what was available — the correction
encodes that class's peculiarity and applies it to every other class. The
cases nobody had are the cases the correction damages, and they are also the
cases nobody will notice.

**It hides the shape of the error.** A model that is off by a constant factor
is a model with a calibration problem. A model that is off by different
factors on different classes of system has a **structural** problem — it is
missing a term — and the per-class spread is the evidence. A global factor
averages that evidence away and the structural defect is never found.

The alternative is a table keyed on whatever dimension the error actually
varies along, with a documented fallback for keys the table does not carry.
The gain is not arithmetic. It is that **the diff is legible**: an entry added
for one category moves exactly that category's estimates, and the author can
state which readings change and be checked.

## The fallback's error is a signal, not a bug

A table has a fallback — a heuristic keyed on something coarse, or a default
coefficient — for keys it does not carry. That fallback will fit some
unrepresented cases badly, sometimes very badly: an estimate off by a factor
of two or three against a newer design whose behaviour differs from everything
the heuristic was built on.

The temptation at that moment is to fix the fallback. **Do not.** Tuning the
fallback until the newest outlier looks right does three things, all bad: it
moves every other unrepresented case in an unmeasured direction, it makes the
fallback a second fitted model with no record of what it was fitted on, and —
worst — it **removes the signal**. The fallback's error was the system telling
you an entry is missing. Suppressing it converts a visible gap into an
invisible one at precisely the site where visibility existed, which is
[deletion is not repair](../../../../_laws.md#deletion-is-not-repair) in its
least recognisable disguise, because it presents as improving accuracy.

The correct response to a badly-fitting fallback is an **entry**, measured for
that category, added under the scoping rule. The fallback stays deliberately
crude and deliberately unturned, and its job is to be approximately right for
the average unmeasured case and to be visibly wrong for cases that need an
entry.

State this where the table lives, in the words the source of every good
version of this rule uses: *adding an entry only ever moves the category it
names.* Written beside the table, that sentence survives the author's
departure; held as a shared understanding, it lasts one contributor.

## Never calibrate against your own output

The correction is fitted from measurements. **Only measurements** — never a
value the provenance ladder classes as modelled or calibrated. The failure is
a slow feedback loop and it is invisible from inside:

1. The table produces a calibrated estimate for a configuration.
2. That estimate lands in the same store the collector reads from.
3. The next fitting run treats it as an observation.
4. The table now fits its own error, and the residual against reality goes up
   while every internal consistency check goes down.

The system looks like it is converging. It is converging on itself. The
defence is structural, not procedural: **filter the fitting input on the
provenance rung**, so that modelled and calibrated values are excluded by
construction rather than by whoever writes the next collector. A comment
asking people not to feed estimates back in is not a defence; it is a note to
the person who will not read it.

The same rule bars a subtler variant: a category's entry must not be derived
from estimates produced *by the fallback* for that category. That is the loop
above with one extra hop, and it produces an entry that is, in effect, a
copy of the fallback wearing an entry's authority.

A second loop closes at the *application* site rather than the fitting site,
and it is the one that bites in a long-running system: **the correction is
always applied to the uncorrected value, recomputed, never to whatever the
field currently holds.** Keep the uncorrected estimate recoverable — store it,
or divide the applied factor back out — so that re-running after a new
measurement replaces the correction instead of compounding it. Without that,
every re-fit multiplies, the drift is exponential, and it is invisible because
each individual application looks right.

## Fit robustly, and bound what a bad anchor can do

Three guards keep a correction fitted from a handful of observations from
being destroyed by one of them, and all three are cheap.

**Take a robust central statistic, not a mean.** One anchor recorded while the
machine was busy, thermally limited, or sharing the resource is an outlier
several times off, and a mean carries it into every estimate the system
produces. A median over the ratios discards it for free.

**Clamp the resulting factor to a stated range.** A correction outside a
plausible band is not a correction — it is evidence that the anchors or the
model are broken — and it must not be applied while somebody works out which.
The clamp is a bound on the blast radius of a bad fitting run, and its edges
are derived from what the model's error can plausibly be, written beside the
constant.

**Admit only anchors from the regime the correction applies to.** The
provenance filter above is necessary and not sufficient: an anchor may be
genuinely measured and still be the wrong evidence, because it belongs to a
class of configuration the model treats differently — a shape whose cost does
not scale the way the formula assumes, or one so small that fixed overheads
dominate. Fitting across regimes produces a factor that is wrong for both.
State the eligibility predicate beside the fit, because it is the assumption
most likely to be quietly widened by someone who wants more anchors.

## Every coefficient names how it was obtained

A table of tuned numbers with no provenance is unmaintainable within two
contributor generations: nobody can say which entries were measured, which
were guessed to unblock a release, which were copied from a neighbouring
category, and which are stale because the underlying system changed. So each
entry carries how it is recomputed — the measurement set behind it, the date,
the machine class, and the command that reproduces it — which is
[a derived value naming its recomputation](../../../../_laws.md#derivation-names-recomputation)
applied to a constant.

The recomputation must be **invokable**, not merely described. A formula in a
comment beside a coefficient that no longer tracks its inputs is the failure
in its most convincing disguise: it reads as rigour and asserts something that
stopped being true two releases ago. If re-running the fit is a documented
command that anyone can execute, every entry can be checked; if it is a
paragraph describing what somebody did once, none of them can.

Two things travel with the coefficient beyond its source. The **regime it was
fitted in** — which variant, which settings, which size class — because an
entry fitted under one and applied under another carries a known error that
nobody will rediscover. And that **residual, disclosed** rather than hidden:
"fitted at this setting; the other setting reads low" is a maintainable state,
and it is honest in a way that silently applying the entry everywhere is not.

An entry that exists because the model is missing a term should also record
*that*, in a sentence. Otherwise the table grows entries until it is a lookup
masquerading as a model, and the structural fix — which somebody has already
diagnosed, at the moment they fitted the entry — is lost with them.

## Decision rules

- **When the error varies by category, key the table on the category — not on
  a proxy that correlates with it.** A proxy key produces entries that move
  the wrong rows.
- **When a fallback fits a case badly, add the entry.** Do not tune the
  fallback; its error is the missing entry's only alarm.
- **When collecting fitting inputs, filter on the provenance rung and on the
  regime.** Measured rungs only, from the class of configuration the
  correction applies to, both enforced in the collector.
- **When applying a correction, apply it to the uncorrected value.** Keep the
  uncorrected estimate recoverable so re-fitting replaces rather than
  compounds.
- **When fitting from few anchors, take a median and clamp the result.** One
  bad run must not reach every estimate, and a factor outside the plausible
  band is a finding, not a correction.
- **When adding an entry, state what moves.** If the answer is anything other
  than "this category", the scoping is wrong and the fix is the table's shape,
  not the entry.
- **When a coefficient cannot be traced to a measurement set, treat it as
  untrusted and mark it.** An unsourced entry is a guess with a table's
  authority, and it will outlive everyone who knew it was a guess.
- **When the per-category spread is wide, suspect a missing term.** A
  correction that varies by three-fold across categories is telling you the
  model lacks a variable, and no amount of table maintenance will substitute
  for it.

## When not to use this

- **When there is nothing to key on.** If the error genuinely has no
  structure — same distribution across every dimension you can name — a single
  factor with a stated fitting set is honest, and inventing categories to
  populate a table manufactures false precision.
- **When there is no measurement at all.** Calibration needs observations. A
  table fitted from nothing is a table of opinions, and publishing its output
  at the calibrated rung of the ladder is a provenance lie.
- **When the model itself is wrong.** Calibration corrects magnitude, not
  shape. A model missing a term should be fixed, and a table that has grown an
  entry for every case is a model rewrite that has not happened yet.
