---
layer: application
type: application
subject: module-design
technique: seams-and-adapters
stack: go
status: forged
verified_on: 2026-08-29
verified_against: go@1
---

# Go — the standard library's filesystem seam and its executable contract

The Go standard library's `io/fs` package is a two-decade-scale realization
of [seams-and-adapters](../techniques/seams-and-adapters.md): one seam
(`fs.FS`), many adapters (the real filesystem, an in-memory map, an archive
reader, files embedded at build time), and — the part most codebases never
build — **the contract suite shipped as a public API**. Citations are
against the main development branch at commit `603439a1c6f2d3`, read for
this document on the `verified_on` date.

## The seam is one method, and the contract is mostly prose

`io/fs/fs.go:40-52` defines the seam as a single method, `Open(name string)
(File, error)`, with the doc comment carrying the informal half of the
interface: what error type must come back, with which fields set, and that
invalid paths must be rejected (`fs.go:41-51`). The interface is in the
caller's vocabulary — slash-separated paths on every platform, including the
one whose native separator is a backslash (`fs.go:54-62`) — which is the
technique's transcription-vs-abstraction rule decided in favour of the
caller at the cost of every adapter doing translation.

Optional capabilities are extension interfaces — `ReadDirFS`
(`readdir.go:15`), `ReadFileFS` (`readfile.go:11`), `StatFS`
(`stat.go:8`), `ReadLinkFS` (`readlink.go:9`) — and the probing for them is
centralized, not scattered: a caller uses the package-level `fs.ReadDir`
(`readdir.go:29-49`), which type-asserts the fast path and otherwise
synthesizes the behaviour from `Open` alone, sorting the result itself
(`readdir.go:45-48`) so the guarantee ("sorted by filename") holds on both
paths. That is the single-door rule applied to capability probing: exactly
one place knows how to degrade, so an adapter that lacks the extension is
still a complete adapter of the seam, not a narrowed one. The interface was
also drawn deliberately read-only — the writable-filesystem capability was
left out rather than included and refused, which is the
"adapter that refuses a verb" failure avoided at design time.

## Four adapters, one suite, the double included

`testing/fstest/testfs.go:39` exports `TestFS`, an executable conformance
suite for any `fs.FS`. It is referenced from the seam's own doc
(`io/fs/fs.go:20-23`: "may be used to test implementations of an FS for
correctness") and it checks the promises the interface makes in prose:
`ReadDir` results sorted (`testfs.go:253`, `:268`), reads at EOF returning
zero entries with the right error (`:178-186`), `DirEntry.Info` /
`file.Stat` / `fs.Stat` agreeing with each other (`:406-448`), glob output
matching a re-walk (`:360-385`), invalid paths rejected (`checkBadPath`,
`:610`). These are exactly the guarantees no compiler sees.

The suite runs against every kind of adapter:

- **The test double.** `fstest.MapFS` (`mapfs.go:33`) is the in-memory
  double, and its own test runs it through the suite
  (`mapfs_test.go:16-24`) — the double earns its trust by passing the same
  contract as the real thing, which is the technique's anti-drift mechanism
  made literal.
- **The real filesystem.** `os.DirFS` (`os/file.go:743`) is the production
  adapter, and `os_test.go:3387` runs it through `TestFS` against a real
  directory.
- **Adapters nobody thinks of as filesystems.** A zip archive
  (`archive/zip/reader_test.go:1224`) and build-time embedded files
  (`embed/internal/embedtest/embed_test.go:77`) pass the same suite —
  substitution actually cashed, repeatedly, which is what keeps the seam
  honest per the technique's "a seam nobody substitutes at" rule.

## The informal interface, written down

Two doc comments are worth citing because they are the golden path's
"interface is everything a caller must know" as it looks in the wild.
`os.DirFS`'s comment (`os/file.go:726-737`) spends eleven lines on what the
signature cannot say: symlinks can escape the tree, a relative root shifts
under `Chdir`, and the adapter "is therefore not a general substitute for a
chroot-style security mechanism" — with a pointer to the adapter that does
make that guarantee. `fstest.MapFS`'s comment (`mapfs.go:26-32`) states its
concurrency contract (operations must not race with map edits) and its
capacity characteristic (directory reads iterate the whole map, so keep it
to a few hundred entries). A one-method interface; a large denominator; all
of it documented at the adapter, where it varies.

## What this realization cannot show

The seam was designed for substitution from the start, in a standard
library with unusual review pressure; it says nothing about retrofitting a
contract suite onto an interface whose adapters have already drifted. And
the extension-interface pattern trades away static completeness — nothing
forces an adapter to implement `StatFS`, and a caller who needs the fast
path discovers its absence at runtime — a cost the centralized fallback
mitigates but does not remove.
