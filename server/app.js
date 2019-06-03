const fs = require('fs');
const https = require('https');
const http = require('http');

const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');

const express = require('express');
const mongoose = require('mongoose');

const GraphQLSchema = require('./graphql/schema');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/StudentsReview';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.log(err);
    });

const configurations = {
    production: { ssl: true, port: 443, hostname: 'api.studentsreview.me' },
    development: { ssl: false, port: 8080, hostname: 'localhost' }
};

const environment = process.env.NODE_ENV || 'production';
const config = configurations[environment];

const apollo = new ApolloServer({
    schema: GraphQLSchema,
    tracing: true,
    cacheControl: true,
    engine: {
        apiKey: process.env.ENGINE_API_KEY
    },
    cors: cors()
});

const app = express();
apollo.applyMiddleware({
    app,
    path: '/'
});

let server;
if (config.ssl) {
    // Assumes certificates are in .ssl folder from package root. Make sure the files
    // are secured.
    server = https.createServer(
        {
            key: fs.readFileSync('/etc/letsencrypt/live/api.studentsreview.me/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/api.studentsreview.me/fullchain.pem')
        },
        app
    )
} else {
    server = http.createServer(app)
}

apollo.installSubscriptionHandlers(server);

server.listen({ port: config.port }, () =>
    console.log(
        '🚀 Server ready at',
        `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
    )
);
