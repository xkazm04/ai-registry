"""Style contract: measure what made a winner look the way it did, then hold a port to it.

    python style-contract.py capture <url-or-file> <roles.json> <out.json> [--width 1440x900]
    python style-contract.py check   <url-or-file> <roles.json> <contract.json> [--width 1440x900]

The promotion step of /contest (references/promotion.md). A ROLE is a named part of the design ("reading prose", "page surface", "section title") with one
CSS selector per page, because the winner and the port use different markup for the same role.
roles.json:

    { "roles": { "prose": { "winner": ".prose p",    "port": "[data-role=doc-prose] p" },
                 "title": { "winner": ".page-title", "port": "[data-role=doc-title]" },
                 "band":  { "winner": ".band-t",     "port": "[data-role=doc-band-title]", "position": true } } }

"accept": ["fontSize", "color"] records properties the OWNER changed on purpose after choosing
the winner: they are reported as accepted on every run instead of failing, so the contract stays the
winner and the review that departed from it stays visible. Never use it for a drift nobody approved.

"position": true adds a probe for where the element sits inside its parent (0 top, 0.5 centred,
1 bottom). Opt-in, because a position only means something when both parents are the same box.

capture records, for every role on the winner, the computed properties a reader actually sees:
type (size, weight, line-height, tracking, case, family, colour), surface (background, border,
radius, shadow, padding) and measure (rendered width). check renders the port, measures the same
roles, and prints every property that moved beyond a tolerance, as a table.

WHY THIS EXISTS: a contest winner is chosen from PIXELS, and a port is written from MEMORY of
them. On the first promotion measured with this, every one of the three properties the owner
named as the reason for choosing the winner (the page surface, the type, the width) was gone,
the author colours were swapped, and tsc, eslint, 24 tests, the census and a production build
were all green. None of those gates looks at a computed style. This one does, and nothing else
in the pipeline does.
"""

import argparse
import json
import sys
from pathlib import Path

PROPS = [
    "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "fontFamily", "color",
    "backgroundColor", "backgroundImage", "borderTopWidth", "borderLeftWidth", "borderLeftColor",
    "borderTopLeftRadius", "borderTopRightRadius", "boxShadow",
    "paddingTop", "paddingLeft", "paddingRight", "maxWidth",
]

MEASURE_JS = """(args) => {
  const out = {};
  for (const [role, sel] of Object.entries(args.roles)) {
    const el = sel ? document.querySelector(sel) : null;
    if (!el) { out[role] = null; continue; }
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const pr = el.parentElement ? el.parentElement.getBoundingClientRect() : r;
    // Where the element sits inside its parent, as a fraction of the parent's
    // height: 0 = top, 0.5 = centred, 1 = bottom. Catches a label moved from
    // the middle of its box to the bottom, which no computed style records.
    const slack = pr.height - r.height;
    const v = { width: Math.round(r.width), selector: sel,
                vpos: slack > 4 ? Math.round(((r.top - pr.top) / slack) * 100) / 100 : null };
    for (const p of args.props) v[p] = cs[p];
    out[role] = v;
  }
  return out;
}"""


def px(v):
    try:
        return float(str(v).replace("px", ""))
    except (TypeError, ValueError):
        return None


def differs(prop, a, b):
    """Tolerances are per-kind: a length may move 1px, a width 4%; anything else must match."""
    if a == b:
        return False
    if prop == "vpos":
        return a is not None and b is not None and abs(float(a) - float(b)) > 0.15
    if prop == "width":
        fa, fb = px(a), px(b)
        return fa is None or fb is None or abs(fa - fb) > max(8, 0.04 * fa)
    fa, fb = px(a), px(b)
    if fa is not None and fb is not None:
        # 9999px and rounded-full's 3.35e7px both render fully round
        if 'Radius' in prop and fa >= 999 and fb >= 999:
            return False
        return abs(fa - fb) > 1.0
    if prop == "fontFamily":
        first = lambda s: str(s).split(",")[0].strip().strip("\"'").lower()
        return first(a) != first(b)
    if prop in ("backgroundImage", "boxShadow"):
        # presence matters more than exact gradient stops: a flat port of a shadowed page is the defect
        return (str(a) == "none") != (str(b) == "none")
    return True


def drive(pg, steps):
    """Named interactions before measuring: click:<selector>, press:<key>, wait:<ms>. A role that
    only exists after an interaction (a layer a row opens) is captured through the same steps on
    both sides, so the contract compares like with like."""
    for step in steps or []:
        kind, _, arg = step.partition(":")
        if kind == "click":
            pg.click(arg)
        elif kind == "press":
            pg.keyboard.press(arg)
        elif kind == "wait":
            pg.wait_for_timeout(int(arg))
        else:
            raise SystemExit(f"unknown drive step: {step}")
        pg.wait_for_timeout(200)


def measure(target, roles_for_page, width, steps=None):
    from playwright.sync_api import sync_playwright
    w, h = (int(x) for x in width.split("x"))
    url = target if target.startswith(("http://", "https://")) else Path(target).resolve().as_uri()
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": w, "height": h})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        pg.goto(url, wait_until="networkidle")
        pg.wait_for_timeout(2500)
        drive(pg, steps)
        data = pg.evaluate(MEASURE_JS, {"roles": roles_for_page, "props": PROPS})
        b.close()
    return data, errs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["capture", "check"])
    ap.add_argument("target")
    ap.add_argument("roles")
    ap.add_argument("contract")
    ap.add_argument("--width", default="1440x900")
    ap.add_argument("--drive", action="append", default=[], help="click:<selector> | press:<key> | wait:<ms>; repeatable, run in order before measuring")
    a = ap.parse_args()

    spec = json.loads(Path(a.roles).read_text(encoding="utf-8"))["roles"]
    side = "winner" if a.mode == "capture" else "port"
    wanted = {k: v.get(side) for k, v in spec.items()}
    if a.mode == "check":
        # a role the contract holds but roles.json dropped is still owed: ask for it as absent
        for role in json.loads(Path(a.contract).read_text(encoding="utf-8")):
            wanted.setdefault(role, None)
    data, errs = measure(a.target, wanted, a.width, a.drive)
    if errs:
        print("PAGE ERRORS:", errs)

    if a.mode == "capture":
        Path(a.contract).write_text(json.dumps(data, indent=2), encoding="utf-8")
        missing = [k for k, v in data.items() if v is None]
        print(f"captured {len(data) - len(missing)} role(s) -> {a.contract}")
        if missing:
            print("  NOT FOUND on the winner (fix the selector):", ", ".join(missing))
        return

    contract = json.loads(Path(a.contract).read_text(encoding="utf-8"))
    rows, missing, accepted = [], [], []
    for role, want in contract.items():
        if want is None:
            continue
        got = data.get(role)
        if got is None:
            missing.append(role)
            continue
        # vpos is opt-in per role: a position inside the parent only means
        # something when the two parents are the same kind of box.
        probe = ["width", "vpos"] if spec.get(role, {}).get("position") else ["width"]
        accepted_here = set(spec.get(role, {}).get("accept", []))
        for prop in probe + PROPS:
            if differs(prop, want.get(prop), got.get(prop)):
                if prop in accepted_here:
                    accepted.append((role, prop, want.get(prop), got.get(prop)))
                else:
                    rows.append((role, prop, want.get(prop), got.get(prop)))

    for role in missing:
        print(f"  MISSING  {role}: the port renders nothing at {spec.get(role, {}).get('port')!r}")
    if rows:
        print(f"{'role':<14} {'property':<20} {'winner':<34} port")
        for role, prop, w, g in rows:
            print(f"{role:<14} {prop:<20} {str(w)[:33]:<34} {str(g)[:60]}")
    # An owner-approved departure is listed on every run, never hidden: the
    # contract stays the winner, and the review that moved it stays visible.
    for role, prop, w, g in accepted:
        print(f"  accepted by the owner  {role}.{prop}: winner {str(w)[:24]} -> port {str(g)[:40]}")
    drift = len(rows) + len(missing)
    print(f"\n{drift} deviation(s) from the winner's contract across {len(contract)} role(s)")
    sys.exit(1 if drift else 0)


if __name__ == "__main__":
    main()
