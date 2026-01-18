// MISpal Custom Loading Animation - Video-based Loading Screen
class LoadingAnimation {
  constructor() {
    this.isAnimating = false;
    this.animationFrame = null;
    this.init();
  }
  
  init() {
    // Create loading overlay with video
    const overlay = document.createElement('div');
    overlay.id = 'mispal-loading';
    overlay.className = 'mispal-loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <video id="loading-video-overlay" playsinline muted autoplay style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
          <source src="/videoloadtest2.MP4" type="video/mp4">
        </video>
        <div class="loading-fallback" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); flex-direction: column; align-items: center; justify-content: center;">
          <div style="font-size: 3rem; margin-bottom: 2rem;">📚</div>
          <div style="color: white; font-size: 1.2rem; font-weight: 500;">Loading MISpal...</div>
        </div>
      </div>
    `;
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 9999; display: none; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;';
    document.body.appendChild(overlay);
  }
  
  show() {
    const overlay = document.getElementById('mispal-loading');
    if (!overlay) {
      this.init();
      return this.show();
    }
    
    overlay.style.display = 'flex';
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);
    
    this.isAnimating = true;
    
    // Try to play the video
    const videoOverlay = document.getElementById('loading-video-overlay');
    if (videoOverlay) {
      videoOverlay.play().catch(err => {
        console.log('Video autoplay failed, showing fallback');
        const fallback = overlay.querySelector('.loading-fallback');
        if (fallback) {
          fallback.style.display = 'flex';
          videoOverlay.style.display = 'none';
        }
      });
    }
  }
  
  hide() {
    const overlay = document.getElementById('mispal-loading');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        this.isAnimating = false;
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
        }
      }, 300);
    }
  }
}

// Global functions
let loadingAnimation;

function showLoading() {
  if (!loadingAnimation) {
    loadingAnimation = new LoadingAnimation();
  }
  loadingAnimation.show();
}

function hideLoading() {
  if (loadingAnimation) {
    loadingAnimation.hide();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadingAnimation = new LoadingAnimation();
});
