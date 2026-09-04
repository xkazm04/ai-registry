---
subject: stream-proxy-hop
domain: software-engineering
last_touched: 2026-09-04
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
