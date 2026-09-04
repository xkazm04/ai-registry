---
layer: application
type: application
subject: declarative-object-graph-configs
technique: escape-hatch-expressions
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Expression evaluation in the MONAI bundle config system

In MONAI's bundle configs (pinned at commit
`02201b8600df372cb425f2bb8e0cb7addd0df50f`, `requires-python >=3.10` in
`pyproject.toml:20`), any string value beginning with `$` is a Python
expression, and `docs/source/config_syntax.md` says so without euphemism:
`"$print(42)"` "indicate[s] evaluating `print(42)` at runtime",
`"$from torchvision.models import resnet18"` binds a module as a global for
every other section, and `"$lambda x: @my_list.pop() + x"` is given as a
worked example of an expression *mutating* the object it references. The
page's Recommendations close with the advice the technique gives as a decision
rule: "simple structures with sparse uses of expressions or references are
preferred", plus a note that `#`, `::` and `$` need quoting on a command line.

## The trust boundary, stated twice

The technique requires the loader's own documentation to say that loading an
untrusted file runs its code. This tree does so in two places. The `run`
entry point's docstring (`monai/bundle/scripts.py:949-953`) reads: "parsing
`config_file` can run arbitrary code. Any `_target_` value is resolved to an
importable callable and invoked with no allow list, and any `$`-prefixed
value is passed to Python `eval()`. Only point this at config files you wrote
or otherwise fully trust", with a link to advisory GHSA-873f-pvrv-4x83. And
`_warn_logging_file_execution` (`monai/bundle/workflows.py:38-52`) warns,
immediately before every `logging.config.fileConfig` call, that the logging
INI's `class=` and `args=` fields are also passed to `eval()` — a second
code-execution path in a file most operators would not think of as code —
citing GHSA-wvpx-5qmp-46g3. Neither offers a sandbox, and neither pretends to.

## `ConfigExpression.evaluate`

`monai/bundle/config_item.py:348-385` is the evaluator. It returns `None` for a
non-expression (`:359-360`); handles an import statement specially via
`_parse_import_string` (`:361-363`, the hoisted-import form); and then checks
the kill switch: `if not self.run_eval: return f"{value[len(self.prefix):]}"`
(`:364-365`) — evaluation off leaves the expression as its source text, minus
the `$`. `run_eval` is a class attribute (`:323`) bound from
`monai/utils/module.py:34`, `os.environ.get("MONAI_EVAL_EXPR", "1") != "0"`:
on by default, disabled by the environment, never by the file. Imports still
bind with the switch off, because the import branch runs before the check —
the exception the technique says a specification must state.

The globals namespace is assembled at `:366-371`: a copy of the expression's
own globals (the hoisted imports), updated with whatever the caller passes,
and on a key collision `warnings.warn(f"the new global variable `{k}`
conflicts with `self.globals`, override it.")` — later wins, loudly. Then, with
`run_debug` off, `eval(value[len(self.prefix):], globals_, locals)` wrapped so
a failure re-raises as `RuntimeError(f"Failed to evaluate {self}")` naming the
item (`:372-376`). With `run_debug` on (`module.py:36`, `MONAI_DEBUG_CONFIG`),
it warns with the expression text and drops into `pdb.run` (`:377-384`).

## References bind as scoped names, not text

The caller that matters is the resolver: `ReferenceResolver._resolve_one_item`
evaluates an expression with
`item.evaluate(globals={"__local_refs": self.resolved_content})`
(`monai/bundle/reference_resolver.py:172-176`), and `update_refs_pattern`
has already rewritten each `@xxx` inside the expression to
`__local_refs['xxx']` (`:312-314`, with the comment that the mapping "will be
added to the `globals` argument of python `eval`"). So `$@batch_size * 4`
executes as `__local_refs['batch_size'] * 4` against a dict holding the
resolved object — no string form of the value ever enters the source, and a
string-typed reference needs no quoting. The rewrite handles matches longest
first (`:297-299`), which is what keeps `@a` from mangling `@ab`.

## What the technique adds beyond this tree

The three switches — evaluation, debug, missing-reference — are environment
variables read once at import (`monai/utils/module.py:34-39`). The technique's
"log the switch's state at load when it is not the default" is not present:
a shell with `MONAI_EVAL_EXPR=0` left over from an inspection loads the next
training config with every expression as a string, and nothing says why. The
per-node `_mode_: debug` (`config_syntax.md`, `pdb.runcall` on the target) is
the per-node debug the technique describes; the expression-level debug here
is global only.
