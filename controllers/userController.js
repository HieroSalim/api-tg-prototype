const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');

exports.getAll = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            "SELECT AES_DECRYPT(CPF, SHA2('Katchau95', 512)) as CPF, AES_DECRYPT(user, SHA2('Katchau95', 512)) as user, typeUser, AES_DECRYPT(name, SHA2('Katchau95', 512)) as name, AES_DECRYPT(email, SHA2('Katchau95', 512)) as email, AES_DECRYPT(cell, SHA2('Katchau95', 512)) as cell FROM User;",
            (error, resultado, fields) => {
                conn.release()
                if(error) { return res.status(500).send({error : error})}
                else if (resultado.length > 0){
                    var data = []
                    resultado.forEach(dado => {
                        data.push( {
                            CPF: dado.CPF.toString(),
                            user: dado.user.toString(),
                            typeUser: dado.typeUser,
                            name: dado.name.toString(),
                            email: dado.email.toString(),
                            cell: dado.cell.toString()
                        })
                    });
                    return res.status(200).send({
                        dados: data})
                }else{
                    res.status(404).send({                    
                        mensagem: 'Nenhum dado Inserido'
                    });
                }
            }
        )
    });
}

exports.getCPF = (req, res, next) => {
    mysql.getConnection((err, conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query('SELECT AES_DECRYPT(CPF, SHA2("'+key+'", '+type+')) as CPF FROM User WHERE user = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'));',
        [req.params.user],
        (error, resultado) => {
            conn.release()
            if(error) { return res.status(500).send({ error: error }) }
            else if(resultado.length > 0){
                return res.status(200).send({ CPF: resultado[0].CPF.toString() })
            }else{
                res.status(200).send({                    
                    mensagem: 'CPF não encontrado'
                });
            }
        })
    })
}

exports.getUnique = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(            
            "SELECT AES_DECRYPT(CPF, SHA2('Katchau95', 512)) as CPF, AES_DECRYPT(user, SHA2('Katchau95', 512)) as user, typeUser, AES_DECRYPT(name, SHA2('Katchau95', 512)) as name, AES_DECRYPT(email, SHA2('Katchau95', 512)) as email, AES_DECRYPT(cell, SHA2('Katchau95', 512)) as cell "+'FROM User WHERE CPF = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'));',
            [req.params.CPF],
            (error, resultado, fields) => {
                conn.release()
                if(error) { return res.status(500).send({error : error})}
                else if (resultado.length > 0){
                    return res.status(200).send({
                        CPF: resultado[0].CPF.toString(),
                        user: resultado[0].user.toString(),
                        typeUser: resultado[0].typeUser,
                        name: resultado[0].name.toString(),
                        email: resultado[0].email.toString(),
                        cell: resultado[0].cell.toString()
                    })
                }else{
                    res.status(200).send({                    
                        mensagem: 'Não há um usuário cadastrado com este CPF'
                    });
                }
            }
        )
    });
}

exports.register = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { 
        console.log(error)
        return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            'SELECT * FROM User WHERE user = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'));',
            [req.body.user],
            (error, resultado, fields) => {
                console.log(error)
                if(resultado == 0){                    
                    bcrypt.hash(req.body.pass, 10 ,(errBcrypt, hash) => {
                        if(errBcrypt) { 
                            console.log(errBcrypt)
                            return res.status(500).send({ error : errBcrypt})}
                        conn.query(
                            'INSERT INTO User (CPF, user, pass, typeUser, name, email, cell)'
                            +' VALUES (AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),'
                            +' AES_ENCRYPT(?,SHA2("'+key+'",'+type+')), ? , ? ,'
                            +' AES_ENCRYPT(?,SHA2("'+key+'",'+type+')), AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),'
                            +' AES_ENCRYPT(?,SHA2("'+key+'",'+type+')))',
                            [req.body.CPF, req.body.user, hash, req.body.typeUser, req.body.name, req.body.email, req.body.cell],
                            (error, resultado, field) =>{
                            conn.release()
                            if(error) { 
                                console.log(error)
                                return res.status(500).send({error : error})}
                            res.status(201).send({
                                mensagem: 'Cadastrado com sucesso!'
                            });
                            }
                        )
                    })                      
                }
                else{
                    conn.release();
                    return res.status(500).send({mensagem: "Usuário já existente no sistema!"})
                   
                }
            })
    });
}

exports.alter = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        bcrypt.hash(req.body.pass, 10 ,(errBcrypt, hash) => {
            if(errBcrypt) { return res.status(500).send({ error : errBcrypt})}

            conn.query(
                `UPDATE User 
                    SET user     = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                        pass     = ?,
                        typeUser = ?,
                        name     = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                        email    = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                        cell     = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))
                WHERE CPF       = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))`,
                [    req.body.user,
                     hash,
                     req.body.typeUser,
                     req.body.name,
                     req.body.email,
                     req.body.cell,
                     req.body.CPF
                ],
                (error, resultado, field) =>{
                    conn.release();
                    if(error) { return res.status(500).send({error : error})}
    
                    return res.status(200).send({
                        mensagem: 'Alterado com Sucesso!',
                    });
                }
            )
        })        
    });
}

exports.delete = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            `DElETE FROM User WHERE CPF = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))`, [req.body.CPF],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(200).send({
                    mensagem: 'Usuario removido!',
                });
            }
        )
    });
}