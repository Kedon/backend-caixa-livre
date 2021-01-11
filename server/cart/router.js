'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.get('/', (req, res, next) => AUTH.validate(req, res, next), controller.cart);
router.post('/', (req, res, next) => AUTH.validate(req, res, next), controller.addToCart);
//router.get('/*highlights', (req, res, next) => AUTH.validate(req, res, next), controller.highlights);
//router.get('/:ean', (req, res, next) => AUTH.validate(req, res, next), controller.product);
router.patch('/:ean', controller.productUpdate);


module.exports = router;
