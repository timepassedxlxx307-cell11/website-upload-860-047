(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function renderSearchResult(item) {
        return [
            "<a class=\"search-result\" href=\"" + item.url + "\">",
            "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
            "<span>",
            "<strong>" + escapeHtml(item.title) + "</strong>",
            "<span>" + escapeHtml(item.year + " · " + item.region + " · " + item.category) + "</span>",
            "</span>",
            "</a>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initSearch() {
        var forms = document.querySelectorAll("[data-search-form]");
        if (!forms.length || !window.MovieSearchData) {
            return;
        }
        forms.forEach(function (form) {
            var input = form.querySelector("[data-search-input]");
            var panel = form.querySelector("[data-search-panel]");
            if (!input || !panel) {
                return;
            }
            var apply = function () {
                var keyword = input.value.trim().toLowerCase();
                if (!keyword) {
                    panel.classList.remove("is-open");
                    panel.innerHTML = "";
                    return;
                }
                var results = window.MovieSearchData.filter(function (item) {
                    return item.query.indexOf(keyword) !== -1;
                }).slice(0, 12);
                if (!results.length) {
                    panel.innerHTML = "<div class=\"search-empty\">未找到匹配影片</div>";
                } else {
                    panel.innerHTML = results.map(renderSearchResult).join("");
                }
                panel.classList.add("is-open");
            };
            input.addEventListener("input", apply);
            input.addEventListener("focus", apply);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var first = panel.querySelector("a");
                if (first) {
                    window.location.href = first.href;
                }
            });
            document.addEventListener("click", function (event) {
                if (!form.contains(event.target)) {
                    panel.classList.remove("is-open");
                }
            });
        });
    }

    function initHeroSlider() {
        var root = document.querySelector("[data-hero-slider]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        });
        if (index < 0) {
            index = 0;
        }
        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function initPageFilter() {
        var input = document.querySelector("[data-page-filter]");
        var grid = document.querySelector("[data-card-grid]") || document;
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
                card.classList.toggle("is-filter-hidden", keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    function initPlayer(playerId, sourceUrl) {
        var shell = document.getElementById(playerId);
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        if (!video || !sourceUrl) {
            return;
        }
        var attached = false;
        var hls = null;
        function attach() {
            if (attached) {
                return Promise.resolve();
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    var done = false;
                    function finish() {
                        if (!done) {
                            done = true;
                            resolve();
                        }
                    }
                    if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
                    }
                    window.setTimeout(finish, 900);
                });
            }
            video.src = sourceUrl;
            return Promise.resolve();
        }
        function start() {
            attach().then(function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (cover) {
                            cover.classList.remove("is-hidden");
                        }
                    });
                }
            });
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (cover) {
                cover.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initSearch();
        initHeroSlider();
        initPageFilter();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
