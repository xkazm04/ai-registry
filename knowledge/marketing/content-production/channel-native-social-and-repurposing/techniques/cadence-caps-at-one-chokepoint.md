---
layer: technique
type: technique
subject: channel-native-social-and-repurposing
technique: cadence-caps-at-one-chokepoint
status: forged
laws: [a-gate-before-money-and-copy, label-convention-as-convention]
shared_with: []
use_when: [a posting-frequency cap exists in a plan or wizard, several schedulers can create posts for one channel, deciding what counts against a weekly cap and who may exceed it]
---

# Cadence caps at one chokepoint

A cadence cap - "at most n posts a week on this channel" - is a promise the business
made about its own behaviour. The technique is not the number; it is that the promise
is **enforced at the single write path every scheduled post must pass through**, with
the arithmetic of "which week" and "what counts" defined once and shared with the
calendar the operator reads.

## Why one chokepoint

The typical state of a cadence cap is *displayed and unenforced*: written in a setup
wizard, shown in a playbook, and posted straight past by every scheduler in the
product. A week planner, a content board's hand-off and a distribution card each
create posts, and if each is asked to respect the cap, one of them will not, and the
first time someone adds a fourth scheduler it will not either. The cap binds all of them
only when all of them create their post through one endpoint that performs the check.
That endpoint is also where the channel limit is re-checked and where a past-dated
schedule is refused - the one gate before copy leaves the building
([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).

## The arithmetic, defined once

Three definitions live in one framework-free module so the write chokepoint and the
calendar's meter row cannot disagree:

**Which week.** The week the operator lives in: Monday-start, in local time. A cap of
"three a week" was promised about a human week, and a seven-day UTC bucket splits a
Sunday-evening post off from the week it visibly belongs to. Local-date formatting is
used rather than an ISO timestamp conversion, which shifts the date across the UTC
boundary near midnight. An unparseable instant yields an empty week key that nothing
else lands in, so a malformed row can neither be counted nor cause a refusal.

**What counts.** Only statuses that *occupy a slot*: scheduled, published, sent. A
planned idea is an internal note nothing has acted on and must not consume the cap -
capping plans refuses a real post because somebody sketched four ideas. A failed send
freed its slot by definition.

**Which cap.** When two configurations resolve to the same channel key (an
automatically generated plan listing a channel by name beside a seeded track for the
same channel), the **strictest** cap wins - the operator asked for at most n, twice. A
configuration that resolves to no known channel - a directory listing, a marketplace,
a channel the product cannot post to - is dropped, because keeping it would let a cap
on a listing refuse a post on a network.

"Exceeded" is `count >= cap`, where count is what is *already* placed: with a cap of
three and three items in the week, the fourth breaks the promise.

## Fail open, refuse loudly, override by hand

- The check **fails open** on what it cannot judge: no tracked cap for the channel
  means zero extra reads and an unchanged response; an unreadable configuration store
  enforces nothing rather than refusing a post the operator is entitled to make. A
  cadence check is a courtesy to the operator's own promise, not a safety gate, and a
  courtesy that blocks work is removed.
- A breach is a **conflict response**, not a silent reschedule, carrying the channel,
  the cap, the current count and the week start, so the client can show the operator
  the promise about to be broken.
- The override is a **human click**, never an inference: the client re-posts with an
  explicit override flag after showing the cap, and the exception is written to the
  audit timeline - against the module that *owns* the cap, not the one that broke it,
  so the record sits next to the promise it overrode. Nothing auto-reschedules.

## The number is convention; the evidence is not

The cap's value is practitioner convention, and a technique says so
([label convention as convention](../../../_laws.md#label-convention-as-convention)).
The direction of the evidence is worth carrying: a 2026 analysis of roughly forty
million posts by a scheduling-tool vendor found per-post reach and interactions falling
across every major network while posting frequency rose - on the professional network,
post volume nearly doubled year-over-year while impressions per post fell by about a
quarter; on the short-video feed, weekly frequency rose about a fifth while interactions
per post fell by about a third. More posts buy more total exposure and less per post;
the sustainable cadence is the one the business can hold without the quality of each
post falling, and the cap is the business's own estimate of that. A cap that is never
hit is too loose to be informative; a cap that is overridden every week is a promise the
business does not mean and should be renegotiated, not bypassed.

## Decision rules

- When a cap exists anywhere in the product, enforce it at the write chokepoint and
  nowhere else, because per-scheduler enforcement is a set that grows and one member
  will not check.
- When two caps resolve to one channel, take the minimum, because the operator asked
  for at most n both times.
- When a cap resolves to a channel the product cannot post to, drop it, because a
  listing's cap must never refuse a network's post.
- When a scheduled instant cannot be parsed, fail open at the check and refuse the
  write earlier with a validation error, because an unparseable date is a bad request,
  not a cadence question.
- When the cap would be exceeded, return the breach with its numbers and let a person
  decide, because the cap is the business's promise and only the business may break
  it; write the override to the audit record beside the cap.
- When counting the week, count only slot-occupying statuses in the operator's local
  Monday-start week, because the promise was made about that week and about real posts.

## When NOT to use

- Not for a channel with no cap. A default cap invented by the product is a promise the
  business never made.
- Not as a hard gate. A cadence cap that fails closed on missing data blocks legitimate
  work; the hard gates in this subject are the channel limit and the past-date refusal.
- Not to auto-reschedule. Moving a post to next week because this week is full is a
  decision about the business's calendar and belongs to a person.
- Not as a measure of success. Filling the cap every week is not a goal; the cap is a
  ceiling, and the measured evidence on frequency says the ceiling is the safer side to
  err on.
