"""Screenshot the winner and the port at one viewport: on load, and after clicking one row.

    python side-by-side.py <winner-url-or-file> <port-url> <out-dir>
        [--width 1440x900] [--row-winner ".prose [data-block]"] [--row-port "[data-role=doc-block]"]
        [--nth 2] [--winner-key e]

The promotion step of /contest (references/promotion.md). style-contract.py proves the numbers;
these frames are for what a number misses. Both are taken in one Chromium at one size, so the only
difference left is the design. --winner-key presses a key after the winner's click, for a winner
that moves a mark on click and opens the caret on a key.
"""
import argparse
from pathlib import Path


def url(t):
    return t if t.startswith(("http://", "https://")) else Path(t).resolve().as_uri()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("winner"); ap.add_argument("port"); ap.add_argument("out")
    ap.add_argument("--width", default="1440x900")
    ap.add_argument("--row-winner", default=".prose [data-block]")
    ap.add_argument("--row-port", default="[data-role=doc-block]")
    ap.add_argument("--nth", type=int, default=2)
    ap.add_argument("--winner-key", default="")
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright

    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    w, h = (int(x) for x in a.width.split("x"))
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, target, row, key in (("winner", a.winner, a.row_winner, a.winner_key), ("port", a.port, a.row_port, "")):
            pg = b.new_page(viewport={"width": w, "height": h})
            errs = []
            pg.on("pageerror", lambda e, errs=errs: errs.append(str(e)[:160]))
            pg.goto(url(target), wait_until="networkidle")
            pg.wait_for_timeout(1800)
            pg.screenshot(path=str(out / f"{name}-1-load.png"))
            rows = pg.locator(row)
            if rows.count() > a.nth:
                rows.nth(a.nth).click()
                if key:
                    pg.keyboard.press(key)
                pg.wait_for_timeout(700)
                pg.screenshot(path=str(out / f"{name}-2-row-click.png"))
            print(name, "page errors:", errs or "none")
            pg.close()
        b.close()
    print("frames in", out)


if __name__ == "__main__":
    main()
