---
layer: technique
type: technique
subject: sidecar-provisioning
technique: split-trust-by-registration-path
status: forged
laws: [one-validation-door, verdict-survives-boundary]
shared_with: []
use_when: [deciding whether a plugin registration needs a digest, a plugin may be registered by an API caller as well as by the config file, an error from a plugin carries a backing-service credential, a privilege decision must not be visible to the plugin]
---

# Split trust by registration path

A host that executes plugins it did not build has to decide what it
trusts about each one, and the honest answer is that the trust comes from
**who registered it**, not from the binary. There are exactly two doors
through which a plugin enters a running host: the host's configuration
file, whose author already holds every privilege the host process has,
and the host's own API, whose caller holds whatever the host's policy
granted. The two authors are not the same person, and a single trust rule
applied to both is wrong for one of them. This technique owns the split,
the execution constraints that follow from it, and the two things that
must stay on the host's side of the plugin boundary: secrets in errors
and privilege decisions. The provenance of the binary before it reaches
the host — where it was built, who signed it, what the download verified
— is [supply-chain](../../../../security/supply-chain/supply-chain.md)'s
ground; [source-pinning](./source-pinning.md) owns the digest check at
download time; this technique owns the trust a loaded plugin is granted
at run time.

## The configuration author is host-level

Whoever can edit the host's configuration file can already point the
host's storage at their own directory, redirect its listeners, and change
the binary it runs. A digest requirement on a plugin declared in that
file protects nothing: the person who could plant a malicious binary is
the same person who would write its digest into the file. It costs
something real — every plugin upgrade becomes two coordinated edits, and
the operator who forgets the second gets a startup failure — while buying
no security the file's ownership did not already decide.

The rule: **when a plugin is declared in the host's configuration file,
treat the declaration as the host operator's own act — the digest is
optional, and a version and a source location suffice — because the
config author is already inside the trust boundary the digest would
guard.** Declaring it in config is the resolution ladder's override rung
([resolution-ladders](./resolution-ladders.md)): the operator's word, on
the operator's authority, outside the catalog's warranty. What the rule
does not relax is *where* the binary may live. A config-declared plugin
still runs from the host's plugin directory or from a location the
operator named explicitly, never from a path the host discovered on its
own, and a plugin that config declared is a distinct type the API cannot
alter or remove — the file is its one authority.

Two refinements keep the rule honest. Verification belongs at the moment
bytes arrive, not at every use: nobody re-hashes the host's own binary
before each start, and a plugin digest checked before every spawn holds
the plugin to a standard the host does not meet itself. So the exemption
covers the binary the operator *placed* — where the host *fetched* the
binary on the operator's behalf, from an image or an archive, the
download is a crossing and the digest is required there regardless of
which door declared it, because that is the moment the bytes first exist
on the machine. And a name belongs to one door: a config declaration
that names a plugin the API already registered is refused, not merged,
because two authors of unequal standing sharing one name is the trust
split defeated by a collision.

The naive reading demands a digest everywhere because "verification is
free". The failure mode is a verification step that fires only on the
operator's own edits, gets bypassed on the first upgrade under pressure,
and teaches every reader that the digest is ceremony.

## The API caller must carry a digest, and the binary runs from one door

A plugin registered through the API arrives from a caller whose only
credential is a policy grant. That caller may be an automation account,
a delegated administrator, a compromised token. The host cannot infer
the binary's provenance from the caller's identity, so the registration
must state what the caller expects to execute.

The rule: **when a plugin is registered through the API, require a
digest of the binary and execute the plugin only from a file at that name
inside the plugin directory — resolved as a real file, never through a
symbolic link — and refuse the registration or the load when either
condition fails.** The digest binds the registration to specific bytes,
so a later swap of the file under the same name is caught the next time
the host verifies before execution. The plugin-directory-only rule
closes the other door: an API caller who could name an arbitrary path
would turn "register a plugin" into "execute any file the host can
read", and a symbolic link inside the directory is that arbitrary path
wearing the directory's name. One directory, one resolution rule, every
API-registered plugin passing through it
([one-validation-door](../../../../_laws.md#one-validation-door)).

Two honesty clauses. The pre-execution digest check is a
time-of-check-to-time-of-use window — the bytes can change between the
hash and the spawn — and it defends against a stale or mislabeled
binary, not against an adversary who can write to the plugin directory;
that adversary can already execute code as the host, which no plugin
check reaches. Say this in the threat model rather than let the digest
imply more than it delivers. And the check is a verification of what the
host is about to run, not a substitute for the download-time
verification [source-pinning](./source-pinning.md) performs — the two run
at different moments against the same expectation.

The naive reading accepts a path from the API caller because the
directory rule "gets in the way of testing". The failure mode is a policy
grant to register plugins becoming host-level code execution, silently,
for every caller who ever held it.

## Errors cross the boundary through a sanitizer

A plugin talks to something — a database, a cloud account, a remote
service — with credentials the host handed it. When that something fails,
the plugin's own client library formats the failure, and client
libraries routinely put the connection string, the username, or the
token into the message. The error then crosses the plugin boundary into
the host, the host logs it, and the host returns it to the API caller,
who may hold far less privilege than the credential just handed to them.

The rule: **when an error leaves the plugin process, pass it through a
sanitizer on the host's side of the boundary that removes every secret
value the host handed the plugin, and preserve the error's status
classification while doing so.** The sanitizer knows the secrets because
the host issued them — the connection credentials, the tokens, the
passwords in the plugin's configuration — so it replaces each known
value wherever it appears in the message. It must not flatten the error
in the process: a not-found stays a not-found and a permission denial
stays a denial, because the caller and the host's retry logic branch on
the class ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
A sanitizer that returns "an error occurred" has protected the secret by
destroying the verdict.

The naive reading trusts the plugin author to write clean errors. The
failure mode is the one client library the plugin author did not write,
formatting a credential into a message that lands in an audit log
retained for years.

## Privilege decisions stay on the host's side

Some requests carry a decision the plugin must never observe: whether
the caller holds a root-level privilege for this path, whether the
operation is exempt from a quota, whether the request arrived through an
internal listener. A plugin that can *see* the decision can be written to
act on it, and a plugin that can *make* it has been handed the host's
authorization.

The rule: **when a request needs a privilege check the host owns, run it
in the host before the request is handed to the plugin, and hand the
plugin only the outcome it needs to do its job — never the flag, the
policy, or the caller's full identity.** The plugin declares which of its
paths *require* the elevated check, in the metadata the host reads at
mount time; the host evaluates it; the plugin receives a request it may
assume was authorized. The declaration lives on the plugin's side because
only the plugin knows its paths, and the evaluation lives on the host's
side because only the host knows the caller — the same split as the
sanitizer, in the other direction.

The naive reading passes the caller's whole identity through so that
"the plugin can decide what it needs". The failure mode is a plugin whose
bug or author grants itself the host's privilege, with the host unable to
tell, because the host stopped being the one deciding.

## When this does not apply

A host with a single plugin door — configuration only, no API
registration — has one author and needs one rule; the split is a
response to two authors of unequal standing, and inventing a second door
to have something to split is the wrong direction. The sanitizer and the
privilege split apply to every out-of-process plugin regardless of the
door, because they defend against what crosses the boundary, not who
opened it.
