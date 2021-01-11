// const GoogleCloudStorage = require('@google-cloud/storage');~
const {Storage} = require('@google-cloud/storage');
  
exports.storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE,
});

/**
   * Get public URL of a file. The file must have public access
   * @param {string} bucketName
   * @param {string} fileName
   * @return {string}
   */
  exports.getPublicUrl = (bucketName, fileName) => `https://storage.googleapis.com/${bucketName}/${fileName}`;

  /**
   * Copy file from local to a GCS bucket.
   * Uploaded file will be made publicly accessible.
   *
   * @param {string} localFilePath
   * @param {string} bucketName
   * @param {Object} [options]
   * @return {Promise.<string>} - The public URL of the uploaded file.
   */
  exports.copyFileToGCS = (localFilePath, bucketName, options) => {
    options = options || {};
  
    const bucket = storage.bucket(bucketName);
    const fileName = path.basename(localFilePath);
    const file = bucket.file(fileName);
  
    return bucket.upload(localFilePath, options)
      .then(() => file.makePublic())
      .then(() => exports.getPublicUrl(bucketName, gcsName));
  };