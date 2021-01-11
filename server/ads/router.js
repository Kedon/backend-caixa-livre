'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.get('/', (req, res, next) => AUTH.validate(req, res, next), controller.ads);
//router.get('/:id', (req, res, next) => AUTH.validate(req, res, next), controller.area);


module.exports = router;
