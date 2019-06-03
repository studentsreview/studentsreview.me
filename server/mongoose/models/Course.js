const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    code: String,
    name: String,
    block: String,
    room: String,
    teacher: String,
    department: String,
    semester: String
});

module.exports = mongoose.model('Course', courseSchema, 'courses');
