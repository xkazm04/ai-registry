---
layer: technique
type: technique
subject: streaming-platform-api-custody
technique: brokered-calls-token-never-exposed
status: forged
laws: [typed-input-owns-its-channel]
shared_with: []
use_when: [deciding which modules of a streamer tool may call the streaming platform, designing the interface between features and the platform client, reviewing whether a token can leak through errors or logs]
---

# Brokered calls, token never exposed

Exactly one component of the tool holds the streaming platform's credential. Every feature
asks that broker for an operation in the tool's own vocabulary and gets back a typed
outcome; no feature ever receives the token, a header built from it, or a client that
carries it.

## Why a copy of the token is a copy of the channel

The grant a streamer approves is scoped for the whole tool: chat read and write, moderation,
channel settings, perhaps payment events. A module that holds the token can call any
endpoint those scopes open, not only the one its feature needs. A vote widget holding the
token can ban; a logging module that prints its request headers has published the channel.
The broker is the only place where "what the grant allows" and "what this feature may do"
are reconciled, and the reconciliation is lost the moment the token travels.

## The procedure

1. **One owner of the secret.** The broker obtains the grant, stores access and refresh
   tokens in the operating system's secret store under a fixed service and label, and holds
   the live token in memory in a value that wipes on drop and has no printable form.
2. **Named operations, not paths.** The broker's interface is a closed set of operations the
   tool's features need - send a chat message, time out an account, read a subscription
   status - each with typed arguments. There is no "raw request" method. A new feature that
   needs a new endpoint adds a named operation, which is a reviewed change.
3. **Validate before sending.** Each operation enforces the platform's documented limits on
   its arguments before the request exists: free-text reasons truncated to the platform's
   length limit on a character boundary, durations clamped to the allowed range, identities
   accepted only as platform account identifiers, never as display names typed by a viewer.
   A request the platform would reject is cheaper to refuse locally than to spend budget on.
   Every operation maps to a documented endpoint; platform terms forbid undocumented ones.
4. **Typed outcomes out.** The broker maps every response to its own outcome type: done (with
   the platform's echo of what was done), refused (with a reason class: missing scope, target
   is privileged, not found), rate limited until a time, unauthorised, unknown. Raw response
   bodies never leave the broker.
5. **Treat responses as possibly containing the secret.** An error body that echoes the
   request, a redirect location, a debug field: before any platform text is logged or
   surfaced, the broker checks it for the token and its prefix, and a match is a rejection
   of the whole response, logged as "credential echo" without the text.

6. **Transport, not authorisation.** The broker carries an action that something else already
   decided; it never decides whether a viewer should be actioned. Keeping the two apart means
   the broker can be reviewed for custody alone and the decision layer for judgement alone.

## Decision rules

- **When the language allows it**, make the broker's raw request primitive private to the
  broker's own module or package, so the boundary is enforced by the compiler rather than by
  review. A generic primitive is acceptable inside the boundary; it is the export that is not.
- **When a feature asks for the token "just to pass it to a library"**, the answer is no;
  wrap the library call inside the broker as a named operation.
- **When an outcome is unknown** - a timeout after the request was sent - report unknown. Do
  not report done and do not resend; the caller decides whether a read can settle it.
- **When two processes need the platform** (a desktop shell and a background core), only one
  of them is the broker; the other speaks to it over the tool's own local interface.
- **When diagnostics are exported**, they are built from the broker's outcome log, which
  never contained the credential, rather than by redacting raw traffic.

## When not to use it

A one-off script a developer runs against their own test account, with a token they pasted
for the session, does not need a broker; it still never logs the token. The rule starts to
pay the moment more than one feature, or one other person's channel, is involved.
