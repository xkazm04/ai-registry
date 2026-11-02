---
layer: technique
type: technique
subject: streaming-platform-api-custody
technique: strict-event-versions
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [subscribing to the streaming platform's event types, parsing platform event payloads into the tool's types, checking a grant's scopes against enabled features]
---

# Strict event versions

The tool subscribes to each platform event type at one exact version, parses it against a
schema for that version, and rejects anything else. Scopes, event types and versions live in
one table the tool owns, so a grant can be checked against the features the streamer turned
on before any of them fail on air.

## Why loose parsing fabricates facts

Platform event payloads change across versions: a field is renamed, an amount moves into a
nested object, a role list gains a value. A parser that accepts any version and fills missing
fields with defaults keeps working through such a change - by inventing data. A missing amount
becomes zero, so a contribution total is understated; a missing role becomes "viewer", so a
moderator's ban is attributed to nobody; a missing reason becomes empty, so the audit record
says the ban had none. Every one of those is a statement the platform never made. A parser
that fails loudly on an unknown shape costs a feature; a parser that guesses costs the record.

## The procedure

1. **Own the table.** Keep one table mapping each feature to the event types it needs, each
   event type to the exact version subscribed and the scopes it requires. The subscription
   code, the scope request and the grant check all read the same table.
2. **Subscribe by exact version.** Never "latest". Changing a version is a reviewed edit to the
   table together with the schema it needs.
3. **Parse strictly.** Required fields are required; an unknown version or a payload missing a
   required field is an unsupported event: counted, logged by type and version without its
   personal content, and not delivered downstream as a partial.
4. **Check the grant against the table.** On connect, compare the scopes actually granted with
   the scopes the enabled features need, and show the streamer exactly which features will not
   work and why - rather than discovering it as a refusal mid-stream.
5. **Handle revocation by status.** A subscription the platform revokes arrives once with a
   reason (the user was removed, authorisation was withdrawn, the version was retired). Each
   reason routes to a distinct state: reconnect needed, account disconnected, tool update
   needed.

6. **Reject what was never subscribed.** A notification whose type is not in the connection's
   subscription set is a protocol fault, not a bonus event to route somewhere.
7. **Labels are not authority.** Category strings the platform attaches - a hold reason, a
   suspicion class, a moderation action name - are kept as text to show the streamer. Only the
   tool's own closed enums drive an action, and an unknown value in a field that does drive one
   is an error, never coerced to the nearest known value.
8. **Label an unproven schema.** A schema written from documentation, with simulated fixtures,
   before a payload was captured from a real channel, records that status beside it, and the
   first live payloads are checked against it before the feature is trusted on air.

## Decision rules

- **When a payload carries extra fields the schema does not know**, ignoring them is fine;
  missing required ones is not. Keep the raw payload alongside the typed view when provenance
  fields matter, and require the schema to be extended before any of them is used as authority.
- **When an optional field is absent**, it stays absent - validated when present, never
  fabricated when missing.
- **When an unparseable event is logged**, log its type and version only: the payload carries
  viewer text and identities.
- **When two event types can report the same occurrence** (a contribution reported by an old
  and a new event type), subscribe to one authoritative type, or de-duplicate across them in
  one owner; never count both.
- **When the platform announces a version retirement**, update the table before the date, and
  treat the "version removed" revocation as a tool defect, not a user problem.
- **When the same event arrives twice** (platforms deliver at least once), de-duplicate by the
  platform's message identifier before anything counts it.

## When not to use it

Exploratory tooling that records raw events for later analysis may store payloads of any
version verbatim. The moment a payload drives a count, a decision or an on-stream visual, it
goes through the strict parser.
