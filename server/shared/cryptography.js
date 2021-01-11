'use strict';

const CRYPTO_SECRET = process.env.CRYPTO_SECRET || 'da39a3ee5e6b4b0d3255bfef95601890afd80709';
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

module.exports.encrypt = (text) => {
    try {
        let cipher = crypto.createCipher(algorithm, CRYPTO_SECRET)
        let crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    } catch (exception) {
        return null;
    }
}

module.exports.decrypt = (text) => {
    try {
        let decipher = crypto.createDecipher(algorithm, CRYPTO_SECRET)
        let dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    } catch (exception) {
        return null;
    }
}