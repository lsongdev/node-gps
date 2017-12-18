const fs = require('fs');
const GPS = require('..');

const gps = new GPS;

gps.on('data', data => {
  console.log(data);
});

fs
.createReadStream(__dirname + '/data/gps.dump')
.pipe(gps)