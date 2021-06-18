const express = require('express');
const router = express.Router();
const jwt = require('../middleware/jwt')

const UserController = require('../controllers/userController')

//Busca geral
router.get('/', UserController.getAll);

//Busca um user específico
router.get('/:user', jwt, UserController.getUnique);

//Busca um cpf específico
router.get('/CPF/:user', jwt, UserController.getCPF);

//Seleciona o usuário e o médico que possuem ligação a um agendamento
router.get('/chat/:user', jwt, UserController.chatUsers);

//Cadastra um user
router.post('/', UserController.register);

//Altera um user
router.patch('/', jwt, UserController.alter);

//Apaga um usuário
router.delete('/', jwt, UserController.delete);

module.exports = router;