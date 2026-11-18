---
layer: technique
type: technique
subject: ship-pipeline-gating
technique: build-secrets-in-an-unstaged-layer
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a release build needs a signing password, a store credential or a server token, choosing which configuration file holds a build-only secret, the packager stages project configuration into the distributable, adding a secret check to a packaging pipeline]
---

# Build secrets in an unstaged layer

## The concern

A packaging pipeline reads its configuration from layered files: engine defaults, project
defaults, platform overrides, a user layer. The packager also **stages** configuration into
the distributable, because the runtime reads it too. Any layer that is both read at build
time and staged ships whatever it holds. A release-signing password, a store-upload
credential or a build server token placed "where the build tool reads it" lands, by default,
in a layer the packager also copies into the artifact.

The mistake is easy because the obvious home for a per-person secret is a file named for the
user that version control already ignores. Ignored is a statement about the repository, not
about the package: a user layer inside the project's configuration directory is still a
project configuration file, and the staging rule that copies the directory copies it.

## Why the packager's deny list does not settle it

Packagers ship a deny list for exactly this case: key names stripped from staged
configuration copies (signing passwords, encryption keys, store team identifiers) and whole
sections dropped (a development file server's settings). It is worth knowing it exists, and
it is the second line, not the first:

- **It matches names, exactly.** It protects the keys it lists, spelled as listed. A
  credential a plugin introduced last month, a token under a project-chosen key, or the same
  password under a second key name ships.
- **It filters one form.** A text filter over staged configuration files does not reach a
  form the packager produces differently, such as a collapsed or binary configuration that
  bakes the merged hierarchy; whether that form is filtered is a separate fact to read, not
  to assume.
- **It cannot be seen working.** A stripped key and a shipped key look the same from the
  build log. Only the staged copy says which happened
  ([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).

So a secret's safety comes from **where it lives**, and the deny list catches the cases that
slip past that rule.

## Procedure

1. **List the configuration layers the build reads, and for each one, whether it is
   staged.** Read the staging rule, then read the staged file list of a real package; the
   list is the fact and the rule is the intention.
2. **Put every build-only secret in a layer the build reads and the packager never
   stages**: a per-user or per-machine configuration outside the project tree, the
   environment, or a secret store the build step queries. Key files (a signing keystore)
   sit in an ignored directory outside every staged root.
3. **Gate the package on its staged file list, at file granularity.** Fail when any file
   from a secret-bearing layer (the user layer by name, a keystore by extension) appears in
   the staged list, whether or not its known keys were stripped. A file-level rule needs no
   list of secret names, which is the point.
4. **Scan the staged copies, not the sources, for the secret itself.** The build knows its
   own signing password: search the staged configuration for that literal as a canary, then
   for secret shapes. Scanning the source layers instead raises findings on sections the
   packager drops, and teaches the team to ignore the scan.
5. **On a hit, fail and delete the artifact.** A package that held a credential is not
   repaired by stripping it afterwards; if it left the machine, the credential is rotated.

## Decision rules

- **When a secret must be readable by the build tool, choose its layer by the staging rule,
  not by the file's name or its ignore status.**
- **When the packager offers a deny list, keep it and add your project's key names to it,
  and still gate on the staged list.** A name list is a fallback for a misplaced secret,
  never the reason a secret may sit in a staged layer.
- **When the gate cannot read a staged list** (no package exists yet on this machine), it
  reports unmeasured, not pass
  ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
- **When a scan of source layers and a scan of the staged copy disagree, the staged copy
  wins.** It is what ships.

## When not to use it

A project that signs only with a throwaway debug key and holds no build-only credential has
nothing to place. Put the staged-list gate in anyway before the first change that adds
release signing, because that change is when the secret arrives and the layer gets chosen.

## Relation to the neighbours

[ship-only-what-the-runtime-reads](./ship-only-what-the-runtime-reads.md) audits the staged
contents for bytes the runtime never reads; this technique audits them for bytes the runtime
must never hold. Both read the archive rather than the build configuration, and both can share
one listing step. [preflight-before-an-expensive-cook](./preflight-before-an-expensive-cook.md)
can check step 2 at rest (no secret-bearing key in any staged layer), but steps 3 and 4 observe
the staged copy, so their placement is bounded by when it exists.

## Evidence status

From one project's first release-signed package for a standalone headset store: the signing
password had been added to a user configuration file inside the project's configuration
directory, the staged-list gate failed the package because the file appeared in the staged
list, the artifact was deleted, and the password moved to the per-user layer outside the
project. Whether the value itself survived the packager's key filter was not measured: the
engine's deny list names that key, so it was probably stripped, and the rule above does not
depend on the answer. A second project keeps a development file server's token in a staged
project layer, under a section the same deny list drops: safe by one name list, which is the
condition step 3 exists for. The location rule converges with an independently built test lane
that forbids any copy of the owner's configuration under its publication directory, because a
scan cannot search for a secret it does not know.
