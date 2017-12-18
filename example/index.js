const fs = require('fs');
const GPS = require('..');

const gps = new GPS;

gps.on('data', data => {
  console.log(data);
});

fs
.createReadStream('/dev/cu.usbmodem1411')
.pipe(gps)