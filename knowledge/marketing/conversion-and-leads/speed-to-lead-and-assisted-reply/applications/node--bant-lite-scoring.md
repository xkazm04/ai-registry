---
layer: application
type: application
subject: speed-to-lead-and-assisted-reply
technique: bant-lite-scoring
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Four unknowns, one band function - the speed-to-lead qualification score

The Czech-first marketing workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08) implements the light qualification as one pure module,
`src/lib/speed-lead/qualification.ts`, and the structural fact it proves is that
*unknown* is a typed absent state on every field and the band thresholds exist in
exactly one function.

## The fields and their absent state (`qualification.ts:8-33`)

```ts
export type Timeline = "asap" | "weeks" | "exploring" | "unknown";
export type Budget = "confirmed" | "flexible" | "tight" | "unknown";
export type Scope = "large" | "medium" | "small" | "unknown";
export type Disposition = "hot" | "warm" | "cold" | "unknown";
```

`Scope` is documented at `:12` as standing in for *"Need + Authority"* - the tree made
the same collapse the technique defends. The `Disposition` comment (`:14-18`) is the
technique's rule in the tree's own words: *"unknown is the ABSENT state, not a fourth
opinion: it means nobody has judged this lead yet, which is a different claim from
warm ... the AI reply is grounded on what the rep actually captured."*
`EMPTY_QUALIFICATION` (`:29-34`) starts every field at `unknown`, and `answeredCount`
(`:55-61`) counts the three fields that are not unknown - the second output the
technique asks to be shown beside the score.

## The points, labelled convention (`:36-52`)

```ts
const TIMELINE_POINTS    = { asap: 30, weeks: 20, exploring: 8, unknown: 0 };
const BUDGET_POINTS      = { confirmed: 30, flexible: 18, tight: 6, unknown: 0 };
const SCOPE_POINTS       = { large: 30, medium: 18, small: 8, unknown: 0 };
const DISPOSITION_POINTS = { hot: 10, warm: 0, cold: -10, unknown: 0 };
```

The comment at `:36-37` gives the design intent - *"caps keep any single field from
dominating and the sum is clamped to 0-100"* - and `qualificationScore` (`:45-52`)
is the clamped sum. Unknown contributes zero on every axis, which is the technique's
first decision rule; the values themselves are the shape the technique calls
practitioner convention (three equal-weight fields, a hot band that needs two strong
answers), and nothing in the tree measures them. `test-unit/speed-lead-qualification.test.mjs:23-51`
pins the empty case (score 0, cold, zero answered) and the clamp.

## Disposition versus band, and one threshold function (`:63-95`)

The tree draws the distinction the technique insists on, with the same warning:
`ScoreBand` is declared at `:66` with the comment *"Spelled like a Disposition, but it
is a DIFFERENT thing: a disposition is the rep's gut call, a band is derived from the
score. They shared a type only because they share three words."* `scoreBand`
(`:70-74`) is the single home of the 60/40 edges - *"The one place the band thresholds
live - tone and label both derive from it, so a threshold can never be moved in one and
forgotten in the other"* (`:68-69`). `scoreTone` (`:83-85`) and `scoreLabel`
(`:107-110`), in both locales (`:96-105`), read the band and never the number. Test
`:53-66` asserts the tone and label switch at exactly 40 and 60.

The qualification is handed to the assisted reply as text: `buildTwinReplyPrompt`
(`src/lib/ai/tools/twin-reply.ts`) includes a *"what we already know (qualification)"*
line and switches its closing instruction to *"ask ONLY about what we still do not
know"* when that line is present - the do-not-re-ask rule realised as a prompt branch
rather than an instruction the model may ignore.

## Reconciliation

Confirmed at every point; the tree is a clean realisation of the technique, and two of
its comments were upward lessons the draft adopted: the explicit "unknown is the absent
state, not a fourth opinion" framing, and the disposition-versus-band distinction with
its shared-vocabulary warning. Boundary observed: the two-axis fit-versus-engagement
grade in `src/lib/leads/score.ts` consumes this score as half of its engagement axis
and is `lead-quality-and-source-diagnosis`'s territory, not this subject's. One
deviation: `scoreTone`'s comment says it *"mirrors `scoreTone` in LeadQualityModule
so the two qualification surfaces read the same colours"* - two colour maps kept in
step by convention rather than one imported from the other, which is the kind of
duplicate threshold the one-threshold law exists to catch.
