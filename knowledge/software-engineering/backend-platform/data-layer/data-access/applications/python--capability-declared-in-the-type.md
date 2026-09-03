---
layer: application
type: application
subject: data-access
technique: capability-declared-in-the-type
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# Twenty-five backends behind four interfaces, and a token where no transaction reaches (LightRAG)

Citations resolve against a LightRAG clone whose `refs/heads/main` is
`c1248646e4eda4d89054926af2e094730daf23fe`; the working tree these line
numbers were read from is checked out on branch `intake/reclaim-off-is-loud`
at `5ecc99a0`, and every number below was opened in that tree rather than
inferred. The version witness is the CI matrix, not the floor: `pyproject.toml:14`
declares `requires-python = ">=3.10"`, while `.github/workflows/tests.yml:18`
runs the suite on `['3.12', '3.14']` — so `python@3.12` is the lowest version
the tree actually exercises.

Four storage interfaces (`lightrag/base.py`) carry twenty-five admissible
backend classes across fifteen implementation modules in `lightrag/kg/`. That
count is what makes the subject's prose-list answer unavailable, and the tree
answers with both of the technique's mechanisms, deliberately split.

## 1. Tier 1: instantiability is the capability guarantee

`DocStatusStorage` (`base.py:1269`) states the rule in the technique's own
terms in its class docstring (`base.py:1272-1276`): the bounded scheduling and
strict-read API "are `@abstractmethod` so a backend missing any of them cannot
instantiate. There is no degraded fallback and no capability flag:
instantiability IS the capability guarantee." Twelve members are declared that
way, including `get_docs_by_statuses_page` (`:1510`), `get_docs_by_ids`
(`:1557`) and `resolve_doc_source_strict` (`:1672`).

The other three interfaces do the same for their non-negotiable operations:
`BaseVectorStorage` (`:252`), `BaseKVStorage` (`:418`) and `BaseGraphStorage`
(`:519`) each mark read, write and delete abstract, so the gap is a
construction failure naming the class, never a lookup failure inside a query.

## 2. Tier 2: the declared capability, and its conservative default

`BaseKVStorage.supports_strict_point_reads: ClassVar[bool] = False`
(`base.py:421`) is the technique's tier 2 with the argument attached. Its
docstring (`:422-433`) says why this one is *not* abstract: the KV interface
serves many namespaces and "only the `full_docs` stale-stub decision needs it.
A backend that does not provide it degrades to the conservative path (keep the
FAILED stub, never delete on an unconfirmed miss). Callers MUST gate on this
flag before calling."

The default is the conservative pole, exactly as the technique demands: silence
means no, and ten backend classes opt in explicitly — `json_kv_impl.py:137`,
`json_doc_status_impl.py:110`, `mongo_impl.py:364` and `:600`,
`opensearch_impl.py:693` and `:1402`, `postgres_impl.py:3123` and `:5460`,
`redis_impl.py:297` and `:784`.

The tree also demonstrates the polarity rule the technique states abstractly.
`BaseVectorStorage.requires_embedding_func: ClassVar[bool] = True`
(`base.py:253`) defaults the *other* way, and is overridden to `False` by
exactly one class (`noop_vector_db_impl.py:20`). Two flags, opposite polarity,
each defaulting to the safe answer for its own meaning — chosen for the
default, not for how the name reads.

## 3. Tier 3: the refusing default and the typed verdict

`get_by_id_strict` (`base.py:439`) is not abstract; its base body raises
(`:457-461`):

```
raise StorageCapabilityError(
    f"{type(self).__name__} does not support strict point reads "
    "(supports_strict_point_reads=False); the caller must fall back "
    "to a non-destructive path instead of trusting a miss."
)
```

That is the technique's tier 3 in full: a dedicated exception type rather than
a generic error, the implementation named, the capability named, and the
caller told which road to take instead. Three more members follow the same
shape — `count_docs_by_statuses` (`:1612`, raising at `:1624`),
`list_source_conflicts_page` (`:1691`, raising at `:1704`) and
`repair_source_conflict` (`:1709`, raising at `:1765`).

## 4. Admission at construction

`verify_storage_implementation` (`lightrag/kg/__init__.py:153`) refuses an
unknown storage type (`:164`) and a name absent from that type's
`implementations` list (`:168`), before any instance exists.
`STORAGE_ENV_REQUIREMENTS` (`:51-119`) is the environment-prerequisite table
the technique asks the selection point to evaluate, and
`factory.get_storage_class` (`factory.py:17`) resolves the name to a class —
four defaults eagerly (`:19-34`), everything else through
`importlib.import_module` (`:41`).

## 5. The conformance suite asserts the negative branch

`tests/kg/test_scheduling_base_defaults.py` is the suite the technique says is
usually missing. `test_scheduling_methods_are_mandatory_abstractmethods`
(`:180`) asserts each scheduling member is in `DocStatusStorage.__abstractmethods__`
(`:191`) *and* that `get_by_id_strict` is not (`:184`) — pinning the tier split
itself, not just its members. `test_subclass_missing_an_abstract_cannot_instantiate`
(`:206`) proves tier 1 actually refuses. And the unsupported branch is asserted
three times: `test_get_by_id_strict_is_optional_capability` (`:194`) checks the
flag is `False` (`:199`) then that the call raises (`:200`);
`test_count_default_raises_capability_error` (`:233`) and
`test_source_conflict_methods_raise_capability_error` (`:261`) do the same for
the other refusing defaults.

## 6. Ordering carried as a token, where no transaction reaches

`lightrag/kg/write_seq.py` (122 lines) is `sequence-token-write-ordering`
realized, with the force stated in its own docstring (`:10-14`):
`__created_at__` is a whole-second stamp, "so two writes inside the same second
carry the *same* timestamp — a normal, reachable outcome rather than an
anomaly — and a tie used to fall through to 'replay', which let a stale redo
record overwrite a genuinely newer durable row."

The allocator is the technique's recipe verbatim (`:83-86`): under a lock
(`:71`), `seq = max(time.time_ns(), _last_seq + 1)` — clock reading for
legibility, one-past-the-high-water-mark for order. The token is stamped at
write submission (`faiss_impl.py:424` then `:431`;
`nano_vector_db_impl.py:440` then `:447`), persisted with the record, and
stripped from public reads (`faiss_impl.py:507`, `:1461`;
`nano_vector_db_impl.py:782`, `:1114`).

`row_is_strictly_newer` (`:89`) implements both rules the technique puts on the
comparison. It requires *both* sides to carry a token before the token decides
(`:120-121`), falling back to whole seconds otherwise (`:122`), with the reason
written out: "reading its absence as `0` would declare it older than any freshly
stamped row and let the replay overwrite it." And equal tokens resolve to *not
newer* — a tie is an answer. The docstring refuses the shortcut by name
(`:56-59`): closing the cross-process gap "would take a totally ordered
generation shared across processes… folding the pid into the token would only
hide a tie behind an arbitrary winner, so neither is done here." Eight tests
pin it (`tests/kg/test_write_seq.py:30-101`), including the frozen-and-backwards
clock (`:37`), the same-second tie (`:71`), the cross-process tie (`:77`) and
the missing token (`:91`).

The durability the token sits above is `lightrag/file_atomic.py`:
`atomic_write` (`:114`) writes a per-writer temp sibling and renames with
`os.replace` (`:133`), and `reap_orphan_tmp_files` (`:73`) names the reaper for
what `tmp_path_for` (`:47`) creates, with `TMP_REAP_AGE_SECONDS = 3600` (`:44`).

## 7. Where the tree falls short

**The declared requirement nobody reads.** Each entry in
`STORAGE_IMPLEMENTATIONS` carries a `required_methods` list
(`kg/__init__.py:10`, `:22`, `:36`, `:46`), and
`verify_storage_implementation` never reads that key — it checks only list
membership. Worse, the function's own docstring promises the check it does not
perform: "Raises: ValueError: If storage implementation is incompatible **or
missing required methods**" (`:161`). This is precisely the technique's
"documentation wearing a check's uniform", and the tree's own tier-1 answer
makes it redundant rather than merely unenforced — the abstract members already
make the omission unconstructable, so the honest fix is deletion, not
implementation.

**The capability name is a string literal at every gate.** The eight sites that
gate on the flag all reach it reflectively with a default —
`getattr(store, "supports_strict_point_reads", False)` at
`lightrag/lightrag.py:4430` and `:4711`, `pipeline.py:2891` and `:3263`,
`utils_pipeline.py:527`, `api/routers/document_routes.py:3008`,
`tools/source_conflict_repair.py:447`, and off the class rather than the
instance at `utils_pipeline.py:822`. The declaration read is the right one, but
the access is not typed: a misspelling at any site reads `False` forever and
that backend degrades silently, with the conservative default masking the
error. A closed vocabulary spelled as a literal a dozen times has no
authoritative definition — the flag should be read as the attribute it is.

**Two registry entries name modules that are not there.** `STORAGES` maps
`ChromaVectorDBStorage` to `.kg.chroma_impl` (`kg/__init__.py:136`) while that
module now lives under `kg/deprecated/`, and `AGEStorage` to `.kg.age_impl`
(`:139`), which does not exist. Neither name appears in any `implementations`
list, so admission refuses them first — but with "not compatible with
GRAPH_STORAGE" rather than the truth, which is the wrong verdict surviving to
the operator.

**The token is not on every write, and its allocator is per process.**
`write_seq.py`'s first line scopes it: "Per-write ordering token for the
file-backed vector stores." Only two of the fifteen implementation modules
stamp it, for their redo logs; the other thirteen never do. So the technique's
headline prize — one ordering semantic identical on a file-backed and a
server-backed install — is not obtained here; the property exists exactly where
the redo log exists. The allocator is likewise a module-global under a
`threading.Lock` (`:71-72`), so two processes sharing a store can mint equal
tokens. The tree does not hide either: the limits are enumerated at `:32-59`,
the tie is a pinned test, and the cross-process gap is argued as excluded by a
single-writer-per-workspace invariant rather than closed. That is the
technique's own instruction — state the guarantee including where it stops —
followed, and it leaves a real residue rather than a fixed one.
