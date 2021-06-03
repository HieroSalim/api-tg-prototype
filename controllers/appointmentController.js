const mysql = require('../mysql').pool;


exports.all = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            'SELECT idAppointment, AES_DECRYPT(user_CPF, SHA2("'+key+'",'+type+')) as user_CPF, AES_DECRYPT(symptoms, SHA2("'+key+'",'+type+')) as symptoms,'
            +' AES_DECRYPT(description, SHA2("'+key+'",'+type+')) as description, dateHour, doctors, statusDoctor FROM Appointment;',
            (error, resultado, fields) => {
                conn.release()
                if(error) { return res.status(500).send({error : error})}
                else if(resultado.length > 0){
                    var data = []
                    resultado.forEach(dado => {
                        data.push( {
                            idAppointment: dado.idAppointment,
                            user_CPF: dado.user_CPF.toString(),
                            symptoms: dado.symptoms.toString(),
                            description: dado.description.toString(),
                            dateHour: dado.dateHour,
                            doctors: dado.doctors,
                            statusDoctor: dado.statusDoctor
                        })
                    });
                    return res.status(200).send({
                        dado: data
                    })
                }else{
                    res.status(404).send({                    
                        mensagem: 'Nenhum dado Inserido'
                    });
                }
            }
        )
    });
}

exports.unique = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            'SELECT idAppointment, AES_DECRYPT(user_CPF, SHA2("'+key+'",'+type+')) as user_CPF,'
            +' AES_DECRYPT(description, SHA2("'+key+'",'+type+')) as description, dateHour, doctors, statusDoctor'+
            '  FROM Appointment WHERE idAppointment = ?;',
            [req.params.idAppointment],
            (error, resultado, fields) => {
                conn.release()
                if(error) { return res.status(500).send({error : error})}
                else if(resultado.length > 0){
                    return res.status(200).send({ 
                        idAppointment: resultado[0].idAppointment,
                        user_CPF: resultado[0].user_CPF.toString(),
                        symptoms: resultado[0].symptoms.toString(),
                        description: resultado[0].description.toString(),
                        dateHour: resultado[0].dateHour,
                        doctors: resultado[0].doctors,
                        statusDoctor: resultado[0].statusDoctor
                    })
                }else{
                    res.status(404).send({                    
                        mensagem: 'Não encontrado'
                    });
                }                
            }
        )
    });
}

exports.register = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
            const key = process.env.ENCRYPT_KEY
            const type = process.env.ENCRYPT_TYPE
            conn.query(
                `SELECT AES_DECRYPT(street, SHA2("`+key+`",`+type+`)) as street, AES_DECRYPT(neighborhood, SHA2("`+key+`",`+type+`)) as neighborhood
                 FROM Address WHERE user_CPF = AES_ENCRYPT(?, SHA2("`+key+`",`+type+`))`,
                 [req.body.CPF],
                 (error, result) => {
                    if(error) { 
                        conn.release() 
                        return res.status(500).send({ error: error })
                    }
                    if(result.length > 0){
                        conn.query(   
                            'INSERT INTO Appointment (user_CPF, description, dateHour, doctors, statusDoctor, fkAddress)'
                            +' VALUES (AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+'))'
                            +',?,?,?,?)',
                            [req.body.CPF, req.body.description, req.body.dateHour, req.body.doctors, 0,req.body.fkAddress],
                            (error, resultado, field) =>{
                                conn.release();
                                if(error) { return res.status(500).send({error : error})}
                                return res.status(201).send({
                                    mensagem: 'Solicitação de agendamento enviada com Sucesso!',
                                    idAppointment: resultado.InsertIdAppointment
                                });
                            }
                        )
                    }else{
                        conn.release()
                        return res.status(403).send({
                            mensagem: "Não foi possível realizar o agendamento"
                        })
                    }
                 }
            )
        });
}

exports.alter = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            `UPDATE Appointment
                SET user_CPF    = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    symptoms = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    description    = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    dateHour    = ?,
                    doctors    = ?,
                    statusDoctor = ?
             WHERE idAppointment     = ?
            `,
            [    req.body.user_CPF,
                 req.body.symptoms,
                 req.body.description,
                 req.body.dateHour,
                 req.body.doctors,
                 req.body.statusDoctor,
                 req.body.idAppointment
            ],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(200).send({
                    mensagem: 'Alterado com Sucesso!',
                });
            }
        )
    });
}

exports.delete = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            `DElETE FROM Appointment WHERE idAppointment = ?`, [req.body.idAppointment],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(200).send({
                    mensagem: 'Agendamento excluído!',
                });
            }
        )
    });
}