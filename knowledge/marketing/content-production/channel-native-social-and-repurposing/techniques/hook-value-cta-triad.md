---
layer: technique
type: technique
subject: channel-native-social-and-repurposing
technique: hook-value-cta-triad
status: forged
laws: [never-invent-proof, label-convention-as-convention]
shared_with: []
use_when: [writing or reviewing a single social post, specifying what a post generator must produce, deciding why a post reads as filler]
---

# Hook, value, call to action

Every post that earns its slot has three parts in a fixed order: a **hook** that stops
the reader, a **concrete value** the reader can take without clicking, and one **call to
action** that names what the business wants next. The order is not stylistic. It follows
the way a feed renders a post: most of the audience sees the first hundred-odd
characters and a "more" control, so whatever is not in the hook is, for most readers,
not in the post at all.

## The three parts and their tests

**Hook.** The first sentence, and on a short-video or visual feed the first clause.
Test: read the hook alone and ask whether a stranger would expand the post. A hook that
names the topic ("Today we talk about winter tyres") fails; a hook that makes a claim,
asks a question the reader has, or states a number the reader did not expect passes. On
a professional feed the hook is a claim; on a conversational feed it is a question or
the first line of a story; on a short-video feed it is the beat before the reveal.

**Concrete value.** One thing the reader now knows, can do, or can decide. Test: delete
the link and the call to action - is there still something useful here? A post whose
only value is "read the article" is a link with decoration. Value is specific: a rule,
a figure, a before-and-after, a mistake to avoid. Every fact in it is a fact the
business supplied or the source article contains; the triad does not license the
writer to sharpen a hook with a number nobody measured
([never invent proof](../../../_laws.md#never-invent-proof)).

**Call to action.** Exactly one. Read the article, book a slot, reply with a word, save
this. Test: is there a second verb the reader is asked to perform? Remove it. On a
visual feed with no in-post link, the call to action names where the link is ("link in
profile") rather than pasting a URL that will not be clickable; on a newsletter issue
the call to action is to read the piece, not to buy.

## Why the order is fixed

A post that leads with the call to action asks before it has given. A post that leads
with the value and buries the hook is a good post most people never open. A post with
the hook and the call to action and no value in between is the post readers learn to
skip - and on channels where the algorithm weighs dwell and interaction, it is also the
post that teaches the feed to show the account less. The triad is therefore both a
craft rule and a measurable one: when a post's reach is well below the account's recent
top posts, the first diagnosis is which of the three parts is missing.

## Procedure for a generator

1. State the triad in the system instruction as a requirement, not a suggestion:
   "every post has a hook, a concrete value and a clear call to action".
2. Hand the model the register per channel so the hook takes the channel's shape (a
   claim, a question, a first beat) rather than one shape everywhere.
3. Hand the model the measured top posts as grounding when they exist, because the
   hooks that travelled on this account are the best evidence of which hook shape works
   for this audience.
4. Do not ask the model to label the three parts in its output. The reader never sees
   labels, and a schema with `hook`, `value`, `cta` fields produces posts that read as a
   form. One `content` string per channel; the triad is a property of the prose.
5. Review the hook against the visible length. If the value begins after the fold, the
   post is restructured, not shortened.

## Decision rules

- When a hook only names the topic, rewrite it as a claim or a question, because a
  topic label gives the reader no reason to expand.
- When a post has two calls to action, keep the one the business wants measured and
  delete the other, because a reader given two asks does neither.
- When the concrete value would require a fact the business did not supply, leave the
  value general or ask the owner, never sharpen it with a plausible figure.
- When a channel has no in-post link, the call to action says where the link lives
  rather than pasting a URL, because a dead URL in the caption reads as carelessness.
- When the visible length of a feed is unknown, assume it is short (a convention of
  roughly a hundred to a hundred and fifty characters as of this writing
  ([label convention as convention](../../../_laws.md#label-convention-as-convention)))
  and front-load; the cost of guessing long is a post nobody expands.

## When NOT to use

- Not for a reply. A reply to a comment or a review answers in the first sentence and
  has no call to action beyond the answer; forcing the triad onto it produces a sales
  pitch in a conversation.
- Not for a newsletter body beyond the lead. The issue's lead paragraph follows the
  triad; the body of a long issue has its own structure and a triad per paragraph is
  noise.
- Not as a schema. The triad is reviewed in the prose; it is not three fields the model
  fills.
- Not as an excuse for a hook that promises what the value does not deliver. A hook that
  overclaims and a value that underdelivers is the pattern feeds and readers punish
  fastest.
