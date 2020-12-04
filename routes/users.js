const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

//Busca geral
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM user;',
            (error, resultado, fields) => {
                if(error) { return res.status(500).send({error : error})}
                return res.status(200).send({response: resultado})
            }
        )
    });
});

//Busca um user específico
router.get('/:CPF', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM user WHERE CPF = ?;',
            [req.params.CPF],
            (error, resultado, fields) => {
                if(error) { return res.status(500).send({error : error})}
                return res.status(200).send({response: resultado})
            }
        )
    });
});

//Cadastra um user
router.post('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            'INSERT INTO User (CPF, user, pass, typeUser, name, email, cell) VALUES (?,?,?,?,?,?,?)',
            [req.body.CPF, req.body.user, req.body.pass, req.body.typeUser, req.body.name, req.body.email, req.body.cell],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(201).send({
                    menssagem: 'Cadastrado com sucesso!',
                    CPF: resultado.InsertCPF
                });
            }
        )
    });
});

//Altera um user
router.patch('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            `UPDATE User
                SET user     = ?,
                    pass     = ?,
                    typeUser = ?,
                    name     = ?,
                    email    = ?,
                    cell     = ?
             WHERE CPF       = ?
            `,
            [    req.body.user,
                 req.body.pass,
                 req.body.typeUser,
                 req.body.name,
                 req.body.email,
                 req.body.cell,
                 req.body.CPF
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

//Apaga um usuário
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            `DElETE FROM user WHERE CPF = ?`, [req.body.CPF],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(202).send({
                    menssagem: 'Usuario removido!',
                });
            }
        )
    });
});

module.exports = router;