const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const mysql = require('../mysql').pool;

exports.auth = (req, res, next) =>{
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
}

exports.loadsession = (req,res,next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error })}
            const key = process.env.ENCRYPT_KEY
            const type = process.env.ENCRYPT_TYPE
            conn.query(
                'SELECT AES_DECRYPT(name,SHA2('+key+','+type+'))'+
                +', AES_DECRYPT(user,SHA2('+key+','+type+'))'+
                +', typeUser, AES_DECRYPT(email,SHA2('+key+','+type+'))'+
                +' from User WHERE user = ?',
                req.user.user,
                (err,result,field) => {
                    if(err) { return res.status(500).send({ error: error }) }
                    if(result > 0){
                        return res.status(200).send({ 
                            user: result[0].user.toString(),
                            typeUser: result[0].typeUser,
                            email: result[0].email.toString(),
                            name: result[0].name.toString()
                         })
                    }
                    return res.status(400).send({ mensagem: 'Falha no carregamento!' })
                }
            )
    })
}