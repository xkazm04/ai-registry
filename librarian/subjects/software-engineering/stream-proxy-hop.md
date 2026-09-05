---
subject: stream-proxy-hop
domain: software-engineering
last_touched: 2026-09-05
touched_by: deepen
dry_streak: 0
---

# stream-proxy-hop

First touch by `/intake`: 2026-09-04, second pass over a self-hosted markdown
note service. The subject was not on any worklist and was reached by a concept
search, not by a slug match — which is the whole story of this entry.

## State

6 techniques unchanged, +1 application (first `node` application). One technique
amended: `credential-attachment-at-the-hop` gains a boundary section.

## The subject was nearly missed, and the reason is reusable

The candidate was "a session token duplicated into a cookie because
markdown-embedded attachments are browser-issued subresource loads that carry no
`Authorization` header". The design record filed it `corpus: NONE` with a
proposed home in `browser-credential-boundary`, and that was **wrong**.

This subject already owned it. `credential-attachment-at-the-hop` opens on the
identical protocol fact — a client that cannot set request headers — and its
"Where the caller's token may travel" section already ranks the
automatically-attached credential first, for the same reasons. Nothing was going
to surface that by mapping *attachment*, *cookie* or *subresource*, because the
subject is named for a **streaming proxy** and the technique for a **hop**.

The lesson, recorded in `LESSONS.md`: for a design candidate, map the **force**
as well as the decision. The decision was "put the token in a cookie"; the force
was "this request cannot carry a header", and the force is what the corpus had
already filed, under a name the decision does not resemble.

## What was actually missing, and how it was corrected twice

The technique's ranking is a *choice* among three rungs, available because the
application decides to open the stream. The amendment adds the family where
there is no choice: requests the browser issues on rendered content's behalf.

The amendment was then **refuted by its own apply step**, forty minutes after it
landed. As first written its discriminator was *content-issued versus
app-issued*. A managed media-generation project serves access-checked artifacts
to an `<img>` gallery, states the same protocol fact in the route's own header
comment, and takes the **query string** — correctly, because it composes the URL
per render (nothing outlives the credential) and the value is already a public
bundle credential, so a URL discloses nothing the bundle did not. Applying the
amendment as written would have made that tree worse.

Corrected discriminator: **who owns the URL string, and whether it outlives the
credential.** Three real cases, three answers — the managed project on the query
string, the source on the cookie (its URLs live in saved user markdown), and a
recruiting project outside the question entirely, because its hand-rolled
markdown renderer supports no image syntax and therefore cannot generate a
content-issued request at all.

That third case added the amendment's closing rule: **run the enumeration even
when you expect it to be empty**, because the answer is usually a property of a
decision made for other reasons.

## Open ground

- The application is `structural-only`. No behavioural arm ran in any of the
  three trees. The instrument that would upgrade it — a checker emitting the
  count of guarded routes reachable by a request the application does not issue
  — exists in none of them, and building one is the return condition.
- The subject's other five techniques are untouched by intake and carry no
  `node` applications; the one added here is about a *non*-streaming case, so the
  streaming lane's single-stack debt is unchanged.

Source note: [[2026-09-04-flatnotes]]

## 2026-09-05 - /deepen batch (first deepen; 6 -> 7 techniques, 3 -> 4 applications; dry_streak 0)

Second stack landed: rust, from a fleet desktop backend's webhook relay - the
consumer half of reconnect-storm-hygiene (single socket by task map, doubling
backoff without jitter, stable-connection reset, bounded dedup on the resume
cursor; defects: one error string for four causes, no attempt limit, retryability
discarded with the status in hand).

Lane 1 refuted the subject's central mechanism as stated: the standard
server-pushed-stream client reconnects on a clean end of body and fires its error
event (HTML living standard, end-of-body step); "the client does not reconnect"
belongs to hand-rolled readers only. The node heartbeat application had endorsed a
tree comment saying the opposite; it now names that comment as a defect. Numbers:
"typically 30-60s" -> documented defaults 10s to 125s across five vendor documents,
60 most common; one gateway's 20s is a first-response timer, not idle. Two timer
classes now distinguished: between-bytes (a heartbeat defeats) vs total-duration
cap (it cannot).

New technique lifetime-cap-rotation on lane convergence (blind prediction, a
function platform's duration docs, and a fleet route's header comment); prior-art
grep over the bundle's use_when and slugs found none. no-transform corrected: it
stops re-encoding, not buffering; a vendor anti-buffer header is needed beside it.
The hop's own upstream client carries a between-chunks timeout (one runtime's
default fetch abandons a quiet body at five minutes) - the inner leg now has its own
sizing rule. Resume cursor added to the allowlist rule; backoff resets on a stable
connection, not on open (cross-referenced to retry-backoff).

Two live defects found in the fleet's one node hop: the inner-leg timeout cuts the
upstream read every five quiet minutes while the outer heartbeat runs; the
from-scratch allowlist drops the resume cursor. A third is latent until the deploy
target is known (no lifetime declared).

Drift: two node applications kept at node@22 (the tree's CI pins 22, stated in the
body); the credential application's witness withdrawn (three trees, three pins,
written per tree). Blind lane 7 of 8 reached; the blind-only item was the three-way
contradiction between technique, golden path and application on reconnect shape.

Demand: the map's rows for this subject on two projects are keyword candidates on
auth contexts (state unknown, no deviation text). Real hops in the fleet: one node
hop and one rust consumer; two other projects' stream routes are origins with good
hygiene, not hops - declined as applications here.

Proposals (Director-held): retry-backoff owns the stable-connection reset rule and
should point back here as a second sighting; realtime-events - an origin-side
replay window with a `reset` event when the gap exceeds the ring (a rust origin in
the fleet) is a neighbour's application; error-handling/crash-capture - a platform
timeout killing the function so the catch never runs is a live instance;
webhook-ingestion - HMAC over a relay-re-serialised body as a sender-authentication
boundary case.

Banked (return conditions): instrumented proof of the inner-leg reap (a worktree
the operator will run against a quiet origin for over five minutes); the smallest
documented default rule's second sighting (a fleet tree behind a content network
whose clustered timer is uneditable); whether the node hop is deployed on a function
platform (decides if the missing lifetime is live or latent).

### Impact (registry map, regenerated 2026-09-05 after this landing)

Four projects carry one `unknown` pair each (goat, personas, kp, ascent - keyword
matches on auth or streaming contexts); no judged verdict, so no stale row. The one
real node hop in the fleet sat in a project this machine's fleet declaration did not
list; declared the same day, its map now carries 2 `unknown` pairs for this subject,
so the two live defects wait on a first `/conform`, not a re-judge.
