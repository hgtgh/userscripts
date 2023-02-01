// ==UserScript==
// @name         YouTube - Automatic translation of subtitles
// @namespace    hgtgh
// @version      1.0
// @description  Automatically translate subtitles into the browser language.
// @author       hgtgh
// @license      MIT
// @match        https://www.youtube.com/*
// @match        https://www.youtube-nocookie.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC8UlEQVRYR+2XTUhUURTHf1dnJkUhKkX6INSsIIpIoST6GDCCFgUVUYsiIhfuWpUiLoQQK1yIEEkIQoukLBeRQmBRSKiBZcX4hQziZ5GoWJjjjPM61zBKxuk+eunGA8N7M5zzP/97zz3n/kexzKaWOT8rBGztgGVZ2j8mStkspVTYTln/IJCXkbFnbzicvd6y0tMh2Q1r3JaVuAniBDQOpVxYlkferQhJNNasfGbELzgNgRGYFtLfpmCiX6nRz9D/Hj6U+/1NQnQOY45ACiTchdsn4MJfVmhncYv6tsPL83DRJ4Q0DfUcqnPkB0fQDUF6oOkUHFFHIesZtEpcrGGsY25CIEddhytFUO4Yqg0gSVqkauDOOcizEeeYawPcU83wJBuOG6MmJ0NuLlRWwvi4cVgkxxZoVL3wegvsN0bSBIaHoa8P8vOhrs44dKFjP7xTXfBxO+w0RklKgs5O0E9ttbVQWAi9shSbJnOiRxPoFgLbjGMXEtCBExNQUgIVFTKGZoyhZB8HVTd0SXbhYGiRCMyHtsuIKZKeqq83ApPJOKL8sgNp/7oD8+n0TuhzcVfmqoF90QQcKYFOVlUFxcUwNGSQ+qeLlGBYl8AnJdhhHLWwBG1tUFAgDdVoDDHvKIfQr2Qmt2yFfcbRmoBuw2m57/TBK5d5FggYh//u+Ek6UAn/hkw4ZoyQIndnaSmUlUFHh3FYJMe3ciGph1K9M3DZGClG9EjYluZYFPqFTBF1C65dhZvGBBx0lGF+Q8mVeOgxvHIQ1xhKbsDTKgvc1fB0F4g0WDqTA9jhhew5SbYbNt6HGunFg0tBQdrPdwnOihDy/RKlXq/XldnaevIAHN4QDqdtVmqdCNDVq5SKXwtaiLrlu0ue0ZWTUiHx0eI0OCY3Q8CyvotInRyAMZl8A2+g+UFi4qPu0dGverFRZbko2lgGBz0kJHiYmnLhdruk56MT8HhChEKzxMcHmZycITU1KApYE4potv4X/I/yrBBY9h34Ac5t4eLJiDi5AAAAAElFTkSuQmCC
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const preferredLanguage = navigator.language || document.documentElement.lang;
    const cache = { requestUrl: null, objectUrl: null };
    const originalOpenMethod = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function () {
        const apiUrl = new URL(arguments[1], location.href);
        if (apiUrl.pathname === "/api/timedtext") {
            const lang = apiUrl.searchParams.get("lang");
            if (lang && lang !== preferredLanguage) {
                const requestUrl = apiUrl.href;
                if (requestUrl === cache.requestUrl) {
                    arguments[1] = cache.objectUrl;
                } else {
                    URL.revokeObjectURL(cache.objectUrl);
                    this.addEventListener('load', () => {
                        cache.requestUrl = requestUrl;
                        cache.objectUrl = URL.createObjectURL(new Blob([this.responseText], { type: 'application/json' }));
                    });
                    apiUrl.searchParams.set('tlang', preferredLanguage);
                    arguments[1] = apiUrl.href;
                }
            }
        }

        return originalOpenMethod.apply(this, arguments);
    };

})();
