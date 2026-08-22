---
layer: technique
type: technique
subject: hash-pinned-translation-pipeline
technique: shape-sync-is-not-content-sync
status: forged
laws: [gate-sees-target, count-carries-predicate, deletion-is-not-repair]
shared_with: []
use_when: [a fully-green parity board over prose nobody has re-read, someone proposing to bulk-restamp provenance hashes, deciding the order of a structural and a freshness check]
---

# Shape sync is not content sync

Two checks, two questions, and a localized codebase that has built only the
first will believe it has built both.

**A shape check** asks a structural question: does every locale hold every unit
the source holds, and nothing extra? It is a set difference. It needs no stored
state, it runs in milliseconds, it is easy to generate types for, and it is
therefore what every project builds first and often the only thing it builds.

**A content check** asks a derivational question: was each translated unit
produced from the source as the source now stands? It requires a stored pin per
unit, written at translation time, compared at check time. The state is the
entire cost of the practice, and it is the whole reason teams skip it.

The shape check can pass at a hundred percent over a corpus whose prose was
translated from a source revision two quarters gone. Not because the check is
poorly written — because **freshness is a fact about two instants and every
shape check compares two artifacts at one instant.** There is no type that
expresses "this string is a translation of that string as it currently reads",
no exhaustive switch that catches it, no compile step that can be taught it.
The gap is structural.

## Why this green is worse than a red

The two defect classes surface in the product in opposite ways, and the
difference decides which one gets fixed.

A **missing** translation renders as source-language fallback text: an English
sentence in the middle of a Japanese page. It is visible, it is ugly, and the
first user in that locale reports it. Missing is loud and self-repairing —
someone will always tell you.

A **stale** translation renders as fluent, confident, idiomatic prose in the
reader's own language describing a screen that no longer exists, a setting that
was renamed, a step that was removed. It looks exactly like a correct
translation, because it is a correct translation of the wrong thing. Nobody
reports it — the reader has no way to know — and nobody on the team reads that
locale. **Stale is strictly better at hiding than missing**, and the passing
parity board is not incidental to that: it is the *reason* nobody goes looking.

This is why the standard treats a green completeness report as a claim needing a
predicate rather than as reassurance. "One hundred percent translated" is true
under a predicate about key sets, and it will be read as a claim about prose
([count-carries-predicate](../../../_laws.md#count-carries-predicate)). The
report that says "0 missing keys, 0 untranslated values, **and** 0 stale units"
is making three claims; a report that says "100% complete" is making one and
being quoted as three.

## The gate is watching a proxy

A parity gate over a corpus that is meant to be *current* is
[observing a proxy for the thing it gates](../../../_laws.md#gate-sees-target),
and it diverges from its target at exactly the moment it exists for: the source
edit. Before the edit, shape and content agree; the instant the source unit is
reworded, shape is still perfect and content is wrong. The check is green
precisely and only during the window the defect is live.

Note that adding *value parity* — the check that a locale's text is not
byte-identical to the source, which catches a locale seeded by copying — does
not close this. Value parity catches a translation that never happened. It is
blind to a translation that happened and then expired, and a stale unit passes
it comfortably, being fluent target-language prose that differs from the source
in every way.

## The ordering rule

Run the shape check first, the content check second, and gate on both.

The order is not aesthetic. A content check over a corpus with broken parity
produces a report that is mostly noise: every missing unit is also unpinned,
every orphan is a hash comparison against nothing, and the genuinely stale units
are buried in a population three times their size. Repair structure, then ask
about freshness — the second question is only legible once the first is
answered.

The corollary is that the two checks belong in one report and one gate rather
than two dashboards. A team that has to visit two places to learn whether a
locale is shippable visits one.

## The forbidden repair

There is a command that turns the entire corpus green in one second:
**re-stamp every recorded hash to the current source hash without
re-translating anything.** It is trivial to write, it is occasionally proposed
in good faith ("the translations are probably fine, we just lost the records"),
and it is the localization form of deleting a failing test.

[Removing the artifact that exposes a defect is not fixing the defect](../../../_laws.md#deletion-is-not-repair)
— and this instance carries an extra cruelty most instances do not. A deleted
test can be restored from history and re-run. A bulk restamp destroys **the only
record of which units were stale**: after it runs, the tree asserts that every
translation matches current source, and there is no artifact anywhere — not in
the locale files, not in the pins, not in the report — from which the true
population could be recovered. The information is gone, not hidden.

The one legitimate bulk pin is the migration case: a corpus adopting the
practice, or a deliberate scope change. It is legitimate **only** as a recorded
event — written rationale, the source revision it pins to, the units it touched,
the date — and it is performed exactly once. Every restamp after that is a
re-translation or it is a lie.

## What this means for a team adopting the practice

The honest position on day one is that the corpus is **unverifiable, not
clean**. Whatever the existing translations are, nothing in the tree knows what
they were derived from, and the shape gate's green is evidence about shape
only. Two responses are defensible: pin at unknown truth (fast, cheap,
recorded as such, and the pins are a floor rather than a fact — every unit is
"at least as old as this date"), or re-translate the corpus once to establish a
known-good baseline (expensive, and the only path that makes the first report
mean what it says). Choose with the fan-out audit in hand. What is not
defensible is pinning silently and treating the resulting green as a
measurement, because that is the forbidden repair wearing a migration's
clothes.
