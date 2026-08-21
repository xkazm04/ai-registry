---
layer: technique
type: technique
subject: candidate-communication-integrity
technique: candidate-locale-resolution-authority
status: forged
laws: [absence-of-evidence-is-not-evidence, meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
shared_with: []
use_when: [choosing the language of a candidate-facing message, adding a locale field to candidate records, a multi-language or multi-market hiring workspace]
---

# Candidate locale resolution authority

## The concern

A message a candidate cannot read is a message that was not sent — with the added
insult that your record says it was delivered, so nobody looks again. Language is
therefore not a rendering preference sitting next to font size. It is a property
of the recipient, and it needs a **single resolution authority**: one function,
one order, one explicit answer for the unrecorded case.

The failure that teaches this is always the same. A product ships in one language,
acquires a locale field later, and every record created before that field existed
has no recorded choice. A naive default — the author's language, the process
locale, the browser of whoever triggered the batch — then addresses an entire
back-catalogue of people in a language they do not read, under a brand they know
in another. Dozens of candidates receive a decision they cannot parse, and the
organisation looks either careless or foreign, in a market where it is neither.

## The three-step authority

Resolve in this order, first hit wins:

1. **The candidate's own recorded choice** — the language they applied in,
   selected in a portal, or explicitly stated. This outranks everything,
   including the workspace's market.
2. **The workspace or hiring-entity default** — the language this brand speaks in
   this market. It is a genuine signal: a local employer writing to local
   applicants.
3. **The application default** — the last resort, and a *declared* one.

Two properties make it an authority rather than a chain of guesses:

- **The unrecorded case is a fall-through, not a match.** Step one must
  distinguish "chose this language" from "has no recorded choice", and the second
  must not be coerced into the first
  ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
- **Every message records the locale it was composed in and which step supplied
  it.** Otherwise the incident above is undiagnosable after the fact; you cannot
  tell a wrong language from a right one nobody logged.

## Procedure

1. **Put the resolver in one place** and have every composition path call it.
   Template rendering, preview, and dispatch must agree; a preview in one language
   and a send in another is its own integrity failure.
2. **Infer at write time from what the candidate actually wrote, and store it.**
   The languages a candidate states on their own documents are legitimate
   evidence about how to address them — unlike their name or nationality, which
   are not. Where an intake path has no explicit choice, derive from the stated
   languages, store the result so the record carries a truthful locale going
   forward, and leave it unrecorded when there is no signal at all. Use the same
   derivation in every intake path; two intake paths with two rules produce two
   populations addressed differently for no reason anyone can reconstruct.
3. **Prefer a read-time fallback over a migration for the legacy cohort.** A
   backfill guesses once, permanently, and erases the fact that nothing was ever
   recorded. Resolving at each dispatch through the workspace default keeps the
   unrecorded case honestly unrecorded, and lets it be corrected the moment the
   candidate tells you anything.
4. **Resolve once per message and carry it.** Subject, body, date formats,
   deadline phrasing and any link text derive from the same resolved value. A
   subject line in one language over a body in another is a common and revealing
   bug.
5. **Persist structured facts, compose prose at render time.** Never freeze a
   generated sentence in the producing process's language into a durable record;
   the next reader, the next jurisdiction and the audit export all need it
   recomposed ([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).
6. **Fail visibly on a missing translation.** A template with no version in the
   resolved locale must raise, not silently serve the default language. Silent
   fallback is how a single untranslated string ships to a whole market.

## Decision rules

- **When the candidate's recorded choice conflicts with the workspace market,
  the candidate wins.** They told you; the market is an inference about them.
- **When no choice is recorded and the workspace serves one market, use the
  workspace default and record that this is what happened.** It is the best
  available answer, but it is not the candidate's answer, and the record must not
  claim it was.
- **When a message is legally consequential** — an adverse decision, a data-rights
  notice, an offer — and the resolved locale came from step three, treat that as a
  quality signal worth a human's attention before dispatch, not after.
- **When a candidate replies in a different language from the one you used, that
  is a recorded choice.** Update the field; do not keep addressing them in the
  language of an old inference.
- **Never infer locale from a name, a nationality, or a place of residence.**
  That is an inference about a person made from a protected-adjacent attribute
  and it does not belong in a hiring system
  ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).

## When not to use this

- **Single-market, single-language operations** need only the honesty half:
  record the locale anyway, so the day a second market opens the back-catalogue
  is not a silent cohort.
- **Machine translation of a decision letter is not a substitute for this
  authority.** Resolving the right locale and then generating an unreviewed
  translation of an adverse decision moves the risk rather than removing it;
  that is a content decision belonging to the subject that owns what a decline
  says.
- **Recruiter-facing internal surfaces** follow the operator's own interface
  language and are outside this authority entirely.
