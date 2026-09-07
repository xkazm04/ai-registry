# Notion as the `knowledge_base` connector

What was learned mapping this recipe onto Notion specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**A multi-select property creates a new option the moment you write an unknown value, and
that is the taxonomy sprawl this recipe exists to prevent, made automatic.** Writing "APIs"
where the vocabulary holds "API" does not fail and does not warn: the base simply has two
tags now, and it will have thirty within a quarter. The controlled vocabulary therefore has
to be read before a page is tagged and the write restricted to values already in it, with
an extension made deliberately as its own act. Everything else in this recipe about tag
discipline is unenforceable here without that read.

**Relations and inline links are both cross-references and only one of them is
bidirectional.** A relation property appears on both pages, so the page being pointed at
knows it has been pointed at. An inline link in the body does not, and a base built on
inline links has no way to tell later which pages nothing points to. If this recipe's
cross-reference criterion is to mean anything to the audit that runs beside it, connections
have to be relations.

**There is no unique constraint, so create-once is a read-then-write and the read is the
whole safety.** The recipe requires that a create which appeared to fail does not produce a
second page. Notion will happily accept the same page twice. The identity the intake handed
over has to be stored as its own property, queried before the create, and the destination
read back afterwards, because the failure mode is a write that succeeded and returned a
timeout.

**The destination question is genuinely two questions.** Databases and top-level pages are
separate resources, and the answer decides everything downstream: only a database row can
carry the tags, the source identity, the checked date and the relations this recipe needs
as queryable fields. A page-tree destination looks tidier and quietly makes four of the
success criteria unverifiable.

**Contradiction detection is bounded by what the credential can enumerate.** Finding what a
new page disagrees with means reading the pages it might disagree with, and an integration
sees only what has been shared with it. A partial view produces a confident "nothing
contradicts this", which is the worst available answer. Establish the share scope at
adoption and treat an unshared area as unknown rather than as clear.

## What transfers to any knowledge base

- If the store creates vocabulary on write, the vocabulary is not controlled. Read it first
  and extend it as a separate decision.
- Prefer the connection type the target can see. A one-way link is invisible to everything
  that later asks what is unreferenced.
- Without a uniqueness guarantee, idempotency is a query plus a read-back, and the read-back
  is the part people leave out.
- Anything a criterion is checked against has to be a queryable field, not prose in a body.
- A contradiction check over a partial view returns a false all-clear. Know what you cannot
  see and say so.
