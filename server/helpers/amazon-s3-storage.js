const AWS = require('aws-sdk');
const fs = require('fs');
const request = require('request');

// https://scotch.io/@cizu/building-a-amazon-s3-api-with-express-and-multer-s3

//configuring the AWS environment

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

var s3 = new AWS.S3();
uploadPathImage = function (path, folder, name) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(path)
            fs.readFile(path, (err, data) => {
                console.log(data)
                if (err) throw err;
                const params = {
                    Bucket: 'kedon-images',
                    Body: data,
                    Key: folder + name,
                    ACL: 'public-read'
                };
                s3.upload(params, function (s3Err, data) {
                    if (s3Err) throw s3Err
                    return resolve(data)
                });
            });
        } catch (exception) {
            reject(exception)
            return null;
        }
    })

}

module.exports.upload = function (file, folder) {
    return new Promise(async (resolve, reject) => {
        try {
            fs.readFile(file.path, (err, data) => {
                if (err) throw err;
                const params = {
                    Bucket: 'kedon-images',
                    Body: data,
                    Key: folder + file.filename,
                    ACL: 'public-read'
                };
                s3.upload(params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    return resolve(data)
                });
            });
        } catch (exception) {
            reject(exception)
            return null;
        }
    })
  }

/**
 * This gist was inspired from https://gist.github.com/homam/8646090 which I wanted to work when uploading an image from
 * a base64 string.
 * Updated to use Promise (bluebird)
 * Web: https://mayneweb.com
 *
 * @param  {string}  base64 Data
 * @return {string}  Image url
 */
module.exports.uploadBase64 = async function (base64, folder) {

    return new Promise(async (resolve, reject) => {
        try {
            // Ensure that you POST a base64 data to your server.
            // Let's assume the variable "base64" is one.
            const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

            // Getting the file type, ie: jpeg, png or gif
            const type = base64.split(';')[0].split('/')[1];

            // Generally we'd have an userId associated with the image
            // For this example, we'll simulate one
            const userId = new Date().getTime();

            // With this setup, each time your user uploads an image, will be overwritten.
            // To prevent this, use a different Key each time.
            // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
            const params = {
                Bucket: 'kedon-images',
                Body: base64Data,
                Key: `${folder}${userId}.${type}`,
                ACL: 'public-read',
                ContentEncoding: 'base64', // required
                ContentType: `image/${type}` // required. Notice the back ticks
            }
            s3.upload(params, function (s3Err, data) {
                if (s3Err) throw s3Err

                return resolve(data)
            });

        } catch (exception) {
            reject(exception)
            return null;
        }
    })
}


module.exports.delete = function (bucket, key) {
    return new Promise(async (resolve, reject) => {
        try {
          var params = {
            Bucket: bucket,
            Key: key
          };
          s3.deleteObject(params, function (s3Err, data) {
              if (s3Err) throw s3Err
              return resolve({
                status: 'deleted',
                message: 'imagem apagada com sucesso'
              })
          });

        } catch (exception) {
            reject(exception)
            return null;
        }
    })
  }





module.exports.uploadUrl = async (url, folder, userId) => {
    var path = `${process.env.PWD}/socialimage/${userId}.png`

    return new Promise(async (resolve, reject) => {
        try {

            await request(url).pipe(fs.createWriteStream(path)
                .on('close', async () => {
                    let saveS3 = await uploadPathImage(path, folder, `${userId}.png`)
                    fs.unlinkSync(path);
                    resolve(saveS3)
                }));
        } catch (exception) {
            reject(exception)
            return null;
        }
    });

}
