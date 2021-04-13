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