---
layer: technique
type: technique
subject: kept-alive-screen-host
technique: sliced-screen-stream
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [one slow read holds a whole screen hostage, a dropped stream leaves values waiting forever, a screen's reads are scattered over many requests]
---

# Sliced screen stream

A screen's data is a fixed, declared set of named slices, and the screen asks
for all of them in one request. The server answers with newline-delimited
JSON: one line per slice, written the moment that slice resolves, then a
terminator line. The client folds each line into the slice it names. The shape
answers two opposite failures at once. Many requests per screen give a
waterfall, a burst of connections and no single moment at which the read is
over. One monolithic response gives an all-or-nothing reveal, gated on the
slowest read. Slices give each region its own arrival, and the stream gives
the read one beginning and one end.

## The declaration is shared, and both sides are held to it

The screen's client definition lists its slice names, and so does the
server's loader for that screen. They must be the same names in the same
order, and a test asserts it for every screen that is switched on. The order
matters because the server starts every slice at once but writes them in the
order they finish. A cheap, immediate core slice listed first is then the
first line on the wire, and it carries what the frame needs to stop being
dashes: the entity's name, the column set, the counts. Heavy slices (a large
list, a slow external read) are their own slices, so the core never waits
behind them. Keep each slice's payload to what its own region draws. A slice
that carries "the whole model, just in case" is a monolithic response with
extra steps.

## Each line carries a status, not just data

A line names its slice, a status, and when it was read:

- `ok` with `data`: the slice is read.
- `notFound`: the entity the screen is about does not exist. The host draws
  the screen's not-found surface instead of its frame. A not-found is a
  status, not an exception, so the frame never half-renders around a missing
  entity.
- `redirect` with an in-app target: the screen belongs elsewhere. The host
  replaces the address, and only while that screen is the one showing. A
  redirect that lands after the person moved on must not pull them back.
- `error` with a fixed reason from a closed set: `unreadable`, a stated
  not-ready condition, a refusal such as "only on this machine". The detailed
  message goes to the server log. A raw exception text on the wire leaks paths
  and is something the client then matches on as prose, which the reason
  vocabulary exists to prevent.

The terminator is a line of its own with a reserved slice name. It says the
read is over, and it can itself carry an error status when the whole request
was refused. Then one line fails every slice with the same reason.

## An unanswered slice is not served

When the terminator arrives, or the stream breaks, every declared slice that
never got a line is resolved on the client as an error with the reason *not
served*. This is the rule that keeps the reserved dashes honest. Without it, a
loader that forgot a slice, or a connection that dropped mid-stream, leaves a
dash that waits forever and reads as "still loading" for the life of the
screen ([law: unknown is not a value](../../../../_laws.md#unknown-is-not-a-value)).
The dash means *not read yet*. Once the read is over and the slice never came,
the honest state is a failure with a reason and not a dash
([law: failure is not empty success](../../../../_laws.md#failure-not-empty-success)).

## Plain JSON, and absence is an omitted key

The payload is plain JSON and the stream enforces it. Before writing a line,
the server walks the value and refuses a map, a set, a date object, a
function, a class instance or a non-finite number. It answers that slice as
an `error` and logs the path of the offending field. JSON serialisation would
otherwise turn these silently into `{}`, a string or `null`, or drop a
function-valued key altogether. The client would receive a value that looks
typed and is not, or an omitted key that it reads as unknown. Convert at the
edge: send arrays and ISO strings, and revive on the client where a richer
type is needed.

An absent optional value is an omitted key. It is never `null`, `0` or `""`,
because each of those is a definite value that a renderer will draw. The
client's decoder treats a missing key as unknown and draws the dash.

## Re-reads are quiet and identical answers change nothing

A return, a poll or a write that invalidates the screen re-reads it through
the same stream. While it runs, the slices already read stay on screen, and a
fresh line replaces its slice only when it arrives. Two guards make a re-read
invisible when nothing changed:

- **Identical text keeps the old object.** Compare each incoming slice's
  serialised text with the last one. If it is the same, keep the previous data
  object, so nothing re-renders and no hook that reseeds on a new object fires.
- **A failed re-read never blanks a read slice.** An `error` line for a slice
  that is already `ok` keeps the data. Staleness is stated by the screen's
  "as of" note, which is driven by the terminator's timestamp, and the data is
  not withdrawn.

## Partial reads for a parameter change

A screen keyed by a parameter (an item, a project) usually has slices that do
not depend on the parameter: the list beside the detail, the page's facts.
Declare which slices do. Moving to another parameter then keeps every other
slice and reads only the parameter's slices, plus any slice that is not read
`ok` yet. The wire names the subset explicitly, and the server answers only
those. Without this declaration, a step from one item to the next re-dashes
the whole screen to show one changed panel.

## When not to use it

A screen whose data is one small read gains nothing from slicing. Give it a
single slice and keep the protocol, so that the status, terminator and
not-served rules still apply. A screen that needs push updates (a live log, a
progress feed) needs a subscription and not a re-read stream. The two compose:
the stream paints the screen, and the subscription keeps one region moving.
