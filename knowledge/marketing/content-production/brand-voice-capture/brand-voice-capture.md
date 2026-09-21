---
layer: golden-path
type: golden-path
subject: brand-voice-capture
status: forged
use_when: [turning a business's past messages into a voice a model can follow, deciding whether a voice is trained enough to use unsupervised, choosing which voice a given surface should speak in, feeding human rejections and edits back into the next draft]
techniques:
  - voice-profile-dimensions
  - distil-only-what-samples-show-else-ask
  - voice-maturity-and-retrain-triggers
  - editorial-voice-vs-personal-voice-split
  - rejections-and-edits-become-constraints
  - tenant-never-speaks-the-sample-persona
---

# Brand voice capture

A business already has a voice. It is in the four hundred e-mails the owner
answered last year, the review replies, the messages sent to a lead at nine in
the evening. Nobody wrote it down, and the moment a language model starts
drafting on the business's behalf, the absence of a written voice becomes the
loudest thing about the output: every draft sounds like a competent stranger.
"Sounds like you, not like a model" is the promise every generation product
makes, and this subject is what it costs to keep.

The naive reading is that a voice is a tone word - "friendly", "professional",
"witty" - handed to the model in one line. That is the reading this subject
exists to refute. A tone word is a request, not a specification; two writers
given "friendly" produce two voices, and a model given "friendly" produces the
median of every friendly text it has seen, which is precisely the voice of
nobody. **A voice a model can follow is a profile: several dimensions, each
filled from evidence, with explicit open questions where the evidence runs
out.** The profile is the artifact; the tone word is at best one of its fields.

This subject owns the profile: what its dimensions are, what may be distilled
from samples versus what must be asked, when a profile is mature enough to
trust and when it has drifted behind its own material, which surfaces speak in
which voice, and how every human "no" and every pre-send edit becomes the next
constraint. It does not own the facts the voice carries - the anti-fabrication
schema, the catalogue grounding, the refusal to invent a price - which are
`grounded-marketing-generation`'s. It does not own the per-platform register
and length contract of a social post, which is
`channel-native-social-and-repurposing`'s, nor the reply doctrine and autonomy
gates of an inbound answer, which belong to `speed-to-lead-and-assisted-reply`.
The editorial article a brief becomes is composed under
`content-brief-and-article-composition`; this subject only decides that the
article is *not* the place the personal voice speaks. The narration voice of an
audiovisual piece - pacing, delivery, the spoken register - is the
media-generation bundle's `creator-voice-and-tone` and is not restated here.

## A voice is a profile, and the profile has a shape

The profile a principal practitioner keeps has six kinds of field, and each is
there because a model uses it differently. **Directives** are second-person
instructions injected verbatim ("Address the customer by first name. Answer
the question in the first sentence. Never open with an apology.") - the heart
of the voice, and the part a tone word cannot replace. **Traits** are short
adjectives, useful as display and as light seasoning, never as the whole
profile. **A length habit** ("two to four sentences", "one paragraph") because
length is the dimension a model gets wrong most reliably and most visibly.
**Hard constraints** split into always and never - the business's red lines,
rendered as a list the model cannot mistake for a suggestion. **Examples** -
short lines written *in* the voice, for the model to imitate rather than
describe. And **a scope**: a voice is per surface, with one generic register as
the fallback, because a business that writes review replies and sales e-mails
does not write them the same way. `voice-profile-dimensions` fixes the shape
and the reason each field exists.

Two consequences follow from the shape. First, the profile is prompt material,
not documentation: it lives where the model reads, appended to the request
rather than to a style guide nobody opens. Second, a profile with directives
under a sentence or two long is an untrained profile whatever its other fields
say, because directives are the only field that carries instruction rather
than description.

## What samples can tell you, and what they cannot

The discipline that separates a captured voice from an invented one is
evidential. A distillation reads real messages the business sent and writes
down **only what is visible in them**. A sample set of five customer-service
replies shows the greeting, the sentence length, whether the writer signs off,
whether they use the formal or informal address; it does not show how the
business speaks to a lead who has gone cold, whether it ever uses humour, or
what it would refuse to say. The temptation is to fill those from the type of
business - and a distillation that does is fabricating a personality with the
same confidence it reports an observed one.

`distil-only-what-samples-show-else-ask` sets the rule: every claim in the
profile is traceable to a sample or to an answer the owner gave, and what
cannot be traced becomes a **gap question** put to the owner - two to four
specific ones, none of which the samples already answer. The interview and the
distillation are one operation: a single pass returns both the profile and the
next round's questions, and the answers come back as training material. With
no samples and no answers the honest output says so in its summary and leans
almost entirely on questions. The cost of asking is one round-trip; the cost
of guessing is a voice the owner will reject on sight and then distrust.

## Maturity, staleness and the retrain trigger

A voice passes through three states, and the surface must be able to name all
three: untrained (nothing distilled, or directives too short to count),
training (a profile exists but the distillation still has open questions), and
mature (enough material that a round may legitimately end with no open
question). `voice-maturity-and-retrain-triggers` fixes the gates. The maturity
predicate - a handful of samples, or several answered questions - is
practitioner convention, and the technique says so; the structural point is
that **a distillation that is forced to return a question every round can
never reach "fully trained"**, so the maturity state must exist as a distinct
branch and not as an aspiration.

Maturity is not permanent. Every answered question, every pasted sample and
every substantive human edit is a new fact banked after the last distillation,
and a voice with a stack of newer facts beneath it is a voice that has drifted
behind its own material. The retrain trigger counts those facts, not the
calendar: a voice trained a year ago with nothing new is current; one trained
last week with six new corrections is stale. And the trigger is a **nudge,
never a penalty** - readiness scoring is a function of what has been trained,
not of what time it is, so a business is never told its voice degraded because
a month passed.

## Which voice speaks where

The most consequential decision in the subject is one the naive reading never
makes: **the editorial voice and the personal voice are different voices, and
they belong to different surfaces.** An article on the business's own site, the
brief that shapes it, a product description - these are brand editorial, and
their voice is the catalogue-derived brand context: what the business sells,
its price band, its differentiators, its vocabulary. A reply to a lead, a
review response, a social post written as the owner, a newsletter - these are
personal surfaces, and they speak in the trained voice for that surface's
scope. `editorial-voice-vs-personal-voice-split` draws the line and gives the
test: the trained voice is the *operator's* register, and injecting it into a
company-site article makes the site sound like one person's inbox.

The contrast case is a register stated as a single hard rule for every page -
"every second sentence is a joke, no exceptions in body copy" - which
collapses both voices into one mandated style, gives the model no dimensions
to hold, and treats the whole site as if it were the owner's personal feed.
That is a voice *directive*, and a usable one, but it is one field of a
profile pretending to be the profile, and it makes no distinction between the
surfaces it governs.

## The human's pen is the training set

Once a voice is live, the richest training material is what humans do to the
drafts. A rejection with a reason - off brand, inaccurate, too long, wrong
tone, risky claim - is counted, not merely stored, and the tally becomes
"avoid" directives at the top of the next prompt: three rejections for length
on one channel put "write markedly shorter" in front of the model before it
drafts again. Rejection reasons are fixed presets rather than free text
*because* they are counted; a free-text note rides alongside for the specific
why. And the far more common human act is quieter than rejection: the person
takes the draft, fixes it and sends. `rejections-and-edits-become-constraints`
makes that edit visible - a word-level before/after distance above a
threshold banks the pair as a style fact, the same shape as an answered
interview question, so it feeds the next distillation. Below the threshold it
is a typo fix and is silently discarded; the threshold is convention.

## The sample persona is not the tenant's voice

A product that ships with an illustrative voice per business type - "write
like an experienced shop assistant: factual, helpful, no marketing filler" -
does so for a reason: the editor needs something to show and a demo needs
flavour. `tenant-never-speaks-the-sample-persona` states the rule that
follows: **a real business speaks only in voices it actually saved; the seeded
persona injects nothing into its generations.** An untrained tenant whose
drafts arrive in the canned persona is a product impersonating a brand it has
never met, in whatever language the persona was written in. The seeded
profile also carries no seeded samples and no seeded facts, so an untrained
voice reads as untrained on every readiness surface instead of ticking gates
for free. Demo-ness is a property of the project, decided at one seam, never
inferred from a name.

## Failure modes of the naive reading

- **The tone word.** One adjective in a system prompt, no directives, no
  examples, no scope. The output is generically pleasant and belongs to nobody.
- **The invented profile.** A distillation that fills every field from the
  business type and returns no questions. It reads as confident and is wrong
  in ways the owner discovers by reading their own "voice" and recoiling.
- **The eternal interview.** A distillation that must always ask, so the
  training screen can never say "done" and the owner stops answering.
- **The calendar penalty.** Readiness that decays because time passed; a
  business with a perfectly current voice is told to retrain it.
- **One voice for every surface.** The owner's inbox register on the company's
  editorial pages, or catalogue prose in a review reply.
- **Discarded corrections.** The outbox records the final send and throws away
  the difference between what the model wrote and what the human sent.
- **The impersonating default.** A seeded persona that speaks for a tenant who
  never trained anything.

The subject is small but it is where every "sounds like AI" complaint lands.
A voice profile with traceable fields, honest gaps, a maturity state that can
be reached, a retrain trigger that counts facts, a surface split, a
correction loop and a sample that stays a sample is the difference between a
model that writes for a business and one that writes near it.
