---
subject: channel-native-social-and-repurposing
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-channel-confirms-1022 (apply)
dry_streak: 0
---

# channel-native-social-and-repurposing

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `content-production`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** turning one article into posts for several networks and a newsletter issue, writing a social-post prompt or its validator, deciding how often a channel may be posted to and where that cap is enforced, choosing what past performance may ground a new post, deciding when a scheduled post may be shown as published

**Techniques (6):** cadence-caps-at-one-chokepoint, ground-in-measured-top-posts, hook-value-cta-triad, per-network-register-and-limits, retell-not-copy-with-source-digest, the-channel-confirms-the-app-promises.

**Applications (6; stacks: node):** node--cadence-caps-at-one-chokepoint, node--ground-in-measured-top-posts, node--hook-value-cta-triad, node--per-network-register-and-limits, node--retell-not-copy-with-source-digest, node--the-channel-confirms-the-app-promises.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- No `librarian/applied.md` row yet except where the source note says so; the
  unapplied backlog is every technique here without a row.

## 2026-10-22 - apply run `intake-apply-channel-confirms-1022`

- First application of `the-channel-confirms-the-app-promises`, against the tree it was
  forged from (node, `code`, `better`, ab-paired). The board's own rules all held. The
  seam was around them: the merged publishing calendar read the stored
  snapshot unreconciled and listed a handover twice, so a cap of 2 counted one promise
  as 2. The board page withdrew links off a failed or capped social read, and the
  cleanup persisted that.
- Two decision rules were appended (reconcile at every reader and count a handover once;
  absence is unknown on a failed or limit-full read). The rule the technique already
  stated held.
- Applications now 6. The single-stack point is not addressable by apply: the only other
  marketing-domain tree has no post board and no code.

## 2026-10-31 - architecture review (subject-review worker)

First architecture-review record. Structure holds across all six techniques; the external
claims that move are the fold length (observed, not documented), the short-video ceiling
(2,200 through the posting API), and the cadence evidence, where a within-account study
points the other way from the platform-wide aggregate the subject cites.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/channel-native-social-and-repurposing",
  "date": "2026-10-31",
  "baseline": "a4f4f6bbf",
  "digest": "sha256-b2:1304833edd33b9fe",
  "coverage": "All 13 documents read in full (golden path, 6 techniques, 6 node applications). Primary-source checks on the fold length, per-network ceilings and the cadence evidence; consumer-tree code citations in applications not re-executed or re-read, original verified_on dates unchanged.",
  "counterexamples": [
    "Within one account, a vendor's fixed-effects study found reach per post rising with weekly frequency; a cap justified only by the platform-wide decline over-claims.",
    "A short-video caption posted through the platform's posting API is capped at 2,200 even though the in-app composer accepts several thousand; a per-network ceiling copied from the composer is rejected at send time.",
    "A LinkedIn fold of about 140 characters on desktop and more on mobile is observed, not documented; a validator or hook rule that treats it as a platform fact breaks on a redesign."
  ],
  "sources": [
    {
      "url": "https://www.hootsuite.com/social-media-tools/social-media-caption-preview",
      "result": "Quoted: \"Instagram doesn't publish an official 'see more' threshold\"; LinkedIn \"roughly 140 characters before '...see more' on desktop\"; TikTok preview \"cuts around 100 characters\"; all called approximations that change with redesigns. Supports the hook technique's convention label; refutes the golden path's 'a fact of the platform's own rendering rather than a convention'."
    },
    {
      "url": "https://developers.tiktok.com/doc/content-posting-api-reference-direct-post",
      "result": "Quoted: caption/title \"The maximum length is 2200 in UTF-16 runes.\" The short-video ceiling an integration meets is 2,200, not the several thousand the in-app composer allows; a ceiling depends on the posting path, not only on the account tier."
    },
    {
      "url": "https://support.buffer.com/article/588-character-limits-for-each-social-network",
      "result": "Scheduler's limits: TikTok 2,200; Instagram 2,200; LinkedIn 3,000; Facebook 5,000; X Free 280, X Basic/Premium 25,000. Corroborates tier-dependent microblog ceiling and the API-path TikTok figure."
    },
    {
      "url": "https://metricool.com/press-release-2026-social-media-study/",
      "result": "Dataset corroborated (1,059,949 accounts, 39,762,999 posts); public release quotes only 'LinkedIn saw a 23% decrease in impressions and a 14% decline in interactions' and 'Increased posting frequency brought increased competition', unlabelled as per-post. 'Volume nearly doubled' and the short-video '+a fifth / -a third' figures were not reachable (full study gated): reverify."
    },
    {
      "url": "https://buffer.com/resources/how-often-to-post-on-linkedin/",
      "result": "Counter-evidence: 2M+ posts, 94,000+ accounts, fixed-effects within account: 'The more often you post, the further each post travels' (+1,182 impressions/post at 2-5 a week vs once). Refutes the golden path's 'the strategy the measured data most consistently punishes'; platform-wide aggregate decline and within-account frequency effects are different questions."
    }
  ],
  "trigger": "pending: no prior architecture-review record",
  "intended_benefit": "One shared register-and-limit table, a single cadence chokepoint, measured-only grounding and channel-confirmed 'published' keep generated posts and their counts honest.",
  "failure_if_ignored": "Posts that pass validation but lose the reader, caps displayed and unenforced, zeros taught to the model as failures, and publish counts that include promises.",
  "boundary": "Shaping and governing posts derived from approved content; not voice, not anti-fabrication generally, not channel choice, not report interpretation.",
  "disposition": "clarify",
  "documents": {
    "channel-native-social-and-repurposing.md": {
      "disposition": "clarify",
      "reason": "Fold length is called 'a fact of the platform's own rendering rather than a convention' while the hook technique labels the same figure convention; Hootsuite says no platform publishes it. 'A tenth' of a 2,000-3,000 ceiling is wrong arithmetic for a 100-150 fold (about a twentieth). Short-video ceiling ignores the 2,200 API limit. 'Frequency as growth ... the measured data most consistently punishes' over-claims against Buffer's within-account study; cadence figures from the vendor study partly unconfirmable (reverify owed)."
    },
    "techniques/cadence-caps-at-one-chokepoint.md": {
      "disposition": "clarify",
      "reason": "Structure sound. Evidence paragraph should carry the within-account counter-evidence and stop implying the platform-wide decline proves a per-account ceiling; exact 'nearly doubled'/'+a fifth'/'-a third' figures unreachable in the public release (reverify)."
    },
    "techniques/ground-in-measured-top-posts.md": {
      "disposition": "keep",
      "reason": "Snapshot, absence and pinned-not-derived rules are structural and internally consistent; numbers labelled convention; engagement-rate denominator caveat is accurate."
    },
    "techniques/hook-value-cta-triad.md": {
      "disposition": "keep",
      "reason": "Already labels the fold as convention, consistent with the opened source; measured-pair claim matches its application."
    },
    "techniques/per-network-register-and-limits.md": {
      "disposition": "clarify",
      "reason": "Short-video 'several thousand' is the in-app figure; the posting API caps at 2,200 (TikTok developer docs), so a ceiling is a contract per account and per posting path. Fold figure should be marked observed, not documented."
    },
    "techniques/retell-not-copy-with-source-digest.md": {
      "disposition": "keep",
      "reason": "Head/tail digest and system-owned link are structural; ratio labelled convention; no unstable external claim."
    },
    "techniques/the-channel-confirms-the-app-promises.md": {
      "disposition": "keep",
      "reason": "Five-state vocabulary, leased claim and the 2026-10-22 reconciliation rules are consistent with the application's paired evidence."
    },
    "applications/node--cadence-caps-at-one-chokepoint.md": {
      "disposition": "keep",
      "reason": "Code-cited realisation with honest deviations (publish-now branch unchecked, anonymous override actor); not re-read this run."
    },
    "applications/node--ground-in-measured-top-posts.md": {
      "disposition": "keep",
      "reason": "Documents the pinned-zero gap and raw-reach ranking as the technique predicts; deviations disclosed."
    },
    "applications/node--hook-value-cta-triad.md": {
      "disposition": "clarify",
      "reason": "'One reader scored 16 posts per arm' contradicts the design (2 articles x 2 reps x 2 variants = 8 per arm), the table ('of 8') and the limits ('n is eight posts per arm'): 16 posts in total, eight per arm."
    },
    "applications/node--per-network-register-and-limits.md": {
      "disposition": "clarify",
      "reason": "Deviation says limits are below the documented ceiling for the short-video feed; the posting API's documented ceiling is 2,200, which the tree's 2,200 matches - only the conversational network is a deliberate floor."
    },
    "applications/node--retell-not-copy-with-source-digest.md": {
      "disposition": "keep",
      "reason": "Paired guard with stated limits; the sibling-tool return condition is recorded."
    },
    "applications/node--the-channel-confirms-the-app-promises.md": {
      "disposition": "keep",
      "reason": "ab-paired change with floor and stated non-measurements; the source of the two appended decision rules."
    }
  }
}
```

Second record, after applying the clarify items above. The vendor study's exact per-post
figures stay owed: the public release does not carry them.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/channel-native-social-and-repurposing",
  "date": "2026-10-31",
  "baseline": "a4f4f6bbf",
  "digest": "sha256-b2:de728864b80dd40f",
  "coverage": "All 13 documents read in full (golden path, 6 techniques, 6 node applications). Primary-source checks on the fold length, per-network ceilings and the cadence evidence; consumer-tree code citations in applications not re-executed or re-read, original verified_on dates unchanged.",
  "counterexamples": [
    "Within one account, a vendor's fixed-effects study found reach per post rising with weekly frequency; a cap justified only by the platform-wide decline over-claims.",
    "A short-video caption posted through the platform's posting API is capped at 2,200 even though the in-app composer accepts several thousand; a per-network ceiling copied from the composer is rejected at send time.",
    "A LinkedIn fold of about 140 characters on desktop and more on mobile is observed, not documented; a validator or hook rule that treats it as a platform fact breaks on a redesign."
  ],
  "sources": [
    {
      "url": "https://www.hootsuite.com/social-media-tools/social-media-caption-preview",
      "result": "Quoted: \"Instagram doesn't publish an official 'see more' threshold\"; LinkedIn \"roughly 140 characters before '...see more' on desktop\"; TikTok preview \"cuts around 100 characters\"; all called approximations that change with redesigns. Supports the hook technique's convention label; refutes the golden path's 'a fact of the platform's own rendering rather than a convention'."
    },
    {
      "url": "https://developers.tiktok.com/doc/content-posting-api-reference-direct-post",
      "result": "Quoted: caption/title \"The maximum length is 2200 in UTF-16 runes.\" The short-video ceiling an integration meets is 2,200, not the several thousand the in-app composer allows; a ceiling depends on the posting path, not only on the account tier."
    },
    {
      "url": "https://support.buffer.com/article/588-character-limits-for-each-social-network",
      "result": "Scheduler's limits: TikTok 2,200; Instagram 2,200; LinkedIn 3,000; Facebook 5,000; X Free 280, X Basic/Premium 25,000. Corroborates tier-dependent microblog ceiling and the API-path TikTok figure."
    },
    {
      "url": "https://metricool.com/press-release-2026-social-media-study/",
      "result": "Dataset corroborated (1,059,949 accounts, 39,762,999 posts); public release quotes only 'LinkedIn saw a 23% decrease in impressions and a 14% decline in interactions' and 'Increased posting frequency brought increased competition', unlabelled as per-post. 'Volume nearly doubled' and the short-video '+a fifth / -a third' figures were not reachable (full study gated): reverify."
    },
    {
      "url": "https://buffer.com/resources/how-often-to-post-on-linkedin/",
      "result": "Counter-evidence: 2M+ posts, 94,000+ accounts, fixed-effects within account: 'The more often you post, the further each post travels' (+1,182 impressions/post at 2-5 a week vs once). Refutes the golden path's 'the strategy the measured data most consistently punishes'; platform-wide aggregate decline and within-account frequency effects are different questions."
    }
  ],
  "trigger": "re-record after applying this run's clarify items",
  "intended_benefit": "One shared register-and-limit table, a single cadence chokepoint, measured-only grounding and channel-confirmed 'published' keep generated posts and their counts honest.",
  "failure_if_ignored": "Posts that pass validation but lose the reader, caps displayed and unenforced, zeros taught to the model as failures, and publish counts that include promises.",
  "boundary": "Shaping and governing posts derived from approved content; not voice, not anti-fabrication generally, not channel choice, not report interpretation.",
  "disposition": "reverify",
  "documents": {
    "channel-native-social-and-repurposing.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: fold described as observed and undocumented, consistent with hook technique; 'a tenth' -> 'a twentieth or less'; short-video ceiling split into in-app vs posting-API 2,200; 'most consistently punishes' replaced with platform-wide vs within-account distinction and Buffer counter-evidence. Still owed: the vendor study's 'volume nearly doubled / impressions per post about a quarter' figures need the gated full study."
    },
    "techniques/cadence-caps-at-one-chokepoint.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: within-account counter-evidence added and the aggregate decline framed as competition, not a per-account ceiling; 'the measured evidence says the ceiling is the safer side' softened. Still owed: the short-video '+a fifth / -a third' and LinkedIn 'nearly doubled' figures (the public release reports only -23% impressions, -14% interactions, and a 17% decrease in average TikTok videos, unit unstated)."
    },
    "techniques/ground-in-measured-top-posts.md": {
      "disposition": "keep",
      "reason": "Snapshot, absence and pinned-not-derived rules are structural and internally consistent; numbers labelled convention."
    },
    "techniques/hook-value-cta-triad.md": {
      "disposition": "keep",
      "reason": "Already labels the fold as convention, consistent with the opened source."
    },
    "techniques/per-network-register-and-limits.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: short-video ceiling distinguished as in-app several thousand vs 2,200 through the posting API; 'a contract per account' -> 'per account and per posting path'; fold marked observed rather than documented."
    },
    "techniques/retell-not-copy-with-source-digest.md": {
      "disposition": "keep",
      "reason": "Head/tail digest and system-owned link are structural; ratio labelled convention."
    },
    "techniques/the-channel-confirms-the-app-promises.md": {
      "disposition": "keep",
      "reason": "Five-state vocabulary, leased claim and reconciliation rules consistent with paired evidence."
    },
    "applications/node--cadence-caps-at-one-chokepoint.md": {
      "disposition": "keep",
      "reason": "Code-cited realisation with honest deviations; not re-read this run."
    },
    "applications/node--ground-in-measured-top-posts.md": {
      "disposition": "keep",
      "reason": "Pinned-zero gap and raw-reach ranking disclosed."
    },
    "applications/node--hook-value-cta-triad.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'scored 16 posts per arm' -> 'scored 16 posts, eight per arm' (internal arithmetic); verified_on unchanged."
    },
    "applications/node--per-network-register-and-limits.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: short-video deviation corrected: 2,200 matches the posting API's documented ceiling; only the conversational network remains a deliberate, unlabelled floor; verified_on unchanged (code citations not re-read)."
    },
    "applications/node--retell-not-copy-with-source-digest.md": {
      "disposition": "keep",
      "reason": "Paired guard with stated limits."
    },
    "applications/node--the-channel-confirms-the-app-promises.md": {
      "disposition": "keep",
      "reason": "ab-paired change with floor and stated non-measurements."
    }
  }
}
```
