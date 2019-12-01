const mongoose = require('mongoose');
const { composeWithMongoose }  = require('graphql-compose-mongoose');

const reportSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        index: true
    },
    reason: {
        type: String,
        enum: ['inappropriate', 'uninformative'],
        required: true
    },
    review: {
        type: String,
        ref: 'Review',
        required: true
    }
});

reportSchema.pre('validate', function (next) {
    this.timestamp = new Date();
    next();
});

const Report = mongoose.model('Report', reportSchema, 'reports');

const ReportTC = composeWithMongoose(Report, {
    resolvers: {
        findMany: {
            limit: {
                defaultValue: 100000
            }
        }
    }
});

module.exports = {
    Report,
    ReportTC
};
