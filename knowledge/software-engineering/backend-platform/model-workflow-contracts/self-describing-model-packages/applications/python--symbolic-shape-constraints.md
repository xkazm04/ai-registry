---
layer: application
type: application
subject: self-describing-model-packages
technique: symbolic-shape-constraints
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# A shape grammar with a two-variable solver and a forward-pass proof

MONAI's bundle format, read at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`, is the tree this technique was reconciled against. The bundle specification (`docs/source/mb_specification.rst`) defines a `metadata.json` whose tensor format specifiers carry a `spatial_shape`, and the `monai.bundle` command set ships the solver and the check that make the shape a contract rather than a note.

## The grammar, as the specification states it

`mb_specification.rst:79` defines `spatial_shape` as a list of the form `[H]`, `[H, W]` or `[H, W, D]`, and `:111` gives the value grammar: each entry is a positive integer for a fixed size, `"*"` for any size, or a string expression "with Python mathematical operators and one character variables". The worked examples are the technique's: `"2**p"` for a power of two, `"2**p*n"` for a multiple of a power of two, and the sentence that makes it a family rather than a list of hints — *variables are shared between dimension expressions* — illustrated by `["*", "16*n", "2**p*n"]`. The example metadata at `:154` and `:166` shows the fixed case, `[160, 160, 160]`, written as literals.

## The solver

`monai/bundle/scripts.py:142-170`, `_get_fake_spatial_shape`, is the solver. It walks the shape list; an `int` passes through; `"*"` becomes the caller's `any` argument; anything else is parsed with `ast` (`_get_var_names`, `:138-140`) and the variable set is checked against a **closed alphabet** — `{"p", "n"}` — with a `ValueError` naming the offenders for anything outside it (`:161-164`). Defaults are `p=1, n=1, any=1`, so the command runs with no arguments and produces the smallest member of the family.

The evaluation line is the upward lesson the draft took from this tree. `:166-167` reads:

```python
# evaluate using Numpy types to prevent slow Python DoS attacks
ret.append(int(safe_eval(i, {"p": np.int32(p), "n": np.int32(n)}, rewrite_np=True)))
```

The expression is author text from a package the consumer did not write; evaluating `2**p` in Python's arbitrary-precision integers is a denial of service one metadata file away, and the fix is to evaluate over a fixed-width type through a restricted evaluator. The technique's "restricted evaluator over bounded integer types" rule is this line generalized.

## The forward pass

`verify_net_in_out` (`monai/bundle/scripts.py:1250-1274`) is the proof step. It reads channel count, spatial shape and dtype for input and output out of the metadata through the parser (`_get_net_io_info`, `:1252`), instantiates the network from the bundle's own config by id (`parser.get_parsed_content(key)`, `:1255`, with a `KeyError` that names the missing id), solves the shape with the caller's `p`, `n` and `any` (`:1261`), builds `torch.rand(1, input_channels, *spatial_shape)` at the declared dtype (`:1262`), and runs it under `torch.no_grad()`. Two assertions follow: `output.shape[1] != output_channels` and `output.dtype != output_dtype` each raise a `ValueError` naming both sides (`:1271-1274`). A run that reaches the end logs "data shape of network is verified with no error." — the successful case is spelled differently from every failing one.

## What this realization cannot do

The check asserts the output's channel count and dtype; it does not assert the output's spatial shape against the metadata's output `spatial_shape`, so a declared output shape can be wrong and pass. The alphabet is fixed at `p` and `n`; the specification's "one character variables" is broader than the solver implements, and a bundle using `m` validates against the schema and fails the solver. And half-precision inputs are forced onto a GPU (`:1264-1268`), so the check is not runnable on every consumer's machine for every bundle.
