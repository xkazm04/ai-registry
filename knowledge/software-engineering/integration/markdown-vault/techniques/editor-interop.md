---
layer: technique
type: technique
subject: markdown-vault
technique: editor-interop
status: forged
laws: [creation-names-reaper]
shared_with: []
use_when: [deciding whether the app may hold a file open, caches go stale on edits made while closed, a deep link opens the wrong note or nothing]
---

# Editor interop

The vault's defining constraint as a design discipline: the human opens the
same files in their own editor, edits them at arbitrary times, and holds
final authority over their contents. The application is a *guest* in a store
it did not exclusively create and does not exclusively write. Every practice
here descends from one rule — **never fight the user for the file** — and
from its corollary: when the application and the human collide, the human
wins, and the application's job is to notice, adapt, and escalate rather
than overwrite.

## Never hold, never tear

- **No locks, no long-lived handles.** An exclusive hold on a note is a
  fight the application picks with the editor on the human's behalf. Open,
  read, close; open, write, close.
- **Atomic replace on every write** — temp sibling, then rename over the
  target — so the editor's renderer, refreshing at any instant, sees either
  the whole old note or the whole new one. A torn half-write shown in the
  human's own editor is the fastest possible way to teach them the
  application corrupts their files, whether or not it technically did.

**Atomic replace is atomic for readers, and nothing else.** The rule is right
and its costs are real; a technique that states only the rule ships them as
surprises:

- **It replaces the record's identity.** The rename swaps in a different
  underlying file, so anything holding the old one keeps reading the old
  content, and anything bound to the *file* rather than to its directory stops
  observing it entirely — including a change watcher, which then goes quiet
  with no error at all. Watch directories, never individual records, and treat
  that as a consequence of the write policy rather than as an independent
  preference.
- **It drops what the old file carried besides bytes** — permissions, extended
  attributes, ownership, and any other hard links to the record, which keep
  pointing at the superseded content. Where those matter they are copied across
  deliberately, before the rename.
- **It is not durability.** Atomic-for-readers survives a concurrent read; it
  does not survive a power loss, which additionally requires flushing the new
  content before the rename and the containing directory after it. Two
  different guarantees, routinely conflated because one operation is asked to
  provide both.
- **It can fail where a plain write would not.** On platforms where an open
  file blocks being replaced, the rename returns an error against a target the
  human's editor is holding — so the write path needs a bounded retry. Without
  one, the technique's success case becomes a silent no-op: the reader that used
  to see half a note now sees the unchanged old one, and no error surfaces
  anywhere they look.

None of this argues for the naive write. It argues that "just write atomically"
is one line of advice and four of obligation.

## Assume external edits; detect, don't poll-and-pray

Quiescence is never a valid assumption. The interop posture is layered
detection with declared bounds:

- **Watch the vault** for change events and react — refresh views, drop
  derived caches — rather than trusting anything read earlier. Change
  storms are real (a bulk edit, a sync client writing hundreds of files),
  so events are **debounced** into batches instead of stampeding consumers.
  With one exception, and it is not a small one: **debounce is for consumers
  that recompute, not for consumers that apply diffs.** Coalescing ten events
  into one saves a recompute consumer nine rebuilds and costs a diff consumer
  nine deltas it will never see again. A store with both kinds of consumer
  debounces per consumer, not at the watcher.
- **Bound the blind spots.** The watcher only sees changes while it runs;
  edits made while the application was closed, or before the watcher
  attached, are invisible to it. Whatever caches or ledgers depend on vault
  state therefore carry a second, time-based staleness bound — the watcher
  is the precise mechanism, the time bound is the honesty mechanism.
- **The blind spots are wider than "while it was closed."** A watcher is a
  best-effort signal by construction, and its documented failure modes are
  silent ones: it does not observe changes made on the far side of a network
  or remote filesystem; its event queue overflows under a storm and the
  prescribed recovery is to discard every derived cache and rescan; recursive
  watching is capped by a per-user resource a large store exhausts; the
  platform mechanisms coalesce by design and their own guidance recommends a
  periodic full scan as a backstop; and an editor that saves atomically shows
  up as delete-then-create rather than modify, so a consumer keyed on
  modification events misses the edit it most wanted. Each of these turns the
  time bound above from prudence into the load-bearing mechanism, with the
  watcher demoted to an optimization that usually fires first.
- **One watcher per vault, and it names its reaper**, per
  [creation-names-reaper](../../../_laws.md#creation-names-reaper): switching
  vaults tears down the old watcher before attaching the new one; the
  debounce machinery dies with it. A leaked watcher on a previous vault is
  a background writer of confusing events into the new session.

External edits to records the application *also* writes are not an interop
problem to solve locally — they are exactly the both-sides-moved case whose
three-way discipline lives with the sync layer. Interop's obligation is to
deliver the detection signal, and to refuse the tempting local shortcut of
last-writer-wins.

## Hand navigation back across the boundary

Interop runs in both directions. When the application shows the human a
note, the affordance they actually want is *open it in my editor* — served
by the editor's own deep-link scheme. Discipline of the link itself:

- **Address by full vault-relative path, not basename.** Basenames collide
  across folders; an ambiguous link that opens *a* note with that name is
  worse than none, because it is silently wrong.
- **Normalize the path shape** to the form the editor's scheme expects
  (separator direction, extension conventions), and encode it properly —
  paths contain spaces and human punctuation.
- **Degrade to a no-op, visibly harmless,** when the editor or vault
  identity is not yet known — the affordance can be wired unconditionally
  and simply do nothing rather than every call site growing a guard.

## Be a native citizen of the format

The store is shared territory, so the application writes what the editor
renders natively: the editor's own link syntax so projected records
participate in the human's graph, frontmatter the editor's UI understands,
titles and filenames a human would plausibly have chosen. And it keeps out
of the editor's private territory: configuration and cache directories are
never walked, never linted, never written. A vault where machine-emitted
notes are indistinguishable in kind from human-authored ones — linkable,
searchable, editable — is the success criterion; a vault where the
application's output is a foreign colony the editor renders as broken
syntax is the failure.
