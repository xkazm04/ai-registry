---
layer: application
type: application
subject: chat-transcript
technique: virtual-filtered-channel
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# Chatterino's ChannelView - three channels, one of them unregistered

Chatterino 2.5.5 (`CMakeLists.txt:71`; Qt 6 required, `CMakeLists.txt:30,100`),
pinned at `fda51f0d3a4a5cd15f099b951b796e299d566e9e`, lets a user open the
same Twitch channel in several split panes, each with its own filter set,
and opens user cards and search popups as nested views over one channel. The
view class realizes the technique's derived-channel object with the three
slots named in the technique; the filter-change path is where it falls
short. Paths are relative to `src/`.

## The three slots

`widgets/helper/ChannelView.hpp:372-397` declares them with the technique's
own vocabulary. `channel_` (`:372-379`) is "a 'virtual' channel where all
filtered messages from `underlyingChannel_` are added to. It contains
messages visible on screen ... it will have the same type and name as
`underlyingChannel_`. It's not know[n] to any registry/server."
`underlyingChannel_` (`:381-387`) is the one passed to `setChannel()`,
"known to the respective registry (e.g. TwitchIrcServer)" and "might contain
more messages than visible if filters are active". `sourceChannel_`
(`:389-397`) is set "in case of 'nested' channel views such as in user
popups" to the original channel, "used to open user popups from this view".
The predicate lives beside them: `FilterSetPtr channelFilters_` (`:404`) and
`shouldIncludeMessage` (`:407`).

## Ingest-time evaluation on every door

`ChannelView::setChannel` (`ChannelView.cpp:945-1100`) creates the virtual
channel as a plain `Channel` with the source's name and type (`:952-953`) -
a `TwitchChannel` source yields a `Channel` derivation, so the derived
object carries no transport. It then subscribes to each source signal and
filters at the subscription: `messageAppended` (`:961-980`), where a passing
message is added with `MessageContext::Repost` so it is not logged twice;
`messagesAddedAtStart` (`:982-995`) and `filledInMessages` (`:1008-1016`),
both `copy_if` over the batch; `messageReplaced` (`:997-1006`); and
`messagesCleared` (`:1018-1021`). The current snapshot is replayed through
the same predicate on attach (`:1026-1055`), building one `MessageLayout`
per admitted row for this view. Only then does the view subscribe to its
*own* virtual channel's signals (`:1067-1093`) - the render path listens to
the derivation, never to the source.

`shouldIncludeMessage` (`:1143-1158`) is the predicate: true when no filter
set is attached, otherwise `FilterSet::filter(m, underlyingChannel_)`, with
one policy exception - the user's own messages bypass filters when
`excludeUserMessagesFromFilter` is set. The comment at `:955-958` states the
retention force directly: "Use a proxy channel to keep filtered messages
past the time they are removed from their origin channel." Both channels are
`LimitedQueue`s sized by `scrollbackSplitLimit` (`common/Channel.cpp:49`;
default 1000, `singletons/Settings.hpp:771-774`), so a rare filtered row
outlives the source's rollover by up to a thousand admitted rows.

The scrollbar's highlight marks are computed over the virtual channel
(`:1052-1055`), which is the count-carries-predicate half: a pane's marks
are "highlights among rows this pane admits".

## What the realization cannot do

A filter change does not rebuild the derivation. `ChannelView::setFilters`
(`:1120-1125`) swaps `channelFilters_` and updates the view id; `Split::setFilters`
(`widgets/splits/Split.cpp:1252-1256`) calls it and refreshes the header.
Rows already in `channel_` that the new predicate would reject stay on
screen until the split is re-attached, and rows the old predicate rejected
are not recovered from the source's snapshot - the technique's
"rebuild from snapshot on predicate change" rule is absent. Replacement is
one-sided: `:997-1006` forwards a replacement only if it passes, so a
message edited *out of* the predicate (a moderator deletion that changes its
flags, for instance) remains in the filtered pane as its pre-edit value.
And the derivation is single-source - `channel_` has exactly one
`underlyingChannel_` - so the merged-view case the technique covers (the
mentions and live tabs) is built upstream as its own registry channel
(`TwitchChannel.cpp:1495-1496` fills the mentions channel directly) rather
than as a virtual channel over several sources.
