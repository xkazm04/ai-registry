---
subject: chat-transcript
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# chat-transcript

First note for the subject. Created by intake run `intake-chatterino2` (2.3.2) on 2026-09-03; the subject predates it.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

Technique pair from a desktop chat client that paints its own rows:
`immutable-model-cached-layout` (freeze the message at the transcript's door; every view
keeps its own layout cache keyed by width and flags; invalidation is a stamp, never a
mutation - the source's stamp is app-wide, recorded as a shortfall) and
`virtual-filtered-channel` (a filtered or merged view is itself a channel subscribing to
its sources with its own bounded buffer, so the surface renders only channels). Two
`cpp--` applications. Unapplied in the fleet: no fleet transcript paints its own rows;
return condition recorded. The golden path gained one linking sentence and the two slugs.
