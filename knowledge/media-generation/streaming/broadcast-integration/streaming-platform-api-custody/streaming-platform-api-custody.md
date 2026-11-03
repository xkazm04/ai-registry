---
layer: golden-path
type: golden-path
subject: streaming-platform-api-custody
status: forged
use_when: [building a streamer tool that calls the streaming platform's API with the streamer's account, deciding where the platform credential lives and which modules may use it, subscribing to the platform's live events and handling a dropped event stream, disconnecting a streamer's account or handling a revoked grant]
techniques:
  - brokered-calls-token-never-exposed
  - single-flight-jittered-refresh
  - fail-fast-rate-limit-buckets
  - strict-event-versions
  - event-stream-gaps-not-guesses
  - revoke-then-purge-then-stop
---

# Streaming platform API custody

A tool a human streamer runs reaches the streaming platform with the streamer's own
account. The grant the streamer clicked through is a key to their channel: depending on
its scopes it can read chat, send messages as them, time out and ban their viewers, change
their title, run their polls and see who paid them. Every feature in the tool wants a piece
of that key, and the easy architecture hands each feature a copy. This subject is the
standard that refuses the copies. It rests on one sentence:

> **One broker owns the platform credential, its refresh, its rate limits and its event
> subscriptions; modules ask the broker for an outcome, never hold the token, and never
> guess across a gap in what the platform told them.**

The naive reading treats the platform as a web API like any other: store the token
somewhere convenient, let each module call the endpoints it needs, retry on failure,
reconnect the event socket when it drops and carry on. Each of those habits fails on a live
channel in a way the streamer sees. A token copied into five modules is refreshed by five
modules, and because the platform's refresh tokens are typically single-use, the second
refresh revokes the first and the streamer is logged out mid-stream. A retry on a rate-limit
refusal spends the next minute's budget on the same request and starves the moderation
action that mattered. An event socket that reconnects and carries on has silently lost every
event that arrived while it was down - the platform does not replay them - and the tool's
counters, vote tallies and moderation queue now describe a stream that did not happen.

## The broker is a boundary, not a helper

Custody means a single component owns the credential end to end: it obtains the grant, keeps
the access and refresh tokens in the operating system's secret store, attaches them to
outgoing requests, refreshes them, and forgets them. Every other module in the tool talks to
the broker in the tool's own vocabulary - "time out this account for ten minutes, for this
reason", "subscribe me to channel follows" - and receives a typed outcome: done, refused
with a reason, rate limited until a moment, unknown. No module receives the token, a header
containing it, or a client pre-configured with it, because a module that holds the token can
call any endpoint the grant allows, and the grant was sized for the whole tool. That is
[brokered-calls-token-never-exposed](./techniques/brokered-calls-token-never-exposed.md).

The broker also narrows the surface. It exposes the handful of operations the tool's
features actually need, each validated before it leaves - a reason text truncated to the
platform's limit, a timeout duration clamped to the platform's range, an account identity
that came from the platform's own metadata rather than from text. It never exposes a generic
"call this path" escape hatch, because that hatch is the token with extra steps. Every
operation maps to a documented endpoint: platforms forbid third-party tools from calling
undocumented ones, so a feature that needs data the platform does not publish (the chat of a
stream from before the tool was installed, say) is a feature the tool records for itself or
does without - never one the broker reaches by scraping. And it
treats everything the platform sends back as data that might contain the credential: an
error body that echoes the request, a redirect that carries a query string. Responses are
mapped to the broker's own outcome types before anything leaves it; the raw body never does.

Authority on the other side of the broker comes from the same rule the chat-moderation
subject states for messages: who a viewer is comes from the platform's verified metadata,
never from what they typed. The broker is where that metadata enters the tool, so it is
where it is stamped onto events before any module sees them.

## The grant has a lifecycle, and only one writer

Access tokens on streaming platforms are short-lived, on the order of hours, and refresh
tokens are long-lived but often rotate: each refresh returns a new refresh token and burns
the old one. A tool that refreshes from two places at once - two modules, two windows, a
timer and a 401 handler racing - presents the same refresh token twice, and the second
presentation can fail or, worse, revoke the session. So refresh has exactly one writer and
exactly one flight: a single in-flight refresh that every caller waits on, scheduled ahead
of expiry at a jittered point in the token's life so a restarted tool and its siblings do
not all refresh on the same second, and triggered reactively by a 401 at most once per
request. The cheap way to make "at most once" hold across racing callers is a generation
number on the credential: a caller that saw a 401 asks for a refresh *of the generation it
used*, and if the broker has already moved past that generation the caller simply retries
with the new token instead of burning another single-use refresh token. A second 401 after a
fresh token is not a reason to refresh again; it is a grant that no longer works, and the
streamer is told.

Not every refresh failure means the same thing, and the difference decides whether the
streamer's login survives. Only a definitive answer - the platform saying, in its documented
error code, that the refresh token is invalid - destroys the stored login. An ambiguous one
(an unrecognised client error, an unreadable body, a gateway page) keeps the stored login and
asks the streamer to re-authenticate, because deleting a credential on a guess turns a
platform hiccup into a forced sign-in on air. A validation that finds a grant short of the
scopes the tool needs is a re-consent, not a deletion. And once a refresh has succeeded the
old pair is dead: if writing the new pair to the secret store fails, the tool keeps using the
new pair from memory and reports the persistence failure, rather than falling back to a
refresh token the platform has already burned. That is
[single-flight-jittered-refresh](./techniques/single-flight-jittered-refresh.md).

The platform also asks third-party tools to validate a session periodically and on start,
so a grant the streamer revoked from the platform's own settings is noticed within the hour
rather than at the next failed ban. Validation is a read, owned by the broker like
everything else, and its failure moves the tool into the disconnected state below.

Obtaining the grant in the first place, for a desktop tool with no server to keep a client
secret on, is the device-code flow: the tool shows a short code, the streamer approves it in
their browser, and the tool polls. The poll obeys the interval the server gave, adds to it
when the server says to slow down, stops when the code expires, and treats "pending" as the
expected answer rather than an error. A rate-limit refusal or a gateway error during the
poll is not an answer at all - it neither approves nor denies - so the tool waits as long as
it was told and keeps polling until the code's own deadline. A poll that times out is not an
answer either, and the standard is explicit that it slows the poll down rather than repeating
it at the healthy pace. And the verification address
the tool shows the streamer is checked against the platform's own host before it is shown:
it is the one link in the flow the streamer will type their password behind. A tool that
polls faster than asked is rate limited on the one screen where the streamer is watching it
work.

## The budget is the platform's, and it is shared

The platform meters calls in buckets - a number of points per minute, per application and
per user - and reports the bucket on every response: its size, what remains, and the moment
it resets. That reset moment is authoritative. A tool that keeps its own estimate of the
budget and trusts it over the header will drift, because other instances of the same tool,
other tools using the same grant and the platform's own adjustments all spend from the same
bucket. The headers are also not guaranteed: some endpoints carry their own unpublished
caps - moderation actions per channel are the usual case - and refuse with a rate-limit
status that carries no bucket headers at all. Such a refusal takes its wait from the
response's retry hint or a short conservative default, never from the previous bucket's
reset moment, which describes a different budget.

When the bucket is empty, the broker fails fast: the request that would have exceeded it is
refused locally with "rate limited until T", and the calling module decides what that means
for its feature. It does not queue the request behind a sleep and it does not retry a 429,
because a moderation action delayed by a minute is a different action - the message it was
about has scrolled away, the raid has moved on, the streamer has acted by hand - and a retry
loop on a shared bucket starves everything else in the tool. Separate buckets keep separate
concerns apart: a burst of cosmetic reads must not be able to spend the budget a ban
confirmation needs. That is
[fail-fast-rate-limit-buckets](./techniques/fail-fast-rate-limit-buckets.md).

## Events are typed by version, and the stream has holes

The platform's event subscription delivers what happens on the channel - a follow, a cheer,
a ban by a moderator, a chat message - as typed payloads whose shape is fixed by a declared
version. A tool subscribes to an exact type at an exact version, parses into a schema for that
version, and rejects anything else. It does not accept "whatever the latest is", and it does
not parse loosely and fill missing fields with defaults, because a default is a fabricated
fact: an absent amount read as zero, an absent role read as viewer, an absent reason read as
none. A version the tool does not know is an unsupported event, logged and counted, never
half-parsed. An event of a type the tool never subscribed to is rejected, not routed. Optional
fields are validated when present and left absent when absent. Category strings the platform
attaches - a reason class, a suspicion label - are carried as labels to show the streamer,
never mapped onto values that authorise an action. The table of which scopes each subscription
needs, at which version, is data the tool owns in one place, so a grant can be checked against
the features the streamer turned on before any of them fail at runtime. A schema written from
documentation, before anyone captured a real payload from the platform, is itself an
assumption; it is labelled as such until a payload from a real channel has passed through it.
That is
[strict-event-versions](./techniques/strict-event-versions.md).

The event connection itself is a scarce, stateful resource. Platforms cap the number of
event connections per grant and the number of subscriptions per connection, close a
connection that does not subscribe within seconds of its welcome, expect the client to treat
a missed keepalive as a lost connection, and announce planned migrations by handing over a
reconnect address the client must use exactly as given, holding the old connection open until
the new one is welcomed. The tool honours each of these and goes further on two. It pins the
host it will follow a reconnect address to, so a forged or tampered migration message cannot
send the session somewhere else. And it keeps reading the socket while it subscribes: a long
batch of subscription calls made before the first read starves the keepalives and the
platform closes a connection the tool thinks is healthy. One topic the platform refuses
permanently does not stall its siblings; it is skipped, and the skip is shown to the streamer
as a feature that is not receiving events.

Most important, **a dropped connection is a gap, and a gap is recorded, not bridged**. The
platform does not replay events lost while the client was away. When the stream resumes,
the tool knows the moment it lost contact and the moment it regained it, and it records that
interval as a gap with both edges. Everything downstream that counts - a vote tally, a
giveaway's entry window, a moderation queue, a contribution total - carries the gap forward:
the tally is marked incomplete for that interval, the window's fairness claim names it, the
moderation verdict for messages in it is "unseen", never "clean". The same holds inside the
tool: a bounded internal queue that overflows has dropped events, and an overflow is a gap
with edges like any other. The producer never waits on a slow consumer - a classifier taking
its time must not stall intake from the socket - so the bound is real and overflow is the
expected way a slow consumer shows itself. The gap's leading edge is the timestamp of the last
event actually observed, not the moment the consumer noticed the loss; the consumer may have
been busy for seconds, and starting the gap at its completion time hides exactly the events it
lost. A tool that interpolates across a gap, estimates what probably
happened, or reports a pass for a message it never received has made up part of the stream.
That is [event-stream-gaps-not-guesses](./techniques/event-stream-gaps-not-guesses.md).

## Disconnecting is an ordered teardown

When the streamer disconnects the tool, or the platform tells the tool the grant is gone,
the order of operations matters. First **revoke**: tell the platform to invalidate the token,
so a copy that leaked anywhere stops working at the source. Then **purge**: delete the tokens
from the secret store and every cache of platform-derived personal data the grant made
possible - chat history, viewer identities, payment events - that the tool has no other basis
to keep. Then **stop**: close the event connections and refuse further calls with a
disconnected outcome. Done in another order, each step leaves a window: stop first and a
crash before the purge leaves a valid token on disk; purge before revoke and the tool has
thrown away the very token it needed to revoke itself. The stop has one subtlety: if the
signal that stops the tool's workers is published before the purge has finished, it can cancel
the very task carrying the purge and leave deletion half done - so the signal goes out after
the purge returns. A purge or a secret-store deletion that failed is an error the streamer can
retry, never a quiet success, and a purge that completed is safe to run again. A revocation the platform did not
confirm is reported as unconfirmed, with the instruction to remove the connection from the
platform's own settings, never as done. That is
[revoke-then-purge-then-stop](./techniques/revoke-then-purge-then-stop.md).

## Boundaries

[Streamer-in-charge moderation](../../streamer-tools/streamer-in-charge-moderation/streamer-in-charge-moderation.md)
decides *whether* an action on a viewer should be sent and on whose authority: shadow rules,
review windows, scoped grants. This subject decides *how* a decided action reaches the
platform - through which credential, inside which budget, with what honest outcome - and how
the platform's events reach the tool. The pick rule is the decision: if the question is
"should this account be timed out", read moderation; if it is "the timeout was decided, what
happens when the bucket is empty or the token just expired", read this. A rate-limited or
unknown outcome from the broker is exactly the state moderation reports as refused or
unknown, never as done.

[Authority from metadata only](../../trust-and-evaluation/live-chat-moderation-and-anti-bait/techniques/authority-from-metadata-only.md)
owns the rule that a viewer's rank comes from verified platform fields rather than from text.
This subject owns the pipe those fields arrive through: strict event versions are what make
the role field trustworthy, and a gap is the interval in which no role was observed at all.
When the question is how the host or a rule treats a claimed role, read that technique; when
it is whether the field can be believed, read this subject.

Broadcast software control holds a different credential - the password to the streamer's
broadcasting software - and its custody rules mirror these: one holder, the secret store,
never in output. The platform credential reaches the internet and outlives the session; the
control-socket password reaches only the streamer's own network. A tool that has both keeps
them in separate custody and never lets one module hold either.
