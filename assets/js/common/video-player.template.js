{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
import { toggleActive } from '{{ $src.RelPermalink }}';

let videoPlayer = null;

function setupYoutubePlayer(playerId, videoId) {
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
        },
      }
    });
  }
}

setupYoutubePlayer('{{ .playerId }}-iframe', '{{ .videoId }}');
toggleActive('{{ .triggerClass }}, #{{ .playerId }} .modal-close, #{{ .playerId }} .modal-background', false, isActive => {
  if (!videoPlayer) {
    return;
  }

  if (isActive) {
    videoPlayer.playVideo();
  } else {
    videoPlayer.stopVideo();
  }
});
