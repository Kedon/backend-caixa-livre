const qrcode = require('../helpers/qrcode-generator')


/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.generateQrCode = async (req, res) => {
    const { data } = req.body

  
  if(!data) return res.status(400).json({
    status: 'FAIL',
    message: 'Nenhum dado para gerar qrcode'
  });

  try {
    
    let code = await qrcode.generate(data)
    res.type('svg')

    code.pipe(res)
    
  } catch (err) {
    return res.status(500).json(err);
  }
}

