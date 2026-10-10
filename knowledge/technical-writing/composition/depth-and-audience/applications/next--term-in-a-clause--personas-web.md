---
layer: application
type: application
subject: depth-and-audience
technique: term-in-a-clause
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A product blog that skips its terms rather than over-defining them

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The witness is the same ten posts as the `article-structure` applications: one static data
file, rendered by the site's own minimal parser, written for a desktop agent product.

## What the ten posts show

A term of art was counted as software, AI, security or DevOps vocabulary that a capable
reader outside the field would not know, once per post. Brand names and the product's own
UI labels were left out. It is a judgment count, and another rater could move it by about
a third.

| Post (genre) | Terms | Clause | Paragraph | Undefined | Analogy |
|---|---|---|---|---|---|
| introducing-personas (announcement) | 10 | 1 | 0 | 9 | 0 |
| self-healing-execution-engine (engineering) | 12 | 5 | 1 | 6 | 0 |
| building-slack-triage-bot (tutorial) | 10 | 1 | 0 | 9 | 0 |
| credential-vault-security (engineering) | 12 | 2 | 0 | 10 | 0 |
| devops-automation-agents (use case) | 12 | 1 | 0 | 11 | 0 |
| email-triage-agent-tutorial (tutorial) | 7 | 1 | 0 | 6 | 0 |
| desktop-first-vs-cloud-agents (engineering) | 8 | 1 | 0 | 7 | 0 |
| multi-agent-pipeline-tutorial (tutorial) | 7 | 2 | 0 | 4 | 1 |
| no-code-ai-agents-for-teams (use case) | 6 | 1 | 0 | 5 | 0 |
| why-local-first-ai-matters (engineering) | 12 | 2 | 1 | 9 | 0 |
| **Total** | **96** | **17** | **2** | **76** | **1** |

The technique was written against the glossary failure: a post that defines everything at
length. This blog shows the opposite failure. 76 of 96 terms (79%) are never defined, and
only two get a paragraph. The paragraph cases are the ones the technique predicts, for
example a 25-word definition that still leaves "cascade failures" undefined,
src/data/blog.ts:101 "The breaker monitors error rates per provider and opens when the threshold is exceeded".

The audience is named nowhere in the data model or the feature doc, only in one title,
src/data/blog.ts:462 "Zero-Code AI Agents for Non-Technical Teams". That post promises
src/data/blog.ts:471 "No Python, no APIs, no terminal commands" and then leaves five of its
six terms bare, including src/data/blog.ts:521 "they take unstructured input from multiple sources".

## Simulation

Mode `simulation`. Policy A is the post as written. Policy B is the technique as revised on
2026-10-10: plain words first, a clause for the terms the reader must carry.

- **Circuit breaker** (engineering post, the reader keeps the term). A is the 25-word
  paragraph above. B is "the circuit breaker, which stops calling a provider once its
  error rate crosses a threshold", 15 words. The ten words saved could carry the actual
  threshold, which the post never states.
- **Unstructured input** (use-case post, the reader does not need the term). A gloss would
  still leave the reader holding vocabulary they will not use. B replaces it: "notes,
  emails and documents in whatever shape they arrive". This is the case the old rule
  missed, because the term is part of the post's argument and was not used once.
- **Pipeline** (tutorial). A defines it three times in one paragraph, two of them by analogy:
  src/data/blog.ts:404 "Think of it like a relay race". B already exists on the same site,
  src/data/blog.ts:57 "One agent's output feeds the next", a clause by consequence.

On all three, B is shorter and leaves the reader with fewer undefined words. That is judgment
on the text. No analytics or dwell time was read.

## The once-only rule is per post

The old procedure said not to define a term twice and to link to the first use. Here that
fails twice. The renderer has no links, as stated in docs/features/content/blog.md:65 "No links, images, nested lists, tables, code fences".
And each post is its own entry point. The OS-keyring storage line recurs in five posts
(for example src/data/blog.ts:148 "stored in your OS keyring"), and only the credential
post explains what a keyring is. Under the revised rule each of the other four owes a
clause, and none owes a second one inside the post.

**Falsifier:** a reader test on these posts in which glossed and replaced versions read no
faster and are understood no better than the originals by readers outside the field. The
copy was not changed. The project's map does not join this bundle, and the posts are the
owner's public copy.
