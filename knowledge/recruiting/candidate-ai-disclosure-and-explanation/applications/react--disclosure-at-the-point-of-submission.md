---
layer: application
type: application
subject: candidate-ai-disclosure-and-explanation
technique: disclosure-at-the-point-of-submission
stack: react
status: forged
---

# The submission-time notice, and the jurisdiction it may assert

`app/_components/AiDisclosure.tsx` renders the candidate-facing note on roughly
eight public surfaces. Its copy is `messages/en.json:1212-1216`, and the body
string carries the four clauses in one paragraph:

> "We use AI to assist screening and interviews, assessing your **skills,
> experience, and fit** for the role. A human reviews and makes every advance,
> offer, and rejection decision; nothing adverse is decided automatically. You
> can ask for a human review at any point."

Automation named, the assessed characteristics enumerated, human decision
asserted, recourse offered. The component's header states the posture the copy
encodes: "AI assists, a human decides, and assessment is on talent/fit."

## The retention number is the enforced one

`showDataConsent` adds `aiDisclosure.dataConsent` — "you agree we may process
your personal data for this role for up to {months} … You can review or request
erasure of your data anytime via the link in our messages" — and the header notes
it is "passed only by the apply surfaces, where submitting IS the consent that's
recorded (`recordEntryConsent`) with a `KP_CONSENT_TTL_DAYS` expiry and a
self-service erasure link." The month count arrives on the same compliance fetch
that carries the regime, "derived server-side from `KP_CONSENT_TTL_DAYS`, so the
consent sentence states the enforced duration instead of a hardcoded '12
months'". That is the rule — read the number the deletion path reads — realised
by making the client incapable of holding its own copy.

## The wrong-law failure, recorded in the file

`AiDisclosure.tsx:24-40` carries a KNOWN GAP comment that is the clearest
statement of the "a legal assertion may never have an optimistic default" rule,
written from the inside after it was violated:

> "It defaults to `eu` until the fetch lands. An earlier revision of this comment
> claimed that means 'there's never a flash of WRONG content'; that is only true
> for an EU workspace. For a us/uk/sg/in/ae workspace the first paint asserts
> 'Assessed under EU equal-treatment directives; …processed under GDPR', which is
> simply the wrong law, and it is the FINAL state whenever the fetch cannot
> resolve."

Two causes are named, both outside the component: `/api/compliance` is absent
from `app/_lib/auth/public-routes.ts`, so on any deployment with an operator
password the proxy `401`s it and no candidate ever receives the real regime; and
`app/api/compliance/route.ts` calls `getActiveRegimeId()` with no workspace id,
answering for the default workspace regardless of whose job the candidate is
looking at. The stated durable fix — "resolve the regime SERVER-side from the
token's workspace and pass it in as a prop; the client fetch cannot know the
tenant" — is the standard's remedy: remove the lookup from the surface that has
no way to fail correctly.

One real hardening already landed here. The fetch at `:52-62` rejects on `!ok`
because "status-blind parsing made a GATED response indistinguishable from a
successful one: the auth proxy answers `{"error":"Unauthorized"}` with 401,
which parses fine, yields no `jurisdiction`, and silently leaves the EU default
standing." An unauthorised response is now a failure rather than an invisible
fallback — necessary, but it converts a silent wrong answer into a retried wrong
answer while `DEFAULT_REGIME_ID` remains the seed.

## Deviation

The standard requires the minimal universally-true statement until the regime
resolves, and *unknown* on failure. This component seeds `DEFAULT_REGIME_ID` and
the file records the choice as deliberate — "the shipped behavior and the
majority tenant". The standard does not move: `aiDisclosure.body` is safe
everywhere and `aiDisclosure.regimeNote` ("Assessed under {framework}; your
personal data is processed under {dataLaw}.") should simply not render until a
regime is known for *this* candidate's workspace.
