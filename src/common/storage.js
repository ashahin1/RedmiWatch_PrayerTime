/**
 * Storage and Settings Management Layer
 * Wraps @system.storage with async Promise API
 */

import storage from '@system.storage';
import { DEFAULT_CITY } from './cities.js';

const SETTINGS_KEY = 'prayer_app_settings';

export const DEFAULT_SETTINGS = {
  timeFormat: '12h', // '12h' (AM/PM) or '24h'
  locationMode: 'auto', // 'auto' (GPS) or 'preset'
  selectedCityId: 'riyadh',
  latitude: DEFAULT_CITY.lat,
  longitude: DEFAULT_CITY.lon,
  timezone: DEFAULT_CITY.timezone !== undefined ? DEFAULT_CITY.timezone : 3,
  cityName: DEFAULT_CITY.name,
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
        success: (data) => finish(data || defaultValue),
        fail: () => finish(defaultValue),
        complete: () => finish(defaultValue)
      });
      // Safety fallback in case native callback stalls
      setTimeout(() => finish(defaultValue), 300);
    } catch (e) {
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
      storage.set({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        success: () => finish(true),
        fail: () => finish(false),
        complete: () => finish(true)
      });
      setTimeout(() => finish(false), 300);
    } catch (e) {
      finish(false);
    }
  });
}

/**
 * Load user settings with fallback defaults
 * @returns {Promise<Object>}
 */
export async function loadSettings() {
  try {
    const raw = await getStorageItem(SETTINGS_KEY, '');
    if (!raw) return Object.assign({}, DEFAULT_SETTINGS);
    const parsed = JSON.parse(raw);
    return Object.assign({}, DEFAULT_SETTINGS, parsed);
  } catch (err) {
    console.error('Error loading settings:', err);
    return Object.assign({}, DEFAULT_SETTINGS);
  }
}

/**
 * Save user settings
 * @param {Object} settings 
 * @returns {Promise<boolean>}
 */
export async function saveSettings(settings) {
  try {
    return await setStorageItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
    return false;
  }
}
