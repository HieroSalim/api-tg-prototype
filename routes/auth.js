const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const jwt = require('../middleware/jwt')

//loga um usuário e retorna o token da sessão
router.post('/', authController.auth);

//Carrega os dados do usuário
router.get('/loadsession', jwt, authController.loadsession)

router.post('/terms', jwt, authController.authorize)

module.exports = router