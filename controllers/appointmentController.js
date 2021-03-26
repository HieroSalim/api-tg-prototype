const mysql = require('../mysql').pool;


exports.all = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        const key = process.env.ENCRYPT_KEY
        const type = process.env.ENCRYPT_TYPE
        conn.query(
            'SELECT * FROM Appointments;',
            (error, resultado, fields) => {
                if(error) { return res.status(500).send({error : error})}
                return res.status(200).send({response: resultado})
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
            'SELECT * FROM Appointments WHERE idConsult = ?;',
            [req.params.idConsult],
            (error, resultado, fields) => {
                if(error) { return res.status(500).send({error : error})}
                return res.status(200).send({response: resultado})
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
                    'INSERT INTO Appointments (user_CPF, symptons, description, dateHour, doctor, statusDoctor)'+
                    +' VALUES (AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+'))'+
                    +',AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+'))'+
                    +',AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),',
                    [req.body.user_CPF, req.body.symptons, req.body.description, req.body.dateHour, req.body.doctor, req.body.statusDoctor],
                    (error, resultado, field) =>{
                        conn.release();
                        if(error) { return res.status(500).send({error : error})}
                        res.status(201).send({
                            menssagem: 'Cadastrado com sucesso!',
                            idConsult: resultado.InsertidConsult
                        });
                    }
            )
        });
}

exports.alter = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({error : error})}
        conn.query(
            `UPDATE Appointments
                SET user_CPF    = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    symptons = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    description    = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    dateHour    = ?,
                    doctor    = ?,
                    statusDoctor = ?
             WHERE idConsult     = ?
            `,
            [    req.body.user_CPF,
                 req.body.symptons,
                 req.body.description,
                 req.body.dateHour,
                 req.body.doctor,
                 req.body.statusDoctor,
                 req.body.Appointmentcol,
                 req.body.idConsult
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
            `DElETE FROM Appointments WHERE idConsult = ?`, [req.body.idConsult],
            (error, resultado, field) =>{
                conn.release();
                if(error) { return res.status(500).send({error : error})}

                res.status(202).send({
                    menssagem: 'Consulta excluída!',
                });
            }
        )
    });
}