const express = require('express');
const router = express.Router();
const jwt = require('../middleware/jwt')

const UserController = require('../controllers/userController')

//Busca geral
router.get('/', UserController.getAll);

//Busca um user específico
router.get('/:CPF', jwt, UserController.getUnique);

//Busca um cpf específico
router.get('/CPF/:user', jwt, UserController.getCPF);

//Cadastra um user
router.post('/', UserController.register);

//Altera um user
router.patch('/', jwt, UserController.alter);

//Apaga um usuário
router.delete('/', jwt, UserController.delete);

module.exports = router;