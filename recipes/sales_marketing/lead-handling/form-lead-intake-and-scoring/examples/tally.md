# Tally as the `forms` connector

What was learned mapping this recipe onto Tally specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The rubric is bound to labels somebody can rename.** Tally answers arrive keyed by the
question, and a question is editable in the builder at any time by anyone with access. A
rubric that reads "the budget answer" therefore depends on a string outside its control,
and when the string changes the failure is silent: the answer reads as absent, absence
reads as a weak signal, and a stream of serious enquiries quietly starts scoring low. Pin
the mapping to the stable field identifiers at adoption and treat an unmapped field as an
error rather than as an empty answer.

**Hidden fields are the only cheap route for where the submission came from.** Which page
and which campaign produced the enquiry does not exist in the answers unless the form is
built to carry it through as a hidden field or a URL parameter. Without it every
submission looks like it arrived from nowhere and the fit half of the judgment loses its
best free signal. This is form configuration, so it has to be agreed at adoption rather
than discovered later, because it cannot be backfilled.

**Decide whether an abandoned multi step form is a lead.** A partial response is real
evidence that somebody started, and it is not a submission. Counting it as one corrupts
both the deduplication and every rate the adopter reads afterwards, because the same
person will usually finish later. Pick one treatment and record which was picked.

**A form can be built with no identifier at all.** Email is not required and is not
guaranteed unique. If a submission can arrive with nothing to match on, this recipe's
identity resolution has nothing to work with and will create a record per submission by
construction. Establish at adoption whether every in scope form collects something
matchable, and say so plainly when one does not, rather than letting the duplicate rate
be the way it gets discovered.

## What transfers to any forms connector

- Ask what the answer key is bound to. If it is editable prose rather than a stable id,
  the rubric has a dependency on something nobody thinks of as configuration.
- Provenance has to be designed into the form. It cannot be recovered afterwards.
- Establish that every in scope form collects something identity can be resolved on,
  before the first submission rather than after the first duplicate.
