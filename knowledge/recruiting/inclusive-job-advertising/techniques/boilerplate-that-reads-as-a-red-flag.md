---
layer: technique
type: technique
subject: inclusive-job-advertising
technique: boilerplate-that-reads-as-a-red-flag
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [reviewing posting copy for filler phrases, a posting gets views but few applications, deciding whether to rewrite or delete a vague phrase]
---

# Boilerplate that reads as a red flag

The concern: a small, stable set of phrases that appear in most job
advertisements are not merely weak writing. They are **decoded by experienced
readers as concrete negative claims about the employer**, and they occupy the
slot where the fact the reader wanted would have been. Handling them as a style
problem produces a smoother posting that converts identically. Handling them as
*missing facts wearing a phrase* is what changes the applicant count.

## The decoding table is the whole technique

Each offender is paired with (a) what the reader hears and (b) the fact it is
standing in front of. The fix is always to supply the fact or delete the
phrase — never to substitute a fresher euphemism.

| Phrase family | What the reader hears | The fact behind it |
| --- | --- | --- |
| competitive salary, attractive package, salary commensurate with experience | we will not tell you the number, so it is not good, or you will be priced on what you will accept | the band, with currency and period |
| dynamic environment, fast-paced, thrive under pressure | the work is unplanned and the hours are not the stated hours | how work arrives, and what on-call or overtime actually is |
| we're like a family, one big team | boundaries will be read as disloyalty | the actual norms: hours, response expectations, leave |
| work hard, play hard | long hours with social compulsion attached | the schedule |
| wear many hats, no two days are the same | the role is underscoped and you will absorb the gap | the first ninety days, in outcomes |
| rockstar, ninja, guru, wizard | the advertisement is about the employer's self-image | the seniority level and the scope |
| passionate about, must love | unpaid enthusiasm is part of the compensation | what the work actually is |
| exciting opportunity, market leader, industry-leading | nothing at all — pure filler | why this role exists now |

The table is short on purpose. A lint carrying two hundred phrases fires on
every posting and gets ignored; a lint carrying the fifteen highest-frequency
offenders in each language fires on real problems and gets read.

## Procedure

1. **Detect on the rendered advertisement**, not on the structured requisition
   behind it. The phrase problem is a property of prose, and prose is where it
   is committed. Run against the assembled body the reader will see, including
   any templated header or footer.
2. **Match case-insensitively on whole words** with a phrase-level pattern.
   Substring matching produces false hits inside longer words and is the single
   most common reason a lint is turned off.
3. **Report the phrase, the decoding, and the replacement fact** — three parts,
   always. A finding that says only "avoid 'competitive salary'" leaves the
   writer to guess, and the guess is usually a synonym.
4. **Report the phrase exactly as written, in document order, once each.**
   Three sub-rules that decide whether the panel is usable:
   - *As written* — the writer scans their own text for the string they see in
     the finding. A normalized or lemmatized rendering of the phrase forces
     them to hunt.
   - *Document order, not severity order* — the writer reads their draft
     top-to-bottom with the findings beside it. A list re-sorted by severity
     makes them jump around their own document. Severity belongs in how a
     finding is *marked*, not in where it sits.
   - *First occurrence per phrase, deduplicated case-insensitively* — the same
     filler used four times is one problem. Four identical findings read as a
     broken tool.
5. **Mark, do not reorder, by cost.** A missing pay statement outranks
   "exciting opportunity" by a wide margin, and the finding should say so — but
   it says so through its kind and its emphasis, while keeping its place in the
   text.
6. **Do not auto-rewrite.** The replacement requires a fact the checker does
   not have. Offering a generated substitute invites the writer to accept a
   number or a benefit nobody approved — which converts a vagueness problem
   into a false-claim problem, a strictly worse trade.

## Decision rules

- **When a phrase gestures at a fact and the fact is known, replace it with the
  fact.** "Competitive salary" becomes the band. This is the only fix that
  improves conversion.
- **When the fact is not known, delete the phrase and escalate.** Silence in
  the pay slot is honest and neutral; a euphemism in the pay slot is a signal.
  Per [say only what the record holds](../../_laws.md#say-only-what-the-record-holds),
  the posting states what was actually decided or says nothing — and per
  [absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence),
  "no band recorded" must render as an undecided posting to the author, never
  as a posting that passed the pay check.
- **When the phrase is pure filler with no fact behind it, delete it and add
  nothing.** Shorter is the improvement.
- **When the writer insists the phrase is true** — the environment genuinely is
  fast-paced — require the concrete version. "Two thirds of the work arrives
  as unplanned incident load; the rota is one week in five." If the concrete
  version is unattractive, that is information the reader is entitled to and
  the euphemism was concealing.

## When not to use it

- **Not as a publication block.** These phrases are advisory findings. A hard
  gate on a word list trains writers to rephrase past the checker, and the
  rephrased posting is not better.
- **Not on non-advertisement text.** Internal requisitions, scorecards and
  offer letters have different readers and different economics; a scorecard may
  legitimately say "fast-paced" to an interviewer as shorthand.
- **Not on quoted material.** A posting quoting an employee ("she described it
  as fast-paced") is reporting speech, and flagging it is a false positive that
  costs credibility across every other finding.
- **Not as a substitute for measuring conversion.** The phrase list is a
  hypothesis about what deters readers. The view-to-apply rate is the
  measurement. When they disagree, the measurement wins and the list gets
  edited.
