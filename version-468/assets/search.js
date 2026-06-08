(function () {
  var input = document.querySelector('[data-search-input]');
  var button = document.querySelector('[data-search-button]');
  var results = document.querySelector('[data-search-results]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-search-chip]'));
  var data = window.movieSearchData || [];

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function render(items) {
    if (!results) {
      return;
    }

    if (!items.length) {
      results.innerHTML = '<div class="content-card"><h2>未找到相关影片</h2><p>可以尝试更换影片名称、地区、类型或年份关键词。</p></div>';
      return;
    }

    results.innerHTML = items.slice(0, 80).map(function (movie) {
      return [
        '<article class="movie-card medium">',
        '  <a class="card-cover" href="' + movie.url + '">',
        '    <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="card-play">▶</span>',
        '    <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function search(value) {
    var keyword = normalize(value);

    if (!keyword) {
      render(data.slice(0, 40));
      return;
    }

    render(data.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' '));
      return haystack.indexOf(keyword) !== -1;
    }));
  }

  if (input) {
    var query = new URLSearchParams(window.location.search).get('q') || '';
    input.value = query;
    input.addEventListener('input', function () {
      search(input.value);
    });
  }

  if (button) {
    button.addEventListener('click', function () {
      search(input ? input.value : '');
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      if (input) {
        input.value = chip.getAttribute('data-search-chip') || '';
      }
      search(input ? input.value : '');
    });
  });

  search(input ? input.value : '');
})();
