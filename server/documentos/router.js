'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

// router.post('/adicionar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.adicionar);
router.post('/uploadDocumento', controller.uploadDocumento);
router.post('/adicionar', controller.adicionar);
router.post('/listar', controller.listar);
router.post('/atualizar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.atualizar);
// router.post('/listar', (req, res, next) => AUTH.validate(req, res, next, 'CLIENTE'), controller.listar);
router.post('/recuperarPorId', (req, res, next) => AUTH.validate(req, res, next, 'CLIENTE'), controller.recuperarPorId);

module.exports = router;