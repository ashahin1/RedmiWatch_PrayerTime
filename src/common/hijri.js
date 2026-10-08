/**
 * Algorithmic Hijri (Islamic Lunar) Calendar Conversion
 * Provides Hijri year, month, day, and Arabic/English month names.
 */

const ISLAMIC_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

const ISLAMIC_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

/**
 * Convert Gregorian date to Hijri date
 * @param {Date} date 
 * @param {number} [dayAdjustment=0] Manual offset (+/- days)
 */
export function getHijriDate(date = new Date(), dayAdjustment = 0) {
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();

  // Adjust date for manual calibration
  if (dayAdjustment !== 0) {
    const adjDate = new Date(date.getTime() + dayAdjustment * 86400000);
    y = adjDate.getFullYear();
    m = adjDate.getMonth();
    d = adjDate.getDate();
  }

  if (m < 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524;

  const epoch = 1948439.5;
  const l = jd - epoch + 10632;
  const n = Math.floor((l - 1) / 10631);
  const lPrime = l - 10631 * n + 354;
  const j = (Math.floor((10985 - lPrime) / 5316)) * (Math.floor((50 * lPrime) / 17719)) +
            (Math.floor(lPrime / 5670)) * (Math.floor((43 * lPrime) / 15238));
  const lDoublePrime = lPrime - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
                       (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  
  const hijriMonth = Math.floor((24 * lDoublePrime) / 709);
  const hijriDay = Math.floor(lDoublePrime - Math.floor((709 * hijriMonth) / 24));
  const hijriYear = Math.floor(30 * n + j - 30);

  const mIndex = Math.max(0, Math.min(11, hijriMonth - 1));

  return {
    year: hijriYear,
    month: hijriMonth,
    day: hijriDay,
    monthNameEn: ISLAMIC_MONTHS_EN[mIndex],
    monthNameAr: ISLAMIC_MONTHS_AR[mIndex],
    isRamadan: (hijriMonth === 9),
    formattedEn: `${hijriDay} ${ISLAMIC_MONTHS_EN[mIndex]} ${hijriYear} AH`,
    formattedAr: `${hijriDay} ${ISLAMIC_MONTHS_AR[mIndex]} ${hijriYear} هـ`
  };
}
