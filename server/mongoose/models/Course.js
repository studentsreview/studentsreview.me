const mongoose = require('mongoose');
const { composeWithMongoose }  = require('graphql-compose-mongoose');

const courseSchema = new mongoose.Schema({
    name: String,
    department: String,
    sectioned: Boolean,
    semesters: {
        type: [String],
        index: true
    },
    prerequisites: {
        type: [String],
        index: true
    },
    notes: String,
    grades: String,
    length: String,
    AtoG: String,
    description: String
}, {
    toObject: {
        virtuals: true
    }
});

courseSchema.virtual('_prerequisites', {
    ref: 'Course',
    localField: 'prerequisites',
    foreignField: 'name'
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
