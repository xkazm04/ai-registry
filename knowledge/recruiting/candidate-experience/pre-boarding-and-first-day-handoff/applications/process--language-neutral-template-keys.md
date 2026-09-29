---
layer: application
type: application
subject: pre-boarding-and-first-day-handoff
technique: language-neutral-template-keys
stack: process
status: forged
verified_on: 2026-09-29
---

# Language-neutral keys — a four-language codebase's cross-cutting contract

This app ships in four languages (en · cs · de · fr) from one codebase, and it has
written the technique's rule down as an architectural contract rather than leaving it
to per-feature judgment: `docs/architecture/localization.md`. What follows is how that
contract realizes the technique, and where its own gate stops. Citations are to the
document's sections, not line numbers: the document has grown to several hundred lines
since the first reading (2026-08-20) and every line cite had drifted.

## English exists in exactly three places, and each is structural

The section "Where English is allowed to exist" enumerates them: the source catalog
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
— the section "API errors: resolve the code, never show the `error`"

`error` is canonical English "for the server log and for API consumers. It is never
the right thing to render." `code` is a stable machine identifier the UI resolves
through the `errors` catalog namespace, in the reader's language. The client seam is
`app/_lib/use-error-message.ts`, exposing `useErrorMessage()` for components, the pure
`resolveErrorMessage(...)` for plain helpers, and an `ErrorMessageResolver` type so a
helper can be threaded rather than turned into a hook.

## Two registries, because a refusal and an accident need opposite treatment

`app/_lib/api-response.ts` holds `REFUSAL_ERRORS` and `jsonRefusal(code, status)`, and
`safeJsonError` for `STORE_ERRORS`. The distinction is argued in the section "Two
registries emit codes, and the distinction matters": a store failure hides its real message (it carries `SQLITE_*`
codes and absolute paths) and is logged; a refusal's *message is the information* — the
intake closed, the offer lapsed, this link isn't yours — and is not logged, because "an
expected outcome is not a fault."

The recorded incident is precisely the technique's coverage trap. Refusals used to
return a bare `{ error }`, so the client had no code to resolve and fell through to a
generic "something went wrong" — *"in all four languages, on public token-authenticated
candidate surfaces where the specific reason is the entire point"* (same section).
Those are the surfaces a new hire holds a link to.

## The coverage gate is a build gate, not a follow-up ticket

`npm run i18n:check` now runs three guards (the section "Three guards, in `npm run
i18n:check`"; the first reading found two):

- a **leak guard** failing on `x.error || …`, `x.error ?? …` and the ternary spelling,
  anywhere under the UI directories — the ternary form added after it "turned out to
  hide 8 live leaks the first pattern could not see";
- **code parity** — every machine code the app can put on the wire must resolve to an
  `errors.<CODE>` message in `en.json`, so "adding a code without its message fails the
  gate rather than degrading quietly". The first reading found a gate that parsed only
  the two registries in `api-response.ts`; it has since become **self-extending**: it
  also sweeps satellite registries (each failing loudly if its file moves) and every
  inline `code: "…"` at a route's emit site, because the ~30 codes declared elsewhere
  "resolved *by luck*" while the narrower gate read green;
- **archetype labels** — the same contract in another namespace: a label map that reads
  like a lookup but falls back to English silently is required to carry a catalog entry
  per id in both namespaces.

That parity check is the technique's rule that a key ships with its catalog entry in
the same change, enforced by CI rather than by review. The document adds a rule for
the transport layer: **a shared client helper never returns a user-facing sentence**;
it returns the code and each caller supplies its own localized fallback (the same
84-call-site trap "wearing a type"). `ERROR_LEAK_ALLOW` is the deliberate exception
list, held to a ceiling (`ERROR_LEAK_ALLOW_MAX`, 7 at this reading) so that appending an
entry without raising the ceiling and giving a reason fails the gate, and the doc
insists that adding to it "is a decision, not a formality."

## The lesson the doc states about its own instrument

The section "The trap this replaced": the leaking pattern was live on **84 call
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
- **Deliberate verbatim detail is still English.** The `ERROR_LEAK_ALLOW`
  discussion names business-rule refusals whose emitters (`app/_lib/pipeline-entry-action.ts` and
  friends) do not yet carry real codes: *"until then the honest state is documented
  English, not a silent generic."* A declared gap, which is the right posture, and
  still a gap on exactly the class of message a stage-move refusal produces.
- **No per-field `labelKey` on stored rows.** Nothing live lets an author's own custom
  row carry translations; the fallback is terminal for it.
