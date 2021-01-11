  'use strict';

const service = require('./service');
const uploadService = require('../uploads/service')
const upload = require('../helpers/amazon-s3-storage');
const login = require('../login/controller');

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


/**
 * CREATE NEW USER
 */
module.exports.createUser = async (req, res) => {
  const {userName, userGenre, userDocument, userEmail, partnerId} = req.body;

  //CRIA O USUÁRIO
  try {
    /*let user = await service.createUser(firstName, email, password, birthDate, genre, ageRange, looking, distance, type);
    if(user.userId){
      if(hobbies.length > 0){
        //ADICINOA HOBBIES

        let hobbiesToUser = await hobbies.map(hobbieUser => [user.userId, hobbieUser.hobbieId])
        let savedHobbies = await service.saveHobbies(hobbiesToUser)
      }
      if(photos.length > 0){
        //ADICIONA FOTOS
        photos.map(async photo => {
          let image = await upload.uploadBase64(photo.photo.uri, 'shipper-images/')
          //let result = await service.saveUserImage(req.params.userId, image.Location, 'no name', 'no description')
          let addPhotos = await service.changePhoto(user.userId, image.Location, image.Bucket, image.key, photo.photoType, photo.photoOrder)
          console.log('------------------------')
          console.log(image)
          console.log('------------------------')
        })

      }
      return res.json(user);

    } else {
      console.log('Falha ao criar usuario')
    }*/

    //VERIFICA A ID DO PARCEIRO
    const partner = await service.getPartner(partnerId)
    if(partner && partner.data[0] && partner.data[0].userId && !partner.data[0].partnerId){
      console.log('parceiro encontrado')
    } else {
      console.log('parceiro NÃO encontrado')
    }
    //VERIFICA SE O USUÁRIO JÁ ESTÁ CADASTRADO
    const checkUserDocument = await service.findUser(userDocument)
    console.log(checkUserDocument)
    if(!checkUserDocument){
      return res.json({
        status: 'FAIL',
        message: 'Usuário já cadastrado.'
      })
    }

    return res.json(partner);

  } catch (err) {
    return res.status(500).json(err);
  }

}


/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.listUsers = async (req, res) => {
  try {
    let result = await service.listUsers(req.query.userId, req.query.createdStart, req.query.createdEnd, req.query.birthDateStart, req.query.birthDateEnd, req.query.state, req.query.companyId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * LIST JUST ONE USER
 */
module.exports.listUser = async (req, res) => {
  const { userId } = req.params
  try {
    if (!userId) return res.status(400).json({
      status: 'FAIL',
      message: 'Usuário não informado'
    });

    let result = await service.listUser(userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * LIST JUST ONE USER
 */
module.exports.listUserByEmail = async (req, res) => {
  const { email } = req.params

  console.log(email)
  try {
    if (!email) return res.status(400).json({
      status: 'FAIL',
      message: 'E-mail do usuário não informado'
    });

    let result = await service.listUserByEmail(email);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * UPDATE A USER
 */
module.exports.updateUser = async (req, res) => {


  console.log(req.body.displayName)
  if (!req.body.userId) return res.status(400).json({
    status: 'FAIL',
    message: 'Usuário não foi informado'
  });

  if (!req.body.firstName) return res.status(400).json({
    status: 'FAIL',
    message: 'O nome não foi informado.'
  });

  if (!req.body.email) return res.status(400).json({
    status: 'FAIL',
    message: 'E-mail do usuário não foi informado'
  });
  req.body.email = req.body.email.replace(/\s/g, '').toLowerCase()

  if (!emailIsValid(req.body.email)) return res.status(400).json({
    status: 'FAIL',
    message: 'O e-mail informado não é valido'
  });
  try {
    let result = await service.updateUser(req.body.userId, req.body.firstName, req.body.lastName, req.body.email, req.body.birthDate, req.body.genre, req.body.state, req.body.displayName, req.body.password);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * CHANGE USER STATE
 */
module.exports.changeUserStatus = async (req, res) => {

  if (!req.body.userId) return res.status(400).json({
    status: 'FAIL',
    message: 'Usuário não foi informado'
  });

  if (!req.body.state) return res.status(400).json({
    status: 'FAIL',
    message: 'O status não foi informado'
  });

  console.log('body: ', req.body.status)

  try {
    let result = await service.changeUserStatus(req.body.userId, req.body.status);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * CHANGE USER STATE
 */
module.exports.saveHobbies = async (req, res) => {

  // console.log(req.body)

  if (!Array.isArray(req.body.hobbiesList)) return res.status(400).json({
    status: 'FAIL',
    message: 'Precisa enviar uma lista de hobbies'
  });

  if (!req.params.userId) return res.status(400).json({
    status: 'FAIL',
    message: 'O usuário não foi informado'
  });

  let hobbiesToUser = await req.body.hobbiesList.map(hobbieUser => [req.params.userId, hobbieUser])

  try {
    let removeOldHobbies = await service.removeAllUserHobbies(req.params.userId, req.body.hobbiesList);
    let result = await service.saveHobbies(hobbiesToUser);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.saveUserImage = async (req, res) => {
  try {
    if (!req.body.photo) return res.status(400).json({
      status: 'FAIL',
      message: 'Atributos da imagem não informados'
    });
    var imageAttr = JSON.parse(req.body.photo)
    if (!req.params.userId) return res.status(400).json({
      status: 'FAIL',
      message: 'O usuário não foi informado'
    });
    if (!imageAttr.photoName) return res.status(400).json({
      status: 'FAIL',
      message: 'Titulo da foto não foi informado'
    });


    if (!req.file) return res.status(400).json({
      status: 'FAIL',
      message: 'Nenhum arquivos enviado'
    });
    var image = await uploadService.uploadImage(req.file, 'shipper-images/');
    var result = await service.saveUserImage(req.params.userId, image.Location, imageAttr.photoName, imageAttr.photoDescription)
    return res.json(result);
    return
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.saveUserArrayImages = async (req, res) => {
  try {
    if (!req.body.photos) return res.status(400).json({
      status: 'FAIL',
      message: 'Sem imagem'
    });
    if (!req.params.userId) return res.status(400).json({
      status: 'FAIL',
      message: 'O usuário não foi informado'
    });
  console.log('tentando salvar imagem')
  console.log(req.params.userId)
  return new Promise((resolve, reject) => {
    try {
      return Promise.all(
        req.body.photos.map(async photo => {
          let image = await upload.uploadBase64(photo, 'shipper-images/')
          let result = await service.saveUserImage(req.params.userId, image.Location, 'cover', 'no name', 'no description')
          console.log('------------------------')
          console.log(image)
          console.log(result)
          console.log('------------------------')

          return result
        })
      ).then(resp =>  res.json(resp[0])).catch(err => reject(err))
    } catch (error) {
      reject(error)
    }
  })
    return Promise.all(
      photos.map(async photo => {
        let image = await upload.uploadBase64(photo, 'shipper-images/')
        // let result = await service.saveUserImage(req.params.userId, image.Location, 'no name', 'no description')
        console.log('------------------------')
        console.log(image.Location)
        console.log(result)
        console.log('------------------------')

        return result
      })
    ).then(resp => res.json(resp)).catch(err => res.status(500).json(err))
    // var image = await uploadService.uploadImage(req.file, 'shipper-images/');
    // var result = await service.saveUserImage(req.params.userId, image.Location, imageAttr.photoName, imageAttr.photoDescription)
    // return res.json(result);
    // return
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * LIST IMAGES BY USER ID
 */
module.exports.listImages = async (req, res) => {

  try {
    if (!req.params.userId) return res.status(400).json({
      status: 'FAIL',
      message: 'O usuário não foi informado'
    });

    let result = await service.listImages(req.params.userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * REMOVE USER HOBBIES NOT IN HOBBIE LIST
 */
module.exports.removeUserHobbies = async (req, res) => {
  const { userId } = req.params
  const { hobbiesList } = req.body

  if (!userId) return res.status(400).json({
    status: 'FAIL',
    message: 'O usuário não foi informado'
  });

  if (!Array.isArray(hobbiesList)) return res.status(400).json({
    status: 'FAIL',
    message: 'Precisa enviar uma lista de hobbies'
  });

  try {
    let result = await service.removeUserHobbies(userId, hobbiesList);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/**
 * REMOVE USER IMAGES
 */

module.exports.removeUserImages = async (req, res) => {
  const { userId } = req.params
  const { imagesList } = req.body

  if (!userId) return res.status(400).json({
    status: 'FAIL',
    message: 'O usuário não foi informado'
  });

  if (!Array.isArray(imagesList)) return res.status(400).json({
    status: 'FAIL',
    message: 'Precisa enviar uma lista de imagens'
  });

  try {
    let result = await service.removeUserImages(userId, imagesList);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}
/**
 * REMOVE USER FROM DATABASE
 */
module.exports.removeUser = async (req, res) => {
  const { userId } = req.params

  if (!userId) return res.status(400).json({
    status: 'FAIL',
    message: 'O usuário não foi informado'
  });

  try {
    let result = await service.removeUser(userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}



/**
 * LIST ONE OR MORE USERS BY PARAMS
 */
module.exports.listHobbie = async (req, res) => {

  try {
    let result = await service.listUsers(req.query.userId, req.query.createdStart, req.query.createdEnd, req.query.birthDateStart, req.query.birthDateEnd, req.query.state);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}


/**
 * LIST USER HOBBIES BY USER ID
 */
module.exports.listUserHobbies = async (req, res) => {
  console.log(req.params.userId)
  if (!req.params.userId) return res.status(400).json({
    status: 'FAIL',
    message: 'O usuário não foi informado'
  });

  try {
    let result = await service.listUserHobbies(req.params.userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}



module.exports.registrarUsuarioCondominio = async (req, res) => {
  if (!req.body.id_usuario) return res.status(400).json('O ID do usuário não foi informado.');
  if (!req.body.id_condominio) return res.status(400).json('O ID do condominio não foi informado.');

  /* try {
    let result = await service.emailEmUso(req.body.email);
    if (result.status != 'OK')
      return res.status(400).json(result);
  } catch (err) {
    return res.status(500).json(err);
  } */

  try {
    let result = await service.inserirUsuarioCondominio(req.body.id_usuario, req.body.id_condominio);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }

}
module.exports.alterarSenha = async (req, res) => {
  if (!req.body.idUsuario) return res.status(400).json('O ID do usuário não foi informado.');
  if (!req.body.senha) return res.status(400).json('A senha não foi informada.');

  if (req.body.tokenPayload.access != 'ADMINISTRADOR' && req.body.idUsuario != req.body.tokenPayload.payload.idUsuario)
    return res.status(403).json({
      status: 'UNAUTHORIZED',
      message: 'Permissão negada. Você não pode alterar este usuário.'
    });

  try {
    let result = await service.alterarSenha(req.body.idUsuario, req.body.senha);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.emailEmUso = async (req, res) => {
  if (!req.body.email) return res.status(400).json('O e-mail não foi informado.');

  try {
    let result = await service.emailEmUso(req.body.email);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.autenticar = async (req, res) => {
  if (!req.body.email) return res.status(400).json('O e-mail não foi informado.');
  if (!req.body.senha) return res.status(400).json('A senha não foi informada.');

  try {
    let result = await service.autenticar(req.body.email, req.body.senha);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listar = async (req, res) => {

  console.log(req.body.condominio)
  try {
    console.log(req.body.name)
    if (!req.body.id_criador) return res.status(400).json({
      status: 'FAIL',
      message: 'Criador do orçamento não  foi informado'
    });
    let result = await service.listar(req.body.perfil, req.body.condominio);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.listarUsuario = async (req, res) => {
  if (!req.body.id) return res.status(400).json({
    status: 'FAIL',
    message: 'O usuário não foi informado.'
  });
  try {
    let result = await service.listarUsuario(req.body.id);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.getUserPreferences = async (req, res) => {
  const { userId } = req.loggedUser;
  try {
    let result = await service.getUserPreferences(userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.putUserPreferences = async (req, res) => {
  const { userId } = req.loggedUser;
  const { params } = req.body;
  try {
    let result = await service.putUserPreferences(userId, params);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.getUserConfigurations = async (req, res) => {
  const { userId } = req.loggedUser;
  try {
    let result = await service.getUserConfigurations(userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.putUserConfigurations = async (req, res) => {
  const { userId } = req.loggedUser;
  const { params } = req.body;
  try {
    let result = await service.putUserConfigurations(userId, params);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.userDetails = async (req, res) => {
  const { userId } = req.params;
  const loggedUser = req.loggedUser.userId;
  console.log(loggedUser);
  try {
    let result = await service.userDetails(loggedUser, userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.getLoggedInfo = async (req, res) => {
  const { userId } = req.loggedUser;
  try {
    let result = await service.getLoggedInfo(userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.coverPhoto = async (req, res) => {
  const { userId } = req.loggedUser;
  const { photo, photoType, oldPhoto } = req.body.params;
  try {
    if (!photo.uri) return res.status(200).json({
      status: 'FAIL',
      message: 'Atributos da imagem não informados'
    });
    let image = await upload.uploadBase64(photo.uri, 'shipper-images/')
    //let result = await service.saveUserImage(req.params.userId, image.Location, 'no name', 'no description')
    console.log(oldPhoto)
    console.log(image)
    console.log(result)
    var result = await service.coverPhoto(userId, image.Location, image.Bucket, image.key, photoType)
    //SELECIONA A IMAGEM ANTERIOR DO BANCO DE DADOS
    const {bucket, key, photoId} = await service.oldPhoto(oldPhoto, userId);
    console.log(photoId)
    if(photoId){
      //APAGA A IMAGEM NO BANCO DE DADOS
      let deleteStatus = await service.deletePhoto(photoId, userId);
      if(deleteStatus.status == 'OK'){
        //APAGA A IMAGEM NO BUCKET
        let deletedImage = await upload.delete(bucket, key);
        console.log(deletedImage)

      }
    }

    //APAGA A IMAGEM ANTERIOR DO BANCO DE DADOS
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.userPhotos = async (req, res) => {
  const { userId } = req.loggedUser;
  try {
    let result = await service.userPhotos(userId);
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.changePhoto = async (req, res) => {
  const { userId } = req.loggedUser;
  const { photo, photoType, photoOrder, oldPhoto } = req.body.params;
  console.log(req.body.params)
  try {
    if (!photo.uri) return res.status(200).json({
      status: 'FAIL',
      message: 'Atributos da imagem não informados'
    });
    let image = await upload.uploadBase64(photo.uri, 'shipper-images/')
    //let result = await service.saveUserImage(req.params.userId, image.Location, 'no name', 'no description')
    console.log(oldPhoto)
    console.log(image)
    console.log(result)
    var result = await service.changePhoto(userId, image.Location, image.Bucket, image.key, photoType, photoOrder)
    //SELECIONA A IMAGEM ANTERIOR DO BANCO DE DADOS
    const {bucket, key, photoId} = await service.oldPhoto(oldPhoto, userId);
    if(photoId){
      //APAGA A IMAGEM NO BANCO DE DADOS
      let deleteStatus = await service.deletePhoto(photoId, userId);
      if(deleteStatus.status == 'OK'){
        //APAGA A IMAGEM NO BUCKET
        let deletedImage = await upload.delete(bucket, key);
        console.log(deletedImage)

      }
    }

    //APAGA A IMAGEM ANTERIOR DO BANCO DE DADOS
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/*module.exports.deletePhoto = async (req, res) => {
  const { userId } = req.loggedUser;
  const { photoId } = req.query;
  console.log(photoId)
  console.log(userId)
  try {
    console.log(photoId)
    console.log(userId)
    //SELECIONA A IMAGEM ANTERIOR DO BANCO DE DADOS
    const {bucket, key, photoId} = await service.oldPhoto(photoId, userId);


    if(photoId){
      //APAGA A IMAGEM NO BANCO DE DADOS
      let deleteStatus = await service.deletePhoto(photoId, userId);
      if(deleteStatus.status == 'OK'){
        //APAGA A IMAGEM NO BUCKET
        let deletedImage = await upload.delete(bucket, key);
        console.log(deletedImage)
      }
    } else {
      console.log('não encontrada')
    }
    return res.json(deleteStatus);
  } catch (err) {
    return res.status(500).json(err);
  }
}*/

module.exports.deletePhoto = async (req, res) => {
  const { userId } = req.loggedUser;
  const { photoId } = req.query;
  try {
    console.log('Try');
    //SELECIONA A IMAGEM ANTERIOR DO BANCO DE DADOS
    const oldPhoto = await service.oldPhoto(photoId, userId);
    const bucket = oldPhoto.bucket;
    const key = oldPhoto.key;
    if(key){
      //APAGA A IMAGEM NO BANCO DE DADOS
      let deleteStatus = await service.deletePhoto(photoId, userId);
      if(deleteStatus.status == 'OK'){
        //APAGA A IMAGEM NO BUCKET
        let deletedImage = await upload.delete(bucket, key);
        console.log(deleteStatus)
        return res.json(deleteStatus);
      }
    }
    console.log('Try end');
  } catch (err) {

  }
}

module.exports.userContactss = async (req, res) => {
  console.error(req.body.params)
  try {
    return res.status(400).json({
      status: 'FAIL',
      message: 'Usuário não foi informado'
    });
  } catch (err) {
    return res.status(500).json(err);
  }
}

module.exports.userContacts = async (req, res) => {
  const { contactId, senderUserId, receiverUserId } = req.body;
  console.log(req.body)
  try {
    var result = await service.userContacts(contactId, senderUserId, receiverUserId)
    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
}