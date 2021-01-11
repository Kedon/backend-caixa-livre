'use strict'
const moment = require('moment');
const uuidv1 = require('uuid/v1');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')

module.exports.inserir = (nome, descricao, id_condominio) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO areas_comuns (nome, descricao, data_cadastro, id_condominio) VALUES (:nome, :descricao, :data_cadastro, :id_condominio)', {
                replacements: {
                    nome,
                    id_condominio,
                    data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss'),
                    descricao: descricao ? descricao : null
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao registrar área comum.'
                });

            return resolve({
                status: 'OK',
                message: 'Área comum registrada com sucesso.',
                data: {
                    area: nome
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}

module.exports.atualizar = (id, nome, descricao) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE areas_comuns SET nome = :nome, descricao = :descricao WHERE id = :id', {
                replacements: {
                    id,
                    nome,
                    descricao: descricao ? descricao : null
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar área comum.'
                });

            return resolve({
                status: 'OK',
                message: 'Área comum atualizada com sucesso.',
                data: {
                    area: id
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}


module.exports.reservar = (data_inicial, data_final,hora_inicial, hora_final,id_area_comum, id_usuario, id_condominio, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query(
                `INSERT INTO reservas_areas_comuns (data_inicial, data_final,hora_inicial, hora_final,id_area_comum, id_usuario, data_cadastro, id_condominio, status) VALUES (:data_inicial, :data_final, :hora_inicial, :hora_final, :id_area_comum, :id_usuario, :data_cadastro, :id_condominio, :status)`, {
                replacements: {
                    data_inicial,
                    id_condominio,
                    hora_inicial,
                    hora_final,
                    id_area_comum,
                    id_usuario,
                    data_cadastro: moment().format('YYYY-MM-DD HH:mm:ss'),
                    data_final: data_final ? data_final : null,
                    status: status ? status : "ALUGADO"
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao registrar área comum.'
                });

            return resolve({
                status: 'OK',
                message: 'Área comum reservada com sucesso.',
                data: {
                    data_inicial: data_inicial,
                    data_final: data_final,
                    hora_inicial: hora_inicial,
                    hora_final: hora_final
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}

module.exports.emailEmUso = (email, idUsuario) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM usuarios WHERE email IS NOT NULL AND email = :email LIMIT 1', {
                replacements: {
                    email
                }
            });

            // Quando for atualização de e-mail usuário, o idUsuario estará igual ao rows[0].idUsuario.
            // Quando for um cliente novo, o idUsuario sempre será diferente de rows[0].idUsuario.
            if (rows && rows.length > 0 && rows[0].idUsuario != idUsuario)
                return resolve({
                    status: 'FAIL',
                    message: 'O e-mail informado já está em uso.'
                });

            return resolve({
                status: 'OK',
                message: 'E-mail está disponível.'
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}

module.exports.autenticar = (email, senha) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM usuarios WHERE email = :email AND senha = :senha LIMIT 1', {
                replacements: {
                    email,
                    senha: crypto.createHash('md5').update(senha).digest("hex")
                }
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'O e-mail e/ou a senha estão incorretas.'
                });

            let usuario = rows[0];
            delete usuario.senha;

            let token = AUTH.sign(usuario, usuario.acesso);

            return resolve({
                status: 'OK',
                message: 'Dados encontrados.',
                data: {
                    usuario,
                    token
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}

module.exports.alterarSenha = (idUsuario, senha) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE usuarios SET senha = :senha WHERE idUsuario = :idUsuario', {
                replacements: {
                    idUsuario,
                    senha: crypto.createHash('md5').update(senha).digest("hex")
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao alterar senha.'
                });

            return resolve({
                status: 'OK',
                message: 'Senha alterada com sucesso.',
                data: {
                    idUsuario: idUsuario
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}


module.exports.listar = (id_condominio) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM areas_comuns WHERE id_condominio= :id_condominio ORDER BY nome ASC', {
                replacements: {
                    id_condominio
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Áreas não encontradas.',
                    data: {
                        areas: []
                    }
                });

             let areas = rows.map((r) => {
                // delete r.senha;
                return r;
            }); 

            return resolve({
                status: 'OK',
                message: 'Áreas encontradas.',
                data: {
                    areas
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}

module.exports.listarArea = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM areas_comuns WHERE id= :id LIMIT 1', {
                replacements: {
                    id
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Área não encontrada.',
                    data: {
                        area: []
                    }
                });

             let area = rows.map((r) => {
                // delete r.senha;
                return r;
            });

            return resolve({
                status: 'OK',
                message: 'Área encontrada.',
                data: {
                    area
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}

module.exports.listarReservas = (id_condominio, id_area_comum, id_usuario, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `select *from reservas_areas_comuns`;
        let replacements = {};

        if (id_condominio) {
            sql += ' WHERE id_condominio = :id_condominio';
            replacements.id_condominio = id_condominio;
        }
        if (id_area_comum) {
            sql +=  ' AND  id_area_comum = :id_area_comum';
            replacements.id_area_comum = id_area_comum;
        }
        if (id_usuario) {
            sql +=  ' AND  id_usuario = :id_usuario';
            replacements.id_usuario = id_usuario;
        }
        if (status) {
            sql +=  ' AND  status = :status';
            replacements.status = status;
        }
        
        let [rows, metadata] = await database.query(sql, {
            replacements
        });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Reservas não encontradas.',
                    data: {
                        cliente: []
                    }
                });

             let areas = rows.map((r) => {
                // delete r.senha;
                return r;
            });

            return resolve({
                status: 'OK',
                message: 'Reservas encontradas',
                data: {
                    areas
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}


module.exports.listarReserva = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM reservas_areas_comuns WHERE id= :id LIMIT 1', {
                replacements: {
                    id
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Reserva não encontrada.',
                    data: {
                        reserva: []
                    }
                });

             let reserva = rows.map((r) => {
                // delete r.senha;
                return r;
            });

            return resolve({
                status: 'OK',
                message: 'Reserva encontrada.',
                data: {
                    reserva
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}