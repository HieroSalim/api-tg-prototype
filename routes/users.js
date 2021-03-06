const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');

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
            'SELECT * FROM User WHERE user = ?;',
            [req.body.user],
            (error, resultado, fields) => {
                if(resultado == 0){
                    bcrypt.hash(req.body.pass, 10 ,(errBcrypt, hash) => {
                        if(errBcrypt) { return res.status(500).send({ error : errBcrypt})}
                        conn.query(
                            'INSERT INTO User (CPF, user, pass, typeUser, name, email, cell) VALUES (?,?,?,?,?,?,?)',
                            [req.body.CPF, req.body.user, hash, req.body.typeUser, req.body.name, req.body.email, req.body.cell],
                            (error, resultado, field) =>{
                            conn.release();
                            if(error) { return res.status(500).send({error : error})}
                            res.status(201).send({
                                menssagem: 'Cadastrado com sucesso!',
                                CPF: resultado.InsertCPF
                            });
                            }
                        )
                    })                      
                }
                else{
                    conn.release();
                    return res.status(500).send({menssagem: " Usuário já existente no sistema!"})
                   
                }
            })
    });
});

router.post('/Authentication', (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if (error) { return res.status(500).send({error : error})} 
            conn.query(
                'SELECT CPF, user, pass, typeUser from User WHERE user = ? or email = ?',
                [req.body.login, req.body.login],
                (error ,resultados, field) =>{
                    conn.release();
                    if(error) { return res.status(500).send({error : error})}
                    if(resultados.length > 0){
                        bcrypt.compare(req.body.pass, resultados[0].pass.toString(), (error, resultado) =>{
                            if(error) { return res.status(500).send({error : error})}
                            if (resultado){
                                res.status(202).send({             
                                    user : resultados[0].user,
                                    typeUser: resultados[0].typeUser,
                                    CPF: resultados[0].CPF
                                });       
                            }else{
                                res.status(401).send({                    
                                    menssagem: 'Usuário ou senha incorretos'
                                });
                            }                            
                        })
                    }else{
                        res.status(401).send({                    
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