const { composeWithMongoose }  = require('graphql-compose-mongoose');
const { schemaComposer } = require('graphql-compose');

const Review = require('../mongoose/models/Review');
const Course = require('../mongoose/models/Course');
const Teacher = require('../mongoose/models/Teacher');

const CourseTC = composeWithMongoose(Course, {
    resolvers: {
        findMany: {
            limit: {
                defaultValue: 100000
            }
        }
    }
});
const ReviewTC = composeWithMongoose(Review, {
    resolvers: {
        findMany: {
            limit: {
                defaultValue: 100000
            }
        }
    }
});
const TeacherTC = composeWithMongoose(Teacher);

CourseTC.removeField('_id');
ReviewTC.removeField('_id');
TeacherTC.removeField('_id');

schemaComposer.Query.addFields({
    findOneCourse: CourseTC.getResolver('findOne'),
    findManyReview: ReviewTC.getResolver('findMany'),
    findManyCourse: CourseTC.getResolver('findMany'),
    findManyTeacher: TeacherTC.getResolver('findMany'),
    reviewCount:  ReviewTC.getResolver('count'),
    courseCount: CourseTC.getResolver('count'),
    teacherCount: TeacherTC.getResolver('count')
});

schemaComposer.Mutation.addFields({
    createReview: ReviewTC.getResolver('createOne')
});

module.exports = schemaComposer.buildSchema();
