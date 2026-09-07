# A note store as the `knowledge_base` connector

What was learned mapping this recipe onto a file backed note store. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**The store has no notion of due, so being due has to be a field somebody keeps.** A note is
never overdue on its own; it is only overdue relative to something written in it. Where the
records carry no date they were last examined, this whole recipe collapses into the age based
review it exists to replace, and the first proposal it should make is to add that field.

**A reader arrives by search, and a search shows the beginning of the note.** Marking a
record superseded in a status line near the bottom changes nothing the reader will see:
they land on the old record, read the first paragraph, and act on it. Put the supersession
in the first thing on the page, above the decision it replaces.

**Archiving usually means moving a file, and moving a file breaks every link into it.**
Prefer archiving by marking over archiving by moving, unless the store resolves links by an
identifier rather than by a path. Where a move is unavoidable, the check for what still
points at the record has to happen before the move and not after.

**Backlinks are this binding's one genuine advantage and they answer the recipe's hardest
question.** Whether anything active still depends on a record is expensive to establish
anywhere else and nearly free here. Use them, and remember they only see references written
as links: a record mentioned by name in prose is depended on and invisible.

**A pass that edits many notes at once lands as a large unexplained change on every device
the folder is synchronised to.** That is how this work loses its owner's trust faster than a
missed stale record ever would. Batch small, and say what changed.

## What transfers to any knowledge_base connector

- Overdue is only meaningful if something records when the record was last examined, and
  that is a different field from when it was last edited.
- Supersession has to appear where a reader lands, not where the schema puts it.
- Whatever the store uses to answer "what still points at this" sees links and not prose,
  so it is a floor on the real dependency.
