---
subject: native-document-format
domain: software-engineering
last_touched: 2026-10-05
dry_streak: 0
---

# native-document-format

Born 2026-09-04 from the `/intake` run over the kdenlive source tree (source note
`librarian/sources/2026-09-04-kdenlive.md`), forged in-session with six techniques under
`integration/acquisition-and-ingest`. Until 2026-10-05 it carried no application: the
attention scan ranked it "never reconciled against real code".

## 2026-10-05 - first application (apply-fgad-1005b)

`/intake apply format-generations-are-declared`, dispatched from the attention scan. It
picked up an abandoned earlier run of the same dispatch (`apply-fgad-1005`, about
17:30-18:00). That run left a personas worktree with an uncommitted diff and an untracked
application, and no board claim, commit or ledger row. Its diff and both arms were re-run
before anything landed, and the results matched its logs.

- **personas, code, better, ab-paired.** One app, two native export formats. The
  single-agent importer gates on its version over the untyped value before the typed
  parse. The portability bundle checked `format_version` only after deserializing the
  whole typed bundle. A generation bump is a shape change by the format's own contract,
  so that gate could fire only for newer bundles that did not change shape. Target:
  newer bundles refused by version, A 0/4, B 4/4. Floor: the module suite, 55/55.
  Committed to personas, not pushed.
- **Structural fact.** The rule was written correctly once and in the wrong order once,
  in the same tree by the same team. No existing test could tell the two orders apart,
  because every fixture was of a generation the reader accepts. The technique's
  "refuse what you cannot read" step needs a newer-generation fixture to be testable at
  all.
- **Open.** No corpus of bundles written by older builds is opened on every build (the
  technique's own cost line). The single-agent importer's newer-version message gives a
  number but does not name a newer release. It cannot fire until that format's first
  generation bump.

The other five techniques remain unapplied.
