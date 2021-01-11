'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

// router.post('/listar', (req, res, next) => AUTH.validate(req, res, next, 'CLIENTE'), controller.listar);

// router.post('/adicionar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.adicionar);
router.post('/registrar', controller.adicionar);
router.post('/atualizar', controller.atualizar);
router.post('/listar', controller.listar);
router.post('/listarCondominio', controller.listarCondominio);
// router.post('/atualizar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.atualizar);

module.exports = router;