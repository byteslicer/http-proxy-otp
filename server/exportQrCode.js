const totp = require('./totp')
const qrcode = require('qrcode-terminal');

let uri = totp.toString();

qrcode.generate(uri, {small: true})
