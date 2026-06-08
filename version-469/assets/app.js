(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        start();
    }

    function setupRows() {
        document.querySelectorAll("[data-row-prev], [data-row-next]").forEach(function (button) {
            button.addEventListener("click", function () {
                var targetId = button.getAttribute("data-row-prev") || button.getAttribute("data-row-next");
                var row = document.getElementById(targetId);
                if (!row) {
                    return;
                }
                var direction = button.hasAttribute("data-row-prev") ? -1 : 1;
                row.scrollBy({
                    left: direction * 360,
                    behavior: "smooth"
                });
            });
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var scope = panel.parentElement;
            var input = panel.querySelector("[data-search-input]");
            var category = panel.querySelector("[data-category-filter]");
            var year = panel.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var categoryValue = normalize(category && category.value);
                var yearValue = normalize(year && year.value);
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesCategory = !categoryValue || text.indexOf(categoryValue) !== -1;
                    var matchesYear = !yearValue || normalize(card.getAttribute("data-year")).indexOf(yearValue) !== -1;
                    card.classList.toggle("is-hidden", !(matchesKeyword && matchesCategory && matchesYear));
                });
            }

            [input, category, year].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", apply);
                    field.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
                apply();
            }
        });
    }

    window.bindMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-video");
        var button = document.getElementById("movie-play-button");
        if (!video || !button || !streamUrl) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            loaded = true;
        }

        function play() {
            attach();
            button.classList.add("is-hidden");
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMobileNav();
        setupHero();
        setupRows();
        setupFilters();
    });
})();
