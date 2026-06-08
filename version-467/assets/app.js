(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function initFilters() {
    var list = document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var textInput = document.querySelector("[data-card-filter]");
    var yearInput = document.querySelector("[data-year-filter]");
    var categoryInput = document.querySelector("[data-category-filter]");

    if (textInput && getQuery("q")) {
      textInput.value = getQuery("q");
    }

    function apply() {
      var text = textInput ? textInput.value.trim().toLowerCase() : "";
      var year = yearInput ? yearInput.value : "";
      var category = categoryInput ? categoryInput.value : "";
      cards.forEach(function (card) {
        var search = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardCategory = card.getAttribute("data-category") || "";
        var matched = true;
        if (text && search.indexOf(text) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }
        card.hidden = !matched;
      });
    }

    [textInput, yearInput, categoryInput].forEach(function (input) {
      if (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.setupVideo = function (streamUrl) {
    var player = document.querySelector(".movie-player");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var layer = player.querySelector(".play-layer");
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attach();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!attached || video.paused) {
          start();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
