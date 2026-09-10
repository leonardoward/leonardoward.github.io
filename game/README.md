# Electromagnetism Learning Game

A browser game built to help teach an introductory **electromagnetism / circuits**
course, made as a *Servicio Comunitario* (university community‑service) project with
**Cristhian Bravo** and **Said Alvarado**. Written in JavaScript on
[Phaser 2.4](https://phaser.io/).

Play it by opening `index.html` from any static web server.

## What's in it

The main menu ("GRID EDITION") leads to two game modes and a glossary:

### Charge puzzles &mdash; `c_level1` … `c_level6`

A slingshot puzzle about **Coulomb's law and the electric field of discrete charges**.
You click‑and‑drag to launch a charged particle; fixed charges on the level bend its
path (same polarity repels, opposite attracts, and the force grows as the particle
gets closer), and you have to land it in the target portal. A dotted aim line and a
trajectory trail show the physics as you play. Level 1 is *"Electro Dash"*.

### Platformer &mdash; `p_level1`, `p_level2`

A tile‑map platformer (Phaser Arcade physics) where the player crosses rooms full of
lasers, switches, doors and moving enemies, wiring up **circuits** to open the way out.

### Glossary

Short reference cards for the course topics the levels illustrate:

* Ley de Coulomb para cargas discretas &mdash; Coulomb's law for discrete charges
* Campo eléctrico en cargas discretas &mdash; the electric field of discrete charges
* Corrientes eléctricas &mdash; electric currents
* Elementos discretos: pulsadores &mdash; discrete elements: push‑buttons
* Elementos pasivos: resistencia &mdash; passive elements: resistance

## Running it

Any static file server works &mdash; the game only loads local assets. For example:

```
python3 -m http.server 5001        # then open http://localhost:5001/
```

`runserver.py` is a tiny wrapper around Python's `http.server` (`python3 runserver.py [port] [host]`).

## Repository Layout

```
index.html                     loads Phaser + every game state, mounts #gameDiv
phaser.js                      Phaser 2.4 (vendored)
game.js                        Phaser.Game setup, registers all states, global vars
js/
  boot.js  load.js  menu.js    boot / asset loading / main menu
  c_level1.js … c_level6.js     the charge-puzzle levels
  glossary.js selector.js settings.js   glossary, level select, options
  win.js                       win screen
p_js/
  p_load.js p_menu.js p_play.js p_win.js p_level1.js p_level2.js   the platformer
assets/                        sprites, spritesheets, audio, tilesets, thumbnails
p_assets/                      platformer art, incl. Circuits/
runserver.py                   static-server helper
miseriadolor-modulos-base-*.zip   original base modules (internal working name)
```

## Authors

* Cristhian Bravo
* Said Alvarado
* [Leonardo Ward](https://github.com/leonardoward)
