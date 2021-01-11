'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();

router.post('/',(req, res, next) => AUTH.validate(req, res, next),  controller.createHobbie);
router.put('/', (req, res, next) => AUTH.validate(req, res, next), controller.updateHobbie);
router.get('/',  controller.listHobbies);
router.get('/profile',(req, res, next) => AUTH.validate(req, res, next),  controller.profileHobbies);
router.post('/profile',(req, res, next) => AUTH.validate(req, res, next),  controller.profileHobbiesInsert);
router.delete('/:hobbieId',(req, res, next) => AUTH.validate(req, res, next),  controller.removeHobbie);
router.put('/status',(req, res, next) => AUTH.validate(req, res, next),  controller.changeHobbieStatus);

// app.use('/api/hobbies',(req, res, next) => AUTH.validate(req, res, next), require('./server/hobbies/router'));

// router.post('/registrarUsuarioCondominio', controller.registrarUsuarioCondominio);
// router.post('/atualizar', controller.atualizar);
// router.post('/listar', controller.listar);
// router.post('/listarUsuario', controller.listarUsuario);

// router.post('/emailEmUso', controller.emailEmUso);
// router.post('/autenticar', controller.autenticar);

// router.post('/alterarSenha', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.alterarSenha);
// router.post('/atualizar', (req, res, next) => AUTH.validate(req, res, next, 'USUARIO'), controller.atualizar);

// router.post('/listar', (req, res, next) => AUTH.validate(req, res, next, 'ADMINISTRADOR'), controller.listar);
// router.post('/listarUsuario', (req, res, next) => AUTH.validate(req, res, next, 'ADMINISTRADOR'), controller.listarUsuario);

module.exports = router;
