const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const child_process = require('child_process');
const processExists = require('process-exists');
const ncp = require('ncp').ncp;

const express = require('express');
const https = require('https');

const mongoose = require('mongoose');

const submitReview = require('./routes/api/submitReview');

const isDev = process.env.NODE_ENV === 'development';

const port = isDev ? 8080 : 80;
const mongo_url = 'mongodb://localhost:27017/StudentsReview';

let child;

const rebuild = () => {
    console.log('Rebuilding!');
    rimraf(path.join(__dirname, '..', 'app', '.cache'), () => {
        if (child && processExists(child.pid)) {
            console.log('Killing Previous Build');
            child.kill('SIGKILL');
        }
        child = child_process
            .exec('yarn build', {
                cwd: path.join(__dirname, '..', 'app')
            }, err => {
                if (err) return console.log(err);
                console.log('Rebuild Successful!');
                ncp(path.join(__dirname, '..', 'app', 'public'), 'public');
            });
    });
};

(async () => {
    mongoose.connect(mongo_url, { useNewUrlParser: true })
        .then(() => {
            console.log('Connected to MongoDB!');
        })
        .catch((err) => {
            console.log(err);
        });
})();

function register(app) {
    app.use(express.json());
    app.use(express.static('public', { root: __dirname }));
    app.post('/api/submitreview', (...args) => {
        submitReview(...args);
        if (!isDev) {
            rebuild();
        }
    });
    app.get('*', (req, res) => {
        res.status(404).sendFile(path.join('public', '404', 'index.html'), { root: __dirname });
    });
}

const http_server = express();
register(http_server);

if (!isDev) {
    rebuild();
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
