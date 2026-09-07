# HubSpot as the `crm` connector

What was learned mapping this recipe onto HubSpot specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**Two scoring systems on one record is the real hazard.** HubSpot has its own lead
scoring and its own workflow notifications, and an adoption that computes a second
judgment beside them produces a record where the alert says one thing and the property on
screen says another. The salesperson believes the screen. Either write this recipe's
judgment to a clearly named property of its own and say in the alert which one it is, or
let HubSpot's score stand and have this recipe route rather than score. Deciding not to
decide is what produces the disagreement.

**A contact and a deal are different records with different links.** The alert wants
whichever one the person actually works in, and for a fresh enquiry that is usually the
contact rather than a deal that does not exist yet. Establish the target object at
adoption; a link that resolves to the wrong object still opens, which is why this one is
easy to get wrong and hard to notice.

**Ownership already exists here, so do not build a second owner list.** The contact owner
property is the routing source this recipe needs, and maintaining a separate mapping
beside it guarantees the two drift and that leads start going to somebody who left. Read
the owner from the record, and treat an unowned record as a case the threshold has to
handle rather than as an alert with nowhere to go.

**The record has to be readable before the alert points at it.** When intake and alerting
are separate adoptions there is a window in which the write has been accepted and the
record is not yet visible, and an alert that links into that window is worse than one
that arrives a few seconds later. Confirm the record before sending, and if the
confirmation fails, hold the alert and say so rather than sending a link that dead ends.

## What transfers to any CRM connector

- Ask what scoring the CRM already does before adding another. A second judgment on the
  same record is a disagreement waiting to be believed.
- Take routing from the ownership field the CRM already maintains, never from a parallel
  list.
- Confirm the record is readable before the alert links to it, because a write that has
  been accepted is not yet a record somebody can open.
