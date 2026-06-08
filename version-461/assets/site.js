const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const escapeHtml = (value) => String(value || "").replace(/[&<>"]/g, (char) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  };
  return map[char];
});

const normalize = (value) => String(value || "").toLowerCase().trim();

function setupMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  if (slides.length < 2) {
    return;
  }
  let current = 0;
  const activate = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  };
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      activate(Number(dot.dataset.heroDot || 0));
    });
  });
  window.setInterval(() => {
    activate(current + 1);
  }, 5600);
}

function setupCardFilter() {
  const input = document.querySelector("[data-card-filter]");
  const list = document.querySelector("[data-card-list]");
  if (!input || !list) {
    return;
  }
  const cards = Array.from(list.querySelectorAll("[data-movie-card]"));
  const applyFilter = () => {
    const query = normalize(input.value);
    let visibleCount = 0;
    cards.forEach((card) => {
      const text = normalize(card.dataset.filterText);
      const match = !query || text.includes(query);
      card.classList.toggle("hidden-by-filter", !match);
      if (match) {
        visibleCount += 1;
      }
    });
    let empty = list.querySelector("[data-empty-state]");
    if (!visibleCount) {
      if (!empty) {
        empty = document.createElement("div");
        empty.className = "empty-state";
        empty.dataset.emptyState = "true";
        empty.textContent = "没有找到匹配影片";
        list.appendChild(empty);
      }
    } else if (empty) {
      empty.remove();
    }
  };
  input.addEventListener("input", applyFilter);
}

function setupSorting() {
  const list = document.querySelector("[data-card-list]");
  if (!list) {
    return;
  }
  const buttons = Array.from(document.querySelectorAll("[data-sort-button]"));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.sortButton;
      const cards = Array.from(list.querySelectorAll("[data-movie-card]"));
      cards.sort((a, b) => {
        if (mode === "year") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
      });
      cards.forEach((card) => list.appendChild(card.closest(".rank-item") || card));
    });
  });
}

async function loadHlsClass() {
  try {
    const module = await import("./hls-vendor-dru42stk.js");
    return module.H;
  } catch (error) {
    return null;
  }
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll("[data-player]"));
  if (!players.length) {
    return;
  }
  let hlsClassPromise = null;
  players.forEach((player) => {
    const video = player.querySelector("video[data-hls-src]");
    const button = player.querySelector("[data-play-button]");
    const message = player.querySelector("[data-video-message]");
    if (!video || !button) {
      return;
    }
    const start = async () => {
      const source = video.dataset.hlsSrc;
      if (!source) {
        return;
      }
      if (!video.dataset.ready) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          if (!hlsClassPromise) {
            hlsClassPromise = loadHlsClass();
          }
          const Hls = await hlsClassPromise;
          if (Hls && Hls.isSupported && Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            player.hlsInstance = hls;
          } else {
            video.src = source;
          }
        }
        video.dataset.ready = "true";
      }
      try {
        await video.play();
        player.classList.add("playing");
        if (message) {
          message.textContent = "";
        }
      } catch (error) {
        if (message) {
          message.textContent = "当前浏览器暂时无法自动播放，请使用播放器控件继续。";
        }
      }
    };
    button.addEventListener("click", start);
    player.addEventListener("click", (event) => {
      if (event.target === video) {
        return;
      }
      if (!player.classList.contains("playing")) {
        start();
      }
    });
    video.addEventListener("play", () => player.classList.add("playing"));
    video.addEventListener("pause", () => player.classList.remove("playing"));
  });
}

function setupSearchPage() {
  const container = document.getElementById("search-results");
  if (!container || !window.SEARCH_DATA) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = normalize(params.get("q") || "");
  const heading = document.getElementById("search-heading");
  const summary = document.getElementById("search-summary");
  const source = Array.isArray(window.SEARCH_DATA) ? window.SEARCH_DATA : [];
  const results = query ? source.filter((item) => {
    const haystack = normalize([
      item.title,
      item.region,
      item.type,
      item.year,
      item.genre,
      item.category,
      (item.tags || []).join(" "),
      item.oneLine,
      item.summary
    ].join(" "));
    return haystack.includes(query);
  }) : source.slice(0, 48);
  if (heading) {
    heading.textContent = query ? `“${params.get("q") || ""}” 的搜索结果` : "热门影片入口";
  }
  if (summary) {
    summary.textContent = query ? `共找到 ${results.length} 部匹配影片` : "默认展示部分影片，可输入关键词进行精准检索。";
  }
  if (!results.length) {
    container.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
    return;
  }
  container.innerHTML = results.slice(0, 120).map((item) => {
    const tags = (item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="movie-card">
        <a class="poster-link" href="${escapeHtml(item.url)}">
          <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy">
          <span class="card-badge">${escapeHtml(item.category)}</span>
        </a>
        <div class="card-body">
          <a href="${escapeHtml(item.url)}"><h3>${escapeHtml(item.title)}</h3></a>
          <p>${escapeHtml(item.oneLine || item.summary || "")}</p>
          <div class="tag-list">${tags}</div>
          <div class="card-meta">
            <span>${escapeHtml(item.year)}</span>
            <span>${escapeHtml(item.region)}</span>
            <span>${escapeHtml(item.type)}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

ready(() => {
  setupMenu();
  setupHero();
  setupCardFilter();
  setupSorting();
  setupPlayers();
  setupSearchPage();
});
