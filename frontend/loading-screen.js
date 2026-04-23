const videoEl = document.getElementById('loading-video');
const fallbackLoader = document.getElementById('fallback-loader');
let videoEnded = false;
let videoLoaded = false;
let isInitialLoad = !sessionStorage.getItem('pageLoaded');

videoEl.loop = true;
videoEl.muted = true;

// Keep the loading animation cycling until the page transition happens.
videoEl.addEventListener('ended', () => {
    videoEnded = true;
    if (!videoEl.loop) {
        redirectToLanding();
    }
});

// Handle video error (fallback if video not found)
videoEl.addEventListener('error', () => {
    fallbackLoader.classList.add('show');
    // Wait 3 seconds then redirect
    setTimeout(redirectToLanding, 3000);
});

// Handle video metadata loaded
videoEl.addEventListener('loadedmetadata', () => {
    videoLoaded = true;
    // If video is very short or already played, redirect after a moment
    if (videoEl.duration && videoEl.duration < 1) {
        setTimeout(redirectToLanding, 1000);
    }
});

// Handle can play
videoEl.addEventListener('canplay', () => {
    videoEl.play().catch(err => {
        console.log('Autoplay failed, showing fallback:', err);
        fallbackLoader.classList.add('show');
        setTimeout(redirectToLanding, 3000);
    });
});

// Timeout failsafe
// For initial load: play full video cycle then redirect
// For refresh: redirect after 10 seconds max (video will be shown as loading overlay)
const timeoutDuration = isInitialLoad ? 15000 : 10000;
setTimeout(() => {
    redirectToLanding();
}, timeoutDuration);

function redirectToLanding() {
    // Mark that we've loaded the page
    sessionStorage.setItem('pageLoaded', 'true');
    
    // Redirect to home/landing page
    window.location.pathname = '/home';
}

// Start playback immediately
window.addEventListener('load', () => {
    // If video is ready and hasn't played yet, play it
    if (videoEl.readyState >= 2) {
        videoEl.play().catch(err => {
            console.log('Autoplay prevention, showing fallback');
            fallbackLoader.classList.add('show');
            setTimeout(redirectToLanding, 3000);
        });
    }
});
