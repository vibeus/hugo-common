{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
import { toggleActive } from '{{ $src.RelPermalink }}';

let loadingPlayer = false;
let videoPlayer = null;
let modalVisible = false;

function setupYoutubePlayer(playerId, videoId) {
  loadingPlayer = true;
  const tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = () => {
    const player = new YT.Player(playerId, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      events: {
        'onReady': () => {
          videoPlayer = player;
          if (modalVisible) {
            player.playVideo();
          }
        },
      }
    });
  }
}

toggleActive('{{ .triggerClass }}, #{{ .playerId }} .modal-close, #{{ .playerId }} .modal-background', false, isActive => {
  modalVisible = isActive;

  if (isActive) {
    if (videoPlayer) {
      videoPlayer.playVideo();
    } else if (!loadingPlayer) {
      setupYoutubePlayer('{{ .playerId }}-iframe', '{{ .videoId }}');
    }
  } else {
    if (videoPlayer) {
      videoPlayer.stopVideo();
    }
  }
});
