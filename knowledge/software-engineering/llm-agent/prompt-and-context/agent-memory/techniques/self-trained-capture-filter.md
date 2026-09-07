---
layer: technique
type: technique
subject: agent-memory
technique: self-trained-capture-filter
status: forged
laws: [failure-not-empty-success, creation-names-reaper, unknown-is-not-a-value]
shared_with: []
use_when: [a capture filter learns from the distiller returning nothing, cheap screening runs before the expensive judge that would correct it, deciding what an empty extraction result is evidence of, a noise bank grows and nothing ever removes an entry]
---

# The self-trained capture filter

[episodic-capture](./episodic-capture.md) puts two filters on the door and argues
that both are safe because they are *stated*: no pure mechanics, and sensitivity
screening. A third one appears in every system that runs an LLM distiller over
conversation, and it is not stated anywhere — it is learned. The distiller is
expensive, most turns yield nothing, so a cheap screen runs first and drops the
turns that look like the ones which yielded nothing before.

That is a reasonable optimization and it inverts the layer's central discipline.
Capture is supposed to be generous because importance at capture time is a
guess; a learned screen turns one past guess into a standing rule, and applies
it to material the judge will now never see. The screen sits **upstream of its
own oracle**, so the evidence that would overturn it is exactly the evidence it
prevents from being collected.

## The null it learns from has several causes, and only one is about the world

The training signal is "the distiller returned no candidates". That sentence
has at least four causes, and they are not the same fact:

- **The call failed.** A gateway timed out, the provider 500'd, the client
  returned null. This is a statement about the infrastructure.
- **The response was malformed.** The model answered and the parse failed. A
  statement about the model's formatting.
- **The input was empty.** Upstream stripping removed every turn — envelopes,
  injected recall blocks, addressing prefixes — and nothing was sent. A
  statement about the *sanitizer*.
- **The pipeline's own filters emptied a non-empty batch.** The model produced
  candidates and policy dropped all of them. This is a verdict about those
  candidates, not evidence the conversation was noise.
- **The model answered honestly and found nothing.** Only this one is evidence
  about the material.

Learning from any of the first four teaches the filter that its own failures
and its own policy are properties of the world.
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
names the discipline and is usually invoked for the *consumer* of an empty
result; here the consumer is a training loop, which is the setting where the
confusion compounds instead of merely misleading. **Type the null at the
boundary — a discriminated result, not a count — and let exactly one arm train
the filter.**

One implementation read for this technique does exactly that, and it is the
part worth copying wholesale: the extractor returns a tagged union whose arms
are call-failure, malformed shape, empty input, policy-emptied, and ok-with-zero,
and only the last one reaches the learner. Its own comment states the rule
better than a spec would — the model did emit candidates, so that is a policy
verdict about those candidates and not evidence the conversation is noise.

## The entrance is the easy half; the loop needs an exit

A careful entrance bounds *what* is learned. It says nothing about how a wrong
entry leaves, and in the same implementation nothing does: the bank has two
mutators, initialize and learn. There is no unlearn, no re-test, no decay, and
no caller that removes anything. The only two exits are a fixed-size eviction
after two hundred further entries, and a process restart — the store is an
in-memory array rebuilt at startup.

That is a store whose retention policy is "until someone reloads the plugin",
which is [creation-names-reaper](../../../../_laws.md#creation-names-reaper)
unanswered. And it is worse than an ordinary unbounded store, because the
entries are *filters*: an ordinary hoard costs recall precision, while a hoard
of filters costs material that was never recorded and cannot be recovered by
looking harder later.

The exit has to be an active re-test, not an expiry, because the filter's
blocking is what removes the evidence:

- **Sample past the filter.** A fixed small fraction of screened-out material
  goes to the judge anyway, and a screened item the judge finds informative
  retires the prototype that blocked it. This is the only mechanism that can
  falsify a learned entry, and it costs a stated percentage of the calls the
  filter was installed to save. Budget it explicitly; a filter with no sampling
  lane has bought its savings by making its own error rate unobservable.
- **Retire on eviction, not on age.** An entry that has blocked nothing in a
  long window is not thereby correct; it is unused. An entry that blocks
  constantly is the one worth re-testing, because it has the most standing.
  Rank re-test candidates by *how much they block*, which is the inverse of the
  usual staleness order.
- **Persist it, or say the half-life out loud.** An in-memory bank silently
  resets on every deploy, so the filter a team believes it tuned is a filter
  that has existed for however long the process has been up. Either persist and
  govern it like any other store, or write down that restart is the reaper —
  but a policy nobody chose is not a policy.

## The add bar must sit below the match bar

Two thresholds govern a similarity-keyed bank and they are routinely set in the
wrong order: a **match** bar, above which incoming material is screened out, and
a **dedup** bar, above which a new entry is considered already covered and is
not added.

Setting the dedup bar *above* the match bar makes the bank grow with entries it
already covers. Material similar enough to be blocked by an existing entry is
still dissimilar enough to be stored as a new one, so every blocked-and-relearned
item widens the region while the cap silently evicts the oldest genuine entry.
The observed instance ran a match bar of 0.82 and an add bar of 0.90, with the
add bar's own comment recording that it had been *lowered* to reduce bloat —
which is the symptom being treated one threshold too late.

The invariant: **anything the bank would block, the bank must not learn.** State
it as `add_bar <= match_bar` and assert it in a test, because the two constants
live in different places and each looks defensible alone.

## Learn the same object you match against

A similarity filter compares two embeddings and is only meaningful if they are
embeddings of the same kind of thing. This is the assumption that breaks
silently, because both sides are vectors of the right dimension and every
comparison returns a plausible number.

In the read instance the learned vector is the last three hundred characters of
a *concatenated batch of turns*, and the vectors it is matched against are
*individual messages* between nine and three hundred characters. A tail of a
concatenation and a single message are different distributions; their cosine
similarity has no calibrated meaning, and the threshold separating them was
chosen as though it did. Nothing in the tree pairs them in a test.

State the learned unit and the matched unit in one sentence next to the
threshold. If they differ, either normalize to the smaller unit before learning
or accept that the constant is uncalibrated and say so — an uncalibrated
threshold that is *known* to be uncalibrated is a lead; one that is assumed
calibrated is a defect with a number in front of it.

## What the filter must record

The screen drops material before anything else in the pipeline sees it, so its
decisions are the only evidence that it is working, and the natural
implementation logs at debug level and counts nothing.

Record, per screened item: which prototype matched and at what score. Record,
per period: the screen rate, the sampling lane's disagreement rate, and the
count of prototypes retired. The second number is the only one that can tell a
well-tuned filter from one that has quietly widened until it blocks a whole
topic — and per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) the
screen rate alone cannot, because a rising screen rate is what both look like.

## When not to use it

A filter with a fixed, human-authored rule set does not need any of this: it
does not learn, so it cannot learn wrong, and its errors are readable in the
rules. The machinery here is the price of adaptivity, and it is worth paying
only where the material's noise genuinely drifts — new channels, new languages,
new automation chattering into the same store. Where the noise is stable, a
stated list of patterns is cheaper, auditable, and cannot silently eat a topic.

And where the judge is cheap enough to run on everything, run it on everything.
This whole technique exists to make an optimization safe; the optimization's
premise is that the judge is the expensive step, and that premise expires.
