---
layer: technique
type: technique
subject: local-page-doorway-prevention
technique: funnel-not-city-is-the-doorway-test
status: forged
laws: [label-convention-as-convention]
shared_with: []
use_when: [deciding whether a planned page set is a doorway risk, answering a client who has read that city pages are banned, separating a doorway finding from a scaled-content finding in an audit]
---

# Funnel, not city, is the doorway test

The doorway question is not "are these pages targeted at cities" - it is "do these
pages exist to pass the visitor somewhere more useful than themselves". The dominant
engine's policy said the first thing until March 2015 and has said the second since;
the surviving example names region and city pages *that funnel users to one page*, and
the funnel clause is the operative part. A city page that is itself the useful
destination - the place where the visitor learns what the job costs there, sees it done
there and can act there - is not a doorway however many siblings it has.

## The two policies and their two tests

Run both tests on any templated set, because they fail independently:

| | Doorway abuse | Scaled content abuse |
|---|---|---|
| Question | Do the pages funnel to one destination more useful than themselves? | Are many pages unoriginal and low-value? |
| Volume required | No - two pages qualify | Yes - "many" is definitional |
| Is uniqueness the issue? | No - unique pages can still be doorways | Yes - that is the whole test |
| Does the method of creation matter? | The policy is silent | No - "no matter how it's created"; hand-written counts |

A set of genuinely distinct area pages that all terminate in one central contact form
fails the first test and passes the second. A set of token-swapped clones each with its
own local phone line fails the second and may pass the first. The common case fails
both, and an audit that reports one finding when both apply under-describes the
problem.

## Procedure

1. **Trace the visitor's path from each page.** Where does the primary call to action
   go? If every area page's only exit is one shared form, one shared booking page or
   one shared phone number with nothing area-specific on the page itself, the set
   matches the literal policy example. This is the structural red flag that bites,
   because it is the one the policy actually names.
2. **Ask whether the page is closer to a results page than to a browseable
   hierarchy.** The policy's second example is pages "closer to search results than
   a clearly defined, browseable hierarchy". An area page reachable only from a
   store-locator, a script-loaded list or nowhere at all is that. A page in the
   service hub's "areas we serve" section and in the sitemap is not.
3. **Then, separately, run the uniqueness test** with the similarity measurement -
   and record its finding under scaled content, not doorway.
4. **Write the finding with the test that produced it.** "Doorway: every page funnels
   to one form" and "scaled content: 31 of 40 pages are template clones" are two
   findings with two fixes, and the report says which is which.

## Decision rules

- When a client says "the engine bans city pages", correct the premise: the ban was
  on funnelling, and the city-page sentence was deleted in 2015. Because a plan built
  on the retired definition either forgoes pages that would have ranked or builds
  funnels while believing uniqueness alone protects them.
- When every area page shares one call-to-action destination and carries nothing
  area-specific above it, treat the set as a doorway set regardless of how different
  the body copy is, because the funnel is the offence the policy names and content
  variety does not cure it.
- When a set has real local destinations - an area phone line, an area booking slot,
  an area-specific quote form - and is merely thin, it is a scaled-content problem
  and routes to the rewrite, because consolidating it would delete legitimate pages.
- When a quotation is offered as the engine's position, require a primary source.
  The most-repeated line on this topic - about swapping city names and pictures - has
  none. A technique that rests on an unsourced quotation is a technique that rests on
  folklore ([label convention as convention](../../../_laws.md#label-convention-as-convention)).
- When a set fails neither test, say so in the report rather than flagging healthy
  pages; a finding that fires on every location page trains the reader to ignore it.

## Intent settles the ambiguous cases

The engine's own staff, on the record, have treated genuinely distinct physical
locations as fine ("five hundred landing pages for five hundred shops - these are
unique locations"), called pages that "lead to the same funnel afterwards" doorways,
and said of one-site-per-state structures that whether they violate policy "depends on
whether you are trying to manipulate results". The ambiguous middle is decided by what
the page is for. A page that would still make sense to publish if search engines did
not exist - because customers in that town need that information - is on the right
side of the line. A page that exists only so a query has somewhere to land is not, and
the way to tell is whether its body would survive the removal of the place name.

## When not to use this

Do not use the funnel test as the only gate. Passing it says the set is not a doorway
set; it says nothing about whether the pages will be indexed, which is the economic
question and the one the material gate and the similarity measurement answer.

Do not apply it to a single page. Doorway abuse is a property of a set and a path;
one area page with one form is a landing page. The test starts at two pages that
share a destination.

Do not use it to litigate a manual action. A penalty notice names "thin content with
little or no added value", not "doorway"; the response is content, not an argument
about which policy applied.
