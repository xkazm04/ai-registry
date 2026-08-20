---
layer: technique
type: technique
subject: candidate-outreach-and-halt-rules
technique: grounded-personalisation-never-fabricated
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [generating outreach copy with a model, a message asserted something about a candidate that was not true, writing the prompt behind a first-touch template]
---

# Grounded personalisation, never fabricated

## The concern

Personalisation is the price of contacting someone who did not ask to hear from
you. A message with no specificity is a template with a mail merge and is read as
one in about a second. So every outreach system reaches for specificity — and
when the specificity is generated rather than retrieved, the system will happily
invent it, warmly and fluently.

Both failures are real and they are not symmetric.

- **The generic message** wastes one of your three touches and lowers the
  response rate. Recoverable.
- **The fabricated message** asserts something about a person's own life that is
  not true — a project they did not run, a tenure they did not have, a seniority
  inferred and then stated as fact. It is a falsehood told in the organisation's
  voice to the one reader in the world who can check it instantly. It ends the
  relationship and it deserves to.

The operative test is blunt and portable: **if the body could be sent to a
different candidate unchanged, it is wrong** — and its necessary companion, if
any sentence in the body cannot be traced to something the record actually holds,
it is worse than wrong.

## Procedure

1. **Retrieve before you generate.** Assemble the specific facts first — from the
   candidature record, the parsed history, the recruiter's own notes — and pass
   them to the generation step as the only permitted material. A model asked to
   "make this warmer" with nothing to be warm about will supply the content from
   nowhere, because warmth without facts has nowhere else to come from.
2. **Check that the fact base is not starved before blaming the generation.**
   The commonest cause of interchangeable outreach is not a weak model but a
   context of a name and three skill strings — no message *could* be specific
   from that. Audit what is actually handed to the generation step before tuning
   the instruction; a bench verdict of "this would paste onto any candidate" is
   usually a retrieval finding wearing a writing finding's clothes.
3. **Instruct the generation to use only supplied facts, and to omit rather than
   invent.** A shorter message is an acceptable outcome; an invented one is not.
   Say so explicitly, name the categories that get invented most — meetings that
   did not happen, team reactions, benefits, interest, abilities — and give the
   model an explicit way to produce less.
4. **Rank the hooks, and require a minimum.** Say which specifics to anchor on
   and in what order: a stated aspiration that maps to this role or this
   organisation first, then a concrete experience highlight, then the matched
   skills. Aspiration outranks skill because it is the thing the person said they
   wanted rather than the thing you inferred they can do. Require at least two
   specific facts from this person's own record, so "specific" cannot be
   satisfied by one adjective.
5. **Make inference visible as inference.** Where the message rests on a reading
   rather than a stated fact, it must be phrased as a reading — "it looked to us
   like", "if we have understood your recent work" — never as an assertion
   ([inference must look like inference](../../_laws.md#inference-must-look-like-inference)).
   A hedged inference that turns out wrong costs a correction; the same claim
   stated flat costs the relationship.
6. **Apply the transplant test mechanically before sending.** Strip the name and
   the role title. If what remains would be equally true of any candidate in the
   pool, the message has not been personalised, only addressed.
7. **Apply the neutral-register rules.** Do not infer gender from a name, a
   photo, or a language's morphology, and do not solve the problem with slash
   forms or bracketed alternatives, which read as clerical and draw attention to
   the doubt. Recast so the question does not arise. In languages where
   grammatical gender is unavoidable, prefer constructions that address the role
   or the action rather than the person, and treat this as a hard requirement of
   the generation step rather than a copy-editing pass.
8. **Enforce register consistency.** Salutation, formality level and sign-off
   form one system. Choose the register from the recipient's locale and the
   channel, and hold it across the whole message; mixed formal and informal
   address inside one message is the clearest tell of machine assembly. Where a
   generated body is wrapped in deterministic chrome — a greeting, a signature, a
   status line — **both must take the language from the same resolved authority**.
   Two language authorities in one letter is a live defect, not a style
   inconsistency: the generator guesses from the candidate's document while the
   wrapper reads the recorded preference, and the person receives a message that
   changes language halfway down. The composing side must be *passed* the
   resolved locale, never left to infer one.
9. **Keep the facts fresh at dispatch.** Anything volatile — a deadline, a stage
   name, a role title — is resolved when the message is sent, not when it was
   drafted, or an approved draft that sat over a weekend will contradict what the
   person can see elsewhere.
10. **Retain the grounding alongside the message.** Store which facts were
    supplied to the generation, so that a complaint about a claim can be resolved
    against the record rather than against memory.

## Decision rules

- **When a fact is not in the record, it does not go in the message.** Not as a
  guess, not as a compliment, not as a "safe" generality about their industry
  attributed to them ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
- **When the only available specifics are the name and the role, send the honest
  short message.** State plainly what the opening is and why you are writing, and
  do not dress it as research you did not do. Recipients forgive brevity; they do
  not forgive false familiarity.
- **When personalisation would rest on a protected or sensitive attribute** — an
  inferred origin, an age implied by a graduation year, a caring gap in a career
  — it is excluded regardless of accuracy. Accurate is not the standard here.
- **When a fact came from a public source the candidate did not give you,
  attribute it or drop it.** "I saw your talk at the conference" is fine and
  checkable; specificity that implies access you did not have is unsettling.
- **When a generated message and its grounding disagree at review, discard the
  message.** Do not edit the claim into vagueness — the same generation will
  produce the same invention next time, and the fix belongs in the grounding
  step.
- **When a message names a person's employer or a competitor, apply the same
  test.** A fabricated detail about where somebody works is the version of this
  failure most likely to reach that employer.

## When not to use this

- **Purely operational messages** — an acknowledgement, a scheduling link, an
  outcome — should not be personalised beyond the facts of the process. Warmth
  invented into a rejection is its own harm, and how a decline is worded belongs
  to the decline-with-dignity subject.
- **Where no per-candidate facts exist at all**, do not generate; use a
  transparent, honestly generic template. A blank grounding is a signal to change
  the message type, not to lower the bar.
- **Do not use this technique to justify deeper data collection.** The answer to
  thin grounding is a shorter message, never a wider scrape of somebody's life.
