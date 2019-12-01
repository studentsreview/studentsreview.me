const { schemaComposer } = require('graphql-compose');

const { ReviewTC } = require('../mongoose/models/Review');
const { CourseTC } = require('../mongoose/models/Course');
const { ClassTC } = require('../mongoose/models/Class');
const { TeacherTC } = require('../mongoose/models/Teacher');
const { ReportTC } = require('../mongoose/models/Report');

schemaComposer.Query.addFields({
    findOneReview: ReviewTC.getResolver('findOne'),
    findOneCourse: CourseTC.getResolver('findOne'),
    findOneClass: ClassTC.getResolver('findOne'),
    findOneTeacher: TeacherTC.getResolver('findOne'),
    findManyReview: ReviewTC.getResolver('findMany'),
    findManyCourse: CourseTC.getResolver('findMany'),
    findManyClass: ClassTC.getResolver('findMany'),
    findManyTeacher: TeacherTC.getResolver('findMany'),
    reviewPagination: ReviewTC.getResolver('pagination'),
    ...adminAccess({
        findManyReport: ReportTC.getResolver('findMany')
    })
});

schemaComposer.Mutation.addFields({
    createReview: ReviewTC.getResolver('createOne'),
    createReport: ReportTC.getResolver('createOne'),
    ...adminAccess({
        reviewRemoveById: ReviewTC.getResolver('removeById'),
        reportRemoveById: ReportTC.getResolver('removeById')
    })
});


function adminAccess(resolvers) {
    Object.keys(resolvers).forEach((k) => {
        resolvers[k] = resolvers[k].wrapResolve(next => rp => {
            if (rp.context.authScope !== 'ADMIN') {
                throw new Error('You must be an admin to access this field.');
            }
            return next(rp);
        });
    });
    return resolvers;
}

module.exports = schemaComposer.buildSchema();
