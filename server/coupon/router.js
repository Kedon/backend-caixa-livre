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



// router.post('/',  multer({ storage: storage }).single('file'),controller.createCoupon);
router.post('/',controller.createCoupon);
router.post('/stats',controller.couponStats); //ATUALIZA OU INSERE A CONTAGEM DE VISUALIZAÇÕES
// router.put('/', controller.updateCompany);
router.get('/', controller.listCoupons);
router.get('/timeline', controller.couponsTimeline)
router.get('/details/:couponId', controller.couponDetails);
router.get('/valids', controller.listValidsCoupons);
router.get('/expireds', controller.listExpiredCoupons);

router.get('/company/:companyId', (req, res, next) => AUTH.validate(req, res, next), controller.companyCoupons);


router.put('/validateChange', controller.changeCouponValidate);
router.put('/', controller.updateCoupon);
//router.post('/active', controller.couponActivate); SUBSTITUIDA PELA ROTA ABAIXO
router.post('/:couponId', controller.couponActivate);
router.get('/userCoupons', controller.userCoupons);
router.get('/:code/:userCode', controller.checkCouponUser)
router.post('/use', controller.useCoupon)
router.get('/analitics', controller.couponAnalitics)
router.get('/match', controller.couponMatch)



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
