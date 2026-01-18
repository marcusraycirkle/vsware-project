const videoEl = document.getElementById('loading-video');
const fallbackLoader = document.getElementById('fallback-loader');
let videoEnded = false;
let videoLoaded = false;

// Handle video end
videoEl.addEventListener('ended', () => {
    videoEnded = true;
    redirectToLanding();
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

// Timeout failsafe - if nothing happens in 15 seconds, go to landing page
setTimeout(() => {
    if (!videoEnded) {
        redirectToLanding();
    }
}, 15000);

function redirectToLanding() {
    // Check if user came from a refresh/back navigation
    if (sessionStorage.getItem('loadingShown')) {
        // Already showed loading once this session, skip to home
        window.location.pathname = '/home';
        return;
    }
    
    // Mark that we showed loading
    sessionStorage.setItem('loadingShown', 'true');
    
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
