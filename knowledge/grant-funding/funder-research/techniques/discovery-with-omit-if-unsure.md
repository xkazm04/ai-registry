---
layer: technique
type: technique
subject: funder-research
technique: discovery-with-omit-if-unsure
status: forged
laws: [never-fabricate-a-figure, honest-null-over-forced-guess]
shared_with: []
use_when: [writing discovery instructions for a research agent, reducing fabrication in generative search, localizing research across jurisdictions]
---

# Discovery with omit-if-unsure

A generative research agent asked to "find grant programs" will find grant
programs. That sentence is the whole problem: the instrument's failure mode is
not absence but invention, and invention is fluent. The technique is
instruction design that removes the *pressure* to invent — because
fabrication in generative discovery is mostly not malice or noise, it is the
model completing the pattern the request implies. If the request implies "a
list of N programs exists and your job is to produce it," the model will
produce it whether or not it exists.

## The three load-bearing sentences

Every discovery instruction needs, in some form, exactly these commitments:

1. **"Only programs you are confident are real and currently open."**
   Confidence is the admission bar, stated up front. "Currently open" scopes
   the task to the one kind of data that powers action — not past awards, not
   forecasted programs, not "this funder sometimes runs calls like this."
2. **"If unsure about a field, use null. Never invent funders or amounts or
   web addresses. Omit anything you cannot stand behind."** This grants
   permission at *field* granularity and at *row* granularity separately: a
   real program with an unknown deadline is a legitimate row with a null
   deadline, and a program the agent cannot stand behind is legitimately no
   row at all. Web addresses deserve explicit mention because they are the
   most-fabricated field — a plausible address on the funder's real domain,
   pointing at nothing.
3. **"An empty array is a valid answer."** The single highest-leverage
   sentence. Without it, the request's implied contract is "return results,"
   and an agent researching a genuinely empty cell — a niche sector in a
   small jurisdiction — will fill the vacuum. With it, silence becomes a
   first-class outcome, and downstream stages can trust that emptiness means
   "nothing found" rather than "the agent gave up on formatting."

A fourth commitment comes from pre-automation prospect-research practice:
**prefer authoritative funder surfaces as sources.** Aggregator listings and
directories are discovery *leads*; the funder's own page is what a claim of
"real and currently open" can rest on. Where the pipeline knows the
jurisdiction's authoritative source families — a national grants portal, a
foundation register — the instruction should name them as the preference.

## Structured output, localized content

The instruction demands a strict machine-readable structure — a fixed key
set, no prose, no formatting fences — because the validation boundary
downstream can only be strict if the contract is explicit. But structure and
language are separated deliberately: keys stay in one canonical language for
the parser, while titles and summaries are written in the *jurisdiction's*
language, because a translated title breaks the applicant's ability to find
the program on the funder's own surface — and breaks deduplication against
rows other sources loaded. Amounts are plain numbers in the local currency,
never converted: conversion is a presentation concern, and a converted number
stored as if native is a quiet fabrication.

Cap the requested result count explicitly. An uncapped request invites
padding, and padding is where the marginal — least-confident, most-invented —
rows live. A small cap with high confidence per row beats a long list every
time, because every row costs a verification pass and reviewer attention
downstream.

## Decision rules

- When the agent returns exactly the cap on every run, lower the cap or raise
  the confidence language — hitting the cap consistently is a padding signal,
  not a richness signal.
- When a field would strengthen a row but the agent is unsure, null wins. A
  null deadline routes the row to research; a guessed deadline routes an
  applicant to a closed door.
- When runs over known-sparse cells return plausible results, spot-check them
  by hand before trusting the cell — sparse cells are where fabrication
  pressure is highest and verification catches the most.
- When localizing, localize the *sources hint*, the *language of content
  fields*, and the *currency* together; doing one without the others produces
  rows that parse but cannot be verified or deduplicated in their own market.

## When not to use

This technique governs generative discovery over the unstructured web. Do not
apply omit-if-unsure framing to *extraction from a supplied document* — there
the source text is present and the correct instruction is "extract exactly
what the text states, null for what it omits," a different contract. And do
not treat the instruction as a substitute for verification: omit-if-unsure
lowers the fabrication rate, it does not zero it, and the adversarial pass
exists because well-instructed agents still occasionally stand behind things
that are not there.
