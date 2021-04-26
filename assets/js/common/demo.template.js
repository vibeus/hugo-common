// {{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
import {
  bindScrollTo,
  toggleActive,
  setupForm,
  openDemoScheduler,
  isInBlacklist,
} from '{{ $src.RelPermalink }}';

const BLACKLIST = JSON.parse('{{ .blacklist | jsonify }}') || [];

const navbar = document.querySelector('.navbar.is-fixed-top');
const navbarHeight = navbar ? navbar.clientHeight : 0;
bindScrollTo('.is-request-demo', -navbarHeight);

const LIVE_DEMO_SELECTOR = 'input[name="vibe_lp_live_demo_request"]';

document.querySelectorAll('.form.is-vibe-form').forEach((el) => {
  setupForm(el, {
    'click.before': (name, type, form) => {
      if (name === 'request-demo') {
        const input = form.querySelector(LIVE_DEMO_SELECTOR);
        if (input) {
          input.value = 'true';
        }
      }

      // do not prevent default, continue form submission.
      return false;
    },
    'click.after': (name, type, form) => {
      if (name === 'request-demo') {
        form.parentElement.classList.add('is-live-demo');
        form.parentElement.classList.remove('is-video-demo');
        form.parentElement.classList.remove('is-contact-sales');
      } else if (name == 'request-video') {
        form.parentElement.classList.add('is-video-demo');
        form.parentElement.classList.remove('is-live-demo');
        form.parentElement.classList.remove('is-contact-sales')
      } else if (name == 'contact-sales') {
        form.parentElement.classList.add('is-contact-sales');
        form.parentElement.classList.remove('is-live-demo');
        form.parentElement.classList.remove('is-video-demo');
      }

      return false;
    },
    'submit.after': (name, type, form) => {
      document.getElementById('section-book-demo').classList.add('is-submitted');

      return false;
    }
  });
});

toggleActive('.modal-background, .modal-close', false);
