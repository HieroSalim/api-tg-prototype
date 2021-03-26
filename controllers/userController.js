const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');

exports.getAll = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            "SELECT AES_DECRYPT(CPF, SHA2('Katchau95', 512)) as name FROM User;",
            (error, resultado, fields) => {
                if(error) { return res.status(500).send({error : error})}
                else if (resultado.length > 0){
                    return res.status(200).send({response: resultado[0].name.toString() })
                }else{
                    res.status(404).send({                    
                        menssagem: 'Nenhum dado Inserido'
                    });
                }
            }
        )
    });
}

exports.getUnique = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(            
            'SELECT * FROM User WHERE CPF = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'));',
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
}

exports.register = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            'SELECT * FROM User WHERE user = ?;',
            [req.body.user],
            (error, resultado, fields) => {
                if(resultado == 0){
                    const key = process.env.ENCRYPT_KEY
                    const type = process.env.ENCRYPT_TYPE
                    bcrypt.hash(req.body.pass, 10 ,(errBcrypt, hash) => {
                        if(errBcrypt) { return res.status(500).send({ error : errBcrypt})}
                        conn.query(
                            'INSERT INTO User (CPF, user, pass, typeUser, name, email, cell)'+
                            +' VALUES (AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+
                            +'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+
                            +')),?,AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+
                            +')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+')))',
                            [req.body.CPF, req.body.user, hash, req.body.typeUser, req.body.name, req.body.email, req.body.cell],
                            (error, resultado, field) =>{
                            conn.release()
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
}

exports.alter = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            `UPDATE User
                SET user     = AES_ENCRYPT(?,SHA2("`+key+`"),`+type+`)),
                    pass     = AES_ENCRYPT(?,SHA2("`+key+`"),`+type+`)),
                    typeUser = AES_ENCRYPT(?,SHA2("`+key+`"),`+type+`)),
                    name     = AES_ENCRYPT(?,SHA2("`+key+`"),`+type+`)),
                    email    = AES_ENCRYPT(?,SHA2("`+key+`"),`+type+`)),
                    cell     = AES_ENCRYPT(?,SHA2("`+key+`"),`+type+`))
             WHERE CPF       = AES_ENCRYPT(?,SHA2("`+key+`"),`+type+`))
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

                return res.status(202).send({
                    menssagem: 'Alterado com Sucesso!',
                });
            }
        )
    });
}

exports.delete = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            `DElETE FROM User WHERE CPF = AES_ENCRYPT(?,SHA2("`+key+`"),`+type+`))`, [req.body.CPF],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(202).send({
                    menssagem: 'Usuario removido!',
                });
            }
        )
    });
}