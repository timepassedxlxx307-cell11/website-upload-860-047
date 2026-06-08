(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function setupSearchForms() {
    qsa('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input', form);
        var value = input ? input.value.trim() : '';
        var url = './search.html';

        if (value) {
          url += '?q=' + encodeURIComponent(value);
        }

        window.location.href = url;
      });
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (slides.length > 1) {
      show(0);
      start();
    }
  }

  function sortCards(grid, mode) {
    var cards = qsa('.movie-card', grid);
    var sorted = cards.slice().sort(function (a, b) {
      if (mode === 'rating') {
        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
      }

      if (mode === 'year') {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      }

      return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
    });

    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function setupFiltering() {
    var grids = qsa('[data-filter-grid]');

    grids.forEach(function (grid) {
      var cards = qsa('.movie-card', grid);
      var searchInput = qs('[data-page-search]');
      var empty = qs('[data-empty-state]');
      var chips = qsa('[data-filter-chip]');
      var sortSelect = qs('[data-sort-select]');
      var currentFilter = 'all';

      function apply() {
        var query = normalize(searchInput ? searchInput.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.category,
            card.dataset.year
          ].join(' '));
          var categoryMatch = currentFilter === 'all' || card.dataset.categorySlug === currentFilter;
          var queryMatch = !query || text.indexOf(query) !== -1;
          var shouldShow = categoryMatch && queryMatch;

          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');

        if (initial) {
          searchInput.value = initial;
        }

        searchInput.addEventListener('input', apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          currentFilter = chip.dataset.filterChip || 'all';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          apply();
        });
      });

      if (sortSelect) {
        sortCards(grid, sortSelect.value);
        sortSelect.addEventListener('change', function () {
          sortCards(grid, sortSelect.value);
          apply();
        });
      }

      apply();
    });
  }

  function setupPlayer() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('[data-play-button]', shell);
      var status = qs('[data-player-status]');
      var src = shell.dataset.videoSrc;
      var initialized = false;
      var hlsInstance = null;

      if (!video || !src) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function initialize() {
        if (initialized) {
          return;
        }

        initialized = true;
        setStatus('正在载入高清片源');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          setStatus('片源已就绪');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('片源已就绪');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('片源暂时无法载入');
            }
          });
        } else {
          video.src = src;
          setStatus('已切换为浏览器原生播放');
        }
      }

      function play() {
        initialize();
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setStatus('点击播放器继续播放');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setStatus('正在播放');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          setStatus('已暂停');
        }
      });

      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
        setStatus('播放结束');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFiltering();
    setupPlayer();
  });
})();
