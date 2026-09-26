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
into one paragraph. On the engine where this was first seen, the condensed form
held and the list drifted — read as one governing instruction rather than as a
list from which a plausible subset can be satisfied. That is an observation on
one runtime, not a finding with a direction: no controlled comparison of the two
forms exists, and prompt-format effects are large on some models, small on
others, and only weakly correlated between them. The part that does generalise
is count — the chance that *every* rule in a set is followed falls as the set
grows. Where a block of related behaviour is drifting, condensing it is a real
intervention, not cosmetic editing — and it must be re-measured like any other
change.

**Position.** That block goes out of the middle. The middle of a long
instruction set is its weakest region on every model measured. Which end is
strongest is not settled and is not one answer: constraint-following studies
find recency on some model families and primacy on others, one finds hard
constraints do best *first*, and the vendors' placement advice differs (one
recommends instructions at both the start and the end, and above the context if
stated once). What decides the end for a given brief is a measurement on the
engine it runs on. Where that measurement exists — a consistency gate that
drifted when prose separated the block from the end and held when it moved there
— the end it found is part of the tested artifact. Where it does not, state the
block at both ends.

The reason position matters at all is where violations appear: precisely on the
turns that the *craft* rules elsewhere in the brief create — the narrowing
follow-up, the hint, the read-back, the interruption. Those turns are unusual by
construction; unusual turns are where consistency breaks.

**Proximity is not position.** In a conversation the brief recedes. Every turn of
transcript sits between it and the turn being generated, and instruction drift
has been measured setting in within about eight rounds. "Last in the brief" is
nearest to the *first* turn and nowhere near the twentieth. A constraint that
must hold on every turn is re-stated where the turn is made: a per-turn reminder,
a note at a stage change, or the text returned to a tool call the interviewer
just made. That last carrier is the strongest one a brief author controls — it
arrives immediately before the turn it governs, every time — and it is the one
to spend on the rule that matters most at that moment.

**Form.** Rules divide by the shape of the output they demand:

- *Constraints on content* bound what a turn may contain — one question, no
  grading, no verdict, no revealing the mechanism. Cheap, and they hold.
- *Instructions to perform an extra conversational move* require a turn to
  **begin** with something other than the interview's substance: acknowledge
  first, then continue; redirect, then ask; summarise, then proceed. These create
  a "meta" turn, and meta turns are where a conversational engine drops whatever
  consistency the rest of the brief was holding.

The mechanism below is the one observed on the runtime where this was measured,
and it is worth stating precisely because it tells you what to change. The
published work on language confusion supports its conditions — confusion is a
sampling-point event, likeliest where many continuations are plausible, and
worse under complex prompts — but not its strong form: responses also drift
mid-turn after a correct start, so the opening token does not settle the
language on its own. The meta move requires the turn to open with a short social token —
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
sits near a consistency gate, that trade is usually bad. The hazard is specific
to the example's language, register or wording differing from the turn it
shapes: a demonstration in another language measurably increased language
confusion, while several demonstrations in the target language reduced it. An
example written in the candidate's own language, for a brief locked to it, is
the one form that helps rather than hurts.

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
([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence));
"we never saw a problem with it" is not the same claim as "it passed".

## Change discipline

- **A brief change names the behaviour it wants, the wording that produced it, and
  the property it must not damage.** The third field is the one teams omit, and
  it is the one that catches this class of defect.
- **A measured result binds to the exact wording that was measured**
  ([a verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
  Rephrasing a rule for elegance after it passed is a new rule and needs a new
  measurement. So does moving it.
- **Add one rule at a time when the brief is near its consistency limits.** Two
  rules added together cannot be attributed when a gate fails, and the usual
  outcome is that the innocent one gets reverted.
- **A new rule should displace an old one or justify the length.** Compliance
  degrades across the whole document as it grows, so an unbudgeted addition
  quietly weakens rules that were previously fine.
- **Give the hard constraint its cadence, not a claim of rank.** Saying *when*
  it is evaluated — before every turn, checked against the candidate's last
  message — names the check the engine must run and is worth writing. Saying that
  it "outranks every other instruction" is not a lever: spelling out a priority
  order in the prompt text brought no measurable improvement in a
  priority-following benchmark, the priority models do honour is trained into
  message roles rather than read from prose, and current vendors warn that
  emphatic, absolute phrasing now causes rules to be over-applied. A rank sentence
  already inside a measured, passing block is part of what was measured — removing
  it is a change that needs the gate re-run, not a free cleanup — but adding one to
  fix drift is fixing it with the wrong tool. Where two rules genuinely collide,
  write the tie-break for that collision.
- **A fix that passed once is a watch item, not a settled result.** Where a
  change was reverted, re-worded and re-validated, expect a later run to drift
  again; record it as under observation until a full sweep confirms it. A clean
  re-run on the case that failed is the weakest possible evidence, because it is
  the case the wording was fitted to.
- **Where the same interview runs on more than one runtime, the brief text is
  defined once and composed identically**, off-switches included. Once only one
  runtime composes the brief and the rest consume its rendered output, the sync
  obligation is met by construction — but a rendered snapshot holds only what
  shipped, so an unshipped rule then lives in exactly one place and its note must
  stop claiming a copy that no longer exists.
- **Anything that appends to a finished brief lands after the block you
  positioned.** An optimiser, a per-job patch, a locale override: each is a new
  last rule. The mechanism that adds text has to insert it before the guarded
  block, or the block's measured position silently stops being true.

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
