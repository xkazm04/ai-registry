---
subject: platform-extension-release-ladder
domain: media-generation
last_touched: 2026-11-03
dry_streak: 0
---

# platform-extension-release-ladder

First note. The subject was harvested on 2026-11-02 (326b3b04e) from Castle Control's plan
documents, a design record for an extension that is not built yet. A Curator dispatch
ranked it on "single stack (process)".

## State

6 techniques, 2 applications, both `process`, both Castle Control 8ef2d8e. The stack
finding is **not answered**, and that is a result. No fleet tree and no sibling checkout
carries extension code. The sweep's known positive was Castle Control's `cc-ebs`, which
matched only in its docs. The map's only join is overlord, on generic words, and overlord
has no extension.

## 2026-11-03 - deepen (pelr-deepen-1103)

Landed in 9dabb564c (catalog 18038e58f). Lanes:
- Counter-evidence (web), all re-read verbatim on 2026-11-03: the platform's life-cycle
  page, Extensions Guidelines and Policies (sections 1, 2, 6.2, 7), and the API reference's
  Send Extension PubSub Message and Set Extension Configuration Segment entries. Also the
  developer-run rate measurements on the platform's issue tracker (#612, 2022) and forum
  (2020).
- Training-data only, blind: it converged on the PubSub and configuration figures, the
  immutability of releases and the test-state visibility. It diverged on rejection, saying
  the client ID is not revoked; the life-cycle page says it is permanently revoked.
- Field: Castle Control's plan at 8ef2d8e (no change since the harvest). Every fleet
  project and every sibling checkout was swept for extension code, carrying a known
  positive.

- **Corrected: the money rule.** Paid currency was said to buy "looks, acknowledgement and
  participation", including "a place in a participation queue". Section 6.2 forbids
  access to a pay-to-play game (6.2.1), a chosen track (6.2.2), gambling with monetary
  rewards (6.2.3), chance items (6.2.4), contest or sweepstakes entry, including through a
  token (6.2.5), wagers (6.2.6), voice features (6.2.7), and items not predefined by the
  extension (6.2.8). Participation is now off the catalogue. A paid queue place stays off
  unless the platform confirms otherwise; that reading of 6.2.1 is inference, and it is
  marked as such.
- **Corrected: misattribution.** The old text said the platform forbids selling a vote's
  outcome or decision weight. 6.2 names neither one; the show's steering rule forbids both.
  The golden path and the technique now keep the two lists apart.
- **Corrected: release readiness.** The backend was said to be "ready for the new one". The
  life-cycle page says installs upgrade at once while viewers keep the old version until
  they reload, and asks the backend to handle traffic from older versions. The golden path
  now says the backend serves both, which matches what the technique already said.
- **Conditions added (coalesced broadcast).** A cadence equal to the rate has no headroom
  against a bucket that refills at the rate. The remaining-budget headers are read by
  developers but absent from the reference, so the broadcaster counts its own sends.
- **Own deviation corrected.** The application called the plan's "6.2.4 to 6.2.6"
  citation possibly stale. It is exact. What the plan's rule leaves out is 6.2.1 and 6.2.8.
- **New application** `process--viewer-content-needs-identity-and-approval` (6 anchors
  held). The sibling application's verified_on moved to 2026-11-03, and its 26 anchors held.
- **Applied, simulation, better.** Three of Castle Control's planned extension templates:
  the draw, the war table and the contribution meter. The old rule was wrong on 2 of 3
  against 6.2 and the new rule on 0 of 3; case 2 rests on reading 6.2.1. The plan's own
  acceptance line misses case 2. Falsifier: an approved version that sells paid moves or
  queue places on a free board, or a platform answer that paid priority is not
  pay-to-play. Castle Control is outside the fleet, so the tree was not edited.
- **Verified untouched**, each against a page opened today: review takes 8-14 days and
  resubmission resets the queue; rejection is terminal and revokes the client ID; release
  is allowed at any time after approval; released versions are immutable; PubSub allows
  5 KB and 100 a minute per client ID and broadcaster; configuration segments allow 5 KB and
  20 writes a minute; JS must be readable, with libraries as separate files (2.5, 2.6);
  every fetched URL is declared per version (2.12); a public domain needs a unique
  identifier (2.13), which per-version-host-allowlist step 2 already said; the review
  channel must be live, load and be configurable (1.1, 1.2, 1.5); section 7 sets the four
  content conditions.

## Impact

No stale verdicts: overlord's 3 pairs are `unknown` (never judged), joined on "shell /
build / bundle / review / panel" words. They are not an extension seam. Maps
regenerated and committed locally in 11 projects (not pushed; every range carries other
sessions' commits). tracklight's map had already been committed by a sibling.

## Banked

- **A second stack.** Return when Castle Control builds `apps/extension` or `cc-ebs`
  (that gives a `typescript` / `rust` application with `verified_against`), or when any fleet
  project grows extension code.
- **The bucket's real shape.** The refill and the global-versus-channel pool split are
  2020-2022 developer measurements. Return when the hosted test rung runs, and measure
  there.
- **Paid queue place versus 6.2.1.** Return on a platform answer, or on an approved
  extension that sells one.
- **The remaining-budget headers.** Return if the reference documents them, which would
  drop the hedge.
