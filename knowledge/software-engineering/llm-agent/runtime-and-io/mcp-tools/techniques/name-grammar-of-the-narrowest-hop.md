---
layer: technique
type: technique
subject: mcp-tools
technique: name-grammar-of-the-narrowest-hop
status: forged
laws: [gate-sees-target, limits-are-derived, one-validation-door]
shared_with: []
use_when: [choosing a separator or namespace scheme for tool names, a host shows none of a server's tools while other servers list fine, a server relays tool names it did not author from a page or an upstream server, an aggregator or proxy re-lists another server's tools, renaming tools to satisfy a client and deciding whether it is a breaking change, deciding what a tool-name check in the gate should test against]
---

# Name grammar of the narrowest hop

[tool-schema-design](./tool-schema-design.md) decides what a tool's name
should *say*. This technique decides which characters it may be *spelled*
with, and the answer is not the protocol's.

The protocol's own rule is permissive and advisory: names of one to 128
characters drawn from ASCII letters, digits, underscore, hyphen **and dot**,
with a dotted, three-segment name given as a valid example. A server author
who namespaces with dots is following the specification's own illustration.
But a tool name does not stop at the host. The host translates the catalog
into the function-calling request of whichever model it drives, and the
function-calling grammars in wide use are narrower: letters, digits,
underscore and hyphen, at most 64 characters. A host that validates against
that grammar before it forwards anything rejects a dotted name, and a host
that does not validate forwards it into a request the model provider rejects.

So the grammar that binds is the **intersection of every hop between the
server and the model**, and in practice that is the narrowest function-calling
grammar among the hosts the server expects to be connected to — not the
protocol, and not the host the author tested with. Spelling names inside the
protocol's grammar is a check against a proxy
([gate-sees-target](../../../../_laws.md#gate-sees-target)): it passes in
exactly the case where the downstream consumer diverges from the document.

## The blast radius is the catalog, not the tool

The expensive property is what a violation breaks. A host that validates
names typically validates the **whole listing** and refuses it, rather than
dropping the one bad entry. One dotted name among forty tools does not cost
one tool; it costs the server's entire surface on that host, with an error, if
any, that names the listing rather than the entry. From the user's side the
server is simply "not working" on one client and fine on another.

That changes the economics of the rule. A naming preference whose worst case
is one unselectable tool can be left to review. A naming rule whose worst case
is the whole server disappearing from a major host belongs in the gate.

## The rule

- **Spell every name in the narrowest grammar in your audience** —
  `[A-Za-z0-9_-]{1,64}` is the safe floor today — and namespace with an
  underscore or hyphen rather than a dot. The length cap is a derived limit
  ([limits-are-derived](../../../../_laws.md#limits-are-derived)): it is
  whatever the narrowest hop allows minus whatever prefix a host may add when
  it federates servers, not a number chosen by feel. A host that prefixes
  names with a server segment spends some of the budget before the model ever
  sees your name.
- **Validate at the one place names enter the catalog**
  ([one-validation-door](../../../../_laws.md#one-validation-door)): the
  registration call, or a test that enumerates the listed catalog and asserts
  every entry against the grammar. A check written beside each tool
  definition misses the tool added next quarter; a check over the listing
  sees every tool that will actually be sent.
- **A relay is where violations enter.** A server that lists names it did not
  author — an aggregator mounting other servers, a proxy, a bridge that
  exposes tools a web page or a plug-in declared for itself — cannot assume
  those names fit, because their authors followed the protocol and the
  protocol allows what the hop forbids. Two shapes are safe:
  - **Alias at the relay.** Map each foreign name to a conforming alias,
    keep the reverse table, and dispatch by alias. The alias must be stable
    across listings, or the rename problem below arrives once per page load.
  - **Dispatch by argument.** Expose one fixed, conforming tool that takes the
    foreign name as an *argument* (`call_page_tool(name, arguments)`). A
    string argument has no grammar beyond the schema's, so foreign names
    never reach the listing at all. The cost is that the model selects the
    foreign tool through a description it reads in a result rather than in
    the catalog, which weakens selection; the gain is that nothing a third
    party declares can take the relay's own surface down.
  Listing foreign names verbatim is the one shape that is never safe.

## When the rule forces a rename

A server that shipped dotted names and moves to underscores is renaming every
tool at once, and [tool-identity-vs-tool-name](./tool-identity-vs-tool-name.md)
governs what that costs: consent grants, saved configurations and recorded
sessions keyed on the old addresses stop matching. Two consequences follow
from the cause being a grammar rather than a preference:

- **The rename is breaking and should be announced as one**, because callers
  that address tools by name — agent configurations, scripts, prompts that
  say "call x.y" — fail on the new spelling regardless of which host they use.
- **Accepting the old spelling as an alias on the call path is cheap and
  safe**, because the call path is not where the grammar binds; only the
  listing is. It does not help a host-driven model, which only ever calls
  names it was listed, and it does not rescue a host-side permission rule
  written against the old name. It does help every caller that addresses the
  server directly — a script, a shim, another agent's saved configuration —
  and for those it turns a flag day into a deprecation.

## When not to use this

- **The server is only ever consumed by one host whose grammar you control.**
  An in-process tool table that never reaches a third-party host or a model
  provider can use any spelling its own dispatcher accepts. The moment it is
  exposed over the protocol, it is not that server any more.
- **The name is a label, not an address.** Display titles, descriptions and
  annotation strings carry no grammar beyond their schema; this rule is about
  the identifier the model emits to call the tool.

### Measured: one dotted namespace, one release

One open-source desktop product exposed four tools under a dotted namespace
— the spelling the protocol's own example uses — and documented that choice
as making the names "look natural in agent logs". A widely used host
validated names against the narrow grammar and rejected the product's whole
tool list. The fix was a breaking rename of all four tools in one release, a
changelog entry telling every user to update their configurations, and a
module docstring that now quotes the narrow grammar as the reason. None of it
would have been needed if the catalog had been asserted against the narrowest
hop when the first name was registered.
