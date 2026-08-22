/**
 * Happy Birthday Bestie - Core Interactivity (2026 Web Edition)
 * Features: Procedural Web Audio Synth, Interactive Canvas Particles, 
 * Balloon Pop Mechanics, 3D Envelope Animation, 3D Hover Tilt.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Core Elements
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('progressBar');
    const loaderStatus = document.getElementById('loaderStatus');
    const enterBtn = document.getElementById('enterBtn');
    const mainContent = document.getElementById('mainContent');
    const bgCanvas = document.getElementById('bgCanvas');
    const ctx = bgCanvas.getContext('2d');

    // Audio Player Elements
    const musicPlayer = document.getElementById('musicPlayer');
    const musicToggle = document.getElementById('musicToggle');
    const soundWave = document.getElementById('soundWave');
    const popSound = document.getElementById('popSound');
    const bgMusic = document.getElementById('bgMusic');

    // Countdown Elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // Envelope Elements
    const envelope = document.getElementById('envelope');
    const envelopeSeal = document.getElementById('envelopeSeal');
    const currentDateText = document.getElementById('currentDateText');

    // Balloon Game Elements
    const balloonGameToggle = document.getElementById('balloonGameToggle');
    const balloonCountEl = document.getElementById('balloonCount');
    const spawnBalloonBtn = document.getElementById('spawnBalloonBtn');
    const confettiCannonBtn = document.getElementById('confettiCannonBtn');

    // Lightbox Elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    // State Variables
    let assetsLoaded = 0;
    const totalAssets = 8; // Number of images to preload
    let particleSystem = null;
    let synthPlaying = false;
    let audioCtx = null;
    let synthInterval = null;
    let balloonsEnabled = false;
    let balloonSpawnInterval = null;
    let poppedBalloons = 0;

    // Interactive mouse coordinates
    const mouse = { x: null, y: null };

const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

const today = new Date(2026, 7, 23);

currentDateText.textContent = today.toLocaleDateString('en-US', options);

    /* ==========================================
       1. ASSET PRELOADING CONTROL
       ========================================== */
    const imageURLs = [
        'assets/IMG-20260304-WA0002.jpg',
        'assets/IMG-20260413-WA0007(1).jpg',
        'assets/IMG-20260429-WA0042.jpg',
        'assets/IMG-20260512-WA0058.jpg',
        'assets/surprise_reveal.png'
    ];

    let welcomeEnabled = false;

    const preloadImages = () => {
        if (imageURLs.length === 0) {
            updateProgress(100, 'Pre-loaded successfully');
            enableWelcome();
            return;
        }

        imageURLs.forEach(url => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                assetsLoaded++;
                const percentage = Math.round((assetsLoaded / imageURLs.length) * 100);
                updateProgress(percentage, `Loaded asset ${assetsLoaded}/${imageURLs.length}...`);
                if (assetsLoaded === imageURLs.length) {
                    setTimeout(() => {
                        updateProgress(100, 'Everything is ready!');
                        enableWelcome();
                    }, 300);
                }
            };
            img.onerror = () => {
                assetsLoaded++;
                const percentage = Math.round((assetsLoaded / imageURLs.length) * 100);
                updateProgress(percentage, `Continuing configuration...`);
                if (assetsLoaded === imageURLs.length) {
                    enableWelcome();
                }
            };
        });

        // FAILSAFE: If images hang (e.g. slow network), force enable after 5 seconds
        setTimeout(() => {
            if (!welcomeEnabled) {
                updateProgress(100, 'Ready to go!');
                enableWelcome();
            }
        }, 5000);
    };

    const updateProgress = (percentage, statusText) => {
        progressBar.style.width = `${percentage}%`;
        loaderStatus.textContent = statusText;
    };

    const enableWelcome = () => {
        if (welcomeEnabled) return; // prevent double-call
        welcomeEnabled = true;
        enterBtn.classList.remove('disabled');
        enterBtn.removeAttribute('disabled');
    };

    preloadImages();

    // Loader Enter Click Event
    enterBtn.addEventListener('click', () => {
        loader.classList.add('fade-out');
        mainContent.classList.remove('hidden');

        // Show Music Player with fade-in
        setTimeout(() => {
            musicPlayer.classList.add('show');
        }, 1000);

        // Start playing the friendship song and initialize canvas
        startSynth();

        // Initialize particle canvas loop
        initCanvas();

        // Trigger reveal animations for initially visible sections
        triggerReveals();
    });

    /* ==========================================
       2. INTERACTIVE CANVAS PARTICLE SYSTEM
       ========================================== */
    function initCanvas() {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', triggerClickParticles);

        particleSystem = new ParticleSystem();
        particleSystem.animate();
    }

    function resizeCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }

    function handleMouseMove(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        // Add tiny stars trailing the mouse
        if (particleSystem && Math.random() < 0.25) {
            particleSystem.addParticle(mouse.x, mouse.y, 'star', 1.5, {
                x: (Math.random() - 0.5) * 0.8,
                y: (Math.random() - 0.5) * 0.8
            });
        }
    }

    function triggerClickParticles(e) {
        // Prevent launching background clicks when clicking buttons/links
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('a') || e.target.closest('button') || e.target.classList.contains('envelope-seal') || e.target.classList.contains('balloon')) {
            return;
        }

        if (particleSystem) {
            // Spawn explosion of mini stars
            for (let i = 0; i < 20; i++) {
                const speedFactor = 3;
                const angle = Math.random() * Math.PI * 2;
                const velocity = {
                    x: Math.cos(angle) * (Math.random() * speedFactor + 1),
                    y: Math.sin(angle) * (Math.random() * speedFactor + 1)
                };
                particleSystem.addParticle(e.clientX, e.clientY, 'star', Math.random() * 2 + 1.5, velocity, true);
            }
        }
    }

    class Particle {
        constructor(x, y, type = 'star', size = 2, velocity = { x: 0, y: -0.5 }, isExplosion = false) {
            this.x = x;
            this.y = y;
            this.type = type; // 'star', 'heart', 'confetti'
            this.size = size;
            this.baseSize = size;
            this.velocity = velocity;
            this.alpha = 1;
            this.color = this.getRandomColor(type);
            this.decay = isExplosion ? 0.02 : 0.006;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.05;
        }

        getRandomColor(type) {
            if (type === 'heart') {
                const colors = ['#ffb7c5', '#b76e79', '#ff7675', '#fd79a8'];
                return colors[Math.floor(Math.random() * colors.length)];
            } else if (type === 'confetti') {
                const colors = ['#ffe066', '#ffb7c5', '#a29bfe', '#55efc4', '#ff7675', '#74b9ff'];
                return colors[Math.floor(Math.random() * colors.length)];
            } else {
                // Stars/Sparkles
                const colors = ['#ffffff', '#ffe066', '#ffeed1', '#ffe8f4'];
                return colors[Math.floor(Math.random() * colors.length)];
            }
        }

        update() {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
            this.rotation += this.rotSpeed;
            if (this.type === 'heart') {
                // Sway hearts sideways
                this.x += Math.sin(this.y * 0.015) * 0.3;
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            if (this.type === 'heart') {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                // Draw heart shape
                ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, 0, 0, this.size);
                ctx.bezierCurveTo(this.size, 0, this.size / 2, -this.size / 2, 0, 0);
                ctx.fill();
            } else if (this.type === 'confetti') {
                ctx.fillStyle = this.color;
                // Draw standard small rectangle confetti
                ctx.fillRect(-this.size, -this.size / 2, this.size * 2, this.size);
            } else {
                // Star/Sparkle (4-point flare)
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(0, -this.size * 1.5);
                ctx.quadraticCurveTo(0, 0, this.size * 1.5, 0);
                ctx.quadraticCurveTo(0, 0, 0, this.size * 1.5);
                ctx.quadraticCurveTo(0, 0, -this.size * 1.5, 0);
                ctx.quadraticCurveTo(0, 0, 0, -this.size * 1.5);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    class ParticleSystem {
        constructor() {
            this.particles = [];
        }

        addParticle(x, y, type, size, velocity, isExplosion) {
            this.particles.push(new Particle(x, y, type, size, velocity, isExplosion));
        }

        update() {
            // Regularly spawn background drifting hearts
            if (Math.random() < 0.02) {
                const spawnX = Math.random() * bgCanvas.width;
                const spawnY = bgCanvas.height + 20;
                this.addParticle(spawnX, spawnY, 'heart', Math.random() * 8 + 6, {
                    x: (Math.random() - 0.5) * 0.4,
                    y: -(Math.random() * 0.8 + 0.4)
                });
            }
            // Regularly spawn floating starry dust
            if (Math.random() < 0.06) {
                const spawnX = Math.random() * bgCanvas.width;
                const spawnY = Math.random() * bgCanvas.height;
                this.addParticle(spawnX, spawnY, 'star', Math.random() * 1.5 + 0.5, {
                    x: (Math.random() - 0.5) * 0.2,
                    y: -(Math.random() * 0.3 + 0.1)
                });
            }

            this.particles.forEach((p, idx) => {
                p.update();
                if (p.alpha <= 0) {
                    this.particles.splice(idx, 1);
                }
            });
        }

        draw() {
            ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            this.particles.forEach(p => p.draw());
        }

        animate() {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.animate());
        }
    }

    /* ==========================================
       3. BACKGROUND MUSIC LOGIC
       ========================================== */
    function startSynth() {
        if (synthPlaying) return;
        synthPlaying = true;
        soundWave.classList.add('animating');

        // Play the friendship song
        if (bgMusic) {
            bgMusic.volume = 0.5;
            bgMusic.play().catch(e => console.log('Audio play blocked by browser:', e));
        }
    }

    function stopSynth() {
        synthPlaying = false;
        soundWave.classList.remove('animating');
        if (bgMusic) {
            bgMusic.pause();
        }
    }

    // Toggle Music button click handler
    musicToggle.addEventListener('click', () => {
        if (synthPlaying) {
            stopSynth();
            musicToggle.innerHTML = '<span class="music-icon play-icon">🔇</span>';
        } else {
            startSynth();
            musicToggle.innerHTML = '<span class="music-icon play-icon">🎵</span>';
        }
    });

    /* ==========================================
       4. COUNTDOWN CALCULATOR
       ========================================== */
    // Targets: August 25 of 2026.
    const birthdayDate = new Date('August 23, 2026 00:00:00').getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = birthdayDate - now;

        if (difference < 0) {
            // Birthday is today or has passed
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        // Prepend zeros if necessary
        daysEl.textContent = d < 10 ? '0' + d : d;
        hoursEl.textContent = h < 10 ? '0' + h : h;
        minutesEl.textContent = m < 10 ? '0' + m : m;
        secondsEl.textContent = s < 10 ? '0' + s : s;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);

    /* ==========================================
       5. SCROLL-DRIVEN REVEAL SYSTEM
       ========================================== */
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const triggerReveals = () => {
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            const triggerOffset = window.innerHeight * 0.85; // Reveal when element is 15% visible
            if (elTop < triggerOffset) {
                el.classList.add('revealed');
            }
        });
    };

    // Use Intersection Observer if supported, fallback to scroll event
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        window.addEventListener('scroll', triggerReveals);
    }

    /* ==========================================
       6. 3D TILT EFFECT ON PHOTO CARDS
       ========================================== */
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const mouseX = e.clientX - cardRect.left;
            const mouseY = e.clientY - cardRect.top;

            // Calculate rotational values based on mouse coordinates relative to center
            const centerX = cardRect.width / 2;
            const centerY = cardRect.height / 2;

            const rotateY = ((mouseX - centerX) / centerX) * 8; // Max 8 deg rotation
            const rotateX = -((mouseY - centerY) / centerY) * 8;

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    });

    /* ==========================================
       7. LIGHTBOX SYSTEM
       ========================================== */
    const galleryItems = document.querySelectorAll('.photo-card');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const title = item.querySelector('.photo-info h3').textContent;
            const p = item.querySelector('.photo-info p').textContent;

            lightboxImg.src = img.src;
            lightboxCaption.textContent = `${title} - ${p}`;
            lightbox.classList.add('active');
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    /* ==========================================
       8. VIRTUAL ENVELOPE OPEN LOGIC
       ========================================== */
    envelopeSeal.addEventListener('click', () => {
        if (!envelope.classList.contains('open')) {
            envelope.classList.add('open');
            playPopSound(); // play seal crack pop sound

            // Burst a stream of glowing hearts when the letter is opened
            const sealRect = envelopeSeal.getBoundingClientRect();
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const velocity = {
                    x: Math.cos(angle) * (Math.random() * 4 + 1.5),
                    y: Math.sin(angle) * (Math.random() * 4 + 1.5) - 2 // upward bias
                };
                particleSystem.addParticle(
                    sealRect.left + sealRect.width / 2,
                    sealRect.top + sealRect.height / 2,
                    'heart',
                    Math.random() * 8 + 6,
                    velocity,
                    true
                );
            }
        }
    });

    /* ==========================================
       9. FLOATING BALLOONS & INTERACTIVE POP GAME
       ========================================== */
    const balloonColors = [
        'rgba(255, 183, 197, 0.85)', // Pink
        'rgba(183, 110, 121, 0.85)', // Rose Gold
        'rgba(255, 224, 102, 0.85)', // Gold
        'rgba(162, 155, 254, 0.85)', // Lavender
        'rgba(85, 239, 196, 0.85)',  // Mint
        'rgba(116, 185, 255, 0.85)', // Sky Blue
        'rgba(253, 121, 168, 0.85)'  // Vibrant Pink
    ];

    function createBalloon() {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');

        const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        balloon.style.backgroundColor = color;
        balloon.style.color = color; // Used for the triangle knot at base

        // Random horizontal positioning and float timing
        const sizeMultiplier = Math.random() * 0.4 + 0.8; // 80% to 120%
        balloon.style.left = `${Math.random() * 80 + 10}%`;
        balloon.style.transform = `scale(${sizeMultiplier})`;

        const floatDuration = Math.random() * 6 + 8; // 8s to 14s float speed
        balloon.style.animationDuration = `${floatDuration}s`;

        // Interactive string
        const string = document.createElement('div');
        string.classList.add('balloon-string');
        balloon.appendChild(string);

        // Click Event: Pop balloon
        balloon.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            popBalloon(balloon, e.clientX, e.clientY, color);
        });

        document.body.appendChild(balloon);

        // Automatically clean up balloon node when animation terminates
        balloon.addEventListener('animationend', () => {
            balloon.remove();
        });
    }

    function popBalloon(balloonEl, clickX, clickY, balloonColor) {
        // Pop sound effect
        playPopSound();

        // Increment count
        poppedBalloons++;
        balloonCountEl.textContent = poppedBalloons;

        // Sparkle explosion inside canvas with matching balloon color
        if (particleSystem) {
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                const velocity = {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                };

                // Construct a particle and set its color to matches balloon
                const p = new Particle(clickX, clickY, 'confetti', Math.random() * 4 + 3, velocity, true);
                p.color = balloonColor;
                particleSystem.particles.push(p);
            }
        }

        // Animated shrink and remove from DOM
        balloonEl.style.transform = 'scale(0)';
        balloonEl.style.transition = 'transform 0.15s ease-out';
        setTimeout(() => {
            balloonEl.remove();
        }, 150);
    }

    function playPopSound() {
        if (popSound) {
            popSound.currentTime = 0;
            popSound.play().catch(err => {
                // Ignore silent auto-play warnings
            });
        }
    }

    function toggleBalloonSystem() {
        balloonsEnabled = !balloonsEnabled;
        if (balloonsEnabled) {
            balloonGameToggle.style.background = 'rgba(255, 183, 197, 0.2)';
            // Start spawning loops
            createBalloon();
            balloonSpawnInterval = setInterval(createBalloon, 1400);
        } else {
            balloonGameToggle.style.background = 'var(--glass-bg)';
            clearInterval(balloonSpawnInterval);
            balloonSpawnInterval = null;
        }
    }

    // Controls listeners
    balloonGameToggle.addEventListener('click', toggleBalloonSystem);
    spawnBalloonBtn.addEventListener('click', () => {
        // Release 6 balloons at once
        for (let i = 0; i < 6; i++) {
            setTimeout(createBalloon, i * 200);
        }
    });

    /* ==========================================
       10. CONFETTI CANNON TRIGGER
       ========================================== */
    confettiCannonBtn.addEventListener('click', () => {
        playPopSound();
        if (!particleSystem) return;

        const leftX = 50;
        const rightX = window.innerWidth - 50;
        const spawnY = window.innerHeight - 50;

        // Blast from Left
        for (let i = 0; i < 50; i++) {
            const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.3;
            const speed = Math.random() * 8 + 8;
            particleSystem.addParticle(leftX, spawnY, 'confetti', Math.random() * 5 + 4, {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed - 5
            }, true);
        }

        // Blast from Right
        for (let i = 0; i < 50; i++) {
            const angle = -3 * Math.PI / 4 + (Math.random() - 0.5) * 0.3;
            const speed = Math.random() * 8 + 8;
            particleSystem.addParticle(rightX, spawnY, 'confetti', Math.random() * 5 + 4, {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed - 5
            }, true);
        }
    });

    /* ==========================================
       11. TYPEWRITER EFFECT FOR HERO TITLE
       ========================================== */
    const heroTitle = document.getElementById('heroTitle');
    const typewriterText = "To Vishaka, the best friend in the universe!";
    let charIndex = 0;

    function typeWriter() {
        if (!heroTitle) return;
        if (charIndex < typewriterText.length) {
            heroTitle.textContent = typewriterText.substring(0, charIndex + 1);
            // Keep cursor at end
            const cursor = document.createElement('span');
            cursor.className = 'typewriter-cursor';
            heroTitle.appendChild(cursor);
            charIndex++;
            setTimeout(typeWriter, 65);
        } else {
            // Remove cursor after typing done
            setTimeout(() => {
                const c = heroTitle.querySelector('.typewriter-cursor');
                if (c) c.remove();
            }, 2000);
        }
    }

    // Start typewriter after loader transition
    const origEnterHandler = enterBtn.onclick;
    enterBtn.addEventListener('click', () => {
        setTimeout(typeWriter, 800);
    });

    /* ==========================================
       12. 3D GIFT BOX OPEN ANIMATION
       ========================================== */
    const giftBox = document.getElementById('giftBox');
    const giftReveal = document.getElementById('giftReveal');

    if (giftBox) {
        giftBox.addEventListener('click', () => {
            if (giftBox.classList.contains('opened')) return;
            giftBox.classList.add('opened');
            playPopSound();

            // Burst fireworks from the gift box location
            const boxRect = giftBox.getBoundingClientRect();
            const cx = boxRect.left + boxRect.width / 2;
            const cy = boxRect.top;

            if (particleSystem) {
                for (let i = 0; i < 40; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 6 + 3;
                    const types = ['star', 'heart', 'confetti'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    particleSystem.addParticle(cx, cy, type, Math.random() * 5 + 3, {
                        x: Math.cos(angle) * speed,
                        y: Math.sin(angle) * speed - 3
                    }, true);
                }
            }
        });
    }

    /* ==========================================
       13. SCRATCH CARD SYSTEM
       ========================================== */
    const scratchCanvas = document.getElementById('scratchCanvas');
    if (scratchCanvas) {
        const sCtx = scratchCanvas.getContext('2d');
        let isScratching = false;
        let scratchPercent = 0;

        // Draw the scratch overlay
        function initScratchCard() {
            const w = scratchCanvas.width;
            const h = scratchCanvas.height;

            // Create a gradient scratch surface
            const grad = sCtx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#b76e79');
            grad.addColorStop(0.5, '#e84393');
            grad.addColorStop(1, '#a29bfe');
            sCtx.fillStyle = grad;
            sCtx.fillRect(0, 0, w, h);

            // Add sparkle dots
            for (let i = 0; i < 50; i++) {
                sCtx.beginPath();
                sCtx.arc(Math.random() * w, Math.random() * h, Math.random() * 3 + 1, 0, Math.PI * 2);
                sCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`;
                sCtx.fill();
            }

            // Add text overlay
            sCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            sCtx.font = 'bold 20px Outfit, sans-serif';
            sCtx.textAlign = 'center';
            sCtx.fillText('✨ Scratch Me! ✨', w / 2, h / 2 - 5);
            sCtx.font = '13px Outfit, sans-serif';
            sCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            sCtx.fillText('Use your mouse or finger', w / 2, h / 2 + 20);
        }

        initScratchCard();

        function scratchAt(x, y) {
            sCtx.globalCompositeOperation = 'destination-out';
            sCtx.beginPath();
            sCtx.arc(x, y, 22, 0, Math.PI * 2);
            sCtx.fill();
            sCtx.globalCompositeOperation = 'source-over';
        }

        function getScratchPosition(e) {
            const rect = scratchCanvas.getBoundingClientRect();
            const scaleX = scratchCanvas.width / rect.width;
            const scaleY = scratchCanvas.height / rect.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        scratchCanvas.addEventListener('mousedown', (e) => { isScratching = true; const p = getScratchPosition(e); scratchAt(p.x, p.y); });
        scratchCanvas.addEventListener('mousemove', (e) => { if (isScratching) { const p = getScratchPosition(e); scratchAt(p.x, p.y); } });
        scratchCanvas.addEventListener('mouseup', () => { isScratching = false; });
        scratchCanvas.addEventListener('mouseleave', () => { isScratching = false; });

        // Touch support
        scratchCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); isScratching = true; const p = getScratchPosition(e); scratchAt(p.x, p.y); }, { passive: false });
        scratchCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isScratching) { const p = getScratchPosition(e); scratchAt(p.x, p.y); } }, { passive: false });
        scratchCanvas.addEventListener('touchend', () => { isScratching = false; });
    }

    /* ==========================================
       14. BIRTHDAY WISH WHEEL SPINNER
       ========================================== */
    const wheelCanvas = document.getElementById('wheelCanvas');
    const spinBtn = document.getElementById('spinBtn');
    const wheelResult = document.getElementById('wheelResult');

    if (wheelCanvas && spinBtn) {
        const wCtx = wheelCanvas.getContext('2d');
        const wishes = [
            "Infinite Happiness!",
            "Dream Vacation!",
            "Lifelong Best Friends!",
            "A Year of Miracles!",
            "Unlimited Ice Cream!",
            "All Your Dreams Come True!",
            "True Love Forever!",
            "1000 More Adventures!"
        ];
        const colors = ['#e84393', '#a29bfe', '#fdcb6e', '#00cec9', '#ff7675', '#6c5ce7', '#55efc4', '#fab1a0'];
        let currentAngle = 0;
        let spinning = false;

        function drawWheel() {
            const cx = wheelCanvas.width / 2;
            const cy = wheelCanvas.height / 2;
            const r = cx - 5;
            const sliceAngle = (2 * Math.PI) / wishes.length;

            wCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

            wishes.forEach((wish, i) => {
                const startAngle = currentAngle + i * sliceAngle;
                const endAngle = startAngle + sliceAngle;

                // Draw slice
                wCtx.beginPath();
                wCtx.moveTo(cx, cy);
                wCtx.arc(cx, cy, r, startAngle, endAngle);
                wCtx.closePath();
                wCtx.fillStyle = colors[i % colors.length];
                wCtx.fill();
                wCtx.strokeStyle = 'rgba(255,255,255,0.2)';
                wCtx.lineWidth = 2;
                wCtx.stroke();

                // Draw text
                wCtx.save();
                wCtx.translate(cx, cy);
                wCtx.rotate(startAngle + sliceAngle / 2);
                wCtx.textAlign = 'right';
                wCtx.fillStyle = '#fff';
                wCtx.font = 'bold 11px Outfit, sans-serif';
                wCtx.shadowColor = 'rgba(0,0,0,0.5)';
                wCtx.shadowBlur = 3;
                wCtx.fillText(wish, r - 12, 4);
                wCtx.restore();
            });

            // Center circle
            wCtx.beginPath();
            wCtx.arc(cx, cy, 22, 0, Math.PI * 2);
            wCtx.fillStyle = '#07050e';
            wCtx.fill();
            wCtx.strokeStyle = 'rgba(255,255,255,0.2)';
            wCtx.lineWidth = 2;
            wCtx.stroke();

            // Center dot
            wCtx.beginPath();
            wCtx.arc(cx, cy, 6, 0, Math.PI * 2);
            wCtx.fillStyle = '#ffe066';
            wCtx.fill();
        }

        drawWheel();

        spinBtn.addEventListener('click', () => {
            if (spinning) return;
            spinning = true;
            spinBtn.disabled = true;
            wheelResult.classList.remove('show');

            // Random spin: 5-10 full rotations + random offset
            const spinAmount = Math.PI * 2 * (Math.random() * 5 + 5) + Math.random() * Math.PI * 2;
            const targetAngle = currentAngle + spinAmount;
            const duration = 4000;
            const startTime = performance.now();
            const startAngle = currentAngle;

            function animateSpin(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                currentAngle = startAngle + spinAmount * eased;
                drawWheel();

                if (progress < 1) {
                    requestAnimationFrame(animateSpin);
                } else {
                    spinning = false;
                    spinBtn.disabled = false;

                    // Calculate which slice the pointer landed on
                    // Pointer is at top (270deg / -90deg / -PI/2)
                    const normalizedAngle = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                    const pointerAngle = (Math.PI * 2 - normalizedAngle + Math.PI * 1.5) % (Math.PI * 2);
                    const sliceAngle = (Math.PI * 2) / wishes.length;
                    const winIndex = Math.floor(pointerAngle / sliceAngle) % wishes.length;

                    wheelResult.textContent = `🎉 ${wishes[winIndex]} 🎉`;
                    wheelResult.classList.add('show');
                    playPopSound();

                    // Confetti burst
                    if (particleSystem) {
                        const rect = wheelCanvas.getBoundingClientRect();
                        const wcx = rect.left + rect.width / 2;
                        const wcy = rect.top + rect.height / 2;
                        for (let i = 0; i < 30; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const speed = Math.random() * 5 + 3;
                            particleSystem.addParticle(wcx, wcy, 'confetti', Math.random() * 4 + 3, {
                                x: Math.cos(angle) * speed,
                                y: Math.sin(angle) * speed - 2
                            }, true);
                        }
                    }
                }
            }

            requestAnimationFrame(animateSpin);
        });
    }

    /* ==========================================
       15. MAGIC 8-BALL FORTUNE TELLER
       ========================================== */
    const magicBall = document.getElementById('magicBall');
    const magicAnswer = document.getElementById('magicAnswer');

    if (magicBall && magicAnswer) {
        const fortunes = [
            "BFFs Forever!",
            "More Adventures Ahead!",
            "The Stars Align for Us!",
            "A Surprise is Coming!",
            "Unbreakable Bond!",
            "More Laughs Ahead!",
            "A Dream Trip Together!",
            "Absolutely Yes!",
            "A New Memory Awaits!",
            "Best Year of Your Life!",
            "The Universe Says YES!",
            "Endless Love Coming!",
            "Double the Fun!",
            "Our Friendship is Legendary!",
            "Destiny has Great Plans!"
        ];

        let ballShaking = false;

        magicBall.addEventListener('click', () => {
            if (ballShaking) return;
            ballShaking = true;

            // Fade out current answer
            magicAnswer.style.opacity = '0';
            magicBall.classList.add('shaking');

            setTimeout(() => {
                magicBall.classList.remove('shaking');
                const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
                magicAnswer.textContent = fortune;
                magicAnswer.style.opacity = '1';
                ballShaking = false;
            }, 800);
        });
    }

    /* ==========================================
       16. FIREWORKS SHOW SYSTEM
       ========================================== */
    const fireworksCanvas = document.getElementById('fireworksCanvas');
    const fireworksBtn = document.getElementById('fireworksBtn');

    if (fireworksCanvas && fireworksBtn) {
        const fCtx = fireworksCanvas.getContext('2d');
        let fireworksActive = false;
        let fireworksParticles = [];
        let fireworksRockets = [];
        let fireworksAnimFrame = null;
        let fireworksTimeout = null;

        function resizeFireworksCanvas() {
            fireworksCanvas.width = window.innerWidth;
            fireworksCanvas.height = window.innerHeight;
        }

        resizeFireworksCanvas();
        window.addEventListener('resize', resizeFireworksCanvas);

        class FireworkRocket {
            constructor() {
                this.x = Math.random() * fireworksCanvas.width * 0.8 + fireworksCanvas.width * 0.1;
                this.y = fireworksCanvas.height;
                this.targetY = Math.random() * fireworksCanvas.height * 0.4 + fireworksCanvas.height * 0.1;
                this.speed = Math.random() * 3 + 4;
                this.trail = [];
                this.alive = true;
                this.color = `hsl(${Math.random() * 360}, 80%, 65%)`;
            }

            update() {
                this.trail.push({ x: this.x, y: this.y, alpha: 1 });
                if (this.trail.length > 15) this.trail.shift();
                this.trail.forEach(t => t.alpha -= 0.06);

                this.y -= this.speed;
                this.x += (Math.random() - 0.5) * 0.5;

                if (this.y <= this.targetY) {
                    this.alive = false;
                    this.explode();
                }
            }

            explode() {
                const numParticles = Math.floor(Math.random() * 60 + 50);
                const hue = Math.random() * 360;
                for (let i = 0; i < numParticles; i++) {
                    const angle = (Math.PI * 2 / numParticles) * i + (Math.random() - 0.5) * 0.3;
                    const speed = Math.random() * 5 + 2;
                    const saturation = Math.random() * 30 + 70;
                    const lightness = Math.random() * 30 + 50;
                    fireworksParticles.push({
                        x: this.x,
                        y: this.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        alpha: 1,
                        color: `hsl(${hue + Math.random() * 30}, ${saturation}%, ${lightness}%)`,
                        size: Math.random() * 3 + 1.5,
                        decay: Math.random() * 0.015 + 0.008,
                        gravity: 0.04
                    });
                }
                playPopSound();
            }

            draw() {
                // Trail
                this.trail.forEach(t => {
                    fCtx.beginPath();
                    fCtx.arc(t.x, t.y, 2, 0, Math.PI * 2);
                    fCtx.fillStyle = `rgba(255, 224, 102, ${t.alpha})`;
                    fCtx.fill();
                });

                // Rocket head
                fCtx.beginPath();
                fCtx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                fCtx.fillStyle = this.color;
                fCtx.fill();
            }
        }

        function fireworksLoop() {
            fCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

            // Occasionally launch a new rocket
            if (fireworksActive && Math.random() < 0.06) {
                fireworksRockets.push(new FireworkRocket());
            }

            // Update rockets
            fireworksRockets = fireworksRockets.filter(r => {
                r.update();
                r.draw();
                return r.alive;
            });

            // Update particles
            fireworksParticles = fireworksParticles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= 0.985;
                p.vy *= 0.985;
                p.alpha -= p.decay;

                fCtx.beginPath();
                fCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                fCtx.fillStyle = p.color.replace(')', `, ${p.alpha})`).replace('hsl', 'hsla');
                fCtx.fill();

                return p.alpha > 0;
            });

            if (fireworksActive || fireworksRockets.length > 0 || fireworksParticles.length > 0) {
                fireworksAnimFrame = requestAnimationFrame(fireworksLoop);
            } else {
                fireworksCanvas.classList.remove('active');
            }
        }

        fireworksBtn.addEventListener('click', () => {
            if (fireworksActive) return;
            fireworksActive = true;
            fireworksCanvas.classList.add('active');

            // Launch initial volley
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    fireworksRockets.push(new FireworkRocket());
                }, i * 300);
            }

            fireworksLoop();

            // Stop after 8 seconds
            fireworksTimeout = setTimeout(() => {
                fireworksActive = false;
            }, 8000);
        });
    }

    /* ==========================================
       17. MOBILE NAV TOGGLE
       ========================================== */
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileNavToggle && navLinks) {
        mobileNavToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileNavToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        // Close nav on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileNavToggle.textContent = '☰';
            });
        });
    }

    /* ==========================================
       HERO SLIDESHOW LOGIC
       ========================================== */
    const slideshowFrame = document.getElementById('heroSlideshow');
    if (slideshowFrame) {
        const slides = slideshowFrame.querySelectorAll('.slide');
        let currentSlide = 0;

        if (slides.length > 0) {
            setInterval(() => {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            }, 4000); // Change image every 4 seconds
        }
    }

    /* ==========================================
       18. VIDEO MEMORY REEL LOGIC
       ========================================== */
    const memoryVideo = document.getElementById('memoryVideo');
    const playVideoBtn = document.getElementById('playVideoBtn');
    const videoOverlay = document.getElementById('videoOverlay');

    if (memoryVideo && playVideoBtn && videoOverlay) {
        const toggleVideo = () => {
            if (memoryVideo.paused) {
                // Pause background music if it's playing
                if (synthPlaying) {
                    stopSynth(); // Pause bg music
                    musicToggle.innerHTML = '<span class="music-icon play-icon">🔇</span>';
                }

                memoryVideo.play().then(() => {
                    videoOverlay.classList.add('hidden');
                }).catch(e => console.error("Video play failed:", e));
            } else {
                memoryVideo.pause();
                videoOverlay.classList.remove('hidden');
            }
        };

        // Remove playVideoBtn listener to prevent double-firing due to event bubbling
        videoOverlay.addEventListener('click', toggleVideo);

        memoryVideo.addEventListener('click', () => {
            if (!memoryVideo.paused) {
                memoryVideo.pause();
                videoOverlay.classList.remove('hidden');
            }
        });

        memoryVideo.addEventListener('ended', () => {
            videoOverlay.classList.remove('hidden');
        });
    }

    /* ==========================================
       19. SECRET VOICE NOTE LOGIC
       ========================================== */
    const voicePlayBtn = document.getElementById('voicePlayBtn');
    const voicePlayIcon = document.getElementById('voicePlayIcon');
    const secretVoiceNote = document.getElementById('secretVoiceNote');
    const voiceWave = document.getElementById('voiceWave');
    let isVoicePlaying = false;

    if (voicePlayBtn && secretVoiceNote) {
        voicePlayBtn.addEventListener('click', () => {
            if (isVoicePlaying) {
                secretVoiceNote.pause();
                voicePlayIcon.classList.remove('fa-pause');
                voicePlayIcon.classList.add('fa-play');
                voiceWave.classList.remove('playing');
                isVoicePlaying = false;
            } else {
                // Pause bg music
                if (synthPlaying) {
                    stopSynth();
                    musicToggle.innerHTML = '<span class="music-icon play-icon">🔇</span>';
                }

                secretVoiceNote.play().then(() => {
                    voicePlayIcon.classList.remove('fa-play');
                    voicePlayIcon.classList.add('fa-pause');
                    voiceWave.classList.add('playing');
                    isVoicePlaying = true;
                }).catch(e => console.error("Voice note play failed:", e));
            }
        });

        secretVoiceNote.addEventListener('ended', () => {
            voicePlayIcon.classList.remove('fa-pause');
            voicePlayIcon.classList.add('fa-play');
            voiceWave.classList.remove('playing');
            isVoicePlaying = false;
        });
    }

    /* ==========================================
       20. TYPEWRITER SURPRISE LOGIC
       ========================================== */
    const startTypingBtn = document.getElementById('startTypingBtn');
    const typingText = document.getElementById('typingText');
    const secretMessage = "You bring so much joy to my life! You are the most amazing person I know. Happy Birthday Dost & LOVE YoOU BEST FRIEND jo Ap chati thi ke mai bolun Birthday per! 💖✨";
    let isTyping = false;

    if (startTypingBtn && typingText) {
        startTypingBtn.addEventListener('click', () => {
            if (isTyping) return;
            isTyping = true;

            typingText.textContent = '';
            let i = 0;
            const typeWriter = setInterval(() => {
                if (i < secretMessage.length) {
                    typingText.textContent += secretMessage.charAt(i);
                    i++;
                } else {
                    clearInterval(typeWriter);
                    isTyping = false;
                    startTypingBtn.textContent = "Read Again";
                }
            }, 70); // Typing speed
        });
    }

    /* ==========================================
       22. FLOWER BOUQUET MODAL
       ========================================== */
    const openBouquetBtn = document.getElementById('openBouquetBtn');
    const bouquetModal = document.getElementById('bouquetModal');
    const bouquetCloseBtn = document.getElementById('bouquetCloseBtn');

    if (openBouquetBtn && bouquetModal && bouquetCloseBtn) {
        openBouquetBtn.addEventListener('click', () => {
            bouquetModal.classList.add('show');
            // Re-trigger animations by cloning and replacing if needed, 
            // but CSS handles it nicely on adding the .show class.
        });

        bouquetCloseBtn.addEventListener('click', () => {
            bouquetModal.classList.remove('show');
        });

        // Close on clicking outside the modal content
        bouquetModal.addEventListener('click', (e) => {
            if (e.target === bouquetModal) {
                bouquetModal.classList.remove('show');
            }
        });
    }

});
