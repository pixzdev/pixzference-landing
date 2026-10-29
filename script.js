/* Pixzference landing — interactions */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── freeze harness (deterministic states for screenshots) ── */
  try {
    var p = new URLSearchParams(location.search);
    var state = p.get("state");
    if (state) document.documentElement.dataset.state = state;
    var t = p.get("t");
    if (t !== null) {
      document.getAnimations().forEach(function (a) {
        a.currentTime = parseFloat(t) * 1000;
        a.pause();
      });
      var svg = document.querySelector("svg");
      if (svg) {
        if (svg.pauseAnimations) svg.pauseAnimations();
        if (svg.setCurrentTime) svg.setCurrentTime(parseFloat(t));
      }
    }
    if (state === "hover") {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    }
  } catch (e) { /* harness is best-effort */ }

  /* ── reveal on scroll ── */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ── animated counters ── */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1400;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var pr = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - pr, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (pr < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ── motion chips: click to replay the named animation ── */
  document.querySelectorAll(".motion-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var name = chip.getAttribute("data-anim");
      chip.classList.remove("play-fade", "play-slide", "play-pop", "play-shine", "play-glass", "play-gradient");
      void chip.offsetWidth; /* restart the animation */
      chip.classList.add("play-" + name);
      chip.addEventListener("animationend", function h() {
        chip.classList.remove("play-" + name);
        chip.removeEventListener("animationend", h);
      });
    });
  });

  /* ── hero preview: gentle pointer tilt (fine pointers, motion allowed) ── */
  var hero = document.getElementById("heroPreview");
  if (hero && !reduced && window.matchMedia("(pointer: fine)").matches) {
    var frame = null;
    hero.addEventListener("pointermove", function (ev) {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = null;
        var r = hero.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        hero.style.transform =
          "perspective(1100px) rotateY(" + (x * 3.5).toFixed(2) + "deg) rotateX(" + (-y * 2.5).toFixed(2) + "deg)";
      });
    });
    hero.addEventListener("pointerleave", function () {
      hero.style.transform = "perspective(1100px) rotateY(0) rotateX(0)";
    });
    hero.style.transition = "transform .5s cubic-bezier(.16,1,.3,1)";
    hero.style.willChange = "transform";
  }

  window.__ready = true;
})();
