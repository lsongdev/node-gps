const { 
  parseFAA,
  parseTime, 
  parseCoord, 
  parseKnots, 
  parseNumber,
  parseRMC_GLLStatus
} = require('../lib/utils');

module.exports = (rmc, str) => {
  if (rmc.length !== 13 && rmc.length !== 14) {
    throw 'Invalid RMC length: ' + str;
  }
  /*
    $GPRMC,hhmmss.ss,A,llll.ll,a,yyyyy.yy,a,x.x,x.x,ddmmyy,x.x,a*hh
    RMC  = Recommended Minimum Specific GPS/TRANSIT Data
    1    = UTC of position fix
    2    = Data status (A-ok, V-invalid)
    3    = Latitude of fix
    4    = N or S
    5    = Longitude of fix
    6    = E or W
    7    = Speed over ground in knots
    8    = Track made good in degrees True
    9    = UT date
    10   = Magnetic variation degrees (Easterly var. subtracts from true course)
    11   = E or W
    (12) = NMEA 2.3 introduced FAA mode indicator (A=Autonomous, D=Differential, E=Estimated, N=Data not valid)
    12   = Checksum
  */
  return {
    'time': parseTime(rmc[1], rmc[9]),
    'status': parseRMC_GLLStatus(rmc[2]),
    'lat': parseCoord(rmc[3], rmc[4]),
    'lon': parseCoord(rmc[5], rmc[6]),
    'speed': parseKnots(rmc[7]),
    'track': parseNumber(rmc[8]),
    'variation': parseRMCVariation(rmc[10], rmc[11]),
    'faa': rmc.length === 14 ? parseFAA(rmc[12]) : null
  };
};

function parseRMCVariation(vari, dir) {
  if (vari === '' || dir === '') return null;
  var q = (dir === 'W') ? -1.0 : 1.0;
  return parseFloat(vari) * q;
}