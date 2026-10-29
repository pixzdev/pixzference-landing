/* Pixzference landing — interactions */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal on scroll
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

  // Animated counters
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1400;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
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

  // Motion chips: click to replay the named animation
  document.querySelectorAll(".motion-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var name = chip.getAttribute("data-anim");
      chip.classList.remove("play-fade", "play-slide", "play-pop", "play-shine", "play-glass", "play-gradient");
      // force reflow so the animation restarts
      void chip.offsetWidth;
      chip.classList.add("play-" + name);
      chip.addEventListener("animationend", function h() {
        chip.classList.remove("play-" + name);
        chip.removeEventListener("animationend", h);
      });
    });
  });
})();
