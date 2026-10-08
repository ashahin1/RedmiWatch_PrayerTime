/**
 * Great-Circle Spherical Trigonometry for Qibla Calculation
 * Kaaba Coordinates: 21.422487° N, 39.826206° E
 */

const KAABA_LAT = 21.422487;
const KAABA_LON = 39.826206;
const D2R = Math.PI / 180.0;
const R2D = 180.0 / Math.PI;

/**
 * Calculates Qibla direction from true North (degrees 0-360)
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {number} Bearing in degrees clockwise from True North (0-360)
 */
export function calculateQiblaDirection(latitude, longitude) {
  const phi1 = latitude * D2R;
  const phi2 = KAABA_LAT * D2R;
  const deltaLambda = (KAABA_LON - longitude) * D2R;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qibla = Math.atan2(y, x) * R2D;
  qibla = (qibla + 360.0) % 360.0;
  return Math.round(qibla * 10) / 10;
}

/**
 * Calculate distance to Kaaba in kilometers
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {number} Distance in km
 */
export function calculateDistanceToKaaba(latitude, longitude) {
  const R = 6371.0; // Earth radius in km
  const dLat = (KAABA_LAT - latitude) * D2R;
  const dLon = (KAABA_LON - longitude) * D2R;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(latitude * D2R) * Math.cos(KAABA_LAT * D2R) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Given device compass heading and true Qibla bearing,
 * calculate the needle rotation angle.
 * In Vela compass API:
 *   res.direction is the angle between device y-axis and magnetic north.
 *   Facing north = 0, south = pi, east = pi/2, west = -pi/2
 * @param {number} deviceDirectionInRadians Radian value from @system.sensor.subscribeCompass
 * @param {number} qiblaBearingInDegrees True Qibla bearing (0-360)
 * @returns {number} Needle rotation angle in degrees (-180 to 180)
 */
export function computeNeedleAngle(deviceDirectionInRadians, qiblaBearingInDegrees) {
  let headingDeg = deviceDirectionInRadians * R2D;
  if (headingDeg < 0) headingDeg += 360.0;

  let relativeAngle = qiblaBearingInDegrees - headingDeg;
  while (relativeAngle > 180) relativeAngle -= 360;
  while (relativeAngle < -180) relativeAngle += 360;

  return Math.round(relativeAngle);
}
