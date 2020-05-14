/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/
import { toggleActive } from '{{ $src.RelPermalink }}';

// {{ if not .isVideoJS }}
function setupYTApi() {
  if (window.YTApiReady) {
    return Promise.resolve();
  }

  let loadApi = false;
  if (!window.YTCallback) {
    window.YTCallback = [];
    loadApi = true;
  }

  return new Promise((resolve) => {
    window.YTCallback.push(resolve);
    if (loadApi) {
      const tag = document.createElement('script');

      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        window.YTApiReady = true;
        window.YTCallback.forEach(resolve);
      };
    }
  });
}
// {{ end }}

// {{ if .isInplace }}
const toggleClass = '{{ .triggerClass }}';
// {{ else }}
const toggleClass =
  '{{ .triggerClass }}, #{{ .playerId }} .modal-close, #{{ .playerId }} .modal-background';
// {{ end }}

// {{ if .isVideoJS }}
let playerLoaded = false;
toggleActive(toggleClass, false, (isActive) => {
  const player = videojs('{{ .playerId }}-player');
  // {{ if .isInplace }}
  if (isActive && !playerLoaded) {
    player.ready(() => player.play());
    playerLoaded = true;
  }
  // {{ else }}
  if (isActive) {
    player.ready(() => player.play());
  } else {
    player.pause();
    player.currentTime(0);
  }
  // {{ end }}
});

// {{ else }}
let playerActive = false;
let videoPlayer = null;
let loadingPlayer = false;

toggleActive(toggleClass, false, (isActive, el) => {
  playerActive = isActive;

  if (isActive) {
    let videoId = '{{ default "" .videoId }}';
    if (el.dataset.videoId) {
      videoId = el.dataset.videoId;
    }

    if (!videoId) {
      console.error('Unknown video Id.');
      return;
    }

    if (videoPlayer) {
      videoPlayer.loadVideoById(videoId);
      videoPlayer.playVideo();
    } else if (!loadingPlayer) {
      const playerId = '{{ .playerId }}-iframe';
      setupYTApi().then(() => {
        const player = new window.YT.Player(playerId, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            rel: 0,
          },
          events: {
            onReady: () => {
              videoPlayer = player;
              if (playerActive) {
                player.playVideo();
              }
            },
          },
        });
      });
    }
  } else {
    if (videoPlayer) {
      videoPlayer.stopVideo();
    }
  }
});
// {{ end }}
