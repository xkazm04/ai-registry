"""Headless visual pass over the blinded entries - the host's eyes when no browser tool is attached.

    python visual-pass.py <contest-dir> [--widths 1280x800,1920x1080] [--settle 3] [--click-text <label>]

For every `judging/entries/<letter>/variant-<n>/index.html` it opens the page from disk at each
width, waits for it to settle, screenshots the load state, then performs the same neutral probe
on every variant (move to the centre, one zoom-out wheel tick, one click, Escape, type a query
into the first text input if there is one) and screenshots again. Page errors, console errors,
failed requests and a few structural counts go to `runs/visual/report.json` - outside `judging/`,
so a judge working in that directory cannot read the host's screenshots. The images are
what the host then looks at and scores; this script scores nothing.

Needs Playwright for Python with a Chromium build (`pip install playwright && playwright install
chromium`). It is an optional instrument: the method runs without it, with the owner's own eyes.
"""

import argparse
import json
import sys
import time
from pathlib import Path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("contest_dir")
    ap.add_argument("--widths", default="1280x800,1920x1080")
    ap.add_argument("--settle", type=float, default=3.0, help="seconds to wait after load before the first shot")
    ap.add_argument("--query", default="canvas", help="what to type into the first text input, if any")
    ap.add_argument("--click-text", default="", help="a label to click for a descent screenshot, e.g. a domain name")
    a = ap.parse_args()
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("playwright for Python is not installed - pip install playwright && playwright install chromium")

    root = Path(a.contest_dir).resolve()
    entries = root / "judging" / "entries"
    if not entries.exists():
        sys.exit(f"{entries} missing - run collect first")
    out = root / "runs" / "visual"  # outside judging/: judges must never see the host's eyes
    out.mkdir(parents=True, exist_ok=True)
    sizes = [tuple(int(x) for x in w.split("x")) for w in a.widths.split(",")]
    report = {}

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for index in sorted(entries.glob("*/variant-*/index.html")):
            letter, variant = index.parent.parent.name, index.parent.name.split("-")[1]
            key = f"{letter}/{variant}"
            report[key] = {}
            for (w, h) in sizes:
                page = browser.new_page(viewport={"width": w, "height": h})
                page.set_default_timeout(20000)
                errors, console, failed = [], [], []
                page.on("pageerror", lambda e, errors=errors: errors.append(str(e)[:300]))
                page.on("console", lambda m, console=console: console.append(m.text[:300]) if m.type == "error" else None)
                page.on("requestfailed", lambda r, failed=failed: failed.append(r.url[:200]))
                t0 = time.time()
                try:
                    try:
                        page.goto(index.as_uri(), wait_until="load")
                    except Exception:
                        # One slow load under host contention is not a broken variant; a second is.
                        page.set_default_timeout(60000)
                        page.goto(index.as_uri(), wait_until="load")
                    load_s = round(time.time() - t0, 2)
                    page.wait_for_timeout(a.settle * 1000)
                    tag = f"{letter}-{variant}-{w}x{h}"
                    page.screenshot(path=str(out / f"{tag}-load.png"))
                    counts = page.evaluate("""() => ({
                        text: document.body.innerText.length,
                        canvas: document.querySelectorAll('canvas').length,
                        svg_nodes: document.querySelectorAll('svg *').length,
                        inputs: document.querySelectorAll('input[type=text],input[type=search],input:not([type])').length,
                        buttons: document.querySelectorAll('button,[role=button]').length,
                        title: document.title })""")
                    # A frame looks fine at 11 px; reading it for a minute does not. Measure the type the
                    # user must read: smallest rendered size, and the share of visible characters under
                    # 12 px. DOM and SVG text only - text painted on a canvas cannot be measured here.
                    counts["type"] = page.evaluate("""() => {
                        let min = null, small = 0, total = 0; const sizes = {};
                        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                            const t = n.textContent.trim(); const el = n.parentElement;
                            if (!t || !el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
                            const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
                            if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
                            if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
                            let px = parseFloat(cs.fontSize);
                            const m = el.getScreenCTM ? el.getScreenCTM() : null;   // SVG text scales with the viewBox
                            if (m && el.namespaceURI === 'http://www.w3.org/2000/svg') px *= Math.hypot(m.a, m.b);
                            px = Math.round(px * 10) / 10;
                            total += t.length; if (px < 12) small += t.length;
                            min = min === null ? px : Math.min(min, px);
                            const k = String(Math.round(px)); sizes[k] = (sizes[k] || 0) + t.length;
                        }
                        return { min_px: min, chars: total, share_under_12px: total ? Math.round(small / total * 100) / 100 : 0, by_px: sizes };
                    }""")
                    # The same neutral probe for everyone, so what it reveals is comparable.
                    page.mouse.move(w / 2, h / 2)
                    page.wait_for_timeout(400)
                    page.mouse.wheel(0, -300)
                    page.wait_for_timeout(600)
                    page.mouse.click(w / 2, h / 2)
                    page.wait_for_timeout(a.settle * 500)
                    page.screenshot(path=str(out / f"{tag}-probe.png"))
                    page.keyboard.press("Escape")
                    # A centre click often lands on empty canvas; a click on a named node shows the descent.
                    if a.click_text:
                        try:
                            page.get_by_text(a.click_text, exact=False).first.click(timeout=3000)
                            page.wait_for_timeout(a.settle * 500)
                            page.screenshot(path=str(out / f"{tag}-descend.png"))
                        except Exception:
                            console.append(f"descend probe skipped: no clickable text '{a.click_text}' (canvas-drawn labels are not findable)")
                    typed = False
                    if counts["inputs"]:
                        try:
                            page.locator("input[type=text],input[type=search],input:not([type])").first.fill(a.query)
                            page.wait_for_timeout(a.settle * 400)
                            page.screenshot(path=str(out / f"{tag}-search.png"))
                            typed = True
                        except Exception as e:  # a hidden input is not a failure of the variant
                            console.append(f"search probe skipped: {str(e)[:120]}")
                    report[key][f"{w}x{h}"] = {"load_s": load_s, "errors": errors, "console_errors": console[:10],
                                              "failed_requests": failed[:10], "counts": counts, "searched": typed}
                except Exception as e:
                    report[key][f"{w}x{h}"] = {"broken": str(e)[:300], "errors": errors, "console_errors": console[:10]}
                finally:
                    page.close()
            status = "; ".join(
                f"{s}: BROKEN {v['broken']}" if "broken" in v else
                f"{s}: {len(v['errors'])} err, min type {v['counts']['type']['min_px']} px, "
                f"{int(v['counts']['type']['share_under_12px'] * 100)}% of visible text under 12 px"
                for s, v in report[key].items())
            print(f"{key}: {status}")
        browser.close()
    (out / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"screenshots and report in {out}")


if __name__ == "__main__":
    main()
