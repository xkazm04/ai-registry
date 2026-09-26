---
layer: application
type: application
subject: candidate-ai-disclosure-and-explanation
technique: right-to-request-a-human-review
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# A review promise carried by a reply-to address

The submission notice ends "You can ask for a human review at any point." The
candidate's decision history repeats it under the list, as `status.decisions.humanReviewNote`:
"You can request a human review of any decision at any time. Just reply to any
message from the hiring team." A comment in `app/status/[token]/StatusClient.tsx`
describes the line as echoing the notice's promise "on the surface where it
matters most".

That is the whole mechanism. It is a contact route, and it meets none of the
technique's four properties:
- The request carries no decision identifier, so the person must describe what
  they contest.
- Nothing routes it to someone with authority to reverse.
- Nothing seals its outcome as a new decision attributed to the reviewer.
- "At any time" is only true while the thread is read.

The tree does have the other half. A human `reinstated` decision is sealed with
its own actor, crosses to the candidate as "Application reinstated after review",
and reverses a screen-wave decline without inheriting the machine's attribution.
The outcome side exists. The request side is an inbox.

## The retention edge, walked on three entry states

The technique now bounds "at any point" by the life of the record. Three states
from the tree's consent lifecycle were walked under the promise as written (A)
and as conditioned (B):
1. **Active consent.** A reply reaches the team and a reinstatement is possible.
   A and B agree.
2. **Consent expired, not yet swept.** The read-time gate (`consentWithholdsPii`)
   already blanks the candidate's decision history, but the operator dossier
   still holds every sealed decision. A promises review; B says tell the person
   when the window closes. The decision to review is still in the building, and
   the candidate cannot see it.
3. **Erased.** `anonymizeEntry` scrubs the entry and nulls the erasure token.
   Nothing about the person remains to reconsider, but the notice they received
   still reads "at any point". A's promise is false here; B's is true.

B is right in two of three states and A in one. The fix is a sentence: state the
retention window beside the review promise, which the notice already knows,
because it states the consent duration in months. Falsifier: a deployment whose
review handling outlives erasure, for example one that keeps a de-identified
decision record reviewers can act on. That would make "any point" true.

Not fixed in the tree. The request mechanism is a product change, not a copy
change.
