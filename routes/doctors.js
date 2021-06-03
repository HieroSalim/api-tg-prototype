const express = require('express')
const router = express.Router()
const jwt = require('../middleware/jwt')
const DoctorController = require('../controllers/doctorController')

//Busca geral
router.get('/', jwt, DoctorController.getAll);

//Busca um doctor específico
router.get('/:CPF', jwt, DoctorController.getUnique);

//Aceita ou Recusa a solicitação médica
router.post('/define', DoctorController.defineMedic)

//Cadastra um doctor
router.post('/', DoctorController.upMedic);
 
//Altera um doctor
router.patch('/', jwt, DoctorController.alter);

//Apaga um doctor
router.delete('/', jwt, DoctorController.delete);

module.exports = router