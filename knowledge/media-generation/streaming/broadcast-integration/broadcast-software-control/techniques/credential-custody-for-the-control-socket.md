---
layer: technique
type: technique
subject: broadcast-software-control
technique: credential-custody-for-the-control-socket
status: forged
laws: []
shared_with: []
use_when: [storing the password for the broadcasting software's remote-control interface, choosing which addresses a tool may connect its control client to, deciding whether a tool may set a browser source's address]
---

# Credential custody for the control socket

The password to the broadcasting software's control socket opens the streamer's live
channel: whoever holds it can switch scenes, start and stop the broadcast, change any source
and point a browser source at any address. A tool that holds it keeps it in the operating
system's secret store, connects only to the streamer's own machine or private network, and
never writes an address it did not originate into anything the audience will see.

## Storage

- **The secret store, under a fixed identity.** The password is kept in the operating
  system's credential store under a fixed service name and a fixed label, so the tool can
  find, replace and delete exactly its own entry and nothing else. Not in a settings file,
  not in an environment file next to the tool, not in browser storage.
- **Stored only once proven.** A password the streamer types is held in memory - in a buffer
  the tool wipes when it is dropped - until the handshake has authenticated and a first
  request has succeeded; only then, and only if the streamer asked to be remembered, is it
  written to the store. A failed attempt leaves the previous working connection and the
  previous stored entry untouched.
- **Never in output.** Not in logs, error messages, crash reports, diagnostic bundles,
  support exports or screenshots of a settings page. Errors name the endpoint and the
  failure, never the credential; a settings page shows "set" or "not set". The same holds
  for text the peer authors: a rejected request may carry a free-form comment, and a tool
  that logs or displays it verbatim has given whoever answers on that socket a way to write
  into the tool's logs and screens. Map every rejection to the tool's own fixed message.
- **Never sent in the clear.** The control protocol's own authentication is a
  challenge-response: the server sends a salt and a challenge, the client proves knowledge of
  the password by hashing, and the password itself does not cross the wire. A tool uses that
  mechanism, and treats a server that does not request authentication as a configuration to
  warn the streamer about, not a convenience.
- **Removed on request.** Disconnecting the integration in the tool deletes the stored entry.
  "Forgotten" means absent from the store, verified, not merely unused.

## Endpoints

The control socket is meant to be reached from the same machine or from a second machine on
the streamer's own network - a stream deck, a second PC in a two-PC setup. A tool accepts
loopback and private-network addresses, and refuses public addresses outright. The reason is
not only exposure of the socket itself: a tool that accepts any address can be pointed, by a
mistaken paste or a malicious configuration file, at a server that is not the streamer's
software at all, and will hand it a fresh authentication response and then follow its
instructions about what exists.

The check is on the address as written and is strict about shape. A literal address must be
loopback, private-range or link-local; an unspecified address (all zeros) is refused, since
it means "any interface" rather than naming a machine. Numeric shorthands that resolvers
quietly expand - a two-part dotted address, a bare decimal integer, a hexadecimal form - are
refused outright, because they are how "a local address" turns out to be one nobody typed. A
host name may carry no scheme, port, path, user part, query or fragment. A plain host name on
the streamer's network cannot be classified from its spelling; resolve it and apply the same
private-range rule to the result before connecting, or the rule has a name-shaped hole.

Plain, unencrypted transport is the norm on a loopback or home network; on that basis too,
the endpoint stays local.

## Addresses onto the stream

A browser source renders whatever its address serves, live, to the whole audience. The tool
sets a browser source's address only to pages it serves itself, at an origin it minted, and
only to a page that currently has something legitimate to show - a page for a draw that was
never sealed or a visual that was never accepted is refused even at the tool's own origin;
it refuses any address that arrives from configuration, chat, a remote payload or the
software's own inventory if that address is not one the tool issued. Updating an existing
source whose address was changed to something foreign is a refusal and a finding, not a
"repair".

## Decision rules

- **When the streamer has turned authentication off**, connect, but show the risk once and
  plainly; do not store a placeholder credential to make the warning go away.
- **When a credential fails authentication**, do not retry with the same credential in a loop;
  a failed authentication is a closed state until the streamer re-enters it.
- **When diagnostics are exported**, scrub by construction: the export reads from a
  credential-free view of the settings rather than redacting a full one.
- **When the tool runs on a second machine**, the private-network rule still holds; a
  forwarded port to the public internet is outside it.

## When not to use it

A tool driving a throwaway instance it launched itself, with a password it generated for
that run, owns that password and may keep it in memory for the run; it still never logs it.
