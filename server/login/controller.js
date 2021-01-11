'use strict';
const AUTH = require('../shared').AUTH;
const service = require('./service');
const userService = require('../users/service')


/** to compare user pass */
const bcrypt = require('bcrypt');

function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


/**
 * Make user login from email and pass
 */
module.exports.doLogin = async (req, res) => {
   
    if(!req.body.email) return res.status(500).json({
        status: 'FAIL',
        message: 'E-mail do usuário não foi informado'
    });

    console.log('EMAIL: ', req.body.email)
    const email =  req.body.email.toLowerCase()
    console.log("trying")

    if (!email || email === 'undefined' || email === undefined) return res.status(400).json({
        status: 'FAIL',
        message: 'E-mail do usuário não foi informado'
    });

    if (!req.body.password || req.body.password === 'undefined' || req.body.password === undefined ) return res.status(400).json({
        status: 'FAIL',
        message: 'A senha do usuário não foi informada'
    });
    req.query.email = email.replace(/\s/g, '').toLowerCase()

    if (!emailIsValid(email)) return res.status(400).json({
        status: 'FAIL',
        message: 'O e-mail informado não é valido'
    });

    try {
        let user = await userService.listUserEmail(email)
        if(user === null)  return res.status(404).json({
            status: 'FAIL',
            message: 'Usuário não encontrado.'
        });

        let compare = bcrypt.compareSync(req.body.password, user.password)

        if (!compare) return res.status(401).json({
            status: 'FAIL',
            message: 'Usuário ou senha incorreta.'
        });

        let token = AUTH.sign(user, user.state)
        delete user.password
        return res.json({
            status: 'OK',
            token: token,
            user: user
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json(err);
    }

}




/**
 * Make user login from email and pass
 */
module.exports.facebookLogin = async (req, res) => {
   console.log("Facebook login controller")
   console.log(req.user)
    if (!req.user.email) return res.status(400).json({
        status: 'FAIL',
        message: 'E-mail do usuário não foi informado'
    });
   req.user.email = req.user.email.replace(/\s/g, '').toLowerCase()

    if (!emailIsValid(req.user.email)) return res.status(400).json({
        status: 'FAIL',
        message: 'O e-mail informado não é valido'
    });

    try {

        let token = AUTH.sign(req.user, req.user.state)
        return res.redirect(`/?token=${token}&email=${req.user.email}&user=${req.user.firstName}`);
        return res.json({
            status: 'OK',
            token: token
        });
    } catch (err) {
        return res.status(500).json(err);
    }

}

/**
 * RECOVER USER PASS
 */
module.exports.passwordRecover = async(req, res) => {

    try {
        // if(!req.param.users) return res.status(400).json({
        //     status: 'FAIL',
        //     message: 'Usuário não informado'
        //   });

        let n = await service.passwordRecover({
            to: '+5516992392556',
            body: 'Apenas um teste de mensagem'
        })

        return res.json({
            status: 'OK',
            message: n
        });
    } catch (err) {
        return res.status(500).json(err);
    }
}


/**
 * RECOVER USER PASS
 */
module.exports.sendMail = async(req, res) => {

    try {
        // if(!req.param.users) return res.status(400).json({
        //     status: 'FAIL',
        //     message: 'Usuário não informado'
        //   });

        let n = await service.sendMail({
            to: '+55992392556',
            body: 'Apenas um teste de mensagem'
        })

        return res.json({
            status: 'OK',
            message: n
        });
    } catch (err) {
        return res.status(500).json(err);
    }
}


module.exports.autoLogin = async (userEmail, userPassword) => {
    let email =  userEmail.toLowerCase();
    const password = userPassword;

    if (!email || email === 'undefined' || email === undefined) return res.status(400).json({
        status: 'FAIL',
        message: 'E-mail do usuário não foi informado'
    });

    if (!password || password === 'undefined' || password === undefined ) return res.status(400).json({
        status: 'FAIL',
        message: 'a senha do usuário não foi informada'
    });

    if (!emailIsValid(email)) return res.status(400).json({
        status: 'FAIL',
        message: 'O e-mail informado não é valido'
    });

    try {
        let user = await userService.listUserEmail(email)
        if(user === null)  return res.status(404).json({
            status: 'FAIL',
            message: 'Usuário não encontrado.'
        });

        let compare = bcrypt.compareSync(password, user.password)

        if (!compare) return res.status(401).json({
            status: 'FAIL',
            message: 'Usuário ou senha incorreta.'
        });

        let token = AUTH.sign(user, user.state)
        delete user.password
        return res.json({
            status: 'OK',
            token: token,
            user: user
        });
    } catch (err) {

        return res.status(500).json(err);
    }

}
