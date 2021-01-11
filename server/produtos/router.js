'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.post('/consultar', controller.consultar);
router.post('/adicionarPedido', controller.adicionarPedido);
router.post('/adicionarProdutoPedido', controller.adicionarProdutoPedido);
router.post('/listarLojas', controller.listarLojas);
router.post('/produtosProximos', controller.produtosProximos);
router.post('/listarCategorias', controller.listarCategorias);
router.get('/listarDepartamentos', controller.listarDepartamentos);

router.post('/pesquisar', (req, res, next) => AUTH.validate(req, res, next, 'CLIENTE'), controller.pesquisar);
router.post('/listarPorCliente', (req, res, next) => AUTH.validate(req, res, next, 'CLIENTE'), controller.listarPorCliente);
router.post('/recuperarPorId', (req, res, next) => AUTH.validate(req, res, next, 'CLIENTE'), controller.recuperarPorId);

router.post('/adicionar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.adicionar);
router.post('/atualizar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.atualizar);
router.post('/listar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.listar);

module.exports = router;