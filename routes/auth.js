const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const mysql = require('../mysql').pool;

router.post('/', (req, res, next) =>{
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
                                const token = jwt.sign({
                                    user: resultados[0].user,
                                    typeUser: resultados[0].typeUser
                                }, process.env.JWT_KEY,
                                {
                                    expiresIn: "1h"
                                })
                                res.status(202).send({             
                                    auth: true,
                                    token: token                               
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

module.exports = router