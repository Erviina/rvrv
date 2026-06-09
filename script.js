// Scrapbook Interactive Client Logic
document.addEventListener('DOMContentLoaded', () => {
  
  // ================= 1. CUSTOM FRIEND NAME CONFIGURATION =================
  // If the user wants to rename Chloe to another name, they can easily change this constant.
  const FRIEND_NAME = "Naila Jenipa";
  document.querySelectorAll('.friend-name').forEach(el => {
    el.textContent = FRIEND_NAME;
  });

  // ================= 2. EDITABLE LETTER AUTO-SAVE =================
  const letterEl = document.getElementById('editable-letter');
  if (letterEl) {
    // Load saved letter from localstorage if available
    const savedLetter = localStorage.getItem('birthday_scrapbook_letter');
    if (savedLetter) {
      letterEl.innerHTML = savedLetter;
    }

    // Auto-save on typing/editing
    letterEl.addEventListener('input', () => {
      localStorage.setItem('birthday_scrapbook_letter', letterEl.innerHTML);
    });
  }

  // ================= 3. SCROLL REVEAL ANIMATIONS =================
  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Custom trigger for confetti when final section is revealed
        if (entry.target.id === 'sec-final' || entry.target.closest('#sec-final')) {
          triggerFinalConfetti();
        }
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // ================= 4. ENVELOPE INTERACTION =================
  const envelopes = document.querySelectorAll('.envelope-wrapper');
  envelopes.forEach(envelope => {
    envelope.addEventListener('click', (e) => {
      const isOpened = envelope.classList.contains('opened');
      
      // Close other envelopes to keep it tidy
      envelopes.forEach(env => env.classList.remove('opened'));
      
      if (!isOpened) {
        envelope.classList.add('opened');
        // Spawn hearts at click location
        spawnHeartBurst(e.clientX, e.clientY);
      }
    });
  });

  // ================= 5. BUTTON ACTIONS (SMOOTH SCROLL & EFFECTS) =================
  const btnOpen = document.getElementById('btn-open-scrapbook');
  const btnReplay = document.getElementById('btn-replay');

  if (btnOpen) {
    btnOpen.addEventListener('click', (e) => {
      spawnHeartBurst(e.clientX, e.clientY);
      
      // Delay slightly for visual effect before scrolling
      setTimeout(() => {
        const introSec = document.getElementById('sec-intro');
        if (introSec) {
          introSec.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    });
  }

  if (btnReplay) {
    btnReplay.addEventListener('click', (e) => {
      spawnHeartBurst(e.clientX, e.clientY);
      
      // Reset all envelopes
      envelopes.forEach(env => env.classList.remove('opened'));
      
      // Scroll smoothly to top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Remove active class from reveals to replay animations on scroll down
        setTimeout(() => {
          revealElements.forEach(el => {
            if (el.id !== 'sec-intro') { // Keep intro active so it feels seamless
              el.classList.remove('active');
            }
          });
        }, 1000);
      }, 300);
    });
  }

  // ================= 6. FLOATING HEARTS BURST SYSTEM =================
  function spawnHeartBurst(x, y) {
    const shapes = ['💖', '💕', '🌸', '✨', '💝', '🎀'];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'heart-particle';
      particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      
      // Set random translation directions and rotations in CSS properties
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const velocity = Math.random() * 120 + 80;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 100; // Pull upwards
      const tr = Math.random() * 360 - 180;
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      particle.style.setProperty('--tr', `${tr}deg`);
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y + window.scrollY}px`;
      
      document.body.appendChild(particle);
      
      // Clean up after animation finishes
      particle.addEventListener('animationend', () => {
        particle.remove();
      });
    }
  }

  // ================= 7. CURSOR TRAIL SPARKLE ENGINE =================
  const sparkleCanvas = document.getElementById('sparkle-canvas');
  if (sparkleCanvas) {
    class SparkleTrail {
      constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('touchmove', (e) => this.onTouchMove(e));
      }

      resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }

      onMouseMove(e) {
        if (Math.random() < 0.4) {
          this.spawn(e.clientX, e.clientY);
        }
      }

      onTouchMove(e) {
        if (e.touches.length > 0 && Math.random() < 0.4) {
          this.spawn(e.touches[0].clientX, e.touches[0].clientY);
        }
      }

      spawn(x, y) {
        const colors = ['#FFD6E7', '#E8D8FF', '#FAF6EE', '#FFE5D9', '#FFF0F5', '#E2F5EE'];
        this.particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.3,
          size: Math.random() * 4 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015
        });
        if (this.particles.length === 1) {
          this.animate();
        }
      }

      animate() {
        if (this.particles.length === 0) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
          let p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;
          
          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }
          
          this.ctx.save();
          this.ctx.globalAlpha = p.alpha;
          this.ctx.fillStyle = p.color;
          
          // Draw four-point star shape
          this.ctx.beginPath();
          const cx = p.x;
          const cy = p.y;
          const r = p.size;
          this.ctx.moveTo(cx, cy - r);
          this.ctx.quadraticCurveTo(cx, cy, cx + r, cy);
          this.ctx.quadraticCurveTo(cx, cy, cx, cy + r);
          this.ctx.quadraticCurveTo(cx, cy, cx - r, cy);
          this.ctx.quadraticCurveTo(cx, cy, cx, cy - r);
          this.ctx.closePath();
          this.ctx.fill();
          
          this.ctx.restore();
        }
        
        requestAnimationFrame(() => this.animate());
      }
    }

    new SparkleTrail(sparkleCanvas);
  }

  // ================= 8. CANVAS CONFETTI ENGINE =================
  const confettiCanvas = document.getElementById('canvas-final-confetti');
  let finalConfettiEngine = null;

  if (confettiCanvas) {
    class ConfettiEngine {
      constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.colors = ['#FFD6E7', '#E8D8FF', '#D2BEFF', '#FF9EBF', '#FAF6EE', '#E2F5EE', '#FFE5D9', '#E57A9F'];
        this.particles = [];
        this.active = false;
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }

      resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
      }

      spawn(count) {
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * -100 - 20,
            size: Math.random() * 8 + 4,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            speed: Math.random() * 4 + 2.5,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 5 - 2.5,
            wobble: Math.random() * 3 + 1,
            wobbleSpeed: Math.random() * 0.04 + 0.02
          });
        }
        if (!this.active) {
          this.active = true;
          this.animate();
        }
      }

      animate() {
        if (!this.active) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        let alive = false;
        for (let p of this.particles) {
          if (p.y < this.height) {
            alive = true;
            p.y += p.speed;
            p.x += Math.sin(p.y * p.wobbleSpeed) * p.wobble;
            p.rotation += p.rotationSpeed;
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            this.ctx.fillStyle = p.color;
            
            // Draw diverse confetti: rectangle or circle
            if (p.size % 2 === 0) {
              this.ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.5);
            } else {
              this.ctx.beginPath();
              this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
              this.ctx.fill();
            }
            this.ctx.restore();
          }
        }
        
        if (alive) {
          requestAnimationFrame(() => this.animate());
        } else {
          this.active = false;
          this.particles = [];
        }
      }
    }

    finalConfettiEngine = new ConfettiEngine(confettiCanvas);
  }

  function triggerFinalConfetti() {
    if (finalConfettiEngine) {
      finalConfettiEngine.spawn(100);
    }
  }

});
