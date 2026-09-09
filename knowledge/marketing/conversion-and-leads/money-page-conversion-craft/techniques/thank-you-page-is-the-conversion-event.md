---
layer: technique
type: technique
subject: money-page-conversion-craft
technique: thank-you-page-is-the-conversion-event
status: forged
laws: [platform-reported-is-not-causal, not-measured-is-not-zero, a-gate-before-money-and-copy]
shared_with: []
use_when: [wiring conversion tracking before a form goes live, deciding where a conversion event fires, reviewing why a conversion count is inflated or has silently stopped]
---

# The thank-you page is the conversion event

Every conversion a money page produces - a form fill, a callback request, a
booking - ends on one distinct page, and that page is the only reliable place
a conversion event fires. It is the most-skipped page on a small business's
site and the one everything else depends on: without it, conversion tracking
rests on click and event triggers, which break silently and undercount, and a
site that cannot count its conversions cannot run ads that optimise toward
them.

The technique's core rule: **build the thank-you page first, with tracking
wired, before any form goes live.**

## Why a page load and not a click

A click trigger fires when a button with a given selector is pressed; it
fires whether or not the submission succeeded, and it stops firing the day
someone renames the class. An event trigger depends on a script that may
load late or be blocked. A page load is the one signal every tracker, ad
platform and analytics tool counts the same way, and it fires only when the
visitor actually arrived - which, if the redirect is wired correctly, means
only when the lead actually exists. The count is still the platform's own
attribution of itself and no more causal than any other platform-reported
number, but at least it is a count of real events.

## What the page must have

- A confirmation in the owner's voice, not "Thank you for your submission".
- What happens next, with a time: "a real person calls within thirty minutes
  during business hours". This is the single largest reducer of buyer's
  remorse and no-shows the page can offer, and it is a promise the business
  must then keep - the keeping belongs to `speed-to-lead-and-assisted-reply`.
- The phone number, clickable, for the visitor who would rather not wait.
- The conversion snippets - the ad platform's conversion tag, the analytics
  event, any social pixel - firing on page load, not on a click.
- A no-index directive in the head, and exclusion from the sitemap.
- Where the business sells calls: the booking calendar, embedded here and not
  on the money page, because this is the moment intent peaks and a second
  action here costs the form nothing.

## What it must not have

- Navigation that pulls the visitor back into browsing before the event
  fires.
- A second ask that dilutes the moment - "now follow us" - other than the
  booking calendar above, which is the same intent continued.
- Any way to reach it without converting. An indexed thank-you page is
  reached from search results by people who submitted nothing, and every such
  arrival is a fabricated conversion in the platform's count; the ads then
  optimise toward a lie.

## The hand-off must succeed before the redirect

The form posts to one endpoint; the endpoint forwards the lead to wherever
leads live; only on a successful forward does it redirect to the thank-you
page. Two consequences follow. The count cannot exceed the leads that actually
arrived, because the page is unreachable otherwise. And a lead destination
that is not yet configured returns a plain, visible error rather than
redirecting - the form is never published in that state, because a lead that
vanishes silently is the worst failure a money page has. A form that returns
an error is a bug the owner sees within the hour; a form that says "thank you"
to a lead nobody received is a customer lost without a trace and a conversion
counted that never happened.

## Decision rules

- When phone and form conversions need separate values or separate
  optimisation signals, build a second thank-you page for calls rather than
  overloading one, because two conversion actions with one event cannot be
  told apart afterwards.
- When a conversion count drops to zero, check the redirect and the no-index
  before the ads, because the two most common causes are a broken hand-off
  and a template change that removed the snippet; and record the gap as "not
  measured" for those days, never as zero leads.
- When a conversion count rises with no rise in leads the business can see,
  check whether the page has been indexed or linked from anywhere reachable
  without a form, because a count that outruns the inbox is a leak into the
  page, not a win.
- When a booking calendar is offered, it embeds on this page and the money
  page keeps its one action; the calendar's own identifier is derived from the
  configured booking address rather than typed by hand, so swapping the
  calendar cannot silently break the embed.

## When NOT to use

- For conversions that happen off-site by design - a phone call answered, a
  marketplace order. Those are counted where they happen, and a thank-you
  page cannot see them; the honest read is "call conversions measured by the
  call-tracking layer, not here".
- As a place to sell. A visitor here has converted; every additional ask past
  the calendar and the next-steps line lowers the value of the moment.
- As a page with search value. It has none, and any effort to give it some
  undermines its only job.
