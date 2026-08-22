---
layer: technique
type: technique
subject: public-claim-provenance
technique: no-data-source-labelled-inline
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a public value cannot be derived and must be typed, writing the comment beside a hand-authored figure, reviewing a page whose numbers all look equally authoritative]
---

# No data source, labelled inline

A hand-authored value on a public surface is not a defect. It becomes one the
moment it is indistinguishable from a derived value, which is immediately and
by default, because the two render identically and live in the same file. The
correction is a label — but a label of a very particular kind, in a very
particular place, and most of what makes this technique work is the difference
between that label and the ones teams write by reflex.

## The label states the reason, not the status

`// hardcoded` is a status. It tells the next reader something they could have
worked out from the surrounding code, gives them no way to evaluate it, and
offers no exit. Within a year it means "somebody was in a hurry once", which
is not information.

The label this technique requires is a **statement about the absence of an
instrument**:

> *what this value claims* — *why nothing can produce it* — *what would change
> that*

"Sixty is the target set for this cycle; nothing measures a target, so it
changes only when the target changes." "The completeness figure is a judgment:
the non-catalog bundles are known-incomplete and no coverage check runs over
them. Wire that check up and this derives."

Three properties follow, and each does real work:

- **It is falsifiable.** "No instrument produces this" is a claim about the
  world that can become false. When someone builds the missing check, the
  label is the thing that says the value should now derive — the exit that a
  status comment does not have.
- **It names the missing mechanism**, which means it can be challenged. A
  reviewer who knows the check already exists can say so. A label that says
  only "hardcoded" is unchallengeable, and unchallengeable notes accumulate.
- **It cannot be written when the value is derivable.** If you sit down to
  write the reason and no reason comes, the value can be derived and you were
  avoiding the work. The label is a forcing function before it is
  documentation — which is why writing it *first*, before typing the number,
  is worth the discipline.

## The label sits at the value

Provenance that is not adjacent to the value has already failed. A commit
message is invisible at the site. A design document is read once. A changelog
entry describes an event, not a state. The next person to touch this number
will be looking at this number, and nothing else — that is the only place a
label reliably gets read, and it is the place the edit happens.

Where a run of values shares one reason, state the shared reason once at the
head of the declaration and still annotate each value. The head note carries
the argument; the per-value note carries the fact that *this* value is one of
them. Only the head note, and a value added later slips in unlabelled with
nobody noticing, because its neighbours look unlabelled too.

Where the distinction is meaningful to the *reader* and not merely to the next
author, it also surfaces on the page — a target rendered as "goal" rather than
as a measurement, an "as of" beside a figure that has a vintage. Most
hand-authored values do not need this; a target on a roadmap is understood to
be a target if the surface's typography says so. The test is whether a
reasonable reader could mistake the value for something an instrument
produced.

## What the label carries for a count

A public count that travels — and public counts travel further than any other
number a team writes — carries what was counted and how
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). For a
derived count this is the derivation's predicate. For a hand-authored one it
is the substitute: who decided, against what, and when it was last examined.
Without it the number is reusable for claims it does not support, and reuse is
the whole risk on a public surface — a figure lifted into a deck loses every
qualifier the page around it was providing.

## Decision rules

- **When the reason is "we haven't got round to it", derive it instead.** That
  is not an absent data source; it is an absent afternoon. The label is
  reserved for values that genuinely cannot derive, and spending it on
  laziness devalues every other label in the file.
- **When the reason names a ticket, the label must survive the ticket.** State
  the mechanism, then reference the ticket if you like. Tickets get closed,
  moved, and archived; the sentence has to still make sense afterwards.
- **When a derivation would use a proxy** — counting a related thing because
  the real thing is not enumerable — prefer the labelled hand-authored value.
  A number derived from a proxy is worse than a typed one, because it wears
  the credibility of derivation while answering a different question, and
  nothing on the surface admits the substitution.
- **When the value has drifted before**, say so in the label. "This has been
  wrong twice; it is checked at each release" is the most useful sentence such
  a comment can contain, and it is the sentence a status comment can never
  hold.

## When not to use this

Content that is obviously editorial — headlines, feature descriptions, the
prose of a roadmap entry — is not a claim about a measurement and does not
need provenance notes. Annotating it produces label fatigue, and label fatigue
is how the labels that matter stop being read. This technique is for values
that *look derived*: numbers, ratios, badges, counts, dates, percentages, and
anything rendered in the same typography as those.

With one exception that is worth stating loudly, because it is where the
discipline most reliably leaks: **a count embedded in a sentence is still a
count.** "Support for fifteen or more languages", "forty-plus integrations
built in" — these sit in prose, so nobody sorts them, nobody derives them, and
nobody labels them; and they routinely contradict the derived counter three
sections further down the same page, because the derivation moved and the
sentence did not. Prose is exempt from labelling, not from derivation. If the
number would change when the catalog changes, it takes the derivation rules
whatever typography surrounds it — which usually means interpolating the
derived value into the sentence rather than annotating the literal.
