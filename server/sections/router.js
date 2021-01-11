'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.get('/', (req, res, next) => AUTH.validate(req, res, next), controller.areas);
router.get('/*highlights', (req, res, next) => AUTH.validate(req, res, next), controller.highlights);
router.get('/*excerpt/:id', (req, res, next) => AUTH.validate(req, res, next), controller.excerpt);
router.get('/:id', (req, res, next) => AUTH.validate(req, res, next), controller.area);


module.exports = router;
