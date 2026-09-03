---
layer: application
type: application
subject: keyed-sample-transforms
technique: multi-sample-fan-out
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Multi-sample fan-out and the `map_items` depth in MONAI (Python)

How MONAI's `Compose` maps transforms over a list returned by a multi-sample
transform, declares the nesting depth, lets reducers opt out, and refuses to
flatten a nested chain with a different depth. Citations are against
`Project-MONAI/MONAI` at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`
(`requires-python = ">=3.10"`, `pyproject.toml:20`). The missing-key gate and
its scoped override are cited here too, because the seam between them and
flattening is where this tree falls short.

## 1. The two usage modes and the fan-out example

The `Compose` docstring (`monai/transforms/compose.py:141-176`) is the
subject's golden path in miniature: transforms either take and return a
single array, or take and return a dictionary, and dictionary transforms
"must have pass-through semantics that unused values in the dictionary must
be copied to the return dictionary. It is required that the dictionary is
copied between input and output of each transform" (`:151-155`). The example
that follows (`:165-178`) is a three-transform chain where `transformB`
returns three patch dictionaries and `transformC` "randomly rotates or flips
'img' and 'seg' of each dictionary item in the list returned by transformB".

## 2. Depth is an integer, and reducers opt out

`apply_transform` (`monai/transforms/transform.py:103`) carries the rule at
`:145-153`:

```python
map_items_ = int(map_items) if isinstance(map_items, bool) else map_items
if isinstance(data, (list, tuple)) and map_items_ > 0 and not isinstance(transform, ReduceTrait):
    if not isinstance(transform, transforms.compose.Compose):
        return [apply_transform(transform, item, map_items_ - 1, ...) for item in data]
return _apply_transform(transform, data, ...)
```

`True` is depth 1; an integer is the maximum nesting level, decremented per
recursion (`execute_compose` docstring, `compose.py:86-92`: "This allows
treating multi-sample transforms applied after another multi-sample
transform while controlling how deep the mapping goes"). A transform that
inherits `ReduceTrait` (`monai/transforms/traits.py:17`, defined `:98-104`)
receives the list whole regardless of depth. A nested `Compose` is likewise
passed the list whole (`transform.py:148-149`, "let it handle list/tuple
expansion internally so that nested Compose map_items settings are
respected") — the parent does not pre-map over a child chain.

## 3. Flatten refuses a child with a different depth

`Compose.flatten` (`compose.py:341-367`) inlines a nested `Compose` only when
`type(t) is Compose and t.map_items == self.map_items` (`:356`); a child with
a different `map_items` "is kept as-is so their item-mapping behaviour is
preserved at runtime and during inversion" (`:344-347`).
`TestNestedComposeMapItems` (`tests/transforms/compose/test_compose.py:
778-934`) is eight tests named after the bugs (issues #7932 and #7565 per
`:779`): a child `map_items=False` receiving the list from a `split`
(`:781-794`, result `23`), inversion delegating to the child (`:796-802`),
flatten preserving the different child (`:815-825`), mixed children
(`:827-851`), three-level nesting (`:876-896`), and inverse across mixed
children (`:898-906`).

## 4. The trait roster

`monai/transforms/traits.py:17` exports `LazyTrait, InvertibleTrait,
RandomizableTrait, MultiSampleTrait, ThreadUnsafe, ReduceTrait` — every
capability the chain reasons about is a constructor-free marker class. The
fan-out transforms carry `MultiSampleTrait` (`monai/transforms/croppad/
dictionary.py:747, 935, 1010, 1149`; `monai/transforms/spatial/dictionary.py:
2334, 2384, 2470`; `monai/transforms/utility/dictionary.py:341, 1216, 1263`).

## 5. The missing-key gate and its override

`MapTransform.key_iterator` (`monai/transforms/transform.py:470-491`) is the
one gate: `if key in data: yield ... elif not self.allow_missing_keys: raise
KeyError(...)` naming the key and the transform class. The `MapTransform`
docstring (`:377-397`) states the pattern every dictionary transform follows.
`allow_missing_keys_mode` (`monai/transforms/utils.py:1764-1808`) is the
scoped override: it records `orig_states`, sets every collected
`MapTransform.allow_missing_keys = True`, yields, and reverts in `finally`.
`Invertd` uses it around `self.transform.inverse(input_dict)`
(`monai/transforms/post/dictionary.py:921-922`), because the inverse
dictionary holds only the predicted key.

## 6. Where the tree falls short of the standard

- **The override's reach stops at a differing-depth child.**
  `allow_missing_keys_mode` collects its targets as `[t for t in
  transform.flatten().transforms if isinstance(t, MapTransform)]`
  (`utils.py:1791`). Since §3, `flatten()` keeps a nested `Compose` whose
  `map_items` differs from the parent's as an opaque `Compose`, which is not
  a `MapTransform`, so its children are never set permissive and an
  `Invertd` over such a chain raises `KeyError` on the first inverse. The
  standard's rule — walk the tree, do not trust the flat list — is the fix.
- **`MultiSampleTrait` is declared and never read.** No `isinstance(...,
  MultiSampleTrait)` check exists in the package; the fan-out is discovered
  by the chain seeing a list, not by the marker. The standard asks the
  fan-out transform to declare itself so that a cache boundary or an inverse
  can plan for it; here only `ReduceTrait` is load-bearing.
