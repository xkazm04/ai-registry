---
layer: application
type: application
subject: skill-adjacency-and-normalization
technique: whole-token-matching-over-substring
stack: process
status: forged
verified_on: 2026-08-20
---

# Word-grid-pinned compact matching in a Python jobfit pipeline

The matching pipeline (`pipeline/jobfit/`) resolves skill surfaces against a
hand-maintained taxonomy (`data/taxonomy.json`, ~176 terms). Surface presence in
free text is decided by `_text_contains` (`pipeline/jobfit/taxonomy.py:352`),
which drives `detected_skills`, role-family classification and salary-signal
voting — all in the deterministic core that runs whether or not the LLM leg is
available.

## The incident

`pipeline/jobfit/tests/test_false_skill_credit.py:1` documents it verbatim. The
compact fallback exists so a job description spelling "Node.js" as `nodejs`,
"CI/CD" as `cicd` or "cross-selling" as `crossselling` still resolves. Unguarded,
it was a raw substring test over one spaceless blob and awarded skills nobody
claimed:

```
detected_skills("Driven by curiosity and a love of learning")   -> ['ios']
detected_skills("We use PostgreSQL heavily")                    -> ['postgresql', 'sql']
detected_skills("Experienced in upselling to enterprise accounts")
                                                                -> ['selling', 'upselling']
detected_skills("Kubernetes, OpenShift, Helm")  -> ['.net', 'helm', 'kubernetes', 'sop']
```

Two of those are cross-word accidents: `net` sits inside `kuberNETes`, and `sop`
spans the `kuberneteS OPenshift` boundary once the spaces are gone. All four are
silent, deterministic and repeatable — the failure profile the technique warns
about.

## The fix, mechanically

`_compact_word_grid` (`taxonomy.py:255`) precomputes, for a normalized text, the
word-run boundaries expressed in *compact* coordinates: a `starts` map from each
word's compact start offset to its compact end offset, plus an `ends` set. Since
`_compact` strips exactly the `\W+` runs, the surviving `\w+` runs concatenate to
the compacted string, so the mapping is exact rather than approximate. It is
`lru_cache`d at 128 entries because the same job text is scanned against the full
surface pool.

`_compact_fallback_hit` (`taxonomy.py:272`) then walks every occurrence of the
compact surface and accepts only a span that **starts at a word start and ends at
a word end** — both endpoints, per the technique:

```python
word_end = starts.get(idx)
if word_end is not None:
    end = idx + span
    if end in ends:
        return True
    if allow_inflection and end < word_end:
        return True
```

`allow_inflection` is the technique's single relaxation, and the call site gates
it on the surface being a single plain token (`_compact(normalized) == normalized`
— no separator to absorb). It relaxes only the END condition, so Czech
`"ve sparku"` / `"v pythonu"` resolve to Spark and Python. A separator-bearing
surface gets none of it: `.net` ending inside `networking` is always an accident.

The length guard sits ahead of both (`taxonomy.py:365-370`): a compact form under
three characters never reaches the fallback at all, because `"c#"` and `"c++"`
both compact to `c`, which used to vote `software_engineering` on every CV.
Short skills still match exactly through `contains_whole_token`
(`taxonomy.py:334`), which anchors with non-word lookarounds `(?<!\w)…(?!\w)` so
`R`, `Go`, `C++`, `.NET` match standalone and never inside a word.

## The standing collision gate

`pipeline/jobfit/taxonomy_check.py` implements the scan the technique calls for.
`scan_corpus_collisions` (`:353`) runs every surface's compact form against a
seed corpus of realistic job text; `collision_is_live` (`:304`) asks whether the
collision still fires under the *current* matcher, and `gate_collisions` (`:333`)
fails CI only on live collisions not on `BENIGN_COMPACT_SURFACES` (`:301`) —
which holds exactly three reviewed entries: `node.js`, `ci/cd`, `cross-selling`.
Exit status is non-zero for a live un-allowlisted collision, so the gate covers
the data door as well as the code door. `test_tech_bilingual_parity.py:104`
exercises precisely that: every Czech alias added in the bilingual pass is run
through `scan_corpus_collisions` and must come back empty.

## Verdicts

- **Confirmed.** Both-endpoint word-grid anchoring; the single-plain-token suffix
  relaxation; the short-form length guard; the whole-token-first ordering; the
  live-collision gate with a short reviewed allowlist; the negative regression
  file with non-vacuity positives beside it
  (`CompactFallbackStillWorksTest`).
- **Deviation.** The gate's benign allowlist is a module-level frozenset with no
  recorded reason per entry. Three entries are reviewable at a glance; a
  twentieth will not be. The standard's "short enough that a new entry is a
  conversation" holds — the repo currently satisfies it by being small rather
  than by structure.
- **Upward lesson taken into the technique.** The length guard as a rule of its
  own, ahead of the word-grid check, and the framing of a new alias as a matching
  change that must re-run the collision scan.
