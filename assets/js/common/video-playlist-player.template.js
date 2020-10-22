/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/
import { activateOneOf, bindEventWithTarget } from '{{ $src.RelPermalink }}';

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
const playlistClass = '{{ .playlistClass }}';
const triggerClass = '{{ .triggerClass }}';
// {{ else }}
// {{ end }}

// {{ if .isVideoJS }}
// {{ else }}
let playerActive = false;
let videoPlayer = null;
let loadingPlayer = false;
const playerId = '{{ .playerId }}-iframe';
const playerContainerId = '{{ .playerId }}-container';
const playerContainerDOM = document.getElementById(playerContainerId);
const playlist = Array.from(document.querySelectorAll(playlistClass));
let idx = -1;
let lastRequired = null;

activateOneOf(playlistClass, true, (el) => {
  const videoId = el.dataset.videoId;
  idx = playlist.indexOf(el);

  if (!videoId) {
    if (videoPlayer) {
      videoPlayer.stopVideo();
    }
    if (playerContainerDOM) {
      playerDOM.classList.remove('is-active');
    }
    return;
  } else {
    if (playerContainerDOM) {
      playerContainerDOM.classList.add('is-active');
    }
  }
  if (videoPlayer) {
    videoPlayer.loadVideoById(videoId);
    videoPlayer.stopVideo();
  } else if (!loadingPlayer) {
    lastRequired = videoId;
    setupYTApi().then(() => {
      const player = new window.YT.Player(playerId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            videoPlayer = player;
            player.loadVideoById(lastRequired);
            player.stopVideo();
          },
          onStateChange: (event) => {
            if (event.data == YT.PlayerState.ENDED) {
              if (idx === playlist.length - 1) {
                return;
              }
              playlist[idx + 1].click();
            }
          },
        },
      });
    });
  }
});

bindEventWithTarget(triggerClass, 'click', (el) => {
  if (videoPlayer) {
    if (
      videoPlayer.getPlayerState() === YT.PlayerState.UNSTARTED ||
      videoPlayer.getPlayerState() === YT.PlayerState.PAUSED
    ) {
      videoPlayer.playVideo();
    } else if (videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
      videoPlayer.stopVideo();
    }
  }
});
// {{ end }}
