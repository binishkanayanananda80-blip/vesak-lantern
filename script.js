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
        const CYCLE     = 150;   // full cycle length in seconds
        const SAT_SPEED = 180;   // deg/s for satellite self-spin (1.5× of 2s period)

        // Smooth easing — cubic ease-in-out
        const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

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
            const elapsed = (ts - startTime) / 1000;  // total seconds
            const t = elapsed % CYCLE;                 // position in cycle

            /* ─ Satellite self-spin: always on, silky 60fps ─ */
            const satA = (elapsed * SAT_SPEED) % 360;
            satLants.forEach(sl => {
                sl.style.transform = `rotateY(${satA.toFixed(1)}deg)`;
            });

            /* ─ Phase-based rotation angles ─ */
            let tY = 0, mY = 0, bY = 0, tsY = 0, bsY = 0;

            if (t < 15) {
                // Phase 1a — full lantern sweeps LEFT (0 → -90°)
                const a = -90 * ease(t / 15);
                tY = mY = bY = tsY = bsY = a;

            } else if (t < 30) {
                // Phase 1b — full lantern sweeps RIGHT (-90 → +90°)
                const a = -90 + 180 * ease((t - 15) / 15);
                tY = mY = bY = tsY = bsY = a;

            } else if (t < 45) {
                // Phase 1c — full lantern returns to centre (+90 → 0°)
                const a = 90 * (1 - ease((t - 30) / 15));
                tY = mY = bY = tsY = bsY = a;

            } else if (t < 60) {
                // Phase 2a — top LEFT, bottom RIGHT (split, 0 → ±90°)
                const a = 90 * ease((t - 45) / 15);
                tY = -(a);  tsY = -(a);
                bY =   a;   bsY =   a;
                mY = 0;

            } else if (t < 75) {
                // Phase 2b — split returns to centre (±90 → 0°)
                const a = 90 * (1 - ease((t - 60) / 15));
                tY = -(a);  tsY = -(a);
                bY =   a;   bsY =   a;
                mY = 0;

            } else if (t < 90) {
                // Phase 3a — middle body RIGHT (0 → +90°)
                mY = 90 * ease((t - 75) / 15);
                tY = bY = tsY = bsY = 0;

            } else if (t < 105) {
                // Phase 3b — middle body LEFT (+90 → -90°)
                mY = 90 - 180 * ease((t - 90) / 15);
                tY = bY = tsY = bsY = 0;

            } else if (t < 120) {
                // Phase 3c — middle body returns to centre (-90 → 0°)
                mY = -90 * (1 - ease((t - 105) / 15));
                tY = bY = tsY = bsY = 0;

            } else {
                // Phase 4 — gentle sway (last 30 s of cycle)
                const sway = 12 * Math.sin(((t - 120) / 30) * Math.PI * 2);
                tY = mY = bY = tsY = bsY = sway;
            }

            /* ─ Apply transforms directly — no CSS animation overhead ─ */
            elTop.style.transform    = `translate3d(-50%,0,0) rotateY(${tY.toFixed(2)}deg)`;
            elMid.style.transform    = `translate3d(-50%,-50%,0) rotateY(${mY.toFixed(2)}deg)`;
            elBot.style.transform    = `translate3d(-50%,0,0) rotateY(${bY.toFixed(2)}deg)`;
            elTopSat.style.transform = `translate3d(0,0,0) rotateY(${tsY.toFixed(2)}deg)`;
            elBotSat.style.transform = `translate3d(0,0,0) rotateY(${bsY.toFixed(2)}deg)`;

            requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    })();

});
