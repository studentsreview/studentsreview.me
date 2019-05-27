const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    'Course Code': String,
    'Course Name': String,
    Block: String,
    Room: String,
    Teacher: String,
    Department: String,
    Semester: String
});

module.exports = mongoose.model('Class', classSchema, 'classes');
