'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

// router.post('/listar', (req, res, next) => AUTH.validate(req, res, next, 'CLIENTE'), controller.listar);

// router.post('/adicionar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.adicionar);
router.post('/adicionarEnquete', controller.adicionarEnquete);
router.post('/adicionarPerguntas', controller.adicionarPerguntas);
router.post('/adicionarOpcoes', controller.adicionarOpcoes);
router.post('/listarEnquete', controller.listarEnquete);
router.post('/listarEnqueteContinue', controller.listarEnqueteContinue);
router.post('/listar', controller.listar);
router.post('/listarPerguntas', controller.listarPerguntas);
router.post('/atualizarOpcao', controller.atualizarOpcao);
router.post('/atualizarPergunta', controller.atualizarPergunta);
router.post('/adicionarRespostasArray', controller.adicionarRespostasArray);
router.post('/listarRespostas', controller.listarRespostas);
// router.post('/atualizar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.atualizar);

module.exports = router;