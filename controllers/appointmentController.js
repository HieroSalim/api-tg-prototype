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
                        menssagem: 'Nenhum dado Inserido'
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
            'SELECT idAppointment, AES_DECRYPT(user_CPF, SHA2("'+key+'",'+type+')) as user_CPF, AES_DECRYPT(symptoms, SHA2("'+key+'",'+type+')) as symptoms,'
            +' AES_DECRYPT(description, SHA2("'+key+'",'+type+')) as description, dateHour, doctors, statusDoctor  FROM Appointment WHERE idAppointment = ?;',
            [req.params.idAppointment],
            (error, resultado, fields) => {
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
                        menssagem: 'Não encontrado'
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
                    'INSERT INTO Appointment (user_CPF, symptoms, description, dateHour, doctors, statusDoctor)'
                    +' VALUES (AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+'))'
                    +',AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),?,?,?)',
                    [req.body.user_CPF, req.body.symptoms, req.body.description, req.body.dateHour, req.body.doctors, req.body.statusDoctor],
                    (error, resultado, field) =>{
                        conn.release();
                        if(error) { return res.status(500).send({error : error})}
                        res.status(201).send({
                            menssagem: 'Cadastrado com sucesso!',
                            idAppointment: resultado.InsertidAppointment
                        });
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

                res.status(202).send({
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
            `DElETE FROM Appointment WHERE idAppointment = ?`, [req.body.idAppointment],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(202).send({
                    menssagem: 'Agendamento excluído!',
                });
            }
        )
    });
}