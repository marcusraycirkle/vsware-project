const videoEl = document.getElementById('loading-video');
const fallbackLoader = document.getElementById('fallback-loader');

// Keep a short branded intro, then leave as soon as the app is ready.
const MIN_BRAND_TIME_MS = 1200;
const READY_CHECK_INTERVAL_MS = 400;
const MAX_WAIT_MS = 10000;

let startedAt = Date.now();
let redirected = false;
let appReady = false;
let pollTimer = null;
let delayedRedirectTimer = null;

function redirectToLanding() {
    if (redirected) {
        return;
    }

    redirected = true;
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
    if (delayedRedirectTimer) {
        clearTimeout(delayedRedirectTimer);
        delayedRedirectTimer = null;
    }
    sessionStorage.setItem('pageLoaded', 'true');
    window.location.replace('/home');
}

function maybeRedirect() {
    if (!appReady || redirected) {
        return;
    }

    const elapsed = Date.now() - startedAt;
    if (elapsed >= MIN_BRAND_TIME_MS) {
        redirectToLanding();
        return;
    }

    if (!delayedRedirectTimer) {
        delayedRedirectTimer = setTimeout(redirectToLanding, MIN_BRAND_TIME_MS - elapsed);
    }
}

async function checkAppReady() {
    if (redirected) {
        return;
    }

    try {
        const res = await fetch('/home', {
            method: 'GET',
            cache: 'no-store'
        });

        if (res.ok) {
            appReady = true;
            maybeRedirect();
        }
    } catch (err) {
        // Keep polling until ready or timeout.
    }
}

function startReadinessPolling() {
    checkAppReady();
    pollTimer = setInterval(checkAppReady, READY_CHECK_INTERVAL_MS);

    setTimeout(() => {
        if (pollTimer) {
            clearInterval(pollTimer);
        }

        // Hard failsafe so loader can never hang.
        if (!redirected) {
            redirectToLanding();
        }
    }, MAX_WAIT_MS);
}

if (!videoEl) {
    redirectToLanding();
} else {
    videoEl.loop = true;
    videoEl.muted = true;

    videoEl.addEventListener('error', () => {
        if (fallbackLoader) {
            fallbackLoader.classList.add('show');
        }
    });

    videoEl.addEventListener('canplay', () => {
        videoEl.play().catch(() => {
            if (fallbackLoader) {
                fallbackLoader.classList.add('show');
            }
        });
    });

    window.addEventListener('load', () => {
        startReadinessPolling();

        if (videoEl.readyState >= 2) {
            videoEl.play().catch(() => {
                if (fallbackLoader) {
                    fallbackLoader.classList.add('show');
                }
            });
        }
    });
}
