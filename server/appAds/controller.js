'use strict';

const service = require('./service');

module.exports.appAds = async (req, res) => {
  const { type } = req.params
  try {
    let result = await service.appAds(type);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
