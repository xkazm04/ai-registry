---
layer: technique
type: technique
subject: translation-pipeline-topology
technique: source-hash-translation-cache
status: forged
laws: [clean-strings-stay-untouched, the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [designing incremental re-translation for a large corpus, deciding what goes into a translation cache key, making a ci translation job resumable after cancellation, avoiding re-translating unchanged source files, sharing translation progress across runners]
---

# Source-hash translation cache

A machine-translation pipeline over a large corpus must answer, per unit and
per language, one question: has this exact source already been translated under
this exact configuration? Key every derived translation by a digest of its
exact source unit — the sighted pipeline uses the sha256 of each canonical
lesson's bytes, recorded in a per-(language, section) cache file — and the
answer becomes a lookup instead of a guess. The digest is computed from the
source, never from the output: [the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth),
so the source's bytes are the identity of the work, and the derived text is
merely the value stored under that identity.

## What belongs in the key

When two runs could legitimately produce different output, the difference must
be in the key, because a cache hit is a claim of equivalence. Include:

- the source unit's bytes (the digest of the exact text translated, not the
  file path, not a modification time — paths move and mtimes lie)
- the engine's identity and version — an open machine-translation model at one
  revision and a hosted provider behind the optional-upgrade flag are
  different engines, and a version bump is a new engine
- any prompt, glossary, or configuration that shapes the output — a changed
  system prompt or termbase produces different translations from identical
  source, and a key that omits it serves stale output forever

Exclude anything that does not change the output: runner identity, run
timestamp, job number, queue position, retry count. When such values leak into
the key, every run misses the whole cache and the pipeline degenerates to
full re-translation with extra bookkeeping.

## Invalidation is exact, not wholesale

When a source unit changes, its digest changes, and exactly that unit's cache
entries — one per language — miss on the next run. Nothing else does. The
first run over the sighted corpus translated everything once; every later run
re-translates only lessons whose canonical text changed. This is
[clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)
applied at pipeline level: an unchanged source unit is never re-translated,
because re-translating an unchanged unit is an unanchored refine pass — the
new output differs from the old for no reviewable reason, every difference is
unreviewed churn, and any downstream fix or review that touched the old output
is silently discarded. The cache is not only an economy; it is the mechanism
that keeps the pipeline from rewriting its own past work.

When configuration changes deliberately — a new engine version, a revised
prompt — the wholesale miss that follows is correct and should be budgeted as
a full re-run, not "fixed" by pinning old keys. The one wrong move is editing
cache entries by hand to avoid the cost; a cache that lies about equivalence
is worse than no cache.

## Publish the cache with the derived store

When the job finishes a unit, write its cache entry in the runner; when the
job completes, publish cache and derived output together to the shared derived
store — in the sighted pipeline, both land on the translations branch. The
next run, on any runner, reads the published cache and resumes from global
state, not from whatever one machine's disk happens to hold. Do this because
runners are ephemeral and interchangeable: a cache that lives only on the
runner makes progress runner-local, and every fresh runner starts from zero.

The interruption contract follows: a cancelled or crashed job loses only its
unpublished runner-local progress and resumes from the last published cache.
That bounds the blast radius of any failure to one job's increment, which is
what makes it safe to run the pipeline on a free CI runner with hard time
limits — a timeout costs one increment, not the corpus.

Publish cache and output atomically, as one unit. A cache entry published
without its translation claims work that does not exist and the unit is
skipped forever; a translation published without its entry is re-translated
next run and overwritten with churn.

## Failure modes

- Keying by path or mtime: renames re-translate everything; touched-but-
  unchanged files re-translate; genuinely changed content served stale when a
  tool rewrites files preserving timestamps. Digest the bytes.
- Engine or prompt omitted from the key: the configuration improves, the cache
  keeps serving output from the old configuration, and nobody notices because
  every run reports full hits.
- Runner-local cache only: every cold runner is a first run; a cancelled job
  loses all progress instead of one increment.
- Cache and output published separately: the two stores drift, producing
  permanently skipped units or permanently churning ones.
- Manual cache edits to force or suppress re-translation: the key stops
  meaning "this exact source under this exact configuration", and every later
  audit inherits the lie. Change the source or the configuration instead, and
  let the digest do its job.
