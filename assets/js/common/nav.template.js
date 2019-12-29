{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
import { toggleActive } from '{{ $src.RelPermalink }}';

toggleActive('.navbar-burger', true);
