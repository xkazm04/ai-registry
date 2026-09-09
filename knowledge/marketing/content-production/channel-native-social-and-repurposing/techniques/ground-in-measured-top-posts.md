---
layer: technique
type: technique
subject: channel-native-social-and-repurposing
technique: ground-in-measured-top-posts
status: forged
laws: [not-measured-is-not-zero, platform-reported-is-not-causal, label-convention-as-convention]
shared_with: []
use_when: [adding a what-works block to a social prompt, choosing a window and a ranking key for recent performance, deciding what to show when no post has been measured]
---

# Ground in measured top posts

The most useful line a social-drafting prompt can carry is *what recently worked on
this account, with real numbers*. The technique is how that line is built so it can
only ever say something true: from posts the platform reported on, inside a recent
window, ranked by one key every platform reports, quoted with their measured counts -
and **absent entirely** when nothing has been measured.

## The grounding line

One sentence: the top few recent posts, each as the channel, a recognisable fragment of
the caption, and its measured reach, likes and comments. The fragment is long enough to
recognise the angle and short enough not to invite copying. The prompt frames it as
*lean on this, not on generic ideas*. It is a description of what travelled, handed to
the writer as evidence of which hook shapes and topics this audience stops for.

Three parameters, each convention and labelled as such
([label convention as convention](../../../_laws.md#label-convention-as-convention)):

- **Window.** Recent enough that the audience and the feed's rules are the same ones the
  new post will meet. Ninety days is the practitioner default; a caption that worked
  eight months ago is not evidence about what works now.
- **Count.** A handful - three - so the model sees a pattern, not a corpus to
  paraphrase.
- **Ranking key.** Reach, because it is the one number every platform reports for a
  post and the one an operator can act on ("this angle travelled"). Likes and comments
  ride along as the engagement quality behind it.

## The snapshot rule

A metric row is a **snapshot** of a post's lifetime counters as of a day, not an
increment. A platform reports "this post has 1 240 impressions", and reading it twice on
the same day must leave 1 240, not 2 480. So the store overwrites on (post, day), and
the reader takes each post's newest day rather than summing its days. Read-back runs on
a coarse interval - every few hours - because platform counters settle over hours and
each read costs a rate-limited call.

## The absence rule

This is the technique's spine and the reason it earns its place.

- **No rows, no line.** When no post in the set has a metric row, the grounding is an
  empty string, which disappears when concatenated into the prompt. Never a placeholder
  sentence, never "no data yet" - the model reads a placeholder as an instruction.
- **A failed read is no row.** A post whose metrics call failed gets no row at all. A
  row of zeros would enter the grounding as "this post reached nobody", a confident lie
  about a number never learned. Failures are counted for the operator, not stored as
  measurements ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
- **A metric the platform does not report is pinned, not derived.** When a network's
  read-back cannot obtain reach - the endpoint the integration holds returns likes and
  comments and no impressions - reach is set to a value the ranking cannot mistake for
  a measurement and the gap is documented at the site. It is *not* estimated from the
  like count, because the grounding ranks by reach and a fabricated reach reorders
  real advice. The honest consequence is that this network's posts sort to the bottom
  of the ranking, which is a visible gap rather than an invisible lie. The stronger
  form of this rule is a typed absence (null) rather than a pinned zero, so that a
  consumer cannot mistake the gap for a measurement even without reading the comment;
  a team adopting the technique should prefer the typed form.
- **A simulated publish has no metrics.** A post that never reached a channel has no
  external identity and is unaddressable by construction; there is no demo read-back.

## What the ranking is and is not

Raw reach ranks posts **within one account across its networks by a common floor**. It
is not a cross-network comparison of quality: a professional network's reach and a
visual network's reach are different populations with different baselines, and a rate
would be needed to compare them. There is no standard engagement rate - by reach, by
impressions, by followers all circulate, and by-followers is systematically lower than
by-reach because a post reaches only part of its followers. When a rate is shown, its
denominator is named beside it, and posts are compared only within one network and one
denominator. And none of it is causal: the platform reported the numbers by its own
attribution, and "this angle travelled" is a descriptive read the writer leans on, not
an experiment ([platform-reported is not causal](../../../_laws.md#platform-reported-is-not-causal)).

A related honesty: a link-tracking ledger knows how many links it minted and how many
were clicked, not how many people saw the post. Clicks per link is not a click-through
rate; the column is dropped rather than filled with a percentage that would be read as
one.

## Decision rules

- When no post has a metric row inside the window, emit an empty string, because a
  placeholder reads as an instruction and a zero reads as a failure.
- When a read fails, store nothing for that post and count the failure, because a
  stored zero becomes evidence.
- When a platform does not report the ranking key, pin it to an unmistakable
  non-measurement and document the gap at the site - prefer null - because deriving it
  from another metric reorders real advice by an invented number.
- When two posts tie on reach, break the tie deterministically (by identifier), because
  a grounding line that changes between two reads of the same data will be read as a
  change in performance.
- When the window, count or key is changed, say so in the prompt's lead ("best recent
  posts, real numbers, last N days"), because the model's reader - and the operator
  reviewing the prompt - should know what "recent" meant.

## When NOT to use

- Not with performance the operator *remembers*. Memory ranks posts by how much the
  owner liked them; the grounding ranks by what the platform reported.
- Not to compare networks. Raw reach is a within-account floor, not a rate.
- Not for an account under a few published posts in the window. Three top posts out of
  four is the whole history, not a pattern; the line is still honest, but the writer
  should know it is thin.
- Not as a template. The fragment quoted is to recognise the angle; a prompt that quotes
  full captions produces the same caption again.
- Not to claim causation. "This angle travelled" is a description; a claim that the
  hook caused the reach needs an experiment this subject does not own.
