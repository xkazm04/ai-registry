---
layer: application
type: application
subject: application-intake-and-conversion
technique: eligibility-gate-versus-bot-defence
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
---

# Two doors, one honeypot, and a third-party gate that reads silence right (Node route handlers)

The conversational apply (`app/api/apply/[id]/route.ts`) and the quick form
(`app/api/apply/[id]/quick/route.ts`) share one decoy field. The inbound
channels share one knockout parser. The tree gets the hard half of this
technique right: silence means different things on different surfaces. It
gets the decoy's failure direction wrong.

## Whose surface decides what silence means

Our own doors are strict. `failedKoStepIds` (`app/_lib/apply-intake.ts:143`)
treats an absent answer as a fail at the trust boundary, and each form
guarantees completeness before it posts.

Third-party payloads are read provided-only, in `extractLead`
(`app/_lib/lead-payload.ts:208-220`):

- an absent answer is pushed to `ungatedKoIds` and skipped;
- an unreadable one lands there too;
- only an answer in the `NEGATIVE` set fails.

The ungated gates are named on the filed stub for the recruiter
(`app/_lib/lead-intake.ts:167`). They are never recorded as passed
(`app/_lib/inbound-lead.ts:148`), so the enrichment walk asks them again.
This is rule 4 of the technique in both halves.

## Passive signals, cheapest first

- **Rate limits** per (job, IP): 20 a minute on the conversational door
  (`route.ts:77`, `:151`) and 30 on the quick form (`quick/route.ts:45`,
  `:54`).
- **A decoy field.** `isHoneypotFilled` (`apply-intake.ts:37`) says "The KO
  gate filters ineligible HUMANS, not bots" (`:34`). Both doors check it
  before any write (`route.ts:207`, `quick/route.ts:93`), and
  `app/api/apply/apply-intake-scope.test.ts:37` pins that ordering.
- **No timing floor and no interactive challenge.**

The decoy's construction mostly matches the technique (`QuickApplyForm.tsx:277-288`,
`ConversationalApply.tsx:441-452`):

- a real `type="text"` input, not a natively hidden one;
- off-screen by an inline style on its wrapper (`position: absolute; left:
  -9999px`), not by a theme class a restyle can drop;
- `aria-hidden="true"` on the wrapper and `tabIndex={-1}` on the input, so the
  accessibility-tree removal does not hide a focusable element.

## Deviations

- **A trip is answered with the eligibility decline.** Both doors return
  `{ result: "declined", message: t("declinedMessage") }`. The message
  (`messages/en.json:2332`) reads "Based on your answers this role isn't the
  right fit right now". The reason is stated at `quick/route.ts:89-92`: so a
  bot "can't distinguish the honeypot from an ordinary KO rejection". That
  hides the trap from a script, and tells a human who tripped it that they do
  not qualify. It is the one message rule 1 now names as off-limits.
  `apply-intake-scope.test.ts:41` pins the `declined` result.
- **The field is named and labelled like a real one.** `name="company_url"`,
  id `qa-company-url`, and a label reading "Company URL (leave this field
  empty)" (`en.json:2349`). "Company" and "URL" are what autofill heuristics
  classify on, and the `autoComplete="off"` the input carries is not a
  control. This is an inference from the technique's research; no browser was
  driven against the form.
- **A trip loops.** The quick form's "Try again" is `setDone(null)`
  (`QuickApplyForm.tsx:207`), which keeps `companyUrl`. The conversational
  restart does not clear it either. A person whose browser filled it gets the
  same decline on every retry.
- **A trip leaves no trace.** Both doors return before any event, counter or
  log line. The technique's rate check ("tripped at a rate far above your
  expected junk volume") has nothing to read.
- **The quick form's pin is partial.** `candidate-door-conversion.test.ts:186-193`
  asserts only `company_url` and `aria-hidden`. The conversational pin (`:195`)
  asserts four properties. Neither pins the off-screen style, which is the
  property a restyle removes.

## Inbound liveness

Every authenticated inbound POST stamps the channel's last-seen time before
the payload is judged (`app/api/channels/inbound/[token]/route.ts:77-92`;
`app/_lib/db/channels.ts:166-189`). A mis-mapped integration failing on every
submission therefore reads as live-and-failing, not as never connected. Calls
that are rate-limited, unknown or revoked are not stamped, and that boundary
is stated in the code.
