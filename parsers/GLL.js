const { 
  parseTime,
  parseCoord,
  parseRMC_GLLStatus
} = require('../lib/utils');

module.exports = (gll, str) => {
  if (gll.length !== 9) {
    throw 'Invalid GLL length: ' + str;
  }

  /*
   ------------------------------------------------------------------------------
   1       2 3        4 5         6 7   8
   |       | |        | |         | |   |
   $--GLL,llll.ll,a,yyyyy.yy,a,hhmmss.ss,a,m,*hh<CR><LF>
   ------------------------------------------------------------------------------
   1. Latitude
   2. N or S (North or South)
   3. Longitude
   4. E or W (East or West)
   5. Universal Time Coordinated (UTC)
   6. Status A - Data Valid, V - Data Invalid
   7. FAA mode indicator (NMEA 2.3 and later)
   8. Checksum
   */

  return {
    'time': parseTime(gll[5]),
    'status': parseRMC_GLLStatus(gll[6]),
    'lat': parseCoord(gll[1], gll[2]),
    'lon': parseCoord(gll[3], gll[4])
  };
};