const mongoose = require('mongoose');
const { composeWithMongoose }  = require('graphql-compose-mongoose');
const { ReviewTC } = require('./Review');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true
    },
    semesters: [String],
    departments: [String]
});

const Teacher = mongoose.model('Teacher', teacherSchema, 'teachers');

const TeacherTC = composeWithMongoose(Teacher);

TeacherTC.removeField('_id');

TeacherTC.addFields({
    rating: {
        type: 'Float',
        projection: { name: true },
        resolve: async source => {
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
    reviewCount: {
        type: 'Int',
        projection: { name: true },
        resolve: async source => {
            const reviews = await ReviewTC
                .getResolver('findMany')
                .resolve({
                    args: {
                        filter: {
                            teacher: source.name
                        }
                    }
                });
            return reviews.length;
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

module.exports = {
    Teacher,
    TeacherTC
};
