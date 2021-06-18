const mysql = require('../mysql').pool

exports.searchDoctorsOn = (req, res, next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err, conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        conn.query(
            'SELECT idDoctor, idProfile, AES_DECRYPT(name,SHA2("'+key+'",'+type+')) as name, doc.typeProfessional, AES_DECRYPT(doc.professionalId,SHA2("'+key+'",'+type+')) as professionalId'+
            ', AES_DECRYPT(doc.specialization,SHA2("'+key+'",'+type+')) as specialization, prof.description, prof.price '+
            'FROM Doctor doc JOIN ProfileDoctor prof on idDoctor = doctor_id JOIN User on doc.user_CPF = CPF '+
            'WHERE doc.idDoctor NOT IN (SELECT DISTINCT user_CPF from Appointment WHERE dateHour = ?) '+
            'AND doc.typeProfessional = ?',
            [req.params.dateHour, req.params.type],
            (erro, results) => {
                conn.release()
                if(erro) { return res.status(500).send({ error: err }) }
                else if(results.length > 0){
                    var data = []
                    results.forEach(dado => {
                        data.push({
                            idDoctor: dado.idDoctor,
                            idProfile: dado.idProfile,
                            typeProfessional: dado.typeProfessional,
                            professionalId: dado.professionalId.toString(),
                            specialization: dado.specialization.toString(),
                            description: dado.description,
                            name: dado.name.toString(),
                            price: dado.price
                        })
                    })
                    return res.status(200).send({
                        dados: data
                    })
                }else{
                    res.status(404).send({ mensagem: 'Nenhum médico encontrado nesse horário'})
                }
            }
        )
    })
}

exports.getAll = (req,res,next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        conn.query(
            'SELECT idDoctor, typeProfessional, AES_DECRYPT(professionalId,SHA2("'+key+'",'+type+')) as professionalId'+
            ', AES_DECRYPT(specialization,SHA2("'+key+'",'+type+')) as specialization, AES_DECRYPT(CNH,SHA2("'+key+'",'+type+')) as CNH'+
            ', typeCNH FROM Doctor',
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
            'SELECT idDoctor, AES_DECRYPT(name,SHA2("'+key+'",'+type+')) as name, AES_DECRYPT(specialization,SHA2("'+key+'",'+type+')) as specialization,'+
            'prof.description, prof.price FROM Doctor doc JOIN ProfileDoctor prof on idDoctor = doctor_id '+
            'JOIN User on doc.user_CPF = CPF WHERE idProfile = ?',
            [req.params.id],
            (error, result, fields) => {
                conn.release()
                if(error) { return res.status(500).send({ error: error }) }
                else if(result.length > 0){
                    return res.status(200).send({
                        name: result[0].name.toString(),
                        idDoctor: result[0].idDoctor,
                        specialization: result[0].specialization.toString(),
                        description: result[0].description,
                        price: result[0].price
                    })
                }else{
                    res.status(404).send({ mensagem: 'Perfil não encontrado'})
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

exports.addProfile = (req, res, next) => {
    mysql.getConnection((err,conn) => {
        if(err) return res.status(500).send({ error: err })
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            `INSERT INTO ProfileDoctor (description, doctor_id, price) VALUES (?,
                 (select idDoctor from doctor join User on User.CPF = user_CPF 
                    where User.user = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))), ?);`,
            [req.body.description, req.body.user, req.body.price],
            (error, result) => {
                conn.release()
                if(error) return res.status(500).send({ error: error })
                res.status(200).send({
                    mensagem: "Perfil Registrado"
                })
            }
        )
    })
}