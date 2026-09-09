---
layer: technique
type: technique
subject: brand-voice-capture
technique: editorial-voice-vs-personal-voice-split
status: forged
laws: [never-invent-proof]
shared_with: []
use_when: [deciding which voice a generation surface injects, routing a trained voice through a set of AI tools, reviewing a site whose articles sound like one person's inbox]
---

# Editorial voice versus personal voice split

A business has two voices, and a generation pipeline that knows only one puts
it on the wrong surfaces. The **editorial voice** is the brand as an
institution: what it sells, its price band, its differentiators, its
vocabulary, its refusal to invent an offering it does not carry. The
**personal voice** is the operator writing as a person: the greeting, the
sentence length, the informal address to regulars, the sign-off. The trained
profile captured under this subject is the second one. It is distilled from
the owner's own messages and it sounds like the owner. That is exactly why it
must not speak on the company's editorial pages.

## The rule

Brand editorial - a content brief, the article it becomes, a product
description, a comparison page - is grounded in the **catalogue-derived brand
context** and nothing else voice-shaped. Personal surfaces - a reply to a
lead, a review response, a social post published as the owner, a newsletter
- are grounded in the brand context *and* the trained voice for that surface's
scope. The trained voice enters exactly where an editorial piece becomes a
personal one: at the repurposing step that turns an article into a post, not
before.

The test for a surface: *would a reader expect a person or an institution to
have written this?* A blog article on a company site is institutional even
when it has a byline. A reply to "is this in stock?" is a person. When the
answer is unclear - a founder-led newsletter, a professional-network post
under the company page - the scope decides: a newsletter resolves to the
e-mail voice, a post to the social voice, and the owner sees which voice was
applied.

## What the brand context is

The editorial grounding is facts, not style: the brand name (the clean one,
never a demo-marked variant), its top categories and item count, a price band
in one currency, whether it sells online or in person or both, its top
differentiators, its channels, and a closing instruction to stay within the
catalogue and its vocabulary. It stops the model inventing a product line; it
does not tell the model how to sound, and the requested tone and locale still
govern. The price band is computed within the single dominant currency and
offerings in other currencies are omitted rather than merged - one small
instance of the law against invented proof, applied to a voice document.

## Why the split is load-bearing

Three failures follow from collapsing the two voices.

- **The inbox on the homepage.** An operator's reply register - first names,
  two sentences, "let me check and call you back" - injected into a
  thousand-word guide makes the guide read as a private message that escaped.
- **The catalogue in the reply.** Editorial grounding alone in a lead reply
  produces a product listing where a person was expected.
- **One mandated register for everything.** The contrast case: a site whose
  voice is a single hard rule - every second sentence a joke, no exceptions
  in body copy, straight zones for prices and the quick answer - has picked
  one directive and made it the whole voice for the whole site. It is a
  personal register applied editorially, with no dimensions for a model to
  hold and no way to sound different in a review reply. A usable directive; a
  broken profile.

## Disclosure

Whichever voice a surface used is disclosed on the response metadata, not
inferred from the prompt: the client shows a "voice applied" indicator only
when the server says the trained voice entered. Sniffing the prompt for
voice-like text false-claims on an untrained business, because the prompt
also carries the user's own prose.

## Decision rules

- When a surface is brand editorial, ground it in the catalogue brand context
  and inject no trained voice, because the trained voice is one person's
  register and the page belongs to the institution.
- When a surface is personal, resolve the trained voice for that surface's
  scope - own scope, else generic - and inject it after the brand context,
  because both the facts and the person are needed.
- When an editorial piece is repurposed into a personal surface, that step is
  where the trained voice enters, because the surface changed and the voice
  follows the surface.
- When a voice was injected, say so in the response metadata, because a
  client indicator with no server basis is a false claim.

## When NOT to use

Do not apply the split where the business *is* one person and every surface
is deliberately personal - a solo consultant's site written in the first
person is a personal surface by design, and the editorial context is then a
fact block inside the personal voice rather than a separate register. Do not
use the split to justify a bland editorial voice: "institutional" is not
"generic", and an editorial style guide with its own directives is a valid
second profile - it is simply not the one distilled from the owner's inbox.
