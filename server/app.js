const fs = require('fs');
const https = require('https');

const express = require('express');
const mongoose = require('mongoose');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');

const GraphQLSchema = require('./graphql/schema')

const isProd = process.env.NODE_ENV === 'production';
const port = isProd ? 80 : 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/StudentsReview';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.log(err);
    });


function register(app) {
    app.use(cors());
    app.use('/', graphqlHTTP({
        schema: GraphQLSchema,
        graphiql: !isProd
    }));
    app.get('*', (req, res) => res.status(404).send({
        status: 404,
        message: 'Requested resource not found.'
    }));
}

const http_server = express();
register(http_server);

if (isProd) {
    http_server.get('*', (req, res) => {
        res.redirect('https://' + req.headers.host + req.url);
    });
    const options = {
        key: fs.readFileSync('/etc/letsencrypt/live/api.studentsreview.me/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/api.studentsreview.me/fullchain.pem')
    };
    let https_server = express();
    register(https_server);
    https_server = https.createServer(
        options,
        https_server
    );
    https_server.listen(443, () => {
        console.log('https listening on port 443');
    });
}

http_server.listen(port, () => {
    console.log(`http listening on port ${port}`);
});
