const fs = require('fs');
const path = require('path');

const consolidated_data = [];

const dump_files = fs.readdirSync(path.join(__dirname, 'dumps'));
const dumps = dump_files.map(dump_file => JSON.parse(fs.readFileSync(path.join(__dirname, 'dumps', dump_file), 'utf8')));

const root = dumps[0];

for (let department of Object.keys(root)) {
    for (let class_name of Object.keys(root[department])) {
        for (let teacher of Object.keys(root[department][class_name])) {
            for (let index in root[department][class_name][teacher]) {
                let class_info = root[department][class_name][teacher][index];
                consolidated_data.push({
                    teacher,
                    block: class_info[0],
                    semester: class_info[1],
                    seat_series: dumps.map(dump => {
                        if (dump[department][class_name] === undefined || dump[department][class_name][teacher] === undefined) {
                            for (let class_name_test of Object.keys(dump[department])) {
                                for (let teacher_test of Object.keys(dump[department][class_name_test])) {
                                    if (teacher === teacher_test || teacher_test.startsWith(teacher.split(',')[0])) {
                                        for (let class_info_test of dump[department][class_name_test][teacher_test]) {
                                            if (class_info_test[0] === class_info[0] && class_info_test[1] === class_info[1]) {
                                                return class_info_test[2];
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            return dump[department][class_name][teacher][index][2];
                        }
                    }).map(Number)
                });
            }
        }
    }
}

fs.writeFileSync('seat_data.json', JSON.stringify(consolidated_data));
