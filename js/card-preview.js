/* ===================================================================
 * Project card previews
 *
 * Hovering (or keyboard-focusing) a project card plays a short sequence
 * of frames from its case study in the thumbnail: stills and short clips,
 * one or more per documented step. While a frame shows, the matching step
 * LED under the card is highlighted, so the LED row reads as progress
 * through the method.
 *
 * Frames come from the card's data-preview attribute, a JSON list of
 *   { s: step | l: label, i: image }  or  { s, v: clip, p: poster, d: seconds }
 * and are only downloaded the first time the card is hovered.
 * Touch screens keep the plain card: tapping still just opens the project.
 * ------------------------------------------------------------------- */

(function () {
    'use strict';

    var STEPS = ['define', 'simulate', 'build', 'test', 'refine'];
    var NAMES = { define: 'Define', simulate: 'Simulate', build: 'Build', test: 'Test', refine: 'Refine' };
    var STILL_MS = 1800;      // how long a still stays up
    var STILL_MS_CALM = 2800; // ... with reduced motion
    var INTENT_MS = 120;      // ignore the pointer just passing over a card
    var LOAD_TIMEOUT_MS = 4000;

    var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

    function el(tag, cls) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        return node;
    }

    // resolves once the frame can be shown, or after a timeout so a slow
    // file never stalls the sequence
    function ready(frame) {
        if (frame.ready) return frame.ready;
        var media = frame.media;
        frame.ready = new Promise(function (resolve) {
            var done = function () { resolve(); };
            setTimeout(done, LOAD_TIMEOUT_MS);
            if (media.tagName === 'VIDEO') {
                if (media.readyState >= 2) return done();
                media.addEventListener('loadeddata', done, { once: true });
                media.addEventListener('error', done, { once: true });
            } else {
                if (media.complete && media.naturalWidth) return done();
                media.addEventListener('load', done, { once: true });
                media.addEventListener('error', done, { once: true });
            }
        });
        return frame.ready;
    }

    function Preview(card) {
        this.card = card;
        this.leds = card.querySelectorAll('.led-step');
        this.frames = null;
        this.index = -1;
        this.timer = null;
        this.intent = null;
        this.active = false;
        this.run = 0; // bumps on every start/stop so stale callbacks bail out
    }

    Preview.prototype.build = function () {
        var list;
        try { list = JSON.parse(this.card.getAttribute('data-preview')); } catch (e) { list = []; }

        var box = el('div', 'card-preview');
        box.setAttribute('aria-hidden', 'true');
        if (list.length === 1) box.classList.add('is-single');

        var chip = el('span', 'card-preview__chip');
        chip.appendChild(el('i'));
        this.chipText = chip.appendChild(el('span'));

        var bar = el('span', 'card-preview__bar');

        this.frames = list.map(function (f) {
            var media;
            if (f.v && !calm.matches) {
                media = el('video', 'card-preview__media');
                media.muted = true;
                media.defaultMuted = true;
                media.playsInline = true;
                media.setAttribute('playsinline', '');
                media.preload = 'auto';
                media.poster = f.p;
                media.src = f.v;
            } else {
                // with reduced motion a clip shows as its still
                media = el('img', 'card-preview__media');
                media.alt = '';
                media.decoding = 'async';
                media.src = f.v ? f.p : f.i;
            }
            box.appendChild(media);
            var seg = bar.appendChild(el('i'));
            return {
                media: media,
                seg: seg,
                step: f.s || null,
                label: f.s ? NAMES[f.s] : f.l,
                clip: media.tagName === 'VIDEO',
                seconds: f.d || 0
            };
        });

        if (this.frames.length < 2) bar.hidden = true;
        box.appendChild(chip);
        box.appendChild(bar);
        this.box = box;
        this.card.querySelector('.item-entry__thumb').appendChild(box);
    };

    Preview.prototype.start = function () {
        if (this.active) return;
        this.active = true;
        var run = ++this.run;
        var self = this;
        if (!this.frames) this.build();
        if (!this.frames.length) return;
        ready(this.frames[0]).then(function () {
            if (run !== self.run) return;
            self.card.classList.add('is-previewing');
            self.box.classList.add('is-on');
            self.show(0, run);
        });
    };

    Preview.prototype.stop = function () {
        clearTimeout(this.intent);
        if (!this.active) return;
        this.active = false;
        this.run++;
        clearTimeout(this.timer);
        this.card.classList.remove('is-previewing');
        if (!this.box) return;
        this.box.classList.remove('is-on');
        this.frames.forEach(function (f) {
            f.media.classList.remove('is-active');
            f.seg.classList.remove('is-done', 'is-now');
            f.seg.style.transitionDuration = '';
            if (f.clip) f.media.pause();
        });
        Array.prototype.forEach.call(this.leds, function (led) { led.classList.remove('is-current'); });
        this.index = -1;
    };

    Preview.prototype.show = function (i, run) {
        var self = this;
        var frame = this.frames[i];
        var prev = this.frames[this.index];

        if (prev && prev !== frame) {
            prev.media.classList.remove('is-active');
            if (prev.clip) prev.media.pause();
        }
        // restart the Ken Burns drift on a single still
        if (prev === frame) void frame.media.offsetWidth;
        frame.media.classList.add('is-active');
        this.index = i;

        this.chipText.textContent = frame.label;
        this.chipText.parentNode.hidden = !frame.label;
        this.box.classList.toggle('is-labelled', !frame.step);

        var at = frame.step ? STEPS.indexOf(frame.step) : -1;
        Array.prototype.forEach.call(this.leds, function (led, n) {
            led.classList.toggle('is-current', n === at);
        });

        var ms = frame.clip ? Math.max(frame.seconds, 1) * 1000 : (calm.matches ? STILL_MS_CALM : STILL_MS);
        this.frames.forEach(function (f, n) {
            f.seg.classList.toggle('is-done', n < i);
            f.seg.classList.remove('is-now');
            f.seg.style.transitionDuration = '';
        });
        void frame.seg.offsetWidth; // let the segment reset before it fills
        frame.seg.style.transitionDuration = ms + 'ms';
        frame.seg.classList.add('is-now');

        if (frame.clip) {
            frame.media.currentTime = 0;
            var playing = frame.media.play();
            if (playing && playing.catch) playing.catch(function () {});
        }

        if (this.frames.length < 2) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
            if (run !== self.run) return;
            var next = (i + 1) % self.frames.length;
            ready(self.frames[next]).then(function () {
                if (run === self.run) self.show(next, run);
            });
        }, ms);
    };

    function init() {
        var cards = document.querySelectorAll('.item-entry--problem[data-preview]');
        Array.prototype.forEach.call(cards, function (card) {
            var preview = new Preview(card);

            card.addEventListener('pointerenter', function (e) {
                // touch taps also fire pointerenter; they should just open the project
                if (e.pointerType !== 'mouse') return;
                clearTimeout(preview.intent);
                preview.intent = setTimeout(function () { preview.start(); }, INTENT_MS);
            });
            card.addEventListener('pointerleave', function () { preview.stop(); });

            // keyboard: the problem headline link is the card's tab stop
            card.addEventListener('focusin', function () { preview.start(); });
            card.addEventListener('focusout', function (e) {
                if (!card.contains(e.relatedTarget)) preview.stop();
            });
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
