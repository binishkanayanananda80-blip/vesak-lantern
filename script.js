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

});
