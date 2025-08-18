// Dynamic background graphics system for enhanced visual appeal
export class BackgroundGraphics {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.particles = [];
        this.clouds = [];
        this.birds = [];
        this.windDirection = 1;
        this.timeOfDay = 0.5; // 0 = night, 0.5 = day, 1 = sunset
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.initializeElements();
        this.startAnimation();
        this.setupResizeHandler();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'background-graphics';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            pointer-events: none;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.container.appendChild(this.canvas);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.resize();
            this.initializeElements();
        });
    }

    initializeElements() {
        this.initializeClouds();
        this.initializeParticles();
        this.initializeBirds();
    }

    initializeClouds() {
        this.clouds = [];
        const cloudCount = Math.floor(this.canvas.width / 300) + 2;
        
        for (let i = 0; i < cloudCount; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.4,
                size: 0.5 + Math.random() * 1.5,
                opacity: 0.3 + Math.random() * 0.4,
                speed: 0.2 + Math.random() * 0.3,
                type: Math.floor(Math.random() * 3)
            });
        }
    }

    initializeParticles() {
        this.particles = [];
        const particleCount = Math.floor(this.canvas.width / 20);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 1 + Math.random() * 2,
                opacity: 0.1 + Math.random() * 0.3,
                type: Math.random() < 0.7 ? 'pollen' : 'dust',
                life: Math.random() * 1000
            });
        }
    }

    initializeBirds() {
        this.birds = [];
        const birdCount = 3 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < birdCount; i++) {
            this.birds.push({
                x: Math.random() * this.canvas.width,
                y: 50 + Math.random() * 200,
                vx: 0.5 + Math.random() * 1,
                vy: (Math.random() - 0.5) * 0.2,
                wingPhase: Math.random() * Math.PI * 2,
                size: 0.5 + Math.random() * 0.5
            });
        }
    }

    startAnimation() {
        const animate = (timestamp) => {
            this.update(timestamp);
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        this.animationId = requestAnimationFrame(animate);
    }

    update(timestamp) {
        const deltaTime = timestamp / 1000;
        
        // Update time of day based on game time (if available)
        this.updateTimeOfDay();
        
        // Update wind direction occasionally
        if (Math.random() < 0.002) {
            this.windDirection *= -1;
        }
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed * this.windDirection;
            
            // Wrap around screen
            if (cloud.x > this.canvas.width + 100) {
                cloud.x = -100;
            } else if (cloud.x < -100) {
                cloud.x = this.canvas.width + 100;
            }
        });
        
        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.vx + this.windDirection * 0.1;
            particle.y += particle.vy;
            particle.life += deltaTime;
            
            // Add floating motion
            particle.y += Math.sin(particle.life * 2) * 0.01;
            
            // Wrap particles
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
        });
        
        // Update birds
        this.birds.forEach(bird => {
            bird.x += bird.vx;
            bird.y += bird.vy + Math.sin(bird.wingPhase) * 0.1;
            bird.wingPhase += 0.2;
            
            // Wrap birds
            if (bird.x > this.canvas.width + 50) {
                bird.x = -50;
                bird.y = 50 + Math.random() * 200;
            }
        });
    }

    updateTimeOfDay() {
        // Simulate day/night cycle (could be tied to game time)
        this.timeOfDay = 0.5 + Math.sin(Date.now() / 120000) * 0.3;
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky gradient
        this.drawSkyGradient();
        
        // Draw distant mountains/hills
        this.drawMountains();
        
        // Draw clouds
        this.drawClouds();
        
        // Draw sun/moon
        this.drawCelestialBody();
        
        // Draw particles
        this.drawParticles();
        
        // Draw birds
        this.drawBirds();
        
        // Draw atmospheric effects
        this.drawAtmosphericEffects();
    }

    drawSkyGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        if (this.timeOfDay > 0.7) {
            // Sunset colors
            gradient.addColorStop(0, '#FF6B35');
            gradient.addColorStop(0.3, '#F7931E');
            gradient.addColorStop(0.6, '#FFD23F');
            gradient.addColorStop(1, '#F0E68C');
        } else if (this.timeOfDay > 0.3) {
            // Day colors
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.3, '#98D8E8');
            gradient.addColorStop(0.7, '#B0E0E6');
            gradient.addColorStop(1, '#E0F6FF');
        } else {
            // Night colors
            gradient.addColorStop(0, '#191970');
            gradient.addColorStop(0.3, '#483D8B');
            gradient.addColorStop(0.7, '#4682B4');
            gradient.addColorStop(1, '#708090');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMountains() {
        const mountainCount = 3;
        const colors = ['rgba(76, 175, 80, 0.3)', 'rgba(129, 199, 132, 0.2)', 'rgba(165, 214, 167, 0.1)'];
        
        for (let layer = 0; layer < mountainCount; layer++) {
            this.ctx.fillStyle = colors[layer];
            this.ctx.beginPath();
            
            const baseHeight = this.canvas.height * (0.7 + layer * 0.1);
            this.ctx.moveTo(0, this.canvas.height);
            
            for (let x = 0; x <= this.canvas.width; x += 50) {
                const y = baseHeight + Math.sin(x * 0.005 + layer) * 30 * (1 + layer);
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    drawClouds() {
        this.clouds.forEach(cloud => {
            this.ctx.save();
            this.ctx.globalAlpha = cloud.opacity;
            this.ctx.fillStyle = this.timeOfDay > 0.3 ? '#FFFFFF' : '#E6E6FA';
            
            const scale = cloud.size;
            this.ctx.translate(cloud.x, cloud.y);
            this.ctx.scale(scale, scale);
            
            // Draw cloud shape
            this.drawCloudShape(cloud.type);
            
            this.ctx.restore();
        });
    }

    drawCloudShape(type) {
        this.ctx.beginPath();
        
        switch (type) {
            case 0: // Puffy cloud
                this.ctx.arc(-20, 0, 20, 0, Math.PI * 2);
                this.ctx.arc(0, -5, 25, 0, Math.PI * 2);
                this.ctx.arc(20, 0, 18, 0, Math.PI * 2);
                this.ctx.arc(10, 10, 15, 0, Math.PI * 2);
                this.ctx.arc(-10, 8, 12, 0, Math.PI * 2);
                break;
            case 1: // Stretched cloud
                this.ctx.arc(-30, 0, 15, 0, Math.PI * 2);
                this.ctx.arc(-10, -3, 18, 0, Math.PI * 2);
                this.ctx.arc(15, 0, 20, 0, Math.PI * 2);
                this.ctx.arc(35, 2, 14, 0, Math.PI * 2);
                break;
            default: // Small wispy cloud
                this.ctx.arc(-15, 0, 12, 0, Math.PI * 2);
                this.ctx.arc(0, -2, 15, 0, Math.PI * 2);
                this.ctx.arc(15, 0, 10, 0, Math.PI * 2);
                break;
        }
        
        this.ctx.fill();
    }

    drawCelestialBody() {
        const x = this.canvas.width * 0.8;
        const y = this.canvas.height * 0.2;
        const radius = 30;
        
        this.ctx.save();
        
        if (this.timeOfDay > 0.3) {
            // Draw sun
            this.ctx.fillStyle = '#FFD700';
            this.ctx.shadowColor = '#FFA500';
            this.ctx.shadowBlur = 20;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Sun rays
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const startX = x + Math.cos(angle) * (radius + 10);
                const startY = y + Math.sin(angle) * (radius + 10);
                const endX = x + Math.cos(angle) * (radius + 25);
                const endY = y + Math.sin(angle) * (radius + 25);
                
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        } else {
            // Draw moon
            this.ctx.fillStyle = '#F5F5DC';
            this.ctx.shadowColor = '#E6E6FA';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Moon craters
            this.ctx.fillStyle = 'rgba(192, 192, 192, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x - 8, y - 5, 4, 0, Math.PI * 2);
            this.ctx.arc(x + 5, y + 3, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            
            if (particle.type === 'pollen') {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = '#DEB887';
                this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            }
            
            this.ctx.restore();
        });
    }

    drawBirds() {
        this.birds.forEach(bird => {
            this.ctx.save();
            this.ctx.strokeStyle = '#2F4F4F';
            this.ctx.lineWidth = 2 * bird.size;
            this.ctx.lineCap = 'round';
            
            const wingSpread = Math.sin(bird.wingPhase) * 8 + 10;
            
            // Left wing
            this.ctx.beginPath();
            this.ctx.moveTo(bird.x - wingSpread, bird.y);
            this.ctx.lineTo(bird.x - 5, bird.y + 3);
            this.ctx.stroke();
            
            // Right wing
            this.ctx.beginPath();
            this.ctx.moveTo(bird.x + wingSpread, bird.y);
            this.ctx.lineTo(bird.x + 5, bird.y + 3);
            this.ctx.stroke();
            
            this.ctx.restore();
        });
    }

    drawAtmosphericEffects() {
        // Heat shimmer effect during day
        if (this.timeOfDay > 0.5) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.1;
            this.ctx.fillStyle = 'white';
            
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * this.canvas.width;
                const y = this.canvas.height * 0.8 + Math.random() * this.canvas.height * 0.2;
                const size = 2 + Math.random() * 3;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
        
        // Fog effect during early morning/night
        if (this.timeOfDay < 0.4) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.2;
            this.ctx.fillStyle = 'white';
            
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * this.canvas.width;
                const y = this.canvas.height * 0.7 + Math.random() * this.canvas.height * 0.3;
                const width = 100 + Math.random() * 200;
                const height = 20 + Math.random() * 30;
                
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
    }

    setTimeOfDay(time) {
        this.timeOfDay = Math.max(0, Math.min(1, time));
    }

    setWeather(weather) {
        // Adjust particles and effects based on weather
        switch (weather) {
            case 'rainy':
                this.addRainEffect();
                break;
            case 'windy':
                this.windDirection = Math.random() < 0.5 ? -2 : 2;
                break;
            case 'foggy':
                this.addFogEffect();
                break;
        }
    }

    addRainEffect() {
        // Add rain particles temporarily
        const rainCount = 50;
        for (let i = 0; i < rainCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: -10,
                vx: this.windDirection * 2,
                vy: 5 + Math.random() * 5,
                size: 1,
                opacity: 0.6,
                type: 'rain',
                life: 0
            });
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', this.resize);
    }
}