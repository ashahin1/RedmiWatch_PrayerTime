# Prayer Times for Xiaomi Redmi Watch 6 (HyperOS Vela RTOS)

A standalone, 100% offline-first Islamic Prayer Times QuickApp (`.rpk`) built specifically for the **Xiaomi Redmi Watch 6** (Model `M2523W1`, Bestechnic BES SoC, Apache NuttX RTOS) using the **Xiaomi Vela JS** wearable application framework.

---

## ✨ Features

- **100% Offline Astronomical Calculation:** Computes Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha locally without needing internet or phone connection.
- **AMOLED Battery-Efficient UI:** True black `#000000` background turns off pixels on the Redmi Watch 6's 2.07" AMOLED panel, saving power.
- **Hero Next-Prayer Card:** Displays upcoming prayer name, time, live ticking countdown (`HH:MM:SS`), and visual progress indicator.
- **Today's Timeline:** Full schedule for the day with a dynamic emerald highlight on the currently active prayer window.
- **Qibla Compass (`/pages/qibla`):** Dynamic compass needle rotating using the watch's built-in geomagnetic sensor (`@system.sensor.subscribeCompass`) to point directly to the Kaaba (`21.4225° N, 39.8262° E`), along with distance to Makkah in kilometers.
- **GPS & City Presets (`/pages/settings`):**
  - Instant one-tap GPS synchronization using `@system.geolocation`.
  - Built-in global offline city presets (Riyadh, Makkah, Madinah, Cairo, Dubai, Kuwait, Doha, Istanbul, London, Jakarta, etc.).
- **Multiple Calculation Conventions:**
  - Umm al-Qura (Makkah)
  - Muslim World League (MWL)
  - Egyptian General Authority of Survey
  - University of Islamic Sciences, Karachi
  - Dubai / UAE
  - Islamic Society of North America (ISNA)
- **Asr Juristic Methods:** Standard (Shafi'i, Maliki, Hanbali) and Hanafi shadow ratios.
- **Haptic Vibration Alerts:** Triggers `@system.vibrator.vibrate({ mode: 'long' })` when prayer time arrives.
- **Algorithmic Hijri Date:** Live Umm al-Qura approximate lunar calendar conversion.

---

## 📁 Project Structure

```
RedmiWatchPrayerTime/
├── src/
│   ├── manifest.json              # Permissions, screen dimensions, router entries
│   ├── app.ux                     # Global app lifecycle
│   ├── common/
│   │   ├── prayer-engine.js       # Pure JS astronomical calculation engine
│   │   ├── qibla.js               # Great-circle bearing & needle rotation math
│   │   ├── hijri.js               # Algorithmic Gregorian-to-Hijri converter
│   │   ├── cities.js              # Offline global city presets
│   │   └── storage.js             # Async storage wrapper (@system.storage)
│   └── pages/
│       ├── index/index.ux         # Main Dashboard & Hero Card
│       ├── qibla/qibla.ux         # Qibla Compass Screen
│       └── settings/settings.ux   # Calculation & Location Settings
├── test/
│   └── prayer-engine.test.js      # Automated verification test suite
├── dist/                          # Compiled .rpk installation packages
└── package.json                   # aiot-toolkit build scripts
```

---

## 🛠️ Verification & Building

### 1. Run Automated Calculation Tests
```bash
node test/prayer-engine.test.js
```
Verifies astronomical calculations against ground truth (Riyadh, Cairo, Karachi, London, Jakarta) and runs performance benchmarks (executes in ~5 microseconds per calculation).

### 2. Build Debug Package (.rpk)
```bash
npm run build
```
Generates `dist/com.muslim.prayertimes.debug.1.0.0.rpk`.

### 3. Build Production Release Package (.rpk)
```bash
npm run release
```
Generates signed `dist/com.muslim.prayertimes.release.1.0.0.rpk` (~30 KB).

---

## 📲 How to Preview & Install

### Option A: Preview in AIoT-IDE (Simulator)
1. Launch **AIoT IDE** (`aiot-ide` or open through Start Menu).
2. Open the folder: `c:\AntiGravity_Projects\RedmiWatchPrayerTime`.
3. Press `F5` or click **Run > Start Debugging** to launch the Vela Watch Simulator.
4. Select the **REDMI Watch 5 / 6 (432x514)** simulator screen preset to test layouts, countdowns, and sensor inputs.

### Option B: Install on Real Redmi Watch 6 (via AstroBox)
1. Download and run [AstroBox-NG](https://github.com/AstralSightStudios/AstroBox-NG).
2. Connect your **Redmi Watch 6** via Bluetooth using your Mi Fitness AuthKey.
3. In AstroBox, select **Install App / Sideload**, choose `dist/com.muslim.prayertimes.release.1.0.0.rpk`.
4. The app will transfer over Bluetooth and appear in the watch's application drawer!
