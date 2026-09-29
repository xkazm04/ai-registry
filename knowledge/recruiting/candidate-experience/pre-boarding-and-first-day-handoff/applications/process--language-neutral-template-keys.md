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
contract realizes the technique, and where its own gate stops. Re-read 2026-09-29: the
document has roughly doubled since the first read, so this cites its sections by heading
and only pins the lines that were checked.

## English exists in exactly three places, and each is structural

The section *Where English is allowed to exist* enumerates them: the source catalog
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
— `docs/architecture/localization.md`, *API errors: resolve the code, never show the `error`*

`error` is canonical English "for the server log and for API consumers. It is never
the right thing to render." `code` is a stable machine identifier the UI resolves
through the `errors` catalog namespace, in the reader's language. The client seam is
`app/_lib/use-error-message.ts`: `useErrorMessage()` for components, the pure
`resolveErrorMessage(...)` for plain helpers, an `ErrorMessageResolver` type so a helper
can be threaded rather than turned into a hook, and — new — `capabilityAwareReason`, the
one refusal that carries *data* (a capability-gated 403 names the permission it wanted).
The bound resolver has a stable identity, memoized on the translator, so it is safe in a
dependency array: a formatter whose identity churns is a render loop waiting to happen.

## Two registries, because a refusal and an accident need opposite treatment

`app/_lib/api-response.ts` holds `STORE_ERRORS` (`:42`), `REFUSAL_ERRORS` (`:548`),
`jsonRefusal(code, status)` (`:2073`) and `safeJsonError` (`:2106`). The distinction is
argued in the doc: a store failure hides its real message (it carries `SQLITE_*` codes
and absolute paths) and is logged; a refusal's *message is the information* — the intake
closed, the offer lapsed, this link isn't yours — and is not logged, because "an
expected outcome is not a fault."

The recorded incident is precisely the technique's coverage trap. Refusals used to
return a bare `{ error }`, so the client had no code to resolve and fell through to a
generic "something went wrong" — *"in all four languages, on public token-authenticated
candidate surfaces where the specific reason is the entire point."* Those are the
surfaces a new hire holds a link to.

## The coverage gate is a build gate, not a follow-up ticket

`npm run i18n:check` (`scripts/i18n-check.mjs`) now runs **three** guards, where the first
read found two:

- a **leak guard** failing on `x.error || …`, `x.error ?? …` and the ternary spelling,
  anywhere under the UI directories — the ternary form added after it "turned out to
  hide 8 live leaks the first pattern could not see";
- **code parity**, widened. It first read only `api-response.ts`, so about thirty codes
  declared anywhere else "resolved *by luck*: deleting one of their four catalog entries
  produced a green build and a generic message." It now sweeps three shapes — the two
  central registries, a named list of *satellite* registries (a client-origin transport
  code, a validator's own union, a lone exported constant), and every inline
  `code: "…"` at a route's emit site, tests excluded. The inline sweep is what makes the
  gate self-extending: a new route cannot add an unlocalized code without its copy.
  Each satellite extractor fails loudly if its file moves, on the rule that a scan whose
  scope silently evaporates is worse than none;
- **archetype labels**, the same contract in another namespace: a map of the shared
  registry's English that read like a localized lookup is replaced by a lookup the gate
  checks for a label in two namespaces per id.

That parity check is the technique's rule that a key ships with its catalog entry in the
same change, enforced by CI rather than by review. `ERROR_LEAK_ALLOW` is the deliberate
exception list, and it is now capped (`ERROR_LEAK_ALLOW_MAX`, currently 7): appending a
path without raising the ceiling, with a reason, fails the gate, and so does an entry
that is not on disk. The doc still insists that adding to it "is a decision, not a
formality."

## The lessons the doc states about its own instrument

The leaking pattern was live on **84 call sites across 26 directories**, including areas
where the eslint i18n rule was already at `error` level — because that rule reads JSX text
nodes, so English arriving through a variable is invisible to it. *"The lint level of an
area is not evidence that the area is localized."*

The doc now records the same trap one layer down: a shared fetch helper returning
`{ code, status, message }`, the last field documented as "a last-resort fallback", was
used as the *first* resort by every caller because it was the field always populated. The
field is gone, and the rule is stated: **a shared client helper never returns a
user-facing sentence.** For a template system the equivalent is that the resolver, not
the row reader, is the only place a sentence is composed.

## Where this stops short of the technique

- **The contract covers codes and copy; it does not cover authored template rows.**
  The technique's harder case — a row a recruiter composed, persisted ahead of its
  readers, with a canonical key and an authored fallback — has no live realization in
  this tree. The checklist-and-questionnaire feature that carried it was removed, and
  the doc says so of its presets.
- **The stage-move refusal gap has closed in code and not in the doc.** The first read
  found business-rule refusals in `app/_lib/pipeline-entry-action.ts` still emitting
  documented English. That emitter now answers every refusal with a code
  (`err(status, code, extra)`, `:178–181`, whose comment names the incident: "a lost race
  read English on a Czech board"), yet the doc's *deliberate verbatim detail* bullet and
  the comment in `scripts/i18n-check.mjs:87` still cite "a stage-move refusal" as an
  English exception. A declared gap outlived the fix; the reader who trusts the doc
  would still count that class as unlocalized.
- **No per-field `labelKey` on stored rows.** Nothing live lets an author's own custom
  row carry translations; the fallback is terminal for it.
