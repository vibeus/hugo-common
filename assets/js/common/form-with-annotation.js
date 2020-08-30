
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}

import { toggleActive } from '{{ $src.RelPermalink }}';

// {{/* make sure it is only called once in a single page when multiple forms exist */}}
toggleActive('.form.is-vibe-form .annotated .annotation-icon', true);
