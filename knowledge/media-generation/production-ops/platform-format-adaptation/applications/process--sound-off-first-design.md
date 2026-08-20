---
layer: application
type: application
subject: platform-format-adaptation
technique: sound-off-first-design
stack: process
status: forged
verified_on: 2026-08-20
---

# The 2026-08 platform constraint table — the measured reality behind sound-off-first design

A dated, sourced snapshot of the per-platform physics a sound-off-first plan
(and any format template covering these containers) inherits — worked in the
measured-template discipline: every number carries its provenance grade, ranges
are left honestly wide where sources disagree, and what nobody measured is not
stated. **Accessed 2026-08-20.** These are platform facts; they drift — a
consumer of this table re-dates it before enforcing it.

## Canvas and safe zones (grade: published-spec / vendor-guide)

| Platform | Canvas | Occlusion to design around |
|---|---|---|
| TikTok | 1080×1920, 9:16 | top UI strip ≈120 px; bottom caption/interaction block ≈250 px (some guides say up to bottom 20%); right-edge action column |
| Instagram Reels | 1080×1920, strict 9:16 | bottom block + right-edge action column (same shape as TikTok; exact px varies by guide) |
| YouTube Shorts | 1080×1920, 9:16 | title/controls at bottom; right-edge action column |

Cross-platform safe overlap: **≈900×1400 px centered** in the 1080×1920 frame
(vendor-guide consensus, not a published platform spec). This is the band the
subject's golden path calls "the middle band" — note it excludes the right
edge, not just top and bottom.

## Duration: ceilings vs performing bands vs policy lines (grade: mixed — see rows)

| Platform | Ceiling (published policy) | Performing band (vendor-observed, unaudited) | Policy lines (published) |
|---|---|---|---|
| TikTok | 10 min in-app recording; up to 60 min via upload | engagement peak ≈15–34 s; virality claims cluster ≈11–18 s | revenue eligibility requires >60 s — directly above the engagement band |
| Instagram Reels | uploads to ≈15–20 min, BUT reels over 3 min are not distributed to new audiences | viral ≈7–15 s; value ≈30–45 s; aggressive looping makes very short clips over-count retention | the 3-min distribution penalty is the effective ceiling |
| YouTube Shorts | 3 min (raised from 60 s) | ≈30–60 s | Shorts RPM ≈$0.01–$0.10 vs long-form ≈$2–$12 — a 30–100× per-view gap; YPP: 1k subs + 10 M Shorts views/90 d (thresholds rise 2027-02-01) |

The table is itself the golden path's ceiling-vs-band argument in numbers: every
ceiling sits 4–40× above its band, and on two of three platforms a **policy
line pulls against the band** (TikTok's >60 s revenue floor; Shorts' pooled RPM
making shorts an acquisition channel for long-form rather than a revenue
format). A brief that says "make it longer for monetization" is citing the
policy column, not the craft column — a template must hold them apart.

## Sound-off and captions (grade: vendor/industry surveys — wide, and honestly so)

- Share of social video viewing that starts muted: **≈69–85%** depending on
  source, platform, and ad-vs-organic context. No single trustworthy point
  estimate exists; carry the range.
- Caption effects (survey-grade, self-reported or vendor-measured): ≈80% more
  likely to watch to completion with captions; comprehension of captioned ads
  up ≈56%. Directionally consistent everywhere; magnitudes unaudited.

## Retention curve (grade: vendor-observed at scale, unaudited)

- 50–60% of all drop-off occurs in seconds 0–3; ≥70% retention at the 3-second
  mark is the commonly cited distribution bar; view-vs-swipe ratios under ≈60%
  correlate with distribution collapse. Consistent with — and slightly
  sharpening — the subject's "large majority in the first three seconds".

## What this table refuses to state

No per-platform word budgets (nobody publishes them; local measurement only),
no posting-cadence numbers (claims exist but contradict across sources), and no
font-size minima for captions (device-dependent; unmeasured here). Unmeasured
is not pass.

## Sources

- https://veopro.ai/blog/social_media_video_specs_2026 · https://portrait.spectatr.ai/blog/video-specs-cheat-sheet · https://anfx.co/blog/youtube-shorts-tiktok-reels-video-size-guide/ (canvas, safe zones)
- https://www.socialinsider.io/blog/how-long-are-tiktok-videos/ · https://joyspace.ai/ideal-video-length-social-platform-2026 · https://www.opus.pro/blog/ideal-youtube-shorts-length-format-retention (bands)
- https://vidiq.com/blog/post/youtube-shorts-monetization/ · https://mediacube.io/en-US/blog/youtube-shorts-rpm · https://www.unkoa.com/youtube-shorts-monetization-requirements/ (policy lines)
- https://aibrify.com/blog/youtube-shorts-retention-curve-playbook (curve shapes)
- https://www.mixcord.co/blogs/content-creators/the-mute-majority-stop-the-scroll · https://digiday.com/sponsored/75-percent-of-people-watch-mobile-videos-on-mute/ · https://amzg-media.com/blogs/everything-is-amzg/silent-scrollers-why-85-of-users-watch-without-sound-and-what-that-means-for-your-content (sound-off range)
