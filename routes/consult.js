const express = require('express')
const router = express.Router()
const jwt = require('../middleware/jwt')
const ConsultController = require('../controllers/consultController')

//verifica e seleciona consultas pendentes
router.get('/', jwt, ConsultController.status)

module.exports = router