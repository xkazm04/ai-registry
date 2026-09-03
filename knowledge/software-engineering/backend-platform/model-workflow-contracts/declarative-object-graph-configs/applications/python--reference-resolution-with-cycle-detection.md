---
layer: application
type: application
subject: declarative-object-graph-configs
technique: reference-resolution-with-cycle-detection
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Reference resolution in the MONAI bundle config system

MONAI's `monai.bundle` package (pinned at commit
`02201b8600df372cb425f2bb8e0cb7addd0df50f`, `requires-python >=3.10` in
`pyproject.toml:20`) is the reference realization of the technique: a
`ReferenceResolver` that turns ids from a JSON/YAML bundle config into live
objects, lazily, with a waiting set for cycles. The syntax it resolves is
documented in `docs/source/config_syntax.md`, and the sigil alphabet it depends
on is five constants in `monai/bundle/utils.py:34-38` — `ID_REF_KEY = "@"`,
`ID_SEP_KEY = "::"`, `EXPR_KEY = "$"`, `MACRO_KEY = "%"`, `MERGE_KEY = "+"` —
imported by the resolver rather than restated (`reference_resolver.py:20`).

## The procedure, line by line

`ReferenceResolver._resolve_one_item` (`monai/bundle/reference_resolver.py:107-179`)
is the whole depth-first algorithm. Entry is per id and memoized: a hit in
`self.resolved_content` returns immediately (`:126-127`), which is what makes
`@network` in the optimizer and `@network` in the trainer the same instance.
The id is normalized first (`:125`) through `normalize_id` (`:206-213`), a
one-line `str(id).replace("#", "::")` — the legacy `#` separator is rewritten
to the canonical `::` at the front door, and no later code branches on which
spelling arrived. The technique's "one normalization function, one place" rule
holds exactly.

The waiting set is a `set[str]` threaded through the recursion (`:136-138`).
Before touching the item's own references, the resolver hoists imports: it
scans *every* item, and any unresolved `ConfigExpression` that
`is_import_statement` is evaluated and cached first (`:140-146`). This runs on
each call rather than once, but the cache makes it idempotent, and it
guarantees an expression can use `$import glob` regardless of which entry
point was asked for first.

Then, for each reference found in the item (`find_refs_in_config`, `:147`):
a hit in the waiting set raises `ValueError("detected circular references
'{d}' for id='{id}' ...")` (`:149-150`) — the error names both ends, and there
is no retry, proxy or deferral; a reference whose id is not in `self.items`
raises `ValueError("the referring item `@{d}` is not defined ...")` unless
`allow_missing_reference` is set, in which case it warns and `continue`s
(`:152-161`); otherwise it recurses and discards the child from the waiting
set on return (`:163-164`). Only after every reference is resolved does the
item itself get built: a `ConfigComponent` is instantiated, a
`ConfigExpression` evaluated with the resolved objects passed as a scoped
global, and a plain value stored as-is (`:167-179`).

## The missing-reference toggle is process-global

`allow_missing_reference` is a class attribute (`reference_resolver.py:58`)
bound from `monai.utils` — where it is read once from the environment:
`os.environ.get("MONAI_ALLOW_MISSING_REFERENCE", "0") != "0"` at
`monai/utils/module.py:38-39`. It defaults to off, cannot be set from inside a
config file, and applies to every resolver in the process. That is the
technique's "global toggle, never per reference" property, realized at the
outermost possible scope; the cost, that a shell variable left set outlives
the inspection that set it, is the same cost the escape-hatch kill switch
carries and is noted there.

## Per-request inspection flags

`get_resolved_content` passes `**kwargs` through to `_resolve_one_item`, and
the docstring at `:100` names them: `instantiate` and `eval_expr`, both
defaulting to `True`. With `instantiate=False` a `ConfigComponent` is cached
as the item rather than the object (`:171`); with `eval_expr=False` an
expression is cached unevaluated (`:172-176`). The depth-first walk, the cycle
check and the missing-reference check all still run — which is the
"inspection without construction" mode the technique describes, per request
rather than global.

## Disabled nodes vanish from the parent

`update_config_with_refs` (`:358-373`) rebuilds a container from its resolved
children and, at `:365-369`, skips any child that `is_instantiable` and
resolved to `None`, with the comment `# the component is disabled`. So a
handler list with a `_disabled_: true` entry is one element shorter when the
trainer's constructor receives it, and a dict loses the key. The one place the
tree falls short of the technique's standard is the representation: a disabled
`ConfigComponent.instantiate()` returns `None` (`monai/bundle/config_item.py:284-286`),
and so does any `_target_` whose callable legitimately returns `None`, and
`:365-369` cannot tell the two apart — the second is dropped from its parent
as though it had been switched off. The technique asks for a private sentinel
here; this tree uses the host's null.

## Whole-value substitution versus embedded text

`update_refs_pattern` (`:283-318`) finds references with
`id_matcher = re.compile(r"@(?:\w*)(?:::\w*)*")` (`:56`), sorts them longest
first so `@a` cannot corrupt `@ab` (`:297-299`), and then applies the
technique's two-case rule at `:303`: `if value_is_expr or value == item`. A
string that *is* `@xxx` is replaced by the object (`:315-317`, with the comment
that this "will avoid the case that regular string contains '@'"); a string
that merely contains `@` somewhere is left alone; and inside a `$` expression
the reference is rewritten to `__local_refs['xxx']` (`:312-314`) for the
evaluator to look up — the binding mechanism the sibling application on
escape-hatch expressions covers.
