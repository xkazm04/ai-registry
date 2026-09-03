---
layer: technique
type: technique
subject: browser-credential-boundary
technique: outbound-fetch-destination-validation
status: forged
laws: [gate-sees-target, one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [a destination address arrives inside a dependency's response, a generated answer names the next thing to fetch, deciding whether a validated address survives to the connection, a redirect would move a fetch to a new host]
---

# The destination is untrusted input

Under regime two the browser is denied the upstream and the server reaches it
instead. That trade moves the request onto a machine with a **larger map**: the
server can reach loopback, the private network its deployment sits in, sibling
services that never authenticate because only siblings could call them, and the
link-local address a hosting fabric answers identity questions on. The browser
can reach none of that. So the server's network position is itself a
credential — an unnamed one, attached to every outbound request by virtue of
where the process runs — and it is spent the moment something else chooses the
address.

The sibling technique treats the destination as configuration:
[broker-proxy-attaches-secret](./broker-proxy-attaches-secret.md) validates the
base address on the way in, because a deployment value is an input. This one
covers the harder case, where the address is not configuration at all:

> A URL that arrives **inside a dependency's response**, or inside a generated
> answer, is attacker-controlled input to your server. It is data, not an
> address.

The shapes are ordinary and that is why they pass review. A syndicated feed
whose entries carry their own media links. A directory response naming where
the real document lives. A callback target a tenant registered months ago. A
model asked to research something, returning the page it wants read next —
where whoever wrote the page the model read previously chose the address. In
every one of them the fetch looks like following a link, and the privilege
being followed with is yours.

## Judge the resolved address, not the string

A string check answers a question nobody asked. What matters is where the
connection lands, so the order is: parse, then resolve, then judge every
address the resolution returned.

**Scheme is an allowlist of one or two.** Enumerate the retrieval schemes the
feature actually needs and refuse everything else. The excluded set is not
exotic: schemes that read the local filesystem, that address a service on a
different protocol entirely, that carry a payload inline, that name a
neighbouring process directly. A denylist here fails the way denylists fail —
the scheme registry grows without consulting you.

**An address literal is a refusal, not a special case.** A caller with a
legitimate destination has a hostname. A caller that sends a bare numeric
address has either an unusual need worth an enumerated exception or a purpose
you would not approve, and telling those apart per request is work the
allowlist does for free. Refuse the literal, refuse embedded credentials in the
authority component, and refuse a non-default port unless the feature has a
reason for one.

**Then judge what the name resolved to — all of it.** Loopback, the private
ranges, link-local, unique-local, unspecified and reserved blocks, broadcast,
and the forms in which one address family embeds another. A resolution that
returns several records is several destinations; judging the first and
connecting to any is a check with a hole in the middle. And the judgement is
positional, not textual: alternate numeric encodings, shortened forms, and a
perfectly ordinary hostname whose owner points it inward all defeat a check
that reads characters. The name is chosen by the attacker; the address is
chosen by arithmetic.

## The check must bind to the connection

Validating an address and then handing the *hostname* to a fetch is two
resolutions with a gap between them, and the party who controls the name
controls whether the two answers agree
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A name that answers
with a public address while being checked and an internal one while being
connected costs the attacker nothing but a short record lifetime and a server
they already run. The check then passes on an address the request never uses —
exactly the case the check existed for.

So the validated address has to survive to the socket. Either **pin** it — the
connection is made to the address that was judged, with the hostname carried
only for name-based routing and certificate matching — or move the judgement
to where the connection is opened, so there is no second resolution to
disagree with the first. Any arrangement where the validator and the client
resolve independently is an unclosed window, however small it looks.

Network-level containment is the honest complement, not a substitute: a
deployment that refuses inward-bound egress from the application's own network
position removes the reward even when the check is bypassed. Run both. The
check without containment is one bug from open; containment without the check
is undiagnosable when it trips.

## Every hop is a new destination

A redirect is the destination changing its mind after you approved it, and an
automatically-followed redirect launders an approved first hop into an
unapproved second one. This is the cheapest bypass of every check above,
because the first address is genuinely fine.

Take redirects **manually**. On each response that carries one, run the whole
judgement again — scheme, literal, resolution, pinning — on the new address
before deciding to follow it, and cap the number of hops so a redirect cycle
cannot become a denial of service on your own worker pool. Nothing survives a
hop implicitly: not the earlier verdict, and certainly not a credential
attached for the original destination. A destination that arrived as data
should carry **no** credential of yours in the first place; if a feature seems
to need one, it is two features, and the credentialed one has a fixed upstream.

## One door, and the unguarded call is not reachable

A validator that call sites must remember to invoke protects the call sites
that existed when it was written
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The fetch
added next quarter, by someone following the pattern in the file they happened
to open, is the one that runs unchecked — and nothing about it looks wrong.

So the guard is structural: **one outbound door** that every fetch of a
data-supplied address passes through
([one-validation-door](../../../../_laws.md#one-validation-door)), with the raw
client not reachable from feature code. Make the safe call the ordinary
call and the bare one an import that fails or a rule that fires, so bypassing
it is a deliberate act somebody has to write down. One door also gives the
verdict somewhere to be recorded: which destinations were refused, and for
which reason, is a signal that a dependency has started serving addresses it
did not use to.

## What comes back is a channel too

A refused destination is not the whole risk; a permitted one that answers with
something enormous, or never answers at all, spends the same worker. Bound the
response size and the total time at the door, both.

And treat the body as a disclosure decision. A fetch of an internal address
whose content is echoed to the caller has turned a request-forging bug into a
read primitive against the internal surface; a fetch whose *outcome* alone is
echoed — succeeded, timed out, refused — is still a port scanner with a slow
interface. So the same closed vocabulary applies here as everywhere on this
boundary ([opaque-upstream-errors](./opaque-upstream-errors.md)): the caller
learns what it may do next, not what your network answered.

## When this does not apply

**When the destination is fixed by the deployment.** A base address from
configuration, with caller-supplied path segments underneath, is the sibling
technique's problem: validate the base once, enumerate the path surface, and
none of the resolution machinery here is needed.

**When the fetch happens in the browser.** A client-side request runs from the
user's own network position, and the addresses it can reach are theirs — a
different membrane with different owners. The rule returns the instant that
same address is handed to your server to fetch on the user's behalf.

**When the feature's whole purpose is reaching internal hosts.** An operator
tool that probes your own services is a legitimate exception, and it is
exceptional in the way that matters: its callers are authenticated as
operators, its destination set is enumerated, and it is a separate door from
the one that serves addresses arriving as data. What it must not be is the
same door with a flag.
