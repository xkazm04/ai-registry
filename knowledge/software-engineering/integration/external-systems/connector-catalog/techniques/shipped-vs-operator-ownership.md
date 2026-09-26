---
layer: technique
type: technique
subject: connector-catalog
technique: shipped-vs-operator-ownership
status: forged
laws: [one-validation-door, gate-sees-target]
shared_with: []
use_when: [choosing which columns a refresh may write, operator edits revert after every restart, every row shares one modification timestamp]
---

# Shipped vs operator ownership

A catalog table has two legitimate writers with opposed lifecycles. The
**vendor** ships rows and must be able to update them after the fact — a
corrected auth schema, a fixed probe endpoint, a new capability has to reach
installs that already exist, or every shipped defect is permanent. The
**operator** edits rows to fit their world — renames, recategorizes, adds a
field for a self-hosted variant — and must be able to trust that edits
survive. Any store with defaults-plus-customization faces this: connector
rows, shipped templates, rule packs, default dashboards. The technique is the
contract that lets both writers win.

## The canonical failure: the boot-time clobber

The naive refresh is an unconditional upsert at startup: for each shipped
entry, overwrite the installed row with the shipped values. It satisfies the
vendor perfectly and silently reverts every operator edit on every launch.
Three properties make this failure a *class* rather than a bug:

- **It is invisible by construction.** The revert happens before anyone looks;
  the operator sees their edit "not take" and blames themselves. If the
  refresh also stamps the row's modification timestamp, it destroys the only
  forensic evidence — the store now testifies that the vendor's values are
  the operator's latest edit.
- **Survival is accidental.** Whichever columns the refresh's hand-maintained
  write list happens to omit are the columns where edits survive. That is not
  a policy; it is a bug that flatters some users. The measured in-repo
  instance of this technique's failure shows exactly this signature: one
  presentation column survived operator edits solely because the rewrite list
  forgot it.
- **It swallows every other writer too.** The operator's edit door is merely
  the writer you thought of. App features that annotate rows (an import flow
  recording discovered capabilities, a usage feature stamping metadata) are
  writers as well, and the clobber reverts them identically. Ownership
  contracts must start by **enumerating the writers**
  ([one-validation-door](../../../../_laws.md#one-validation-door) — the law's
  enumerable-writers half), because every writer not in the contract is a
  future silent loser. **A deleter is a writer too.** A refresh that inserts
  whatever is missing turns an operator's deletion into a row that comes
  back at the next start. Package managers treat a locally deleted shipped
  file as a modification and do not restore it by default. Doing the same
  for a row means keeping a tombstone for the deleted identity.

The clobber is a defect only for columns someone other than the vendor may
write. Some systems overwrite provisioned entries on purpose and say so. For
columns the vendor alone writes, an unconditional rewrite costs nothing but
true timestamps.

## The contract: ownership is per column, and the refresh is gated

Two structural decisions replace discipline:

**1. Split the row by owner.** Decide, column by column, who wins:

| Owner | Typical columns | Refresh may write? | Edit door may write? |
|---|---|---|---|
| Vendor | identity, auth schema, probe recipe, capability declarations | yes | ideally no (or fork-on-write) |
| Operator | label overrides, category, enablement, notes, presentation tweaks | never | yes |
| System | provenance stamps, shipped-revision, timestamps | by its own rules | no |

Make the split *structural*, not conventional: hand the refresh a type that
can only name vendor columns, so writing an operator column is unrepresentable
rather than forbidden. A write list that must merely be remembered correct is
the accident-survivor bug waiting to recur in reverse. The type must also
tell *unset* from *empty*. A struct whose missing fields serialize as zero
values claims those fields on every write.

**A list column written by more than one party has an owner per element,
not per column.** When an import flow appends discovered tools to a list the
vendor also ships, column ownership has no right answer. Giving the column
to the vendor loses the appends at the next refresh. Giving it to the
feature means shipped fixes never land. The unit of ownership is the
element, keyed by something stable inside it, and each element carries its
origin. The refresh then replaces only vendor-origin elements. Declarative
merge systems draw the same line: a list declared atomic has a single owner
and is replaced whole, and a list declared as a keyed map or set lets
different writers own entries separately. A feature that already tags its
elements with a source has done half the work. What remains is a refresh
that reads the tag.

**Every statement of the refresh keys on one identity, minted by the vendor
and carried in the shipped entry.** An insert keyed on the primary key and an
update keyed on a mutable name agree only until someone renames the row.
After a rename the insert finds the id and does nothing, and the update
finds no name and does nothing. The row silently leaves vendor ownership: no
duplicate appears, no marker records the change, and no fix reaches the row
again. A locally minted key cannot serve, because the shipped catalog cannot
name it. The shipped entry has to carry the key.

**Vendor rows the operator cannot edit are a complete contract, not a
shortcut.** Customization then goes to a copy, or to an overlay of only the
fields the operator changed, merged over the vendor row at read time. Merge
conflicts disappear, because the refresh owns everything it writes. Two
costs come with it. A copy stops receiving vendor fixes, so it should keep a
reference to its parent. And the read-only rule has to live at the store's
door. A UI that happens never to call the edit door has made no rule. A
privileged command that still accepts vendor rows is the clobber's next
victim, waiting for a caller.

**2. Gate the refresh on evidence of change.** The refresh must compare
before writing ([gate-sees-target](../../../../_laws.md#gate-sees-target) — the
thing gated is "did the shipped definition change and did the operator not
touch this", so that is what the gate must observe):

- Stamp each seeded row with the **shipped revision** (a version or content
  hash of the shipped entry) at seed time. A hash is taken over a canonical
  form, per column. Otherwise a generator that reorders keys or reformats
  JSON looks like a vendor change and raises a conflict against every edit.
  Where no stamp exists yet (the first release to add one), a current value
  equal to *any* previously shipped value counts as unedited.
- On boot, rewrite a row's vendor columns only when the shipped revision
  differs from the stamped one — no-op boots stop touching rows at all, and
  modification timestamps become true again.
- For vendor columns the operator *was* allowed to touch (some contracts
  permit it), detect the edit by comparing the current value against the
  *old shipped* value — the three-way-merge shape: shipped-old vs
  shipped-new vs current. Unedited → take shipped-new. Edited and vendor
  changed → a genuine conflict; surface it (see below), never silently pick.

## Conflicts are rare and must be loud

With per-column ownership, true conflicts occur only where both parties may
write the same column and both did. The honest resolutions, in descending
order of respect for the operator:

1. **Keep the edit, notify** — "a newer shipped definition exists for an
   entry you customized" with a one-click diff and adopt.
2. **Fork-on-write** — an operator edit to a vendor column copies the row
   into operator ownership (a variant referencing its shipped parent);
   refresh updates the parent, the variant keeps a visible "shipped parent
   has moved" marker.
3. **Take shipped, preserve the edit visibly** — acceptable only for
   correctness-critical vendor columns (a broken probe must be fixable), and
   only if the displaced value is retained and surfaced, never dropped.

Silently taking shipped is the clobber again; silently keeping the edit
forever means shipped fixes never land. Either silence is a policy decision
being made by omission.

A refresh that runs at boot has nobody to ask. "Loud" there means two
things: a default resolution declared in advance for each column class, as
package managers use in non-interactive runs, and a record the operator
meets later. Whichever value loses is kept beside the winner, in either
direction: the new shipped value next to a kept edit, and the displaced edit
next to a taken shipped value.

## Verification is part of the technique

The contract is testable, and the test is cheap: **edit one field of every
ownership class, restart, and diff.** A store passing this test proves the
contract; a store that has never run it is running the naive refresh until
proven otherwise. The test also deletes one shipped row, has each feature
writer make its write, renames the row's name-like column, and restarts
twice. The second restart must write nothing. Two adjacent audits complete
the picture: modification timestamps should show a *spread*. A store where
every row shares one timestamp, the last boot, is confessing to the clobber
when the rows' creation times are spread out. A shared timestamp on rows
created together is what an install or a bulk migration leaves, and proves
nothing. The writers
enumerated in the contract should be checked against the writers that
actually exist in code, because the contract only binds the writers it names.
