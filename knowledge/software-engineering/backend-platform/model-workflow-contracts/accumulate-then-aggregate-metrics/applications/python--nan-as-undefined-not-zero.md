---
layer: application
type: application
subject: accumulate-then-aggregate-metrics
technique: nan-as-undefined-not-zero
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# NaN as undefined, not zero — MONAI's Dice metric and its NaN-aware reducer

MONAI (Project-MONAI/MONAI, pinned at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`,
`requires-python = ">=3.10"` in `pyproject.toml:20`) computes segmentation overlap per
sample and per class, encodes "no reference for this class in this sample" as `NaN`,
and reduces with a function whose every branch is weighted by the not-NaN count. This
document walks the encoding from the per-channel formula to the summary report, and
records where the tree falls short of the technique's standard.

## Where the NaN is minted

`DiceHelper.compute_channel` (`monai/metrics/meandice.py:358-374`) is called once per
sample and per channel. When the reference has any foreground (`y_o > 0`) it returns the
ordinary ratio. When the reference is empty the branch is:

```python
if self.ignore_empty:
    return torch.tensor(float("nan"), device=y_o.device)
denorm = y_o + torch.sum(y_pred)
if denorm <= 0:
    return torch.tensor(1.0, device=y_o.device)
return torch.tensor(0.0, device=y_o.device)
```

`ignore_empty` defaults to `True` on both `DiceMetric` (`meandice.py:127`) and
`DiceHelper` (`meandice.py:293`), and the docstring at `meandice.py:106-108` states the
policy: NaN for an empty reference, otherwise 1 when the prediction is also empty. The
alternative branch is the technique's "named option, off by default": a defined 1 for
correctly predicted absence, a defined 0 for a false positive on an empty reference.
The per-component variant mints the same NaN at `meandice.py:333-334`.

## Where the NaN is reduced

`do_metric_reduction` (`monai/metrics/utils.py:107-146`) is the single reducer every
cumulative metric in the package calls. It starts by building the mask:

```python
nans = torch.isnan(f)
not_nans = ~nans
```

For `MetricReduction.NONE` it returns the table unchanged with the float mask
(`utils.py:114-115`). For every other member it masks NaN to zero (`f[nans] = 0`,
`utils.py:117`) and divides the sum by the not-NaN count along the named axis —
`MEAN_BATCH` sums over dim 0 and divides by `not_nans.sum(dim=0)` (`utils.py:129-131`),
`MEAN_CHANNEL` does the same over dim 1 (`utils.py:135-137`). `MEAN` is the composite,
channel first and then batch (`utils.py:118-124`), and its returned count is
`(not_nans > 0).sum(dim=0)`: the number of samples with at least one defined class,
which is the count-predicate the technique says must be written down. Every branch
returns the pair `(f, not_nans)`.

`DiceMetric.aggregate` (`meandice.py:167-193`) reads the synced buffer, calls the reducer,
and returns `(f, not_nans)` only `if self.get_not_nans else f` (`meandice.py:193`).

## The report layer

`write_metrics_reports` (`monai/handlers/utils.py:56-167`) is what `MetricsSaver`
(`monai/handlers/metrics_saver.py:156-164`) calls on the save rank. The per-image
"mean" column is `np.nanmean(v, axis=1)` (`handlers/utils.py:130`) — channel first, then
the summary, matching the reducer's order — and the summary operations are all the
NaN-aware forms: `nanmean`, `nanmedian`, `nanmax`, `nanmin`, `nanpercentile`, `nanstd`,
plus a `notnans` column defined as `(~np.isnan(x)).sum()` (`handlers/utils.py:141-151`).
`docs/source/modules.md:166-167` lists the summary operations the report writes; it omits
`notnans`, which the code supports.

## Deviations from the technique's standard

Four places where the tree renders unknown as a definite value or drops the count; the
standard stays and each is recorded here rather than lowered.

1. **A zero count yields zero, not NaN.** Every mean branch of `do_metric_reduction` is
   `torch.where(not_nans > 0, sum / not_nans, t_zero)` with `t_zero = 0.0`
   (`utils.py:112, 121-137`). A class defined in no sample aggregates to `0.0` with a
   count of `0`. The count makes it recoverable — but only when the caller reads it.
2. **The count is opt-in on the metric class.** `DiceMetric(get_not_nans=False)` is the
   default (`meandice.py:126`); `DiceHelper` defaults it to `True` (`meandice.py:291`).
   With the class default, deviation 1 is unrecoverable: the zero travels alone.
3. **The handler drops the count.** `IgniteMetricHandler.compute`
   (`monai/handlers/ignite_metric.py:119-123`) keeps `result[0]` and warns that "metric
   handler can only record the first value of result list", so `engine.state.metrics`
   never carries `not_nans` even when the metric returns it.
4. **An empty reference with a non-empty prediction is NaN, not 0.** `compute_channel`
   returns NaN whenever `y_o == 0` and `ignore_empty` is set (`meandice.py:369-371`),
   regardless of the prediction. The technique's case split scores that row as a
   defined zero (a false positive); here a model that predicts a class on every empty
   sample pays nothing for it. The per-component path additionally launders the value:
   `torch.nan_to_num(data)` at `meandice.py:354` turns component-level NaN into 0
   before the mean.

A consumer adopting this tree should construct metrics with `get_not_nans=True`, read
the pair, treat a `(0.0, 0)` result as undefined, and be aware that `ignore_empty=True`
also exempts false positives on empty references.
