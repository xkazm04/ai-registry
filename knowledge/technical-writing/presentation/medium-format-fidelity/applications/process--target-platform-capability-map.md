---
layer: application
type: application
subject: medium-format-fidelity
technique: target-platform-capability-map
stack: process
status: forged
verified_on: 2026-10-05
---

# Process: a capability map for the Medium story editor

A first capability map for one hosted publishing platform, Medium, compiled on 2026-10-05
from public pages for an article pipeline that ends in a paste-ready package. It has **not**
been tested against a live draft: every row is research, and the first real packaging run
must confirm or correct it in the platform's own preview. The platform's help centre
(help.medium.com) returned HTTP 403 to direct fetches on 2026-10-05, so rows below cite the
help-centre page by URL as listed in search results together with the secondary page that
was actually read.

| Authored element | What the platform does (as researched) | Decision for the package |
|---|---|---|
| Title and headings | Two heading levels in the editor ("large T" and "small T"); the first line can become the title and the line below it the subtitle. Help page: https://help.medium.com/hc/en-us/articles/215194537-Using-the-story-editor (403 on fetch; behaviour as summarized in search results) | Sections at one level; any deeper level becomes a bold lead-in sentence |
| Tables | No native table element. Common workarounds are an image of the table, a code-hosting gist embed, or a third-party table embed (practitioner write-ups, e.g. https://tablesmit.com/blog/how-to-add-table-to-medium-post/, read via search on 2026-10-05) | Designed table exported as an image with a full text alternative and the data linked; no third-party embed by default |
| Code blocks | Native code blocks with built-in syntax highlighting; the language is auto-detected and can be changed from a menu on the block (platform announcement https://medium.com/blog/code-blocks-with-syntax-highlighting-53343df53c4f, 403 on fetch; corroborated by several practitioner posts in search results) | Plain code text in the native block, language selected by hand, never pre-highlighted markup |
| Read time | Computed by the platform at 265 words per minute plus image time of 12 seconds for the first image, one second less for each subsequent one down to a floor of 3 seconds; 500 characters per minute for Chinese, Japanese and Korean (help page https://help.medium.com/hc/en-us/articles/214991667-Read-time, 403 on fetch; figures as quoted in https://www.freecodecamp.org/news/how-to-more-accurately-estimate-read-time-for-medium-articles-in-javascript-fb563ff0282a/, 2019, read 2026-10-05) | The package's preview states its own computed read time, including table text that an image hides from the platform's count |
| Import | "Import a story" takes a URL, backdates the post and adds a canonical link to the original (help page https://help.medium.com/hc/en-us/articles/214550207-Importing-a-post-to-Medium, as summarized in search results) | Prefer import from the published page where one exists; check what the importer drops |
| Inline vector figures | Not supported as inline SVG in the editor (inference: the editor accepts images and embeds; no source found stating SVG support) | Export each figure as a raster image at twice display width, on a background that works in both schemes |
| Captions | Image captions supported | Caption text with source numbers under every image |
| Citations | No footnote element | Bracketed numbers kept in text; the sources list as the last section |

## Rules this map adds to the technique

- **A row that cannot be fetched is labelled with how it was known.** Three of the
  platform's own pages refused a direct fetch on the day and a fourth was not attempted; a map that hid that would present
  search-result summaries as primary reading.
- **The image of a table moves words out of the platform's read-time count.** Its computed
  read time therefore understates a table-heavy post, which is one more reason the article's
  preview carries its own figure.
