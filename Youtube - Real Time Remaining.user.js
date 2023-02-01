// ==UserScript==
// @name         YouTube - Real Time Remaining
// @namespace    hgtgh
// @version      1.0
// @description  Show the actual remaining time of a YouTube video according to the playback speed.
// @author       hgtgh
// @license      MIT
// @match        https://www.youtube.com/*
// @match        https://www.youtube-nocookie.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC8UlEQVRYR+2XTUhUURTHf1dnJkUhKkX6INSsIIpIoST6GDCCFgUVUYsiIhfuWpUiLoQQK1yIEEkIQoukLBeRQmBRSKiBZcX4hQziZ5GoWJjjjPM61zBKxuk+eunGA8N7M5zzP/97zz3n/kexzKaWOT8rBGztgGVZ2j8mStkspVTYTln/IJCXkbFnbzicvd6y0tMh2Q1r3JaVuAniBDQOpVxYlkferQhJNNasfGbELzgNgRGYFtLfpmCiX6nRz9D/Hj6U+/1NQnQOY45ACiTchdsn4MJfVmhncYv6tsPL83DRJ4Q0DfUcqnPkB0fQDUF6oOkUHFFHIesZtEpcrGGsY25CIEddhytFUO4Yqg0gSVqkauDOOcizEeeYawPcU83wJBuOG6MmJ0NuLlRWwvi4cVgkxxZoVL3wegvsN0bSBIaHoa8P8vOhrs44dKFjP7xTXfBxO+w0RklKgs5O0E9ttbVQWAi9shSbJnOiRxPoFgLbjGMXEtCBExNQUgIVFTKGZoyhZB8HVTd0SXbhYGiRCMyHtsuIKZKeqq83ApPJOKL8sgNp/7oD8+n0TuhzcVfmqoF90QQcKYFOVlUFxcUwNGSQ+qeLlGBYl8AnJdhhHLWwBG1tUFAgDdVoDDHvKIfQr2Qmt2yFfcbRmoBuw2m57/TBK5d5FggYh//u+Ek6UAn/hkw4ZoyQIndnaSmUlUFHh3FYJMe3ciGph1K9M3DZGClG9EjYluZYFPqFTBF1C65dhZvGBBx0lGF+Q8mVeOgxvHIQ1xhKbsDTKgvc1fB0F4g0WDqTA9jhhew5SbYbNt6HGunFg0tBQdrPdwnOihDy/RKlXq/XldnaevIAHN4QDqdtVmqdCNDVq5SKXwtaiLrlu0ue0ZWTUiHx0eI0OCY3Q8CyvotInRyAMZl8A2+g+UFi4qPu0dGverFRZbko2lgGBz0kJHiYmnLhdruk56MT8HhChEKzxMcHmZycITU1KApYE4potv4X/I/yrBBY9h34Ac5t4eLJiDi5AAAAAElFTkSuQmCC
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const HMSToSeconds = (str) => str.split(":").reduce((acc, time) => 60 * acc + +time)
    const secondsToHMS = (seconds) => {
        const h = (seconds / 3600) | 0;
        const m = (seconds / 60) % 60 | 0;
        const s = seconds % 60 | 0;
        return `${h ? h + ":" : ""}${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    const durationWithPlaybackSpeed = (seconds, speed) => Number.isFinite(speed) ? Math.floor(seconds / speed) : seconds

    let player, timeDurationElement

    // trigger when page is loaded directly
    new MutationObserver(function(mutationList, observer) {
        if (document.querySelector('.ytp-time-duration')) {
            observer.disconnect()
            load()
        }
    }).observe(document, {childList: true, subtree: true});

    // trigger during navigating
    document.addEventListener("yt-player-updated", function () {
        if (window.location.href.includes("/watch?v=")) {
            load()
        }
    });

    function load() {
        player = document.getElementsByTagName('video')[0]
        timeDurationElement = document.querySelector('.ytp-time-duration')

        addRealDuration()

        player.addEventListener("ratechange", addRealDuration)
        player.addEventListener("timeupdate", addTimeRemaining)
    }

    function createTimeItem(className) {
        const element = document.createElement("span")
        element.classList.add("ytp-time-separator", className)
        return element
    }

    function addRealDuration() {
        const realDurationClass = 'ytp-time-real-duration'
        let element = document.querySelector('.' + realDurationClass)

        if (player.playbackRate !== 1) {
            const playerDuration = player.duration || HMSToSeconds(timeDurationElement.childNodes[0].nodeValue)
            const duration = durationWithPlaybackSpeed(playerDuration, player.playbackRate)

            const realDurationNode = element || createTimeItem(realDurationClass)
            realDurationNode.innerText = ` (${secondsToHMS(duration)} at x${player.playbackRate})`

            timeDurationElement.appendChild(realDurationNode)
        } else if (element) {
            element.remove()
        }
    }

    function addTimeRemaining() {
        const remainingClass = 'ytp-time-remaining'
        let element = document.querySelector('.' + remainingClass)

        let remainingTime = player.duration - player.currentTime

        if (player.playbackRate !== 1) {
            remainingTime = durationWithPlaybackSpeed(remainingTime, player.playbackRate)
        }

        const remainingNode = element || createTimeItem(remainingClass)
        remainingNode.innerText = ` / -${secondsToHMS(remainingTime)}`

        timeDurationElement.parentElement.insertBefore(remainingNode, timeDurationElement.nextSibling)
    }

})();
