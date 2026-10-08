# Medium package: The answer was in the folder: what plain code can verify about an agent run, and what it cannot

Nothing in this package has been sent anywhere. It is pasted by hand.

The figure PNGs live in the article run's `medium/figures/` (gravitone `foundry-out/articles/<runId>/`). The registry copy of this package carries no PNGs, because the registry is text-only; there, render them from `../figures/*.svg`.

1. Open `story.html` in a browser (it has no scripts and needs no network).
2. Select everything in the page and copy it.
3. In Medium, start a new story and paste. The title and subtitle land as the first two lines; check that Medium styled them as Title and Subtitle.
4. A paste cannot upload local image files. Where a figure belongs, drag in its PNG from `figures/` in order, and check its caption from `story.html` sits under it:
   - `figures/01-harness-flaw-timeline.png`
   - `figures/02-facts-judgement-split.png`
   - `figures/03-baseline-set-comparison.png`
   - `figures/04-monitor-recall-by-scale.png`
   - `figures/05-detector-vs-judge.png`
   - `figures/06-post-turn-check-pipeline.png`
   - `figures/07-harness-hardening-before-after.png`
5. Code blocks: Medium keeps the block but not its colours. Leave them as plain code blocks.
6. Before publishing, add the tags from `tags.txt` (Medium accepts at most five).
7. Check every numbered citation `[n]` still sits next to its claim and that the Sources list survived as a numbered list.
