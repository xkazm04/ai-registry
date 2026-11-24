# Medium package: The retry that ate the recovery

Nothing in this package has been sent anywhere. It is pasted by hand.

The figure PNGs live in the article run's `medium/figures/` (gravitone `foundry-out/articles/<runId>/`). The registry copy of this package carries no PNGs, because the registry is text-only; there, render them from `../figures/*.svg`.

1. Open `story.html` in a browser (it has no scripts and needs no network).
2. Select everything in the page and copy it.
3. In Medium, start a new story and paste. The title and subtitle land as the first two lines; check that Medium styled them as Title and Subtitle.
4. A paste cannot upload local image files. Where a figure belongs, drag in its PNG from `figures/` in this order, and check its caption from `story.html` sits under it. Medium has no table element, so a table pastes as text: replace each with its picture, `table-NN.png` (in the run only; the registry copy has the table as text):
   - `figures/01-opening-timeline.png`
   - `figures/02-sustaining-effect.png`
   - `figures/03-classification-gate.png`
   - `figures/table-01.png`
   - `figures/04-jitter-ladders.png`
   - `figures/table-02.png`
   - `figures/05-amplification-funnel.png`
   - `figures/table-03.png`
   - `figures/table-04.png`
   - `figures/06-breaker-states.png`
   - `figures/table-05.png`
   - `figures/07-ejection-decay.png`
   - `figures/table-06.png`
   - `figures/08-crashloop-ladder.png`
   - `figures/table-07.png`
   - `figures/table-08.png`
5. Code blocks: Medium keeps the block but not its colours. Leave them as plain code blocks.
6. Before publishing, add the tags from `tags.txt` (Medium accepts at most five).
7. Check every numbered citation `[n]` still sits next to its claim and that the Sources list survived as a numbered list.
