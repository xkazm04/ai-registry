---
layer: technique
type: technique
subject: node-boot-and-declarative-bootstrap
technique: seal-before-storage-plugins
status: forged
laws: [absent-guard-is-loud]
shared_with: []
use_when: [a sealing or key-unwrapping provider is loaded as a separate component, deciding where a pre-unseal component's configuration lives, a plugin catalog stored behind the seal is needed to construct the seal, choosing whether an integrity digest is required for a declared component]
---

# Seal before storage plugins

A node that encrypts its durable state has a boundary — the seal — that must be constructed
before storage is readable, and everything the seal needs to construct itself sits on the
wrong side of that boundary if it is stored behind it. This technique states what must be
declared in configuration rather than discovered in storage, why that is a plaintext
declaration and not a weakening, and how the trust model splits between components declared
by the operator and components registered through the API.

## What precedes storage lives in configuration

The seal's own providers — the mechanism that fetches or holds the key that unwraps the rest,
its parameters, its credentials, and where the mechanism is a separately loaded component,
the component's location and identity — cannot be read from an encrypted store, because
reading the store is what the seal is for. A catalog of loadable components kept in storage
is therefore unreachable at the moment the seal is being built, and the naive design that
puts every plugin in one storage-backed catalog discovers this the first time a seal
provider is made a plugin: the node cannot unseal because it cannot find the unsealer. The
rule: **anything needed before storage is readable is declared in the configuration file and
stored in plaintext on the host; the storage-backed catalog is for components that are
loaded after unseal, and only those.** The same line places the storage backend's own
driver and the cluster-join parameters on the configuration side, for the same reason.

The declaration is in plaintext because there is nothing to encrypt it with. This is not a
weakening: the operator who writes the configuration file already holds the host, and the
seal's credentials, when the mechanism needs any, are either read from the host environment
at start or are themselves the thing the node cannot protect. The dishonest alternative is
a second, smaller seal protecting the first seal's configuration, which relocates the same
question one level down and adds a component that must itself be declared in plaintext.

A pre-unseal component has one more constraint the post-unseal ones do not: it must be
obtainable without the node's own state. If it is fetched from a remote registry, the fetch
happens before unseal, with credentials from the host, into a cache on the host — and the
cache's integrity is the host's integrity, which is the next section.

## The trust model splits at the registration path

Two principals can register a loadable component. The operator, by writing it into the
configuration file, and a network principal, by calling the API that adds an entry to the
storage-backed catalog. They hold different privileges, and the integrity requirement follows
the privilege.

**A component declared in configuration shares a trust model with the host operator.** That
principal can already replace the node's binary, so a digest on a declared component defends
against nothing the principal could not already do; it defends against a *transport* error —
a corrupted download, a registry that served the wrong artefact — and that is a real defence
worth having, but it is optional, and an operator who omits it has made a choice inside their
existing trust. **A component registered through the API requires a digest**, because the
principal registering it holds an API credential and not the host, and the digest is the only
thing standing between "I can call this endpoint" and "I can execute code on the host". The
decision rule: **when a registration path is reachable by a principal who does not hold the
host, the integrity check is mandatory on that path; when it is reachable only by a principal
who does, the check is optional and its absence is a declared choice, not a default.** Per
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) the optional case is
admissible only because the absence is deliberate and visible — a declared component with no
digest is logged as such at load, so that an operator who thought they had integrity checking
finds out at start rather than never.

The naive reading applies one rule to both paths. Requiring a digest everywhere makes the
configuration path unusable for a component whose digest is not known until it is downloaded
— an operator pinning a component by registry reference cannot start the node. Requiring it
nowhere makes the API path a remote code execution primitive gated by whatever policy
protects the catalog endpoint. The split is the only rule that matches the privileges.

## The check is at load, and it is still a race

An integrity digest is verified when the component's artefact is read, immediately before it
is executed. Between the verification and the execution the file on disk can change, and a
principal who can change it holds the host and is outside the model anyway. The point is
worth stating in the documentation for the same reason the plaintext point is: an operator
reading "sha256 verified" will otherwise infer a guarantee against host-level tampering that
the mechanism does not and cannot provide. A cache directory of fetched components has the
same property — its contents are as trustworthy as the host's filesystem, and a digest
recorded at fetch time is a defence against the fetch, not against the disk.

## Declared components and reload

A component declared in configuration is a configuration-born object, and the sibling
technique's rules apply: the API cannot remove it, reconciliation at reload creates and
removes to match the file. The pre-unseal subset adds a restriction: the seal's own
providers are restart-only, because the running seal holds the decrypted keyring that was
unwrapped through them, and swapping the provider under it is a migration. A post-unseal
declared component may be reloadable — a version bump that restarts the component's
process without touching the seal — and the partition technique decides which.

## When not to use this

A node whose storage is plaintext, or whose seal is a fixed built-in mechanism with no
loadable parts, has no pre-unseal catalog problem and one registration path. The technique
earns its place when the seal is pluggable — when the mechanism that unwraps the root key
is chosen per deployment and may be supplied as a separate component — because that is the
point at which a storage-backed catalog stops being reachable in time.
