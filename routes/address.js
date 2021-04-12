const express = require('express')
const router = express.Router()
const jwt = require('../middleware/jwt')

const AddressController = require('../controllers/addressController')

router.get('/:IDuser', jwt, AddressController.select)

router.post('/', jwt, AddressController.add)

router.patch('/', jwt, AddressController.alter)

router.delete('/', jwt, AddressController.delete)

module.exports = router