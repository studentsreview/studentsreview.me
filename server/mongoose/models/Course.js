const mongoose = require('mongoose');
const { composeWithMongoose }  = require('graphql-compose-mongoose');

const courseSchema = new mongoose.Schema({
    name: String,
    department: String,
    semesters: [String]
});

const Course = mongoose.model('Course', courseSchema, 'courses');

const CourseTC = composeWithMongoose(Course, {
    resolvers: {
        findMany: {
            limit: {
                defaultValue: 100000
            }
        }
    }
});

CourseTC.removeField('_id');

module.exports = {
    Course,
    CourseTC
};
