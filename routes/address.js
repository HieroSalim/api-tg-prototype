const express = require('express')
const router = express.Router()
const jwt = require('../middleware/jwt')

const AddressController = require('../controllers/addressController')

//Busca todos os endereços de um usuário
router.get('/:user', jwt, AddressController.select)

//Adiciona um endereço a um usuário
router.post('/', AddressController.add)

//Modifica um endereço
router.patch('/', jwt, AddressController.alter)

//Deleta um endereço
router.delete('/', jwt, AddressController.delete)

module.exports = router