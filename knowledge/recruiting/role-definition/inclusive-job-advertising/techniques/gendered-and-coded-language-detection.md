---
layer: technique
type: technique
subject: inclusive-job-advertising
technique: gendered-and-coded-language-detection
status: forged
laws: [inference-must-look-like-inference, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [reviewing posting copy for gendered or coded wording, a role attracts an unbalanced applicant pool, translating a manager's adjective into a behaviour]
---

# Gendered and coded language detection

The concern: wording that signals who the role is for without ever stating a
preference. It comes in two forms with different remedies — **explicitly
gendered terms** (a gendered job title, a gendered pronoun for the incumbent,
an explicit gendered pair) and **coded adjectives** whose literal meaning is
neutral but whose measured effect on readers is not.

The evidence base for the second form is real and smaller than its reputation.
In laboratory studies, advertisements loaded with masculine-coded adjectives —
*aggressive*, *competitive*, *dominant*, *assertive*, *fearless*, *driven*, and
the *rockstar / ninja / warrior* family — reduce the degree to which women
report that a job appeals to them and that they would belong in it, while
leaving men's ratings unchanged. The mechanism is belonging, not competence:
readers do not conclude they cannot do the job, they conclude it is not their
environment. The original work found masculine wording concentrated in
male-dominated fields and no matching pattern for feminine wording, which is
why the masculine-coded list is where a check looks; it did not establish a
weaker mirror effect, and nothing here should claim one.

On real applicant pools the effect shrinks and varies:
- a preregistered replication held for start-ups and not for established firms;
- a study of hundreds of thousands of job-board postings found wording barely
  moved women's inquiries, and its attached field experiment found no
  significant effect;
- a single employer's rewrite of one male-dominated role raised the share of
  women applying by about four points and held for ten months;
- a grammatical-neutrality treatment raised women's applications only while
  few competing advertisements carried it.

So a coded-language pass is cheap, worth doing, and not a lever to promise an
outcome from. Its effect is measured at the employer's own funnel, not
borrowed from the literature, and it is expected to fade as the whole market
adopts the same wording.

## Procedure

1. **Separate the two forms before detecting.** They have different
   confidence levels and different fixes, and merging them into one "inclusive
   language" bucket makes both findings weaker.
2. **Explicit gendered terms** — a gendered occupational noun with a neutral
   standard alternative, a gendered pronoun referring to the future
   post-holder, an explicit gendered qualifier attached to the role. These are
   high confidence and mechanically fixable: substitute the neutral form.
3. **Coded adjectives** — match the researched list, in the document's
   language. These are lower confidence and are never mechanically fixable,
   because the writer meant something by them.
4. **For every coded hit, demand the behaviour.** The finding's payload is a
   question, not a substitution: *what does the person actually do that made
   you write this word?* "Aggressive" becomes "negotiates contested priorities
   with senior stakeholders and holds the line under pushback". "Rockstar"
   becomes a seniority level and a scope. The behavioural version is more
   informative, harder to fake in an interview, and neutral by construction.
5. **Count density, not just presence.** One coded adjective in a long posting
   is noise; five is a voice. Where the check can afford a second pass, report
   the count alongside the individual hits: the studied manipulations varied
   the loading of a whole advertisement, never a single word, so one hit is
   weak evidence of anything.

## Decision rules

- **When a gendered term has a standard neutral form, replace it.** No
  discussion required; this is the cheapest correct edit in the subject.
- **When a coded adjective survives translation into a behaviour, keep the
  behaviour and drop the adjective.** The adjective was compression, and the
  decompressed version is what the reader needed.
- **When a coded adjective does not survive translation — the writer cannot
  say what the person does — delete it.** A word that decompresses to nothing
  was decoration with a cost attached.
- **Grammatical gender is not a preference, and not a defence either.** In
  languages with grammatical gender, the masculine form of an occupational
  noun is often the unmarked citation form. Flagging every posting for it at
  one severity produces a check that is either universally noisy or, once
  suppressed, universally silent. Always flag what is a *choice*: a gendered
  adjective describing the person, an explicit gendered qualifier, a
  single-gender form where the paired form is the local convention. For the
  **bare unmarked title** itself, the severity comes from the posting's
  jurisdiction, not its language:
  - where courts treat a title that is not gender-neutral as an indicator of
    discrimination, it is a finding, and the fix is the local neutral or
    all-genders form;
  - where the equality body holds the generic form lawful and pairing good
    practice, it is a low-severity suggestion to pair the forms;
  - where equal-pay law now requires gender-neutral job titles, as the EU
    pay-transparency directive does, the stricter reading is the one to plan
    for, whatever older local guidance said.

  A *marked* single-gender title, such as the feminine form alone, is a choice
  rather than grammar, and it has been held against employers in both kinds of
  jurisdiction. [Meaning does not live in a
  label](../../../_laws.md#meaning-does-not-live-in-a-label) applies literally
  here: the rule keys off what the wording does in that language and that
  jurisdiction, never off a surface string carried over from another one.
- **Present findings as advice, in the grammar of advice.** A pattern match is
  a heuristic about text, not a measurement of the writer's intent or of the
  posting's real-world effect. Per [inference must look like
  inference](../../../_laws.md#inference-must-look-like-inference), it renders as
  a suggestion with its reason attached — never as a compliance verdict, a
  score, or a bias percentage that implies a measurement nobody took.

## When not to use it

- **Not for enforcing a legal conclusion.** Whether wording constitutes a
  discriminatory advertisement is a jurisdictional question with facts beyond
  the text — the multi-jurisdiction discipline owns that, and a lint that
  claims it will be both wrong and relied upon.
- **Not on the candidate's own text.** A résumé, a cover letter or an
  interview transcript is a person describing themselves. Running a
  coded-language check over it converts a posting-quality tool into a device
  that scores a person's vocabulary — an adverse inference about an individual
  drawn from style, which is exactly what this domain forbids.
- **Not as a scoring axis.** A "bias score" for a posting invites optimization
  against the number: the writer strips adjectives, the score improves, the
  pool does not. Findings are named phrases with named fixes, or they are
  theatre.
- **Not without a suppression path.** Some hits are genuinely wrong — a
  product name, a quotation, a role that really is about physical strength.
  A check with no way to say "not here, and here is why" gets disabled
  wholesale, and the eighty percent of findings that were right go with it.
