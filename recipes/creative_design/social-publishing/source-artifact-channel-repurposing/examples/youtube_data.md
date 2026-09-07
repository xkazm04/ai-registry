# YouTube Data as the video source connector

What was learned mapping this recipe onto YouTube Data specifically. Nothing here is part
of the recipe: swap the connector and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**It returns metadata, not the words.** The surface here is search, channel statistics,
playlists, comments and trending content. There is no caption or transcript retrieval, so a
video resolved through this connector alone gives a title, a description and numbers, and
this recipe needs the argument the video made. An earlier version of this work assumed
captions were fetchable and that assumption does not hold. Establish at adoption where the
transcript comes from: a separate transcription step, the creator's own script, or the
adopter pasting it. A variant written from a title and a description is a guess about what
the video said.

**Description text is written for the platform, so it is a poor substitute.** It carries
timestamps, links, sponsor copy and channel boilerplate, all of which read as content to a
naive extraction and none of which is the claim. Where the description really is the only
source available, that is worth saying out loud in the draft handed to the approver rather
than absorbing it silently.

**Comments are available and are a genuinely different input.** They tell you which part of
the piece landed and what people misunderstood, which is exactly the judgment the recipe's
decide step is making. Using them is optional, and if used they are evidence about
reception rather than about the claim, so they should not end up as material inside a
variant.

## What transfers to any video source connector

- Ask whether a connector can return the words before designing around it. Metadata is not
  a transcript, and the failure is quiet: a plausible draft written from a title.
- Platform-authored description text is boilerplate as often as it is content.
- Where the source could not be fully resolved, that belongs in what is handed to the
  approver, because they are the only one who can tell whether the guess was right.
