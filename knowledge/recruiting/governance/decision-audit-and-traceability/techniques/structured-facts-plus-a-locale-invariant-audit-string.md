---
layer: technique
type: technique
subject: decision-audit-and-traceability
technique: structured-facts-plus-a-locale-invariant-audit-string
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
shared_with: []
use_when: [deciding whether to persist a sentence or its parts, localizing an operator surface that shows audit data, making audit records queryable across languages]
---

# Structured facts plus a locale-invariant audit string

## The concern

Two opposite mistakes, one root cause — confusing the *record* with the *rendering*.

The first mistake persists the sentence. A decision is made, a message is composed —
"Held: score 62 below the 70 threshold for senior backend" — and that string is written
into the record. It is now frozen in whatever language the producing machine happened to
be configured for, in whatever phrasing that release shipped. It cannot be filtered,
counted, or grouped. A reader in another jurisdiction gets a sentence they cannot read, and
a reader in the same jurisdiction three releases later gets phrasing that no longer matches
anything else in the system. Per
[meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label), prose
frozen in the producing machine's language is a compliance problem, not a cosmetic one.

The second mistake localizes the record. A team with a working translation layer runs
everything through it, including the audit surface — and now the approver's name is
transliterated, the sealed rationale is machine-translated at render, and the same record
produces different sentences for different readers. An audit trail whose content depends on
who is looking is not a trail. If a claimant's exhibit and your internal export disagree
about what the record says, you will spend the hearing explaining your i18n layer.

## Procedure

**1. Persist the parts, compose the sentence at render.**
Seal typed facts: an outcome code, a score, a threshold, a rule version, an identifier of
the axis or requirement in question. The reader's surface composes "Held: score 62 below
the 70 threshold" from those parts, in the reader's language, at read time. The composed
sentence is disposable; the parts are the record.

**2. Draw the localization boundary explicitly, and comment it.**
Two categories never pass through the translation layer, and they must be named where the
exception lives or the next contributor will "fix" the inconsistency:

- **Identities.** An approver's name, a candidate's name, an actor token. A person's name
  is a fact, not a string to be adapted.
- **Sealed content.** The rationale text as it was written, a verbatim clipped model
  reasoning, a reason code's canonical token. The canonical form stays in one language
  forever.

Everything else on the surface — labels, headings, units, dates, the composed sentence —
localizes normally. The rule to write down: *chrome localizes, content does not.*

**3. Where a canonical sentence must be stored, store it as an invariant string.**
Some records genuinely need a frozen human-readable line: a rationale a person typed, a
sealed summary that a hash covers. Store exactly one canonical form, always in the same
language, always in the same format, and label it as canonical in the schema so nobody
translates it in place. Render a translation *beside* it if readers need one, never
*instead* of it, and never let the translation be what the hash covers.

**4. Keep the audit string byte-stable.**
Anything a hash covers, or anything compared across systems, must not depend on locale-
sensitive formatting. Fix the number format, the date format (a single unambiguous
absolute format with an explicit offset), the decimal separator, the sort order, and the
text normalization form. A record that hashes differently on a machine configured for a
different region is a record that will fail verification for a reason no one will diagnose
under time pressure.

**5. Migrate by accepting both shapes, never by rewriting history.**
A store that already holds frozen prose cannot be fixed retroactively — rewriting old
records to add structure is exactly the edit an append-only store forbids. So the reader
accepts both: a structured payload composes normally, and a legacy record falls back to
rendering its stored sentence as-is, visibly marked as legacy prose. New writes are
structured from the cutover. This leaves an honest seam in the data rather than a
laundered one, and the seam's date is itself a useful fact.

**6. Version the composition, not just the data.**
When the rendering rule changes — a new sentence template, a new label — old records must
still compose correctly. Keep the fact vocabulary additive: new codes are added, old codes
are never repurposed, and a code the renderer does not recognise renders as itself rather
than disappearing.

## Decision rules

- **When a field will ever be counted, grouped or filtered, it is structured.** "How many
  candidates were held for this reason last quarter" is a query over codes and an
  impossible text-mining exercise over sentences.
- **When a field is a person's own words** — a recruiter's typed note, a candidate's
  message — persist it verbatim, unlocalized, and never paraphrase it into structure. Per
  [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds), a
  structured summary of someone's free text is a claim they did not make.
- **When a model produced reasoning that a human read**, seal a short verbatim clip in the
  inputs, in its original language, marked as model output. It is traceability evidence,
  not a rationale, and the two must not be rendered alike.
- **When in doubt between a code and a sentence, seal both** — the code as the record, the
  sentence as a convenience — but make the code authoritative and make the schema say so.

## When not to use this

- **Where the structure would be fake.** Forcing genuinely open judgment into an enum
  produces a code that means "other" ninety percent of the time, which is worse than free
  text because it looks like data. Codes earn their place by having a stable, small,
  meaningful set; if you cannot enumerate one, keep the prose and accept that it is not
  queryable.
- **On the candidate-facing side.** What a candidate is shown must be in *their* language
  and their register; the invariant-string rule is an operator-side and record-side rule.
  The composition happens at the boundary, from the same structured facts — which is
  exactly why the facts, not the sentence, are what you sealed.
- **As a reason to strip nuance from an interview note.** Structure the decision, not the
  observation. A scorecard's evidence quote is content; the rating attached to it is
  structure. Collapsing the first into the second loses the only thing that made the rating
  defensible.
