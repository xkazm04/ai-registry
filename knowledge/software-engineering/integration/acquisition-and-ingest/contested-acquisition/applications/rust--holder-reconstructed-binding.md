---
layer: application
type: application
subject: contested-acquisition
technique: holder-reconstructed-binding
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.80
applied: experiment
ab_verdict: unmeasurable
---

# Rust application: a browser profile is a stored pass, and its binding is the launch mode

`personas` is a Tauri desktop application written in Rust. Its sign-in lane
drives a real Chrome over the DevTools protocol, one `--user-data-dir` per
account, so that an unattended re-login can reach a provider's sign-in page
that refuses an embedded webview. Citations are against the repository root at
commit `fe4daf0e444701d414b980b49886a7e055091eeb`. The version witness is the
declared minimum toolchain, `src-tauri/Cargo.toml:222` —
`rust-version = "1.80.0"` — with `edition = "2021"` at `:221`; no lockfile or CI
pin was read, so `verified_against` names the floor the manifest promises and
not a toolchain this run compiled with.

## Why this tree belongs to the technique

Nothing here stores a harvested pass by name. The credential is the profile
directory itself: the session cookies the provider sets are persisted by the
browser into `<app_data>/claude-login-profiles/<key>`
(`src-tauri/src/engine/login_lane/chrome.rs:205`, `app_data.join("claude-login-profiles").join(key)`),
and the orchestrator closes the session gracefully precisely so they are
flushed (`relogin/orchestrator.rs:365`, "Chrome flushes the profile's cookies
on a graceful close"). A later launch on the same directory replays them with no
ceremony. That is the technique's subject — a credential minted in one position
and replayed in another — in a form where the store is a directory and the
replayer is a browser.

## The seam chosen to falsify

The seam was chosen to answer: *does a profile minted in one mode ever get
replayed in a different mode, so that the client identity at replay is not the
identity at mint?* A CAUGHT outcome (the tree always launches one mode per
profile) would have shown the technique's mismatch case unreachable in a
second stack, the same finding the two earlier simulation rows reached in
node. It did not come back that way.

Two launchers share one profile directory:

- the human sign-in opens the profile **headed**
  (`relogin/headed.rs:53`, `.launch(&dir, LaneMode::Headed)`);
- the unattended re-login opens the same directory **headless**
  (`relogin/orchestrator.rs:340`, `.launch(&profile_dir, LaneMode::Headless)`).

`chrome_args` is the only place a launch's identity is composed
(`chrome.rs:224`), and the one thing it varies by mode is
`--headless=new` (`chrome.rs:234`). It passes no user-agent override and no
proxy flag, so the client identity is whatever the browser reports for the mode
and the egress is whatever the machine routes at that moment.

## The experiment

Arm A is the identity a headed launch presents; arm B is what the headless
launch the lane uses presents. One headless Chrome (`--headless=new`,
throwaway profile directory under the system temp root, deleted afterwards)
loaded a local page that wrote `navigator.userAgent`. It reported
`HeadlessChrome/155.0.0.0`, where a headed Chrome of the same build reports
`Chrome/155.0.0.0`. The headed side was not launched here (it needs a window
and a person); its form is the stock browser's and is stated, not measured.

- Target — identity pairs (mint mode, replay mode) that differ and are
  reachable: **1 of 4**, headed mint followed by headless replay. The reverse
  and the two same-mode pairs are equal. The first pair is the ordinary path:
  a person signs in headed once, and every later unattended run replays that
  profile headless.
- Floor — the lane's existing outcomes (a re-login that reaches the provider
  and a challenge that is reported as a challenge) are unchanged: nothing was
  modified, so the floor is trivially held.

## What the tree already does, and why the verdict is not `better`

The tree does not capture the minting identity and does not compare it at
replay: no field on the profile records the mode, route or user-agent it was
minted under, and `profile_dir_for` keys on the account alone
(`chrome.rs:201`). On the technique's own terms that is the missing capture
step.

The refusal rule is another matter. The technique separates a **hard** setting,
where the consumer re-presents the minting identity in full and a mismatch is
guaranteed signal, from a **best-effort** setting, where a re-validation path
exists downstream and catches the miss. This tree is the second. It sends no
bare value; it lets the browser present the pass, and a mismatch surfaces as an
interstitial that `detect_challenge` classifies from the page's URL and text
(`login_lane/challenge.rs:10`, with `ReloginReason::CloudflareChallenge` at
`:19`) and the orchestrator reports as a named reason instead of retrying. The
softness is therefore paid for by a detector, which is the condition the
technique sets for leniency.

Whether the provider actually binds its session to the headed identity, and so
whether this path has ever been re-challenged for that reason, is knowable only
from a live sign-in on the provider's site: the repository records challenge
outcomes but not the mode a rejected profile was minted in. Hence
`unmeasurable`, with a named instrument below.

## Where the standard is met, and where it is not

- **Met: the profile cannot cross a trust boundary.** The default browser
  profile is refused outright (`login_lane/mod.rs:115`, 'NEVER the user's real Chrome profile', enforced by
  `ensure_not_default_profile` at `session.rs:49` before every launch), so a pass minted by a
  person's everyday browser is never replayed by the lane — the technique's
  cross-transport refusal, reached by a path guard rather than a comparison.
- **Met: unknown fails closed in the way that matters here.** A profile whose
  cookies are absent or expired simply lands on the sign-in page, and the lane
  re-earns the pass; nothing renders an unreadable expiry as valid.
- **Not met: the capture.** The mint mode is not recorded, so a mismatch cannot
  be told from a refusal for any other reason. The cheapest reconstruction is a
  one-line marker file in the profile directory written at the end of a headed
  sign-in and read at headless launch.

## What this realization cannot do

It cannot show that the mismatch costs anything. A cookie replayed under a
different user-agent string is, for many providers, accepted; the technique's
claim is that the issuer did not say, and a desktop tree with no counter of
"headless replay rejected, headed replay accepted" cannot say either. It also
cannot show the egress half: the lane sets no proxy, so route changes (a VPN
toggled between the headed sign-in and the nightly run) are outside anything
the tree controls or records.

## Return condition

Instrument: one live pair against the provider with a throwaway account —
sign in headed, close, then open the same profile headless and count whether the
session survives, repeated once with the machine's route changed between the
two. Re-run when a challenge report is observed on a profile that was last
signed in headed, or when the lane gains a proxy or user-agent flag.
