const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const jwt = require('../middleware/jwt')

router.post('/', authController.auth);

router.get('/loadsession', jwt, authController.loadsession)

module.exports = router