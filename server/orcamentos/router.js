'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

// router.post('/listar', (req, res, next) => AUTH.validate(req, res, next, 'CLIENTE'), controller.listar);

// router.post('/adicionar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.adicionar);
router.post('/adicionar', controller.adicionar);
router.post('/adicionarItens', controller.adicionarItens);
router.post('/adicionarRespostasArray', controller.adicionarRespostasArray);
router.post('/listar', controller.listar);
router.post('/listarItens', controller.listarItens);
router.post('/listarOrcamento', controller.listarOrcamento);
// router.post('/atualizar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.atualizar);

module.exports = router;