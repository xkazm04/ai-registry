---
layer: technique
type: technique
subject: stream-proxy-hop
technique: credential-attachment-at-the-hop
status: forged
laws: [one-validation-door, one-authority-per-vocabulary]
shared_with: []
use_when: [a stream client cannot send an authorization header, deciding where a service key lives in a proxied stream, forwarding request headers to an upstream service, a guarded route is reached by a request your code does not issue, an image or download in user-authored content sits behind the auth gate]
---

# Credential attachment at the hop

The standard client for a server-pushed stream **cannot set request headers**.
It sends what the user agent attaches on its own and nothing else. That single
protocol fact is why a large fraction of streaming hops exist at all: an
authenticated long-lived stream has to put its credential *somewhere*, and with
headers unavailable the choices reduce to three — the query string, a
hand-rolled reader that abandons the standard client's automatic reconnection,
or **a hop that holds the credential server-side**. This technique is the third
option done properly.

## Two credentials, two paths, no substitution

The confusion this technique prevents is treating one credential as if it were
the other. There are always two:

- **The hop's credential for the origin.** A service key, a machine token, a
  signed assertion — an identity that says *this deployment* is allowed to talk
  to the origin. It lives in server-side configuration, is never sent to the
  client under any circumstance, and is attached outbound by the hop.
- **The caller's identity.** Whatever proves *this user* is who they claim. It
  arrives by a path the stream client can actually use — the credential the
  user agent attaches automatically, or a token the caller obtained by another
  route — and it is **verified at the hop**, then forwarded to the origin
  explicitly if the origin needs to make its own decision.

Neither substitutes for the other, and the two failures are symmetrical.
Forwarding only the caller's identity means the origin must trust arbitrary
callers. Attaching only the hop's key means the hop has become an open proxy to
a privileged origin: anyone who can reach the hop borrows its authority. The
hop authenticates the caller **before** it spends its own credential, and that
check is not optional on the streaming route merely because the streaming route
is harder to test.

## The forwarded-header allowlist

The single most consequential line in a hop is the one that builds the outbound
header set, and the wrong version of it is short and obvious: copy the inbound
headers, then add the credential. It is wrong in four ways at once.

- **It forwards the caller's credentials to the origin.** Everything the user
  agent attached automatically — session cookies for your domain, cached
  authorization — is now the origin's problem to be trusted with, whether or
  not it needed any of it.
- **It forwards the hosting platform's own routing headers** into a request
  they no longer describe. The forwarding chain, the client address, the
  protocol and host headers were written about the *inbound* hop; re-asserted
  outbound they describe a request that does not exist, and an origin that
  makes decisions from them (rate limiting by client address, host-based
  routing, protocol-based redirects) makes them from fiction.
- **It re-asserts framing headers that stopped being true.** Content length and
  content encoding described the body the hop received; the hop is sending a
  different body, or none. Mismatched framing produces failures whose error
  messages point at the transport layer and never at this line.
- **It is unauditable.** "Which headers reach the origin" has no answer that
  can be read; the answer is whatever the inbound request happened to contain,
  which varies by user agent, by network, and by platform release.

The correct shape is an **explicit enumerated list**, constructed in one place,
so the outbound header set is a closed vocabulary rather than an accident
([one-validation-door](../../../../_laws.md#one-validation-door),
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Typically that list is short: the content type the hop is actually sending, the
accept type for the stream, the caller's forwarded identity when the origin
needs it, a correlation identifier — and **the resume cursor**. The standard
stream client sends the identifier of the last event it received, on its own,
on every reconnect; that header is the only state the automatic reconnect
carries, and an origin that keeps a replay window uses it to fill the gap. An
allowlist built from scratch that omits it turns every reconnect into a fresh
subscription: the client silently loses whatever was emitted between the reap
and the reopen, and the origin's replay machinery is never exercised through
the hop. It is the header the enumerate-don't-spread rule most reliably drops,
because it is one the application never sets and so never thinks to forward.
Anything else earns its place by being named.

The same discipline governs the return direction — upstream headers are not
copied downstream — for the reasons in
[origin-non-disclosure](./origin-non-disclosure.md).

## Where the caller's token may travel

Given that the stream client cannot set a header, the caller's token has to
reach the hop by another route, and the options rank clearly:

- **The credential the user agent attaches automatically** is the best answer
  where the hop shares an origin with the page: it is invisible to page script,
  it is not written into any URL, and it survives the reconnects the stream
  client performs on its own. Its cost is that cross-site request protection
  becomes the hop's problem, and the hop must apply it.
- **A short-lived token in the query string** is the common fallback and is
  acceptable *only* if it is minted for this purpose: narrowly scoped, expiring
  in minutes, single-audience, and never the caller's long-lived credential.
  URLs are logged by every intermediary that terminates the transport
  security — the load balancer, the content network, the hop itself — are
  recorded in browser history, and travel as referrer information wherever the
  page's referrer policy lets the path cross an origin; a long-lived token
  placed there should be considered disclosed.
- **A prior exchange that establishes a session, then a bare stream URL** is
  the most disciplined answer and the most machinery: the client authenticates
  once by ordinary means, receives a stream identifier, and the stream carries
  no credential at all beyond that identifier's own scope.

Whichever route is chosen, the hop verifies before it proxies, and a request
that fails verification is refused **before** any upstream connection is
opened. An unauthenticated request that reaches the origin has already cost
what the check existed to save.

### When the ranking has only one rung left

The three routes above are a *choice*, and the choice exists because the
application decides to open the stream. There is a wider family with the same
protocol fact and no choice at all: requests the browser issues **on the
rendered content's behalf** rather than on the application's. An `<img>` or
`<video>` source, a stylesheet's `url()`, a font, an iframe, a plain download
link. The application never touches those requests, so it cannot attach a
header to them, and any of their targets sitting behind its auth gate inherits
the same problem the stream client has.

It does **not** follow that the ranking collapses. That was this section's first
reading and a tree refuted it: the discriminator is not *content-issued versus
app-issued*, but **who owns the URL string, and whether it outlives the
credential**:

- **The application composes the URL at render time** — a gallery building
  `src` attributes from a run id and a path, a viewer assembling a thumbnail
  address per paint. Nothing is stored, so a fresh token can be minted into the
  query string on every render and the ranking above applies unchanged. The
  query-string rung is fully available here, and where the value in question is
  already a public bundle credential under regime one of
  [browser-credential-boundary](../../../../security/data-and-transport/browser-credential-boundary/browser-credential-boundary.md),
  putting it in a URL discloses nothing the bundle did not — a tree that says so
  in the route's own comment has made the argument correctly.
- **The user owns the URL string** — it sits inside a note, a comment, a
  document body, and is expected to keep resolving next year. A short-lived
  token cannot be written into a string that outlives it; rewriting stored
  content at render time to inject one turns every document into a template; and
  the prior-exchange rung fails identically, because there is nowhere to put the
  returned identifier that the content's own markup will use.

Only the second case collapses the ranking, and then it leaves the credential
the user agent attaches automatically — not because it ranked first, but because
the other two were never applicable. Two costs follow, and both need saying
because the section above sells the cookie on properties this case may not have:

- **It may not be able to be `HttpOnly`.** The first route's stated advantage —
  invisible to page script — holds when the *server* sets the cookie at login.
  An application whose login endpoint returns a bearer token to a script that
  then writes the cookie itself cannot have that property by construction. The
  cookie is script-readable, and the honest accounting is that this costs
  nothing *additional* — the token was already in the script's hands — but the
  advertised benefit is absent and should not be claimed.
- **The credential is now held twice, deliberately.** Application-issued calls
  carry it in a header; content-issued subresources carry it in the cookie. That
  is one secret with two transports and two invalidation paths, so logout,
  expiry and rotation must clear **both** — a session ended in storage while the
  cookie survives leaves a browser that still loads attachments for a user who
  believes they signed out. Scope the cookie to the application's own base path
  and mark it same-site; it exists to answer a narrower question than the header
  does and should not travel further.

The general rule the wider family adds: **enumerate which of your guarded routes
can be reached by a request your code does not issue, and for each one ask who
owns the URL.** The first half of that set is decided by what the content is
allowed to reference, not by the client library. The second half is what picks
the rung — and it is worth running the enumeration even when you expect it to be
empty, because the answer is usually a property of a decision made for other
reasons. A renderer with a closed tag subset that omits images cannot generate a
content-issued request at all, and has closed this question upstream without
anyone deciding it on credential grounds.

## Rotation and absence

Two operational rules that get skipped because the streaming route is the one
nobody exercises:

- **A missing credential fails loudly at the hop**, with its own error code,
  rather than being sent as an empty value and producing an upstream
  authorization failure the client is told to retry. The two look identical
  downstream and have completely different repairs.
- **Rotation does not require a restart of every open stream.** Credentials are
  read at request time from the configuration source, not captured once into a
  module-level constant at cold start — otherwise a rotation leaves long-lived
  instances holding a revoked key, and the failure appears minutes to hours
  later with nothing in the deployment record to point at.

## When not to use it

- **When the origin is public and unauthenticated.** Then there is no hop
  credential, and the hop exists for the other reasons in this subject — the
  header allowlist still applies, because the platform-header and framing
  problems have nothing to do with credentials.
- **When the client can hold the credential safely and set it.** A native or
  server-side consumer using a real request client is not subject to the
  header restriction, and inserting a credential-holding hop for its benefit
  adds a hop that buys nothing. Note the qualifier: *safely*. Browser page
  script is not a safe holder for a service key, and "the client can set
  headers" is not the same claim as "the client may hold this secret".
