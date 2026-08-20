---
layer: technique
type: technique
subject: pre-boarding-and-first-day-handoff
technique: language-neutral-template-keys
status: forged
laws: [meaning-does-not-live-in-a-label, say-only-what-the-record-holds]
shared_with: []
use_when: [storing checklist or questionnaire copy that another reader will see later, localizing a new-hire facing surface, deciding whether to persist a sentence or a reference]
---

# Language-neutral template keys

A checklist item and a questionnaire field are authored once and read many times, by
people who do not share a language with the author or with each other. The technique
is to persist a **stable key** and resolve it to a sentence at read time, keeping the
authored text only as a fallback for rows whose key was deliberately dropped.

## The three readers, none of whom share a locale by construction

The reason this is not over-engineering is that the reader set is fixed and known in
advance:

1. **The author** — a recruiter or people-team member, working in their own language,
   who pressed save.
2. **A colleague in the same workspace** — templates are workspace-scoped, not
   personal, so anyone on the team may open, run and edit them. In any organisation
   with more than one office, that colleague's language differs from the author's
   routinely.
3. **The new hire**, weeks or months later, on a page of their own, in a browser set
   to their language — which is the one language nobody in the loop chose.

Materialising the sentence in whichever language happened to be active when someone
pressed save pins all three readers to that one locale, permanently, for every hire
that template ever runs. This is the general case of
[meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label):
prose frozen in the producing machine's language is unreadable to the next reader.

## The mechanism

**Store a reference, not a sentence.** Every shipped item and field carries an
identifier that is simultaneously its row identity and its catalog key. The render
site resolves the key against the reader's catalog and falls back to the stored text
when the key has no entry.

The fallback text is not decoration and must be kept. It is what a row shows in two
real situations:

- **A row whose canonical identity was deliberately dropped**, because an author
  edited its text before saving. If someone rewrites "Order laptop and equipment" into
  their own words, that row is no longer the shipped item; it is a custom item whose
  authored label is the copy of record. Slugify it away from the canonical key rather
  than resolving a key whose sentence no longer matches the row.
- **Every row written before the mechanism existed.** Which leads to the property
  that makes this cheap to adopt.

**Nothing persisted is rewritten.** Existing rows keep their stored text and simply
begin resolving the moment their identity is canonical. No migration, no history
rewrite, no risk of a batch job re-authoring a hundred templates into the wrong
words. A localisation mechanism that requires a data migration to adopt is one that
gets deferred forever.

**Keys are shared only where the sentence is genuinely identical.** Reuse a key
across presets when the step is the same step; mint a distinct key the moment the
sentence differs. One catalog entry cannot serve two different steps, and forcing it
to produces a translation that is wrong for at least one of them.

**Dropdown and heading copy is interface, not row data.** Preset names, sector labels
and section headings are read directly from the catalog and never copied into stored
rows at all — they have no authored variant, so they have no fallback problem.

## The coverage trap

The failure mode that survives a correct design is **partial catalog coverage**. A
system localises the handful of default fields, ships forty sector-specific ones with
no catalog entries, and falls back to authored text for all of them. It then reports
itself as localised.

The cohort that suffers is exactly the one the sector presets were built for: the
clinical, trades and frontline hires who are least likely to be reading in the
organisation's working language. A hire reading in one language sees five fields in
their own and six in someone else's, on the single most consequential form the
organisation has ever sent them.

Two rules follow.

- **Every key a shipped preset introduces has a catalog entry in every supported
  language, or the preset does not ship.** Coverage is a release gate on the preset,
  not a follow-up ticket.
- **A comment or a document claiming the mechanism prevents drift must be true.** The
  common version — "the field list is server-driven, so the two can't drift" — is
  correct about the *set* of fields and silently false about their *text*. Overstated
  coverage claims are how the gap survives review;
  [say only what the record holds](../../_laws.md#say-only-what-the-record-holds)
  applies to a system's claims about itself as much as to its claims about a person.

## Extending the same rule beyond copy

The same discipline governs anything composed on one side and read on another.
Machine-facing refusals and error states travel as **stable codes**, resolved to a
sentence by whichever surface renders them, with the canonical text kept for logs and
for programmatic consumers. A public, token-authenticated page shown to a new hire is
precisely where a generic fallback message costs the most, because the specific reason
is the entire point of the page.

## Decision rules

- **When a string is composed on the server ahead of its reader, store the reference.**
  When it is composed at render time in front of its reader, translate normally.
- **When an author edits a shipped row's text, drop the canonical key.** They chose
  their words; honouring the key would silently overwrite them for other readers.
- **When adding a preset item, add its catalog entries in the same change.** Not the
  same sprint — the same change.
- **When no catalog entry resolves, render the fallback and treat it as a defect
  signal, not a normal path.** Count fallbacks; a rising count is coverage rotting.

## When not to use this

- **Single-language deployments with no plan to add one.** Store the sentence and
  keep the identity anyway — identity earns its keep for reporting and edit-tracking
  even without translation.
- **Genuinely free-text content** an author wrote for one specific hire: a personal
  note, a role-specific instruction. There is no key for a sentence written once.
- **Proper nouns and named constants** — an organisation's name, a site name, a
  document title with legal identity. These are not copy and must not be translated.
- **As a reason to forbid custom items.** Authors need to write their own steps; the
  mechanism exists to serve shipped content well and to get out of the way of the rest.
