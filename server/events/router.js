'use strict'

const AUTH = require('../shared').AUTH;
const controller = require('./controller');
const router = require('express').Router();
const multer = require('multer');

/**
 * to save in S3 storage, the file must have a path
 */
var storage = multer.diskStorage({ //multers disk storage settings
  filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
  }
});



router.get('/', (req, res, next) => AUTH.validate(req, res, next), controller.events);
router.get('/:eventId', (req, res, next) => AUTH.validate(req, res, next), controller.details);
router.get('/invites/userList', (req, res, next) => AUTH.validate(req, res, next), controller.invites);
router.post('/:eventId', (req, res, next) => AUTH.validate(req, res, next), controller.intention);
router.post('/invite/:eventId', (req, res, next) => AUTH.validate(req, res, next), controller.invite);
router.delete('/uninvite/:eventId/:userId', (req, res, next) => AUTH.validate(req, res, next), controller.uninvite);
router.put('/status/:eventId', (req, res, next) => AUTH.validate(req, res, next), controller.status);

router.get('/:eventId/:intention', (req, res, next) => AUTH.validate(req, res, next), controller.intentionList);



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
