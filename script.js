/* =============================================
   Virtual Vesak Lantern — Browser Script
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ── Fullscreen ─────────────────────────── */
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
                btnFullscreen.textContent = '✕ Exit Fullscreen';
            } else {
                document.exitFullscreen();
                btnFullscreen.textContent = '⛶ Fullscreen';
            }
        });
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                btnFullscreen.textContent = '⛶ Fullscreen';
            }
        });
    }

    /* ── Music ──────────────────────────────── */
    const btnMusic = document.getElementById('btn-music');
    const audio    = document.getElementById('bg-music');
    if (btnMusic && audio) {
        let playing = false;
        btnMusic.addEventListener('click', () => {
            if (!playing) {
                audio.play().then(() => {
                    playing = true;
                    btnMusic.textContent = '⏸ Pause Music';
                }).catch(() => {
                    // Autoplay blocked — show user-friendly message
                    btnMusic.textContent = '♫ Play Music';
                });
            } else {
                audio.pause();
                playing = false;
                btnMusic.textContent = '♫ Play Music';
            }
        });
        audio.addEventListener('ended', () => {
            playing = false;
            btnMusic.textContent = '♫ Play Music';
        });
    }

    /* ── Starfield Particles ────────────────── */
    const bg = document.getElementById('background-container');
    if (bg) {
        const STAR_COUNT = 80;
        for (let i = 0; i < STAR_COUNT; i++) {
            const star = document.createElement('div');
            star.className = 'particle';
            const size = Math.random() * 3 + 1;
            star.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${Math.random() * 100}%;
                animation-duration: ${8 + Math.random() * 12}s;
                animation-delay: ${Math.random() * 10}s;
                opacity: 0;
            `;
            bg.appendChild(star);
        }
    }
    /* ── Auto Theme Cycler ──────────────────── */
    const themes = ['theme-golden', 'theme-blue', 'theme-purple', 'theme-red', 'theme-rainbow'];
    let currentThemeIdx = 0;
    
    // Set initial theme to make sure body has one
    document.body.className = themes[0];
    
    setInterval(() => {
        // Remove current theme
        document.body.classList.remove(themes[currentThemeIdx]);
        // Move to next theme
        currentThemeIdx = (currentThemeIdx + 1) % themes.length;
        // Add new theme
        document.body.classList.add(themes[currentThemeIdx]);
    }, 3000);

    /* ── 3D Lantern Rotation Engine (requestAnimationFrame) ────────
       Replaces CSS keyframe animations entirely to prevent the Chrome
       preserve-3d GPU-layer flattening bug that causes faces to scatter
       and animation to stutter/stick.
    ─────────────────────────────────────────────────────────────── */
    (function lanternSpinEngine() {
        const CYCLE     = 90;    // 6 phases * 15s per phase
        const SAT_SPEED = 180;   // 1.5X for satellite self-spin
        const MAIN_SPEED = 6;    // 0.25X for main structure sweeps (90 degrees in 15s)
        const ORBIT_SPEED = 18;  // 0.5X for satellite continuous orbit

        // DOM references
        const elTop    = document.getElementById('lantern-top');
        const elMid    = document.querySelector('.lantern-middle');
        const elBot    = document.getElementById('lantern-bottom');
        const elTopSat = document.querySelector('.top-satellites');
        const elBotSat = document.querySelector('.bottom-satellites');
        const satLants = document.querySelectorAll('.satellite-lantern');

        if (!elTop || !elMid || !elBot) return;

        let startTime = null;

        function frame(ts) {
            if (!startTime) startTime = ts;
            const elapsed = (ts - startTime) / 1000;  
            const t = elapsed % CYCLE;                 

            /* ─ Satellite self-spin (1.5X) ─ */
            const satA = (elapsed * SAT_SPEED) % 360;
            satLants.forEach(sl => {
                sl.style.transform = `rotateY(${satA.toFixed(1)}deg)`;
            });

            /* ─ Satellite continuous orbit (0.5X) ─ */
            const tsY = (elapsed * ORBIT_SPEED) % 360;   // Top right
            const bsY = -(elapsed * ORBIT_SPEED) % 360;  // Bottom left

            /* ─ Main Structure Linear Phases (0.25X) - No Sticking ─ */
            let tY = 0, mY = 0, bY = 0;

            if (t < 15) {
                // Phase 1: Full lantern left
                const a = -(t * MAIN_SPEED);
                tY = mY = bY = a;
            } else if (t < 30) {
                // Phase 2: Full lantern returns right
                const a = -90 + ((t - 15) * MAIN_SPEED);
                tY = mY = bY = a;
            } else if (t < 45) {
                // Phase 3: Top left, Bottom right
                const a = (t - 30) * MAIN_SPEED;
                tY = -a;
                bY = a;
                mY = 0;
            } else if (t < 60) {
                // Phase 4: Top/Bottom return to center
                const a = 90 - ((t - 45) * MAIN_SPEED);
                tY = -a;
                bY = a;
                mY = 0;
            } else if (t < 75) {
                // Phase 5: Middle right
                mY = (t - 60) * MAIN_SPEED;
                tY = bY = 0;
            } else if (t < 90) {
                // Phase 6: Middle returns to center
                mY = 90 - ((t - 75) * MAIN_SPEED);
                tY = bY = 0;
            }

            /* ─ Apply transforms directly ─ */
            elTop.style.transform    = `translate3d(-50%,0,0) rotateY(${tY.toFixed(2)}deg)`;
            elMid.style.transform    = `translate3d(-50%,-50%,0) rotateY(${mY.toFixed(2)}deg)`;
            elBot.style.transform    = `translate3d(-50%,0,0) rotateY(${bY.toFixed(2)}deg)`;
            if(elTopSat) elTopSat.style.transform = `translate3d(0,0,0) rotateY(${tsY.toFixed(2)}deg)`;
            if(elBotSat) elBotSat.style.transform = `translate3d(0,0,0) rotateY(${bsY.toFixed(2)}deg)`;

            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    })();

});
