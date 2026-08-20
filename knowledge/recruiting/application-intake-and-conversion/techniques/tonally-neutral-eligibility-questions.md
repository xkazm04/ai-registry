---
layer: technique
type: technique
subject: application-intake-and-conversion
technique: tonally-neutral-eligibility-questions
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [writing or reviewing knockout questions, styling an application form's answer options, collecting a self-declared or protected characteristic]
---

# Tonally neutral eligibility questions

A knockout question exists to record a fact. It only records a fact if the
candidate cannot tell, from the question, which answer keeps them in the
process. The moment they can tell, you are no longer measuring authorisation
or a licence — you are measuring willingness to give the expected answer,
which correlates with desperation and coaching and nothing you want to hire
for. The record then reads clean and is worthless, and you find out at offer.

The discipline is narrow and mechanical: **the passing answer must be
indistinguishable from the failing answer in every channel except its plain
meaning.**

## The four channels that leak

Signposting almost never happens in the question text. It happens in the four
places nobody reviews:

- **Colour.** The success colour may never style a knockout answer. Success
  styling on "yes" and neutral or warning styling on "no" is a complete answer
  key, legible in half a second, applied before the candidate has finished
  reading. This is the single most common leak, and it usually arrives
  innocently — a generic option component whose "selected" or "affirmative"
  state happens to use the success token. The durable form of the rule states
  where that token *does* belong: **the success tone is reserved for
  outcomes** — the screen that tells the candidate they are through — and is
  never used to steer an answer on the way there. A rule with a positive half
  survives a design system's evolution; a bare prohibition gets rediscovered
  as a bug.
- **Iconography and microcopy.** A checkmark, a thumbs-up, a "great!" or a
  "perfect —" after a selection. Affirmation on one branch is instruction.
- **Order and layout.** The passing option first, larger, pre-focused, or
  visually separated from a cluster of failing ones. A candidate scanning on a
  phone reads position before text.
- **Asymmetric consequence copy.** "Select yes to continue" attached to one
  branch, silence on the other. If a consequence is stated for one answer it
  is stated for all of them, in the same register.

Review these as a set, on the rendered surface, not in the copy document. Copy
review catches none of them.

## State the stakes, never the answer

Neutrality does not mean hiding what the question does. Candidates are
entitled to know that a question is decisive before they answer it — being led
is unfair, but so is being surprised. The rule that separates the two:

> Say what the question decides. Never say which answer decides it your way.

So: a short, neutral line *above* the question — "this role requires an
existing licence to practise in this jurisdiction; the answer below determines
whether this application can proceed" — and then symmetric options with no
further commentary. The candidate now chooses knowingly. Compare the failure
mode, which is silence before the question and a consequence attached to one
option after it.

Where the requirement itself is contestable — a licence that can be obtained,
authorisation that a sponsor could provide, a shift that might flex — say
*that* too, and route rather than decline. A question with a genuinely binary
consequence is rarer than most forms assume.

## Never render a one-option question

A question with a single selectable answer is not a question. It is a coerced
declaration wearing a question's clothes, and it produces a record that says
the candidate affirmed something when in fact they had no alternative. It
arises accidentally — an options list filtered by an upstream rule until one
survives, a localisation that dropped entries, a configuration where every
choice but one was disabled.

The rule is to **refuse to render it**. Not to render it disabled, not to
render it pre-selected: refuse, and treat the situation as a defect in the
question's configuration. Whatever the surrounding flow needed from that
answer falls back to the safe path — unknown, unverified, human-reviewed —
rather than to a value the candidate never really chose. A degraded intake
that guesses is worse than one that admits it does not know, because the guess
enters the record indistinguishable from a declaration.

State the threshold as a named minimum rather than as a condition buried in a
render branch — "offer this question only when it has at least two genuine
choices" — so the day the option set collapses is a documented, deliberate
fall-through to the default lane rather than an accident nobody notices. The
question that most needs this guard is the fairness-relevant one, because that
is the one whose false declaration does the most damage downstream.

## Self-declared characteristics: optional in fact, not in copy

Diversity monitoring, disability and accommodation questions, veteran status,
and any similar self-declaration follow the same neutrality rules and add
three of their own:

1. **"Prefer not to say" is always present, always styled identically to every
   other option, and is never a value.** It is an
   [absence](../../_laws.md#absence-of-evidence-is-not-evidence), and absence
   is a distinct state — never a zero, never a neutral default, never
   silently mapped to the largest group. A downstream aggregate reports it as
   declined-to-state or reports nothing.
2. **The field is structurally unreachable from any selection path.** Not
   "policy says we don't use it" — actually unreadable by whatever scores,
   ranks, or routes on merit. A promise enforced only by convention is a
   promise that survives exactly until the first person who did not read it.
3. **It is never inferred.** Not from a name, a photograph, a school, a
   language, a career gap, or a model's guess. Where it is absent it stays
   absent, and every ambiguous case
   [resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate):
   the safe path, the unnarrowed option set, no automated action taken on the
   gap.

## When not to apply this

Neutrality is a rule about *decisive* questions and *protected* ones. It is
not a rule against warmth. Encouraging copy elsewhere in the form — the
introduction, progress feedback, the confirmation — is good conversion craft
and costs nothing, because none of it is an answer key. Similarly, a purely
informational question with no consequence (preferred start date, how you
heard about the role) may carry ordinary helpful affordances such as a
sensible default, provided that default is not a claim about the person.

The line: if the answer changes what happens to the candidate, or describes a
protected characteristic, it gets the full discipline. Otherwise, be human.

## Verification

Tonal neutrality is a property that dies in the third redesign, not in code
review, which makes it a natural thing to pin as an executable invariant
rather than a guideline. The invariants worth pinning are narrow enough to
test cheaply: the success colour never appears on a knockout option; no
option cluster in a decisive question renders fewer than two choices;
consequence copy is attached to the question rather than to any single
option. A restyle that violates one of these should fail a build, not survive
until a candidate notices it first.
