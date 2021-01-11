const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDMAIL_KEY_RECOVER);

module.exports.sendEmail = (data) => {
    try {
        return new Promise((resolve, reject) => {
            sgMail.send(data, (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
             });
        })
        
    } catch (error) {
        return error
    }
   
 }