// index.html — "Meghkumar" video slate
// States: poster -> video-ready -> video-playing (see index.css bottom section + index.md)
// All poster/panel/arc/video-panel motion is driven by GSAP (assets/plugins/gsap.min.js).
document.addEventListener('DOMContentLoaded', function () {
    var mainContainer = document.getElementById('mainContainer');
    var btnHome = document.getElementById('btnHome');
    var poster = document.getElementById('poster');
    var posterPanel = document.getElementById('posterPanel');
    var posterArc = document.getElementById('posterArc');
    var posterTitle = document.getElementById('posterTitle');
    var btnPosterPlay = document.getElementById('btnPosterPlay');
    var videoPanel = document.getElementById('videoPanel');
    var btnVideoPlay = document.getElementById('btnVideoPlay');
    var btnVideoPause = document.getElementById('btnVideoPause');
    var btnVideoReplay = document.getElementById('btnVideoReplay');
    var btnBarToggle = document.getElementById('btnBarToggle');
    var btnMute = document.getElementById('btnMute');
    var volumeSlider = document.getElementById('volumeSlider');
    var volumeFill = document.getElementById('volumeFill');
    var volumeHandle = document.getElementById('volumeHandle');
    var btnFullscreen = document.getElementById('btnFullscreen');
    var seekSlider = document.getElementById('seekSlider');
    var slateVideo = document.getElementById('slateVideo');
    var playerTime = document.getElementById('playerTime');
    var seekFill = document.getElementById('seekFill');
    var seekHandle = document.getElementById('seekHandle');

    var isHovered = false;
    var isOpening = false;

    function setState(state) {
        mainContainer.setAttribute('data-state', state);
        btnHome.classList.toggle('is-visible', state !== 'poster');
    }

    // ===== initial transforms (GSAP owns these — see index.css comment on `.poster`) =====
    // Title starts shifted down by 60% of its own height (hidden below/behind the arc) and
    // transparent; the video panel starts fully off-screen above the frame (clipped by
    // `.main-container`'s own overflow:hidden), ready to slide down once play is clicked.
    gsap.set(posterTitle, { xPercent: -50, yPercent: 10, opacity: 0 });
    gsap.set(btnPosterPlay, { opacity: 0, scale: 0.8, transformOrigin: '50% 50%' });
    gsap.set(videoPanel, { yPercent: -140 });
    // play / pause / replay all rest at the same spot (see index.css) — pause and replay start
    // fully hidden; replay also starts at x:0 (behind pause) and slides out on play click.
    gsap.set([btnVideoPlay, btnVideoPause, btnVideoReplay], { transformOrigin: '50% 50%' });
    gsap.set(btnVideoPlay, { opacity: 0, scale: 1 });
    gsap.set([btnVideoPause, btnVideoReplay], { opacity: 0, scale: 0.7, x: 0 });

    // ===== hover / tap reveal (poster stage only) =====
    function revealPoster() {
        if (isHovered || isOpening) { return; }
        isHovered = true;
        gsap.to(posterTitle, { yPercent: -50, opacity: 1, duration: 0.9, ease: 'power2.out' });
        gsap.to(btnPosterPlay, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)', pointerEvents: 'auto' });
    }

    function hidePoster() {
        if (!isHovered || isOpening) { return; }
        isHovered = false;
        gsap.to(posterTitle, { yPercent: 10, opacity: 0, duration: 0.6, ease: 'power2.in' });
        gsap.to(btnPosterPlay, { opacity: 0, scale: 0.8, duration: 0.5, ease: 'power2.in', pointerEvents: 'none' });
    }

    poster.addEventListener('mouseenter', revealPoster);
    poster.addEventListener('mouseleave', hidePoster);
    // touch devices have no persistent hover — a tap reveals the controls the same way
    poster.addEventListener('touchstart', revealPoster, { passive: true });

    // ===== play click: arc slides down, panel slides up, video panel slides down to center =====
    function openVideo() {
        if (isOpening) { return; }
        isOpening = true;
        poster.style.pointerEvents = 'none';

        var tl = gsap.timeline();
        tl.to(btnPosterPlay, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 0)
            .to(posterArc, { yPercent: 100, duration: 1.2, ease: 'power2.inOut' }, 0)
            .to(posterPanel, { yPercent: -100, duration: 1.2, ease: 'power2.inOut' }, 0)
            .call(function () { setState('video-ready'); }, null, 0.6)
            .to(videoPanel, { yPercent: 0, duration: 1.1, ease: 'power3.out' }, 0.6)
            .to(btnVideoPlay, { opacity: 1, duration: 0.4, ease: 'power2.out', pointerEvents: 'auto' }, 0.9)
            .call(function () { videoPanel.classList.add('is-interactive'); });
    }

    btnPosterPlay.addEventListener('click', openVideo);

    // play -> pause+replay crossfades in place, both spreading out symmetrically from that same
    // center spot (pause to the left half, replay to the right half) so the PAIR stays centered
    // on the panel — not just pause alone, with replay merely tacked on to one side.
    var PAIR_HALF_SPREAD = '2.6vw';

    function showPlayingControls() {
        gsap.to(btnVideoPlay, { opacity: 0, scale: 0.7, duration: 0.3, ease: 'power1.in', pointerEvents: 'none' });
        gsap.fromTo(btnVideoPause,
            { opacity: 0, scale: 0.7, x: 0 },
            { opacity: 1, scale: 1, x: '-' + PAIR_HALF_SPREAD, duration: 0.45, ease: 'power2.out', pointerEvents: 'auto', delay: 0.08 });
        gsap.fromTo(btnVideoReplay,
            { opacity: 0, scale: 0.7, x: 0 },
            { opacity: 1, scale: 1, x: PAIR_HALF_SPREAD, duration: 0.45, ease: 'power2.out', pointerEvents: 'auto', delay: 0.08 });
    }

    function showPausedControls() {
        gsap.to(btnVideoPause, { opacity: 0, scale: 0.7, x: 0, duration: 0.3, ease: 'power1.in', pointerEvents: 'none' });
        gsap.to(btnVideoReplay, { opacity: 0, scale: 0.7, x: 0, duration: 0.3, ease: 'power1.in', pointerEvents: 'none' });
        gsap.fromTo(btnVideoPlay,
            { opacity: 0, scale: 0.7 },
            { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)', pointerEvents: 'auto', delay: 0.1 });
    }

    function startPlayback() {
        setState('video-playing');
        showPlayingControls();
        slateVideo.play().catch(function () {});
    }

    function pausePlayback() {
        slateVideo.pause();
        setState('video-ready');
        showPausedControls();
    }

    btnVideoPlay.addEventListener('click', function () {
        startPlayback();
    });

    btnVideoPause.addEventListener('click', function () {
        pausePlayback();
    });

    btnVideoReplay.addEventListener('click', function () {
        slateVideo.currentTime = 0;
        slateVideo.play().catch(function () {});
        gsap.fromTo(btnVideoReplay, { rotate: 0 }, { rotate: 360, duration: 0.5, ease: 'power2.out' });
    });

    btnBarToggle.addEventListener('click', function () {
        if (slateVideo.paused || slateVideo.ended) {
            startPlayback();
        } else {
            pausePlayback();
        }
    });

    // ===== bottom control bar: mute, volume, fullscreen, seek =====
    // Shared drag-or-click slider behavior for both the volume and seek tracks — reports a
    // 0-1 fraction of the track's width under the pointer.
    function makeSlider(track, onChange) {
        var dragging = false;
        function update(clientX) {
            var rect = track.getBoundingClientRect();
            var pct = rect.width ? (clientX - rect.left) / rect.width : 0;
            onChange(Math.max(0, Math.min(1, pct)));
        }
        track.addEventListener('pointerdown', function (e) {
            dragging = true;
            try { track.setPointerCapture(e.pointerId); } catch (err) { /* not critical to dragging */ }
            update(e.clientX);
        });
        track.addEventListener('pointermove', function (e) {
            if (dragging) { update(e.clientX); }
        });
        track.addEventListener('pointerup', function () { dragging = false; });
        track.addEventListener('pointercancel', function () { dragging = false; });
    }

    function updateVolumeUI() {
        var pct = slateVideo.muted ? 0 : slateVideo.volume * 100;
        volumeFill.style.width = pct + '%';
        volumeHandle.style.left = pct + '%';
        btnMute.classList.toggle('is-muted', slateVideo.muted || slateVideo.volume === 0);
    }

    makeSlider(volumeSlider, function (pct) {
        slateVideo.volume = pct;
        slateVideo.muted = pct === 0;
    });

    slateVideo.addEventListener('volumechange', updateVolumeUI);
    updateVolumeUI();

    btnMute.addEventListener('click', function () {
        slateVideo.muted = !slateVideo.muted;
    });

    makeSlider(seekSlider, function (pct) {
        if (slateVideo.duration) {
            slateVideo.currentTime = pct * slateVideo.duration;
        }
    });

    function isFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    btnFullscreen.addEventListener('click', function () {
        if (!isFullscreen()) {
            var request = videoPanel.requestFullscreen || videoPanel.webkitRequestFullscreen;
            if (request) {
                var result = request.call(videoPanel);
                if (result && result.catch) { result.catch(function () {}); }
            }
        } else {
            var exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (exit) {
                var exitResult = exit.call(document);
                if (exitResult && exitResult.catch) { exitResult.catch(function () {}); }
            }
        }
    });

    function formatTime(seconds) {
        if (!isFinite(seconds)) { return '0:00'; }
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    slateVideo.addEventListener('timeupdate', function () {
        var duration = slateVideo.duration || 0;
        var current = slateVideo.currentTime || 0;
        var pct = duration ? (current / duration) * 100 : 0;
        seekFill.style.width = pct + '%';
        seekHandle.style.left = pct + '%';
        playerTime.textContent = formatTime(current) + ' / ' + formatTime(duration);
    });

    slateVideo.addEventListener('ended', function () {
        setState('video-ready');
        showPausedControls();
    });
});
