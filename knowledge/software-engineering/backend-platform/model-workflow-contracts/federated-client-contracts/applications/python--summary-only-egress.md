---
layer: application
type: application
subject: federated-client-contracts
technique: summary-only-egress
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Summary-only egress in MONAI's federated statistics client

`MonaiAlgoStats.get_data_stats` (`monai/fl/client/monai_algo.py:227-270`, pinned at commit
`02201b8600df372cb425f2bb8e0cb7addd0df50f`) is the `ClientAlgoStats` implementation NVIDIA
FLARE calls before any training round to learn whether the consortium's sites hold
commensurable data. Everything the technique asks for is visible in forty lines.

## The server declares the bins, and absence is a refusal

The request arrives in `extra`, keyed by the `FlStatistics` enum
(`monai/fl/utils/constants.py:44-53`). The client checks `FlStatistics.HIST_BINS` and
`FlStatistics.HIST_RANGE` and raises a `ValueError` when either is missing (`:231-238`);
there is no site-side default. Both values are then passed unchanged to
`_get_data_key_stats` for the training set and, separately, for the validation set
(`:243-264`), so two sites answering one request compute histograms over identical bins.

One wrinkle worth knowing before you read the message: the error text at `:232` says
`FlStatistics.NUM_OF_BINS`, and the `ClientAlgoStats.get_data_stats` docstring
(`client_algo.py:72-74`) shows `NUM_OF_BINS` and `BIN_RANGES` — neither of which exists in
the enum. The enum is the authority and the docstring is a stale copy of the vocabulary.

## Per-case results are written locally and never returned

`_get_data_key_stats` returns a `(summary_stats, case_stats)` pair and takes an
`output_path` under `self.app_root` — `train_data_stats.yaml` and `eval_data_stats.yaml`
(`:248`, `:263`) — where the per-case table is written. The returned `stats_dict` is
updated with the summary half only, under the comment "Only return summary statistics to
FL server" at both `:250-252` and `:267-269`; `case_stats` is used only as a truthiness
check that the split was non-empty. The per-record table is never placed in the exchange
object, which is the structural form the technique requires: nothing downstream has to
strip it.

The training and validation sets are summarised separately under `self.train_data_key` and
`self.eval_data_key`, and a datalist with no validation section is logged as a warning
rather than silently pooled (`:266`).

## The exchange object cannot leak by being described

The returned `ExchangeObject(statistics=stats_dict)` is a dict subclass whose `summary()`
(`monai/fl/utils/exchange_object.py:85-101`) records, for each of `weights`, `optim`,
`metrics`, `weight_type` and `statistics`, the length of a dict, the enum value of a
weight type, or the Python type of anything else — never the value. Platform-side
diagnostics that print the summary therefore cannot print a statistic. The returned
statistics leave through the `post_statistics_filters` chain
(`constants.py:60`, applied in `monai_algo.py:208`), the fourth outbound position.

## Deviations against the standard

The technique's small-population rule — withhold moments below a declared minimum count —
is not implemented; a site with three cases returns three-case moments. And the returned
summary does not carry the bin declaration it was computed under, so a server receiving two
summaries cannot verify from the payloads alone that they are addable; it has to trust that
both clients received the same request.
