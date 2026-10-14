---
layer: application
type: application
subject: business-profile-and-citations
technique: nap-byte-identical-citations
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@2026.10.14
applied: simulation
ab_verdict: unmeasurable
---

# A dashboard whose own comments refuse to invent a NAP record

A Czech marketing dashboard for local and service businesses (master at `2afda110`,
2026-10-14) was searched for the place where a business's name, address and phone are
held or echoed to a third party. The seam hunt was chosen to falsify the technique's
premise that a master NAP record exists: if the tree held the business name, address or
phone in more than one place, the byte-identical rule would have a decision to govern.

## What A and B were

A is the tree as it stands; B is the tree under the technique. No product change was
made, because there is nothing to make byte-identical.

## What the tree shows

1. **No NAP data model.** Three separate files state it in their own header comments:
   the local landing page component, the local-page generation tool and the JSON-LD
   builder all say the project has no address field and no phone, and that inventing
   one for a public page would be fabrication. The structured-data builder omits
   `address`, `telephone` and hours for the same reason.
2. **No citation submission.** The tree has no directory or aggregator step; the profile
   path is import-only, so nothing publishes a name, address or phone anywhere.
3. **Phone and address fields that exist are about contacts**, the business's customers
   in the CRM and the transactional email routes, not the business's own record.

## Verdict

`unmeasurable`, technique held. The tree already behaves as the technique's last
"when NOT to use" bullet requires: it does not run a citation campaign before the
profile's NAP is final, because it has no NAP. Falsifier for a future run: a feature
that stores a business phone or address once for the profile and again for a page,
a feed or a signature. Return condition: when a project grows a business-owned NAP
field. Instrument: a fixture with the same business rendered through the landing page,
the structured data and any export, compared as strings. No floor declared; nothing
changed.
