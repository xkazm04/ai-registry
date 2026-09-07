# PostHog as the `analytics` connector

What was learned mapping this recipe onto PostHog specifically, for the job of finding
where a page loses people and forming a belief about why. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The funnel step where the drop appears is the step you instrumented, not the step where
people left.** A funnel is built from events, so an uninstrumented interaction is
invisible and everyone who abandoned there is counted as having dropped at the next
recorded step. A hypothesis written from that funnel points at the wrong element, and it
will be disproved for the right reason and the wrong cause. Before writing a hypothesis
from a funnel, check whether the step above it has any instrumentation at all, and treat a
long unrecorded stretch as a reason to instrument rather than a reason to test.

**Replays and heatmaps supply the belief; they never supply the effect size.** This is the
one source in the stack that can tell you what somebody actually did, which is exactly the
input a falsifiable hypothesis needs and the ranked table cannot give. It is also
selection biased in the direction of long, unusual sessions and it recorded whoever the
sampling happened to keep. Use it to say why, use the counts to say how much, and never
let a memorable recording drive a ranking.

**Funnel conversion has several definitions here and they disagree.** Whether steps must
occur in order, whether they must happen in one session, and the length of the conversion
window all change the number, and the setting is per query rather than per project. A
baseline computed under one set and a current reading under another is a definition
changing rather than a page moving. Record the definition alongside the baseline, and
state it in the proposal, since the experiment that follows will be judged on it.

**A page is a set of URLs and the product decides which.** Path handling, query strings
and dynamically routed segments mean one conceptual page splits into many rows or several
pages collapse into one, and the split determines both the traffic figure the sizing
depends on and whether a proposal targets what its author meant. Fix the path grouping
before sizing anything, because sizing an experiment against one twentieth of a page's
real traffic is how an answerable test gets declared unanswerable.

**Feature flags make deploying an accepted proposal cheap, which is a hazard for the
ranking.** Because shipping a variant costs almost nothing here, the queue fills with the
easy changes rather than the valuable ones. The ranking in this recipe has to survive that
pressure: what a test is worth is a property of the page's traffic and its share of the
conversion, not of how quickly the variant could be built.

## What transfers to any product analytics connector

- A funnel's drop-off lands on the instrumented step, not the real one. Check the
  instrumentation above the drop before believing where it is.
- Qualitative sources give the belief and never the effect size; keep them out of the
  ranking.
- Record which funnel definition the baseline used. Ordered, session scoped and windowed
  are different numbers for the same page.
- Fix path grouping before sizing, or a page's traffic is understated and its test looks
  impossible.
- Cheap deployment biases a queue toward easy changes. Rank on value, not on effort.
