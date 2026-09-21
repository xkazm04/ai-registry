---
layer: technique
type: technique
subject: business-profile-and-citations
technique: nap-byte-identical-citations
status: forged
laws: [label-convention-as-convention, never-invent-proof]
shared_with: []
use_when: [building directory citations for a business, auditing citation consistency, choosing the phone number a business will publish, adding a location]
---

# NAP byte-identical across citations

A citation is the business's name, address and phone (NAP) on a third-party directory.
The engine cross-references citations to confirm that the business is real and is where
its profile says it is, and it does so by string comparison, through data aggregators
that treat every variant as a different entity. "Suite 4" and "Ste. 4" are two
businesses; so are two formats of one phone number, a name with and without its legal
suffix, and a website with and without its leading subdomain. The rule is
byte-identical, not "close enough", and it is documented aggregator behaviour rather
than convention.

## Lock the format first

Before the first listing is submitted, one master record is written and never
deviated from:

- **Name** - exact spelling, exact suffix or none, the name on the sign.
- **Address** - one abbreviation style for street, suite and unit, chosen once.
- **Phone** - one punctuation format, chosen once. The number is the one on the
  profile and the website; a business that wants a tracking number on its profile is
  choosing to redo every citation later, and is told so before it chooses.
- **Website** - one canonical form, with or without the subdomain, matching what the
  site itself redirects to.

The phone is the first decision in the whole subject, because it is the hardest to
change: everything else on a profile is edited in a dashboard, but a changed number
means re-submitting every citation and waiting for every aggregator to re-sync.

## Which citations matter

A few dozen consistent listings on the directories that feed the aggregators and the
directories the industry actually uses outweigh hundreds of listings on sites no
customer visits. The counts practitioners quote - thirty to fifty listings, a few hours
per tier, a quarterly re-check - are convention and are labelled here as such; the
tiering is the craft:

1. **The universal tier.** The engine's own profile, the second engine's places
   listing, the mobile-platform map listing, the dominant review directory, the
   dominant social network's business page, and the handful of directories the
   aggregators read from. Every business in every country, first.
2. **The authority tier.** The consumer-protection bureau, the local chamber, the
   neighbourhood network, the secondary map provider.
3. **The aggregators.** The three or four data feeds the long tail of directories
   pull from; one submission each propagates to dozens of sites, which is why
   skipping them is the expensive mistake.
4. **The industry tier.** Three to five directories the business's customers actually
   consult - the medical, legal, home-services or hospitality directories of the
   market. Researched live per niche, because the set differs by country and changes.

Never buy "a thousand citations" from a bulk seller: they submit to junk sites, dilute
the signal and can trigger a manual review. Never submit to hundreds of random
directories for the same reason.

## Procedure

1. Write the master record. Get the owner to confirm each field character by
   character against the sign, the invoice and the website.
2. Submit the universal tier, then the aggregators, then authority and industry.
3. Record each listing: directory, URL of the listing, date, the NAP as submitted.
4. Quarterly: search the business name plus city and read the first two pages;
   check the top listings for drift; remove duplicates the engine may penalize; add
   any new location to every directory; update seasonal hours.
5. Report every variant found and where it lives. A consistency audit that says
   "mostly consistent" has not run.

## Decision rules

- When an existing directory listing carries a variant, correct it rather than adding
  a second listing, because duplicates are penalized and a stale variant persists.
- When a directory refuses the master format (a field that will not take a suite
  line, a phone mask that forces punctuation), record the forced variant beside the
  listing and choose the master format that the most directories accept - a master
  format the majority of directories cannot hold is the wrong master.
- When a business changes address or phone, the citation campaign restarts and the
  old NAP is chased down on every recorded listing, because an aggregator that still
  holds the old record will "correct" the new one.
- When counting citations for a report, count only the listings whose NAP was read
  and matched; a directory that "probably has us" is not measured.

## When NOT to use

- A business with no physical presence and no local service area has no NAP to echo;
  citations are a local-entity mechanism.
- Citation count is not a ranking lever to push past consistency: once the tiers are
  covered and consistent, more listings buy nothing, and the effort belongs on reviews
  and the pages, which other subjects own.
- Do not run a citation campaign before the profile's own NAP is final; the profile is
  the master and the citations are its echoes, never the reverse.
