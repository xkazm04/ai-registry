---
layer: technique
type: technique
subject: channel-native-social-and-repurposing
technique: retell-not-copy-with-source-digest
status: forged
laws: [label-convention-as-convention, provenance-is-binary-and-labelled]
shared_with: []
use_when: [turning one article into per-channel variants, bounding a long source before it enters a prompt, deciding who writes the tracking link into a variant]
---

# Retell, do not copy, with a source digest

A channel variant of an article is a **retelling** of the article's one most relevant
idea in the channel's register - not the article's opening paragraph cut to length,
and not a summary of every section. The generator is instructed to retell rather than
copy, is handed the source in a form that supports retelling, and never writes the
tracking link itself.

## Why copying fails

An article's first paragraph was written to open an article: it sets context, names
the topic, promises what follows. None of that is a hook. Copied into a post it produces
the "today we talk about" opener the triad forbids. A summary of every section fails the
other way: it gives the reader the whole article in worse form and leaves the link
nothing to add. The retelling picks the one claim or lesson the channel's reader would
stop for, makes it in the channel's shape, and leaves the article as the place to get
the rest. The instruction in the prompt is short: *draw on the title and text supplied;
do not copy them verbatim; retell what matters most*.

## The digest

A long source is bounded before it enters the prompt, both to protect cost and because
a model handed six thousand words of supporting detail retells the detail. The digest
keeps the **lead** and the **close** and elides the middle with a visible marker:

- The lead carries the thesis, the framing and the promise - what the article is *for*.
- The close carries the conclusion, the recommendation, the call to action - what the
  article *arrived at*.
- The middle carries the evidence and the walkthrough - what a variant does not need.

The split, as convention: keep roughly seventy percent of the budget from the head and
thirty from the tail, under a total budget of a few thousand characters
([label convention as convention](../../../_laws.md#label-convention-as-convention)).
The technique does not defend the exact ratio; it defends that the tail is kept at all,
because the most common bounding is a plain truncation that discards the conclusion,
and a retelling without the conclusion is the article's setup with no payoff. When the
source is within budget the digest is a no-op; when the source is absent, the prompt
says so and the model retells from the title alone, and the result is labelled as
title-only.

## The link is the system's, not the writer's

The tracking link - the article's URL stamped with the channel's campaign parameters -
is appended by the system that knows the channel, after generation. The model is told
not to write a link into the text. Three reasons, each an incident in waiting:

1. A model that writes the link writes it from memory, and a remembered URL is a
   hallucinated URL often enough to break attribution for the whole campaign.
2. Campaign parameters differ per channel; a model that writes them will copy one
   channel's parameters into another's variant.
3. On a visual feed the caption link is not clickable; the closing line there names
   where the link lives, and the system's per-channel copy knows that while a model
   writing "click here" does not.

The copy the system owns - the generic lead used when an article has no body, each
channel's closing line before the link - is per-locale and rendered from constants a
reader function can parse back off the text, so the writer and the reader of a
newsletter subject prefix cannot drift apart.

## Provenance of the variant

A variant produced from the deterministic fallback (the article's own words clipped to
budget, wrapped in the system's connective copy) and one produced by a model are both
legitimate outputs. They are not the same output, and the distinction is carried with
the result: a run in which the model filled no channel is labelled as fallback, a run
in which it filled some is labelled as partly fallback, and a run in which it filled
every requested channel carries no label. What is forbidden is fallback text presented
as the model's work - the disclosed-versus-real distinction that
[provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled)
draws for numbers applies here to words.

## Decision rules

- When the source exceeds the digest budget, keep head and tail and elide the middle,
  because a plain truncation drops the conclusion the retelling needs.
- When the source body is absent, retell from the title and label the output as
  title-only, because a variant that claims to draw on a body it never saw is a
  provenance lie.
- When the model writes a URL into a variant, strip it and append the system's link,
  because a written URL cannot be trusted to carry the right channel parameters.
- When a requested channel comes back empty, re-prompt once; if still empty, backfill
  from the deterministic variant and flag the run as partly fallback, because unlabelled
  backfill bills canned words as generation.
- When two variants read as the same paragraph at two lengths, the model copied; reject
  the run and re-prompt with the retelling instruction made explicit, because a copied
  variant is the failure the whole technique exists to prevent.

## When NOT to use

- Not for a newsletter *issue* built from several articles. That is a composition task
  with its own structure; the digest here bounds one source for one retelling.
- Not when the article is itself short enough that any retelling repeats it. A
  three-hundred-word note is posted as a post, not repurposed.
- Not to produce the article from the post. The direction is one-to-many from a source
  a person approved; a post expanded into an article is a brief, and belongs to the
  brief-and-composition subject.
- Not with a digest ratio treated as measured. Seventy-thirty is a habit that keeps the
  conclusion; a team that finds its articles conclude early should move the split and
  say so.
