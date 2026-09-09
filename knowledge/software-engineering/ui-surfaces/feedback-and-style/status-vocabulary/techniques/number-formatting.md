---
layer: technique
type: technique
subject: status-vocabulary
technique: number-formatting
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [deciding where locale resolution lives, sub-unit spend rendering as zero, auditing a checker blind to formatter callbacks, a unit or symbol is appended to a formatted value at the call site, a missing-value placeholder renders differently in different columns, a fixed-width or monospace table renders a quantity that can be absent]
---

# Number formatting

A number a person reads is not the number; it is a rendering of the number
in a convention the reader's locale owns — separator, grouping, symbol
position, sign placement, spacing. The technique is one primitive that
owns that rendering completely, so that no call site can re-decide any of
it, and the hard cases are impossible to get wrong rather than easy to
get right.

## One renderer, locale bound inside it

The product has one numeric display primitive (and one formatter module
behind it for non-component callers). Its non-negotiable property: **the
active locale is resolved inside the primitive**, from wherever the
application keeps the user's language, with an optional override for the
rare fixed-locale render (an export preview, a machine-readable surface).

The alternative — a `language` parameter the caller is supposed to pass —
is the technique's most expensive measured failure. A primitive that
*accepts* a locale but *defaults* it is locale-blind with extra steps,
because the default is what ships: the call site that would remember to
pass the locale is the call site that did not need the primitive. Measured
in a fourteen-language product: ~96% of call sites took the default and
rendered one locale's separators everywhere, under a green build, for
months — and **one edit binding the active locale inside the primitive
corrected ~212 call sites at once**, which is the entire argument stated
as a diff. A convergence check found a sibling that bound the locale
inside its formatting hook from day one; its off-convention rate was 1 in
827. Where an architectural boundary forbids the primitive from reading
the store directly, that boundary — not the author — is what made the
locale a prop, and the boundary needs the exception, because a rule that
turns a required input into a forgettable one has inverted its own
purpose.

## The unit is part of the value

A quantity with a unit is **one value, not two**. The instant a currency
glyph, a percent sign, a magnitude suffix, or a minus sign is
*concatenated* to an already-formatted number, the pair can never again be
re-ordered, re-spaced, re-signed, or re-denominated — and each of those is
something some locale demands: the currency symbol moves to the other end
of the string in a third of the locales one repo shipped; the percent sign
takes a preceding space in several; compact magnitude is not a suffix but
a **different numbering system** (ten-thousands and hundred-thousands
groupings exist) that no concatenated letter can approximate. So the
primitive takes `value` + `unit` and emits the whole string. A hardcoded
glyph beside the primitive is the same defect as a hardcoded glyph beside
a raw number.

### The unit belongs to the branch that has a value, not to the column

Handling the absent case *inside* the authority is necessary and it is not
sufficient, which is the trap: anything concatenated to the authority's
output after it returns re-opens every case the authority just closed. The
unit is the concatenation that gets made, because a unit feels like a
property of the **column** — every row in it is milliseconds — rather than
of the value, and a column is exactly the scope in which some rows have no
value.

The measured shape is a fixed-width row built as a padded value slot with
the unit appended after it. The present branch renders correctly. The
absent branch renders its placeholder, the placeholder is padded like a
number, and then the column's unit is glued to it: `n/a` becomes
`n/ams`. Nothing rounded wrong and no false quantity was claimed — what
broke is that **the placeholder stopped being the placeholder**. A reader
scanning for the one token that means *no measurement* now sees a
different token in every column that has a different unit, which is a
status vocabulary with no members.

So the uniformity this technique asks of the absent case runs across units
and columns, not only across precisions, and the structural fix is to bind
the unit inside the branch that has a quantity — emit `41 ms` or `n/a` as
whole strings, then pad the composite. Padding the number and appending
the unit also puts the unit at a ragged position whenever a value
overflows its slot, so the two defects have one cause and one correction.

The enforcement note is specific, because the obvious test does not catch
this: **assert the present and absent renders in the same test.** Each
branch is correct in isolation — `41 ms` is right, `n/a` is right — and
the defect lives only in what the two have in common. A suite that covers
the formatter with a value, which is the case an author writes first,
stays green for as long as the sentinel is wrong.

## Rounding is a contract about loss

The tolerable loss is a property of the **quantity**, not the widget — and
the wrong contract is a false statement, textually indistinguishable at
the call site from a correct one. The canonical instance is sub-unit
money: a fixed two-decimal render displays a real sub-cent spend as zero,
which in a product that meters small per-event costs makes the spend
column *lie*. Measured convergently in two independent codebases at
roughly the same rate (about half of hand-rolled money renders). The
primitive's money path therefore carries the sub-unit guard ("less than"
notation below the display precision) so no call site needs to know the
rule exists. Per-quantity precision ladders live in the formatter, once —
a call site re-deriving the ladder inline at a slightly different
threshold is the drift in miniature.

## Zero, unknown, and too-small are three facts

An exact zero, an absent value, and a value below display precision are
three different statements about the world, and a formatter that renders
two of them identically has destroyed information with no way for the
reader to detect the loss. The policy lives in the primitive: absent →
an explicit placeholder glyph, uniformly across every precision; zero →
zero (never the "less than" notation — "free" and "unmeasurably small"
are different claims); sub-precision → the guard notation. The measured
trap is a formatter whose branches answer these differently per precision
option — one function, two null policies, no test distinguishing them —
which converts an options argument into a semantics argument. Negative
values get the same care: apply magnitude guards to the absolute value
and let the locale layer place the sign, or refunds render as "less than
a cent" regardless of size.

## The gate must see what the renderer produces

A checker keyed on *where a formatting call sits in the syntax tree* can
always be narrowed until it reports zero — and the population it narrows
away is not random: formatter callbacks, chart axis formatters, and
helper modules are precisely where display formatting concentrates,
because that is where authors factor it. One measured rule skipped any
call inside an enclosing function expression and reached ~3.5% of its
real population; a sibling's scanner keyed on "contains letters" and
could never see a bare `%` or currency glyph. Two unrelated mechanisms,
one hole ([gate-sees-target](../../../../_laws.md#gate-sees-target)). The
honest gate keys on the *output shape* (a glyph concatenated to an
interpolation, a raw rounding call in display code) — and the deeper
answer is the type-level one: make the primitive impossible to
misconfigure, then the gate only needs to find bypasses.

## Cost discipline

Locale-aware formatter construction is expensive (locale data resolution
on every instantiation), and numeric surfaces sit on hot paths — animated
counters re-format per frame. The primitive backs onto a module-scope
formatter cache keyed by locale + the option fields actually varied.
Callers never construct their own; an ad-hoc construction at a call site
is both a second locale policy and a per-render cost.
