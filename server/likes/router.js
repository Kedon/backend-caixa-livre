'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.get('/', (req, res, next) => AUTH.validate(req, res, next), controller.likes);

module.exports = router;
