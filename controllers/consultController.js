const mysql = require('../mysql').pool

exports.status = (req,res,next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        conn.query(
            `select a.statusDoctor from Appointment a 
            join Consult c on a.idAppointment = c.appointment_id
            where a.statusDoctor and a.user_CPF = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)) order by dateStart asc;`,
            [req.body.user_CPF],
            (error, results, fields) => {
                conn.release()
                if(error) { return res.status(500).send({ error: error }) }
                else if(results.length > 0){
                    var data = []
                    results.forEach(dado => {
                        data.push({
                            statusDoctor: dado.statusDoctor
                        })
                    })
                }else{
                    res.status(404).send({
                        mensagem: 'Nenhuma consulta pendente'
                    })
                }
            }
        )
    })
}

exports.start = (req, res, next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) => {
        if(err) return res.status(500).send({ error: err })
        conn.query(
            'insert into consult (doctor_id, appointment_id, dateStart)'+
            'values (?,?,?);',
            [req.body.doctor_id, req.body.appointment_id, dateStart],
            (error, result) => {
                conn.release()
                if(error) return res.status(500).send({ error: error })
                res.status(200).send({
                    mensagem: 'Consulta iniciada'
                })
            }
        )
    })
}

exports.finish = (req, res, next) => {
    mysql.getConnection((err,conn) => {
        if(err) return res.status(500).send({ error: err })
        conn.query(
            `UPDATE consult
                SET dateFinish = ?`,
            [req.body.dateFinish],
            (error, result) => {
                conn.release()
                if(error) return res.status(500).send({ error: error })
                res.status(200).send({
                    mensagem: 'Consulta Finalizada'
                })
            }
        )
    })
}