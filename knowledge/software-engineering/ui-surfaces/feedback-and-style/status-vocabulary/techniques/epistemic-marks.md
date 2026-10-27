---
layer: technique
type: technique
subject: status-vocabulary
technique: epistemic-marks
status: forged
laws: [unknown-is-not-a-value, one-authority-per-vocabulary]
shared_with: []
use_when: [marking a value as seeded, simulated, unknown or stale, an unknown renders like a neutral status, a planted demo fault looks like a real failure]
---

# Epistemic marks

Status tones answer **what state is this in** — passing, failing, waiting,
neutral. A second question sits on many values and is routinely answered with
the same tones: **how do we know**. A value can be real and current; it can be
the last known value of something no longer observed; it can be unknown; it can
have been planted on purpose for a demonstration, or produced by a run that did
nothing real. Painting those answers with status tones conflates them with
state — an unknown drawn grey reads as "neutral", a stale value in warning
colours reads as "a problem", a seeded fault in the failure colour reads as a
real failure. This technique keeps the second question in its own vocabulary,
drawn with its own mark family.

## A closed family, separate from status

Declare the epistemic marks as one closed vocabulary with one authority
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)),
small enough to learn:

- **seeded** — planted on purpose (a demonstration fault, a fixture item);
- **simulated** — a run or a write that performed nothing real;
- **unknown** — the source did not answer; never zero, never absent
  ([_laws: unknown-is-not-a-value_](../../../../_laws.md#unknown-is-not-a-value));
- **stale** — the last known value, with its age shown beside it.

Each member has a fixed label, a fixed meaning sentence for its tooltip, and a
mark. The component that draws them is **not a tone of the status chip**; it is
its own component, so no call site can pick "unknown" as if it were a colour
choice among ok and bad. Where a status chip needs to show an unknown state as
a member of its own vocabulary, it reuses the epistemic component rather than
defining a second unknown.

## The mark is a line, not a hue

Status tones are fills and hues; epistemic marks are **outline treatments**:
dashed for seeded, simulated and unknown, hatched for stale. The choice is
structural. A dashed border reads as "provisional" in any colour and in
greyscale, so the mark survives colour blindness, print and the reserved
attention hue next to it; and because the family does not compete for hues, a
mark can sit on a value that also has a status — a stale "passing", a seeded
"failing" — without one overwriting the other.

Inside the family, keep the members distinguishable by more than colour too:
seeded may take an accent so a demonstration fault is unmistakable on sight;
stale carries its age as text ("stale · 40 m"); unknown carries no value at
all, only the word or a "?".

## Where the marks attach

Attach the mark to the **value**, at the smallest unit that carries the
uncertainty — the one cell whose source did not answer, the one row that was
planted — not to the screen. A banner saying "some values may be stale" informs
nobody about which. Screen-level disclosure of a whole demonstration plane is a
different obligation, owned by the demo data plane's honesty contract; the
epistemic mark is how an individual value inside a real screen says it is not
like its neighbours.

The derivation decides the mark, not the renderer. A loader that could not read
a source returns an unknown, and the renderer draws the unknown mark; a renderer
that guesses "probably stale" from an old timestamp is a second, untested
authority.

## What this technique refuses

- Unknown, stale, seeded or simulated drawn as a status tone.
- A second "unknown" defined inside the status chip's tones.
- A stale mark with no age.
- A seeded item indistinguishable from a real failure.
- Screen-wide uncertainty notices where the uncertain value is known.

## When not to use it

A surface whose every value comes live from one authoritative source has nothing
to mark; adding a family nobody needs teaches readers to ignore it. Introduce the
marks with the first value that can be unknown, stale or planted, and introduce
them as a family, so the second member does not arrive as a one-off style.
