# TubeClock - Digital Clock for YouTube™ 🕒

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Platform: Chromium](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Brave%20%7C%20Edge%20%7C%20Arc-orange?style=flat-square)](https://www.google.com/chrome/)

A clean, lightweight, and customizable Chrome extension that seamlessly places a digital clock directly beside the YouTube logo in the top masthead.

Never lose track of time while watching tutorials, podcasts, or videos again!

---

## ✨ Features

- 📍 **Native YouTube Placement**: Sits right beside the YouTube logo in the top masthead, perfectly aligned with the navigation bar.
- 🌓 **Dynamic Theme Matching**: Automatically adapts to YouTube Dark Mode and Light Mode using YouTube's native design tokens.
- ⏱️ **Flexible Time Formats**: Toggle between **12-Hour** (with AM/PM) and **24-Hour** military time.
- ⚡ **Real-Time Seconds**: Choose to show or hide the seconds counter (`:ss`).
- 📅 **Date Display**: Optional date badge (e.g., `Sun, Sep 27`) right beside the time.
- 🎬 **Fullscreen Video Clock**: When watching in fullscreen, a sleek frosted-glass clock overlays the video player. It auto-hides with playback controls and seamlessly reveals itself whenever you hover your cursor over it!
- 🔍 **Adjustable Font Sizes**: Choose between **Normal (14px)**, **Medium (16px)**, **Large (18px)**, and **XL (20px)** for optimal viewing.
- 🎨 **Color Themes**:
  - **Auto (YouTube Native)**: Matches YouTube's theme automatically.
  - **Neon Cyan**: Futuristic glowing cyan.
  - **Emerald Green**: Bright emerald accent.
  - **Warm Amber**: Classic warm amber/gold.
  - **YouTube Red**: Signature YouTube vibrant red.
  - **Crisp White**: High-contrast white.
- 🔠 **Typography Options**: Switch between **Modern Sans** (Roboto/YouTube Sans) and **Digital Monospace** (JetBrains/SF Mono).
- 💓 **Blinking Separator**: Optional pulsing colon (`:`) every second.
- 🚀 **Zero Lag & No Telemetry**: Runs locally in your browser. Collects zero user data and requires no external network requests.
- 🔄 **Live Sync**: Changes made in the popup apply instantly to all open YouTube tabs without needing to refresh!

---

## 📥 Installation Guide (Free / Developer Mode)

Since this extension is open-source and not distributed via the paid Chrome Web Store, you can easily install it in 1 minute using Chromium's **Developer Mode**:

### For Google Chrome, Brave, Arc, Microsoft Edge, and Opera:

1. **Download the Extension**:
   - Clone this repository:
     ```bash
     git clone https://github.com/DJRCX/tubeclock.git
     ```
   - *Or* download the latest `.zip` release, extract it to a folder on your computer.

2. **Open Extensions Page**:
   - In **Google Chrome**: Navigate to `chrome://extensions/`
   - In **Brave**: Navigate to `brave://extensions/`
   - In **Microsoft Edge**: Navigate to `edge://extensions/`

3. **Enable Developer Mode**:
   - In the top-right corner of the Extensions page, toggle **Developer mode** to **ON**.

4. **Load the Extension**:
   - Click the **"Load unpacked"** button in the top-left toolbar.
   - Select the `youtube-digital-clock` folder (the directory containing `manifest.json`).

5. **Pin & Test**:
   - Click the puzzle piece icon in Chrome's toolbar and pin **TubeClock**.
   - Navigate to [YouTube](https://www.youtube.com) — you will see your new digital clock right beside the YouTube logo!

---

## ⚙️ Customization

Click the **TubeClock** icon in your browser toolbar to open the settings popup:
- **Live Preview**: See your changes in real-time as you tweak settings.
- **12h / 24h Toggle**: Switch format on the fly.
- **Show Seconds & Date**: Toggle details on or off.
- **Color Palettes**: Pick your favorite color accent.

---

## 🛠️ Project Structure

```
youtube-digital-clock/
├── manifest.json         # Manifest V3 extension configuration
├── icons/                # High-res icons (16px, 48px, 128px)
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── content/              # Content scripts injected into YouTube
│   ├── content.js        # DOM injection, ticking logic, SPA listeners
│   └── content.css       # Native YouTube styles and color themes
├── popup/                # Extension action popup
│   ├── popup.html        # Settings interface layout
│   ├── popup.css         # Modern dark-themed styling
│   └── popup.js          # Settings state and live preview logic
├── generate_icons.py     # Script to generate crisp PNG icons
├── package_release.sh    # Script to create clean distribution ZIP
├── LICENSE               # MIT License
└── README.md             # Documentation
```

---

## 🔒 Privacy Policy

TubeClock respects your privacy:
- **No Data Collected**: TubeClock does not collect, store, or transmit any personal data, browsing history, or analytics.
- **Local Storage Only**: All user preferences (time format, color theme) are stored strictly on your local device using Chrome's built-in storage API.
- **No External Servers**: Does not make any network requests.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Feel free to modify and share!
