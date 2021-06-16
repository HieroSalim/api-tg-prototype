const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController')
const jwt = require('../middleware/jwt')

//Busca geral
router.get('/', jwt, appointmentController.all);

//Buscar um agendamento especifico
router.get('/:idAppointment', jwt, appointmentController.unique);

//Busca as solicitações de agendamento
router.get('/solicitation/:user', jwt, appointmentController.solicitations)

//Busca agendamentos confirmados
router.get('/confirm/:user', jwt, appointmentController.appointments);

//Busca agendamentos completos
router.get('/completes/:user', jwt, appointmentController.consults);

//Aceita ou recusa os termos de uso
router.post('/terms', jwt, appointmentController.accept);

//Cadastra um agendamento
router.post('/', appointmentController.register);

//Altera um agendamento
router.patch('/', jwt, appointmentController.alter);

//Apaga um agendamento
router.delete('/', jwt, appointmentController.delete);

module.exports = router;