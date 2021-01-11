'use strict';

const service = require('./service');
const companyService = require('../company/service');
const generateQRCode = require('../helpers/qrcode-generator')
const uploadService = require('../uploads/service')

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
/**
 * Convert a base64 string in a Blob according to the data and contentType.
 *
 * @param b64Data {String} Pure base64 string without contentType
 * @param contentType {String} the content type of the file i.e (image/jpeg - image/png - text/plain)
 * @param sliceSize {Int} SliceSize to process the byteCharacters
 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 * @return Blob
 */
function urltoFile(url, filename, mimeType){
  mimeType = mimeType || (url.match(/^data:([^;]+);/)||'')[1];
  return (fetch(url)
      .then(function(res){return res.arrayBuffer();})
      .then(function(buf){return new File([buf], filename, {type:mimeType});})
  );
}

/**
 * CREATE NEW HOBBIE
 */
module.exports.createCoupon = async (req, res) => {
  const { companyId, name, validity, description, url } = req.body

  // console.log(typeof url.toString())

  if (!companyId) return res.status(400).json({
    status: 'FAIL',
    message: 'A empresa não informada'
  });

  if (!name) return res.status(400).json({
    status: 'FAIL',
    message: 'Título do cupom não informado'
  });

  if (!validity) return res.status(400).json({
    status: 'FAIL',
    message: 'A validade do cupom não for informada'
  });

  try {
    let company = await companyService.verifyCompany(companyId)

    if(company.data === null ) {
      return res.json(company);
    }

    var image = await uploadService.uploadBase64(url, 'shipper-images/');

    let result = await service.createCoupon(companyId, name, validity, description, image.Location);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}
/**
 * LIST COUPONS
 */
module.exports.listCoupons = async (req, res) => {
  const { companyId, createdStart, createdEnd, validityStart, validityEnd, onlyQrCode, status} = req.query

  try {
    let result = await service.listCoupons(companyId, createdStart, createdEnd, validityStart, validityEnd, onlyQrCode, status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST TIMELINE COUPONS / ADS
 */
module.exports.couponsTimeline = async (req, res) => {
  const { offset, page } = req.query;
  const { userId } = req.loggedUser;
  try {

    let result = await service.couponsTimeline(page, Number(offset));
    if(result.data[0].couponId){
      //verifica se já foi criada uma linha para o dia atual
      const {couponId} = result.data[0]
      let checkStats = await service.couponStats(couponId, page, userId);
      const {couponStatsId, update} = checkStats
      if (update) {
        //atualiza o dia com novas estatísticas
        let result = await service.statsUpdate(couponId, "prints", couponStatsId, page, userId )
      } else {
        //cria uma linha de estatísticas para o dia
        let result = await service.statsInsert(couponId, page, "prints", userId)
      }
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST TIMELINE COUPONS / ADS FOR MATCHES
 */
module.exports.couponMatch = async (req, res) => {
  const { companyId, createdStart, createdEnd, validityStart, validityEnd, onlyQrCode, status} = req.query

  try {
    let result = await service.couponMatch(companyId, createdStart, createdEnd, validityStart, validityEnd, onlyQrCode, status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * INSERT OR UPDATE COUPOM STATS
 */
module.exports.couponStats = async (req, res) => {
  const { couponId, page, metrics } = req.body
  const { userId } = req.loggedUser
  try {
    //verifica se já foi criada uma linha para o dia atual
    let checkStats = await service.couponStats(couponId, page, userId);
    if (checkStats.update) {
      //atualiza o dia com novas estatísticas
      let result = await service.statsUpdate(couponId, metrics, checkStats.couponStatsId, page, userId)
    } else {
      //cria uma linha de estatísticas para o dia
      let result = await service.statsInsert(couponId, page, metrics, userId)
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * LIST VALIDS COUPONS
 */
module.exports.listValidsCoupons = async (req, res) => {
  const { companyId } = req.query

  try {
    let result = await service.listValidsCoupons(companyId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * LIST EXPIRED COUPONS
 */
module.exports.listExpiredCoupons = async (req, res) => {
  const { companyId } = req.query

  try {
    let result = await service.listExpiredCoupons(companyId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}



/**
 * UPDATE A HOBBIE
 */
module.exports.updateCompany = async (req, res) => {

  const { companyId, name, address, number,district, lng, lat, description, status } = req.body

  if (!companyId) return res.status(400).json({
    status: 'FAIL',
    message: 'A empresa não foi informada'
  });

  if (!name) return res.status(400).json({
    status: 'FAIL',
    message: 'O nme da empresa não informado'
  });

  if (!address) return res.status(400).json({
    status: 'FAIL',
    message: 'O endereço da empresa não informado'
  });

  if (!number) return res.status(400).json({
    status: 'FAIL',
    message: 'O número do endereçco da empresa não informado'
  });

  if (!district) return res.status(400).json({
    status: 'FAIL',
    message: 'O bairro da empresa não foi informado'
  });

  try {
    let result = await service.updateCompany(companyId, name, address, number,district, lng, lat, description, status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * CHANGE HOBBIE STATUS
 */
module.exports.changeCouponValidate = async (req, res) => {
  const { couponId, validity } = req.body

  if (!couponId) return res.status(400).json({
    status: 'FAIL',
    message: 'Cupom não foi informado'
  });

  if (!validity) return res.status(400).json({
    status: 'FAIL',
    message: 'Data de validade não informada'
  });

  try {
    let result = await service.changeCouponValidate(couponId, validity);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * CREATE NEW HOBBIE
 */
module.exports.updateCoupon = async (req, res) => {
  const { couponId, companyId, name, validity, description, quanity, balance, status, qrcode } = req.body
  let qrcodeImage = null
  if (!companyId) return res.status(400).json({
    status: 'FAIL',
    message: 'A empresa não informada'
  });

  if (!couponId) return res.status(400).json({
    status: 'FAIL',
    message: 'Cupom não informado'
  });

  if (!name) return res.status(400).json({
    status: 'FAIL',
    message: 'Título do cupom não informado'
  });

  if (!validity) return res.status(400).json({
    status: 'FAIL',
    message: 'A validade do cupom não for informada'
  });
  if(qrcode){
     qrcodeImage = await generateQRCode.generate(qrcode, 'STRING')
  }
  try {
    let company = await companyService.verifyCompany(companyId)
    if(company.data === null ) {
      return res.json(company);
    }

    let result = await service.updateCoupon(couponId, companyId, name, validity, description, quanity, balance, status, qrcode, qrcodeImage);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}
/**
 *
 *  USE COUPONS
 *
 */

module.exports.couponActivate = async (req, res) => {
  const { couponId } = req.params;
  const { userId } = req.loggedUser

  if (!couponId) return res.status(400).json({
    status: 'FAIL',
    message: 'Código do cupom não foi informado'
  });

  if (!userId) return res.status(400).json({
    status: 'FAIL',
    message: 'O código do Usuário não informado'
  });

  try {
    let coupon = await service.checkIsvalid(couponId)
    let cupounExist = coupon && coupon.data && coupon.data.couponId ? true : false
    if(!cupounExist) {
         return  res.status(400).json({
            status: 'OK',
            message: 'O cupom que está tendando ativar não é válido ou não existe',
            data: []
        })
    }
    /** Coupon code  */
    let code  = coupon.data.code
    let couponInUse = await service.couponInUse(couponId, userId)
    if(couponInUse && couponInUse.data &&  couponInUse.data.couponId && couponInUse.data.couponId !== undefined) {
      return  res.status(200).json(couponInUse)
      //return  res.status(400).json(couponInUse)
    }
    let result = await service.couponActivate(couponId, userId, 'ACTIVATED', code);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.couponUsage = async (req, res) => {
  const { code } = req.body

  if (!code) return res.status(400).json({
    status: 'FAIL',
    message: 'Código do cupom não informado'
  });

  try {
    let couponIsvalid = await service.checkCouponUser(code)
    if(!couponIsvalid) {
         return  res.status(400).json({
            status: 'OK',
            message: 'O cupom que está tendando ativar não está mais válido ou não existe',
            data: []
        })
    }
    let couponInUse = await service.couponInUse(couponId, userId)
    if(couponInUse && couponInUse.data &&  couponInUse.data.id && couponInUse.data.id !== undefined) {
      return  res.status(400).json(couponInUse)
    }
    let result = await service.couponActivate(couponId, userId, 'ACTIVATED');
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST COUPONS
 */
module.exports.userCoupons = async (req, res) => {
  const { userId } = req.loggedUser
  const { page, offset } = req.query;
  try {
    let result = await service.userCoupons(userId, page, offset);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST COUPONS
 */
module.exports.checkCouponUser = async (req, res) => {
  const { code, userCode } = req.params;
  if (!code) return res.status(400).json({
    status: 'FAIL',
    message: 'Usuário não informado'
  });
  if (!userCode) return res.status(400).json({
    status: 'FAIL',
    message: 'Codigo usuário não informado'
  });


  try {
    let result = await service.checkCouponUser(code, userCode);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.useCoupon = async (req, res) => {
  const { code, userCode } = req.body;

  try {

  if (!code) return res.status(400).json({
    status: 'FAIL',
    message: 'Usuário não informado'
  });
  if (!userCode) return res.status(400).json({
    status: 'FAIL',
    message: 'Codigo usuário não informado'
  });


    let coupon = await service.checkCouponUser(code, userCode);
    if(!coupon || coupon.data.length <= 0) {
      return res.json(coupon);
    }


    if(coupon && coupon.data.status === 'USED') {
      return res.status(402).json({
        status: 'FAIL',
        message: 'O cupom já foi utilizado'
      });
    }

    let result = await service.couponUsage(coupon.data.couponUseId, 'USED');
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.couponAnalitics = async (req, res) => {
  const { companyId, createdStart, createdEnd, status } = req.query

  try {
    let result = await service.couponAnalitics(companyId, createdStart, createdEnd, status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.couponDetails = async (req, res) => {
  const { couponId } = req.params;
  const { userId } = req.loggedUser;
  try {

    let result = await service.couponDetails(userId, couponId);
    return res.json(result);
  } catch (err) {
    return res.json(err).status(500);
  }
}

/**
 * LIST EXPIRED COUPONS
 */
module.exports.companyCoupons = async (req, res) => {
  const { companyId } = req.params;
  const { userId } = req.loggedUser;


  try {
    let result = await service.companyCoupons(userId, companyId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
