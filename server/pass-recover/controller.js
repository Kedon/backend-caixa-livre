'use strict';
const AUTH = require('../shared').AUTH;
const service = require('./service');
const userService = require('../users/service')
const passRecoverService = require('../pass-recover/service')
const sender = require('../../server/helpers/sendmail/sendgrid')
const formatHTML = require('./html/formatHTML')


/** to compare user pass */
const bcrypt = require('bcrypt');

function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


/**
 * Make user login from email and pass
 */
module.exports.passwordRecover = async (req, res) => {
    const { email } = req.body
    

    if (!email || email === 'undefined' || email === undefined) return res.status(400).json({
        status: 'FAIL',
        message: 'Email para recuperação não informado'
    });
    req.query.email = email.replace(/\s/g, '').toLowerCase()

    if (!emailIsValid(email)) return res.status(400).json({
        status: 'FAIL',
        message: 'O e-mail informado não é valido'
    });

    try {
        let generatedPass = ''
        let user = await userService.showUserByEmail(email)

        if (user === null) return res.status(400).json({
            status: 'Fail',
            message: 'Por favor, verifique seu e-mail e tente novamente'
        });

        let passVerify = await passRecoverService.verifyPass(email)

        if (passVerify && passVerify.email && passVerify.email !== '') {
            generatedPass = await passRecoverService.updatePass(email)
        } else {
            generatedPass = await passRecoverService.passwordRecover(email)
        }

        const replacementsVariables = {
            CODE: generatedPass.code,
            NAME: user.firstName,
        };
        let formatedHtml = await formatHTML.passRecover(replacementsVariables);
        const msg = {
            to: [user.email],
            from: 'aldenirsrv@gmail.com',
            subject: 'Password Reset (Shipper)',
            html: formatedHtml,
        }

        sender.sendEmail(msg)
        .then(data => res.status(200).json({
            status: 'Ok',
            message: 'Uma senha de recuperação foi gerada e enviada para o seu e-mail!',
            response: data
        }))
        .catch(err => 
            res.status(400).json({
                status: 'FAIL',
                message: 'Não foi possível enviar seu e-mail',
                err: err
            }))
        return 

    } catch (err) {

        return res.status(500).json(err);
    }

}
/**
 * Make user login from email and pass
 */
module.exports.confirmPass = async (req, res) => {
    const { email, code, password } = req.body
    if (!email || email === 'undefined' || email === undefined) return res.status(400).json({
        status: 'FAIL',
        message: 'Email para recuperação não informado'
    });
    req.query.email = email.replace(/\s/g, '').toLowerCase()

    if (!emailIsValid(email)) return res.status(400).json({
        status: 'FAIL',
        message: 'O e-mail informado não é valido'
    });

    if (!code || code === 'undefined' || code === undefined) return res.status(400).json({
        status: 'FAIL',
        message: 'Codigo não informado'
    });
    if (!password || password === 'undefined' || password === undefined) return res.status(400).json({
        status: 'FAIL',
        message: 'Você precisa informar a nova senha'
    });
    try {
        let user = await userService.showUserByEmail(email)

        if (user === null) return res.status(400).json({
            status: 'Ok',
            message: 'E-mail ou código incorreto! Verifique seu e-mail e confirme a senha que foi enviada'
        });

        let confirmPass = await passRecoverService.confirmPass(email, code)

        if (confirmPass) {
            let changePass = await userService.changePass(email, password)

            await (passRecoverService.removeCode(code))
            return res.status(201).json(changePass)
        } else {
            return res.status(403).json({
                status: 'FAIL',
                message: 'Email ou código incorreto',
            })
        }

        if (passVerify && passVerify.email && passVerify.email !== '') {
            let updatePass = await passRecoverService.updatePass(email)
            return res.status(200).json(updatePass)
        }
        let pass = await passRecoverService.passwordRecover(email)

        return res.status(200).json(pass)

    } catch (err) {

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

        return res.json({
            status: 'OK',
            token: token
        });
    } catch (err) {
        return res.status(500).json(err);
    }

}




