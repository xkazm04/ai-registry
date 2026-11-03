---
layer: technique
type: technique
subject: model-composed-workspace
technique: composition-region
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [a model opens or arranges views across a product's modules, users lose their place after the assistant rearranges the screen, a model-composed panel shows a number the module would not]
---

# The composition region

The tempting design for a model-driven screen is a model that can put anything
anywhere: move the ledger to the left, enlarge the forecast, hide the sidebar,
bring the alerts to the top. It looks like the fullest expression of the idea and
it is the one the evidence rejects most clearly. An adaptive-interface study that
compared moving the likely-needed functions to where the user was against
**copying** them into a clearly designated, spatially stable area found that the
moving design brought no significant gain in performance or satisfaction, while
the copying design - which did not alter the familiar parts of the interface at
all - won. Rearrangement saves clicks on paper and costs the user their knowledge
of where things are, which is the asset every later click spends.

So the rule is **copy, do not move**, and it has four parts.

## 1. Fixed chrome, one designated region

Navigation, module chrome and primary actions never move at the model's request.
The model composes into a **composition region**: one area of the screen set aside
for it, visibly distinct from the modules, with its own heading and its own way
to be cleared. The region may be a canvas beside the conversation, a board above
it, or a pane that opens on demand; what matters is that the user can always say
which part of the screen the model controls and which part they do.

When the model "opens" something, it creates a view of it in the region. The
source module stays exactly where it was, so the old path - the menu item, the
tab, the shortcut - always works, and a user who never trusted the composition
can ignore it completely and lose nothing.

## 2. Slots and spans, never coordinates

Inside the region the model places views on a **declared grid**: a fixed number
of columns, each view taking a span and a position in reading order. It never
emits coordinates, pixel sizes or free-form layout. A coordinate is an invitation
to overlap, to clip on a narrower window, and to drift as the window resizes; a
span is a request the layout engine can always satisfy and can reflow when the
width changes. The grid is part of the closed vocabulary - the allowed spans are a
short list, and a view that asks for a span outside it is clamped or refused at
the validation door, not passed through.

Keep the grid's density low. A region that holds more than a handful of views
has become a dashboard the model maintains on the user's behalf, and the user
will stop reading it. When the composition needs more than fits, the answer is a
second composition the user asks for, not a denser first one.

## 3. Module views are composable units that own their numbers

What the model places are **module views**: units that each module publishes for
composition, with its own data binding, its own loading, empty and error states,
and its own rendering of its own figures. The model chooses which views to place
and binds their parameters - an account, a date range, a filter. It never writes
the data those views show.

This is the load-bearing rule of the region, and it is enforceable. A balance the
model typed into a heading is a figure from the model's recollection, rendered
with the authority of a report; a balance the ledger's view fetched is the product
speaking. So model-authored text in the region - titles, captions, the "why" line -
carries **no figures**: a title containing a digit is refused at the validation
door, and the composer prompt says so as a consequence rather than a request.
Numbers on a composed screen come from module views or they do not appear.

The rule has a stronger form and a fallback. The stronger form gives the model
no titles to write at all: each view is named by the host from its kind, so the
heading over the forecast is the product's word for the forecast. Where the model
does title a view or the region, a title refused for carrying a figure falls back
to the person's own words - the name they gave the project or the board - because
the person's words may hold digits and the model's may not. A refusal that left a
blank heading would punish the user for the model's mistake.

Bindings obey the same rule. A view bound to a record, an account or an item
names an identity **that was present in the data the model was given**; an
identity the model produced from nowhere is dropped at the door as unknown, not
passed to the module to fail there. A plausible invented identifier is the
binding-shaped version of an invented number.

Each module view must also tell the truth about its own data
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A view
whose fetch failed shows an error state, not an empty list and never a zero; a
view with genuinely no data shows an empty state that says so. A composed screen
pulls from several modules at once, and one module's silent failure rendered as
"nothing here" is the most misleading thing such a screen can show.

The list of module views, their parameters and their allowed spans is one
vocabulary with one authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
the registry the renderer reads is the source the composer prompt is generated
from. How that registry and its validation door are built is
[registry-mapping](../../../../ui-surfaces/input-and-editing/schema-driven-ui/techniques/registry-mapping.md)
and [emitter-registry-sync](../../../../ui-surfaces/input-and-editing/schema-driven-ui/techniques/emitter-registry-sync.md);
this technique decides what the vocabulary is *for*.

## 4. Stability and accuracy, both

The copy-not-move finding is not the whole story, and the region exists precisely
because it is not. A later adaptive-interface study found that improving the
**accuracy** of an adaptation had a stronger effect on performance, use and some
satisfaction measures than improving its **predictability**. A perfectly stable
region full of the wrong views is not a success.

The split resolves the tension instead of picking a side. The chrome is stable,
so the user never pays for a model mistake with their sense of place. The region
is judged on accuracy - did it hold the views the task needed - and that is a
measured property of the model's choices, owned by the view-choice evaluation.
Inside the region, the same views keep their slots across turns unless the
composition genuinely changed, so the region itself is as stable as accuracy
allows.

That makes **when the region re-forms** a design decision, not a side effect of
every data refresh. Three rules hold it:

- **Recompose on request, or when the shape of what exists changes** - a kind of
  item appears where there was none, or the last of one disappears - and at a
  bounded rate. A change in values (a new count, a fresh reading) updates the
  views in place, because the views own their numbers; it never re-forms the
  region. A region that re-forms whenever a figure moves is a moving layout with
  extra steps.
- **A failed composition keeps the last good one.** When the model's answer fails
  validation entirely, or the model is unavailable, the region the user was
  looking at stays, and the failure is said in a line. Failure never blanks the
  region.
- **Before the first composition, show a fixed default layout** derived from the
  same vocabulary, so a new user, an offline model and a model that cannot compose
  all see a working region rather than an empty one.

## Decision rules

- **When the model wants a module enlarged, moved or hidden, refuse the op and
  offer the region**: "I've put the forecast beside the conversation" leaves the
  forecast module untouched.
- **When a composed view would duplicate a whole module screen, navigate instead.**
  The region holds slices across modules, not copies of one.
- **When a module cannot publish a composable view with its own empty and error
  states, it does not appear in the vocabulary.** A view that can only render
  happy-path data will render a failure as a calm, empty panel.
- **When a figure must appear in model-authored text, link to the view that owns
  it instead.** "Your balance is in the forecast view" is honest; the balance in
  the sentence is not, however often it happens to be right.

## When not to use this

- **A single-surface tool with no modules to protect.** When the whole screen is a
  canvas the user expects the model to fill, the region is the screen and the
  copy rule has nothing to copy from.
- **A user-built layout the model only fills.** If the user arranges the slots and
  the model only supplies content, the region's discipline is still useful but the
  question it answers - where may the model put things - has been answered by the
  user.
- **Tiny screens.** On a phone-width surface there is no room for a stable chrome
  and a region side by side; the composition becomes a navigated view of its own,
  reached and left like any other screen.
