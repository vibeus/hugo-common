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
        window.YTCallback.forEach(resolveFn => { resolveFn() });
      };
    }
  });
}
// {{ end }}

// {{ if .isInplace }}
const playlistSelector = '{{ .playlistSelector }}';
const triggerSelector = '{{ .triggerSelector }}';
// {{ else }}
// {{ end }}

// {{ if .isVideoJS }}
// {{ else }}
let playerActive = false;
let videoPlayer = null;
let loadingPlayer = false;
const playerId = '{{ .playerId }}';
const playerIframWrapper = document.getElementById(playerId);
const playerIframeId = '{{ .playerId }}-iframe';
const playerContainerId = '{{ .playerId }}-container';
const playerContainerDOM = document.getElementById(playerContainerId);
const playlist = Array.from(document.querySelectorAll(playlistSelector));
let idx = -1;
let lastRequired = null;
const thumbnailPlaceholderSelector = '{{ .thumbnailPlaceholderSelector }}';
const thumbnailPlaceholderId = '{{ .thumbnailPlaceholderId }}';
const thumbnailPlaceholder = document.getElementById(thumbnailPlaceholderId);
const showThumbnail = !!thumbnailPlaceholder;
const thumbnailImageSelector = '{{ .thumbnailImageSelector }}'
const thumbnailImage = showThumbnail ? thumbnailPlaceholder.querySelector(thumbnailImageSelector) : null;

showThumbnail && thumbnailImage.addEventListener('load', () => {
  thumbnailPlaceholder.classList.add('is-active');
  playerIframWrapper.classList.add('is-active');
});

function changeThumbnail(videoId) {
  playerIframWrapper.classList.remove('is-active');
  thumbnailImage.src = `https://i1.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

bindEventWithTarget(thumbnailPlaceholderSelector, 'click', (el) => {
  if (videoPlayer) {
    showThumbnail && thumbnailPlaceholder.classList.remove('is-active');
    if (
      videoPlayer.getPlayerState() === YT.PlayerState.CUED ||
      videoPlayer.getPlayerState() === YT.PlayerState.PAUSED
    ) {
      videoPlayer.playVideo();
    } else if (videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
      videoPlayer.stopVideo();
    }
  }
});

activateOneOf(playlistSelector, true, (el) => {
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
    showThumbnail && changeThumbnail(videoId);
  } else if (!loadingPlayer) {
    lastRequired = videoId;
    setupYTApi().then(() => {
      const player = new window.YT.Player(playerIframeId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            showThumbnail && changeThumbnail(lastRequired);
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

// {{ end }}
