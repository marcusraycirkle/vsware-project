// MISpal Custom Loading Animation
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
        <svg id="mispal-logo-svg" width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <!-- M letter -->
          <path id="logo-m" d="M 30 140 L 30 60 L 50 90 L 70 60 L 70 140" 
                stroke="#2563EB" stroke-width="6" fill="none" 
                stroke-dasharray="1000" stroke-dashoffset="1000"
                stroke-linecap="round" stroke-linejoin="round"/>
          
          <!-- I letter -->
          <path id="logo-i" d="M 90 60 L 110 60 M 100 60 L 100 140 M 90 140 L 110 140" 
                stroke="#2563EB" stroke-width="6" fill="none"
                stroke-dasharray="1000" stroke-dashoffset="1000"
                stroke-linecap="round" stroke-linejoin="round"/>
          
          <!-- S letter -->
          <path id="logo-s" d="M 150 65 Q 130 60, 120 70 Q 120 80, 130 85 Q 140 90, 140 100 Q 140 110, 130 115 Q 120 120, 110 115" 
                stroke="#2563EB" stroke-width="6" fill="none"
                stroke-dasharray="1000" stroke-dashoffset="1000"
                stroke-linecap="round" stroke-linejoin="round"/>
          
          <!-- Outer circle -->
          <circle id="logo-circle" cx="100" cy="100" r="85" 
                  stroke="#2563EB" stroke-width="4" fill="none"
                  stroke-dasharray="1000" stroke-dashoffset="1000"/>
          
          <!-- Graduation cap accent -->
          <path id="logo-cap" d="M 100 30 L 85 35 L 100 40 L 115 35 Z M 100 40 L 100 45" 
                stroke="#2563EB" stroke-width="3" fill="none"
                stroke-dasharray="1000" stroke-dashoffset="1000"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="loading-text">
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
      // Finish current animation cycle before hiding
      setTimeout(() => {
        overlay.classList.remove('visible');
        this.isAnimating = false;
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
        }
      }, 100);
    }
  }
  
  startAnimation() {
    if (!this.isAnimating) return;
    
    // Animation sequence
    this.animateDrawing()
      .then(() => this.animateComplete())
      .then(() => this.animateZoomIn())
      .then(() => this.animateZoomOut())
      .then(() => this.animateErase())
      .then(() => {
        if (this.isAnimating) {
          setTimeout(() => this.startAnimation(), 500);
        }
      });
  }
  
  animateDrawing() {
    return new Promise(resolve => {
      const elements = [
        document.getElementById('logo-m'),
        document.getElementById('logo-i'),
        document.getElementById('logo-s'),
        document.getElementById('logo-circle'),
        document.getElementById('logo-cap')
      ];
      
      const duration = 2000; // 2 seconds for drawing
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        elements.forEach((el, index) => {
          if (!el) return;
          const elementProgress = Math.max(0, Math.min((progress * elements.length - index) / 1, 1));
          const offset = 1000 * (1 - this.easeInOutCubic(elementProgress));
          el.style.strokeDashoffset = offset;
        });
        
        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  animateComplete() {
    return new Promise(resolve => {
      const elements = [
        document.getElementById('logo-m'),
        document.getElementById('logo-i'),
        document.getElementById('logo-s')
      ];
      
      elements.forEach(el => {
        if (el) {
          el.style.fill = '#2563EB';
          el.style.fillOpacity = '0';
          el.style.transition = 'fill-opacity 0.5s ease';
          setTimeout(() => {
            el.style.fillOpacity = '0.2';
          }, 50);
        }
      });
      
      setTimeout(resolve, 600);
    });
  }
  
  animateZoomIn() {
    return new Promise(resolve => {
      const svg = document.getElementById('mispal-logo-svg');
      if (svg) {
        svg.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        svg.style.transform = 'scale(1.3)';
      }
      setTimeout(resolve, 700);
    });
  }
  
  animateZoomOut() {
    return new Promise(resolve => {
      const svg = document.getElementById('mispal-logo-svg');
      if (svg) {
        svg.style.transition = 'transform 0.5s ease';
        svg.style.transform = 'scale(1)';
      }
      setTimeout(resolve, 600);
    });
  }
  
  animateErase() {
    return new Promise(resolve => {
      const elements = [
        document.getElementById('logo-cap'),
        document.getElementById('logo-circle'),
        document.getElementById('logo-s'),
        document.getElementById('logo-i'),
        document.getElementById('logo-m')
      ];
      
      const duration = 1500; // 1.5 seconds for erasing
      const startTime = Date.now();
      
      // Reset fills
      elements.forEach(el => {
        if (el) {
          el.style.fill = 'none';
          el.style.fillOpacity = '0';
        }
      });
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        elements.forEach((el, index) => {
          if (!el) return;
          const elementProgress = Math.max(0, Math.min((progress * elements.length - index) / 1, 1));
          const offset = 1000 * this.easeInOutCubic(elementProgress);
          el.style.strokeDashoffset = offset;
        });
        
        if (progress < 1) {
          this.animationFrame = requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
  showLoading();
  
  // Hide loading after initial page load (3 seconds minimum)
  setTimeout(() => {
    hideLoading();
  }, 3000);
});
