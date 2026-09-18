---
layer: technique
type: technique
subject: mcp-tools
technique: one-server-many-registrations
status: forged
laws: [identity-survives-reuse, gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [the same tool server can be connected by the user and also declared by an installed extension or plugin, a host derives tool names from where a server was registered, a permission rule or hook matches tools by a name pattern, usage or cost accounting keys tools by the server segment of their name, a connection shows as missing while the same product is connected under another entry, deciding whether two connected entries are two data sources]
---

# One server, many registrations

[Tool identity vs tool name](./tool-identity-vs-tool-name.md) handles a name
that changes over time: a rename splits one tool's history into a death and a
birth. [Client integration](./client-integration.md)'s collision management
handles two servers that export one name. This technique covers the third
case, which neither of those names: **one server reachable under two names at
the same moment**, because the host registered it twice.

It happens as soon as a host lets extensions declare servers. The user
connects a server to their own account. An extension they install declares
the same server, and the host registers it again under the extension's scope,
with a different tool-name prefix. One form looks like
`mcp__<server>__<tool>` and the other like `mcp__plugin_<extension>_<server>__<tool>`.
The two entries have different consent states: the user's copy is authorized
and the extension's copy often is not. Nothing in either entry says they are
the same product.

## What breaks, and none of it throws

- **Name-keyed policy covers one form.** A deny rule, an allow-list or a hook
  matcher written against `mcp__<server>__*` does not match the extension-scoped
  form. The server the operator meant to fence is reachable through the entry
  the rule never saw. One harness guards against its own version of this: it
  refuses a test double whose directory names an extension-scoped server when it
  cannot enumerate that extension's real servers, because the double's tool names
  "would be granted against the real thing".
- **Accounting splits one product into two.** Usage counts, cost and adoption
  metrics keyed on the server segment of a tool name report two small servers
  where there is one. Neither half looks wrong, so the undercount goes
  unnoticed.
- **An unauthorized copy is reported as absence.** The workflow sees the
  extension's unauthorized entry, concludes the tool "is not connected", and
  asks the user to connect something that is already working under their own
  entry. Or it quietly falls back to a degraded path.
- **Two registrations are mistaken for two sources.** A workflow that asks
  "which of your two ledgers is the source of record?" when both entries are
  the same ledger invents a choice. A workflow that reads both and sums them
  double-counts.

## The rule

> **Identity is the server, not the registration. Canonicalize before you key
> anything, and derive every fact about a server over all of its
> registrations.**

1. **Canonicalize from the host's registration record, never by parsing the
   name.** An extension-scoped prefix joins the extension's name and the
   server's name with a separator that either name may also contain, so no
   parse of the string reliably recovers the server. The host knows which
   extension declared which server key. Read that record, map every
   registration to one canonical server identity, and key consent, cost,
   counts and history on that identity (the rename-stable identifier from
   [tool-identity-vs-tool-name](./tool-identity-vs-tool-name.md), when the
   server publishes one).
2. **A name-pattern policy enumerates every form the host can emit.** Where
   the policy language can only match names, write the rule once per
   registration form and test each form, in the same way a gate has to see its
   target ([gate-sees-target](../../../../_laws.md#gate-sees-target)). A deny
   rule tested against one form is a deny rule with a hole in it.
3. **"Connected" is a fact about the server, computed over its registrations.**
   If any registration is authorized, the server is connected, so call that
   entry. When more than one is authorized, prefer the user's own entry: it
   already has their consent, and it outlives the extension. An unauthorized
   duplicate is not evidence of absence
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
4. **Two registrations never raise a source-of-record question.** That
   question is for two products in one category. Registrations of one product
   are read once, from one entry.
5. **People see the product name.** A user-facing message says the server's
   product name, never the scoped registration name. Anything stored for later
   runs stores the canonical identity, so a later step never inherits a
   registration string.

## The boundary

Rename over time is [tool-identity-vs-tool-name](./tool-identity-vs-tool-name.md)'s
case. Distinct servers sharing a name are client-integration's. The test that
separates this case from both: **is the same server process, or the same
remote endpoint, behind both names right now?** If it is, this technique
applies.

## Decision rules

- Key consent, cost, counts and history on a canonical server identity from
  the registration record, never on a name segment.
- Every name-pattern rule is written and tested for each registration form the
  host produces.
- A server is connected if any of its registrations is authorized; call that
  entry, and prefer the user's own when there are several.
- Never ask for a source of record between two registrations of one server,
  and never sum across them.
