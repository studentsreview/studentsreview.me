const axios = require('axios');
const moment = require('moment');

const fs = require('fs');
const path = require('path');

const { rotations } = require('./config');

let next_rotation = 1;
while (rotations[next_rotation] < moment()) {
    next_rotation++;
}

const checkForRotation = () => {
    const timeToRotation = Math.abs(rotations[next_rotation].diff(moment()));
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write('rotation ' + next_rotation + ' ' + moment.duration(timeToRotation).humanize(true));
    if (timeToRotation < 1000) {
        axios.get('https://arenarolodexscraper.herokuapp.com/')
            .then(res => {
                fs.writeFileSync(path.join(__dirname, 'dumps', next_rotation + '.json'), JSON.stringify(res.data));
                next_rotation++;
                setTimeout(checkForRotation, 100);
            });
    } else {
        setTimeout(checkForRotation, 100);
    }
}

checkForRotation();
