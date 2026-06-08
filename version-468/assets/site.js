(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobileNav = qs('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  qsa('[data-card-filter]').forEach(function (panel) {
    var input = qs('[data-filter-input]', panel);
    var buttons = qsa('[data-filter-value]', panel);
    var list = qs('[data-filter-list]') || panel.nextElementSibling;
    var activeValue = '';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var cards = qsa('.movie-card', list || document);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesValue = !activeValue || text.indexOf(normalize(activeValue)) !== -1;
        card.style.display = matchesKeyword && matchesValue ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeValue = button.getAttribute('data-filter-value') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  });
})();
