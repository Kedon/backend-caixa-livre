'use strict';

const service = require('./service');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;


module.exports.uploadImage = async (req, res) => {
  console.log(req.file)
    try {
      var result = await service.uploadImage(req.file, 'shipper-images/');
      return res.json(result);
    } catch (err) {
      return res.status(500).json(err);
    }
}


module.exports.uploadBase64Array = async (req, res) => {
    try {
      var result = await service.uploadBase64Array(req.body.photos, 'shipper-images/');
      console.log(result)
      return res.json(result);
    } catch (err) {
      return res.status(500).json(err);
    }
}