---
layer: application
type: application
subject: draft-editing
technique: draft-model
stack: python
verified_on: 2026-11-16
verified_against: python@3
---

# Python: a CMS autosave that sends the whole record, and refuses it when the version moved

*Read 2026-11-16 in a shallow, sparse clone of the public `wagtail/wagtail`
repository at `3002dd0` (2026-11-13, `VERSION = (8, 2, 0, "alpha", 0)`,
`requires-python = ">=3.11"`), tree unmodified. Only the server side was read
(`wagtail/admin/views/generic/mixins.py`, `wagtail/admin/forms/models.py`,
`wagtail/actions/{create,edit}.py`, `docs/reference/settings.md`); the
client script that drives autosave was not opened, so nothing below says how
the browser schedules or drains a save.*

This is the second stack for the subject, and it was chosen because it takes
the branch the technique used to forbid: the editor posts the **whole form**,
not a diff, and stays safe by making the write conditional. It is the
worked case for the draft-model clause amended on 2026-11-16 — "the
exception is a conditional write, and it has a price".

## The version travels with the save

The edit view puts `loaded_revision_created_at` into the page context
(`mixins.py:837`), and a background save posts back that timestamp with the
revision ids the server then reads (`loaded_revision_id`,
`overwrite_revision_id`; how the client stores them was not read). `is_out_of_date` (`mixins.py:791-820`) decides against the
server's latest revision, in two steps:

- if the session already wrote an autosave revision, it posts
  `overwrite_revision_id`, and the save is current only if that revision is
  still the latest — "Two different sessions cannot have the same autosave
  revision, so if autosave revision is present, it is either the latest or
  it is not";
- otherwise it compares `loaded_revision_id` and then
  `loaded_revision_created_at`, because the latest revision "may have been
  overwritten by another session (via autosave) since the editor loaded
  it" — the id alone is not a version once revisions can be overwritten in
  place.

`is_valid` (`mixins.py:848-852`) refuses the background save when either
test fails: `"Saving will overwrite a newer version."`, error code
`invalid_revision`. The server enforces it; the client's opinion of
freshness is never consulted. That is the precondition the amended clause
requires before a whole record may go on the wire.

## The price is visible in the scope of the check

The refusal is scoped to `expects_json_response` (`mixins.py:979-980`: the
request does not accept HTML), i.e. the background save. The read did not
find the same refusal on the full-page submit in this file; the editing
sessions shown in the page context (`mixins.py:839-844`, built only for the full page) are the human-facing
signal there. So the design spends the conflict cost where nobody is
watching — an autosave that would clobber newer work stops — and leaves the
deliberate save as the "explicit overwrite choice" the technique names.
Because the check compares *versions*, not fields, two people editing
different fields of the same page still conflict: the cost the clause
records, paid here on purpose.

`overwrite_revision` (`mixins.py:547-559`, passed to the edit action) keeps one
revision per session for autosaves instead of minting one per pause, and
refuses a revision id that does not exist rather than creating it.
`WAGTAIL_AUTOSAVE_INTERVAL` defaults to 500 — "The interval (in
milliseconds) to wait since the last edit, before attempting an autosave",
`0` disables it (`docs/reference/settings.md:296-304`, read at `mixins.py:284-285`).

## The draft saves incomplete; the gate is publishing

Saving as a draft defers required fields: `is_valid` calls
`form.defer_required_fields()` when `saving_as_draft` (`mixins.py:873-880`),
which flips each field named in `defer_required_on_fields` to not-required
for that validation and restores it after (`forms/models.py:142-167`). The
actions validate fully only when publishing or when the model has no draft
state: `clean = self.publish or not self.draftstate_enabled`
(`actions/edit.py:74`, `actions/create.py:75`). That is
`completeness-derivation`'s "gates promotion, never persistence" in a second
stack — noted here rather than filed as its own application, because only
the deferral was read, not how the publish surface lists what is missing.

## What this reading cannot show

- Whether the browser side drains a pending save on hide or close, and how
  it renders `invalid_revision`. Not opened.
- Whether the full-page submit has its own staleness check elsewhere (the
  page-specific edit view, `wagtail/admin/views/pages/edit.py:511-525`, has a
  parallel `is_out_of_date`; its callers were not traced).
- Nothing was run. Every claim is a read of the files named.
