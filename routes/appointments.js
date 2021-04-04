const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController')
const jwt = require('../middleware/jwt')

//Busca geral
router.get('/', jwt, appointmentController.all);

//Buscar uma consulta especifica
router.get('/:idAppointment', jwt, appointmentController.unique);

//Cadastra uma consulta
router.post('/', jwt, appointmentController.register);

//Altera uma consulta
router.patch('/', jwt, appointmentController.alter);

//Apaga uma consulta
router.delete('/', jwt, appointmentController.delete);

module.exports = router;