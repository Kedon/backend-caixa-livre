'use strict';

const moment = require('moment');

module.exports.logError = (err) => {
    process.nextTick(() => {
        if (!err) return;

        let formattedDate = moment.utc().toISOString() + ' - ';
        console.error(formattedDate + JSON.stringify(err));

        if(err.stack)
        console.error(err.stack);
    });
}