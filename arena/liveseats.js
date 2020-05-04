const axios = require('axios');
const moment = require('moment');

const fs = require('fs');
const path = require('path');

const timetable = {
    1: moment('May 4th 2020, 2:30 pm', 'MMMM Do YYYY, h:mm a'),
    2: moment('May 4th 2020, 3:30 pm', 'MMMM Do YYYY, h:mm a'),
    3: moment('May 4th 2020, 4:30 pm', 'MMMM Do YYYY, h:mm a'),
    4: moment('May 4th 2020, 5:30 pm', 'MMMM Do YYYY, h:mm a'),
    5: moment('May 4th 2020, 6:30 pm', 'MMMM Do YYYY, h:mm a'),
    6: moment('May 6th 2020, 2:30 pm', 'MMMM Do YYYY, h:mm a'),
    7: moment('May 6th 2020, 3:30 pm', 'MMMM Do YYYY, h:mm a'),
    8: moment('May 6th 2020, 4:30 pm', 'MMMM Do YYYY, h:mm a'),
    9: moment('May 6th 2020, 5:30 pm', 'MMMM Do YYYY, h:mm a'),
    10: moment('May 6th 2020, 6:30 pm', 'MMMM Do YYYY, h:mm a'),
    11: moment('May 8th 2020, 3:00 pm', 'MMMM Do YYYY, h:mm a'),
    12: moment('May 8th 2020, 4:00 pm', 'MMMM Do YYYY, h:mm a')
};

let next_rotation = 1;

const checkForRotation = () => {
    if (Math.abs(moment().diff(timetable[next_rotation])) < 1000) {
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

