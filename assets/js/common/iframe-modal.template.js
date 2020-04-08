/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/
import { toggleActive } from '{{ $src.RelPermalink }}';

toggleActive(
  '{{ .triggerClass }}, #{{ .iframeModalId }} .modal-close, #{{ .iframeModalId }} .modal-background',
  false,
  (isActive) => {
    if (!isActive) {
      return;
    }

    const el = document.getElementById('{{ .iframeModalId }}-iframe');
    if (el && !el.firstElementChild) {
      const f = document.createElement('iframe');
      f.src = 'https://landing.vibe.us/request-demo';
      f.height = '100%';
      f.width = '100%';
      f.scrolling = 'no';

      el.appendChild(f);
    }
  }
);

toggleActive('.faq-title', false);
toggleActive('.toggle-specs', true);
