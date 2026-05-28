document.addEventListener('DOMContentLoaded', () => {
    // 1. Background Particles
    const bgContainer = document.getElementById('background-container');
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Randomize properties
        const size = Math.random() * 5 + 1; // 1px to 6px
        const left = Math.random() * 100; // 0% to 100%
        const duration = Math.random() * 10 + 5; // 5s to 15s
        const delay = Math.random() * 10; // 0s to 10s
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}vw`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        bgContainer.appendChild(particle);
    }

    // 2. Interactive Controls
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnLight = document.getElementById('btn-light');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnMusic = document.getElementById('btn-music');
    const themeSelect = document.getElementById('theme-select');
    
    const lanternAssembly = document.getElementById('lantern-assembly');
    const body = document.body;
    const bgMusic = document.getElementById('bg-music');

    // Play/Pause Animation
    let isPlaying = true;
    btnPlayPause.addEventListener('click', () => {
        if (isPlaying) {
            body.classList.add('paused');
            btnPlayPause.textContent = 'Play Animation';
        } else {
            body.classList.remove('paused');
            btnPlayPause.textContent = 'Pause Animation';
        }
        isPlaying = !isPlaying;
    });

    // Light Toggle
    let isLightOn = true;
    btnLight.addEventListener('click', () => {
        if (isLightOn) {
            body.classList.add('lights-off');
            btnLight.textContent = 'Light On';
        } else {
            body.classList.remove('lights-off');
            btnLight.textContent = 'Light Off';
        }
        isLightOn = !isLightOn;
    });

    // Theme Switch
    const themes = Array.from(themeSelect.options).map(opt => opt.value);
    let currentThemeIndex = themes.indexOf(themeSelect.value) !== -1 ? themes.indexOf(themeSelect.value) : 0;

    function applyTheme(newTheme) {
        // Remove all theme classes
        body.className = body.className.replace(/\btheme-\S+/g, '').trim();
        // Add new theme class
        if (newTheme) {
            body.classList.add(newTheme);
        }
        
        // Restore paused/lights-off states if they existed
        if (!isPlaying) body.classList.add('paused');
        if (!isLightOn) body.classList.add('lights-off');
        
        // Update select dropdown
        themeSelect.value = newTheme;
        currentThemeIndex = themes.indexOf(newTheme);
    }

    themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    // Automatically rotate themes every 5 seconds
    setInterval(() => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        applyTheme(themes[currentThemeIndex]);
    }, 5000);

    // Advanced Light Sequence (20-second cycle)
    // 0-10s: All Lights Normal (Previous Logic)
    // 10-15s: Middle OFF, Small ON (New Logic Part 1)
    // 15-20s: Middle ON, Small OFF (New Logic Part 2)
    let lightState = 0;
    setInterval(() => {
        if (!isLightOn) return; // If user manually turned off all lights, don't override

        // Default to all lights ON
        body.classList.remove('middle-off');
        body.classList.remove('small-off');

        if (lightState === 2) {
            body.classList.add('middle-off');
        } else if (lightState === 3) {
            body.classList.add('small-off');
        }

        // Advance the state machine (loops 0, 1, 2, 3)
        lightState = (lightState + 1) % 4;
    }, 3000);

    // Fullscreen Mode
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
            });
            btnFullscreen.textContent = 'Exit Fullscreen';
        } else {
            document.exitFullscreen();
            btnFullscreen.textContent = 'Fullscreen';
        }
    });

    // Handle ESC key or other ways to exit fullscreen
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            btnFullscreen.textContent = 'Fullscreen';
        }
    });

    // Music Toggle
    let isMusicPlaying = false;
    btnMusic.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            btnMusic.textContent = 'Play Music';
        } else {
            // Note: browser might block autoplay, user interaction here should allow it
            bgMusic.play().catch(error => {
                console.log("Audio play failed:", error);
                alert("Please add a valid audio file or wait for the user to upload one.");
            });
            btnMusic.textContent = 'Pause Music';
        }
        isMusicPlaying = !isMusicPlaying;
    });
});
