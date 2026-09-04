---
subject: authorization
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# authorization

First touch: 2026-08-28, `/deepen` loop round 4 over the software-engineering
domain. 20 attention points, 5 consumer deviations. Not single-stack — four
applications across `go`, `node` and `rust`, which is unusually good coverage
for this bundle.

## State

7 -> 8 techniques, 4 applications.

Landed:

- `delegated-authority` (new technique) — what the model owes when the thing
  performing an operation is not the thing that wanted it.
- `authorization.md` — new golden-path section ("When the performer is not the
  requester"), placed before the audit section because the audit line's shape
  depends on it, plus frontmatter and index wiring.

## The gap, and how it was visible

The subject grades one caller making one request, thoroughly. It had **zero**
material on delegation: `on-behalf` 0 hits across the entire `security`
category, `delegat` 0 within `authorization`, `confused deputy` 0 within it.

What made the hole findable was the neighbours, not the subject. Two llm-agent
techniques already handle their own instance of the problem and both
explicitly hand the model back here:

- `prompt-safety/model-output-as-untrusted` — "**Entitlement** — this run, with
  this authority, may perform this verb on this record … (`authorization` owns
  the entitlement model; this door is one of its enforcement points)."
- `structured-output/op-grammar-allowlisting` — "the model's proposal inherits
  the caller's authority and can never exceed it. An op that acts on 'whatever
  id the model wrote' performs the confused-deputy manoeuvre with extra steps."
- `credential-vault/brokered-egress` — "the gate against the confused deputy",
  from the secret-custody side.

Three references pointing at an entitlement model that had no notion of a run
having an authority distinct from its channel. The references resolved (they
target the golden path, which now carries the section) but they resolved to
nothing that answered them.

## The diagnosis worth keeping

**A tier is a property of a channel; an authority is a property of a run**, and
the two coincide only in the single-hop case a tier table is built for. That
sentence explains why the gap existed rather than merely naming it: the subject
was forged against a local application where the channel *is* the originator,
so channel-grading was a complete model. The moment anything forwards, the
channel is a proxy for the originator, and a proxy graded higher than the thing
it stands for is the hole.

Same boundary-condition shape as round 3's find in `error-handling`, where
`abort-versus-unreachable` bounded itself with "on an ordinary request the
ambiguity barely exists". **Two of four rounds found their gap at the edge of a
condition the original forge could safely assume.** Worth watching whether that
generalizes — it is the cheapest gap-thesis this loop has produced.

Content that earned its place beyond the obvious "narrow at each hop":

- **Impersonation is a distinct failure from over-privilege, and it is the one
  the audit technique should care about most.** An intermediary carrying the
  originator's own credential gets the scope exactly right and destroys the
  account: nothing downstream can separate what a person did from what the
  machinery did for them. So two properties are kept, not one — *on whose
  behalf* and *by whom* — and the decision record carries the chain.
- **Narrowing has a second axis.** Not only what may be done, but at which
  downstream component the delegation may be presented. Without that binding, a
  delegation legitimately obtained for a low-value errand is a general-purpose
  credential for everything the originator can reach, and axis-one narrowing
  buys much less than it looks like it does.
- **Deferred work is delegation with a gap in it.** Capture the originating
  authority at enqueue, check at execute — the window between them is exactly
  where grants are revoked — and refuse an item whose originator cannot be
  resolved, because the worker's own broad authority is sitting right there as
  the default.

External corroboration (searched after drafting, not before): the field has
converged on the same structure independently — per-hop exchange preserving the
originating subject while recording the acting delegate, audience binding per
hop, recursive narrowing for sub-delegates, and revocability. Named nothing in
the technique; the subject names no standard anywhere and the craft transplants
without one.

## Counter-evidence that confirmed (no edit — first-class results)

- **Revocation and decision-cache staleness are already owned, and owned
  better than the obvious version.** The first lead of the round —
  "authorization is evaluated at one moment and acted on at another, and the
  subject never mentions the revocation window" — was wrong. `failure-direction`
  has the bounded decision cache and the "honesty horizon" ("never serve a
  cached *allow* past" it; an unbounded cache is a liability), `scope-design`
  has the stale-grant-copy rule, and `go--failure-direction` types the
  revocation window out as an integer in a real tree. Declined as covered; the
  new technique cites `scope-design`'s rule rather than restating it.

## Open leads (banked, with return conditions)

- **The three inbound references could point at the technique rather than the
  subject.** `model-output-as-untrusted`, `op-grammar-allowlisting` and
  `brokered-egress` each name the entitlement model and link to the golden
  path. Not edited: they are other subjects' files, they are not broken, and a
  round that has not swept those subjects should not re-voice their prose.
  Return condition: any run that opens `prompt-safety`, `structured-output` or
  `credential-vault`.
- **`privilege-tiers` may deserve a sentence on the channel/run distinction.**
  The tier table is the artifact most directly affected by the new technique
  and it was not opened this round. Return condition: a run that opens
  `privilege-tiers` for any reason.

## Registry-local note

Same generated-file collision as round 3, now routine: a concurrent session is
writing `game-production`, `media-generation`, `localization` and the harvest
lane. `build-index` and `build-knowledge-rules` sweep those bundles, so both
runs' generated outputs were restored to HEAD and this commit is path-scoped to
`security/authorization`, the software-engineering index and its rule file.
`catalog.json` still deliberately stale — see [[error-handling]].

## 2026-09-01 - inbox leads landed under the librarian sweep ([[2026-09-01-1]])

One lead (kp, landed fix), NOVEL. New technique `read-write-predicate-symmetry`: a visibility
rule enforced on reads is enforced on writes in the same terms (not necessarily the same
set), the write refusal borrows the read's refusal so writes disclose no existence, the
three-outcome ownership fact is the primitive and routing helpers derive from it, the gate
precedes the spend, and the by-identifier write paths are an enumerable set. Corroborated by
the API-security top-ten's object-level-authorization category, the not-found-over-forbidden
convention, and row-level-security designs where read filter and write check are separate
clauses. Application `node--read-write-predicate-symmetry` at kp `c6a63199` (commit
`aa92946b`). Proposals: data-access `query-construction` cross-link; error-handling
`user-facing-mapping` needs the deliberate-collapse case.

## 2026-09-02 - /intake openbao (run intake-openbao-0902)

Two amendments, two applications, no new technique.

- `scope-design` gained "Canonical once, and every guard reads the
  canonical value": the exact-matching section presumed a canonical form
  and never said where it is made. Four security advisories in one source
  were one shape (guard on the raw spelling, resolver on the folded one;
  replay cache keyed on the unfolded input). Applied to the registry's run
  board as an `experiment` (`node--scope-design`): SAME SOURCE missed 3 of
  4 spellings of one repository; a source-level fold caught 4 of 4 with no
  false collision on a sibling repo; **shipped** in `run-board.mjs`.
- `failure-direction` gained two rows in its degraded-state enumeration:
  the half-success (a positive decision beside an error - the consumer must
  let the error void the result; lintable) and the wrong minter (only the
  issuing component class may return authority). Applied to a dashboard's
  fetch hook (`node--failure-direction`): `not-better`, 0/5 consumers
  render stale data with an error set under either arm, and the void rule
  is scoped to authority-bearing results in the row itself.

Untriaged here, worth a later look: cross-tenant operations by leaked
identifier where the fix was *removing* the global-identifier endpoints
(identity-bearing-keys' single-composer rule from the enforcement side),
and the two-release default flip for unauthenticated privileged endpoints.
