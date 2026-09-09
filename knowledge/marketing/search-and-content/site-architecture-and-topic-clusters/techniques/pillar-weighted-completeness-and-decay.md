---
layer: technique
type: technique
subject: site-architecture-and-topic-clusters
technique: pillar-weighted-completeness-and-decay
status: forged
laws: [not-measured-is-not-zero, statistical-honesty-before-a-verdict, label-convention-as-convention]
shared_with: []
use_when: [choosing the next page to write across several clusters, deciding whether to refresh or build, building a content queue that ranks clusters]
---

# Pillar-weighted completeness and decay

A content queue answers one question: what does the next writing hour go to? Two
ledgers answer it together. **Completeness** says how much of each planned cluster is
live, weighted so that a missing pillar counts for more than a missing spoke.
**Decay** says which published pages are losing organic traffic year over year and
therefore compete with new pages for the same hour. A queue that reads only the first
ledger only knows how to add, and the strongest measured wins in this genre come from
pruning, consolidating and refreshing rather than adding.

## Completeness is weighted, and the pillar wins the tie

Count each planned or published page in a cluster with a weight: the pillar at some
multiple of a supporting page - three to one is a common convention and the number is
a convention, chosen so that a cluster with three live supporting pages and no pillar
still reads as incomplete. Completeness is the published weight over the total weight.
A cluster with a pillar and one of four spokes live scores higher than a cluster with
all four spokes and no pillar, which is the point: the pillar carries the topic's
authority and is what every spoke links up to, so until it exists the spokes are
linked to nothing.

The next gap in a cluster is therefore the pillar whenever it is missing, and
otherwise the highest-value planned spoke - by the spoke's own volume where the map
carries it, and by position in the plan where it does not. Across clusters, rank
least-complete first, because that is where the next page changes the most, and break
ties on cluster volume so the bigger opportunity surfaces. A cluster at zero
completeness with a low volume can still outrank a half-built high-volume cluster
under this rule; if that offends the business's priorities, the fix is to weight by
expected value, not to abandon the weighting.

Completeness also carries **link debt**: a published spoke whose link to a published
pillar is missing. This is only meaningful once both pages are live - a planned page
cannot owe a link - and it is a separate count from completeness, because a cluster
can be fully published and fully unwired. Link debt comes from a crawl or a link audit,
never from the plan's own flag, since a flag typed when the plan was made says what
was intended, not what the page does.

## Decay is a threshold on a measured trend, and it says so

A page decays when its organic traffic over a trailing window falls against the same
window a year earlier by more than a threshold. Ten percent down is a common trigger
and a second band around thirty percent down marks the urgent ones; both numbers are
practitioner convention. The comparison itself is bound by
[statistical honesty before a verdict](../../../_laws.md#statistical-honesty-before-a-verdict):
same weekday alignment, equal window length, partial months flagged and never compared,
and a page published inside the prior window has no year-over-year figure at all -
[not measured is not zero](../../../_laws.md#not-measured-is-not-zero), so it is absent
from the decay list, not sitting at the top of it with a fabricated minus one hundred.

Decay has three honest causes and the refresh differs by cause. The results page
changed shape - an answer box or a video block now sits above the page - and the fix is
the passage craft owned by `answer-engine-visibility`, not a rewrite. A competitor
out-covered the page, and the fix is depth on the page's own subtopic plus links from
the cluster. Or demand fell, which no refresh fixes, and the page is a prune candidate.
A refresh queue that does not distinguish these rewrites pages whose traffic left for
reasons the rewrite cannot touch.

## Refresh competes with build

Rank the two ledgers on one scale: the expected traffic recovered by a refresh against
the expected traffic earned by the next gap. Where the map carries volumes, that is
arithmetic; where it does not, the convention is that an urgent decay on a page inside
an incomplete cluster comes first, because the refresh and the cluster's next spoke
reinforce each other, and a decaying page outside any cluster comes last, because it
is the likeliest prune. Refreshed pages re-rank within a few weeks when the body
changes and not at all when only the date changes, so a refresh that touches no
content is not a refresh and does not clear the page from the queue.

## Decision rules

- **When a cluster has no pillar, the pillar is the next page regardless of
  completeness elsewhere,** because spokes without a pillar link to nothing.
- **When two clusters tie on completeness, the higher-volume one goes first,** because
  the same page changes more there.
- **When a page's year-over-year figure cannot be computed, it is absent from the
  decay list,** because a missing prior window is not a decline.
- **When a decaying page sits in no cluster and its demand has fallen, propose a prune
  or a consolidation, awaiting approval,** because deletion is a recommendation and
  the page's links and rankings go with it.
- **When the thresholds have never been checked against a real site, the queue says
  so beside the number,** because a threshold on illustrative data is a placeholder
  with a percent sign.

## When not to use this

Do not run decay on a site under a year old, or on any page younger than the window
plus a year - there is no prior to compare against and the honest output is a blank
column. Do not use completeness on a map with no clusters: five standalones have no
pillar to weight and the queue reduces to volume order. Do not let the completeness
score drive the map's shape - a hub invented so a score can be computed is the forced
pairing the labelling technique forbids. And do not sum the two ledgers into one
number for a dashboard: build and refresh are different actions with different costs,
and a blended score hides which one it is recommending.
