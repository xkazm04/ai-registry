---
layer: application
type: application
subject: chat-transcript
technique: immutable-model-cached-layout
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# Immutable model, cached layout - the message pipeline of a desktop chat client

How the Chatterino 2 desktop client realizes
[immutable-model-cached-layout](../techniques/immutable-model-cached-layout.md)
for its Twitch chat transcript, read at commit
`fda51f0d3a4a5cd15f099b951b796e299d566e9e`. The version witness is the tree's
own build file: `CMakeLists.txt:71` declares `VERSION 2.5.5`, `CMakeLists.txt:30`
and `:100` make Qt 6 the required toolkit (Qt 5 builds are warned as
unsupported), and `CMakeLists.txt:281` sets the C++ standard that
`verified_against` names.

The forces are the technique's canonical ones. One channel is commonly open
in several splits at different widths, in a search popup and in a user card
at once (`src/widgets/helper/SearchPopup.cpp:327-329`,
`src/widgets/dialogs/UserInfoPopup.cpp:598-599` each construct a
`ChannelView` over the same messages); a busy channel runs to a thousand
retained rows per view (`scrollbackSplitLimit`, default 1000,
`src/singletons/Settings.hpp:771-773`); painting is on the GUI thread; and
since 2.5.5-beta.1 in-process plugins may introspect and rewrite messages, so
the tree needed a stated mutability rule.

## The frozen model

`src/messages/Message.hpp:30-31` defines the two handles: `MessagePtr` is
`shared_ptr<const Message>`, the read-only handle everything downstream
holds; `MessagePtrMut` exists for the builder. The struct is
non-copyable and non-movable (`:34-39`), and its content is a
`std::vector<std::unique_ptr<MessageElement>> elements` (`:117`) - the typed
element sequence the technique describes, with no geometry on it. The
one-way bit is `mutable bool frozen` (`:108-115`) set by `freeze()`
(`:132-135`); the doc comment states the contract in the technique's words:
"Our rendering and layout code expects messages to be mostly immutable ...
when this flag is set, this message may not be modified. Only flags and this
member can be modified safely (from the GUI thread) ... This value is only
ever set to true."

The accept door is the channel. Every path that admits a message freezes it
first: `Channel::addMessage` (`src/common/Channel.cpp:134-142`),
`addMessagesAtStart` (`:217-228`) and `fillInMissingMessages` (`:239-256`)
all call `msg->freeze()` before the queue sees the object. Change is by
replacement: `Message::clone()` (`Message.hpp:127-128`) "returns an
identical, non-frozen message", and `Channel::replaceMessage`
(`Channel.cpp:337-372`, three overloads) swaps it in and fires
`messageReplaced` (`Channel.hpp:68-69`), the same signal path a view uses
for the original.

## The per-view layout cache

Each view holds its own `LimitedQueue<MessageLayoutPtr> messages_`
(`src/widgets/helper/ChannelView.hpp:452`) and constructs a fresh
`MessageLayout` per message it admits (`ChannelView.cpp:1193`, and again for
every row on attach at `:1035` and on refill at `:1352`). `MessageLayout`
(`src/messages/layouts/MessageLayout.hpp:44-137`) is the technique's
two-level cache: `container_` is the laid-out element tree, `buffer_` a
`QPixmap` of the finished row, and the cache key is the member block at
`:126-136` - `currentLayoutWidth_`, `layoutState_` (the generation),
`scale_`, `imageScale_`, `currentWordFlags_`.

`MessageLayout::layout` (`MessageLayout.cpp:75-115`) is the key comparison,
input by input: width changed, generation changed (`getWindows()->getGeneration()`
against `layoutState_`, `:88-94`), word-type flags changed, a manual
`RequiresLayout` flag, scale or image scale changed. If none moved and the
caller only asked for a buffer invalidation, the layout returns without
touching the element tree (`:110-115`).

The two invalidation levels are literal methods: `invalidateBuffer()`
(`:488-491`) clears `bufferValid_`; `deleteCache()` (`:503-509`) drops the
pixmap. The version bump lives one level up: `WindowManager::forceLayoutChannelViews`
(`src/singletons/WindowManager.cpp:299-303`) increments the generation
(`:744-752`) and asks views to lay out; a view's own
`invalidateBuffers()` (`ChannelView.cpp:660-665`) sets a per-view
`bufferInvalidationQueued_` flag (`ChannelView.hpp:347`) that the next
layout pass hands to each visible row and then clears
(`ChannelView.cpp:711-745`).

That pass is the windowed walk the technique requires:
`layoutVisibleMessages` starts at the scrollbar's current row and stops
when accumulated height passes the widget height (`:714-737`), so a
1000-row history lays out a few dozen rows per pass and the rest are never
visited.

## Where the realization falls short of the technique

The tree carries the confession the technique names. `Message.hpp:42-48`
declares `mutable MessageFlags flags` with the comment "a message's flag
can be updated without the renderer being made aware, which might be bad
... This might bring race conditions with it", and `Channel::disableAllMessages`
(`Channel.cpp:205-215`) uses exactly that hole to mark a whole snapshot
deleted in place. The generation counter is process-wide, not per view, so
a global change relays out every view's visible window even when only one
window's inputs moved. `deleteCache()` clears only the pixmap; the element
tree is cleared only under a compile-time flag that is never set
(`MessageLayout.cpp:507-509`), so "re-layout" in practice means "set
`RequiresLayout` and let the next pass rebuild in place". And the freeze is
enforced for plugins alone ("This is only used for plugins right now",
`Message.hpp:113`) - native code is trusted to honour the `const` handle,
which the mutable members above let it evade.
