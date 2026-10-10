---
layer: application
type: application
subject: voice-and-register
technique: machine-prose-tell-removal
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# Tells on a product blog and guide: one frame repeated, few tails

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The blog is ten posts in src/data/blog.ts, 3,740 words of post prose. The guide is the
topic files under `src/data/guide/content/`.

## What the deterministic pass found in the blog

- **The "not just" frame, twice, as the same opener.** src/data/blog.ts:218 "AI agents aren't just for chatbots."
  and src/data/blog.ts:469 "AI agents aren't just for developers." Two posts open on one
  template. Each is one hit per post; the repetition shows only across the collection.
- **Participial tails.** A regex for a comma and an -ing word near the end returned 5. Two
  are tails, src/data/blog.ts:101 "trip the circuit breaker, preventing cascade failures."
  and src/data/blog.ts:456 "in one prompt, leading to confused outputs and high token costs."
  The other three are gerund lists and a gerund subject.
- **Sign-posts.** One, src/data/blog.ts:120 "In this tutorial, you'll build a Slack bot".
  In a tutorial's first paragraph it states the outcome, which is the job.
- **Significance words.** "Seamlessly" twice, one of them src/data/blog.ts:404 "the baton passes seamlessly."
  None of "crucial role", "highlights the importance", "testament", "game-changer",
  "robust", "leverage" or "unlock" in the posts.

In the guide the frame recurs: 11 lines match "not just" or "isn't just", for example
src/data/guide/content/pipelines.ts:62 "The canvas isn't just visualization". One is a
plain qualifier, src/data/guide/content/agents-prompts.ts:212 "not just consecutive ones".
The word "unlock" appears in its literal sense, src/data/guide/content/credentials.ts:5 "the key that unlocks it".

## Simulation

Policy A is the technique before 2026-10-10. It names the sentence-final participial tail
as the most frequent tell in long drafts, and checks each post. Policy B states the
measured fact (instruction-tuned models use participial clauses at several times the human
rate, with no ranking of tells), adds a collection-level check for repeated templates, and
requires each word-list hit to be read for its sense.

- **Where an editor's time goes.** A sends the editor to tails first. This corpus has 2
  tails and 12 instances of the "not just" frame across blog and guide. B measures before
  ranking, and the frame comes first.
- **The repeated opener.** A flags each "aren't just for" as a false contrast in its own
  post and fixes them one at a time, possibly into the same new template. B flags the
  repetition and asks for two different openings.
- **The literal "unlocks".** A's rule that function decides already clears it. Same
  verdict.

B reorders the work to match the text and catches one collection-level defect A cannot
see. This is judgment on the read text; nothing was changed on the site.

**Falsifier:** a model-drafted corpus where tails outnumber every other tell, which would
make A's priority right for that corpus. The project's map does not join this bundle, so
the seam was not applied.
