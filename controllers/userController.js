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
                res.status(404).send({
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
            "SELECT AES_DECRYPT(CPF, SHA2('"+key+"', "+type+")) as CPF, AES_DECRYPT(user, SHA2('"+key+"', "+type+")) as user,"+
            " typeUser, AES_DECRYPT(name, SHA2('"+key+"', "+type+")) as name, AES_DECRYPT(email, SHA2('"+key+"', "+type+")) as email,"+
            " AES_DECRYPT(cell, SHA2('"+key+"', "+type+")) as cell FROM User WHERE user = AES_ENCRYPT(?,SHA2('"+key+"',"+type+"));",
            [req.params.user],
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
                    res.status(404).send({
                        mensagem: 'Usuário não encontrado'
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
                            'INSERT INTO User (CPF, user, pass, typeUser, name, email, cell, status)'
                            +' VALUES (AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),'
                            +' AES_ENCRYPT(?,SHA2("'+key+'",'+type+')), ? , ? ,'
                            +' AES_ENCRYPT(?,SHA2("'+key+'",'+type+')), AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),'
                            +' AES_ENCRYPT(?,SHA2("'+key+'",'+type+')), 0)',
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
        conn.query(
            `UPDATE User
                SET name     = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    cell     = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))
            WHERE user       = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))`,
            [
                req.body.name,
                req.body.cell,
                req.body.user
            ],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}
                return res.status(200).send({
                    mensagem: 'Alterado com Sucesso!',
                });
            }
        )
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

exports.chatUsers = (req, res, next) => {
    mysql.getConnection((err, conn) => {
    if (err) return res.status(500).send({error : err})
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            `SELECT distinct aes_decrypt((select User.user from User WHERE User.CPF = doc.user_CPF),SHA2("`+key+`",`+type+`)) as userDoctor,
            aes_decrypt((select User.user from User WHERE User.CPF = app.user_CPF),SHA2("`+key+`",`+type+`)) as userClient
            from User join appointment app on app.user_CPF = user_CPF join Doctor doc on idDoctor = app.doctors 
            WHERE statusDoctor = 1 and (app.user_CPF = User.CPF or doc.user_CPF = User.CPF) and User.user = aes_encrypt(?, SHA2("`+key+`",`+type+`));`,
            [req.params.user],
            (error, resultado) => {
                conn.release()
                if(error) return res.status(500).send({ error: error })
                else if (resultado.length > 0){
                    var data = []
                    resultado.forEach(dado => {
                        data.push( {
                            userClient: dado.userClient.toString(),
                            userDoctor: dado.userDoctor.toString()
                        })
                    });
                    return res.status(200).send({
                        dados: data
                    })
                }else{
                    res.status(404).send({
                        mensagem: 'Nenhum Chat Disponível'
                    });
                }
            }
        )
    })
}