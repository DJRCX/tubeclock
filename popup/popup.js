(() => {
  'use strict';

  const DEFAULT_CONFIG = {
    timeFormat: '12h',
    showSeconds: true,
    showDate: false,
    blinkingColon: false,
    theme: 'default',
    fontStyle: 'modern'
  };

  let config = { ...DEFAULT_CONFIG };

  // DOM Elements
  const previewClock = document.getElementById('preview-clock');
  const previewDate = document.getElementById('preview-date');
  const previewHours = document.getElementById('preview-hours');
  const previewMinutes = document.getElementById('preview-minutes');
  const previewSecGroup = document.getElementById('preview-sec-group');
  const previewSeconds = document.getElementById('preview-seconds');
  const previewAmpm = document.getElementById('preview-ampm');

  const toggleSeconds = document.getElementById('toggle-seconds');
  const toggleDate = document.getElementById('toggle-date');
  const toggleBlinking = document.getElementById('toggle-blinking');

  const formatButtons = document.querySelectorAll('.segment-btn');
  const fontButtons = document.querySelectorAll('.segment-font-btn');
  const themeButtons = document.querySelectorAll('.theme-dot');

  const storage = chrome.storage.sync || chrome.storage.local;

  /**
   * Save configuration to storage
   */
  async function saveConfig() {
    try {
      await storage.set(config);
    } catch (err) {
      console.error('[TubeClock Popup] Error saving settings:', err);
    }
  }

  /**
   * Update UI controls to match current state
   */
  function updateUI() {
    // Format buttons
    formatButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.format === config.timeFormat);
    });

    // Font buttons
    fontButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.font === config.fontStyle);
    });

    // Toggles
    toggleSeconds.checked = config.showSeconds;
    toggleDate.checked = config.showDate;
    toggleBlinking.checked = config.blinkingColon;

    // Themes
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === config.theme);
    });

    updatePreview();
  }

  /**
   * Update the live preview clock element
   */
  function updatePreview() {
    previewClock.setAttribute('data-theme', config.theme);
    previewClock.setAttribute('data-font', config.fontStyle);

    if (config.blinkingColon) {
      previewClock.classList.add('tubeclock-blink');
    } else {
      previewClock.classList.remove('tubeclock-blink');
    }

    previewDate.style.display = config.showDate ? 'inline-block' : 'none';
    previewSecGroup.style.display = config.showSeconds ? 'inline-flex' : 'none';
    previewAmpm.style.display = config.timeFormat === '12h' ? 'inline-block' : 'none';

    const now = new Date();

    if (config.showDate) {
      previewDate.textContent = now.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }

    let hours = now.getHours();
    let ampm = '';

    if (config.timeFormat === '12h') {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      previewAmpm.textContent = ampm;
    }

    const hStr = config.timeFormat === '24h'
      ? String(hours).padStart(2, '0')
      : String(hours);
    const mStr = String(now.getMinutes()).padStart(2, '0');
    const sStr = String(now.getSeconds()).padStart(2, '0');

    previewHours.textContent = hStr;
    previewMinutes.textContent = mStr;
    previewSeconds.textContent = sStr;
  }

  /**
   * Attach event listeners
   */
  function setupListeners() {
    // Format selection
    formatButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        config.timeFormat = btn.dataset.format;
        updateUI();
        await saveConfig();
      });
    });

    // Font selection
    fontButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        config.fontStyle = btn.dataset.font;
        updateUI();
        await saveConfig();
      });
    });

    // Seconds toggle
    toggleSeconds.addEventListener('change', async (e) => {
      config.showSeconds = e.target.checked;
      updateUI();
      await saveConfig();
    });

    // Date toggle
    toggleDate.addEventListener('change', async (e) => {
      config.showDate = e.target.checked;
      updateUI();
      await saveConfig();
    });

    // Blinking separator toggle
    toggleBlinking.addEventListener('change', async (e) => {
      config.blinkingColon = e.target.checked;
      updateUI();
      await saveConfig();
    });

    // Theme dots
    themeButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        config.theme = btn.dataset.theme;
        updateUI();
        await saveConfig();
      });
    });
  }

  /**
   * Initialize popup
   */
  async function init() {
    try {
      const saved = await storage.get(DEFAULT_CONFIG);
      config = { ...DEFAULT_CONFIG, ...saved };
    } catch (err) {
      console.warn('[TubeClock Popup] Could not load stored config:', err);
    }

    setupListeners();
    updateUI();

    // Start live clock ticking in preview
    setInterval(updatePreview, 1000);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
