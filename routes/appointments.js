const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController')

//Busca geral
router.get('/', appointmentController.all);

//Buscar uma consulta especifica
router.get('/:idConsult', appointmentController.unique);

//Cadastra uma consulta
router.post('/', appointmentController.register);

//Altera uma consulta
router.patch('/', appointmentController.alter);

//Apaga uma consulta
router.delete('/', appointmentController.delete);

module.exports = router;