
const replacement = require('../../../server/helpers/sendmail/replacement')

module.exports.passRecover = (replacementsVariables = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            let template = await replacement.extractDataToString('password-reset.html')
            let replace = await replacement.replace(template, replacementsVariables)  
            resolve(replace)
        } catch (err) {
            reject(err)
        }
    });
} 
