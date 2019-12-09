const axios = require('axios');

const fs = require('fs');

const data = [];

function writeToFile() {
    fs.writeFileSync('liveseats.json', JSON.stringify(data));
}

axios.get('https://us-central1-lowellarenarolodex.cloudfunctions.net/liveseats')
    .then(res => {
        console.log('Fetching ' + (new Date()).toISOString());
        for (let [department, classes] of Object.entries(res.data)) {
            for (let [className, teachers] of Object.entries(classes)) {
                for (let [teacher, blocks] of Object.entries(teachers)) {
                    for (let block of blocks) {
                        data.push({
                            department,
                            className,
                            teacher,
                            block: block[0],
                            timeSeries: [{ time: (new Date()).toISOString(), seats: block[2] }]
                        });
                    }
                }
            }
        }
        writeToFile();
        setInterval(() => {
            console.log('Fetching ' + (new Date()).toISOString());
            axios.get('https://us-central1-lowellarenarolodex.cloudfunctions.net/liveseats')
                .then(res => {
                    for (let [department, classes] of Object.entries(res.data)) {
                        for (let [className, teachers] of Object.entries(classes)) {
                            for (let [teacher, blocks] of Object.entries(teachers)) {
                                for (let block of blocks) {
                                    const match = data.find(datum => Object.entries({
                                        department,
                                        className,
                                        teacher,
                                        block: block[0]
                                    }).every(entry => datum[entry[0]] === entry[1]));
                                    if (match.timeSeries[match.timeSeries.length - 1].seats !== block[2]) {
                                        match.timeSeries.push({ time: (new Date()).toISOString(), seats: block[2] });
                                    }
                                }
                            }
                        }
                    }
                    writeToFile();
                });
        }, 1000);
    });
