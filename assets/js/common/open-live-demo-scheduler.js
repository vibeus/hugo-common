/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/
import { openDemoScheduler, toggleActive } from '{{ $src.RelPermalink }}';

toggleActive('is-iframe-modal-new .modal-background-new, .modal-close-new', false);
const btn = document.querySelector(
  'section.is-book-demo-new .cta .button.is-open-live-demo-scheduler'
);
if (btn) {
  btn.addEventListener('click', (e) => {
    e.preventDefault();

    openDemoScheduler(
      null,
      '{{ .modalId }}',
      'https://meetings.hubspot.com/jian-zhao/vibe-follow-up'
    );
  });
}
