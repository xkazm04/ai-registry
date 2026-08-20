---
layer: technique
type: technique
subject: public-money-attribution
technique: public-body-classification
status: forged
laws: [missing-is-not-zero, incident-anchored-doctrine]
shared_with: []
use_when:
  - deciding whether an entity's money is its own public mandate
  - an entity's public/private status gates attribution to a person
---

# Public-body classification

Whether an entity's spending is its own public activity or money that could
reach a politician is an *ownership* fact, and it must be established as one.
The two tempting shortcuts both fail in the expensive direction:

- **Name-keyed tests** ("contains 'ministry'", "contains 'city'") catch every
  obviously named body and miss precisely the cases that matter: publicly
  owned holding and operating companies with neutral commercial names. The
  incident that anchors this rule: a regional government's health-sector
  holding company, wearing an ordinary private legal form and a name no marker
  list caught, was classified private — and it was the single largest figure
  its batch produced. The biggest number in the run was wrong, in the
  defamatory direction
  ([incident-anchored-doctrine](../../../_laws.md#incident-anchored-doctrine)).
- **Closed-world legal-form tests** ("not on the public list ⇒ private")
  assume the classifier's table is complete. Legal-form vocabularies are
  large, partially published, and drift; an unrecognized code under a
  closed-world rule silently becomes "private", which is the one verdict that
  *enables* attribution.

## The procedure: two layers, three tables, four verdicts

1. **Own legal form first.** If the entity's own registered legal form is on
   the verified *public* allowlist (state organs, municipalities, regions,
   public universities, statutory funds and institutions), it is a
   **public-body** outright — regardless of who nominally owns it.
2. **Then walk current ownership.** If the entity's own form is an ordinary
   business form, examine its shareholders/members from the primary register.
   If any *current* holder is itself a public-form entity, the verdict is
   **publicly-owned**: public money flowing through it is the public owner's
   activity, however private the entity's own form looks. Historical holders
   (recorded as removed) never decide the verdict.
3. **Only with positive evidence, private.** The verdict is **private** only
   when the own form is a verified business form *and* the ownership record
   was actually retrieved *and* every current holder resolves to a
   non-public form. A one-hop walk cannot honestly deliver this verdict on
   its own terms: a current holder wearing a business form may itself be
   publicly owned one register hop up — the same neutral-named holding
   pattern this technique exists to catch, recursed. Either the walk recurses
   through business-form holders until every chain terminates in a verified
   form, or a business-form holder is treated like an unknown code — the walk
   cannot conclude "no public owner" and says so. Statistical practice makes
   the same point more broadly: public control also travels outside the
   shareholder table (appointment rights, special shares, dominant
   influence), so even a fully recursed ownership walk is establishing
   *ownership*, and a verdict of `private` asserts no more than that.
4. **Everything else is `unknown`** — and `unknown` blocks attribution.

This requires *three* tables, not one: a verified-public allowlist, a
verified-private allowlist, and — by their difference — the honest gap. Each
allowlist entry records how it was verified (a real named subject checked
against the primary register, or the register's own published code table), so
extending the tables is an evidence act, not an edit. Unrecognized codes are
returned to the caller for logging and table extension; they are never guessed
around.

## Decision rules

- **Unknown never falls through to private.** The expensive error is calling
  a public body private and hanging its budget on a person; the cheap error is
  a manual-review ticket. Asymmetric costs demand an asymmetric default.
- **Absence of data is not evidence of private ownership.** A private-form
  entity whose ownership record could not be retrieved is `unknown`, not
  `private` — the missing record is a different fact from a retrieved record
  showing no public owner ([missing-is-not-zero](../../../_laws.md#missing-is-not-zero)).
- **A business-form holder is not a terminal answer.** "Held by an ordinary
  company" ends the question only if that company's own ownership was walked;
  an unwalked business-form holder leaves the chain open, and an open chain
  cannot support `private`.
- **An unknown code among current holders taints the verdict.** If any current
  holder's form is in neither table, the walk cannot conclude "no public
  owner"; say so and route to review.
- **Read every load-bearing array of the ownership record.** Registers store
  holders under multiple structures (share classes, member types); a walk that
  reads only one has been observed to miss owners. Enumerate the structures
  deliberately, and treat "we read them all" as a tested invariant.
- **Natural-person holders are out of scope for this question** — the walk
  asks about *public* ownership. (Whether a natural person owning the entity
  is the official themselves is a different technique's question.)

## When not to use it

This classifier decides *attribution*, not *interest* or *procurement risk*. A
publicly-owned company can still be the site of a genuine conflict — an
official steering their region's holding toward their own suppliers — and the
`unknown`/`publicly-owned` verdicts must not remove entities from human review
queues. It is also not an identity resolver: it assumes the entity and its
register record are already correctly matched. And do not deploy it where no
authoritative legal-form and ownership register exists — without a primary
source to verify allowlist entries against, the tables degrade into the
name-keyed guesswork the technique exists to replace.
