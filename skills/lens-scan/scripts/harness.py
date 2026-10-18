#!/usr/bin/env python3
"""lens-scan harness - the generic browser capture behind the overlay's `## Harness` section (SKILL.md "Harness").

    python -I harness.py --root <product root> --run <run id> [--overlay .claude/lens-scan/config.md]
                         [--features a,b] [--lens design] [--port n] [--dry]

Reads the generic `## Harness` form from the overlay:

    command: npm run dev -- --port 4173      # starts the front end (optional when url is already served)
    url: http://localhost:4173
    ready: /                                 # polled until HTTP 200, 120 s cap
    ready_timeout: 300                       # optional: a longer cap for a slow cold start (seconds)
    sizes: 1280x800                          # one or more WxH, comma-separated
    themes: light, dark                      # a label may carry the app's own value: dark=dark-midnight
    theme: media                             # how a theme is set: media (default) | query ?theme= | class dark
                                             #   | storage <key> [<value template with {theme}>]
    storage: personas-cookie-consent essential   # optional, repeatable: a localStorage key and value seeded
                                             #   before the page's scripts (a consent already given, a flag)
    dismiss: "Essential Only"                # optional: visible buttons clicked away before each shot
    full_page: true                          # optional: capture the whole page, not only the viewport
    features:
      <slug>: route /path
      <slug>: steps click "Text" > click "Other"   # Playwright text selectors, from the url's root
      <slug>: unscreenable "native window only"

refuses (exit 1) when the url already answers before the command starts: another server holds the port and the shots
would show its checkout, not this root (pass --port to serve a worktree elsewhere). Otherwise starts the command (cwd = the product root), waits for ready, then per scoped feature, size and theme loads the
feature and captures a PNG into <root>/.ai/lens-scan/shots/<run>/<feature>-<theme>-<size>.png, with a JSON report
beside it (same name, .json: url, size, theme, minTextPx, console errors). A feature marked unscreenable, or one
whose route fails to render (navigation error, HTTP >= 400, blank body), gets no shot and is listed under
`unscreenable` with why. The command's whole process tree is killed at the end, whatever happened.

Prints one JSON object; the skill records it, this script writes no store row:
    shots         [{feature, path (relative to the store dir), size, theme, module: "harness.py", report_file}]
                  -> store.mjs shot --run <run> --feature f --path p --size s --theme t --module harness.py --report-file r
    measurements  [{feature, lens, metric: minTextPx|consoleErrors, value, unit?, method: "harness", evidence}]
                  -> store.mjs measure --run <run> --json <file>   (unit = the lens manifest field's, read from the map)
    unscreenable  [{feature, why}]  -> store.mjs activity --kind note --text "unscreenable: <why>"
minTextPx is the smallest computed font-size of visible text over every capture of the feature; consoleErrors is
the number of distinct console errors and page errors over them. Exit 2 bad input, 1 when the front end never got
ready (nothing captured), else 0. Needs Python Playwright (`pip install playwright && playwright install chromium`).
"""
import argparse
import json
import os
import re
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from urllib.parse import urlencode, urljoin, urlsplit, urlunsplit, parse_qsl

READY_CAP_S = 120
SCROLL_THROUGH = '''async () => {
  const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
  for (let y = 0; y < document.documentElement.scrollHeight && y < 40000; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
}'''
NAV_TIMEOUT_MS = 30000
SETTLE_S = 0.6
MODULE = 'harness.py'

# The smallest rendered text on the page: every visible element that holds its own text. [px, where, elements].
MINFONT = """(() => { let min = Infinity, where = '', n = 0; for (const el of document.body.querySelectorAll('*')) {
  if (el.closest('script, style, noscript, template')) continue; let txt = false;
  for (const c of el.childNodes) if (c.nodeType === 3 && c.textContent.trim()) txt = true; if (!txt) continue;
  const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
  const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; n++;
  const px = parseFloat(cs.fontSize); if (px < min) { min = px; where = el.tagName.toLowerCase() + ' ' + el.textContent.trim().slice(0, 30); } }
  return [n ? Math.round(min * 10) / 10 : null, where, n]; })()"""
BLANK = "(() => !document.body || (!document.body.innerText.trim() && !document.body.querySelector('img, svg, canvas, video, input, button')))()"


class InputError(Exception):
    pass


# ------------------------------------------------------------------------------------------- overlay
def harness_section(text):
    """The body of the overlay's `## Harness` section, or None."""
    m = re.search(r'^## Harness[^\S\n]*\n(.*?)(?=^## |\Z)', text, re.M | re.S)
    return m.group(1) if m else None


def strip_comment(v):
    # a `#` starts a comment only after whitespace, so `?theme=` and `#anchors` in a route survive
    return re.split(r'\s+#\s', ' ' + v, maxsplit=1)[0].strip()


def parse_harness(body):
    """The generic form as a dict: command, url, ready, sizes [(w, h)], themes [..], theme_mode, features {slug: spec}."""
    cfg = {'command': None, 'url': None, 'ready': '/', 'sizes': [(1280, 800)], 'themes': ['light'], 'theme_values': {},
           'theme': 'media', 'storage': [], 'dismiss': [], 'full_page': False, 'ready_timeout': READY_CAP_S, 'features': {}}
    in_features = False
    for raw in body.splitlines():
        line = raw.rstrip()
        if not line.strip() or line.strip().startswith(('#', '```')):
            continue
        indented = line[:1] in (' ', '\t')
        if in_features and indented:
            m = re.match(r'\s+([a-z0-9][a-z0-9.-]*)\s*:\s*(.+)$', line)
            if not m:
                raise InputError(f'## Harness features: cannot read {line.strip()!r}')
            cfg['features'][m.group(1)] = parse_feature(strip_comment(m.group(2)))
            continue
        in_features = False
        m = re.match(r'(\w+)\s*:\s*(.*)$', line.strip())
        if not m:
            continue
        key, val = m.group(1), strip_comment(m.group(2))
        if key == 'features':
            in_features = True
        elif key in ('command', 'url', 'ready'):
            cfg[key] = val or None
        elif key == 'sizes':
            sizes = []
            for s in re.split(r'[,\s]+', val):
                if not s:
                    continue
                sm = re.fullmatch(r'(\d+)x(\d+)', s)
                if not sm:
                    raise InputError(f'## Harness sizes: {s!r} is not WxH')
                sizes.append((int(sm.group(1)), int(sm.group(2))))
            cfg['sizes'] = sizes or cfg['sizes']
        elif key == 'themes':
            labels = []
            for t in re.split(r'[,\s]+', val):
                if not t:
                    continue
                label, _, value = t.partition('=')
                labels.append(label)
                if value:
                    cfg['theme_values'][label] = value
            cfg['themes'] = labels or cfg['themes']
        elif key == 'theme':
            cfg['theme'] = val
        elif key == 'storage':
            k, _, v = val.partition(' ')
            if not k or not v.strip():
                raise InputError(f'## Harness storage: {val!r} is not <localStorage key> <value>')
            cfg['storage'].append((k, v.strip()))
        elif key == 'dismiss':
            cfg['dismiss'] = re.findall(r'"([^"]+)"', val)
            if val and not cfg['dismiss']:
                raise InputError(f'## Harness dismiss: quote each button text, e.g. dismiss: "Accept" (got {val!r})')
        elif key == 'ready_timeout':
            if not re.fullmatch(r'\d+', val) or not 10 <= int(val) <= 1800:
                raise InputError(f'## Harness ready_timeout: {val!r} is not 10..1800 seconds')
            cfg['ready_timeout'] = int(val)
        elif key == 'full_page':
            if val not in ('true', 'false'):
                raise InputError(f'## Harness full_page: {val!r} is not true | false')
            cfg['full_page'] = val == 'true'
    if not cfg['url']:
        raise InputError('## Harness needs url: <base url>')
    tm = cfg['theme']
    if not (tm == 'media' or re.fullmatch(r'query \??[A-Za-z0-9_-]+=?', tm) or re.fullmatch(r'class [A-Za-z0-9_-]+', tm)
            or re.fullmatch(r'storage [A-Za-z0-9_.:-]+( .*\{theme\}.*)?', tm)):
        raise InputError(f'## Harness theme: {tm!r} is not media | query ?<param>= | class <name> | storage <localStorage key> [<template with {{theme}}>]')
    return cfg


def parse_feature(spec):
    """`route /path` | `steps click "A" > click "B"` (optionally starting with `goto /path`) | `unscreenable "why"`."""
    if spec.startswith('route '):
        return {'kind': 'route', 'route': spec[6:].strip()}
    if spec.startswith('unscreenable'):
        why = spec[len('unscreenable'):].strip().strip('"').strip()
        return {'kind': 'unscreenable', 'why': why or 'marked unscreenable in the overlay'}
    if spec.startswith('steps '):
        steps = []
        for part in spec[6:].split('>'):
            part = part.strip()
            m = re.fullmatch(r'click\s+"([^"]+)"', part)
            g = re.fullmatch(r'goto\s+(\S+)', part)
            if m:
                steps.append(('click', m.group(1)))
            elif g:
                steps.append(('goto', g.group(1)))
            else:
                raise InputError(f'## Harness steps: {part!r} is not click "Text" or goto /path')
        return {'kind': 'steps', 'steps': steps}
    raise InputError(f'## Harness feature spec {spec!r} is not route, steps or unscreenable')


def manifest_units(structure_path, lens):
    """{metric: unit} from the lens's manifest fields in the map: a measurement's unit is the field's, never free text."""
    try:
        with open(structure_path, encoding='utf-8') as f:
            s = json.load(f)
    except (OSError, ValueError):
        return {}
    entry = next((l for l in s.get('lenses', []) if isinstance(l, dict) and l.get('id') == lens), None)
    fields = ((entry or {}).get('manifest') or {}).get('fields') or []
    return {f['key']: f['unit'] for f in fields if isinstance(f, dict) and f.get('key') and f.get('unit')}


# ------------------------------------------------------------------------------------------- process
def start(command, cwd):
    if not command:
        return None
    if os.name == 'nt':
        return subprocess.Popen(command, cwd=cwd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
    return subprocess.Popen(command, cwd=cwd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)


def kill_tree(proc):
    """Kills the command and everything it started (a dev server forks)."""
    if proc is None or proc.poll() is not None:
        return
    try:
        if os.name == 'nt':
            subprocess.run(['taskkill', '/PID', str(proc.pid), '/T', '/F'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            os.killpg(proc.pid, signal.SIGTERM)
            try:
                proc.wait(5)
            except subprocess.TimeoutExpired:
                os.killpg(proc.pid, signal.SIGKILL)
    except (ProcessLookupError, OSError):
        pass
    try:
        proc.wait(10)
    except subprocess.TimeoutExpired:
        pass


def wait_ready(url, proc, cap_s=READY_CAP_S):
    deadline = time.time() + cap_s
    while time.time() < deadline:
        if proc is not None and proc.poll() is not None:
            return f'the command exited with {proc.returncode} before {url} answered'
        try:
            # a dev server compiles the first page on this request; a short timeout aborts it and the
            # next poll starts the compile over, so wait as long as the deadline allows (60 s at most)
            with urllib.request.urlopen(url, timeout=max(1, min(60, deadline - time.time()))) as r:
                if r.status == 200:
                    return None
        except (urllib.error.URLError, OSError, ValueError):
            pass
        time.sleep(0.5)
    return f'{url} did not answer HTTP 200 within {cap_s} s'


# ------------------------------------------------------------------------------------------- capture
def with_query(url, key, value):
    parts = urlsplit(url)
    q = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if k != key] + [(key, value)]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(q), parts.fragment))


def capture(browser, cfg, slug, spec, theme, size, out_png):
    """One capture. Returns (report, None) or (None, why it could not render)."""
    w, h = size
    ctx = browser.new_context(viewport={'width': w, 'height': h},
                              color_scheme=('dark' if theme == 'dark' else 'light') if cfg['theme'] == 'media' else None)
    value = cfg['theme_values'].get(theme, theme)  # the app's own name for the theme the shot is labelled with
    if cfg['theme'].startswith('storage '):
        # the app reads its theme from localStorage at start: write it before any of the page's own scripts run.
        # A persisted store usually wants JSON, not the bare name - with a wrong seed an app may fall back to any theme.
        _, key, *template = cfg['theme'].split(' ', 2)
        stored = template[0].replace('{theme}', value) if template else value
        ctx.add_init_script('try { localStorage.setItem(%s, %s) } catch (e) {}' % (json.dumps(key), json.dumps(stored)))
    for k, v in cfg['storage']:
        ctx.add_init_script('try { localStorage.setItem(%s, %s) } catch (e) {}' % (json.dumps(k), json.dumps(v)))
    page = ctx.new_page()
    errors = []
    page.on('console', lambda m: errors.append(m.text[:300]) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errors.append('pageerror: ' + str(e)[:300]))
    tm = cfg['theme']

    def themed(url):
        if tm.startswith('query'):
            return with_query(url, tm.split(' ', 1)[1].lstrip('?').rstrip('='), value)
        return url

    def apply_class():
        if tm.startswith('class'):
            cls = tm.split(' ', 1)[1]
            page.evaluate("([c, on]) => document.documentElement.classList.toggle(c, on)", [cls, theme == 'dark'])

    def goto(path):
        url = themed(urljoin(cfg['url'].rstrip('/') + '/', path.lstrip('/')))
        try:
            resp = page.goto(url, wait_until='load', timeout=NAV_TIMEOUT_MS)
        except Exception as e:
            if 'Timeout' not in type(e).__name__:
                raise
            # a dev server compiles a route on its first request, which can outlast one timeout
            resp = page.goto(url, wait_until='load', timeout=NAV_TIMEOUT_MS)
        if resp is not None and resp.status >= 400:
            return f'HTTP {resp.status} at {path}'
        return None

    try:
        try:
            steps = spec['steps'] if spec['kind'] == 'steps' else []
            # steps that open with a goto start there, not at '/', which a preview entry may not serve
            first = spec['route'] if spec['kind'] == 'route' else (steps[0][1] if steps and steps[0][0] == 'goto' else '/')
            if steps and steps[0][0] == 'goto':
                steps = steps[1:]
            why = goto(first)
            if why:
                return None, why
            apply_class()
            if spec['kind'] == 'steps':
                for kind, arg in steps:
                    if kind == 'goto':
                        why = goto(arg)
                        if why:
                            return None, why
                        apply_class()
                    else:
                        page.get_by_text(arg, exact=True).first.click(timeout=10000)
            try:
                page.wait_for_load_state('networkidle', timeout=10000)
            except Exception:
                pass  # a page that keeps a socket open still renders
            time.sleep(SETTLE_S)
            for text in cfg['dismiss']:
                # a consent banner covers the bottom of every shot; absent on this page is fine
                try:
                    # a hidden match (a mobile menu, a policy page) would time out: click the visible one
                    page.get_by_role('button', name=text, exact=True).locator('visible=true').first.click(timeout=1500)
                    time.sleep(0.6)  # let an exit animation finish
                except Exception:
                    pass
            if cfg['full_page']:
                # sections that animate in when scrolled into view stay blank in a full-page capture
                # unless the page was scrolled through once
                page.evaluate(SCROLL_THROUGH)
                time.sleep(SETTLE_S)
            if page.evaluate(BLANK):
                return None, f'blank body at {first}'
            os.makedirs(os.path.dirname(out_png), exist_ok=True)
            page.screenshot(path=out_png, full_page=cfg['full_page'])
            px, where, n = page.evaluate(MINFONT)
            return {'feature': slug, 'url': page.url, 'size': f'{w}x{h}', 'theme': theme, 'minTextPx': px, 'minTextAt': where,
                    'textElements': n, 'consoleErrors': sorted(set(errors))}, None
        except Exception as e:  # navigation error, a step that found nothing
            return None, f'{type(e).__name__}: {str(e).splitlines()[0][:200]}'
    finally:
        ctx.close()


def run(args):
    root = os.path.abspath(args.root)
    overlay = os.path.join(root, args.overlay)
    if not os.path.exists(overlay):
        raise InputError(f'no overlay at {overlay} (--overlay)')
    with open(overlay, encoding='utf-8') as f:
        body = harness_section(f.read())
    if body is None:
        raise InputError(f'{args.overlay} has no ## Harness section: harness metrics stay unmeasured')
    cfg = parse_harness(body)
    if not re.fullmatch(r'r-[0-9]{14}-[0-9a-f]{4}|[A-Za-z0-9._-]+', args.run):
        raise InputError('--run must be a run id')
    wanted = [s for s in (args.features or '').split(',') if s.strip()]
    unknown = [s for s in wanted if s not in cfg['features']]
    scoped = wanted or list(cfg['features'])
    out = {'run': args.run, 'shots': [], 'measurements': [], 'unscreenable': [],
           'unmapped': unknown}  # a scoped feature the overlay does not map is not measured by this method
    targets = [(s, cfg['features'][s]) for s in scoped if s in cfg['features']]
    for slug, spec in targets:
        if spec['kind'] == 'unscreenable':
            out['unscreenable'].append({'feature': slug, 'why': spec['why']})
    live = [(s, sp) for s, sp in targets if sp['kind'] != 'unscreenable']
    if args.dry or not live:
        return out, 0
    store_dir = os.path.join(root, '.ai', 'lens-scan')
    if args.port:
        cfg['url'] = re.sub(r'^(\w+://[^/:]+)(:\d+)?', lambda m: f'{m.group(1)}:{args.port}', cfg['url'])
        if cfg['command']:
            cfg['command'] = re.sub(r'(--port[ =])\d+', lambda m: f'{m.group(1)}{args.port}', cfg['command'])
    ready_url = urljoin(cfg['url'].rstrip('/') + '/', cfg['ready'].lstrip('/'))
    if cfg['command'] and wait_ready(ready_url, None, cap_s=0.01) is None:
        # Something already serves the url. The command's own server would fail to bind (or --strictPort would exit
        # quietly) and every shot would show that other checkout, not this root: refuse instead.
        out['error'] = f'{ready_url} already answers before the command started: another server holds the port, so the shots would not show {root}. Free the port or pass --port <free port>.'
        return out, 1
    proc = start(cfg['command'], root)
    try:
        why = wait_ready(ready_url, proc, cap_s=cfg['ready_timeout'])
        if why:
            out['error'] = why
            return out, 1
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            # `python -I` drops the user site, where `pip install --user playwright` puts it
            import site
            sys.path.append(site.getusersitepackages())
            from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch()
            try:
                for slug, spec in live:
                    reports, failed = [], None
                    for (w, h) in cfg['sizes']:
                        for theme in cfg['themes']:
                            rel = f'shots/{args.run}/{slug}-{theme}-{w}x{h}.png'
                            png = os.path.join(store_dir, *rel.split('/'))
                            rep, why = capture(browser, cfg, slug, spec, theme, (w, h), png)
                            if why:
                                failed = why
                                break
                            rep_file = png[:-4] + '.json'
                            with open(rep_file, 'w', encoding='utf-8') as f:
                                json.dump(rep, f, indent=2)
                            reports.append(rep)
                            out['shots'].append({'feature': slug, 'path': rel, 'size': f'{w}x{h}', 'theme': theme, 'module': MODULE,
                                                 'report_file': os.path.relpath(rep_file, root).replace(os.sep, '/')})
                        if failed:
                            break
                    if failed:
                        # never a partial set: a feature that fails one capture is unscreenable, its other shots withdrawn
                        for s in [s for s in out['shots'] if s['feature'] == slug]:
                            out['shots'].remove(s)
                            for ext in ('.png', '.json'):
                                try:
                                    os.remove(os.path.join(store_dir, *s['path'][:-4].split('/')) + ext)
                                except OSError:
                                    pass
                        out['unscreenable'].append({'feature': slug, 'why': failed})
                        continue
                    pxs = [r['minTextPx'] for r in reports if r['minTextPx'] is not None]
                    where = f'{len(reports)} capture(s), {MODULE} {", ".join(t for t in cfg["themes"])} at {", ".join(f"{w}x{h}" for w, h in cfg["sizes"])}'
                    if pxs:
                        low = min(reports, key=lambda r: r['minTextPx'] if r['minTextPx'] is not None else 1e9)
                        out['measurements'].append({'feature': slug, 'lens': args.lens, 'metric': 'minTextPx', 'value': min(pxs),
                                                    'method': 'harness', 'evidence': f'{low["minTextAt"]} ({low["theme"]} {low["size"]}); {where}'})
                    errs = sorted({e for r in reports for e in r['consoleErrors']})
                    out['measurements'].append({'feature': slug, 'lens': args.lens, 'metric': 'consoleErrors', 'value': len(errs),
                                                'method': 'harness', 'evidence': ('; '.join(errs)[:500] if errs else 'no console or page errors') + f' - {where}'})
            finally:
                browser.close()
        units = manifest_units(os.path.join(store_dir, 'app-structure.json'), args.lens)
        for m in out['measurements']:
            if units.get(m['metric']):
                m['unit'] = units[m['metric']]
        return out, 0
    finally:
        kill_tree(proc)


def main(argv=None):
    ap = argparse.ArgumentParser(description='lens-scan generic Playwright harness (see the module docstring)')
    ap.add_argument('--root', default='.')
    ap.add_argument('--run', required=True)
    ap.add_argument('--overlay', default=os.path.join('.claude', 'lens-scan', 'config.md'))
    ap.add_argument('--features', default='')
    ap.add_argument('--lens', default='design')
    ap.add_argument('--port', type=int, default=0, help="serve on this port instead of the overlay's (rewrites --port N in the command and the url's port)")
    ap.add_argument('--dry', action='store_true', help='parse the overlay and print the plan; start nothing')
    args = ap.parse_args(argv)
    try:
        out, code = run(args)
    except InputError as e:
        sys.stderr.write(f'harness: {e}\n')
        return 2
    sys.stdout.write(json.dumps(out, indent=2) + '\n')
    return code


if __name__ == '__main__':
    sys.exit(main())
