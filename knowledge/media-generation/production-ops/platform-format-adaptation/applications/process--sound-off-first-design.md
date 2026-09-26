---
layer: application
type: application
subject: platform-format-adaptation
technique: sound-off-first-design
stack: process
status: forged
verified_on: 2026-09-26
refresh_by: 2026-12-26
---

# The platform constraint table — the measured reality behind sound-off-first design

A dated, sourced snapshot of the per-platform physics that a sound-off-first plan
inherits, and that any format template covering these containers inherits too.
It is worked in the measured-template discipline:

- every number carries its provenance grade;
- ranges are left honestly wide where sources disagree;
- what nobody measured is not stated.

**First accessed 2026-08-20; re-verified 2026-09-26**, when the platform rows were
re-checked against the platforms' own help pages and blogs where those exist.
These are platform facts, and they drift. A consumer of this table re-dates it
before enforcing it. The clock on this file is three months, a vendor-landscape
clock, not the default for its stack.

## What the 2026-09-26 re-check changed

- **The sound-off row was wrong for these platforms.** The 69–85% muted share
  traces to 2016 Facebook feed video (see below), not to TikTok, Reels or Shorts.
  The technique now keys the silent share to the surface.
- **The retention row's percentages are downgraded** to unaudited vendor lore. The
  one academic swipe study found skips bimodal: early *and* late.
- **The cross-platform safe overlap is not centred.** It is smaller than
  ≈900×1400 wherever the ad-spec margins apply.
- **The YouTube Partner Program row misdescribed the 2027 change.** Corrected from
  the platform's own post.
- **Two platform facts added:** Shorts view counting changed on 2025-03-31, and
  Shorts of 1–3 min with a Content ID claim stopped being blocked on 2026-09-24.

## Canvas and safe zones (grade: published ad-spec / vendor-guide)

| Platform | Canvas | Occlusion to design around |
|---|---|---|
| TikTok | 1080×1920, 9:16 | TikTok publishes downloadable ad safe-zone *templates* for in-feed ads, not pixel figures. It says the zone depends on caption length and add-ons. Vendor readings of those templates spread widely: top ≈120–220 px, bottom ≈250–480 px, right column ≈64–140 px. The right margin is consistently larger than the left. |
| Instagram Reels | 1080×1920, 9:16 | Meta's ads guidance for Stories and Reels, as quoted by trade press (the help page itself did not render), says to keep ≈14% top, ≈35% bottom and ≈6% each side free of text. On this canvas that is ≈269 px top, ≈672 px bottom and ≈65 px sides. The guidance is ad-spec; applying it to organic reels is the conservative choice. |
| YouTube Shorts | 1080×1920, 9:16 | No official pixel safe zone found. Title and controls sit at the bottom, with an action column on the right edge. |

Cross-platform safe overlap: roughly **900 px wide**, shifted slightly **left of
centre** because the right column is wider than the left margin. Its height
depends on which spec you honour:

- **≈1300–1400 px** under organic TikTok and Shorts chrome;
- **≈980 px** under Meta's ad margins.

This is the band the golden path calls "the middle band". The 2026-08 version of
this table said ≈900×1400 centred, and that holds only for the loosest reading.

## Duration: ceilings vs performing bands vs policy lines (grade: mixed — see rows)

| Platform | Ceiling (published policy) | Performing band (vendor-observed, unaudited) | Policy lines (published) |
|---|---|---|---|
| TikTok | 10 min in-app recording; up to 60 min via upload | engagement peak ≈15–34 s; virality claims cluster ≈11–18 s | Creator Rewards pays only for original videos "over 1 minute", directly above the engagement band |
| Instagram Reels | up to 20 min per Instagram's help, rolling out unevenly (many accounts still see 3 min in-camera, 15 min on upload) | viral ≈7–15 s; value ≈30–45 s; aggressive looping makes very short clips over-count retention | "Reels over 3 minutes won't be recommended to new audiences" — the effective ceiling |
| YouTube Shorts | 3 min, for uploads since 2024-10-15 | ≈30–60 s | See the next table. Since 2026-09-24, new Shorts of 1–3 min carrying a Content ID claim are no longer blocked automatically, but monetization still waits on the claim. |

The table is itself the golden path's ceiling-vs-band argument in numbers: every
ceiling sits 4–40× above its band. On all three platforms a **policy line pulls
against the band**:

- **TikTok:** the >60 s revenue floor.
- **Instagram:** the 3-minute recommendation cut-off.
- **Shorts:** pooled RPM, which makes shorts an acquisition channel for long-form
  rather than a revenue format. The 2027 rule below makes that line harder.

A brief that says "make it longer for monetization" is citing the policy column,
not the craft column. A template must hold them apart.

### YouTube Shorts money lines (grade: platform-published, except RPM)

| Line | Until 2027-01-31 | From 2027-02-01 |
|---|---|---|
| YouTube Partner Program entry, Shorts route | 1k subs + 10 M qualified Shorts views in 90 days | 1k subs + **20 M** qualified Shorts views in 90 days |
| YouTube Partner Program entry, long-form route | 1k subs + 4k watch hours in 12 months | 1k subs + **8k** watch hours in 365 days |
| Shorts revenue share, for *any* member | membership suffices | an **ongoing** condition: 10 M qualified Shorts views in the trailing 90 days. Below it a channel keeps the program for long-form but loses Shorts revenue share. |
| Expanded program (fan funding, Shopping; no ad revenue) | 500 subs, 3 uploads in 90 days, 3 M Shorts views or 3k watch hours | unchanged, per its help page |
| Shorts RPM vs long-form (vendor-grade; YouTube publishes none) | Shorts ≈3–14% of long-form RPM in a 274-channel vendor sample (2026-06), a ≈7–33× gap; wider vendor ranges quote ≈$0.01–$0.10 for Shorts against ≈$2–$12 long-form. Carry it as **≈10–100×, unaudited**. | — |

**"Views" changed meaning on 2025-03-31.** The public Shorts view counter now
counts every start and replay. The older metric survives as *engaged views*, and
the program thresholds and payouts use the qualified or engaged count. As a result:

- a Shorts view figure from before that date and one from after it are not
  comparable;
- a band or outlier score built across the change mixes two metrics.

## Sound-off (grade: see each line — the headline figure is the wrong platform)

- **The origin of the muted majority.** "85 percent of Facebook video is watched
  without sound" (Digiday, 2016-05-17) came from three publishers' own reports of
  their Facebook feed views: LittleThings 85%, Mic 85% of 30-second views, and
  PopSugar 50–80%. It was never a Facebook platform number. It describes a feed
  that autoplayed muted.
- **TikTok.** The only platform-published figure is an attitude survey: "88% of
  TikTok users said that sound is essential to the TikTok experience" (Kantar for
  TikTok, 2021). It is not a measured sound-on share. The platform autoplays with
  sound.
- **Reels.** "80% of Reels are viewed with sound on" circulates, attributed to
  Instagram's internal data. On 2026-09-26 it could not be traced to any Instagram
  or Meta page. Recorded here as untraced, and not used.
- **Shorts.** No platform figure. The Shorts player plays sound; muted autoplay
  applies to the YouTube home feed.
- **Captions (survey-grade, self-reported or vendor-measured).** Captioned video
  is ≈80% more likely to be watched to completion, and comprehension of captioned
  ads is up ≈56%. The direction is consistent everywhere; the magnitudes are
  unaudited, and most were measured in muted-autoplay contexts.
- **What to carry.** Per surface: muted-majority on muted-autoplay feeds; muted
  minority of **unknown size** on TikTok, Reels and the Shorts player. There is no
  single short-form figure.

## Retention curve (grade: one academic user study; the rest vendor-observed, unaudited)

- **Academic.** In the Dashlet user study (Li, Xie, Netravali, Jamieson; arXiv
  2204.12954, 2022), 29% of swipes fell within a video's first 20% and 42% within
  its last 20%. Mid-video swipes were rare. The sample was 133 retained MTurk
  viewers and 15,344 swipes. The curve is **bimodal**: an early exit and an
  end-of-clip exit.
- **Vendor.** 50–60% of all drop-off in seconds 0–3, and ≥70% retention at 3 s as
  "the distribution bar". These figures are widely repeated, unaudited and absent
  from every platform's documentation. YouTube Studio shows each creator a
  "viewed vs swiped away" split, and publishes no target for it.

## What this table refuses to state

It states none of the following:

- **Per-platform word budgets.** Nobody publishes them; they are local measurement
  only.
- **Posting-cadence numbers.** Claims exist but contradict each other across
  sources.
- **Font-size minima for captions.** They are device-dependent and unmeasured here.
- **A single sound-off share for "short-form".**

Unmeasured is not pass.

## Sources

Platform-published:

- https://support.google.com/youtube/answer/15424877 (Shorts up to 3 min; Content ID change)
- https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/ (2026-08-10, the 2027 thresholds)
- https://support.google.com/youtube/answer/72851 (program eligibility)
- https://support.google.com/youtube/answer/13429240 (expanded program)
- https://about.instagram.com/features/reels (3-min recommendation line)
- https://www.tiktok.com/creator-academy/en/article/creator-rewards-program (over 1 minute)
- https://ads.tiktok.com/business/en-US/blog/kantar-report-how-brands-are-making-noise-and-driving-impact-with-sound-on-tiktok (88%, attitude survey)
- https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads (safe-zone templates)
- https://www.facebook.com/business/help/980593475366490 (Stories and Reels ad safe zone; body did not render, percentages via trade press)

Trade press and academic:

- https://digiday.com/media/silent-world-facebook-video/ (2016-05-17, origin of the 85%)
- https://arxiv.org/abs/2204.12954 (Dashlet swipe study)
- https://ppc.land/youtube-changes-how-shorts-views-are-counted-from-march-31/ (view-count change)

Vendor (bands, RPM, safe-zone readings):

- https://air.io/en/air-data-findings/youtube-shorts-rpm-vs-long-form-how-much-do-shorts-earn-in-2026
- https://cadenus.io/resources/blog/tiktok-safe-zone/
- https://behaviour.digital/post/meta-reels-safe-zone-14-top-35-bottom-6-sides-the-2026-official-guide
- https://www.socialinsider.io/blog/how-long-are-tiktok-videos/
- https://www.opus.pro/blog/ideal-youtube-shorts-length-format-retention
