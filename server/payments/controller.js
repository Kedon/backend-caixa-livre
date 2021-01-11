'use strict';

const service = require('./service');
const mercadopago = require('mercadopago');

const getFullUrl = (req) =>{
    const url = req.protocol + '://' + req.get('host');
    console.log(url)
    return url;
}


module.exports.payment = async (req, res) => {
  console.log('MERCADOPAGO')
  console.log(req)
  console.log(req.query)
  console.log(process.env.MP_SANDBOX)
  console.log(process.env.MP_ACCESS_TOKEN)
  mercadopago.configure({
    sandbox: process.env.MP_SANDBOX == 'true' ? true : false,
    access_token: process.env.MP_ACCESS_TOKEN
  });

  const { packageId, title, price, level, time, timeType } = req.query;
  console.log(req.query)
  const { userId, email } = req.loggedUser;
  const {created, orderId, inserted, packages } = await service.payment(userId, packageId, price, time, timeType, level);

  if(created){
    const purchaseOrder = {
      items: [
        {
          id: packageId,
          title: title,
          description : 'Compra de pacote Shipper Premium',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: parseFloat(price)
        },
      ],
      payer : {
        //email: email
        email: email
      },
      //auto_return : "all",
      external_reference : orderId,
      //notification_url: getFullUrl(req) + "/api/payments/notification",
      redirect_urls : {
        success : getFullUrl(req) + "/api/payments/success",
        pending : getFullUrl(req) + "/api/payments/pending",
        failure : getFullUrl(req) + "/api/payments/failure",
      }
    }
    try {
      mercadopago.preferences.create(purchaseOrder)
      .then(function (mpResponse) {
        const {init_point, sandbox_init_point, redirect_urls, collector_id, external_reference, id } = mpResponse.body
        console.log(mpResponse)
        return res.json({
          init_point: init_point,
          sandbox_init_point: sandbox_init_point,
          redirect_urls: redirect_urls,
          collector_id: collector_id,
          orderId:external_reference,
          gateway_id: id,
          id: inserted,
          packages: packages
        });
      }).catch(function (mpError) {
        return res.json(mpError);
      });
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.json({status: 'ERR', message: 'Não criado'})
  }
}

module.exports.updatePayment = async (req, res) => {
  const { status, collector_id, orderId, gateway_id, id } = req.body.params;
  const { userId, email } = req.loggedUser;
  console.log('----------------------------------------')
  console.log(req.body.params)
  console.log('----------------------------------------')
  console.log(status);
  console.log('----------------------------------------')
  console.log(collector_id);

  try {
    let result = await service.updatePayment( userId, status, collector_id, orderId, gateway_id, id );
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


module.exports.paymentSuccess = async (req, res) => {
  console.log(res)
  return res.json({
    status: 'success'
  })
}

module.exports.paymentPending = async (req, res) => {
  console.log(res)
  return res.json({
    status: 'peding'
  })
}

module.exports.paymentFailure = async (req, res) => {
  console.log(res)
  return res.json({
    status: 'failure'
  })
}

module.exports.paymentNotification = async (req, res) => {
  console.log(res)
  return res.json({
    status: 'notification'
  })
}
