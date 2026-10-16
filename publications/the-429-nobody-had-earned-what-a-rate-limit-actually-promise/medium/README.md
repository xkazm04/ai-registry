# Medium package: The 429 nobody had earned: what a rate limit actually promises

Nothing in this package has been sent anywhere. It is pasted by hand.

The figure PNGs live in the article run's `medium/figures/` (gravitone `foundry-out/articles/<runId>/`). The registry copy of this package carries no PNGs, because the registry is text-only; there, render them from `../figures/*.svg`.

1. Open `story.html` in a browser (it has no scripts and needs no network).
2. Select everything in the page and copy it.
3. In Medium, start a new story and paste. The title and subtitle land as the first two lines; check that Medium styled them as Title and Subtitle.
4. A paste cannot upload local image files. Where a figure belongs, drag in its PNG from `figures/` in this order, and check its caption from `story.html` sits under it. Medium has no table element, so a table pastes as text: replace each with its picture, `table-NN.png` (in the run only; the registry copy has the table as text):
   - `figures/01-clerk-timeline.png`
   - `figures/02-one-code-five-refusals.png`
   - `figures/03-refusal-anatomy.png`
   - `figures/table-01.png`
   - `figures/04-key-ladder.png`
   - `figures/05-ipv4-collapse.png`
   - `figures/06-metered-step.png`
   - `figures/table-02.png`
   - `figures/07-one-number-many-counters.png`
   - `figures/table-03.png`
   - `figures/08-storm-loop.png`
   - `figures/table-04.png`
   - `figures/table-05.png`
5. Code blocks: Medium keeps the block but not its colours. Leave them as plain code blocks.
6. Before publishing, add the tags from `tags.txt` (Medium accepts at most five).
7. Check every numbered citation `[n]` still sits next to its claim and that the Sources list survived as a numbered list.
