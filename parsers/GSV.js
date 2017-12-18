const { parseNumber } = require('../lib/utils');
/*
  $GPGSV,1,1,13,02,02,213,,03,-3,000,,11,00,121,,14,13,172,05*67
  1    = Total number of messages of this type in this cycle
  2    = Message number
  3    = Total number of SVs in view
  4    = SV PRN number
  5    = Elevation in degrees, 90 maximum
  6    = Azimuth, degrees from true north, 000 to 359
  7    = SNR (signal to noise ratio), 00-99 dB (null when not tracking, higher is better)
  8-11 = Information about second SV, same as field 4-7
  12-15= Information about third SV, same as field 4-7
  16-19= Information about fourth SV, same as field 4-7
  8/12/16/20   = Checksum
*/
module.exports = (gsv, str) => {
  if (gsv.length < 9 || gsv.length % 4 !== 1) {
    throw 'Invalid GSV length: ' + str;
  }
  var sats = [];
  for (var i = 4; i < gsv.length - 1; i += 4) {
    var prn = parseNumber(gsv[i]);
    var snr = parseNumber(gsv[i + 3]);
    sats.push({
      'prn': prn,
      'elevation': parseNumber(gsv[i + 1]),
      'azimuth': parseNumber(gsv[i + 2]),
      'snr': snr,
      'status': prn !== null ? (snr !== null ? 'tracking' : 'in view') : null
    });
  }
  return {
    'msgNumber': parseNumber(gsv[2]),
    'msgsTotal': parseNumber(gsv[1]),
    'satsInView'  : parseNumber(gsv[3]), // Can be obtained by satellites.length
    'satellites': sats
  };
};