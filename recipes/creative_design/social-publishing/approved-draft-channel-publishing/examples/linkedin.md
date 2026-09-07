# LinkedIn as a direct `social` destination

What was learned mapping this recipe onto LinkedIn specifically. Nothing here is part of
the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**A repeat is rejected rather than silently accepted, which is a gift.** The recipe worries
about a timeout that actually succeeded turning into two posts. Here the second attempt
comes back as a rejection instead of a duplicate, so the safe recovery is to retry once and
read the rejection as evidence that the first attempt landed, then go and find the link.
Treat that rejection as a success path rather than an error, or the recipe reports a failure
for a post that is live.

**The publishing identity is not one thing.** A personal profile and an organization page
are different destinations with different permissions, and an approval that says LinkedIn
has not said which. Settle it at adoption. The failure when it is unsettled is a post that
goes out as a person when the team believed it went out as the company, and nothing in the
publish path notices.

**Link previews are assembled at post time and are part of what the audience sees.** The
approver saw the copy; the audience sees the copy plus whatever preview the platform builds
from the link. Where the preview matters it belongs inside what is approved, and where it
cannot be controlled that is worth saying to the approver rather than discovering after
publication.

## What transfers to any direct destination

- Find out how the destination treats a repeat before designing the retry. Rejected,
  accepted and silently deduplicated need three different recoveries.
- The channel named in an approval is rarely specific enough to be a destination. The
  identity is a separate binding.
- Anything the platform adds at post time is part of what the audience sees, and therefore
  part of what should have been approved.
