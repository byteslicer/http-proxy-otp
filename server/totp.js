const OTPAuth = require('otpauth');
const config = require('../config.js')

let totp = new OTPAuth.TOTP({
    issuer: config.optIssuer || 'Doorman',
    label: config.optLabel || 'Access',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromRaw(config.secret)
});

module.exports = totp;
