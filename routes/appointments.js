const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

//Busca geral
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM Appointment;',
            (error, resultado, fields) => {
                if(error) { return res.status(500).send({error : error})}
                else if (resultado.length > 0){
                    return res.status(200).send({response: resultado})
                }else{
                    res.status(404).send({                    
                        menssagem: 'Nenhum dado Inserido'
                    });
                }
            }
        )
    });
});

//Buscar uma consulta especifica
router.get('/:idConsult', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM Appointment WHERE idConsult = ?;',
            [req.params.idConsult],
            (error, resultado, fields) => {
                if(error) { return res.status(500).send({error : error})}
                else if (resultado.length > 0){
                    return res.status(200).send({response: resultado})
                }else{
                    res.status(404).send({                    
                        menssagem: 'Esse identificador não está sendo utilizado'
                    });
                }
            }
        )
    });
});

//Cadastra uma consulta
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            'INSERT INTO Appointment (idConsult, user_CPF, symptons, description, dateHour, doctor, statusDoctor) VALUES (?,?,?,?,?,?,?)',
            [req.body.idConsult, req.body.user_CPF, req.body.symptons, req.body.description, req.body.dateHour, req.body.doctor, req.body.statusDoctor],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}
                res.status(201).send({
                    menssagem: 'Cadastrado com sucesso!',
                    idConsult: resultado.InsertidConsult
                });
            }
        )
    });
});


//Altera uma consulta
router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            `UPDATE Appointment
                SET user_CPF    = ?,
                    symptons = ?,
                    description    = ?,
                    dateHour    = ?,
                    doctor    = ?,
                    statusDoctor = ?,
             WHERE idConsult     = ?
            `,
            [    req.body.user_CPF,
                 req.body.symptons,
                 req.body.description,
                 req.body.dateHour,
                 req.body.doctor,
                 req.body.statusDoctor,
                 req.body.idConsult
            ],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(202).send({
                    menssagem: 'Alterado com Sucesso!',
                });
            }
        )
    });
});

//Apaga uma consulta
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            `DElETE FROM Appointment WHERE idConsult = ?`, [req.body.idConsult],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(202).send({
                    menssagem: 'Consulta excluída!',
                });
            }
        )
    });
});

module.exports = router;