---
layer: application
type: application
subject: application-intake-and-conversion
technique: tonally-neutral-eligibility-questions
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
---

# The knockout controls and the one-option refusal (React)

Two independent realizations of the same rule live in this codebase: a styling
invariant on the conversational door's knockout buttons, and a configuration
threshold that refuses to render a question with a single answer.

## The success tone is reserved for outcomes

`app/apply/[id]/ApplyStepControls.tsx:68` branches on `step.type === "ko"` and
renders two buttons with *identical* class strings (`:80`, `:88`), both composed
from the shared secondary recipe, whose hover is the neutral coral
(`app/_components/ui/recipes.ts:163`). The comment above the first one is the
incident and the rule together (`:74-79`):

> NEUTRAL hover, deliberately the same coral affordance as No (and as the
> choice/quick-form buttons). Yes used to glow moss — the success tone — which
> on a KNOCKOUT question told the candidate which answer "passes" the
> eligibility gate before they answered it. moss stays reserved for OUTCOMES
> (the "You're in" card), never for steering an answer.

Two things generalize out of this. First, the fix was not "make Yes neutral"
but "the success token belongs to outcomes" — a positive rule about where the
token *does* live, which is what makes it survivable across restyles. Second,
the neutral affordance is deliberately the same one the non-decisive controls
use, so the knockout question is visually indistinguishable from an ordinary
choice; neutrality here is achieved by *reusing* the ordinary style rather
than by inventing a special one.

## The invariant is pinned as a test, because tone dies in a restyle

`app/apply/[id]/candidate-door-conversion.test.ts:32-53` isolates the knockout
branch by slicing the source between `step.type === "ko"` and the next branch,
then asserts two things: that the branch composes the shared secondary recipe
exactly twice (`:39`), and that no `className` in that block matches `moss`:

```ts
assert.doesNotMatch(
  cls,
  /moss/,
  "moss (the success tone) must not style a KO answer — it tells the candidate which answer passes the gate"
);
```

The test reads only the rendered `className` values, "the block's prose
deliberately explains the moss ban" (`:43`) — so the comment documenting the
rule cannot itself trip the assertion. That is the practical shape of pinning
a tonal invariant in a codebase with no DOM renderer in its unit runner: match
on the class strings, scope the slice to the branch, and let the explanation
live in prose the matcher does not see.

The same file also pins the honeypot's survival across restyles (`:186-193` for the quick form, a fuller pin at `:195` for the chat) —
`company_url` still posted, `aria-hidden="true"` still present — which is the
neighbouring technique's invariant sitting in the same guard file for the same
reason.

## A one-option question is not rendered at all

`app/_lib/apply.ts` builds the candidate-facing script. The archetype
self-declaration — the fairness-relevant question, since a declaration lifts
archetype detection "from heuristic-only (~0.4) to declared (0.9)" (`:40`)
— is gated behind a named minimum rather than an inline condition:

```ts
const MIN_ARCHETYPE_OPTIONS_TO_OFFER = 2;
```
(`:58`, guarding the push at `:156`)

Its decision comment states the standard's rule almost verbatim (`:51-57`):

> a single option is NOT offered — a one-choice "question" is a non-question
> that adds intake friction and erodes trust without adding routing signal …
> The fairness-critical question appears only when there is a genuine choice to
> declare. If the registry ever collapses to one applyLabel, every applicant
> intentionally falls to heuristic auto routing.

The fall-through is the safe path, not a guess, and the tree had to learn what
*safe* means. On 2026-08-20 this application quoted `FALLBACK_ARCHETYPE = "bau"`
as "the neutral, non-shielded baseline". A day later it became `"unknown"`
(`:73`). In the tree's words, `bau` "was never the neutral choice it looked
like: it is a CONCRETE class", and persisting it on a record that asserts
nothing "strips the early-career fairness shield ... and applies the seniority
KO floor" (`:59-72`). The most common class is not a neutral default; a sentinel that
asserts nothing is, which is the technique's "never silently mapped to the
largest group". The degraded entry is still flagged for manual capture.
`stepConditionMet` in `app/_lib/apply-intake.ts:162` completes the pattern: a
`notOneOf` condition is met when the referenced answer is *absent*, "so a flow
whose branching question was never offered … degrades to the default lane
instead of asking nothing".

What the self-declaration then feeds — the routing and the fairness shielding
— belongs to the archetype-routing subject; what this application shows is the
intake half: neutral collection, no coerced declaration, and a safe default
when the question could not honestly be asked.

## The verification lever is not used

The knockout prompts (`app/_lib/apply.ts:241-261`, copy in `messages/en.json:2383-2387`)
carry no stakes line and never say an answer will be checked. Two of the three
are worded as preferences rather than checkable facts: work mode ("Does that
work for you?") and language ("Are you comfortable with that?"). Only work
authorisation is a fact that a later check will actually test. The technique
now says neutral styling removes the answer key but does not make a
declaration true, and that checkable wording plus a stated check is the
measured lever. The styling half is done here; the wording half is not.
The tree already holds the instrument for a wording A/B: per-gate declines
are audited as `ko_declined` events and passes are recorded per gate on the
entry.
