/*
{{ $src := resources.Get "js/common/common.js" | resources.Minify | resources.Fingerprint }}
*/
function isIE(){
    const explorer = window.navigator.userAgent;
    const res = explorer.indexOf("MSIE") >= 0 ? true : false
    return res
}

function displayWhenIE(elementId){
    if(isIE()){
        const el = document.getElementById(elementId)
        el.classList.add("is-active")
    }
}

import { toggleActive } from '{{ $src.RelPermalink }}';
toggleActive('.ie-icon-close', false);
displayWhenIE('ie-tips');