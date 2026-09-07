# Notion as the `knowledge_base` connector

What was learned mapping this recipe onto Notion specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The checkpoint has to be a database property, not a sentence in the page.** This recipe
only works if something can find the decisions whose checkpoint has come due without
reading every page. In Notion that means the decision record is a row in a database with
a real date property, filtered on, and the checkpoint date written into it at the moment
of the decision. A checkpoint recorded in the page body is a checkpoint that will be found
by a human remembering to look, which is exactly the failure the recipe exists to remove.

**Page versus row is the whole storage question, and it is decided once.** Notion exposes
top-level pages and databases as two different things. The scored comparison, the
pre-mortem and the reasoning are long prose and belong in the page body; the checkpoint
date, the status, the confidence and the decision class belong in properties, because
those are the fields the return step queries and the fields a later similar decision is
found by. Getting this backwards is silent: everything still gets written, and nothing can
be retrieved.

**The verdict must not overwrite the prediction.** A Notion page edits in place, so the
obvious implementation of the checkpoint step is to update the record with what happened,
which quietly destroys the only thing the record was for. The prediction, the stated
confidence and the falsifier are written once and never edited; the verdict is appended
beneath them, or written as a linked child row. If the page shows only the current view,
a later reader is reading a decision that agrees with its own outcome.

**A locked weight needs to look locked.** Nothing in Notion stops a weight being edited
after the scores are in, and an edit leaves no trace a reader would notice. Record the
weights and their ranges as their own block, timestamped, before the scoring block exists,
so the ordering is visible in the document rather than trusted.

## What transfers to any knowledge base

- The checkpoint date must live somewhere queryable by date, or the return step does not
  happen at all.
- Prose and retrieval keys are different storage decisions and the split is made once, at
  adoption.
- The record written at the time of the decision is append-only. A verdict that overwrites
  a prediction leaves a record that can only agree with the outcome.
- If the order in which fields were written is load-bearing, the store has to show it.
