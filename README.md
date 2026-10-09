# 🌙 Prayer Times for Xiaomi Redmi Watch 6 (Xiaomi Vela / HyperOS)

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Xiaomi%20Vela%20RTOS-blue.svg)](https://iot.mi.com/vela/)
[![Device](https://img.shields.io/badge/Device-Redmi%20Watch%206-orange.svg)](https://www.mi.com/)
[![QuickApp](https://img.shields.io/badge/Format-QuickApp%20(.rpk)-purple.svg)](https://iot.mi.com/vela/quickapp/)
[![Offline First](https://img.shields.io/badge/Network-100%25%20Offline-success.svg)](#features)

A standalone, 100% offline-first Islamic Prayer Times and Qibla application built specifically for the **Xiaomi Redmi Watch 6** (Model `M2523W1`, Bestechnic BES SoC, Apache NuttX RTOS) using the **Xiaomi Vela JS QuickApp** wearable framework.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Technical Design](#-architecture--technical-design)
- [Project Structure](#-project-structure)
- [Prerequisites & Building from Source](#-prerequisites--building-from-source)
- [Testing & Verification](#-testing--verification)
- [Simulator Testing (AIoT-IDE)](#-simulator-testing-aiot-ide)
- [Real Watch Installation (AstroBox-NG & AuthKey Extraction)](#-real-watch-installation-via-astrobox-ng)
  - [Understanding the AuthKey Token](#understanding-the-authkey-token)
  - [Step 1: Extracting Your Xiaomi Account `auth_key` Token](#step-1-extracting-your-xiaomi-account-auth_key-token)
  - [Step 2: Connecting AstroBox-NG to Your Watch](#step-2-connecting-astrobox-ng-to-your-watch)
  - [Step 3: Sideloading the Release RPK](#step-3-sideloading-the-release-rpk)
- [Settings & Customization](#-settings--customization)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [License](#-license)

---

## 🌟 Overview

The **Redmi Watch 6** runs Xiaomi HyperOS powered by the Apache NuttX-based **Xiaomi Vela** real-time operating system. While commercial smartwatches often rely on continuous companion-phone tethering to fetch Islamic prayer times via REST APIs, this app runs **100% locally and autonomously** on the watch's microcontroller:

- **Zero network dependencies**: No smartphone connection, Wi-Fi, or cellular network required during daily operation.
- **Ultra-low power consumption**: Calculations take **~5 microseconds** per cycle, running entirely in pure JavaScript without third-party runtime dependencies.
- **AMOLED-optimized UI**: Deep black (`#000000`) theme shuts off OLED pixels across the 2.07" display, preserving all-day battery life.

---

## ✨ Key Features

- **⚡ Offline Astronomical Calculation Engine**:
  - Calculates Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha using solar declination and equation of time equations.
  - Supports high-latitude adjustments (Angle-based, Midnight, One-Seventh).
- **⏱️ Hero Next-Prayer Display**:
  - Highlights upcoming prayer name and scheduled time.
  - Live ticking countdown timer (`HH:MM:SS`) updated every second.
  - Proportional daylight timeline progress bar.
- **📋 Daily Prayer Schedule**:
  - Chronological schedule for the day with an emerald indicator on the active prayer window.
  - Supports both **12-Hour (AM/PM)** and **24-Hour** time formats.
- **🧭 Crash-Proof Qibla Direction**:
  - Calculates great-circle spherical trigonometry bearing and direct geodesic distance to the Kaaba (`21.4225° N, 39.8262° E`).
  - Displays an 8-cardinal directional HUD (`N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`) with numeric azimuth heading (e.g. `244° WSW`).
  - Engineered without unstable native sensor loops or unsupported CSS transforms, ensuring **100% stability without watch reboots**.
- **📍 Location Modes & Persistent GPS Lock**:
  - **Standalone GNSS/GPS Sync**: One-tap hardware location lock via `@system.geolocation`.
  - **Persistent GPS Lock**: Saves your locked GPS coordinates across app and watch restarts. Settings includes a one-tap `📍 Use Saved GPS (XX.XX° N, YY.YY° E)` button to re-apply your fix anytime without waiting for satellites.
  - **Offline City Presets**: Built-in coordinates and calculation presets for:
    - **Saudi Arabia**: Riyadh, Makkah, Madinah, Buraydah
    - **Egypt**: Cairo, Mit Ghamr
    - **Gulf & Levant**: Dubai, Abu Dhabi, Kuwait City, Doha, Amman, Beirut, Baghdad
    - **International**: Istanbul, London, Jakarta, Kuala Lumpur
- **📐 Major Calculation Conventions**:
  - Umm al-Qura University (Makkah)
  - Muslim World League (MWL)
  - Egyptian General Authority of Survey
  - University of Islamic Sciences, Karachi
  - Dubai / UAE General Authority of Islamic Affairs
  - Islamic Society of North America (ISNA)
- **⚖️ Asr Juristic Rules**:
  - Standard (Shafi'i, Maliki, Hanbali — shadow factor 1)
  - Hanafi (shadow factor 2)
- **📳 Haptic Adhan Vibrations**:
  - Dispatches gentle hardware vibration (`@system.vibrator`) when prayer time enters.
- **📅 Algorithmic Hijri Date**:
  - Algorithmic Umm al-Qura approximate lunar calendar conversion displayed on the home screen.
- **🛡️ Race-Condition-Free Storage**:
  - Single-flight storage mutex and memory caching eliminate flash driver collisions on cold launches.

---

## 🏗️ Architecture & Technical Design

```
Redmi Watch 6 (Xiaomi Vela RTOS / NuttX)
┌────────────────────────────────────────────────────────┐
│ QuickApp Layer (Vela JS Runtime / Webpack)             │
│                                                        │
│  ┌───────────────────┐  ┌───────────────────────────┐  │
│  │   index.ux        │  │   qibla.ux / settings.ux  │  │
│  │   (Main Screen)   │  │   (Qibla & Preferences)   │  │
│  └─────────┬─────────┘  └─────────────┬─────────────┘  │
│            │                          │                │
│  ┌─────────▼──────────────────────────▼─────────────┐  │
│  │ Pure JS Core Modules                             │  │
│  │  ├── prayer-engine.js  (Astronomical solar math) │  │
│  │  ├── qibla.js          (Great-circle bearing)    │  │
│  │  ├── hijri.js          (Umm al-Qura converter)   │  │
│  │  ├── cities.js         (Offline presets)         │  │
│  │  └── storage.js        (Cached async storage)    │  │
│  └─────────────────────┬────────────────────────────┘  │
│                        │                               │
│  ┌─────────────────────▼────────────────────────────┐  │
│  │ Hardware System Bridges (@system.*)              │  │
│  │  ├── @system.storage     (Persistent flash key)  │  │
│  │  ├── @system.geolocation (Hardware GNSS GPS)     │  │
│  │  ├── @system.vibrator    (Haptic feedback motor) │  │
│  │  └── @system.router      (Page stack navigation) │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
RedmiWatchPrayerTime/
├── src/
│   ├── manifest.json              # App configuration, screen specs, permissions
│   ├── app.ux                     # Global application lifecycle
│   ├── common/
│   │   ├── prayer-engine.js       # Solar trigonometry calculation engine
│   │   ├── qibla.js               # Spherical great-circle bearing calculations
│   │   ├── hijri.js               # Algorithmic Gregorian-to-Hijri converter
│   │   ├── cities.js              # Built-in offline global cities database
│   │   └── storage.js             # Async storage wrapper with deduplication
│   └── pages/
│       ├── index/index.ux         # Main Dashboard & Timeline Screen
│       ├── qibla/qibla.ux         # Qibla Direction & Kaaba Distance Screen
│       └── settings/settings.ux   # Location, Method, Format & Alert Settings
├── test/
│   └── prayer-engine.test.js      # Automated unit test suite (27 assertions)
├── sign/                          # Packaging certificates (debug & release)
├── dist/                          # Compiled .rpk package outputs
├── package.json                   # Build scripts and dependencies
├── .gitignore                     # Git ignore rules for build artifacts
└── README.md                      # Complete project documentation
```

---

## 💻 Prerequisites & Building from Source

### Prerequisites
- **Node.js**: v18.x or v20.x (LTS recommended)
- **npm**: v8.x or newer
- **Operating System**: Windows 10/11, macOS, or Linux

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/RedmiWatchPrayerTime.git
cd RedmiWatchPrayerTime
npm install
```

### 2. Run Test Suite
```bash
npm test
```
Runs 27 assertions verifying astronomical accuracy against ground truth in Riyadh, Cairo, Karachi, London, and Jakarta, testing Asr rules, time formatting, and sub-millisecond execution speeds.

### 3. Build Debug Package (.rpk)
```bash
npm run build
```
Builds the unminified debug package at:
`dist/com.muslim.prayertimes.debug.1.0.0.rpk`

### 4. Build Production Release Package (.rpk)
```bash
npm run release
```
Produces the production-optimized, signed `.rpk` at:
`dist/com.muslim.prayertimes.release.1.0.0.rpk` (or root `com.muslim.prayertimes.release.1.0.0.rpk`)

---

## 🖥️ Simulator Testing (AIoT-IDE)

1. Download and install **Xiaomi AIoT-IDE** from the official portal: [Xiaomi Vela Developer Documentation](https://iot.mi.com/vela/quickapp/zh/guide/start/use-ide.html).
2. Launch AIoT-IDE and open the project directory: `RedmiWatchPrayerTime`.
3. Open the **Emulator Manager** in the IDE and start `Vela_Virtual_Device`.
4. Press `F5` or click **Run Debugging**.
5. Choose device display preset: **432 × 514** (Redmi Watch 5 / 6 screen resolution).

---

## ⌚ Real Watch Installation via AstroBox-NG

To install third-party QuickApps (`.rpk`) onto a retail **Xiaomi Redmi Watch 6**, you must use a Bluetooth Low Energy (BLE) sideloading client such as **AstroBox-NG**.

### Understanding the AuthKey Token
Xiaomi HyperOS and Vela smartwatches encrypt all Bluetooth communications with the paired phone using a private **32-character hexadecimal key** (often called `auth_key`, `bindkey`, or `Token`). 

Without this key, third-party desktop tools cannot complete the BLE security handshake to push `.rpk` packages to the watch's internal flash storage (`/data/app/`).

---

### Step 1: Extracting Your Xiaomi Account `auth_key` Token

The simplest and most reliable way to retrieve your watch's `auth_key` without rooting your phone is using the open-source **Xiaomi Cloud Tokens Extractor**.

1. **Download the Extractor**:
   - Visit the official repository: [PiotrMachowski/Xiaomi-Cloud-Tokens-Extractor](https://github.com/PiotrMachowski/Xiaomi-Cloud-Tokens-Extractor).
   - Download the standalone Windows executable (`token_extractor.exe`) from the **Releases** section, or clone the repository to run with Python:
     ```bash
     git clone https://github.com/PiotrMachowski/Xiaomi-Cloud-Tokens-Extractor.git
     cd Xiaomi-Cloud-Tokens-Extractor
     pip install -r requirements.txt
     python token_extractor.py
     ```
2. **Log into your Xiaomi Account**:
   - Run the tool.
   - Enter your Xiaomi Account **Username** (Email address, Mi ID, or Phone number).
   - Enter your **Password**.
   - If you have two-factor authentication (2FA) enabled, enter the verification code sent to your phone or email.
3. **Select Server Region**:
   - When prompted for Server Region (`cn`, `de`, `us`, `ru`, `tw`, `sg`, `i2`), press **Enter** (leave blank) to scan all server regions, or type your account's specific region.
4. **Locate your Watch**:
   - The tool will print all devices associated with your Xiaomi account:
   ```text
   --------------------------------------------------
   Device Name:   Redmi Watch 6
   Model:         M2523W1
   IP Address:    ...
   MAC Address:   AA:BB:CC:DD:EE:FF
   Token / BLE:   4a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d   <--- THIS IS YOUR AUTH_KEY
   --------------------------------------------------
   ```
5. **Copy the 32-character Key**:
   - Save the 32-character hexadecimal string.

> [!TIP]
> **Alternative extraction method**: If you use a rooted Android phone or modded Mi Fitness app (e.g. by m0tral), the token is logged in plaintext inside `/sdcard/Android/data/com.mi.health/files/log/` or the SQLite database at `/data/data/com.mi.health/databases/`.

---

### Step 2: Connecting AstroBox-NG to Your Watch

1. **Download AstroBox-NG**:
   - Download the latest release from GitHub: [AstralSightStudios/AstroBox-NG Releases](https://github.com/AstralSightStudios/AstroBox-NG).
2. **Prepare the Watch**:
   - **Crucial Step**: Temporarily turn **Bluetooth OFF on your smartphone** (or disconnect the watch inside Mi Fitness).
   - The Redmi Watch 6 can only maintain one active Bluetooth connection at a time. Disconnecting from your phone allows the watch to enter BLE advertising mode.
3. **Pair in AstroBox-NG**:
   - Ensure Bluetooth is turned **ON** on your computer.
   - Open **AstroBox-NG**.
   - Click **Scan / Search for Devices**.
   - Select your **Redmi Watch 6** from the list of nearby BLE devices.
   - When prompted for **Auth Key / Token**, paste the 32-character hexadecimal key you extracted in Step 1.
   - Click **Connect**.
   - AstroBox-NG will complete the cryptographic handshake. The status bar will show **Connected**.

---

### Step 3: Sideloading the Release RPK

1. In AstroBox-NG, navigate to the **App Manager / Sideload** tab.
2. Click **Install App** / **Select RPK**.
3. Choose the release package:
   `com.muslim.prayertimes.release.1.0.0.rpk`
4. Click **Install / Sideload**.
5. Keep the watch within 1 meter of your PC. The BLE transfer progress will advance to 100%.
6. Once complete, AstroBox-NG will confirm successful installation (`Installation Finished`).
7. **Launch on your watch**:
   - Press the side button on your Redmi Watch 6 to open the application grid.
   - Look for the green **Prayer Times** icon (crescent moon and mosque).
   - Tap to launch!
8. Turn Bluetooth back **ON** on your smartphone to resume daily health synchronization with Mi Fitness.

---

## ⚙️ Settings & Customization

Inside the app, tap the **⚙ Settings** button at the bottom of the home screen to configure:

| Setting | Options / Description |
| :--- | :--- |
| **Location Mode** | **Sync Current GPS** (standalone GNSS lock) or **Use Saved GPS** (instant restore without satellites). |
| **City Presets** | 16 built-in global cities with optimized default conventions. |
| **Time Format** | **12-Hour** (`03:04 PM`) or **24-Hour** (`15:04`). |
| **Calculation Method** | Umm al-Qura (Makkah), MWL, Egyptian General Authority, Karachi, Dubai, ISNA. |
| **Asr Juristic Rule** | **Standard** (Shafi'i/Maliki/Hanbali) or **Hanafi**. |
| **Haptic Alerts** | Toggle vibration alert when prayer time enters. |

---

## ❓ Troubleshooting & FAQ

### 1. AstroBox-NG cannot find my Redmi Watch 6
- **Check Phone Bluetooth**: Make sure Bluetooth is completely turned **OFF** on your phone. If your watch is connected to Mi Fitness, it will not advertise to your computer.
- **Restart Watch Bluetooth**: On your watch, toggle Airplane Mode on and off, or restart the watch.

### 2. "Authentication Failed" or "Invalid Key" in AstroBox-NG
- Double-check that your `auth_key` contains exactly 32 hexadecimal characters (0-9, a-f) without spaces.
- If you recently reset your watch or re-paired it with Mi Fitness, Xiaomi Cloud generates a new `auth_key`. Run the token extractor again to obtain the updated key.

### 3. "GPS signal unavailable" error
- Smartwatch GNSS antennas require line-of-sight to satellites. When syncing GPS for the first time, step outdoors away from tall concrete structures for 15-30 seconds.
- Once locked, the coordinates are saved permanently in watch storage. You can switch to cities and return to your saved GPS coordinates anytime using **📍 Use Saved GPS** without needing an outdoor fix again.

### 4. Watch rebooted when opening Qibla
- Make sure you are running release **v1.0.0 (commit `3f8937c` or later)**. Older builds had unstable sensor calls which caused RTOS panics. The current version uses mathematical great-circle spherical calculations that are 100% crash-free.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this software for personal or commercial purposes.

---

<p align="center">
  <b>Developed for the Xiaomi Vela & HyperOS Open Community</b><br>
  <i>May this application benefit Muslims worldwide.</i>
</p>
