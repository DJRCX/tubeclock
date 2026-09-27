(() => {
  'use strict';

  // Prevent duplicate execution if script is injected multiple times
  if (window.__tubeclock_injected) return;
  window.__tubeclock_injected = true;

  const DEFAULT_CONFIG = {
    timeFormat: '12h',          // '12h' | '24h'
    showSeconds: true,
    showDate: false,
    blinkingColon: false,
    theme: 'default',           // 'default' | 'cyan' | 'green' | 'amber' | 'red' | 'white'
    fontStyle: 'modern',        // 'modern' | 'digital'
    fontSize: 'medium',         // 'normal' | 'medium' | 'large' | 'xlarge'
    fullscreenClock: 'top-right' // 'top-right' | 'top-left' | 'off'
  };

  let currentConfig = { ...DEFAULT_CONFIG };

  // Clock instances
  let topbarClock = null;
  let fsClock = null;

  let timerId = null;
  let syncTimeoutId = null;

  /**
   * Factory to construct clock DOM elements and cache references
   */
  function createClockInstance(id, isFullscreen = false) {
    const container = document.createElement('div');
    container.id = id;

    const inner = document.createElement('div');
    inner.className = 'tubeclock-inner';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'tubeclock-date';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'tubeclock-time';

    const hoursSpan = document.createElement('span');
    hoursSpan.className = 'tubeclock-hours';

    const colonSpan = document.createElement('span');
    colonSpan.className = 'tubeclock-colon';
    colonSpan.textContent = ':';

    const minutesSpan = document.createElement('span');
    minutesSpan.className = 'tubeclock-minutes';

    const secondsGroup = document.createElement('span');
    secondsGroup.className = 'tubeclock-seconds-group';

    const colonSecSpan = document.createElement('span');
    colonSecSpan.className = 'tubeclock-colon-sec';
    colonSecSpan.textContent = ':';

    const secondsSpan = document.createElement('span');
    secondsSpan.className = 'tubeclock-seconds';

    secondsGroup.appendChild(colonSecSpan);
    secondsGroup.appendChild(secondsSpan);

    const ampmSpan = document.createElement('span');
    ampmSpan.className = 'tubeclock-ampm';

    timeSpan.appendChild(hoursSpan);
    timeSpan.appendChild(colonSpan);
    timeSpan.appendChild(minutesSpan);
    timeSpan.appendChild(secondsGroup);
    timeSpan.appendChild(ampmSpan);

    inner.appendChild(dateSpan);
    inner.appendChild(timeSpan);
    container.appendChild(inner);

    return {
      container,
      refs: {
        inner,
        date: dateSpan,
        hours: hoursSpan,
        colon: colonSpan,
        minutes: minutesSpan,
        secondsGroup,
        colonSec: colonSecSpan,
        seconds: secondsSpan,
        ampm: ampmSpan
      }
    };
  }

  /**
   * Load user preferences from chrome storage
   */
  async function loadConfig() {
    try {
      const storage = chrome.storage.sync || chrome.storage.local;
      const data = await storage.get(DEFAULT_CONFIG);
      currentConfig = { ...DEFAULT_CONFIG, ...data };
    } catch (err) {
      console.warn('[TubeClock] Could not read preferences, using defaults:', err);
    }
    applyConfig();
    updateClock();
  }

  /**
   * Apply settings (theme, font, size, format) to clock instances
   */
  function applyConfig() {
    const instances = [
      { inst: topbarClock, isFs: false },
      { inst: fsClock, isFs: true }
    ];

    instances.forEach(({ inst, isFs }) => {
      if (!inst || !inst.container) return;

      const { container, refs } = inst;
      container.setAttribute('data-theme', currentConfig.theme);
      container.setAttribute('data-font', currentConfig.fontStyle);
      container.setAttribute('data-size', currentConfig.fontSize);

      if (isFs) {
        container.setAttribute('data-position', currentConfig.fullscreenClock);
        container.style.display = currentConfig.fullscreenClock === 'off' ? 'none' : '';
      }

      if (currentConfig.blinkingColon) {
        refs.inner.classList.add('tubeclock-blink');
      } else {
        refs.inner.classList.remove('tubeclock-blink');
      }

      refs.date.style.display = currentConfig.showDate ? 'inline-block' : 'none';
      refs.secondsGroup.style.display = currentConfig.showSeconds ? 'inline-flex' : 'none';
      refs.ampm.style.display = currentConfig.timeFormat === '12h' ? 'inline-block' : 'none';
    });
  }

  /**
   * Update time display across all active clocks
   */
  function updateClock() {
    const now = new Date();

    // Date string
    let dateStr = '';
    if (currentConfig.showDate) {
      dateStr = now.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }

    // Time calculations
    let hours = now.getHours();
    let ampm = '';

    if (currentConfig.timeFormat === '12h') {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour is 12 AM
    }

    const hStr = currentConfig.timeFormat === '24h' 
      ? String(hours).padStart(2, '0') 
      : String(hours);
    const mStr = String(now.getMinutes()).padStart(2, '0');
    const sStr = String(now.getSeconds()).padStart(2, '0');

    const fullTooltip = `${now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} • ${now.toLocaleTimeString()}`;

    // Update both clocks
    [topbarClock, fsClock].forEach(inst => {
      if (!inst || !inst.refs || !inst.refs.hours) return;
      const { refs } = inst;

      if (currentConfig.showDate && refs.date.textContent !== dateStr) {
        refs.date.textContent = dateStr;
      }

      if (refs.hours.textContent !== hStr) refs.hours.textContent = hStr;
      if (refs.minutes.textContent !== mStr) refs.minutes.textContent = mStr;

      if (currentConfig.showSeconds && refs.seconds.textContent !== sStr) {
        refs.seconds.textContent = sStr;
      }

      if (currentConfig.timeFormat === '12h' && refs.ampm.textContent !== ampm) {
        refs.ampm.textContent = ampm;
      }

      refs.inner.title = fullTooltip;
    });
  }

  /**
   * Start precision ticking aligned to system seconds
   */
  function startTicker() {
    if (timerId) clearInterval(timerId);
    if (syncTimeoutId) clearTimeout(syncTimeoutId);

    updateClock();

    const msToNextSecond = 1000 - (Date.now() % 1000);
    syncTimeoutId = setTimeout(() => {
      updateClock();
      timerId = setInterval(updateClock, 1000);
    }, msToNextSecond);
  }

  /**
   * Inject clock beside the YouTube masthead logo
   */
  function injectTopbarClock() {
    if (topbarClock && topbarClock.container.isConnected) {
      return true;
    }

    const logoRenderer = document.querySelector('ytd-topbar-logo-renderer#logo') ||
                         document.querySelector('ytd-topbar-logo-renderer') ||
                         document.querySelector('#start #logo') ||
                         document.querySelector('a#logo');

    if (!logoRenderer) return false;

    if (!topbarClock) {
      topbarClock = createClockInstance('tubeclock-container', false);
      applyConfig();
    }

    logoRenderer.insertAdjacentElement('afterend', topbarClock.container);
    return true;
  }

  /**
   * Inject hoverable clock into the YouTube fullscreen video player
   */
  function injectFullscreenClock() {
    if (currentConfig.fullscreenClock === 'off') return true;

    if (fsClock && fsClock.container.isConnected) {
      return true;
    }

    const player = document.querySelector('#movie_player') ||
                   document.querySelector('.html5-video-player');

    if (!player) return false;

    if (!fsClock) {
      fsClock = createClockInstance('tubeclock-fullscreen', true);
      applyConfig();
    }

    player.appendChild(fsClock.container);
    return true;
  }

  /**
   * Attempt injection of both clocks
   */
  function injectAll() {
    const topDone = injectTopbarClock();
    const fsDone = injectFullscreenClock();
    if (topDone || fsDone) {
      startTicker();
    }
    return topDone && fsDone;
  }

  /**
   * Initialize observer to maintain injection across YouTube navigation & hydration
   */
  function initObserver() {
    injectAll();

    const observer = new MutationObserver(() => {
      const topConnected = topbarClock && topbarClock.container.isConnected;
      const fsConnected = fsClock && fsClock.container.isConnected;

      if (!topConnected || !fsConnected) {
        injectAll();
      }
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }

  // Handle YouTube Single Page Navigation events
  ['yt-navigate-finish', 'yt-page-data-updated'].forEach(event => {
    window.addEventListener(event, () => {
      injectAll();
    });
  });

  // Handle Fullscreen events
  document.addEventListener('fullscreenchange', () => {
    injectFullscreenClock();
    updateClock();
  });

  // Listen for preference changes from the popup
  try {
    const storage = chrome.storage.sync || chrome.storage.local;
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' || areaName === 'local') {
        for (const key of Object.keys(changes)) {
          if (key in currentConfig) {
            currentConfig[key] = changes[key].newValue;
          }
        }
        applyConfig();
        updateClock();
      }
    });
  } catch (err) {
    console.warn('[TubeClock] Could not attach storage listener:', err);
  }

  // Initial startup
  loadConfig();
  initObserver();
})();
