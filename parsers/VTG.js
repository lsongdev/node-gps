module.exports = (vtg, str) => {
  if (vtg.length !== 10 && vtg.length !== 11) {
    throw 'Invalid VTG length: ' + str;
  }
  /*
   ------------------------------------------------------------------------------
   1  2  3  4  5  6  7  8 9   10
   |  |  |  |  |  |  |  | |   |
   $--VTG,x.x,T,x.x,M,x.x,N,x.x,K,m,*hh<CR><LF>
   ------------------------------------------------------------------------------
   1    = Track degrees
   2    = Fixed text 'T' indicates that track made good is relative to true north
   3    = not used
   4    = not used
   5    = Speed over ground in knots
   6    = Fixed text 'N' indicates that speed over ground in in knots
   7    = Speed over ground in kilometers/hour
   8    = Fixed text 'K' indicates that speed over ground is in kilometers/hour
   (9)   = FAA mode indicator (NMEA 2.3 and later)
   9/10 = Checksum
   */
  if (vtg[2] === '' && vtg[8] === '' && vtg[6] === '') {
    return {
      'track': null,
      'speed': null,
      'faa': null
    };
  }

  if (vtg[2] !== 'T') {
    throw 'Invalid VTG track mode: ' + str;
  }

  if (vtg[8] !== 'K' || vtg[6] !== 'N') {
    throw 'Invalid VTG speed tag: ' + str;
  }

  return {
    'track': parseNumber(vtg[1]),
    'speed': parseKnots(vtg[5]),
    'faa': vtg.length === 11 ? parseFAA(vtg[9]) : null
  };
};