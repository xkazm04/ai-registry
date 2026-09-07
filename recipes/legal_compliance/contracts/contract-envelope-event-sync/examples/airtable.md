# Airtable as the `spreadsheet` connector

What was learned mapping this recipe onto Airtable specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The record may not exist yet when the event lands.** Events arrive out of order, so the
first one about an envelope can be a signature on a row nobody created. An update that fails
because the record is absent must create it rather than dropping the event, which means every
write is an upsert keyed on the envelope's own identifier and never on the row id the base
generated. Storing the envelope identifier in an indexed field is the first thing to set up,
because without it the upsert degrades to a full scan on every event.

**A single select field will reject a status it has never seen.** Adding a new stage on the
platform produces a write that fails on a field the base considers closed, and the failure is
per record rather than per run, so it looks like one bad envelope instead of a schema
mismatch. Either keep the stage as free text and accept the untidiness, or fail loudly on an
unknown option rather than swallowing it.

**Time in stage has to be stored, not derived.** The base can tell you when a row was last
modified, and last modified changes when anything at all is written, including a routine
field update. Keep an explicit field for when the current stage was entered, written only
when the stage actually changes, or the stall detection will reset itself every time the
record is touched.

**Rate limits are per base, and a burst of events looks like an attack.** A batch of
recipients completing at once produces a burst of writes into one base that other work is
also writing to. Batch the writes for one envelope into a single update rather than one per
field, and back off on the limit rather than retrying immediately, because a retry storm
holds the limit open for everyone using that base.

## What transfers to any spreadsheet or table connector

- Key every write on the external identifier and make it an upsert, because out of order
  events mean the row may not exist yet.
- A closed set of allowed values is a schema that will drift; decide whether an unknown value
  fails loudly or is stored as text, and never let it fail silently per row.
- Last modified is not when the stage changed. Store the transition time yourself.
