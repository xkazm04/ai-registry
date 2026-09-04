---
layer: application
type: application
subject: stream-proxy-hop
technique: credential-attachment-at-the-hop
stack: node
status: forged
verified_on: 2026-09-04
verified_against: node@22
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# Three trees, three answers, and the boundary was drawn in the wrong place

The technique's amendment for content-issued requests was written from one tree
and then walked against three, which moved its discriminator. This application
records the walk, because the refutation is the useful part.

The amendment as first written said the ranking of credential routes collapses
for requests **the browser issues on the rendered content's behalf**, leaving
only the cookie. Three real cases say the collapsing condition is something
else.

## Case 1 — a managed asset route that chose the query string, and was right

A media-generation app in this fleet serves generated run artifacts through an
access-checked route. Reference frames deliberately sit outside the published
static directory, so the gallery reaches images through that route, and the
route's own header comment states the protocol fact this technique opens with —
that an `<img>` cannot carry an authorization header — and then takes the
**query-string** rung, not the cookie.

Under the amendment as first written that is the wrong rung. Reading the tree
says it is the right one, for two reasons the amendment did not carry:

- **The application composes the URL at render time.** The client builds the
  address per paint from a run id and a relative path. Nothing is persisted, so
  the credential in the URL is as short-lived as the render.
- **The value is already a public bundle credential.** The route says so
  explicitly — *the same PUBLIC bundle value the auth module already documents,
  and a query string here bounds nothing the header did not*. Under regime one
  of the browser credential boundary, a value published in the bundle is not
  disclosed by appearing in a URL. The query-string rung's stated cost is
  disclosure; where there is nothing left to disclose, the cost is zero.

The tree also records a deliberate non-decision beside it — access-checked but
**not** rate-limited, because a fifty-tile gallery is fifty requests in one
second and the shared bucket would refuse the tail. That is the same class of
consequence the amendment names for the cookie route and did not name here.

## Case 2 — the tree the amendment was written from

A self-hosted note application serves attachments referenced from `<img>` tags
inside markdown **the user wrote and saved**. Here the collapse is real: the URL
string is owned by the user, outlives any token, and must keep resolving; a
minted credential cannot be written into it, and rewriting stored notes at
render time to inject one would turn every document into a template. The cookie
is what is left, and it cannot be `HttpOnly` because the login endpoint returns a
bearer token that page script then writes.

## Case 3 — a tree where the question cannot arise

A recruiting product in this fleet renders markdown through a hand-rolled
renderer whose supported subset is enumerated in its own header comment:
headings, lists, rules, paragraphs, bold, italic, code, links, underline. **No
image syntax at all**, and links pass a scheme allowlist. No content-issued
subresource can be generated, so the guarded-route enumeration returns empty —
and it returns empty because of a decision made for injection safety, with the
credential question never considered. Its attachments are text notes, not served
files.

## The verdict, and what changed

`not-better`. The amendment's rule, applied at case 1's seam, would have
recommended a cookie and made that tree worse: it would have introduced a
second credential transport, a second invalidation path, and cross-site
protection obligations, in exchange for hiding a value that is published in the
bundle by design.

The rule was not deleted. Its discriminator was corrected from *content-issued
versus app-issued* to **who owns the URL string, and whether it outlives the
credential** — which puts case 1 on the query-string rung, case 2 on the cookie,
and case 3 outside the question entirely. The corrected form also carries case
3's lesson: run the enumeration even when you expect it to be empty, because the
answer is usually a property of a decision made for other reasons.

## What this application cannot do

It is `structural-only`. No behavioural arm was run in any of the three trees:
case 1 needed no change, case 2 is not a managed project, and case 3 has no seam
to instrument. The measurable that would upgrade it — a count of guarded routes
reachable by a request the application does not issue, emitted by a checker
rather than assembled by hand — does not exist in any of the three, and building
it is the return condition.
