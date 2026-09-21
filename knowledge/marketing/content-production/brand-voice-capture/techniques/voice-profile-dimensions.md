---
layer: technique
type: technique
subject: brand-voice-capture
technique: voice-profile-dimensions
status: forged
laws: [label-convention-as-convention]
shared_with: []
use_when: [designing the schema a trained voice is stored in, deciding what a voice prompt block contains, reviewing a voice that is only a tone word]
---

# Voice profile dimensions

A voice a model can follow is stored as a profile with a fixed shape, and the
shape is not arbitrary: each field exists because a model consumes it in a
different way, and dropping any one of them produces a recognisable failure.
The technique fixes the fields, the order they render in, and the caps that
keep the block from swamping the request it is attached to.

## The fields

| Field | Form | What the model does with it | Failure when missing |
| --- | --- | --- | --- |
| Scope | one surface, or `generic` | selects which profile governs this draft | one voice everywhere |
| Directives | second-person prose, three to six sentences | obeys them verbatim | descriptions instead of instructions |
| Traits | short adjectives, capped | seasoning and display | none serious - traits are the least load-bearing field |
| Length habit | a phrase like "two to four sentences" | sizes the draft | the most visible drift: replies twice the owner's length |
| Constraints | always-list and never-list, each a short rule | treats as hard lines | the business's red lines become suggestions |
| Examples | two to four new lines written in the voice | imitates rather than interprets | the model paraphrases the directives back |
| Trained-at | timestamp | not read by the model; read by the retrain trigger | staleness cannot be measured |

**Directives are the product.** They are prose in the second person, injected
as-is: "Address regular customers informally. Answer the question in the first
sentence. Offer a concrete next step - availability, delivery, returns."
Everything else steers or seasons; directives instruct. A profile whose
directives are missing or shorter than a couple of sentences is untrained,
whatever its traits say, and a validator treats it so - an empty directives
field must never be allowed to save over a good one. The forty-character
floor some implementations use for "too short to count" is a convention.

**Constraints are two lists, not one.** An always-list and a never-list render
differently in the prompt and read differently in an editor: "always offer a
call-back" and "never promise a delivery date" are the two shapes a business
expresses its red lines in, and folding them into one list of rules loses the
polarity the model needs. Each rule is short enough to be a chip.

**Examples are new sentences.** A distillation writes fresh lines in the
observed style rather than copying the samples, for two reasons: copied
samples carry customer names and specifics that would leak into unrelated
drafts, and a model imitates a clean exemplar better than a message full of
context it lacks.

## Rendering order and caps

The profile renders as one block appended to the user turn, in a fixed order:
a heading naming the surface, directives, traits, length habit, the always
list, the never list. The heading matters - "the brand's voice on this
channel" versus "the brand's voice in posts" - because a model told a voice
without a surface will apply reply habits to a post. Caps are set per field
(eight traits, twelve rules per list are common conventions) so that a
generously trained voice cannot push the request's own content out of the
model's attention.

One rendering function, shared by every tool that writes in the voice. Three
copies of "how do we phrase the always/never block" drift the moment one
tool's rules change, and a voice that renders differently per surface is a
voice the owner cannot review in one place.

## Where the block goes

The voice is appended to the **user** prompt, never the system prompt and
never the schema. The system prompt and output schema are what a tool's
evaluation fingerprint is computed over; a voice that varies per business and
per retrain would bust every cached golden output and turn a stable tool into
one that re-evaluates on each save. The same rule keeps the voice
server-resolved: it is loaded from the business's stored profile, never
accepted from a client request, or any caller could speak in any voice.

## Decision rules

- When a voice is stored, store it per scope with one generic fallback, and
  resolve a draft's voice as *own scope, else generic, else nothing*, because a
  business writes reviews and sales e-mails differently and a single register
  is wrong on at least one of them.
- When directives are shorter than a sentence or two, treat the profile as
  untrained and refuse to inject it, because a model given description without
  instruction produces the median of its training data.
- When a field would exceed its cap, truncate the field rather than the
  request, because the voice is a modifier and the request is the task.
- When a tool needs the voice, append it to the user turn in the shared
  rendering, because the system prompt is fingerprinted and the client is
  untrusted.

## When NOT to use

Do not build a profile for a surface whose register is entirely a platform
contract - a character-limited microblog post is governed by
`channel-native-social-and-repurposing`'s limits first and the voice second.
Do not add a field the model cannot act on: a "brand personality archetype" or
a colour is display material, not voice. And do not let the profile carry
facts - prices, opening hours, offerings belong to grounding, and a voice that
holds them goes stale the day a price changes.
