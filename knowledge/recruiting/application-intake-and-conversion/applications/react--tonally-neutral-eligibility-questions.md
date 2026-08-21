---
layer: application
type: application
subject: application-intake-and-conversion
technique: tonally-neutral-eligibility-questions
stack: react
status: forged
---

# The knockout controls and the one-option refusal (React)

Two independent realizations of the same rule live in this codebase: a styling
invariant on the conversational door's knockout buttons, and a configuration
threshold that refuses to render a question with a single answer.

## The success tone is reserved for outcomes

`app/apply/[id]/ApplyStepControls.tsx:54` branches on `step.type === "ko"` and
renders two buttons with *identical* class strings (`:66`, `:74`). The comment
above the first one is the incident and the rule together (`:60-65`):

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

`app/apply/[id]/candidate-door-conversion.test.ts:19-40` isolates the knockout
branch by slicing the source between `step.type === "ko"` and the next branch,
then asserts two things: that both buttons carry the same
`hover:border-coral/50`, and that no `className` in that block matches `moss`:

```ts
assert.doesNotMatch(
  cls,
  /moss/,
  "moss (the success tone) must not style a KO answer — it tells the candidate which answer passes the gate"
);
```

The test reads only the rendered `className` values, "the block's prose
deliberately explains the moss ban" (`:30`) — so the comment documenting the
rule cannot itself trip the assertion. That is the practical shape of pinning
a tonal invariant in a codebase with no DOM renderer in its unit runner: match
on the class strings, scope the slice to the branch, and let the explanation
live in prose the matcher does not see.

The same file also pins the honeypot's survival across restyles (`:75-82`) —
`company_url` still posted, `aria-hidden="true"` still present — which is the
neighbouring technique's invariant sitting in the same guard file for the same
reason.

## A one-option question is not rendered at all

`app/_lib/apply.ts` builds the candidate-facing script. The archetype
self-declaration — the fairness-relevant question, since a declaration lifts
archetype detection "from heuristic-only (~0.4) to declared (0.9)" (`:39-42`)
— is gated behind a named minimum rather than an inline condition:

```ts
const MIN_ARCHETYPE_OPTIONS_TO_OFFER = 2;
```
(`:58`, guarding the push at `:151`)

Its decision comment states the standard's rule almost verbatim (`:52-57`):

> a single option is NOT offered — a one-choice "question" is a non-question
> that adds intake friction and erodes trust without adding routing signal …
> The fairness-critical question appears only when there is a genuine choice to
> declare. If the registry ever collapses to one applyLabel, every applicant
> intentionally falls to heuristic auto routing.

The fall-through is the safe path, not a guess: `FALLBACK_ARCHETYPE = "bau"`
(`:68`) is documented as the neutral, non-shielded baseline taken "when intake
fails or yields no archetype: we must not GUESS a fairness-shielded archetype
(student / career_switcher) from a broken intake — that could wrongly grant or
deny shielding", and the degraded entry is flagged for manual capture instead.
`stepConditionMet` in `app/_lib/apply-intake.ts:95` completes the pattern: a
`notOneOf` condition is met when the referenced answer is *absent*, "so a flow
whose branching question was never offered … degrades to the default lane
instead of asking nothing".

What the self-declaration then feeds — the routing and the fairness shielding
— belongs to the archetype-routing subject; what this application shows is the
intake half: neutral collection, no coerced declaration, and a safe default
when the question could not honestly be asked.
