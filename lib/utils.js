
function parseTime(time, date) {

  if (time === '') {
    return null;
  }

  var ret = new Date;

  if (date) {

    var year = date.slice(4);
    var month = date.slice(2, 4) - 1;
    var day = date.slice(0, 2);

    if (year.length === 4) {
      ret.setUTCFullYear(year, month, day);
    } else {
      // If we need to parse older GPRMC data, we should hack something like
      // year < 73 ? 2000+year : 1900+year
      ret.setUTCFullYear('20' + year, month, day);
    }
  }

  ret.setUTCHours(time.slice(0, 2));
  ret.setUTCMinutes(time.slice(2, 4));
  ret.setUTCSeconds(time.slice(4, 6));

  // Extract the milliseconds, since they can be not present, be 3 decimal place, or 2 decimal places, or other?
  var msStr = time.slice(7);
  var msExp = msStr.length;
  var ms = 0;
  if (msExp !== 0) {
      ms = parseFloat(msStr) * Math.pow(10, 3 - msExp);
  }
  ret.setUTCMilliseconds(ms);

  return ret;
}

function parseCoord(coord, dir) {

  // Latitude can go from 0 to 90; longitude can go from 0 to 180.

  if (coord === '')
    return null;

  var n, sgn = 1;

  switch (dir) {

    case 'S':
      sgn = -1;
    case 'N':
      n = 2;
      break;

    case 'W':
      sgn = -1;
    case 'E':
      n = 3;
      break;
  }
  /*
    * Mathematically, but more expensive and not numerical stable:
    *
    * raw = 4807.038
    * deg = Math.floor(raw / 100)
    *
    * dec = (raw - (100 * deg)) / 60
    * res = deg + dec // 48.1173
    */
  return sgn * (parseFloat(coord.slice(0, n)) + parseFloat(coord.slice(n)) / 60);
}

function parseNumber(num) {

  if (num === '') {
    return null;
  }
  return parseFloat(num);
}

function parseKnots(knots) {

  if (knots === '')
    return null;

  return parseFloat(knots) * 1.852;
}


function isValid(str, crc) {

  var checksum = 0;
  for (var i = 1; i < str.length; i++) {
    var c = str.charCodeAt(i);

    if (c === 42) // Asterisk: *
      break;

    checksum ^= c;
  }
  return checksum === parseInt(crc, 16);
}

function parseDist(num, unit) {

  if (unit === 'M' || unit === '') {
    return parseNumber(num);
  }
  throw 'Unknown unit: ' + unit;
}

module.exports = {
  parseDist,
  parseTime,
  parseCoord,
  parseKnots,
  parseFloat,
  parseNumber,
};