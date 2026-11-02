---
layer: technique
type: technique
subject: on-stream-overlay-delivery
technique: consented-data-only-packages
status: forged
laws: [edit-do-not-regenerate]
shared_with: []
use_when: [importing a design package an overlay will render, a package that wants to run its own script on stream, updating a package that is already live]
---

# Consented, data-only packages

A design package is what gives an overlay its look: art, colours, layout, copy, sometimes
an animation. Packages are data by default. The overlay's own renderer reads the package
and draws it; the package executes nothing. A package that wants to run its own script on
stream gets that only by an explicit grant from the streamer, bound to the exact bytes
they granted, and an update that asks for more than was granted waits for a new grant.

## Why a package is a supply-chain problem

Packages are shared. A streamer downloads one from an artist, a marketplace, a friend's
export, or a generator. The overlay origin is read-only and confined, but it is still a
page inside the broadcasting software, and it is still the thing drawn on air. A package
that carries script carries code that runs there: it can draw anything on the broadcast,
read whatever the overlay is fed, and try every door the origin's policy leaves open. A
package that only carries data can, at worst, look bad.

So the default is the one that can only look bad. Script is a privilege, it is visible
as a privilege at import, and it is a decision a person makes — never a field the package
sets for itself. Declaring a script entry point in a package's manifest grants nothing.

## Procedure

1. **Import into memory, verify, then accept.** Read the package's files from a confined
   root (resolving links and junctions so nothing escapes it), into bounded memory; compute
   its content digest and check it against the declared one. Only an accepted package
   publishes to the overlay. The served bytes are the verified in-memory bytes; the
   overlay's routes never reopen files on disk, so a later edit to the folder cannot
   change what is on air.
2. **Allowlist asset kinds.** Serve raster images of fixed, sniffed types. Formats that
   can carry script or markup (vector images with embedded script, HTML) are not assets.
   Every asset is local: a remote reference is rejected at the schema boundary and would
   also be blocked by the origin's policy, and the rejection must happen at the schema,
   before anyone relies on the policy.
3. **Grant script explicitly, per entry point.** A scripted package shows the streamer what
   it asks for. The grant names entry points and is held by the tool's trusted side, never
   by the package or the page. Granted script runs only as local external files on the
   overlay origin — no evaluation, no inline handlers — and receives no control capability:
   consented code is still not trusted code.
4. **Re-ask on widening.** An update whose bytes match the grant's entry points may go
   live after its digest checks. An update that adds an entry point or a privilege stays
   inactive, with the previous accepted package still live, until the streamer grants
   again. A grant is a review of particular bytes, and bytes it never saw have not been
   reviewed, however small the change looks.
5. **Revoke with a fresh document.** Removing a script from a package does not undo code
   that already ran in the page. Revocation reloads the overlay so a clean document starts,
   and a scripted overlay that loses its feed reloads rather than resuming in a document
   whose script state is unknown.
6. **Keep the grant short-lived where in doubt.** A grant held only in memory means a
   restart re-imports, re-verifies and re-asks. That is friction, and it is the honest
   cost of not persisting a privilege no one is looking at.

## Decision rules

- **When a package fails verification**, nothing from it publishes, not even the parts
  that verified. A named but unverified design shows nothing; the overlay does not fall
  back to a half-applied look.
- **When the streamer edits a live package**, the edit arrives as a new accepted snapshot
  over the existing feed, not as a reload of the browser source; only the changed package
  is replaced, and every overlay not using it is untouched.
- **When a preview of a package is being tuned**, it renders on the tool's own surface.
  A preview never enters the live overlay channel, so a half-tuned design cannot reach air.
- **When a package carries sample text or names**, treat them as authored copy and check
  them like any on-stream text; a package exported from one stream must not carry another
  stream's viewers along as sample content.

## When not to use it

An overlay whose look is fixed in the tool's own bundle has no package boundary and
needs no grant. Do not invent a package format to apply this to; apply it the moment a
look can come from outside the tool's release.
