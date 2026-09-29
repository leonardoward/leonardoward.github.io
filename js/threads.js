/* ===================================================================
 * Project threads
 *
 * Joins the copper traces between the items of a thread: the project
 * cards on the homepage, and the thread strip near the top of each case
 * study. A list opts in with data-trace="<selector>", naming the element
 * in each item the trace runs through (the step lights on a card, the
 * thumbnail in a strip).
 *
 * Between two items on the same line the trace is solid when the project
 * was carried into the next one (data-link="carried") and dashed when it
 * just came next. Where a thread wraps onto a new line, the trace drops
 * through a via at the end of the line and comes back through one at the
 * start of the next. Positions come from layout offsets, so they are
 * exact at any width and unaffected by hover transforms.
 * ------------------------------------------------------------------- */

(function () {
    'use strict';

    var PIECES = ['thread__trace', 'thread__via'];

    function isPiece(el) {
        return PIECES.some(function (c) { return el.classList.contains(c); });
    }

    // offset of el inside list, summed up the offsetParent chain
    function offsetIn(el, list) {
        var x = 0, y = 0;
        while (el && el !== list) {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent;
        }
        return { x: x, y: y };
    }

    function piece(list, cls, left, top, width) {
        // a list keeps list-item children; anything else takes spans
        var n = document.createElement(/^(OL|UL)$/.test(list.tagName) ? 'li' : 'span');
        n.className = cls;
        n.setAttribute('aria-hidden', 'true');
        n.style.left = left + 'px';
        n.style.top = top + 'px';
        if (width !== undefined) n.style.width = width + 'px';
        list.appendChild(n);
    }

    function draw(list) {
        var anchorSel = list.getAttribute('data-trace');
        Array.prototype.slice.call(list.children).forEach(function (c) {
            if (isPiece(c)) list.removeChild(c);
        });
        var items = Array.prototype.filter.call(list.children, function (c) {
            return c.querySelector(anchorSel);
        });
        var at = items.map(function (item) {
            var anchor = item.querySelector(anchorSel);
            var box = offsetIn(item, list);
            var a = offsetIn(anchor, list);
            return { left: box.x, right: box.x + item.offsetWidth, top: box.y, y: a.y + anchor.offsetHeight / 2 };
        });
        for (var i = 1; i < items.length; i++) {
            var a = at[i - 1], b = at[i];
            if (b.top === a.top) {
                var cls = 'thread__trace' + (items[i].getAttribute('data-link') === 'carried' ? ' is-carried' : '');
                piece(list, cls, a.right, Math.round(b.y - 1), b.left - a.right);
            } else {
                piece(list, 'thread__via', a.right - 5, Math.round(a.y - 5));
                piece(list, 'thread__via', b.left - 5, Math.round(b.y - 5));
            }
        }
    }

    function init() {
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-trace]'));
        if (!lists.length) return;
        var drawAll = function () { lists.forEach(draw); };
        drawAll();
        if ('ResizeObserver' in window) {
            var ro = new ResizeObserver(drawAll);
            lists.forEach(function (l) { ro.observe(l); });
        } else {
            window.addEventListener('resize', drawAll);
        }
        window.addEventListener('load', drawAll);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAll);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
