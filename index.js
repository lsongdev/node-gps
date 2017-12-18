/**
 * [GPS description]
 * @wiki https://en.wikipedia.org/wiki/NMEA_0183
 * @wiki https://en.wikipedia.org/wiki/NMEA_2000
 * @docs http://www.gpsinformation.org/dale/nmea.htm
 */
function GPS(){
  if(!(this instanceof GPS)){
    return new GPS();
  }
  this.events = {};
  this.buffer = '';
  return this;
};

GPS.CR        = '\r'; // 0x0d;
GPS.LF        = '\n'; // 0x0a;
GPS.$         = '$';  // 0x24;
GPS.SEPARATOR = ',';  // 0x2c;
GPS.CHECKSUM  = 0x2a; // *
GPS.TAG       = '\\';

GPS.prototype.on = function(type, handler){
  (this.events[type] = this.events[type] || []).push(handler);
  return this;
};

GPS.prototype.once = function(type, handler){
  return this.on(type, function(){
    this.removeListener(type, arguments.callee);
    handler.apply(null, arguments);
  });
};

GPS.prototype.removeListener = function(){
  
};

GPS.prototype.emit = function(type){
  const args = [].slice.call(arguments, 1);
  (this.events[type] || []).forEach(handler => {
    handler.apply(null, args);
  });
};

GPS.prototype.write = function(buffer){
  this.buffer += buffer;
  const parts = this.buffer.split(GPS.LF)
  this.buffer = parts.pop();
  parts.forEach(line => {
    try{
      const data = GPS.parse(line);
      if(data) this.emit('data', data);
    }catch(e){
      this.emit('error', e);
    }
  });
};

GPS.prototype.end = function(){

};

GPS.parse = function(line){
  // Messages have a maximum length of 82 characters, 
  // including the $ or ! starting character and the ending <LF>
  if(line.length > 82) throw new Error();
  if(!~[ GPS.$, '!' ].indexOf(line[0])) throw new Error();
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
  const type        = nmea[0][0];
  const talker      = nmea[0].substr(1, 2);
  const messageType = nmea[0].substr(3);
  const checksum    = nmea[nmea.length - 1];
  switch(type){
    case GPS.$:
      const parser = require(`./parsers/${messageType}`);
      if(typeof parser === 'function'){
        return parser(nmea, line);
      }else{
        throw new Error(`Unknow message type "${messageType}"`);
      }
      break;
    case '!':
      // 
      break;
    default:
      throw new Error(`Unknow sentence start delimiter "${type}"`);
      break;
  }
};

/**
 * checksum
 * The asterisk is immediately followed by a checksum represented as a two-digit hexadecimal number. 
 * The checksum is the bitwise exclusive OR of ASCII codes of all characters between the $ and *. 
 * According to the official specification, the checksum is optional for most data sentences, 
 * but is compulsory for RMA, RMB, and RMC (among others).
 * @ref https://en.wikipedia.org/wiki/NMEA_0183#C_implementation_of_checksum_generation
 */
GPS.checksum = function(str, crc){
  var checksum = 0;
  for(var i = 1; i < str.length; i++){
    var c = str.charCodeAt(i);
    if(c === GPS.CHECKSUM) break; // *
    checksum ^= c;
  }
  return crc ? parseInt(crc, 16) === checksum : checksum;
};

module.exports = GPS;