const express = require('express')
const router = express.Router()
const jwt = require('../middleware/jwt')
const ConsultController = require('../controllers/consultController')

router.get('/', jwt, ConsultController.status)

router.post('/', jwt, ConsultController.define)

router.patch('/cancel', jwt, ConsultController.cancel)

router.patch('/complete', jwt, ConsultController.complete)

module.exports = router