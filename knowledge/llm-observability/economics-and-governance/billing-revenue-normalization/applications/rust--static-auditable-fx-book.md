---
layer: application
type: application
subject: billing-revenue-normalization
technique: static-auditable-fx-book
stack: rust
verified_on: 2026-08-20
---

# The static FX book in LightTrack (Rust)

LightTrack converts all billing-provider revenue to USD through
`FxTable` (`crates/billing/src/fx.rs`), seeded from `config/fx_rates.json` —
the same "seed a static book from a JSON file at startup" pattern the repo
already uses for its model price book. The file *is* the auditable artifact:

- **Provenance inside the book:** the `_meta` note (`config/fx_rates.json:3-8`)
  states the convention ("Each rate is the USD value of ONE unit of the
  currency, so amount_usd = major_units * rate"), that USD is the implicit
  base, that the rates are "a periodic manual snapshot, NOT a live feed —
  margins are as fresh as this file", plus `last_verified: 2026-07-13` and the
  ECB/IMF source URLs. `docs/CURRENCY.md:37-44` is the update runbook:
  pull reference rates, invert to USD-per-unit if quoted the other way, bump
  `last_verified`, restart.
- **Deliberate determinism:** `docs/CURRENCY.md:33-35` states the rationale
  verbatim — "revenue recognition should be deterministic and auditable, not
  silently re-priced by an external feed between reports."

## Load hygiene and the shared instance

`FxTable::from_json_str` (`fx.rs:67-77`) uppercases codes and filters out any
stray base entry and any non-positive rate ("a zero/negative rate would
corrupt every conversion"); the test at `fx.rs:220-235` pins that a stray
`"USD": 2.0` inside `rates` cannot shadow the base's implicit 1.0.
`from_env` (`fx.rs:81-102`) loads from `LIGHTTRACK_FX_RATES` or the default
path; a missing or unparseable file degrades loudly to a USD-only table —
"non-USD revenue stored 1:1 and flagged", never dropped, never crashed.
`shared_fx()` (`fx.rs:148-151`) is a process-wide `OnceLock` handed to both
the billing adapters (which stamp amounts at ingest) and the margin surface
(which flags unconverted currencies), "so both agree on the same rate book".

## Minor units upstream, rates on major units

Conversion composes the sibling technique in the right order: `to_usd`
(`fx.rs:118-137`) first divides by `minor_divisor` (`fx.rs:155-165`) — the
per-currency ISO-4217 table with explicit zero-decimal (JPY, KRW, VND, …)
and three-decimal (KWD, BHD, …) lists — then multiplies by the rate. The
`_meta` note says the boundary out loud: decimals "are handled in code …
NOT here: rates are on major units." The incident that motivates the split
is recorded at `docs/CURRENCY.md:11`: "Dividing JPY by 100 understated yen
revenue 100×; that is the bug this fixes," pinned by
`jpy_is_zero_decimal_not_divided_by_100` (`fx.rs:186-191`).

## The missing rate is a flagged state, not USD

`to_usd` returns `UsdAmount { amount_usd, converted }` (`fx.rs:23-31`): a
currency absent from the book comes back at 1:1 with `converted = false` —
the money is kept, the approximation is machine-visible. The margin surface
turns that into a payload-level caveat (`docs/CURRENCY.md:52-64`):
`unconverted_currencies: ["GBP", "SEK"]` plus a `currency_note` naming them,
so the report discloses its own approximation. The Stripe adapter's test
`unknown_currency_stored_1to1_and_flagged_by_table`
(`crates/billing/src/stripe.rs:355-363`) pins the ingest half, and the
original `currency` label is preserved on every record
(`stripe.rs:152,179`) so re-rating stays possible.

Every claim of the technique is confirmed here. The upward lessons the repo
contributed to the standard: put the convention sentence *inside* the book
(the reciprocal-inversion trap is real, and the `_meta` note is what defuses
it), and drop non-positive rates at load — a zero rate is a corruption class
the technique's draft had not named.
