const mysql = require('../mysql').pool

exports.getAll = (req,res,next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        conn.query(
            'SELECT idDoctor, typeProfessional, AES_DECRYPT(professionalId,SHA2("'+key+'",'+type+')) as professionalId'+
            ', AES_DECRYPT(specialization,SHA2("'+key+'",'+type+')) as specialization, AES_DECRYPT(CNH,SHA2("'+key+'",'+type+')) as CNH'+
            ', typeCNH from Doctor',
            (error, results, fields) => {
                conn.release()
                if(error) { return res.status(500).send({ error: error }) }
                else if(results.length > 0){
                    var data = []
                    results.forEach(dado => {
                        data.push({
                            idDoctor: dado.idDoctor,
                            typeProfessional: dado.typeProfessional,
                            professionalId: dado.professionalId.toString(),
                            specialization: dado.specialization.toString(),
                            CNH: dado.CNH.toString(),
                            typeCNH: dado.typeCNH
                        })
                    })
                    return res.status(200).send({
                        dados: data
                    })
                }else{
                    res.status(404).send({ mensagem: 'Nenhum dado inserido'})
                }
            }
        )
    })
}

exports.getUnique = (req,res,next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        conn.query(
            'SELECT idDoctor, typeProfessional, AES_DECRYPT(professionalId,SHA2("'+key+'",'+type+')) as professionalId'+
            ', AES_DECRYPT(specialization,SHA2("'+key+'",'+type+')) as specialization, AES_DECRYPT(CNH,SHA2("'+key+'",'+type+')) as CNH'+
            ', typeCNH from Doctor WHERE user_CPF = AES_ENCRYPT(?, SHA2("'+key+'",'+type+'))',
            [req.body.user_CPF],
            (error, results, fields) => {
                conn.release()
                if(error) { return res.status(500).send({ error: error }) }
                else if(results.length > 0){
                    return res.status(200).send({
                        idDoctor: dado.idDoctor,
                        typeProfessional: dado.typeProfessional,
                        professionalId: dado.professionalId.toString(),
                        specialization: dado.specialization.toString(),
                        CNH: dado.CNH.toString(),
                        typeCNH: dado.typeCNH
                    })
                }else{
                    res.status(404).send({ mensagem: 'Nenhum dado inserido'})
                }
            }
        )
    })
}

exports.upMedic = (req,res,next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        //Query verifica se existe usuário e se ele já é médico
        conn.query(
            'SELECT typeUser from User where CPF = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'));',
            [req.body.CPF],
            (error,results,fields) => {
                if(error) { 
                    conn.release()
                    return res.status(500).send({ error: error }) 
                }
                else if(results.length > 0){
                    if(results[0].typeUser != 'Médico'){
                        //query de registro médico
                        conn.beginTransaction()
                        conn.query(
                            'INSERT INTO Doctor (typeProfessional, professionalId, specialization, CNH, typeCNH, user_CPF, status)'+
                            'VALUES (?, AES_ENCRYPT(?,SHA2("'+key+'",'+type+')), AES_ENCRYPT(?,SHA2("'+key+'",'+type+'))'+
                            ', AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),?, AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),0);',
                            [
                                req.body.typeProfessional, req.body.professionalId, req.body.specialization,
                                req.body.CNH, req.body.typeCNH, req.body.CPF
                            ],
                            (error, result, fields) => {
                                if(error) {
                                    conn.release()
                                    return res.status(500).send({ error: error }) 
                                }
                                conn.commit()
                                conn.release()
                                res.status(201).send({
                                    mensagem: 'Solicitado para ser médico com Sucesso!'
                                })
                            }
                        )
                    }else{
                        res.status(403).send({ mensagem: 'Solicitação não aplicada' })
                    }
                }else{
                    res.status(404).send({ mensagem: 'Não foi possível completar a ação' })
                }
            }
        )
    })
}

exports.defineMedic = (req, res, next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err, conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        conn.beginTransaction()
        conn.query(
            'SELECT typeUser from User where CPF = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'));',
            [req.body.CPF],
            (error,results,fields) => {
                if(error) { 
                    conn.release()
                    return res.status(500).send({ error: error }) 
                }
                else if(results.length > 0){
                    conn.query(
                        `UPDATE Doctor
                            SET status = ? WHERE user_CPF = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))`,
                        [req.body.status, req.body.CPF],
                        (error, result) => {
                            if(error) {
                                conn.release()
                                return res.status(500).send({ error: error })
                            }
                            console.log()
                            if(result && req.body.status == 1){
                                conn.query(
                                    `UPDATE User
                                        SET typeUser = ?`,
                                    ['Médico'],
                                    (erro, resultado) => {
                                        if(erro) { 
                                            conn.rollback()
                                            conn.release()
                                            return res.status(500).send({ error: erro }) 
                                        }
                                        conn.commit()
                                        conn.release()
                                        res.status(200).send({
                                            mensagem: "Médico Aprovado"
                                        })
                                    }
                                )
                            }else{
                                conn.query(
                                    `DElETE FROM Doctor WHERE user_CPF = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))`, [req.body.CPF],
                                    (error, resultado) =>{
                                        if(error) { 
                                            conn.rollback()
                                            conn.release()
                                            return res.status(500).send({error : error})
                                        }
                                        conn.commit()
                                        conn.release()
                                        res.status(200).send({
                                            mensagem: 'Solicitação médica removida!',
                                        });
                                    }
                                )
                            }
                        }
                    )
                }else{
                    res.status(404).send({ mensagem: 'Não foi possível completar a ação' })
                }
            }
        )
    })
}

exports.alter = (req,res,next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        conn.query(
            `UPDATE Doctor
                SET typeProfessional    = ?,
                    professionalId      = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    specialization      = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    CNH                 = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    typeCNH             = ?
                WHERE user_CPF = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))`,
            [
                req.body.typeProfessional, req.body.professionalId, req.body.specialization,
                req.body.CNH, req.body.typeCNH, req.body.CPF
            ],
            (error,result,fields) => {
                conn.release()
                if(error) { return res.status(500).send({ error: error }) }
                
                return res.status(200).send({
                    mensagem: 'Registro médico alterado com Sucesso!'
                })
            }
        )
    })
}

exports.delete = (req,res,next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.beginTransaction()
        conn.query(
            `DElETE FROM Doctor WHERE user_CPF = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))`, [req.body.CPF],
            (error, resultado, field) =>{
                if(error) { 
                    conn.release()
                    return res.status(500).send({error : error})
                }
                conn.query('UPDATE User SET typeUser = "User" WHERE CPF = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'));',
                    [req.body.CPF],
                    (error,result,fields) => {
                        if(error) { 
                            conn.rollback()
                            conn.release()
                            return res.status(500).send({error : error})
                        }
                        conn.commit()
                        conn.release()
                        res.status(200).send({
                            mensagem: 'Médico removido!',
                        });
                    }
                )
            }
        )
    });
}