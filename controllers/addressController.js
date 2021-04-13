const mysql = require('../mysql').pool

exports.select = (req,res,next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) =>{
        if(err) { return res.status(500).send({ error:err }) }
        conn.query(
            'SELECT idAddress, AES_DECRYPT(street,SHA2("'+key+'",'+type+')) as street,'+
            ' AES_DECRYPT(neighborhood,SHA2("'+key+'",'+type+')) as neighborhood, AES_DECRYPT(city,SHA2("'+key+'",'+type+')) as city,'+
            ' state, AES_DECRYPT(cep,SHA2("'+key+'",'+type+')) as cep '+
            'FROM Address WHERE user_CPF = AES_ENCRYPT(?,SHA2("'+key+'",'+type+'))',
            [req.params.user_CPF],
            (error,results,fields) =>{
                conn.release()
                if(error) { return res.status(500).send({ error:error }) }
                else if(results.length > 0){
                    var data = []
                    results.forEach(dado => {
                        data.push({
                            street: dado.street.toString(),
                            neighborhood: dado.neighborhood.toString(),
                            city: dado.city.toString(),
                            state: dado.state,
                            cep: dado.cep.toString()
                        })                        
                    });
                    return res.status(200).send({
                        dados: data
                    })
                }else{
                    res.status(404).send({ mensagem: 'Nenhum endereço atribuido a essa pessoa' })
                }
            })
    })
}

exports.add = (req,res,next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        conn.query(
            'INSERT INTO Address (street, neighborhood, city, state, cep, user_CPF) '+
            'VALUES (AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+'))'+
            ',AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),?,AES_ENCRYPT(?,SHA2("'+key+'",'+type+')),AES_ENCRYPT(?,SHA2("'+key+'",'+type+')))',
            [req.body.street, req.body.neighborhood, req.body.city, req.body.state, req.body.cep, req.body.user_CPF],
            (error, results, fields) =>{
                conn.release()
                if(error) { return res.status(500).send({ error: error }) } 
                res.status(201).send({
                    mensagem: 'Endereço inserido com sucesso!',
                    idAddress: results.InsertidAddress
                })
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
            `UPDATE Address         
                SET street          = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    neighborhood    = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    city            = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`)),
                    state           = ?,
                    cep             = AES_ENCRYPT(?,SHA2("`+key+`",`+type+`))
            WHERE idAddress         = ?`,
            [   req.body.street,
                req.body.neighborhood,
                req.body.city,
                req.body.state,
                req.body.cep,
                req.body.idAddress
            ],
            (error, results, fields) =>{
                conn.release()
                if(error) { return res.status(500).send({ error: error }) }

                return res.status(200).send({
                    mensagem: 'Endereço alterado com Sucesso!'
                })
            }
        )
    })
}

exports.delete = (req,res,next) => {
    const key = process.env.ENCRYPT_KEY
    const type = process.env.ENCRYPT_TYPE
    mysql.getConnection((err,conn) => {
        if(err) { return res.status(500).send({ error: err }) }
        conn.query(
            'DELETE from Address where idAddress = ?', [req.body.idAddress],
            (error, results, fields) =>{
                conn.release()
                if(error) { return res.status(500).send({ error: error }) }
                res.status(200).send({
                    mensagem: 'Endereço removido'
                })
            }
        )
    })
}