const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    courseCode: String,
    courseKey: String,
    courseName: String,
    block: String,
    room: String,
    teacher: String,
    teacherKey: String,
    department: String,
    semester: String
});

module.exports = mongoose.model('Class', classSchema, 'classes');
