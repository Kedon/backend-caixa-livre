const upload = require('../helpers/amazon-s3-storage');
const LOGS = require('../shared').LOGS;

module.exports.uploadImage = (file, folder) => {
  return new Promise(async (resolve, reject) => {
    try {
      var fileS3 = await upload.upload(file, folder);
      return resolve(fileS3)
    } catch (err) {
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}

module.exports.uploadUrl = (url, folder, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      var fileS3 = await upload.uploadUrl(url, folder, userId);
      return resolve(fileS3)
    } catch (err) {
      console.log(err)
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}

module.exports.uploadBase64 = (base64, folder) => {
  console.log(base64)
  return new Promise(async (resolve, reject) => {
    try {
      console.log(base64)
      var fileS3 = await upload.uploadBase64(base64, folder)
      return resolve(fileS3)
    } catch (err) {
      console.log(err)
      LOGS.logError(err);
      return reject({
        status: 'ERROR',
        message: 'Falha interna.'
      });
    }
  });
}

module.exports.uploadBase64Array = (photos, folder) => {
return new Promise((resolve, reject) => {
  try {
    return Promise.all(
      photos.map(async photo => {
        let image = await upload.uploadBase64(photo, folder)
        console.log('------------------------')
        console.log(image)
        console.log('------------------------')

        return image.Location
      })
    ).then(resp => resolve(resp)).catch(err => reject(err))
  } catch (error) {
    reject(error)
  }

})}




