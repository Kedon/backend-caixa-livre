const AWS = require('aws-sdk');

//configuring the AWS environment
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const sns = new AWS.SNS({ apiVersion: '2010-03-31' })
var ses = new AWS.SES();

module.exports.send = (notification) => {
    const params = {
        Destination: {
            ToAddresses: ["aldenirsrv@gmail.com"] // Email address/addresses that you want to send your email
        },
        Message: {
            Body: {
                Html: {
                    // HTML Format of the email
                    Charset: "UTF-8",
                    Data:
                        "<html><body><h1>Hello  Charith</h1><p style='color:red'>Sample description</p> <p>Time 1517831318946</p></body></html>"
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "Hello Charith Sample description time 1517831318946"
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Test email"
            }
        },
        Source: "aldenirsrv@gmail.com"
    };
    return new Promise(async (resolve, reject) => {

        // Send the email

        try {
            ses.sendEmail(params, (err, data) => {
                if (err) { reject(err) }
                console.log(data)
                resolve(data)
            });
        } catch (error) {
            reject(error)
        }



    })
}
