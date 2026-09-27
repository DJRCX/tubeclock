(() => {
  'use strict';

  // Prevent duplicate execution if script is injected multiple times
  if (window.__tubeclock_injected) return;
  window.__tubeclock_injected = true;

  const DEFAULT_CONFIG = {
    timeFormat: '12h',      // '12h' | '24h'
    showSeconds: true,
    showDate: false,
    blinkingColon: false,
    theme: 'default',       // 'default' | 'cyan' | 'green' | 'amber' | 'red' | 'white'
    fontStyle: 'modern'     // 'modern' | 'digital'
  };

  let currentConfig = { ...DEFAULT_CONFIG };
  let clockContainer = null;
  let timerId = null;
  let syncTimeoutId = null;

  // Cache element references inside the clock
  let domRefs = {
    inner: null,
    date: null,
    hours: null,
    colon: null,
    minutes: null,
    secondsGroup: null,
    colonSec: null,
    seconds: null,
    ampm: null
  };

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
   * Build the clock DOM structure
   */
  function createClockElement() {
    const container = document.createElement('div');
    container.id = 'tubeclock-container';
    container.setAttribute('data-theme', currentConfig.theme);
    container.setAttribute('data-font', currentConfig.fontStyle);

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

    domRefs = {
      inner,
      date: dateSpan,
      hours: hoursSpan,
      colon: colonSpan,
      minutes: minutesSpan,
      secondsGroup,
      colonSec: colonSecSpan,
      seconds: secondsSpan,
      ampm: ampmSpan
    };

    return container;
  }

  /**
   * Apply configuration classes and attributes to DOM
   */
  function applyConfig() {
    if (!clockContainer) return;

    clockContainer.setAttribute('data-theme', currentConfig.theme);
    clockContainer.setAttribute('data-font', currentConfig.fontStyle);

    if (currentConfig.blinkingColon) {
      domRefs.inner.classList.add('tubeclock-blink');
    } else {
      domRefs.inner.classList.remove('tubeclock-blink');
    }

    domRefs.date.style.display = currentConfig.showDate ? 'inline-block' : 'none';
    domRefs.secondsGroup.style.display = currentConfig.showSeconds ? 'inline-flex' : 'none';
    domRefs.ampm.style.display = currentConfig.timeFormat === '12h' ? 'inline-block' : 'none';
  }

  /**
   * Update time display
   */
  function updateClock() {
    if (!domRefs.hours) return;

    const now = new Date();

    // Date display (e.g. "Sun, Sep 27")
    if (currentConfig.showDate) {
      const dateStr = now.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      domRefs.date.textContent = dateStr;
    }

    // Time calculation
    let hours = now.getHours();
    let ampm = '';

    if (currentConfig.timeFormat === '12h') {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour is 12 AM
      domRefs.ampm.textContent = ampm;
    }

    const hStr = currentConfig.timeFormat === '24h' 
      ? String(hours).padStart(2, '0') 
      : String(hours);
    const mStr = String(now.getMinutes()).padStart(2, '0');

    if (domRefs.hours.textContent !== hStr) domRefs.hours.textContent = hStr;
    if (domRefs.minutes.textContent !== mStr) domRefs.minutes.textContent = mStr;

    if (currentConfig.showSeconds) {
      const sStr = String(now.getSeconds()).padStart(2, '0');
      if (domRefs.seconds.textContent !== sStr) domRefs.seconds.textContent = sStr;
    }

    // Tooltip with detailed date & time
    const fullDate = now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    domRefs.inner.title = `${fullDate} • ${now.toLocaleTimeString()}`;
  }

  /**
   * Start precision ticking aligned to system seconds
   */
  function startTicker() {
    if (timerId) clearInterval(timerId);
    if (syncTimeoutId) clearTimeout(syncTimeoutId);

    updateClock();

    // Align to the start of the next exact second
    const msToNextSecond = 1000 - (Date.now() % 1000);
    syncTimeoutId = setTimeout(() => {
      updateClock();
      timerId = setInterval(updateClock, 1000);
    }, msToNextSecond);
  }

  /**
   * Find YouTube's logo renderer and insert the clock beside it
   */
  function injectClock() {
    // Check if already in the DOM and still connected
    if (clockContainer && clockContainer.isConnected) {
      return true;
    }

    // Attempt to locate YouTube logo element
    const logoRenderer = document.querySelector('ytd-topbar-logo-renderer#logo') ||
                         document.querySelector('ytd-topbar-logo-renderer') ||
                         document.querySelector('#start #logo') ||
                         document.querySelector('a#logo');

    if (!logoRenderer) return false;

    if (!clockContainer) {
      clockContainer = createClockElement();
      applyConfig();
      startTicker();
    }

    // Insert directly adjacent to the logo
    logoRenderer.insertAdjacentElement('afterend', clockContainer);
    return true;
  }

  /**
   * Initialize observer to maintain injection across YouTube SPA page switches
   */
  function initObserver() {
    if (injectClock()) return;

    const observer = new MutationObserver(() => {
      if (injectClock()) {
        // Disconnect once injected, but re-watch if masthead reloads
        observer.disconnect();
        watchMasthead();
      }
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Keep a lightweight observer on the masthead / start area to re-attach if YouTube removes it
   */
  function watchMasthead() {
    const target = document.querySelector('#masthead') || document.querySelector('ytd-masthead') || document.body;
    if (!target) return;

    const mastheadObserver = new MutationObserver(() => {
      if (!clockContainer || !clockContainer.isConnected) {
        injectClock();
      }
    });

    mastheadObserver.observe(target, {
      childList: true,
      subtree: true
    });
  }

  // Handle YouTube Single Page Navigation events
  ['yt-navigate-finish', 'yt-page-data-updated'].forEach(event => {
    window.addEventListener(event, () => {
      if (!clockContainer || !clockContainer.isConnected) {
        injectClock();
      }
    });
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
