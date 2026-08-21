---
layer: technique
type: technique
subject: ai-interviewer-brief-authoring
technique: rule-ordering-adjacency-and-form
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [adding a rule to an interviewer brief, a correct rule breaks something unrelated when added, deciding where in a brief a hard constraint belongs, a rule was tested and must not be silently dropped]
---

# Ordering, adjacency and form of rules

A brief is an ordered document. Where a rule sits, what it sits next to, and what
grammatical shape it takes change how reliably it is followed — independently of
whether it is correct. Treat position and form as design decisions with the same
seriousness as wording, and treat a measured brief change as bound to the exact
text that was measured.

## Three properties, in order of how much they cost to get wrong

**Adjacency.** Rules that must hold together belong together. A brief's hard
consistency constraints — the ones where a single violated turn ruins the whole
artifact, typically language, register, and forms of address — should be written
as one contiguous block, not distributed to the sections they logically belong
to. Separated by unrelated material, they compete with whatever was written
nearest the point of generation and lose.

Adjacency has a second face: **density**. A set of craft rules written as many
separate one-rule statements behaves differently from the same rules condensed
into one paragraph, and the condensed form holds better. The rules read as one
governing instruction rather than as a list from which a plausible subset can be
satisfied. Where a block of related behaviour is drifting, condensing it is a
real intervention, not cosmetic editing — and it must be re-measured like any
other change.

**Lastness.** That block goes at the end. The rules stated closest to the point of
generation are applied most reliably to the turn being generated, and the
violations show up precisely on the turns that the *craft* rules elsewhere in the
brief create — the narrowing follow-up, the hint, the read-back, the interruption.
Those turns are unusual by construction; unusual turns are where consistency
breaks. Putting the consistency block last means it is nearest to hand exactly
when the unusual turn is being produced.

**Form.** Rules divide by the shape of the output they demand:

- *Constraints on content* bound what a turn may contain — one question, no
  grading, no verdict, no revealing the mechanism. Cheap, and they hold.
- *Instructions to perform an extra conversational move* require a turn to
  **begin** with something other than the interview's substance: acknowledge
  first, then continue; redirect, then ask; summarise, then proceed. These create
  a "meta" turn, and meta turns are where a conversational engine drops whatever
  consistency the rest of the brief was holding.

The mechanism is worth stating precisely, because it tells you what to change.
The meta move requires the turn to open with a short social token —
an acknowledgement, a softener, a "understood, let's continue". That token is
drawn from whatever register or language is most strongly associated with polite
acknowledgement, and once it is placed, the rest of the turn continues from it.
The consistency constraint is then being applied *after* the turn already
started somewhere else. Requiring the turn to begin with the question removes the
landing spot entirely, which is why "ask the follow-up plainly, with no
acknowledgement or preamble" fixes a drift that no amount of restating the
consistency rule does.

The doctrine follows directly: **prefer rule forms whose compliant output must
start with content.** If a behaviour truly requires a meta move, expect it to cost
consistency on that turn, and measure for that specific damage rather than for
general answer quality — which will look fine.

A related trap: **worked examples inside a rule plant tokens.** An instruction
that illustrates itself with a sample phrase supplies exactly the landing spot
the previous paragraph describes, and a bilingual pair of examples supplies two.
Examples make rules clearer and make them likelier to be echoed; on a rule that
sits near a consistency gate, that trade is usually bad.

## The rule you measure and do not ship

The hardest lesson in brief authoring is that a rule can be correct, necessary,
well-motivated, humane — and still not shippable. Handling a hostile or
uncooperative candidate is the canonical example: everyone agrees the interviewer
should acknowledge the hostility calmly and redirect to the question. The
behaviour is right. The rule form is a meta move by construction — acknowledge,
then redirect — and it lands on the single most volatile turn in the whole
conversation. Wordings of it can be produced in quantity, including ones with
explicit worked examples, and every one of them can still induce drift on exactly
that turn, breaking a consistency gate that the same brief *without* the rule
passes cleanly.

When that happens, three moves are wrong. Shipping it anyway because the
behaviour is obviously good trades a measured harm for a benefit confined to rare
turns. Deleting it guarantees the next author re-derives the same
obviously-good rule, writes it in one of the same shapes, and ships it blind.
Keeping it only in the runtime where it was written produces two different
interviews under one job's name, whose transcripts cannot be compared.

The right move: **keep the rule defined, unshipped, and synchronised.** It stays in the
brief source, switched off, next to a note recording what was tried — how many
wordings, which forms, including the ones with worked examples — and what broke.
Every runtime that composes a brief carries the same definition in the same
off state. A future author who finds a wording worth re-testing then re-tests
against a known baseline instead of re-deriving the history, and the off state is
a deliberate, attributable decision rather than an absence.

An unmeasured wording is not a safe wording
([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence));
"we never saw a problem with it" is not the same claim as "it passed".

## Change discipline

- **A brief change names the behaviour it wants, the wording that produced it, and
  the property it must not damage.** The third field is the one teams omit, and
  it is the one that catches this class of defect.
- **A measured result binds to the exact wording that was measured**
  ([a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
  Rephrasing a rule for elegance after it passed is a new rule and needs a new
  measurement. So does moving it.
- **Add one rule at a time when the brief is near its consistency limits.** Two
  rules added together cannot be attributed when a gate fails, and the usual
  outcome is that the innocent one gets reverted.
- **A new rule should displace an old one or justify the length.** Compliance
  degrades across the whole document as it grows, so an unbudgeted addition
  quietly weakens rules that were previously fine.
- **Let the hard constraint declare its own precedence, and its own cadence.**
  The consistency block should say in words that it outranks every other
  instruction in the brief, and should say *when* it is evaluated — before every
  turn, checked against the candidate's last message, not once at the start. A
  constraint that is only positioned is weaker than one that is positioned and
  states its rank.
- **A fix that passed once is a watch item, not a settled result.** Where a
  change was reverted, re-worded and re-validated, expect a later run to drift
  again; record it as under observation until a full sweep confirms it. A clean
  re-run on the case that failed is the weakest possible evidence, because it is
  the case the wording was fitted to.
- **Where the same interview runs on more than one runtime, the brief text is
  defined once and composed identically**, off-switches included.

## When not to use it

- **Small, stable briefs with no hard consistency gate** do not need the
  block-at-the-end discipline; ordinary logical organisation reads better.
- **Do not treat ordering as a substitute for wording.** A rule followed
  inconsistently because it is ambiguous is fixed by clarity, not by position.
- **Do not generalise a specific engine's positional behaviour into a law.**
  Position effects are real but their size is a property of the runtime, and a
  brief that has become a pile of positioning workarounds has stopped being an
  interviewing document. Label workaround rules as workarounds so they can be
  retired when the runtime changes.
