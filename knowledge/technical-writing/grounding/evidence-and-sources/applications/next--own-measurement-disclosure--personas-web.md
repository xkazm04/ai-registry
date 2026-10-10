---
layer: application
type: application
subject: evidence-and-sources
technique: own-measurement-disclosure
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A product blog that cut its unsourced headline figure and kept the one beside it

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The witness is the same ten-post blog as the `numbered-in-page-citations` application.

## What the posts and their history show

23 of the 45 numbers in the bodies are claims about the product itself: timings, recovery
times, connector counts, cost, encryption. None states a method, a sample, a period or a
date. The blog has only ever had one own-measurement frame. A copy commit on 2026-09-14
(`0201e577`) deleted it, and its message calls the sentence unsourced. The commit removed "In our testing, self-healing reduced manual intervention on
agent pipelines by 94%." It kept the next sentence, which is the same kind of claim from
the same unnamed test:
src/data/blog.ts:105 "The median recovery time dropped from".

So the fix took out the striking number and left a median with no sample, no window, no
baseline and now no frame. The reader cannot see that it was ever a measurement.

## Simulation

Mode `simulation`. Policy A is the technique as it stood before 2026-10-10. It covers a
measurement the article can still describe, and says to treat an interactive trial as an
example. Policy B adds the rule for a measurement whose method cannot be recovered: every
number from that run is cut, or the run is repeated with a disclosed method. Cutting the
headline figure and keeping its siblings is not a fix.

- **Recovery time** (src/data/blog.ts:105 "to under 30 seconds."). A has nothing to apply
  without a method. The page reads as compliant, because no "In our testing" sentence is
  left to flag. B flags it as a sibling of the cut figure. Re-measure it (n, window,
  version, date) or cut it.
- **Iteration speed** (src/data/blog.ts:561 "this means 2-3x faster iteration cycles").
  It is either a measurement with no method or a derivation with no inputs. A's
  example-versus-measurement test cannot classify it. B asks for the run, and failing that
  hands it to `inference-labelled-as-inference`: show the latency figures it was derived
  from (src/data/blog.ts:559 "waiting 3-5 seconds per test adds up fast"), which are
  themselves unsourced.
- **Setup time** (src/data/blog.ts:292 "The whole setup takes about five minutes."), also
  promised in the title at src/data/blog.ts:275 "Build an Email Triage Agent in 5 Minutes".
  "About" marks an estimate in the body, and A accepts it. B adds that a figure in a title
  travels without its hedge. Either it was timed, and the run is stated, or the title loses
  the number.

On all three cases B either produces a measurement a reader could repeat or takes the
number off the page. A leaves the 30-second median standing, and makes it harder to find,
because the sentence that showed it was a measurement is gone. This is judgment on the
text. Nothing was re-measured.

## Specifications are a different class

Eight of the 23 product claims are specifications (AES-256-GCM, OS keyring storage, three
resilience layers, connector counts), and four are price terms. Their source is the system
or the owner's decision, and this technique's measurement rules do not apply. The other
eleven are timings and capacities, and they are the class this application is about. How
a specification claim is tied to the code that ships belongs to the `marketing` bundle's
`honest-proof-and-illustrative-data` subject (claims-derived-from-product-code). It was
not tested here.

**Falsifier:** an owner's log for the 2026-09-14 copy pass showing that the 30-second median
came from a separate, documented run, which would make it a disclosure gap rather than a
sibling. The copy was not changed: the project's map does not join this bundle, and the
posts are the owner's public copy.
