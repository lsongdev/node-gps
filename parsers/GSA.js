const { parseNumber } = require('../lib/utils');
/*
$GPGSA,A,3,04,05,,09,12,,,24,,,,,2.5,1.3,2.1*39

Where:
  GSA      Satellite status
  A        Auto selection of 2D or 3D fix (M = manual) 
  3        3D fix - values include: 1 = no fix
                                    2 = 2D fix
                                    3 = 3D fix
  04,05... PRNs of satellites used for fix (space for 12) 
  2.5      PDOP (dilution of precision) 
  1.3      Horizontal dilution of precision (HDOP) 
  2.1      Vertical dilution of precision (VDOP)
  *39      the checksum data, always begins with *
*/
module.exports = (gsa, line) => {
  var sats = [];
  for (var i = 3; i < 12 + 3; i++) {
    if (gsa[i] !== '') {
      sats.push(parseInt(gsa[i], 10));
    }
  }
  return {
    'mode': parseGSAMode(gsa[1]),
    'fix': parseGSAFix(gsa[2]),
    'satellites': sats,
    'pdop': parseNumber(gsa[15]),
    'hdop': parseNumber(gsa[16]),
    'vdop': parseNumber(gsa[17])
  };
};

function parseGSAMode(mode) {
  switch (mode) {
    case 'M':
      return 'manual';
    case 'A':
      return 'automatic';
    case '':
      return null;
  }
  throw 'INVALID GSA MODE: ' + mode;
}

function parseGSAFix(fix) {

  switch (fix) {
    case '1':
    case '':
      return null;
    case '2':
      return '2D';
    case '3':
      return '3D';
  }
  throw 'INVALID GSA FIX: ' + fix;
}
