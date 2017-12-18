const util = require('util');
const EventEmitter = require('events');
const { isValid } = require('./lib/utils');
/**
 * [GPS description]
 * @wiki https://en.wikipedia.org/wiki/NMEA_0183
 * @wiki https://en.wikipedia.org/wiki/NMEA_2000
 * @docs http://www.gpsinformation.org/dale/nmea.htm
 */
class GPS extends EventEmitter {
  constructor(options) {
    super();
    this.buffer = '';
    return Object.assign(this, options);
  }
  write(buffer) {
    this.buffer += buffer;
    const parts = this.buffer.split(GPS.CR + GPS.LF)
    this.buffer = parts.pop();
    parts.forEach(line => {
      try {
        const data = GPS.parse(line);
        if (data) {
          this.emit('data', data);
          this.emit(data.type, data);
        }
      } catch (e) {
        this.emit('error', e);
      }
    });
    return this;
  }
}

GPS['$'] = '$';  // 0x24;
GPS['!'] = '!';
GPS.CR = '\r'; // 0x0d;
GPS.LF = '\n'; // 0x0a;
GPS.SEPARATOR = ',';  // 0x2c;
GPS.CHECKSUM = 0x2a; // *
GPS.TAG = '\\';

GPS.parse = function (line) {
  // Messages have a maximum length of 82 characters, 
  // including the $ or ! starting character and the ending <LF>
  if (line.length > 82) throw new Error();
  if (!~[GPS['$'], GPS['!']].indexOf(line[0])) throw new Error();
  // if(line.slice(-1) !== GPS.LF) throw new Error();
  // All data fields that follow are comma-delimited.
  const nmea = line.split(GPS.SEPARATOR);
  var last = nmea.pop();
  // The first character that immediately follows the last data field character is an asterisk, 
  // but it is only included if a checksum is supplied.
  last = last.split('*');
  nmea.push(last[0]);
  nmea.push(last[1]);
  // The start character for each message can be either a 
  // $ (For conventional field delimited messages) or 
  // ! (for messages that have special encapsulation in them)
  // The next five characters identify the talker (two characters) 
  // and the type of message (three characters).
  const type = nmea[0][0];
  const talker = nmea[0].substr(1, 2);
  const messageType = nmea[0].substr(3);
  const checksum = nmea[nmea.length - 1];
  switch (type) {
    case GPS['$']:
      const parser = require(`./parsers/${messageType}`);
      if (typeof parser === 'function') {
        const data = parser(nmea, line);
        data.valid = isValid(line, checksum);
        data.raw = line;
        data.type = messageType;
        return data;
      } else {
        throw new Error(`Unknow message type "${messageType}"`);
      }
      break;
    case GPS['!']:
      // 
      break;
    default:
      throw new Error(`Unknow sentence start delimiter "${type}"`);
      break;
  }
};

module.exports = GPS;