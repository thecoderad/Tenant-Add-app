/**
 * TenantHub - Futuristic Cursor & Visual Effects
 * Custom cursor with trail effects, ripples, and particles
 */

class CursorEffects {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.trailLength = options.trailLength || 8;
        this.particleChance = options.particleChance || 0.3;
        this.rippleOnCLick = options.rippleOnClick !== false;
        
        this.cursor = null;
        this.trails = [];
        this.lastX = 0;
        this.lastY = 0;
        this.moveCount = 0;
        
        if (this.enabled && !this.isTouchDevice()) {
            this.init();
        }
    }

    isTouchDevice() {
        return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
    }

    init() {
        this.createCursor();
        this.createTrails();
        this.addEventListeners();
    }

    createCursor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'futuristic-cursor';
        document.body.appendChild(this.cursor);
    }

    createTrails() {
        for (let i = 0; i < this.trailLength; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.opacity = '0';
            document.body.appendChild(trail);
            this.trails.push({
                element: trail,
                x: 0,
                y: 0,
                delay: i * 0.05
            });
        }
    }

    addEventListeners() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            this.updateCursor(e.clientX, e.clientY);
            this.createParticleTrail(e.clientX, e.clientY);
        });

        // Mouse over interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, .nav-link, .btn, [role="button"]');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor?.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor?.classList.remove('hover'));
        });

        // Click effect
        if (this.rippleOnCLick) {
            document.addEventListener('mousedown', (e) => {
                this.cursor?.classList.add('click');
                if (this.rippleOnCLick) {
                    this.createRipple(e.clientX, e.clientY);
                }
            });

            document.addEventListener('mouseup', () => {
                this.cursor?.classList.remove('click');
            });
        }

        // Page leave
        document.addEventListener('mouseleave', () => {
            if (this.cursor) {
                this.cursor.style.opacity = '0';
            }
        });

        document.addEventListener('mouseenter', () => {
            if (this.cursor) {
                this.cursor.style.opacity = '1';
            }
        });
    }

    updateCursor(x, y) {
        if (this.cursor) {
            this.cursor.style.left = x + 'px';
            this.cursor.style.top = y + 'px';
        }

        // Update trails with easing
        let prevX = x;
        let prevY = y;

        this.trails.forEach((trail, index) => {
            setTimeout(() => {
                const ease = 0.3 - (index * 0.02);
                trail.x += (prevX - trail.x) * ease;
                trail.y += (prevY - trail.y) * ease;
                
                trail.element.style.left = trail.x + 'px';
                trail.element.style.top = trail.y + 'px';
                trail.element.style.opacity = (1 - index / this.trailLength).toString();
                trail.element.style.transform = `scale(${1 - index / (this.trailLength * 1.5)})`;
            }, trail.delay * 1000);

            prevX = trail.x;
            prevY = trail.y;
        });

        this.lastX = x;
        this.lastY = y;
    }

    createParticleTrail(x, y) {
        this.moveCount++;
        
        // Create particles every few moves based on chance
        if (Math.random() < this.particleChance && this.moveCount % 3 === 0) {
            const particle = document.createElement('div');
            particle.className = 'particle-trail';
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const distance = 10 + Math.random() * 20;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            // Random color from gradient
            const colors = ['#6366f1', '#8b5cf6', '#0ea5e9', '#06b6d4'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            document.body.appendChild(particle);
            
            // Remove after animation
            setTimeout(() => particle.remove(), 1000);
        }
    }

    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    destroy() {
        this.cursor?.remove();
        this.trails.forEach(trail => trail.element.remove());
        this.trails = [];
        this.cursor = null;
    }

    toggle(enabled) {
        if (enabled) {
            this.init();
        } else {
            this.destroy();
        }
        this.enabled = enabled;
    }
}

/**
 * Background Particle Animation
 * Creates floating particles in the background
 */
class BackgroundParticles {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.particleCount = options.particleCount || 30;
        this.minSize = options.minSize || 2;
        this.maxSize = options.maxSize || 6;
        this.minSpeed = options.minSpeed || 0.2;
        this.maxSpeed = options.maxSpeed || 1;
        this.color = options.color || 'rgba(99, 102, 241, 0.3)';
        
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.handleResize());
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            opacity: 0.5;
        `;
        this.container.insertBefore(this.canvas, this.container.firstChild);
        this.ctx = this.canvas.getContext('2d');
        this.handleResize();
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: this.minSize + Math.random() * (this.maxSize - this.minSize),
                speedX: (this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed)) * (Math.random() < 0.5 ? 1 : -1),
                speedY: (this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed)) * (Math.random() < 0.5 ? 1 : -1),
                opacity: 0.2 + Math.random() * 0.5
            });
        }
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.color.replace('0.3', particle.opacity.toString());
            this.ctx.fill();
            
            // Add glow
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.color;
        });
        
        // Draw connections between nearby particles
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = this.color.replace('0.3', (0.15 * (1 - distance / 150)).toString());
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.canvas?.remove();
        this.particles = [];
    }

    toggle(enabled) {
        if (enabled) {
            this.init();
        } else {
            this.destroy();
        }
    }
}

/**
 * Mouse Trail Effect - Subtle professional trail for SaaS applications
 */
class MouseTrail {
    constructor(options = {}) {
        this.trailColor = options.trailColor || 'rgba(99, 102, 241, 0.3)';
        this.trailSize = options.trailSize || 8;
        this.trailFade = options.trailFade || 0.3;
        this.points = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.enabled = options.enabled !== false;

        if (this.enabled && !this.isTouchDevice()) {
            this.init();
        }
    }

    isTouchDevice() {
        return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    }

    init() {
        this.createCanvas();
        this.addEventListeners();
        this.animate();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    addEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.points.push({
                x: e.clientX,
                y: e.clientY,
                age: 0,
                size: this.trailSize
            });
            
            // Limit points for performance
            if (this.points.length > 20) {
                this.points.shift();
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw points
        for (let i = this.points.length - 1; i >= 0; i--) {
            const point = this.points[i];
            point.age += 0.05;

            if (point.age >= 1) {
                this.points.splice(i, 1);
                continue;
            }

            const alpha = (1 - point.age) * this.trailFade;
            const size = point.size * (1 - point.age);

            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.trailColor.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.ctx.fill();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.canvas?.remove();
        this.points = [];
    }

    toggle(enabled) {
        if (enabled) {
            this.init();
        } else {
            this.destroy();
        }
        this.enabled = enabled;
    }
}

// Auto-initialize on page load
let cursorEffects, backgroundParticles, mouseTrail;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cursor effects
    cursorEffects = new CursorEffects({
        enabled: true,
        trailLength: 8,
        particleChance: 0.2,
        rippleOnClick: true
    });

    // Mouse trail - disabled by default, enable per page if needed
    // mouseTrail = new MouseTrail({
    //     trailColor: 'rgba(99, 102, 241, 0.3)',
    //     enabled: false
    // });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CursorEffects, BackgroundParticles, MouseTrail };
}
