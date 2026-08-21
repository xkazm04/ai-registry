---
layer: technique
type: technique
subject: candidate-ai-disclosure-and-explanation
technique: held-data-derived-from-what-exists
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence]
use_when: [building a what-we-hold-about-you view, answering a data access request, adding a new stored field to a candidate record]
shared_with: []
---

# Held data derived from what exists

The "what we hold about you" inventory must be **computed from the record in
hand**, one entry per thing the record actually contains, at the moment of
rendering. It must never be a hardcoded list of the categories the system is
capable of storing.

## The two failures a static list guarantees

A static list is wrong in both directions simultaneously, and each direction is
its own harm.

**Over-claiming.** The list says "interview recording and transcript" for
someone who never reached an interview. The person now believes a recording of
them exists. They may request its deletion, dispute its contents, or worry about
where it is. The organisation has manufactured a data subject's concern about
data that does not exist, and has made a false statement in the most
consequential place to make one — an access response.

**Under-claiming.** A later feature begins storing an enrichment, a derived
attribute, a model's reading of a document. Nobody updates the list. The
inventory is now incomplete, which is the failure that turns a routine access
request into a finding: the organisation demonstrably held data it did not
disclose.

Derivation eliminates both by construction. The list cannot claim what is not
there, and it cannot miss what is, because it is the same traversal in both
cases.

## Procedure

1. **Enumerate the record's actual fields** for this person, including
   attachments, derived attributes and decision history entries.
2. **Map each present field to a candidate-legible category** — the submitted
   history, the responses to screening questions, the assessment record, the
   messages exchanged, the decisions taken. Absent fields produce no entry.
3. **Do not emit a category with a count of zero or an empty placeholder.** "No
   interview record" is an entry about something that does not exist; omit it.
4. **State the source of each category**, distinguishing what the person
   supplied from what the organisation derived or obtained elsewhere. A derived
   attribute must be visibly labelled as derived, because a person cannot
   correct what they do not know was inferred.
5. **Bind erasure to the same traversal.** The list that enumerates is the list
   that deletes. Two separate enumerations drift, and the drift is discovered
   when erasure silently leaves something behind.
6. **Confirm erasure from its effect, not from its completion.** Report success
   only when the scrub demonstrably altered a record. The observed failure:
   a tenant-scoped delete whose predicate matched no row for anyone outside the
   default tenant, returning a cheerful confirmation while the person's name,
   contact, parsed history and interview transcript stayed fully readable
   internally. Nothing threw. Everyone involved believed the right had been
   honoured.

## Decision rules

- **Presence is the only test for inclusion.** Not configuration, not the
  feature's availability on this plan, not what the pipeline usually produces.
- **A new stored field is disclosed the moment it is stored**, because the
  derivation reaches it without anyone remembering to. This is the property that
  makes the technique worth the extra code.
- **Categories are the candidate's vocabulary, not the schema's.** Deriving from
  the record does not mean dumping column names; map each present field to a
  sentence a person can act on.
- **Counts and dates, not contents, in the inventory.** The inventory answers
  *what exists*; the contents belong to the export or access response the person
  can then request.
- **The same projection serves the access response and the on-screen view**, so
  a person cannot be shown one inventory and sent another.

## When not to use this

- **Not for the lawful-basis and retention story.** Why data is held, under
  which basis, for how long, and how erasure is executed belong to the
  consent-and-retention practice. This technique governs only the truthfulness
  of the inventory itself.
- **Not for the operator's data map.** Internal data governance needs the
  complete schema-level catalogue including fields that are empty for most
  records; that is a different artifact with a different audience.
- **Not as a place to surface every internal flag.** Derivation from the record
  is a rule about honesty, not a mandate to expose internal state that is about
  the organisation's process rather than about the person.
