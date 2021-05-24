// {{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
import { bindScrollTo, toggleActive, setupForm } from '{{ $src.RelPermalink }}';

const navbar = document.querySelector('.navbar.is-fixed-top');
const navbarHeight = navbar ? navbar.clientHeight : 0;
bindScrollTo('.is-request-demo', -navbarHeight);

document.querySelectorAll('.form.is-vibe-form').forEach((el) => {
  setupForm(el, {
    'click.after': (name, type, form) => {
      if (name === 'request-demo') {
        form.parentElement.classList.add('is-live-demo');
        form.parentElement.classList.remove('is-video-demo');
        form.parentElement.classList.remove('is-contact-sales');
      } else if (name == 'request-video') {
        form.parentElement.classList.add('is-video-demo');
        form.parentElement.classList.remove('is-live-demo');
        form.parentElement.classList.remove('is-contact-sales');
      } else if (name == 'contact-sales') {
        form.parentElement.classList.add('is-contact-sales');
        form.parentElement.classList.remove('is-live-demo');
        form.parentElement.classList.remove('is-video-demo');
      }

      return false;
    },
    'submit.after': (name, type, form) => {
      form
        .closest('.section.is-book-demo')
        .classList.add('is-submitted');

      return false;
    },
  });
});
