---
layer: technique
type: technique
subject: business-profile-and-citations
technique: hours-and-attributes-only-when-true
status: forged
laws: [never-invent-proof, label-convention-as-convention]
shared_with: []
use_when: [setting hours on a business profile, deciding whether to tick 24/7, filling the attributes block, reviewing a generated profile spec for guessed fields]
---

# Hours and attributes only when true

Hours and attributes are the cheapest fields on a profile to fill and the ones most
often filled with what the owner wishes were true. Both feed filters, not only
rankings: a profile that reads "closed" at the moment of a search is excluded from
the pack for that search, and an attribute the searcher filters on is an eligibility
switch. That makes an untrue value worse than a blank - it earns an eligibility the
business cannot honour, and the failure arrives as a missed call at two in the morning
and a review that says so.

## Hours

Hours rank near the top of the published 2026 practitioner ranking-factor survey - the
mechanism is the open-at-search filter, and practitioners report visibility degrading
in the final hour before a listed close. The rules:

- Regular hours are the hours somebody answers or the door is open. Never left
  unconfirmed; a profile with no hours is filtered as unknown.
- Twenty-four-hour hours are ticked only when a line is live and answered around the
  clock - a human service or a voice agent that actually books the call. "We would
  answer if it rang" is not twenty-four hours.
- Holiday hours are set each quarter for the closures and changes the business knows
  about, because the engine surfaces "hours may differ" on unconfirmed holidays and
  a wrong "open" on a closed day is a review.
- A business that wants the round-the-clock eligibility without staff acquires an
  answering capability first and ticks the box second, never the other order.

## Attributes as a two-step handshake

The attributes a profile exposes depend on its category, and the platform does not
publish the per-category list anywhere outside the owner's dashboard. A restaurant is
offered outdoor seating and takeaway; a consultancy is offered almost none of that but
is offered identity and payment attributes. There is nothing to scrape and nothing to
verify from outside, so a generated attributes block written in one pass is a guessed
block, and a guessed attribute is worse than none.

1. **Say why, then send them to look.** Explain in one line that attributes are the one
   part of the profile that cannot be researched from outside, then ask the owner to
   open the attributes section and report what is listed.
2. **A verdict on every one.** When the list comes back, give a decision per attribute,
   in the list's own order: on, off, or "only if true", each with a one-line reason.
   Never silence on a row.
3. **Ask the identity questions out loud.** Family-owned, women-owned, veteran-owned
   and the rest are the highest-leverage attributes on the block - a published
   practitioner reading is that they create packs with no competition for the matching
   filtered searches - and nobody volunteers them. An empty identity list is valid only
   after the owner was asked and said no, and then it says so with the date.
4. **Every "off" carries its reason inline.** A bare false is indistinguishable from a
   field nobody looked at, and the owner cannot review a decision they cannot see.
5. **List what they qualify for and have not claimed** as thirty-second wins.

## The claims to label

- The booking link and the "online appointments" attribute are two different things.
  The link is its own field and is what places the book button; the attribute is a
  yes/no descriptor and switching it off removes neither the button nor a booking.
  Say this whenever the attribute is discussed, because "turn off online
  appointments" sounds like "stop taking appointments".
- The claim that "onsite services" or "online appointments" attributes push the
  review section down the profile is practitioner hypothesis with no published test.
  Against it, the platform's own attributes help states that an attribute can make
  the business surface in searches filtered for it. Leave a true attribute on; switch
  it off only when it is untrue or when the owner has run their own before-and-after.
- "Photos above a threshold multiply calls" and "a booking link lifts leads by a
  quarter" are vendor claims without a published sample or control. Recommend
  photos and a booking link on their own merits - a tile without a photo does not
  render, a link answers a customer who will not phone a stranger - and never on the
  multiplier.

## Decision rules

- When the owner wants twenty-four-hour hours and has nobody answering, refuse the
  tick and name the capability that would make it true, because the eligibility
  gained is repaid in missed calls and public reviews.
- When an attribute cannot be verified because the owner is not at the dashboard,
  leave the section marked open with the exact question in it and move on, because an
  honest gap beats a confident invention.
- When a generated spec contains an attributes block the owner never reported, treat
  the block as fabricated and strike it, whatever it contains.

## When NOT to use

- A service-area business with a hidden address is not asked about wheelchair access
  to premises; the row reads "not applicable, address hidden" rather than false.
- Hours on a website's location page and structured data are owned by the page
  subject; this technique governs the profile fields, and the page's stated hours
  must simply match them.
