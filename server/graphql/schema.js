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
TeacherTC.removeField('_id');

TeacherTC.addFields({
    rating: {
        type: 'Float',
        projection: { name: true },
        resolve: async source => {
            // TODO: find a way to ask for a specific field (rating)
            const reviews = await ReviewTC
                .getResolver('findMany')
                .resolve({
                    args: {
                        filter: {
                            teacher: source.name
                        }
                    }
                });
            return (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length) || 0;
        }
    },
    departments: {
        type: '[String]',
        projection: { name: true },
        resolve: async source => {
            const courses = await CourseTC
                .getResolver('findMany')
                .resolve({
                    args: {
                        filter: {
                            teacher: source.name
                        }
                    }
                });
            return Array.from(new Set(courses.map(course => course.department)));
        }
    }
});

TeacherTC.setResolver('findMany', TeacherTC
    .getResolver('findMany')
    .addFilterArg({
        name: 'search',
        type: 'String',
        query: (rawQuery, value) => {
            rawQuery.name = new RegExp(value, 'i');
        }
    })
);

TeacherTC.setResolver('findOne', TeacherTC
    .getResolver('findOne')
    .addFilterArg({
        name: 'search',
        type: 'String',
        query: (rawQuery, value) => {
            rawQuery.name = new RegExp(value, 'i');
        }
    })
);

schemaComposer.Query.addFields({
    findOneReview: ReviewTC.getResolver('findOne'),
    findOneCourse: CourseTC.getResolver('findOne'),
    findOneTeacher: TeacherTC.getResolver('findOne'),
    findManyReview: ReviewTC.getResolver('findMany'),
    findManyCourse: CourseTC.getResolver('findMany'),
    findManyTeacher: TeacherTC.getResolver('findMany'),
    reviewCount:  ReviewTC.getResolver('count'),
    courseCount: CourseTC.getResolver('count'),
    teacherCount: TeacherTC.getResolver('count'),
    reviewPagination: ReviewTC.getResolver('pagination')
});

schemaComposer.Mutation.addFields({
    createReview: ReviewTC.getResolver('createOne')
});

module.exports = schemaComposer.buildSchema();
