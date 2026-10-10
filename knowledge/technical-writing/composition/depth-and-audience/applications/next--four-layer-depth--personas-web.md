---
layer: application
type: application
subject: depth-and-audience
technique: four-layer-depth
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# Four rungs on a product blog: the coda is not the position, and tutorials keep their limits

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The posts run from 235 to 528 words, about two screens or less.

## The rungs in the seven argued posts

Rung judgments are the reviewer's, with one quote per rung found.

| Post | Mechanism | Consequence | Limits | Position |
|---|---|---|---|---|
| introducing-personas | thin | yes | yes | none |
| self-healing-execution-engine | yes | yes | none | none |
| credential-vault-security | thin | yes | none | yes |
| devops-automation-agents | weak | yes | none | none |
| desktop-first-vs-cloud-agents | thin | yes | yes | yes |
| no-code-ai-agents-for-teams | weak | yes | none | none |
| why-local-first-ai-matters | yes | yes | yes | yes |

Only one post climbs all four rungs. The mechanism rung is the common gap, and the
consequence rung is the one every post reaches. That fits a product blog, because
consequence is the product's argument. The position quotes are
src/data/blog.ts:181 "your secrets are on someone else's computer",
src/data/blog.ts:339 "Neither is universally better" and
src/data/blog.ts:582 "Local-first isn't dogma".

## A coda is not the rung

By the reviewer's count, six of the ten posts end on a local-first or privacy line, for
example src/data/blog.ts:328 "you get the automation without the privacy tradeoff".
That is the subject's "philosophy as a coda" failure built into the genre. It restates the
publisher's advantage and argues nothing the post has shown. Under the old ladder a reviewer
could tick the position rung for these closes. The revised decision rule refuses it, and the
table above counts only positions the post argues.

## Tutorials keep the limits rung

The technique excluded tutorials. The three tutorials here show the exclusion is half right.
Philosophy would be noise, but a limit the reader acts on is missing in two of them.

- **Slack tutorial.** It ends src/data/blog.ts:160 "Your triage bot is now running locally, 24/7".
  The same blog says elsewhere src/data/blog.ts:584 "if your machine sleeps, scheduled agents pause".
  The reader learns this in use.
- **Pipeline tutorial.** It branches on src/data/blog.ts:450 "if the confidence score is below 70%"
  and never says where the score comes from. The reader cannot tell whether 70% means
  anything.
- **Email tutorial**, the positive case. It states its limit inside the step,
  src/data/blog.ts:306 "The agent only reads messages. It won't send anything unless you add write permission",
  in one sentence, without breaking the flow. It still schedules src/data/blog.ts:312 "Run every 15 minutes during work hours"
  with no word about sleep.

Mode `simulation`. Policy A is the old exclusion: no ladder in tutorials. Policy B keeps the
limits rung as a caveat on the action. On the three cases, A leaves two action-changing limits
unstated, and B adds one sentence to each. The email tutorial shows that the B form fits the
genre. **Falsifier:** a tutorial completion test in which the added caveat lowers completion
without reducing setup failures later.

## Position early: not measurable here

The revised step 4 asks a post longer than about two screens to state its position near the
opening. On this blog two of the three positions already sit early (7% and 26% of the post's
words), and one sits late (82%, why-local-first). Every post is about two screens or less,
where the scroll-decay evidence predicts little loss. So the condition was neither confirmed
nor refuted on this witness, and the applied row records it as `unmeasurable`.

The copy was not changed. The project's map does not join this bundle, and the posts are the
owner's public copy.
