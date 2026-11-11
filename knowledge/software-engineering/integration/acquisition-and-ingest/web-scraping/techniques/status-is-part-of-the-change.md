---
layer: technique
type: technique
subject: web-scraping
technique: status-is-part-of-the-change
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [a poller or watcher decides "changed" by hashing the response body, a watched URL went away and nothing fired, a non-success response is being skipped or hashed as content]
---

# Status is part of the change

A watcher that decides "changed" by comparing a hash of the response body has
defined the observation as the body alone. The status line is not in it. So a
resource that answered 200 and now answers 404 or 410 with an identical-looking
body (an empty object, the same JSON envelope, the same templated page) reads as
**no change**, and the one event a consumer most needed - the thing it watches
is gone, or the endpoint broke - is silent. The opposite slip is the same bug:
an error page's body is hashed as content, so an outage fires "changed" and the
recovery fires it again.

**The observation is (status class, body hash), and a transition in either is a
change.** Store the last status class beside the last body hash and compare
both:

| previous | current | what it is |
| --- | --- | --- |
| success | success, body differs | content change (the ordinary event) |
| success | not-found / gone | the resource left: emit a transition event, even at equal body |
| success | failure (5xx, timeout) | the source is failing: a state the consumer can see, not content |
| failure | success | recovery: compare the body against the last *successful* body, not the error page |
| failure | failure, other code | no event: 502 to 503 to 504 is one state |

**The repair that looks right is the trap.** Skipping every non-success
response - do not update the hash, do not fire, back off - keeps error pages out
of the content hash, and it makes a 200 to 404 permanently invisible: the
watcher keeps the old hash, keeps polling, and never says the thing is gone.
The same holds for a harvest health gate borrowed from
[dedup-and-datasets](./dedup-and-datasets.md): "a suspect fetch never
reconciles" is right for the *content*, and it must not swallow the
*transition*. Keep the last good body separately, and make "left" and "failing"
events of their own rather than "content changed" with an error page as the
payload.

## Measured

Blind A/B on a real URL-polling trigger whose change step hashes only the body
and copies the status into the event payload. Without this technique, and
with either the dataset-reconciliation technique or the shape-change and
status-drift techniques in context, every run found that error pages fire
spurious changes and every run proposed the skip-non-success repair, which
leaves a resource that went 200 to 404 permanently silent (6 of 12 on the
target rubric, both rounds). With it, every run named the equal-body transition
and kept the status class in the comparison (12 of 12). A floor case (a gateway
flapping between 5xx codes) held in both arms: comparing the class, not the
exact code, is already the default reading.

## When not to use this

A watcher whose consumer only acts on content and has its own health check for
the source can keep body-only comparison, provided non-success responses are
excluded from the hash and a separate signal reports that the source stopped
answering. The rule binds where the watcher is the only thing looking.
