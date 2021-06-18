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

//Busca de solicitações para o médico
router.get('/medic/:user', jwt, appointmentController.medicSolicitations);

//Busca de consultas para o médico
router.get('/consults/:user', jwt, appointmentController.medicAppointments);

//Aceita ou recusa os termos de uso
router.post('/setResponse', jwt, appointmentController.accept);

router.post('/start', jwt, appointmentController.start)

//Cadastra um agendamento
router.post('/', jwt,appointmentController.register);

//Altera um agendamento
router.patch('/', jwt, appointmentController.alter);

router.patch('/finish', jwt, appointmentController.finish)

//Apaga um agendamento
router.delete('/:idAppointment', jwt, appointmentController.delete);

module.exports = router;