(function () {
    const menuButton = document.querySelector('.menu-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            const open = mobilePanel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === active);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    const filters = document.querySelectorAll('.section-filter');

    filters.forEach(function (input) {
        const grid = input.closest('main').querySelector('.movie-grid');
        const cards = grid ? Array.from(grid.querySelectorAll('[data-card]')) : [];

        input.addEventListener('input', function () {
            const keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                const text = (card.getAttribute('data-search') || '').toLowerCase();
                card.hidden = keyword && text.indexOf(keyword) === -1;
            });
        });
    });
})();

function initStaticPlayer(videoUrl) {
    const video = document.getElementById('main-player');
    const startButton = document.querySelector('.player-start');
    const sideStart = document.querySelector('[data-start-player]');
    let ready = false;
    let hls = null;

    if (!video || !videoUrl) {
        return;
    }

    function attach() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function play() {
        attach();
        if (startButton) {
            startButton.classList.add('hidden');
        }
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (startButton) {
        startButton.addEventListener('click', play);
    }

    if (sideStart) {
        sideStart.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
        if (startButton) {
            startButton.classList.add('hidden');
        }
    });

    video.addEventListener('emptied', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
        ready = false;
        hls = null;
    });
}

(function () {
    const results = document.getElementById('search-results');
    const title = document.getElementById('search-title');
    const input = document.getElementById('search-page-input');

    if (!results || !window.SEARCH_INDEX) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();

    if (input) {
        input.value = query;
    }

    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matched = window.SEARCH_INDEX.filter(function (item) {
        const text = (item.search || '').toLowerCase();
        return !words.length || words.every(function (word) {
            return text.indexOf(word) !== -1;
        });
    }).slice(0, 160);

    if (title) {
        const h2 = title.querySelector('h2');
        if (h2) {
            h2.textContent = query ? '搜索：' + query : '影片搜索';
        }
    }

    results.innerHTML = matched.map(function (item) {
        const tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card" data-card>' +
            '<a href="' + item.url + '" class="card-cover" aria-label="观看' + escapeHtml(item.title) + '">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="play-dot">▶</span>' +
                '<span class="card-category">' + escapeHtml(item.category) + '</span>' +
            '</a>' +
            '<div class="card-body">' +
                '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>' +
                '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
        '</article>';
    }).join('');
})();

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char];
    });
}
