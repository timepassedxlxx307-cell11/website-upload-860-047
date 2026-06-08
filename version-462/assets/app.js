(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function uniqueValues(cards, field) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute("data-" + field) || "";
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), "zh-CN");
        }).slice(0, 80);
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var parent = scope.parentElement || document;
            var cards = Array.prototype.slice.call(parent.querySelectorAll("[data-card]"));
            var input = scope.querySelector("[data-search]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-field]"));
            var empty = parent.querySelector("[data-empty]");
            if (!cards.length) {
                cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
            }
            selects.forEach(function (select) {
                var field = select.getAttribute("data-filter-field");
                uniqueValues(cards, field).forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            });
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var active = {};
                selects.forEach(function (select) {
                    active[select.getAttribute("data-filter-field")] = select.value;
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-match") || "").toLowerCase();
                    var ok = !query || text.indexOf(query) !== -1;
                    Object.keys(active).forEach(function (field) {
                        if (active[field] && card.getAttribute("data-" + field) !== active[field]) {
                            ok = false;
                        }
                    });
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    function bootPlayer(playerId, source) {
        ready(function () {
            var player = document.getElementById(playerId);
            if (!player || !source) {
                return;
            }
            var video = player.querySelector("video");
            var trigger = player.querySelector("[data-play-trigger]");
            var started = false;
            var hlsInstance = null;
            function playVideo() {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
            function start() {
                if (!video) {
                    return;
                }
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                            video.src = source;
                            playVideo();
                        }
                    });
                    return;
                }
                video.src = source;
                playVideo();
            }
            if (trigger) {
                trigger.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });

    window.SitePlayer = {
        boot: bootPlayer
    };
})();
