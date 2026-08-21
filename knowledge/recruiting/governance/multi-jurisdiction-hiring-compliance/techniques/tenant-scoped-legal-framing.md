---
layer: technique
type: technique
subject: multi-jurisdiction-hiring-compliance
technique: tenant-scoped-legal-framing
status: forged
laws: [say-only-what-the-record-holds, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [building a compliance lookup endpoint, rendering a jurisdiction-specific notice, reviewing who can read a workspace legal posture]
---

# Tenant-scoped legal framing

## The concern

"Which law applies" is answered by a lookup, and the input to that lookup
decides two things at once: whether the right framing is shown, and who is
allowed to know a given organisation's legal posture. Get the input wrong and
you fail both — you display a neighbouring region's assertion to your own
candidates, and you expose every other team's exposure map to anyone with an
account.

The rule is one sentence: **the jurisdiction follows the authenticated
caller's own workspace configuration, and nothing else.** Not a region
parameter, not a workspace identifier in the request, not a browser locale, not
a header, not an inference from the candidate's address.

## Why each rejected input is rejected

- **A caller-supplied workspace identifier** turns a compliance endpoint into
  an enumeration endpoint. Legal posture is competitively sensitive: it reveals
  which markets an organisation hires in, which obligations it has accepted,
  which regimes it believes apply to it, and therefore where it is exposed.
  There is no legitimate cross-workspace read here, so the parameter should not
  exist — an authorisation check on a parameter that should not exist is
  strictly worse than removing the parameter, because the check will eventually
  be relaxed by someone who needs an admin view.
- **A request parameter for region** lets any client — including a stale cached
  page or a mis-built link — pick the law. It also means the answer is not a
  fact about the organisation but a fact about the request, which cannot be
  audited.
- **Browser locale or IP geography** describes where a browser is, which is
  neither where the employment is nor where the hiring entity is established.
  A recruiter travelling does not move their company's jurisdiction.
- **Inference from the candidate's location** is the subtly wrong one, because
  it sounds candidate-protective. It is not the product's determination to
  make: which regime governs a hiring process is a legal question about
  establishment, place of work and the employer's own configuration. Where
  candidate location genuinely creates an additional obligation, that is a
  *second* row surfaced for a human to reconcile, not a silent override of the
  first.

## Procedure

1. **Resolve the workspace from the session**, then read that workspace's
   configured regime identifier, then read the catalog row. Three steps, no
   inputs from the request body.
2. **Fail closed to the neutral row, never to a specific regime.** An
   unresolved or unauthorised lookup resolves to the catalog's
   spans-jurisdictions row, which names the guarantee without naming any
   country's instrument — never to the home jurisdiction, never to whichever
   regime most customers use, never to an empty section
   ([law](../../../_laws.md#uncertainty-resolves-toward-the-candidate)). The
   comfortable default is the dangerous one precisely because it looks right to
   the majority of readers and is wrong for exactly the minority who would
   notice.
3. **On an anonymous candidate surface, resolve server-side from the token.**
   A candidate has no session, so a page that fetches its own jurisdiction
   cannot prove which organisation's opening it is displaying — it will answer
   for whatever workspace the unauthenticated endpoint defaults to. Resolve the
   regime on the server from the capability token the candidate already holds
   and pass it in as data. A client fetch on an unauthenticated surface is
   either wrong or leaky, and no amount of care in the endpoint fixes it,
   because the missing information is on the caller's side.
4. **Distinguish a gated response from a successful one.** Parse the status,
   not only the body. An authentication proxy answers a JSON error object with a
   failure status; body-only parsing accepts it, finds no jurisdiction, and
   silently leaves the pre-fetch default standing — a blocked endpoint becomes
   indistinguishable from a working one. Treat a non-success status as a hard
   failure that routes through the same path as a network error, so it can be
   retried and reported rather than absorbed.
5. **Never leave a stale assertion on screen.** This is the failure mode that
   actually happens: a lookup fails, the surface keeps whatever it rendered
   last, and a workspace displays the wrong region's legal claim permanently —
   permanently, because a legal claim that renders successfully is not something
   anyone re-reads. Clear the framing on failure; a visibly missing notice is
   discovered in days, a wrong one may never be.
6. **Make the configured jurisdiction visible and its change auditable.** It is
   a setting with legal consequence, so changing it is a recorded event with an
   actor, and the surfaces that depend on it name which jurisdiction they are
   speaking for.
7. **Assert only what the configuration holds.** A disclosure that names an
   equal-opportunity framework and a data-protection law must name *this
   workspace's* framework and data law, read from the catalog row, not a
   hard-coded pair that was true when the component was written
   ([law](../../../_laws.md#say-only-what-the-record-holds)).
8. **Do not cache across tenants.** A response keyed only by regime looks
   cacheable and is, but a response keyed by nothing — or cached at a layer that
   does not partition by session — is how one workspace's posture reaches
   another. If caching, key on the regime identifier after resolution, never on
   the request.

## Decision rules

- When a legitimate cross-workspace need appears — an internal support tool, a
  parent organisation viewing subsidiaries — build it as a separate,
  differently-authorised surface with its own audit trail. Do not widen the
  candidate-facing path.
- When a workspace operates in several jurisdictions, store a set, designate a
  primary for framing, and require a human choice for any surface that can show
  only one. Silently choosing the first is a legal determination made by array
  order.
- When the configured jurisdiction is unmapped in the catalog, resolve to the
  neutral row and flag the configuration as unrecognised to an operator. See
  the catalog technique.
- When a candidate-facing artifact has already been sent under the wrong
  framing, correct it forward as a new communication with an explanation; the
  sent artifact is part of the record and is not edited away.

## When not to use this

Do not apply tenant scoping to genuinely public, jurisdiction-neutral content —
a general description of how the product works, a security overview, a
sub-processor list. Scoping that content produces the opposite failure: a
procurement reader who cannot see what everyone is entitled to see, and a
support burden with no confidentiality benefit.

The mechanics of session resolution, tenancy isolation and authorisation are
general engineering practice and belong to that discipline. What is specific
here is the judgment that a *legal posture* is confidential at all — it is
tempting to treat compliance data as public marketing, and it is not.
