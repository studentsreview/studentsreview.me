const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const submitReview = require('./routes/api/submitReview');
const courses = require('./routes/api/courses');
const semesters = require('./routes/api/semesters');
const reviews = require('./routes/api/reviews');

const isProd = process.env.NODE_ENV === 'production';

const port = isProd ? 80 : 8080;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/StudentsReview';
const BUILD_HOOK_URI = process.env.BUILD_HOOK_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.log(err);
    });


function register(app) {
    app.use(express.json());
    app.post('/api/submitreview', async (...args) => {
        submitReview(...args);
        if (isProd) {
            await axios.post('BUILD_HOOK_URI', {});
        }
    });
    app.get('/api/semesters', semesters);
    app.get('/api/courses/:semester', courses);
    app.get('/api/reviews/:teacherKey', reviews);
    app.get('/api/*', (req, res) => res.send({
        status: 404,
        message: 'Requested resource not found.'
    }));
    app.use((err, req, res, next) => {
        res.json({
            status: err.status,
            message: err.message
        });
    });
}

const http_server = express();
register(http_server);

if (isProd) {
    http_server.get('*', (req, res) => {
        res.redirect('https://' + req.headers.host + req.url);
    });
    const options = {
        key: fs.readFileSync('/etc/letsencrypt/live/studentsreview.me/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/studentsreview.me/fullchain.pem')
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
