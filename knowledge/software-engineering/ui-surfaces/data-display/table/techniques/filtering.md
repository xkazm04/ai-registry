---
layer: technique
type: technique
subject: table
technique: filtering
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [a filter bar's controls and the rows on screen disagree, deciding whether a control applies on change or on submit, an export or share link carries a predicate the table never showed, rows from a superseded filter landing in the current results, a selection surviving a filter change and acting on rows nobody can see, deciding whether a text filter may apply on every keystroke, selections dropped when the user turns the page]
---

# Filtering

A table has three query axes and two of them already have a contract of their
own: [sorting](./sorting.md) says what an order must be, and
[pagination](./pagination.md) says what a window must be. Filtering is the
third, and the one implementations treat as plumbing — a few controls wired to
a few request parameters. It is not plumbing. A filter is the **predicate the
whole surface is currently answering**, and almost every filter defect is the
same mistake: some part of the surface answered a different one.

[client-server-split](./client-server-split.md) decides *where* the predicate
executes. This technique is about what the predicate is, when it changes, and
what is allowed to read it.

## The predicate has two states, and only one of them is real

At any moment a filtering surface holds two distinct values, and conflating
them is the root defect of the axis:

- **entered** — what the controls currently display. A half-typed name, a date
  the user is still picking, a chip hovering under the cursor. It is a draft.
- **applied** — the predicate the rows on screen were actually produced under.
  It is the only one that describes the data.

The rule is one line: **everything the surface derives reads the applied
predicate.** The rows, the counts, the window position, the empty state's
wording, the export, the share link, the "clear filters" affordance, the
restored state after a reload. Nothing derives from entered except the controls
themselves and the enabled-ness of the commit affordance.

The failure this prevents is not cosmetic. An export built from entered state
hands the user a file whose contents they never saw and cannot review — filed
evidence that is not the reviewed evidence. A count built from entered state
labels the current rows with a predicate they do not satisfy. Both are
confidently wrong, and both survive review, because on a warm surface entered
and applied are usually equal and the bug only fires while someone is typing.

## The commit point is declared per control, not per call site

Not every control should commit on change, and not every control should wait
for a submit. The split follows the control's shape:

- **Enumerated, low-cardinality controls** — a select, a toggle, a segmented
  chip row, a facet checkbox — commit **on change**. The user's gesture is
  already the whole decision; there is nothing to finish.
- **Free-text and open ranges** — a name, a query string, a date pair, a
  numeric bound — commit **on an explicit act**: a submit button, and the
  enter key in any field of the group. Keystroke-committing a text filter
  fires a request per character against a predicate the user has not finished
  stating, which is why every such implementation grows a debounce, and the
  debounce is a guess at when the user stopped rather than a statement that
  they are done.

That second rule is a rule about **commits that cost a round trip**, and it
holds exactly where they do. In the all-client regime
([client-server-split](./client-server-split.md)) the complete set is already
held and a text predicate costs a pass over memory, so keystroke application is
the regime's main benefit, not a defect: entered and applied are one value, the
rows follow the typing, and there is no request to fire per character. Two
obligations come with it. The input must stay responsive while the rows
re-derive — defer the row derivation behind the keystroke rather than debounce
it, because a debounce reintroduces the guess — and the result count becomes a
**status message** (the accessibility standard's status-message criterion, SC
4.1.3, level AA): rows changing under a text field are silent to a screen-reader
user unless the new count is announced. Open ranges keep the explicit commit
in both regimes, because a half-entered date or bound is not a predicate at
all, only a draft that fails to parse.

And the rule that binds them: **an auto-committing control composes onto the
applied set, never onto the entered one.** Changing the select must not also
commit the half-typed name beside it. If it does, one deliberate gesture
silently applies filters the user never confirmed, and the surface's behaviour
now depends on what else happens to be on screen. A mixed filter bar is
correct only when the auto-committing controls fold into the last applied
predicate and leave the uncommitted drafts alone.

Where the commit is explicit, it must be **reachable without a pointer** — the
enter key in a text field of a filter group means submit, or the field appears
to do nothing to every keyboard user.

## Derive the whole predicate, not one axis of it

Multi-axis filter bars fail one axis at a time. A surface scoped by three
things — a group, a facet, a category — grows an export, and the export is
written to thread the axis that prompted it. The other two are forgotten, and
nothing notices, because on the default scope all three are empty and the
export is right.

So the predicate is **a value, not a set of parameters**: one object that the
request, the export href, the share link and the count all take whole. When a
fourth axis is added, the derived artifacts inherit it because they never
enumerated the axes in the first place. A derived artifact that lists the
filter fields it forwards is a list that will be shorter than the filter bar
within two releases — and its comment will still claim it matches the table
beside it.

The tell that this has already happened: the on-screen count and the exported
row count disagree for some scope nobody tests, and each is independently
defensible.

## Changing the applied predicate invalidates the window and the rows

A committed filter change is not a refresh. It is a different question, so:

1. **The window resets.** Page number to the first page, cursor to none. A
   cursor minted under one predicate is a position in a sequence that no
   longer exists ([pagination](./pagination.md), cursor design).
2. **Accumulated pages are replaced, not appended.** In a load-more surface
   the response to a new predicate starts a new list; appending it to the
   previous predicate's rows produces a table holding two answers at once,
   and duplicate row identities besides.
3. **The rows clear.** This is the one place the body-state machine's
   keep-the-rows-dimmed rule does *not* apply
   ([loading-and-empty-states](./loading-and-empty-states.md)): a page or sort
   change leaves a truthful partial answer on screen, a filter change does
   not. Dimming rows that were produced under an abandoned predicate still
   renders them, and a dimmed wrong answer is a wrong answer — it is legible,
   quotable, and at a 200-millisecond round trip indistinguishable from the
   real one.

The corollary for restoration: a surface rebuilt from a link or a back
navigation must populate its **controls from the applied predicate** before it
paints, so entered and applied agree on arrival. A restored table whose rows
are filtered and whose filter bar reads empty is a surface accusing its own
data of being wrong.

## When predicates can outrun their answers, the latest one wins

The moment a filter change costs a round trip, two changes in flight at once
is a normal occurrence rather than an exotic race, and the responses may
return in either order. Ordering by arrival means the *older* predicate can
win, leaving rows that contradict the controls, or a page appended from a
predicate the user has left.

The fix is a monotonic token per request and one comparison on return: a
response whose token is not the latest is **dropped**, silently and
completely. Two details are what separate a correct implementation from one
that merely has a token:

- **The loser's failure loses too.** Dropping only the stale success path and
  letting the stale rejection set the error state renders a failure belonging
  to a predicate nobody is asking about, beside rows that arrived fine. The
  in-flight indicator is the same: only the latest request may clear it, or a
  superseded response turns the spinner off while the real one is still out.
- **Do not disable the controls to avoid the race.** A filter bar that goes
  inert for the duration of every fetch is the chrome becoming conditional on
  data — the one thing a table's chrome must never do — and it converts a slow
  server into a form that appears broken. The token already makes the race
  safe; the disable buys nothing and costs the user the ability to correct a
  mis-click.

Dropping a superseded response is not the same as cancelling its request.
Cancellation is an optimization about bandwidth; the drop is the correctness
rule, and it holds even where the transport cannot be cancelled.

## Counts, emptiness, and what a filtered table owes the user

- **A count carries the applied predicate.** This is the count law at its most
  routine: a number rendered beside a filter bar means "matching what is
  applied", and it is recomputed when the applied predicate changes, never
  carried over from the previous one. If the surface renders only a loaded
  count ("42 shown") rather than a total, that is a legitimate honest bound —
  but then it must say *shown*, not *results*, and it must not be read anywhere
  as a size of the filtered set.
- **Empty-because-of-a-filter is its own empty**
  ([loading-and-empty-states](./loading-and-empty-states.md)), and its wording
  is derived from the applied predicate, not from the controls — otherwise the
  user reads "nothing matches" next to a draft they have not applied and
  concludes their data is gone.
- **Clearing is one action.** A surface with four filter axes and no single
  clear affordance makes the user reverse each axis by hand and then find the
  commit, and the per-axis "all" option is not a substitute: nothing tells the
  user which of the four is still narrowing the set. The clear action is
  derivable from the applied predicate — it exists exactly when the applied
  predicate is non-empty, which is also the condition for saying so in the
  empty state.

## Record-keyed state across a filter change

Selection, expansion and focus are keyed to records, and a filter change alters
*which records exist on screen* rather than reordering them — so the survival
rule that covers a resort ([sorting](./sorting.md)) does not answer it. Two
demands pull in opposite directions: a user who narrows the view and widens it
again expects their ticks back, and a bulk action must never reach a record the
user did not know it would reach.

The invariant underneath both is one sentence: **the count the user reads
before firing names every record the action will receive.** The default that
satisfies it is to keep the raw record-keyed state intact and **intersect it
with the applied predicate's result set at read time**. Everything downstream —
the bulk-action count, the action's payload, the header's select-all state —
reads the intersection; the raw set is never pruned. Pruning it into state
through an effect loses the widen-back case, costs a second render pass, and
leaves a frame in which the stale entry is live and clickable — which is the
frame a fast user acts in.

Two boundaries on that default, both corrections to reading it too literally:

- **The set intersected with is the predicate's answer, not the rendered
  window.** A row paged away, scrolled out of a virtualized body, or behind a
  load-more that has not fired is still in the answer — a windowing change,
  not an identifying one — and pruning it drops ticks the user made on page
  one the moment they turn to page two. Where the full answer is not held,
  the selection that spans it is an explicit predicate-plus-exclusions value,
  not a materialized list.
- **Gathering across filters is a legitimate workflow, and it is the
  disclosed form, not the default.** A triage surface where the user ticks a
  few rows under one filter, switches to another and ticks more, then acts
  on all of them may keep the hidden ticks actionable — but only if the count
  says both numbers ("14 selected — 3 hidden by the current filter") and the
  hidden ones can be reviewed or cleared. The undisclosed version is the
  defect this section exists for, and it has a detectable tell: a table
  component that takes the shown rows and the full set as two props and
  computes the action's payload from the full one. The prop pair makes the
  reach look deliberate in review; the count beside the button, computed from
  the same full set and printed without a hidden figure, is what makes it
  wrong.

  **The hidden figure rides on every count read before firing, not only on
  the selection total.** Where each action takes only part of the selection
  (an action that applies to one row state, a bulk verb that skips rows it
  cannot act on), the bar's "3 hidden" is an upper bound for any one action,
  not a name: it cannot tell the user that *this* button reaches two of them.
  So each action whose payload includes a hidden row states its own share
  ("Resolve 4 (2 hidden)"), and an action that reaches none prints no hidden
  figure. Measured on a decision ledger whose actions each took a subset:
  with the total alone, half the hidden rows the actions would receive stayed
  undisclosed; with the per-action figure, none did, and the payloads were
  unchanged.

This is [performance](./performance.md)'s derive-don't-store rule applied to a
second class of value: not the presentation sequence, but a record-keyed set
whose meaning depends on a row set that moves underneath it.

## What is not a filter

- **A policy predicate is not a filter.** Tenancy, permission and visibility
  scoping is applied where it cannot be skipped and is never expressed as a
  control the user can clear. It does not appear in the applied predicate, it
  does not appear in the export href, and a count taken under it is still an
  honest count — the predicate it carries simply includes a clause the user
  did not write. Where it executes is not a choice
  ([client-server-split](./client-server-split.md), step 1).
- **Narrowing within the loaded window is not filtering the dataset**, and the
  distinction is a labelling obligation rather than a technical one. The
  affordance says it finds within these results, and the counts stay bound to
  the server's predicate. The moment it is presented as dataset search, the
  surface is answering a question about a window while the user reads an
  answer about the data.
