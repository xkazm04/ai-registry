---
layer: technique
type: technique
subject: money-page-conversion-craft
technique: cro-leak-order
status: forged
laws: [label-convention-as-convention, never-invent-proof]
shared_with: []
use_when: [a page receives clicks and produces no leads, running a conversion walkthrough on a drafted money page, deciding which conversion fix to make first]
---

# The leak order

When people click and do not call, book or submit, the page is the problem,
and the practitioner works a fixed list top to bottom rather than redesigning.
Each item is larger than the ones below it, so the order is the technique: fix
the first leak you find, re-read the numbers, then move down. Redesigning
skips the list and usually fixes the fourth leak while leaving the first.

The order is a convention of size. It reflects what conversion practitioners
have found again and again, and this technique is strict about which rungs
have anything more than that behind them - see the footing notes on each.

## The seven rungs

1. **Match the page to the ad.** The page's headline repeats the promise of
   the ad - or the organic title - word for word. A mismatch costs the visitor
   and, on paid traffic, the click price too: the dominant ad platform's own
   documentation lists landing-page relevance as a component of its quality
   signal, and the platform reports that above-average relevance lowers the
   cost per click. *Footing: documented platform behaviour for the price
   effect; the conversion effect is convention with vendor case studies.*
   One landing page per ad group exists for exactly this reason.
2. **One call to action above the fold.** A single visible action before any
   scrolling: call on a phone, a short form on a desktop. Not three options,
   not a navigation bar of exits. Repeat the same action after every proof
   block. *Footing: convention; no controlled test found.*
3. **Load fast on a phone over a mobile connection.** Compress images, remove
   unused scripts, no pop-ups. Test on a real phone on cellular, never on the
   office network, and never on a development server, which scores far below
   the deployed build. *Footing: the direction is well supported by
   observational data; the slopes are not portable. The "seven percent per
   second" figure traces to a single retailer study from 2006 and has been
   repeated since; the "half of mobile visits abandoned by three seconds"
   figure is the search engine's own 2016 research; "under two seconds" is a
   convention.*
4. **Design the phone version first.** Most local-service clicks are phones.
   Thumb-reachable call button, form fields large enough to tap, a click-to-
   call number in the header, no horizontal scroll. The desktop layout is the
   adaptation. *Footing: convention, with the device split as its evidence.*
5. **Stack proof where doubt happens.** Stars with the exact count beside the
   call to action, because doubt peaks at the moment of action; real photos
   of the team and the work; licence and insurance in the hero; the guarantee
   restated next to the form. Every item real and confirmed by the owner.
   *Footing: convention; the proof law is the constraint, not the placement.*
6. **Cut the form down.** Three or four fields - name, phone, what do you
   need. Button text says the outcome, never "Submit". *Footing:
   vendor-published observational data over tens of thousands of pages found
   three-field forms converting best, and one vendor-run test found five
   fields beating seven beating ten; none published intervals or controlled
   for page type. Correlational support for a convention.*
7. **Kill the remaining friction.** Answer the three objections - price,
   timing, guarantee - in the questions section; state the service area so
   the wrong visitor self-selects out; delete every sentence without a
   specific in it. *Footing: convention.*

## Procedure

1. Confirm the quadrant first: many clicks, few conversions. If the numbers
   say otherwise, this list is the wrong tool - see the diagnostic quadrant.
2. Walk the rungs in order against the live page on a phone. Quote the page
   where a rung is satisfied; write the specific defect where it is not.
3. Fix the highest unsatisfied rung. One rung, then re-measure over a
   weekday-balanced window long enough to read; `landing-page-experiment-
   statistics` says how long, and the honest answer for a small business is
   often "weeks".
4. Only when rung one through seven are satisfied and the page still leaks
   does the deep discipline start - experiments, heat maps, session
   recordings. The list is the eighty-twenty that fixes most pages without
   tooling; it is not the whole of conversion work.

## Decision rules

- When the ad and the page disagree, fix that before touching anything
  lower, because every lower fix is measured on visitors who already left.
- When the form asks for something the business will not use in the first
  call, remove the field; each field is a cost paid by every visitor for a
  benefit the business has not proven it needs.
- When a rung's fix would change body copy a person approved, the fix is a
  recommendation to the owner, not an edit - a walkthrough changes the
  mechanical layer and proposes the rest.
- When a number is quoted to justify a rung, its source class is quoted with
  it; a rung defended with "studies show" and no study is a rung defended
  with folklore.

## When NOT to use

- When the conversion rate is fine and the leads are junk. That is a source
  problem; working this list makes a page that converts more of the wrong
  people.
- When clicks are few. The page is not the leak; the title, the bids or the
  volume are.
- When the page is an experiment arm mid-test. Changing a rung mid-test
  invalidates the trial; wait for the verdict.
- When the "page" is a hub or index. A hub has no form to leak from.
