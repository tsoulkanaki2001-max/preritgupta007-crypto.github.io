(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover)").matches;
  var nav = document.querySelector(".nav");
  var hero = document.querySelector(".hero");

  // Scroll progress bar, nav shadow and hero parallax
  var bar = document.createElement("div");
  bar.className = "progress";
  document.body.appendChild(bar);
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
      nav.classList.toggle("scrolled", h.scrollTop > 10);
      if (!reduce && hero) hero.style.setProperty("--py", Math.min(h.scrollTop * 0.08, 40) + "px");
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (reduce) return;

  // Glow orbs in the hero
  if (hero) {
    ["o1", "o2"].forEach(function (c) {
      var o = document.createElement("span");
      o.className = "orb " + c;
      o.setAttribute("aria-hidden", "true");
      hero.appendChild(o);
    });
  }

  // Beach volleyball: a ball is batted between the two players' hands; tap the photo to spike it
  var shot = document.querySelector(".hero-shot");
  if (shot && shot.animate) {
    var layer = document.createElement("div");
    layer.className = "vb";
    layer.setAttribute("aria-hidden", "true");
    var patch = document.createElement("span");
    patch.className = "vb-patch";
    var ball = document.createElement("span");
    ball.className = "vb-ball";
    layer.appendChild(patch);
    layer.appendChild(ball);
    shot.appendChild(layer);
    shot.classList.add("playable");

    function f(x, y, rot, extra) {
      var k = { left: x + "%", top: y + "%", transform: "translate(-50%,-50%) rotate(" + rot + "deg)" };
      for (var p in extra) k[p] = extra[p];
      return k;
    }

    var rally = ball.animate([
      f(59.5, 45, 0, { offset: 0 }),
      f(59.5, 37, 120, { offset: 0.25 }),
      f(57.4, 45.4, 240, { offset: 0.45 }),
      f(58.6, 40.5, 360, { offset: 0.65 }),
      f(61.6, 45.6, 480, { offset: 0.85 }),
      f(59.5, 45, 600, { offset: 1 })
    ], { duration: 3200, iterations: Infinity, easing: "ease-in-out" });

    var hits = 0, busy = false;
    shot.addEventListener("click", function () {
      if (busy) return;
      busy = true;
      rally.pause();
      var spike = ball.animate([
        f(59.5, 45, 0, { offset: 0 }),
        f(61, 28, 200, { offset: 0.28, easing: "ease-in" }),
        f(78, 66, 520, { offset: 0.62, easing: "ease-out" }),
        f(83, 60, 640, { offset: 0.76, easing: "ease-in" }),
        f(88, 67, 820, { offset: 0.9 }),
        f(90, 67, 900, { offset: 1, opacity: 0 })
      ], { duration: 1700, easing: "ease-in" });
      setTimeout(function () {
        hits += 1;
        var pop = document.createElement("span");
        pop.className = "vb-pop";
        pop.textContent = "\uD83C\uDFD0 \u00d7" + hits;
        pop.style.left = "76%";
        pop.style.top = "62%";
        layer.appendChild(pop);
        pop.animate([{ opacity: 1, transform: "translate(-50%,-50%)" }, { opacity: 0, transform: "translate(-50%,-190%)" }], { duration: 1000, easing: "ease-out" }).onfinish = function () { pop.remove(); };
      }, 1000);
      spike.onfinish = function () {
        ball.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
        rally.play();
        busy = false;
      };
    });
  }

  // Sports marquee; built before script.js runs so the clones are translated too
  var wrap = document.querySelector(".sports .wrap");
  if (wrap) {
    var track = document.createElement("div");
    track.className = "track";
    var setA = document.createElement("div");
    setA.className = "set";
    [].slice.call(wrap.children).forEach(function (i) { setA.appendChild(i); });
    var setB = setA.cloneNode(true);
    setB.setAttribute("aria-hidden", "true");
    track.appendChild(setA);
    track.appendChild(setB);
    wrap.appendChild(track);
    wrap.classList.add("marquee");
  }

  // Scroll reveal
  if ("IntersectionObserver" in window) {
    var sel = ".hero .wrap > div:first-child > *, .sec-head, .card, .step, .split > *, .not-dating, .faq details, .cta";
    var els = [].slice.call(document.querySelectorAll(sel));
    els.forEach(function (el) {
      var idx = [].indexOf.call(el.parentNode.children, el);
      el.classList.add("reveal");
      el.style.setProperty("--d", Math.min(idx, 6) * 90 + "ms");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add("in");
        io.unobserve(el);
        setTimeout(function () {
          el.classList.remove("reveal", "in");
          el.style.removeProperty("--d");
        }, 1600);
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  // Count-up for the first hero stat
  var stat = document.querySelector(".hero-stats strong");
  if (stat && /^\d+\+$/.test(stat.textContent.trim())) {
    var target = parseInt(stat.textContent, 10), n = 0;
    stat.textContent = "0+";
    setTimeout(function () {
      var iv = setInterval(function () {
        n += 1;
        stat.textContent = n + "+";
        if (n >= target) clearInterval(iv);
      }, 110);
    }, 500);
  }

  // Rotating example games in the floating chip
  var tick = document.getElementById("tick");
  var msgs = {
    en: ["Football \u00b7 tonight 20:30 \u00b7 2 spots left", "Padel \u00b7 Sat 11:00 \u00b7 players needed", "Running \u00b7 Sun 09:00 \u00b7 all levels"],
    el: ["\u03a0\u03bf\u03b4\u03cc\u03c3\u03c6\u03b1\u03b9\u03c1\u03bf \u00b7 \u03b1\u03c0\u03cc\u03c8\u03b5 20:30 \u00b7 2 \u03b8\u03ad\u03c3\u03b5\u03b9\u03c2", "\u03a0\u03ac\u03bd\u03c4\u03b5\u03bb \u00b7 \u03a3\u03ac\u03b2 11:00 \u00b7 \u03c8\u03ac\u03c7\u03bd\u03bf\u03c5\u03bc\u03b5 \u03c0\u03b1\u03af\u03ba\u03c4\u03b5\u03c2", "\u03a4\u03c1\u03ad\u03be\u03b9\u03bc\u03bf \u00b7 \u039a\u03c5\u03c1 09:00 \u00b7 \u03cc\u03bb\u03b1 \u03c4\u03b1 \u03b5\u03c0\u03af\u03c0\u03b5\u03b4\u03b1"]
  };
  if (tick) {
    var k = 0;
    function show() {
      var list = msgs[document.documentElement.lang === "el" ? "el" : "en"];
      tick.textContent = list[k % list.length];
      tick.classList.remove("swap");
      void tick.offsetWidth;
      tick.classList.add("swap");
    }
    show();
    setInterval(function () { k += 1; show(); }, 3000);
  }

  if (!canHover) return;

  // Spotlight on cards
  document.querySelectorAll(".card").forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  // Tilt on the step screenshots (not the hero photo, whose ball overlay must stay aligned)
  document.querySelectorAll(".step .shot img").forEach(function (img) {
    img.addEventListener("mousemove", function (e) {
      var r = img.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      img.style.transform = "perspective(900px) rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg) scale(1.03)";
    });
    img.addEventListener("mouseleave", function () { img.style.transform = ""; });
  });
})();
