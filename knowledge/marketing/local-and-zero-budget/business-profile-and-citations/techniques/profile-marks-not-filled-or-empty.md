---
layer: technique
type: technique
subject: business-profile-and-citations
technique: profile-marks-not-filled-or-empty
status: forged
laws: [label-convention-as-convention, never-invent-proof]
shared_with: []
use_when: [auditing a business profile, filling a profile for the first time, deciding whether a product or service entry counts]
---

# Profile marks, not filled-or-empty

A business-profile listing is graded against a number per field, never against
whether the field has something in it. Each field exposes a fixed number of slots, each
slot is a structured claim the engine can match to a query, and an unused slot the
business genuinely qualifies for is ranking surface given away. The audit line reads
"categories: 3 of 10", not "categories: present".

## The marks

The slot counts are documented platform behaviour and they move. The set below is what
the platform exposed in the third quarter of 2026; the procedure's first step is to
confirm each one against the live dashboard, and a report states the date it was
confirmed.

| Field | Mark | Counting rule |
|---|---|---|
| Categories | 1 primary + 9 secondary | A secondary the map-pack rivals all carry and this profile lacks is its own finding |
| Services | no hard cap; a working target of 50, floor of 30 | Predefined services first, then custom ones each with a description; a custom service with no description is a wasted slot |
| Products | working target of 20 | A product counts only with all six sub-fields: name, price or range, description with the keyword in its first sentence, category, link to a live page, photo |
| Service-area localities | 20 | Service-area businesses only; a location business lists one city and the line says "not applicable" rather than scoring 1 of 20 |
| Description | 750 characters, first ~100 shown before the fold | The cut point is quoted from the actual text, with a verdict on what survived above it |
| Service description | 300 characters | Older, longer descriptions survive until edited; warn before touching one |

The services target and floor are practitioner convention, not a platform limit: the
platform does not publish a cap, and one specification this bundle was reconciled
against carried two different numbers for it. Treat "how many services" as "every
distinct job the business delivers, and no more" - the count falls out of the
delivery test, not the other way round.

## Procedure

1. Confirm the marks live. Open the dashboard and read the slot counts and character
   limits as they stand today; record the date.
2. Read the primary category first, on its own line. It is the single highest-leverage
   field, and a primary that differs from what the top three map-pack rivals use is
   reported before anything else in the layer.
3. Sweep the platform's predefined service list for the primary category and take
   every service the business genuinely delivers, before writing a custom one. A
   published 2026 practitioner survey placed predefined services among the largest
   risers in its ranking-factor table; the lift is reported by practitioners as
   landing within days.
4. Count each field against its mark and write `N of mark`. For products, a tile
   missing any sub-field counts as absent - the photo is the tile, the link is the
   destination, and a bare name renders as nothing useful.
5. Grade contents, not only counts. A service named in words nobody searches is a
   filled slot that carries no query; a category the rivals all share is a missing
   slot even if the count reads full.
6. Report every number with its footing: the slot count as documented behaviour with
   its confirmation date, the targets as convention.

## Decision rules

- When a slot is free and the business genuinely qualifies, fill it, because the
  documented suspension trigger is an undelivered entry, not a full list.
- When the honest list is shorter than the mark, hand over the short list and say
  why, because a padded list is the stuffing pattern in a different field.
- When a product lacks a live page to link to, the product waits for the page rather
  than pointing at the homepage, because a product link that answers nothing is a
  dead end and a page built in a hurry to fill the slot is a worse page than none.
- When a description's first hundred characters do not carry the primary service and
  the locality, rewrite the opening before anything else, because that is the only
  part most readers see.
- When generating suggestions for an owner, oversupply the options and label the
  overflow as extras with a one-line "use this if" each, because the owner will reject
  some and an empty slot after a rejection is wasted surface; the extras are held to the
  same delivery test as the main list.

## When NOT to use

- A non-local business - a pure software product, a national publisher, an online
  shop with no physical presence - has no profile to grade, and the audit says so out
  loud rather than silently skipping the layer.
- A single-location shop or clinic is not scored on service-area localities; the
  field is for businesses that travel to the customer.
- Do not use the marks as a ranking forecast. Filling every slot is a precondition for
  appearing, not a promise of position; position is owned by the visibility subject
  and depends on reviews, proximity and the page the profile links to.
