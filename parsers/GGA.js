const { 
  parseDist,
  parseTime, 
  parseCoord,
  parseNumber
} = require('../lib/utils');
/*
  11
  1         2       3 4        5 6 7  8   9  10 |  12 13  14  15
  |         |       | |        | | |  |   |   | |   | |   |   |
  $--GGA,hhmmss.ss,llll.ll,a,yyyyy.yy,a,x,xx,x.x,x.x,M,x.x,M,x.x,xxxx*hh
  1) Time (UTC)
  2) Latitude
  3) N or S (North or South)
  4) Longitude
  5) E or W (East or West)
  6) GPS Quality Indicator,
  0 = Invalid, 1 = Valid SPS, 2 = Valid DGPS, 3 = Valid PPS
  7) Number of satellites in view, 00 - 12
  8) Horizontal Dilution of precision, lower is better
  9) Antenna Altitude above/below mean-sea-level (geoid)
  10) Units of antenna altitude, meters
  11) Geoidal separation, the difference between the WGS-84 earth
  ellipsoid and mean-sea-level (geoid), '-' means mean-sea-level below ellipsoid
  12) Units of geoidal separation, meters
  13) Age of differential GPS data, time in seconds since last SC104
  type 1 or 9 update, null field when DGPS is not used
  14) Differential reference station ID, 0000-1023
  15) Checksum
*/
module.exports = (gga, line) => {
  if (gga.length !== 16) {
    throw 'Invalid GGA length';
  }
  return {
    'time': parseTime(gga[1]),
    'lat': parseCoord(gga[2], gga[3]),
    'lon': parseCoord(gga[4], gga[5]),
    'alt': parseDist(gga[9], gga[10]),
    'quality': parseGGAFix(gga[6]),
    'satelites': parseNumber(gga[7]),
    'hdop': parseNumber(gga[8]), // dilution
    'geoidal': parseDist(gga[11], gga[12]), // aboveGeoid
    'age': parseNumber(gga[13]), // dgpsUpdate???
    'stationID': parseNumber(gga[14]) // dgpsReference??
  };
};

function parseGGAFix(fix) {
  switch (fix) {
    case '':
    case '0':
      return null;
    case '1':
      return 'fix'; // valid SPS fix
    case '2':
      return 'dgps-fix'; // valid DGPS fix
    case '3':
      return 'pps-fix'; // valid PPS fix
    case '4':
      return 'rtk'; // valid RTK fix
    case '5':
      return 'rtk-float'; // valid RTK float
    case '6':
      return 'estimated';
    case '7':
      return 'manual';
    case '8':
      return 'simulated';
  }
  throw 'INVALID GGA FIX: ' + fix;
}