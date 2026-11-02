---
layer: technique
type: technique
subject: streaming-platform-api-custody
technique: single-flight-jittered-refresh
status: forged
laws: []
shared_with: []
use_when: [scheduling access-token refresh for a streaming platform grant, handling an unauthorised response mid-stream, obtaining a grant through the device-code flow on a desktop tool]
---

# Single-flight, jittered refresh

The access token is refreshed by one writer, in one flight at a time, at a randomised point
well before it expires, and at most once in reaction to an unauthorised response. Every
caller that needs a fresh token waits on the same flight.

## Why concurrency is the failure

Streaming platforms commonly rotate refresh tokens: a successful refresh returns a new
refresh token and invalidates the one presented. Two refreshes that start from the same
stored refresh token race; one wins, the other presents a token that is already burned and
fails - and some platforms treat reuse of a burned refresh token as a sign of theft and end
the session. The streamer sees the tool log out in the middle of a stream, caused by nothing
but the tool's own parallelism. The race is easy to create: a timer fires while a request is
receiving a 401, or two windows of the same tool each own a timer.

## The procedure

1. **Schedule proactively, with jitter.** When a token is issued with a lifetime, schedule its
   refresh at a uniformly random point between roughly eighty and ninety percent of that
   lifetime. Fixed offsets make every instance refresh on the same second after a restart;
   the jitter spreads them, and the margin leaves room for a failed attempt to be retried
   before expiry.
   Schedule from the token's absolute expiry, stored with it, so a restart computes the
   remaining lifetime rather than assuming a fresh one.
2. **One flight, tagged by generation.** The refresh runs under the credential's lock, and
   every credential carries a generation number that increments on each change. A caller
   that saw a 401 asks to refresh *the generation it used*; if the generation has already
   moved on, someone else refreshed while it waited, and it retries with the current token
   instead of spending another single-use refresh token. Proactive refresh, validation and
   every request path go through the same lock.
3. **Persist, but never fall back.** Write the new pair to the secret store before handing the
   new access token out. If that write fails, keep the new pair live in memory and return the
   persistence failure to the caller: the old refresh token was burned by the refresh that
   just succeeded, and restoring it would guarantee the next refresh fails.
4. **Reactive refresh at most once per request.** A 401 on a request triggers (or joins) a
   refresh and one retry of that request. A 401 on the retry is not a reason to refresh
   again: the grant has stopped working, and the broker enters the unauthorised state and
   tells the streamer to reconnect.
5. **Validate periodically.** On start and on a regular cadence (platforms ask for roughly
   hourly), validate the session with the platform's validation endpoint, so a grant revoked
   from the platform's own settings is noticed promptly rather than at the next action. Check
   what validation returns, not only that it succeeded: the token must belong to this tool's
   client identity and carry the scopes the tool requested. A foreign client identity retires
   the login; a scope shortfall asks for re-consent and keeps it. A transient failure of the
   maintenance loop itself - a network blip during a scheduled validation - is retried with
   backoff and never tears down the live event connections.

## Obtaining the grant: device-code polling

A desktop tool cannot keep a client secret, so it obtains the grant with the device-code
flow. The poll is part of the same discipline:

- poll at the interval the server returned, never faster;
- on "authorisation pending", keep polling - it is the expected answer, not an error;
- on "slow down", increase the interval (the standard adds five seconds) and keep the larger
  interval for the rest of the flow;
- on expiry of the device code, stop and offer a new code; never poll an expired code;
- a rate-limit refusal or a gateway error is not an answer: wait as long as the response's
  retry hint says (bounded), and keep polling to the code's deadline;
- check the verification address against the platform's own host before showing it, since it
  is where the streamer will type their password;
- a device code is single-use; once exchanged, discard it, and keep it out of logs while it
  lives - it is a credential for as long as it is pending.

## Decision rules

- **When refresh fails with a network error**, retry within the remaining margin with backoff;
  the old access token is still valid until its expiry.
- **When refresh fails with a definitive invalid-grant answer**, do not retry. The refresh token
  is dead; delete the stored login and go to the unauthorised state.
- **When refresh fails with an ambiguous client error** - an unrecognised code, an unreadable
  body - stop using the login and ask the streamer to re-authenticate, but keep the stored
  credential. Destroying a login is reserved for an answer that says it is destroyed; the
  error body is parsed in one place, and an unparseable body is never definitive.
- **When several processes share one grant**, only the broker process refreshes; others ask
  it. A file lock across processes is a weaker substitute that still needs the single flight
  inside each.

## When not to use it

Grants without refresh tokens - an application token obtained with a client secret on a
server - are simply re-obtained on expiry; the single-flight rule still applies, the
rotation hazard does not.
