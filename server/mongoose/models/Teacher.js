const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true
    }
});

module.exports = mongoose.model('Teacher', teacherSchema, 'teachers');
