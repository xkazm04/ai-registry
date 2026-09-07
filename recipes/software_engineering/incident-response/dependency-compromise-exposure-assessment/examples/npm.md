# npm as the `package_registry` connector

What was learned mapping this recipe onto one specific registry. Nothing here is part of the
recipe: bind a different registry and this file stops applying while the recipe does not
change. The ladder, the ordering and the revocation list are the recipe's; what each rung
looks like here, and what the registry's own proofs are worth, is this file's.

## What the mapping has to decide

**The lock file records a resolution, not an installation.** It carries the full resolved
graph, including transitive packages that appear in no top level declaration, and it pins each
one to a version and an integrity digest. That makes it far better evidence than the manifest,
and it is still a record of what a resolver decided at some past moment. Nothing writes to it
when packages are installed, so a checkout can carry a lock file describing a graph that was
never materialised on that machine, and a machine can carry an installed graph the committed
lock file no longer describes. Read it as the strongest available statement of intent and
still one rung below the tree on disk.

**The integrity digest proves the artifact, not its innocence.** It is a hash of the published
archive, checked at install time. A match confirms that the bytes the registry served are the
bytes that were recorded when the lock was written, which makes it useful for the opposite
question: a version whose digest does not match the one the advisory names is a different
artifact. It says nothing about whether the archive was benign, and a compromised release
published normally has a perfectly valid digest of its own.

**The installed tree holds things the declarations cannot.** It is flattened, so where a
package sits under it does not say who required it, and a package present there may have
arrived through a chain nobody in the project has read. Each installed package carries its own
manifest recording the version actually unpacked, which is the rung above the lock file. That
manifest is also where install time lifecycle scripts are declared, and those are the
mechanism by which a dependency executes on a machine without a single line of project code
importing it. That is why presence in the tree is a different claim from presence in a lock
file, and why an absent tree is not a clean result.

**The local cache is content addressed and outlives the tree.** Archives are kept keyed by
their integrity digest, so deleting the installed tree leaves the copy in place and a
reinstall can restore exactly the artifact that was removed. It is also a place to look when
the tree has already been rebuilt: a cached archive can answer what was installed after the
evidence in the tree is gone. Both facts are the same fact from two sides, and the assessment
should say which side of it the boundary covers.

**Provenance attests the publish path and stops there.** Where a package carries it, the
attestation links the published archive to a build on a hosted workflow and a source commit,
recorded in a public transparency log. That is a real and verifiable claim about how the
archive came to exist. It is not a claim that the commit was authored by the maintainer, that
the account was under its owner's control, or that the source repository was uncompromised, so
a release published through a compromised pipeline carries a valid attestation. Most packages
carry none at all, which makes an absent attestation evidence of nothing.

**Withdrawal removes the listing and none of the copies.** Removing a version stops it being
resolved for anyone who has not already fetched it. It does not touch installed trees, the
local cache, image layers built while it was available, pipeline caches, or a private mirror
or proxy that keeps its own copies and may keep serving it indefinitely. There is a second,
sharper consequence for this recipe: once a version is withdrawn it also leaves the registry's
metadata, so a check run against the registry afterwards can report that version as unknown
rather than as affected, and unknown reads like clean to anyone skimming.

**A binary lock format is unsupported, not clean.** Sibling clients in this ecosystem write
lock files this recipe's reading cannot open. An assessment that cannot parse one has not
looked at it, and belongs in the list of what could not be examined rather than in the count
of what was found clean.

## What transfers to any package registry connector

- Ask what the ecosystem's lock format actually records, and treat it as intent until a tree
  or a cache confirms it.
- Look for install time execution hooks, because they are how a dependency runs without being
  imported.
- Find where copies survive removal from the registry, and search there before believing a
  withdrawal.
- Read any attestation as a claim about the publication path only, and read its absence as no
  claim at all.
