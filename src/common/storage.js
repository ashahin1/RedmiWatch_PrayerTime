/**
 * Storage and Settings Management Layer
 * Wraps @system.storage with async Promise API
 */

import storage from '@system.storage';
import { DEFAULT_CITY } from './cities.js';

const SETTINGS_KEY = 'prayer_app_settings';

export const DEFAULT_SETTINGS = {
  timeFormat: '12h', // '12h' (AM/PM) or '24h'
  locationMode: 'preset', // 'preset' or 'gps'
  selectedCityId: 'riyadh',
  latitude: DEFAULT_CITY.lat,
  longitude: DEFAULT_CITY.lon,
  timezone: DEFAULT_CITY.timezone !== undefined ? DEFAULT_CITY.timezone : 3,
  cityName: DEFAULT_CITY.name,
  savedGpsLat: null,
  savedGpsLon: null,
  savedGpsTimezone: null,
  hasSavedGps: false,
  method: DEFAULT_CITY.method, // 'UmmAlQura'
  asrRule: DEFAULT_CITY.asrRule, // 'Standard'
  highLatitudeRule: 'AngleBased',
  hijriAdjustment: 0,
  vibrateOnAdhan: true,
  offsets: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  }
};

let cachedSettings = null;
let activeLoadPromise = null;

/**
 * Get in-memory cached settings synchronously if available
 * @returns {Object|null}
 */
export function getCachedSettings() {
  return cachedSettings;
}

/**
 * Get item from storage
 * @param {string} key 
 * @param {string} defaultValue 
 * @returns {Promise<string>}
 */
export function getStorageItem(key, defaultValue = '') {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (val) => {
      if (!resolved) {
        resolved = true;
        resolve(val);
      }
    };
    try {
      storage.get({
        key,
        default: defaultValue,
        success: (data) => {
          finish(data !== undefined && data !== null && data !== '' ? data : defaultValue);
        },
        fail: (data, code) => {
          console.log('[Storage] get fail for key:', key, code);
          finish(defaultValue);
        }
      });
      // Safety timeout in case native bridge hangs
      setTimeout(() => finish(defaultValue), 1500);
    } catch (e) {
      console.log('[Storage] get exception:', e);
      finish(defaultValue);
    }
  });
}

/**
 * Set item in storage
 * @param {string} key 
 * @param {string} value 
 * @returns {Promise<boolean>}
 */
export function setStorageItem(key, value) {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (val) => {
      if (!resolved) {
        resolved = true;
        resolve(val);
      }
    };
    try {
      const strVal = typeof value === 'string' ? value : JSON.stringify(value);
      storage.set({
        key,
        value: strVal,
        success: () => finish(true),
        fail: (data, code) => {
          console.log('[Storage] set fail for key:', key, code);
          finish(false);
        }
      });
      setTimeout(() => finish(false), 1500);
    } catch (e) {
      console.log('[Storage] set exception:', e);
      finish(false);
    }
  });
}

/**
 * Load user settings with fallback defaults and single-flight deduplication
 * @returns {Promise<Object>}
 */
export async function loadSettings() {
  if (activeLoadPromise) {
    return activeLoadPromise;
  }

  activeLoadPromise = (async () => {
    try {
      const raw = await getStorageItem(SETTINGS_KEY, '');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          cachedSettings = Object.assign({}, DEFAULT_SETTINGS, parsed);
          return cachedSettings;
        }
      }
      // If disk read returned empty, but we already have valid settings in memory: preserve them!
      if (cachedSettings && cachedSettings.cityName) {
        return cachedSettings;
      }
      cachedSettings = Object.assign({}, DEFAULT_SETTINGS);
      return cachedSettings;
    } catch (err) {
      console.error('[Storage] Error loading settings:', err);
      if (cachedSettings && cachedSettings.cityName) {
        return cachedSettings;
      }
      return Object.assign({}, DEFAULT_SETTINGS);
    } finally {
      activeLoadPromise = null;
    }
  })();

  return activeLoadPromise;
}

/**
 * Save user settings
 * @param {Object} settings 
 * @returns {Promise<boolean>}
 */
export async function saveSettings(settings) {
  try {
    cachedSettings = Object.assign({}, settings);
    return await setStorageItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('[Storage] Error saving settings:', err);
    return false;
  }
}
