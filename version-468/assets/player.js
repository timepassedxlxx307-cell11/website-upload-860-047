function setupPlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var ready = false;

  if (!video || !button || !streamUrl) {
    return;
  }

  function bind() {
    if (ready) {
      return;
    }

    ready = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    bind();
    button.classList.add('hidden');
    var started = video.play();

    if (started && typeof started.catch === 'function') {
      started.catch(function () {
        button.classList.remove('hidden');
      });
    }
  }

  button.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
