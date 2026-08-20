---
layer: technique
type: technique
subject: measurement-honesty
technique: lower-bound-disclosure
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [publishing a reach or usage tally assembled from partial observation, two rungs of a ladder are both arguable, a number will be quoted outside its context]
---

# Lower-bound disclosure

Some numbers can only be undercounts. A tally of how often an artifact was seen
is assembled from the requests that reached your system — but intermediaries
cache, aggregators embed, clients block, proxies collapse many views into one
fetch, and a large share of real observation is absorbed before it becomes a
row you can count. There is no version of that number that is a total. It is a
floor, and the only question is whether it is published as one.

## Determine the direction of the bias first

Before a number can be disclosed as a bound, you have to know which way it is
wrong. Three questions settle it:

1. **Can an observation happen without producing a record?** If yes — caching,
   absorption upstream, sampling, opt-outs, blocked instrumentation — the number
   is an undercount and is a **lower bound**.
2. **Can one real event produce more than one record?** If yes — retries,
   duplicated emissions, a bot fleet indistinguishable from users — the number
   is an overcount and is an **upper bound**, which is a much weaker artifact
   and usually should not be published as a headline at all.
3. **Both?** Then it is an estimate with unknown sign, and calling it a bound in
   either direction is a second lie on top of the first. Say "estimated", give
   the method, and expect it to be discounted.

Only case 1 earns the lower-bound framing, and it earns it strongly: an
undercount published as a floor is a claim nobody can refute by finding more.

## The procedure

1. **Declare the bound at the source of truth, not at the render site.** The
   comment on the query or the field that produces the tally states that it is a
   floor and names the absorbing mechanism. A bound documented only in the
   component that draws it survives exactly until the second consumer appears.
2. **Name the mechanism, not just the direction.** "A lower bound — most views
   are served from upstream caches and never reach us" is checkable; "approximate"
   is not, and readers translate "approximate" into "sloppy" rather than
   "conservative".
3. **Carry the phrasing into the string that travels.** The disclosure must live
   in the rendered text — "at least 12,400 views" — because the caveat beside it
   will not survive the screenshot, the paste into a message, or the slide. This
   is [count-carries-predicate](../../_laws.md#count-carries-predicate) applied
   to a number's *format*: the predicate is part of the value, not decoration
   around it.
4. **Never reconcile a bound against a differently-scoped total.** The
   comparison that ends badly is your floor against an external platform's
   count; they measure different events with different absorption. Compare a
   bound only to itself over time, and say so — the trend of a consistently
   measured floor is sound even where its level is not.
5. **Keep the method fixed while the series lives.** A floor whose measurement
   method changes produces a step in the trend that reads as a real event. If
   the method must change, break the series and label the break.

## The sibling rule: under-claim ambiguous levels

The same instinct governs staged assessments, where the number is a level rather
than a tally:

> **When two rungs are arguable on the available evidence, assign the lower
> one. The ladder is a floor, not a guess.**

The reasoning is asymmetric cost. An over-assigned level is discovered by
someone who trusted it — and its discovery discredits every other level the
system assigns. An under-assigned level is discovered by the subject, who
disputes it, supplies the missing evidence, and improves your inputs. One
failure mode costs credibility; the other costs a conversation and pays you in
data.

The rule has a sharper form that does most of the work in practice: **the
*class* of evidence you hold caps the rung, independently of what the evidence
says.** If the top rung requires inspecting the contents of something and you
only observed that it exists, the assessment caps one rung below — not because
the subject probably fails, but because this run structurally cannot prove that
rung. Stating the ceiling by evidence class turns a hundred case-by-case
judgment calls into one rule, and it makes the ladder's floors reproducible
across runs with different acquisition luck.

Making it work in practice takes two supports:

- **The evidence for the rung is shown.** A floor nobody can inspect is
  indistinguishable from a low opinion. Name what was found and what the next
  rung requires; the gap between them is the subject's next action.
- **Ambiguity resolves downward at *every* rung, uniformly.** A ladder that
  rounds down at the bottom and up at the top compresses toward the middle and
  loses its discriminating power — which was the only reason to have rungs.

## When not to use it

- **When the number really is a total.** A count over a closed system you fully
  observe is a census; calling it a lower bound out of humility is its own
  distortion, and it invites the reader to inflate it mentally.
- **When the audience needs a planning figure.** "At least N" is unusable for
  capacity or forecasting. Supply a separate, clearly labeled estimate with its
  method, and keep the bound as the published, defensible figure — do not let
  one number try to be both.
- **For safety-relevant quantities where an undercount is dangerous.** For
  exposure, error, or incident counts, a floor framing invites reading the floor
  as the level. There the honest artifact is the bound *plus* an explicit
  statement of what the true value could be, or a refusal to report until the
  instrumentation is complete.
- **When the bound is so far below reality that it misleads by anchoring.** A
  floor at five percent of the true value is technically true and functionally a
  lie; if you can characterize the absorption ratio at all, publish the method
  and the range instead.
