---
layer: application
type: application
subject: accountability-publishing-ethics
technique: accountless-notification-privacy
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# Telemetry scrub for an address-borne follow list: three shapes it missed

Politicas already carried the technique: follow keys live in the query of its
feed address, and a pure scrub module is bound to the error and transaction
hooks of the server, edge and browser telemetry configs, tested against a real
SDK event. The seam hunt was chosen to falsify "the scrub removes the watch
list from telemetry", by feeding the scrub the shapes the technique warns about
rather than the shapes it was written against.

## What A (as shipped) did, probed

The scrub acted only when some `e` value was a perfectly valid key. Three
inputs kept a reader's list in the event:

- every value malformed in a small way (wrong case, a trailing space, a
  `#fragment` glued on by a browser address) - the whole list stayed;
- `request.query_string` as a list of `[name, value]` pairs - the code
  comment said the shape was handled, the code handled only the dictionary;
- `request.headers.Referer`, which carries the previous address with its query.

## What B did

A value with a key prefix (any case, optional space) now counts as carrying a
key, so the parameter is removed and replaced by its count; the fragment is
split off before the query is parsed; pair lists and header values are walked.
A foreign `e=42` stays untouched, as before.

## Reading

Target: leaking shapes in the probe, A 3, B 0 (two new tests fail on A, pass on
B). Floor: the 134 existing schranka and scrub-source tests unchanged, tsc and
the project's pre-push gates green. Not measured: a live Sentry project (no DSN
exists in the repo), other egress paths such as cookies or exception messages
that quote a fetched URL.
