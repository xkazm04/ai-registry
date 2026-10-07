---
subject: music-video-production
domain: media-generation
last_touched: 2026-10-07
touched_by: intake-1005-bkdr
dry_streak: 0
---

# music-video-production

Created 2026-10-05 from an XL spec (`librarian/specs/2026-10-05-music-video-production.md`): a practitioner
tutorial plus an operator dispatch asking for the path of making a video for a track that already exists.
One forge worker, about 10 web calls; the director re-read the singing-face primary verbatim.

## State

Golden path + 5 techniques (`track-map-before-treatment`, `form-follows-what-the-track-gives`,
`segment-on-the-master-clock`, `coverage-across-the-phrase`, `cut-rate-follows-the-section`), 1 application
(`next--track-map-before-treatment`, gravitone, structural-only plus the loudness experiment). The governing
fact: the track is finished, owned by somebody else and immutable, so it is the clock the film runs on; every
shot is addressed in a map drawn once, every segment carries its master offset as data, and the master is
delivered untouched (one peak-capped linear gain at most, never a dynamic normaliser).

Boundaries stated in the golden path: music-spotting-against-picture runs the other direction (picture
locked first); cue-first-assembly and audio-first-beat-pacing leave the audio a choice; casting, angles and
shot sourcing belong to their own subjects.

## Open leads (banked, with return conditions)

- `performer-stem-conditioning` - withdrawn after one render pair (n=1, no seed control; operator picked the
  stem arm on the full clip, tied both close-ups). The instrumental bed was not mouthed with either input; a
  second voice in the mix was, weakly. Full draft and the measurement in
  `librarian/handoffs/2026-10-07-performer-stem-conditioning-draft.md`. Return: second-seed renders of both
  arms with discrimination >= 1.5 on the ad-lib interval, then an operator pick.
- Audio reference as video-with-black-picture vs audio-only (source claim, one engine). Return: a render pair
  on a local model exposing both slots.
- Render-unverified generator instructions in techniques 4-6 (handles generated against the master's audio;
  identical conditioning audio per setup; re-framing at brief time). Return: the first fleet project that
  generates performance video.
- No fleet project generates performance video; gravitone is on the visualizer rung with no section map.
  Return: when one does, apply track-map and segment-on-the-master-clock there first.

## Note on landing

A sibling committed and pushed this subject as found (`a9c6b31e`, 2026-10-06) while its render-bound
technique was still awaiting the verdict; the intake run's own commit removed that technique.
