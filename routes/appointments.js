const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController')
const jwt = require('../middleware/jwt')

//Busca geral
router.get('/', jwt, appointmentController.all);

//Buscar um agendamento especifico
router.get('/:idAppointment', jwt, appointmentController.unique);

//Cadastra um agendamento
router.post('/', jwt, appointmentController.register);

//Altera um agendamento
router.patch('/', jwt, appointmentController.alter);

//Apaga um agendamento
router.delete('/', jwt, appointmentController.delete);

module.exports = router;