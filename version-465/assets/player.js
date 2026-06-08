(function () {
  function mountMoviePlayer(sourceUrl) {
    const video = document.querySelector('[data-player-video]');
    const overlay = document.querySelector('[data-play-overlay]');
    const state = document.querySelector('[data-player-state]');
    let attached = false;
    let hls = null;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    const showState = function (message) {
      if (state) {
        state.textContent = message;
        state.hidden = false;
      }
    };

    const attach = function () {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showState('视频加载失败，请稍后重试');
          }
        });
        return;
      }

      showState('视频加载失败，请稍后重试');
    };

    const start = function () {
      attach();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    };

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.mountMoviePlayer = mountMoviePlayer;
})();
