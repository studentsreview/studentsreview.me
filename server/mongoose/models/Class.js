const mongoose = require('mongoose');
const { composeWithMongoose }  = require('graphql-compose-mongoose');

const classSchema = new mongoose.Schema({
    code: String,
    name: String,
    block: String,
    room: String,
    teacher: String,
    semester: String,
    section: String,
    department: String,
    seats: [Number]
});

const Class = mongoose.model('Class', classSchema, 'classes');

const ClassTC = composeWithMongoose(Class, {
    resolvers: {
        findMany: {
            limit: {
                defaultValue: 100000
            }
        }
    }
});

ClassTC.removeField('_id');

module.exports = {
    Class,
    ClassTC
};
