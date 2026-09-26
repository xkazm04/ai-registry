---
layer: application
type: application
subject: candidate-ai-disclosure-and-explanation
technique: disclosure-at-the-point-of-submission
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
---

# The submission-time notice, and the jurisdiction it may assert

`app/_components/AiDisclosure.tsx` renders the candidate-facing note on roughly
eight public surfaces. Its copy is the `aiDisclosure` block of `messages/en.json`
(mirrored in cs, de and fr), and the body carries the clauses in one paragraph:

> "We use AI to assist screening and interviews, assessing your **skills,
> experience, and fit** for the role. A rejection is always a person's: no
> setting can hand that decision to the machine. Advancing and offers are
> human-approved by default; a workspace can delegate either one, stage by
> stage, and every step that then runs unattended is logged. You can ask for a
> human review at any point."

Automation named, the assessed characteristics enumerated, recourse offered. The
human-decision clause is sharper than it was on 2026-08-20, when it read "A human
reviews and makes every advance, offer, and rejection decision". The current text
promises only what the pipeline enforces. Rejection is the one decision no
setting can delegate. Advance and offer are human by default and delegable, and a
delegated step is logged. That is the technique's "only promise what the pipeline
enforces", applied by weakening the sentence rather than by closing the path.

## The retention number is the enforced one

`showDataConsent` adds `aiDisclosure.dataConsent`, which states the month count
the deletion path reads. The header ties it to `KP_CONSENT_TTL_DAYS` and to
`recordEntryConsent`, so the sentence states the enforced duration instead of a
hardcoded "12 months". The client cannot hold its own copy of the number.

## The wrong-law gap, closed at the source

On 2026-08-20 this file recorded a KNOWN GAP. The component seeded the EU regime
while a browser fetch of `/api/compliance` was in flight. On any deployment with
an operator password that fetch was refused, and the route answered for the
default workspace rather than the candidate's. A US or UK workspace served the EU
legal claim as its final state.

Commit `7a6e09e2c` (2026-09-08) removed the lookup from the surface that could
not fail correctly, the remedy this file had named. Every public surface now
receives `regimeId` and `retentionMonths` as props, resolved server-side by
`disclosureComplianceFor()` (`app/_lib/compliance-disclosure.ts`) from the
workspace behind the surface's own token or job id. When the props are present
the component opens no connection. `ai-disclosure-props.test.ts` fails if a new
public surface does not pass them. The compliance route stays gated on purpose;
its header explains why. An anonymous request carries no workspace, and a
caller-supplied workspace id would let anyone enumerate any team's legal
posture. "A wrong answer that is also enumerable is worse than the gated one."

## Residual deviations, standard unchanged

**The fallback is still a regime, not the minimal statement.** Precedence runs
from the server prop, to the session fetch, to `DEFAULT_REGIME_ID`, and
`getRegime()` normalises an id this build does not know onto the default
"rather than painting an empty jurisdiction". The component calls the default
"unreachable" on a candidate surface. It is reachable in two ways, both upstream
of the component. `disclosureComplianceFor()` never throws: when the regime store
is locked or corrupt it returns `DEFAULT_REGIME_ID` and logs that the candidate
disclosure "may be the wrong law for this workspace". And a stored regime id newer
than the build normalises onto the default. In both cases a candidate reads the EU
clause, and only the operator's log knows. The standard asks that
`aiDisclosure.regimeNote` not render at all without a known regime. The resolver
already knows when it has fallen back, so it could return "unknown" and let the
note drop.

**The session fetch discloses its failure.** The one caller left on the fetch
path is the recruiter-facing interview simulator. Since `9789b8cc1` (2026-09-22)
a failed load shows "Could not confirm this workspace's rules. Showing the
default disclosure." with a retry. That is honest about the fallback, which the
2026-08-20 version was not, but the default regime still renders beneath it.
It is an operator surface, so the harm is bounded.
