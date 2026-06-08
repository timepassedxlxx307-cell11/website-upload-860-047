(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;
            var showSlide = function (index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle("is-active", idx === current);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle("is-active", idx === current);
                });
            };
            var startTimer = function () {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    showSlide(current + 1);
                }, 5000);
            };
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                    startTimer();
                });
            });
            showSlide(0);
            startTimer();
        }

        var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        filterForms.forEach(function (form) {
            var root = form.closest("main") || document;
            var search = form.querySelector("[data-filter-search]");
            var year = form.querySelector("[data-filter-year]");
            var type = form.querySelector("[data-filter-type]");
            var category = form.querySelector("[data-filter-category]");
            var targets = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .wide-card, .ranking-row"));
            var apply = function () {
                var keyword = search ? search.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";
                var categoryValue = category ? category.value : "";
                targets.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesYear = !yearValue || (card.getAttribute("data-year") || "") === yearValue;
                    var matchesType = !typeValue || (card.getAttribute("data-type") || "") === typeValue;
                    var matchesCategory = !categoryValue || (card.getAttribute("data-category") || "") === categoryValue;
                    card.classList.toggle("is-filtered-out", !(matchesKeyword && matchesYear && matchesType && matchesCategory));
                });
            };
            [search, year, type, category].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", apply);
                    item.addEventListener("change", apply);
                }
            });
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
        });
    });
})();

function startHlsPlayer(videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !sourceUrl) {
        return;
    }

    var started = false;
    var begin = function () {
        if (started) {
            video.play().catch(function () {});
            return;
        }
        started = true;
        button.classList.add("is-hidden");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = sourceUrl;
        video.play().catch(function () {});
    };

    button.addEventListener("click", begin);
    video.addEventListener("click", function () {
        if (!started) {
            begin();
        }
    });
}
