const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const mysql = require('../mysql').pool;

exports.auth = (req, res, next) =>{
    mysql.getConnection((error, conn) =>{
        if (error) { return res.status(500).send({error : error})} 
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
            conn.query(
                'SELECT AES_DECRYPT(user,SHA2("'+key+'",'+type+')) as user, pass, typeUser,status from User WHERE user = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'))'
                +' or email = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'))',
                [req.body.login, req.body.login],
                (error ,resultados, field) =>{
                    conn.release();
                    if(error) { return res.status(500).send({error : error})}
                    if(resultados.length > 0){
                        bcrypt.compare(req.body.pass, resultados[0].pass.toString(), (error, resultado) =>{
                            if(error) { return res.status(500).send({error : error})}
                            if (resultado){
                                const token = jwt.sign({
                                    user: resultados[0].user.toString(),
                                    typeUser: resultados[0].typeUser
                                }, process.env.JWT_KEY,
                                {
                                    expiresIn: "7d"
                                })
                                res.status(202).send({
                                    auth: true,
                                    token: token,
                                    status: resultados[0].status
                                });
                            }else{
                                res.status(401).    send({
                                    mensagem: 'Usuário ou senha incorretos'
                                });
                            }
                        })
                    }else{
                        res.status(401).send({
                            mensagem: 'Usuário ou senha incorretos'
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
                'SELECT AES_DECRYPT(name,SHA2("'+key+'",'+type+')) as name'
                +', AES_DECRYPT(user,SHA2("'+key+'",'+type+')) as user'
                +', typeUser, AES_DECRYPT(email,SHA2("'+key+'",'+type+')) as email'
                +' from User WHERE AES_DECRYPT(user,SHA2("'+key+'",'+type+')) = ?',
                [req.user.user],
                (err,result,field) => {
                    conn.release()
                    if(err) { return res.status(500).send({ error: err }) }
                    if(result.length > 0){
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

exports.authorize = (req, res, next) => {
    mysql.getConnection((err, conn) => {
        if (err) return res.status(500).send({ error: err })
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            `UPDATE User
                SET status  =   AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))
            WHERE user = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))`,
            [req.body.status, req.body.user],
            (error, resultado, field) => {
                conn.release();
                    if(error) { return res.status(500).send({error : error})}
                    return res.status(200).send({
                        mensagem: 'Política assinada'
                    });
            }
        )
    })
}