#!/usr/bin/env python3
"""Update the homepage project cards from their case-study pages.

For every problem-first card on index.html this
  1. lights the card's step LEDs to match the steps its page documents
     (the lit items of the page's `nav.cs-steps`),
  2. builds the hover-preview frames in images/previews/<page>/ and writes
     them onto the card as `data-preview`, which js/card-preview.js plays, and
  3. writes the thread strip (`nav.cs-thread`) into every case study that
     belongs to a homepage thread: the thread's projects in homepage order,
     with thumbnails in images/threads/, this project lit. A card's
     `data-pages` lists other pages that share it (they light that card),
     and a thread's `data-hub` names a page that shows the whole thread.
     Strips are removed from pages that no longer belong to a thread.

Which frames a card shows is set in tools/card-previews.json. A card that is
not listed there yet gets frames picked automatically (the first image of each
documented step, topped up to four) and is added to the file, so the choice
can be reviewed with --sheet and edited. A frame is one of:

  {"step": "build", "src": "images/x/photo.jpg"}          still, cropped to fill 4:3
      "fit": "contain", "bg": "white"                     ... letterboxed instead
      "crop": [x, y, w, h]                                ... cropped from the source first
  {"step": "simulate", "src": "images/x/run.mp4", "t": [0, 5]}
                                                          muted clip, 5 s at most
  {"label": "GPS board", "src": "..."}                    listing pages: a name instead of a step
  []                                                      no preview for this card

Output files are named after a hash of their frame settings and source file,
so only new or changed frames are rebuilt, and files no card uses any more
are deleted.

Usage (from anywhere):
  python3 tools/update_cards.py                 update the cards and previews
  python3 tools/update_cards.py --sheet x.jpg   also save a contact sheet of every card's frames

Needs Python 3 with Pillow, and ffmpeg for clips.
"""

import argparse
import hashlib
import html
import json
import os
import re
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join('tools', 'card-previews.json')
OUT_DIR = os.path.join('images', 'previews')
THREAD_DIR = os.path.join('images', 'threads')
THREAD_THUMB = (264, 198)   # two times the strip thumbnail
STEPS = ['define', 'simulate', 'build', 'test', 'refine']
STILL = (640, 480)   # two times the widest card thumbnail
CLIP = (480, 360)
MAX_CLIP_S = 5
AUTO_FRAMES = 4


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def write(path, text):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


# -------------------------------------------------------------------
# cards and pages

def cards(index):
    """(article match, page href, thumbnail src) for each problem-first card."""
    for m in re.finditer(r'<article class="col-block"[^>]*>.*?</article>', index, re.S):
        art = m.group(0)
        if 'item-entry--problem' not in art:
            continue
        href = re.search(r'item-entry__problem"><a href="([^"#]+)', art).group(1)
        thumb = re.search(r'item-entry__thumb-link[^>]*>\s*<img[^>]*src="([^"]+)"', art).group(1)
        yield m, href, thumb


def lit_steps(page_html):
    nav = re.search(r'<nav class="cs-steps".*?</nav>', page_html, re.S)
    if not nav:
        return None
    return [s for s in STEPS if re.search(rf'cs-steps__item is-on"><a href="#{s}"', nav.group(0))]


def sync_leds(art, lit):
    names = [s.capitalize() for s in STEPS]
    for s, name in zip(STEPS, names):
        on = ' is-on' if s in lit else ''
        art = re.sub(rf'<span class="led-step(?: is-on)?"><i></i>{name}</span>',
                     f'<span class="led-step{on}"><i></i>{name}</span>', art)
    covered = ', '.join(n for s, n in zip(STEPS, names) if s in lit)
    return re.sub(r'Steps covered: [^<]*', f'Steps covered: {covered}.', art)


def auto_frames(page_html, thumb):
    """First image of each documented step, topped up with more Build/Test images."""
    main = re.search(r'<div class="col-full entry__main">(.*?)<div class="entry__taxonomies">', page_html, re.S)
    main = main.group(1) if main else page_html
    parts = re.split(r'<h2 id="(define|simulate|build|test|refine)" class="cs-step__title', main)
    chunks = [(None, parts[0])] + [(parts[i], parts[i + 1]) for i in range(1, len(parts), 2)]
    found, seen = [], {thumb}
    for step, chunk in chunks:
        chunk = re.split(r'<h2 [^>]*cs-after__title', chunk)[0]
        for m in re.finditer(r'<img[^>]*?src="([^"]+)"[^>]*>|<(?:source|video)[^>]*?src="([^"]+\.mp4)"', chunk):
            src = m.group(1) or m.group(2)
            if src in seen or src.startswith(('http', 'images/avatars/')) or not os.path.exists(src):
                continue
            seen.add(src)
            if not src.endswith('.mp4'):
                try:
                    w, h = Image.open(src).size
                except OSError:
                    continue
                if w < 250 or h < 180:
                    continue
            alt = re.search(r'alt="([^"]*)"', m.group(0))
            found.append((step, src, html.unescape(alt.group(1)) if alt else ''))
    stepped = [f for f in found if f[0]]
    if not stepped:  # a listing page: name each frame from its alt text
        return [{'label': alt[:24], 'src': src} for _, src, alt in found[:5]]
    first = {}
    for f in stepped:
        first.setdefault(f[0], f)
    pick = list(first.values())
    for f in [f for s in ('build', 'test', 'simulate') for f in stepped if f[0] == s]:
        if len(pick) >= AUTO_FRAMES:
            break
        if f not in pick:
            pick.append(f)
    pick.sort(key=lambda f: STEPS.index(f[0]))
    return [{'step': s, 'src': src} for s, src, _ in pick[:5]]


# -------------------------------------------------------------------
# frames

def fingerprint(frame):
    h = hashlib.sha1(json.dumps(frame, sort_keys=True).encode())
    with open(frame['src'], 'rb') as f:
        h.update(hashlib.sha1(f.read()).digest())
    return h.hexdigest()[:8]


def fit(im, frame, size):
    im = im.convert('RGB')
    w, h = size
    if frame.get('fit') == 'contain':
        im.thumbnail((w - 40, h - 40), Image.LANCZOS)
        out = Image.new('RGB', size, frame.get('bg', 'white'))
        out.paste(im, ((w - im.width) // 2, (h - im.height) // 2))
        return out
    if im.width / im.height > w / h:
        nw = round(im.height * w / h)
        im = im.crop(((im.width - nw) // 2, 0, (im.width - nw) // 2 + nw, im.height))
    else:
        nh = round(im.width * h / w)
        im = im.crop((0, (im.height - nh) // 2, im.width, (im.height - nh) // 2 + nh))
    return im.resize(size, Image.LANCZOS)


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)


def build_frame(frame, base):
    """Write base.jpg (and base.mp4 for clips) unless they exist; return the card entry."""
    entry = {'s': frame['step']} if 'step' in frame else {'l': frame.get('label', '')}
    if frame['src'].endswith('.mp4'):
        t0, t1 = frame.get('t', [0, MAX_CLIP_S])
        t1 = min(t1, t0 + MAX_CLIP_S)
        if not os.path.exists(base + '.mp4'):
            vf = []
            if 'crop' in frame:
                x, y, w, h = frame['crop']
                vf.append(f'crop={w}:{h}:{x}:{y}')
            cw, ch = CLIP
            if frame.get('fit') == 'contain':
                vf += [f'scale={cw}:{ch}:force_original_aspect_ratio=decrease',
                       f"pad={cw}:{ch}:(ow-iw)/2:(oh-ih)/2:color={frame.get('bg', 'white')}"]
            else:
                vf += [f'scale={cw}:{ch}:force_original_aspect_ratio=increase', f'crop={cw}:{ch}']
            ffmpeg('-ss', str(t0), '-t', str(t1 - t0), '-i', frame['src'], '-an', '-vf', ','.join(vf),
                   '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28', '-preset', 'slow',
                   '-movflags', '+faststart', base + '.mp4')
            ffmpeg('-ss', str(min(1.5, (t1 - t0) / 2)), '-i', base + '.mp4', '-frames:v', '1',
                   '-vf', f'scale={STILL[0]}:{STILL[1]}', '-q:v', '4', base + '.jpg')
        entry.update({'v': base + '.mp4', 'p': base + '.jpg', 'd': t1 - t0})
    else:
        if not os.path.exists(base + '.jpg'):
            im = Image.open(frame['src'])
            if 'crop' in frame:
                x, y, w, h = frame['crop']
                im = im.crop((x, y, x + w, y + h))
            fit(im, frame, STILL).save(base + '.jpg', quality=80, optimize=True, progressive=True)
        entry['i'] = base + '.jpg'
    return entry


def set_preview(art, entries):
    art = re.sub(r" data-preview='[^']*'", '', art)
    if not entries:
        return art
    data = json.dumps(entries, separators=(',', ':'), ensure_ascii=False)
    data = data.replace('&', '&amp;').replace("'", '&#39;')
    return art.replace('class="item-entry item-entry--problem"',
                       f"class=\"item-entry item-entry--problem\" data-preview='{data}'", 1)


def save_config(config):
    lines = ['{']
    for n, (page, frames) in enumerate(config.items()):
        comma = ',' if n < len(config) - 1 else ''
        if not frames:
            lines.append(f'  {json.dumps(page)}: []{comma}')
            continue
        lines.append(f'  {json.dumps(page)}: [')
        for k, f in enumerate(frames):
            lines.append('    ' + json.dumps(f, ensure_ascii=False) + (',' if k < len(frames) - 1 else ''))
        lines.append(f'  ]{comma}')
    lines.append('}')
    write(CONFIG, '\n'.join(lines) + '\n')


def contact_sheet(rows, path):
    tw, th, pad = 240, 180, 10
    font = ImageFont.load_default(size=13)
    width = max((len(frames) + 1 for _, _, frames in rows), default=1) * (tw + pad) + pad
    sheet = Image.new('RGB', (width, len(rows) * (th + 30) + pad), 'white')
    draw = ImageDraw.Draw(sheet)
    for r, (page, thumb, entries) in enumerate(rows):
        y = pad + r * (th + 30)
        tiles = [(f'{page} (card)', thumb)] + [(e.get('s') or e.get('l', ''), e.get('p') or e.get('i')) for e in entries]
        for c, (caption, src) in enumerate(tiles):
            x = pad + c * (tw + pad)
            sheet.paste(fit(Image.open(src), {}, (tw, th)), (x, y + 18))
            draw.text((x, y), caption, fill=(0, 0, 0) if c == 0 else (147, 80, 31), font=font)
    sheet.save(path, quality=82)


# -------------------------------------------------------------------
# thread strips on the case studies

def strip_tags(text):
    return html.unescape(re.sub(r'<[^>]+>', '', text)).strip()


def homepage_threads(index):
    """[{id, name, years, hub, items}] from the homepage thread sections, one-offs excluded."""
    found = []
    for m in re.finditer(r'<section class="thread"([^>]*)>(.*?)</section>', index, re.S):
        attrs, body = m.group(1), m.group(2)
        if 'data-trace=' not in body:
            continue
        tid = re.search(r'aria-labelledby="thread-([^"]+)"', attrs).group(1)
        name = re.search(r'class="thread__name">(.*?)</h2>', body, re.S).group(1).strip()
        meta = re.search(r'class="thread__meta">(.*?)</p>', body, re.S).group(1)
        years = meta.split('&middot;')[0].strip()
        hub = re.search(r'data-hub="([^"]+)"', attrs)
        items = []
        for a in re.finditer(r'<article class="col-block"([^>]*)>.*?</article>', body, re.S):
            art_attrs, art = a.group(1), a.group(0)
            link = re.search(r'data-link="([^"]+)"', art_attrs)
            pages = re.search(r'data-pages="([^"]+)"', art_attrs)
            items.append({
                'href': re.search(r'item-entry__problem"><a href="([^"#]+)', art).group(1),
                'link': link.group(1) if link else None,
                'pages': pages.group(1).split() if pages else [],
                'name': re.sub(r'\s*&rarr;\s*$', '', re.search(r'item-entry__name"[^>]*>(.*?)</a>', art, re.S).group(1).strip()),
                'year': re.search(r'item-entry__meta"><span>[^<]*</span><span>([^<]*)</span>', art).group(1),
                'thumb': re.search(r'item-entry__thumb-link[^>]*>\s*<img[^>]*src="([^"]+)"', art).group(1),
            })
        found.append({'id': tid, 'name': name, 'years': years, 'hub': hub.group(1) if hub else None, 'items': items})
    return found


def thread_thumb(src, slug):
    h = hashlib.sha1(json.dumps(THREAD_THUMB).encode())
    with open(src, 'rb') as f:
        h.update(f.read())
    out = os.path.join(THREAD_DIR, f'{slug}-{h.hexdigest()[:8]}.jpg').replace(os.sep, '/')
    if not os.path.exists(out):
        os.makedirs(THREAD_DIR, exist_ok=True)
        fit(Image.open(src), {}, THREAD_THUMB).save(out, quality=78, optimize=True, progressive=True)
    return out


STRIP_TEXT = {
    'en': ('Part of the {name} thread', 'this project', 'Projects in the {name} thread'),
    'es': ('Parte del hilo {name}', 'este proyecto', 'Proyectos del hilo {name}'),
}


def strip_html(thread, page, lang, indent):
    label, here_word, aria = STRIP_TEXT[lang]
    name_link = f'<a href="index.html#thread-{thread["id"]}">{thread["name"]}</a>'
    lines = [f'{indent}<nav class="cs-thread" aria-label="{aria.format(name=strip_tags(thread["name"]))}">',
             f'{indent}    <p class="cs-thread__label">{label.format(name=name_link)} &middot; {thread["years"]}</p>',
             f'{indent}    <ol class="cs-thread__list" data-trace=".cs-thread__thumb">']
    for it in thread['items']:
        here = page == it['href'] or page in it['pages']
        same = page == it['href']
        cls = 'cs-thread__item' + (' is-here' if here else '')
        link = f' data-link="{it["link"]}"' if it['link'] else ''
        year = it['year'] + (f' &middot; {here_word}' if here else '')
        inner = (f'<span class="cs-thread__thumb"><img loading="lazy" decoding="async" src="{it["thumb_small"]}" alt=""></span>'
                 f'<span class="cs-thread__name">{it["name"]}</span><span class="cs-thread__year">{year}</span>')
        body = f'<span aria-current="page">{inner}</span>' if same else f'<a href="{it["href"]}">{inner}</a>'
        lines.append(f'{indent}        <li class="{cls}"{link}>{body}</li>')
    lines += [f'{indent}    </ol>', f'{indent}</nav>']
    return '\n'.join(lines)


def place_strip(page_html, strip):
    """Remove any old strip, then put the new one right before the credits box or the steps nav."""
    page_html = re.sub(r'\n[ \t]*<nav class="cs-thread".*?</nav>[ \t]*\n(?:[ \t]*\n)?', '\n', page_html, flags=re.S)
    if strip is None:
        return page_html
    spots = [page_html.find(t) for t in ('<aside class="cs-credits"', '<nav class="cs-steps"')]
    spots = [i for i in spots if i != -1]
    if not spots:
        return page_html
    at = page_html.rfind('\n', 0, min(spots)) + 1
    page_html = page_html[:at] + strip + '\n\n' + page_html[at:]
    if 'js/threads.js' not in page_html and '<script src="js/main.js"></script>' in page_html:
        page_html = page_html.replace('<script src="js/main.js"></script>',
                                      '<script src="js/main.js"></script>\n    <script src="js/threads.js"></script>', 1)
    return page_html


def update_strips(index):
    """Write the thread strips into the case studies; returns (pages with a strip, thumbnails used)."""
    threads = homepage_threads(index)
    used, owner = set(), {}
    for t in threads:
        for it in t['items']:
            it['thumb_small'] = thread_thumb(it['thumb'], it['href'][:-len('.html')])
            used.add(it['thumb_small'])
            for page in [it['href']] + it['pages']:
                owner[page] = t
        if t['hub']:
            owner[t['hub']] = t
    changed = []
    for page in sorted(f for f in os.listdir('.') if f.endswith('.html') and f != 'index.html'):
        text = read(page)
        t = owner.get(page)
        if t is None and 'class="cs-thread"' not in text:
            continue
        strip = None
        if t is not None:
            spot = min([i for i in (text.find('<aside class="cs-credits"'), text.find('<nav class="cs-steps"')) if i != -1] or [0])
            line = text[text.rfind('\n', 0, spot) + 1:spot]
            indent = line[:len(line) - len(line.lstrip())]
            lang = 'es' if re.search(r'<html[^>]*lang="es"', text) else 'en'
            strip = strip_html(t, page, lang, indent)
        new = place_strip(text, strip)
        if new != text:
            write(page, new)
            changed.append(page)
    return owner, used, changed


# -------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('--sheet', metavar='FILE', help='save a contact sheet of every card and its frames')
    args = ap.parse_args()
    sheet_path = os.path.abspath(args.sheet) if args.sheet else None
    os.chdir(ROOT)

    config = json.loads(read(CONFIG)) if os.path.exists(CONFIG) else {}
    index = read('index.html')
    ordered, out, used, rows, notes = {}, [], set(), [], []
    last = 0
    for m, page, thumb in cards(index):
        art = m.group(0)
        page_html = read(page)

        lit = lit_steps(page_html)
        if lit is not None:
            new = sync_leds(art, lit)
            if new != art:
                notes.append(f'{page}: LEDs now {" ".join(s[0].upper() for s in lit) or "none"}')
            art = new

        if page not in config:
            config[page] = auto_frames(page_html, thumb)
            notes.append(f'{page}: picked {len(config[page])} frames automatically, review them in {CONFIG}')
        ordered[page] = config[page]

        entries = []
        slug = page[:-len('.html')]
        for n, frame in enumerate(config[page], 1):
            if not os.path.exists(frame['src']):
                sys.exit(f'{CONFIG}: {page} frame {n}: missing {frame["src"]}')
            if frame.get('step') and lit is not None and frame['step'] not in lit:
                notes.append(f'{page}: frame {n} is tagged {frame["step"]}, a step the page does not document')
            os.makedirs(os.path.join(OUT_DIR, slug), exist_ok=True)
            base = os.path.join(OUT_DIR, slug, f'{n}-{fingerprint(frame)}').replace(os.sep, '/')
            entry = build_frame(frame, base)
            entries.append(entry)
            used.update(v for k, v in entry.items() if k in ('i', 'v', 'p'))
        art = set_preview(art, entries)
        rows.append((page, thumb, entries))

        out.append(index[last:m.start()])
        out.append(art)
        last = m.end()
    out.append(index[last:])

    # keep entries for pages that lost their card, so a choice is not lost by accident
    for page, frames in config.items():
        ordered.setdefault(page, frames)
    save_config(ordered)

    new_index = ''.join(out)
    if new_index != index:
        write('index.html', new_index)

    removed = 0
    for dirpath, _, files in os.walk(OUT_DIR, topdown=False):
        for f in files:
            p = os.path.join(dirpath, f).replace(os.sep, '/')
            if p not in used:
                os.remove(p)
                removed += 1
        if dirpath != OUT_DIR and not os.listdir(dirpath):
            os.rmdir(dirpath)

    owner, strip_thumbs, strip_pages = update_strips(new_index)
    for page in strip_pages:
        notes.append(f'{page}: thread strip updated')
    if os.path.isdir(THREAD_DIR):
        for f in os.listdir(THREAD_DIR):
            p = os.path.join(THREAD_DIR, f).replace(os.sep, '/')
            if p not in strip_thumbs:
                os.remove(p)
                removed += 1

    if sheet_path:
        contact_sheet(rows, sheet_path)
    for note in notes:
        print(note)
    print(f'{len(rows)} cards, {sum(len(r[2]) for r in rows)} frames'
          + (f', {removed} unused preview files deleted' if removed else '')
          + (', index.html updated' if new_index != index else ', index.html unchanged'))


if __name__ == '__main__':
    main()
