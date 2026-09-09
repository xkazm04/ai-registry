---
layer: golden-path
type: golden-path
subject: business-profile-and-citations
status: forged
use_when: [setting up or auditing a business-profile listing, deciding what to put in a listing's name or service fields, building or re-checking directory citations, judging whether a profile change risks a suspension]
techniques:
  - profile-marks-not-filled-or-empty
  - city-in-query-never-in-name
  - one-entry-per-bookable-service
  - nap-byte-identical-citations
  - hours-and-attributes-only-when-true
  - suspension-risk-checklist
---

# Business profile and citations

A business-profile listing is the one marketing surface a local business does not
host, cannot version, and can lose in an afternoon. It is a record inside the search
engine's own database, rendered above the organic results for every query with local
intent, and it is graded by two different judges at once: a ranking system that rewards
a complete, specific, current record, and a policy system that suspends a record that
claims what the business is not. Every field on the profile answers to both judges, and
the whole craft of this subject is filling each field to the mark the ranking judge
rewards without crossing the line the policy judge enforces.

This subject owns the record itself and its echoes: what "complete" means per field,
which words belong in which field, how the business's name, address and phone are
spelled everywhere they appear, and the checklist that keeps the record alive.
`local-visibility-and-reputation` owns what the record earns - map-pack rank, share of
voice, reviews, reply rates, coverage of the service area - and this subject does not
grade those. `local-page-doorway-prevention` owns the location pages on the website that
a profile's products and services point at; this subject only says that they must be
real and live before anything on the profile links to them. `zero-budget-channel-planning`
decides whether the listing is the first channel to work; this subject assumes that
decision was yes.

## The record is asserted fact, not copy

The naive reading treats a profile like a landing page: a place to persuade, to
repeat the keyword, to claim the widest area and the longest hours. Every one of those
instincts is wrong here, and the reason is structural. A landing page is the business's
own claim on the business's own domain; a profile is a claim inside the engine's index
of the physical world, and the engine treats it as asserted fact - the name on the
storefront, the door a customer can walk to, the number that rings. The engine checks
those facts against everything else it holds about the business: the website, the
directory listings, the reviews, the street imagery, the verification video.
Consistency across those sources is what earns trust; a contradiction anywhere is what
the policy judge reads as deception, and deception is what suspends.

So the principal's posture is that of a registrar, not a copywriter. The name field
holds the real-world name exactly as it appears on the van, the invoice and the sign.
The address is where a customer can be received, or hidden if nobody can be. The hours
are the hours somebody answers. The categories and services are the jobs the business
will actually turn up and do. Nothing on the record is an aspiration, and the one place
a ranking tactic is also a suspension trigger - a keyword in the name - is the place
where the two judges are most obviously reading the same field.

## Complete has a number per field

"Filled or empty" is the audit that misses everything. A profile with one category, six
services and a two-line description is filled, and it is also leaving most of its
ranking surface unused. The listing exposes a fixed set of slots per field - one
primary and a small number of secondary categories, a services list, a products list
with a handful of required sub-fields each, a bounded description, a bounded number of
service-area localities - and each of those slots is a structured claim the engine
matches against queries. A category the business genuinely belongs to and has not
claimed is a query set the profile will never appear for. A service the business sells
that is not on the list is a money term the profile does not carry.

The technique `profile-marks-not-filled-or-empty` sets the marks: the slot count per
field as the platform currently exposes it, the "all sub-fields or it does not count"
rule for products, and the reporting shape - N of the mark, never a tick. Two things
are held apart deliberately. The slot counts are documented platform behaviour and
change with the platform; a bundle that hardcoded them would age within a year, so the
technique names them as the dated half and tells the reader to confirm them against the
live dashboard. The marks are then filled by relevance only: the documented suspension
trigger is not a full list, it is an entry the business does not deliver, and a short
honest list outranks a padded one in both judges' eyes.

The second point most audits miss is that the fields are not equally weighted. The
primary category is the single highest-leverage field on the record; a business in the
wrong primary is competing in the wrong pack regardless of how the rest is filled. The
platform's own curated per-category service list carries more weight than free-text
services - a published 2026 practitioner survey moved "adding the platform's predefined
services" from the bottom of its ranking-factor table to its top quarter, the largest
rise in the report - so the predefined sweep comes before a single custom service is
written. Hours are an eligibility filter, not a ranking nudge: a profile that reads
"closed" at the moment of a search is filtered out of the pack for that search. Order
of work follows weight: category, predefined services, hours, then everything else.

## The city belongs in the query and nowhere near the name

The single most reproduced error in this domain is a city or a service word bolted onto
the business name. It comes from a true observation - the profile name is a strong
ranking input - and a false inference: that the name is therefore a field to optimize.
The name field is the one place where the two judges disagree about direction, and the
policy judge wins, because a suspension takes every ranking and every review with it.

`city-in-query-never-in-name` separates the two uses of the city. When measuring demand
for a service, the city goes into the keyword query, because a keyword-data vendor has
no sub-national targeting and the city is the instrument that isolates local demand.
When naming the service on the profile, the city is dropped, because the profile
already carries the location and a service named "drain cleaning [city]" is
name-field stuffing wearing a different hat. The one place the city may appear is
once, in a natural sentence, in a description; the technique labels that as
practitioner convention, because the platform's guidance does not say it and the
safe reading is "it reads as a sentence, so it is not a keyword string".

## One job, one entry

The services and products lists are the second stuffing surface, subtler than the
name because nothing in the interface stops a business listing the same job in five
phrasings. `one-entry-per-bookable-service` gives the test: not the wording, the job.
Three phrasings of one job is one entry; three genuinely different jobs with different
urgency and price are three entries. Demand decides which phrasing survives and what
order the list runs in, never how many entries exist. The delivery test sits above it:
could a customer book this today, and would the business turn up? A no cuts the entry
whatever its search volume, because an undelivered service is a lie on the engine's
own property and the policy judge reads it as one.

## Citations are echoes of the record, and the echo must be byte-identical

A citation is the business's name, address and phone on a third-party directory. The
engine cross-references citations to decide that the business is real and is where it
says it is, and it does so by string comparison. "Suite 4" and "Ste. 4" are two
different businesses to an aggregator; so are two formats of the same phone number, and
so are the legal name with and without its suffix. `nap-byte-identical-citations`
locks one format before the first listing is submitted, submits to the small set of
directories that feed the aggregators and the ones the industry actually uses, and
re-audits quarterly for drift - because drift is what happens when a directory
"corrects" the record on its own. The counts in that technique - a few dozen consistent
listings beating hundreds of messy ones - are practitioner convention and are labelled
as such; the byte-identity rule is documented aggregator behaviour and is not.

There is a dependency here that decides the order of work. The phone on the profile
must be the phone on the website and on every citation, so choosing it is the first
decision, before any listing exists. Changing the number later means redoing the whole
citation campaign; a business that wants a call-tracking number on its profile is
choosing to redo its citations, and should be told so.

## Only what is true, and a decision on every attribute

Hours and attributes are the third stuffing surface, and the one where the lie is
cheapest to tell and most expensive to have told. A twenty-four-hour listing is worth
having only because the open-at-search filter would otherwise exclude the profile at
two in the morning - and a listing that claims those hours with nobody answering
produces a missed call and a review that says so. `hours-and-attributes-only-when-true`
makes the rule mechanical: tick twenty-four hours only when a line is live and answered
around the clock, keep holiday hours current, and treat attributes as a look-and-tell
handshake, because the set of attributes a profile exposes depends on its category and
is not published anywhere outside the owner's own dashboard. The technique also
refuses the empty attributes block: an unfilled identity attribute is either a
question nobody asked or a decision nobody recorded, and the finished record reads as a
set of decisions with reasons, not a set of blanks.

## The checklist, and the verdict said aloud

Everything above converges on `suspension-risk-checklist`: the short list of conditions
that get a profile suspended, each checked before a record is finalized and each
re-checked whenever the record changes. A keyword-stuffed name; a virtual office, mail
drop or shared address; several profiles at one address; a home business with a visible
address instead of service-area mode; a listing in a city the business does not
operate in; a service area wider than a plausible drive; a burst of edits landing at
once. The list is short because the causes are few; it is re-run because the record
does not stay put - the owner reads a blog post six months later and renames the
profile. So the name verdict is stated every time, in both directions, with the bad
string written out in the business's own name and city, because a person who has seen
the exact string that would suspend them does not type it later.

## What a principal refuses to say

Three claims circulate with a confidence their evidence does not support, and the
bundle labels them rather than repeating them. A photo-count-to-calls multiplier is a
vendor's study of its own customers, without a sample or a control, and is a vendor
claim without sample. A booking-link-to-leads lift is the same. The claim that certain
attributes push the reviews section down the profile is a practitioner hypothesis with
no published test. Each may be true; none may be presented as documented behaviour, and
a generated recommendation that leans on one says which footing it stands on.

Everything in this subject that is a number - a slot count, a character limit, a drive
time, a citation count - is either documented platform behaviour (which changes and must
be confirmed live) or practitioner convention (which is labelled). The invariants that
do not change are the ones the record is built on: the name is the real-world name,
every entry is a delivered job, every echo is byte-identical, and nothing on the record
is claimed because it would rank.
