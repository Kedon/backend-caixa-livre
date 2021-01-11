'use strict'

const uuidv1 = require('uuid/v1');
const moment = require('moment');
const crypto = require('crypto');
const LOGS = require('../shared').LOGS;
const AUTH = require('../shared').AUTH;
const database = require('../database/database')


/** Encript user password */
const bcrypt = require('bcrypt');
const saltRounds = 10;


module.exports.getPartner = (partnerId) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('SELECT * FROM users WHERE userId = :partnerId LIMIT 1', {
                replacements: {
                    partnerId
                }
            });

            // Quando for atualização de e-mail usuário, o idUsuario estará igual ao rows[0].idUsuario.
            // Quando for um cliente novo, o idUsuario sempre será diferente de rows[0].idUsuario.

            if (rows && rows.length === 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Parceiro não encontrado.',
                });

            if (!rows || rows.length <= 0) {
                return resolve(null);
            }

            return resolve( {
                    data: rows
                }
            );
        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}

module.exports.findUser = (userDocument) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('SELECT * FROM users WHERE userDocument= :userDocument LIMIT 1', {
                replacements: {
                    userDocument
                }
            });

            // Quando for atualização de e-mail usuário, o idUsuario estará igual ao rows[0].idUsuario.
            // Quando for um cliente novo, o idUsuario sempre será diferente de rows[0].idUsuario.

            if (rows && rows.length > 0)
                return resolve(false);


            return resolve(true);
        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}



/**
 * CREATE NEW USER
 */

module.exports.createUser = (firstName, email, password, birthDate, genre, ageRange, looking, distance, type) => {
    let userId = uuidv1();
    let code = Math.random().toString(36).substr(2, 8);
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO users (userId, code, firstName, email, password, birthDate, genre, ageRange, looking, distance, type ) VALUES (:userId, :code, :firstName, :email, :password, :birthDate, :genre, :ageRange, :looking, :distance, :type )', {
                replacements: {
                    userId,
                    code,
                    firstName,
                    email,
                    password: password ? bcrypt.hashSync(password, saltRounds): null,
                    birthDate,
                    genre,
                    ageRange,
                    looking,
                    distance,
                    type: type,
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao registrar usuário.'
                });
            return resolve({
                status: 'OK',
                message: 'Usuário registrado com sucesso.',
                userId: userId
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}


/**
 * UPDATE A USER
 */
module.exports.updateUser = (userId, firstName, lastName, email, birthDate, genre, state, displayName, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE users SET firstName = :firstName, lastName = :lastName, email = :email, birthDate = :birthDate , genre =:genre, state =:state, displayName = :displayName, password = :password WHERE userId = :userId', {
                replacements: {
                    userId,
                    firstName,
                    email,
                    state,
                    genre: genre? genre : null,
                    birthDate: birthDate? birthDate: null,
                    lastName: lastName ? lastName : null,
                    displayName: displayName ? displayName : null,
                    password: password ? bcrypt.hashSync(password, saltRounds): null
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar usuário.'
                });

            return resolve({
                status: 'OK',
                message: 'Usuário atualizado com sucesso.',
                data: {
                    usuario: firstName +' '+lastName
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



/**
 * UPDATE A USER STATE
 */
module.exports.changePass = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('UPDATE users SET password =:password  WHERE email = :email', {
                replacements: {
                    email,
                    password: password ? bcrypt.hashSync(password, saltRounds): null,
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar senha.'
                });

            return resolve({
                status: 'OK',
                message: 'Senha alterada com sucesso',
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

/**
 * UPDATE A USER STATE
 */
module.exports.changeUserStatus = (userId, state) => {
    return new Promise(async (resolve, reject) => {
        console.log(state)
        try {
            let [rows, metadata] = await database.query('UPDATE users SET state =:state  WHERE userId = :userId', {
                replacements: {
                    userId,
                    state
                }
            });
            console.log(rows)

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao atualizar usuário.'
                });

            return resolve({
                status: 'OK',
                message: 'Usuário atualizado com sucesso.',
                data: {
                    state: state
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
/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.listUsers = (userId,createdStart, createdEnd,  birthDateStart, birthDateEnd, state, companyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT *FROM users WHERE 1 =1`;
            let order = ' ORDER BY users.firstName, users.lastName ASC';
            let replacements = {};
            console.log(userId)
            if (userId && userId !== null) {
                sql += ` AND users.userId = :userId`;
                replacements.userId = userId;
            }
            if( createdStart && createdEnd && createdStart !== null && createdEnd !== null) {
                sql += ` AND users.createAt BETWEEN :createdStart AND :createdEnd`;
                replacements.createdStart = createdStart;
                replacements.createdEnd = createdEnd;
            }
            if( birthDateStart && birthDateEnd && birthDateStart !== null && birthDateEnd !== null) {
                sql += ` AND users.createAt BETWEEN :birthDateStart AND :birthDateEnd`;
                replacements.birthDateStart = birthDateStart;
                replacements.birthDateEnd = birthDateEnd;
            }

            if(state && state !== null && state !== undefined) {
                sql += ` AND users.state = :state`;
                replacements.state = state
            }

            if(companyId && companyId !== null && companyId !== undefined) {
                sql += ` AND users.companyId = :companyId`;
                replacements.companyId = companyId
            }


            sql += order;
            let [rows, metadata] = await database.query(sql, {
                replacements
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Usuários não localizados.',
                    data: {
                        usuarios: []
                    }
                });

            let usuarios = rows.map((r) => {
                delete r.password;
                return r;
            })

            return resolve({
                status: 'OK',
                message: 'Usuários localizados.',
                data: {
                    usuarios
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
/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.listUserEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('SELECT * FROM users WHERE email IS NOT NULL AND email = :email LIMIT 1', {
                replacements: {
                    email
                }
            });

            // Quando for atualização de e-mail usuário, o idUsuario estará igual ao rows[0].idUsuario.
            // Quando for um cliente novo, o idUsuario sempre será diferente de rows[0].idUsuario.

            if (rows && rows.length > 0 && rows[0].email != email)
                return resolve({
                    status: 'FAIL',
                    message: 'O e-mail informado já está em uso.',
                    code:''
                });

            if (!rows || rows.length <= 0) {
                return resolve(null);
            }

            return resolve( {
                    email: rows[0].email,
                    userId: rows[0].userId,
                    firstName: rows[0].firstName,
                    lastName: rows[0].lastName,
                    password: rows[0].password,
                    socialID: rows[0].state,
                    displayName: rows[0].displayName,
                    socialMedia: rows[0].socialMedia,
                    looking: rows[0].looking,
                    state:  rows[0].state,
                    type:  rows[0].type,
                    companyId:  rows[0].companyId
                }
            );
        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}


/**
 * Get user data
 */
module.exports.showUserByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('SELECT * FROM users WHERE email IS NOT NULL AND email = :email LIMIT 1', {
                replacements: {
                    email
                }
            });

            // Quando for atualização de e-mail usuário, o idUsuario estará igual ao rows[0].idUsuario.
            // Quando for um cliente novo, o idUsuario sempre será diferente de rows[0].idUsuario.

            if (rows && rows.length > 0 && rows[0].email != email)
                return resolve({
                    email: rows[0].email,
                    firstName: rows[0].firstName,
                    message: 'O e-mail informado já está em uso.',
                    code:''
                });

            if (!rows || rows.length <= 0) {
                return resolve(null);
            }

            return resolve( {
                    email: rows[0].email,
                    userId: rows[0].userId,
                    firstName: rows[0].firstName,
                    lastName: rows[0].lastName,
                    password: rows[0].password,
                    socialID: rows[0].state,
                    displayName: rows[0].displayName,
                    socialMedia: rows[0].socialMedia,
                    looking: rows[0].looking,
                    state:  rows[0].state,
                    type:  rows[0].type,
                    companyId:  rows[0].companyId
                }
            );
        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}
/**
 * SAVE HOBBIES FOR USER
 */
module.exports.saveHobbies = (hobbiesList) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO userHobbies (userId, hobbieId) VALUES :hobbiesList', {
                replacements: {
                    hobbiesList
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao salvar hobbies do usuário'
                });

            return resolve({
                status: 'OK',
                message: 'Hobbies salvos com sucesso.',
                data: {
                    userHobbies: rows
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}



/**
 * LIST HOBBIES OF USER
 */
module.exports.listUserHobbies = (userId) => {

    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('SELECT hobbies.hobbieId, hobbies.hobbieName FROM userHobbies LEFT JOIN hobbies ON  userHobbies.hobbieId = hobbies.hobbieId  WHERE userId =:userId;', {
                replacements: {
                    userId
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao buscar hobbies do usuário.'
                });

            return resolve({
                status: 'OK',
                message: 'Hobbies localizados com sucesso',
                data: {
                    hobbies: rows
                }
            })

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}


/**
 * REMOVE USER HOBBIES NOT IN HOBBIE LIST
 */
module.exports.removeUserHobbies = (userId, hobbiesList) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('DELETE FROM userHobbies WHERE userId =:userId AND hobbieId IN (:hobbiesList)', {
                replacements: {
                    userId,
                    hobbiesList
                }
            });

            if (!metadata)
            return resolve({
                status: 'FAIL',
                message: 'Falha ao excluir hobbie.'
            });

        return resolve({
            status: 'OK',
            message: 'Hobbie excluido com sucesso.',
            data: {
                hobbie: userId
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



/**
 * REMOVE USER HOBBIES NOT IN HOBBIE LIST
 */
module.exports.removeUserImages = (userId, imagesList) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('DELETE FROM userPhotos WHERE userId =:userId AND photoId IN (:imagesList)', {
                replacements: {
                    userId,
                    imagesList
                }
            });

            if (!metadata)
            return resolve({
                status: 'FAIL',
                message: 'Falha ao excluir imagens.'
            });

        return resolve({
            status: 'OK',
            message: 'Imagens excluídas com sucesso.',
            data: {
                hobbie: userId
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



/**
 * REMOVE USER HOBBIES NOT IN HOBBIE LIST
 */
module.exports.removeUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('DELETE FROM users WHERE userId =:userId', {
                replacements: {
                    userId
                }
            });

            if (!metadata)
            return resolve({
                status: 'FAIL',
                message: 'Falha ao excluir usuário.'
            });

        return resolve({
            status: 'OK',
            message: 'Usuário excluido com sucesso.',
            data: {
                userId: userId
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

/**
 * REMOVE USER HOBBIES NOT IN HOBBIE LIST
 */
module.exports.removeAllUserHobbies = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('DELETE FROM userHobbies WHERE userId =:userId ', {
                replacements: {
                    userId
                }
            });

            if (!metadata)
            return resolve({
                status: 'FAIL',
                message: 'Falha ao excluir hobbie.'
            });

        return resolve({
            status: 'OK',
            message: 'Hobbie excluido com sucesso.',
            data: {
                hobbie: userId
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


/**
 * SAVE USER IMAGE UPLOAD
 */
module.exports.saveUserImage = (userId, photoUrl, photoType, photoName, photoDescription) => {
    let photoId = uuidv1();
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO userPhotos (userId, photoId, photoUrl, photoName, photoType, photoDescription) VALUES (:userId, :photoId, :photoUrl, :photoName, :photoType, :photoDescription)', {
                replacements: {
                    userId,
                    photoId,
                    photoUrl,
                    photoType,
                    photoName,
                    photoDescription: photoDescription? photoDescription : null
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao salvar imagem no banco'
                });

            return resolve({
                status: 'OK',
                message: 'Imagem salva com sucesso',
                data: {
                    image: rows
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}

/**
 * LIST IMAGES BY USER ID
 */
module.exports.listImages = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT *FROM userPhotos WHERE 1 =1`;
            // let order = ' ORDER BY userPhotos.sequence, userPhotos.createAt';
            let order = ' ORDER BY userPhotos.createAt';
            let replacements = {};
            console.log(userId)
            if (userId && userId !== null) {
                sql += ` AND userPhotos.userId = :userId`;
                replacements.userId = userId;
            }
            sql += order;
            let [rows, metadata] = await database.query(sql, {
                replacements
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Imagens deste usuário não foram localizadas.',
                    data: {
                        photos: []
                    }
                });

            let photos = rows.map((r) => {
                delete r.password;
                return r;
            })

            return resolve({
                status: 'OK',
                message: 'Imagens localizadas.',
                data: {
                    photos: photos
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

/**
 * REMOVE USER HOBBIES NOT IN HOBBIE LIST
 */
module.exports.listUser = (userId) => {
    console.log(userId)
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('SELECT * FROM users WHERE userId =:userId limit 1', {
                replacements: {
                    userId
                }
            });

            if (!metadata)
            return resolve({
                status: 'FAIL',
                message: 'Falha ao buscar usuário.'
            });
            const users = rows.map(user => ({
                "userId": user.userId,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "displayName": user.displayName,
                "email": user.email,
                "socialID": user.socialID,
                "code": user.code,
                "socialMedia": user.socialMedia,
                "birthDate": user.birthDate,
                "genre": user.genre,
                "createAt": user.createAt,
                "updateAT": user.updateAT,
                "state": user.state
            }))

        return resolve({
            status: 'OK',
            message: 'Usuário encontrado',
            data: {
                user: users[0]
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

module.exports.listUserByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('SELECT * FROM users WHERE email =:email limit 1', {
                replacements: {
                    email
                }
            });

            if (!metadata || metadata.length <=0 ) {

                return reject({
                    status: 'FAIL',
                    message: 'Falha ao buscar usuário.'
                });
            }



            const users = rows.map(user => ({
                "userId": user.userId,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "displayName": user.displayName,
                "email": user.email,
                "socialID": user.socialID,
                "code": user.code,
                "socialMedia": user.socialMedia,
                "birthDate": user.birthDate,
                "genre": user.genre,
                "createAt": user.createAt,
                "updateAT": user.updateAT,
                "state": user.state
            }))

        return resolve({
            status: 'OK',
            message: 'Usuário encontrado',
            data: {
                user: users[0]
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



/**
 * LIST USER BY SHARE CODE
 */
module.exports.listUserByShareCode = (code) => {
    return new Promise(async (resolve, reject) => {
        try {

            let [rows, metadata] = await database.query('SELECT * FROM users WHERE code =:code limit 1', {
                replacements: {
                    code
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({});

            let user = rows.map((r) => {
                return {
                    firstName: r.firstName,
                    lastName: r.lastName,
                    code: r.code
                }
            })

            return resolve(user[0]);

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: 'Falha interna.'
            });
        }
    });
}


module.exports.inserirUsuarioCondominio = (id_usuario, id_condominio) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO usuario_condominio (id_usuario, id_condominio) VALUES (:id_usuario, :id_condominio)', {
                replacements: {
                    id_usuario,
                    id_condominio
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao adicionar usuário no condomínio.'
                });

            return resolve({
                status: 'OK',
                message: 'Usuário adicionado no condomínio com sucesso.',
                data: {
                    condominio: id_condominio
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

module.exports.listar = (perfil, condominio, administradora) => {
    return new Promise(async (resolve, reject) => {
        try {
            // let [rows, metadata] = await database.query('SELECT * FROM usuarios', {});
            let sql = `SELECT *FROM clientes`;
            let order = ' ORDER BY clientes.nome, clientes.sobrenome ASC';
            let replacements = {};

            if (perfil && perfil !== null) {
                sql += ((perfil || administradora) ? ' AND ' : ' WHERE ') + 'usuarios.perfil = :perfil';
                replacements.perfil = perfil;
            }
            if (condominio) {
                sql +=  ((perfil || administradora) ? ' AND ' : ' WHERE ') + 'condominios.id = :condominio';
                replacements.condominio = condominio;
            }
            if (administradora) {
                sql +=  ((perfil || administradora) ? ' AND ' : ' WHERE ') + ' condominios.id_administradora = :administradora';
                replacements.administradora = administradora;
            }

            sql += order;
            let [rows, metadata] = await database.query(sql, {
                replacements
            });
            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'WARN',
                    message: 'Usuários não localizados.',
                    data: {
                        usuarios: []
                    }
                });

            let usuarios = rows.map((r) => {
                delete r.senha;
                return r;
            })

            return resolve({
                status: 'OK',
                message: 'Usuários localizados.',
                data: {
                    usuarios
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

module.exports.listarUsuario = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('SELECT * FROM usuarios WHERE id= :id LIMIT 1', {
                replacements: {
                    id
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Usuário não encontrado.',
                    data: {
                        cliente: []
                    }
                });

            let usuario = rows.map((r) => {
                delete r.senha;
                return r;
            });

            return resolve({
                status: 'OK',
                message: 'Usuário encontrado.',
                data: {
                    usuario
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

module.exports.inserirUsuarioCondominio = (id_usuario, id_condominio) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO usuario_condominio (id_usuario, id_condominio) VALUES (:id_usuario, :id_condominio)', {
                replacements: {
                    id_usuario,
                    id_condominio,
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao registrar usuário.'
                });

            return resolve({
                status: 'OK',
                message: 'Usuário registrado com sucesso.',
                data: {
                    id: id_usuario
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






/**
 * CREATE NEW USER
 */
module.exports.shareCode = (sender, receiver) => {
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO shareCode (sender, receiver) VALUES (:sender, :receiver)', {
                replacements: {
                    sender,
                    receiver
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao gravar código de compartilhamento!'
                });

            return resolve({
                ...rows
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}

module.exports.getUserPreferences = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT
                        userId,
                        firstName,
                        looking,
                        distance,
                        CASE WHEN FIND_IN_SET('MALE', looking) > 0 THEN true ELSE false END as MALE,
                        CASE WHEN FIND_IN_SET('FEMALE', looking) > 0 THEN true ELSE false END as FEMALE,
                        CASE WHEN genre = 'male' THEN 'female' ELSE 'MALE' END as lookingDefault,
                        SUBSTRING_INDEX(ageRange, ',', 1) AS minAge,
                        SUBSTRING_INDEX( SUBSTRING_INDEX( ageRange, ',', 2 ), ',', -1 ) AS maxAge
                        FROM users
                        WHERE userId = :userId`;
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                    userId
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Usuário não encontrado.',
                    data: {
                        cliente: []
                    }
                });

            return resolve({
                status: 'OK',
                message: 'Usuário encontrado.',
                data: rows
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

module.exports.putUserPreferences = (userId, params) => {
    const {looking, ageRange, distance} = params;
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `UPDATE users SET looking = :looking, ageRange = :ageRange, distance = :distance, updateAT = NOW() WHERE userId = :userId`;
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                  looking,
                  ageRange,
                  distance,
                  userId
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Usuário não encontrado.',
                });

            return resolve({
                status: 'OK',
                message: 'Preferências do usuário atualizadas com sucesso.',
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

module.exports.getUserConfigurations = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT
                        firstName,
                        genre,
                        DATE(birthDate) AS birthDate,
                        email,
                        occupation,
                        description,
                        visibility
                        FROM users
                        WHERE userId = :userId`;
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                    userId
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Usuário não encontrado.',
                    data: {
                        cliente: []
                    }
                });

            return resolve({
                status: 'OK',
                message: 'Usuário encontrado.',
                data: rows
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

module.exports.putUserConfigurations = (userId, params) => {
    const { firstName, genre, birthDate, email, occupation, description, visibility, stopNotification } = params;
    return new Promise(async (resolve, reject) => {
        try {

            let sql = `UPDATE users SET
                          firstName = :firstName,
                          genre = :genre,
                          birthDate = :birthDate,
                          email = :email,
                          occupation = :occupation,
                          description = :description,
                          visibility = :visibility,
                          updateAT = NOW(),
                          stopNotification = :stopNotification
                          WHERE userId = :userId`;
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                  firstName,
                  genre,
                  birthDate,
                  email,
                  occupation,
                  description,
                  visibility,
                  stopNotification,
                  userId
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Usuário não encontrado.',
                });

            return resolve({
                status: 'OK',
                message: 'Configuraões do usuário atualizadas com sucesso.',
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

module.exports.userDetails = (loggedUser, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT JSON_OBJECT(
                      'photoId', u.userId,
                      'firstName', u.firstName,
                      'displayName', u.displayName,
                      'birthDate', u.birthDate,
                      'genre', u.genre,
                      'occupation', u.occupation,
                      'description', u.description,
                      'looking', u.looking,
                      'visibility', u.visibility,
                      'photos', (SELECT JSON_ARRAYAGG(JSON_OBJECT('photoUrl', photoUrl, 'photoId', photoId)) FROM userPhotos WHERE userId = u.userId),
                      'hobbies', (SELECT JSON_ARRAYAGG(JSON_OBJECT('hobbieId', hobbieId, 'hobbieName', hobbieName)) FROM hobbies WHERE hobbieId IN (SELECT hobbieId FROM userHobbies WHERE userId = u.userId)),
                      'location', (SELECT JSON_ARRAYAGG(JSON_OBJECT('latitude', latitude, 'longitude', longitude, 'city', city, 'near', near, 'state', state, "distance", ST_Distance_Sphere(point(latitude, longitude),point(logged.latitude, logged.longitude))/1000)) FROM userLocation WHERE userId = u.userId),
                    	'medRating', JSON_OBJECT(
                                      "preRating", JSON_OBJECT("votes", medPre.preVotes, "medScore", medPre.preScore),
                                      "posRating", JSON_OBJECT("votes", medPos.posVotes, "medScore", medPos.posScore)
                                    )

                    ) AS data
                    FROM users u
                    LEFT JOIN (SELECT AVG(score) as preScore, COUNT(score) as preVotes, userId FROM userPreMatch GROUP BY userId) as medPre ON (u.userId = medPre.userId)
                    LEFT JOIN (SELECT AVG(score) as posScore, COUNT(score) as posVotes, userId FROM userPosMatch GROUP BY userId) as medPos ON (u.userId = medPos.userId)
                    LEFT JOIN (SELECT latitude, longitude FROM userLocation WHERE userId = :loggedUser) as logged ON (1=1)
                    WHERE u.userId = :userId`;
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                    loggedUser,
                    userId
                }
            });

            if (!rows || rows.length <= 0)
                return resolve({
                    status: 'FAIL',
                    message: 'Usuário não encontrado.',
                    data: {
                        cliente: []
                    }
                });
                console.log(rows)
            return resolve({
                status: 'OK',
                message: 'Usuário encontrado.',
                data: rows
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

module.exports.getLoggedInfo = (userId) => {
    console.log(userId)
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `SELECT JSON_OBJECT(
                'userId', u.userId,
                'firstName', u.firstName,
                'displayName', u.displayName,
                'birthDate', u.birthDate,
                'genre', u.genre,
                'occupation', u.occupation,
                'description', u.description,
                'looking', u.looking,
                'distance', u.distance,
                'ageRange', u.ageRange,
                'visibility', u.visibility,
                'location', (SELECT JSON_ARRAYAGG(JSON_OBJECT('latitude', latitude, 'longitude', longitude, 'district', district, 'city', city, 'state', state, 'near', near)) FROM userLocation WHERE userId = u.userId),
                'photos', (SELECT JSON_ARRAYAGG(JSON_OBJECT('photoUrl', photoUrl, 'photoId', photoId)) FROM userPhotos WHERE userId = u.userId AND photoType IS NULL),
                'cover', (SELECT JSON_OBJECT('photoUrl', photoUrl, 'photoId', photoId) FROM userPhotos WHERE userId = u.userId AND photoType = 'cover' LIMIT 1),
                'hobbies', (SELECT JSON_ARRAYAGG(JSON_OBJECT('hobbieId', hobbieId, 'hobbieName', hobbieName)) FROM hobbies WHERE hobbieId IN (SELECT hobbieId FROM userHobbies WHERE userId = u.userId)),
              	'medRating', JSON_OBJECT(
                                "preRating", JSON_OBJECT("votes", medPre.preVotes, "medScore", medPre.preScore),
                                "posRating", JSON_OBJECT("votes", medPos.posVotes, "medScore", medPos.posScore)
                              ),
              	'packages', JSON_OBJECT(
                                "start", package.packageStart,
                                "end", package.packageEnd,
                                "level", level.level
                              )

              ) AS data
              FROM users u
              LEFT JOIN (SELECT AVG(score) as preScore, COUNT(score) as preVotes, userId FROM userPreMatch GROUP BY userId) as medPre ON (u.userId = medPre.userId)
              LEFT JOIN (SELECT min(packageStart) as packageStart, max(packageEnd) as packageEnd, userId FROM userPackages WHERE (DATE(packageStart) <= NOW() AND DATE(packageEnd) >= NOW()) AND status='approved' GROUP BY userId) as package ON (u.userId = package.userId)
              LEFT JOIN (SELECT max(level) as level, userId FROM userPackages WHERE (DATE(packageStart) <= NOW() AND DATE(packageEnd) >= NOW()) AND status='approved' GROUP BY userId) as level ON (u.userId = level.userId)
              LEFT JOIN (SELECT AVG(score) as posScore, COUNT(score) as posVotes, userId FROM userPosMatch GROUP BY userId) as medPos ON (u.userId = medPos.userId)
              WHERE u.userId = :userId`;
            let [rows, metadata] = await database.query(sql, {
                replacements: {
                    userId
                }
            });

            if (!metadata)
            return resolve({
                status: 'FAIL',
                message: 'Falha ao buscar usuário.'
            });
        return resolve({
            status: 'OK',
            message: 'Usuário encontrado',
            data: rows
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

/**
 * SAVE USER IMAGE UPLOAD
 */
module.exports.changePhoto = (userId, photoUrl, bucket, key, photoType, photoOrder) => {
    let photoId = uuidv1();
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO userPhotos (userId, photoId, photoUrl, bucket, `key`, photoType, photoOrder) VALUES (:userId, :photoId, :photoUrl, :bucket, :key, :photoType, :photoOrder)', {
                replacements: {
                    userId,
                    photoId,
                    photoUrl,
                    bucket,
                    key,
                    photoType,
                    photoOrder
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao salvar imagem no banco'
                });

            return resolve({
                status: 'OK',
                message: 'Imagem salva com sucesso',
                data: {
                  photoId: photoId,
                  photoUrl: photoUrl
                }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}


/**
 * SELECT OLD IMAGE UPLOAD
 */
 module.exports.oldPhoto = (photoId, userId) => {
   console.log(photoId);
      console.log(userId);

     return new Promise(async (resolve, reject) => {
         try {

             let [rows, metadata] = await database.query('SELECT * FROM userPhotos WHERE photoId = :photoId AND userId = :userId', {
                 replacements: {
                     photoId,
                     userId
                 }
             });
             if (!rows || rows.length <= 0)
                 return resolve({
                     status: 'None',
                     message: 'Não há uma foto com a id informada',
                 });
             return resolve(rows[0]);

         } catch (err) {
             LOGS.logError(err);
             return reject({
                 status: 'ERROR',
                 message: 'Falha interna.'
             });
         }
     });
 }

 /**
  * DELETE OLD IMAGE UPLOAD
  */
  module.exports.deletePhoto = (photoId, userId) => {
      return new Promise(async (resolve, reject) => {
          try {

              let [rows, metadata] = await database.query('DELETE FROM userPhotos WHERE photoId = :photoId AND userId = :userId', {
                  replacements: {
                      photoId,
                      userId
                  }
              });
              if (metadata.affectedRows == 0) {
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao excluir arquivo.'
                });

              } else {
                return resolve({
                    status: 'OK',
                    message: 'Arquivo excluido com sucesso.',
                });
              }
          } catch (err) {
              LOGS.logError(err);
              return reject({
                  status: 'ERROR',
                  message: 'Falha interna.'
              });
          }
      });
  }

  /**
   * SELECT OLD IMAGE UPLOAD
   */
   module.exports.userPhotos = (userId) => {
     const photoType = 'cover';
       return new Promise(async (resolve, reject) => {
           try {

               let [rows, metadata] = await database.query('SELECT photoId, photoUrl FROM userPhotos WHERE userId = :userId AND photoType <> :photoType ORDER BY photoOrder ASC', {
                   replacements: {
                       userId,
                      photoType
                   }
               });
               if (!rows || rows.length <= 0)
                   return resolve({
                       status: 'None',
                       message: 'Usuário não possui fotos',
                   });
               return resolve({
                 status: 'OK',
                 message: `Usuário possui ${rows.length} fotos`,
                 data: rows
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

   module.exports.userContacts = (contactId, senderUserId, receiverUserId) => {
    const createAt = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log('SALVAR')
    return new Promise(async (resolve, reject) => {
        try {
            let [rows, metadata] = await database.query('INSERT INTO userContacts (contactId, senderUserId, receiverUserId, createAt) VALUES (:contactId, :senderUserId, :receiverUserId, :createAt)', {
                replacements: {
                    contactId, senderUserId, receiverUserId, createAt
                }
            });

            if (!metadata)
                return resolve({
                    status: 'FAIL',
                    message: 'Falha ao salvar lista de contatos'
                });

            return resolve({
                status: 'OK',
                message: 'Contato salvo com sucesso',
                data: { contactId, senderUserId, receiverUserId }
            });

        } catch (err) {
            LOGS.logError(err);
            return reject({
                status: 'ERROR',
                message: `Falha interna. \n ${err.errors[0].message} \n type: ${err.errors[0].type} \n value: ${err.errors[0].value}`
            });
        }
    });
}

