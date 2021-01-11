'use strict';

const service = require('./service');
const uploadService = require('../uploads/service')
const upload = require('../helpers/amazon-s3-storage');
const login = require('../login/controller');

module.exports.createStorie = async (req, res) => {
  const { userId } = req.loggedUser;
  const { description, storie } = req.body.params;
  try {
    if (!storie.uri) return res.status(200).json({
      status: 'FAIL',
      message: 'Atributos da imagem não informados'
    });
    let image = await upload.uploadBase64(storie.uri, 'shipper-images/')
    //let result = await service.saveUserImage(req.params.userId, image.Location, 'no name', 'no description')
    var result = await service.createStorie(userId, image.Location, image.Bucket, image.key, description)
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.ownStorie = async (req, res) => {
  const { userId } = req.loggedUser;
  try {
    var result = await service.ownStorie(userId)
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.stories = async (req, res) => {
  const { userId } = req.loggedUser;
  const {  offset, perPage } = req.query;
  console.log(req.query)
  try {
    var result = await service.stories(userId, offset, perPage )
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


