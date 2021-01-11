const qr = require('qr-image')


exports.generate = (data, type='DATA') => {
    let code = null
    return new Promise(async (resolve, reject) => {
        try {
            console.log(type)
            if(type === 'STRING') {
                code = qr.imageSync(data, { type: 'svg' })
            } else {
                code = qr.image(data, { type: 'svg' })
            }

            // const code = qr.image(data, { type: 'svg' })
            resolve(code)
        } catch (error) {
            reject(error)
        }
    })
}

