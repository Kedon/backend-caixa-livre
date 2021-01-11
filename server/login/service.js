'use strict'

const email = require('../helpers/amazon-ses')
const sms = require('../helpers/amazon-sms')


/**
 * RECOVER USER PASS
 */
module.exports.passwordRecover = async (notification) => {
    return new Promise(async (resolve, reject) => {

        try {
            await sms.send(notification)
                .then((data) => {
                    resolve(data)
                })
                .catch(err => {
                    console.log('Could not send.')
                    console.error(err)
                })
        } catch (error) {

        }

    })
}


/**
 * RECOVER USER PASS
 */
module.exports.sendMail = async (notification) => {
    return new Promise(async (resolve, reject) => {

        try {
            await email.send(notification)
                .then((data) => {
                    resolve(data)
                })
                .catch(err => {
                    console.log('Could not send.')
                    console.error(err)
                })
        } catch (error) {

        }

    })
}
