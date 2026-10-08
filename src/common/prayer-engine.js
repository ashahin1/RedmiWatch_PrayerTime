/**
 * Standalone Offline Astronomical Prayer Times Calculation Engine
 * Optimized for Embedded Wearables (Xiaomi Vela RTOS)
 * Zero external dependencies, pure ECMAScript 6
 */

const D2R = Math.PI / 180.0;
const R2D = 180.0 / Math.PI;

function dsin(d) { return Math.sin(d * D2R); }
function dcos(d) { return Math.cos(d * D2R); }
function dtan(d) { return Math.tan(d * D2R); }
function dasin(x) { return Math.asin(x) * R2D; }
function dacos(x) { return Math.acos(x) * R2D; }
function datan(x) { return Math.atan(x) * R2D; }
function datan2(y, x) { return Math.atan2(y, x) * R2D; }
function darccot(x) { return Math.atan(1.0 / x) * R2D; }

function fixAngle(a) {
  a = a - 360.0 * Math.floor(a / 360.0);
  return a < 0 ? a + 360.0 : a;
}

function fixHour(h) {
  h = h - 24.0 * Math.floor(h / 24.0);
  return h < 0 ? h + 24.0 : h;
}

// Calculation Methods Configuration
export const METHODS = {
  UmmAlQura: {
    name: 'Umm al-Qura (Makkah)',
    fajrAngle: 18.5,
    ishaAngle: null,
    ishaInterval: 90, // 90 min after Maghrib (120 min during Ramadan)
    maghribAngle: 0.8333,
    maghribInterval: null
  },
  MWL: {
    name: 'Muslim World League',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
    ishaInterval: null,
    maghribAngle: 0.8333,
    maghribInterval: null
  },
  Egypt: {
    name: 'Egyptian General Authority',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    ishaInterval: null,
    maghribAngle: 0.8333,
    maghribInterval: null
  },
  ISNA: {
    name: 'Islamic Society of North America',
    fajrAngle: 15.0,
    ishaAngle: 15.0,
    ishaInterval: null,
    maghribAngle: 0.8333,
    maghribInterval: null
  },
  Karachi: {
    name: 'Univ. of Islamic Sciences, Karachi',
    fajrAngle: 18.0,
    ishaAngle: 18.0,
    ishaInterval: null,
    maghribAngle: 0.8333,
    maghribInterval: null
  },
  Dubai: {
    name: 'Dubai / UAE',
    fajrAngle: 18.2,
    ishaAngle: 18.2,
    ishaInterval: null,
    maghribAngle: 0.8333,
    maghribInterval: null
  },
  Kuwait: {
    name: 'Kuwait',
    fajrAngle: 18.0,
    ishaAngle: 17.5,
    ishaInterval: null,
    maghribAngle: 0.8333,
    maghribInterval: null
  },
  Qatar: {
    name: 'Qatar',
    fajrAngle: 18.0,
    ishaAngle: null,
    ishaInterval: 90,
    maghribAngle: 0.8333,
    maghribInterval: null
  },
  Tehran: {
    name: 'Institute of Geophysics, Tehran',
    fajrAngle: 17.7,
    ishaAngle: 14.0,
    ishaInterval: null,
    maghribAngle: 4.5,
    maghribInterval: null
  }
};

export const ASR_RULES = {
  Standard: { name: 'Standard (Shafi\'i, Maliki, Hanbali)', shadowFactor: 1 },
  Hanafi: { name: 'Hanafi', shadowFactor: 2 }
};

export class PrayerEngine {
  constructor(options = {}) {
    this.method = options.method || 'UmmAlQura';
    this.asrRule = options.asrRule || 'Standard';
    this.highLatitudeRule = options.highLatitudeRule || 'AngleBased'; // 'NightMiddle', 'OneSeventh', 'AngleBased'
    this.timeFormat = options.timeFormat || '24h'; // '12h' (AM/PM) or '24h'
    this.offsets = Object.assign({
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0
    }, options.offsets || {});
  }

  julianDate(year, month, day) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  }

  sunPosition(jd) {
    const D = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * D);
    const q = fixAngle(280.459 + 0.98564736 * D);
    const L = fixAngle(q + 1.915 * dsin(g) + 0.020 * dsin(2 * g));
    const e = 23.439 - 0.00000036 * D;

    const d = dasin(dsin(e) * dsin(L));
    let ra = datan2(dcos(e) * dsin(L), dcos(L)) / 15.0;
    ra = fixHour(ra);
    const EqT = q / 15.0 - ra;

    return { declination: d, equationOfTime: EqT };
  }

  computeSolarNoon(jd, lon, tz) {
    const sun = this.sunPosition(jd);
    return fixHour(12.0 + tz - (lon / 15.0) - sun.equationOfTime);
  }

  computeHourAngle(lat, declination, angle) {
    const cosH = (dsin(angle) - dsin(lat) * dsin(declination)) / (dcos(lat) * dcos(declination));
    if (cosH > 1.0) return -1; // Sun never reaches angle (polar night)
    if (cosH < -1.0) return 1; // Sun always above angle (midnight sun)
    return dacos(cosH) / 15.0;
  }

  computeAsrTime(lat, declination, noon, shadowFactor) {
    const d = Math.abs(lat - declination);
    const angle = darccot(shadowFactor + dtan(d));
    const H = this.computeHourAngle(lat, declination, angle);
    if (H <= 0 || H > 12) return noon + 3.0; // fallback approximation
    return noon + H;
  }

  adjustHighLatitude(time, baseTime, angle, nightPortion, direction) {
    // direction: -1 for Fajr, +1 for Isha
    const maxPortion = (nightPortion / 60.0) * angle;
    const diff = direction < 0 ? (baseTime - time) : (time - baseTime);
    if (isNaN(time) || diff > maxPortion) {
      return baseTime + (direction * maxPortion);
    }
    return time;
  }

  /**
   * Calculate prayer times for a specific date and coordinates
   * @param {Date} date 
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} [timezoneOffset] In hours (e.g. +3 for Riyadh). If omitted, determined from date.
   * @param {boolean} [isRamadan] Optional Ramadan flag for Umm Al-Qura 120min Isha
   */
  calculate(date, latitude, longitude, timezoneOffset, isRamadan = false) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const tz = (typeof timezoneOffset === 'number') ? timezoneOffset : -date.getTimezoneOffset() / 60.0;

    const jd = this.julianDate(year, month, day);
    const sun = this.sunPosition(jd);
    const noon = this.computeSolarNoon(jd, longitude, tz);

    const methodConfig = METHODS[this.method] || METHODS.UmmAlQura;
    const asrConfig = ASR_RULES[this.asrRule] || ASR_RULES.Standard;

    // Sunrise & Sunset (horizon refraction angle = -0.8333 deg)
    const sunRiseSetH = this.computeHourAngle(latitude, sun.declination, -0.8333);
    const sunrise = noon - sunRiseSetH;
    const sunset = noon + sunRiseSetH;

    // Fajr
    let fajrH = this.computeHourAngle(latitude, sun.declination, -methodConfig.fajrAngle);
    let fajr = (fajrH > 0 && fajrH < 12) ? noon - fajrH : NaN;

    // Asr
    let asr = this.computeAsrTime(latitude, sun.declination, noon, asrConfig.shadowFactor);

    // Maghrib
    let maghrib = sunset;
    if (methodConfig.maghribAngle && methodConfig.maghribAngle !== 0.8333) {
      const maghribH = this.computeHourAngle(latitude, sun.declination, -methodConfig.maghribAngle);
      maghrib = noon + maghribH;
    } else if (methodConfig.maghribInterval) {
      maghrib = sunset + (methodConfig.maghribInterval / 60.0);
    }

    // Isha
    let isha;
    if (methodConfig.ishaInterval) {
      const interval = (this.method === 'UmmAlQura' && isRamadan) ? 120 : methodConfig.ishaInterval;
      isha = maghrib + (interval / 60.0);
    } else {
      let ishaH = this.computeHourAngle(latitude, sun.declination, -methodConfig.ishaAngle);
      isha = (ishaH > 0 && ishaH < 12) ? noon + ishaH : NaN;
    }

    // High Latitude Adjustments
    const night = fixHour(24.0 - sunset + sunrise);
    let portion = 0.5; // NightMiddle
    if (this.highLatitudeRule === 'OneSeventh') portion = 1.0 / 7.0;
    else if (this.highLatitudeRule === 'AngleBased') portion = 1.0 / 60.0;

    if (isNaN(fajr) || Math.abs(noon - fajr) > night) {
      fajr = sunrise - (night * portion * (methodConfig.fajrAngle / 15.0));
    }
    if (isNaN(isha) || Math.abs(isha - noon) > night) {
      const angle = methodConfig.ishaAngle || 18.0;
      isha = sunset + (night * portion * (angle / 15.0));
    }

    // Apply manual minute offsets
    const toDateObj = (hoursDec, offsetMin) => {
      const totalMin = Math.round(hoursDec * 60.0) + offsetMin;
      const h = Math.floor(totalMin / 60.0);
      const m = totalMin % 60;
      const pad = (n) => (n < 10 ? '0' : '') + n;
      const timeStr = `${pad(h)}:${pad(m)}`;
      const d = new Date(year, month - 1, day, h, m, 0);

      return {
        hours: h,
        minutes: m,
        timeStr,
        date: d,
        timestamp: d.getTime()
      };
    };

    return {
      fajr: toDateObj(fajr, this.offsets.fajr),
      sunrise: toDateObj(sunrise, this.offsets.sunrise),
      dhuhr: toDateObj(noon, this.offsets.dhuhr),
      asr: toDateObj(asr, this.offsets.asr),
      maghrib: toDateObj(maghrib, this.offsets.maghrib),
      isha: toDateObj(isha, this.offsets.isha),
      timezone: tz
    };
  }

  /**
   * Determine the current and next prayer based on current time
   * @param {Object} schedule Output of calculate()
   * @param {Date} now Current time
   */
  getNextPrayer(schedule, now = new Date()) {
    const nowMs = now.getTime();
    const prayerList = [
      { key: 'fajr', name: 'Fajr', time: schedule.fajr },
      { key: 'sunrise', name: 'Sunrise', time: schedule.sunrise },
      { key: 'dhuhr', name: 'Dhuhr', time: schedule.dhuhr },
      { key: 'asr', name: 'Asr', time: schedule.asr },
      { key: 'maghrib', name: 'Maghrib', time: schedule.maghrib },
      { key: 'isha', name: 'Isha', time: schedule.isha }
    ];

    let currentPrayer = null;
    let nextPrayer = null;
    let prevPrayer = null;

    for (let i = 0; i < prayerList.length; i++) {
      if (nowMs >= prayerList[i].time.timestamp) {
        currentPrayer = prayerList[i];
      }
    }

    if (!currentPrayer) {
      // It's before Fajr -> current is yesterday's Isha, next is today's Fajr
      currentPrayer = prayerList[prayerList.length - 1]; // Isha
      nextPrayer = prayerList[0]; // Fajr
      prevPrayer = prayerList[prayerList.length - 1];
    } else {
      const currIdx = prayerList.findIndex(p => p.key === currentPrayer.key);
      if (currIdx === prayerList.length - 1) {
        // Current is Isha -> next is tomorrow's Fajr
        nextPrayer = Object.assign({}, prayerList[0], {
          time: {
            ...prayerList[0].time,
            timestamp: prayerList[0].time.timestamp + 86400000
          }
        });
        prevPrayer = currentPrayer;
      } else {
        nextPrayer = prayerList[currIdx + 1];
        prevPrayer = currentPrayer;
      }
    }

    const diffMs = Math.max(0, nextPrayer.time.timestamp - nowMs);
    const totalDiffSec = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalDiffSec / 3600);
    const minutes = Math.floor((totalDiffSec % 3600) / 60);
    const seconds = totalDiffSec % 60;

    const pad = (n) => (n < 10 ? '0' : '') + n;
    const countdownStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    // Progress percentage
    const windowStart = prevPrayer.time.timestamp;
    const windowEnd = nextPrayer.time.timestamp;
    const elapsed = Math.max(0, nowMs - windowStart);
    const total = Math.max(1, windowEnd - windowStart);
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

    return {
      currentPrayer,
      nextPrayer,
      totalDiffSec,
      countdownStr,
      progressPercent
    };
  }
}
