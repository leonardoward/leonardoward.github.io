# leonardoward.github.io

Personal portfolio of **Leonardo Ward**, Electronics Engineer — PCB design, embedded
firmware and hardware projects, and robotics.

Live site: <https://leonardoward.github.io/>

## Structure

Static HTML site built on a [Colorlib](https://colorlib.com/) template. No build
step — it is served as-is by GitHub Pages.

| Path | Contents |
| --- | --- |
| `index.html` | Home page / project index |
| `embedded-hardware.html`, `embedded-software.html`, `robotics.html` | Category hub pages |
| `*.html` (project pages) | One page per project (e.g. `helios_ren.html`, `ejam.html`, `sumo.html`) |
| `helios_ren.html` / `helios_ren.es.html` | HELIOS REN write-up, English (default) and Spanish, with a language switch |
| `css/`, `js/`, `images/` | Template assets, scripts and media (`css/method.css` and `js/card-preview.js` are the site's own additions; `images/previews/` is generated) |
| `tools/update_cards.py`, `tools/card-previews.json` | Keeps the homepage project cards in step with the project pages (see below) |
| `game/` | The playable electromagnetism game, linked from `em-game.html` |
| `images/mark.svg`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | The mark: the letter L printed on an IC package, with copper pins, notch and pin-1 dot. In the menu (Home), the phone header, the footer and the browser tab (`favicon.svg` is the same chip on a square canvas; bump its `?v=` in the page heads when it changes, or browsers keep the old icon) |

Every page carries its own copy of the shared header/nav and footer, so changes to
that chrome must be applied to all pages.

## Local preview

```sh
python3 -m http.server 8777
# then open http://localhost:8777/
```

## Project pages and cards

Each project page is organised by the method **Define → Simulate → Build → Test →
Refine**: a strip of five LEDs under the intro (`nav.cs-steps`, lit = documented)
and one `h2.cs-step__title` section per documented step. `brake-test.html` is the
reference layout; the styles are in `css/method.css`.

Each project also has a card on `index.html`. After adding or changing a project
page or its card, run:

```sh
python3 tools/update_cards.py                     # needs Pillow and ffmpeg
python3 tools/update_cards.py --sheet review.jpg  # also save a contact sheet to check the frames
```

On the homepage the cards are grouped into **threads** (`section.thread` in `index.html`,
oldest project first) plus a final **One-offs** section. To add a project, copy an existing
`<article class="col-block">` card into the right thread; give it `data-link="carried"` if it
was built on the previous card's project, or `data-link="next"` if it simply came next
(`js/threads.js` draws the trace between cards from these). If other pages belong to the
same card (Buoy A and the Gateway share the "Buoy boards" card), list them in the card's
`data-pages`; a thread's `data-hub` names a page that shows the whole thread (`eja.html`).
Then run the tool below: it also writes the thread strip near the top of every case study
in a thread, in homepage order, with that project lit.

It lights each card's step LEDs to match its page and builds the hover-preview
frames in `images/previews/`. The frames each card shows are listed in
`tools/card-previews.json`; a new card gets frames picked automatically and
added there for you to review and edit (the options are described at the top of
the script). Commit the updated `index.html`, `tools/card-previews.json` and
`images/previews/` with the page.

## Deployment

Pushing to `master` publishes the site via GitHub Pages at the URL above.
