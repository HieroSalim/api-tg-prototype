const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

//rotas
const rotaUser = require('./routes/users');
const rotaAppointment = require('./routes/appointments');
const rotaAuth = require('./routes/auth');
const rotaAddress = require('./routes/address')
const rotaDoctor = require('./routes/doctors')
const rotaConsult = require('./routes/consult')

app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false})); //apenas dados simples
app.use(express.json()); //aceitar somente formato json
app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Header',
        'Content-Type, Origin, X-Requrested-With, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        
        return res.status(200).send({});
    }
    next();
})

app.use('/authentication', rotaAuth);

app.use('/user', rotaUser);

app.use('/appointment', rotaAppointment);

app.use('/address', rotaAddress);

app.use('/doctor', rotaDoctor);

app.use('/consult', rotaConsult);

app.use((req, res, next) => {
    res.status(404).send({
        menssage: 'Não encontrado'
    })
})
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            menssagem: error.menssage
        }
    })
})

module.exports = app;