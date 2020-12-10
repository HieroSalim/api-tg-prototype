const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

//Busca geral
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM User;',
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

//Busca um user específico
router.get('/:CPF', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM User WHERE CPF = ?;',
            [req.params.CPF],
            (error, resultado, fields) => {
                if(error) { return res.status(500).send({error : error})}
                else if (resultado.length > 0){
                    return res.status(200).send({response: resultado})
                }else{
                    res.status(404).send({                    
                        menssagem: 'Não há um usuário cadastrado com este CPF'
                    });
                }
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

router.post('/Authentication', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if (error) { return res.status(500).send({error : error})} 
            conn.query(
                'SELECT CPF, user, pass, typeUser from User WHERE user = ? and pass = ?',
                [req.body.user, req.body.pass],
                (error ,resultado, field) =>{
                    conn.release();
                    if(error) { return res.status(500).send({error : error})}
                    else if (resultado.length > 0){
                        if (resultado[0].user == req.body.user && resultado[0].pass == req.body.pass) {
                            res.status(201).send({             
                                user : resultado[0].user,
                                pass : resultado[0].pass,       
                                typeUser: resultado[0].typeUser,
                                CPF: resultado[0].CPF
                            });       
                        }
                    }else{
                        res.status(404).send({                    
                            menssagem: 'Usuário ou senha incorretos'
                        });
                    }
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
            `DElETE FROM User WHERE CPF = ?`, [req.body.CPF],
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