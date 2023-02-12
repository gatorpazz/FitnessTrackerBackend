require('dotenv').config();
const express = require('express');
const app = express();

const morgan = require('morgan');
app.use(morgan('dev'));

app.use(express.json());

const cors = require('cors');
app.use(cors());

const apiRouter = require('./api');
app.use('/api', apiRouter);

//error handlers
app.get('*', (req, res)=>{
    res.status(404).send({
        error: "404",
        message: "Error 404. Page not found"
    });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
    res.send({
        name: error.name,
        message: error.message,
        error: error.name
    });
});

module.exports = app;
