# Notion as the long form `knowledge_base` destination

What was learned mapping this recipe onto Notion specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Publishing here means creating a row in a database that has to already exist and has to
carry the right properties.** A missing database or a renamed property is a setup failure
rather than a content failure, and it should halt this one channel while the others proceed.
It is also the failure most likely to appear months after adoption, when somebody
reorganises the workspace, so the error has to name the database rather than only reporting
that a write failed.

**There is no natural duplicate rejection, so recognising a repeat is entirely the recipe's
job.** Publishing the same piece twice creates two rows and both look correct. Carry a
stable identifier from the approval into a property on the row and query for it before
writing. This is the opposite situation from a platform that rejects repeats, and one
adoption can easily hold both.

**Created is not the same as visible.** A row in a database is not a page anybody reads, and
where the adopter's site or wiki publishes from a filtered view, a piece with the wrong
status property is live by the recipe's definition and invisible by theirs. Establish what
the adopter means by published here, and confirm against that rather than against the write
having succeeded.

## What transfers to any document destination

- Where the destination has no duplicate rejection, the deduplication key is the recipe's
  responsibility and belongs in the record it keeps.
- A structural failure is different from a content failure and should stop one channel
  rather than the piece.
- Ask what published means at this destination. A successful write is frequently not it.
