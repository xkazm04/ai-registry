---
layer: technique
type: technique
subject: contribution-reactive-visuals
technique: money-changes-looks-never-outcomes
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [a feature that wants to read the contribution or hype state, deciding what a paid contribution may change in a streamer tool, enforcing that money cannot reach votes, draws or moderation]
---

# Money changes looks, never outcomes

A contribution-reactive visual is the one place in a streamer's toolchain where money is
supposed to have a visible effect. That makes it the likeliest place for money to start
having effects nobody decided on. The rule is short: **a contribution may change how the
stream looks; it may never change what the stream decides.**

## What counts as an outcome

An outcome is anything a viewer could reasonably call fair or unfair:

- the result or weight of any vote, poll or duel;
- entry into a giveaway, the number of entries, or the odds of winning;
- any moderation decision — a timeout avoided, a message held or released, a review skipped;
- the order in which the streamer sees viewers' messages or requests;
- standing or rank in an audience economy, unless that economy prices it openly under its
  own rules — and even then never through this visual's state.

What a contribution may change is the look: brightness, size, motion, colour. Those are
allowed because they decide nothing.

## Why policy alone does not hold the line

The line is rarely crossed on purpose. It is crossed because the visual's total is a
conveniently live number that already summarises "how engaged is the room", and the next
feature — a bonus entry for supporters, a vote multiplier during a hype moment, a softer
rule for subscribers — reads it. The visual's code does not change, the author of the new
feature never thought of the number as money, and the stream now sells odds. Nobody
rereads a policy document before adding an import.

## Make the separation structural

Three mechanisms, together:

1. **A wall around the money.** The intake, its dedupe keys, the totals, the curves and the
   test sessions are one unit of code whose only outputs are intensities for the overlay
   and the tool's own record of contributions. It has no interface an outcome module could
   call, and it depends on no outcome module.
2. **A test of the dependency direction, both ways.** A build-time test computes the full
   dependency graph — normal, build and development edges, every target and feature — and
   fails if the contribution unit reaches any outcome unit (votes, draws, moderation, the
   show engine), or if any of those reaches the contribution unit. Compute the whole graph rather
   than parsing manifests partially, and also reject any textual mention of the forbidden
   names in the manifests, so an alias or an optional edge cannot slip past. A rule that
   lives only in a reviewer's head is unmeasured, and the next refactor drops it.
3. **The overlay receives a number, not the money.** What crosses to the page is the
   intensity and its provenance; never amounts, viewer identifiers or totals per viewer. A
   page that never received the money cannot later be extended to act on it.

Where a giveaway must check something the platform also sells — whether an entrant is a
subscriber — that check reads the platform's membership fact through the draw's own path,
under the draw's own rules, and money still never multiplies odds. It never reads the
contribution total.

## The legitimate exceptions live elsewhere

Some products sell influence openly: a paid song request, a paid poll option. Those are
designs of their own, with their own disclosure and platform rules, and they are outside
this subject. This technique does not forbid them in the product; it forbids reaching them
*through* the reactive visual, which was never designed, reviewed or disclosed as a sale of
outcomes.

## Decision rules

- **When a feature wants a "hype" signal**, compute one from non-money activity, or none;
  never read the contribution total.
- **When adding an outcome unit**, add it to the dependency test's forbidden list in the
  same change.
- **When a viewer asks what their contribution does**, answer plainly: it lights the
  visual; it does not change votes, odds or moderation. Put the same sentence in the tool's
  own guide.
- **When the dependency test fails**, remove the edge; never widen the list.

## When not to use it

A tool that handles only contributions — an alert box and nothing else — has no outcome to
protect. The first outcome feature it gains brings this technique with it.
