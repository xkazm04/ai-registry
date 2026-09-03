---
layer: application
type: application
subject: telemetry-pii-redaction
technique: denylist-plus-pattern-pass
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Two-pass scrubbing in a React + Next.js app on Sentry

`src/lib/sentry-pii.ts` is the whole boundary for a marketing-plus-dashboard
site running React 19 under Next.js, shipping errors, breadcrumbs and metrics
to Sentry. It is 236 lines and contains both passes, the walker, the caps and
the call-site wrapper — one module, so the denylist has one home.

## The field set, in two halves

`SENSITIVE_FIELDS` (`src/lib/sentry-pii.ts:30`) is a `Set` of exact key
names, and the source splits it visibly:

```ts
const SENSITIVE_FIELDS = new Set([
  "execution_id", "persona_id", "persona_name", "trigger_id",
  "credential_id", "policy_id", "event_id", "source_persona_id",
  "tool_name", "api_url", "endpoint", "connector_name", "user_name",
  // Common PII keys whose values may not match a UUID/URL/quoted pattern.
  "email", "user_email", "workspace_id", "workspace_name", "full_name",
]);
```

The first thirteen are domain join keys — the identifiers that resolve to a
row in this product's own database. The comment at `:44` introduces the
second group and states the technique's own justification for the keyed
pass existing at all: these values *match no pattern*. `full_name` is words.
`workspace_name` is words. Nothing shape-based will ever find them.

## The four patterns, and why the mail one exists anyway

`:17`–`:28` declare the value patterns: a UUID matcher, a quoted-span
matcher bounded at 200 characters (`QUOTED_RE`, `:20`), a URL matcher, and
a bare mail-address matcher. The comment above the last one (`:24`–`:27`)
is the argument for running a value pass on top of a key pass, in the
authors' own words — the denylist drops known PII *keys*, but an off-list
`extra`/`tag`/message field or a stack-frame variable can still carry an
address that no other pattern catches.

`QUOTED_RE` is the pattern most redactors are missing. This product
interpolates user-chosen names into error prose — persona names, credential
names, connector names — and React quotes prop values into a component
stack. A span in quotes is the only signal those have.

## Order is written into the code

`scrubPii` (`:66`) runs the passes as a numbered list, and step 2 carries
its reason inline (`:69`–`:70`): emails are redacted *before* the quoted and
URL passes "so they're caught even when not quoted and not inside a URL".
Identifiers first (they become a correlation marker rather than being
destroyed), then addresses, then locations, then the broad quoted sweep
last — precise before coarse, exactly because each rewrite consumes its
match.

## Locations reduce to scheme and host

`redactUrl` (`:52`) is deliberately crude and correct: find `://`, take up
to the first `/`, and — `:59`–`:61` — strip anything before an `@` in the
authority, which is the userinfo most developers have never seen in the
wild. The return value is ``scheme://host/…`` with an explicit ellipsis, so
a reader can tell a reduced location from a bare host.

## The keyed pass runs at every depth

`scrubData` (`:88`) is the recursive walker. Strings get `scrubPii`
(`:93`); arrays and objects recurse; and `:100` is the keyed drop — a key in
`SENSITIVE_FIELDS` is skipped entirely rather than recursed into. The same
key check is repeated for the flat surfaces the walker does not own: tag
keys at `:167` and breadcrumb `data` keys at `:180`. The depth cap at `:92`
belongs to [redact-at-the-cap](../techniques/redact-at-the-cap.md).

## Routes: collapse, then scrub again

`src/components/PageViewTracker.tsx:8` declares `UUID_SEGMENT_RE`, and
`normalizePathname` (`:11`–`:13`) collapses every identifier-shaped path
segment to `/:id` **and then** runs the whole result through `scrubPii`
before calling `trackPageView`. The second pass is the important half: the
segment regex is a heuristic for one identifier format, and the scrubber
behind it is not.

`src/lib/analytics.ts:64` states the matching rule for the analytics sink in
one line — *the email the user typed must never reach analytics* — and
`trackWaitlistOpen`/`Submit`/`Result` (`:66`–`:80`) carry only the platform
and an entry-point enum, never the address the form collected.

The house rule that binds new capture sites to the module is
`.claude/CLAUDE.md:70`: all error events pass through the scrubber, and
before adding breadcrumb data or a `captureException` with `extra`, check
whether the shape contains any of `SENSITIVE_FIELDS` or a scrubable
pattern.

## Where this tree falls short of the technique

- **Key matching is exact and case-sensitive** (`:100`, `:167`, `:180`).
  `userEmail`, `Email` or `personaId` all pass. The technique asks for
  case-insensitive matching plus a short substring marker list.
- **Non-string scalars are never examined.** `scrubData` returns `value`
  unchanged at `:105`, and the tag pass only scrubs `typeof v === "string"`
  (`:168`). A numeric account identifier in `extra` or a tag goes out
  intact.
- **The two breadcrumb paths disagree.** The event-attached pass
  (`:178`–`:189`) drops sensitive keys *and* pattern-scrubs the surviving
  string values; the standalone `beforeBreadcrumb` hook `scrubBreadcrumb`
  (`:224`) only drops the keys. A breadcrumb that never becomes attached to
  an event gets the weaker of the two.
- **`event.request.url` is untouched.** `scrubEvent` deletes
  `request.headers` and `request.data` (`:121`–`:124`) but leaves the
  request location, so a query string survives on the request object even
  though `scrubPii` would have reduced it anywhere else.
- **The vocabulary is mirrored, not shared.** The module docblock (`:4`)
  states it mirrors a desktop Rust `pii` module. That copy is unavoidable
  across languages, but neither file names a reconciliation direction, so
  the two lists drift independently.

## Version note

`react` is pinned at `^19.2.8` in `package.json:43`; the Sentry client is
`@sentry/nextjs`. The React 19 relevance is direct: `componentStack` strings
handed to an error boundary quote prop values, which is why the quoted-span
pattern is load-bearing here rather than decorative.
