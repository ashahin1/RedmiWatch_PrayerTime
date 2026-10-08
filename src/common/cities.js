/**
 * Built-in City Presets for Offline Fallback
 */

export const CITIES = [
  {
    id: 'riyadh',
    name: 'Riyadh',
    nameAr: 'الرياض',
    country: 'Saudi Arabia',
    lat: 24.7136,
    lon: 46.6753,
    timezone: 3,
    method: 'UmmAlQura',
    asrRule: 'Standard'
  },
  {
    id: 'makkah',
    name: 'Makkah',
    nameAr: 'مكة المكرمة',
    country: 'Saudi Arabia',
    lat: 21.4225,
    lon: 39.8262,
    timezone: 3,
    method: 'UmmAlQura',
    asrRule: 'Standard'
  },
  {
    id: 'madinah',
    name: 'Madinah',
    nameAr: 'المدينة المنورة',
    country: 'Saudi Arabia',
    lat: 24.5247,
    lon: 39.5692,
    timezone: 3,
    method: 'UmmAlQura',
    asrRule: 'Standard'
  },
  {
    id: 'cairo',
    name: 'Cairo',
    nameAr: 'القاهرة',
    country: 'Egypt',
    lat: 30.0444,
    lon: 31.2357,
    timezone: 3, // DST handled dynamically
    method: 'Egypt',
    asrRule: 'Standard'
  },
  {
    id: 'dubai',
    name: 'Dubai',
    nameAr: 'دبي',
    country: 'UAE',
    lat: 25.2048,
    lon: 55.2708,
    timezone: 4,
    method: 'Dubai',
    asrRule: 'Standard'
  },
  {
    id: 'kuwait',
    name: 'Kuwait City',
    nameAr: 'الكويت',
    country: 'Kuwait',
    lat: 29.3759,
    lon: 47.9774,
    timezone: 3,
    method: 'Kuwait',
    asrRule: 'Standard'
  },
  {
    id: 'doha',
    name: 'Doha',
    nameAr: 'الدوحة',
    country: 'Qatar',
    lat: 25.2854,
    lon: 51.5310,
    timezone: 3,
    method: 'Qatar',
    asrRule: 'Standard'
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    nameAr: 'إسطنبول',
    country: 'Turkey',
    lat: 41.0082,
    lon: 28.9784,
    timezone: 3,
    method: 'MWL',
    asrRule: 'Standard'
  },
  {
    id: 'amman',
    name: 'Amman',
    nameAr: 'عمان',
    country: 'Jordan',
    lat: 31.9454,
    lon: 35.9284,
    timezone: 3,
    method: 'MWL',
    asrRule: 'Standard'
  },
  {
    id: 'casablanca',
    name: 'Casablanca',
    nameAr: 'الدار البيضاء',
    country: 'Morocco',
    lat: 33.5731,
    lon: -7.5898,
    timezone: 1,
    method: 'MWL',
    asrRule: 'Standard'
  },
  {
    id: 'london',
    name: 'London',
    nameAr: 'لندن',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    timezone: 1, // summer BST
    method: 'MWL',
    asrRule: 'Standard'
  },
  {
    id: 'karachi',
    name: 'Karachi',
    nameAr: 'كراتشي',
    country: 'Pakistan',
    lat: 24.8607,
    lon: 67.0011,
    timezone: 5,
    method: 'Karachi',
    asrRule: 'Hanafi'
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    nameAr: 'جاكرتا',
    country: 'Indonesia',
    lat: -6.2088,
    lon: 106.8456,
    timezone: 7,
    method: 'MWL',
    asrRule: 'Standard'
  },
  {
    id: 'kuala_lumpur',
    name: 'Kuala Lumpur',
    nameAr: 'كوالالمبور',
    country: 'Malaysia',
    lat: 3.1390,
    lon: 101.6869,
    timezone: 8,
    method: 'MWL',
    asrRule: 'Standard'
  }
];

export const DEFAULT_CITY = CITIES[0]; // Riyadh
