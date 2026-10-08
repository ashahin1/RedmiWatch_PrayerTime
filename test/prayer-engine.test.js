import { PrayerEngine, METHODS, ASR_RULES } from '../src/common/prayer-engine.js';
import { calculateQiblaDirection, calculateDistanceToKaaba, computeNeedleAngle } from '../src/common/qibla.js';
import { getHijriDate } from '../src/common/hijri.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('=== TEST SUITE: Prayer Calculation Engine ===\n');

// 1. Test Riyadh Prayer Times (Umm al-Qura)
console.log('Test 1: Riyadh (Umm al-Qura Convention)');
const testDate = new Date(2026, 9, 6); // Oct 6, 2026
const engineUmmAlQura = new PrayerEngine({ method: 'UmmAlQura', asrRule: 'Standard' });
const riyadhTimes = engineUmmAlQura.calculate(testDate, 24.7136, 46.6753, 3);

console.log(`  Fajr:    ${riyadhTimes.fajr.timeStr}`);
console.log(`  Sunrise: ${riyadhTimes.sunrise.timeStr}`);
console.log(`  Dhuhr:   ${riyadhTimes.dhuhr.timeStr}`);
console.log(`  Asr:     ${riyadhTimes.asr.timeStr}`);
console.log(`  Maghrib: ${riyadhTimes.maghrib.timeStr}`);
console.log(`  Isha:    ${riyadhTimes.isha.timeStr}`);

// Check plausibility for Riyadh in early October:
// Fajr ~04:20-04:35, Sunrise ~05:40-05:55, Dhuhr ~11:40-11:50, Asr ~15:00-15:15, Maghrib ~17:35-17:45, Isha exactly 90 min after Maghrib
assert(riyadhTimes.fajr.hours === 4 && riyadhTimes.fajr.minutes >= 20 && riyadhTimes.fajr.minutes <= 40, 'Riyadh Fajr is between 04:20 and 04:40');
assert(riyadhTimes.dhuhr.hours === 11 && riyadhTimes.dhuhr.minutes >= 35 && riyadhTimes.dhuhr.minutes <= 55, 'Riyadh Dhuhr is between 11:35 and 11:55');
assert(riyadhTimes.maghrib.hours === 17 && riyadhTimes.maghrib.minutes >= 30 && riyadhTimes.maghrib.minutes <= 50, 'Riyadh Maghrib is between 17:30 and 17:50');

const ishaDiffMin = (riyadhTimes.isha.hours * 60 + riyadhTimes.isha.minutes) - 
                    (riyadhTimes.maghrib.hours * 60 + riyadhTimes.maghrib.minutes);
assert(ishaDiffMin === 90, 'Umm al-Qura Isha is exactly 90 minutes after Maghrib');

// 2. Test Asr Juristic Rule (Standard vs. Hanafi)
console.log('\nTest 2: Asr Juristic Differences (Standard vs Hanafi)');
const engineHanafi = new PrayerEngine({ method: 'Karachi', asrRule: 'Hanafi' });
const karachiHanafi = engineHanafi.calculate(testDate, 24.8607, 67.0011, 5);
const engineShafii = new PrayerEngine({ method: 'Karachi', asrRule: 'Standard' });
const karachiShafii = engineShafii.calculate(testDate, 24.8607, 67.0011, 5);

const shafiiAsrMin = karachiShafii.asr.hours * 60 + karachiShafii.asr.minutes;
const hanafiAsrMin = karachiHanafi.asr.hours * 60 + karachiHanafi.asr.minutes;
console.log(`  Shafi'i Asr: ${karachiShafii.asr.timeStr}`);
console.log(`  Hanafi Asr:  ${karachiHanafi.asr.timeStr}`);
assert(hanafiAsrMin > shafiiAsrMin, 'Hanafi Asr is later than Shafi\'i Asr');
assert(hanafiAsrMin - shafiiAsrMin >= 40 && hanafiAsrMin - shafiiAsrMin <= 75, 'Hanafi Asr is ~45-70 min after Standard Asr');

// 3. Test Cairo (Egyptian General Authority)
console.log('\nTest 3: Cairo (Egyptian Authority)');
const engineEgypt = new PrayerEngine({ method: 'Egypt', asrRule: 'Standard' });
const cairoTimes = engineEgypt.calculate(testDate, 30.0444, 31.2357, 3);
console.log(`  Fajr: ${cairoTimes.fajr.timeStr}, Dhuhr: ${cairoTimes.dhuhr.timeStr}, Maghrib: ${cairoTimes.maghrib.timeStr}`);
assert(cairoTimes.fajr.hours === 4 || cairoTimes.fajr.hours === 5, 'Cairo Fajr is valid');
assert(cairoTimes.maghrib.hours === 17 || cairoTimes.maghrib.hours === 18, 'Cairo Maghrib is valid');

// 4. Test Next Prayer & Countdown
console.log('\nTest 4: Next Prayer Determination');
const mockNow = new Date(Date.UTC(2026, 9, 6, 12, 0, 0) - (3 * 3600 * 1000)); // 12:00:00 Riyadh time (After Dhuhr, before Asr)
const nextInfo = engineUmmAlQura.getNextPrayer(riyadhTimes, mockNow);
console.log(`  Mock Time: 12:00:00`);
console.log(`  Current Prayer: ${nextInfo.currentPrayer.name}`);
console.log(`  Next Prayer:    ${nextInfo.nextPrayer.name} at ${nextInfo.nextPrayer.time.timeStr}`);
console.log(`  Countdown:      ${nextInfo.countdownStr}`);
console.log(`  Progress:       ${nextInfo.progressPercent}%`);

assert(nextInfo.currentPrayer.key === 'dhuhr', 'Current prayer at 12:00 is Dhuhr');
assert(nextInfo.nextPrayer.key === 'asr', 'Next prayer after 12:00 is Asr');
assert(nextInfo.totalDiffSec > 0, 'Countdown seconds is positive');
assert(nextInfo.progressPercent >= 0 && nextInfo.progressPercent <= 100, 'Progress percentage is valid');

// 5. Test Qibla Bearings
console.log('\nTest 5: Qibla Direction to Kaaba');
const riyadhQibla = calculateQiblaDirection(24.7136, 46.6753);
const cairoQibla = calculateQiblaDirection(30.0444, 31.2357);
const londonQibla = calculateQiblaDirection(51.5074, -0.1278);
const jakartaQibla = calculateQiblaDirection(-6.2088, 106.8456);

console.log(`  Riyadh to Kaaba:  ${riyadhQibla}° (expected ~245°-250° SW)`);
console.log(`  Cairo to Kaaba:   ${cairoQibla}° (expected ~135°-140° SE)`);
console.log(`  London to Kaaba:  ${londonQibla}° (expected ~118°-120° SE)`);
console.log(`  Jakarta to Kaaba: ${jakartaQibla}° (expected ~294°-296° NW)`);

assert(riyadhQibla >= 240 && riyadhQibla <= 255, 'Riyadh Qibla bearing is accurate');
assert(cairoQibla >= 130 && cairoQibla <= 145, 'Cairo Qibla bearing is accurate');
assert(londonQibla >= 115 && londonQibla <= 125, 'London Qibla bearing is accurate');
assert(jakartaQibla >= 290 && jakartaQibla <= 300, 'Jakarta Qibla bearing is accurate');

const riyadhDist = calculateDistanceToKaaba(24.7136, 46.6753);
console.log(`  Riyadh to Kaaba Distance: ${riyadhDist} km (expected ~790-870 km)`);
assert(riyadhDist >= 750 && riyadhDist <= 900, 'Distance calculation is accurate');

// 6. Test Hijri Date
console.log('\nTest 6: Hijri Date Converter');
const hijri = getHijriDate(new Date(2026, 9, 6)); // Oct 6, 2026
console.log(`  Gregorian: 2026-10-06`);
console.log(`  Hijri:     ${hijri.formattedEn} (${hijri.formattedAr})`);
assert(hijri.year >= 1447 && hijri.year <= 1449, 'Hijri year is plausible (~1448 AH)');
assert(hijri.day >= 1 && hijri.day <= 30, 'Hijri day is in 1..30');

// 7. Performance Benchmark
console.log('\nTest 7: Performance Benchmark (Calculation Speed on MCU scale)');
const iterations = 5000;
const start = Date.now();
for (let i = 0; i < iterations; i++) {
  engineUmmAlQura.calculate(testDate, 24.7136, 46.6753, 3);
}
const elapsedMs = Date.now() - start;
const avgUs = (elapsedMs / iterations) * 1000;
console.log(`  ${iterations} full calculations took ${elapsedMs} ms (Avg: ${avgUs.toFixed(2)} microseconds per calculation)`);
assert(avgUs < 100, 'Calculation executes in under 100 microseconds per call');

console.log(`\n=== RESULTS: ${passedTests} / ${totalTests} TESTS PASSED ===`);
if (passedTests === totalTests) {
  console.log('ALL VERIFICATIONS SUCCESSFUL!\n');
} else {
  process.exit(1);
}
