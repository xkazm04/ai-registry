---
layer: application
type: application
subject: pre-boarding-and-first-day-handoff
technique: language-neutral-template-keys
stack: process
status: forged
verified_on: 2026-08-20
---

# Language-neutral keys — a four-language codebase's cross-cutting contract

This app ships in four languages (en · cs · de · fr) from one codebase, and it has
written the technique's rule down as an architectural contract rather than leaving it
to per-feature judgment: `docs/architecture/localization.md`. What follows is how that
contract realizes the technique, and where its own gate stops.

## English exists in exactly three places, and each is structural

`docs/architecture/localization.md:11–24` enumerates them: the source catalog
(`messages/en.json`), server-side canonical strings written for the log and for API
consumers (`STORE_ERRORS` in `app/_lib/api-response.ts`, thrown `Error` messages,
`console.error` detail), and named constants that are deliberately not copy — a brand
name, a mockup figure, a technology name, held as a constant so the lint can tell them
apart. *"Anything else that a user can read goes through `useTranslations()`."*

That third category is the technique's proper-noun exception, made mechanical: a
constant, not a judgment call at each site.

## Store a code; resolve it in front of the reader

The contract's core move is the technique's move — persist a reference, compose the
sentence at render time — applied to failure states:

```ts
return safeJsonError(err, "api:jds", "JD_SAVE_FAILED");
// → { error: "Could not save the JD. Please try again.", code: "JD_SAVE_FAILED" }
```
— `docs/architecture/localization.md:30–33`

`error` is canonical English "for the server log and for API consumers. It is never
the right thing to render." `code` is a stable machine identifier the UI resolves
through the `errors` catalog namespace, in the reader's language
(`localization.md:35–38`). The client seam is `app/_lib/use-error-message.ts`, exposing
`useErrorMessage()` for components, the pure `resolveErrorMessage(...)` for plain
helpers, and an `ErrorMessageResolver` type so a helper can be threaded rather than
turned into a hook (`localization.md:60–66`).

## Two registries, because a refusal and an accident need opposite treatment

`app/_lib/api-response.ts:167–193` holds `REFUSAL_ERRORS` and `jsonRefusal(code, status)`;
`:195` holds `safeJsonError` for `STORE_ERRORS`. The distinction is argued at
`localization.md:40–52`: a store failure hides its real message (it carries `SQLITE_*`
codes and absolute paths) and is logged; a refusal's *message is the information* — the
intake closed, the offer lapsed, this link isn't yours — and is not logged, because "an
expected outcome is not a fault."

The recorded incident is precisely the technique's coverage trap. Refusals used to
return a bare `{ error }`, so the client had no code to resolve and fell through to a
generic "something went wrong" — *"in all four languages, on public token-authenticated
candidate surfaces where the specific reason is the entire point"* (`localization.md:47–52`).
Those are the surfaces a new hire holds a link to.

## The coverage gate is a build gate, not a follow-up ticket

`npm run i18n:check` runs two guards (`localization.md:87–99`):

- a **leak guard** failing on `x.error || …`, `x.error ?? …` and the ternary spelling,
  anywhere under the UI directories — the ternary form added after it "turned out to
  hide 8 live leaks the first pattern could not see";
- **code parity** — every code in *both* registries must have an `errors.<CODE>`
  message in `en.json`, checked by parsing the registries out of `api-response.ts`, so
  "adding a code without its message fails the gate rather than degrading quietly."

That parity check is the technique's rule that a key ships with its catalog entry in
the same change, enforced by CI rather than by review. `ERROR_LEAK_ALLOW`
(`localization.md:101–114`) is the deliberate exception list, and the doc insists that
adding to it "is a decision, not a formality."

## The lesson the doc states about its own instrument

`docs/architecture/localization.md:82–85`: the leaking pattern was live on **84 call
sites across 26 directories**, including areas where the eslint i18n rule was already
at `error` level — because that rule reads JSX text nodes, so English arriving through a
variable is invisible to it. *"The lint level of an area is not evidence that the area
is localized."*

This is the technique's coverage trap generalized: a mechanism that is correct and a
claim of coverage that is not are compatible states, and the claim is what stops anyone
looking.

## Where this stops short of the technique

- **The contract covers codes and copy; it does not cover authored template rows.**
  The technique's harder case — a row a recruiter composed, persisted ahead of its
  readers, with a canonical key and an authored fallback — has no live realization in
  this tree. The checklist-and-questionnaire feature that carried it was removed.
- **Deliberate verbatim detail is still English.** `localization.md:106–111` names
  business-rule refusals whose emitters (`app/_lib/pipeline-entry-action.ts` and
  friends) do not yet carry real codes: *"until then the honest state is documented
  English, not a silent generic."* A declared gap, which is the right posture, and
  still a gap on exactly the class of message a stage-move refusal produces.
- **No per-field `labelKey` on stored rows.** Nothing live lets an author's own custom
  row carry translations; the fallback is terminal for it.
