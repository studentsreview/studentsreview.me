const { composeWithMongoose }  = require('graphql-compose-mongoose');
const { schemaComposer } = require('graphql-compose');

const Review = require('../mongoose/models/Review');
const Course = require('../mongoose/models/Course');

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

CourseTC.removeField('_id');
ReviewTC.removeField('_id');

schemaComposer.Query.addFields({
    findManyReview: ReviewTC.getResolver('findMany'),
    findManyCourse: CourseTC.getResolver('findMany'),
    reviewCount:  ReviewTC.getResolver('count'),
    courseCount: CourseTC.getResolver('count')
});

schemaComposer.Mutation.addFields({
    createReview: ReviewTC.getResolver('createOne')
});

module.exports = schemaComposer.buildSchema();
