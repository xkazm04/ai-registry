---
layer: application
type: application
subject: extension-trust-boundary
technique: invert-the-default-for-exposed-surface
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# One entry-point mechanism, five groups, two defaults

Read against `github:vllm-project/vllm` at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`. The extension mechanism is the
standard packaging `entry_points` table (`docs/design/plugin_system.md:11-38`),
and the same discovery call serves every group. The defaults do not follow the
mechanism; they follow the group.

## The five groups and where each loads

`vllm/plugins/__init__.py:16-30` declares the groups as constants, and each
constant carries its loading locus in the comment above it:

| group constant | loads in |
| --- | --- |
| `vllm.general_plugins` | all processes — front end, engine core, workers |
| `vllm.platform_plugins` | all processes, lazily on first platform resolution |
| `vllm.io_processor_plugins` | front end only |
| `vllm.stat_logger_plugins` | front end only, async serving |
| `vllm.endpoint_plugins` | front-end API server process only |

Writing the locus next to the group name is what makes "which processes run
this group" readable instead of reconstructed; `docs/design/plugin_system.md:7`
states the general rule ("every process created by vLLM needs to load the
plugin") and `:56` states the exception for the exposed group in the same list
that names it.

## The permissive default, in the shared loader

`load_plugins_by_group` (`vllm/plugins/__init__.py:36-74`) is the one discovery
function. Its policy is a single conditional at `:64`:

```python
if allowed_plugins is None or plugin.name in allowed_plugins:
```

`VLLM_PLUGINS` unset means load everything discovered; set means load exactly
what it names. Discovery announces the available set before filtering
(`:52-54`), and when nothing narrows it, `:56-60` logs that all will be loaded
and names the variable that would narrow it. A per-plugin `try/except` at
`:68-72` logs the failure and continues — a load failure never aborts a
process, which makes the log line at `:72` the only trace of a plugin that
silently is not there.

## The inversion, as a guard in front of that loader

`load_endpoint_plugins` (`:93-158`) does not add a strictness parameter to the
shared loader. It refuses to call it:

```python
if envs.VLLM_PLUGINS is None:
    discovered = entry_points(group=ENDPOINT_PLUGINS_GROUP)
    if discovered:
        logger.warning(
            "Found endpoint plugin(s) %s but VLLM_PLUGINS is not set. ...")
    return []
```

Three properties of that block are the whole technique in miniature. The
inversion lives at the one call site that owns the exposed group, so no future
caller can pass it wrongly (`:121-130`). The unset case still performs
discovery **for the sole purpose of warning**, listing by name every endpoint
plugin installed on the machine and not loaded — the "installed but not
enabled" announcement, at warning level, in the one situation where the
inversion would otherwise read as a malfunction. And the docstring at `:98-110`
states the asymmetry against the other groups in the code a reader lands in,
not only in the design document.

`:107-109` records the parsing hazard explicitly:

> Note that `VLLM_PLUGINS=""` parses to `[""]`, not `None`, so it is treated as
> a (non strict) allowlist that matches no plugin name, not as "unset".

Empty string and unset are different values that reach the same outcome here
and opposite outcomes under the permissive groups. Both spellings are pinned by
name in `tests/plugins_tests/test_endpoint_plugins.py:73-88` —
`test_no_plugins_loaded_when_allowlist_unset` and
`test_no_plugins_loaded_when_allowlist_is_empty_string`, the second carrying
the parsing rule in its docstring.

## The identifier the allowlist matches

An endpoint plugin has two names: the entry-point name in the packaging table
and the `name` attribute on the object. `docs/design/endpoint_plugins.md:101`
resolves the ambiguity in one sentence — "The entry point name is independent
of the plugin's `name` attribute. `VLLM_PLUGINS` allowlisting matches on the
**entry point name**." Without that sentence, the failure is an allowlisted
plugin that silently does not load.

## The second gate, and the pairing gap

Gating is two conditions, not one (`:132-153`): named in the allowlist, and
`required_tasks` either `None` or intersecting the server's supported tasks. A
factory that raises during instantiation is logged and skipped rather than
aborting startup (`:136-140`), tested at
`tests/plugins_tests/test_endpoint_plugins.py:136`.

What the allowlist does **not** cover is written down as the fourth operator
practice in `docs/usage/security.md:351`: a plugin that also needs engine-side
behaviour ships that half under `vllm.general_plugins`, which loads in every
worker under the load-all default, and "allowlisting the endpoint plugin does
not by itself restrict its paired engine side plugin. Need to review both."
The same rule is stated from the author's side at
`docs/design/endpoint_plugins.md:113-125` and in the protocol docstring at
`vllm/plugins/endpoint_plugins/interface.py:11-16`: two entry points, "loaded
independently where neither implies the other".

`docs/usage/security.md:340-342` supplies the posture the code implements:
endpoint plugins "must be treated as part of the server's trusted code base and
not as sandboxed or reviewed input", and are off unless named — the same shape
as the development-endpoint gate, so an operator meets one posture twice rather
than two conventions once each.
