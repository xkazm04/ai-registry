---
layer: technique
type: technique
subject: landing-page-experiment-statistics
technique: experiment-pages-print-no-numbers
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled]
shared_with: []
use_when: [publishing an experiment arm as a public page, designing the payload that describes an arm, deciding indexing and address policy for a test page, mining lessons from an experiment]
---

# Experiment pages print no numbers

A published experiment arm is a measuring instrument, and an instrument that reports
on itself stops measuring. Two properties keep a public experiment page honest: it
carries no number about itself - not its rate, its visitor count, its lead, nor any
invented statistic in its copy - and it carries no search identity, because a page that
exists to be measured dies when the test ends and must not accumulate rankings, links
or organic arrivals that were never randomised into the split.

## Procedure

1. **The arm payload has no numeric field.** The shape that describes a served arm is
   prose: an identity, a label, a headline, an intro, a few bullets, a call to
   action, and an operator-typed destination. There is nowhere to put a score, so
   neither a writer nor a model nor a well-meaning operator can print one. The numbers
   live in the counter table and are not the page's to know. This is
   [never invent proof](../../../_laws.md#never-invent-proof) enforced by schema
   rather than by instruction.
2. **The copy invents no proof.** Whether drafted by a person or a model, the copy
   contains no conversion rate, customer count, percentage saving, rating, guarantee,
   certification, deadline or price that the brand's supplied facts do not carry, and
   no address, phone or e-mail the writer does not have. When the underlying
   experiment runs on illustrative data, the brief says so and the copy is written
   generically rather than on results that are not the client's.
3. **One address for all arms.** The page's address carries the test's topic, never
   the arm. All arms live at one address because the split is what is being measured;
   a per-arm address would let a visitor, or a shared link, select their own arm,
   which is not a randomised trial.
4. **Not indexed, links followed.** The page is marked not for indexing, deliberately
   the opposite of a local landing page that exists to rank and outlives its campaign.
   Indexing an experiment page would rank whichever arm the crawler drew, rank a URL
   that will be gone in six weeks, and send organic arrivals onto a page whose split
   they were never randomised into. Link-following stays on so the operator's own
   link check works.
5. **The destination is operator-typed and bounded.** A call to action may go only
   where the operator could have meant: a phone link, a mail link, or a secure web
   address. A plain insecure address is refused so a public page does not downgrade
   its visitor; script and data destinations are dropped rather than rendered.
6. **The conversion beacon is silent to probes.** It accepts only an arm identity the
   page actually serves and answers everything - known or unknown - with the same
   empty success, so a probe learns nothing and an invented arm counts nothing.
7. **Lessons are mined only from a significant winner.** A downstream surface that
   extracts a "winning angle" as a creative pattern reads the experiment's gated
   `significant` predicate, never the leader or the raw confidence, and carries the
   uplift, confidence and visitor count into the lesson as its basis. A pattern mined
   from a collecting test is a fabricated lesson that feeds every later brief.

## Why an arm must not know its score

The obvious harm is persuasion: "already chosen by 4,000 visitors" printed on an arm
is a stimulus the other arm does not have, and the test is no longer of the
hypothesis. The subtler harm is feedback: a page whose content depends on its own
result is not producing independent trials, and the statistics assume it is. The
schema-level absence of a numeric field forecloses both without asking anyone to
remember the rule.

## Decision rules

- When designing an arm payload, give it no numeric field, because a field that can
  hold a number will eventually hold one.
- When publishing an arm, mark it not for indexing and keep links followed, because
  the page's identity is temporary and its links are the operator's to check.
- When serving several arms, serve them from one address, because a chosen arm is not
  a randomised one.
- When mining a lesson, require the gated significance predicate, because a leader is
  not a winner and a lesson from a leader is folklore with a badge.
- When the experiment's numbers are illustrative, the copy is generic and the label
  travels with any lesson, because illustrative data is never indexed as proof or
  scored as a track record.

## When NOT to use

- A page that exists to rank - a local landing page, a permanent money page - is the
  opposite case: indexed, one canonical address, and numbers permitted where the
  business supplied them. Do not apply the experiment posture to a page that must
  outlive a test.
- Social proof that the business supplied and that appears identically on every arm
  is not the page reporting on itself; it is content, owned by the page-content
  discipline, and it may stay as long as it is identical across arms.
- A post-test results page for the operator - inside the authenticated surface, never
  public - prints every number with its basis; the no-numbers rule is about the
  public instrument, not the reading of it.
