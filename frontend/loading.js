// MISpal Custom Loading Animation - Logo Reveal/Unreveal
class LoadingAnimation {
  constructor() {
    this.isAnimating = false;
    this.animationFrame = null;
    this.init();
  }
  
  init() {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'mispal-loading';
    overlay.className = 'mispal-loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="logo-reveal-container">
          <img src="/mispal-logo.png" alt="MISpal" class="loading-logo" id="loading-logo-img">
          <div class="logo-reveal-mask" id="logo-reveal-mask"></div>
        </div>
        <div class="loading-text">Loading
          <span class="loading-dot">.</span>
          <span class="loading-dot">.</span>
          <span class="loading-dot">.</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  
  show() {
    const overlay = document.getElementById('mispal-loading');
    if (!overlay) {
      this.init();
      return this.show();
    }
    
    overlay.classList.add('visible');
    this.isAnimating = true;
    this.startAnimation();
  }
  
  hide() {
    const overlay = document.getElementById('mispal-loading');
    if (overlay) {
      setTimeout(() => {
        overlay.classList.remove('visible');
        this.isAnimating = false;
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
        }
      }, 100);
    }
  }
  
  async startAnimation() {
    while (this.isAnimating) {
      await this.animateReveal();
      if (!this.isAnimating) break;
      await this.pause(800);
      await this.animateUnreveal();
      if (!this.isAnimating) break;
      await this.pause(500);
    }
  }
  
  animateReveal() {
    return new Promise(resolve => {
      const mask = document.getElementById('logo-reveal-mask');
      if (!mask) {
        resolve();
        return;
      }
      
      mask.style.transition = 'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)';
      mask.style.width = '0%';
      
      setTimeout(resolve, 1500);
    });
  }
  
  animateUnreveal() {
    return new Promise(resolve => {
      const mask = document.getElementById('logo-reveal-mask');
      if (!mask) {
        resolve();
        return;
      }
      
      mask.style.transition = 'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)';
      mask.style.width = '100%';
      
      setTimeout(resolve, 1500);
    });
  }
  
  pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
