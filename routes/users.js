const express = require('express');
const router = express.Router();
const jwt = require('../middleware/jwt')

const UserController = require('../controllers/userController')

//Busca geral
router.get('/', jwt, UserController.getAll);

//Busca um user específico
router.get('/:CPF', jwt , UserController.getUnique);

//Cadastra um user
router.post('/', UserController.register);

//Altera um user
router.patch('/', jwt, UserController.alter);

//Apaga um usuário
router.delete('/', jwt, UserController.delete);

module.exports = router;