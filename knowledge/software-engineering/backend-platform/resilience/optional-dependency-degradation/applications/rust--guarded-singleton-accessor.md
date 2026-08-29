---
layer: application
type: application
subject: optional-dependency-degradation
technique: guarded-singleton-accessor
stack: rust
status: forged
verified_on: 2026-08-29
verified_against: rust@1.97
---

# A master-key accessor that learned to memoise success only

`personas@58cf9557f` is a Tauri desktop app whose Rust core
(`src-tauri/core`, `rust-version = "1.80.0"`, verified with rustc 1.97.1)
encrypts stored credentials under a 32-byte master key held in the OS
keychain. The keychain is the optional dependency: it may be absent (a
headless CI box, a container), it may be briefly unavailable at start-up, and
there is a weaker local-file substrate to fall back to. All three states of
the technique — accessor shape, memoisation, catch site — have a dated
history in one file.

## The poisoned cell, and the fix

`core/src/crypto.rs:497-504` is the accessor, and its comment is the
technique's "memoise the instance, not the failure" learned the hard way:

> Cache only a SUCCESSFULLY-derived key. A transient keychain failure (e.g.
> the OS backend briefly unavailable during startup) must NOT be cached: the
> previous `OnceLock<Result<..>>` recorded the first *outcome*, so a single
> early failure returned the stale `Err` on every later call and bricked all
> credential encrypt/decrypt for the whole process, recoverable only by
> restart. Storing only on success lets a later call retry and succeed.

The cell is now `OnceLock<ProtectedKey>` (`:504`) — the success type only —
and a failed derivation simply returns `Err` and leaves it empty (`:551`
stores; the `Err` arm at `:557-561` does not). This is the language's own
spelling of the rule: `OnceLock::get_or_init` stores whatever the closure
returns, `get_or_try_init` is still unstable on this toolchain, so the
correct idiom is *check, derive, then `set` on success* rather than one
`get_or_init` with a fallible closure. The accessor also returns
`Result<&'static [u8; 32], CryptoError>` rather than an `Option` — the
technique's "typed result where the compiler enforces the unwrap", with the
*why* preserved in `CryptoError::KeyManagement` (`:426-437`).

## The fallback is a policy, parsed at one door

`:449-469` is the companion predicate done right after being done wrong.
`fallback_policy()` reads `PERSONAS_ALLOW_FALLBACK_KEY` in exactly one place,
and the doc comment records the prior state: "The previous code documented an
opt-in/fail-closed policy but implemented the opposite (fell back unless an
undocumented `PERSONAS_DENY_FALLBACK_KEY` was set, and never read the `ALLOW`
var the error names)". Two readers of one vocabulary — the comment, the error
string, and the runtime branch — had drifted apart, and the fix is
structural: one function "so the doc comment, the error text, and the runtime
branch can never diverge again".

The default is `Deny` (`:463-469`) — the closed door — and the `Deny` arm at
`:522-531` logs the refusal with the variable named and the reason ("Refusing
to store credentials without OS keychain protection"), then returns `Err`.
The `Allow` arm (`:532-541`) warns that "Credentials are still encrypted at
rest but not keychain-bound" and records `KeySource::LocalFallback` (`:540`),
which the UI reads: `src/features/vault/.../VaultTrustBadge.tsx:52` renders a
trust badge from `status.key_source !== 'keychain'`. The degraded posture is
visible on the surface it affects, not only in a log.

## Deviations

- **The derivative cache memoises the failure the primary one stopped
  memoising.** `get_cipher()` (`:1223-1233`) is
  `static CIPHER: OnceLock<Result<Aes256Gcm, String>>` initialised with
  `get_or_init(|| { let key = get_master_key()…?; … })`. It stores the first
  outcome. So the exact incident the key accessor's comment describes —
  keychain briefly unavailable at start-up, first caller arrives, `Err` is
  cached — is alive one layer up: `encrypt_for_db` (`:1236`) and its decrypt
  twin go through the cipher cell, and a process that hit the transient error
  once cannot encrypt again until restart, even though `get_master_key()`
  would now succeed. The fix at `:497-504` was applied to one of two cells.
  Resolved 2026-08-29 (personas commit `edb437422`): `CIPHER` is now
  `OnceLock<Aes256Gcm>` — success only; a transient derivation failure
  returns `Err` and leaves the cell empty, so a later call can retry. The
  paragraph above is kept as the dated specimen.
- **The verdict dies at the module boundary.** `impl From<CryptoError> for
  AppError` (`:439-443`) maps every variant to `AppError::Internal(String)`.
  "Keychain unavailable, fail-closed, set `PERSONAS_ALLOW_FALLBACK_KEY=1`" —
  a configuration posture the operator chose — reaches the command layer as
  the same internal error as a corrupt ciphertext, and the front end can only
  show its text. The accessor throws the right type; the first door erases
  it.
- **Booleans are one spelling.** `fallback_policy()` (`:464`) and
  `legacy_key_migration_allowed()` (`:478-480`) accept exactly `"1"`;
  `run_budget.rs:83-88` accepts `1|true|yes|on` for a sibling switch in the
  same crate. Two vocabularies for "true", and a `PERSONAS_ALLOW_FALLBACK_KEY=true`
  written by someone who read the other one silently reads as deny — the safe
  direction, and still a parse failure taking the default.
  `run_budget.rs:53-59` (`env_ceiling`) is the numeric twin: a ceiling that
  fails to parse, or is negative, falls back to the default without a log
  line.
