(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  const hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const startTimer = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  const filterPanel = document.querySelector('[data-filter-form]');

  if (filterPanel) {
    const input = filterPanel.querySelector('[data-filter-input]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const result = filterPanel.querySelector('[data-filter-result]');
    const items = Array.from(document.querySelectorAll('[data-filter-item]'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    const normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    const applyFilter = function () {
      const query = normalize(input ? input.value : '');
      const year = yearSelect ? yearSelect.value : '全部年份';
      let shown = 0;

      items.forEach(function (item) {
        const text = normalize(item.dataset.filterText);
        const itemYear = item.dataset.year || '';
        const queryMatched = !query || text.indexOf(query) !== -1;
        const yearMatched = !year || year === '全部年份' || itemYear === year;
        const visible = queryMatched && yearMatched;
        item.classList.toggle('is-hidden', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (result) {
        result.textContent = shown + ' 部影片';
      }
    };

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  }
})();
