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
| `css/`, `styles/`, `js/`, `images/` | Template assets, scripts and media |
| `auth/`, `clinic/`, `patientmanager/`, `cardiotune/`, `game/`, `invitation-designdecoding/`, `openlayers/` | Standalone bundled apps/demos, not linked from the portfolio navigation |

Every page carries its own copy of the shared header/nav and footer, so changes to
that chrome must be applied to all pages.

## Local preview

```sh
python3 -m http.server 8777
# then open http://localhost:8777/
```

## Deployment

Pushing to `master` publishes the site via GitHub Pages at the URL above.
