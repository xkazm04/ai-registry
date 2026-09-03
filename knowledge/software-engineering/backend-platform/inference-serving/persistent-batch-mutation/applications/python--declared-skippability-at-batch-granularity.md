---
layer: application
type: application
subject: persistent-batch-mutation
technique: declared-skippability-at-batch-granularity
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Argmax invariance as a declared, per-instance, whole-batch skip

vLLM's logits-processor interface carries exactly the declaration this
technique describes: `is_argmax_invariant()`, defined in
`vllm/v1/sample/logits_processor/interface.py:86-96` and specified in
`docs/design/logits_processors.md:158-164` and `:281-283`. Citations are pinned
to commit `facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`; the document's own
admonition (`:3-5`) that this API "may change in the near future" applies here
too — the names may move, the shape is what transfers.

## The property

A logits processor transforms a `(num_requests) x (vocab_size)` tensor of
logits before sampling. **Argmax-invariant** means the transform never changes
which token id has the highest logit in a row. Greedy sampling picks exactly
that token, so under greedy sampling an argmax-invariant processor cannot
change the output and can be skipped.

Min-p is invariant (`builtin.py:47-49`, "Min-p never impacts greedy sampling"):
it masks low-probability tokens, and the maximum is never among them.
Min-tokens is not (`builtin.py:189-192`): it censors stop tokens until a
minimum length is reached, and the censored token may have been the argmax.
Logit bias is not (`builtin.py:130-133`) — an arbitrary additive bias can
reorder anything.

The engine cannot derive any of this. It is a fact about each transform's
mathematics, so the interface asks.

## Evaluated once, at startup, and realized as a partition

`vllm/v1/sample/logits_processor/state.py:148-165`:

```python
class LogitsProcessors:
    def __init__(self, logitsprocs=None):
        self.argmax_invariant: list[LogitsProcessor] = []
        self.non_argmax_invariant: list[LogitsProcessor] = []
        if logitsprocs:
            for logitproc in logitsprocs:
                (self.argmax_invariant
                 if logitproc.is_argmax_invariant()
                 else self.non_argmax_invariant).append(logitproc)
```

This is the technique's structural claim made concrete. The property is read
once, at construction; the processors are **sorted into two lists**; and no
per-step test of the property exists anywhere in the engine. `all` is a
`chain` over both lists (`state.py:162-165`) for the state-update phase, which
runs for every processor regardless of invariance.

The skip is then a placement, not a branch
(`docs/design/logits_processors.md:126-155`). The sampler's `forward` applies
`non_argmax_invariant` before sampling; `sample` first exits early if the whole
batch is greedy, and only *after* that point iterates `argmax_invariant`. When
the early exit fires, the invariant list is simply never reached.

## Per instance, not per class

`interface.py:86-96` carries the rationale as a docstring on the abstract
method:

```python
@abstractmethod
def is_argmax_invariant(self) -> bool:
    """True if logits processor has no impact on the
    argmax computation in greedy sampling.
    NOTE: may or may not have the same value for all
    instances of a given LogitsProcessor subclass,
    depending on subclass implementation.
    """
```

and the best-practices section states the reason explicitly
(`docs/design/logits_processors.md:537`): the invariance "may also be
determined programmatically (i.e. if your logits processor is user-customizable
in some way that impacts whether the logits processor is argmax invariant). For
this reason, `is_argmax_invariant()` is not a class method."

That last sentence is the whole argument for the technique's rule 2, from a
tree that had the option of making it a `classmethod` and declined. Note the
contrast one method up: `validate_params` (`interface.py:61-68`) *is* a
`classmethod`, because validating a request's parameters is genuinely a
property of the type. The interface distinguishes the two cases deliberately.

## The granularity limit, stated by the source

`docs/design/logits_processors.md:164`:

> The vLLM logits processor abstraction requires the engine to apply logits
> processors at batch granularity; therefore in practice the argmax-invariant
> logits processors can only be skipped when the entire batch uses greedy
> sampling.

The document reaches this in two steps — first the conceptual per-request
statement ("conceptually an argmax-invariant logits processor can be skipped
for greedy sampling requests", `:160`), then the correction that the batch is
the unit. That is exactly the misreading the technique warns about, written
down and then repaired by the same document. In a mixed deployment, one
request using temperature sampling makes the whole step pay.

## The implementer corollaries in the tree

Both corollaries appear as recommendations
(`docs/design/logits_processors.md:531-533`) and as code:

- **Return the input unmodified when nobody enabled you.** The document is
  blunt about why a per-request opt-out does not translate into savings: "you
  cannot skip an entire vectorized operation in `apply()` just because one
  request disabled the logits processor". Min-p implements the whole-batch
  version in one line — `builtin.py:102-104`, `if not self.min_p_count: return
  logits` — against a counter maintained during state updates
  (`builtin.py:59-92`), so the check is a comparison and not a scan.
- **Exit early on a null update.** Min-p opens `update_state` with
  `if not batch_update: return` (`builtin.py:54-56`), and the sparse helper
  does the same (`builtin.py:381-383`). This is legal for them because their
  state is derived purely from membership and parameters.

## Where the tree teaches more than the draft did

**The null-update rule has a worked counter-case in the same file.** Min-tokens
(`builtin.py:208-222`) does *not* exit early. It calls the sparse helper, which
returns immediately on a null update, and then unconditionally scans its
retained entries for requests that have reached their minimum length:

```python
def update_state(self, batch_update: BatchUpdate | None):
    needs_update = process_dict_updates(self.min_toks, batch_update, self.add_request)
    if self.min_toks:
        to_remove = tuple(index for index, (min_toks, out_tok_ids, _, _)
                          in self.min_toks.items() if len(out_tok_ids) >= min_toks)
```

`out_tok_ids` is the reference handed over in the add tuple, and it grew since
the last step even though membership did not change. This is the concrete
reason the null value means *membership unchanged* and not *nothing to do* — a
processor that took the early exit here would keep censoring stop tokens for a
request that had already earned the right to stop. The interface's own comment
says as much (`docs/design/logits_processors.md:288`).

**The measurement the tree does not take.** Nothing in the engine reports the
fraction of steps in which the invariant list was actually skipped. The
technique's metric rule — count fully-qualifying *steps*, not qualifying
requests — is written from that absence rather than from a counter that exists.
